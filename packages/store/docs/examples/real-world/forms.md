# 大型表单状态管理

本示例展示了如何使用 @ldesign/store 构建复杂的表单状态管理系统，包括多步骤表单、动态字段、验证规则、
草稿保存等功能。

## 系统架构

### 表单管理架构

```
FormSystem
├── FormStore              # 表单数据管理
├── ValidationStore        # 验证规则管理
├── FieldStore              # 动态字段管理
├── StepStore               # 多步骤管理
├── DraftStore              # 草稿保存管理
├── DependencyStore         # 字段依赖管理
└── SubmissionStore         # 提交状态管理
```

## 核心数据模型

### 类型定义

```typescript
// types/form.ts
export interface FormField {
  id: string
  name: string
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
  label: string
  placeholder?: string
  required: boolean
  disabled: boolean
  visible: boolean
  value: any
  defaultValue: any
  options?: FormFieldOption[]
  validation: ValidationRule[]
  dependencies: FieldDependency[]
  metadata: Record<string, any>
}

export interface FormFieldOption {
  label: string
  value: any
  disabled?: boolean
  group?: string
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
  validator?: (value: any, formData: any) => boolean | Promise<boolean>
}

export interface FieldDependency {
  field: string
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'set_value'
  targetValue?: any
}

export interface FormStep {
  id: string
  title: string
  description?: string
  fields: string[]
  validation: 'none' | 'on_blur' | 'on_change' | 'on_submit'
  canSkip: boolean
  completed: boolean
}

export interface FormDraft {
  id: string
  formId: string
  data: Record<string, any>
  step: number
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface ValidationError {
  field: string
  rule: string
  message: string
  value: any
}
```

## Store 实现

### 1. 表单数据管理 Store

