<script lang="ts" setup>
import DefaultLayout from '@src/layouts/default.vue';
import UniverDoc from '@src/components/Univer/Doc.vue';
</script>

<template>
  <DefaultLayout>
    <div class="univer_page">
      <UniverDoc />
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.univer_page {
  height: 90vh;
}
</style>
