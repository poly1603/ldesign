<script setup lang="ts">
import type { FormItemConfig } from '../types/field'
import type { FormData, FormOptions } from '../types/form'
import type { LayoutResult } from '../types/layout'
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useAdvancedLayout } from '../composables/useAdvancedLayout'
import { ConditionalRenderer } from '../core/ConditionalRenderer'
import { FormStateManager } from '../core/FormStateManager'
import { LayoutCalculator } from '../core/LayoutCalculator'
import { ValidationEngine } from '../core/ValidationEngine'
import FormCheckbox from './FormCheckbox.vue'
import FormDatePicker from './FormDatePicker.vue'
import FormInput from './FormInput.vue'
import FormRadio from './FormRadio.vue'
import FormRate from './FormRate.vue'
import FormSelect from './FormSelect.vue'
import FormSlider from './FormSlider.vue'
import FormSwitch from './FormSwitch.vue'
import FormTextarea from './FormTextarea.vue'
import FormTimePicker from './FormTimePicker.vue'

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
const containerRef = ref<HTMLElement | null>(null)
const layout = ref<LayoutResult>()

// 高级布局功能
const advancedLayout = useAdvancedLayout({
  fields: props.options.fields || [],
  config: props.options.layout,
  containerRef,
  formData: props.modelValue,
  watchResize: true,
})

// 计算属性
const formData = computed({
  get: () => props.modelValue,
  set: (value: FormData) => emit('update:modelValue', value),
})

const formClasses = computed(() => {
  const labelPosition = props.options.layout?.label?.position || 'top'
  const theme = props.options.layout?.theme || 'default'

  return [
    'dynamic-form',
    `dynamic-form--${props.options.type || 'edit'}`,
    `dynamic-form--label-${labelPosition}`,
    `dynamic-form--theme-${theme}`,
    {
      'dynamic-form--disabled': props.options.disabled,
      'dynamic-form--readonly': props.options.readonly,
    },
    props.options.layout?.className,
  ]
})

const formStyles = computed(() => {
  return {}
})

// 可见字段计算
const visibleFields = computed(() => {
  // 使用 advancedLayout 的计算逻辑
  const allVisibleFields = advancedLayout.calculateVisibleFields(formData.value)

  // 如果设置了默认行数且未展开，只显示前N行的字段
  const defaultRows = props.options.layout?.defaultRows || 0
  if (defaultRows > 0 && !advancedLayout.isExpanded.value) {
    const columns = advancedLayout.calculatedColumns.value
    const maxFields = defaultRows * columns
    return allVisibleFields.slice(0, maxFields)
  }

  return allVisibleFields
})

