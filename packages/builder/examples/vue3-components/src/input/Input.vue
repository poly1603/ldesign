<template>
  <div :class="wrapperClasses">
    <label v-if="label" :class="labelClasses" :for="inputId">
      {{ label }}
      <span v-if="required" class="l-input__required">*</span>
    </label>
    
    <div :class="inputWrapperClasses">
      <span v-if="prefixIcon || $slots.prefix" class="l-input__prefix">
        <slot name="prefix">
          <span v-if="prefixIcon" class="l-input__icon">{{ prefixIcon }}</span>
        </slot>
      </span>
      
      <input
        :id="inputId"
        ref="inputRef"
        :class="inputClasses"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :max="max"
        :min="min"
        :step="step"
        :autocomplete="autocomplete"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @keypress="handleKeypress"
      />
      
      <span v-if="suffixIcon || $slots.suffix || showClearIcon" class="l-input__suffix">
        <span
          v-if="showClearIcon"
          class="l-input__clear"
          @click="handleClear"
        >
          ✕
        </span>
        <slot name="suffix">
          <span v-if="suffixIcon" class="l-input__icon">{{ suffixIcon }}</span>
        </slot>
      </span>
    </div>
    
    <div v-if="showWordCount" class="l-input__count">
      {{ currentLength }}{{ maxlength ? `/${maxlength}` : '' }}
    </div>
    
    <div v-if="errorMessage" class="l-input__error">
      {{ errorMessage }}
    </div>
    
    <div v-if="helpText" class="l-input__help">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Input 输入框组件 - Vue3 版本
 * 
 * 使用 Composition API 和 <script setup> 语法
 * 提供多种类型和状态的输入框组件
 * 支持前缀图标、后缀图标、清除功能、字数统计等
 */
import { computed, ref, nextTick } from 'vue'

// 定义组件名称
defineOptions({
  name: 'LInput'
})

// 定义 Props 类型
export interface InputProps {
  /** 输入框的值 */
  modelValue?: string | number
  /** 输入框类型 */
  type?: string
  /** 输入框尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 标签文本 */
  label?: string
  /** 占位符文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 是否可清除 */
  clearable?: boolean
  /** 是否显示字数统计 */
  showWordCount?: boolean
  /** 最大长度 */
  maxlength?: number
  /** 最小长度 */
  minlength?: number
  /** 最大值（数字类型） */
  max?: number
  /** 最小值（数字类型） */
  min?: number
  /** 步长（数字类型） */
  step?: number
  /** 自动完成 */
  autocomplete?: string
  /** 前缀图标 */
  prefixIcon?: string
  /** 后缀图标 */
  suffixIcon?: string
  /** 错误信息 */
  errorMessage?: string
  /** 帮助文本 */
  helpText?: string
}

// 定义 Props 默认值
const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: 'text',
  size: 'medium',
  label: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  showWordCount: false,
  autocomplete: 'off',
  prefixIcon: '',
  suffixIcon: '',
  errorMessage: '',
  helpText: ''
})

// 定义 Emits
export interface InputEmits {
  /** 更新模型值 */
  'update:modelValue': [value: string | number]
  /** 输入事件 */
  input: [value: string | number]
  /** 变化事件 */
  change: [value: string | number]
  /** 获得焦点事件 */
  focus: [event: FocusEvent]
  /** 失去焦点事件 */
  blur: [event: FocusEvent]
  /** 键盘按下事件 */
  keydown: [event: KeyboardEvent]
  /** 键盘抬起事件 */
  keyup: [event: KeyboardEvent]
  /** 键盘按键事件 */
  keypress: [event: KeyboardEvent]
  /** 清除事件 */
  clear: []
}

const emit = defineEmits<InputEmits>()

// 响应式数据
const inputRef = ref<HTMLInputElement>()
const focused = ref(false)
const inputId = `l-input-${Math.random().toString(36).substr(2, 9)}`

// 计算属性
const currentLength = computed(() => {
  return String(props.modelValue || '').length
})

const wrapperClasses = computed(() => [
  'l-input',
  `l-input--${props.size}`,
  {
    'l-input--disabled': props.disabled,
    'l-input--readonly': props.readonly,
    'l-input--focused': focused.value,
    'l-input--error': !!props.errorMessage
  }
])

const labelClasses = computed(() => [
  'l-input__label',
  {
    'l-input__label--required': props.required
  }
])

const inputWrapperClasses = computed(() => [
  'l-input__wrapper',
  {
    'l-input__wrapper--prefix': props.prefixIcon || !!props.$slots?.prefix,
    'l-input__wrapper--suffix': props.suffixIcon || !!props.$slots?.suffix || showClearIcon.value
  }
])

