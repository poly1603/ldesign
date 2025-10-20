<script setup lang="ts">
import type { TranslateOptions } from '../../../types';
import { computed } from 'vue';
import { useI18n } from '../composables';

interface Props {
  keypath: string;
  values?: Record<string, any>;
  count?: number;
  context?: string;
  defaultValue?: string;
  tag?: string;
  locale?: string;
}

const props = withDefaults(defineProps<Props>(), {
  values: undefined,
  count: undefined,
  context: undefined,
  defaultValue: undefined,
  tag: 'span',
  locale: undefined,
});

const { t, currentLocale } = useI18n();

const translatedText = computed(() => {
  const options: TranslateOptions = {
    values: props.values,
    count: props.count,
    context: props.context,
    defaultValue: props.defaultValue,
  };

  // Use provided locale or current locale
  const locale = props.locale || currentLocale.value;
  
  return t(props.keypath, options, locale);
});
</script>

<template>
  <component :is="tag">
    <slot v-if="$slots.default" :text="translatedText" :values="values" />
    <template v-else>
      {{ translatedText }}
    </template>
  </component>
</template>