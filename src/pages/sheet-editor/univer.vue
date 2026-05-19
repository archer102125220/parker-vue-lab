<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import DefaultLayout from '@src/layouts/default.vue';
import UniverSheetEditor from '@src/components/Univer/SheetEditor.vue';

const { locale } = useI18n();
</script>

<template>
  <DefaultLayout>
    <div class="univer_sheet_page">
      <UniverSheetEditor :locale="locale" />
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.univer_sheet_page {
  height: 90vh;
}
</style>
