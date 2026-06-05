import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';

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
import federation from '@originjs/vite-plugin-federation';
import dts from 'vite-plugin-dts';

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

  // 定義 Module Federation 要 expose 的模組
  const federationExposes = {
    './SkeletonLoader': '@src/components/SkeletonLoader.vue',
    './UniverDocEditor': '@src/components/Univer/DocEditor.vue',
    './UniverSheetEditor': '@src/components/Univer/SheetEditor.vue',
    './univer': '@src/utils/third-party/univer/index.ts',
    './univer/components': '@src/utils/third-party/univer/components.ts',
    './univer/i18n': '@src/utils/third-party/univer/i18n/index.ts',
    './univer/plugin': '@src/utils/third-party/univer/plugin/index.ts'
  };

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
      vuetify({ autoImport: true }),
      dts({
        tsconfigPath: './tsconfig.app.json',
        include: [
          'env.d.ts',
          ...Object.values(federationExposes).map((path) =>
            path.replace(/^@src\//, 'src/')
          )
        ],
        insertTypesEntry: true,
        bundleTypes: false,
        outDirs: 'dist/types'
      }),
      federation({
        filename: 'parker-vue-lab-federation.js',
        exposes: federationExposes,
        shared: [
          'vue',
          'vuetify',
          'vue-i18n',
          'pinia'
        ]
      }),
      {
        name: 'generate-federation-dts',
        closeBundle() {
          const dtsPath = fileURLToPath(
            new URL(
              './dist/types/parker-vue-lab-federation.d.ts',
              import.meta.url
            )
          );
          const lines = [];
          for (const [key, val] of Object.entries(federationExposes)) {
            const moduleName = `parker-vue-lab-federation/${key.replace(/^\.\//, '')}`;
            const dtsRelPath = val.replace(/^@src\//, './src/');
            lines.push(`declare module '${moduleName}' {`);
            lines.push(`  export * from '${dtsRelPath}';`);
            if (dtsRelPath.endsWith('.vue')) {
              lines.push(
                `  import { default as _default } from '${dtsRelPath}';`
              );
              lines.push(`  export default _default;`);
            }
            lines.push(`}`);
          }
          fs.mkdirSync(
            fileURLToPath(new URL('./dist/types', import.meta.url)),
            { recursive: true }
          );
          fs.writeFileSync(dtsPath, lines.join('\n'));
        }
      },
      {
        name: 'federation-fix',
        closeBundle() {
          const federationFilePath = fileURLToPath(
            new URL(
              './dist/assets/parker-vue-lab-federation.js',
              import.meta.url
            )
          );
          if (fs.existsSync(federationFilePath)) {
            let content = fs.readFileSync(federationFilePath, 'utf-8');
            // 將 e.forEach 替換為相容寫法，以解決 Vite 8 / Rolldown 產生的 string 無法 foreach 的問題
            content = content.replace(
              /e\.forEach/g,
              '(Array.isArray(e) ? e : [e]).forEach'
            );
            fs.writeFileSync(federationFilePath, content);
          }
        }
      }
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
