import type {
  DependencyOverride,
  IUniverConfig,
  Plugin,
  PluginCtor
} from '@univerjs/core';
import type { IUniverSheetsCorePresetConfig } from '@univerjs/preset-sheets-core';
import type { IUniverSheetsFilterPresetConfig } from '@univerjs/preset-sheets-filter';
import type { IUniverSheetsDataValidationPresetConfig } from '@univerjs/preset-sheets-data-validation';
import type { IUniverSheetsHyperLinkPresetConfig } from '@univerjs/preset-sheets-hyper-link';
import type { IUniverSheetsFindReplacePresetConfig } from '@univerjs/preset-sheets-find-replace';
import type { IUniverSheetsThreadCommentPresetConfig } from '@univerjs/preset-sheets-thread-comment';
import type { IUniverWatermarkConfig } from '@univerjs/watermark';
import type { IUniverUniscriptConfig } from '@univerjs/uniscript';
import type { IUniverSheetsDrawingPresetConfig } from '@univerjs/preset-sheets-drawing';
import type { IUniverSheetsAdvancedPresetConfig } from '@univerjs/preset-sheets-advanced';
import type { IUniverSheetsCrosshairHighlightConfig } from '@univerjs/sheets-crosshair-highlight';
import type { IUniverSheetsZenEditorConfig } from '@univerjs/sheets-zen-editor';
import type { IUniverSheetsCollaborationPresetConfig } from '@univerjs/preset-sheets-collaboration';
import type { IUniverLiveShareConfig } from '@univerjs-pro/live-share';

import type { univerInstance } from '@src/utils/third-party/univer/index';
import type { ISheetLockPluginConfig } from '@src/utils/third-party/univer/plugin/sheet-lock';

// @univerjs/presets/lib/types/umd.d.ts 沒倒出的 createUniver 接收參數的型別
export interface IPreset {
  plugins: Array<
    | PluginCtor<Plugin>
    | [PluginCtor<Plugin>, ConstructorParameters<PluginCtor<Plugin>>[0]]
  >;
}
export interface IPresetOptions {
  lazy?: boolean;
}
export type CreateUniverOptions = Partial<IUniverConfig> & {
  presets: Array<IPreset | [IPreset, IPresetOptions]>;
  plugins?: Array<
    | PluginCtor<Plugin>
    | [PluginCtor<Plugin>, ConstructorParameters<PluginCtor<Plugin>>[0]]
  >;
  override?: DependencyOverride;
  collaboration?: true;
};
export type {
  DependencyOverride,
  IUniverConfig,
  Plugin,
  PluginCtor,
  IUniverSheetsCorePresetConfig,
  IUniverSheetsFilterPresetConfig,
  IUniverSheetsDataValidationPresetConfig,
  IUniverSheetsHyperLinkPresetConfig,
  IUniverSheetsFindReplacePresetConfig,
  IUniverSheetsThreadCommentPresetConfig,
  IUniverWatermarkConfig,
  IUniverUniscriptConfig,
  IUniverSheetsDrawingPresetConfig,
  IUniverSheetsAdvancedPresetConfig,
  IUniverSheetsCrosshairHighlightConfig,
  IUniverSheetsZenEditorConfig,
  IUniverSheetsCollaborationPresetConfig,
  IUniverLiveShareConfig,
  ISheetLockPluginConfig
};

