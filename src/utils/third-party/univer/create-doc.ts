import type { IUniverDocsCorePresetConfig } from '@univerjs/preset-docs-core';
import type { IUniverDocsThreadCommentPresetConfig } from '@univerjs/preset-docs-thread-comment';
import type { IUniverDocsQuickInsertUIConfig } from '@univerjs/docs-quick-insert-ui';
import type { IUniverWatermarkConfig } from '@univerjs/watermark';
import type { IUniverUniscriptConfig } from '@univerjs/uniscript';
import type { IUniverDocsDrawingPresetConfig } from '@univerjs/preset-docs-drawing';
import type { IUniverDocsAdvancedPresetConfig } from '@univerjs/preset-docs-advanced';
import type { IUniverDocsCollaborationPresetConfig } from '@univerjs/preset-docs-collaboration';

import type {
  CreateUniverOptions,
  PluginCtor,
  Plugin,
  univerInstance
} from '@src/utils/third-party/univer/index';
import type { IDocLockPluginConfig } from '@src/utils/third-party/univer/plugin/doc-lock';

export type {
  IUniverDocsCorePresetConfig,
  IUniverDocsThreadCommentPresetConfig,
  IUniverDocsQuickInsertUIConfig,
  IUniverWatermarkConfig,
  IUniverUniscriptConfig,
  IUniverDocsDrawingPresetConfig,
  IUniverDocsAdvancedPresetConfig,
  IUniverDocsCollaborationPresetConfig,
  IDocLockPluginConfig
};

// const UNIVER_SERVER_ENDPOINT =
//   import.meta.env.VITE_UNIVER_SERVER_ENDPOINT ||
//   'http://localhost:3000/api/univer';

export type ImportDocResult = {
  UniverPresets: typeof import('@univerjs/presets');
  UniverPresetDocsCore: typeof import('@univerjs/preset-docs-core');
  UniverPresetDocsCoreZhTW: (typeof import('@univerjs/preset-docs-core/locales/zh-TW'))['default'];
  UniverPresetDocsCoreEnUS: (typeof import('@univerjs/preset-docs-core/locales/en-US'))['default'];
  UniverPresetDocsHyperLink: typeof import('@univerjs/preset-docs-hyper-link');
  UniverPresetDocsHyperLinkZhTW: (typeof import('@univerjs/preset-docs-hyper-link/locales/zh-TW'))['default'];
  UniverPresetDocsHyperLinkEnUS: (typeof import('@univerjs/preset-docs-hyper-link/locales/en-US'))['default'];
  UniverPresetDocsDrawing: typeof import('@univerjs/preset-docs-drawing');
  UniverPresetDocsDrawingZhTW: (typeof import('@univerjs/preset-docs-drawing/locales/zh-TW'))['default'];
  UniverPresetDocsDrawingEnUS: (typeof import('@univerjs/preset-docs-drawing/locales/en-US'))['default'];
  UniverDocsQuickInsertUi: typeof import('@univerjs/docs-quick-insert-ui');
  UniverDocsQuickInsertUIZhTW: (typeof import('@univerjs/docs-quick-insert-ui/locale/zh-TW'))['default'];
  UniverDocsQuickInsertUIEnUS: (typeof import('@univerjs/docs-quick-insert-ui/locale/en-US'))['default'];
  UniverPresetDocsThreadComment: typeof import('@univerjs/preset-docs-thread-comment');
  UniverPresetDocsThreadCommentZhTW: (typeof import('@univerjs/preset-docs-thread-comment/locales/zh-TW'))['default'];
  UniverPresetDocsThreadCommentEnUS: (typeof import('@univerjs/preset-docs-thread-comment/locales/en-US'))['default'];
  UniverWatermark: typeof import('@univerjs/watermark');
  UniverUniscript: typeof import('@univerjs/uniscript');
  UniverUniscriptZhTW: (typeof import('@univerjs/uniscript/locale/zh-TW'))['default'];
  UniverUniscriptEnUS: (typeof import('@univerjs/uniscript/locale/en-US'))['default'];
};

