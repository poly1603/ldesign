/**
 * 表单核心引擎
 * 
 * 提供框架无关的表单管理功能，包括：
 * - 数据管理
 * - 状态管理
 * - 事件系统
 * - 字段管理
 * - 验证协调
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { EventEmitter } from '../utils/event-emitter'
import { FieldManager } from './field-manager'
import { ValidationEngine } from './validation-engine'
import { DataManager } from './data-manager'
import { StateManager } from './state-manager'
import type {
  FormConfig,
  FormState,
  FormInstance,
  FieldConfig,
  ValidationResult,
  FormEventCallbacks
} from '../types'

/**
 * 表单核心引擎类
 * 
 * 这是整个表单系统的核心，负责协调各个子系统的工作
 * 完全独立于UI框架，可以在任何JavaScript环境中使用
 * 
 * @template T 表单数据类型
 */
export class FormCore<T = Record<string, any>> extends EventEmitter implements FormInstance<T> {
  /** 表单唯一标识 */
  public readonly id: string

  /** 表单配置 */
  public readonly config: FormConfig<T>

  /** 字段管理器 */
  public readonly fieldManager: FieldManager

  /** 验证引擎 */
  public readonly validationEngine: ValidationEngine

  /** 数据管理器 */
  public readonly dataManager: DataManager<T>

  /** 状态管理器 */
  public readonly stateManager: StateManager<T>

  /** 事件回调 */
  private eventCallbacks: FormEventCallbacks<T>

  /** 是否已销毁 */
  private destroyed = false

  /**
   * 构造函数
   * 
   * @param config 表单配置
   * @param callbacks 事件回调
   */
  constructor(config: FormConfig<T>, callbacks: FormEventCallbacks<T> = {}) {
    super()

    this.id = config.id || this.generateId()
    this.config = { ...config }
    this.eventCallbacks = callbacks

    // 初始化子系统
    this.dataManager = new DataManager(config.initialValues || {} as T)
    this.stateManager = new StateManager()
    this.validationEngine = new ValidationEngine(config.validationConfig)
    this.fieldManager = new FieldManager(this.validationEngine)

    // 设置事件监听
    this.setupEventListeners()

    // 初始化字段
    if (config.fields) {
      this.initializeFields(config.fields)
    }

    this.emit('form:created', { id: this.id, config })
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听数据变化
    this.dataManager.on('data:change', (data) => {
      this.stateManager.updateState({ values: data })
      this.emit('values:change', data)
      this.eventCallbacks.onValuesChange?.(data, data)
    })

    // 监听字段变化
    this.dataManager.on('field:change', ({ name, value, oldValue }) => {
      this.emit('field:change', { name, value, oldValue })
      this.eventCallbacks.onFieldChange?.(name, value, this.dataManager.getData())

      // 如果启用了变化时验证，则触发验证
      if (this.config.validateOnChange !== false) {
        this.validateField(name)
      }
    })

    // 监听验证结果
    this.validationEngine.on('validation:complete', (result) => {
      this.handleValidationResult(result)
    })

    // 监听状态变化
    this.stateManager.on('state:change', (state) => {
      this.emit('state:change', state)
    })
  }

  /**
   * 初始化字段
   */
  private initializeFields(fields: FieldConfig[]): void {
    fields.forEach(fieldConfig => {
      this.fieldManager.registerField(fieldConfig)

      // 设置初始值
      if (fieldConfig.defaultValue !== undefined) {
        this.dataManager.setFieldValue(fieldConfig.name, fieldConfig.defaultValue)
      }
    })
  }

  /**
   * 处理验证结果
   */
  private handleValidationResult(result: ValidationResult): void {
    if (result.field) {
      // 单字段验证结果
      this.stateManager.setFieldError(result.field, result.errors)
      this.fieldManager.updateFieldState(result.field, {
        validating: false,
        valid: result.valid,
        errors: result.errors
      })
    } else {
      // 表单整体验证结果
      this.stateManager.updateState({
        validating: false,
        valid: result.valid,
        errors: result.fieldErrors || {}
      })
    }
  }

  // === 公共API方法 ===

  /**
   * 获取表单状态
   */
  getState(): FormState<T> {
    return this.stateManager.getState()
  }

  /**
   * 获取表单数据
   */
  getData(): T {
    return this.dataManager.getData()
  }

  /**
   * 设置表单数据
   */
  setData(data: Partial<T>): void {
    this.checkDestroyed()
    this.dataManager.setData(data)
  }

  /**
   * 获取字段值
   */
  getFieldValue(name: string): any {
    return this.dataManager.getFieldValue(name)
  }

  /**
   * 设置字段值
   */
  setFieldValue(name: string, value: any): void {
    this.checkDestroyed()
    this.dataManager.setFieldValue(name, value)
  }

  /**
   * 验证整个表单
   */
  async validate(): Promise<ValidationResult> {
    this.checkDestroyed()
    this.stateManager.updateState({ validating: true })

    try {
      const result = await this.validationEngine.validateForm(
        this.dataManager.getData(),
        this.fieldManager.getAllValidationRules()
      )

      this.handleValidationResult(result)
      return result
    } catch (error) {
      this.stateManager.updateState({ validating: false })
      throw error
    }
  }

  /**
   * 验证单个字段
   */
  async validateField(name: string): Promise<ValidationResult> {
    this.checkDestroyed()

    const field = this.fieldManager.getField(name)
    if (!field) {
      throw new Error(`Field "${name}" not found`)
    }

    this.fieldManager.updateFieldState(name, { validating: true })

    try {
      const value = this.dataManager.getFieldValue(name)
      const rules = this.fieldManager.getFieldValidationRules(name)

      const result = await this.validationEngine.validateField(
        name,
        value,
        rules,
        this.dataManager.getData()
      )

      this.handleValidationResult(result)
      return result
    } catch (error) {
      this.fieldManager.updateFieldState(name, { validating: false })
      throw error
    }
  }

