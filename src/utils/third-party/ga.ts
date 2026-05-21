import { googleGtagInit } from '@src/utils/third-party/gtag';

export function googleGAInit(
  googleGAID: string = '',
  debug: boolean = import.meta.env?.DEV === true,
  log: boolean = false,
  callback?: (
    gtag: (...args: unknown[]) => void,
    gtm: (trackData?: Record<string, unknown>) => void,
    ...arg: unknown[]
  ) => void
): void {
  if (typeof googleGAID !== 'string' || googleGAID === '') {
    console.error('缺少google ga id');
    return;
  } else if (typeof document !== 'object' || document === null) {
    console.error('document API遺失');
    return;
  }

  function init(
    gtag: (...args: unknown[]) => void,
    gtm: (trackData?: Record<string, unknown>) => void,
    ...arg: unknown[]
  ) {
    if (typeof gtag === 'function') {
      gtag('js', new Date());
      gtag('config', googleGAID, {
        debug_mode: debug
      });
    }
    if (typeof callback === 'function') {
      callback(gtag, gtm, ...arg);
    }
  }
  googleGtagInit(log, init);

  const src = `https://www.googletagmanager.com/gtag/js?id=${googleGAID}`;

  const script = document.createElement('script');

  script.id = 'gaScript';
  script.setAttribute('id', 'gaScript');
  script.async = true;
  script.setAttribute('async', 'true');
  script.src = src;
  script.setAttribute('src', src);

  document.querySelector('head')?.append(script);
}

export default googleGAInit;
