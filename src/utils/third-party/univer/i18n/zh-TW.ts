export default {
  'parker-vue-lab-plugins': {
    'csv-export': {
      title: '匯出 CSV',
      tooltip: '匯出 CSV',
    },
    'csv-import': {
      title: '匯入 CSV',
      tooltip: '匯入 CSV',
    },
    'server-export': {
      title: '匯出檔案 (Server)',
      tooltip: '透過伺服器匯出為標準檔案',
      info: '正在透過伺服器匯出文件，這可能需要幾秒鐘的時間，請稍候...',
      error: {
        snapshot: '未載入 UniverProExchangeClient，無法進行 Snapshot 轉換',
        uploadFailed: '上傳失敗',
        uploadSnapshotFailed: '上傳 Snapshot 失敗',
        taskFailed: '呼叫匯出任務失敗，未取得 taskID',
        backendTaskFailed: '伺服器匯出任務執行失敗: ',
        timeout: '匯出任務超時',
        exportFailed: '匯出發生錯誤：',
      }
    },
    'local-export': {
      title: '匯出 Snapshot',
      tooltip: '純前端匯出 Snapshot (JSON)',
      info: '正在匯出 Snapshot JSON，請稍候...',
      error: {
        snapshot: '未載入 UniverProExchangeClient，無法進行 Snapshot 轉換',
        exportFailed: '匯出發生錯誤：',
      }
    },
    'local-import': {
      title: '本地匯入',
      tooltip: '匯入 DOCX/XLSX (本地)',
      info: '正在匯入文件，請稍候...',
      success: '匯入成功！',
      error: {
        unsupportedAll: '不支援的檔案格式，請上傳 DOCX 或 XLSX',
        unsupportedSheet: '不支援的檔案格式，請上傳 XLSX 檔案',
        unsupportedDoc: '不支援的檔案格式，請上傳 DOCX 檔案',
        importFailed: '匯入失敗：',
      }
    },
    'doc-lock': {
      title: '鎖定選取範圍',
      tooltip: '鎖定選取範圍',
      unlockTitle: '解除鎖定選取範圍',
      unlockTooltip: '解除鎖定選取範圍',
      error: {
        selectFirst: '請先選擇要鎖定的文字範圍',
        selectFirstUnlock: '請先選擇要解除鎖定的文字範圍',
        emptySelection: '選取範圍不能為空',
        lockedBlocked: '此區域已鎖定，無法編輯',
      },
      success: {
        locked: '已標記鎖定範圍：',
        unlocked: '已解除鎖定範圍：',
        noLockedRange: '選取範圍內沒有鎖定的區塊',
      }
    }
  }
};
