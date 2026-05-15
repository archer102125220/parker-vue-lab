<template>
  <!-- <v-progress-linear
    v-if="loading"
    :height="height"
    indeterminate
    color="primary"
    class="loading_bar"
    :style="`--loading_width:${width};--loading_position:${position}`"
  /> -->
  <div v-if="loading" class="loading_bar" :style="cssVariable" />
</template>
<script setup>
const props = defineProps({
  loading: { type: Boolean, default: false },
  position: { type: String, default: 'absolute' },
  color: { type: String, default: 'var(--primary)' },
  top: { type: [String, Number], default: '0' },
  bottom: { type: [String, Number], default: null },
  left: { type: [String, Number], default: '0' },
  right: { type: [String, Number], default: null },
  zIndex: { type: [String, Number], default: '10' },
  height: { type: [String, Number], default: '6' },
  width: { type: [String, Number], default: '100%' }
});
const cssVariable = computed(() => {
  const newCssVariable = {
    '--loading_position': props.position,
    '--loading_color': props.color
  };

  let height = '6px';
  if (typeof props.height === 'number' || /^\d+$/.test(props.height)) {
    height = `${props.height}px`;
  } else if (typeof props.height === 'string') {
    height = props.height;
  }
  newCssVariable['--loading_height'] = height;

  let width = '100%';
  if (typeof props.width === 'number' || /^\d+$/.test(props.width)) {
    width = `${props.width}px`;
  } else if (typeof props.width === 'string') {
    width = props.width;
  }
  newCssVariable['--loading_width'] = width;

  let top = null;
  if (typeof props.top === 'number' || /^\d+$/.test(props.top)) {
    top = `${props.top}px`;
  } else if (typeof props.top === 'string') {
    top = props.top;
  }
  if (top !== null) {
    newCssVariable['--loading_top'] = top;
  }

  let bottom = null;
  if (typeof props.bottom === 'number' || /^\d+$/.test(props.bottom)) {
    bottom = `${props.bottom}px`;
  } else if (typeof props.bottom === 'string') {
    bottom = props.bottom;
  }
  newCssVariable['--loading_bottom'] = bottom;

  let left = null;
  if (typeof props.left === 'number' || /^\d+$/.test(props.left)) {
    left = `${props.left}px`;
  } else if (typeof props.left === 'string') {
    left = props.left;
  }
  if (left !== null) {
    newCssVariable['--loading_left'] = left;
  }

  let right = null;
  if (typeof props.right === 'number' || /^\d+$/.test(props.right)) {
    right = `${props.right}px`;
  } else if (typeof props.right === 'string') {
    right = props.right;
  }
  newCssVariable['--loading_right'] = right;

  let zIndex = 10;
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
