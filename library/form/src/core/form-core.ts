/**
 * @ldesign/form - Form Core Engine
 * 表单核心引擎
 */

import type {
  FormConfig,
  FormOptions,
  FormValues,
  FormState,
  FieldState,
  FormValidationResult
} from '../utils/types'
import { EventEmitter } from './event-emitter'
import { DataManager, type DataChangeEvent } from './data-manager'
import { StateManager, type StateChangeEvent } from './state-manager'
import { ValidationEngine } from './validation'
import { LayoutEngine, type LayoutEngineConfig } from './layout'
import { FieldManager } from './field-manager'
import { deepMerge, deepClone } from '../utils/helpers'
import { DEFAULT_FORM_CONFIG } from '../utils/constants'

/**
 * 表单事件映射
 */
export interface FormEventMap {
  /** 数据变更事件 */
  'data:change': DataChangeEvent
  /** 状态变更事件 */
  'state:change': StateChangeEvent
  /** 字段值变更事件 */
  'field:change': { field: string; value: any; values: FormValues }
  /** 字段触摸事件 */
  'field:blur': { field: string }
  /** 字段聚焦事件 */
  'field:focus': { field: string }
  /** 验证开始事件 */
  'validate:start': { fields?: string[] }
  /** 验证完成事件 */
  'validate:end': FormValidationResult
  /** 提交开始事件 */
  'submit:start': FormValues
  /** 提交成功事件 */
  'submit:success': FormValues
  /** 提交失败事件 */
  'submit:error': { error: Error; values: FormValues }
  /** 重置事件 */
  'reset': FormValues
  /** 展开收起事件 */
  'expand:change': { expanded: boolean }
}

/**
 * 表单核心引擎类
 */
export class FormCore {
  private options: Required<Omit<FormOptions, 'onSubmit' | 'onReset' | 'onChange' | 'onValidateFailed' | 'onExpandChange'>> & {
    onSubmit?: (values: FormValues) => void | Promise<void>
    onReset?: () => void
    onChange?: (field: string, value: any, values: FormValues) => void
    onValidateFailed?: (errors: Record<string, string[]>) => void
    onExpandChange?: (expanded: boolean) => void
  }

  private events: EventEmitter<FormEventMap>
  private dataManager: DataManager
  private stateManager: StateManager
  private validationEngine: ValidationEngine
  private layoutEngine: LayoutEngine
  private fieldManager: FieldManager
  private expanded: boolean

  constructor(options: FormOptions = {}) {
    // 合并默认配置
    this.options = deepMerge({ ...DEFAULT_FORM_CONFIG }, options as any) as any

    // 初始化各个子系统
    this.events = new EventEmitter<FormEventMap>()
    this.dataManager = new DataManager({
      initialValues: this.options.initialValues,
      enableSnapshot: true
    })
    this.stateManager = new StateManager()
    this.validationEngine = new ValidationEngine({
      enableCache: true
    })
    this.layoutEngine = new LayoutEngine({
      ...this.options.layout,
      fields: this.options.fields
    } as LayoutEngineConfig)
    this.fieldManager = new FieldManager()
    this.expanded = !this.options.expand?.defaultExpanded

    // 初始化字段
    if (this.options.fields) {
      this.initializeFields()
    }

    // 设置事件监听
    this.setupEventListeners()
  }

  /**
   * 初始化字段
   */
  private initializeFields(): void {
    this.options.fields?.forEach(field => {
      // 注册字段
      this.fieldManager.registerField(field)

      // 注册字段状态
      const initialValue = field.defaultValue ?? this.dataManager.getValue(field.name)
      this.stateManager.registerField(field.name, initialValue)

      // 注册验证规则
      if (field.rules && field.rules.length > 0) {
        this.validationEngine.addRules(field.name, field.rules)
      }
    })
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听数据变更
    this.dataManager.subscribe(event => {
      this.events.emitSync('data:change', event)

      // 触发字段变更事件
      if (event.path) {
        this.events.emitSync('field:change', {
          field: event.path,
          value: event.value,
          values: event.values
        })

        // 更新字段状态
        this.stateManager.setFieldValue(event.path, event.value)

        // 如果启用了值变化时验证
        if (this.options.validateOnChange) {
          this.validateField(event.path, 'change')
        }

        // 调用 onChange 回调
        if (this.options.onChange) {
          this.options.onChange(event.path, event.value, event.values)
        }
      }
    })

    // 监听状态变更
    this.stateManager.subscribe(event => {
      this.events.emitSync('state:change', event)
    })
  }

  /**
   * 获取字段值
   * @param field 字段名
   */
  getFieldValue<T = any>(field: string): T {
    return this.dataManager.getValue(field)
  }

  /**
   * 设置字段值
   * @param field 字段名
   * @param value 字段值
   */
  setFieldValue(field: string, value: any): void {
    this.dataManager.setValue(field, value)
  }

  /**
   * 批量设置字段值
   * @param values 字段值对象
   */
  setFieldsValue(values: FormValues): void {
    this.dataManager.setValues(values)
  }

  /**
   * 获取所有字段值
   */
  getFieldsValue(): FormValues {
    return this.dataManager.getValues()
  }

