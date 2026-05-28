import { Observable } from 'rxjs';
import { Inject, Injector } from '@wendellhu/redi';
import {
  Plugin,
  ICommandService,
  IUniverInstanceService,
  UniverInstanceType,
  CommandType,
  CustomRangeType,
  generateRandomId,
  LocaleService,
  type ICommand,
  type IAccessor,
  type DocumentDataModel,
  type ICustomRange,
  type ITextRangeParam
} from '@univerjs/core';
import {
  ComponentManager,
  IMenuManagerService,
  MenuItemType,
  RibbonStartGroup,
  IMessageService
} from '@univerjs/ui';
import { MessageType } from '@univerjs/design';
import {
  DocSelectionManagerService,
  addCustomRangeBySelectionFactory,
  deleteCustomRangeFactory,
  type IRichTextEditingMutationParams
} from '@univerjs/docs';

import Vue3LockedRoundIcon from '@src/components/Icon/LockedRound.vue';
import Vue3LockIcon from '@src/components/Icon/Lock.vue';
import Vue3UnlockedIcon from '@src/components/Icon/Unlocked.vue';
import { useUniverStore } from '@src/store/univer';

const DOC_LOCK_ERROR_MESSAGE = 'Edit blocked: Range is locked.';
const COMMAND_ID_LOCK = 'doc.command.lock-selection';
const COMMAND_ID_UNLOCK = 'doc.command.unlock-selection';
const MENU_ID_PARENT = 'parker-vue-lab-plugins.doc-lock-menu';

function ignoreErrorLog() {
  if (typeof window === 'undefined') return;
  if (window.__UNIVER__DOC_LOCKED_ERROR_FILTERED__ === true) return;

  // 1. 攔截未捕獲的例外錯誤 (Uncaught Exception)
  // 如果 throw new Error 沒有被 try-catch 抓住，它會觸發 window 的 error 事件
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes(DOC_LOCK_ERROR_MESSAGE)) {
      event.preventDefault(); // 阻止瀏覽器在 Console 印出這個錯誤
    }
  });

  // 2. 攔截未處理的 Promise 拒絕 (Unhandled Promise Rejection)
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes(DOC_LOCK_ERROR_MESSAGE)) {
      event.preventDefault(); // 阻止瀏覽器在 Console 印出這個錯誤
    }
  });

  // 3. 原本的 console.error 覆寫 (以防 Univer 內部有去 catch 並且用 console.error 印出來)
  window.originalConsoleError = window.console.error;

  window.console.error = function (...argList) {
    // 檢查參數中是否包含特定的鎖定阻擋錯誤（字串或 Error 物件）
    const isLockedError = argList.some(
      (arg) =>
        (typeof arg === 'string' && arg.includes(DOC_LOCK_ERROR_MESSAGE)) ||
        (arg instanceof Error && arg.message.includes(DOC_LOCK_ERROR_MESSAGE))
    );

    if (isLockedError) {
      // 攔截到預期的鎖定阻擋錯誤，直接 return 吃掉，保持 console 乾淨
      return;
    }

    // 如果不是我們要攔截的錯誤，就照常印出
    window.originalConsoleError!.apply(console, argList);
  };

  window.__UNIVER__DOC_LOCKED_ERROR_FILTERED__ = true;
}

export interface IDocLockPluginConfig {
  noStyle?: boolean;
}

/**
 * 實驗性文件區域鎖定外掛
 * 1. 取得當前選取範圍
 * 2. 標記該範圍為唯讀 (透過 CustomRange)
 * 3. 透過 ICommandService 的事件攔截，來阻擋編輯
 */
export class DocLockPlugin extends Plugin {
  static override pluginName = 'doc-lock-plugin';
  private isPluginModifyingLock = false;
  private _config: IDocLockPluginConfig;

