import { Observable } from 'rxjs';
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
  IUniverInstanceService,
  Plugin,
  UniverInstanceType,
  type ICommand,
  type IDocumentData,
  type IWorkbookData,
  LocaleService
} from '@univerjs/core';
import {
  transformDocumentDataToSnapshotJson,
  transformWorkbookDataToSnapshotJson
} from '@univerjs-pro/exchange-client';

import Vue3DownloadIcon from '@src/components/Icon/Download';

/**
 * `ServerExportButtonPlugin` 的設定選項。
 */
export interface IServerExportPluginConfig {
  /**
   * 自訂後端 API 請求的前綴路徑。
   * 若未提供，將預設使用 `VITE_UNIVERSER_DOCKER_HOST` 環境變數加上 `/universer-api`，
   * 或是 `http://localhost:8000/universer-api`。
   *
   * @example
   * 'https://api.example.com/universer-api'
   */
  apiPrefix?: string;
}

/**
 * 後端伺服器匯出外掛 (支援 Word / Excel)
 * 專門處理「非協同模式」下，前端建立的本地檔案如何正確匯出為 DOCX / XLSX
 *
 * @example
 * ```typescript
 * univer.registerPlugin(ServerExportButtonPlugin, {
 *   apiPrefix: 'https://api.example.com/universer-api'
 * });
 * ```
 */
export class ServerExportButtonPlugin extends Plugin {
  static override pluginName = 'server-export-plugin';

