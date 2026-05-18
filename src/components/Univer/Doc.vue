<script lang="ts" setup>
import { ref, shallowReactive, onMounted, onBeforeUnmount } from 'vue';

import SkeletonLoader from '@src/components/SkeletonLoader.vue';

import { createDocInstance, type univerInstanceRef } from '@src/utils/third-party/univer';

defineOptions({
  inheritAttrs: false,
})

const container = ref<HTMLDivElement | null>(null);
const loading = ref(true);

const univerInstance = shallowReactive<univerInstanceRef>({
  univer: null,
  univerAPI: null
});

async function handleUniverDoc() {
  try {
    if (container.value instanceof HTMLElement === false) return;

    const { univer, univerAPI } = await createDocInstance(container.value);

    univerAPI.createUniverDoc({});

    univerInstance.univer = univer;
    univerInstance.univerAPI = univerAPI;
  } catch (error) {
    console.error(error);
  }

  loading.value = false;
}

onMounted(() => {
  handleUniverDoc();
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
  <div class="univer_docxs">
    <SkeletonLoader v-if="loading" :loading="true" class="univer_docxs-skeleton" />
    <div ref="container" class="univer_docxs-editor" />
  </div>
</template>

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
