<!--
  Input 输入框组件
  用于接收用户输入的文本信息
-->

<template>
  <div :class="inputClasses" :style="inputStyles">
    <!-- 前置内容 -->
    <div v-if="prepend" class="l-input__prepend">
      {{ prepend }}
    </div>

    <!-- 输入框容器 -->
    <div class="l-input__wrapper">
      <!-- 前缀图标 -->
      <div v-if="prefixIcon" class="l-input__prefix">
        <l-icon v-if="typeof prefixIcon === 'string'" :name="prefixIcon" />
        <component v-else :is="prefixIcon" />
      </div>

      <!-- 输入框 -->
      <input
        ref="inputRef"
        v-model="inputValue"
        :type="currentType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :name="name"
        :id="id"
        :autofocus="autofocus"
        class="l-input__inner"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <!-- 后缀内容 -->
      <div v-if="showSuffix" class="l-input__suffix">
        <!-- 清空按钮 -->
        <div
          v-if="showClearButton"
          class="l-input__clear"
          @click="handleClear"
        >
          <l-icon name="✕" />
        </div>

        <!-- 密码切换按钮 -->
        <div
          v-if="showPasswordButton"
          class="l-input__password"
          @click="togglePasswordVisibility"
        >
          <l-icon :name="passwordVisible ? '👁️' : '🙈'" />
        </div>

        <!-- 后缀图标 -->
        <div v-if="suffixIcon">
          <l-icon v-if="typeof suffixIcon === 'string'" :name="suffixIcon" />
          <component v-else :is="suffixIcon" />
        </div>
      </div>
    </div>

    <!-- 后置内容 -->
    <div v-if="append" class="l-input__append">
      {{ append }}
    </div>

    <!-- 字数统计 -->
    <div v-if="showCount && maxlength" class="l-input__count">
      {{ currentLength }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { InputProps, InputEmits } from './types'

/**
 * 组件名称
 */
defineOptions({
  name: 'LInput'
})

/**
 * 组件属性
 */
const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'medium',
  status: 'default',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  showPassword: false,
  showCount: false,
  autofocus: false,
  autocomplete: 'off'
})

/**
 * 组件事件
 */
const emit = defineEmits<InputEmits>()

/**
 * 输入框元素引用
 */
const inputRef = ref<HTMLInputElement>()

/**
 * 密码是否可见
 */
const passwordVisible = ref(false)

/**
 * 内部值
 */
const inputValue = computed({
  get: () => props.modelValue ?? '',
  set: (value) => {
    emit('update:modelValue', value)
  }
})

/**
 * 当前输入类型
 */
const currentType = computed(() => {
  if (props.type === 'password' && props.showPassword) {
    return passwordVisible.value ? 'text' : 'password'
  }
  return props.type
})

/**
 * 当前文本长度
 */
const currentLength = computed(() => {
  return String(inputValue.value).length
})

/**
 * 是否显示后缀
 */
const showSuffix = computed(() => {
  return showClearButton.value || showPasswordButton.value || props.suffixIcon
})

/**
 * 是否显示清空按钮
 */
const showClearButton = computed(() => {
  return props.clearable && !props.disabled && !props.readonly && inputValue.value
})

/**
 * 是否显示密码切换按钮
 */
const showPasswordButton = computed(() => {
  return props.type === 'password' && props.showPassword && !props.disabled && !props.readonly
})

/**
 * 输入框类名
 */
const inputClasses = computed(() => {
  const classes = ['l-input']
  
  // 尺寸类名
  classes.push(`l-input--${props.size}`)
  
  // 状态类名
  if (props.status !== 'default') {
    classes.push(`l-input--${props.status}`)
  }
  
  // 禁用状态
  if (props.disabled) {
    classes.push('l-input--disabled')
  }
  
  // 只读状态
  if (props.readonly) {
    classes.push('l-input--readonly')
  }
  
  // 前置内容
  if (props.prepend) {
    classes.push('l-input--prepend')
  }
  
  // 后置内容
  if (props.append) {
    classes.push('l-input--append')
  }
  
  // 自定义类名
  if (props.class) {
    classes.push(props.class)
  }
  
  return classes
})

/**
 * 输入框样式
 */
const inputStyles = computed(() => {
  const styles: Record<string, any> = {}
  
  // 合并自定义样式
  if (props.style) {
    if (typeof props.style === 'string') {
      const customStyles = props.style.split(';').reduce((acc, style) => {
        const [key, value] = style.split(':').map(s => s.trim())
        if (key && value) {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, string>)
      Object.assign(styles, customStyles)
    } else {
      Object.assign(styles, props.style)
    }
  }
  
  return styles
})

/**
 * 输入事件处理
 */
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('input', value, event)
}

/**
 * 变化事件处理
 */
const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('change', value, event)
}

/**
 * 获得焦点事件处理
 */
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

/**
 * 失去焦点事件处理
 */
const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

/**
 * 按键事件处理
 */
const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
  
  if (event.key === 'Enter') {
    emit('enter', event)
  }
}

/**
 * 清空输入框
 */
const handleClear = () => {
  inputValue.value = ''
  emit('clear')
  focus()
}

/**
 * 切换密码可见性
 */
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

/**
 * 获取输入框元素
 */
const getInputElement = () => {
  return inputRef.value || null
}

/**
 * 获取焦点
 */
const focus = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

/**
 * 失去焦点
 */
const blur = () => {
  inputRef.value?.blur()
}

/**
 * 选中所有文本
 */
const select = () => {
  inputRef.value?.select()
}

/**
 * 清空输入框
 */
const clear = () => {
  handleClear()
}

/**
 * 暴露组件实例方法
 */
defineExpose({
  getInputElement,
  focus,
  blur,
  select,
  clear
})
</script>

<style lang="less">
@import './input.less';
</style>
