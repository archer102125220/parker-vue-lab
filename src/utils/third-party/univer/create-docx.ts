import type { univerInstance } from '@src/utils/third-party/univer/index';

export async function importDocx() {
  return await Promise.all([
    import('@univerjs/presets'),
    import('@univerjs/preset-docs-core'),
    import('@univerjs/preset-docs-core/locales/zh-TW'),
    import('@univerjs/preset-docs-hyper-link'),
    import('@univerjs/preset-docs-hyper-link/locales/zh-TW'),
    import('@univerjs/preset-docs-drawing'),
    import('@univerjs/preset-docs-drawing/locales/zh-TW'),
    import('@univerjs/docs-quick-insert-ui'),
    import('@univerjs/docs-quick-insert-ui/locale/zh-TW'),
    import('@univerjs/preset-docs-thread-comment'),
    import('@univerjs/preset-docs-thread-comment/locales/zh-TW'),
    import('@univerjs/watermark'),
    import('@univerjs/uniscript'),
    import('@univerjs/preset-docs-advanced'),
    import('@univerjs/preset-docs-advanced/locales/zh-TW'),
    import('@univerjs/preset-docs-collaboration'),
    import('@univerjs/preset-docs-collaboration/locales/zh-TW'),

    import('@univerjs/watermark/facade'),

    import('@univerjs/preset-docs-core/lib/index.css'),
    import( '@univerjs/preset-docs-hyper-link/lib/index.css'),
    import('@univerjs/preset-docs-drawing/lib/index.css'),
    import('@univerjs/docs-quick-insert-ui/lib/index.css'),
    import('@univerjs/preset-docs-thread-comment/lib/index.css'),
    import('@univerjs/preset-docs-advanced/lib/index.css'),
    import('@univerjs/preset-docs-collaboration/lib/index.css')

  ]);
}

export async function createDocxsInstance(container: HTMLElement): Promise<univerInstance> {
  const [
    { createUniver, LocaleType, mergeLocales },
    { UniverDocsCorePreset },
    { default: UniverPresetDocsCoreZhTW },
    { UniverDocsHyperLinkPreset },
    { default: UniverPresetDocsHyperLinkZhTW },
    { UniverDocsDrawingPreset },
    { default: UniverPresetDocsDrawingZhTW },
    { UniverDocsQuickInsertUIPlugin },
    { default: UniverDocsQuickInsertUIZhTW },
    { UniverDocsThreadCommentPreset },
    { default: UniverPresetDocsThreadCommentZhTW },
    { UniverWatermarkPlugin: _UniverWatermarkPlugin },
    { UniverUniscriptPlugin: _UniverUniscriptPlugin },
    { UniverDocsAdvancedPreset },
    { default: UniverPresetDocsAdvancedZhTW },
    { UniverDocsCollaborationPreset },
    { default: UniverPresetDocsCollaborationZhTW }
  ] = await importDocx();

  const univerInstance = createUniver({
    locale: LocaleType.ZH_TW,
    locales: {
      [LocaleType.ZH_TW]: mergeLocales(
        UniverPresetDocsCoreZhTW,
        UniverPresetDocsHyperLinkZhTW,
        UniverPresetDocsDrawingZhTW,
        UniverDocsQuickInsertUIZhTW,
        UniverPresetDocsThreadCommentZhTW,
        UniverPresetDocsAdvancedZhTW,
        UniverPresetDocsCollaborationZhTW
      ),
    },
    presets: [
      UniverDocsCorePreset({ container }),
      UniverDocsHyperLinkPreset(),
      UniverDocsThreadCommentPreset(),
      UniverDocsCollaborationPreset(),
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

  return univerInstance;
}

export default createDocxsInstance;