  constructor(
    config: Partial<IDocLockPluginConfig> | undefined,
    @Inject(Injector) protected override _injector: Injector,
    @Inject(IMenuManagerService)
    private readonly menuManagerService: IMenuManagerService,
    @Inject(ICommandService) private readonly commandService: ICommandService,
    @Inject(ComponentManager)
    private readonly componentManager: ComponentManager
  ) {
    super();
    this._config = config || {};

    // 修正 Univer 編輯器在鎖定範圍時發出的錯誤訊息
    ignoreErrorLog();
  }

  override onStarting(): void {
    this._initIcons();
    this._patchSelectionManager();
    this._registerCommands();
    this._registerMenus();
    this._registerEditInterceptor();
  }

  private _initIcons() {
    const iconList = {
      Vue3LockedRoundIcon,
      Vue3LockIcon,
      Vue3UnlockedIcon
    };
    for (const [name, component] of Object.entries(iconList)) {
      try {
        this.componentManager.register(name, component, { framework: 'vue3' });
      } catch {}
    }
  }

  private _patchSelectionManager() {
    // --- Univer Bug Fix: Patch DocSelectionManagerService to prevent preset-docs-hyper-link crash ---
    // The hyper-link plugin reads `activeRanges[0].segmentId` directly on hover,
    // which crashes if `getTextRanges()` returns an empty array.
    const docSelectionManagerService = this._injector.get(
      DocSelectionManagerService
    );
    if (docSelectionManagerService) {
      const originalGetTextRanges =
        docSelectionManagerService.getTextRanges.bind(
          docSelectionManagerService
        );
      docSelectionManagerService.getTextRanges = () => {
        const rangeList = originalGetTextRanges();
        if (Array.isArray(rangeList) && rangeList.length === 0) {
          // Return a Proxy that acts as an empty array but returns an empty object for index 0 to avoid undefined crash
          return new Proxy(rangeList, {
            get(target, prop) {
              if (prop === '0') return {};
              return Reflect.get(target, prop);
            }
          }) as unknown as typeof rangeList;
        }
        return rangeList;
      };
    }
  }

  private _getLockedRangeList(
    doc: unknown
  ): ICustomRange<{ locked?: boolean; allowedRoleList?: string[] }>[] {
    const documentDataModel = doc as unknown as DocumentDataModel;
    const customRangeList = documentDataModel.getCustomRanges?.() || [];
    return customRangeList.filter(
      (range: ICustomRange<{ locked?: boolean; allowedRoleList?: string[] }>) =>
        range.properties?.locked
    );
  }

  private _checkEditPermission(
    lockedRangeList: ICustomRange<{ locked?: boolean; allowedRoleList?: string[] }>[],
    editStart: number,
    editEnd: number,
    currentUserRole: string,
    isInsert: boolean = false
  ): boolean {
    for (const lockedRange of lockedRangeList) {
      const lockedStart = lockedRange.startIndex;
      const lockedEnd = lockedRange.endIndex + 1;

      let isOverlapping = false;
      if (isInsert) {
        isOverlapping = editStart > lockedStart && editStart < lockedEnd;
      } else {
        isOverlapping =
          Math.max(0, Math.min(editEnd, lockedEnd) - Math.max(editStart, lockedStart)) >
          0;
      }

      if (isOverlapping) {
        const allowedRoleList = lockedRange.properties?.allowedRoleList;
        if (
          Array.isArray(allowedRoleList) &&
          allowedRoleList.includes(currentUserRole)
        ) {
          continue; // 允許編輯此範圍
        }
        return false; // 拒絕編輯
      }
    }
    return true; // 沒有碰到鎖定範圍，或者都有權限
  }

  private _registerCommands() {
    const lockCommand: ICommand = {
      type: CommandType.OPERATION,
      id: COMMAND_ID_LOCK,
      handler: async (accessor: IAccessor) => this._handleLock(accessor)
    };

    const unlockCommand: ICommand = {
      type: CommandType.OPERATION,
      id: COMMAND_ID_UNLOCK,
      handler: async (accessor: IAccessor) => this._handleUnlock(accessor)
    };

    this.commandService.registerCommand(lockCommand);
    this.commandService.registerCommand(unlockCommand);
  }