// 字段样式计算
const fieldsStyle = computed(() => {
  const columns = advancedLayout.calculatedColumns.value
  const { horizontalGap = 16, verticalGap = 16 } = props.options.layout || {}

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${verticalGap}px ${horizontalGap}px`,
  }
})

// 标签相关计算属性
const labelPosition = computed(
  () => props.options.layout?.label?.position || 'top',
)
const labelAlign = computed(() => props.options.layout?.label?.align || 'left')
const labelGap = computed(() => props.options.layout?.label?.gap || 8)
const showLabelColon = computed(
  () => props.options.layout?.label?.showColon || false,
)

// 按钮相关计算属性
const hasDefaultRows = computed(() => {
  return (
    props.options.layout?.defaultRows && props.options.layout.defaultRows > 0
  )
})

const hasHiddenFields = computed(() => {
  return advancedLayout.hasHiddenFields.value
})

const needsExpandButton = computed(() => {
  return advancedLayout.needsExpandButton.value
})

const shouldShowActionsInLastRow = computed(() => {
  return (
    hasDefaultRows.value
    && hasHiddenFields.value
    && props.options.layout?.button?.position === 'follow-last-row'
  )
})

const shouldShowActionsSeparately = computed(() => {
  return (
    hasDefaultRows.value
    && hasHiddenFields.value
    && props.options.layout?.button?.position === 'separate-row'
  )
})

const showTraditionalButtons = computed(() => {
  return props.showButtons && (!hasDefaultRows.value || !hasHiddenFields.value)
})

const showQueryButton = computed(() => true)
const showResetButton = computed(() => true)

const expandText = computed(() => {
  return props.options.layout?.button?.expand?.expandText || '展开'
})

const collapseText = computed(() => {
  return props.options.layout?.button?.expand?.collapseText || '收起'
})

const buttonClasses = computed(() => [
  'dynamic-form__buttons',
  `dynamic-form__buttons--${props.options.layout?.button?.align || 'left'}`,
])

// 方法
function getFieldComponent(field: FormItemConfig) {
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

function getFieldProps(field: FormItemConfig) {
  return {
    ...field.props,
    name: field.name,
    id: field.name,
  }
}

function getFieldClasses(field: FormItemConfig) {
  return [
    'dynamic-form__field',
    `dynamic-form__field--${field.name}`,
    field.className,
  ]
}

function getFieldStyle(field: FormItemConfig, index: number) {
  const styles: Record<string, any> = {}

  if (field.span) {
    if (field.span === 'full') {
      styles.gridColumn = '1 / -1'
    }
    else if (typeof field.span === 'number') {
      styles.gridColumn = `span ${field.span}`
    }
  }

  if (field.style) {
    Object.assign(styles, field.style)
  }

  return styles
}

function getExpandButtonStyle() {
  if (!layout.value)
    return {}

  const buttonSpan = props.options.layout?.button?.span || 1
  return {
    gridColumn: `span ${Math.min(buttonSpan, layout.value.columns)}`,
  }
}

function getFieldError(fieldName: string): string {
  const errors = formStateManager.getFieldErrors(fieldName)
  return errors.length > 0 ? errors[0] : ''
}

// 获取标签宽度
function getLabelWidth(field: FormItemConfig, index: number) {
  return advancedLayout.getLabelWidth(field, index)
}

// 获取按钮组字段的样式
function getActionsFieldStyle() {
  const columns = props.options.layout?.columns || 2
  const visibleFieldsCount = visibleFields.value.length
  const lastRowFieldsCount = visibleFieldsCount % columns

  // 如果最后一行没有填满，按钮组占据剩余的列
  if (lastRowFieldsCount > 0) {
    const remainingColumns = columns - lastRowFieldsCount
    return {
      gridColumn: `span ${remainingColumns}`,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    }
  }
  else {
    // 如果最后一行已满，按钮组占据新的一行
    return {
      gridColumn: '1 / -1',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    }
  }
}

function handleFieldChange(fieldName: string, value: any) {
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

function handleFieldFocus(fieldName: string, event: FocusEvent) {
  formStateManager.touchField(fieldName)
  emit('fieldFocus', fieldName, event)
}

function handleFieldBlur(fieldName: string, event: FocusEvent) {
  emit('fieldBlur', fieldName, event)

  // 触发验证
  if (validationEngine.shouldValidateOnTrigger('blur')) {
    validateField(fieldName)
  }
}

async function handleSubmit() {
  const isValid = await handleValidate()
  if (isValid) {
    const data = formStateManager.getFormData()
    emit('submit', data)
  }
}

function handleReset() {
  formStateManager.reset()
  const data = formStateManager.getFormData()
  emit('update:modelValue', data)
  emit('reset', data)
}

async function handleQuery() {
  // 查询功能同时具有提交表单的作用
  const isValid = await handleValidate()
  if (isValid) {
    const data = formStateManager.getFormData()
    emit('submit', data)
  }
}

async function handleValidate(): Promise<boolean> {
  const data = formStateManager.getFormData()
  const results = await validationEngine.validateForm(data)

  // 更新字段错误
  Object.entries(results).forEach(([fieldName, result]) => {
    formStateManager.setFieldErrors(fieldName, result.errors)
  })

  const isValid = Object.values(results).every(result => result.valid)
  const errors = Object.fromEntries(
    Object.entries(results).map(([name, result]) => [name, result.errors]),
  )

  emit('validate', isValid, errors)
  return isValid
}

function handleToggleExpand() {
  advancedLayout.toggleExpand()
}

async function validateField(fieldName: string) {
  const value = formStateManager.getFieldValue(fieldName)
  const data = formStateManager.getFormData()
  const field = props.options.fields.find(f => f.name === fieldName)

  if (field?.rules) {
    const result = await validationEngine.validateField(
      value,
      field.rules,
      data,
      fieldName,
    )
    formStateManager.setFieldErrors(fieldName, result.errors)
  }
}

function calculateLayout() {
  if (containerRef.value) {
    const containerWidth = containerRef.value.offsetWidth
    layout.value = layoutCalculator.calculateLayout(
      props.options.fields,
      containerWidth,
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
  (newValue) => {
    formStateManager.setFormData(newValue)
  },
  { deep: true },
)

watch(
  () => props.options,
  (newOptions) => {
    validationEngine.setRulesFromFields(newOptions.fields)
    calculateLayout()
  },
  { deep: true },
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

<template>
  <div class="dynamic-form" :class="formClasses" :style="formStyles">
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
            :label-position="labelPosition"
            :label-width="getLabelWidth(field, index)"
            :label-align="labelAlign"
            :label-gap="labelGap"
            :show-label-colon="showLabelColon"
            @change="handleFieldChange(field.name, $event)"
            @focus="handleFieldFocus(field.name, $event)"
            @blur="handleFieldBlur(field.name, $event)"
          />
        </div>

        <!-- 按钮组跟随最后一行时显示 -->
        <div
          v-if="shouldShowActionsInLastRow"
          class="dynamic-form__field dynamic-form__actions-field"
          :style="getActionsFieldStyle()"
        >
          <div class="dynamic-form__actions">
            <button
              v-if="showQueryButton"
              type="button"
              class="dynamic-form__button dynamic-form__button--primary"
              @click="handleQuery"
            >
              查询
            </button>
            <button
              v-if="showResetButton"
              type="button"
              class="dynamic-form__button"
              @click="handleReset"
            >
              重置
            </button>
            <button
              v-if="needsExpandButton"
              type="button"
              class="dynamic-form__button dynamic-form__button--expand"
              @click="handleToggleExpand"
            >
              {{ advancedLayout.isExpanded.value ? collapseText : expandText }}
            </button>
          </div>
        </div>
      </div>

      <!-- 按钮组单独占一行时显示 -->
      <div v-if="shouldShowActionsSeparately" class="dynamic-form__actions-row">
        <div class="dynamic-form__actions">
          <button
            v-if="showQueryButton"
            type="button"
            class="dynamic-form__button dynamic-form__button--primary"
            @click="handleQuery"
          >
            查询
          </button>
          <button
            v-if="showResetButton"
            type="button"
            class="dynamic-form__button"
            @click="handleReset"
          >
            重置
          </button>
          <button
            v-if="needsExpandButton"
            type="button"
            class="dynamic-form__button dynamic-form__button--expand"
            @click="handleToggleExpand"
          >
            {{ advancedLayout.isExpanded.value ? collapseText : expandText }}
          </button>
        </div>
      </div>

      <!-- 传统提交按钮（当没有设置默认行数时显示） -->
      <div
        v-if="showTraditionalButtons"
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

/* 主题样式 */
.dynamic-form--theme-bordered {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  padding: 0;
  overflow: hidden;
}

.dynamic-form--theme-bordered .dynamic-form__fields {
  display: grid;
  gap: 0;
}

.dynamic-form--theme-bordered .dynamic-form__field {
  background: white;
  border: none;
  border-bottom: 1px solid #e5e5e5;
  border-radius: 0;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: stretch;
  min-height: 48px;
}

.dynamic-form--theme-bordered .dynamic-form__field:last-child {
  border-bottom: none;
}

/* 按钮组样式 */
.dynamic-form__actions-field {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.dynamic-form__actions-row {
  margin-top: 16px;
  padding: 16px 0;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.dynamic-form__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dynamic-form__button {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: white;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.dynamic-form__button:hover {
  border-color: #667eea;
  color: #667eea;
}

.dynamic-form__button--primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.dynamic-form__button--primary:hover {
  background: #5a6fd8;
  border-color: #5a6fd8;
  color: white;
}

.dynamic-form__button--expand {
  color: #1890ff;
  border-color: #1890ff;
}

.dynamic-form__button--expand:hover {
  background: #1890ff;
  color: white;
}

/* 字段跨列样式 */
.dynamic-form__field[style*='span'] {
  grid-column: var(--field-span);
}

/* 响应式样式 */
@media (max-width: 768px) {
  .dynamic-form__actions {
    width: 100%;
    justify-content: center;
  }

  .dynamic-form__button {
    flex: 1;
    min-width: 60px;
  }
}
</style>
