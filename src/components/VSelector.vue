<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted, type CSSProperties } from 'vue';

const props = withDefaults(
  defineProps<{
    ripple?: boolean;
    returnObject?: boolean;
    modelValue?: string | number | null;
    label?: string | null;
    value?: string | number | null;
    displayKey?: string;
    valueKey?: string;
    menuFullWidth?: boolean;
    ariaLabel?: string;
    optionList?: unknown[];
  }>(),
  {
    ripple: true,
    returnObject: false,
    modelValue: null,
    label: null,
    value: null,
    displayKey: 'label',
    valueKey: 'value',
    menuFullWidth: false,
    ariaLabel: 'Selector',
    optionList: () => []
  }
);

const emits = defineEmits<{
  (e: 'update:modelValue', value: unknown): void;
  (e: 'update:value', value: unknown): void;
  (e: 'change', value: unknown): void;
}>();

const isOpen = ref(false);
const buttonRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const menuStyle = ref<CSSProperties>({});

const cssVariable = computed(() => ({
  '--v_selector_menu_width': props.menuFullWidth === true ? '100%' : 'auto'
}));
const propValue = computed(() => props.modelValue || props.value);
const currentValue = computed(() => {
  return props.optionList.find(
    (option) => getValue(option) === propValue.value
  );
});

function getValue(item: unknown): string | number {
  if (typeof item === 'object' && item !== null) {
    const record = item as unknown as Record<string, unknown>;
    return (record[props.valueKey] ?? record.value ?? item) as string | number;
  }
  return item as string | number;
}

function getLabel(item: unknown): string | number {
  if (typeof item === 'object' && item !== null) {
    const record = item as unknown as Record<string, unknown>;
    return (record[props.displayKey] ?? record.label ?? item) as
      | string
      | number;
  }
  return item as string | number;
}

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function closeMenu() {
  isOpen.value = false;
}

function handleChange(newValue: unknown) {
  const oldValue = currentValue.value;
  if (props.returnObject === true) {
    emits('update:modelValue', newValue);
    emits('update:value', newValue);
    emits('change', newValue);
  } else {
    emits('update:modelValue', getValue(newValue));
    emits('update:value', getValue(newValue));
    emits('change', getValue(newValue));
  }
  if (getValue(oldValue) !== getValue(newValue)) {
    closeMenu();
  }
}

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function handleClickOutside(event: MouseEvent) {
  if (!buttonRef.value || !menuRef.value) return;

  if (
    !buttonRef.value.contains(event.target as unknown as Node) &&
    !menuRef.value.contains(event.target as unknown as Node)
  ) {
    closeMenu();
  }
}
</script>

<template>
  <div class="v_selector" :style="cssVariable">
    <button
      ref="buttonRef"
      v-ripple="ripple"
      class="v_selector-button"
      :aria-label="ariaLabel"
      @click="toggleMenu"
    >
      <slot :is-open="isOpen">
        <slot name="label" :is-open="isOpen">
          <label class="v_selector-button-label">
            {{ label }}
          </label>
        </slot>
        <slot name="value" :is-open="isOpen">
          <span> {{ propValue }} </span>
        </slot>
      </slot>
    </button>

    <div v-if="isOpen" ref="menuRef" class="v_selector-menu" :style="menuStyle">
      <div class="v_selector-menu-backdrop" @click="closeMenu" />
      <div class="v_selector-menu-content">
        <button
          v-for="option in optionList"
          :key="getValue(option)"
          v-ripple="ripple"
          class="v_selector-menu-item"
          :class="{
            'v_selector-menu-item-active':
              getValue(currentValue) === getValue(option)
          }"
          @click="handleChange(option)"
        >
          {{ getLabel(option) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.v_selector {
  // Positioning
  position: relative;

  &-button {
    // Display & Box Model
    display: flex;
    align-items: center;
    // justify-content: center;
    width: 100%;
    padding: 8px;
    border: none;

    // Visual
    background: transparent;
    cursor: pointer;

    // Animation
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    &-label {
      margin-right: 16px;
      color: inherit;
      letter-spacing: 0.009375em;
      text-overflow: ellipsis;
      white-space: nowrap;

      opacity: var(--v-medium-emphasis-opacity);
      overflow: hidden;
    }
  }

  &-menu {
    // Positioning
    position: absolute;
    right: 0;
    z-index: 2;

    width: var(--v_selector_menu_width);

    &-backdrop {
      // Positioning
      position: fixed;
      top: 0;
      left: 0;
      z-index: -1;

      // Display & Box Model
      width: 100vw;
      height: 100vh;

      // Visual
      background: transparent;
    }

    &-content {
      // Display & Box Model
      min-width: 120px;
      padding: 8px 0;
      border-radius: 8px;

      // Visual
      background: white;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

      // Animation
      animation: v-selector-fade-in 0.2s ease;
    }

    &-item {
      // Display & Box Model
      display: block;
      width: 100%;
      padding: 12px 20px;
      border: none;

      // Typography
      text-align: left;
      font-size: 14px;
      color: #2d3748;

      // Visual
      background: transparent;
      cursor: pointer;

      // Animation
      transition: background-color 0.2s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      &-active {
        // Typography
        font-weight: 600;
        color: #44a08d;

        // Visual
        background: rgba(68, 160, 141, 0.1);
      }
    }
  }
}

@keyframes v-selector-fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
