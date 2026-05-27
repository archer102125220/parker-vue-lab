import { defineStore } from 'pinia';
import { ref, markRaw } from 'vue';

export interface LockPermissionParams {
  allowedRoles: string[];
}

export const useUniverStore = defineStore('univer', () => {
  // 用於測試的模擬當前使用者身份
  const currentUserRole = ref('admin');

  // 對話框中可供選擇的身份列表
  const availableRoles = ref([
    { label: 'Administrator', value: 'admin' },
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' }
  ]);

  // 對話框顯示狀態
  const isLockDialogVisible = ref(false);

  // 用於儲存鎖定指令的 Promise resolve 函數
  const resolveLockParams = ref<((value: LockPermissionParams | null) => void) | null>(null);

  /**
   * 開啟鎖定權限對話框，並回傳一個 Promise，
   * 該 Promise 會在使用者選擇權限後 resolve (若取消則回傳 null)。
   */
  const requestLockPermissions = (): Promise<LockPermissionParams | null> => {
    isLockDialogVisible.value = true;
    return new Promise((resolve) => {
      // 使用 markRaw 儲存原生 resolve 函數，避免被 Vue 代理 (Proxy) 導致異常
      resolveLockParams.value = markRaw(resolve);
    });
  };

  const confirmLock = (roles: string[]) => {
    if (resolveLockParams.value) {
      resolveLockParams.value({ allowedRoles: roles });
      resolveLockParams.value = null;
    }
    isLockDialogVisible.value = false;
  };

  const cancelLock = () => {
    if (resolveLockParams.value) {
      resolveLockParams.value(null);
      resolveLockParams.value = null;
    }
    isLockDialogVisible.value = false;
  };

  return {
    currentUserRole,
    availableRoles,
    isLockDialogVisible,
    requestLockPermissions,
    confirmLock,
    cancelLock
  };
});
