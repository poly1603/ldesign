<template>
  <button
    class="ldesign-theme-button"
    :class="[
      `theme-button--${type}`,
      `theme-button--${size}`,
      { 'theme-button--loading': loading },
      props.class
    ]"
    :style="props.style"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <span v-if="decoration" class="button-decoration" v-html="decoration"></span>
    <slot />
  </button>
</template>

<script setup lang="ts">
/**
 * @file ThemeButton 组件
 * @description 主题按钮组件，带有节日装饰效果
 */

import type { ThemeButtonProps } from '../types'

// 组件属性
const props = withDefaults(defineProps<ThemeButtonProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false
})

// 事件
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<style scoped>
.ldesign-theme-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.ldesign-theme-button:hover {
  border-color: var(--ldesign-brand-color-hover);
  background: var(--ldesign-bg-color-component-hover);
}

.ldesign-theme-button:active {
  background: var(--ldesign-bg-color-component-active);
}

.ldesign-theme-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 按钮类型 */
.theme-button--primary {
  background: var(--ldesign-brand-color);
  border-color: var(--ldesign-brand-color);
  color: var(--ldesign-font-white-1);
}

.theme-button--primary:hover {
  background: var(--ldesign-brand-color-hover);
  border-color: var(--ldesign-brand-color-hover);
}

.theme-button--primary:active {
  background: var(--ldesign-brand-color-active);
  border-color: var(--ldesign-brand-color-active);
}

.theme-button--secondary {
  background: transparent;
  border-color: var(--ldesign-brand-color);
  color: var(--ldesign-brand-color);
}

.theme-button--secondary:hover {
  background: var(--ldesign-brand-color-focus);
}

/* 按钮大小 */
.theme-button--small {
  height: var(--ls-button-height-small);
  padding: 0 var(--ls-padding-sm);
  font-size: var(--ls-font-size-xs);
}

.theme-button--medium {
  height: var(--ls-button-height-medium);
  padding: 0 var(--ls-padding-base);
  font-size: var(--ls-font-size-sm);
}

.theme-button--large {
  height: var(--ls-button-height-large);
  padding: 0 var(--ls-padding-lg);
  font-size: var(--ls-font-size-base);
}

/* 加载状态 */
.theme-button--loading {
  pointer-events: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 装饰元素 */
.button-decoration {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 12px;
  opacity: 0.8;
  pointer-events: none;
}
</style>
