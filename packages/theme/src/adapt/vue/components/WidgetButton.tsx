/**
 * @ldesign/theme - 装饰挂件按钮组件
 *
 * 支持装饰挂件的按钮组件
 */

import { defineComponent, computed } from 'vue'
import type { PropType } from 'vue'

export interface WidgetButtonProps {
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  widget?: string
  widgetPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export const WidgetButton = defineComponent({
  name: 'WidgetButton',
  props: {
    type: {
      type: String as PropType<WidgetButtonProps['type']>,
      default: 'primary',
    },
    size: {
      type: String as PropType<WidgetButtonProps['size']>,
      default: 'medium',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    widget: {
      type: String,
      default: undefined,
    },
    widgetPosition: {
      type: String as PropType<WidgetButtonProps['widgetPosition']>,
      default: 'top-right',
    },
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    // 计算按钮样式类
    const buttonClass = computed(() => {
      const classes = ['ldesign-widget-button']

      classes.push(`ldesign-widget-button--${props.type}`)
      classes.push(`ldesign-widget-button--${props.size}`)

      if (props.disabled) {
        classes.push('ldesign-widget-button--disabled')
      }

      if (props.loading) {
        classes.push('ldesign-widget-button--loading')
      }

      return classes.join(' ')
    })

    // 计算装饰配置
    const decorationConfig = computed(() => {
      if (!props.widget) return null

      return {
        widget: props.widget,
        position: props.widgetPosition,
      }
    })

    // 点击事件处理
    const handleClick = (event: MouseEvent) => {
      if (props.disabled || props.loading) return
      emit('click', event)
    }

    return () => (
      <button
        class={buttonClass.value}
        disabled={props.disabled || props.loading}
        onClick={handleClick}
        v-widget-decoration={decorationConfig.value}
      >
        {props.loading && (
          <span class='ldesign-widget-button__loading'>
            <svg
              class='ldesign-widget-button__loading-icon'
              viewBox='0 0 24 24'
              fill='none'
            >
              <circle
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                stroke-width='2'
                stroke-linecap='round'
                stroke-dasharray='31.416'
                stroke-dashoffset='31.416'
              >
                <animate
                  attributeName='stroke-dasharray'
                  dur='2s'
                  values='0 31.416;15.708 15.708;0 31.416'
                  repeatCount='indefinite'
                />
                <animate
                  attributeName='stroke-dashoffset'
                  dur='2s'
                  values='0;-15.708;-31.416'
                  repeatCount='indefinite'
                />
              </circle>
            </svg>
          </span>
        )}
        <span class='ldesign-widget-button__content'>{slots.default?.()}</span>
      </button>
    )
  },
})

// 样式定义
const buttonStyles = `
.ldesign-widget-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: visible;
  user-select: none;
  outline: none;
}

.ldesign-widget-button:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary-2, rgba(24, 144, 255, 0.2));
}

/* 按钮类型样式 */
.ldesign-widget-button--primary {
  background: var(--color-primary, #1890ff);
  color: white;
}

.ldesign-widget-button--primary:hover:not(.ldesign-widget-button--disabled) {
  background: var(--color-primary-6, #40a9ff);
  transform: translateY(-1px);
}

.ldesign-widget-button--secondary {
  background: var(--color-background-secondary, #f5f5f5);
  color: var(--color-text-primary, #333333);
  border: 1px solid var(--color-border, #e0e0e0);
}

.ldesign-widget-button--secondary:hover:not(.ldesign-widget-button--disabled) {
  background: var(--color-background-tertiary, #fafafa);
  border-color: var(--color-primary, #1890ff);
}

.ldesign-widget-button--success {
  background: var(--color-success, #52c41a);
  color: white;
}

.ldesign-widget-button--success:hover:not(.ldesign-widget-button--disabled) {
  background: var(--color-success-6, #73d13d);
}

.ldesign-widget-button--warning {
  background: var(--color-warning, #faad14);
  color: white;
}

.ldesign-widget-button--warning:hover:not(.ldesign-widget-button--disabled) {
  background: var(--color-warning-6, #ffc53d);
}

.ldesign-widget-button--danger {
  background: var(--color-danger, #ff4d4f);
  color: white;
}

.ldesign-widget-button--danger:hover:not(.ldesign-widget-button--disabled) {
  background: var(--color-danger-6, #ff7875);
}

/* 按钮尺寸样式 */
.ldesign-widget-button--small {
  padding: 4px 12px;
  font-size: 12px;
}

.ldesign-widget-button--medium {
  padding: 8px 16px;
  font-size: 14px;
}

.ldesign-widget-button--large {
  padding: 12px 24px;
  font-size: 16px;
}

/* 按钮状态样式 */
.ldesign-widget-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.ldesign-widget-button--loading {
  cursor: wait;
}

.ldesign-widget-button__loading {
  display: inline-flex;
  align-items: center;
}

.ldesign-widget-button__loading-icon {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ldesign-widget-button__content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
`

// 注入样式
if (
  typeof document !== 'undefined' &&
  !document.querySelector('#ldesign-widget-button-styles')
) {
  const style = document.createElement('style')
  style.id = 'ldesign-widget-button-styles'
  style.textContent = buttonStyles
  document.head.appendChild(style)
}

export default WidgetButton
