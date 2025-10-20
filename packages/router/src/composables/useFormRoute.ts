import type { Ref } from 'vue'
import type { FormRouteOptions, FormState, MultiStepFormConfig } from '../managers/FormRouteManager';
import { computed, inject, onUnmounted, watch } from 'vue'
import { useRoute } from '../composables'
import { FormRouteManager } from '../managers/FormRouteManager'

export interface UseFormRouteOptions extends FormRouteOptions {
  formId?: string
  watchRoute?: boolean
  persistToStorage?: boolean
  storageKey?: string
}

export interface UseFormReturn {
  // 表单状态
  form: Ref<FormState | undefined>
  isDirty: Ref<boolean>
  isValid: Ref<boolean>
  errors: Ref<Record<string, string[]>>
  touched: Ref<Set<string>>
  
  // 表单操作
  updateField: (field: string, value: any) => void
  updateForm: (data: Record<string, any>) => void
  setFieldError: (field: string, errors: string[]) => void
  setFormErrors: (errors: Record<string, string[]>) => void
  validateForm: (validators?: Record<string, (value: any) => string[] | Promise<string[]>>) => Promise<boolean>
  resetForm: () => void
  saveForm: () => Promise<boolean>
  clearForm: () => void
  
  // 工具函数
  hasError: (field: string) => boolean
  getError: (field: string) => string[]
  isTouched: (field: string) => boolean
  isValidating: (field: string) => boolean
}

export interface UseMultiStepFormReturn extends UseFormReturn {
  // 多步骤表单特有
  currentStep: Ref<number>
  totalSteps: Ref<number>
  canGoNext: Ref<boolean>
  canGoPrevious: Ref<boolean>
  stepCompletion: Ref<boolean[]>
  
  // 步骤操作
  nextStep: () => Promise<boolean>
  previousStep: () => Promise<boolean>
  goToStep: (stepIndex: number) => Promise<boolean>
  completeForm: () => Promise<boolean>
}

/**
 * 表单路由组合式函数
 */
export function useFormRoute(options: UseFormRouteOptions = {}): UseFormReturn {
  const manager = inject<FormRouteManager>('formRouteManager', new FormRouteManager())
  const route = useRoute()
  
  // 生成表单ID
  const formId = options.formId || route.value.path
  
  // 初始化表单
  const initializeForm = () => {
    let initialData = {}
    
    // 从本地存储恢复数据
    if (options.persistToStorage) {
      const storageKey = options.storageKey || `form_${formId}`
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          initialData = JSON.parse(stored)
        } catch (e) {
          console.error('Failed to parse stored form data:', e)
        }
      }
    }
    
    return manager.initForm(formId, initialData, options)
  }
  
  // 初始化表单状态
  initializeForm()
  
  // 计算属性
  const form = computed(() => manager.getForm(formId))
  const isDirty = computed(() => form.value?.isDirty ?? false)
  const errors = computed<Record<string, string[]>>(() => form.value?.errors ?? ({} as Record<string, string[]>))
  const touched = computed<Set<string>>(() => form.value?.touched ?? new Set<string>())
  const isValid = computed(() => Object.keys(errors.value).length === 0)
  
  // 监听路由变化
  if (options.watchRoute) {
    watch(() => route.value.path, (newPath, oldPath) => {
      if (newPath !== oldPath) {
        // 路由变化时检查是否需要保存
        if (isDirty.value && options.autoSave) {
          saveForm()
        }
      }
    })
  }
  
  // 预声明，供后续 watch 使用，避免 no-use-before-define
  const saveForm = async () => {
    const saved = await manager.saveForm(formId)

    // 清除本地存储
    if (saved && options.persistToStorage) {
      const storageKey = options.storageKey || `form_${formId}`
      localStorage.removeItem(storageKey)
    }

    return saved
  }

  // 自动保存到本地存储
  if (options.persistToStorage) {
    watch(
      () => form.value?.data,
      (data) => {
        if (data) {
          const storageKey = options.storageKey || `form_${formId}`
          localStorage.setItem(storageKey, JSON.stringify(data))
        }
      },
      { deep: true }
    )
  }
  
  // 表单操作方法
  const updateField = (field: string, value: any) => {
    manager.updateField(formId, field, value)
  }
  
  const updateForm = (data: Record<string, any>) => {
    manager.updateFormData(formId, data)
  }
  
  const setFieldError = (field: string, errors: string[]) => {
    manager.setFieldError(formId, field, errors)
  }
  
  const setFormErrors = (errors: Record<string, string[]>) => {
    manager.setFormErrors(formId, errors)
  }
  
  const validateForm = async (validators?: Record<string, (value: any) => string[] | Promise<string[]>>) => {
    return await manager.validateForm(formId, validators)
  }
  
  const resetForm = () => {
    manager.resetForm(formId)
  }
  
  
  const clearForm = () => {
    // 清除本地存储
    if (options.persistToStorage) {
      const storageKey = options.storageKey || `form_${formId}`
      localStorage.removeItem(storageKey)
    }
    
    manager.clearForm(formId)
  }
  
  // 工具函数
  const hasError = (field: string) => {
    return (errors.value[field]?.length ?? 0) > 0
  }
  
  const getError = (field: string) => {
    return errors.value[field] ?? []
  }
  
  const isTouched = (field: string) => {
    return touched.value.has(field)
  }
  
  const isValidating = (field: string) => {
    return form.value?.validating.has(field) ?? false
  }
  
  // 组件卸载时清理
  onUnmounted(() => {
    if (!options.persistToStorage && !isDirty.value) {
      clearForm()
    }
  })
  
  return {
    form,
    isDirty,
    isValid,
    errors,
    touched,
    updateField,
    updateForm,
    setFieldError,
    setFormErrors,
    validateForm,
    resetForm,
    saveForm,
    clearForm,
    hasError,
    getError,
    isTouched,
    isValidating
  }
}

