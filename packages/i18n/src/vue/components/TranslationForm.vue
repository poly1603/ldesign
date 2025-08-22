<!--
  TranslationForm 组件

  智能表单翻译组件，支持：
  - 表单字段翻译
  - 验证消息翻译
  - 占位符翻译
  - 错误提示翻译
  - 动态表单生成
  - 多语言验证
-->

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from '../composables'
// import TranslationText from './TranslationText.vue' // 暂时禁用，等待修复类型问题

/**
 * 表单字段定义
 */
interface FormField {
  name: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label?: string
  placeholder?: string
  help?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  checkboxLabel?: string
  options?: Array<{ value: string, label: string }>
  validation?: (value: any) => string | null
}

/**
 * 组件属性
 */
interface Props {
  /** 表单字段配置 */
  fields: FormField[]
  /** 表单标题翻译键 */
  title?: string
  /** 表单描述翻译键 */
  description?: string
  /** 命名空间 */
  namespace?: string
  /** 初始数据 */
  initialData?: Record<string, any>
  /** 提交按钮文本 */
  submitText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 是否启用实时验证 */
  realTimeValidation?: boolean
  /** 自定义CSS类 */
  customClass?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  namespace: 'form',
  initialData: () => ({}),
  showCancel: false,
  realTimeValidation: true,
})

const emit = defineEmits<Emits>()

/**
 * 组件事件
 */
interface Emits {
  (e: 'submit', data: Record<string, any>): void
  (e: 'cancel'): void
  (e: 'change', field: string, value: any): void
  (e: 'error', error: string): void
}

// 使用 I18n
const { t } = useI18n()

// 表单状态
const formData = reactive<Record<string, any>>({ ...props.initialData })
const fieldErrors = reactive<Record<string, string>>({})
const formError = ref<string>('')
const isSubmitting = ref(false)
const touchedFields = reactive<Set<string>>(new Set())

// 计算属性
const formClasses = computed(() => {
  const classes = ['translation-form']

  if (isSubmitting.value)
    classes.push('translation-form--submitting')
  if (formError.value)
    classes.push('translation-form--error')

  if (props.customClass) {
    if (Array.isArray(props.customClass)) {
      classes.push(...props.customClass)
    }
    else {
      classes.push(props.customClass)
    }
  }

  return classes
})

const formFields = computed(() => props.fields)

const isFormValid = computed(() => {
  return Object.keys(fieldErrors).length === 0
    && formFields.value.every((field) => {
      if (field.required) {
        const value = formData[field.name]
        return value !== undefined && value !== null && value !== ''
      }
      return true
    })
})

// 方法
function getFieldClasses(field: FormField) {
  const classes = [`field-${field.type}`]

  if (field.required)
    classes.push('field--required')
  if (field.disabled)
    classes.push('field--disabled')
  if (fieldErrors[field.name])
    classes.push('field--error')
  if (touchedFields.has(field.name))
    classes.push('field--touched')

  return classes
}

function getFieldPlaceholder(field: FormField): string {
  if (!field.placeholder)
    return ''

  return t(`${props.namespace}.${field.placeholder}`, {}, {
    defaultValue: field.placeholder,
  })
}

function validateField(field: FormField, value: any): string | null {
  // 必填验证
  if (field.required && (value === undefined || value === null || value === '')) {
    return t(`${props.namespace}.validation.required`, { field: field.name }, {
      defaultValue: `${field.name} is required`,
    })
  }

  // 自定义验证
  if (field.validation) {
    return field.validation(value)
  }

  // 类型验证
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return t(`${props.namespace}.validation.email`, {}, {
        defaultValue: 'Please enter a valid email address',
      })
    }
  }

  return null
}