```typescript
// stores/form.ts
import { Action, AsyncAction, BaseStore, CachedGetter, Getter, State } from '@ldesign/store'

export class FormStore extends BaseStore {
  @State({ default: {} })
  fields: Record<string, FormField> = {}

  @State({ default: {} })
  values: Record<string, any> = {}

  @State({ default: {} })
  errors: Record<string, ValidationError[]> = {}

  @State({ default: {} })
  touched: Record<string, boolean> = {}

  @State({ default: false })
  submitting: boolean = false

  @State({ default: false })
  submitted: boolean = false

  @State({ default: null })
  submitError: string | null = null

  @Action()
  initializeForm(fields: FormField[]) {
    this.fields = {}
    this.values = {}
    this.errors = {}
    this.touched = {}

    fields.forEach(field => {
      this.fields[field.name] = field
      this.values[field.name] = field.defaultValue
      this.errors[field.name] = []
      this.touched[field.name] = false
    })

    // 处理字段依赖
    this.processDependencies()
  }

  @Action()
  setFieldValue(fieldName: string, value: any) {
    if (!this.fields[fieldName]) return

    this.values[fieldName] = value
    this.touched[fieldName] = true

    // 清除该字段的错误
    this.errors[fieldName] = []

    // 处理字段依赖
    this.processDependencies()

    // 触发验证
    this.validateField(fieldName)

    // 自动保存草稿
    this.autoSaveDraft()
  }

  @Action()
  setFieldError(fieldName: string, errors: ValidationError[]) {
    this.errors[fieldName] = errors
  }

  @Action()
  clearFieldError(fieldName: string) {
    this.errors[fieldName] = []
  }

  @Action()
  setFieldTouched(fieldName: string, touched: boolean = true) {
    this.touched[fieldName] = touched
  }

  @Action()
  resetForm() {
    Object.keys(this.fields).forEach(fieldName => {
      this.values[fieldName] = this.fields[fieldName].defaultValue
      this.errors[fieldName] = []
      this.touched[fieldName] = false
    })

    this.submitting = false
    this.submitted = false
    this.submitError = null
  }

  @AsyncAction()
  async validateField(fieldName: string) {
    const field = this.fields[fieldName]
    if (!field) return

    const validationStore = new ValidationStore('validation')
    const errors = await validationStore.validateField(field, this.values[fieldName], this.values)

    this.setFieldError(fieldName, errors)
    return errors.length === 0
  }

  @AsyncAction()
  async validateForm() {
    const validationPromises = Object.keys(this.fields).map(fieldName =>
      this.validateField(fieldName)
    )

    const results = await Promise.all(validationPromises)
    return results.every(result => result)
  }

  @AsyncAction()
  async submitForm() {
    if (this.submitting) return

    this.submitting = true
    this.submitError = null

    try {
      // 验证表单
      const isValid = await this.validateForm()
      if (!isValid) {
        throw new Error('表单验证失败')
      }

      // 提交数据
      const submissionStore = new SubmissionStore('submission')
      const result = await submissionStore.submit(this.values)

      this.submitted = true

      // 清除草稿
      const draftStore = new DraftStore('draft')
      draftStore.clearDraft(this.formId)

      return result
    } catch (error) {
      this.submitError = error instanceof Error ? error.message : '提交失败'
      throw error
    } finally {
      this.submitting = false
    }
  }

  private processDependencies() {
    Object.values(this.fields).forEach(field => {
      field.dependencies.forEach(dependency => {
        const dependentValue = this.values[dependency.field]
        const shouldTrigger = this.evaluateCondition(
          dependentValue,
          dependency.condition,
          dependency.value
        )

        if (shouldTrigger) {
          this.applyDependencyAction(field.name, dependency)
        }
      })
    })
  }

  private evaluateCondition(value: any, condition: string, targetValue: any): boolean {
    switch (condition) {
      case 'equals':
        return value === targetValue
      case 'not_equals':
        return value !== targetValue
      case 'contains':
        return Array.isArray(value)
          ? value.includes(targetValue)
          : String(value).includes(targetValue)
      case 'greater_than':
        return Number(value) > Number(targetValue)
      case 'less_than':
        return Number(value) < Number(targetValue)
      default:
        return false
    }
  }

  private applyDependencyAction(fieldName: string, dependency: FieldDependency) {
    const field = this.fields[fieldName]
    if (!field) return

    switch (dependency.action) {
      case 'show':
        field.visible = true
        break
      case 'hide':
        field.visible = false
        break
      case 'enable':
        field.disabled = false
        break
      case 'disable':
        field.disabled = true
        break
      case 'require':
        field.required = true
        break
      case 'set_value':
        if (dependency.targetValue !== undefined) {
          this.values[fieldName] = dependency.targetValue
        }
        break
    }
  }

  private autoSaveDraft() {
    // 防抖保存草稿
    if (this.draftTimer) {
      clearTimeout(this.draftTimer)
    }

    this.draftTimer = setTimeout(() => {
      const draftStore = new DraftStore('draft')
      draftStore.saveDraft(this.formId, this.values, this.currentStep)
    }, 2000)
  }

  @Getter()
  get isValid() {
    return Object.values(this.errors).every(fieldErrors => fieldErrors.length === 0)
  }

  @Getter()
  get isDirty() {
    return Object.values(this.touched).some(touched => touched)
  }

  @Getter()
  get visibleFields() {
    return Object.values(this.fields).filter(field => field.visible)
  }

  @Getter()
  get requiredFields() {
    return Object.values(this.fields).filter(field => field.required && field.visible)
  }

  @CachedGetter(['values', 'fields'])
  get completionRate() {
    const requiredFields = this.requiredFields
    if (requiredFields.length === 0) return 100

    const completedFields = requiredFields.filter(field => {
      const value = this.values[field.name]
      return value !== null && value !== undefined && value !== ''
    })

    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  @Getter()
  get fieldErrors() {
    const allErrors: ValidationError[] = []
    Object.values(this.errors).forEach(fieldErrors => {
      allErrors.push(...fieldErrors)
    })
    return allErrors
  }

  @Getter()
  get hasErrors() {
    return this.fieldErrors.length > 0
  }
}
```

