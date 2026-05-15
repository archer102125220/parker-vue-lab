import { loadScript } from "@src/utils/helpers/load-script";
import { loadCSS } from "@src/utils/helpers/load-css";

export async function importUniver() {
  if (typeof document === "undefined") return;

  const dependecyScriptList = [
    {
      id: "univer-react",
      src: "https://unpkg.com/react@18.3.1/umd/react.production.min.js",
    },
    {
      id: "univer-react-dom",
      src: "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js",
    },
    {
      id: "univer-rxjs",
      src: "https://unpkg.com/rxjs/dist/bundles/rxjs.umd.min.js",
    },
    {
      id: "univer-echarts",
      src: "https://unpkg.com/echarts@5.6.0/dist/echarts.min.js",
    },
  ];
  const univerCoreScriptList = [
    {
      id: "univer-presets",
      src: "https://unpkg.com/@univerjs/presets/lib/umd/index.js",
    },
    {
      id: "univer-core-facade",
      src: "https://unpkg.com/@univerjs/core/lib/umd/facade.js",
    },
  ];
  const univerScriptList = [
    {
      id: "univer-thread-comment",
      src: "https://unpkg.com/@univerjs/thread-comment/lib/umd/index.js",
    },
    {
      id: "univer-sheets-print-facade",
      src: "https://unpkg.com/@univerjs-pro/sheets-print/lib/umd/facade.js",
    },
  ];
  const univerSheetCoreScriptList = [
    {
      id: "univer-sheets-core",
      src: "https://unpkg.com/@univerjs/preset-sheets-core/lib/umd/index.js",
    },
    {
      id: "univer-sheets-thread-comment",
      src: "https://unpkg.com/@univerjs/sheets-thread-comment/lib/umd/index.js",
    },
  ];
  const univerSheetScriptList = [
    {
      id: "univer-sheets-drawing",
      src: "https://unpkg.com/@univerjs/preset-sheets-drawing/lib/umd/index.js",
    },
    {
      id: "univer-sheets-advanced",
      src: "https://unpkg.com/@univerjs/preset-sheets-advanced/lib/umd/index.js",
    },
  ];
  const univerLocaleList = [
    {
      id: "univer-sheets-core-zh-tw",
      src: "https://unpkg.com/@univerjs/preset-sheets-core/lib/umd/locales/zh-TW.js",
    },
    {
      id: "univer-sheets-drawing-zh-tw",
      src: "https://unpkg.com/@univerjs/preset-sheets-drawing/lib/umd/locales/zh-TW.js",
    },
    {
      id: "univer-sheets-advanced-zh-tw",
      src: "https://unpkg.com/@univerjs/preset-sheets-advanced/lib/umd/locales/zh-TW.js",
    },
  ];
  const univerCSSList = [
    {
      id: "univer-sheets-core-css",
      src: "https://unpkg.com/@univerjs/preset-sheets-core/lib/index.css",
    },
    {
      id: "univer-sheets-drawing-css",
      src: "https://unpkg.com/@univerjs/preset-sheets-drawing/lib/index.css",
    },
    {
      id: "univer-sheets-advanced-css",
      src: "https://unpkg.com/@univerjs/preset-sheets-advanced/lib/index.css",
    },
  ];

  const querySelectorAllString = [
    ...dependecyScriptList.map((dependecyScript) => `#${dependecyScript.id}`),
    ...univerSheetCoreScriptList.map(
      (sheetCoreScript) => `#${sheetCoreScript.id}`,
    ),
    ...univerCoreScriptList.map((coreScript) => `#${coreScript.id}`),
    ...univerScriptList.map((univerScript) => `#${univerScript.id}`),
    ...univerSheetScriptList.map(
      (univerSheetScript) => `#${univerSheetScript.id}`,
    ),
    ...univerLocaleList.map(
      (univerLocaleScript) => `#${univerLocaleScript.id}`,
    ),
    ...univerCSSList.map((univerCSSScript) => `#${univerCSSScript.id}`),
  ].join(",");

  if (document.querySelectorAll(querySelectorAllString).length > 0) {
    return;
  }

  // 嚴格依序載入，每個都等前一個完成
  const dependecyScriptPromiseList = dependecyScriptList.map(
    (dependecyScript) => loadScript(dependecyScript.id, dependecyScript.src),
  );
  await Promise.all(dependecyScriptPromiseList);

  const univerCoreScriptPromiseList = univerCoreScriptList.map((coreScript) =>
    loadScript(coreScript.id, coreScript.src),
  );
  await Promise.all(univerCoreScriptPromiseList);

  const univerScriptPromiseList = univerScriptList.map((univerScript) =>
    loadScript(univerScript.id, univerScript.src),
  );
  await Promise.all(univerScriptPromiseList);

  const univerSheetCoreScriptPromiseList = univerSheetCoreScriptList.map(
    (sheetCoreScript) => loadScript(sheetCoreScript.id, sheetCoreScript.src),
  );
  await Promise.all(univerSheetCoreScriptPromiseList);

  const univerSheetScriptPromiseList = univerSheetScriptList.map(
    (univerSheetScript) =>
      loadScript(univerSheetScript.id, univerSheetScript.src),
  );
  await Promise.all(univerSheetScriptPromiseList);

  await Promise.all([
    ...univerLocaleList.map((univerLocaleScript) =>
      loadScript(univerLocaleScript.id, univerLocaleScript.src),
    ),
    ...univerCSSList.map((univerCSSScript) =>
      loadCSS(univerCSSScript.id, univerCSSScript.src),
    ),
  ]);
}

export async function createUniverInstance(container) {
  await importUniver();

  if (typeof window.UniverPresets?.createUniver !== "function") {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(createUniverInstance(container));
      }, 100);
    });
  }

  if (container instanceof HTMLElement === false) {
    throw new Error("container must be an HTMLElement");
  }

  const {
    UniverPresets,
    UniverPresetSheetsCore,
    UniverCore,
    UniverProLicense,
    // UniverSheetsAdvancedPreset,
    // UniverSheetsDrawingPreset,
    UniverPresetSheetsCoreZhTW,
    UniverPresetSheetsAdvancedZhTW,
    UniverPresetSheetsDrawingZhTW,
  } = window;
  const { createUniver } = UniverPresets;
  const { LocaleType, mergeLocales } = UniverCore;
  const { UniverSheetsCorePreset } = UniverPresetSheetsCore;
  const { UniverLicensePlugin } = UniverProLicense;

  const univerInstance = createUniver({
    locale: LocaleType.ZH_TW,
    locales: {
      [LocaleType.ZH_TW]: mergeLocales(
        UniverPresetSheetsCoreZhTW,
        UniverPresetSheetsDrawingZhTW,
        UniverPresetSheetsAdvancedZhTW,
      ),
    },
    presets: [
      UniverSheetsCorePreset({ container }),
      // UniverSheetsAdvancedPreset({ license: 'fake.txt', useWorker:true }),
      // UniverSheetsDrawingPreset()
    ],
  });

  univerInstance.univer.registerPlugin(UniverLicensePlugin, {
    license: "fake.txt",
  });
  window.univerInstance = univerInstance;

  return univerInstance;
}

export default createUniverInstance;
