<script lang="ts" setup>
// https://help.syncfusion.com/document-processing/excel/spreadsheet/vue/vue-3-getting-started
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";

import SkeletonLoader from "@src/components/SkeletonLoader.vue";
defineOptions({
  inheritAttrs: false,
});

const props = defineProps({});
const emits = defineEmits([]);

const container = ref<HTMLDivElement | null>(null);
const currentDoc = ref({});
const loading = ref(true);
</script>

<template>
  <div class="univer_docxs">
    <SkeletonLoader
      v-if="loading"
      :loading="true"
      class="univer_docxs-skeleton"
    />
  </div>
</template>

<style lang="scss">
@import "@syncfusion/ej2-base/styles/tailwind3.css";
@import "@syncfusion/ej2-buttons/styles/tailwind3.css";
@import "@syncfusion/ej2-dropdowns/styles/tailwind3.css";
@import "@syncfusion/ej2-inputs/styles/tailwind3.css";
@import "@syncfusion/ej2-navigations/styles/tailwind3.css";
@import "@syncfusion/ej2-popups/styles/tailwind3.css";
@import "@syncfusion/ej2-splitbuttons/styles/tailwind3.css";
@import "@syncfusion/ej2-grids/styles/tailwind3.css";
@import "@syncfusion/ej2-vue-spreadsheet/styles/tailwind3.css";
</style>

<style lang="scss" scoped>
.univer_docxs {
  position: relative;
  height: 100%;

  &-skeleton {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
  }

  &-editor {
    height: 100%;
  }
}
</style>
