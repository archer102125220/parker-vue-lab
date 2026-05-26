<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import DefaultLayout from '@src/layouts/default.vue';
import UniverSheetEditor from '@src/components/Univer/SheetEditor.vue';

const { locale } = useI18n();
const route = useRoute();

const unitId = computed(() => route.query.unit as string | undefined);
</script>

<template>
  <DefaultLayout>
    <div class="univer_sheet_page">
      <UniverSheetEditor :locale="locale" :unit-id="unitId" />
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.univer_sheet_page {
  height: 90vh;
}
</style>