### 2. 验证规则管理 Store

```typescript
// stores/validation.ts
import { Action, BaseStore, CachedAction, State } from '@ldesign/store'

export class ValidationStore extends BaseStore {
  @State({ default: new Map() })
  customValidators: Map<string, Function> = new Map()

  @State({ default: {} })
  validationMessages: Record<string, string> = {
    required: '此字段为必填项',
    min: '值不能小于 {min}',
    max: '值不能大于 {max}',
    pattern: '格式不正确',
    email: '请输入有效的邮箱地址',
    phone: '请输入有效的手机号码',
    url: '请输入有效的网址',
  }

  @Action()
  registerValidator(name: string, validator: Function) {
    this.customValidators.set(name, validator)
  }

  @Action()
  setValidationMessage(rule: string, message: string) {
    this.validationMessages[rule] = message
  }

  @CachedAction(1000)
  async validateField(
    field: FormField,
    value: any,
    formData: Record<string, any>
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = []

    for (const rule of field.validation) {
      const isValid = await this.validateRule(rule, value, formData, field)

      if (!isValid) {
        errors.push({
          field: field.name,
          rule: rule.type,
          message: this.formatMessage(rule.message, rule),
          value,
        })
      }
    }

    return errors
  }

  private async validateRule(
    rule: ValidationRule,
    value: any,
    formData: Record<string, any>,
    field: FormField
  ): Promise<boolean> {
    switch (rule.type) {
      case 'required':
        return this.validateRequired(value)
      case 'min':
        return this.validateMin(value, rule.value)
      case 'max':
        return this.validateMax(value, rule.value)
      case 'pattern':
        return this.validatePattern(value, rule.value)
      case 'custom':
        return await this.validateCustom(rule, value, formData)
      default:
        return true
    }
  }

  private validateRequired(value: any): boolean {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  }

  private validateMin(value: any, min: number): boolean {
    if (typeof value === 'number') return value >= min
    if (typeof value === 'string') return value.length >= min
    if (Array.isArray(value)) return value.length >= min
    return true
  }

  private validateMax(value: any, max: number): boolean {
    if (typeof value === 'number') return value <= max
    if (typeof value === 'string') return value.length <= max
    if (Array.isArray(value)) return value.length <= max
    return true
  }

  private validatePattern(value: any, pattern: string | RegExp): boolean {
    if (!value) return true
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    return regex.test(String(value))
  }

  private async validateCustom(
    rule: ValidationRule,
    value: any,
    formData: Record<string, any>
  ): Promise<boolean> {
    if (rule.validator) {
      return await rule.validator(value, formData)
    }
    return true
  }

  private formatMessage(message: string, rule: ValidationRule): string {
    return message.replace(/\{(\w+)\}/g, (match, key) => {
      return rule.value?.[key] || rule[key] || match
    })
  }

  // 预定义验证器
  @Action()
  setupBuiltinValidators() {
    // 邮箱验证
    this.registerValidator('email', (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
      return !value || emailRegex.test(value)
    })

    // 手机号验证
    this.registerValidator('phone', (value: string) => {
      const phoneRegex = /^1[3-9]\d{9}$/
      return !value || phoneRegex.test(value)
    })

    // 身份证验证
    this.registerValidator('idCard', (value: string) => {
      const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}([\dX])$)/i
      return !value || idCardRegex.test(value)
    })

    // 密码强度验证
    this.registerValidator('strongPassword', (value: string) => {
      if (!value) return true
      const hasLower = /[a-z]/.test(value)
      const hasUpper = /[A-Z]/.test(value)
      const hasNumber = /\d/.test(value)
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
      const isLongEnough = value.length >= 8

      return hasLower && hasUpper && hasNumber && hasSpecial && isLongEnough
    })

    // 异步验证：检查用户名是否可用
    this.registerValidator('uniqueUsername', async (value: string) => {
      if (!value) return true

      try {
        const response = await api.checkUsername(value)
        return response.available
      } catch (error) {
        return false
      }
    })
  }
}
```

