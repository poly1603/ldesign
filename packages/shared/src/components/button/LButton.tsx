/**
 * Button 组件 - TSX 实现
 * 支持多种类型、尺寸和状态的按钮组件
 */

import { defineComponent, computed } from 'vue'
import type { ButtonProps, ButtonEmits, ButtonSlots } from './types'
import './button.less'

export default defineComponent<ButtonProps, ButtonEmits, ButtonSlots>({
  name: 'LButton',
  
  props: {
    type: {
      type: String as () => ButtonProps['type'],
      default: 'default'
    },
    size: {
      type: String as () => ButtonProps['size'],
      default: 'medium'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    },
    shape: {
      type: String as () => ButtonProps['shape'],
      default: 'default'
    },
    icon: {
      type: String,
      default: undefined
    },
    htmlType: {
      type: String as () => ButtonProps['htmlType'],
      default: 'button'
    }
  },

  emits: ['click', 'focus', 'blur'] as (keyof ButtonEmits)[],

  setup(props, { slots, emit }) {
    // 计算类名
    const buttonClass = computed(() => {
      return [
        'l-button',
        `l-button--${props.type}`,
        `l-button--${props.size}`,
        `l-button--${props.shape}`,
        {
          'l-button--disabled': props.disabled,
          'l-button--loading': props.loading,
          'l-button--block': props.block,
          'l-button--icon-only': !slots.default && (props.icon || slots.icon)
        }
      ]
    })

    // 事件处理
    const handleClick = (event: MouseEvent) => {
      if (props.disabled || props.loading) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      emit('click', event)
    }

    const handleFocus = (event: FocusEvent) => {
      if (!props.disabled) {
        emit('focus', event)
      }
    }

    const handleBlur = (event: FocusEvent) => {
      if (!props.disabled) {
        emit('blur', event)
      }
    }

    // 渲染函数
    return () => (
      <button
        type={props.htmlType}
        class={buttonClass.value}
        disabled={props.disabled || props.loading}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {/* 加载图标 */}
        {props.loading && (
          <span class="l-button__loading">
            <svg class="l-button__loading-icon" viewBox="0 0 24 24">
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                stroke-width="2" 
                fill="none" 
                stroke-linecap="round"
                stroke-dasharray="32"
                stroke-dashoffset="32"
              >
                <animate 
                  attributeName="stroke-dashoffset" 
                  values="32;0;32" 
                  dur="1.5s" 
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </span>
        )}

        {/* 图标 */}
        {!props.loading && (slots.icon?.() || (props.icon && (
          <span class="l-button__icon">
            <i class={props.icon}></i>
          </span>
        )))}

        {/* 文本内容 */}
        {slots.default && (
          <span class="l-button__content">
            {slots.default()}
          </span>
        )}
      </button>
    )
  }
})