export async function importDoc(): Promise<ImportDocResult> {
  const [
    UniverPresets,
    UniverPresetDocsCore,
    { default: UniverPresetDocsCoreZhTW },
    { default: UniverPresetDocsCoreEnUS },
    UniverPresetDocsHyperLink,
    { default: UniverPresetDocsHyperLinkZhTW },
    { default: UniverPresetDocsHyperLinkEnUS },
    UniverPresetDocsDrawing,
    { default: UniverPresetDocsDrawingZhTW },
    { default: UniverPresetDocsDrawingEnUS },
    UniverDocsQuickInsertUi,
    { default: UniverDocsQuickInsertUIZhTW },
    { default: UniverDocsQuickInsertUIEnUS },
    UniverPresetDocsThreadComment,
    { default: UniverPresetDocsThreadCommentZhTW },
    { default: UniverPresetDocsThreadCommentEnUS },
    UniverWatermark,

    UniverUniscript,
    { default: UniverUniscriptZhTW },
    { default: UniverUniscriptEnUS }
  ] = await Promise.all([
    import('@univerjs/presets'),
    import('@univerjs/preset-docs-core'),
    import('@univerjs/preset-docs-core/locales/zh-TW'),
    import('@univerjs/preset-docs-core/locales/en-US'),
    import('@univerjs/preset-docs-hyper-link'),
    import('@univerjs/preset-docs-hyper-link/locales/zh-TW'),
    import('@univerjs/preset-docs-hyper-link/locales/en-US'),
    import('@univerjs/preset-docs-drawing'),
    import('@univerjs/preset-docs-drawing/locales/zh-TW'),
    import('@univerjs/preset-docs-drawing/locales/en-US'),
    import('@univerjs/docs-quick-insert-ui'),
    import('@univerjs/docs-quick-insert-ui/locale/zh-TW'),
    import('@univerjs/docs-quick-insert-ui/locale/en-US'),
    import('@univerjs/preset-docs-thread-comment'),
    import('@univerjs/preset-docs-thread-comment/locales/zh-TW'),
    import('@univerjs/preset-docs-thread-comment/locales/en-US'),
    import('@univerjs/watermark'),

    import('@univerjs/uniscript'),
    import('@univerjs/uniscript/locale/zh-TW'),
    import('@univerjs/uniscript/locale/en-US'),

    import('@univerjs/watermark/facade'),

    import('@univerjs/preset-docs-core/lib/index.css'),
    import('@univerjs/preset-docs-hyper-link/lib/index.css'),
    import('@univerjs/preset-docs-drawing/lib/index.css'),
    import('@univerjs/docs-quick-insert-ui/lib/index.css'),
    import('@univerjs/preset-docs-thread-comment/lib/index.css'),

    import('@univerjs/ui/facade'),

    import('@univerjs/uniscript/lib/index.css')
  ]);

  return {
    UniverPresets,
    UniverPresetDocsCore,
    UniverPresetDocsCoreZhTW,
    UniverPresetDocsCoreEnUS,
    UniverPresetDocsHyperLink,
    UniverPresetDocsHyperLinkZhTW,
    UniverPresetDocsHyperLinkEnUS,
    UniverPresetDocsDrawing,
    UniverPresetDocsDrawingZhTW,
    UniverPresetDocsDrawingEnUS,
    UniverDocsQuickInsertUi,
    UniverDocsQuickInsertUIZhTW,
    UniverDocsQuickInsertUIEnUS,
    UniverPresetDocsThreadComment,
    UniverPresetDocsThreadCommentZhTW,
    UniverPresetDocsThreadCommentEnUS,
    UniverWatermark,

    UniverUniscript,
    UniverUniscriptZhTW,
    UniverUniscriptEnUS
  };
}

export type ImportCustomDocPluginResult = {
  LocalExportButtonPlugin: (typeof import('@src/utils/third-party/univer/plugin/local-export'))['LocalExportButtonPlugin'];
  ServerExportButtonPlugin: (typeof import('@src/utils/third-party/univer/plugin/server-export'))['ServerExportButtonPlugin'];
  LocalImportButtonPlugin: (typeof import('@src/utils/third-party/univer/plugin/local-import'))['LocalImportButtonPlugin'];
  UniverExchangeLifecyclePlugin: (typeof import('@src/utils/third-party/univer/plugin/exchange-lifecycle'))['UniverExchangeLifecyclePlugin'];
  importRegisterVue: (typeof import('@src/utils/third-party/univer/plugin/register-vue'))['importRegisterVue'];
  DocLockPlugin: (typeof import('@src/utils/third-party/univer/plugin/doc-lock'))['DocLockPlugin'];
  CustomPluginEnUS: (typeof import('@src/utils/third-party/univer/i18n/en-US'))['default'];
  CustomPluginZhTW: (typeof import('@src/utils/third-party/univer/i18n/zh-TW'))['default'];
};

