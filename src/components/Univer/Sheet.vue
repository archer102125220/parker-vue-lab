<script lang="ts" setup>
import { ref, shallowReactive, onMounted, onBeforeUnmount } from 'vue';

import { createSheetInstance, type univerInstanceRef } from '@src/utils/third-party/univer/create-sheet';

defineOptions({
  inheritAttrs: false,
})

const container = ref<HTMLDivElement | null>(null);

const univerInstance = shallowReactive<univerInstanceRef>({
  univer: null,
  univerAPI: null
});

async function handleUniverSheet() {
  try {
    if (container.value instanceof HTMLElement === false) return;

    const { univer, univerAPI } = await createSheetInstance(container.value);

    univerAPI.createWorkbook({});

    univerInstance.univer = univer;
    univerInstance.univerAPI = univerAPI;
  } catch (error) {
    console.error(error);
  }
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
  <div ref="container" class="univer_sheet" />
</template>

<style lang="scss" scoped>
.univer_sheet {
  height: 100%;
}
</style>
