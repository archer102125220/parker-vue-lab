<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue';

import SkeletonLoader from '@src/components/SkeletonLoader.vue';

import {
  createDocInstance,
  type univerInstanceRef,
  type IDisposable,
  type IDocumentData
} from '@src/utils/third-party/univer';

defineOptions({
  inheritAttrs: false
});

const disposableList: IDisposable[] = [];

const props = defineProps({
  locale: {
    type: String,
    default() {
      return 'zhTW';
    }
  },
  openFile: {
    type: String,
    default: ''
  },
  doc: {
    type: Object,
    default: () => ({
      id: 'YBLWUR',
      documentStyle: {
        pageSize: {
          width: 793.3333333333334,
          height: 1122.6666666666667
        },
        documentFlavor: 1,
        marginTop: 50,
        marginBottom: 50,
        marginRight: 50,
        marginLeft: 50,
        renderConfig: {
          zeroWidthParagraphBreak: 0,
          vertexAngle: 0,
          centerAngle: 0,
          background: {
            rgb: '#ccc'
          }
        },
        autoHyphenation: 1,
        doNotHyphenateCaps: 0,
        consecutiveHyphenLimit: 2,
        defaultHeaderId: '',
        defaultFooterId: '',
        evenPageHeaderId: '',
        evenPageFooterId: '',
        firstPageHeaderId: '',
        firstPageFooterId: '',
        evenAndOddHeaders: 0,
        useFirstPageHeaderFooter: 0,
        marginHeader: 30,
        marginFooter: 30
      },
      locale: 'enUS',
      title: '',
      tableSource: {},
      drawings: {},
      drawingsOrder: [],
      headers: {},
      footers: {},
      body: {
        dataStream: '測試預設內容\r\n',
        textRuns: [],
        customBlocks: [],
        tables: [],
        paragraphs: [
          {
            startIndex: 13,
            paragraphStyle: {
              spaceAbove: {
                v: 5
              },
              lineSpacing: 1,
              spaceBelow: {
                v: 0
              }
            }
          }
        ],
        sectionBreaks: [
          {
            startIndex: 14
          }
        ],
        customRanges: [],
        customDecorations: []
      },
      settings: {},
      resources: [
        {
          name: 'SHEET_UNIVER_THREAD_COMMENT_PLUGIN',
          data: '{}'
        },
        {
          name: 'DOC_DRAWING_PLUGIN',
          data: '{"data":{},"order":[]}'
        },
        {
          name: 'DOC_HYPER_LINK_PLUGIN',
          data: '{"links":[]}'
        }
      ]
    })
  }
});
const emits = defineEmits([
  'update:doc',
  'change',
  'univerStarting',
  'univerReady',
  'univerRendered',
  'univerSteady'
]);

const container = ref<HTMLDivElement | null>(null);
const currentDoc = ref({});
const loading = ref(true);

const univerInstance = reactive<univerInstanceRef>({
  univer: null,
  univerAPI: null,
  LocaleType: null
});

