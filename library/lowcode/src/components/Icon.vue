<template>
  <component
    :is="iconComponent"
    :size="actualSize"
    :stroke-width="strokeWidth"
    :color="color"
    :class="['icon-wrapper', customClass]"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as LucideIcons from 'lucide-vue-next';
import { ICON_SIZES, type IconSize } from '../config/icons';

/**
 * Icon 组件属性
 */
interface IconProps {
  /** 图标名称（lucide 图标名） */
  name: string;
  /** 图标尺寸 */
  size?: IconSize | number;
  /** 线条宽度 */
  strokeWidth?: number;
  /** 图标颜色 */
  color?: string;
  /** 自定义类名 */
  customClass?: string;
}

const props = withDefaults(defineProps<IconProps>(), {
  size: 'md',
  strokeWidth: 2,
  color: 'currentColor',
  customClass: ''
});

/**
 * 获取图标组件
 */
const iconComponent = computed(() => {
  // 将图标名转换为 PascalCase（如果需要）
  const iconName = props.name;
  
  // 从 lucide-vue-next 中获取图标组件
  const icon = (LucideIcons as any)[iconName];
  
  if (!icon) {
    console.warn(`Icon "${iconName}" not found in lucide-vue-next`);
    // 返回一个默认图标
    return LucideIcons.HelpCircle;
  }
  
  return icon;
});

/**
 * 计算实际尺寸
 */
const actualSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size;
  }
  return ICON_SIZES[props.size] || ICON_SIZES.md;
});
</script>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>


