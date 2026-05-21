import type { App } from "vue";

import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";
// import { VInfiniteScroll } from 'vuetify/labs/VInfiniteScroll';
// import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader';
// import enUS from 'date-fns/locale/en-US';
// import zhTW from 'date-fns/locale/zh-TW';
import "@mdi/font/css/materialdesignicons.css";
// import 'vuetify/styles';

import { useI18n } from "vue-i18n";

import i18n from "@src/i18n";

// https://nuxt.com/docs/migration/plugins-and-middleware#plugins-and-middleware
export default (vueApp: App) => {
  const vuetify = createVuetify({
    ssr: false,
    icons: {
      defaultSet: "mdi",
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: "myCustomLightTheme",
      themes: {
        myCustomLightTheme: {
          dark: false,
          colors: {
            primary: "#44A08D", // Green gradient primary color
            secondary: "#4ECDC4", // Green gradient secondary color
          },
        },
        gray: {
          dark: false,
          colors: {
            surface: "#edeff3",
          },
        },
      },
    },
    locale: {
      adapter: createVueI18nAdapter({
        i18n,
        useI18n,
      }),
    },
    // components: {
    //   // VInfiniteScroll,
    //   // VSkeletonLoader,
    // },
  });

  vueApp.use(vuetify);
};
