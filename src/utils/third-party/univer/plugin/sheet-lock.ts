import { Observable } from 'rxjs';
import { Inject, Injector } from '@wendellhu/redi';
import { throttle } from 'lodash';
import {
  Plugin,
  ICommandService,
  IUniverInstanceService,
  UniverInstanceType,
  CommandType,
  LocaleService,
  type ICommand,
  type IAccessor,
  type Workbook
} from '@univerjs/core';
import {
  ComponentManager,
  IMenuManagerService,
  MenuItemType,
  RibbonStartGroup,
  IMessageService
} from '@univerjs/ui';
import { MessageType } from '@univerjs/design';
import {
  SheetsSelectionsService,
  SetRangeValuesMutation,
  RemoveRowMutation,
  RemoveColMutation,
  type ISetRangeValuesMutationParams,
  type IRemoveRowsMutationParams,
  type IRemoveColMutationParams
} from '@univerjs/sheets';

import Vue3LockIcon from '@/src/components/Icon/Lock.vue';
import Vue3UnlockedIcon from '@/src/components/Icon/Unlocked.vue';
import { useUniverStore } from '@src/store/univer';

const SHEET_LOCK_ERROR_MESSAGE = 'Edit blocked: Range is locked.';

// Filter error message from console
function ignoreErrorLog() {
  if (typeof window === 'undefined') return;
  if (window.__UNIVER__SHEET_LOCKED_ERROR_FILTERED__ === true) return;

  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes(SHEET_LOCK_ERROR_MESSAGE)) {
      event.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes(SHEET_LOCK_ERROR_MESSAGE)) {
      event.preventDefault();
    }
  });

  const originalConsoleError = window.console.error;
  window.originalConsoleError = originalConsoleError;
  window.console.error = function (...args) {
    const isLockedError = args.some(
      (arg) =>
        (typeof arg === 'string' && arg.includes(SHEET_LOCK_ERROR_MESSAGE)) ||
        (arg instanceof Error && arg.message.includes(SHEET_LOCK_ERROR_MESSAGE))
    );
    if (isLockedError) return;
    window.originalConsoleError?.apply(console, args);
  };

  window.__UNIVER__SHEET_LOCKED_ERROR_FILTERED__ = true;
}

export interface ISheetLockPluginConfig {}

export interface ILockedRangeInfo {
  range: {
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
  };
  allowedRoles: string[];
}

export class SheetLockPlugin extends Plugin {
  static override pluginName = 'sheet-lock-plugin';
  private _config: ISheetLockPluginConfig;

  // { unitId: { subUnitId: ILockedRangeInfo[] } }
  private lockedRanges: Record<string, Record<string, ILockedRangeInfo[]>> = {};

  constructor(
    config: Partial<ISheetLockPluginConfig> | undefined,
    @Inject(Injector) protected override _injector: Injector,
    @Inject(IMenuManagerService)
    private readonly menuManagerService: IMenuManagerService,
    @Inject(ICommandService) private readonly commandService: ICommandService,
    @Inject(ComponentManager)
    private readonly componentManager: ComponentManager
  ) {
    super();
    this._config = config || {};
    ignoreErrorLog();
  }

