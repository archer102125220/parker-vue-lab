export default {
  'parker-vue-lab-plugins': {
    'csv-export': {
      title: '导出 CSV',
      tooltip: '导出 CSV'
    },
    'csv-import': {
      title: '导入 CSV',
      tooltip: '导入 CSV'
    },
    'server-export': {
      title: '通过服务器导出为标准文件',
      tooltip: '通过服务器导出为标准文件',
      info: '正在通过服务器导出文件，这可能需要几秒钟的时间，请稍候...',
      error: {
        snapshot: '未加载 UniverProExchangeClient，无法进行 Snapshot 转换',
        uploadFailed: '上传失败',
        uploadSnapshotFailed: '上传 Snapshot 失败',
        taskFailed: '调用导出任务失败，未获取 taskID',
        backendTaskFailed: '服务器导出任务执行失败: ',
        timeout: '导出任务超时',
        exportFailed: '导出发生错误：'
      }
    },
    'local-export': {
      title: '导出 Snapshot (JSON)',
      tooltip: '纯前端导出 Snapshot (JSON)',
      info: '正在导出 Snapshot JSON，请稍候...',
      error: {
        snapshot: '未加载 UniverProExchangeClient，无法进行 Snapshot 转换',
        exportFailed: '导出发生错误：'
      }
    },
    'local-import': {
      title: '本地导入',
      tooltip: '导入 DOCX/XLSX (本地)',
      tooltipDoc: '导入 DOCX (本地)',
      tooltipSheet: '导入 XLSX (本地)',
      info: '正在导入文件，请稍候...',
      success: '导入成功！',
      error: {
        unsupportedAll: '不支持的文件格式，请上传 DOCX 或 XLSX',
        unsupportedSheet: '不支持的文件格式，请上传 XLSX 文件',
        unsupportedDoc: '不支持的文件格式，请上传 DOCX 文件',
        importFailed: '导入失败：'
      }
    },
    'doc-lock': {
      title: '锁定选区',
      tooltip: '锁定选区',
      unlockTitle: '解除锁定选区',
      unlockTooltip: '解除锁定选区',
      error: {
        selectFirst: '请先选择要锁定的文字范围',
        selectFirstUnlock: '请先选择要解除锁定的文字范围',
        emptySelection: '选区不能为空',
        lockedBlocked: '此区域已锁定，无法编辑'
      },
      success: {
        locked: '已标记锁定范围：',
        unlocked: '已解除锁定范围：',
        noLockedRange: '选区内没有锁定的区块'
      }
    },
    'sheet-lock': {
      // title: '锁定选区 (Sheet)',
      title: '锁定选区',
      tooltip: '锁定选区',
      // unlockTitle: '解除锁定选区 (Sheet)',
      unlockTitle: '解除锁定选区',
      unlockTooltip: '解除锁定选区',
      unlockEntireTitle: '解除锁定选区 (整块)',
      unlockEntireTooltip: '解除与选区重叠的整块锁定区',
      error: {
        selectFirst: '请先选择要锁定的单元格范围',
        selectFirstUnlock: '请先选择要解除锁定的单元格范围',
        emptySelection: '选区不能为空',
        lockedBlocked: '此区域已锁定，无法编辑'
      },
      success: {
        locked: '已标记选区为锁定状态',
        unlocked: '已解除选区的锁定',
        noLockedRange: '选区内没有锁定的区块'
      }
    },
    'import-export-menu': {
      tooltip: '导入与导出选项'
    },
    'doc-lock-menu': {
      tooltip: '文档锁定选项'
    },
    'sheet-lock-menu': {
      tooltip: '表格锁定选项'
    }
  }
};
