<script lang="ts" setup>
import LayoutHeader from '@src/components/Layout/Header.vue';
import LayoutFooter from '@src/components/Layout/Footer.vue';
</script>

<template>
  <div class="home_layout">
    <LayoutHeader :has-back="false" />
    <main class="home_layout-content">
      <slot />
    </main>
    <LayoutFooter />
  </div>
</template>

<style lang="scss" scoped>
.home_layout {
  display: flex;
  flex-direction: column;

  min-height: 100dvh;

  &-content {
    flex: 1;
    // min-height: 100vh;
    width: 90%;
    margin: auto;
    padding: 8px;

    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style>
