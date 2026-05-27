import { Inject, Injector } from '@wendellhu/redi';
import {
  Plugin,
  ICommandService,
  IUniverInstanceService,
  UniverInstanceType,
  CommandType,
  CustomRangeType,
  generateRandomId,
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
import { DocSelectionManagerService, addCustomRangeBySelectionFactory, deleteCustomRangeFactory } from '@univerjs/docs';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { Observable } from 'rxjs';

import Vue3LockIcon from '@/src/components/Icon/Lock.vue';
import Vue3UnlockedIcon from '@/src/components/Icon/Unlocked.vue';

/**
 * 實驗性文件區域鎖定外掛
 * 1. 取得當前選取範圍
 * 2. 標記該範圍為唯讀 (透過 CustomRange)
 * 3. 透過 ICommandService 的事件攔截，來阻擋編輯
 */
export class DocLockPlugin extends Plugin {
  static override pluginName = 'doc-lock-plugin';
  private isPluginModifyingLock = false;

  constructor(
    _config: unknown,
    @Inject(Injector) protected override _injector: Injector,
    @Inject(IMenuManagerService)
    private readonly menuManagerService: IMenuManagerService,
    @Inject(ICommandService) private readonly commandService: ICommandService,
    @Inject(ComponentManager)
    private readonly componentManager: ComponentManager
  ) {
    super();
  }

  override onStarting(): void {
    this.componentManager.register('Vue3LockIcon', Vue3LockIcon, {
      framework: 'vue3'
    });
    this.componentManager.register('Vue3UnlockedIcon', Vue3UnlockedIcon, {
      framework: 'vue3'
    });

    // --- Univer Bug Fix: Patch DocSelectionManagerService to prevent preset-docs-hyper-link crash ---
    // The hyper-link plugin reads `activeRanges[0].segmentId` directly on hover, 
    // which crashes if `getTextRanges()` returns an empty array.
    const docSelectionManagerService = this._injector.get(DocSelectionManagerService);
    if (docSelectionManagerService) {
      const originalGetTextRanges = docSelectionManagerService.getTextRanges.bind(docSelectionManagerService);
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

        const doc = univerInstanceService.getFocusedUnit();
        if (!doc || doc.type !== UniverInstanceType.UNIVER_DOC) {
          return false;
        }

        const activeTextRange = docSelectionManagerService.getActiveTextRange();
        if (!activeTextRange) {
          messageService.show({
            type: MessageType.Warning,
            content: '請先選擇要鎖定的文字範圍'
          });
          return false;
        }

        const { startOffset, endOffset } = activeTextRange;
        if (startOffset === endOffset) {
          messageService.show({
            type: MessageType.Warning,
            content: '選取範圍不能為空'
          });
          return false;
        }

          // 使用 CustomRangeFactory 建立自訂範圍
        const rangeId = generateRandomId();
        const selection: ITextRangeParam = { startOffset, endOffset, collapsed: false };
        if (activeTextRange.segmentId) {
          selection.segmentId = activeTextRange.segmentId;
        }
        const selections = [selection];

        const customRangeMutation = addCustomRangeBySelectionFactory(accessor, {
          unitId: doc.getUnitId(),
          rangeId,
          rangeType: CustomRangeType.CUSTOM,
          properties: { locked: true },
          selections
        });

        if (customRangeMutation) {
          this.isPluginModifyingLock = true;
          try {
            commandService.syncExecuteCommand(customRangeMutation.id, customRangeMutation.params);
          } finally {
            this.isPluginModifyingLock = false;
          }
          messageService.show({
            type: MessageType.Success,
            content: `已標記範圍 ${startOffset} - ${endOffset} 為鎖定狀態`
          });
          console.log('[DocLockPlugin] Range locked:', startOffset, endOffset, customRangeMutation);
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
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const messageService = accessor.get(IMessageService);
        const commandService = accessor.get(ICommandService);

        const doc = univerInstanceService.getFocusedUnit();
        if (!doc || doc.type !== UniverInstanceType.UNIVER_DOC) {
          return false;
        }

        const activeTextRange = docSelectionManagerService.getActiveTextRange();
        if (!activeTextRange) {
          messageService.show({ type: MessageType.Warning, content: '請先選擇要解除鎖定的文字範圍' });
          return false;
        }

        const { startOffset: uStart, endOffset: uEnd } = activeTextRange;
        if (uStart === uEnd || uStart === undefined || uEnd === undefined) {
          messageService.show({ type: MessageType.Warning, content: '選取範圍不能為空' });
          return false;
        }

        const documentDataModel = doc as unknown as DocumentDataModel;
        const customRanges = documentDataModel.getCustomRanges?.() || [];
        const lockedRanges = customRanges.filter((r: ICustomRange<{ locked?: boolean }>) => r.properties?.locked);

        let unlockedCount = 0;

        for (const lr of lockedRanges) {
          const lStart = lr.startIndex;
          const lEnd = lr.endIndex + 1; // Convert inclusive index to exclusive offset

          const overlapStart = Math.max(uStart, lStart);
          const overlapEnd = Math.min(uEnd, lEnd);

          if (overlapStart < overlapEnd) {
            unlockedCount++;

            this.isPluginModifyingLock = true;
            try {
              // Delete the original locked range
              const deleteMutation = deleteCustomRangeFactory(accessor, {
                unitId: doc.getUnitId(),
                rangeId: lr.rangeId
              });

              if (deleteMutation) {
                commandService.syncExecuteCommand(deleteMutation.id, deleteMutation.params);
              }

              // Create a new locked range for the left side (if any)
              if (lStart < uStart) {
                const newRangeIdLeft = generateRandomId();
                const selectionLeft: ITextRangeParam = { startOffset: lStart, endOffset: uStart, collapsed: false };
                if (activeTextRange.segmentId) {
                  selectionLeft.segmentId = activeTextRange.segmentId;
                }
                const selectionsLeft = [selectionLeft];
                const leftMutation = addCustomRangeBySelectionFactory(accessor, {
                  unitId: doc.getUnitId(),
                  rangeId: newRangeIdLeft,
                  rangeType: CustomRangeType.CUSTOM,
                  properties: { locked: true },
                  selections: selectionsLeft
                });
                if (leftMutation) commandService.syncExecuteCommand(leftMutation.id, leftMutation.params);
              }

              // Create a new locked range for the right side (if any)
              if (lEnd > uEnd) {
                const newRangeIdRight = generateRandomId();
                const selectionRight: ITextRangeParam = { startOffset: uEnd, endOffset: lEnd, collapsed: false };
                if (activeTextRange.segmentId) {
                  selectionRight.segmentId = activeTextRange.segmentId;
                }
                const selectionsRight = [selectionRight];
                const rightMutation = addCustomRangeBySelectionFactory(accessor, {
                  unitId: doc.getUnitId(),
                  rangeId: newRangeIdRight,
                  rangeType: CustomRangeType.CUSTOM,
                  properties: { locked: true },
                  selections: selectionsRight
                });
                if (rightMutation) commandService.syncExecuteCommand(rightMutation.id, rightMutation.params);
              }
            } finally {
              this.isPluginModifyingLock = false;
            }
          }
        }

        if (unlockedCount > 0) {
          messageService.show({ type: MessageType.Success, content: `已解除範圍 ${uStart} - ${uEnd} 的鎖定` });
          return true;
        } else {
          messageService.show({ type: MessageType.Info, content: `選取範圍內沒有鎖定的區塊` });
          return false;
        }
      }
    };

    this.commandService.registerCommand(unlockCommand);

    const menuItemFactory = () => ({
      id: commandId,
      title: '鎖定選取範圍',
      tooltip: '鎖定選取範圍',
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
      title: '解除鎖定選取範圍',
      tooltip: '解除鎖定選取範圍',
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

    this.menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [commandId]: {
          order: 25,
          menuItemFactory
        },
        [unlockCommandId]: {
          order: 26,
          menuItemFactory: unlockMenuItemFactory
        }
      }
    });

    // 攔截核心編輯 Mutation
    this.commandService.beforeCommandExecuted((commandInfo) => {
      if (this.isPluginModifyingLock) return;

      if (commandInfo.id === 'doc.mutation.rich-text-editing') {
        const params = commandInfo.params as IRichTextEditingMutationParams;
        const univerInstanceService = this._injector.get(IUniverInstanceService);
        const doc = univerInstanceService.getUnit(params.unitId);
        
        if (doc && doc.type === UniverInstanceType.UNIVER_DOC) {
          // 取得文件中所有的 custom ranges
          const documentDataModel = doc as unknown as DocumentDataModel;
          const customRanges = documentDataModel.getCustomRanges?.() || [];
          const lockedRanges = customRanges.filter((r: ICustomRange<{ locked?: boolean }>) => r.properties?.locked);

          if (lockedRanges.length > 0) {
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
              const action = actionUnsafe as { t: string; len?: number; body?: unknown };
              if (action.t === 'r') {
                if (action.body) {
                  const editStart = currentOffset;
                  const editEnd = currentOffset + (action.len ?? 0);
                  for (const lockedRange of lockedRanges) {
                    const lStart = lockedRange.startIndex;
                    const lEnd = lockedRange.endIndex + 1;
                    const overlap = Math.max(0, Math.min(editEnd, lEnd) - Math.max(editStart, lStart));
                    if (overlap > 0) {
                      isBlocked = true;
                      break;
                    }
                  }
                }
                currentOffset += (action.len ?? 0);
              } else if (action.t === 'i') {
                const editOffset = currentOffset;
                for (const lockedRange of lockedRanges) {
                  const lStart = lockedRange.startIndex;
                  const lEnd = lockedRange.endIndex + 1;
                  if (editOffset > lStart && editOffset < lEnd) {
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
                  const overlap = Math.max(0, Math.min(editEnd, lEnd) - Math.max(editStart, lStart));
                  if (overlap > 0) {
                    isBlocked = true;
                    break;
                  }
                }
                currentOffset += (action.len ?? 0);
              }

              if (isBlocked) break;
            }

            if (isBlocked) {
              const messageService = this._injector.get(IMessageService);
              messageService.show({
                type: MessageType.Error,
                content: '此區域已鎖定，無法編輯'
              });
              throw new Error('Edit blocked: Range is locked.');
            }
          }
        }
      }
    });
  }
}