  /**
   * 重置表单
   */
  reset(): void {
    this.checkDestroyed()

    // 重置数据
    this.dataManager.reset()

    // 重置状态
    this.stateManager.reset()

    // 重置字段
    this.fieldManager.resetAllFields()

    this.emit('form:reset', { id: this.id })
    this.eventCallbacks.onReset?.(this.dataManager.getData())
  }

  /**
   * 重置单个字段
   *
   * @param fieldName 字段名称
   */
  resetField(fieldName: string): void {
    this.checkDestroyed()

    // 重置字段数据
    const initialValue = this.config.initialValues?.[fieldName as keyof typeof this.config.initialValues]
    this.dataManager.setFieldValue(fieldName, initialValue)

    // 重置字段状态
    this.stateManager.setFieldState(fieldName, {
      value: initialValue,
      error: null,
      touched: false,
      dirty: false,
      validating: false
    })

    // 重置字段管理器中的字段
    this.fieldManager.resetField(fieldName)

    this.emit('field:reset', { fieldName, value: initialValue })
  }

  /**
   * 清除表单验证错误
   */
  clearErrors(): void {
    this.checkDestroyed()

    // 清除状态中的错误
    this.stateManager.updateState({
      errors: {},
      valid: true
    })

    // 清除所有字段错误
    const fieldNames = this.fieldManager.getFieldNames()
    fieldNames.forEach(fieldName => {
      this.stateManager.setFieldState(fieldName, {
        error: null
      })
    })

    this.emit('form:errors:cleared')
  }

  /**
   * 清除单个字段的验证错误
   *
   * @param fieldName 字段名称
   */
  clearFieldError(fieldName: string): void {
    this.checkDestroyed()

    this.stateManager.setFieldState(fieldName, {
      error: null
    })

    // 更新表单整体状态
    const formState = this.stateManager.getState()
    const hasErrors = Object.values(formState.errors).some(error => error && error.length > 0)

    if (!hasErrors) {
      this.stateManager.updateState({ valid: true })
    }

    this.emit('field:error:cleared', { fieldName })
  }

  /**
   * 批量验证多个字段
   *
   * @param fieldNames 字段名称数组，如果不提供则验证所有字段
   * @returns 验证结果
   */
  async validateFields(fieldNames?: string[]): Promise<ValidationResult> {
    this.checkDestroyed()

    const fieldsToValidate = fieldNames || this.fieldManager.getFieldNames()
    const validationPromises = fieldsToValidate.map(fieldName =>
      this.validateField(fieldName)
    )

    const results = await Promise.all(validationPromises)

    // 合并验证结果
    const combinedResult: ValidationResult = {
      valid: results.every(result => result.valid),
      errors: results.flatMap(result => result.errors),
      fieldErrors: {}
    }

    // 合并字段错误
    results.forEach(result => {
      if (result.fieldErrors) {
        Object.assign(combinedResult.fieldErrors, result.fieldErrors)
      }
    })

    this.emit('form:fields:validated', {
      fieldNames: fieldsToValidate,
      result: combinedResult
    })

    return combinedResult
  }

  /**
   * 检查表单是否有效
   *
   * @returns 是否有效
   */
  isValid(): boolean {
    this.checkDestroyed()
    return this.stateManager.isValid()
  }

  /**
   * 检查表单是否已修改
   *
   * @returns 是否已修改
   */
  isDirty(): boolean {
    this.checkDestroyed()
    return this.stateManager.isDirty()
  }

  /**
   * 检查表单是否已触摸
   *
   * @returns 是否已触摸
   */
  isTouched(): boolean {
    this.checkDestroyed()
    return this.stateManager.isTouched()
  }

  /**
   * 标记字段为已触摸
   *
   * @param fieldName 字段名称
   */
  touchField(fieldName: string): void {
    this.checkDestroyed()

    this.stateManager.setFieldState(fieldName, {
      touched: true
    })

    this.emit('field:touched', { fieldName })
  }

  /**
   * 标记字段为已修改
   *
   * @param fieldName 字段名称
   */
  markFieldDirty(fieldName: string): void {
    this.checkDestroyed()

    this.stateManager.setFieldState(fieldName, {
      dirty: true
    })

    this.emit('field:dirty', { fieldName })
  }

  /**
   * 提交表单
   */
  async submit(): Promise<void> {
    this.checkDestroyed()

    this.stateManager.updateState({ submitting: true })

    try {
      // 先验证表单
      const validationResult = await this.validate()

      if (!validationResult.valid) {
        this.eventCallbacks.onSubmitFailed?.(
          validationResult.errors || {},
          this.dataManager.getData()
        )
        return
      }

      // 执行提交回调
      await this.eventCallbacks.onSubmit?.(this.dataManager.getData())

      this.emit('form:submit', this.dataManager.getData())
    } catch (error) {
      this.emit('form:submit:error', error)
      throw error
    } finally {
      this.stateManager.updateState({ submitting: false })
    }
  }

  /**
   * 销毁表单实例
   */
  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true

    // 清理子系统
    this.fieldManager.destroy()
    this.validationEngine.destroy()
    this.dataManager.destroy()
    this.stateManager.destroy()

    // 直接清理监听器映射，避免调用checkDestroyed
    this.listeners.clear()
  }

  /**
   * 检查是否已销毁
   */
  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error('Form instance has been destroyed')
    }
  }
}