### 3. 多步骤表单管理 Store

```typescript
// stores/step.ts
import { Action, BaseStore, Getter, State } from '@ldesign/store'

export class StepStore extends BaseStore {
  @State({ default: [] })
  steps: FormStep[] = []

  @State({ default: 0 })
  currentStep: number = 0

  @State({ default: false })
  canGoBack: boolean = true

  @State({ default: false })
  canGoNext: boolean = false

  @Action()
  initializeSteps(steps: FormStep[]) {
    this.steps = steps
    this.currentStep = 0
    this.updateNavigationState()
  }

  @Action()
  goToStep(stepIndex: number) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.currentStep = stepIndex
      this.updateNavigationState()
    }
  }

  @Action()
  nextStep() {
    if (this.canGoNext) {
      this.currentStep++
      this.updateNavigationState()
    }
  }

  @Action()
  prevStep() {
    if (this.canGoBack) {
      this.currentStep--
      this.updateNavigationState()
    }
  }

  @Action()
  setStepCompleted(stepIndex: number, completed: boolean) {
    if (this.steps[stepIndex]) {
      this.steps[stepIndex].completed = completed
      this.updateNavigationState()
    }
  }

  @Action()
  async validateCurrentStep() {
    const currentStepData = this.steps[this.currentStep]
    if (!currentStepData) return false

    const formStore = new FormStore('form')

    // 验证当前步骤的所有字段
    const validationPromises = currentStepData.fields.map(fieldName =>
      formStore.validateField(fieldName)
    )

    const results = await Promise.all(validationPromises)
    const isValid = results.every(result => result)

    this.setStepCompleted(this.currentStep, isValid)
    return isValid
  }

  private updateNavigationState() {
    this.canGoBack = this.currentStep > 0
    this.canGoNext = this.currentStep < this.steps.length - 1
  }

  @Getter()
  get currentStepData() {
    return this.steps[this.currentStep]
  }

  @Getter()
  get isFirstStep() {
    return this.currentStep === 0
  }

  @Getter()
  get isLastStep() {
    return this.currentStep === this.steps.length - 1
  }

  @Getter()
  get completedSteps() {
    return this.steps.filter(step => step.completed)
  }

  @Getter()
  get progress() {
    if (this.steps.length === 0) return 0
    return Math.round(((this.currentStep + 1) / this.steps.length) * 100)
  }

  @Getter()
  get completionProgress() {
    if (this.steps.length === 0) return 0
    return Math.round((this.completedSteps.length / this.steps.length) * 100)
  }

  @Getter()
  get stepNavigation() {
    return this.steps.map((step, index) => ({
      ...step,
      index,
      isCurrent: index === this.currentStep,
      isAccessible: index <= this.currentStep || step.completed,
      status: this.getStepStatus(index),
    }))
  }

  private getStepStatus(stepIndex: number): 'pending' | 'current' | 'completed' | 'error' {
    if (stepIndex < this.currentStep) {
      return this.steps[stepIndex].completed ? 'completed' : 'error'
    } else if (stepIndex === this.currentStep) {
      return 'current'
    } else {
      return 'pending'
    }
  }
}
```

### 4. 草稿保存管理 Store