/**
 * 多步骤表单组合式函数
 */
export function useMultiStepForm(
  config: MultiStepFormConfig,
  options: UseFormRouteOptions = {}
): UseMultiStepFormReturn {
  const manager = inject<FormRouteManager>('formRouteManager', new FormRouteManager())
  const route = useRoute()
  
  // 生成表单ID
  const formId = options.formId || `multi-step-${route.value.path}`
  
  // 初始化多步骤表单
  manager.initMultiStepForm(formId, config)
  
  // 使用基础表单功能
  const formReturn = useFormRoute({ ...options, formId })
  
  // 多步骤表单特有的计算属性
  const multiStepConfig = computed(() => manager.getMultiStepForm(formId))
  const currentStep = computed(() => multiStepConfig.value?.currentStep ?? 0)
  const totalSteps = computed(() => multiStepConfig.value?.steps.length ?? 0)
  const canGoNext = computed(() => currentStep.value < totalSteps.value - 1)
  const canGoPrevious = computed(() => currentStep.value > 0)
  const stepCompletion = computed(() => manager.getStepCompletion(formId))
  
  // 多步骤表单操作
  const nextStep = async () => {
    return await manager.nextStep(formId)
  }
  
  const previousStep = async () => {
    return await manager.previousStep(formId)
  }
  
  const goToStep = async (stepIndex: number) => {
    return await manager.goToStep(formId, stepIndex)
  }
  
  const completeForm = async () => {
    return await manager.completeMultiStepForm(formId)
  }
  
  return {
    ...formReturn,
    currentStep,
    totalSteps,
    canGoNext,
    canGoPrevious,
    stepCompletion,
    nextStep,
    previousStep,
    goToStep,
    completeForm
  }
}

/**
 * 字段验证器辅助函数
 */
