<template>
  <button
    :class="buttonClass"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-loading">⟳</span>
    <slot v-if="!loading" />
    <span v-if="loading">{{ loadingText }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  block?: boolean
  round?: boolean
}>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  loadingText: '加载中...',
  block: false,
  round: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 计算样式类
const buttonClass = computed(() => [
  'ld-btn',
  `ld-btn--${props.type}`,
  `ld-btn--${props.size}`,
  {
    'ld-btn--disabled': props.disabled,
    'ld-btn--loading': props.loading,
    'ld-btn--block': props.block,
    'ld-btn--round': props.round
  }
])

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.ld-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: var(--ld-border-radius, 6px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  vertical-align: middle;
}

.ld-btn:focus {
  box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.2);
}

/* 类型样式 */
.ld-btn--primary {
  background-color: var(--ld-color-primary, #722ed1);
  color: white;
  border-color: var(--ld-color-primary, #722ed1);
}

.ld-btn--primary:hover:not(.ld-btn--disabled):not(.ld-btn--loading) {
  background-color: var(--ld-color-primary-hover, #5e2aa7);
  border-color: var(--ld-color-primary-hover, #5e2aa7);
}

.ld-btn--secondary {
  background-color: transparent;
  color: var(--ld-color-text, #333);
  border-color: var(--ld-color-border, #d9d9d9);
}

.ld-btn--secondary:hover:not(.ld-btn--disabled):not(.ld-btn--loading) {
  background-color: var(--ld-color-bg-hover, #f5f5f5);
  border-color: var(--ld-color-primary, #722ed1);
  color: var(--ld-color-primary, #722ed1);
}

.ld-btn--success {
  background-color: var(--ld-color-success, #52c41a);
  color: white;
  border-color: var(--ld-color-success, #52c41a);
}

.ld-btn--success:hover:not(.ld-btn--disabled):not(.ld-btn--loading) {
  background-color: var(--ld-color-success-hover, #389e0d);
  border-color: var(--ld-color-success-hover, #389e0d);
}

.ld-btn--warning {
  background-color: var(--ld-color-warning, #faad14);
  color: white;
  border-color: var(--ld-color-warning, #faad14);
}

.ld-btn--warning:hover:not(.ld-btn--disabled):not(.ld-btn--loading) {
  background-color: var(--ld-color-warning-hover, #d48806);
  border-color: var(--ld-color-warning-hover, #d48806);
}

.ld-btn--danger {
  background-color: var(--ld-color-danger, #ff4d4f);
  color: white;
  border-color: var(--ld-color-danger, #ff4d4f);
}

.ld-btn--danger:hover:not(.ld-btn--disabled):not(.ld-btn--loading) {
  background-color: var(--ld-color-danger-hover, #ff1f23);
  border-color: var(--ld-color-danger-hover, #ff1f23);
}

/* 尺寸样式 */
.ld-btn--small {
  padding: 4px 12px;
  font-size: 12px;
  height: 28px;
}

.ld-btn--medium {
  padding: 8px 16px;
  font-size: 14px;
  height: 36px;
}

.ld-btn--large {
  padding: 12px 20px;
  font-size: 16px;
  height: 44px;
}

/* 状态样式 */
.ld-btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ld-btn--loading {
  cursor: wait;
}

.ld-btn--block {
  width: 100%;
}

.ld-btn--round {
  border-radius: 50px;
}

/* 加载动画 */
.btn-loading {
  display: inline-block;
  margin-right: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
