import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import i18n, { defaultLang } from '../i18n'

// 動態在所有的頂層路由前加上 optional 的 locale 參數
function addLocalePrefix(routes: readonly RouteRecordRaw[]) {
  return routes.map((route) => {
    return {
      ...route,
      // 若原本路徑是 '/' 則變成 '/:locale(zh|en)?'
      // 若原本路徑是 '/about' 則變成 '/:locale(zh|en)?/about'
      path: `/:locale(zh|en)?${route.path === '/' ? '' : route.path}`
    }
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: addLocalePrefix(routes),
})

router.beforeEach((to, from, next) => {
  // 從 URL 參數取得 locale，若無則使用預設語系
  const params = to.params as unknown as Record<string, string | string[]>
  const locale = (params.locale as string) || defaultLang

  // 同步更新 vue-i18n 的語系設定
  if (i18n.global.locale.value !== locale) {
    i18n.global.locale.value = locale as unknown as 'zh' | 'en'
  }

  next()
})

export default router
