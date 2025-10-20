<script setup lang="ts">
import type { OptimizedI18n } from '../../../core';
import { provide, watch } from 'vue';
import { I18N_INJECTION_KEY } from '../constants';

interface Props {
  i18n: OptimizedI18n;
  locale?: string;
}

const props = withDefaults(defineProps<Props>(), {
  locale: undefined,
});

// Provide i18n instance to child components
provide(I18N_INJECTION_KEY, props.i18n);

// Watch for locale changes
watch(
  () => props.locale,
  (newLocale) => {
    if (newLocale && props.i18n.currentLocale !== newLocale) {
      props.i18n.changeLocale(newLocale);
    }
  },
  { immediate: true }
);
</script>

<template>
  <slot />
</template>