<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useUniverStore } from '@src/store/univer';

import DefaultLayout from '@src/layouts/default.vue';
import UniverSheetEditor from '@src/components/Univer/SheetEditor.vue';

const { locale } = useI18n();
const route = useRoute();
const univerStore = useUniverStore();
const isCollaboration = ref(true);
const isLiveShare = ref(false);

const unitId = computed(() => route.query.unit as string | undefined);
</script>

<template>
  <DefaultLayout>
    <div class="univer_sheet_page">
      <div class="univer_sheet_page-tools">
        <div class="univer_sheet_page-tools-role">
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
        <div class="univer_sheet_page-tools-online">
          <div class="univer_sheet_page-tools-online-collaboration">
            <label for="collaboration_checkbox">協同編輯</label>
            <input
              id="collaboration_checkbox"
              type="checkbox"
              v-model="isCollaboration"
            />
          </div>
          <div class="univer_sheet_page-tools-online-live_share">
            <label for="live_share_checkbox">演示跟隨</label>
            <input
              id="live_share_checkbox"
              type="checkbox"
              v-model="isLiveShare"
              :disabled="isCollaboration === false"
            />
          </div>
        </div>
      </div>
      <UniverSheetEditor
        :locale="locale"
        :unit-id="unitId"
        :collaboration="isCollaboration"
        :live-share="isCollaboration && isLiveShare"
      />
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.univer_sheet_page {
  height: 90vh;

  &-tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    padding: 10px 16px;
    border-bottom: 1px solid #e9ecef;
    font-size: 14px;

    background-color: #f8f9fa;

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