const inputClasses = computed(() => ['l-input__inner'])

const showClearIcon = computed(() => {
  return props.clearable && props.modelValue && !props.disabled && !props.readonly
})

// 事件处理函数
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  emit('update:modelValue', value)
  emit('input', value)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('change', target.value)
}

const handleFocus = (event: FocusEvent) => {
  focused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  focused.value = false
  emit('blur', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event)
}

const handleKeypress = (event: KeyboardEvent) => {
  emit('keypress', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('input', '')
  emit('change', '')
  emit('clear')
  
  // 聚焦到输入框
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 暴露的方法
const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

const select = () => {
  inputRef.value?.select()
}

// 暴露给父组件的方法
defineExpose({
  focus,
  blur,
  select
})
</script>

<style lang="less">
@import '../styles/variables.less';

.l-input {
  display: inline-block;
  width: 100%;
  position: relative;
  
  // 尺寸
  &--small {
    .l-input__inner {
      height: var(--ls-input-height-small);
      font-size: var(--ls-font-size-xs);
    }
  }
  
  &--medium {
    .l-input__inner {
      height: var(--ls-input-height-medium);
      font-size: var(--ls-font-size-sm);
    }
  }
  
  &--large {
    .l-input__inner {
      height: var(--ls-input-height-large);
      font-size: var(--ls-font-size-base);
    }
  }
  
  // 状态
  &--disabled {
    .l-input__inner {
      background-color: var(--ldesign-bg-color-component-disabled);
      color: var(--ldesign-text-color-disabled);
      cursor: not-allowed;
    }
    
    .l-input__label {
      color: var(--ldesign-text-color-disabled);
    }
  }
  
  &--readonly {
    .l-input__inner {
      background-color: var(--ldesign-bg-color-component-disabled);
      cursor: default;
    }
  }
  
  &--focused {
    .l-input__wrapper {
      border-color: var(--ldesign-border-color-focus);
      box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
    }
  }
  
  &--error {
    .l-input__wrapper {
      border-color: var(--ldesign-error-color);
    }
    
    .l-input__label {
      color: var(--ldesign-error-color);
    }
  }
  
  // 标签
  &__label {
    display: block;
    margin-bottom: var(--ls-spacing-xs);
    font-size: var(--ls-font-size-sm);
    font-weight: 500;
    color: var(--ldesign-text-color-primary);
    line-height: 1.4;
  }
  
  &__required {
    color: var(--ldesign-error-color);
    margin-left: 2px;
  }
  
  // 输入框包装器
  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    background-color: var(--ldesign-bg-color-component);
    transition: all 0.2s ease-in-out;
    
    &:hover:not(.l-input--disabled .l-input__wrapper) {
      border-color: var(--ldesign-border-color-hover);
    }
    
    &--prefix {
      .l-input__inner {
        padding-left: var(--ls-padding-lg);
      }
    }
    
    &--suffix {
      .l-input__inner {
        padding-right: var(--ls-padding-lg);
      }
    }
  }
  
  // 输入框
  &__inner {
    flex: 1;
    width: 100%;
    padding: 0 var(--ls-padding-sm);
    border: none;
    outline: none;
    background: transparent;
    color: var(--ldesign-text-color-primary);
    font-family: inherit;
    transition: all 0.2s ease-in-out;
    
    &::placeholder {
      color: var(--ldesign-text-color-placeholder);
    }
  }
  
  // 前缀和后缀
  &__prefix,
  &__suffix {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    color: var(--ldesign-text-color-secondary);
    z-index: 1;
  }
  
  &__prefix {
    left: var(--ls-padding-sm);
  }
  
  &__suffix {
    right: var(--ls-padding-sm);
  }
  
  &__icon {
    display: inline-flex;
    align-items: center;
    font-size: 1em;
  }
  
  // 清除按钮
  &__clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-left: var(--ls-spacing-xs);
    border-radius: 50%;
    background-color: var(--ldesign-gray-color-4);
    color: var(--ldesign-font-white-1);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    
    &:hover {
      background-color: var(--ldesign-gray-color-6);
    }
  }
  
  // 字数统计
  &__count {
    margin-top: var(--ls-spacing-xs);
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    text-align: right;
  }
  
  // 错误信息
  &__error {
    margin-top: var(--ls-spacing-xs);
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-error-color);
    line-height: 1.4;
  }
  
  // 帮助文本
  &__help {
    margin-top: var(--ls-spacing-xs);
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    line-height: 1.4;
  }
}
</style>
