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
  type ICustomRange
} from '@univerjs/core';
import {
  ComponentManager,
  IMenuManagerService,
  MenuItemType,
  RibbonStartGroup,
  IMessageService
} from '@univerjs/ui';
import { MessageType } from '@univerjs/design';
import { DocSelectionManagerService, addCustomRangeBySelectionFactory } from '@univerjs/docs';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { Observable } from 'rxjs';

import Vue3LockIcon from '@/src/components/Icon/Lock.vue';

/**
 * 實驗性文件區域鎖定外掛
 * 1. 取得當前選取範圍
 * 2. 標記該範圍為唯讀 (透過 CustomRange)
 * 3. 透過 ICommandService 的事件攔截，來阻擋編輯
 */
export class DocLockPlugin extends Plugin {
  static override pluginName = 'doc-lock-plugin';

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
        const customRangeMutation = addCustomRangeBySelectionFactory(accessor, {
          unitId: doc.getUnitId(),
          rangeId,
          rangeType: CustomRangeType.CUSTOM,
          properties: { locked: true },
          selections: [{ startOffset, endOffset, collapsed: false }]
        });

        if (customRangeMutation) {
          commandService.syncExecuteCommand(customRangeMutation.id, customRangeMutation.params);
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

    this.menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [commandId]: {
          order: 25,
          menuItemFactory
        }
      }
    });

    // 攔截核心編輯 Mutation
    this.commandService.beforeCommandExecuted((commandInfo) => {
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
            // 透過檢查 mutations 中的 textRanges (代表目前選取的編輯範圍)
            // 來判斷是否落在鎖定範圍內
            const editRanges = params.textRanges || params.prevTextRanges || [];
            
            for (const editRange of editRanges) {
              for (const lockedRange of lockedRanges) {
                // 如果編輯範圍與鎖定範圍有交集，則擋下
                // (更精確的作法是解析 actions 的游標位移，但簡單處理可以用選擇區間)
                const overlap = Math.max(0, Math.min(editRange.endOffset ?? 0, lockedRange.endIndex) - Math.max(editRange.startOffset ?? 0, lockedRange.startIndex));
                if (overlap > 0 || (editRange.startOffset >= lockedRange.startIndex && editRange.startOffset <= lockedRange.endIndex)) {
                  const messageService = this._injector.get(IMessageService);
                  messageService.show({
                    type: MessageType.Error,
                    content: '此區域已鎖定，無法編輯'
                  });
                  // 拋出錯誤以中斷 command 執行
                  throw new Error('Edit blocked: Range is locked.');
                }
              }
            }
          }
        }
      }
    });
  }
}
