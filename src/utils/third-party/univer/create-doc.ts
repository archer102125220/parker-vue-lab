import type { univerInstance } from '@src/utils/third-party/univer/index';

// const UNIVER_SERVER_ENDPOINT =
//   import.meta.env.VITE_UNIVER_SERVER_ENDPOINT ||
//   'http://localhost:3000/api/univer';
const UNIVERSER_DOCKER_HOST =
  import.meta.env.VITE_UNIVERSER_DOCKER_HOST || 'http://localhost:8000';

export async function importDoc() {
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
    UniverWatermark

    // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
    // UniverUniscript,
    // { default: UniverUniscriptZhTW },
    // { default: UniverUniscriptEnUS },
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

    // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
    // import('@univerjs/uniscript'),
    // import('@univerjs/uniscript/locale/zh-TW'),
    // import('@univerjs/uniscript/locale/en-US'),

    import('@univerjs/watermark/facade'),

    import('@univerjs/preset-docs-core/lib/index.css'),
    import('@univerjs/preset-docs-hyper-link/lib/index.css'),
    import('@univerjs/preset-docs-drawing/lib/index.css'),
    import('@univerjs/docs-quick-insert-ui/lib/index.css'),
    import('@univerjs/preset-docs-thread-comment/lib/index.css'),

    import('@univerjs/ui/facade')

    // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
    // import('@univerjs/uniscript/lib/index.css'),
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
    UniverWatermark

    // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
    // UniverUniscript,
    // UniverUniscriptZhTW,
    // UniverUniscriptEnUS,
  };
}

export async function importCustomDocPlugin() {
  const [
    { LocalExportButtonPlugin },
    { LocalImportButtonPlugin },
    { importRegisterVue }
  ] = await Promise.all([
    import('@src/utils/third-party/univer/plugin/local-export'),
    import('@src/utils/third-party/univer/plugin/local-import'),
    import('@src/utils/third-party/univer/plugin/register-vue')
  ]);

  return {
    LocalExportButtonPlugin,
    LocalImportButtonPlugin,
    importRegisterVue
  };
}

