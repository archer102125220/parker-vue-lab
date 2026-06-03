declare global {
  interface Window {
    polyfillScrollEnd?: boolean;
  }
}

export function handleBindScrollEnd(
  el: HTMLElement | Window,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  handler: Function,
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
    // TODO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleScrollEnd(event: Event, ...arg: any[]): void {
      setTimeout(() => handler(event, ...arg), wait);
    }
    el.addEventListener('scrollend', handleScrollEnd);
    return () => el.removeEventListener('scrollend', handleScrollEnd);
  }

  let setTimeoutTimer: NodeJS.Timeout | number = 0;
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function polyfillScrollEnd(event: Event, ...arg: any[]) {
    if (setTimeoutTimer !== 0) {
      clearTimeout(setTimeoutTimer);
      setTimeoutTimer = 0;
    }

    setTimeoutTimer = setTimeout(() => {
      setTimeoutTimer = 0;
      handler(event, ...arg);
    }, wait);
  }
  el.addEventListener('scroll', polyfillScrollEnd);

  return () => el.removeEventListener('scroll', polyfillScrollEnd);
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