  /**
   * 获取字段状态
   * @param field 字段名
   */
  getFieldState(field: string): FieldState | undefined {
    return this.stateManager.getFieldState(field)
  }

  /**
   * 获取表单状态
   */
  getFormState(): FormState {
    return this.stateManager.getFormState()
  }

  /**
   * 验证单个字段
   * @param field 字段名
   * @param trigger 触发方式
   */
  async validateField(field: string, trigger?: 'change' | 'blur' | 'submit'): Promise<boolean> {
    const value = this.dataManager.getValue(field)
    const values = this.dataManager.getValues()

    this.stateManager.setFieldValidating(field, true)

    const result = await this.validationEngine.validateField(
      field,
      value,
      values,
      trigger
    )

    this.stateManager.setFieldValidationResult(
      field,
      result.valid,
      result.errors
    )

    return result.valid
  }

  /**
   * 验证所有字段
   */
  async validate(): Promise<FormValidationResult> {
    const values = this.dataManager.getValues()

    this.stateManager.updateFormState({ validating: true })
    this.events.emitSync('validate:start', {})

    const result = await this.validationEngine.validateAll(values, 'submit')

    // 更新各字段验证状态
    Object.keys(result.fields).forEach(field => {
      const fieldResult = result.fields[field]
      this.stateManager.setFieldValidationResult(
        field,
        fieldResult.valid,
        fieldResult.errors
      )
    })

    this.stateManager.updateFormState({ validating: false })
    this.events.emitSync('validate:end', result)

    if (!result.valid && this.options.onValidateFailed) {
      this.options.onValidateFailed(result.errors)
    }

    return result
  }

  /**
   * 字段触摸（失焦）
   * @param field 字段名
   */
  async handleFieldBlur(field: string): Promise<void> {
    this.stateManager.setFieldTouched(field, true)
    this.events.emitSync('field:blur', { field })

    if (this.options.validateOnBlur) {
      await this.validateField(field, 'blur')
    }
  }

  /**
   * 字段聚焦
   * @param field 字段名
   */
  handleFieldFocus(field: string): void {
    this.events.emitSync('field:focus', { field })
  }

  /**
   * 提交表单
   */
  async submit(): Promise<void> {
    const values = this.dataManager.getValues()

    // 验证表单
    if (this.options.validateOnSubmit) {
      const result = await this.validate()
      if (!result.valid) {
        return
      }
    }

    this.stateManager.updateFormState({ submitting: true })
    this.events.emitSync('submit:start', values)

    try {
      if (this.options.onSubmit) {
        await this.options.onSubmit(values)
      }

      this.events.emitSync('submit:success', values)
    } catch (error) {
      this.events.emitSync('submit:error', {
        error: error as Error,
        values
      })
      throw error
    } finally {
      this.stateManager.updateFormState({ submitting: false })
    }
  }

  /**
   * 重置表单
   */
  reset(): void {
    this.dataManager.reset()
    this.stateManager.resetAllFieldStates()
    this.validationEngine.clearCache()

    const values = this.dataManager.getValues()
    this.events.emitSync('reset', values)

    if (this.options.onReset) {
      this.options.onReset()
    }
  }

  /**
   * 切换展开/收起状态
   */
  toggleExpand(): void {
    this.expanded = !this.expanded
    this.events.emitSync('expand:change', { expanded: this.expanded })

    if (this.options.onExpandChange) {
      this.options.onExpandChange(this.expanded)
    }
  }

  /**
   * 获取展开状态
   */
  isExpanded(): boolean {
    return this.expanded
  }

  /**
   * 设置展开状态
   * @param expanded 是否展开
   */
  setExpanded(expanded: boolean): void {
    if (this.expanded !== expanded) {
      this.toggleExpand()
    }
  }

  /**
   * 监听事件
   * @param event 事件名
   * @param listener 监听器
   */
  on<K extends keyof FormEventMap>(
    event: K,
    listener: (data: FormEventMap[K]) => void
  ): () => void {
    return this.events.on(event, listener)
  }

  /**
   * 监听一次性事件
   * @param event 事件名
   * @param listener 监听器
   */
  once<K extends keyof FormEventMap>(
    event: K,
    listener: (data: FormEventMap[K]) => void
  ): () => void {
    return this.events.once(event, listener)
  }

  /**
   * 移除事件监听
   * @param event 事件名
   * @param listener 监听器
   */
  off<K extends keyof FormEventMap>(
    event: K,
    listener?: (data: FormEventMap[K]) => void
  ): void {
    this.events.off(event, listener as any)
  }

  /**
   * 获取布局引擎
   */
  getLayoutEngine(): LayoutEngine {
    return this.layoutEngine
  }

  /**
   * 获取字段管理器
   */
  getFieldManager(): FieldManager {
    return this.fieldManager
  }

  /**
   * 销毁表单实例
   */
  destroy(): void {
    this.events.destroy()
    this.dataManager.destroy()
    this.stateManager.destroy()
    this.validationEngine.destroy()
    this.layoutEngine.destroy()
    this.fieldManager.destroy()
  }
}

/**
 * 创建表单实例
 */
export function createForm(options?: FormOptions): FormCore {
  return new FormCore(options)
}




