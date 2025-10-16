<template>
  <div ref="containerRef" class="vue-picker-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits, defineExpose } from 'vue';
import { Picker, PickerOption, PickerConfig } from '../core/Picker';

// Props定义
const props = withDefaults(defineProps<{
  modelValue?: string | number;
  options: PickerOption[];
  disabled?: boolean;
  visibleItems?: number;
  itemHeight?: number;
  panelHeight?: number;
  theme?: 'light' | 'dark' | 'auto';
  enable3d?: boolean;
  showMask?: boolean;
  momentum?: boolean;
  friction?: number;
  snapDuration?: number;
  resistance?: number;
  maxOverscroll?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchDebounce?: number;
  highlightMatch?: boolean;
  hapticFeedback?: boolean;
  hapticIntensity?: number;
  soundEffects?: boolean;
  soundVolume?: number;
}>(), {
  disabled: false,
  visibleItems: 5,
  itemHeight: 36,
  theme: 'light',
  enable3d: false,
  showMask: true,
  momentum: true,
  friction: 0.92,
  snapDuration: 300,
  resistance: 0.3,
  searchable: false,
  searchPlaceholder: '搜索...',
  searchDebounce: 300,
  highlightMatch: true,
  hapticFeedback: false,
  hapticIntensity: 5,
  soundEffects: false,
  soundVolume: 0.3
});

// Emits定义
const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined];
  'change': [value: string | number | undefined, option?: PickerOption];
  'pick': [value: string | number | undefined, option?: PickerOption, trigger: string];
}>();

// Refs
const containerRef = ref<HTMLElement>();
let pickerInstance: Picker | null = null;

// 初始化Picker
const initPicker = () => {
  if (!containerRef.value) return;

  const config: PickerConfig = {
    options: props.options,
    value: props.modelValue,
    disabled: props.disabled,
    visibleItems: props.visibleItems,
    itemHeight: props.itemHeight,
    panelHeight: props.panelHeight,
    theme: props.theme,
    enable3d: props.enable3d,
    showMask: props.showMask,
    momentum: props.momentum,
    friction: props.friction,
    snapDuration: props.snapDuration,
    resistance: props.resistance,
    maxOverscroll: props.maxOverscroll,
    searchable: props.searchable,
    searchPlaceholder: props.searchPlaceholder,
    searchDebounce: props.searchDebounce,
    highlightMatch: props.highlightMatch,
    hapticFeedback: props.hapticFeedback,
    hapticIntensity: props.hapticIntensity,
    soundEffects: props.soundEffects,
    soundVolume: props.soundVolume,
    onChange: (value, option) => {
      emit('update:modelValue', value);
      emit('change', value, option);
    },
    onPick: (value, option, trigger) => {
      emit('pick', value, option, trigger);
    }
  };

  pickerInstance = new Picker(containerRef.value, config);
};

// 生命周期
onMounted(() => {
  initPicker();
});

onUnmounted(() => {
  if (pickerInstance) {
    pickerInstance.destroy();
    pickerInstance = null;
  }
});

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  if (pickerInstance && pickerInstance.getValue() !== newValue) {
    pickerInstance.setValue(newValue);
  }
});

watch(() => props.options, (newOptions) => {
  if (pickerInstance) {
    pickerInstance.setOptions(newOptions);
  }
}, { deep: true });

watch(() => props.disabled, (newDisabled) => {
  if (pickerInstance) {
    pickerInstance.setDisabled(newDisabled);
  }
});

// 暴露方法
defineExpose({
  scrollToIndex: (index: number, animate = true) => {
    pickerInstance?.scrollToIndex(index, animate);
  },
  scrollToValue: (value: string | number, animate = true) => {
    pickerInstance?.scrollToValue(value, animate);
  },
  getValue: () => {
    return pickerInstance?.getValue();
  },
  setValue: (value: string | number | undefined, animate = true) => {
    pickerInstance?.setValue(value, animate);
  }
});
</script>

<style scoped>
.vue-picker-wrapper {
  display: inline-block;
}
</style>