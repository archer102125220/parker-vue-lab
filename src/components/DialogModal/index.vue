<template>
  <v-dialog
    v-bind="dialogProps"
    scroll-strategy="none"
    :model-value="computedTrigger"
    :width="width || undefined"
    @update:model-value="handleChange"
  >
    <component
      :is="contentComponent"
      :key="content"
      :class="computedContentClass"
      :style="cssVariable"
      v-bind="contentProps"
      @close="() => handleChange(false)"
    />
  </v-dialog>
</template>

<script lang="ts" setup>
import {
  shallowRef,
  ref,
  computed,
  watch,
  defineAsyncComponent,
  nextTick,
  type Component
} from 'vue';
import { type BrowserInfo } from '@src/store/system';

const modules: Record<string, () => Promise<unknown>> = {
  ...import.meta.glob('@src/components/DialogModal/*.vue'),
  ...import.meta.glob('@src/components/DialogModal/*/*.vue')
};

defineOptions({
  inheritAttrs: false
});

// https://cn.vuejs.org/guide/components/v-model#v-model-arguments
// const modelTrigger = defineModel('trigger', { default: false });
const modelTrigger = defineModel<boolean>({ default: false });

interface DialogProps {
  width?: string | number | null;
  content?: string | null;
  bgColor?: string;
  radius?: string;
  contentClass?: string | string[] | Record<string, boolean> | null;
  contentProps?: Record<string, unknown> | null;
  broswerInfo?: BrowserInfo | null;
  dialogProps?: Record<string, unknown> | null;
}

const props = withDefaults(defineProps<DialogProps>(), {
  width: null,
  content: null,
  bgColor: '#fff',
  radius: '4px',
  contentClass: null,
  contentProps: null,
  broswerInfo: null,
  dialogProps: null
});

interface HandleTriggerPayload {
  trigger?: boolean;
  width?: string | number | null;
  bgColor?: string;
  radius?: string;
  content?: string | null;
  contentClass?: string | string[] | Record<string, boolean> | null;
  contentProps?: Record<string, unknown> | null;
  broswerInfo?: Record<string, unknown> | null;
  dialogProps?: Record<string, unknown> | null;
}

const emit = defineEmits<{
  (e: 'handleTrigger', payload: HandleTriggerPayload, newValue: boolean): void;
}>();

const contentComponent = shallowRef<Component | null>(null);

const stateTrigger = ref(false);
const contentComponentLoaded = ref(false);

const computedContentClass = computed(() => {
  const defalutClass = 'dialog_content';
  if (typeof props.contentClass === 'string' && props.contentClass !== '') {
    return `${defalutClass} ${props.contentClass}`;
  } else if (
    Array.isArray(props.contentClass) &&
    props.contentClass.length > 0
  ) {
    return [defalutClass, ...props.contentClass];
  } else if (
    typeof props.contentClass === 'object' &&
    props.contentClass !== null
  ) {
    const _contentClass: string[] = [defalutClass];
    const classObj = props.contentClass as Record<string, boolean>;
    Object.keys(classObj).forEach((key) => {
      if (classObj[key] !== false) {
        _contentClass.push(key);
      }
    });
    return _contentClass;
  }

  return defalutClass;
});

const cssVariable = computed(() => {
  const _cssVariable: Record<string, string | number> = {};

  _cssVariable['--dialog_content_opacity'] =
    contentComponentLoaded.value === true ? 1 : 0;

  // if (typeof props.bgColor === 'string') {
  //   _cssVariable['--dialog_bg_color'] = props.bgColor;
  // }

  // if (typeof props.radius === 'string') {
  //   _cssVariable['--dialog_radius'] = props.radius;
  // }

  return _cssVariable;
});

const computedTrigger = computed(
  () => modelTrigger.value || stateTrigger.value
);

watch(
  () => props.content,
  async (newContent) => {
    const contentName =
      typeof newContent === 'string' && newContent.includes('.vue') === false
        ? `${newContent}.vue`
        : newContent;

    if (typeof newContent === 'string' && newContent !== '') {
      const importFn = modules[
        `/components/DialogModal/${contentName}`
      ] as unknown as () => Promise<Component>;
      contentComponent.value = defineAsyncComponent(importFn);
      stateTrigger.value = true;
      modelTrigger.value = true;
      await nextTick();
      contentComponentLoaded.value = true;
    } else {
      contentComponentLoaded.value = false;
      stateTrigger.value = false;
      modelTrigger.value = false;
      document
        .querySelectorAll('html,body')
        .forEach((element) => ((element as HTMLElement).style.overflow = ''));
      contentComponent.value = null;
      emit(
        'handleTrigger',
        {
          trigger: false,
          // value: false,
          width: null,
          bgColor: '#fff',
          radius: '4px',
          content: null,
          contentClass: null,
          contentProps: null,
          dialogProps: null
        },
        false
      );
    }
  },
  { immediate: true }
);

async function handleChange(newValue: boolean) {
  stateTrigger.value = false;
  modelTrigger.value = false;

  await new Promise((resolve) => nextTick(() => setTimeout(resolve, 100)));

  let payload: HandleTriggerPayload;
  if (newValue === false) {
    payload = {
      trigger: false,
      // value: false,
      width: null,
      bgColor: '#fff',
      radius: '4px',
      content: null,
      contentClass: null,
      contentProps: null,
      dialogProps: null
    };
  } else {
    payload = JSON.parse(
      JSON.stringify(props)
    ) as unknown as HandleTriggerPayload;
  }
  emit('handleTrigger', payload, newValue);
}
</script>

<style lang="scss" scoped>
.dialog_content {
  --dialog_content_opacity: 1;
  --dialog_bg_color: #fff;
  --dialog_radius: 4px;

  // Display & Box Model
  overflow-y: auto;
  border-radius: var(--dialog_radius);

  // Visual
  background: var(--dialog_bg_color);
  opacity: var(--dialog_content_opacity);
  box-shadow:
    0 0.6875rem 0.9375rem -0.4375rem
      var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
    0 1.5rem 2.375rem 0.1875rem
      var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
    0 0.5625rem 2.875rem 0.5rem
      var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12));
}
</style>
