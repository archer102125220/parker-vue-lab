<script lang="ts" setup>
import LayoutHeader from '@src/components/Layout/Header.vue';
import LayoutFooter from '@src/components/Layout/Footer.vue';
</script>

<template>
  <div class="defalut_layout">
    <LayoutHeader />
    <main class="defalut_layout-content">
      <slot />
    </main>
    <LayoutFooter />
  </div>
</template>

<style lang="scss" scoped>
.defalut_layout {
  display: flex;
  flex-direction: column;

  min-height: 100dvh;

  &-content {
    // Display & Box Model
    flex: 1;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;

    // Visual
    background: transparent;
  }
}
</style>
