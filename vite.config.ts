import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import VueRouter from 'unplugin-vue-router/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import mkcert from 'vite-plugin-mkcert';
import glsl from 'vite-plugin-glsl';
import autoprefixer from 'autoprefixer';
import postcssPxtorem from 'postcss-pxtorem';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

const isHttps = process.env['HTTPS'] === 'true';

const postcssPlugins: import('postcss').Plugin[] = [
  autoprefixer(),
  postcssPxtorem({
    rootValue: 16, // 1rem 對應的 px
    minPixelValue: 2
  }) as import('postcss').Plugin,
  // https://github.com/cuth/postcss-pxtorem/blob/master/index.js#L119C37-L119C37
  // https://juejin.cn/post/7033773414363955230#heading-3
  {
    postcssPlugin: 'postcss-zerorem',
    Declaration(decl: { value: string }) {
      if (/\+\s0\)/gi.test(decl.value)) {
        decl.value = decl.value.replace(/\+\s0\)/gi, '+ 0rem)');
      }
    }
  } as import('postcss').Plugin
];

// https://vite.dev/config
export default defineConfig(({ command, mode }) => {
  // command 的值會是 'serve' (開發環境) 或 'build' (生產環境打包)
  const isDev = command === 'serve';

  // 或者你也可以用 mode 來判斷預設環境
  // const isDev = mode === 'development'

  return {
    base: isDev ? '/' : '/parker-vue-lab/',
    server: {
      proxy: {
        '/universer-api': {
          target:
            process.env.VITE_UNIVERSER_DOCKER_HOST || 'http://localhost:8000',
          changeOrigin: true,
          ws: true,
          configure: (proxy, options) => {
            // 監聽代理請求發出
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(
                `[Proxy 觸發] 請求: ${req.method} ${req.url} 已轉發至 -> ${options.target}`
              );
            });

            // 監聽代理收到回應
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(
                `[Proxy 回應] 狀態碼: ${proxyRes.statusCode} - ${req.url}`
              );
            });

            // 監聽代理過程中的錯誤 (非常重要，有時候是轉發失敗而不是沒觸發)
            proxy.on('error', (err, _req, _res) => {
              console.error(`[Proxy 錯誤]`, err);
            });
          }
        }
      }
    },
    plugins: [
      isHttps ? mkcert() : undefined,
      glsl(),
      vue({
        template: {
          transformAssetUrls
        }
      }),
      vueJsx(),
      vueDevTools(),
      VueRouter({
        routesFolder: 'src/pages',
        dts: 'src/typed-router.d.ts'
      }),
      vuetify({ autoImport: true })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./', import.meta.url)),
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@src': fileURLToPath(new URL('./src', import.meta.url)),
        '~src': fileURLToPath(new URL('./src', import.meta.url)),
        '@public': fileURLToPath(new URL('./public', import.meta.url)),
        '~public': fileURLToPath(new URL('./public', import.meta.url))
      }
    },
    css: {
      postcss: {
        plugins: postcssPlugins
      },
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "@/src/assets/styles/variable.scss" as *; @use "@/src/assets/styles/mixin.scss" as *;'
        }
      }
    }
  };
});
