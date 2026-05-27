import type { ICommand, Workbook } from '@univerjs/presets';
import { Observable } from 'rxjs';
import {
  ComponentManager,
  IMenuManagerService,
  MenuItemType,
  RibbonStartGroup
} from '@univerjs/preset-sheets-core';
import {
  CommandType,
  ICommandService,
  Inject,
  Injector,
  IUniverInstanceService,
  Plugin,
  UniverInstanceType
} from '@univerjs/presets';

import Vue3IconCSVExport from '@src/components/Icon/CSVExport.tsx';

/**
 * 匯出 CSV 按鈕外掛
 * 這個外掛會讀取目前 Univer 工作表中的資料，並觸發 CSV 檔案下載。
 * 它展示了如何在工具列 (ribbon) 中加入自訂按鈕、執行指令，
 * 以及如何直接從 Univer 資料模型讀取資料。
 */
export class ExportCSVButtonPlugin extends Plugin {
  static override pluginName = 'export-csv-plugin';

  constructor(
    _config: unknown, // Univer 會在第一個參數動態傳入 config 物件
    // Injector 是 Univer 的核心依賴注入容器。
    // 它管理所有服務 (services) 與外掛 (plugins) 的建立和生命週期。
    @Inject(Injector) readonly _injector: Injector,

    // IMenuManagerService 管理 UI 選單（像是右鍵選單、工具列、ribbon）。
    // 我們使用它將「匯出 CSV」按鈕加到 ribbon。
    @Inject(IMenuManagerService)
    private readonly menuManagerService: IMenuManagerService,

    // ICommandService 負責註冊和執行指令 (commands)。
    // 指令是 Univer 中執行動作的方式，它們可以支援復原/重做 (如果是資料修改 (mutations) 的話)。
    @Inject(ICommandService) private readonly commandService: ICommandService,

    // ComponentManager 用來註冊自訂的 Vue/React 元件（如圖示），以便透過字串名稱來參考它們。
    @Inject(ComponentManager)
    private readonly componentManager: ComponentManager
  ) {
    super();
  }

  /**
   * onStarting 是 Univer 外掛的第一個生命週期方法。
   * 當外掛被掛載時呼叫，在業務實例（例如 Workbook）建立之前。
   * 這裡是註冊元件、指令和選單項目的理想位置。
   */
  override onStarting() {
    // 1. 註冊我們想在選單中使用的圖示
    this.componentManager.register('Vue3IconCSVExport', Vue3IconCSVExport, {
      framework: 'vue3'
    });

    const buttonId = 'export-csv-button';

    // 2. 定義點擊按鈕時將會執行的指令
    const command: ICommand = {
      type: CommandType.OPERATION, // OPERATION 代表這是一個 UI/使用者操作，而非核心資料修改 (MUTATION)。這裡不需要復原/重做。
      id: buttonId,
      handler: (accessor) => {
        // 'accessor' 就像是一個服務定位器，可以在指令執行期間動態取得所需的服務。
        const univerInstanceService = accessor.get(IUniverInstanceService);

        // 取得目前活頁簿 (試算表文件) 實例
        const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(
          UniverInstanceType.UNIVER_SHEET
        );
        if (!workbook) return false;

        // 取得活頁簿中目前活躍的工作表 (分頁)
        const worksheet = workbook.getActiveSheet();

        // 取得工作表的最大行數和列數限制
        const rowCount = worksheet.getRowCount();
        const colCount = worksheet.getColumnCount();

        let csvContent = '';

        // 3. 遍歷所有列與欄以提取儲存格資料
        for (let r = 0; r < rowCount; r++) {
          const rowData: string[] = [];
          for (let c = 0; c < colCount; c++) {
            // getCell 回傳內部的儲存格資料物件 (ICellData)，如果儲存格完全空白則回傳 undefined
            const cell = worksheet.getCell(r, c);

            // 提取值。'v' 是原始值。
            // 另外，'m' 代表格式化後的字串值。
            let val = cell?.v ?? '';
            let strVal = String(val);

            // CSV 跳脫規則：
            // 如果值包含引號、逗號或換行字元，將其用雙引號包裝
            // 並將內部的雙引號加倍來跳脫。
            if (
              strVal.includes(',') ||
              strVal.includes('"') ||
              strVal.includes('\n')
            ) {
              strVal = `"${strVal.replace(/"/g, '""')}"`;
            }
            rowData.push(strVal);
          }
          // 將每一欄用逗號連接，每一列用換行字元連接
          csvContent += rowData.join(',') + '\n';
        }

        // 4. 建立一個 Blob，並使用標準的瀏覽器 API 觸發檔案下載
        // \uFEFF 是 UTF-8 的位元組順序記號 (BOM)，確保 Excel 能正確開啟 CSV。
        const blob = new Blob(['\uFEFF' + csvContent], {
          type: 'text/csv;charset=utf-8;'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${worksheet.getName() || 'export'}.csv`; // 使用工作表名稱作為檔案名稱
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
      }
    };

    // 3. 定義 UI ribbon 的選單項目配置
    const menuItemFactory = () => ({
      id: buttonId,
      title: 'parker-vue-lab-plugins.csv-export.title',
      tooltip: 'parker-vue-lab-plugins.csv-export.tooltip',
      icon: 'Vue3IconCSVExport', // 這必須和我們在 componentManager 註冊的名稱相符
      type: MenuItemType.BUTTON,
      // hidden$ 是一個 Observable，用來動態決定何時該隱藏按鈕。
      // 這裡，如果目前聚焦的文件不是試算表 (例如我們切換到了文件 (Doc))，就會隱藏按鈕。
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

    const parentMenuId = 'parker-vue-lab-plugins.csv-import-export-menu';

    // 4. 將選單項目加到 ribbon 選單結構中
    // RibbonStartGroup.OTHERS 通常位於工具列的最右側。
    this.menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [parentMenuId]: {
          order: 10, // 顯示順序：放在順序為 9 的「開啟快速面板」後面
          menuItemFactory: () => ({
            id: parentMenuId,
            tooltip: 'CSV',
            icon: 'Vue3CSVIcon',
            type: MenuItemType.SUBITEMS
          }),
          [buttonId]: {
            order: 2,
            menuItemFactory
          }
        }
      }
    });

    // 5. 最後，向 command service 註冊指令，讓我們的按鈕可以觸發它
    this.commandService.registerCommand(command);
  }
}

export default ExportCSVButtonPlugin;
