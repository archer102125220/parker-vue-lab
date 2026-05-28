export default {
  'parker-vue-lab-plugins': {
    'csv-export': {
      title: 'Export CSV',
      tooltip: 'Export CSV'
    },
    'csv-import': {
      title: 'Import CSV',
      tooltip: 'Import CSV'
    },
    'server-export': {
      title: 'Export as Standard File via Server',
      tooltip: 'Export as Standard File via Server',
      info: 'Exporting document via server, this may take a few seconds, please wait...',
      error: {
        snapshot:
          'UniverProExchangeClient is not loaded, unable to convert Snapshot',
        uploadFailed: 'Upload failed',
        uploadSnapshotFailed: 'Failed to upload Snapshot',
        taskFailed: 'Failed to call export task, taskID not obtained',
        backendTaskFailed: 'Server export task failed: ',
        timeout: 'Export task timeout',
        exportFailed: 'Error during export: '
      }
    },
    'local-export': {
      title: 'Export Snapshot',
      tooltip: 'Pure Frontend Export Snapshot (JSON)',
      info: 'Exporting Snapshot JSON, please wait...',
      error: {
        snapshot:
          'UniverProExchangeClient is not loaded, unable to convert Snapshot',
        exportFailed: 'Error during export: '
      }
    },
    'local-import': {
      title: 'Local Import',
      tooltip: 'Import DOCX/XLSX (Local)',
      tooltipDoc: 'Import DOCX (Local)',
      tooltipSheet: 'Import XLSX (Local)',
      info: 'Importing document, please wait...',
      success: 'Import successful!',
      error: {
        unsupportedAll: 'Unsupported file format, please upload DOCX or XLSX',
        unsupportedSheet: 'Unsupported file format, please upload XLSX file',
        unsupportedDoc: 'Unsupported file format, please upload DOCX file',
        importFailed: 'Import failed: '
      }
    },
    'doc-lock': {
      title: 'Lock Selection',
      tooltip: 'Lock Selection',
      unlockTitle: 'Unlock Selection',
      unlockTooltip: 'Unlock Selection',
      error: {
        selectFirst: 'Please select a text range to lock first',
        selectFirstUnlock: 'Please select a text range to unlock first',
        emptySelection: 'Selection cannot be empty',
        lockedBlocked: 'This area is locked and cannot be edited'
      },
      success: {
        locked: 'Marked range as locked: ',
        unlocked: 'Unlocked range: ',
        noLockedRange: 'No locked blocks in the selection'
      }
    },
    'sheet-lock': {
      title: 'Lock Selection (Sheet)',
      tooltip: 'Lock Selection',
      unlockTitle: 'Unlock Selection (Sheet)',
      unlockTooltip: 'Unlock Selection',
      error: {
        selectFirst: 'Please select a cell range to lock first',
        selectFirstUnlock: 'Please select a cell range to unlock first',
        emptySelection: 'Selection cannot be empty',
        lockedBlocked: 'This area is locked and cannot be edited'
      },
      success: {
        locked: 'Marked selection as locked',
        unlocked: 'Unlocked selection',
        noLockedRange: 'No locked blocks in the selection'
      }
    },
    'import-export-menu': {
      tooltip: 'Import and Export options'
    }
  }
};