  private async _handleLock(accessor: IAccessor): Promise<boolean> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const messageService = accessor.get(IMessageService);
    const commandService = accessor.get(ICommandService);
    const localeService = accessor.get(LocaleService);

    const doc = univerInstanceService.getFocusedUnit();
    if (!doc || doc.type !== UniverInstanceType.UNIVER_DOC) return false;

    const activeTextRange = docSelectionManagerService.getActiveTextRange();
    if (!activeTextRange) {
      messageService.show({
        type: MessageType.Warning,
        content: localeService.t(
          'parker-vue-lab-plugins.doc-lock.error.selectFirst'
        )
      });
      return false;
    }

    const { startOffset, endOffset } = activeTextRange;
    if (startOffset === endOffset) {
      messageService.show({
        type: MessageType.Warning,
        content: localeService.t(
          'parker-vue-lab-plugins.doc-lock.error.emptySelection'
        )
      });
      return false;
    }

    const store = useUniverStore();
    const permissionParams = await store.requestLockPermissions();
    if (!permissionParams) return false; // 使用者取消鎖定

    const rangeId = generateRandomId();
    const selection: ITextRangeParam = {
      startOffset,
      endOffset,
      collapsed: false,
      ...(activeTextRange.segmentId
        ? { segmentId: activeTextRange.segmentId }
        : {})
    };

    const noStyle =
      typeof this._config.noStyle === 'boolean' ? this._config.noStyle : true;
    const customRangeMutation = addCustomRangeBySelectionFactory(accessor, {
      unitId: doc.getUnitId(),
      rangeId,
      rangeType: noStyle ? (8888 as CustomRangeType) : CustomRangeType.CUSTOM,
      properties: {
        locked: true,
        allowedRoleList: permissionParams.allowedRoles
      },
      selections: [selection]
    });

    if (customRangeMutation) {
      this.isPluginModifyingLock = true;
      try {
        commandService.syncExecuteCommand(
          customRangeMutation.id,
          customRangeMutation.params
        );
      } finally {
        this.isPluginModifyingLock = false;
      }
      messageService.show({
        type: MessageType.Success,
        content: `${localeService.t('parker-vue-lab-plugins.doc-lock.success.locked')}${startOffset} - ${endOffset}`
      });
      console.log(
        '[DocLockPlugin] Range locked:',
        startOffset,
        endOffset,
        customRangeMutation
      );
      return true;
    }

