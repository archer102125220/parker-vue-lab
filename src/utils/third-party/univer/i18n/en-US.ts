export default {
  'parker-vue-lab-plugins': {
    'csv-export': {
      title: 'Export CSV',
      tooltip: 'Export CSV',
    },
    'csv-import': {
      title: 'Import CSV',
      tooltip: 'Import CSV',
    },
    'local-export': {
      title: 'Export File',
      tooltip: 'Export as Local File',
      info: 'Exporting document, this may take a few seconds, please wait...',
      error: {
        snapshot: 'UniverProExchangeClient is not loaded, unable to convert Snapshot',
        uploadFailed: 'Upload failed',
        uploadSnapshotFailed: 'Failed to upload Snapshot',
        taskFailed: 'Failed to call export task, taskID not obtained',
        backendTaskFailed: 'Backend export task failed: ',
        timeout: 'Export task timeout',
        exportFailed: 'Error during export: ',
      }
    },
    'local-import': {
      title: 'Local Import',
      tooltip: 'Import DOCX/XLSX (Local)',
      info: 'Importing document, please wait...',
      success: 'Import successful!',
      error: {
        unsupportedAll: 'Unsupported file format, please upload DOCX or XLSX',
        unsupportedSheet: 'Unsupported file format, please upload XLSX file',
        unsupportedDoc: 'Unsupported file format, please upload DOCX file',
        importFailed: 'Import failed: ',
      }
    }
  }
};
