import type { Router } from '../types'
import { reactive } from 'vue'

export interface FormState {
  isDirty: boolean
  data: Record<string, any>
  originalData: Record<string, any>
  errors: Record<string, string[]>
  touched: Set<string>
  validating: Set<string>
}

export interface FormRouteOptions {
  confirmMessage?: string
  autoSave?: boolean
  autoSaveInterval?: number
  validateOnChange?: boolean
  validateOnBlur?: boolean
  preserveOnError?: boolean
}

export interface MultiStepFormConfig {
  steps: Array<{
    name: string
    path: string
    component?: any
    validate?: (data: any) => boolean | Promise<boolean>
    canSkip?: boolean
  }>
  currentStep?: number
  allowJumpToStep?: boolean
  preserveDataOnBack?: boolean
}

// 为了兼容性，导出 FormRouteConfig 别名
export type FormRouteConfig = FormRouteOptions

export class FormRouteManager {
  // 改为 public 以支持外部访问
  public forms = new Map<string, FormState>()
  private autoSaveTimers = new Map<string, NodeJS.Timeout>()
  private multiStepForms = new Map<string, MultiStepFormConfig>()
  private router: Router | null = null
  
  constructor(router?: Router) {
    if (router) {
      this.router = router
      this.setupNavigationGuards()
    }
  }
  
  /**
   * 初始化表单状态
   */
  initForm(formId: string, initialData: Record<string, any> = {}, options?: FormRouteOptions) {
    const state: FormState = reactive({
      isDirty: false,
      data: { ...initialData },
      originalData: { ...initialData },
      errors: {},
      touched: new Set(),
      validating: new Set()
    })
    
    this.forms.set(formId, state)
    
    if (options?.autoSave) {
      this.setupAutoSave(formId, options.autoSaveInterval || 30000)
    }
    
    return state
  }
  
  /**
   * 获取表单状态
   */
  getForm(formId: string): FormState | undefined {
    return this.forms.get(formId)
  }
  
  /**
   * 更新表单字段
   */
  updateField(formId: string, field: string, value: any) {
    const form = this.forms.get(formId)
    if (!form) return
    
    form.data[field] = value
    form.touched.add(field)
    form.isDirty = this.checkDirty(form)
    
    // 清除该字段的错误
    delete form.errors[field]
  }
  
  /**
   * 批量更新表单数据
   */
  updateFormData(formId: string, data: Record<string, any>) {
    const form = this.forms.get(formId)
    if (!form) return
    
    Object.assign(form.data, data)
    Object.keys(data).forEach(key => form.touched.add(key))
    form.isDirty = this.checkDirty(form)
  }
  
  /**
   * 检查表单是否已修改
   */
  private checkDirty(form: FormState): boolean {
    return JSON.stringify(form.data) !== JSON.stringify(form.originalData)
  }
  
  /**
   * 重置表单
   */
  resetForm(formId: string) {
    const form = this.forms.get(formId)
    if (!form) return
    
    form.data = { ...form.originalData }
    form.errors = {}
    form.touched.clear()
    form.validating.clear()
    form.isDirty = false
  }
  
  /**
   * 清理表单
   */
  clearForm(formId: string) {
    const form = this.forms.get(formId)
    if (!form) return
    
    // 清除自动保存定时器
    const timer = this.autoSaveTimers.get(formId)
    if (timer) {
      clearInterval(timer)
      this.autoSaveTimers.delete(formId)
    }
    
    this.forms.delete(formId)
  }
  
  /**
   * 设置表单错误
   */
  setFieldError(formId: string, field: string, errors: string[]) {
    const form = this.forms.get(formId)
    if (!form) return
    
    if (errors.length > 0) {
      form.errors[field] = errors
    } else {
      delete form.errors[field]
    }
  }
  
  /**
   * 设置多个字段错误
   */
  setFormErrors(formId: string, errors: Record<string, string[]>) {
    const form = this.forms.get(formId)
    if (!form) return
    
    form.errors = { ...errors }
  }
  
  /**
   * 验证表单
   */
  async validateForm(formId: string, validators?: Record<string, (value: any) => string[] | Promise<string[]>>) {
    const form = this.forms.get(formId)
    if (!form || !validators) return true
    
    const errors: Record<string, string[]> = {}
    const validationPromises: Promise<void>[] = []
    
    for (const [field, validator] of Object.entries(validators)) {
      form.validating.add(field)
      
      const promise = Promise.resolve(validator(form.data[field]))
        .then(fieldErrors => {
          if (fieldErrors.length > 0) {
            errors[field] = fieldErrors
          }
        })
        .finally(() => {
          form.validating.delete(field)
        })
      
      validationPromises.push(promise)
    }
    
    await Promise.all(validationPromises)
    
    form.errors = errors
    return Object.keys(errors).length === 0
  }
  
  /**
   * 设置自动保存
   */
  private setupAutoSave(formId: string, interval: number) {
    const timer = setInterval(() => {
      const form = this.forms.get(formId)
      if (form && form.isDirty) {
        this.saveForm(formId)
      }
    }, interval)
    
    this.autoSaveTimers.set(formId, timer)
  }
  