  override onStarting(): void {
    try {
      this.componentManager.register('Vue3LockIcon', Vue3LockIcon, {
        framework: 'vue3'
      });
    } catch {}
    try {
      this.componentManager.register('Vue3UnlockedIcon', Vue3UnlockedIcon, {
        framework: 'vue3'
      });
    } catch {}

    const commandId = 'sheet.command.lock-selection';

    const lockCommand: ICommand = {
      type: CommandType.OPERATION,
      id: commandId,
      handler: async (accessor: IAccessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const messageService = accessor.get(IMessageService);
        const localeService = accessor.get(LocaleService);

        const workbook = univerInstanceService.getFocusedUnit();
        if (!workbook || workbook.type !== UniverInstanceType.UNIVER_SHEET) {
          return false;
        }

        const selections = selectionManagerService.getCurrentSelections();
        if (!selections || selections.length === 0) {
          messageService.show({
            type: MessageType.Warning,
            content: localeService.t(
              'parker-vue-lab-plugins.sheet-lock.error.selectFirst'
            )
          });
          return false;
        }

        const store = useUniverStore();
        const permissionParams = await store.requestLockPermissions();
        if (!permissionParams) {
          return false;
        }

        const unitId = workbook.getUnitId();
        const subUnitId = (workbook as Workbook).getActiveSheet()?.getSheetId();

        if (!subUnitId) return false;

        if (!this.lockedRanges[unitId]) this.lockedRanges[unitId] = {};
        if (!this.lockedRanges[unitId][subUnitId]) {
          this.lockedRanges[unitId][subUnitId] = [];
        }

        for (const sel of selections) {
          this.lockedRanges[unitId][subUnitId].push({
            range: { ...sel.range },
            allowedRoles: permissionParams.allowedRoles
          });
        }

        messageService.show({
          type: MessageType.Success,
          content: localeService.t(
            'parker-vue-lab-plugins.sheet-lock.success.locked'
          )
        });

        return true;
      }
    };

    this.commandService.registerCommand(lockCommand);

    const unlockCommandId = 'sheet.command.unlock-selection';
    const unlockCommand: ICommand = {
      type: CommandType.OPERATION,
      id: unlockCommandId,
      handler: async (accessor: IAccessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const messageService = accessor.get(IMessageService);
        const localeService = accessor.get(LocaleService);

        const workbook = univerInstanceService.getFocusedUnit();
        if (!workbook || workbook.type !== UniverInstanceType.UNIVER_SHEET) {
          return false;
        }

        const selections = selectionManagerService.getCurrentSelections();
        if (!selections || selections.length === 0) {
          messageService.show({
            type: MessageType.Warning,
            content: localeService.t(
              'parker-vue-lab-plugins.sheet-lock.error.selectFirstUnlock'
            )
          });
          return false;
        }

        const unitId = workbook.getUnitId();
        const subUnitId = (workbook as Workbook).getActiveSheet()?.getSheetId();
        if (!subUnitId) return false;

        const store = useUniverStore();
        const unitLocks = this.lockedRanges[unitId]?.[subUnitId] || [];

        let unlockedCount = 0;

        for (const sel of selections) {
          const { startRow, endRow, startColumn, endColumn } = sel.range;

          for (let i = unitLocks.length - 1; i >= 0; i--) {
            const lock = unitLocks[i];
            if (!lock) continue;
            const l = lock.range;

            const intersectRow =
              Math.max(startRow, l.startRow) <= Math.min(endRow, l.endRow);
            const intersectCol =
              Math.max(startColumn, l.startColumn) <=
              Math.min(endColumn, l.endColumn);

            if (intersectRow && intersectCol) {
              if (
                Array.isArray(lock.allowedRoles) &&
                lock.allowedRoles.length > 0 &&
                !lock.allowedRoles.includes(store.currentUserRole)
              ) {
                messageService.show({
                  type: MessageType.Error,
                  content: localeService.t(
                    'parker-vue-lab-plugins.sheet-lock.error.lockedBlocked'
                  )
                });
                return false;
              }

              unitLocks.splice(i, 1);
              unlockedCount++;
            }
          }
        }

        if (unlockedCount > 0) {
          messageService.show({
            type: MessageType.Success,
            content: localeService.t(
              'parker-vue-lab-plugins.sheet-lock.success.unlocked'
            )
          });
          return true;
        } else {
          messageService.show({
            type: MessageType.Info,
            content: localeService.t(
              'parker-vue-lab-plugins.sheet-lock.success.noLockedRange'
            )
          });
          return false;
        }
      }
    };

    this.commandService.registerCommand(unlockCommand);

    const menuItemFactory = () => ({
      id: commandId,
      title: 'parker-vue-lab-plugins.sheet-lock.title',
      tooltip: 'parker-vue-lab-plugins.sheet-lock.tooltip',
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
            subscriber.next(unit?.type !== UniverInstanceType.UNIVER_SHEET);
          }
        );
        return () => subscription.unsubscribe();
      })
    });

    const unlockMenuItemFactory = () => ({
      id: unlockCommandId,
      title: 'parker-vue-lab-plugins.sheet-lock.unlockTitle',
      tooltip: 'parker-vue-lab-plugins.sheet-lock.unlockTooltip',
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
            subscriber.next(unit?.type !== UniverInstanceType.UNIVER_SHEET);
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

    this.commandService.beforeCommandExecuted((commandInfo) => {
      const store = useUniverStore();

      if (
        commandInfo.id === 'sheet.operation.set-cell-edit-visible' ||
        commandInfo.id === 'sheet.operation.set-cell-edit-visible-f2' ||
        commandInfo.id === 'sheet.operation.set-cell-edit-visible-arrow' ||
        commandInfo.id === 'sheet.operation.set-activate-cell-edit'
      ) {
        // Type assertion explanation: Using a local type to avoid 'any' for the UI commands' parameters.
        type IEditOperationParams = { visible?: boolean; unitId?: string };
        const params =
          commandInfo.params as unknown as IEditOperationParams | undefined;
        if (params && 'visible' in params && params.visible === false) {
          // Allow hiding the editor without permission checks
        } else {
          const univerInstanceService = this._injector.get(
            IUniverInstanceService
          );
          const unitId =
            params?.unitId || univerInstanceService.getFocusedUnit()?.getUnitId();
          
          if (unitId) {
            const workbook = univerInstanceService.getUnit(unitId) as Workbook;
            const subUnitId = workbook?.getActiveSheet()?.getSheetId();
            
            if (subUnitId) {
              const unitLocks = this.lockedRanges[unitId]?.[subUnitId] || [];
              if (unitLocks.length > 0) {
                const selectionManagerService = this._injector.get(
                  SheetsSelectionsService
                );
                const selections = selectionManagerService.getCurrentSelections();

                if (selections && selections.length > 0) {
                  const firstSelection = selections[0];
                  if (firstSelection && firstSelection.primary) {
                    const { startRow, endRow, startColumn, endColumn } =
                      firstSelection.primary;

                    let isBlocked = false;
                    for (const lock of unitLocks) {
                      const l = lock.range;
                      const intersectRow =
                        Math.max(startRow, l.startRow) <=
                        Math.min(endRow, l.endRow);
                      const intersectCol =
                        Math.max(startColumn, l.startColumn) <=
                        Math.min(endColumn, l.endColumn);

                      if (intersectRow && intersectCol) {
                        if (
                          Array.isArray(lock.allowedRoles) &&
                          !lock.allowedRoles.includes(store.currentUserRole)
                        ) {
                          isBlocked = true;
                          break;
                        }
                      }
                    }

                    if (isBlocked) {
                      this.showBlockedMessage();
                      throw new Error(SHEET_LOCK_ERROR_MESSAGE);
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (commandInfo.id === SetRangeValuesMutation.id) {
        const params = commandInfo.params as ISetRangeValuesMutationParams;
        const unitLocks =
          this.lockedRanges[params.unitId]?.[params.subUnitId] || [];
        if (unitLocks.length === 0) return;

        let isBlocked = false;
        const { cellValue } = params;

        if (cellValue) {
          for (const rowStr in cellValue) {
            const row = parseInt(rowStr, 10);
            const rowData = cellValue[row];
            if (!rowData) continue;

            for (const colStr in rowData) {
              const col = parseInt(colStr, 10);
              const cell = rowData[col];

              if (cell === undefined || cell === null) continue;

              for (const lock of unitLocks) {
                const { startRow, endRow, startColumn, endColumn } = lock.range;
                if (
                  row >= startRow &&
                  row <= endRow &&
                  col >= startColumn &&
                  col <= endColumn
                ) {
                  if (
                    Array.isArray(lock.allowedRoles) &&
                    !lock.allowedRoles.includes(store.currentUserRole)
                  ) {
                    isBlocked = true;
                    break;
                  }
                }
              }
              if (isBlocked) break;
            }
            if (isBlocked) break;
          }
        }

        if (isBlocked) {
          this.showBlockedMessage();
          throw new Error(SHEET_LOCK_ERROR_MESSAGE);
        }
      }

      if (commandInfo.id === RemoveRowMutation.id) {
        const params = commandInfo.params as IRemoveRowsMutationParams;
        const unitLocks =
          this.lockedRanges[params.unitId]?.[params.subUnitId] || [];
        if (unitLocks.length === 0) return;

        let isBlocked = false;
        const { range } = params;

        const { startRow, endRow } = range;
        for (const lock of unitLocks) {
          const l = lock.range;
          if (startRow <= l.endRow && endRow >= l.startRow) {
            if (
              Array.isArray(lock.allowedRoles) &&
              !lock.allowedRoles.includes(store.currentUserRole)
            ) {
              isBlocked = true;
              break;
            }
          }
        }

        if (isBlocked) {
          this.showBlockedMessage();
          throw new Error(SHEET_LOCK_ERROR_MESSAGE);
        }
      }

      if (commandInfo.id === RemoveColMutation.id) {
        const params = commandInfo.params as IRemoveColMutationParams;
        const unitLocks =
          this.lockedRanges[params.unitId]?.[params.subUnitId] || [];
        if (unitLocks.length === 0) return;

        let isBlocked = false;
        const { range } = params;

        const { startColumn, endColumn } = range;
        for (const lock of unitLocks) {
          const l = lock.range;
          if (startColumn <= l.endColumn && endColumn >= l.startColumn) {
            if (
              Array.isArray(lock.allowedRoles) &&
              !lock.allowedRoles.includes(store.currentUserRole)
            ) {
              isBlocked = true;
              break;
            }
          }
        }

        if (isBlocked) {
          this.showBlockedMessage();
          throw new Error(SHEET_LOCK_ERROR_MESSAGE);
        }
      }
    });
  }

  private showBlockedMessage = throttle(
    () => {
      const messageService = this._injector.get(IMessageService);
      const localeService = this._injector.get(LocaleService);
      messageService.show({
        type: MessageType.Error,
        content: localeService.t(
          'parker-vue-lab-plugins.sheet-lock.error.lockedBlocked'
        )
      });
    },
    500,
    { trailing: false }
  );
}