export async function importCustomDocPlugin(): Promise<ImportCustomDocPluginResult> {
  const [
    { LocalExportButtonPlugin },
    { ServerExportButtonPlugin },
    { LocalImportButtonPlugin },
    { UniverExchangeLifecyclePlugin },
    { importRegisterVue },
    { DocLockPlugin },
    { default: CustomPluginEnUS },
    { default: CustomPluginZhTW }
  ] = await Promise.all([
    import('@src/utils/third-party/univer/plugin/local-export'),
    import('@src/utils/third-party/univer/plugin/server-export'),
    import('@src/utils/third-party/univer/plugin/local-import'),
    import('@src/utils/third-party/univer/plugin/exchange-lifecycle'),
    import('@src/utils/third-party/univer/plugin/register-vue'),
    import('@src/utils/third-party/univer/plugin/doc-lock'),
    import('@src/utils/third-party/univer/i18n/en-US'),
    import('@src/utils/third-party/univer/i18n/zh-TW')
  ]);

  return {
    LocalExportButtonPlugin,
    ServerExportButtonPlugin,
    LocalImportButtonPlugin,
    UniverExchangeLifecyclePlugin,
    importRegisterVue,
    DocLockPlugin,
    CustomPluginEnUS,
    CustomPluginZhTW
  };
}

export type ImportDocAdvancedResult = {
  UniverPresetDocsAdvanced: typeof import('@univerjs/preset-docs-advanced');
  UniverPresetDocsAdvancedZhTW: (typeof import('@univerjs/preset-docs-advanced/locales/zh-TW'))['default'];
  UniverPresetDocsAdvancedEnUS: (typeof import('@univerjs/preset-docs-advanced/locales/en-US'))['default'];
};

export async function importDocAdvanced(): Promise<ImportDocAdvancedResult> {
  const [
    UniverPresetDocsAdvanced,
    { default: UniverPresetDocsAdvancedZhTW },
    { default: UniverPresetDocsAdvancedEnUS }
  ] = await Promise.all([
    import('@univerjs/preset-docs-advanced'),
    import('@univerjs/preset-docs-advanced/locales/zh-TW'),
    import('@univerjs/preset-docs-advanced/locales/en-US'),

    import('@univerjs/preset-docs-advanced/lib/index.css')
  ]);

  return {
    UniverPresetDocsAdvanced,
    UniverPresetDocsAdvancedZhTW,
    UniverPresetDocsAdvancedEnUS
  };
}

export type ImportDocCollaborationResult = {
  UniverPresetDocsCollaboration: typeof import('@univerjs/preset-docs-collaboration');
  UniverPresetDocsCollaborationZhTW: (typeof import('@univerjs/preset-docs-collaboration/locales/zh-TW'))['default'];
  UniverPresetDocsCollaborationEnUS: (typeof import('@univerjs/preset-docs-collaboration/locales/en-US'))['default'];
};

export async function importDocCollaboration(): Promise<ImportDocCollaborationResult> {
  const [
    UniverPresetDocsCollaboration,
    { default: UniverPresetDocsCollaborationZhTW },
    { default: UniverPresetDocsCollaborationEnUS }
  ] = await Promise.all([
    import('@univerjs/preset-docs-collaboration'),
    import('@univerjs/preset-docs-collaboration/locales/zh-TW'),
    import('@univerjs/preset-docs-collaboration/locales/en-US'),

    import('@univerjs/preset-docs-collaboration/lib/index.css')
  ]);

  return {
    UniverPresetDocsCollaboration,
    UniverPresetDocsCollaborationZhTW,
    UniverPresetDocsCollaborationEnUS
  };
}

