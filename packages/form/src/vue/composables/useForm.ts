/**
 * 表单组合式函数
 * 
 * 提供表单相关的响应式状态和方法
 */

import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import type { FormConfig, FormState, AnyObject } from '../../types'
import { FormEngine } from '../../core'

/**
 * 表单Hook选项
 */
export interface UseFormOptions {
  // 初始数据
  initialValues?: AnyObject
  // 是否立即验证
  validateOnMount?: boolean
  // 是否在值变化时验证
  validateOnChange?: boolean
  // 是否在失焦时验证
  validateOnBlur?: boolean
  // 防抖延迟
  debounceDelay?: number
  // 自动保存
  autoSave?: boolean
  autoSaveDelay?: number
  // 调试模式
  debug?: boolean
}

/**
 * 表单Hook返回值
 */
export interface UseFormReturn {
  // 表单实例
  formInstance: any
  // 表单数据
  formData: any
  // 表单状态
  formState: any
  // 方法
  setFieldValue: (field: string, value: any) => void
  getFieldValue: (field: string) => any
  setFormData: (data: AnyObject) => void
  getFormData: () => AnyObject
  validate: (fields?: string[]) => Promise<boolean>
  validateField: (field: string) => Promise<boolean>
  reset: () => void
  submit: () => Promise<boolean>
  // 状态
  isDirty: any
  isValid: any
  isSubmitting: any
  isLoading: any
  errors: any
  // 工具方法
  watch: (field: string, callback: (value: any, oldValue: any) => void) => () => void
  watchAll: (callback: (data: AnyObject) => void) => () => void
}

/**
 * 使用表单Hook
 */