```typescript
// stores/draft.ts
import { Action, AsyncAction, BaseStore, Getter, PersistentState, State } from '@ldesign/store'

export class DraftStore extends BaseStore {
  @PersistentState({ default: new Map() })
  drafts: Map<string, FormDraft> = new Map()

  @State({ default: 5000 })
  autoSaveInterval: number = 5000

  @State({ default: 7 * 24 * 60 * 60 * 1000 })
  draftExpiry: number = 7 * 24 * 60 * 60 * 1000 // 7天

  private autoSaveTimer: NodeJS.Timeout | null = null

  @Action()
  saveDraft(formId: string, data: Record<string, any>, step: number = 0) {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.draftExpiry)

    const draft: FormDraft = {
      id: generateId(),
      formId,
      data: { ...data },
      step,
      createdAt: this.drafts.get(formId)?.createdAt || now,
      updatedAt: now,
      expiresAt,
    }

    this.drafts.set(formId, draft)
    this.cleanupExpiredDrafts()
  }

  @Action()
  loadDraft(formId: string): FormDraft | null {
    const draft = this.drafts.get(formId)

    if (!draft) return null

    // 检查是否过期
    if (draft.expiresAt && new Date() > draft.expiresAt) {
      this.drafts.delete(formId)
      return null
    }

    return draft
  }

  @Action()
  clearDraft(formId: string) {
    this.drafts.delete(formId)
  }

  @Action()
  clearAllDrafts() {
    this.drafts.clear()
  }

  @Action()
  startAutoSave(formId: string) {
    this.stopAutoSave()

    this.autoSaveTimer = setInterval(() => {
      const formStore = new FormStore('form')
      if (formStore.isDirty) {
        const stepStore = new StepStore('step')
        this.saveDraft(formId, formStore.values, stepStore.currentStep)
      }
    }, this.autoSaveInterval)
  }

  @Action()
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = null
    }
  }

  @AsyncAction()
  async syncDraftsToServer() {
    const draftsToSync = Array.from(this.drafts.values())

    for (const draft of draftsToSync) {
      try {
        await draftApi.saveDraft(draft)
      } catch (error) {
        console.error('同步草稿失败:', error)
      }
    }
  }

  @AsyncAction()
  async loadDraftsFromServer() {
    try {
      const serverDrafts = await draftApi.getDrafts()

      serverDrafts.forEach(draft => {
        this.drafts.set(draft.formId, draft)
      })
    } catch (error) {
      console.error('加载服务器草稿失败:', error)
    }
  }

  private cleanupExpiredDrafts() {
    const now = new Date()

    for (const [formId, draft] of this.drafts.entries()) {
      if (draft.expiresAt && now > draft.expiresAt) {
        this.drafts.delete(formId)
      }
    }
  }

  @Getter()
  get draftCount() {
    return this.drafts.size
  }

  @Getter()
  get recentDrafts() {
    return Array.from(this.drafts.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10)
  }

  @Getter()
  get hasDrafts() {
    return this.drafts.size > 0
  }
}
```

## Vue 组件集成

### 动态表单组件

