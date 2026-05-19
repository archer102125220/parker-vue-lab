<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import DefaultLayout from '@src/layouts/default.vue';
import UniverSheet from '@src/components/Univer/Sheet.vue';

const { locale } = useI18n();
</script>

<template>
  <DefaultLayout>
    <div class="univer_page">
      <UniverSheet :locale="locale" />
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.univer_page {
  height: 90vh;
}
</style>
