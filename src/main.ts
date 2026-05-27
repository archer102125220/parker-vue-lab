import '@src/assets/styles/global.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from '@src/App.vue';
import router from '@src/router';
import i18n from '@src/i18n';

import vuetify from '@src/plugins/vuetify';
import pdfReader from '@src/plugins/vue-pdfjs-dist';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(i18n);
app.use(router);
app.use(vuetify);
app.use(pdfReader);

app.mount('#app');