async function handleUniverDoc(overrideSnapshot?: any) {
  loading.value = true;
  try {
    if (container.value instanceof HTMLElement === false) return;

    // 清除舊的 univer 實例 (如果有的話)
    if (univerInstance.univer) {
      univerInstance.univer.dispose();
      univerInstance.univerAPI = null;
      if (container.value) {
        container.value.innerHTML = ''; // 清空容器
      }
    }

    const { univer, univerAPI, LocaleType } = await createDocInstance(
      container.value,
      props.locale
    );

    // 只有出現在 univerAPI.Event 中的事件能被觸發
    // 官網上（https://docs.univer.ai/guides/docs/features/core/general-api#%E4%BA%8B%E4%BB%B6%E9%A1%9E%E5%88%A5）
    // 雖然有列出很多事件，但是沒有在 univerAPI.Event 中的無法被有效觸發，可能是還需要導入或註冊某些 univer 的套件
    disposableList.push(
      univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (event) => {
        switch (event.stage) {
          case univerAPI.Enum.LifecycleStages.Starting:
            emits('univerStarting', event);
            break;
          case univerAPI.Enum.LifecycleStages.Ready:
            emits('univerReady', event);
            break;
          case univerAPI.Enum.LifecycleStages.Rendered:
            emits('univerRendered', event);
            break;
          case univerAPI.Enum.LifecycleStages.Steady:
            emits('univerSteady', event);
            break;
        }
      })
    );
    // disposableList.push(
    //   univerAPI.addEvent(univerAPI.Event.SheetEditStarted, (event) => {
    //     emits('univerChangeStart', event);
    //   })
    // );
    // disposableList.push(
    //   univerAPI.addEvent(univerAPI.Event.SheetEditChanging, (event) => {
    //     emits('univerChange', event);
    //   })
    // );
    // disposableList.push(
    //   univerAPI.addEvent(univerAPI.Event.SheetEditEnded, (event) => {
    //     console.log({ event });
    //     emits('univerChangeEnd', event);
    //   })
    // );
    if (overrideSnapshot) {
      currentDoc.value = univerAPI.createUniverDoc(overrideSnapshot as Partial<IDocumentData>);
    } else if (props.openFile) {
      const snapshot = await univerAPI.importDOCXToSnapshotAsync(props.openFile);

      currentDoc.value = univerAPI.createUniverDoc(snapshot as Partial<IDocumentData>);
    } else {
      currentDoc.value = univerAPI.createUniverDoc(props.doc);
    }

    univerInstance.univer = univer;
    univerInstance.univerAPI = univerAPI;
    univerInstance.LocaleType = LocaleType;
  } catch (error) {
    console.error(error);
  }

  loading.value = false;
}

function handleKeyDown() {
  if (univerInstance.univerAPI === null) return;

  const doc = univerInstance.univerAPI.getActiveDocument();
  if (doc === null) {
    console.error('doc is null');
    return;
  }
  const saveData = doc.getSnapshot();

  emits('update:doc', saveData);
  emits('change', saveData);
}

watch(
  () => props.locale,
  (newLocale) => {
    if (typeof univerInstance.univer?.setLocale === 'function') {
      const locale =
        newLocale === 'zhTW'
          ? univerInstance.LocaleType?.ZH_TW
          : univerInstance.LocaleType?.EN_US;
      if (typeof locale !== 'string') return;
      univerInstance.univer?.setLocale(locale);
    }
  }
);

const handleLocalImportEvent = (e: Event) => {
  const customEvent = e as CustomEvent;
  const detail = customEvent.detail;
  if (detail && detail.snapshot && detail.type === 'doc') {
    const currentUnitId = univerInstance.univerAPI?.getActiveDocument()?.getId();
    if (detail.unitId && currentUnitId && detail.unitId !== currentUnitId) {
      return; // 忽略不是由當前編輯器觸發的事件
    }
    if (univerInstance.univerAPI) {
      try {
        // 先建立新的文件，讓 Univer UI 自動切換過去
        currentDoc.value = univerInstance.univerAPI.createUniverDoc(detail.snapshot);
        
        // 註：不呼叫 disposeUnit()，避免 Univer 底層狀態殘留導致的 RxJS 錯誤。
      } catch (err) {
        console.error('Failed to replace document:', err);
      }
    }
  }
};

onMounted(() => {
  handleUniverDoc();
});

onBeforeUnmount(() => {
  disposableList.forEach((item) => {
    try {
      item.dispose?.();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  });
  if (typeof univerInstance.univer?.dispose === 'function') {
    univerInstance.univer?.dispose();
  }
  if (typeof univerInstance.univerAPI?.dispose === 'function') {
    univerInstance.univerAPI?.dispose();
  }
  univerInstance.univer = null;
  univerInstance.univerAPI = null;
});
</script>

<template>
  <div class="univer_docxs">
    <SkeletonLoader v-if="loading" :loading="true" class="univer_docxs-skeleton" />
    <div
      ref="container"
      class="univer_docxs-editor"
      @keydown="handleKeyDown"
      @univer-local-import-snapshot="handleLocalImportEvent"
    />
  </div>
</template>

<style lang="scss" scoped>
.univer_docxs {
  position: relative;
  height: 100%;

  &-skeleton {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
  }

  &-editor {
    height: 100%;
  }
}
</style>
