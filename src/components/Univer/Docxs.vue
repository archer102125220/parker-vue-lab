<script lang="ts" setup>
import { ref, shallowReactive, onMounted, onBeforeUnmount } from 'vue';

import SkeletonLoader from '@src/components/SkeletonLoader.vue';

import { createSheetInstance, type univerInstanceRef } from '@src/utils/third-party/univer';

defineOptions({
  inheritAttrs: false,
})

const container = ref<HTMLDivElement | null>(null);
const loading = ref(true);

const univerInstance = shallowReactive<univerInstanceRef>({
  univer: null,
  univerAPI: null
});

async function handleUniverSheet() {
  try {
    if (container.value instanceof HTMLElement === false) return;

    const { univer, univerAPI } = await createSheetInstance(container.value);

    univerAPI.createUniverDoc({});

    univerInstance.univer = univer;
    univerInstance.univerAPI = univerAPI;
  } catch (error) {
    console.error(error);
  }

  loading.value = false;
}

onMounted(() => {
  handleUniverSheet();
});

onBeforeUnmount(() => {
  if (typeof univerInstance.univer?.dispose === 'function') {
    univerInstance.univer?.dispose();
  }
  if (typeof univerInstance.univerAPI?.dispose === 'function') {
    univerInstance.univerAPI?.dispose();
  }
  univerInstance.univer = null;
  univerInstance.univerAPI = null;
});
</script>

<template>
  <div class="univer_sheet">
    <SkeletonLoader v-if="loading" :loading="true" class="univer_sheet-skeleton" />
    <div ref="container" class="univer_sheet-editor" />
  </div>
</template>

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
