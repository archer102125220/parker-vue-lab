<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import DefaultLayout from '@src/layouts/default.vue';
</script>

<template>
  <DefaultLayout>
    <div class="docs_editor_page">
      <RouterLink to="/doc-editor/univer">univer</RouterLink>
      <RouterLink to="/doc-editor/syncfusion">syncfusion</RouterLink>
      <RouterLink to="/doc-editor/tiptap">tiptap</RouterLink>
      <!-- <RouterLink to="/docxs-editor/collabora">collabora</RouterLink> -->
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.docs_editor_page {
  display: flex;
  justify-content: center;
  align-items: center;
  // height: 100vh;
  gap: 20px;
}
</style>
