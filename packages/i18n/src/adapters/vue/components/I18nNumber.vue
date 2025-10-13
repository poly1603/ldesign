<template>
  <component :is="tag">
    <slot v-if="$slots.default" :formatted="formattedNumber" :value="value" />
    <template v-else>{{ formattedNumber }}</template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../composables';

interface Props {
  value: number;
  format?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  tag?: string;
  locale?: string;
}

const props = withDefaults(defineProps<Props>(), {
  format: 'decimal',
  currency: 'USD',
  minimumFractionDigits: undefined,
  maximumFractionDigits: undefined,
  tag: 'span',
  locale: undefined,
});

const { formatNumber, currentLocale } = useI18n();

const formattedNumber = computed(() => {
  const locale = props.locale || currentLocale.value;
  
  const options: Intl.NumberFormatOptions = {
    style: props.format,
  };

  if (props.format === 'currency') {
    options.currency = props.currency;
  }

  if (props.minimumFractionDigits !== undefined) {
    options.minimumFractionDigits = props.minimumFractionDigits;
  }

  if (props.maximumFractionDigits !== undefined) {
    options.maximumFractionDigits = props.maximumFractionDigits;
  }

  return formatNumber(props.value, locale, options);
});
</script>