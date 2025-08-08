<template>
  <div class="dynamic-form" :class="formClasses">
    <form @submit.prevent="handleSubmit">
      <!-- 表单标题 -->
      <div v-if="options.title" class="dynamic-form__title">
        {{ options.title }}
      </div>

      <!-- 表单描述 -->
      <div v-if="options.description" class="dynamic-form__description">
        {{ options.description }}
      </div>

      <!-- 表单字段 -->
      <div class="dynamic-form__fields" :style="fieldsStyle">
        <div
          v-for="(field, index) in visibleFields"
          :key="field.name"
          class="dynamic-form__field"
          :class="getFieldClasses(field)"
          :style="getFieldStyle(field, index)"
        >
          <component
            :is="getFieldComponent(field)"
            v-model="formData[field.name]"
            v-bind="getFieldProps(field)"
            :label="field.title"
            :required="field.required"
            :disabled="field.disabled || options.disabled"
            :readonly="field.readonly || options.readonly"
            :placeholder="field.placeholder"
            :error-message="getFieldError(field.name)"
            :show-error="!!getFieldError(field.name)"
            @change="handleFieldChange(field.name, $event)"
            @focus="handleFieldFocus(field.name, $event)"
            @blur="handleFieldBlur(field.name, $event)"
          />
        </div>

        <!-- 展开按钮 -->
        <div
          v-if="needsExpandButton"
          class="dynamic-form__expand"
          :style="getExpandButtonStyle()"
        >
          <button
            type="button"
            class="dynamic-form__expand-button"
            @click="handleToggleExpand"
          >
            {{ expanded ? collapseText : expandText }}
          </button>
        </div>
      </div>

      <!-- 表单按钮 -->
      <div
        v-if="showButtons"
        class="dynamic-form__buttons"
        :class="buttonClasses"
      >
        <slot
          name="buttons"
          :submit="handleSubmit"
          :reset="handleReset"
          :validate="handleValidate"
        >
          <button
            type="submit"
            class="dynamic-form__button dynamic-form__button--primary"
          >
            提交
          </button>
          <button
            type="button"
            class="dynamic-form__button"
            @click="handleReset"
          >
            重置
          </button>
        </slot>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, provide } from 'vue'
import type { FormOptions, FormData } from '../types/form'
import type { FormItemConfig } from '../types/field'
import type { LayoutResult } from '../types/layout'
import { FormStateManager } from '../core/FormStateManager'
import { ValidationEngine } from '../core/ValidationEngine'
import { LayoutCalculator } from '../core/LayoutCalculator'
import { ConditionalRenderer } from '../core/ConditionalRenderer'
import FormInput from './FormInput.vue'
import FormTextarea from './FormTextarea.vue'
import FormSelect from './FormSelect.vue'
import FormRadio from './FormRadio.vue'
import FormCheckbox from './FormCheckbox.vue'
import FormDatePicker from './FormDatePicker.vue'
import FormTimePicker from './FormTimePicker.vue'
import FormSwitch from './FormSwitch.vue'
import FormSlider from './FormSlider.vue'
import FormRate from './FormRate.vue'

interface Props {
  modelValue?: FormData
  options: FormOptions
  showButtons?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: FormData): void
  (e: 'submit', data: FormData): void
  (e: 'reset', data: FormData): void
  (e: 'change', data: FormData, field?: string): void
  (e: 'fieldChange', name: string, value: any): void
  (e: 'fieldFocus', name: string, event: FocusEvent): void
  (e: 'fieldBlur', name: string, event: FocusEvent): void
  (e: 'validate', valid: boolean, errors: Record<string, string[]>): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  showButtons: true,
})

const emit = defineEmits<Emits>()

// 状态管理
const formStateManager = new FormStateManager(props.options, props.modelValue)
const validationEngine = new ValidationEngine(props.options.validation)
const layoutCalculator = new LayoutCalculator(props.options.layout)
const conditionalRenderer = new ConditionalRenderer()

// 响应式数据
const expanded = ref(false)
const containerRef = ref<HTMLElement>()
const layout = ref<LayoutResult>()

// 计算属性
const formData = computed({
  get: () => props.modelValue,
  set: (value: FormData) => emit('update:modelValue', value),
})

