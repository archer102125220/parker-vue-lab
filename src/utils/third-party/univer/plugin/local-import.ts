import { Inject, Injector, type IAccessor } from '@wendellhu/redi';
import {
  ComponentManager,
  IMenuManagerService,
  MenuItemType,
  RibbonStartGroup,
  IMessageService,
  ILayoutService
} from '@univerjs/ui';
import { MessageType } from '@univerjs/design';
import {
  CommandType,
  ICommandService,
  Plugin,
  type ICommand,
  LocaleService
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';

export class LocalImportButtonPlugin extends Plugin {
  static override pluginName = 'local-import-plugin';

  constructor(
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
    const buttonId = 'local-import-button';

    const command: ICommand = {
      type: CommandType.OPERATION,
      id: buttonId,
      handler: async (accessor: IAccessor) => {
        const messageService = accessor.get(IMessageService);
        const layoutService = accessor.get(ILayoutService);
        const localeService = accessor.get(LocaleService);
        // We use FUniver to access the import APIs easily
        const univerAPI = FUniver.newAPI(accessor.get(Injector));

        // 根據當前啟用的編輯器類型動態決定支援的副檔名
        const isDoc = !!univerAPI.getActiveDocument?.();
        const isSheet = !!univerAPI.getActiveWorkbook?.();

        let acceptExtensions = '.docx,.xlsx';
        let errorMessage = localeService.t(
          'parker-vue-lab-plugins.local-import.error.unsupportedAll'
        );

        if (isSheet) {
          acceptExtensions = '.xlsx';
          errorMessage = localeService.t(
            'parker-vue-lab-plugins.local-import.error.unsupportedSheet'
          );
        } else if (isDoc) {
          acceptExtensions = '.docx';
          errorMessage = localeService.t(
            'parker-vue-lab-plugins.local-import.error.unsupportedDoc'
          );
        }

        // 放在 input.onchange 會跳 localeService 的相關 error
        // 初步判斷跟整個編輯器掛載卸載有關，因此提早取出語系包內容
        const loadingContent = localeService.t(
          'parker-vue-lab-plugins.local-import.info'
        );
        const successContent = localeService.t(
          'parker-vue-lab-plugins.local-import.success'
        );
        const failedContent = localeService.t(
          'parker-vue-lab-plugins.local-import.importFailed'
        );

        // 建立一個隱藏的 input 來選擇檔案
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = acceptExtensions;
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (!file) return;

          const extension = file.name.split('.').pop()?.toLowerCase();
          const isValidExtension = isSheet
            ? extension === 'xlsx'
            : isDoc
              ? extension === 'docx'
              : extension === 'docx' || extension === 'xlsx';

          if (!isValidExtension) {
            messageService.show({
              type: MessageType.Error,
              content: errorMessage
            });
            return;
          }

          try {
            messageService.show({
              type: MessageType.Info,
              content: loadingContent
            });

            const startEvent = new CustomEvent('univer-local-import-started', {
              bubbles: true
            });
            if (layoutService.rootContainerElement) {
              layoutService.rootContainerElement.dispatchEvent(startEvent);
            } else {
              document.dispatchEvent(startEvent);
            }

            let snapshot: unknown = null;
            let fileType = '';
            let unitId = '';

            if (extension === 'docx') {
              unitId = univerAPI.getActiveDocument()?.getId() || '';
              snapshot = await univerAPI.importDOCXToSnapshotAsync(file);
              fileType = 'doc';
            } else if (extension === 'xlsx') {
              unitId = univerAPI.getActiveWorkbook()?.getId() || '';
              snapshot = await univerAPI.importXLSXToSnapshotAsync(file);
              fileType = 'sheet';
            }

            if (snapshot) {
              // 發送一個自定義事件，優先發送到容器元素讓 Vue 可以透過 @ 監聽
              const event = new CustomEvent('univer-local-import-snapshot', {
                detail: { snapshot, type: fileType, unitId },
                bubbles: true
              });

              if (layoutService.rootContainerElement) {
                layoutService.rootContainerElement.dispatchEvent(event);
              } else {
                document.dispatchEvent(event);
              }

              messageService.show({
                type: MessageType.Success,
                content: successContent
              });
            }
          } catch (err: unknown) {
            console.error(err);
            const errorMessage =
              err instanceof Error ? err.message : String(err);
            messageService.show({
              type: MessageType.Error,
              content: failedContent + errorMessage
            });
          } finally {
            const endEvent = new CustomEvent('univer-local-import-ended', {
              bubbles: true
            });
            if (layoutService.rootContainerElement) {
              layoutService.rootContainerElement.dispatchEvent(endEvent);
            } else {
              document.dispatchEvent(endEvent);
            }
          }
        };
        input.click();

        return true;
      }
    };

    const menuItemFactory = () => ({
      id: buttonId,
      title: 'parker-vue-lab-plugins.local-import.title',
      tooltip: 'parker-vue-lab-plugins.local-import.tooltip',
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
