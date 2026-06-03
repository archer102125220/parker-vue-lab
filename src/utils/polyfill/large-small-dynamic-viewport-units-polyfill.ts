// https://github.com/joppuyo/large-small-dynamic-viewport-units-polyfill/blob/master/src/index.js
import _throttle from 'lodash/throttle';

interface viewportUnits {
  svh: string;
  svw: string;
  dvh: string;
  dvw: string;
  lvh: string;
  lvw: string;
}
export function getViewportUnits(): viewportUnits {
  const output: viewportUnits = {
    svh: '',
    svw: '',
    dvh: '',
    dvw: '',
    lvh: '',
    lvw: ''
  };

  // SSR support
  if (typeof window === 'undefined') {
    return output;
  }

  if (window.CSS.supports('height: 100svh') === false) {
    const svh = document.documentElement.clientHeight * 0.01;
    // document.documentElement.style.setProperty('--1svh', svh + 'px');
    output.svh = svh + 'px';

    const svw = document.documentElement.clientWidth * 0.01;
    // document.documentElement.style.setProperty('--1svw', svw + 'px');
    output.svw = svw + 'px';
  }

  if (window.CSS.supports('height: 100dvh') === false) {
    const dvh = window.innerHeight * 0.01;
    // document.documentElement.style.setProperty('--1dvh', dvh + 'px');
    output.dvh = dvh + 'px';

    const dvw = window.innerHeight * 0.01;
    // document.documentElement.style.setProperty('--1dvw', dvw + 'px');
    output.dvw = dvw + 'px';
  }

  if (window.CSS.supports('height: 100lvh') === false && document.body) {
    const fixed: HTMLDivElement = document.createElement('div');
    fixed.style.width = '1px';
    fixed.style.height = '100vh';
    fixed.style.position = 'fixed';
    fixed.style.left = '0';
    fixed.style.top = '0';
    fixed.style.bottom = '0';
    fixed.style.visibility = 'hidden';

    document.body.appendChild(fixed);

    const fixedHeight: number = fixed.clientHeight;
    const fixedWidth: number = fixed.clientWidth;

    fixed.remove();

    const lvh: number = fixedHeight * 0.01;
    const lvw: number = fixedWidth * 0.01;

    // document.documentElement.style.setProperty('--1lvh', lvh + 'px');
    // document.documentElement.style.setProperty('--1lvw', lvw + 'px');
    output.lvh = lvh + 'px';
    output.lvw = lvw + 'px';
  }

  return output;
}

export function setViewportUnits(): void {
  const viewportUnits: viewportUnits = getViewportUnits();

  document.documentElement.style.setProperty('--1svh', viewportUnits.svh);
  document.documentElement.style.setProperty('--1svw', viewportUnits.svw);
  document.documentElement.style.setProperty('--1dvh', viewportUnits.dvh);
  document.documentElement.style.setProperty('--1lvh', viewportUnits.lvh);
  document.documentElement.style.setProperty('--1lvw', viewportUnits.lvw);
}

export function isMobile(): boolean {
  if (
    // SSR support
    typeof window !== 'undefined' &&
    (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.userAgent.match(/Mac/) &&
        navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2))
  ) {
    return true;
  }
  return false;
}

export function initialize(isThrottle = true): void {
  // SSR support
  if (typeof window === 'undefined') {
    return;
  }

  // Don't run polyfill if browser supports the units natively
  if (
    'CSS' in window &&
    'supports' in window.CSS &&
    window.CSS.supports('height: 100svh') === true &&
    window.CSS.supports('height: 100dvh') === true &&
    window.CSS.supports('height: 100lvh') === true
  ) {
    return;
  }

  let dvhPolyfill: string = '';
  let svhPolyfill: string = '';
  let lvhPolyfill: string = '';
  if (
    typeof document?.documentElement?.style?.getPropertyValue === 'function'
  ) {
    dvhPolyfill = document.documentElement.style.getPropertyValue('--1dvh');
    svhPolyfill = document.documentElement.style.getPropertyValue('--1svh');
    lvhPolyfill = document.documentElement.style.getPropertyValue('--1lvh');
  }
  if (dvhPolyfill !== '' || svhPolyfill !== '' || lvhPolyfill !== '') {
    return;
  }

  // Don't run on desktop browsers
  if (!isMobile) {
    return;
  }

  // We run the calculation as soon as possible (eg. the script is in document head)
  setViewportUnits();

  // We run the calculation again when DOM has loaded
  document.addEventListener('DOMContentLoaded', function () {
    setViewportUnits();
  });

  // We run the calculation when window is resized
  window.addEventListener(
    'resize',
    isThrottle === true ? _throttle(setViewportUnits, 500) : setViewportUnits
  );
}

export default initialize;
