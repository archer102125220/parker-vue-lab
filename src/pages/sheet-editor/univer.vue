<script lang="ts" setup>
import DefaultLayout from '@src/layouts/default.vue';
import UniverSheet from '@src/components/Univer/Sheet.vue';
</script>

<template>
  <DefaultLayout>
    <div class="univer_page">
      <UniverSheet />
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.univer_page {
  height: 90vh;
}
</style>
