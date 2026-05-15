import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import zhTw from '../locales/zh-tw.json'

export const defaultLang = 'zh'
export const fallbackLocale = 'zh'

export const messages = {
  en,
  zh: zhTw
}

const i18n = createI18n({
  legacy: false, // Set to false to use Composition API
  locale: defaultLang,
  fallbackLocale: fallbackLocale,
  messages,
})

export default i18n
