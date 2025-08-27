<template>
  <div
    ref="formContainerRef"
    :class="[
      'l-dynamic-form',
      `l-dynamic-form--${formState.mode}`,
      `l-dynamic-form--${formState.theme}`,
      `l-dynamic-form--${formState.size}`,
      {
        'l-dynamic-form--loading': formState.isLoading,
        'l-dynamic-form--submitting': formState.isSubmitting,
        'l-dynamic-form--disabled': disabled,
        'l-dynamic-form--readonly': readonly,
        'l-dynamic-form--has-errors': formState.hasErrors,
        'l-dynamic-form--collapsed': formState.collapsed,
        'l-dynamic-form--expanded': formState.expanded
      }
    ]"
    :style="containerStyles"
  >
    <!-- 表单标题 -->
    <div v-if="config.title" class="l-dynamic-form__header">
      <h3 class="l-dynamic-form__title">{{ config.title }}</h3>
      <p v-if="config.description" class="l-dynamic-form__description">
        {{ config.description }}
      </p>
    </div>

    <!-- 表单内容 -->
    <div class="l-dynamic-form__content" :style="contentStyles">
      <!-- 默认显示区域 -->
      <div class="l-dynamic-form__section l-dynamic-form__section--default">
        <FormField
          v-for="field in defaultSectionFields"
          :key="field.name || field.id"
          :config="field"
          :value="getFieldValue(field.name)"
          :form-data="formData"
          :disabled="disabled || readonly"
          :size="size"
          :mode="mode"
          @change="handleFieldChange"
          @focus="handleFieldFocus"
          @blur="handleFieldBlur"
        />
      </div>

      <!-- 展开区域 -->
      <Transition
        name="l-form-expand"
        @enter="handleExpandEnter"
        @leave="handleExpandLeave"
      >
        <div
          v-if="showExpandedSection"
          class="l-dynamic-form__section l-dynamic-form__section--expanded"
        >
          <FormField
            v-for="field in expandedSectionFields"
            :key="field.name || field.id"
            :config="field"
            :value="getFieldValue(field.name)"
            :form-data="formData"
            :disabled="disabled || readonly"
            :size="size"
            :mode="mode"
            @change="handleFieldChange"
            @focus="handleFieldFocus"
            @blur="handleFieldBlur"
          />
        </div>
      </Transition>

      <!-- 按钮组 -->
      <FormActions
        v-if="hasActions"
        :config="actionsConfig"
        :form-data="formData"
        :form-state="formState"
        :disabled="disabled"
        :loading="formState.isSubmitting"
        @submit="handleSubmit"
        @reset="handleReset"
        @expand="handleToggleExpand"
        @custom="handleCustomAction"
      />
    </div>

    <!-- 加载遮罩 -->
    <div v-if="formState.isLoading" class="l-dynamic-form__loading">
      <div class="l-dynamic-form__loading-spinner"></div>
      <span class="l-dynamic-form__loading-text">加载中...</span>
    </div>

    <!-- 调试信息 -->
    <FormDebugPanel
      v-if="showDebugPanel"
      :form-instance="formInstance"
      :form-data="formData"
      :form-state="formState"
    />
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  watch, 
  onMounted, 
  onUnmounted, 
  provide,
  nextTick,
  type CSSProperties
} from 'vue'
import type {
  FormConfig,
  FormComponentProps,
  FormComponentEmits,
  FormFieldItem,
  FormFieldConfig,
  FormActionConfig,
  AnyObject,
  ModeType,
  SizeType
} from '../../types'
import { FormEngine } from '../../core'
import FormField from './FormField.vue'
import FormActions from './FormActions.vue'
import FormDebugPanel from './FormDebugPanel.vue'

// 组件属性
interface Props extends FormComponentProps {
  modelValue?: AnyObject
  config: FormConfig
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  size?: SizeType
  mode?: ModeType
  showDebugPanel?: boolean
}

// 组件事件
interface Emits extends FormComponentEmits {}

// 定义属性和事件
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  disabled: false,
  readonly: false,
  loading: false,
  size: 'medium',
  mode: 'edit',
  showDebugPanel: false
})

const emit = defineEmits<Emits>()

// 响应式引用
const formContainerRef = ref<HTMLElement>()
const formInstance = ref<any>(null)
const formData = ref<AnyObject>({ ...props.modelValue })
const formState = ref({
  isDirty: false,
  isValid: true,
  isSubmitting: false,
  isLoading: props.loading,
  mode: props.mode,
  size: props.size,
  theme: 'light',
  collapsed: false,
  expanded: false,
  hasErrors: false,
  errorCount: 0
})

