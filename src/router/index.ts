import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw
} from 'vue-router';

import { routes } from 'vue-router/auto-routes';
import i18n, { createI18nRouter, defaultLang } from '@src/i18n';

const router = createI18nRouter(createRouter, {
  history: createWebHistory(import.meta.env.BASE_URL),
  // 如果不使用 unplugin-vue-router，手動設定路由的方式如下：
  // routes: [
  //   {
  //     path: '/',
  //     name: 'home',
  //     component: () => import('@src/pages/index.vue')
  //   },
  //   {
  //     path: '/about',
  //     name: 'about',
  //     component: () => import('@src/pages/about.vue')
  //   },
  //   // 巢狀路由 (Nested Routes) 範例：讓具有相同前綴的路由 (如 /admin) 寫在一起
  //   {
  //     path: '/admin',
  //     component: () => import('@src/layouts/AdminLayout.vue'), // 通常這會是一個包含 <router-view> 的外層 Layout
  //     children: [
  //       {
  //         path: '', // 對應到 /admin
  //         name: 'admin-dashboard',
  //         component: () => import('@src/pages/admin/index.vue')
  //       },
  //       {
  //         path: 'users', // 對應到 /admin/users (注意：這裡的 path 不加斜線 `/`)
  //         name: 'admin-users',
  //         component: () => import('@src/pages/admin/users.vue')
  //       }
  //     ]
  //   }
  // ] as RouteRecordRaw[]
  routes: routes as RouteRecordRaw[]
});

router.beforeEach((to, from, next) => {
  // 從 URL 參數取得 locale，若無則使用預設語系
  const params = to.params as unknown as Record<string, string | string[]>;
  const locale = (params.locale as string) || defaultLang;

  // 同步更新 vue-i18n 的語系設定
  if (i18n.global.locale.value !== locale) {
    i18n.global.locale.value = locale as unknown as 'zh' | 'en';
  }

  next();
});

export default router;
