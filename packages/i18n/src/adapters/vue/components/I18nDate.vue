<template>
  <component :is="tag">
    <slot v-if="$slots.default" :formatted="formattedDate" :value="value" />
    <template v-else>{{ formattedDate }}</template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../composables';

interface Props {
  value: Date | string | number;
  format?: 'short' | 'medium' | 'long' | 'full';
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  showTime?: boolean;
  tag?: string;
  locale?: string;
}

const props = withDefaults(defineProps<Props>(), {
  format: 'medium',
  dateStyle: undefined,
  timeStyle: undefined,
  showTime: false,
  tag: 'span',
  locale: undefined,
});

const { formatDate, currentLocale } = useI18n();

const formattedDate = computed(() => {
  const locale = props.locale || currentLocale.value;
  
  // Convert value to Date if needed
  let dateValue: Date;
  if (props.value instanceof Date) {
    dateValue = props.value;
  } else if (typeof props.value === 'string' || typeof props.value === 'number') {
    dateValue = new Date(props.value);
  } else {
    dateValue = new Date();
  }

  const options: Intl.DateTimeFormatOptions = {};

  // Use specific dateStyle and timeStyle if provided
  if (props.dateStyle) {
    options.dateStyle = props.dateStyle;
  }
  
  if (props.timeStyle) {
    options.timeStyle = props.timeStyle;
  }

  // If neither dateStyle nor timeStyle are provided, use format preset
  if (!props.dateStyle && !props.timeStyle) {
    switch (props.format) {
      case 'short':
        options.dateStyle = 'short';
        if (props.showTime) options.timeStyle = 'short';
        break;
      case 'medium':
        options.dateStyle = 'medium';
        if (props.showTime) options.timeStyle = 'medium';
        break;
      case 'long':
        options.dateStyle = 'long';
        if (props.showTime) options.timeStyle = 'long';
        break;
      case 'full':
        options.dateStyle = 'full';
        if (props.showTime) options.timeStyle = 'full';
        break;
    }
  }

  return formatDate(dateValue, locale, options);
});
</script>