  constructor(
    private readonly _config:
      | Partial<IServerExportPluginConfig>
      | undefined = {},
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
    this.componentManager.register('Vue3DownloadIcon', Vue3DownloadIcon, {
      framework: 'vue3'
    });

    const buttonId = 'server-export-button';

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

        const fileType = isDoc === true ? 1 : 2; // 1: Doc, 2: Sheet
        const fileExtension = isDoc === true ? 'docx' : 'xlsx';

        try {
          messageService.show({
            type: MessageType.Info,
            content: localeService.t(
              'parker-vue-lab-plugins.server-export.info'
            )
          });

          const startEvent = new CustomEvent('univer-server-export-started', {
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
                'parker-vue-lab-plugins.server-export.error.snapshot'
              )
            );
          }

          const snapshotStr = JSON.stringify(exportJson);

          // 定義後端 API 路徑
          const UNIVERSER_HOST =
            import.meta.env.VITE_UNIVERSER_DOCKER_HOST ||
            'http://localhost:8000';
          const API_PREFIX =
            this._config?.apiPrefix || `${UNIVERSER_HOST}/universer-api`;

          // 2. 上傳快照到 Universer 取得 FileId (jsonID)
          const blob = new Blob([snapshotStr], { type: 'application/json' });
          const formData = new FormData();
          formData.append('file', blob, 'snapshot.json');

          const uploadUrl = `${API_PREFIX}/stream/file/upload?size=${blob.size}&source=1&flate=false`;
          const uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
          });

          if (uploadRes.ok === false) {
            const errText = await uploadRes.text();
            throw new Error(
              `${localeService.t('parker-vue-lab-plugins.server-export.error.uploadFailed')} (${uploadRes.status}): ${errText}`
            );
          }
          const uploadData = (await uploadRes.json()) as { FileId?: string };

          if (
            typeof uploadData !== 'object' ||
            uploadData === null ||
            typeof uploadData.FileId !== 'string' ||
            uploadData.FileId === ''
          ) {
            throw new Error(
              localeService.t(
                'parker-vue-lab-plugins.server-export.error.uploadSnapshotFailed'
              )
            );
          }
          const fileId = uploadData.FileId;

          // 3. 呼叫匯出 API
          const exportUrl = `${API_PREFIX}/exchange/${fileType}/export`;
          const exportRes = await fetch(exportUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              unitID: '',
              jsonID: fileId,
              type: fileType
            })
          });
          const exportData = (await exportRes.json()) as { taskID?: string };

          const taskID = exportData.taskID;
          if (typeof taskID !== 'string' || taskID === '') {
            throw new Error(
              localeService.t(
                'parker-vue-lab-plugins.server-export.error.taskFailed'
              )
            );
          }

          // 4. Polling (輪詢) 檢查任務狀態
          let isSuccess = false;
          let finalTaskData: {
            status?: string;
            error?: { message?: string };
            url?: string;
            downloadUrl?: string;
            fileID?: string;
            fileId?: string;
            export?: { fileID?: string; fileUrl?: string };
          } | null = null;

          for (let i = 0; i < 30; i++) {
            const taskUrl = `${API_PREFIX}/exchange/task/${taskID}`;
            const taskRes = await fetch(taskUrl);
            const taskData = (await taskRes.json()) as {
              status?: string;
              error?: { message?: string };
              url?: string;
              downloadUrl?: string;
              fileID?: string;
              fileId?: string;
              export?: { fileID?: string; fileUrl?: string };
            };

            if (taskData.status === 'success' || taskData.status === 'done') {
              isSuccess = true;
              finalTaskData = taskData;
              break;
            } else if (
              taskData.status === 'error' ||
              taskData.status === 'failed'
            ) {
              console.error(
                '[ServerExportPlugin] Task failed details:',
                taskData
              );
              throw new Error(
                taskData.error?.message ||
                  localeService.t(
                    'parker-vue-lab-plugins.server-export.error.backendTaskFailed'
                  ) + JSON.stringify(taskData)
              );
            }

            await new Promise((r) => setTimeout(r, 1000));
          }

          if (!isSuccess || finalTaskData === null) {
            throw new Error(
              localeService.t(
                'parker-vue-lab-plugins.server-export.error.timeout'
              )
            );
          }

          // 5. 下載檔案
          let downloadUrl = '';
          if (
            typeof finalTaskData.url === 'string' &&
            finalTaskData.url !== ''
          ) {
            downloadUrl = finalTaskData.url;
          } else if (
            typeof finalTaskData.downloadUrl === 'string' &&
            finalTaskData.downloadUrl !== ''
          ) {
            downloadUrl = finalTaskData.downloadUrl;
          } else if (
            finalTaskData.export &&
            typeof finalTaskData.export.fileID === 'string' &&
            finalTaskData.export.fileID !== ''
          ) {
            downloadUrl = `${API_PREFIX}/stream/file/download?file_id=${finalTaskData.export.fileID}`;
          } else if (
            typeof finalTaskData.fileID === 'string' &&
            finalTaskData.fileID !== ''
          ) {
            downloadUrl = `${API_PREFIX}/stream/file/download?file_id=${finalTaskData.fileID}`;
          } else if (
            typeof finalTaskData.fileId === 'string' &&
            finalTaskData.fileId !== ''
          ) {
            downloadUrl = `${API_PREFIX}/stream/file/download?file_id=${finalTaskData.fileId}`;
          } else {
            downloadUrl = `${API_PREFIX}/stream/file/download?file_id=${taskID}`;
            console.warn(
              '未在任務結果中找到明確的下載欄位，嘗試使用預設組合:',
              finalTaskData
            );
          }

          const link = document.createElement('a');
          link.href = downloadUrl;
          link.target = '_blank';
          link.download = `export.${fileExtension}`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          return true;
        } catch (err: unknown) {
          console.error('[ServerExportPlugin] Error:', err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          messageService.show({
            type: MessageType.Error,
            content:
              localeService.t(
                'parker-vue-lab-plugins.server-export.error.exportFailed'
              ) + errorMessage
          });
          return false;
        } finally {
          const endEvent = new CustomEvent('univer-server-export-ended', {
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
      title: 'parker-vue-lab-plugins.server-export.title',
      tooltip: 'parker-vue-lab-plugins.server-export.tooltip',
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
            order: 3,
            menuItemFactory
          }
        }
      }
    });

    this.commandService.registerCommand(command);
  }
}