function handleFieldInput(fieldName: string, event: Event) {
  const target = event.target as HTMLInputElement
  let value: any

  if (target.type === 'checkbox') {
    value = target.checked
  }
  else if (target.type === 'radio') {
    value = target.value
  }
  else {
    value = target.value
  }

  formData[fieldName] = value

  // 实时验证
  if (props.realTimeValidation && touchedFields.has(fieldName)) {
    const field = formFields.value.find(f => f.name === fieldName)
    if (field) {
      const error = validateField(field, value)
      if (error) {
        fieldErrors[fieldName] = error
      }
      else {
        delete fieldErrors[fieldName]
      }
    }
  }

  emit('change', fieldName, value)
}

function handleFieldBlur(fieldName: string) {
  touchedFields.add(fieldName)

  const field = formFields.value.find(f => f.name === fieldName)
  if (field) {
    const error = validateField(field, formData[fieldName])
    if (error) {
      fieldErrors[fieldName] = error
    }
    else {
      delete fieldErrors[fieldName]
    }
  }
}

async function handleSubmit(event: Event) {
  event.preventDefault()

  if (isSubmitting.value)
    return

  // 验证所有字段
  let hasErrors = false
  for (const field of formFields.value) {
    const error = validateField(field, formData[field.name])
    if (error) {
      fieldErrors[field.name] = error
      hasErrors = true
    }
    else {
      delete fieldErrors[field.name]
    }
  }

  if (hasErrors) {
    formError.value = t(`${props.namespace}.validation.formError`, {}, {
      defaultValue: 'Please fix the errors above',
    })
    return
  }

  isSubmitting.value = true
  formError.value = ''

  try {
    emit('submit', { ...formData })
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Submission failed'
    formError.value = errorMessage
    emit('error', errorMessage)
  }
  finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  emit('cancel')
}

// 初始化表单数据
for (const field of props.fields) {
  if (!(field.name in formData)) {
    if (field.type === 'checkbox') {
      formData[field.name] = false
    }
    else {
      formData[field.name] = ''
    }
  }
}
</script>