export function useForm(
  config: FormConfig,
  options: UseFormOptions = {}
): UseFormReturn {
  const {
    initialValues = {},
    validateOnMount = false,
    validateOnChange = true,
    validateOnBlur = true,
    debounceDelay = 300,
    autoSave = false,
    autoSaveDelay = 1000,
    debug = false
  } = options
  
  // 响应式状态
  const formInstance = ref<any>(null)
  const formData = ref<AnyObject>({ ...initialValues })
  const formState = reactive<FormState>({
    isDirty: false,
    isValid: true,
    isSubmitting: false,
    isLoading: false,
    isAutoSaving: false,
    hasUnsavedChanges: false,
    lastSaved: null,
    lastValidated: null,
    canUndo: false,
    canRedo: false,
    historyIndex: -1,
    historySize: 0,
    mode: 'edit',
    theme: 'light',
    size: 'medium',
    collapsed: false,
    expanded: false,
    fullscreen: false,
    online: navigator.onLine,
    synced: true,
    hasErrors: false,
    errorCount: 0,
    warningCount: 0,
    fieldCount: 0,
    visibleFieldCount: 0,
    requiredFieldCount: 0,
    completedFieldCount: 0
  })
  
  const errors = ref<Record<string, string[]>>({})
  const watchers = new Set<() => void>()
  
  // 计算属性
  const isDirty = computed(() => formState.isDirty)
  const isValid = computed(() => formState.isValid)
  const isSubmitting = computed(() => formState.isSubmitting)
  const isLoading = computed(() => formState.isLoading)
  
  // 初始化表单
  const initializeForm = async () => {
    try {
      formState.isLoading = true
      
      // 创建表单引擎
      formInstance.value = new FormEngine(config)
      
      // 设置初始数据
      if (Object.keys(initialValues).length > 0) {
        formInstance.value.stateManager.setFormData(initialValues)
        formData.value = { ...initialValues }
      }
      
      // 监听表单状态变化
      formInstance.value.eventBus.on('form:updated', (event: any) => {
        Object.assign(formState, event.newState)
      })
      
      // 监听字段变化
      formInstance.value.eventBus.on('field:change', (event: any) => {
        formData.value = formInstance.value.stateManager.getFormData()
        
        // 自动验证
        if (validateOnChange) {
          validateField(event.field?.name)
        }
      })
      
      // 监听验证结果
      formInstance.value.eventBus.on('validation:complete', (event: any) => {
        const result = event.validationResult
        formState.isValid = result.valid
        formState.hasErrors = !result.valid
        formState.errorCount = result.errorFields?.length || 0
        
        // 更新错误信息
        errors.value = {}
        if (result.fields) {
          Object.entries(result.fields).forEach(([field, fieldResult]: [string, any]) => {
            if (!fieldResult.valid && fieldResult.message) {
              errors.value[field] = [fieldResult.message]
            }
          })
        }
      })
      
      // 挂载表单
      formInstance.value.mount()
      
      // 初始验证
      if (validateOnMount) {
        await validate()
      }
      
    } catch (error) {
      console.error('表单初始化失败:', error)
    } finally {
      formState.isLoading = false
    }
  }
  
  // 设置字段值
  const setFieldValue = (field: string, value: any) => {
    if (formInstance.value) {
      formInstance.value.stateManager.setValue(field, value)
    }
  }
  
  // 获取字段值
  const getFieldValue = (field: string) => {
    if (formInstance.value) {
      return formInstance.value.stateManager.getValue(field)
    }
    return undefined
  }
  
  // 设置表单数据
  const setFormData = (data: AnyObject) => {
    if (formInstance.value) {
      formInstance.value.stateManager.setFormData(data)
      formData.value = { ...data }
    }
  }
  
  // 获取表单数据
  const getFormData = () => {
    if (formInstance.value) {
      return formInstance.value.stateManager.getFormData()
    }
    return formData.value
  }
  
  // 验证表单
  const validate = async (fields?: string[]): Promise<boolean> => {
    if (!formInstance.value) return false
    
    try {
      const fieldRules = getFieldRules(fields)
      const result = await formInstance.value.validationEngine.validateForm(
        formData.value,
        fieldRules
      )
      
      return result.valid
    } catch (error) {
      console.error('表单验证失败:', error)
      return false
    }
  }
  
  // 验证字段
  const validateField = async (field: string): Promise<boolean> => {
    if (!formInstance.value) return false
    
    try {
      const fieldConfig = formInstance.value.stateManager.fieldConfigs.get(field)
      if (!fieldConfig?.rules) return true
      
      const value = getFieldValue(field)
      const result = await formInstance.value.validationEngine.validateField(
        field,
        value,
        fieldConfig.rules,
        formData.value
      )
      
      return result.valid
    } catch (error) {
      console.error('字段验证失败:', error)
      return false
    }
  }
  
  // 重置表单
  const reset = () => {
    if (formInstance.value) {
      formInstance.value.reset()
      formData.value = formInstance.value.stateManager.getFormData()
      errors.value = {}
    }
  }
  
  // 提交表单
  const submit = async (): Promise<boolean> => {
    if (!formInstance.value) return false
    
    try {
      formState.isSubmitting = true
      
      // 验证表单
      const isValid = await validate()
      if (!isValid) {
        return false
      }
      
      // 这里可以添加提交逻辑
      // 实际项目中应该调用API
      
      return true
    } catch (error) {
      console.error('表单提交失败:', error)
      return false
    } finally {
      formState.isSubmitting = false
    }
  }
  
  // 监听字段变化
  const watchField = (field: string, callback: (value: any, oldValue: any) => void) => {
    if (!formInstance.value) return () => {}
    
    const unwatch = formInstance.value.stateManager.watch(field, callback)
    watchers.add(unwatch)
    return unwatch
  }
  
  // 监听所有字段变化
  const watchAllFields = (callback: (data: AnyObject) => void) => {
    if (!formInstance.value) return () => {}
    
    const unwatch = formInstance.value.stateManager.watchAll(() => {
      callback(formData.value)
    })
    watchers.add(unwatch)
    return unwatch
  }
  
  // 获取字段验证规则
  const getFieldRules = (fields?: string[]) => {
    const rules: Record<string, any[]> = {}
    
    if (!formInstance.value) return rules
    
    for (const [fieldPath, fieldConfig] of formInstance.value.stateManager.fieldConfigs) {
      if (fields && !fields.includes(fieldPath)) continue
      
      if (fieldConfig.rules) {
        rules[fieldPath] = fieldConfig.rules
      }
    }
    
    return rules
  }
  
  // 自动保存
  let autoSaveTimer: NodeJS.Timeout | null = null
  if (autoSave) {
    watch(formData, () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
      
      autoSaveTimer = setTimeout(() => {
        // 这里可以实现自动保存逻辑
        console.log('自动保存:', formData.value)
      }, autoSaveDelay)
    }, { deep: true })
  }
  
  // 清理函数
  onUnmounted(() => {
    // 清理监听器
    watchers.forEach(unwatch => unwatch())
    watchers.clear()
    
    // 清理定时器
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    
    // 销毁表单实例
    if (formInstance.value) {
      formInstance.value.destroy()
    }
  })
  
  // 初始化
  initializeForm()
  
  return {
    formInstance,
    formData,
    formState,
    setFieldValue,
    getFieldValue,
    setFormData,
    getFormData,
    validate,
    validateField,
    reset,
    submit,
    isDirty,
    isValid,
    isSubmitting,
    isLoading,
    errors,
    watch: watchField,
    watchAll: watchAllFields
  }
}
