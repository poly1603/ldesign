<template>
  <div
    :class="[
      'l-form-actions',
      `l-form-actions--${config.position || 'newline'}`,
      `l-form-actions--${config.align || 'left'}`,
      config.className
    ]"
    :style="actionsStyles"
  >
    <div class="l-form-actions__content">
      <!-- 按钮列表 -->
      <template v-for="(button, index) in visibleButtons" :key="button.type || index">
        <button
          :type="button.htmlType || 'button'"
          :class="[
            'l-form-actions__button',
            `l-form-actions__button--${button.type}`,
            `l-form-actions__button--${button.variant || 'default'}`,
            `l-form-actions__button--${size}`,
            {
              'l-form-actions__button--disabled': isButtonDisabled(button),
              'l-form-actions__button--loading': isButtonLoading(button),
              'l-form-actions__button--block': button.block,
              'l-form-actions__button--ghost': button.ghost
            }
          ]"
          :disabled="isButtonDisabled(button)"
          :title="button.tooltip"
          @click="handleButtonClick(button, $event)"
        >
          <!-- 按钮图标 -->
          <i v-if="button.icon && !isButtonLoading(button)" :class="button.icon"></i>
          
          <!-- 加载图标 -->
          <i v-if="isButtonLoading(button)" class="l-form-actions__loading-icon"></i>
          
          <!-- 按钮文本 -->
          <span v-if="button.text" class="l-form-actions__button-text">
            {{ button.text }}
          </span>
        </button>
      </template>
      
      <!-- 展开按钮 -->
      <button
        v-if="showExpandButton"
        type="button"
        :class="[
          'l-form-actions__button',
          'l-form-actions__button--expand',
          `l-form-actions__button--${size}`
        ]"
        @click="handleExpandClick"
      >
        <i :class="expandButtonIcon"></i>
        <span class="l-form-actions__button-text">
          {{ expandButtonText }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type CSSProperties } from 'vue'
import type {
  FormActionConfig,
  ButtonConfig,
  FormState,
  AnyObject,
  SizeType
} from '../../types'

// 组件属性
interface Props {
  config: FormActionConfig
  formData?: AnyObject
  formState?: FormState
  disabled?: boolean
  loading?: boolean
  size?: SizeType
}

// 组件事件
interface Emits {
  (e: 'submit'): void
  (e: 'reset'): void
  (e: 'expand'): void
  (e: 'custom', action: string, data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  formData: () => ({}),
  formState: () => ({} as FormState),
  disabled: false,
  loading: false,
  size: 'medium'
})

const emit = defineEmits<Emits>()

// 注入的数据
const formInstance = inject('formInstance', null)

// 计算属性
const visibleButtons = computed(() => {
  return props.config.buttons
    .map(button => {
      // 如果是字符串，转换为按钮配置
      if (typeof button === 'string') {
        return createButtonFromString(button)
      }
      return button
    })
    .filter(button => {
      // 过滤隐藏的按钮
      if (typeof button.hidden === 'function') {
        return !button.hidden(props.formData || {})
      }
      return !button.hidden
    })
    .filter(button => {
      // 过滤展开按钮（单独处理）
      return button.type !== 'expand'
    })
})

const showExpandButton = computed(() => {
  // 检查是否有展开配置或展开按钮
  const hasExpandConfig = !!props.config.expandConfig?.enabled
  const hasExpandButton = props.config.buttons.some(button => 
    (typeof button === 'string' && button === 'expand') ||
    (typeof button === 'object' && button.type === 'expand')
  )
  
  return hasExpandConfig || hasExpandButton
})

const expandButtonText = computed(() => {
  const expandButton = props.config.buttons.find(button => 
    (typeof button === 'string' && button === 'expand') ||
    (typeof button === 'object' && button.type === 'expand')
  )
  
  if (typeof expandButton === 'object' && expandButton.text) {
    return expandButton.text
  }
  
  const expandConfig = props.config.expandConfig
  if (expandConfig) {
    return props.formState?.expanded 
      ? (expandConfig.collapseText || '收起')
      : (expandConfig.expandText || '展开')
  }
  
  return props.formState?.expanded ? '收起' : '展开'
})