// const UNIVER_SERVER_ENDPOINT =
//   import.meta.env.VITE_UNIVER_SERVER_ENDPOINT ||
//   'http://localhost:3000/api/univer';
const UNIVERSER_DOCKER_HOST = import.meta.env.VITE_UNIVERSER_PROXY_PATH ?? '';

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

    UniverUniscript,
    { default: UniverUniscriptZhTW },
    { default: UniverUniscriptEnUS },

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

    import('@univerjs/uniscript'),
    import('@univerjs/uniscript/locale/zh-TW'),
    import('@univerjs/uniscript/locale/en-US'),

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

    import('@univerjs/ui/facade'),

    import('@univerjs/uniscript/lib/index.css')
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

    UniverUniscript,
    UniverUniscriptZhTW,
    UniverUniscriptEnUS,

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
    { ServerExportButtonPlugin },
    { LocalImportButtonPlugin },
    { UniverExchangeLifecyclePlugin },
    { SheetLockPlugin },
    { importRegisterVue },
    { default: CustomPluginEnUS },
    { default: CustomPluginZhTW }
  ] = await Promise.all([
    import('@src/utils/third-party/univer/plugin/csv-import'),
    import('@src/utils/third-party/univer/plugin/csv-export'),
    import('@src/utils/third-party/univer/plugin/local-export'),
    import('@src/utils/third-party/univer/plugin/server-export'),
    import('@src/utils/third-party/univer/plugin/local-import'),
    import('@src/utils/third-party/univer/plugin/exchange-lifecycle'),
    import('@src/utils/third-party/univer/plugin/sheet-lock'),
    import('@src/utils/third-party/univer/plugin/register-vue'),
    import('@src/utils/third-party/univer/i18n/en-US'),
    import('@src/utils/third-party/univer/i18n/zh-TW')
  ]);

  return {
    ImportCSVButtonPlugin,
    ExportCSVButtonPlugin,
    LocalExportButtonPlugin,
    ServerExportButtonPlugin,
    LocalImportButtonPlugin,
    UniverExchangeLifecyclePlugin,
    SheetLockPlugin,
    importRegisterVue,
    CustomPluginEnUS,
    CustomPluginZhTW
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
    { default: UniverPresetSheetsCollaborationZhTW },
    { default: UniverPresetSheetsCollaborationEnUs }
  ] = await Promise.all([
    import('@univerjs/preset-sheets-collaboration'),
    import('@univerjs/preset-sheets-collaboration/locales/zh-TW'),
    import('@univerjs/preset-sheets-collaboration/locales/en-US'),

    import('@univerjs/preset-sheets-collaboration/lib/index.css')
  ]);

  return {
    UniverPresetSheetsCollaboration,
    UniverPresetSheetsCollaborationZhTW,
    UniverPresetSheetsCollaborationEnUs
  };
}

export async function importSheetLiveShare() {
  const [UniverProLiveShare] = await Promise.all([
    import('@univerjs-pro/live-share'),
    import('@univerjs-pro/live-share/facade'),
    import('@univerjs-pro/live-share/lib/index.css')
  ]);

  return {
    UniverProLiveShare
  };
}