export const validators = {
  required: (message = 'This field is required') => {
    return (value: any): string[] => {
      if (value === null || value === undefined || value === '') {
        return [message]
      }
      return []
    }
  },
  
  minLength: (min: number, message?: string) => {
    return (value: string): string[] => {
      if (value && value.length < min) {
        return [message || `Minimum length is ${min}`]
      }
      return []
    }
  },
  
  maxLength: (max: number, message?: string) => {
    return (value: string): string[] => {
      if (value && value.length > max) {
        return [message || `Maximum length is ${max}`]
      }
      return []
    }
  },
  
  email: (message = 'Invalid email address') => {
    return (value: string): string[] => {
      const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
      if (value && !emailRegex.test(value)) {
        return [message]
      }
      return []
    }
  },
  
  pattern: (regex: RegExp, message = 'Invalid format') => {
    return (value: string): string[] => {
      if (value && !regex.test(value)) {
        return [message]
      }
      return []
    }
  },
  
  numeric: (message = 'Must be a number') => {
    return (value: any): string[] => {
      if (value && isNaN(Number(value))) {
        return [message]
      }
      return []
    }
  },
  
  min: (min: number, message?: string) => {
    return (value: number): string[] => {
      if (value !== undefined && value !== null && value < min) {
        return [message || `Minimum value is ${min}`]
      }
      return []
    }
  },
  
  max: (max: number, message?: string) => {
    return (value: number): string[] => {
      if (value !== undefined && value !== null && value > max) {
        return [message || `Maximum value is ${max}`]
      }
      return []
    }
  },
  
  // 组合多个验证器
  compose: (...validators: Array<(value: any) => string[] | Promise<string[]>>) => {
    return async (value: any): Promise<string[]> => {
      const errors: string[] = []
      
      for (const validator of validators) {
        const result = await validator(value)
        errors.push(...result)
      }
      
      return errors
    }
  }
}

/**
 * 表单路由插件
 */
export const FormRoutePlugin = {
  install(app: any, options: { manager?: FormRouteManager } = {}) {
    const manager = options.manager || new FormRouteManager()
    
    // 提供全局表单管理器
    app.provide('formRouteManager', manager)
    
    // 全局属性
    app.config.globalProperties.$formManager = manager
    
    // 全局混入
    app.mixin({
      beforeRouteLeave(_to: any, _from: any, next: any) {
        // 检查所有表单的脏状态
        const dirtyForms = Array.from(manager.forms.values())
          .filter(form => form.isDirty)
          .map((form: any) => form.id)
        
        if (dirtyForms.length > 0) {
          const confirmed = window.confirm(
            'You have unsaved changes. Are you sure you want to leave?'
          )
          
          if (confirmed) {
            // 清理表单
            dirtyForms.forEach((formId: string) => {
              manager.clearForm(formId)
            })
            next()
          } else {
            next(false)
          }
        } else {
          next()
        }
      }
    })
  }
}

/**
 * 创建表单字段绑定
 */
export function useFormField(
  formReturn: UseFormReturn,
  fieldName: string,
  validators?: Array<(value: any) => string[] | Promise<string[]>>
) {
  const value = computed({
    get: () => formReturn.form.value?.data[fieldName],
    set: (val) => formReturn.updateField(fieldName, val)
  })
  
  const error = computed(() => formReturn.getError(fieldName))
  const hasError = computed(() => formReturn.hasError(fieldName))
  const touched = computed(() => formReturn.isTouched(fieldName))
  const validating = computed(() => formReturn.isValidating(fieldName))
  
  const validate = async () => {
    if (validators && validators.length > 0) {
      const composedValidator = validators.length === 1
        ? validators[0]
        : async (val: any) => {
            const allErrors: string[] = []
            for (const validator of validators) {
              const errors = await validator(val)
              allErrors.push(...errors)
            }
            return allErrors
          }
      
      if (!composedValidator) return true
      const errors = await composedValidator(value.value)
      formReturn.setFieldError(fieldName, errors)
      return errors.length === 0
    }
    return true
  }
  
  const blur = () => {
    formReturn.updateField(fieldName, value.value) // Mark as touched
    validate()
  }
  
  return {
    value,
    error,
    hasError,
    touched,
    validating,
    validate,
    blur,
    props: computed(() => ({
      modelValue: value.value,
      'onUpdate:modelValue': (val: any) => { value.value = val },
      onBlur: blur,
      error: hasError.value,
      errorMessage: error.value[0],
      loading: validating.value
    }))
  }
}