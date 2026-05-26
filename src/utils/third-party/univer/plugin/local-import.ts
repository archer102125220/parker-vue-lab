import { Inject, Injector, type IAccessor } from '@wendellhu/redi';
import {
  ComponentManager,
  IMenuManagerService,
  MenuItemType,
  RibbonStartGroup,
  IMessageService
} from '@univerjs/ui';
import { MessageType } from '@univerjs/design';
import {
  CommandType,
  ICommandService,
  Plugin,
  type ICommand
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';

export class LocalImportButtonPlugin extends Plugin {
  static override pluginName = 'local-import-plugin';

  constructor(
    @Inject(Injector) protected override _injector: Injector,
    @Inject(IMenuManagerService) private readonly menuManagerService: IMenuManagerService,
    @Inject(ICommandService) private readonly commandService: ICommandService,
    @Inject(ComponentManager) private readonly componentManager: ComponentManager
  ) {
    super();
  }

  override onStarting(): void {
    const buttonId = 'local-import-button';

    const command: ICommand = {
      type: CommandType.OPERATION,
      id: buttonId,
      handler: async (accessor: IAccessor) => {
        const messageService = accessor.get(IMessageService);
        // We use FUniver to access the import APIs easily
        const univerAPI = FUniver.newAPI(accessor.get(Injector));
        
        // 建立一個隱藏的 input 來選擇檔案
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.docx,.xlsx';
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (!file) return;

          const extension = file.name.split('.').pop()?.toLowerCase();
          if (extension !== 'docx' && extension !== 'xlsx') {
            messageService.show({
              type: MessageType.Error,
              content: '不支援的檔案格式，請上傳 DOCX 或 XLSX'
            });
            return;
          }

          try {
            messageService.show({
              type: MessageType.Info,
              content: '正在匯入文件，請稍候...'
            });

            let snapshot: any = null;
            let fileType = '';

            if (extension === 'docx') {
              snapshot = await univerAPI.importDOCXToSnapshotAsync(file);
              fileType = 'doc';
            } else if (extension === 'xlsx') {
              snapshot = await univerAPI.importXLSXToSnapshotAsync(file);
              fileType = 'sheet';
            }
            
            if (snapshot) {
              // 發送一個自定義事件，讓 Vue 元件重新渲染編輯器
              document.dispatchEvent(
                new CustomEvent('univer-local-import-snapshot', {
                  detail: { snapshot, type: fileType }
                })
              );
              
              messageService.show({
                type: MessageType.Success,
                content: '匯入成功！'
              });
            }
          } catch (err: any) {
            console.error(err);
            messageService.show({
              type: MessageType.Error,
              content: '匯入失敗：' + (err.message || '未知錯誤')
            });
          }
        };
        input.click();

        return true;
      }
    };

    const menuItemFactory = () => ({
      id: buttonId,
      title: 'Local Import',
      tooltip: 'Import DOCX/XLSX (Local)',
      icon: 'ExportIcon',
      type: MenuItemType.BUTTON
    });

    // 註冊至工具列
    this.menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [buttonId]: {
          order: 19,
          menuItemFactory
        }
      }
    });

    this.commandService.registerCommand(command);
  }
}