const expandButtonIcon = computed(() => {
  const expandButton = props.config.buttons.find(button => 
    (typeof button === 'object' && button.type === 'expand')
  )
  
  if (typeof expandButton === 'object' && expandButton.icon) {
    return expandButton.icon
  }
  
  return props.formState?.expanded ? 'l-icon-up' : 'l-icon-down'
})

const actionsStyles = computed((): CSSProperties => {
  const styles: CSSProperties = {}
  
  // 应用Grid布局属性
  if (props.config.span) {
    if (typeof props.config.span === 'number') {
      styles.gridColumn = `span ${props.config.span}`
    } else if (props.config.span === 'auto') {
      styles.gridColumn = 'auto'
    } else if (props.config.span === 'fill') {
      styles.gridColumn = '1 / -1'
    }
  }
  
  // 应用自定义样式
  if (props.config.style) {
    Object.assign(styles, props.config.style)
  }
  
  // 应用间距
  if (props.config.gap) {
    styles.gap = typeof props.config.gap === 'number' 
      ? `${props.config.gap}px` 
      : props.config.gap
  }
  
  return styles
})

// 方法
const createButtonFromString = (buttonType: string): ButtonConfig => {
  const buttonConfigs: Record<string, ButtonConfig> = {
    submit: {
      type: 'submit',
      text: '提交',
      variant: 'primary',
      htmlType: 'submit'
    },
    reset: {
      type: 'reset',
      text: '重置',
      variant: 'secondary'
    },
    cancel: {
      type: 'button',
      text: '取消',
      variant: 'secondary'
    },
    save: {
      type: 'button',
      text: '保存',
      variant: 'primary'
    },
    expand: {
      type: 'expand',
      text: '展开',
      variant: 'secondary'
    }
  }
  
  return buttonConfigs[buttonType] || {
    type: 'button',
    text: buttonType,
    variant: 'default'
  }
}

const isButtonDisabled = (button: ButtonConfig): boolean => {
  if (props.disabled) return true
  
  if (typeof button.disabled === 'function') {
    return button.disabled(props.formData || {})
  }
  
  if (button.disabled) return true
  
  // 特殊按钮的禁用逻辑
  if (button.type === 'submit') {
    return props.formState?.isSubmitting || !props.formState?.isValid
  }
  
  return false
}

const isButtonLoading = (button: ButtonConfig): boolean => {
  if (button.loading) return true
  
  // 特殊按钮的加载逻辑
  if (button.type === 'submit') {
    return props.formState?.isSubmitting || false
  }
  
  return false
}

const handleButtonClick = async (button: ButtonConfig, event: Event) => {
  // 检查确认配置
  if (button.confirm) {
    const confirmed = await showConfirmDialog(button.confirm)
    if (!confirmed) return
  }
  
  // 执行按钮点击回调
  if (button.onClick) {
    try {
      await button.onClick(event, props.formData || {})
    } catch (error) {
      console.error('按钮点击回调执行失败:', error)
      return
    }
  }
  
  // 根据按钮类型执行相应动作
  switch (button.type) {
    case 'submit':
      emit('submit')
      break
    case 'reset':
      emit('reset')
      break
    case 'custom':
      emit('custom', button.text || 'custom', { button, event })
      break
    default:
      // 其他自定义按钮
      emit('custom', button.type, { button, event })
      break
  }
}

const handleExpandClick = () => {
  emit('expand')
}

const showConfirmDialog = async (confirmConfig: any): Promise<boolean> => {
  // 这里应该显示确认对话框
  // 简化实现，直接使用浏览器的confirm
  const message = confirmConfig.content || confirmConfig.title || '确定要执行此操作吗？'
  return confirm(message)
}
</script>

