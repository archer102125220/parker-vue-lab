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

import Vue3LockedRoundIcon from '@/src/components/Icon/LockedRound.vue';
import Vue3LockIcon from '@/src/components/Icon/Lock.vue';
import Vue3UnlockedIcon from '@/src/components/Icon/Unlocked.vue';
import { useUniverStore } from '@src/store/univer';

const DOC_LOCK_ERROR_MESSAGE = 'Edit blocked: Range is locked.';

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

  window.console.error = function (...args) {
    // 檢查參數中是否包含特定的鎖定阻擋錯誤（字串或 Error 物件）
    const isLockedError = args.some(
      (arg) =>
        (typeof arg === 'string' && arg.includes(DOC_LOCK_ERROR_MESSAGE)) ||
        (arg instanceof Error && arg.message.includes(DOC_LOCK_ERROR_MESSAGE))
    );

    if (isLockedError) {
      // 攔截到預期的鎖定阻擋錯誤，直接 return 吃掉，保持 console 乾淨
      return;
    }

    // 如果不是我們要攔截的錯誤，就照常印出
    window.originalConsoleError!.apply(console, args);
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
    try {
      this.componentManager.register('Vue3LockIcon', Vue3LockIcon, {
        framework: 'vue3'
      });
    } catch {}
    try {
      this.componentManager.register('Vue3UnlockedIcon', Vue3UnlockedIcon, {
        framework: 'vue3'
      });
    } catch {}
    try {
      this.componentManager.register(
        'Vue3LockedRoundIcon',
        Vue3LockedRoundIcon,
        {
          framework: 'vue3'
        }
      );
    } catch {}

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
        const ranges = originalGetTextRanges();
        if (Array.isArray(ranges) && ranges.length === 0) {
          // Return a Proxy that acts as an empty array but returns an empty object for index 0 to avoid undefined crash
          return new Proxy(ranges, {
            get(target, prop) {
              if (prop === '0') return {};
              return Reflect.get(target, prop);
            }
          }) as unknown as typeof ranges;
        }
        return ranges;
      };
    }

    const commandId = 'doc.command.lock-selection';

    const lockCommand: ICommand = {
      type: CommandType.OPERATION,
      id: commandId,
      handler: async (accessor: IAccessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docSelectionManagerService = accessor.get(
          DocSelectionManagerService
        );
        const messageService = accessor.get(IMessageService);
        const commandService = accessor.get(ICommandService);
        const localeService = accessor.get(LocaleService);

        const doc = univerInstanceService.getFocusedUnit();
        if (!doc || doc.type !== UniverInstanceType.UNIVER_DOC) {
          return false;
        }

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
        if (!permissionParams) {
          return false; // 使用者取消鎖定
        }

        // 使用 CustomRangeFactory 建立自訂範圍
        const rangeId = generateRandomId();
        const selection: ITextRangeParam = {
          startOffset,
          endOffset,
          collapsed: false
        };
        if (activeTextRange.segmentId) {
          selection.segmentId = activeTextRange.segmentId;
        }
        const selections = [selection];

        const noStyle =
          typeof this._config.noStyle === 'boolean'
            ? this._config.noStyle
            : true;
        const customRangeMutation = addCustomRangeBySelectionFactory(accessor, {
          unitId: doc.getUnitId(),
          rangeId,
          rangeType: noStyle
            ? (8888 as CustomRangeType)
            : CustomRangeType.CUSTOM,
          properties: {
            locked: true,
            allowedRoles: permissionParams.allowedRoles
          },
          selections
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
    };

    this.commandService.registerCommand(lockCommand);

    const unlockCommandId = 'doc.command.unlock-selection';
    const unlockCommand: ICommand = {
      type: CommandType.OPERATION,
      id: unlockCommandId,
      handler: async (accessor: IAccessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docSelectionManagerService = accessor.get(
          DocSelectionManagerService
        );
        const messageService = accessor.get(IMessageService);
        const commandService = accessor.get(ICommandService);
        const localeService = accessor.get(LocaleService);

        const doc = univerInstanceService.getFocusedUnit();
        if (!doc || doc.type !== UniverInstanceType.UNIVER_DOC) {
          return false;
        }

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

        const { startOffset: uStart, endOffset: uEnd } = activeTextRange;
        if (uStart === uEnd || uStart === undefined || uEnd === undefined) {
          messageService.show({
            type: MessageType.Warning,
            content: localeService.t(
              'parker-vue-lab-plugins.doc-lock.error.emptySelection'
            )
          });
          return false;
        }

        const documentDataModel = doc as unknown as DocumentDataModel;
        const customRanges = documentDataModel.getCustomRanges?.() || [];
        const lockedRanges = customRanges.filter(
          (r: ICustomRange<{ locked?: boolean; allowedRoles?: string[] }>) =>
            r.properties?.locked
        );

        const store = useUniverStore();
        let unlockedCount = 0;

        for (const lr of lockedRanges) {
          const lStart = lr.startIndex;
          const lEnd = lr.endIndex + 1; // Convert inclusive index to exclusive offset

          const overlapStart = Math.max(uStart, lStart);
          const overlapEnd = Math.min(uEnd, lEnd);

          if (overlapStart < overlapEnd) {
            // 解鎖前先檢查是否有權限
            const allowedRoles = lr.properties?.allowedRoles;
            if (
              Array.isArray(allowedRoles) &&
              allowedRoles.length > 0 &&
              !allowedRoles.includes(store.currentUserRole)
            ) {
              messageService.show({
                type: MessageType.Error,
                content: localeService.t(
                  'parker-vue-lab-plugins.doc-lock.error.lockedBlocked'
                ) // 或者提供專門的拒絕解鎖訊息
              });
              return false; // 阻擋解鎖
            }

            unlockedCount++;

            this.isPluginModifyingLock = true;
            try {
              // 刪除原本的鎖定範圍
              const deleteMutation = deleteCustomRangeFactory(accessor, {
                unitId: doc.getUnitId(),
                rangeId: lr.rangeId
              });

              if (deleteMutation) {
                commandService.syncExecuteCommand(
                  deleteMutation.id,
                  deleteMutation.params
                );
              }

              // 若左側還有剩餘的範圍，建立新的鎖定區塊
              if (lStart < uStart) {
                const newRangeIdLeft = generateRandomId();
                const selectionLeft: ITextRangeParam = {
                  startOffset: lStart,
                  endOffset: uStart,
                  collapsed: false
                };
                if (activeTextRange.segmentId) {
                  selectionLeft.segmentId = activeTextRange.segmentId;
                }
                const selectionsLeft = [selectionLeft];
                const leftMutation = addCustomRangeBySelectionFactory(
                  accessor,
                  {
                    unitId: doc.getUnitId(),
                    rangeId: newRangeIdLeft,
                    rangeType: lr.rangeType,
                    properties: { ...lr.properties },
                    selections: selectionsLeft
                  }
                );
                if (leftMutation)
                  commandService.syncExecuteCommand(
                    leftMutation.id,
                    leftMutation.params
                  );
              }

              // 若右側還有剩餘的範圍，建立新的鎖定區塊
              if (lEnd > uEnd) {
                const newRangeIdRight = generateRandomId();
                const selectionRight: ITextRangeParam = {
                  startOffset: uEnd,
                  endOffset: lEnd,
                  collapsed: false
                };
                if (activeTextRange.segmentId) {
                  selectionRight.segmentId = activeTextRange.segmentId;
                }
                const selectionsRight = [selectionRight];
                const rightMutation = addCustomRangeBySelectionFactory(
                  accessor,
                  {
                    unitId: doc.getUnitId(),
                    rangeId: newRangeIdRight,
                    rangeType: lr.rangeType,
                    properties: { ...lr.properties },
                    selections: selectionsRight
                  }
                );
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
            content: `${localeService.t('parker-vue-lab-plugins.doc-lock.success.unlocked')}${uStart} - ${uEnd}`
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
    };

    this.commandService.registerCommand(unlockCommand);

    const menuItemFactory = () => ({
      id: commandId,
      title: 'parker-vue-lab-plugins.doc-lock.title',
      tooltip: 'parker-vue-lab-plugins.doc-lock.tooltip',
      icon: 'Vue3LockIcon',
      type: MenuItemType.BUTTON,
      hidden$: new Observable<boolean>((subscriber) => {
        const univerInstanceService = this._injector.get(
          IUniverInstanceService
        );
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
      })
    });

    const unlockMenuItemFactory = () => ({
      id: unlockCommandId,
      title: 'parker-vue-lab-plugins.doc-lock.unlockTitle',
      tooltip: 'parker-vue-lab-plugins.doc-lock.unlockTooltip',
      icon: 'Vue3UnlockedIcon',
      type: MenuItemType.BUTTON,
      hidden$: new Observable<boolean>((subscriber) => {
        const univerInstanceService = this._injector.get(
          IUniverInstanceService
        );
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
      })
    });

    const parentMenuId = 'parker-vue-lab-plugins.doc-lock-menu';

    this.menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [parentMenuId]: {
          order: 25,
          menuItemFactory: () => ({
            id: parentMenuId,
            tooltip: 'parker-vue-lab-plugins.doc-lock-menu.tooltip',
            icon: 'Vue3LockedRoundIcon',
            type: MenuItemType.SUBITEMS
          }),
          [commandId]: {
            order: 25,
            menuItemFactory
          },
          [unlockCommandId]: {
            order: 26,
            menuItemFactory: unlockMenuItemFactory
          }
        }
      }
    });

    // 攔截核心編輯 Mutation
    this.commandService.beforeCommandExecuted((commandInfo) => {
      if (this.isPluginModifyingLock) return;

      if (commandInfo.id === 'doc.mutation.rich-text-editing') {
        const params = commandInfo.params as IRichTextEditingMutationParams;
        const univerInstanceService = this._injector.get(
          IUniverInstanceService
        );
        const doc = univerInstanceService.getUnit(params.unitId);

        if (doc && doc.type === UniverInstanceType.UNIVER_DOC) {
          // 取得文件中所有的 custom ranges
          const documentDataModel = doc as unknown as DocumentDataModel;
          const customRanges = documentDataModel.getCustomRanges?.() || [];
          const lockedRanges = customRanges.filter(
            (r: ICustomRange<{ locked?: boolean; allowedRoles?: string[] }>) =>
              r.properties?.locked
          );

          if (lockedRanges.length > 0) {
            const store = useUniverStore();
            // 從 ot-json1 的 JSONOp 中遞迴尋找 TextX 操作陣列
            const findTextXActions = (obj: unknown): unknown[] | null => {
              if (Array.isArray(obj)) {
                for (const item of obj) {
                  if (item && typeof item === 'object') {
                    const record = item as Record<string, unknown>;
                    if (record.t === 'TextX' && Array.isArray(record.o)) {
                      return record.o;
                    }
                    if (record.et === 'text-x' && Array.isArray(record.e)) {
                      return record.e;
                    }
                  }
                  const res = findTextXActions(item);
                  if (res) return res;
                }
              } else if (obj && typeof obj === 'object') {
                const record = obj as Record<string, unknown>;
                if (record.t === 'TextX' && Array.isArray(record.o)) {
                  return record.o;
                }
                if (record.et === 'text-x' && Array.isArray(record.e)) {
                  return record.e;
                }
                for (const key in record) {
                  const res = findTextXActions(record[key]);
                  if (res) return res;
                }
              }
              return null;
            };

            const textXActions = findTextXActions(params.actions) || [];
            let currentOffset = 0;
            let isBlocked = false;

            for (const actionUnsafe of textXActions) {
              const action = actionUnsafe as {
                t: string;
                len?: number;
                body?: unknown;
              };
              if (action.t === 'r') {
                if (action.body) {
                  const editStart = currentOffset;
                  const editEnd = currentOffset + (action.len ?? 0);
                  for (const lockedRange of lockedRanges) {
                    const lStart = lockedRange.startIndex;
                    const lEnd = lockedRange.endIndex + 1;
                    const overlap = Math.max(
                      0,
                      Math.min(editEnd, lEnd) - Math.max(editStart, lStart)
                    );
                    if (overlap > 0) {
                      const allowedRoles = lockedRange.properties?.allowedRoles;
                      if (
                        Array.isArray(allowedRoles) &&
                        allowedRoles.includes(store.currentUserRole)
                      ) {
                        continue; // 允許編輯
                      }
                      isBlocked = true;
                      break;
                    }
                  }
                }
                currentOffset += action.len ?? 0;
              } else if (action.t === 'i') {
                const editOffset = currentOffset;
                for (const lockedRange of lockedRanges) {
                  const lStart = lockedRange.startIndex;
                  const lEnd = lockedRange.endIndex + 1;
                  if (editOffset > lStart && editOffset < lEnd) {
                    const allowedRoles = lockedRange.properties?.allowedRoles;
                    if (
                      Array.isArray(allowedRoles) &&
                      allowedRoles.includes(store.currentUserRole)
                    ) {
                      continue; // 允許編輯
                    }
                    isBlocked = true;
                    break;
                  }
                }
              } else if (action.t === 'd') {
                const editStart = currentOffset;
                const editEnd = currentOffset + (action.len ?? 0);
                for (const lockedRange of lockedRanges) {
                  const lStart = lockedRange.startIndex;
                  const lEnd = lockedRange.endIndex + 1;
                  const overlap = Math.max(
                    0,
                    Math.min(editEnd, lEnd) - Math.max(editStart, lStart)
                  );
                  if (overlap > 0) {
                    const allowedRoles = lockedRange.properties?.allowedRoles;
                    if (
                      Array.isArray(allowedRoles) &&
                      allowedRoles.includes(store.currentUserRole)
                    ) {
                      continue; // 允許編輯
                    }
                    isBlocked = true;
                    break;
                  }
                }
                currentOffset += action.len ?? 0;
              }

              if (isBlocked) break;
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
}
