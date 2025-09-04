<template>
  <div class="l-number" :class="numberClass">
    <input
      :id="id"
      ref="inputRef"
      v-model="displayValue"
      type="text"
      :class="inputClass"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
      @keydown="handleKeydown"
    >
    
    <!-- 增减按钮 -->
    <div v-if="controls" class="l-number__controls">
      <button
        type="button"
        class="l-number__control l-number__control--up"
        :disabled="disabled || readonly || isMaxDisabled"
        @click="increase"
        @mousedown="startContinuousChange('increase')"
        @mouseup="stopContinuousChange"
        @mouseleave="stopContinuousChange"
      >
        <svg viewBox="0 0 1024 1024" width="12" height="12">
          <path d="M512 320l256 256H256z" fill="currentColor"/>
        </svg>
      </button>
      <button
        type="button"
        class="l-number__control l-number__control--down"
        :disabled="disabled || readonly || isMinDisabled"
        @click="decrease"
        @mousedown="startContinuousChange('decrease')"
        @mouseup="stopContinuousChange"
        @mouseleave="stopContinuousChange"
      >
        <svg viewBox="0 0 1024 1024" width="12" height="12">
          <path d="M512 704L256 448h512z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

// Props 定义
interface Props {
  id?: string
  modelValue?: number | string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  min?: number
  max?: number
  step?: number
  precision?: number
  controls?: boolean
  size?: 'small' | 'medium' | 'large'
  formatter?: (value: number) => string
  parser?: (value: string) => number
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  controls: true,
  size: 'medium'
})

// Emits 定义
interface Emits {
  'update:modelValue': [value: number | undefined]
  'input': [value: number | undefined, event: Event]
  'change': [value: number | undefined, event: Event]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'keydown': [event: KeyboardEvent]
}

const emit = defineEmits<Emits>()

// 响应式数据
const inputRef = ref<HTMLInputElement>()
const displayValue = ref('')
const isFocused = ref(false)
const continuousTimer = ref<NodeJS.Timeout>()
const continuousAction = ref<'increase' | 'decrease' | null>(null)

// 计算属性
const numberValue = computed(() => {
  const value = props.modelValue
  if (value === null || value === undefined || value === '') {
    return undefined
  }
  return typeof value === 'number' ? value : parseFloat(String(value))
})

const numberClass = computed(() => {
  const classes = []
  
  if (props.size) {
    classes.push(`l-number--${props.size}`)
  }
  
  if (props.disabled) {
    classes.push('l-number--disabled')
  }
  
  if (props.readonly) {
    classes.push('l-number--readonly')
  }
  
  if (props.error) {
    classes.push('l-number--error')
  }
  
  if (isFocused.value) {
    classes.push('l-number--focused')
  }
  
  return classes.join(' ')
})

const inputClass = computed(() => {
  const classes = ['l-number__input']
  return classes.join(' ')
})

const isMinDisabled = computed(() => {
  if (props.min === undefined || numberValue.value === undefined) {
    return false
  }
  return numberValue.value <= props.min
})

const isMaxDisabled = computed(() => {
  if (props.max === undefined || numberValue.value === undefined) {
    return false
  }
  return numberValue.value >= props.max
})

const maxlength = computed(() => {
  // 根据 min、max 和 precision 计算最大长度
  let length = 20 // 默认长度
  
  if (props.max !== undefined) {
    length = Math.max(length, String(props.max).length)
  }
  
  if (props.precision !== undefined && props.precision > 0) {
    length += props.precision + 1 // 加上小数点
  }
  
  return length
})

// 工具函数
const formatNumber = (value: number): string => {
  if (props.formatter) {
    return props.formatter(value)
  }
  
  if (props.precision !== undefined) {
    return value.toFixed(props.precision)
  }
  
  return String(value)
}

const parseNumber = (value: string): number => {
  if (props.parser) {
    return props.parser(value)
  }
  
  // 移除非数字字符（保留小数点和负号）
  const cleanValue = value.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleanValue)
  
  return isNaN(parsed) ? 0 : parsed
}

const clampValue = (value: number): number => {
  let clampedValue = value
  
  if (props.min !== undefined) {
    clampedValue = Math.max(clampedValue, props.min)
  }
  
  if (props.max !== undefined) {
    clampedValue = Math.min(clampedValue, props.max)
  }
  
  if (props.precision !== undefined) {
    clampedValue = parseFloat(clampedValue.toFixed(props.precision))
  }
  
  return clampedValue
}

const updateDisplayValue = () => {
  if (numberValue.value !== undefined) {
    displayValue.value = isFocused.value ? String(numberValue.value) : formatNumber(numberValue.value)
  } else {
    displayValue.value = ''
  }
}