const formClasses = computed(() => {
  const labelPosition = props.options.layout?.label?.position || 'top'

  return [
    'dynamic-form',
    `dynamic-form--${props.options.type || 'edit'}`,
    `dynamic-form--label-${labelPosition}`,
    {
      'dynamic-form--disabled': props.options.disabled,
      'dynamic-form--readonly': props.options.readonly,
    },
  ]
})

const visibleFields = computed(() => {
  if (!layout.value) return props.options.fields

  return layout.value.fields
    .filter(fieldLayout => expanded.value || fieldLayout.visible)
    .map(
      fieldLayout =>
        props.options.fields.find(f => f.name === fieldLayout.name)!
    )
    .filter(Boolean)
})

const needsExpandButton = computed(() => {
  return layout.value?.needsExpand && layout.value.hiddenFieldCount > 0
})

const expandText = computed(() => {
  return props.options.layout?.button?.expand?.expandText || '展开'
})

const collapseText = computed(() => {
  return props.options.layout?.button?.expand?.collapseText || '收起'
})

const fieldsStyle = computed(() => {
  if (!layout.value) return {}

  const { horizontalGap = 16, verticalGap = 16 } = props.options.layout || {}

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${layout.value.columns}, 1fr)`,
    gap: `${verticalGap}px ${horizontalGap}px`,
  }
})

const buttonClasses = computed(() => [
  'dynamic-form__buttons',
  `dynamic-form__buttons--${props.options.layout?.button?.align || 'left'}`,
])

// 方法
const getFieldComponent = (field: FormItemConfig) => {
  const componentMap: Record<string, any> = {
    FormInput,
    FormTextarea,
    FormSelect,
    FormRadio,
    FormCheckbox,
    FormDatePicker,
    FormTimePicker,
    FormSwitch,
    FormSlider,
    FormRate,
  }

  if (typeof field.component === 'string') {
    return componentMap[field.component] || FormInput
  }

  return field.component || FormInput
}

const getFieldProps = (field: FormItemConfig) => {
  return {
    ...field.props,
    name: field.name,
    id: field.name,
  }
}

const getFieldClasses = (field: FormItemConfig) => [
  'dynamic-form__field',
  `dynamic-form__field--${field.name}`,
  field.className,
]

const getFieldStyle = (field: FormItemConfig, index: number) => {
  if (!layout.value) return {}

  const fieldLayout = layout.value.fields[index]
  if (!fieldLayout) return {}

  return {
    gridColumn: `span ${fieldLayout.span}`,
  }
}

const getExpandButtonStyle = () => {
  if (!layout.value) return {}

  const buttonSpan = props.options.layout?.button?.span || 1
  return {
    gridColumn: `span ${Math.min(buttonSpan, layout.value.columns)}`,
  }
}

const getFieldError = (fieldName: string): string => {
  const errors = formStateManager.getFieldErrors(fieldName)
  return errors.length > 0 ? errors[0] : ''
}

const handleFieldChange = (fieldName: string, value: any) => {
  formStateManager.setFieldValue(fieldName, value)
  const newData = formStateManager.getFormData()
  emit('update:modelValue', newData)
  emit('change', newData, fieldName)
  emit('fieldChange', fieldName, value)

  // 触发验证
  if (validationEngine.shouldValidateOnTrigger('change')) {
    validateField(fieldName)
  }
}

const handleFieldFocus = (fieldName: string, event: FocusEvent) => {
  formStateManager.touchField(fieldName)
  emit('fieldFocus', fieldName, event)
}

const handleFieldBlur = (fieldName: string, event: FocusEvent) => {
  emit('fieldBlur', fieldName, event)

  // 触发验证
  if (validationEngine.shouldValidateOnTrigger('blur')) {
    validateField(fieldName)
  }
}

const handleSubmit = async () => {
  const isValid = await handleValidate()
  if (isValid) {
    const data = formStateManager.getFormData()
    emit('submit', data)
  }
}

const handleReset = () => {
  formStateManager.reset()
  const data = formStateManager.getFormData()
  emit('update:modelValue', data)
  emit('reset', data)
}

const handleValidate = async (): Promise<boolean> => {
  const data = formStateManager.getFormData()
  const results = await validationEngine.validateForm(data)

  // 更新字段错误
  Object.entries(results).forEach(([fieldName, result]) => {
    formStateManager.setFieldErrors(fieldName, result.errors)
  })

  const isValid = Object.values(results).every(result => result.valid)
  const errors = Object.fromEntries(
    Object.entries(results).map(([name, result]) => [name, result.errors])
  )

  emit('validate', isValid, errors)
  return isValid
}

const handleToggleExpand = () => {
  expanded.value = !expanded.value
}

const validateField = async (fieldName: string) => {
  const value = formStateManager.getFieldValue(fieldName)
  const data = formStateManager.getFormData()
  const field = props.options.fields.find(f => f.name === fieldName)

  if (field?.rules) {
    const result = await validationEngine.validateField(
      value,
      field.rules,
      data,
      fieldName
    )
    formStateManager.setFieldErrors(fieldName, result.errors)
  }
}

const calculateLayout = () => {
  if (containerRef.value) {
    const containerWidth = containerRef.value.offsetWidth
    layout.value = layoutCalculator.calculateLayout(
      props.options.fields,
      containerWidth
    )
  }
}

// 生命周期
onMounted(() => {
  // 设置验证规则
  validationEngine.setRulesFromFields(props.options.fields)

  // 计算布局
  calculateLayout()

  // 监听窗口大小变化
  window.addEventListener('resize', calculateLayout)
})

// 监听器
watch(
  () => props.modelValue,
  newValue => {
    formStateManager.setFormData(newValue)
  },
  { deep: true }
)

watch(
  () => props.options,
  newOptions => {
    validationEngine.setRulesFromFields(newOptions.fields)
    calculateLayout()
  },
  { deep: true }
)

// 提供给子组件的上下文
provide('formStateManager', formStateManager)
provide('validationEngine', validationEngine)

// 暴露方法
defineExpose({
  validate: handleValidate,
  reset: handleReset,
  getFormData: () => formStateManager.getFormData(),
  setFormData: (data: FormData) => formStateManager.setFormData(data),
  getFieldValue: (name: string) => formStateManager.getFieldValue(name),
  setFieldValue: (name: string, value: any) =>
    formStateManager.setFieldValue(name, value),
})
</script>

<style scoped>
.dynamic-form {
  width: 100%;
}

.dynamic-form__title {
  font-size: var(--form-font-size-xl, 20px);
  font-weight: var(--form-font-weight-bold, 600);
  color: var(--form-text-primary, #262626);
  margin-bottom: var(--form-spacing-base, 16px);
}

.dynamic-form__description {
  font-size: var(--form-font-size-sm, 14px);
  color: var(--form-text-secondary, #595959);
  margin-bottom: var(--form-spacing-lg, 24px);
}

.dynamic-form__fields {
  margin-bottom: var(--form-spacing-lg, 24px);
}

.dynamic-form__field {
  display: flex;
  flex-direction: column;
}

.dynamic-form__expand {
  display: flex;
  align-items: center;
}

.dynamic-form__expand-button {
  background: none;
  border: 1px solid var(--form-border-default, #d9d9d9);
  border-radius: var(--form-border-radius-base, 4px);
  padding: var(--form-spacing-sm, 8px) var(--form-spacing-base, 16px);
  color: var(--form-color-primary, #1890ff);
  cursor: pointer;
  transition: all var(--form-animation-duration-normal, 300ms);
}

.dynamic-form__expand-button:hover {
  border-color: var(--form-color-primary, #1890ff);
  background: var(--form-bg-active, #e6f7ff);
}

.dynamic-form__buttons {
  display: flex;
  gap: var(--form-spacing-base, 16px);
}

.dynamic-form__buttons--center {
  justify-content: center;
}

.dynamic-form__buttons--right {
  justify-content: flex-end;
}

.dynamic-form__button {
  padding: var(--form-spacing-sm, 8px) var(--form-spacing-lg, 24px);
  border: 1px solid var(--form-border-default, #d9d9d9);
  border-radius: var(--form-border-radius-base, 4px);
  background: var(--form-bg-primary, #ffffff);
  color: var(--form-text-primary, #262626);
  cursor: pointer;
  transition: all var(--form-animation-duration-normal, 300ms);
}

.dynamic-form__button:hover {
  border-color: var(--form-color-primary, #1890ff);
  color: var(--form-color-primary, #1890ff);
}

.dynamic-form__button--primary {
  background: var(--form-color-primary, #1890ff);
  border-color: var(--form-color-primary, #1890ff);
  color: white;
}

.dynamic-form__button--primary:hover {
  background: var(--form-color-primary, #40a9ff);
  border-color: var(--form-color-primary, #40a9ff);
}

.dynamic-form--disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>
