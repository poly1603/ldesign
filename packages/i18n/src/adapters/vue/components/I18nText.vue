<script setup lang="ts">
import type { InterpolationParams, MessageKey } from '../../../types';
import { computed } from 'vue';
import { useI18n } from '../composables/useI18n';

interface Props {
  keypath: MessageKey;
  tag?: string;
  params?: InterpolationParams;
  locale?: string;
  plural?: number;
  defaultValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'span'
});

const { t, tc } = useI18n();

const translatedText = computed(() => {
  const options = {
    params: props.params,
    locale: props.locale,
    defaultValue: props.defaultValue
  };
  
  if (props.plural !== undefined) {
    return tc(props.keypath, props.plural, props.params);
  }
  
  return t(props.keypath, options);
});
</script>

<template>
  <component :is="tag">
    {{ translatedText }}
  </component>
</template>