```vue
<!-- components/DynamicForm.vue -->
<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { DraftStore } from '@/stores/draft'
import { FormStore } from '@/stores/form'
import { StepStore } from '@/stores/step'
import { ValidationStore } from '@/stores/validation'

interface Props {
  formConfig: {
    id: string
    fields: FormField[]
    steps?: FormStep[]
  }
}

const props = defineProps<Props>()

const formStore = new FormStore('form')
const stepStore = new StepStore('step')
const draftStore = new DraftStore('draft')
const validationStore = new ValidationStore('validation')

onMounted(async () => {
  // 初始化验证器
  validationStore.setupBuiltinValidators()

  // 初始化表单
  formStore.initializeForm(props.formConfig.fields)

  // 初始化步骤
  if (props.formConfig.steps) {
    stepStore.initializeSteps(props.formConfig.steps)
  }

  // 加载草稿
  const draft = draftStore.loadDraft(props.formConfig.id)
  if (draft) {
    formStore.values = { ...draft.data }
    stepStore.goToStep(draft.step)
  }

  // 开始自动保存
  draftStore.startAutoSave(props.formConfig.id)
})

onUnmounted(() => {
  draftStore.stopAutoSave()
})

const currentStepFields = computed(() => {
  if (stepStore.steps.length === 0) {
    return formStore.visibleFields
  }

  const currentStep = stepStore.currentStepData
  if (!currentStep) return []

  return currentStep.fields
    .map(fieldName => formStore.fields[fieldName])
    .filter(field => field && field.visible)
})

const canProceed = computed(() => {
  return currentStepFields.value.every(field => {
    if (!field.required) return true
    const value = formStore.values[field.name]
    return value !== null && value !== undefined && value !== ''
  })
})

function handleFieldChange(fieldName: string, value: any) {
  formStore.setFieldValue(fieldName, value)
}

function handleFieldBlur(fieldName: string) {
  formStore.setFieldTouched(fieldName, true)
  formStore.validateField(fieldName)
}

async function handleNextStep() {
  const isValid = await stepStore.validateCurrentStep()
  if (isValid) {
    stepStore.nextStep()
  }
}

function handleStepClick(stepIndex: number) {
  const step = stepStore.steps[stepIndex]
  if (step && (step.completed || stepIndex <= stepStore.currentStep)) {
    stepStore.goToStep(stepIndex)
  }
}

async function handleSubmit() {
  try {
    await formStore.submitForm()
    // 提交成功处理
  } catch (error) {
    console.error('提交失败:', error)
  }
}

function handleLoadDraft(draft: FormDraft) {
  formStore.values = { ...draft.data }
  stepStore.goToStep(draft.step)
}

function handleClearDraft() {
  draftStore.clearDraft(props.formConfig.id)
}
</script>

<template>
  <div class="dynamic-form">
    <!-- 步骤导航 -->
    <StepNavigation
      v-if="stepStore.steps.length > 1"
      :steps="stepStore.stepNavigation"
      @step-click="handleStepClick"
    />

    <!-- 表单内容 -->
    <form class="form-content" @submit.prevent="handleSubmit">
      <!-- 当前步骤的字段 -->
      <div class="form-fields">
        <FormField
          v-for="field in currentStepFields"
          :key="field.name"
          :field="field"
          :value="formStore.values[field.name]"
          :error="formStore.errors[field.name]"
          :touched="formStore.touched[field.name]"
          @update:value="handleFieldChange"
          @blur="handleFieldBlur"
        />
      </div>

      <!-- 表单操作 -->
      <div class="form-actions">
        <button
          v-if="!stepStore.isFirstStep"
          type="button"
          class="btn-secondary"
          @click="stepStore.prevStep"
        >
          上一步
        </button>

        <button
          v-if="!stepStore.isLastStep"
          type="button"
          :disabled="!canProceed"
          class="btn-primary"
          @click="handleNextStep"
        >
          下一步
        </button>

        <button
          v-if="stepStore.isLastStep"
          type="submit"
          :disabled="!formStore.isValid || formStore.submitting"
          class="btn-primary"
        >
          {{ formStore.submitting ? '提交中...' : '提交' }}
        </button>
      </div>
    </form>

    <!-- 草稿提示 -->
    <DraftNotification
      v-if="draftStore.hasDrafts"
      @load-draft="handleLoadDraft"
      @clear-draft="handleClearDraft"
    />

    <!-- 进度指示器 -->
    <div class="form-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${formStore.completionRate}%` }" />
      </div>
      <span class="progress-text"> 完成度: {{ formStore.completionRate }}% </span>
    </div>
  </div>
</template>

<style scoped>
.dynamic-form {
  @apply max-w-4xl mx-auto p-6;
}

.form-content {
  @apply bg-white rounded-lg shadow-sm border p-6;
}

.form-fields {
  @apply space-y-6;
}

.form-actions {
  @apply flex justify-between mt-8 pt-6 border-t;
}

.btn-primary {
  @apply px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50;
}

.btn-secondary {
  @apply px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300;
}

