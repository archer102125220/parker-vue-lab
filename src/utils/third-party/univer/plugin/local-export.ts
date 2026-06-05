import { Observable } from 'rxjs';
import { Inject, Injector, type IAccessor } from '@wendellhu/redi';
import {
  CommandType,
  ICommandService,
  IUniverInstanceService,
  Plugin,
  UniverInstanceType,
  LocaleService,
  type ICommand,
  type IDocumentData,
  type IWorkbookData
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import {
  ComponentManager,
  IMenuManagerService,
  MenuItemType,
  RibbonStartGroup,
  IMessageService,
  ILayoutService
} from '@univerjs/ui';
import {
  transformDocumentDataToSnapshotJson,
  transformWorkbookDataToSnapshotJson
} from '@univerjs-pro/exchange-client';

import Vue3DownloadIcon from '@src/components/Icon/Download';

/**
 * 純前端本地匯出外掛 (匯出 JSON Snapshot)
 * 此方法完全不依賴後端，直接在前端將目前的 Snapshot 打包下載
 */
export class LocalExportButtonPlugin extends Plugin {
  static override pluginName = 'local-export-plugin';

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
    if (this.componentManager.get('Vue3DownloadIcon') === undefined) {
      this.componentManager.register('Vue3DownloadIcon', Vue3DownloadIcon, {
        framework: 'vue3'
      });
    }

    const buttonId = 'local-export-button';

    const command: ICommand = {
      type: CommandType.OPERATION,
      id: buttonId,
      handler: async (accessor: IAccessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const messageService = accessor.get(IMessageService);
        const localeService = accessor.get(LocaleService);
        const layoutService = accessor.get(ILayoutService);

        const doc = univerInstanceService.getFocusedUnit();
        if (typeof doc !== 'object' || doc === null) return false;

        const focusedUnitId = doc.getUnitId();
        if (typeof focusedUnitId !== 'string' || focusedUnitId === '') {
          return false;
        }

        const isDoc = doc.type === UniverInstanceType.UNIVER_DOC;
        const isSheet = doc.type === UniverInstanceType.UNIVER_SHEET;

        if (isDoc === false && isSheet === false) {
          return false;
        }

        try {
          messageService.show({
            type: MessageType.Info,
            content: localeService.t('parker-vue-lab-plugins.local-export.info')
          });

          const startEvent = new CustomEvent('univer-local-export-started', {
            bubbles: true
          });
          if (layoutService.rootContainerElement) {
            layoutService.rootContainerElement.dispatchEvent(startEvent);
          } else {
            document.dispatchEvent(startEvent);
          }

          // 1. 取得完整的文件 Snapshot JSON
          const snapshot = doc.getSnapshot();
          let exportJson;

          if (isDoc === true) {
            exportJson = await transformDocumentDataToSnapshotJson(
              snapshot as IDocumentData
            );
          } else if (isSheet === true) {
            exportJson = await transformWorkbookDataToSnapshotJson(
              snapshot as IWorkbookData
            );
          } else {
            throw new Error(
              localeService.t(
                'parker-vue-lab-plugins.local-export.error.snapshot'
              )
            );
          }

          const snapshotStr = JSON.stringify(exportJson, null, 2);

          // 2. 純前端建立 Blob 並觸發下載
          const blob = new Blob([snapshotStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.download = `snapshot_${isDoc ? 'doc' : 'sheet'}.json`;
          link.style.display = 'none';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          return true;
        } catch (err: unknown) {
          console.error('[LocalExportPlugin] Error:', err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          messageService.show({
            type: MessageType.Error,
            content:
              localeService.t(
                'parker-vue-lab-plugins.local-export.error.exportFailed'
              ) + errorMessage
          });
          return false;
        } finally {
          const endEvent = new CustomEvent('univer-local-export-ended', {
            bubbles: true
          });
          if (layoutService.rootContainerElement) {
            layoutService.rootContainerElement.dispatchEvent(endEvent);
          } else {
            document.dispatchEvent(endEvent);
          }
        }
      }
    };

    const menuItemFactory = () => ({
      id: buttonId,
      title: 'parker-vue-lab-plugins.local-export.title',
      tooltip: 'parker-vue-lab-plugins.local-export.tooltip',
      icon: 'Vue3DownloadIcon',
      type: MenuItemType.BUTTON,
      hidden$: new Observable<boolean>((subscriber) => {
        const univerInstanceService = this._injector.get(
          IUniverInstanceService
        );
        const subscription = univerInstanceService.focused$.subscribe(
          (unitId) => {
            if (typeof unitId !== 'string' || unitId === '') {
              subscriber.next(true);
              return;
            }
            const unit = univerInstanceService.getUnit(unitId);
            subscriber.next(
              unit?.type !== UniverInstanceType.UNIVER_DOC &&
                unit?.type !== UniverInstanceType.UNIVER_SHEET
            );
          }
        );
        return () => subscription.unsubscribe();
      })
    });

    const parentMenuId = 'parker-vue-lab-plugins.import-export-menu';

    this.menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [parentMenuId]: {
          order: 19,
          menuItemFactory: () => ({
            id: parentMenuId,
            tooltip: 'parker-vue-lab-plugins.import-export-menu.tooltip',
            icon: 'Vue3FolderIcon',
            type: MenuItemType.SUBITEMS
          }),
          [buttonId]: {
            order: 2,
            menuItemFactory
          }
        }
      }
    });

    this.commandService.registerCommand(command);
  }
}
