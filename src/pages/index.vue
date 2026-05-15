<script setup lang="ts">
import { RouterLink } from 'vue-router';
// 首頁
</script>

<template>
  <div class="index_page">
    <h1>Welcome to Parker Vue Lab</h1>
    <p>This is an auto-generated route matching Nuxt's pages/ structure.</p>
    <div class="index_page-nav">
      <RouterLink to="/sheet-editor">sheet-editor</RouterLink>
      <RouterLink to="/docs-editor">docs-editor</RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.index_page {
  width: 100vw;
  min-height: 90vh;
  padding: 2rem;

  &-nav {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }
}
</style>
