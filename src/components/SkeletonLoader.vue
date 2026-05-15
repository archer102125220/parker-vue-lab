<script setup>
const props = defineProps({
  loading: { type: Boolean, default: false }
});
</script>

<template>
  <div v-bind="$attrs" class="skeleton_loader" :css-fadein="loading === false">
    <div v-if="loading" class="skeleton_loader-loading" />
    <slot v-else />
  </div>
</template>

<style lang="scss">
@keyframes loaded_fadein {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes skeleton_after_animation {
  0% {
    transform: scale(4) translate(-100%, -100%);
  }
  50% {
    transform: scale(4) translate(0, 0);
  }
  100% {
    transform: scale(4) translate(100%, 100%);
  }
}

.skeleton_loader {
  &[css-fadein='true'] {
    animation: loaded_fadein 0.5s ease-in-out;
  }

  &-loading {
    // Positioning
    position: relative;

    // Display & Box Model
    width: 100%;
    height: 100%;
    overflow: hidden;

    // Visual
    background: repeating-linear-gradient(126deg, #ededed, #dcdcdc, #ededed);

    &:after {
      // Positioning
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;

      // Display & Box Model
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 100%;

      // Visual
      background: repeating-linear-gradient(
        126deg,
        #ededed 30%,
        #dcdcdc 50%,
        #ededed 70%
      );

      // Misc
      content: '';

      // Animation
      animation: skeleton_after_animation 2.5s infinite linear;
    }
  }
}
</style>
