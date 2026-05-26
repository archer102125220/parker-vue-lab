import type { univerInstance } from '@src/utils/third-party/univer/index';

// const UNIVER_SERVER_ENDPOINT =
//   import.meta.env.VITE_UNIVER_SERVER_ENDPOINT ||
//   'http://localhost:3000/api/univer';
const UNIVERSER_DOCKER_HOST =
  import.meta.env.VITE_UNIVERSER_DOCKER_HOST || 'http://localhost:8000';

export async function importSheet() {
  const [
    UniverPresets,
    UniverPresetSheetsCore,
    { default: UniverPresetSheetsCoreZhTW },
    { default: UniverPresetSheetsCoreEnUS },
    UniverPresetSheetsFilter,
    { default: UniverPresetSheetsFilterZhTW },
    { default: UniverPresetSheetsFilterEnUS },
    UniverPresetSheetsSort,
    { default: UniverPresetSheetsSortZhTW },
    { default: UniverPresetSheetsSortEnUS },
    UniverPresetSheetsDataValidation,
    { default: UniverPresetSheetsDataValidationZhTW },
    { default: UniverPresetSheetsDataValidationEnUS },
    UniverPresetSheetsConditionalFormatting,
    { default: UniverPresetSheetsConditionalFormattingZhTW },
    { default: UniverPresetSheetsConditionalFormattingEnUS },
    UniverPresetSheetsHyperLink,
    { default: UniverPresetSheetsHyperLinkZhTW },
    { default: UniverPresetSheetsHyperLinkEnUS },
    UniverPresetSheetsFindReplace,
    { default: UniverPresetSheetsFindReplaceZhTW },
    { default: UniverPresetSheetsFindReplaceEnUS },

    // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
    // UniverUniscript,
    // { default: UniverUniscriptZhTW },
    // { default: UniverUniscriptEnUS },

    UniverPresetSheetsDrawing,
    { default: UniverPresetSheetsDrawingZhTW },
    { default: UniverPresetSheetsDrawingEnUS },
    UniverPresetSheetsThreadComment,
    { default: UniverPresetSheetsThreadCommentZhTW },
    { default: UniverPresetSheetsThreadCommentEnUS },
    UniverPresetSheetsNote,
    { default: UniverPresetSheetsNoteZhTW },
    { default: UniverPresetSheetsNoteEnUS },
    UniverPresetSheetsTable,
    { default: UniverPresetSheetsTableZhTW },
    { default: UniverPresetSheetsTableEnUS },
    UniverWatermark,
    UniverSheetsCrosshairHighlight,
    UniverSheetsZenEditor,
    { default: UniverSheetsZenEditorZhTW },
    { default: UniverSheetsZenEditorEnUS }
  ] = await Promise.all([
    import('@univerjs/presets'),
    import('@univerjs/preset-sheets-core'),
    import('@univerjs/preset-sheets-core/locales/zh-TW'),
    import('@univerjs/preset-sheets-core/locales/en-US'),
    import('@univerjs/preset-sheets-filter'),
    import('@univerjs/preset-sheets-filter/locales/zh-TW'),
    import('@univerjs/preset-sheets-filter/locales/en-US'),
    import('@univerjs/preset-sheets-sort'),
    import('@univerjs/preset-sheets-sort/locales/zh-TW'),
    import('@univerjs/preset-sheets-sort/locales/en-US'),
    import('@univerjs/preset-sheets-data-validation'),
    import('@univerjs/preset-sheets-data-validation/locales/zh-TW'),
    import('@univerjs/preset-sheets-data-validation/locales/en-US'),
    import('@univerjs/preset-sheets-conditional-formatting'),
    import('@univerjs/preset-sheets-conditional-formatting/locales/zh-TW'),
    import('@univerjs/preset-sheets-conditional-formatting/locales/en-US'),
    import('@univerjs/preset-sheets-hyper-link'),
    import('@univerjs/preset-sheets-hyper-link/locales/zh-TW'),
    import('@univerjs/preset-sheets-hyper-link/locales/en-US'),
    import('@univerjs/preset-sheets-find-replace'),
    import('@univerjs/preset-sheets-find-replace/locales/zh-TW'),
    import('@univerjs/preset-sheets-find-replace/locales/en-US'),

    // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
    // import('@univerjs/uniscript'),
    // import('@univerjs/uniscript/locale/zh-TW'),
    // import('@univerjs/uniscript/locale/en-US'),

    import('@univerjs/preset-sheets-drawing'),
    import('@univerjs/preset-sheets-drawing/locales/zh-TW'),
    import('@univerjs/preset-sheets-drawing/locales/en-US'),
    import('@univerjs/preset-sheets-thread-comment'),
    import('@univerjs/preset-sheets-thread-comment/locales/zh-TW'),
    import('@univerjs/preset-sheets-thread-comment/locales/en-US'),
    import('@univerjs/preset-sheets-note'),
    import('@univerjs/preset-sheets-note/locales/zh-TW'),
    import('@univerjs/preset-sheets-note/locales/en-US'),
    import('@univerjs/preset-sheets-table'),
    import('@univerjs/preset-sheets-table/locales/zh-TW'),
    import('@univerjs/preset-sheets-table/locales/en-US'),
    import('@univerjs/watermark'),
    import('@univerjs/sheets-crosshair-highlight'),
    import('@univerjs/sheets-zen-editor'),
    import('@univerjs/sheets-zen-editor/locale/zh-TW'),
    import('@univerjs/sheets-zen-editor/locale/en-US'),

    import('@univerjs/sheets-crosshair-highlight/facade'),
    import('@univerjs/sheets-zen-editor/facade'),

    import('@univerjs/preset-sheets-core/lib/index.css'),
    import('@univerjs/preset-sheets-filter/lib/index.css'),
    import('@univerjs/preset-sheets-sort/lib/index.css'),
    import('@univerjs/preset-sheets-data-validation/lib/index.css'),
    import('@univerjs/preset-sheets-conditional-formatting/lib/index.css'),
    import('@univerjs/preset-sheets-hyper-link/lib/index.css'),
    import('@univerjs/preset-sheets-find-replace/lib/index.css'),
    import('@univerjs/preset-sheets-drawing/lib/index.css'),
    import('@univerjs/preset-sheets-thread-comment/lib/index.css'),
    import('@univerjs/preset-sheets-note/lib/index.css'),
    import('@univerjs/preset-sheets-table/lib/index.css'),
    import('@univerjs/sheets-crosshair-highlight/lib/index.css'),
    import('@univerjs/sheets-zen-editor/lib/index.css'),

    import('@univerjs/ui/facade')

    // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
    // import('@univerjs/uniscript/lib/index.css'),
  ]);

  return {
    UniverPresets,
    UniverPresetSheetsCore,
    UniverPresetSheetsCoreZhTW,
    UniverPresetSheetsCoreEnUS,
    UniverPresetSheetsFilter,
    UniverPresetSheetsFilterZhTW,
    UniverPresetSheetsFilterEnUS,
    UniverPresetSheetsSort,
    UniverPresetSheetsSortZhTW,
    UniverPresetSheetsSortEnUS,
    UniverPresetSheetsDataValidation,
    UniverPresetSheetsDataValidationZhTW,
    UniverPresetSheetsDataValidationEnUS,
    UniverPresetSheetsConditionalFormatting,
    UniverPresetSheetsConditionalFormattingZhTW,
    UniverPresetSheetsConditionalFormattingEnUS,
    UniverPresetSheetsHyperLink,
    UniverPresetSheetsHyperLinkZhTW,
    UniverPresetSheetsHyperLinkEnUS,
    UniverPresetSheetsFindReplace,
    UniverPresetSheetsFindReplaceZhTW,
    UniverPresetSheetsFindReplaceEnUS,

    // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
    // UniverUniscript,
    // UniverUniscriptZhTW,
    // UniverUniscriptEnUS,

    UniverPresetSheetsDrawing,
    UniverPresetSheetsDrawingZhTW,
    UniverPresetSheetsDrawingEnUS,
    UniverPresetSheetsThreadComment,
    UniverPresetSheetsThreadCommentZhTW,
    UniverPresetSheetsThreadCommentEnUS,
    UniverPresetSheetsNote,
    UniverPresetSheetsNoteZhTW,
    UniverPresetSheetsNoteEnUS,
    UniverPresetSheetsTable,
    UniverPresetSheetsTableZhTW,
    UniverPresetSheetsTableEnUS,
    UniverWatermark,
    UniverSheetsCrosshairHighlight,
    UniverSheetsZenEditor,
    UniverSheetsZenEditorZhTW,
    UniverSheetsZenEditorEnUS
  };
}

