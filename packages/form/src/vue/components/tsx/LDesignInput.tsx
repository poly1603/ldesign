/**
 * LDesign Input TSX 组件
 * 用于测试 TSX 组件的打包和使用
 */

import { defineComponent, PropType, ref, computed } from 'vue'

// 输入框类型定义
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
export type InputSize = 'small' | 'medium' | 'large'
export type InputStatus = 'default' | 'success' | 'warning' | 'error'

// 输入框属性接口
export interface InputProps {
  /**
   * 输入框值
   */
  modelValue?: string | number

  /**
   * 输入框类型
   * @default 'text'
   */
  type?: InputType

  /**
   * 输入框尺寸
   * @default 'medium'
   */
  size?: InputSize

  /**
   * 输入框状态
   * @default 'default'
   */
  status?: InputStatus

  /**
   * 占位符文本
   */
  placeholder?: string

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否只读
   * @default false
   */
  readonly?: boolean

  /**
   * 是否显示清除按钮
   * @default false
   */
  clearable?: boolean

  /**
   * 是否显示密码切换按钮
   * @default false
   */
  showPassword?: boolean

  /**
   * 最大长度
   */
  maxlength?: number

  /**
   * 是否显示字数统计
   * @default false
   */
  showCount?: boolean

  /**
   * 前缀图标
   */
  prefixIcon?: string

  /**
   * 后缀图标
   */
  suffixIcon?: string

  /**
   * 自动聚焦
   * @default false
   */
  autofocus?: boolean
}

// 输入框事件接口
export interface InputEmits {
  /**
   * 值更新事件
   * @param value 新值
   */
  'update:modelValue': (value: string | number) => void

  /**
   * 输入事件
   * @param event 输入事件
   */
  input: (event: Event) => void

  /**
   * 变化事件
   * @param event 变化事件
   */
  change: (event: Event) => void

  /**
   * 聚焦事件
   * @param event 聚焦事件
   */
  focus: (event: FocusEvent) => void

  /**
   * 失焦事件
   * @param event 失焦事件
   */
  blur: (event: FocusEvent) => void

  /**
   * 清除事件
   */
  clear: () => void

  /**
   * 按键事件
   * @param event 按键事件
   */
  keydown: (event: KeyboardEvent) => void
}

/**
 * LDesign Input 组件
 * 
 * @example
 * ```tsx
 * <LDesignInput
 *   v-model={inputValue}
 *   placeholder="请输入内容"
 *   clearable
 *   onFocus={handleFocus}
 * />
 * ```
 */
export const LDesignInput = defineComponent({
  name: 'LDesignInput',

  props: {
    modelValue: {
      type: [String, Number] as PropType<string | number>,
      default: ''
    },

    type: {
      type: String as PropType<InputType>,
      default: 'text'
    },

    size: {
      type: String as PropType<InputSize>,
      default: 'medium'
    },

    status: {
      type: String as PropType<InputStatus>,
      default: 'default'
    },

    placeholder: {
      type: String,
      default: ''
    },

    disabled: {
      type: Boolean,
      default: false
    },

    readonly: {
      type: Boolean,
      default: false
    },

    clearable: {
      type: Boolean,
      default: false
    },

    showPassword: {
      type: Boolean,
      default: false
    },

    maxlength: {
      type: Number,
      default: undefined
    },

    showCount: {
      type: Boolean,
      default: false
    },

    prefixIcon: {
      type: String,
      default: undefined
    },

    suffixIcon: {
      type: String,
      default: undefined
    },

    autofocus: {
      type: Boolean,
      default: false
    }
  },

  emits: {
    'update:modelValue': (value: string | number) => true,
    input: (event: Event) => event instanceof Event,
    change: (event: Event) => event instanceof Event,
    focus: (event: FocusEvent) => event instanceof FocusEvent,
    blur: (event: FocusEvent) => event instanceof FocusEvent,
    clear: () => true,
    keydown: (event: KeyboardEvent) => event instanceof KeyboardEvent
  },

  setup(props, { emit, slots }) {
    // 响应式状态
    const inputRef = ref<HTMLInputElement>()
    const isFocused = ref(false)
    const isPasswordVisible = ref(false)

    // 计算属性
    const currentType = computed(() => {
      if (props.type === 'password' && props.showPassword) {
        return isPasswordVisible.value ? 'text' : 'password'
      }
      return props.type
    })

    const showClearButton = computed(() => {
      return props.clearable && !props.disabled && !props.readonly && props.modelValue
    })

    const currentLength = computed(() => {
      return String(props.modelValue || '').length
    })

    // 事件处理
    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      const value = props.type === 'number' ? Number(target.value) : target.value
      emit('update:modelValue', value)
      emit('input', event)
    }

    const handleChange = (event: Event) => {
      emit('change', event)
    }

    const handleFocus = (event: FocusEvent) => {
      isFocused.value = true
      emit('focus', event)
    }

    const handleBlur = (event: FocusEvent) => {
      isFocused.value = false
      emit('blur', event)
    }

    const handleClear = () => {
      emit('update:modelValue', '')
      emit('clear')
      inputRef.value?.focus()
    }

    const handlePasswordToggle = () => {
      isPasswordVisible.value = !isPasswordVisible.value
    }

    const handleKeydown = (event: KeyboardEvent) => {
      emit('keydown', event)
    }

    // 计算容器类名
    const getContainerClass = () => {
      const classes = ['ldesign-input']

      classes.push(`ldesign-input--${props.size}`)
      classes.push(`ldesign-input--${props.status}`)

      if (props.disabled) {
        classes.push('ldesign-input--disabled')
      }

      if (props.readonly) {
        classes.push('ldesign-input--readonly')
      }

      if (isFocused.value) {
        classes.push('ldesign-input--focused')
      }

      return classes.join(' ')
    }

    // 渲染函数
    return () => {
      const inputElement = (
        <div class={getContainerClass()}>
          {(slots.prefix || props.prefixIcon) && (
            <span class="ldesign-input__prefix">
              {slots.prefix?.() || (
                <i class={`ldesign-icon-${props.prefixIcon}`}></i>
              )}
            </span>
          )}

          <input
            ref={inputRef}
            type={currentType.value}
            value={props.modelValue}
            placeholder={props.placeholder}
            disabled={props.disabled}
            readonly={props.readonly}
            maxlength={props.maxlength}
            autofocus={props.autofocus}
            class="ldesign-input__inner"
            onInput={handleInput}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeydown={handleKeydown}
          />

          <span class="ldesign-input__suffix">
            {showClearButton.value && (
              <button
                type="button"
                class="ldesign-input__clear"
                onClick={handleClear}
              >
                <i class="ldesign-icon-close"></i>
              </button>
            )}

            {props.type === 'password' && props.showPassword && (
              <button
                type="button"
                class="ldesign-input__password-toggle"
                onClick={handlePasswordToggle}
              >
                <i class={isPasswordVisible.value ? 'ldesign-icon-eye-off' : 'ldesign-icon-eye'}></i>
              </button>
            )}

            {(slots.suffix || props.suffixIcon) && (
              <span class="ldesign-input__suffix-icon">
                {slots.suffix?.() || (
                  <i class={`ldesign-icon-${props.suffixIcon}`}></i>
                )}
              </span>
            )}
          </span>

          {props.showCount && props.maxlength && (
            <span class="ldesign-input__count">
              {currentLength.value}/{props.maxlength}
            </span>
          )}
        </div>
      )

      return inputElement
    }
  }
})

// 默认导出
export default LDesignInput