// 计算属性
const containerStyles = computed((): CSSProperties => {
  const styles: CSSProperties = {}
  
  if (formInstance.value?.layoutEngine) {
    const layoutResult = formInstance.value.layoutEngine.getLastResult()
    if (layoutResult?.styles) {
      Object.assign(styles, layoutResult.styles)
    }
    if (layoutResult?.variables) {
      Object.assign(styles, layoutResult.variables)
    }
  }
  
  return styles
})

const contentStyles = computed((): CSSProperties => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${layoutColumns.value}, 1fr)`,
    gap: `${layoutGap.value}px`
  }
})

const layoutColumns = computed(() => {
  return formInstance.value?.layoutEngine?.getLastResult()?.columns || 3
})

const layoutGap = computed(() => {
  return formInstance.value?.layoutEngine?.getLastResult()?.gap?.horizontal || 16
})

const defaultSectionFields = computed((): FormFieldItem[] => {
  if (!formInstance.value) return []
  
  const sectionResult = formInstance.value.layoutEngine?.getLastSectionResult()
  return sectionResult?.defaultSection || []
})

const expandedSectionFields = computed((): FormFieldItem[] => {
  if (!formInstance.value) return []
  
  const sectionResult = formInstance.value.layoutEngine?.getLastSectionResult()
  return sectionResult?.expandedSection || []
})

const showExpandedSection = computed(() => {
  return formState.value.expanded && expandedSectionFields.value.length > 0
})

const hasActions = computed(() => {
  return actionsConfig.value !== null
})

const actionsConfig = computed((): FormActionConfig | null => {
  const actions = props.config.fields.find(field => field.type === 'actions')
  return actions as FormActionConfig || null
})

// 方法
const initializeForm = async () => {
  try {
    formState.value.isLoading = true
    
    // 创建表单引擎实例
    formInstance.value = new FormEngine(props.config)
    
    // 设置初始数据
    if (props.modelValue && Object.keys(props.modelValue).length > 0) {
      formInstance.value.stateManager.setFormData(props.modelValue)
    }
    
    // 监听表单状态变化
    formInstance.value.eventBus.on('form:updated', (event: any) => {
      formState.value = { ...formState.value, ...event.newState }
    })
    
    // 监听字段变化
    formInstance.value.eventBus.on('field:change', (event: any) => {
      formData.value = formInstance.value.stateManager.getFormData()
      emit('update:modelValue', formData.value)
      emit('change', formData.value, event.field?.name, event.value)
    })
    
    // 监听验证结果
    formInstance.value.eventBus.on('validation:complete', (event: any) => {
      const result = event.validationResult
      emit('validate', result.valid, result.fields)
    })
    
    // 挂载表单
    formInstance.value.mount()
    
    // 设置布局容器
    if (formContainerRef.value) {
      formInstance.value.layoutEngine.setContainer(formContainerRef.value)
    }
    
    // 触发ready事件
    emit('ready', formInstance.value)
    
  } catch (error) {
    console.error('表单初始化失败:', error)
    emit('error', error as Error)
  } finally {
    formState.value.isLoading = false
  }
}

const getFieldValue = (fieldName: string) => {
  if (!fieldName || !formInstance.value) return undefined
  return formInstance.value.stateManager.getValue(fieldName)
}

const handleFieldChange = (fieldName: string, value: any, oldValue: any) => {
  if (!formInstance.value) return
  
  formInstance.value.stateManager.setValue(fieldName, value)
}

const handleFieldFocus = (fieldName: string, event: Event) => {
  if (!formInstance.value) return
  
  formInstance.value.stateManager.setFieldState(fieldName, { isFocused: true })
  
  // 触发字段焦点事件
  formInstance.value.eventBus.emit('field:focus', {
    type: 'field:focus',
    timestamp: Date.now(),
    id: `focus_${Date.now()}`,
    field: formInstance.value.stateManager.fieldConfigs.get(fieldName),
    nativeEvent: event
  })
}

const handleFieldBlur = (fieldName: string, event: Event) => {
  if (!formInstance.value) return
  
  formInstance.value.stateManager.setFieldState(fieldName, { 
    isFocused: false,
    isTouched: true
  })
  
  // 触发字段失焦事件
  formInstance.value.eventBus.emit('field:blur', {
    type: 'field:blur',
    timestamp: Date.now(),
    id: `blur_${Date.now()}`,
    field: formInstance.value.stateManager.fieldConfigs.get(fieldName),
    nativeEvent: event
  })
  
  // 触发字段验证
  const fieldConfig = formInstance.value.stateManager.fieldConfigs.get(fieldName)
  if (fieldConfig?.rules) {
    formInstance.value.validationEngine.validateField(
      fieldName,
      getFieldValue(fieldName),
      fieldConfig.rules,
      formData.value
    )
  }
}

const handleSubmit = async () => {
  if (!formInstance.value) return
  
  try {
    formState.value.isSubmitting = true
    
    // 验证表单
    const validationResult = await formInstance.value.validationEngine.validateForm(
      formData.value,
      getFieldRules()
    )
    
    if (validationResult.valid) {
      emit('submit', formData.value, true)
    } else {
      emit('submit', formData.value, false)
    }
    
  } catch (error) {
    console.error('表单提交失败:', error)
    emit('error', error as Error)
  } finally {
    formState.value.isSubmitting = false
  }
}

const handleReset = () => {
  if (!formInstance.value) return
  
  formInstance.value.reset()
  formData.value = formInstance.value.stateManager.getFormData()
  emit('update:modelValue', formData.value)
  emit('reset', formData.value)
}

const handleToggleExpand = () => {
  formState.value.expanded = !formState.value.expanded
}

const handleCustomAction = (action: string, data: any) => {
  // 处理自定义按钮动作
  console.log('自定义动作:', action, data)
}

const handleExpandEnter = (el: Element) => {
  // 展开动画进入
  nextTick(() => {
    formInstance.value?.layoutEngine?.recalculateLayout()
  })
}

const handleExpandLeave = (el: Element) => {
  // 展开动画离开
  nextTick(() => {
    formInstance.value?.layoutEngine?.recalculateLayout()
  })
}

const getFieldRules = () => {
  const rules: Record<string, any[]> = {}
  
  if (!formInstance.value) return rules
  
  for (const [fieldPath, fieldConfig] of formInstance.value.stateManager.fieldConfigs) {
    if (fieldConfig.rules) {
      rules[fieldPath] = fieldConfig.rules
    }
  }
  
  return rules
}

// 监听属性变化
watch(() => props.modelValue, (newValue) => {
  if (formInstance.value && newValue) {
    formInstance.value.stateManager.setFormData(newValue)
    formData.value = { ...newValue }
  }
}, { deep: true })

watch(() => props.disabled, (newValue) => {
  if (formInstance.value) {
    formInstance.value.setMode(newValue ? 'disabled' : 'edit')
  }
})

watch(() => props.readonly, (newValue) => {
  if (formInstance.value) {
    formInstance.value.setMode(newValue ? 'view' : 'edit')
  }
})

watch(() => props.mode, (newValue) => {
  if (formInstance.value && newValue) {
    formInstance.value.setMode(newValue)
  }
})

watch(() => props.size, (newValue) => {
  if (formInstance.value && newValue) {
    formInstance.value.setSize(newValue)
  }
})

// 提供表单实例给子组件
provide('formInstance', formInstance)
provide('formData', formData)
provide('formState', formState)

// 生命周期
onMounted(() => {
  initializeForm()
})

onUnmounted(() => {
  if (formInstance.value) {
    formInstance.value.destroy()
  }
})

// 暴露方法给父组件
defineExpose({
  formInstance,
  validate: () => formInstance.value?.validationEngine.validateForm(formData.value, getFieldRules()),
  reset: handleReset,
  submit: handleSubmit,
  getFormData: () => formData.value,
  setFormData: (data: AnyObject) => {
    if (formInstance.value) {
      formInstance.value.stateManager.setFormData(data)
    }
  }
})
</script>

<style lang="less">
.l-dynamic-form {
  position: relative;
  width: 100%;
  
  &__header {
    margin-bottom: 24px;
  }
  
  &__title {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color-primary, #262626);
  }
  
  &__description {
    margin: 0;
    color: var(--text-color-secondary, #8c8c8c);
    font-size: 14px;
    line-height: 1.5;
  }
  
  &__content {
    position: relative;
  }
  
  &__section {
    &--expanded {
      margin-top: 16px;
    }
  }
  
  &__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  &__loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--primary-color, #1890ff);
    border-radius: 50%;
    animation: l-form-spin 1s linear infinite;
  }
  
  &__loading-text {
    margin-top: 12px;
    color: var(--text-color-secondary, #8c8c8c);
    font-size: 14px;
  }
  
  // 模式样式
  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }
  
  &--readonly {
    .l-form-field__input {
      background-color: var(--background-color-light, #fafafa);
      border-color: var(--border-color-light, #f0f0f0);
    }
  }
  
  // 主题样式
  &--dark {
    background-color: var(--background-color-dark, #141414);
    color: var(--text-color-dark, #ffffff);
  }
  
  // 尺寸样式
  &--small {
    font-size: 12px;
    
    .l-form-field {
      margin-bottom: 12px;
    }
  }
  
  &--large {
    font-size: 16px;
    
    .l-form-field {
      margin-bottom: 20px;
    }
  }
}

// 展开动画
.l-form-expand-enter-active,
.l-form-expand-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.l-form-expand-enter-from,
.l-form-expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.l-form-expand-enter-to,
.l-form-expand-leave-from {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

// 旋转动画
@keyframes l-form-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
