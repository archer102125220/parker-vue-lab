import { Observable } from 'rxjs';
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
  IUniverInstanceService,
  Plugin,
  UniverInstanceType,
  type ICommand,
  type IDocumentData,
  type IWorkbookData
} from '@univerjs/core';
import {
  transformDocumentDataToSnapshotJson,
  transformWorkbookDataToSnapshotJson
} from '@univerjs-pro/exchange-client';

/**
 * 本地文件匯出外掛 (支援 Word / Excel)
 * 專門處理「非協同模式」下，前端建立的本地檔案如何正確匯出為 DOCX / XLSX
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
    const buttonId = 'local-export-button';

    const command: ICommand = {
      type: CommandType.OPERATION,
      id: buttonId,
      handler: async (accessor: IAccessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const messageService = accessor.get(IMessageService);
        const doc = univerInstanceService.getFocusedUnit();
        if (!doc) return false;
        const focusedUnitId = doc.getUnitId();
        if (typeof focusedUnitId !== 'string' || focusedUnitId === '')
          return false;

        const isDoc = doc.type === UniverInstanceType.UNIVER_DOC;
        const isSheet = doc.type === UniverInstanceType.UNIVER_SHEET;

        if (!isDoc && !isSheet) return false;

        const fileType = isDoc ? 1 : 2; // 1: Doc, 2: Sheet
        const fileExtension = isDoc ? 'docx' : 'xlsx';

        try {
          messageService.show({
            type: MessageType.Info,
            content: '正在為您匯出文件，這可能需要幾秒鐘的時間，請稍候...'
          });

          // 1. 取得完整的文件 Snapshot JSON
          const snapshot = doc.getSnapshot();
          let exportJson;

          if (isDoc) {
            exportJson = await transformDocumentDataToSnapshotJson(
              snapshot as IDocumentData
            );
          } else if (isSheet) {
            exportJson = await transformWorkbookDataToSnapshotJson(
              snapshot as IWorkbookData
            );
          } else {
            throw new Error(
              '未載入 UniverProExchangeClient，無法進行 Snapshot 轉換'
            );
          }

          const snapshotStr = JSON.stringify(exportJson);

          // 定義後端 API 路徑
          const UNIVERSER_HOST =
            (import.meta as any).env.VITE_UNIVERSER_DOCKER_HOST ||
            'http://localhost:8000';
          const API_PREFIX = `${UNIVERSER_HOST}/universer-api`;

          // 2. 上傳快照到 Universer 取得 FileId (jsonID)
          const blob = new Blob([snapshotStr], { type: 'application/json' });
          const formData = new FormData();
          // 必須使用 Blob 封裝以符合 multipart/form-data 格式
          formData.append('file', blob, 'snapshot.json');

          const uploadUrl = `${API_PREFIX}/stream/file/upload?size=${blob.size}&source=1&flate=false`;
          const uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
          });

          if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error(`上傳失敗 (${uploadRes.status}): ${errText}`);
          }
          const uploadData = (await uploadRes.json()) as { FileId?: string };

          if (
            typeof uploadData !== 'object' ||
            uploadData === null ||
            !uploadData.FileId
          ) {
            throw new Error('上傳 Snapshot 失敗');
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
            throw new Error('呼叫匯出任務失敗，未取得 taskID');
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
                '[LocalExportPlugin] Task failed details:',
                taskData
              );
              throw new Error(
                taskData.error?.message ||
                  '後端匯出任務執行失敗: ' + JSON.stringify(taskData)
              );
            }

            await new Promise((r) => setTimeout(r, 1000));
          }

          if (!isSuccess || finalTaskData === null) {
            throw new Error('匯出任務超時');
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
          console.error('[LocalExportPlugin] Error:', err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          messageService.show({
            type: MessageType.Error,
            content: '匯出發生錯誤：' + errorMessage
          });
          return false;
        }
      }
    };

    const menuItemFactory = () => ({
      id: buttonId,
      title: 'Export File',
      tooltip: 'Export as Local File',
      icon: 'ExportIcon',
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

    this.menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [buttonId]: {
          order: 20,
          menuItemFactory
        }
      }
    });

    this.commandService.registerCommand(command);
  }
}
