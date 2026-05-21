import type { ICommand, Workbook } from '@univerjs/presets';
import { Observable } from 'rxjs';
import { ExportIcon } from '@univerjs/icons';
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

/**
 * Export CSV Button Plugin
 * This plugin reads data from the current Univer sheet and triggers a CSV file download.
 * It demonstrates how to add custom buttons to the ribbon, execute commands,
 * and read data directly from the Univer data model.
 */
export class ExportCSVButtonPlugin extends Plugin {
  static override pluginName = 'export-csv-plugin';

  constructor(
    // Injector is the core dependency injection container in Univer.
    // It manages the creation and lifecycle of all services and plugins.
    @Inject(Injector) readonly _injector: Injector,

    // IMenuManagerService manages the UI menus (like right-click menus, toolbars, ribbons).
    // We use it to add our Export CSV button to the ribbon.
    @Inject(IMenuManagerService)
    private readonly menuManagerService: IMenuManagerService,

    // ICommandService is responsible for registering and executing commands.
    // Commands are the way to perform actions in Univer, and they can support undo/redo (if they are mutations).
    @Inject(ICommandService) private readonly commandService: ICommandService,

    // ComponentManager is used to register custom Vue/React components like icons so they can be referenced by string names.
    @Inject(ComponentManager)
    private readonly componentManager: ComponentManager
  ) {
    super();
  }

  /**
   * onStarting is the first lifecycle method of a Univer plugin.
   * It's called when the plugin is mounted, before the business instances (like a Workbook) are created.
   * This is the ideal place to register components, commands, and menu items.
   */
  override onStarting() {
    // 1. Register the icon we want to use in the menu
    this.componentManager.register('ExportIcon', ExportIcon);

    const buttonId = 'export-csv-button';

    // 2. Define the command that will be executed when the button is clicked
    const command: ICommand = {
      type: CommandType.OPERATION, // OPERATION means it's a UI/user action, not a core data mutation (MUTATION). No undo/redo needed here.
      id: buttonId,
      handler: (accessor) => {
        // 'accessor' acts like a service locator to dynamically get required services during command execution.
        const univerInstanceService = accessor.get(IUniverInstanceService);

        // Get the current workbook (spreadsheet document) instance
        const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(
          UniverInstanceType.UNIVER_SHEET
        );
        if (!workbook) return false;

        // Get the currently active worksheet (tab) within the workbook
        const worksheet = workbook.getActiveSheet();

        // Find the maximum row and column limits of the worksheet
        const rowCount = worksheet.getRowCount();
        const colCount = worksheet.getColumnCount();

        let csvContent = '';

        // 3. Loop through all rows and columns to extract cell data
        for (let r = 0; r < rowCount; r++) {
          const rowData: string[] = [];
          for (let c = 0; c < colCount; c++) {
            // getCell returns the internal cell data object (ICellData) or undefined if the cell is completely empty
            const cell = worksheet.getCell(r, c);

            // Extract the value. 'v' is the raw value.
            // Alternatively, 'm' represents the formatted string value.
            let val = cell?.v ?? '';
            let strVal = String(val);

            // CSV escaping rules:
            // If the value contains quotes, commas, or newlines, wrap it in double quotes
            // and escape internal double quotes by doubling them.
            if (
              strVal.includes(',') ||
              strVal.includes('"') ||
              strVal.includes('\n')
            ) {
              strVal = `"${strVal.replace(/"/g, '""')}"`;
            }
            rowData.push(strVal);
          }
          // Join columns with commas and rows with newlines
          csvContent += rowData.join(',') + '\n';
        }

        // 4. Create a Blob and trigger a file download using standard browser APIs
        // \uFEFF is the UTF-8 Byte Order Mark (BOM) to ensure Excel opens the CSV correctly.
        const blob = new Blob(['\uFEFF' + csvContent], {
          type: 'text/csv;charset=utf-8;'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${worksheet.getName() || 'export'}.csv`; // Use sheet name as filename
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
      }
    };

    // 3. Define the menu item configuration for the UI ribbon
    const menuItemFactory = () => ({
      id: buttonId,
      title: 'Export CSV',
      tooltip: 'Export CSV',
      icon: 'ExportIcon', // This must match the name we registered in componentManager
      type: MenuItemType.BUTTON,
      // hidden$ is an Observable that dynamically determines when the button should be hidden.
      // Here, we hide the button if the currently focused document is NOT a spreadsheet (e.g. if we switch to a Doc).
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

    // 4. Add the menu item to the ribbon menu structure
    // RibbonStartGroup.OTHERS is usually placed on the far right of the toolbar.
    this.menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [buttonId]: {
          order: 11, // Display order: placed slightly after Import CSV which uses order 10
          menuItemFactory
        }
      }
    });

    // 5. Finally, register the command with the command service so it can be triggered by our button
    this.commandService.registerCommand(command);
  }
}

export default ExportCSVButtonPlugin;
