<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    position?: string;
    color?: string;
    top?: string | number | null;
    bottom?: string | number | null;
    left?: string | number | null;
    right?: string | number | null;
    zIndex?: string | number;
    height?: string | number;
    width?: string | number;
  }>(),
  {
    loading: false,
    position: 'absolute',
    color: 'var(--primary)',
    top: '0',
    bottom: null,
    left: '0',
    right: null,
    zIndex: '10',
    height: '6',
    width: '100%'
  }
);

const cssVariable = computed(() => {
  const newCssVariable: Record<string, string | number> = {
    '--loading_position': props.position,
    '--loading_color': props.color
  };

  let height = '6px';
  if (
    typeof props.height === 'number' ||
    (typeof props.height === 'string' && /^\d+$/.test(props.height))
  ) {
    height = `${props.height}px`;
  } else if (typeof props.height === 'string') {
    height = props.height;
  }
  newCssVariable['--loading_height'] = height;

  let width = '100%';
  if (
    typeof props.width === 'number' ||
    (typeof props.width === 'string' && /^\d+$/.test(props.width))
  ) {
    width = `${props.width}px`;
  } else if (typeof props.width === 'string') {
    width = props.width;
  }
  newCssVariable['--loading_width'] = width;

  let top: string | null = null;
  if (
    typeof props.top === 'number' ||
    (typeof props.top === 'string' && /^\d+$/.test(props.top))
  ) {
    top = `${props.top}px`;
  } else if (typeof props.top === 'string') {
    top = props.top;
  }
  if (top !== null) {
    newCssVariable['--loading_top'] = top;
  }

  let bottom: string | null = null;
  if (
    typeof props.bottom === 'number' ||
    (typeof props.bottom === 'string' && /^\d+$/.test(props.bottom))
  ) {
    bottom = `${props.bottom}px`;
  } else if (typeof props.bottom === 'string') {
    bottom = props.bottom;
  }
  if (bottom !== null) {
    newCssVariable['--loading_bottom'] = bottom;
  }

  let left: string | null = null;
  if (
    typeof props.left === 'number' ||
    (typeof props.left === 'string' && /^\d+$/.test(props.left))
  ) {
    left = `${props.left}px`;
  } else if (typeof props.left === 'string') {
    left = props.left;
  }
  if (left !== null) {
    newCssVariable['--loading_left'] = left;
  }

  let right: string | null = null;
  if (
    typeof props.right === 'number' ||
    (typeof props.right === 'string' && /^\d+$/.test(props.right))
  ) {
    right = `${props.right}px`;
  } else if (typeof props.right === 'string') {
    right = props.right;
  }
  if (right !== null) {
    newCssVariable['--loading_right'] = right;
  }

  let zIndex: string | number = 10;
  if (
    typeof props.zIndex === 'number' ||
    (typeof props.zIndex === 'string' && /^\d+$/.test(props.zIndex))
  ) {
    zIndex = props.zIndex;
  }
  newCssVariable['--loading_zIndex'] = zIndex;

  return newCssVariable;
});
</script>

<template>
  <div v-if="loading" class="loading_bar" :style="cssVariable" />
</template>

<style lang="scss" scoped>
.loading_bar {
  // Positioning
  position: var(--loading_position);
  top: var(--loading_top);
  bottom: var(--loading_bottom);
  left: var(--loading_left);
  right: var(--loading_right);
  z-index: var(--loading_zIndex);

  // Display & Box Model
  width: var(--loading_width);
  height: var(--loading_height);
  border-radius: 2px;
  overflow: hidden;

  // Visual
  background-color: rgb(217 217 217 / 25%);

  // Animation
  transition: 0.4s linear;
  transition-property: width, background-color;

  &::after {
    // Display & Box Model
    display: block;
    width: 50%;
    height: var(--loading_height);

    // Visual
    background-color: $primary;

    // Animation
    animation: progressAnimationStrike 1.5s infinite;

    // Misc
    content: '';
  }
}

@keyframes progressAnimationStrike {
  from {
    transform: translateX(-150%);
  }

  to {
    transform: translateX(250%);
  }
}
</style>