type createUniverOptions = CreateUniverOptions & {
  plugins: Array<
    | PluginCtor<Plugin>
    | [PluginCtor<Plugin>, ConstructorParameters<PluginCtor<Plugin>>[0]]
  >;
};
export type CreateDocSetting = {
  container?: HTMLElement;
  locale?: string;
  license?: IUniverDocsAdvancedPresetConfig['license'];
  universerEndpoint?: IUniverDocsAdvancedPresetConfig['universerEndpoint'];
  docsCoreConfig?: IUniverDocsCorePresetConfig;
  threadCommentPresetConfig?: IUniverDocsThreadCommentPresetConfig;
  quickInsertUIConfig?: IUniverDocsQuickInsertUIConfig;
  watermark?: boolean;
  watermarkConfig?: IUniverWatermarkConfig;
  uniscript?: boolean;
  uniscriptConfig?: IUniverUniscriptConfig;
  drawingPresetConfig?: IUniverDocsDrawingPresetConfig;
  collaboration?: boolean;
  advancedPresetConfig?: IUniverDocsAdvancedPresetConfig;
  collaborationConfig?: IUniverDocsCollaborationPresetConfig;
  docLockConfig?: IDocLockPluginConfig;
};
export async function createDocInstance({
  container,
  locale = '',
  license,
  universerEndpoint,
  docsCoreConfig = {},
  threadCommentPresetConfig,
  quickInsertUIConfig,
  watermark = false,
  watermarkConfig,
  uniscript = false,
  uniscriptConfig,
  drawingPresetConfig,
  collaboration = false,
  advancedPresetConfig = {},
  collaborationConfig = {},
  docLockConfig = {}
}: CreateDocSetting = {}): Promise<univerInstance> {
  if (typeof window === 'undefined') {
    throw new Error(
      'createDocInstance is only available in browser environment'
    );
  }

  if (container instanceof HTMLElement === false) {
    throw new Error('container must be an HTMLElement');
  }
  const safeLicense: IUniverDocsAdvancedPresetConfig['license'] =
    (license ?? import.meta.env.VITE_UNIVER_LICENSE) || '';
  const docsAdvanced = typeof safeLicense === 'string' && safeLicense !== '';

  const {
    UniverPresets,
    UniverPresetDocsCore,
    UniverPresetDocsCoreZhTW,
    UniverPresetDocsCoreEnUS,
    UniverPresetDocsHyperLink,
    UniverPresetDocsHyperLinkZhTW,
    UniverPresetDocsHyperLinkEnUS,
    UniverPresetDocsDrawing,
    UniverPresetDocsDrawingZhTW,
    UniverPresetDocsDrawingEnUS,
    UniverDocsQuickInsertUi,
    UniverDocsQuickInsertUIZhTW,
    UniverDocsQuickInsertUIEnUS,
    UniverPresetDocsThreadComment,
    UniverPresetDocsThreadCommentZhTW,
    UniverPresetDocsThreadCommentEnUS,
    UniverWatermark,

    UniverUniscript,
    UniverUniscriptZhTW,
    UniverUniscriptEnUS
  } = await importDoc();

  const { createUniver, LocaleType, mergeLocales } = UniverPresets;
  const { UniverDocsCorePreset } = UniverPresetDocsCore;
  const { UniverDocsHyperLinkPreset } = UniverPresetDocsHyperLink;
  const { UniverDocsDrawingPreset } = UniverPresetDocsDrawing;
  const { UniverDocsQuickInsertUIPlugin } = UniverDocsQuickInsertUi;
  const { UniverDocsThreadCommentPreset } = UniverPresetDocsThreadComment;

  const {
    LocalExportButtonPlugin,
    ServerExportButtonPlugin,
    LocalImportButtonPlugin,
    UniverExchangeLifecyclePlugin,
    DocLockPlugin,
    importRegisterVue,
    CustomPluginEnUS,
    CustomPluginZhTW
  } = await importCustomDocPlugin();

  const univerConfig: createUniverOptions = {
    locale: locale.includes('zh') ? LocaleType.ZH_TW : LocaleType.EN_US,
    // 迴避 TS 型別錯誤問題
    collaboration: collaboration || undefined,
    locales: {},
    presets: [
      UniverDocsCorePreset({ ...docsCoreConfig, container }),
      UniverDocsHyperLinkPreset(),
      UniverDocsThreadCommentPreset(threadCommentPresetConfig)
    ],
    plugins: [
      typeof quickInsertUIConfig === 'object' && quickInsertUIConfig !== null
        ? [UniverDocsQuickInsertUIPlugin, quickInsertUIConfig]
        : UniverDocsQuickInsertUIPlugin
    ]
  };

  const localeZhTW = [
    UniverPresetDocsCoreZhTW,
    UniverPresetDocsHyperLinkZhTW,
    UniverPresetDocsDrawingZhTW,
    UniverDocsQuickInsertUIZhTW,
    UniverPresetDocsThreadCommentZhTW,

    CustomPluginZhTW
  ];

  const localeEnUS = [
    UniverPresetDocsCoreEnUS,
    UniverPresetDocsHyperLinkEnUS,
    UniverPresetDocsDrawingEnUS,
    UniverDocsQuickInsertUIEnUS,
    UniverPresetDocsThreadCommentEnUS,

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
        //     fontSize: 20,
        //   },
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

  if (docsAdvanced === true) {
    const {
      UniverPresetDocsAdvanced,
      UniverPresetDocsAdvancedZhTW,
      UniverPresetDocsAdvancedEnUS
    } = await importDocAdvanced();
    const { UniverDocsAdvancedPreset, UniverDocsExchangeClientPlugin } =
      UniverPresetDocsAdvanced;

    localeZhTW.push(UniverPresetDocsAdvancedZhTW);
    localeEnUS.push(UniverPresetDocsAdvancedEnUS);

    const advancedPreset = UniverDocsAdvancedPreset({
      useWorker: true,
      universerEndpoint: safeUniverserEndpoint,
      ...advancedPresetConfig,
      license: safeLicense
    });

    if (collaboration === false) {
      // 過濾掉官方的匯出按鈕 UI Plugin，這樣在非共編狀態下就不會顯示官方按鈕
      advancedPreset.plugins = advancedPreset.plugins.filter(
        (plugin: unknown[] | unknown) => {
          const pluginClass = Array.isArray(plugin) ? plugin[0] : plugin;
          return pluginClass !== UniverDocsExchangeClientPlugin;
        }
      );
    }

    univerConfig.presets.push(advancedPreset);
  }

  if (docsAdvanced === true && collaboration === true) {
    const {
      UniverPresetDocsCollaboration,
      UniverPresetDocsCollaborationZhTW,
      UniverPresetDocsCollaborationEnUS
    } = await importDocCollaboration();
    const { UniverDocsCollaborationPreset } = UniverPresetDocsCollaboration;

    localeZhTW.push(UniverPresetDocsCollaborationZhTW);
    localeEnUS.push(UniverPresetDocsCollaborationEnUS);

    univerConfig.collaboration = true;

    univerConfig.presets.push(
      UniverDocsDrawingPreset(
        typeof drawingPresetConfig === 'object' && drawingPresetConfig !== null
          ? { ...drawingPresetConfig, collaboration: true }
          : { collaboration: true }
      ),
      UniverDocsCollaborationPreset({
        // universerEndpoint: UNIVER_SERVER_ENDPOINT
        universerEndpoint: safeUniverserEndpoint,
        ...collaborationConfig
      })
    );
  } else {
    univerConfig.collaboration = undefined;

    univerConfig.presets.push(UniverDocsDrawingPreset(drawingPresetConfig));
  }

  univerConfig.locales = {
    [LocaleType.ZH_TW]: mergeLocales(...localeZhTW),
    [LocaleType.EN_US]: mergeLocales(...localeEnUS)
  };

  const univerInstance = importRegisterVue(createUniver(univerConfig));
  univerInstance.univer.registerPlugins([
    [LocalExportButtonPlugin],
    [ServerExportButtonPlugin],
    [LocalImportButtonPlugin],
    [UniverExchangeLifecyclePlugin],
    [DocLockPlugin, { noStyle: false, ...docLockConfig }]
  ]);

  // window.univerInstance = univerInstance;

  return { ...univerInstance, LocaleType };
}

export default createDocInstance;