export async function importCustomSheetPlugin() {
  const [
    { ImportCSVButtonPlugin },
    { ExportCSVButtonPlugin },
    { LocalExportButtonPlugin },
    { LocalImportButtonPlugin },
    { importRegisterVue }
  ] = await Promise.all([
    import('@src/utils/third-party/univer/plugin/csv-import'),
    import('@src/utils/third-party/univer/plugin/csv-export'),
    import('@src/utils/third-party/univer/plugin/local-export'),
    import('@src/utils/third-party/univer/plugin/local-import'),
    import('@src/utils/third-party/univer/plugin/register-vue')
  ]);

  return {
    ImportCSVButtonPlugin,
    ExportCSVButtonPlugin,
    LocalExportButtonPlugin,
    LocalImportButtonPlugin,
    importRegisterVue
  };
}

export async function importSheetAdvanced() {
  const [
    UniverPresetSheetsAdvanced,
    { default: UniverPresetSheetsAdvancedZhTW },
    { default: UniverPresetSheetsAdvancedEnUS }
  ] = await Promise.all([
    import('@univerjs/preset-sheets-advanced'),
    import('@univerjs/preset-sheets-advanced/locales/zh-TW'),
    import('@univerjs/preset-sheets-advanced/locales/en-US'),

    import('@univerjs/preset-sheets-advanced/lib/index.css')
  ]);

  return {
    UniverPresetSheetsAdvanced,
    UniverPresetSheetsAdvancedZhTW,
    UniverPresetSheetsAdvancedEnUS
  };
}

