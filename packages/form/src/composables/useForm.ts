// useForm Composition API Hook

import type { FormData, FormOptions } from '../types/form'
import { h, reactive, ref, type VNode } from 'vue'
import DynamicForm from '../components/DynamicForm.vue'
import {
  useAdvancedLayout,
  type UseAdvancedLayoutReturn,
} from './useAdvancedLayout'

// 简单的事件发射器
class SimpleEventEmitter {
  private events: Record<string, Function[]> = {}

  on(event: string, handler: Function): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(handler)
  }

  off(event: string, handler: Function): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(h => h !== handler)
    }
  }

  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(...args))
    }
  }
}

/**
 * useForm Hook 选项
 */
export interface UseFormOptions extends FormOptions {
  /** 初始数据 */
  initialData?: FormData
}

/**
 * useForm Hook 返回值
 */
export interface UseFormReturn {
  /** 表单数据 */
  formData: FormData

  /** 表单状态 */
  formState: {
    submitting: boolean
    validating: boolean
    dirty: boolean
    valid: boolean
    touched: boolean
  }

  /** 表单错误 */
  formErrors: Record<string, string[]>

  /** 字段状态 */
  fieldStates: Record<
    string,
    {
      value: any
      dirty: boolean
      touched: boolean
      valid: boolean
      errors: string[]
      visible: boolean
      disabled: boolean
      readonly: boolean
    }
  >

  /** 渲染表单组件 */
  renderForm: () => VNode

  /** 事件方法 */
  on: (event: string, handler: Function) => void
  off: (event: string, handler: Function) => void
  emit: (event: string, ...args: any[]) => void

  /** 表单操作方法 */
  submit: () => Promise<boolean>
  reset: () => void
  clear: () => void
  validate: () => Promise<boolean>
  validateField: (name: string) => Promise<boolean>

  /** 字段操作方法 */
  setFieldValue: (name: string, value: any) => void
  getFieldValue: (name: string) => any
  setFormData: (data: FormData) => void
  getFormData: () => FormData
  showField: (name: string) => void
  hideField: (name: string) => void
  enableField: (name: string) => void
  disableField: (name: string) => void
  isFieldVisible: (name: string) => boolean
  isFieldDisabled: (name: string) => boolean
  addField: (field: any) => void
  removeField: (name: string) => void

  /** 高级布局功能 */
  layout: UseAdvancedLayoutReturn
}

/**
 * useForm Hook
 */