// 事件处理
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  if (value === '' || value === '-') {
    emit('update:modelValue', undefined)
    emit('input', undefined, event)
    return
  }
  
  const parsed = parseNumber(value)
  if (!isNaN(parsed)) {
    const clamped = clampValue(parsed)
    emit('update:modelValue', clamped)
    emit('input', clamped, event)
  }
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  if (value === '') {
    emit('update:modelValue', undefined)
    emit('change', undefined, event)
    return
  }
  
  const parsed = parseNumber(value)
  if (!isNaN(parsed)) {
    const clamped = clampValue(parsed)
    emit('update:modelValue', clamped)
    emit('change', clamped, event)
  }
  
  updateDisplayValue()
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  updateDisplayValue()
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  updateDisplayValue()
  emit('focus', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  // 允许的按键
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ]
  
  // 数字键
  const isNumber = /^[0-9]$/.test(event.key)
  
  // 小数点
  const isDecimal = event.key === '.' && props.precision !== 0
  
  // 负号
  const isMinus = event.key === '-' && (props.min === undefined || props.min < 0)
  
  // Ctrl/Cmd 组合键
  const isCtrlCmd = event.ctrlKey || event.metaKey
  
  if (!allowedKeys.includes(event.key) && !isNumber && !isDecimal && !isMinus && !isCtrlCmd) {
    event.preventDefault()
    return
  }
  
  // 上下箭头键调整数值
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    increase()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    decrease()
  }
  
  emit('keydown', event)
}

// 增减操作
const increase = () => {
  if (props.disabled || props.readonly || isMaxDisabled.value) {
    return
  }
  
  const current = numberValue.value || 0
  const newValue = clampValue(current + props.step)
  emit('update:modelValue', newValue)
}

const decrease = () => {
  if (props.disabled || props.readonly || isMinDisabled.value) {
    return
  }
  
  const current = numberValue.value || 0
  const newValue = clampValue(current - props.step)
  emit('update:modelValue', newValue)
}

// 连续增减
const startContinuousChange = (action: 'increase' | 'decrease') => {
  continuousAction.value = action
  
  continuousTimer.value = setTimeout(() => {
    const repeatChange = () => {
      if (continuousAction.value === 'increase') {
        increase()
      } else if (continuousAction.value === 'decrease') {
        decrease()
      }
      
      if (continuousAction.value) {
        continuousTimer.value = setTimeout(repeatChange, 100)
      }
    }
    repeatChange()
  }, 500)
}

const stopContinuousChange = () => {
  continuousAction.value = null
  if (continuousTimer.value) {
    clearTimeout(continuousTimer.value)
    continuousTimer.value = undefined
  }
}

// 暴露方法
const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

const select = () => {
  inputRef.value?.select()
}

defineExpose({
  focus,
  blur,
  select,
  inputRef
})

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  () => {
    updateDisplayValue()
  },
  { immediate: true }
)

// 监听焦点状态变化
watch(isFocused, () => {
  nextTick(() => {
    updateDisplayValue()
  })
})
</script>

<style scoped>
.l-number {
  position: relative;
  display: inline-flex;
  width: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  transition: all 0.2s;
}

.l-number:hover {
  border-color: #40a9ff;
}

.l-number--focused {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.l-number--disabled {
  background: #f5f5f5;
  border-color: #d9d9d9;
  cursor: not-allowed;
}

.l-number--disabled:hover {
  border-color: #d9d9d9;
}

.l-number--readonly {
  background: #f5f5f5;
  cursor: default;
}

.l-number--error {
  border-color: #ff4d4f;
}

.l-number--error:hover,
.l-number--error.l-number--focused {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.l-number--small {
  font-size: 12px;
}

.l-number--small .l-number__input {
  padding: 4px 8px;
}

.l-number--large {
  font-size: 16px;
}

.l-number--large .l-number__input {
  padding: 12px 16px;
}

.l-number__input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  outline: none;
  background: transparent;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
}

.l-number__input::placeholder {
  color: #bfbfbf;
}

.l-number--disabled .l-number__input {
  color: #bfbfbf;
  cursor: not-allowed;
}

.l-number__controls {
  display: flex;
  flex-direction: column;
  border-left: 1px solid #d9d9d9;
}

.l-number__control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 50%;
  border: none;
  background: #fff;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.l-number__control:hover {
  background: #f5f5f5;
  color: #1890ff;
}

.l-number__control:active {
  background: #e6f7ff;
}

.l-number__control:disabled {
  background: #f5f5f5;
  color: #bfbfbf;
  cursor: not-allowed;
}

.l-number__control--up {
  border-bottom: 1px solid #d9d9d9;
  border-radius: 0 3px 0 0;
}

.l-number__control--down {
  border-radius: 0 0 3px 0;
}

.l-number--disabled .l-number__controls {
  border-left-color: #d9d9d9;
}

.l-number--disabled .l-number__control {
  background: #f5f5f5;
  color: #bfbfbf;
  cursor: not-allowed;
}
</style>