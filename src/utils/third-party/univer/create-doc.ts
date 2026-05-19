import type { univerInstance } from '@src/utils/third-party/univer/index';

export async function importDocx() {
  return await Promise.all([
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
    import('@univerjs/preset-docs-advanced'),
    import('@univerjs/preset-docs-advanced/locales/zh-TW'),
    import('@univerjs/preset-docs-advanced/locales/en-US'),

    import('@univerjs/watermark/facade'),

    import('@univerjs/preset-docs-core/lib/index.css'),
    import( '@univerjs/preset-docs-hyper-link/lib/index.css'),
    import('@univerjs/preset-docs-drawing/lib/index.css'),
    import('@univerjs/docs-quick-insert-ui/lib/index.css'),
    import('@univerjs/preset-docs-thread-comment/lib/index.css'),
    import('@univerjs/preset-docs-advanced/lib/index.css'),
  ]);
}

export async function createDocInstance(container: HTMLElement, locale: string): Promise<univerInstance> {
  const [
    { createUniver, LocaleType, mergeLocales },
    { UniverDocsCorePreset },
    { default: UniverPresetDocsCoreZhTW },
    { default: UniverPresetDocsCoreEnUS },
    { UniverDocsHyperLinkPreset },
    { default: UniverPresetDocsHyperLinkZhTW },
    { default: UniverPresetDocsHyperLinkEnUS },
    { UniverDocsDrawingPreset },
    { default: UniverPresetDocsDrawingZhTW },
    { default: UniverPresetDocsDrawingEnUS },
    { UniverDocsQuickInsertUIPlugin },
    { default: UniverDocsQuickInsertUIZhTW },
    { default: UniverDocsQuickInsertUIEnUS },
    { UniverDocsThreadCommentPreset },
    { default: UniverPresetDocsThreadCommentZhTW },
    { default: UniverPresetDocsThreadCommentEnUS },
    { UniverWatermarkPlugin: _UniverWatermarkPlugin },
    { UniverUniscriptPlugin: _UniverUniscriptPlugin },
    { UniverDocsAdvancedPreset },
    { default: UniverPresetDocsAdvancedZhTW },
    { default: UniverPresetDocsAdvancedEnUS },
  ] = await importDocx();

  const univerInstance = createUniver({
    locale: locale.includes('zh') ? LocaleType.ZH_TW : LocaleType.EN_US,
    locales: {
      [LocaleType.ZH_TW]: mergeLocales(
        UniverPresetDocsCoreZhTW,
        UniverPresetDocsHyperLinkZhTW,
        UniverPresetDocsDrawingZhTW,
        UniverDocsQuickInsertUIZhTW,
        UniverPresetDocsThreadCommentZhTW,
        UniverPresetDocsAdvancedZhTW,
      ),
      [LocaleType.EN_US]: mergeLocales(
        UniverPresetDocsCoreEnUS,
        UniverPresetDocsHyperLinkEnUS,
        UniverPresetDocsDrawingEnUS,
        UniverDocsQuickInsertUIEnUS,
        UniverPresetDocsThreadCommentEnUS,
        UniverPresetDocsAdvancedEnUS,
      ),
    },
    presets: [
      UniverDocsCorePreset({ container }),
      UniverDocsHyperLinkPreset(),
      UniverDocsThreadCommentPreset(),
      UniverDocsDrawingPreset(),
      UniverDocsAdvancedPreset({ license: "fake.txt", useWorker: true }),
    ],
    plugins: [
      // [_UniverWatermarkPlugin, {
      //   textWatermarkSettings: {
      //     content: '測試浮水印',
      //     fontSize: 20,
      //   },
      // }],
      // __UniverUniscriptPlugin,
      UniverDocsQuickInsertUIPlugin,
    ],
  });

  // window.univerInstance = univerInstance;

  return { ...univerInstance, LocaleType };
}

export default createDocInstance;