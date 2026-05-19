<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import DefaultLayout from '@src/layouts/default.vue';
import UniverDocEditor from '@src/components/Univer/DocEditor.vue';

const { locale } = useI18n();
</script>

<template>
  <DefaultLayout>
    <div class="univer_doc_page">
      <UniverDocEditor :locale="locale" />
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.univer_doc_page {
  height: 90vh;
}
</style>
