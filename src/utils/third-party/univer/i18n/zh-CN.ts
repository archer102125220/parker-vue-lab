export default {
  'parker-vue-lab-plugins': {
    'csv-export': {
      title: '导出 CSV',
      tooltip: '导出 CSV',
    },
    'csv-import': {
      title: '导入 CSV',
      tooltip: '导入 CSV',
    },
    'local-export': {
      title: '导出文件',
      tooltip: '导出为本地文件',
      info: '正在导出文件，这可能需要几秒钟的时间，请稍候...',
      error: {
        snapshot: '未加载 UniverProExchangeClient，无法进行 Snapshot 转换',
        uploadFailed: '上传失败',
        uploadSnapshotFailed: '上传 Snapshot 失败',
        taskFailed: '调用导出任务失败，未获取 taskID',
        backendTaskFailed: '后端导出任务执行失败: ',
        timeout: '导出任务超时',
        exportFailed: '导出发生错误：',
      }
    },
    'local-import': {
      title: '本地导入',
      tooltip: '导入 DOCX/XLSX (本地)',
      info: '正在导入文件，请稍候...',
      success: '导入成功！',
      error: {
        unsupportedAll: '不支持的文件格式，请上传 DOCX 或 XLSX',
        unsupportedSheet: '不支持的文件格式，请上传 XLSX 文件',
        unsupportedDoc: '不支持的文件格式，请上传 DOCX 文件',
        importFailed: '导入失败：',
      }
    }
  }
};
