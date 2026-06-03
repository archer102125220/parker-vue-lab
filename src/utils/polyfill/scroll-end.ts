declare global {
  interface Window {
    polyfillScrollEnd?: boolean;
  }
}

export function handleBindScrollEnd<Args extends unknown[]>(
  el: HTMLElement | Window,
  handler: (event: Event, ...args: Args) => void,
  wait: number = 100
) {
  if (typeof el?.addEventListener !== 'function') {
    console.error('missing scroll end element');
    return null;
  }
  if (typeof handler !== 'function') {
    console.error('missing scroll end handler');
    return null;
  }

  const _el: HTMLElement | Window = el;
  if ('onscrollend' in _el) {
    function handleScrollEnd(event: Event, ...arg: Args): void {
      setTimeout(() => handler(event, ...arg), wait);
    }
    // 使用 as unknown as EventListener 斷言以兼容原生 addEventListener 只接受一個參數的介面
    el.addEventListener('scrollend', handleScrollEnd as unknown as EventListener);
    return () => el.removeEventListener('scrollend', handleScrollEnd as unknown as EventListener);
  }

  let setTimeoutTimer: NodeJS.Timeout | number = 0;
  function polyfillScrollEnd(event: Event, ...arg: Args) {
    if (setTimeoutTimer !== 0) {
      clearTimeout(setTimeoutTimer);
      setTimeoutTimer = 0;
    }

    setTimeoutTimer = setTimeout(() => {
      setTimeoutTimer = 0;
      handler(event, ...arg);
    }, wait);
  }
  el.addEventListener('scroll', polyfillScrollEnd as unknown as EventListener);

  return () => el.removeEventListener('scroll', polyfillScrollEnd as unknown as EventListener);
}

export function createScrollEndEvent(wait: number = 100) {
  let setTimeoutTimer: NodeJS.Timeout | number = 0;

  return function detectScrollEnd(event: Event) {
    if (setTimeoutTimer !== 0) {
      clearTimeout(setTimeoutTimer);
      setTimeoutTimer = 0;
    }

    setTimeoutTimer = setTimeout(() => {
      const scrollEnd = new CustomEvent('scrollend', {
        bubbles: true,
        detail: event
      });
      event.target?.dispatchEvent(scrollEnd);
    }, wait);
  };
}

export function handlePolyfillScrollEnd(wait: number = 100) {
  if (typeof window === 'undefined') return;
  // console.log('handlePolyfillScrollEnd');
  if ('onscrollend' in window && window.polyfillScrollEnd === true) return;

  document.addEventListener('scroll', createScrollEndEvent(wait));

  window.polyfillScrollEnd = true;
}
export default handleBindScrollEnd;
