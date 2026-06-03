declare global {
  interface Window {
    doubleTapInited?: boolean;
  }
}

// https://gist.github.com/ethanny2/44d5ad69970596e96e0b48139b89154b
export function doubleTap(doubleTapMs: number) {
  let timeout: NodeJS.Timeout,
    lastTap: number = 0;

  return function detectDoubleTap(event: MouseEvent | TouchEvent) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (0 < tapLength && tapLength < doubleTapMs) {
      event.preventDefault();
      const doubleTap = new CustomEvent('doubletap', {
        bubbles: true,
        detail: event
      });
      event.target?.dispatchEvent(doubleTap);
    } else {
      timeout = setTimeout(() => clearTimeout(timeout), doubleTapMs);
    }
    lastTap = currentTime;
  };
}

export function customDoubleTap(
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  func: Function,
  doubleTapMs: number = 200,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  defaultFunc: Function
) {
  let timeout: NodeJS.Timeout,
    lastTap = 0;

  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function detectDoubleTap(...args: any[]) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (0 < tapLength && tapLength < doubleTapMs) {
      // TODO
      // eslint-disable-next-line
      // @ts-ignore
      func.apply(this, args);
    } else {
      timeout = setTimeout(() => clearTimeout(timeout), doubleTapMs);
    }
    lastTap = currentTime;

    if (typeof defaultFunc === 'function') {
      // TODO
      // eslint-disable-next-line
      // @ts-ignore
      defaultFunc.apply(this, args);
    }
  };
}

export function initializeDoubleTap(doubleTapMs: number = 200): void {
  if (typeof window === 'undefined') return;
  if (window.doubleTapInited === true) return;

  // initialize the new event
  // document.addEventListener('pointerup', doubleTap(doubleTapMs));
  document.addEventListener('touchend', doubleTap(doubleTapMs));

  window.doubleTapInited = true;
}

export default initializeDoubleTap;
