<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useUniverStore } from '@src/store/univer';

import DefaultLayout from '@src/layouts/default.vue';
import UniverSheetEditor from '@src/components/Univer/SheetEditor.vue';

const { locale } = useI18n();
const route = useRoute();
const univerStore = useUniverStore();

const unitId = computed(() => route.query.unit as string | undefined);
</script>

<template>
  <DefaultLayout>
    <div class="univer_sheet_page">
      <div class="univer_sheet_page-tools">
        <label for="role_select">當前測試身份：</label>
        <select
          id="role_select"
          v-model="univerStore.currentUserRole"
          class="univer_sheet_page-tools-select"
        >
          <option
            v-for="role in univerStore.availableRoles"
            :key="role.value"
            :value="role.value"
          >
            {{ role.label }} ({{ role.value }})
          </option>
        </select>
      </div>
      <UniverSheetEditor :locale="locale" :unit-id="unitId" />
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.univer_sheet_page {
  height: 90vh;

  &-tools {
    padding: 10px 16px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;

    &-select {
      padding: 4px 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      background-color: #fff;
      min-width: 150px;
      outline: none;

      &:focus {
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }
    }
  }
}
</style>