export async function importSheetCollaboration() {
  const [
    UniverPresetSheetsCollaboration,
    { default: UniverSheetsCollaborationPresetZhTW },
    { default: UniverSheetsCollaborationPresetEnUS }
  ] = await Promise.all([
    import('@univerjs/preset-sheets-collaboration'),
    import('@univerjs/preset-sheets-collaboration/locales/zh-TW'),
    import('@univerjs/preset-sheets-collaboration/locales/en-US'),

    import('@univerjs/preset-sheets-collaboration/lib/index.css')
  ]);

  return {
    UniverPresetSheetsCollaboration,
    UniverSheetsCollaborationPresetZhTW,
    UniverSheetsCollaborationPresetEnUS
  };
}

export async function createSheetInstance(
  container: HTMLElement,
  locale: string = '',
  collaboration: boolean = false
): Promise<univerInstance> {
  const {
    UniverPresets,
    UniverPresetSheetsCore,
    UniverPresetSheetsCoreZhTW,
    UniverPresetSheetsCoreEnUS,
    UniverPresetSheetsFilter,
    UniverPresetSheetsFilterZhTW,
    UniverPresetSheetsFilterEnUS,
    UniverPresetSheetsSort,
    UniverPresetSheetsSortZhTW,
    UniverPresetSheetsSortEnUS,
    UniverPresetSheetsDataValidation,
    UniverPresetSheetsDataValidationZhTW,
    UniverPresetSheetsDataValidationEnUS,
    UniverPresetSheetsConditionalFormatting,
    UniverPresetSheetsConditionalFormattingZhTW,
    UniverPresetSheetsConditionalFormattingEnUS,
    UniverPresetSheetsHyperLink,
    UniverPresetSheetsHyperLinkZhTW,
    UniverPresetSheetsHyperLinkEnUS,
    UniverPresetSheetsFindReplace,
    UniverPresetSheetsFindReplaceZhTW,
    UniverPresetSheetsFindReplaceEnUS,

    // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
    // UniverUniscript,
    // UniverUniscriptZhTW,
    // UniverUniscriptEnUS,

    UniverPresetSheetsDrawing,
    UniverPresetSheetsDrawingZhTW,
    UniverPresetSheetsDrawingEnUS,
    UniverPresetSheetsThreadComment,
    UniverPresetSheetsThreadCommentZhTW,
    UniverPresetSheetsThreadCommentEnUS,
    UniverPresetSheetsNote,
    UniverPresetSheetsNoteZhTW,
    UniverPresetSheetsNoteEnUS,
    UniverPresetSheetsTable,
    UniverPresetSheetsTableZhTW,
    UniverPresetSheetsTableEnUS,
    // UniverWatermark,
    UniverSheetsCrosshairHighlight,
    UniverSheetsZenEditor,
    UniverSheetsZenEditorZhTW,
    UniverSheetsZenEditorEnUS
  } = await importSheet();

  const { createUniver, LocaleType, mergeLocales } = UniverPresets;
  const { UniverSheetsCorePreset } = UniverPresetSheetsCore;
  const { UniverSheetsFilterPreset } = UniverPresetSheetsFilter;
  const { UniverSheetsSortPreset } = UniverPresetSheetsSort;
  const { UniverSheetsDataValidationPreset } = UniverPresetSheetsDataValidation;
  const { UniverSheetsConditionalFormattingPreset } =
    UniverPresetSheetsConditionalFormatting;
  const { UniverSheetsHyperLinkPreset } = UniverPresetSheetsHyperLink;
  const { UniverSheetsFindReplacePreset } = UniverPresetSheetsFindReplace;
  const { UniverSheetsDrawingPreset } = UniverPresetSheetsDrawing;
  const { UniverSheetsThreadCommentPreset } = UniverPresetSheetsThreadComment;
  const { UniverSheetsNotePreset } = UniverPresetSheetsNote;
  const { UniverSheetsTablePreset } = UniverPresetSheetsTable;

  // const { UniverWatermarkPlugin: _UniverWatermarkPlugin } = UniverWatermark;
  const { UniverSheetsCrosshairHighlightPlugin } =
    UniverSheetsCrosshairHighlight;
  const { UniverSheetsZenEditorPlugin } = UniverSheetsZenEditor;

  // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
  // const { UniverUniscriptPlugin } = UniverUniscript;

  const {
    ImportCSVButtonPlugin,
    ExportCSVButtonPlugin,
    LocalExportButtonPlugin,
    LocalImportButtonPlugin,
    importRegisterVue
  } = await importCustomSheetPlugin();

  const {
    UniverPresetSheetsAdvanced,
    UniverPresetSheetsAdvancedZhTW,
    UniverPresetSheetsAdvancedEnUS
  } = await importSheetAdvanced();
  const { UniverSheetsAdvancedPreset, UniverSheetsExchangeClientPlugin } = UniverPresetSheetsAdvanced;

  const advancedPreset = UniverSheetsAdvancedPreset({
    license: import.meta.env.VITE_UNIVER_LICENSE,
    useWorker: true,
    universerEndpoint: import.meta.env.VITE_UNIVERSER_DOCKER_HOST || 'http://localhost:8000'
  });

  if (collaboration === false) {
    // 過濾掉官方的匯出按鈕 UI Plugin，這樣在非共編狀態下就不會顯示官方按鈕
    advancedPreset.plugins = advancedPreset.plugins.filter((p: any) => {
      const pluginClass = Array.isArray(p) ? p[0] : p;
      return pluginClass !== UniverSheetsExchangeClientPlugin;
    });
  }

  const univerConfig = {
    locale: locale.includes('zh') ? LocaleType.ZH_TW : LocaleType.EN_US,
    locales: {},
    // 迴避 TS 型別錯誤問題
    collaboration: collaboration || undefined,
    presets: [
      UniverSheetsCorePreset({ container }),
      UniverSheetsFilterPreset(),
      UniverSheetsSortPreset(),
      UniverSheetsDataValidationPreset(),
      UniverSheetsConditionalFormattingPreset(),
      UniverSheetsHyperLinkPreset(),
      UniverSheetsFindReplacePreset(),
      UniverSheetsThreadCommentPreset(),
      UniverSheetsNotePreset(),
      UniverSheetsTablePreset(),
      advancedPreset
    ],
    plugins: [
      // [_UniverWatermarkPlugin, {
      //   textWatermarkSettings: {
      //     content: '測試浮水印',
      //     fontSize: 20,
      //   },
      // }],
      UniverSheetsCrosshairHighlightPlugin,
      UniverSheetsZenEditorPlugin

      // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
      // UniverUniscriptPlugin
    ]
  };

  if (collaboration === true) {
    const {
      UniverPresetSheetsCollaboration,
      UniverSheetsCollaborationPresetZhTW,
      UniverSheetsCollaborationPresetEnUS
    } = await importSheetCollaboration();

    const { UniverSheetsCollaborationPreset } = UniverPresetSheetsCollaboration;

    univerConfig.locales = {
      [LocaleType.ZH_TW]: mergeLocales(
        UniverPresetSheetsCoreZhTW,
        UniverPresetSheetsFilterZhTW,
        UniverPresetSheetsSortZhTW,
        UniverPresetSheetsDataValidationZhTW,
        UniverPresetSheetsConditionalFormattingZhTW,
        UniverPresetSheetsHyperLinkZhTW,
        UniverPresetSheetsFindReplaceZhTW,

        // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
        // UniverUniscriptZhTW,

        UniverPresetSheetsDrawingZhTW,
        UniverPresetSheetsThreadCommentZhTW,
        UniverPresetSheetsNoteZhTW,
        UniverPresetSheetsTableZhTW,
        UniverSheetsZenEditorZhTW,

        UniverPresetSheetsAdvancedZhTW,
        UniverSheetsCollaborationPresetZhTW
      ),
      [LocaleType.EN_US]: mergeLocales(
        UniverPresetSheetsCoreEnUS,
        UniverPresetSheetsFilterEnUS,
        UniverPresetSheetsSortEnUS,
        UniverPresetSheetsDataValidationEnUS,
        UniverPresetSheetsConditionalFormattingEnUS,
        UniverPresetSheetsHyperLinkEnUS,
        UniverPresetSheetsFindReplaceEnUS,

        // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
        // UniverUniscriptEnUS,

        UniverPresetSheetsDrawingEnUS,
        UniverPresetSheetsThreadCommentEnUS,
        UniverPresetSheetsNoteEnUS,
        UniverPresetSheetsTableEnUS,
        UniverSheetsZenEditorEnUS,

        UniverPresetSheetsAdvancedEnUS,
        UniverSheetsCollaborationPresetEnUS
      )
    };

    univerConfig.collaboration = true;

    univerConfig.presets.push(
      UniverSheetsDrawingPreset({ collaboration: true }),
      UniverSheetsCollaborationPreset({
        // universerEndpoint: UNIVER_SERVER_ENDPOINT
        universerEndpoint: UNIVERSER_DOCKER_HOST
      })
    );
  } else {
    univerConfig.locales = {
      [LocaleType.ZH_TW]: mergeLocales(
        UniverPresetSheetsCoreZhTW,
        UniverPresetSheetsFilterZhTW,
        UniverPresetSheetsSortZhTW,
        UniverPresetSheetsDataValidationZhTW,
        UniverPresetSheetsConditionalFormattingZhTW,
        UniverPresetSheetsHyperLinkZhTW,
        UniverPresetSheetsFindReplaceZhTW,

        // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
        // UniverUniscriptZhTW,

        UniverPresetSheetsDrawingZhTW,
        UniverPresetSheetsThreadCommentZhTW,
        UniverPresetSheetsNoteZhTW,
        UniverPresetSheetsTableZhTW,
        UniverSheetsZenEditorZhTW,

        UniverPresetSheetsAdvancedZhTW
      ),
      [LocaleType.EN_US]: mergeLocales(
        UniverPresetSheetsCoreEnUS,
        UniverPresetSheetsFilterEnUS,
        UniverPresetSheetsSortEnUS,
        UniverPresetSheetsDataValidationEnUS,
        UniverPresetSheetsConditionalFormattingEnUS,
        UniverPresetSheetsHyperLinkEnUS,
        UniverPresetSheetsFindReplaceEnUS,

        // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
        // UniverUniscriptEnUS,

        UniverPresetSheetsDrawingEnUS,
        UniverPresetSheetsThreadCommentEnUS,
        UniverPresetSheetsNoteEnUS,
        UniverPresetSheetsTableEnUS,
        UniverSheetsZenEditorEnUS,

        UniverPresetSheetsAdvancedEnUS
      )
    };

    univerConfig.presets.push(UniverSheetsDrawingPreset());

    univerConfig.collaboration = undefined;
  }

  const univerInstance = importRegisterVue(createUniver(univerConfig));
  univerInstance.univer.registerPlugins([
    [ImportCSVButtonPlugin],
    [ExportCSVButtonPlugin],
    [LocalExportButtonPlugin],
    [LocalImportButtonPlugin]
  ]);

  // window.univerInstance = univerInstance;

  return { ...univerInstance, LocaleType };
}

export default createSheetInstance;
