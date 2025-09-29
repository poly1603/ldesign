<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="l-button__loading">
      <svg class="l-button__loading-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>
    </span>
    <span v-if="icon && !loading" :class="['l-button__icon', `l-button__icon--${iconPosition}`]">
      <slot name="icon">{{ icon }}</slot>
    </span>
    <span v-if="$slots.default" class="l-button__text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
/**
 * Button 按钮组件 - Vue3 版本
 * 
 * 使用 Composition API 和 <script setup> 语法
 * 提供多种样式和状态的按钮组件
 * 支持图标、加载状态、禁用状态等功能
 */
import { computed } from 'vue'

// 定义组件名称
defineOptions({
  name: 'LButton'
})

// 定义 Props 类型
export interface ButtonProps {
  /** 按钮类型 */
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'text'
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否为块级按钮 */
  block?: boolean
  /** 是否为圆形按钮 */
  round?: boolean
  /** 是否为圆角按钮 */
  circle?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 图标 */
  icon?: string
  /** 图标位置 */
  iconPosition?: 'left' | 'right'
}

// 定义 Props 默认值
const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'primary',
  size: 'medium',
  block: false,
  round: false,
  circle: false,
  disabled: false,
  loading: false,
  icon: '',
  iconPosition: 'left'
})

// 定义 Emits
export interface ButtonEmits {
  /** 点击事件 */
  click: [event: Event]
}

const emit = defineEmits<ButtonEmits>()

// 计算按钮样式类名
const buttonClasses = computed(() => [
  'l-button',
  `l-button--${props.type}`,
  `l-button--${props.size}`,
  {
    'l-button--block': props.block,
    'l-button--round': props.round,
    'l-button--circle': props.circle,
    'l-button--disabled': props.disabled,
    'l-button--loading': props.loading
  }
])

// 处理点击事件
const handleClick = (event: Event) => {
  if (props.disabled || props.loading) {
    return
  }
  emit('click', event)
}
</script>

<style lang="less">
@import '../styles/variables.less';

.l-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  outline: none;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  text-decoration: none;
  white-space: nowrap;
  border: 1px solid transparent;
  transition: all 0.2s ease-in-out;
  font-family: inherit;
  font-weight: 500;
  
  // 尺寸
  &--small {
    height: var(--ls-button-height-small);
    padding: 0 var(--ls-padding-sm);
    font-size: var(--ls-font-size-xs);
    border-radius: var(--ls-border-radius-sm);
  }
  
  &--medium {
    height: var(--ls-button-height-medium);
    padding: 0 var(--ls-padding-base);
    font-size: var(--ls-font-size-sm);
    border-radius: var(--ls-border-radius-base);
  }
  
  &--large {
    height: var(--ls-button-height-large);
    padding: 0 var(--ls-padding-lg);
    font-size: var(--ls-font-size-base);
    border-radius: var(--ls-border-radius-lg);
  }
  
  // 类型
  &--primary {
    background-color: var(--ldesign-brand-color);
    border-color: var(--ldesign-brand-color);
    color: var(--ldesign-font-white-1);
    
    &:hover:not(.l-button--disabled):not(.l-button--loading) {
      background-color: var(--ldesign-brand-color-hover);
      border-color: var(--ldesign-brand-color-hover);
    }
    
    &:active:not(.l-button--disabled):not(.l-button--loading) {
      background-color: var(--ldesign-brand-color-active);
      border-color: var(--ldesign-brand-color-active);
    }
  }
  
  &--secondary {
    background-color: transparent;
    border-color: var(--ldesign-border-color);
    color: var(--ldesign-text-color-primary);
    
    &:hover:not(.l-button--disabled):not(.l-button--loading) {
      border-color: var(--ldesign-brand-color-hover);
      color: var(--ldesign-brand-color-hover);
    }
    
    &:active:not(.l-button--disabled):not(.l-button--loading) {
      border-color: var(--ldesign-brand-color-active);
      color: var(--ldesign-brand-color-active);
    }
  }
  
  &--success {
    background-color: var(--ldesign-success-color);
    border-color: var(--ldesign-success-color);
    color: var(--ldesign-font-white-1);
    
    &:hover:not(.l-button--disabled):not(.l-button--loading) {
      background-color: var(--ldesign-success-color-hover);
      border-color: var(--ldesign-success-color-hover);
    }
    
    &:active:not(.l-button--disabled):not(.l-button--loading) {
      background-color: var(--ldesign-success-color-active);
      border-color: var(--ldesign-success-color-active);
    }
  }
  
  &--warning {
    background-color: var(--ldesign-warning-color);
    border-color: var(--ldesign-warning-color);
    color: var(--ldesign-font-white-1);
    
    &:hover:not(.l-button--disabled):not(.l-button--loading) {
      background-color: var(--ldesign-warning-color-hover);
      border-color: var(--ldesign-warning-color-hover);
    }
    
    &:active:not(.l-button--disabled):not(.l-button--loading) {
      background-color: var(--ldesign-warning-color-active);
      border-color: var(--ldesign-warning-color-active);
    }
  }
  
  &--error {
    background-color: var(--ldesign-error-color);
    border-color: var(--ldesign-error-color);
    color: var(--ldesign-font-white-1);
    
    &:hover:not(.l-button--disabled):not(.l-button--loading) {
      background-color: var(--ldesign-error-color-hover);
      border-color: var(--ldesign-error-color-hover);
    }
    
    &:active:not(.l-button--disabled):not(.l-button--loading) {
      background-color: var(--ldesign-error-color-active);
      border-color: var(--ldesign-error-color-active);
    }
  }
  
  &--text {
    background-color: transparent;
    border-color: transparent;
    color: var(--ldesign-brand-color);
    
    &:hover:not(.l-button--disabled):not(.l-button--loading) {
      color: var(--ldesign-brand-color-hover);
      background-color: var(--ldesign-brand-color-focus);
    }
    
    &:active:not(.l-button--disabled):not(.l-button--loading) {
      color: var(--ldesign-brand-color-active);
    }
  }
  
  // 状态
  &--block {
    width: 100%;
  }
  
  &--round {
    border-radius: 50px;
  }
  
  &--circle {
    border-radius: 50%;
    width: var(--ls-button-height-medium);
    padding: 0;
    
    &.l-button--small {
      width: var(--ls-button-height-small);
    }
    
    &.l-button--large {
      width: var(--ls-button-height-large);
    }
  }
  
  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  &--loading {
    cursor: default;
  }
  
  // 图标
  &__icon {
    display: inline-flex;
    align-items: center;
    
    &--left {
      margin-right: var(--ls-spacing-xs);
    }
    
    &--right {
      margin-left: var(--ls-spacing-xs);
    }
  }
  
  // 加载状态
  &__loading {
    display: inline-flex;
    align-items: center;
    margin-right: var(--ls-spacing-xs);
  }
  
  &__loading-icon {
    width: 1em;
    height: 1em;
    animation: l-button-loading-rotate 1s linear infinite;
  }
  
  &__text {
    display: inline-flex;
    align-items: center;
  }
}

@keyframes l-button-loading-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
