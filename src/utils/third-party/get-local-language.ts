import { defaultLang } from '@src/i18n';
import { getCookie } from '@src/utils/helpers/get-cookie';

export function getLocalLanguage(defaultLanguag = defaultLang) {
  if (typeof window?.localStorage === 'object') {
    const usedLang = window.localStorage.getItem('usedLang');
    if (typeof usedLang === 'string' && usedLang !== '') {
      return usedLang;
    }
  }

  if (typeof window?.navigator?.languages === 'object') {
    // @ts-expect-error
    const _lang = window.navigator.userLanguage || window.navigator.language;
    const langArr = _lang.split('-');
    const lang =
      langArr[0] +
      (langArr.length >= 2 && langArr[0] !== 'en' && langArr[0] !== 'zh'
        ? '-' + langArr[1].toLocaleUpperCase()
        : langArr[0] !== 'zh'
          ? '-TW'
          : '');

    return lang;
  }
  const locale = getCookie('___i18n_locale', document.cookie);
  if (typeof locale === 'string' && locale !== '') {
    return locale;
  }
  return defaultLanguag;
}

export default getLocalLanguage;