type createUniverOptions = CreateUniverOptions & {
  plugins: Array<
    | PluginCtor<Plugin>
    | [PluginCtor<Plugin>, ConstructorParameters<PluginCtor<Plugin>>[0]]
  >;
};
export type CreateSheetSetting = {
  container?: HTMLElement;
  locale?: string;
  coreConfig?: IUniverSheetsCorePresetConfig;
  filterConfig?: IUniverSheetsFilterPresetConfig;
  dataValidationConfig?: IUniverSheetsDataValidationPresetConfig;
  hyperlinkConfig?: IUniverSheetsHyperLinkPresetConfig;
  findReplaceConfig?: IUniverSheetsFindReplacePresetConfig;
  threadCommentConfig?: IUniverSheetsThreadCommentPresetConfig;
  watermark?: boolean;
  watermarkConfig?: IUniverWatermarkConfig;
  uniscript?: boolean;
  uniscriptConfig?: IUniverUniscriptConfig;
  drawingPresetConfig?: IUniverSheetsDrawingPresetConfig;
  license?: IUniverSheetsAdvancedPresetConfig['license'];
  universerEndpoint?: IUniverSheetsAdvancedPresetConfig['universerEndpoint'];
  advancedPresetConfig?: IUniverSheetsAdvancedPresetConfig;
  crosshairHighlightConfig?: IUniverSheetsCrosshairHighlightConfig;
  zenEditorConfig?: IUniverSheetsZenEditorConfig;
  collaborationPresetConfig?: IUniverSheetsCollaborationPresetConfig;
  liveShareConfig?: IUniverLiveShareConfig;
  lockPluginConfig?: ISheetLockPluginConfig;
  collaboration?: boolean;
  liveShare?: boolean;
};
export async function createSheetInstance({
  container,
  locale = '',
  coreConfig,
  filterConfig,
  dataValidationConfig,
  hyperlinkConfig,
  findReplaceConfig,
  threadCommentConfig,
  watermark = false,
  watermarkConfig,
  uniscript = false,
  uniscriptConfig,
  drawingPresetConfig = {},
  license,
  universerEndpoint,
  advancedPresetConfig = {},
  crosshairHighlightConfig,
  zenEditorConfig,
  collaborationPresetConfig = {},
  liveShareConfig,
  lockPluginConfig = {},
  collaboration = false,
  liveShare = false
}: CreateSheetSetting = {}): Promise<univerInstance> {
  if (typeof window === 'undefined') {
    throw new Error(
      'createSheetInstance is only available in browser environment'
    );
  }

  if (container instanceof HTMLElement === false) {
    throw new Error('container must be an HTMLElement');
  }
  const safeLicense: IUniverSheetsAdvancedPresetConfig['license'] =
    (license ?? import.meta.env.VITE_UNIVER_LICENSE) || '';
  const sheetsAdvanced = typeof safeLicense === 'string' && safeLicense !== '';

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

    UniverUniscript,
    UniverUniscriptZhTW,
    UniverUniscriptEnUS,

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

  const { UniverSheetsCrosshairHighlightPlugin } =
    UniverSheetsCrosshairHighlight;
  const { UniverSheetsZenEditorPlugin } = UniverSheetsZenEditor;

  const {
    ImportCSVButtonPlugin,
    ExportCSVButtonPlugin,
    LocalExportButtonPlugin,
    ServerExportButtonPlugin,
    LocalImportButtonPlugin,
    UniverExchangeLifecyclePlugin,
    SheetLockPlugin,
    importRegisterVue,
    CustomPluginEnUS,
    CustomPluginZhTW
  } = await importCustomSheetPlugin();

  const univerConfig: createUniverOptions = {
    locale: locale.includes('zh') ? LocaleType.ZH_TW : LocaleType.EN_US,
    locales: {},
    // 迴避 TS 型別錯誤問題
    collaboration: collaboration || undefined,
    presets: [
      UniverSheetsCorePreset(
        coreConfig ? { ...coreConfig, container } : { container }
      ),
      UniverSheetsFilterPreset(filterConfig),
      UniverSheetsSortPreset(),
      UniverSheetsDataValidationPreset(dataValidationConfig),
      UniverSheetsConditionalFormattingPreset(),
      UniverSheetsHyperLinkPreset(hyperlinkConfig),
      UniverSheetsFindReplacePreset(findReplaceConfig),
      UniverSheetsThreadCommentPreset(threadCommentConfig),
      UniverSheetsNotePreset(),
      UniverSheetsTablePreset()
    ],
    plugins: [
      typeof crosshairHighlightConfig === 'object' &&
      crosshairHighlightConfig !== null
        ? [UniverSheetsCrosshairHighlightPlugin, crosshairHighlightConfig]
        : UniverSheetsCrosshairHighlightPlugin,

      typeof zenEditorConfig === 'object' && zenEditorConfig !== null
        ? [UniverSheetsZenEditorPlugin, zenEditorConfig]
        : UniverSheetsZenEditorPlugin
    ]
  };

  const localeZhTW = [
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

    CustomPluginZhTW
  ];

  const localeEnUS = [
    UniverPresetSheetsCoreEnUS,
    UniverPresetSheetsFilterEnUS,
    UniverPresetSheetsSortEnUS,
    UniverPresetSheetsDataValidationEnUS,
    UniverPresetSheetsConditionalFormattingEnUS,
    UniverPresetSheetsHyperLinkEnUS,
    UniverPresetSheetsFindReplaceEnUS,

    UniverPresetSheetsDrawingEnUS,
    UniverPresetSheetsThreadCommentEnUS,
    UniverPresetSheetsNoteEnUS,
    UniverPresetSheetsTableEnUS,
    UniverSheetsZenEditorEnUS,

    CustomPluginEnUS
  ];

  if (watermark === true) {
    const { UniverWatermarkPlugin } = UniverWatermark;

    if (typeof watermarkConfig === 'object' && watermarkConfig !== null) {
      univerConfig.plugins.push([
        UniverWatermarkPlugin,
        // {
        //   textWatermarkSettings: {
        //     content: '測試浮水印',
        //     fontSize: 20
        //   }
        // }
        watermarkConfig
      ]);
    } else {
      univerConfig.plugins.push(UniverWatermarkPlugin);
    }
  }

  if (uniscript === true) {
    const { UniverUniscriptPlugin } = UniverUniscript;

    // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor
    if (typeof uniscriptConfig === 'object' && uniscriptConfig !== null) {
      univerConfig.plugins.push([UniverUniscriptPlugin, uniscriptConfig]);
    } else {
      univerConfig.plugins.push(UniverUniscriptPlugin);
    }

    localeZhTW.push(UniverUniscriptZhTW);
    localeEnUS.push(UniverUniscriptEnUS);
  }

  const safeUniverserEndpoint =
    (universerEndpoint ?? import.meta.env.VITE_UNIVERSER_PROXY_PATH) || '';

  if (sheetsAdvanced === true) {
    const {
      UniverPresetSheetsAdvanced,
      UniverPresetSheetsAdvancedZhTW,
      UniverPresetSheetsAdvancedEnUS
    } = await importSheetAdvanced();
    const { UniverSheetsAdvancedPreset, UniverSheetsExchangeClientPlugin } =
      UniverPresetSheetsAdvanced;
    const advancedPreset = UniverSheetsAdvancedPreset({
      useWorker: true,
      universerEndpoint: safeUniverserEndpoint,
      ...advancedPresetConfig,
      license: safeLicense
    });

    localeZhTW.push(UniverPresetSheetsAdvancedZhTW);
    localeEnUS.push(UniverPresetSheetsAdvancedEnUS);

    if (collaboration === false) {
      // 過濾掉官方的匯出按鈕 UI Plugin，這樣在非共編狀態下就不會顯示官方按鈕
      advancedPreset.plugins = advancedPreset.plugins.filter(
        (advancedPresetPlugin: unknown[] | unknown) => {
          const pluginClass = Array.isArray(advancedPresetPlugin)
            ? advancedPresetPlugin[0]
            : advancedPresetPlugin;
          return pluginClass !== UniverSheetsExchangeClientPlugin;
        }
      );
    }

    univerConfig.presets.push(advancedPreset);
  }

  if (sheetsAdvanced === true && collaboration === true) {
    const {
      UniverPresetSheetsCollaboration,
      UniverPresetSheetsCollaborationZhTW,
      UniverPresetSheetsCollaborationEnUs
    } = await importSheetCollaboration();

    const { UniverSheetsCollaborationPreset } = UniverPresetSheetsCollaboration;

    localeZhTW.push(UniverPresetSheetsCollaborationZhTW);
    localeEnUS.push(UniverPresetSheetsCollaborationEnUs);

    univerConfig.collaboration = true;

    univerConfig.presets.push(
      UniverSheetsDrawingPreset({
        ...drawingPresetConfig,
        collaboration: true
      }),
      UniverSheetsCollaborationPreset({
        // universerEndpoint: UNIVER_SERVER_ENDPOINT
        universerEndpoint: safeUniverserEndpoint,
        ...collaborationPresetConfig
      })
    );
  } else {
    univerConfig.presets.push(
      UniverSheetsDrawingPreset({
        ...drawingPresetConfig
      })
    );
    univerConfig.collaboration = undefined;
  }

  univerConfig.locales = {
    [LocaleType.ZH_TW]: mergeLocales(...localeZhTW),
    [LocaleType.EN_US]: mergeLocales(...localeEnUS)
  };

  const univerInstance = importRegisterVue(createUniver(univerConfig));
  univerInstance.univer.registerPlugins([
    [ImportCSVButtonPlugin],
    [ExportCSVButtonPlugin],
    [LocalExportButtonPlugin],
    [ServerExportButtonPlugin],
    [LocalImportButtonPlugin],
    [UniverExchangeLifecyclePlugin],
    [SheetLockPlugin, { noStyle: false, ...lockPluginConfig }]
  ]);

  if (collaboration === true && liveShare === true) {
    const { UniverProLiveShare } = await importSheetLiveShare();
    const { UniverLiveSharePlugin } = UniverProLiveShare;

    univerInstance.univer.registerPlugin(
      UniverLiveSharePlugin,
      liveShareConfig
    );
  }

  // window.univerInstance = univerInstance;

  return { ...univerInstance, LocaleType };
}

export default createSheetInstance;
