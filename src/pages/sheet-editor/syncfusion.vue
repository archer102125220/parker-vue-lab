<script lang="ts" setup>
import DefaultLayout from '@src/layouts/default.vue';
import SyncfusionSheetEditor from '@src/components/Syncfusion/SheetEditor.vue';
</script>

<template>
  <DefaultLayout>
    <div class="syncfusion_sheet_page">
      <p>syncfusion sheet editor</p>
      <!-- @syncfusion/ej2-vue-spreadsheet -->
      <SyncfusionSheetEditor />
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.syncfusion_sheet_page {
  height: 90vh;
}
</style>
