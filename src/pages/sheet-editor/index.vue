<script lang="ts" setup>
import { RouterLink } from "vue-router";
import defaultLayout from "@src/layouts/default.vue";
</script>

<template>
  <defaultLayout>
    <div class="sheet_editor_page">
      <RouterLink to="/sheet-editor/univer">univer</RouterLink>
      <RouterLink to="/sheet-editor/syncfusion">syncfusion</RouterLink>
      <!-- <RouterLink to="/sheet-editor/collabora">collabora</RouterLink> -->
    </div>
  </defaultLayout>
</template>

<style lang="scss" scoped>
.sheet_editor_page {
  display: flex;
  justify-content: center;
  align-items: center;
  // height: 100vh;
  gap: 20px;
}
</style>
