/**
 * LDesign Button TSX 组件
 * 用于测试 TSX 组件的打包和使用
 */

import { defineComponent, PropType } from 'vue'

// 按钮类型定义
export type ButtonType = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type ButtonSize = 'small' | 'medium' | 'large'

// 按钮属性接口
export interface ButtonProps {
  /**
   * 按钮类型
   * @default 'primary'
   */
  type?: ButtonType

  /**
   * 按钮尺寸
   * @default 'medium'
   */
  size?: ButtonSize

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否加载中
   * @default false
   */
  loading?: boolean

  /**
   * 是否为块级按钮
   * @default false
   */
  block?: boolean

  /**
   * 按钮形状
   * @default 'default'
   */
  shape?: 'default' | 'round' | 'circle'

  /**
   * 图标名称
   */
  icon?: string

  /**
   * HTML 按钮类型
   * @default 'button'
   */
  htmlType?: 'button' | 'submit' | 'reset'
}

// 按钮事件接口
export interface ButtonEmits {
  /**
   * 点击事件
   * @param event 鼠标事件
   */
  click: (event: MouseEvent) => void
}

/**
 * LDesign Button 组件
 * 
 * @example
 * ```tsx
 * <LDesignButton type="primary" size="medium" onClick={handleClick}>
 *   点击我
 * </LDesignButton>
 * ```
 */
export const LDesignButton = defineComponent({
  name: 'LDesignButton',

  props: {
    type: {
      type: String as PropType<ButtonType>,
      default: 'primary',
      validator: (value: string) => {
        return ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(value)
      }
    },

    size: {
      type: String as PropType<ButtonSize>,
      default: 'medium',
      validator: (value: string) => {
        return ['small', 'medium', 'large'].includes(value)
      }
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
      type: String as PropType<'default' | 'round' | 'circle'>,
      default: 'default',
      validator: (value: string) => {
        return ['default', 'round', 'circle'].includes(value)
      }
    },

    icon: {
      type: String,
      default: undefined
    },

    htmlType: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: 'button'
    }
  },

  emits: {
    click: (event: MouseEvent) => event instanceof MouseEvent
  },

  setup(props, { slots, emit }) {
    // 处理点击事件
    const handleClick = (event: MouseEvent) => {
      if (props.disabled || props.loading) {
        event.preventDefault()
        return
      }
      emit('click', event)
    }

    // 计算按钮类名
    const getButtonClass = () => {
      const classes = ['ldesign-button']

      // 类型样式
      classes.push(`ldesign-button--${props.type}`)

      // 尺寸样式
      classes.push(`ldesign-button--${props.size}`)

      // 形状样式
      if (props.shape !== 'default') {
        classes.push(`ldesign-button--${props.shape}`)
      }

      // 状态样式
      if (props.disabled) {
        classes.push('ldesign-button--disabled')
      }

      if (props.loading) {
        classes.push('ldesign-button--loading')
      }

      if (props.block) {
        classes.push('ldesign-button--block')
      }

      return classes.join(' ')
    }

    // 渲染函数
    return () => {
      const buttonElement = (
        <button
          type={props.htmlType}
          class={getButtonClass()}
          disabled={props.disabled || props.loading}
          onClick={handleClick}
        >
          {props.loading && (
            <span class="ldesign-button__loading-icon">
              <svg viewBox="0 0 1024 1024" class="ldesign-icon-loading">
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                <path d="M512 140c-205.4 0-372 166.6-372 372h72c0-165.1 134.9-300 300-300s300 134.9 300 300h72c0-205.4-166.6-372-372-372z" />
              </svg>
            </span>
          )}

          {!props.loading && props.icon && (
            <span class="ldesign-button__icon">
              <i class={`ldesign-icon-${props.icon}`}></i>
            </span>
          )}

          <span class="ldesign-button__content">
            {slots.default?.()}
          </span>
        </button>
      )

      return buttonElement
    }
  }
})

// 默认导出
export default LDesignButton