.form-progress {
  @apply mt-4 flex items-center space-x-3;
}

.progress-bar {
  @apply flex-1 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-600 transition-all duration-300;
}

.progress-text {
  @apply text-sm text-gray-600;
}
</style>
```

## 最佳实践

### 1. 表单性能优化

```typescript
// 字段级别的懒加载
export class LazyFieldStore extends BaseStore {
  @State({ default: new Map() })
  fieldCache: Map<string, FormField> = new Map()

  @CachedAction(60000)
  async loadFieldDefinition(fieldType: string) {
    if (this.fieldCache.has(fieldType)) {
      return this.fieldCache.get(fieldType)
    }

    const fieldDef = await fieldApi.getFieldDefinition(fieldType)
    this.fieldCache.set(fieldType, fieldDef)
    return fieldDef
  }

  @Action()
  preloadCommonFields() {
    const commonFields = ['text', 'email', 'select', 'checkbox']
    commonFields.forEach(fieldType => {
      this.loadFieldDefinition(fieldType)
    })
  }
}
```

### 2. 表单数据序列化

```typescript
// 表单数据的序列化和反序列化
export class FormSerializerStore extends BaseStore {
  @Action()
  serializeFormData(formData: Record<string, any>): string {
    const serialized = {
      version: '1.0',
      timestamp: Date.now(),
      data: this.processForSerialization(formData),
    }

    return JSON.stringify(serialized)
  }

  @Action()
  deserializeFormData(serializedData: string): Record<string, any> {
    try {
      const parsed = JSON.parse(serializedData)
      return this.processForDeserialization(parsed.data)
    } catch (error) {
      console.error('反序列化失败:', error)
      return {}
    }
  }

  private processForSerialization(data: Record<string, any>): Record<string, any> {
    const processed = {}

    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Date) {
        processed[key] = { __type: 'Date', value: value.toISOString() }
      } else if (value instanceof File) {
        processed[key] = { __type: 'File', name: value.name, size: value.size }
      } else {
        processed[key] = value
      }
    }

    return processed
  }

  private processForDeserialization(data: Record<string, any>): Record<string, any> {
    const processed = {}

    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && value.__type) {
        switch (value.__type) {
          case 'Date':
            processed[key] = new Date(value.value)
            break
          case 'File':
            // 文件需要特殊处理，这里只是示例
            processed[key] = null
            break
          default:
            processed[key] = value.value
        }
      } else {
        processed[key] = value
      }
    }

    return processed
  }
}
```

### 3. 表单状态恢复

```typescript
// 表单状态的备份和恢复
export class FormStateManager {
  private snapshots: Map<string, any> = new Map()

  createSnapshot(formId: string, formStore: FormStore) {
    const snapshot = {
      values: { ...formStore.values },
      errors: { ...formStore.errors },
      touched: { ...formStore.touched },
      timestamp: Date.now(),
    }

    this.snapshots.set(formId, snapshot)
  }

  restoreSnapshot(formId: string, formStore: FormStore): boolean {
    const snapshot = this.snapshots.get(formId)
    if (!snapshot) return false

    formStore.values = { ...snapshot.values }
    formStore.errors = { ...snapshot.errors }
    formStore.touched = { ...snapshot.touched }

    return true
  }

  clearSnapshot(formId: string) {
    this.snapshots.delete(formId)
  }
}
```

## 总结

这个大型表单状态管理示例展示了：

1. **完整的表单生命周期管理**：初始化、验证、提交、重置
2. **多步骤表单支持**：步骤导航、进度跟踪、条件跳转
3. **动态字段管理**：字段依赖、条件显示、动态验证
4. **草稿保存功能**：自动保存、手动恢复、过期清理
5. **高级验证系统**：内置验证器、自定义规则、异步验证
6. **性能优化策略**：字段缓存、懒加载、防抖验证

通过这种架构，你可以构建出功能强大、用户体验良好的复杂表单应用。
