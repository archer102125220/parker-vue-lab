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
    'local-export': {
      title: '匯出檔案',
      tooltip: '匯出為本地檔案',
      info: '正在匯出文件，這可能需要幾秒鐘的時間，請稍候...',
      error: {
        snapshot: '未載入 UniverProExchangeClient，無法進行 Snapshot 轉換',
        uploadFailed: '上傳失敗',
        uploadSnapshotFailed: '上傳 Snapshot 失敗',
        taskFailed: '呼叫匯出任務失敗，未取得 taskID',
        backendTaskFailed: '後端匯出任務執行失敗: ',
        timeout: '匯出任務超時',
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
    }
  }
};
