<script lang="ts">
import {
  createSheetInstance,
  type univerInstanceRef
} from '@src/utils/third-party/univer';
</script>

<script lang="ts" setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount } from 'vue';

import SkeletonLoader from '@src/components/SkeletonLoader.vue';

defineOptions({
  inheritAttrs: false
});

const disposableList = [];

const props = defineProps({
  locale: {
    type: String,
    default() {
      return 'zhTW';
    }
  },
  value: {
    type: Object,
    default: () => ({
      id: 'dQaYwz',
      sheetOrder: ['vYn9cBtHzC_Yp1qUiZSj2'],
      name: '',
      appVersion: '0.22.1',
      locale: 'zhCN',
      styles: {},
      sheets: {
        vYn9cBtHzC_Yp1qUiZSj2: {
          id: 'vYn9cBtHzC_Yp1qUiZSj2',
          name: 'Sheet1',
          tabColor: '',
          hidden: 0,
          rowCount: 1000,
          columnCount: 20,
          zoomRatio: 1,
          freeze: {
            xSplit: 0,
            ySplit: 0,
            startRow: -1,
            startColumn: -1
          },
          scrollTop: 0,
          scrollLeft: 0,
          defaultColumnWidth: 88,
          defaultRowHeight: 24,
          mergeData: [],
          cellData: {
            0: {
              0: {
                v: '測試預設資料',
                t: 1
              }
            }
          },
          rowData: {},
          columnData: {},
          showGridlines: 1,
          rowHeader: {
            width: 46,
            hidden: 0
          },
          columnHeader: {
            height: 20,
            hidden: 0
          },
          rightToLeft: 0
        }
      },
      resources: [
        {
          name: 'SHEET_RANGE_PROTECTION_PLUGIN',
          data: ''
        },
        {
          name: 'SHEET_AuthzIoMockService_PLUGIN',
          data: '{}'
        },
        {
          name: 'SHEET_WORKSHEET_PROTECTION_PLUGIN',
          data: '{}'
        },
        {
          name: 'SHEET_WORKSHEET_PROTECTION_POINT_PLUGIN',
          data: '{}'
        },
        {
          name: 'SHEET_DRAWING_PLUGIN',
          data: '{}'
        },
        {
          name: 'SHEET_DEFINED_NAME_PLUGIN',
          data: ''
        },
        {
          name: 'SHEET_RANGE_THEME_MODEL_PLUGIN',
          data: '{}'
        }
      ]
    })
  },
  workbook: {
    type: Object,
    default: () => ({})
  },
  worksheet: {
    type: Object,
    default: () => ({})
  }
});
const emits = defineEmits([
  'update:value',
  'update:workbook',
  'update:worksheet',
  'univerStarting',
  'univerReady',
  'univerRendered',
  'univerSteady',
  'univerChangeStart',
  'univerChange',
  'univerChangeEnd'
]);

const currentWorkbook = ref({});

const container = ref<HTMLDivElement | null>(null);
const loading = ref(true);

const univerInstance = reactive<univerInstanceRef>({
  univer: null,
  univerAPI: null,
  LocaleType: null
});

async function handleUniverSheet() {
  try {
    if (container.value instanceof HTMLElement === false) return;

    const { univer, univerAPI, LocaleType } = await createSheetInstance(
      container.value,
      props.locale,
      false
    );

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
    disposableList.push(
      univerAPI.addEvent(univerAPI.Event.SheetEditStarted, (event) => {
        emits('univerChangeStart', event);
      })
    );
    disposableList.push(
      univerAPI.addEvent(univerAPI.Event.SheetEditChanging, (event) => {
        emits('univerChange', event);
      })
    );
    disposableList.push(
      univerAPI.addEvent(univerAPI.Event.SheetEditEnded, (event) => {
        emits('univerChangeEnd', event);
        emits('update:value', event?.workbook?.save());
        emits('update:workbook', event?.workbook);
        emits('update:worksheet', event?.worksheet);
      })
    );
    currentWorkbook.value = univerAPI.createWorkbook(props.value);

    univerInstance.univer = univer;
    univerInstance.univerAPI = univerAPI;
    univerInstance.LocaleType = LocaleType;
  } catch (error) {
    console.error(error);
  }

  loading.value = false;
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

onMounted(() => {
  handleUniverSheet();
});

onBeforeUnmount(() => {
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
  <div class="univer_sheet">
    <SkeletonLoader
      v-if="loading"
      :loading="true"
      class="univer_sheet-skeleton"
    />
    <div ref="container" class="univer_sheet-editor" />
  </div>
</template>

<style lang="scss" scoped>
.univer_sheet {
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
