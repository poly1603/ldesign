<template>
  <div
    class="l-form-item"
    :class="fieldClass"
    :data-field="option.name"
  >
    <!-- 标签 -->
    <div
      v-if="showLabel"
      :class="labelClass"
      class="l-form-item__label"
    >
      <label
        :for="fieldId"
        :class="{
          'l-form-item__label--required': isRequired,
          'l-form-item__label--colon': layout.colon
        }"
      >
        {{ option.label }}
        <span v-if="isRequired && layout.requiredMark" class="l-form-item__required">*</span>
        <span v-if="layout.colon" class="l-form-item__colon">:</span>
      </label>
      
      <!-- 标签提示 -->
      <div v-if="option.labelTip" class="l-form-item__label-tip">
        <span class="l-form-item__tip-icon">?</span>
        <div class="l-form-item__tip-content">{{ option.labelTip }}</div>
      </div>
    </div>

    <!-- 控件包装器 -->
    <div :class="wrapperClass" class="l-form-item__wrapper">
      <!-- 控件前缀 -->
      <div v-if="option.prefix" class="l-form-item__prefix">
        <component
          v-if="typeof option.prefix === 'object'"
          :is="option.prefix.component"
          v-bind="option.prefix.props"
        />
        <span v-else>{{ option.prefix }}</span>
      </div>

      <!-- 主控件 -->
      <div class="l-form-item__control">
        <!-- 动态组件渲染 -->
        <component
          :is="componentName"
          :id="fieldId"
          v-model="fieldValue"
          v-bind="componentProps"
          :class="controlClass"
          @change="handleChange"
          @blur="handleBlur"
          @focus="handleFocus"
          @input="handleInput"
          @keydown="handleKeydown"
        >
          <!-- 插槽内容 -->
          <template v-if="option.type === 'select' && option.options">
            <option
              v-for="opt in option.options"
              :key="getOptionValue(opt)"
              :value="getOptionValue(opt)"
              :disabled="getOptionDisabled(opt)"
            >
              {{ getOptionLabel(opt) }}
            </option>
          </template>
          
          <template v-else-if="option.type === 'radio' && option.options">
            <label
              v-for="opt in option.options"
              :key="getOptionValue(opt)"
              class="l-radio"
            >
              <input
                type="radio"
                :name="option.name"
                :value="getOptionValue(opt)"
                :checked="fieldValue === getOptionValue(opt)"
                :disabled="getOptionDisabled(opt) || option.disabled"
                @change="handleRadioChange"
              >
              <span class="l-radio__label">{{ getOptionLabel(opt) }}</span>
            </label>
          </template>
          
          <template v-else-if="option.type === 'checkbox' && option.options">
            <label
              v-for="opt in option.options"
              :key="getOptionValue(opt)"
              class="l-checkbox"
            >
              <input
                type="checkbox"
                :value="getOptionValue(opt)"
                :checked="isChecked(getOptionValue(opt))"
                :disabled="getOptionDisabled(opt) || option.disabled"
                @change="handleCheckboxChange"
              >
              <span class="l-checkbox__label">{{ getOptionLabel(opt) }}</span>
            </label>
          </template>
        </component>

        <!-- 控件后缀 -->
        <div v-if="option.suffix" class="l-form-item__suffix">
          <component
            v-if="typeof option.suffix === 'object'"
            :is="option.suffix.component"
            v-bind="option.suffix.props"
          />
          <span v-else>{{ option.suffix }}</span>
        </div>
      </div>

      <!-- 错误信息 -->
      <div
        v-if="showError"
        class="l-form-item__error"
        :class="{ 'l-form-item__error--visible': hasError }"
      >
        <transition name="error-fade">
          <span v-if="hasError" class="l-form-item__error-text">
            {{ currentError }}
          </span>
        </transition>
      </div>

      <!-- 帮助信息 -->
      <div v-if="option.help && !hasError" class="l-form-item__help">
        {{ option.help }}
      </div>

      <!-- 额外信息 -->
      <div v-if="option.extra" class="l-form-item__extra">
        {{ option.extra }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useFormField } from '../hooks/useForm'
import { COMPONENT_MAP } from './index'
import type { LDesignFormOption } from '../types'

// Props 定义
interface Props {
  option: LDesignFormOption
  formData: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  layout: {
    labelCol?: number | Record<string, number>
    wrapperCol?: number | Record<string, number>
    layout?: 'horizontal' | 'vertical' | 'inline'
    size?: 'small' | 'medium' | 'large'
    colon?: boolean
    requiredMark?: boolean
  }
}

const props = defineProps<Props>()

// Emits 定义
interface Emits {
  'change': [name: string, value: any]
  'blur': [name: string]
  'focus': [name: string]
}

const emit = defineEmits<Emits>()

