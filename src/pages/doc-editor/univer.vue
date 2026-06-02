<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useUniverStore } from '@src/store/univer';

import DefaultLayout from '@src/layouts/default.vue';
import UniverDocEditor from '@src/components/Univer/DocEditor.vue';

const { locale } = useI18n();
const route = useRoute();
const univerStore = useUniverStore();
const isCollaboration = ref(true);

const unitId = ref('');
const inputUnitId = ref('');

watch(
  () => route.query.unitId,
  (newUnitId) => {
    unitId.value = (newUnitId || '') as string;
    inputUnitId.value = (newUnitId || '') as string;
  },
  { immediate: true }
);

const joinRoom = () => {
  unitId.value = inputUnitId.value;
};

const createRoom = async () => {
  try {
    const res = await fetch('/universer-api/snapshot/1/unit/-/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (data && data.unitID) {
      unitId.value = data.unitID;
      inputUnitId.value = data.unitID;
    } else {
      alert('無法建立房間：' + JSON.stringify(data));
    }
  } catch (error) {
    console.error('Create room error:', error);
    alert('建立房間失敗，請查看 Console。');
  }
};
</script>

<template>
  <DefaultLayout>
    <div class="univer_doc_page">
      <div class="univer_doc_page-remark">
        <p>💡 <b>鎖定狀態匯出說明：</b></p>
        <ul>
          <li>
            <b>Local Export (JSON Snapshot)：</b>
            可以保留鎖定狀態。自訂區域屬性會記錄於 Snapshot 中，重新載入 JSON
            後依然生效。
          </li>
          <li>
            <b>Server Export (DOCX/XLSX)：</b> 無法保留鎖定狀態。標準 Office
            格式不支援 Univer 自訂的區域鎖定機制，匯出的實體檔案將不含編輯限制。
          </li>
        </ul>
      </div>
      <div class="univer_doc_page-warning">
        <p>⚠️ <b>線上環境功能限制說明：</b></p>
        <ul>
          <li>
            <b>協同編輯：</b> 依賴後端 <code>universer</code> 服務進行 WebSocket
            訊息廣播，以及 <code>collaboration-server</code> 處理 OT
            (Operational Transformation) 演算法同步。
          </li>
          <li>
            <b>新建 / 加入房間：</b> 依賴
            <code>collaboration-helper</code> 服務生成與儲存檔案快照 (Snapshot
            API)。
          </li>
          <li>
            <b>實體檔案匯出 (DOCX)：</b> 若需在伺服器端轉換並匯出實體 Office
            檔案，需依賴高運算資源的 <code>exchange worker</code> 服務。
          </li>
          <li>
            若在線上環境中遇到功能失效或 API 報錯，通常是因為缺乏上述後端 Docker
            微服務所導致（例如 <code>/universer-api</code>），由於目前是 github
            static page 做上線部署，因此若要測試需自行 clone 專案到本地端串接
            univer docker 服務。
          </li>
        </ul>
      </div>
      <div class="univer_doc_page-tools">
        <div class="univer_doc_page-tools-role">
          <label for="role_select">當前測試身份：</label>
          <select
            id="role_select"
            v-model="univerStore.currentUserRole"
            class="univer_doc_page-tools-select"
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
        <div class="univer_doc_page-tools-online">
          <div class="univer_doc_page-tools-online-unit">
            <input
              type="text"
              class="univer_doc_page-tools-collaboration_room"
              placeholder="輸入房間 ID"
              v-model="inputUnitId"
              :disabled="isCollaboration === false"
              @keyup.enter="joinRoom"
            />
            <button
              class="univer_doc_page-tools-join_btn"
              :disabled="isCollaboration === false"
              @click="joinRoom"
            >
              加入
            </button>
          </div>
          <button
            class="univer_doc_page-tools-create_btn"
            :disabled="isCollaboration === false"
            @click="createRoom"
          >
            新建房間
          </button>
          <div class="univer_doc_page-tools-online-collaboration">
            <label for="collaboration_checkbox">協同編輯</label>
            <input
              id="collaboration_checkbox"
              type="checkbox"
              v-model="isCollaboration"
            />
          </div>
        </div>
      </div>
      <div v-if="!unitId && isCollaboration" class="univer_doc_page-empty">
        <p>目前沒有指定房間，請先「新建協同房間」以測試協同編輯功能。</p>
      </div>
      <UniverDocEditor
        v-else
        :key="unitId"
        class="univer_doc_page-editor"
        :locale="locale"
        :unit-id="unitId"
        :collaboration="isCollaboration"
      />
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.univer_doc_page {
  height: 90vh;

  &-remark {
    padding: 12px 16px;
    background-color: #fff3cd;
    color: #856404;
    border-bottom: 1px solid #ffeeba;
    font-size: 14px;
    line-height: 1.5;
    border-radius: 10px;
    margin-bottom: 16px;

    p {
      margin: 0 0 4px 0;
    }

    ul {
      margin: 0;
      padding-left: 20px;
    }
  }

  &-warning {
    @extend .univer_doc_page-remark;
    background-color: #f8d7da;
    color: #721c24;
    border-bottom-color: #f5c6cb;
  }

  &-tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    padding: 10px 16px;
    border-bottom: 1px solid #e9ecef;
    font-size: 14px;

    background-color: #f8f9fa;

    &-online {
      display: flex;
      align-items: center;
      gap: 12px;

      &-unit {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      &-collaboration {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    &-select {
      min-width: 150px;
      padding: 4px 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      background-color: #fff;
      outline: none;

      &:focus {
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }
    }

    &-collaboration_room {
      @extend .univer_doc_page-tools-select;
      min-width: unset;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }

    &-join_btn {
      padding: 4px 12px;
      border: 1px solid transparent;
      border-radius: 4px;
      background-color: #007bff;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      transition:
        background-color 0.2s,
        color 0.2s,
        border-color 0.2s;

      &:not([disabled]):hover {
        background-color: #0056b3;
      }
      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }

    &-create_btn {
      @extend .univer_doc_page-tools-join_btn;

      background-color: transparent;
      border-color: #007bff;
      color: #007bff;

      &:not([disabled]):hover {
        background-color: #007bff;
        color: #fff;
      }
    }
  }

  &-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100% - 50px);
    color: #6c757d;
    font-size: 16px;
    background-color: #fff;
  }
}
</style>