<style lang="less">
.l-form-actions {
  margin-top: 24px;
  
  &__content {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border: 1px solid var(--border-color, #d9d9d9);
    border-radius: 4px;
    background-color: var(--background-color, #ffffff);
    color: var(--text-color-primary, #262626);
    font-size: 14px;
    line-height: 1.5;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    user-select: none;
    
    &:hover:not(&--disabled) {
      border-color: var(--primary-color, #1890ff);
      color: var(--primary-color, #1890ff);
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
    
    &:active:not(&--disabled) {
      transform: translateY(1px);
    }
    
    // 按钮变体
    &--primary {
      background-color: var(--primary-color, #1890ff);
      border-color: var(--primary-color, #1890ff);
      color: white;
      
      &:hover:not(.l-form-actions__button--disabled) {
        background-color: var(--primary-color-hover, #40a9ff);
        border-color: var(--primary-color-hover, #40a9ff);
      }
    }
    
    &--secondary {
      background-color: var(--background-color-light, #fafafa);
      border-color: var(--border-color, #d9d9d9);
      color: var(--text-color-primary, #262626);
    }
    
    &--success {
      background-color: var(--success-color, #52c41a);
      border-color: var(--success-color, #52c41a);
      color: white;
    }
    
    &--warning {
      background-color: var(--warning-color, #faad14);
      border-color: var(--warning-color, #faad14);
      color: white;
    }
    
    &--danger {
      background-color: var(--error-color, #ff4d4f);
      border-color: var(--error-color, #ff4d4f);
      color: white;
    }
    
    &--info {
      background-color: var(--info-color, #1890ff);
      border-color: var(--info-color, #1890ff);
      color: white;
    }
    
    &--light {
      background-color: var(--background-color-light, #fafafa);
      border-color: var(--border-color-light, #f0f0f0);
      color: var(--text-color-secondary, #8c8c8c);
    }
    
    &--dark {
      background-color: var(--background-color-dark, #262626);
      border-color: var(--background-color-dark, #262626);
      color: white;
    }
    
    &--link {
      background-color: transparent;
      border-color: transparent;
      color: var(--primary-color, #1890ff);
      text-decoration: underline;
      
      &:hover:not(.l-form-actions__button--disabled) {
        color: var(--primary-color-hover, #40a9ff);
      }
    }
    
    // 按钮状态
    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
      }
    }
    
    &--loading {
      cursor: not-allowed;
      
      .l-form-actions__loading-icon {
        animation: l-form-spin 1s linear infinite;
      }
    }
    
    &--block {
      width: 100%;
    }
    
    &--ghost {
      background-color: transparent;
      
      &.l-form-actions__button--primary {
        color: var(--primary-color, #1890ff);
        border-color: var(--primary-color, #1890ff);
      }
    }
    
    // 按钮尺寸
    &--small {
      padding: 4px 8px;
      font-size: 12px;
    }
    
    &--large {
      padding: 12px 24px;
      font-size: 16px;
    }
    
    // 按钮图标
    i {
      font-size: 16px;
      
      &:not(:last-child) {
        margin-right: 8px;
      }
    }
  }
  
  &__button-text {
    white-space: nowrap;
  }
  
  &__loading-icon {
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    margin-right: 8px;
  }
  
  // 位置样式
  &--inline {
    margin-top: 0;
    display: inline-block;
  }
  
  &--newline {
    margin-top: 24px;
    display: block;
  }
  
  &--fixed {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
    margin-top: 0;
  }
  
  &--floating {
    position: absolute;
    bottom: 24px;
    right: 24px;
    z-index: 100;
    margin-top: 0;
  }
  
  // 对齐样式
  &--left {
    .l-form-actions__content {
      justify-content: flex-start;
    }
  }
  
  &--center {
    .l-form-actions__content {
      justify-content: center;
    }
  }
  
  &--right {
    .l-form-actions__content {
      justify-content: flex-end;
    }
  }
}

// 旋转动画
@keyframes l-form-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