  /**
   * 保存表单（需要实现具体逻辑）
   */
  async saveForm(formId: string): Promise<boolean> {
    const form = this.forms.get(formId)
    if (!form) return false
    
    // 这里应该实现实际的保存逻辑
    // 例如：发送到服务器
    console.log('Saving form:', formId, form.data)
    
    // 保存成功后更新原始数据
    form.originalData = { ...form.data }
    form.isDirty = false
    
    return true
  }
  
  /**
   * 设置导航守卫
   */
  private setupNavigationGuards() {
    if (!this.router) return
    
    this.router.beforeEach((_to, _from, next) => {
      // 检查是否有未保存的表单
      const dirtyForms = Array.from(this.forms.entries())
        .filter(([_, form]) => form.isDirty)
        .map(([id, _]) => id)
      
      if (dirtyForms.length > 0) {
        const message = `You have unsaved changes in form(s): ${dirtyForms.join(', ')}. Do you want to leave?`
        
        if (confirm(message)) {
          // 清理表单
          dirtyForms.forEach(id => this.clearForm(id))
          next()
        } else {
          next(false)
        }
      } else {
        next()
      }
    })
  }
  
  /**
   * 初始化多步骤表单
   */
  initMultiStepForm(formId: string, config: MultiStepFormConfig) {
    this.multiStepForms.set(formId, {
      ...config,
      currentStep: config.currentStep || 0
    })
    
    // 初始化表单状态
    this.initForm(formId)
    
    return this.getMultiStepForm(formId)
  }
  
  /**
   * 获取多步骤表单配置
   */
  getMultiStepForm(formId: string) {
    return this.multiStepForms.get(formId)
  }
  
  /**
   * 下一步
   */
  async nextStep(formId: string): Promise<boolean> {
    const config = this.multiStepForms.get(formId)
    const form = this.forms.get(formId)
    
    if (!config || !form) return false
    
    const currentStep = config.steps[config.currentStep!]
    
    // 验证当前步骤
    if (currentStep && currentStep.validate) {
      const isValid = currentStep ? await currentStep.validate(form.data) : false
      if (!isValid) return false
    }
    
    // 移动到下一步
    if (config.currentStep! < config.steps.length - 1) {
      config.currentStep!++
      
      // 如果配置了路由，导航到新路径
      if (this.router) {
        const nextStep = config.steps[config.currentStep!]
        if (nextStep) await this.router.push(nextStep.path)
      }
      
      return true
    }
    
    return false
  }
  
  /**
   * 上一步
   */
  async previousStep(formId: string): Promise<boolean> {
    const config = this.multiStepForms.get(formId)
    const form = this.forms.get(formId)
    
    if (!config || !form) return false
    
    if (config.currentStep! > 0) {
      // 如果不保留数据，清空当前步骤的数据
      if (!config.preserveDataOnBack) {
        // 这里可以实现清空特定步骤数据的逻辑
      }
      
      config.currentStep!--
      
      // 如果配置了路由，导航到新路径
      if (this.router) {
        const previousStep = config.steps[config.currentStep!]
        if (previousStep) await this.router.push(previousStep.path)
      }
      
      return true
    }
    
    return false
  }
  
  /**
   * 跳转到指定步骤
   */
  async goToStep(formId: string, stepIndex: number): Promise<boolean> {
    const config = this.multiStepForms.get(formId)
    
    if (!config || !config.allowJumpToStep) return false
    
    if (stepIndex >= 0 && stepIndex < config.steps.length) {
      config.currentStep = stepIndex
      
      // 如果配置了路由，导航到新路径
      if (this.router) {
        const targetStep = config.steps[stepIndex]
        if (targetStep) await this.router.push(targetStep.path)
      }
      
      return true
    }
    
    return false
  }
  
  /**
   * 获取当前步骤索引
   */
  getCurrentStepIndex(formId: string): number {
    const config = this.multiStepForms.get(formId)
    return config?.currentStep ?? -1
  }
  
  /**
   * 获取步骤完成状态
   */
  getStepCompletion(formId: string): boolean[] {
    const config = this.multiStepForms.get(formId)
    const form = this.forms.get(formId)
    
    if (!config || !form) return []
    
    return config.steps.map((step, index) => {
      if (index < config.currentStep!) return true
      if (index === config.currentStep!) {
        return !step.validate
      }
      return false
    })
  }
  
  /**
   * 完成多步骤表单
   */
  async completeMultiStepForm(formId: string): Promise<boolean> {
    const config = this.multiStepForms.get(formId)
    const form = this.forms.get(formId)
    
    if (!config || !form) return false
    
    // 验证最后一步
    const lastStep = config.steps[config.steps.length - 1]
    if (lastStep && lastStep.validate) {
      const isValid = await lastStep.validate(form.data)
      if (!isValid) return false
    }
    
    // 保存表单
    const saved = await this.saveForm(formId)
    
    if (saved) {
      // 清理多步骤表单配置
      this.multiStepForms.delete(formId)
      // 清理表单
      this.clearForm(formId)
    }
    
    return saved
  }
}

// 创建单例实例
export const formRouteManager = new FormRouteManager()

// Vue 插件
export default {
  install(app: any, options: { router?: Router } = {}) {
    const manager = new FormRouteManager(options.router)
    
    app.config.globalProperties.$formRoute = manager
    app.provide('formRouteManager', manager)
  }
}