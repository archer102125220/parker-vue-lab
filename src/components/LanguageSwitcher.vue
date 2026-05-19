<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSwitchLocalePath } from 'vue-i18n-routing';

import VSelector from '@src/components/VSelector.vue';

const router = useRouter();
const { locale } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const isOpen = ref(false);
const buttonRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);

const localeList = computed(() => [
  { code: 'en', label: 'en' },
  { code: 'zh', label: 'zh-tw' }
]);

function closeMenu() {
  isOpen.value = false;
}

function handleLanguageSwitch(newLang: unknown) {
  let newLangCode = 'zh';
  if (typeof newLang === 'object' && newLang !== null) {
    newLangCode = (newLang as unknown as Record<string, string>).code || 'zh';
  } else if (typeof newLang === 'string') {
    newLangCode = newLang;
  }
  const path = switchLocalePath(newLangCode);
  router.replace(path);
  closeMenu();
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
  <div class="language_switcher">
    <VSelector class="language_switcher-button" aria-label="Language Switcher" value-key="code" display-key="label"
      :return-object="true" :value="locale" :option-list="localeList" @update:value="handleLanguageSwitch">
      <img src="/img/i18n/i18n.v-04.webp" alt="i18n" class="language_switcher-button-icon" />
    </VSelector>
  </div>
</template>

<style lang="scss" scoped>
.language_switcher {
  &-button {
    border-radius: 50%;

    &-icon {
      // Display & Box Model
      width: 20px;
      height: 20px;

      // Visual
      object-fit: contain;
    }
  }
}
</style>
