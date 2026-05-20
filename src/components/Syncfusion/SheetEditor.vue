<script lang="ts" setup>
// https://help.syncfusion.com/document-processing/word/word-processor/vue/getting-started-vue-3
import { ref, watch, reactive, onMounted, onBeforeUnmount } from "vue";

import SkeletonLoader from "@src/components/SkeletonLoader.vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({});
const emits = defineEmits([]);

const container = ref<HTMLDivElement | null>(null);
const loading = ref(true);
</script>

<template>
  <div class="univer_sheet">
    <SkeletonLoader
      v-if="loading"
      :loading="true"
      class="univer_sheet-skeleton"
    />
    <!-- TODO -->
  </div>
</template>

<style lang="scss">
@import "@syncfusion/ej2-base/styles/material.css";
@import "@syncfusion/ej2-buttons/styles/material.css";
@import "@syncfusion/ej2-inputs/styles/material.css";
@import "@syncfusion/ej2-popups/styles/material.css";
@import "@syncfusion/ej2-lists/styles/material.css";
@import "@syncfusion/ej2-navigations/styles/material.css";
@import "@syncfusion/ej2-splitbuttons/styles/material.css";
@import "@syncfusion/ej2-dropdowns/styles/material.css";
@import "@syncfusion/ej2-vue-documenteditor/styles/material.css";
</style>

<style lang="scss" scoped>
.univer_sheet {
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