export async function importDocAdvanced() {
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

export async function importDocCollaboration() {
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

export async function createDocInstance(
  container: HTMLElement,
  locale: string,
  collaboration: boolean = false
): Promise<univerInstance> {
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
    UniverPresetDocsThreadCommentEnUS
    // UniverWatermark,

    // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
    // UniverUniscript,
    // UniverUniscriptZhTW,
    // UniverUniscriptEnUS,
  } = await importDoc();

  const { createUniver, LocaleType, mergeLocales } = UniverPresets;
  const { UniverDocsCorePreset } = UniverPresetDocsCore;
  const { UniverDocsHyperLinkPreset } = UniverPresetDocsHyperLink;
  const { UniverDocsDrawingPreset } = UniverPresetDocsDrawing;
  const { UniverDocsQuickInsertUIPlugin } = UniverDocsQuickInsertUi;
  const { UniverDocsThreadCommentPreset } = UniverPresetDocsThreadComment;
  // const { UniverWatermarkPlugin: _UniverWatermarkPlugin } = UniverWatermark;

  // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
  // const { UniverUniscriptPlugin } = UniverUniscript;

  const {
    LocalExportButtonPlugin,
    LocalImportButtonPlugin,
    importRegisterVue
  } = await importCustomDocPlugin();

  const {
    UniverPresetDocsAdvanced,
    UniverPresetDocsAdvancedZhTW,
    UniverPresetDocsAdvancedEnUS
  } = await importDocAdvanced();
  const { UniverDocsAdvancedPreset, UniverDocsExchangeClientPlugin } =
    UniverPresetDocsAdvanced;

  const univerConfig = {
    locale: locale.includes('zh') ? LocaleType.ZH_TW : LocaleType.EN_US,
    // 迴避 TS 型別錯誤問題
    collaboration: collaboration || undefined,
    locales: {},
    presets: [
      UniverDocsCorePreset({ container }),
      UniverDocsHyperLinkPreset(),
      UniverDocsThreadCommentPreset()
    ],
    plugins: [
      // LocalExportButtonPlugin,
      // LocalImportButtonPlugin,
      UniverDocsQuickInsertUIPlugin
      // [_UniverWatermarkPlugin, {
      //   textWatermarkSettings: {
      //     content: '測試浮水印',
      //     fontSize: 20,
      //   },
      // }],

      // uniscript 好像是 experimental ，並且 CDN 需要額外想辦法處理 monaco-editor ，暫先註解掉
      // UniverUniscriptPlugin
    ]
  };

  if (collaboration === true) {
    const {
      UniverPresetDocsCollaboration,
      UniverPresetDocsCollaborationZhTW,
      UniverPresetDocsCollaborationEnUS
    } = await importDocCollaboration();
    const { UniverDocsCollaborationPreset } = UniverPresetDocsCollaboration;

    univerConfig.locales = {
      [LocaleType.ZH_TW]: mergeLocales(
        UniverPresetDocsCoreZhTW,
        UniverPresetDocsHyperLinkZhTW,
        UniverPresetDocsDrawingZhTW,
        UniverDocsQuickInsertUIZhTW,
        UniverPresetDocsThreadCommentZhTW,

        UniverPresetDocsAdvancedZhTW,
        UniverPresetDocsCollaborationZhTW
      ),
      [LocaleType.EN_US]: mergeLocales(
        UniverPresetDocsCoreEnUS,
        UniverPresetDocsHyperLinkEnUS,
        UniverPresetDocsDrawingEnUS,
        UniverDocsQuickInsertUIEnUS,
        UniverPresetDocsThreadCommentEnUS,

        UniverPresetDocsAdvancedEnUS,
        UniverPresetDocsCollaborationEnUS
      )
    };

    univerConfig.collaboration = true;

    univerConfig.presets.push(
      UniverDocsDrawingPreset({
        collaboration: true
      }),
      UniverDocsAdvancedPreset({
        license: import.meta.env.VITE_UNIVER_LICENSE,
        useWorker: true,
        // universerEndpoint: UNIVER_SERVER_ENDPOINT
        universerEndpoint: UNIVERSER_DOCKER_HOST
      }),
      UniverDocsCollaborationPreset({
        // universerEndpoint: UNIVER_SERVER_ENDPOINT
        universerEndpoint: UNIVERSER_DOCKER_HOST
      })
    );
  } else {
    univerConfig.locales = {
      [LocaleType.ZH_TW]: mergeLocales(
        UniverPresetDocsCoreZhTW,
        UniverPresetDocsHyperLinkZhTW,
        UniverPresetDocsDrawingZhTW,
        UniverDocsQuickInsertUIZhTW,
        UniverPresetDocsThreadCommentZhTW,

        UniverPresetDocsAdvancedZhTW
      ),
      [LocaleType.EN_US]: mergeLocales(
        UniverPresetDocsCoreEnUS,
        UniverPresetDocsHyperLinkEnUS,
        UniverPresetDocsDrawingEnUS,
        UniverDocsQuickInsertUIEnUS,
        UniverPresetDocsThreadCommentEnUS,

        UniverPresetDocsAdvancedEnUS
      )
    };

    univerConfig.collaboration = undefined;


    const advancedPreset = UniverDocsAdvancedPreset({
      license: import.meta.env.VITE_UNIVER_LICENSE,
      useWorker: true,
      // universerEndpoint: UNIVER_SERVER_ENDPOINT
      universerEndpoint: UNIVERSER_DOCKER_HOST
    });

    // 過濾掉官方的匯出按鈕 UI Plugin，這樣在非共編狀態下就不會顯示官方按鈕
    advancedPreset.plugins = advancedPreset.plugins.filter((plugin: any) => {
      const pluginClass = Array.isArray(plugin) ? plugin[0] : plugin;
      return pluginClass !== UniverDocsExchangeClientPlugin;
    });

    univerConfig.presets.push(
      UniverDocsDrawingPreset(),
      advancedPreset
    );
  }

  const univerInstance = importRegisterVue(createUniver(univerConfig));
  univerInstance.univer.registerPlugins([
    [LocalExportButtonPlugin],
    [LocalImportButtonPlugin]
  ]);

  // window.univerInstance = univerInstance;

  return { ...univerInstance, LocaleType };
}

export default createDocInstance;
