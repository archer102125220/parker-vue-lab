<template>
  <v-dialog
    :model-value="univerStore.isLockDialogVisible"
    max-width="400"
    @update:model-value="univerStore.cancelLock"
  >
    <v-card>
      <v-card-title class="text-h6 pb-2">
        {{ t('parker-vue-lab-plugins.doc-lock.title') || '設定區域鎖定權限' }}
      </v-card-title>
      
      <v-card-text class="pt-0">
        <p class="mb-4 text-body-2 text-medium-emphasis">
          請選擇允許編輯此區域的身份。若不勾選，則只有原作者可以編輯。
        </p>
        
        <v-checkbox
          v-for="role in univerStore.availableRoles"
          :key="role.value"
          v-model="selectedRoles"
          :label="role.label"
          :value="role.value"
          color="primary"
          density="compact"
          hide-details
          class="mb-2"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="univerStore.cancelLock"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="handleConfirm"
        >
          確認鎖定
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUniverStore } from '@src/store/univer';

const { t } = useI18n();
const univerStore = useUniverStore();

const selectedRoles = ref<string[]>([]);

// Reset selection when dialog opens
watch(() => univerStore.isLockDialogVisible, (isVisible) => {
  if (isVisible) {
    selectedRoles.value = [univerStore.currentUserRole];
  }
});

const handleConfirm = () => {
  univerStore.confirmLock(selectedRoles.value);
};
</script>

<style scoped lang="scss">
// Empty for now as Vuetify handles most styling
</style>
