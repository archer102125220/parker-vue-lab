<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import DefaultLayout from '@src/layouts/default.vue';
import UniverDoc from '@src/components/Univer/Doc.vue';

const { locale } = useI18n();
</script>

<template>
  <DefaultLayout>
    <div class="univer_page">
      <UniverDoc :locale="locale" />
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.univer_page {
  height: 90vh;
}
</style>
