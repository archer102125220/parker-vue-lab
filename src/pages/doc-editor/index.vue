<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import defaultLayout from '@src/layouts/default.vue';
</script>

<template>
  <defaultLayout>
    <div class="docs_editor_page">
      <RouterLink to="/doc-editor/univer">univer</RouterLink>
      <!-- <RouterLink to="/docxs-editor/collabora">collabora</RouterLink> -->
    </div>
  </defaultLayout>
</template>

<style lang="scss" scoped>
.docs_editor_page {}
</style>
