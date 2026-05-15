import type { univerInstance } from '@src/utils/third-party/univer/index';

export async function importSheet() {
  return await Promise.all([
    import("@univerjs/presets"),
    import("@univerjs/preset-sheets-core"),
    import("@univerjs/preset-sheets-core/locales/zh-TW"),
    import("@univerjs/preset-sheets-filter"),
    import("@univerjs/preset-sheets-filter/locales/zh-TW"),
    import("@univerjs/preset-sheets-sort"),
    import("@univerjs/preset-sheets-sort/locales/zh-TW"),
    import("@univerjs/preset-sheets-data-validation"),
    import("@univerjs/preset-sheets-data-validation/locales/zh-TW"),
    import("@univerjs/preset-sheets-conditional-formatting"),
    import("@univerjs/preset-sheets-conditional-formatting/locales/zh-TW"),
    import("@univerjs/preset-sheets-hyper-link"),
    import("@univerjs/preset-sheets-hyper-link/locales/zh-TW"),
    import("@univerjs/preset-sheets-find-replace"),
    import("@univerjs/preset-sheets-find-replace/locales/zh-TW"),
    import('@univerjs/uniscript'),
    import("@univerjs/preset-sheets-drawing"),
    import("@univerjs/preset-sheets-drawing/locales/zh-TW"),
    import("@univerjs/preset-sheets-thread-comment"),
    import("@univerjs/preset-sheets-thread-comment/locales/zh-TW"),
    import("@univerjs/preset-sheets-note"),
    import("@univerjs/preset-sheets-note/locales/zh-TW"),
    import("@univerjs/preset-sheets-table"),
    import("@univerjs/preset-sheets-table/locales/zh-TW"),
    import("@univerjs/watermark"),
    import("@univerjs/sheets-crosshair-highlight"),
    import("@univerjs/sheets-zen-editor"),
    import("@univerjs/sheets-zen-editor/locale/zh-TW"),
    import("@univerjs/preset-sheets-advanced"),
    import("@univerjs/preset-sheets-advanced/locales/zh-TW"),

    import('@src/utils/third-party/univer/plugin/csv-import'),

    import("@univerjs/sheets-crosshair-highlight/facade"),
    import("@univerjs/sheets-zen-editor/facade"),

    import("@univerjs/preset-sheets-core/lib/index.css"),
    import("@univerjs/preset-sheets-filter/lib/index.css"),
    import("@univerjs/preset-sheets-sort/lib/index.css"),
    import("@univerjs/preset-sheets-data-validation/lib/index.css"),
    import("@univerjs/preset-sheets-conditional-formatting/lib/index.css"),
    import("@univerjs/preset-sheets-hyper-link/lib/index.css"),
    import("@univerjs/preset-sheets-find-replace/lib/index.css"),
    import("@univerjs/preset-sheets-drawing/lib/index.css"),
    import("@univerjs/preset-sheets-thread-comment/lib/index.css"),
    import("@univerjs/preset-sheets-note/lib/index.css"),
    import("@univerjs/preset-sheets-table/lib/index.css"),
    import("@univerjs/sheets-crosshair-highlight/lib/index.css"),
    import("@univerjs/sheets-zen-editor/lib/index.css"),
    import("@univerjs/preset-sheets-advanced/lib/index.css"),
  ]);
}

export async function createSheetInstance(container: HTMLElement): Promise<univerInstance> {
  const [
    { createUniver, LocaleType, mergeLocales },
    { UniverSheetsCorePreset },
    { default: UniverPresetSheetsCoreZhTW },
    { UniverSheetsFilterPreset },
    { default: UniverPresetSheetsFilterZhTW },
    { UniverSheetsSortPreset },
    { default: UniverPresetSheetsSortZhTW },
    { UniverSheetsDataValidationPreset },
    { default: UniverPresetSheetsDataValidationZhTW },
    { UniverSheetsConditionalFormattingPreset },
    { default: UniverPresetSheetsConditionalFormattingZhTW },
    { UniverSheetsHyperLinkPreset },
    { default: UniverPresetSheetsHyperLinkZhTW },
    { UniverSheetsFindReplacePreset },
    { default: UniverPresetSheetsFindReplaceZhTW },
    { UniverUniscriptPlugin:_UniverUniscriptPlugin },
    { UniverSheetsDrawingPreset },
    { default: UniverPresetSheetsDrawingZhTW },
    { UniverSheetsThreadCommentPreset },
    { default: UniverPresetSheetsThreadCommentZhTW },
    { UniverSheetsNotePreset },
    { default: UniverPresetSheetsNoteZhTW },
    { UniverSheetsTablePreset },
    { default: UniverPresetSheetsTableZhTW },
    { UniverWatermarkPlugin: _UniverWatermarkPlugin },
    { UniverSheetsCrosshairHighlightPlugin: _UniverSheetsCrosshairHighlightPlugin },
    { UniverSheetsZenEditorPlugin: _UniverSheetsZenEditorPlugin },
    { default: UniverSheetsZenEditorZhTW },
    { UniverSheetsAdvancedPreset },
    { default: UniverPresetSheetsAdvancedZhTW },
    { ImportCSVButtonPlugin }
  ] = await importSheet();

  const univerInstance = createUniver({
    locale: LocaleType.ZH_TW,
    locales: {
      [LocaleType.ZH_TW]: mergeLocales(
        UniverPresetSheetsCoreZhTW,
        UniverPresetSheetsFilterZhTW,
        UniverPresetSheetsSortZhTW,
        UniverPresetSheetsDataValidationZhTW,
        UniverPresetSheetsConditionalFormattingZhTW,
        UniverPresetSheetsHyperLinkZhTW,
        UniverPresetSheetsFindReplaceZhTW,
        UniverPresetSheetsDrawingZhTW,
        UniverPresetSheetsThreadCommentZhTW,
        UniverPresetSheetsNoteZhTW,
        UniverPresetSheetsTableZhTW,
        UniverSheetsZenEditorZhTW,
        UniverPresetSheetsAdvancedZhTW,
      ),
    },
    presets: [
      UniverSheetsCorePreset({ container }),
      UniverSheetsFilterPreset(),
      UniverSheetsSortPreset(),
      UniverSheetsDataValidationPreset(),
      UniverSheetsConditionalFormattingPreset(),
      UniverSheetsHyperLinkPreset(),
      UniverSheetsFindReplacePreset(),
      UniverSheetsDrawingPreset(),
      UniverSheetsThreadCommentPreset(),
      UniverSheetsNotePreset(),
      UniverSheetsTablePreset(),
      UniverSheetsAdvancedPreset({ license: "fake.txt", useWorker: true }),
    ],
    plugins: [
      ImportCSVButtonPlugin,
      // [_UniverWatermarkPlugin, {
      //   textWatermarkSettings: {
      //     content: '測試浮水印',
      //     fontSize: 20,
      //   },
      // }],
      // _UniverSheetsCrosshairHighlightPlugin,
      // _UniverSheetsZenEditorPlugin,
      // _UniverUniscriptPlugin,
    ],
  });

  return univerInstance;
}

export default createSheetInstance;
