<script lang="ts" setup>
import { computed, watchEffect } from 'vue';
import { useSystemStore } from '@src/store/system';
import { useI18n } from 'vue-i18n';
import DialogModal from '@src/components/DialogModal/index.vue';

const systemStore = useSystemStore();
const dialogSettings = computed(() => systemStore.dialog || {});

const { locale } = useI18n();
watchEffect(() => {
  document.documentElement.lang = locale.value;
});
</script>

<template>
  <router-view />

  <DialogModal
    :value="dialogSettings.trigger"
    :width="dialogSettings.width"
    :content="dialogSettings.content"
    :bg-color="dialogSettings.bgColor"
    :radius="dialogSettings.radius"
    :content-class="dialogSettings.contentClass"
    :content-props="dialogSettings.contentProps"
    :dialog-props="dialogSettings.dialogProps"
    :broswer-info="systemStore.broswerInfo"
    @handle-trigger="systemStore.setDialog"
  />
</template>

<style lang="scss" scoped></style>
