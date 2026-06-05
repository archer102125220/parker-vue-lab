import { Inject, Injector, Optional } from '@wendellhu/redi';
import { Plugin } from '@univerjs/core';
import { ILayoutService } from '@univerjs/ui';
import { IExchangeService } from '@univerjs-pro/exchange-client';

// 官方 @univerjs-pro/exchange-client 並未將 RequestState export 至入口點
// 為了程式碼的可讀性，我們在此處自行定義對應的 Enum 避免使用魔法數字 (magic numbers)
export enum RequestState {
  IDLE = 0,
  LOADING = 1,
  DONE = 2,
  ERROR = 3
}

export class UniverExchangeLifecyclePlugin extends Plugin {
  static override pluginName = 'exchange-lifecycle-plugin';

  constructor(
    _config: unknown, // Univer 會在第一個參數動態傳入 config 物件
    @Inject(Injector) protected override _injector: Injector,
    @Optional() @Inject(IExchangeService)
    private readonly exchangeService: IExchangeService,
    @Inject(ILayoutService) private readonly layoutService: ILayoutService
  ) {
    super();
  }

  override onStarting(): void {
    if (!this.exchangeService) return;

    this.exchangeService.requestState$.subscribe((state) => {
      // 由於 IExchangeService 的狀態依賴未匯出的原始 RequestState Enum，
      // 導致 TS 認為原生的 state 屬性與我們自定義的 RequestState Enum 類型不重疊，
      // 依照 AGENTS.md 規範，這裡使用 as unknown as RequestState 來進行安全轉型處理。
      const currentState = state.state as unknown as RequestState;

      if (currentState === RequestState.LOADING) {
        const startEvent = new CustomEvent('univer-exchange-started', {
          bubbles: true
        });
        if (this.layoutService.rootContainerElement) {
          this.layoutService.rootContainerElement.dispatchEvent(startEvent);
        } else {
          document.dispatchEvent(startEvent);
        }
      } else if (
        currentState === RequestState.DONE ||
        currentState === RequestState.ERROR
      ) {
        const endEvent = new CustomEvent('univer-exchange-ended', {
          bubbles: true
        });
        if (this.layoutService.rootContainerElement) {
          this.layoutService.rootContainerElement.dispatchEvent(endEvent);
        } else {
          document.dispatchEvent(endEvent);
        }
      }

      if (currentState === RequestState.ERROR) {
        const errEvent = new CustomEvent('univer-exchange-error', {
          bubbles: true
        });
        if (this.layoutService.rootContainerElement) {
          this.layoutService.rootContainerElement.dispatchEvent(errEvent);
        } else {
          document.dispatchEvent(errEvent);
        }
      }
    });
  }
}