<template>
  <form
    class="translation-form"
    :class="formClasses"
    @submit="handleSubmit"
  >
    <!-- 表单标题 -->
    <div v-if="title" class="form-header">
      <h2 class="form-title">
        {{ t(namespace ? `${namespace}.${title}` : title) }}
      </h2>
      <p v-if="description" class="form-description">
        {{ t(namespace ? `${namespace}.${description}` : description) }}
      </p>
    </div>

    <!-- 表单字段 -->
    <div class="form-fields">
      <div
        v-for="field in formFields"
        :key="field.name"
        class="form-field"
        :class="getFieldClasses(field)"
      >
        <!-- 字段标签 -->
        <label
          v-if="field.label"
          :for="field.name"
          class="field-label"
          :class="{ required: field.required }"
        >
          {{ t(namespace ? `${namespace}.${field.label}` : field.label, {}, { defaultValue: field.name }) }}
          <span v-if="field.required" class="required-indicator">*</span>
        </label>

        <!-- 字段输入 -->
        <div class="field-input">
          <!-- 文本输入 -->
          <input
            v-if="field.type === 'text' || field.type === 'email' || field.type === 'password'"
            :id="field.name"
            :name="field.name"
            :type="field.type"
            :value="formData[field.name]"
            :placeholder="getFieldPlaceholder(field)"
            :required="field.required"
            :disabled="field.disabled || isSubmitting"
            class="field-control"
            @input="handleFieldInput(field.name, $event)"
            @blur="handleFieldBlur(field.name)"
          >

          <!-- 文本域 -->
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.name"
            :name="field.name"
            :value="formData[field.name]"
            :placeholder="getFieldPlaceholder(field)"
            :required="field.required"
            :disabled="field.disabled || isSubmitting"
            :rows="field.rows || 3"
            class="field-control field-textarea"
            @input="handleFieldInput(field.name, $event)"
            @blur="handleFieldBlur(field.name)"
          />

          <!-- 选择框 -->
          <select
            v-else-if="field.type === 'select'"
            :id="field.name"
            :name="field.name"
            :value="formData[field.name]"
            :required="field.required"
            :disabled="field.disabled || isSubmitting"
            class="field-control field-select"
            @change="handleFieldInput(field.name, $event)"
            @blur="handleFieldBlur(field.name)"
          >
            <option value="" disabled>
              {{ getFieldPlaceholder(field) }}
            </option>
            <option
              v-for="option in field.options"
              :key="option.value"
              :value="option.value"
            >
              {{ t(namespace ? `${namespace}.${option.label}` : option.label, {}, { defaultValue: option.value }) }}
            </option>
          </select>

          <!-- 复选框 -->
          <label
            v-else-if="field.type === 'checkbox'"
            class="field-checkbox"
          >
            <input
              :id="field.name"
              :name="field.name"
              type="checkbox"
              :checked="formData[field.name]"
              :required="field.required"
              :disabled="field.disabled || isSubmitting"
              @change="handleFieldInput(field.name, $event)"
            >
            <span class="checkbox-label">
              {{ t(namespace ? `${namespace}.${field.checkboxLabel || field.label || field.name}` : (field.checkboxLabel || field.label || field.name), {}, { defaultValue: field.name }) }}
            </span>
          </label>

          <!-- 单选按钮组 -->
          <div
            v-else-if="field.type === 'radio'"
            class="field-radio-group"
          >
            <label
              v-for="option in field.options"
              :key="option.value"
              class="field-radio"
            >
              <input
                :name="field.name"
                type="radio"
                :value="option.value"
                :checked="formData[field.name] === option.value"
                :required="field.required"
                :disabled="field.disabled || isSubmitting"
                @change="handleFieldInput(field.name, $event)"
              >
              <span class="radio-label">
                {{ t(namespace ? `${namespace}.${option.label}` : option.label, {}, { defaultValue: option.value }) }}
              </span>
            </label>
          </div>
        </div>

        <!-- 字段帮助文本 -->
        <div v-if="field.help" class="field-help">
          {{ t(namespace ? `${namespace}.${field.help}` : field.help) }}
        </div>

        <!-- 字段错误 -->
        <div v-if="fieldErrors[field.name]" class="field-error">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ fieldErrors[field.name] }}</span>
        </div>
      </div>
    </div>

    <!-- 表单操作 -->
    <div class="form-actions">
      <button
        v-if="showCancel"
        type="button"
        class="form-button form-button--secondary"
        :disabled="isSubmitting"
        @click="handleCancel"
      >
        {{ t(cancelText || 'common.cancel', {}, { defaultValue: 'Cancel' }) }}
      </button>

      <button
        type="submit"
        class="form-button form-button--primary"
        :disabled="isSubmitting || !isFormValid"
      >
        <span v-if="isSubmitting" class="button-spinner" />
        {{ t(submitText || 'common.submit', {}, { defaultValue: 'Submit' }) }}
      </button>
    </div>

    <!-- 表单错误 -->
    <div v-if="formError" class="form-error">
      <span class="error-icon">❌</span>
      <span class="error-text">{{ formError }}</span>
    </div>
  </form>
</template>

<style scoped>
.translation-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 24px;
  text-align: center;
}

.form-title {
  margin: 0 0 8px 0;
  font-size: 1.5em;
  font-weight: 600;
  color: #333;
}

.form-description {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-indicator {
  color: #d32f2f;
}

.field-input {
  position: relative;
}

.field-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.field-control:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
}

.field-textarea {
  resize: vertical;
  min-height: 80px;
}

.field-checkbox,
.field-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.field-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-help {
  font-size: 0.9em;
  color: #666;
  line-height: 1.4;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #d32f2f;
  font-size: 0.9em;
}

.field--error .field-control {
  border-color: #d32f2f;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-button--primary {
  background: #007acc;
  color: white;
}

.form-button--primary:hover:not(:disabled) {
  background: #005a9e;
}

.form-button--secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.form-button--secondary:hover:not(:disabled) {
  background: #e9e9e9;
}

.form-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 6px;
  color: #d32f2f;
  margin-top: 16px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .translation-form {
    max-width: 100%;
    padding: 0 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
