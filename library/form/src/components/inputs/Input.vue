<!--
  Input 组件
  
  基础输入框组件，支持各种输入类型和状态
  
  @author LDesign Team
  @since 1.0.0
-->

<template>
  <div :class="inputWrapperClasses">
    <!-- 前缀插槽 -->
    <div
      v-if="$slots.prefix || prefix"
      class="ldesign-input__prefix"
    >
      <slot name="prefix">
        <span v-if="prefix">{{ prefix }}</span>
      </slot>
    </div>
    
    <!-- 输入框 -->
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
      :autofocus="autofocus"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @keypress="handleKeypress"
    />
    
    <!-- 后缀插槽 -->
    <div
      v-if="$slots.suffix || suffix || showClearButton || showPasswordToggle"
      class="ldesign-input__suffix"
    >
      <!-- 清除按钮 -->
      <button
        v-if="showClearButton"
        type="button"
        class="ldesign-input__clear"
        @click="handleClear"
      >
        ×
      </button>
      
      <!-- 密码显示切换 -->
      <button
        v-if="showPasswordToggle"
        type="button"
        class="ldesign-input__password-toggle"
        @click="handlePasswordToggle"
      >
        {{ passwordVisible ? '👁️' : '👁️‍🗨️' }}
      </button>
      
      <!-- 自定义后缀 -->
      <slot name="suffix">
        <span v-if="suffix">{{ suffix }}</span>
      </slot>
    </div>
    
    <!-- 字符计数 -->
    <div
      v-if="showCount"
      class="ldesign-input__count"
    >
      {{ currentLength }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, type InputHTMLAttributes } from 'vue'
import type { InputProps } from '../../types'
import { injectFormContext } from '../../core/form/manager'
import { generateId } from '../../utils'

/**
 * 组件名称
 */
defineOptions({
  name: 'LDesignInput',
})

/**
 * 组件属性
 */
const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'medium',
  variant: 'outlined',
  clearable: false,
  showCount: false,
  allowClear: false,
  disabled: false,
  readonly: false,
  autofocus: false,
})

/**
 * 组件事件
 */
const emit = defineEmits<{
  /** 值更新事件 */
  'update:modelValue': [value: string]
  /** 输入事件 */
  input: [value: string, event: Event]
  /** 变化事件 */
  change: [value: string, event: Event]
  /** 获得焦点事件 */
  focus: [event: FocusEvent]
  /** 失去焦点事件 */
  blur: [event: FocusEvent]
  /** 清除事件 */
  clear: []
  /** 按下回车事件 */
  pressEnter: [event: KeyboardEvent]
  /** 键盘按下事件 */
  keydown: [event: KeyboardEvent]
  /** 键盘抬起事件 */
  keyup: [event: KeyboardEvent]
  /** 键盘按键事件 */
  keypress: [event: KeyboardEvent]
}>()

/**
 * 注入表单上下文
 */
const formContext = injectFormContext()

/**
 * 输入框引用
 */
const inputRef = ref<HTMLInputElement>()

/**
 * 密码是否可见
 */
const passwordVisible = ref(false)

/**
 * 输入框ID
 */
const inputId = computed(() => props.id || generateId('input'))

/**
 * 当前输入类型
 */
const currentType = computed(() => {
  if (props.type === 'password' && passwordVisible.value) {
    return 'text'
  }
  return props.type
})

/**
 * 当前字符长度
 */
const currentLength = computed(() => {
  return String(props.modelValue || '').length
})

/**
 * 是否显示清除按钮
 */
const showClearButton = computed(() => {
  return (props.clearable || props.allowClear) && 
         props.modelValue && 
         !props.disabled && 
         !props.readonly
})

/**
 * 是否显示密码切换按钮
 */
const showPasswordToggle = computed(() => {
  return props.type === 'password' && !props.disabled && !props.readonly
})

/**
 * 输入框包装器样式类
 */
const inputWrapperClasses = computed(() => [
  'ldesign-input-wrapper',
  `ldesign-input-wrapper--${props.size}`,
  `ldesign-input-wrapper--${props.variant}`,
  {
    'ldesign-input-wrapper--disabled': props.disabled,
    'ldesign-input-wrapper--readonly': props.readonly,
    'ldesign-input-wrapper--focused': false, // TODO: 实现焦点状态
    'ldesign-input-wrapper--error': false, // TODO: 从表单上下文获取错误状态
  },
])

/**
 * 输入框样式类
 */
const inputClasses = computed(() => [
  'ldesign-input',
  `ldesign-input--${props.size}`,
  `ldesign-input--${props.variant}`,
])

/**
 * 处理输入事件
 */
function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  emit('update:modelValue', value)
  emit('input', value, event)
  
  // 更新表单字段值
  if (formContext && props.name) {
    formContext.setFieldValue(props.name, value)
  }
}

/**
 * 处理变化事件
 */
function handleChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  emit('change', value, event)
}

/**
 * 处理获得焦点事件
 */
function handleFocus(event: FocusEvent): void {
  emit('focus', event)
  
  // 标记字段为已触摸
  if (formContext && props.name) {
    formContext.touchField(props.name)
  }
}

/**
 * 处理失去焦点事件
 */
function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

/**
 * 处理键盘按下事件
 */
function handleKeydown(event: KeyboardEvent): void {
  emit('keydown', event)
  
  if (event.key === 'Enter') {
    emit('pressEnter', event)
  }
}

/**
 * 处理键盘抬起事件
 */
function handleKeyup(event: KeyboardEvent): void {
  emit('keyup', event)
}

/**
 * 处理键盘按键事件
 */
function handleKeypress(event: KeyboardEvent): void {
  emit('keypress', event)
}

/**
 * 处理清除事件
 */
function handleClear(): void {
  emit('update:modelValue', '')
  emit('clear')
  
  // 更新表单字段值
  if (formContext && props.name) {
    formContext.setFieldValue(props.name, '')
  }
  
  // 聚焦输入框
  nextTick(() => {
    inputRef.value?.focus()
  })
}

/**
 * 处理密码显示切换
 */
function handlePasswordToggle(): void {
  passwordVisible.value = !passwordVisible.value
  
  // 保持焦点
  nextTick(() => {
    inputRef.value?.focus()
  })
}

/**
 * 聚焦输入框
 */
function focus(): void {
  inputRef.value?.focus()
}

/**
 * 失焦输入框
 */
function blur(): void {
  inputRef.value?.blur()
}

/**
 * 选中输入框内容
 */
function select(): void {
  inputRef.value?.select()
}

/**
 * 暴露组件方法
 */
defineExpose({
  /** 输入框元素引用 */
  inputRef,
  /** 聚焦 */
  focus,
  /** 失焦 */
  blur,
  /** 选中 */
  select,
})
</script>

<style lang="less">
@import '../../styles/components/input.less';
</style>
