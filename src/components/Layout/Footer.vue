<script lang="ts" setup>
import { computed, onMounted } from 'vue';

const animation = computed(() => {
  return (window as any)['___IS_VUE_INITED__'] !== true;
});
const copyright = computed(() => {
  return `${new Date().getFullYear()} Parker Chen 的Vue實驗室. All rights reserved.`;
});

onMounted(() => {
  (window as any)['___IS_VUE_INITED__'] = true;
});
</script>

<template>
  <footer class="layout_footer" :css-animation="animation">
    <p class="layout_footer-copyright">&copy; {{ copyright }}</p>
  </footer>
</template>

<style lang="scss" scoped>
@keyframes footerEnterAnimation {
  from {
    opacity: 0;
    transform: translate(0px, 120px);
  }

  to {
    opacity: 1;
    transform: translate(0px, 0px);
  }
}

.layout_footer {
  // Display & Box Model
  padding: 32px 24px;
  margin-top: 60px;

  // Visual
  background: linear-gradient(to top, rgba(248, 249, 250, 0.8), transparent);
  border-top: 1px solid rgba(0, 0, 0, 0.05);

  &[css-animation='true'] {
    // Animation
    animation-name: footerEnterAnimation;
    animation-duration: 0.3s;
  }

  &-copyright {
    // Display & Box Model
    margin: 0;
    padding: 0;

    // Typography
    font-size: 14px;
    text-align: center;
    color: #6c757d;
    font-weight: 400;
  }
}
</style>