export function useForm(options: UseFormOptions): UseFormReturn {
  // 事件发射器
  const eventEmitter = new SimpleEventEmitter()

  // 响应式状态
  const formData = reactive<FormData>(options.initialData || {})
  const formState = reactive({
    submitting: false,
    validating: false,
    dirty: false,
    valid: true,
    touched: false,
  })
  const formErrors = reactive<Record<string, string[]>>({})
  const fieldStates = reactive<Record<string, any>>({})

  // 初始化字段状态
  options.fields?.forEach(field => {
    fieldStates[field.name] = reactive({
      value: formData[field.name] ?? field.defaultValue,
      dirty: false,
      touched: false,
      valid: true,
      errors: [],
      visible: !field.hidden,
      disabled: field.disabled || false,
      readonly: field.readonly || false,
    })
  })

  // 容器引用（用于高级布局计算）
  const containerRef = ref<HTMLElement | null>(null)

  // 集成高级布局功能
  const layout = useAdvancedLayout({
    fields: options.fields || [],
    config: options.layout,
    containerRef,
    formData,
    watchResize: true,
  })

  // 表单操作方法
  const getFormData = (): FormData => {
    return formData
  }

  const setFormData = (data: FormData): void => {
    Object.assign(formData, data)
    formState.dirty = Object.keys(data).length > 0
  }

  const getFieldValue = (name: string): any => {
    return formData[name]
  }

  const setFieldValue = (name: string, value: any): void => {
    formData[name] = value
    if (fieldStates[name]) {
      fieldStates[name].value = value
      fieldStates[name].dirty = true
      fieldStates[name].touched = true
    }
    formState.dirty = true
    eventEmitter.emit('change', formData, name)
    eventEmitter.emit('fieldChange', name, value)
  }

  const validate = async (): Promise<boolean> => {
    formState.validating = true
    // 简化的验证实现
    formState.valid = true
    formState.validating = false
    eventEmitter.emit('validate', true, {})
    return true
  }

  const validateField = async (name: string): Promise<boolean> => {
    // 简化的字段验证实现
  }

  const reset = (): void => {
    Object.keys(formData).forEach(key => {
      delete formData[key]
    })

    // 重置字段状态
    Object.values(fieldStates).forEach(state => {
      state.dirty = false
      state.touched = false
      state.valid = true
      state.errors = []
    })

    formState.dirty = false
    formState.valid = true
    formState.touched = false
    eventEmitter.emit('reset', formData)
  }

  const clear = (): void => {
    reset()
  }

  const submit = async (): Promise<boolean> => {
    formState.submitting = true

    try {
      const isValid = await validate()
      if (isValid) {
        eventEmitter.emit('submit', getFormData())
      }
      return isValid
    } finally {
      formState.submitting = false
    }
  }

  // 字段操作方法
  const showField = (name: string): void => {
    if (fieldStates[name]) {
      fieldStates[name].visible = true
    }
  }

  const hideField = (name: string): void => {
    if (fieldStates[name]) {
      fieldStates[name].visible = false
    }
  }

  const enableField = (name: string): void => {
    if (fieldStates[name]) {
      fieldStates[name].disabled = false
    }
  }

  const disableField = (name: string): void => {
    if (fieldStates[name]) {
      fieldStates[name].disabled = true
    }
  }

  const isFieldVisible = (name: string): boolean => {
    return fieldStates[name]?.visible ?? true
  }

  const isFieldDisabled = (name: string): boolean => {
    return fieldStates[name]?.disabled ?? false
  }

  const addField = (field: any): void => {
    // 简化实现
  }

  const removeField = (name: string): void => {
    delete fieldStates[name]
    delete formData[name]
  }

  // 事件方法
  const on = (event: string, handler: Function): void => {
    eventEmitter.on(event, handler)
  }

  const off = (event: string, handler: Function): void => {
    eventEmitter.off(event, handler)
  }

  const emit = (event: string, ...args: any[]): void => {
    eventEmitter.emit(event, ...args)
  }

  // 渲染表单组件
  const renderForm = (): VNode => {
    return h(DynamicForm, {
      modelValue: formData,
      options: {
        ...options,
        layout: {
          ...options.layout,
          // 传递计算后的布局配置
          columns: layout.calculatedColumns.value,
          label: {
            ...options.layout?.label,
            widthByColumn: layout.calculatedLabelWidths.value,
          },
        },
      },
      ref: containerRef,
      isExpanded: layout.isExpanded.value,
      'onUpdate:modelValue': setFormData,
      onSubmit: (data: FormData) => emit('submit', data),
      onReset: () => emit('reset', formData),
      onFieldChange: (name: string, value: any) => setFieldValue(name, value),
      onToggleExpand: layout.toggleExpand,
    })
  }

  return {
    // 数据
    formData,
    formState,
    formErrors,
    fieldStates,

    // 渲染
    renderForm,

    // 事件方法
    on,
    off,
    emit,

    // 表单操作方法
    submit,
    reset,
    clear,
    validate,
    validateField,

    // 字段操作方法
    setFieldValue,
    getFieldValue,
    setFormData,
    getFormData,
    showField,
    hideField,
    enableField,
    disableField,
    isFieldVisible,
    isFieldDisabled,
    addField,
    removeField,

    // 高级布局功能
    layout,
  }
}
