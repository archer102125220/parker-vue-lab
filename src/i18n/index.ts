import { createI18n } from 'vue-i18n';
import { createRouter, STRATEGIES } from 'vue-i18n-routing';
import {
  type Router,
  type RouterHistory,
  type RouteRecordRaw
} from 'vue-router';

import en from '@src/locales/en.json';
import zhTw from '@src/locales/zh-tw.json';
import _merge from 'lodash/merge';

// Import Univer specific locales
import univerCustomEnUS from '@src/utils/third-party/univer/i18n/en-US';
import univerCustomZhTw from '@src/utils/third-party/univer/i18n/zh-TW';

export const defaultLang = 'zh';
export const fallbackLocale = 'zh';
export const locales = [
  { code: 'en', iso: 'en', name: 'English' },
  { code: 'zh', iso: 'zh', name: '繁體中文' }
];

export const messages = {
  en: _merge({}, en, univerCustomEnUS),
  zh: _merge({}, zhTw, univerCustomZhTw)
};

export const i18n = createI18n({
  legacy: false, // Set to false to use Composition API
  locale: defaultLang,
  fallbackLocale: fallbackLocale,
  messages
});

export function createI18nRouter(
  createVueRouter: unknown,
  { history, routes }: { history: RouterHistory; routes: RouteRecordRaw[] }
): Router {
  return createRouter(createVueRouter, {
    version: 4, // 指定 vue-router 版本
    locales: locales,
    defaultLocale: defaultLang,
    history,
    routes,
    strategy: STRATEGIES.PREFIX_AND_DEFAULT // 所有語系都加前綴，但預設語系額外保留無前綴版本。
  });
}

export default i18n;