    return false;
  }

  private async _handleUnlock(accessor: IAccessor): Promise<boolean> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const messageService = accessor.get(IMessageService);
    const commandService = accessor.get(ICommandService);
    const localeService = accessor.get(LocaleService);

    const doc = univerInstanceService.getFocusedUnit();
    if (!doc || doc.type !== UniverInstanceType.UNIVER_DOC) return false;

    const activeTextRange = docSelectionManagerService.getActiveTextRange();
    if (!activeTextRange) {
      messageService.show({
        type: MessageType.Warning,
        content: localeService.t(
          'parker-vue-lab-plugins.doc-lock.error.selectFirstUnlock'
        )
      });
      return false;
    }

    const { startOffset: unlockStart, endOffset: unlockEnd } = activeTextRange;
    if (unlockStart === unlockEnd || unlockStart === undefined || unlockEnd === undefined) {
      messageService.show({
        type: MessageType.Warning,
        content: localeService.t(
          'parker-vue-lab-plugins.doc-lock.error.emptySelection'
        )
      });
      return false;
    }

    const lockedRangeList = this._getLockedRangeList(doc);
    const store = useUniverStore();
    let unlockedCount = 0;

    for (const lockedRange of lockedRangeList) {
      const lockedStart = lockedRange.startIndex;
      const lockedEnd = lockedRange.endIndex + 1; // Convert inclusive index to exclusive offset

      const overlapStart = Math.max(unlockStart, lockedStart);
      const overlapEnd = Math.min(unlockEnd, lockedEnd);

      if (overlapStart < overlapEnd) {
        // 解鎖前先檢查是否有權限
        const allowedRoleList = lockedRange.properties?.allowedRoleList;
        if (
          Array.isArray(allowedRoleList) &&
          allowedRoleList.length > 0 &&
          !allowedRoleList.includes(store.currentUserRole)
        ) {
          messageService.show({
            type: MessageType.Error,
            content: localeService.t(
              'parker-vue-lab-plugins.doc-lock.error.lockedBlocked'
            )
          });
          return false; // 阻擋解鎖
        }

        unlockedCount++;

        this.isPluginModifyingLock = true;
        try {
          // 刪除原本的鎖定範圍
          const deleteMutation = deleteCustomRangeFactory(accessor, {
            unitId: doc.getUnitId(),
            rangeId: lockedRange.rangeId
          });

          if (deleteMutation) {
            commandService.syncExecuteCommand(
              deleteMutation.id,
              deleteMutation.params
            );
          }

          // 若左側還有剩餘的範圍，建立新的鎖定區塊
          if (lockedStart < unlockStart) {
            const leftMutation = addCustomRangeBySelectionFactory(accessor, {
              unitId: doc.getUnitId(),
              rangeId: generateRandomId(),
              rangeType: lockedRange.rangeType,
              properties: { ...lockedRange.properties },
              selections: [
                {
                  startOffset: lockedStart,
                  endOffset: unlockStart,
                  collapsed: false,
                  ...(activeTextRange.segmentId
                    ? { segmentId: activeTextRange.segmentId }
                    : {})
                }
              ]
            });
            if (leftMutation)
              commandService.syncExecuteCommand(
                leftMutation.id,
                leftMutation.params
              );
          }

          // 若右側還有剩餘的範圍，建立新的鎖定區塊
          if (lockedEnd > unlockEnd) {
            const rightMutation = addCustomRangeBySelectionFactory(accessor, {
              unitId: doc.getUnitId(),
              rangeId: generateRandomId(),
              rangeType: lockedRange.rangeType,
              properties: { ...lockedRange.properties },
              selections: [
                {
                  startOffset: unlockEnd,
                  endOffset: lockedEnd,
                  collapsed: false,
                  ...(activeTextRange.segmentId
                    ? { segmentId: activeTextRange.segmentId }
                    : {})
                }
              ]
            });
            if (rightMutation)
              commandService.syncExecuteCommand(
                rightMutation.id,
                rightMutation.params
              );
          }
        } finally {
          this.isPluginModifyingLock = false;
        }
      }
    }

    if (unlockedCount > 0) {
      messageService.show({
        type: MessageType.Success,
        content: `${localeService.t('parker-vue-lab-plugins.doc-lock.success.unlocked')}${unlockStart} - ${unlockEnd}`
      });
      return true;
    } else {
      messageService.show({
        type: MessageType.Info,
        content: localeService.t(
          'parker-vue-lab-plugins.doc-lock.success.noLockedRange'
        )
      });
      return false;
    }
  }

  private _createMenuHiddenObservable(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const univerInstanceService = this._injector.get(IUniverInstanceService);
      const subscription = univerInstanceService.focused$.subscribe(
        (unitId) => {
          if (!unitId) {
            subscriber.next(true);
            return;
          }
          const unit = univerInstanceService.getUnit(unitId);
          subscriber.next(unit?.type !== UniverInstanceType.UNIVER_DOC);
        }
      );
      return () => subscription.unsubscribe();
    });
  }

  private _registerMenus() {
    const hidden$ = this._createMenuHiddenObservable();

    this.menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [MENU_ID_PARENT]: {
          order: 25,
          menuItemFactory: () => ({
            id: MENU_ID_PARENT,
            tooltip: 'parker-vue-lab-plugins.doc-lock-menu.tooltip',
            icon: 'Vue3LockedRoundIcon',
            type: MenuItemType.SUBITEMS
          }),
          [COMMAND_ID_LOCK]: {
            order: 25,
            menuItemFactory: () => ({
              id: COMMAND_ID_LOCK,
              title: 'parker-vue-lab-plugins.doc-lock.title',
              tooltip: 'parker-vue-lab-plugins.doc-lock.tooltip',
              icon: 'Vue3LockIcon',
              type: MenuItemType.BUTTON,
              hidden$
            })
          },
          [COMMAND_ID_UNLOCK]: {
            order: 26,
            menuItemFactory: () => ({
              id: COMMAND_ID_UNLOCK,
              title: 'parker-vue-lab-plugins.doc-lock.unlockTitle',
              tooltip: 'parker-vue-lab-plugins.doc-lock.unlockTooltip',
              icon: 'Vue3UnlockedIcon',
              type: MenuItemType.BUTTON,
              hidden$
            })
          }
        }
      }
    });
  }

  private _registerEditInterceptor() {
    this.commandService.beforeCommandExecuted((commandInfo) => {
      if (this.isPluginModifyingLock) return;

      if (commandInfo.id === 'doc.mutation.rich-text-editing') {
        const params = commandInfo.params as IRichTextEditingMutationParams;
        const univerInstanceService = this._injector.get(
          IUniverInstanceService
        );
        const doc = univerInstanceService.getUnit(params.unitId);

        if (doc && doc.type === UniverInstanceType.UNIVER_DOC) {
          const lockedRangeList = this._getLockedRangeList(doc);

          if (lockedRangeList.length > 0) {
            const store = useUniverStore();
            const textXActionList = this._extractTextXActionList(params.actions);

            let currentOffset = 0;
            let isBlocked = false;

            for (const actionUnsafe of textXActionList) {
              const action = actionUnsafe as {
                t: string;
                len?: number;
                body?: unknown;
              };

              if (action.t === 'r') {
                if (action.body) {
                  const editStart = currentOffset;
                  const editEnd = currentOffset + (action.len ?? 0);
                  if (
                    !this._checkEditPermission(
                      lockedRangeList,
                      editStart,
                      editEnd,
                      store.currentUserRole
                    )
                  ) {
                    isBlocked = true;
                    break;
                  }
                }
                currentOffset += action.len ?? 0;
              } else if (action.t === 'i') {
                if (
                  !this._checkEditPermission(
                    lockedRangeList,
                    currentOffset,
                    currentOffset,
                    store.currentUserRole,
                    true
                  )
                ) {
                  isBlocked = true;
                  break;
                }
              } else if (action.t === 'd') {
                const editStart = currentOffset;
                const editEnd = currentOffset + (action.len ?? 0);
                if (
                  !this._checkEditPermission(
                    lockedRangeList,
                    editStart,
                    editEnd,
                    store.currentUserRole
                  )
                ) {
                  isBlocked = true;
                  break;
                }
                currentOffset += action.len ?? 0;
              }
            }

            if (isBlocked) {
              const messageService = this._injector.get(IMessageService);
              const localeService = this._injector.get(LocaleService);
              messageService.show({
                type: MessageType.Error,
                content: localeService.t(
                  'parker-vue-lab-plugins.doc-lock.error.lockedBlocked'
                )
              });
              throw new Error(DOC_LOCK_ERROR_MESSAGE);
            }
          }
        }
      }
    });
  }

  private _extractTextXActionList(actionsObj: unknown): unknown[] {
    const findTextXActionList = (obj: unknown): unknown[] | null => {
      if (Array.isArray(obj)) {
        for (const item of obj) {
          if (item && typeof item === 'object') {
            const record = item as Record<string, unknown>;
            if (record.t === 'TextX' && Array.isArray(record.o))
              return record.o;
            if (record.et === 'text-x' && Array.isArray(record.e))
              return record.e;
          }
          const res = findTextXActionList(item);
          if (res) return res;
        }
      } else if (obj && typeof obj === 'object') {
        const record = obj as Record<string, unknown>;
        if (record.t === 'TextX' && Array.isArray(record.o)) return record.o;
        if (record.et === 'text-x' && Array.isArray(record.e)) return record.e;
        for (const key in record) {
          const res = findTextXActionList(record[key]);
          if (res) return res;
        }
      }
      return null;
    };

    return findTextXActionList(actionsObj) || [];
  }
}