// 使用表单字段 Hook
const {
  fieldConfig,
  fieldValue,
  fieldError,
  fieldTouched,
  fieldValidating,
  handleChange: _handleChange,
  handleBlur: _handleBlur,
  handleFocus: _handleFocus
} = useFormField(props.option.name)

// 响应式数据
const fieldRef = ref<HTMLElement>()
const fieldId = computed(() => `field-${props.option.name}`)

// 计算属性
const componentName = computed(() => {
  const type = props.option.type || 'input'
  return COMPONENT_MAP[type] || 'FormInput'
})

const componentProps = computed(() => {
  const baseProps = {
    placeholder: props.option.placeholder,
    disabled: props.option.disabled,
    readonly: props.option.readonly,
    size: props.layout.size,
    ...props.option.props
  }

  // 根据类型添加特定属性
  switch (props.option.type) {
    case 'input':
      return {
        ...baseProps,
        type: props.option.inputType || 'text',
        maxlength: props.option.maxlength,
        minlength: props.option.minlength,
        pattern: props.option.pattern
      }
    case 'textarea':
      return {
        ...baseProps,
        rows: props.option.rows || 3,
        maxlength: props.option.maxlength,
        resize: props.option.resize
      }
    case 'number':
      return {
        ...baseProps,
        min: props.option.min,
        max: props.option.max,
        step: props.option.step,
        precision: props.option.precision
      }
    case 'select':
      return {
        ...baseProps,
        multiple: props.option.multiple,
        filterable: props.option.filterable,
        clearable: props.option.clearable,
        options: props.option.options
      }
    case 'date':
    case 'datetime':
    case 'time':
      return {
        ...baseProps,
        format: props.option.format,
        valueFormat: props.option.valueFormat,
        disabledDate: props.option.disabledDate
      }
    default:
      return baseProps
  }
})

const isRequired = computed(() => {
  return props.option.required || false
})

const showLabel = computed(() => {
  return props.option.label && props.layout.layout !== 'inline'
})

const hasError = computed(() => {
  return !!(props.errors[props.option.name] && props.touched[props.option.name])
})

const currentError = computed(() => {
  return props.errors[props.option.name] || ''
})

const showError = computed(() => {
  return props.option.showError !== false
})

const fieldClass = computed(() => {
  const classes = []
  
  if (props.layout.layout) {
    classes.push(`l-form-item--${props.layout.layout}`)
  }
  
  if (props.layout.size) {
    classes.push(`l-form-item--${props.layout.size}`)
  }
  
  if (hasError.value) {
    classes.push('l-form-item--error')
  }
  
  if (props.option.disabled) {
    classes.push('l-form-item--disabled')
  }
  
  if (fieldValidating.value) {
    classes.push('l-form-item--validating')
  }
  
  return classes.join(' ')
})

const labelClass = computed(() => {
  const classes = []
  
  if (typeof props.layout.labelCol === 'number') {
    classes.push(`l-col-${props.layout.labelCol}`)
  }
  
  return classes.join(' ')
})

const wrapperClass = computed(() => {
  const classes = []
  
  if (typeof props.layout.wrapperCol === 'number') {
    classes.push(`l-col-${props.layout.wrapperCol}`)
  }
  
  return classes.join(' ')
})

const controlClass = computed(() => {
  const classes = ['l-form-control']
  
  if (hasError.value) {
    classes.push('l-form-control--error')
  }
  
  return classes.join(' ')
})

// 选项处理函数
const getOptionValue = (option: any) => {
  if (typeof option === 'object' && option !== null) {
    return option.value ?? option.key ?? option.id
  }
  return option
}

const getOptionLabel = (option: any) => {
  if (typeof option === 'object' && option !== null) {
    return option.label ?? option.text ?? option.name ?? option.value
  }
  return option
}

const getOptionDisabled = (option: any) => {
  if (typeof option === 'object' && option !== null) {
    return option.disabled ?? false
  }
  return false
}

const isChecked = (value: any) => {
  if (Array.isArray(fieldValue.value)) {
    return fieldValue.value.includes(value)
  }
  return fieldValue.value === value
}

// 事件处理
const handleChange = (value: any) => {
  _handleChange(value)
  emit('change', props.option.name, value)
}

const handleBlur = () => {
  _handleBlur()
  emit('blur', props.option.name)
}

const handleFocus = () => {
  _handleFocus()
  emit('focus', props.option.name)
}

const handleInput = (value: any) => {
  // 输入事件，可以用于实时验证
  if (props.option.validateOnInput) {
    handleChange(value)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // 键盘事件处理
  if (props.option.onKeydown) {
    props.option.onKeydown(event)
  }
}

const handleRadioChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  handleChange(target.value)
}

const handleCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  let newValue: any
  if (Array.isArray(fieldValue.value)) {
    newValue = [...fieldValue.value]
    if (target.checked) {
      if (!newValue.includes(value)) {
        newValue.push(value)
      }
    } else {
      const index = newValue.indexOf(value)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
  } else {
    newValue = target.checked ? [value] : []
  }
  
  handleChange(newValue)
}

// 监听字段配置变化
watch(
  () => props.option,
  () => {
    // 字段配置变化时的处理逻辑
  },
  { deep: true }
)
</script>

<style scoped>
.l-form-item {
  margin-bottom: 16px;
}

.l-form-item--horizontal {
  display: flex;
  align-items: flex-start;
}

.l-form-item--vertical {
  display: block;
}

.l-form-item--inline {
  display: inline-flex;
  align-items: center;
  margin-right: 16px;
  margin-bottom: 0;
}

.l-form-item--small {
  margin-bottom: 12px;
}

.l-form-item--large {
  margin-bottom: 20px;
}

.l-form-item--error .l-form-control {
  border-color: #ff4d4f;
}

.l-form-item--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.l-form-item--validating .l-form-control {
  border-color: #1890ff;
}

.l-form-item__label {
  display: flex;
  align-items: center;
  padding-right: 12px;
  font-weight: 500;
  color: #333;
  text-align: right;
  position: relative;
}

.l-form-item--vertical .l-form-item__label {
  text-align: left;
  padding-right: 0;
  padding-bottom: 4px;
}

.l-form-item--inline .l-form-item__label {
  text-align: left;
  padding-right: 8px;
  margin-bottom: 0;
}

.l-form-item__label--required {
  position: relative;
}

.l-form-item__required {
  color: #ff4d4f;
  margin-left: 2px;
}

.l-form-item__colon {
  margin-left: 2px;
}

.l-form-item__label-tip {
  position: relative;
  margin-left: 4px;
}

.l-form-item__tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 12px;
  color: #666;
  cursor: help;
}

.l-form-item__tip-content {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
  padding: 8px 12px;
  background: #333;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
}

.l-form-item__tip-icon:hover + .l-form-item__tip-content {
  opacity: 1;
  visibility: visible;
}

.l-form-item__wrapper {
  flex: 1;
  min-width: 0;
}

.l-form-item__control {
  position: relative;
  display: flex;
  align-items: center;
}

.l-form-item__prefix,
.l-form-item__suffix {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.l-form-item__prefix {
  margin-right: 8px;
}

.l-form-item__suffix {
  margin-left: 8px;
}

.l-form-control {
  flex: 1;
  min-width: 0;
}

.l-form-item__error {
  margin-top: 4px;
  min-height: 20px;
}

.l-form-item__error-text {
  color: #ff4d4f;
  font-size: 12px;
  line-height: 1.4;
}

.l-form-item__help {
  margin-top: 4px;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

.l-form-item__extra {
  margin-top: 4px;
  color: #999;
  font-size: 12px;
  line-height: 1.4;
}

/* 单选框样式 */
.l-radio {
  display: inline-flex;
  align-items: center;
  margin-right: 16px;
  cursor: pointer;
}

.l-radio input[type="radio"] {
  margin-right: 6px;
}

.l-radio__label {
  font-size: 14px;
  color: #333;
}

/* 复选框样式 */
.l-checkbox {
  display: inline-flex;
  align-items: center;
  margin-right: 16px;
  cursor: pointer;
}

.l-checkbox input[type="checkbox"] {
  margin-right: 6px;
}

.l-checkbox__label {
  font-size: 14px;
  color: #333;
}

/* 栅格系统 */
.l-col-1 { width: 4.16667%; }
.l-col-2 { width: 8.33333%; }
.l-col-3 { width: 12.5%; }
.l-col-4 { width: 16.66667%; }
.l-col-5 { width: 20.83333%; }
.l-col-6 { width: 25%; }
.l-col-7 { width: 29.16667%; }
.l-col-8 { width: 33.33333%; }
.l-col-9 { width: 37.5%; }
.l-col-10 { width: 41.66667%; }
.l-col-11 { width: 45.83333%; }
.l-col-12 { width: 50%; }
.l-col-13 { width: 54.16667%; }
.l-col-14 { width: 58.33333%; }
.l-col-15 { width: 62.5%; }
.l-col-16 { width: 66.66667%; }
.l-col-17 { width: 70.83333%; }
.l-col-18 { width: 75%; }
.l-col-19 { width: 79.16667%; }
.l-col-20 { width: 83.33333%; }
.l-col-21 { width: 87.5%; }
.l-col-22 { width: 91.66667%; }
.l-col-23 { width: 95.83333%; }
.l-col-24 { width: 100%; }

/* 动画 */
.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.2s;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>