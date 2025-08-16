<script setup lang="ts">
import { computed } from 'vue'
import { useSize } from '../../../../src/vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'outline'
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'primary',
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 使用尺寸系统
const { currentConfig } = useSize({ global: true })

// 根据当前尺寸配置计算按钮高度
const buttonHeight = computed(() => {
  return currentConfig.value.component.buttonHeight[props.size]
})

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    class="custom-button"
    :class="[
      `custom-button--${size}`,
      `custom-button--${variant}`,
      { 'custom-button--loading': loading },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner" />
    <slot />
  </button>
</template>

<style scoped>
.custom-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ls-spacing-xs, 4px);
  border: 1px solid transparent;
  border-radius: var(--ls-border-radius-base, 4px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.custom-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 尺寸变体 */
.custom-button--small {
  height: var(--ls-button-height-small, 28px);
  padding: 0 var(--ls-spacing-sm, 8px);
  font-size: var(--ls-font-size-xs, 12px);
}

.custom-button--medium {
  height: var(--ls-button-height-medium, 36px);
  padding: 0 var(--ls-spacing-base, 16px);
  font-size: var(--ls-font-size-sm, 14px);
}

.custom-button--large {
  height: var(--ls-button-height-large, 44px);
  padding: 0 var(--ls-spacing-lg, 24px);
  font-size: var(--ls-font-size-base, 16px);
}

/* 样式变体 */
.custom-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.custom-button--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--ls-shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.15));
}

.custom-button--secondary {
  background: var(--ls-bg-secondary, #f5f5f5);
  color: var(--ls-text-primary, #333);
  border-color: var(--ls-border-default, #d9d9d9);
}

.custom-button--secondary:hover:not(:disabled) {
  background: var(--ls-bg-hover, #e6e6e6);
  border-color: var(--ls-border-hover, #40a9ff);
}

.custom-button--outline {
  background: transparent;
  color: #667eea;
  border-color: #667eea;
}

.custom-button--outline:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.1);
  border-color: #764ba2;
  color: #764ba2;
}

/* 加载状态 */
.custom-button--loading {
  pointer-events: none;
}

.loading-spinner {
  width: 14px;
  height: 14px;
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

/* 响应式 */
@media (max-width: 768px) {
  .custom-button--large {
    height: var(--ls-button-height-medium, 36px);
    padding: 0 var(--ls-spacing-base, 16px);
    font-size: var(--ls-font-size-sm, 14px);
  }
}
</style>
