<template>
  <div
    :class="[
      'l-form-field',
      `l-form-field--${config.component || 'input'}`,
      `l-form-field--${size}`,
      `l-form-field--${mode}`,
      {
        'l-form-field--required': isRequired,
        'l-form-field--disabled': isDisabled,
        'l-form-field--hidden': isHidden,
        'l-form-field--error': hasError,
        'l-form-field--warning': hasWarning,
        'l-form-field--focused': isFocused,
        'l-form-field--touched': isTouched
      },
      config.className
    ]"
    :style="fieldStyles"
    v-show="!isHidden"
  >
    <!-- 字段标签 -->
    <div
      v-if="showLabel"
      :class="[
        'l-form-field__label',
        {
          'l-form-field__label--required': isRequired
        }
      ]"
      :style="labelStyles"
    >
      <label
        :for="fieldId"
        class="l-form-field__label-text"
      >
        {{ config.title || config.label }}
        <span v-if="isRequired && showRequiredMark" class="l-form-field__required-mark">*</span>
      </label>
      
      <!-- 帮助图标 -->
      <span
        v-if="config.help || config.tooltip"
        class="l-form-field__help-icon"
        @click="showHelp = !showHelp"
      >
        ?
      </span>
    </div>

    <!-- 字段内容 -->
    <div class="l-form-field__content">
      <!-- 前缀 -->
      <div v-if="config.prefix || config.prefixIcon" class="l-form-field__prefix">
        <i v-if="config.prefixIcon" :class="config.prefixIcon"></i>
        <span v-if="config.prefix">{{ config.prefix }}</span>
      </div>

      <!-- 字段组件 -->
      <div class="l-form-field__control">
        <component
          :is="fieldComponent"
          :id="fieldId"
          :value="value"
          :disabled="isDisabled"
          :readonly="mode === 'view'"
          :size="size"
          :placeholder="config.placeholder"
          v-bind="computedProps"
          @update:value="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          @keyup="handleKeyup"
          @input="handleInput"
          @click="handleClick"
        />
      </div>

      <!-- 后缀 -->
      <div v-if="config.suffix || config.suffixIcon" class="l-form-field__suffix">
        <span v-if="config.suffix">{{ config.suffix }}</span>
        <i v-if="config.suffixIcon" :class="config.suffixIcon"></i>
      </div>
    </div>

    <!-- 字段状态图标 -->
    <div v-if="showStatusIcon" class="l-form-field__status">
      <i :class="statusIconClass"></i>
    </div>

    <!-- 错误/警告消息 -->
    <div
      v-if="showMessage && (hasError || hasWarning)"
      :class="[
        'l-form-field__message',
        {
          'l-form-field__message--error': hasError,
          'l-form-field__message--warning': hasWarning
        }
      ]"
    >
      {{ errorMessage || warningMessage }}
    </div>

    <!-- 帮助文本 -->
    <div
      v-if="config.help && (showHelp || !config.tooltip)"
      class="l-form-field__help"
    >
      {{ config.help }}
    </div>

    <!-- 字段描述 -->
    <div
      v-if="config.description"
      class="l-form-field__description"
    >
      {{ config.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  inject,
  watch,
  onMounted,
  onUnmounted,
  type CSSProperties
} from 'vue'
import type {
  FormFieldConfig,
  AnyObject,
  ModeType,
  SizeType
} from '../../types'
import { generateId } from '../../core/utils'

// 内置组件映射
import FormInput from './fields/FormInput.vue'
import FormTextarea from './fields/FormTextarea.vue'
import FormSelect from './fields/FormSelect.vue'
import FormRadio from './fields/FormRadio.vue'
import FormCheckbox from './fields/FormCheckbox.vue'
import FormSwitch from './fields/FormSwitch.vue'
import FormDatePicker from './fields/FormDatePicker.vue'
import FormTimePicker from './fields/FormTimePicker.vue'
import FormUpload from './fields/FormUpload.vue'

const BUILTIN_COMPONENTS = {
  FormInput,
  FormTextarea,
  FormSelect,
  FormRadio,
  FormCheckbox,
  FormSwitch,
  FormDatePicker,
  FormTimePicker,
  FormUpload
}

// 组件属性
interface Props {
  config: FormFieldConfig
  value?: any
  formData?: AnyObject
  disabled?: boolean
  size?: SizeType
  mode?: ModeType
}

// 组件事件
interface Emits {
  (e: 'change', fieldName: string, value: any, oldValue: any): void
  (e: 'focus', fieldName: string, event: Event): void
  (e: 'blur', fieldName: string, event: Event): void
  (e: 'keydown', fieldName: string, event: KeyboardEvent): void
  (e: 'keyup', fieldName: string, event: KeyboardEvent): void
  (e: 'input', fieldName: string, event: Event): void
  (e: 'click', fieldName: string, event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  formData: () => ({}),
  disabled: false,
  size: 'medium',
  mode: 'edit'
})

const emit = defineEmits<Emits>()

// 注入的数据
const formInstance = inject('formInstance', ref(null))
const formState = inject('formState', ref({}))

// 响应式数据
const fieldId = ref(generateId('field'))
const showHelp = ref(false)
const isFocused = ref(false)
const isTouched = ref(false)
const errorMessage = ref('')
const warningMessage = ref('')

// 计算属性
const fieldComponent = computed(() => {
  const componentName = props.config.component
  
  if (!componentName) {
    return FormInput // 默认组件
  }
  
  if (typeof componentName === 'string') {
    // 内置组件
    if (componentName in BUILTIN_COMPONENTS) {
      return BUILTIN_COMPONENTS[componentName as keyof typeof BUILTIN_COMPONENTS]
    }
    
    // 全局注册的组件
    return componentName
  }
  
  // 直接传入的组件
  return componentName
})

const isRequired = computed(() => {
  if (typeof props.config.required === 'function') {
    return props.config.required(props.formData || {})
  }
  return props.config.required || false
})

const isDisabled = computed(() => {
  if (props.disabled) return true
  
  if (typeof props.config.disabled === 'function') {
    return props.config.disabled(props.formData || {})
  }
  return props.config.disabled || false
})

const isHidden = computed(() => {
  if (typeof props.config.hidden === 'function') {
    return props.config.hidden(props.formData || {})
  }
  return props.config.hidden || false
})

const hasError = computed(() => {
  return !!errorMessage.value
})

const hasWarning = computed(() => {
  return !!warningMessage.value
})

const showLabel = computed(() => {
  return !!(props.config.title || props.config.label)
})

const showRequiredMark = computed(() => {
  // 可以从表单配置中获取是否显示必填标记
  return true
})

const showStatusIcon = computed(() => {
  // 可以从表单配置中获取是否显示状态图标
  return hasError.value || hasWarning.value
})

const showMessage = computed(() => {
  // 可以从表单配置中获取是否显示消息
  return true
})

const statusIconClass = computed(() => {
  if (hasError.value) {
    return 'l-icon-error'
  }
  if (hasWarning.value) {
    return 'l-icon-warning'
  }
  return ''
})

const computedProps = computed(() => {
  let props = { ...props.config.props }
  
  // 应用动态属性
  if (props.config.dynamicProps) {
    const dynamicProps = props.config.dynamicProps(props.formData || {})
    props = { ...props, ...dynamicProps }
  }
  
  // 处理选项配置
  if (props.config.optionsConfig) {
    // 这里可以处理动态选项加载
    // 实际实现中需要与条件引擎配合
  }
  
  return props
})

const fieldStyles = computed((): CSSProperties => {
  const styles: CSSProperties = {}
  
  // 应用Grid布局属性
  if (props.config.gridColumn) {
    styles.gridColumn = props.config.gridColumn
  }
  
  if (props.config.gridRow) {
    styles.gridRow = props.config.gridRow
  }
  
  if (props.config.gridArea) {
    styles.gridArea = props.config.gridArea
  }
  
  // 应用span属性
  if (props.config.span) {
    if (typeof props.config.span === 'number') {
      styles.gridColumn = `span ${props.config.span}`
    } else if (typeof props.config.span === 'string') {
      styles.gridColumn = props.config.span
    }
  }
  
  // 应用自定义样式
  if (props.config.style) {
    Object.assign(styles, props.config.style)
  }
  
  return styles
})

const labelStyles = computed((): CSSProperties => {
  const styles: CSSProperties = {}
  
  // 可以从表单布局配置中获取标签样式
  // 这里简化处理
  
  return styles
})

// 方法
const handleChange = (newValue: any) => {
  const oldValue = props.value
  
  if (newValue !== oldValue) {
    emit('change', props.config.name, newValue, oldValue)
    
    // 执行字段的onChange回调
    if (props.config.onChange) {
      props.config.onChange(newValue, props.formData || {}, oldValue)
    }
  }
}

const handleFocus = (event: Event) => {
  isFocused.value = true
  emit('focus', props.config.name, event)
  
  // 执行字段的onFocus回调
  if (props.config.onFocus) {
    props.config.onFocus(event, props.formData || {})
  }
}

const handleBlur = (event: Event) => {
  isFocused.value = false
  isTouched.value = true
  emit('blur', props.config.name, event)
  
  // 执行字段的onBlur回调
  if (props.config.onBlur) {
    props.config.onBlur(event, props.formData || {})
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', props.config.name, event)
  
  // 执行字段的onKeydown回调
  if (props.config.onKeydown) {
    props.config.onKeydown(event, props.formData || {})
  }
}

const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', props.config.name, event)
  
  // 执行字段的onKeyup回调
  if (props.config.onKeyup) {
    props.config.onKeyup(event, props.formData || {})
  }
}

const handleInput = (event: Event) => {
  emit('input', props.config.name, event)
  
  // 执行字段的onInput回调
  if (props.config.onInput) {
    props.config.onInput(event, props.formData || {})
  }
}

const handleClick = (event: Event) => {
  emit('click', props.config.name, event)
  
  // 执行字段的onClick回调
  if (props.config.onClick) {
    props.config.onClick(event, props.formData || {})
  }
}

// 监听字段状态变化
const updateFieldState = () => {
  if (!formInstance.value) return
  
  const fieldState = formInstance.value.stateManager.getFieldState(props.config.name)
  if (fieldState) {
    isFocused.value = fieldState.isFocused
    isTouched.value = fieldState.isTouched
    errorMessage.value = fieldState.errors?.[0] || ''
    warningMessage.value = fieldState.warnings?.[0] || ''
  }
}

// 监听表单实例变化
watch(formInstance, (newInstance) => {
  if (newInstance) {
    // 监听字段状态更新
    newInstance.eventBus.on('field:updated', (event: any) => {
      if (event.field?.name === props.config.name) {
        updateFieldState()
      }
    })
    
    // 监听条件渲染更新
    newInstance.eventBus.on('condition:field-update', (event: any) => {
      if (event.field?.name === props.config.name) {
        // 处理条件渲染更新
        // 这里可以更新字段的显示状态、属性等
      }
    })
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  updateFieldState()
})

onUnmounted(() => {
  // 清理事件监听
})
</script>

<style lang="less">
.l-form-field {
  position: relative;
  margin-bottom: 16px;
  
  &__label {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    &--required {
      .l-form-field__label-text::after {
        content: '*';
        color: var(--error-color, #ff4d4f);
        margin-left: 4px;
      }
    }
  }
  
  &__label-text {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color-primary, #262626);
    line-height: 1.5;
  }
  
  &__required-mark {
    color: var(--error-color, #ff4d4f);
    margin-left: 4px;
  }
  
  &__help-icon {
    margin-left: 8px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: var(--border-color, #d9d9d9);
    color: var(--text-color-secondary, #8c8c8c);
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &:hover {
      background-color: var(--primary-color, #1890ff);
      color: white;
    }
  }
  
  &__content {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  &__prefix,
  &__suffix {
    display: flex;
    align-items: center;
    color: var(--text-color-secondary, #8c8c8c);
    font-size: 14px;
    
    i {
      font-size: 16px;
    }
  }
  
  &__prefix {
    margin-right: 8px;
  }
  
  &__suffix {
    margin-left: 8px;
  }
  
  &__control {
    flex: 1;
    position: relative;
  }
  
  &__status {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    
    i {
      font-size: 16px;
      
      &.l-icon-error {
        color: var(--error-color, #ff4d4f);
      }
      
      &.l-icon-warning {
        color: var(--warning-color, #faad14);
      }
    }
  }
  
  &__message {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.5;
    
    &--error {
      color: var(--error-color, #ff4d4f);
    }
    
    &--warning {
      color: var(--warning-color, #faad14);
    }
  }
  
  &__help {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-color-secondary, #8c8c8c);
    line-height: 1.5;
  }
  
  &__description {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-color-tertiary, #bfbfbf);
    line-height: 1.5;
  }
  
  // 状态样式
  &--required {
    .l-form-field__label-text {
      font-weight: 600;
    }
  }
  
  &--disabled {
    opacity: 0.6;
    
    .l-form-field__label-text {
      color: var(--text-color-disabled, #bfbfbf);
    }
  }
  
  &--error {
    .l-form-field__label-text {
      color: var(--error-color, #ff4d4f);
    }
  }
  
  &--warning {
    .l-form-field__label-text {
      color: var(--warning-color, #faad14);
    }
  }
  
  &--focused {
    .l-form-field__label-text {
      color: var(--primary-color, #1890ff);
    }
  }
  
  // 尺寸样式
  &--small {
    margin-bottom: 12px;
    
    .l-form-field__label-text {
      font-size: 12px;
    }
    
    .l-form-field__message,
    .l-form-field__help,
    .l-form-field__description {
      font-size: 11px;
    }
  }
  
  &--large {
    margin-bottom: 20px;
    
    .l-form-field__label-text {
      font-size: 16px;
    }
    
    .l-form-field__message,
    .l-form-field__help,
    .l-form-field__description {
      font-size: 13px;
    }
  }
  
  // 模式样式
  &--view {
    .l-form-field__control {
      background-color: transparent;
      border: none;
      padding: 0;
    }
  }
}
</style>
