import type {
  ISetRangeValuesMutationParams,
  ISetWorksheetColumnCountMutationParams,
  ISetWorksheetRowCountMutationParams
} from '@univerjs/preset-sheets-core';
import type { ICommand, IMutationInfo, Workbook } from '@univerjs/presets';
import { Observable } from 'rxjs';
// import { FolderIcon } from '@univerjs/icons';
import {
  ComponentManager,
  IMenuManagerService,
  MenuItemType,
  RibbonStartGroup,
  SetRangeValuesMutation,
  SetRangeValuesUndoMutationFactory,
  SetWorksheetColumnCountMutation,
  SetWorksheetColumnCountUndoMutationFactory,
  SetWorksheetRowCountMutation,
  SetWorksheetRowCountUndoMutationFactory
} from '@univerjs/preset-sheets-core';
import {
  CommandType,
  covertCellValues,
  ICommandService,
  Inject,
  Injector,
  IUndoRedoService,
  IUniverInstanceService,
  Plugin,
  sequenceExecute,
  UniverInstanceType
} from '@univerjs/presets';
import { handleSelectCSVFile } from '@src/utils/helpers/select-csv-file';

/**
 * 匯入 CSV 按鈕外掛程式
 * 一個簡單的外掛程式範例，展示如何撰寫外掛程式。
 */
export class ImportCSVButtonPlugin extends Plugin {
  static override pluginName = 'import-csv-plugin';

  constructor(
    _config: unknown, // Univer 動態傳遞一個 config 物件作為第一個參數
    // 注入 injector (依賴注入器)，必填
    @Inject(Injector) readonly _injector: Injector,
    // 注入選單服務，用於新增工具列按鈕
    @Inject(IMenuManagerService)
    private readonly menuManagerService: IMenuManagerService,
    // 注入指令服務，用於註冊指令處理常式
    @Inject(ICommandService) private readonly commandService: ICommandService,
    // 注入元件管理器，用於註冊圖示元件
    @Inject(ComponentManager)
    private readonly componentManager: ComponentManager
  ) {
    super();
  }

  /**
   * 外掛程式掛載到 Univer 實例的第一個生命週期，
   * 此時 Univer 業務實例尚未建立。
   * 外掛程式應在此生命週期中將其自身模組加入至依賴注入系統。
   * 不建議在此生命週期之外初始化外掛程式的內部模組。
   */

  override onStarting() {
    // 註冊圖示元件
    // this.componentManager.register('FolderIcon', FolderIcon);

    const buttonId = 'import-csv-button';

    const command: ICommand = {
      type: CommandType.OPERATION,
      id: buttonId,
      handler: (accessor) => {
        // 注入 Univer 實例服務
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        // 取得目前工作表
        const worksheet = univerInstanceService
          .getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!
          .getActiveSheet();
        const unitId = worksheet.getUnitId();
        const subUnitId = worksheet.getSheetId();

        // 等待使用者選擇 CSV 檔案，接著組合多個變更 (mutations) 操作以啟用正確的復原/重做功能
        return handleSelectCSVFile(({ data, rowsCount, colsCount }) => {
          const redoMutations: IMutationInfo[] = [];
          const undoMutations: IMutationInfo[] = [];

          // 設定工作表列數
          const setRowCountMutationRedoParams: ISetWorksheetRowCountMutationParams =
            {
              unitId,
              subUnitId,
              rowCount: rowsCount
            };
          const setRowCountMutationUndoParams: ISetWorksheetRowCountMutationParams =
            SetWorksheetRowCountUndoMutationFactory(
              accessor,
              setRowCountMutationRedoParams
            );
          redoMutations.push({
            id: SetWorksheetRowCountMutation.id,
            params: setRowCountMutationRedoParams
          });
          undoMutations.push({
            id: SetWorksheetRowCountMutation.id,
            params: setRowCountMutationUndoParams
          });

          // 設定工作表欄數
          const setColumnCountMutationRedoParams: ISetWorksheetColumnCountMutationParams =
            {
              unitId,
              subUnitId,
              columnCount: colsCount
            };
          const setColumnCountMutationUndoParams: ISetWorksheetColumnCountMutationParams =
            SetWorksheetColumnCountUndoMutationFactory(
              accessor,
              setColumnCountMutationRedoParams
            );
          redoMutations.push({
            id: SetWorksheetColumnCountMutation.id,
            params: setColumnCountMutationRedoParams
          });
          undoMutations.unshift({
            id: SetWorksheetColumnCountMutation.id,
            params: setColumnCountMutationUndoParams
          });

          // 將 CSV 解析為 Univer 資料
          const cellValue = covertCellValues(data, {
            startColumn: 0, // 起始欄索引
            startRow: 0, // 起始列索引
            endColumn: colsCount - 1, // 結束欄索引
            endRow: rowsCount - 1 // 結束列索引
          });

          // 設定工作表資料
          const setRangeValuesMutationRedoParams: ISetRangeValuesMutationParams =
            {
              unitId,
              subUnitId,
              cellValue
            };
          const setRangeValuesMutationUndoParams: ISetRangeValuesMutationParams =
            SetRangeValuesUndoMutationFactory(
              accessor,
              setRangeValuesMutationRedoParams
            );
          redoMutations.push({
            id: SetRangeValuesMutation.id,
            params: setRangeValuesMutationRedoParams
          });
          undoMutations.unshift({
            id: SetRangeValuesMutation.id,
            params: setRangeValuesMutationUndoParams
          });

          const result = sequenceExecute(redoMutations, commandService);

          if (result.result) {
            undoRedoService.pushUndoRedo({
              unitID: unitId,
              undoMutations,
              redoMutations
            });

            return true;
          }

          return false;
        });
      }
    };

    const menuItemFactory = () => ({
      id: buttonId,
      title: 'Import CSV',
      tooltip: 'Import CSV',
      icon: 'FolderIcon', // 圖示名稱
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
            subscriber.next(unit?.type !== UniverInstanceType.UNIVER_SHEET);
          }
        );
        return () => subscription.unsubscribe();
      })
    });
    this.menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [buttonId]: {
          order: 10,
          menuItemFactory
        }
      }
    });

    this.commandService.registerCommand(command);
  }
}

export default ImportCSVButtonPlugin;
