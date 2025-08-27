/**
 * 状态管理器实现
 * 
 * 负责表单数据的存储、更新、监听和持久化
 */

import type {
  FormConfig,
  FormFieldItem,
  FormFieldConfig,
  AnyObject,
  ConditionalFunction
} from '../types'
import type { EventBus } from '../types'

/**
 * 字段状态信息
 */
interface FieldState {
  value: any
  originalValue: any
  isDirty: boolean
  isTouched: boolean
  isFocused: boolean
  isVisible: boolean
  isDisabled: boolean
  isRequired: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 状态变化监听器
 */
type StateChangeListener = (path: string, newValue: any, oldValue: any) => void

/**
 * 状态管理器类
 */
export class StateManager {
  // 表单数据
  private formData: AnyObject = {}

  // 字段状态
  private fieldStates = new Map<string, FieldState>()

  // 字段配置映射
  private fieldConfigs = new Map<string, FormFieldConfig>()

  // 字段路径映射
  private fieldPaths = new Set<string>()

  // 状态变化监听器
  private listeners = new Map<string, Set<StateChangeListener>>()

  // 全局监听器
  private globalListeners = new Set<StateChangeListener>()

  // 默认值
  private defaultValues: AnyObject = {}

  // 事件总线
  private eventBus: EventBus

  // 内部状态
  private initialized = false
  private destroyed = false

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  /**
   * 初始化状态管理器
   */
  public initialize(config: FormConfig): void {
    if (this.initialized) {
      return
    }

    this.initialized = true

    // 解析字段配置
    this.parseFieldConfigs(config.fields)

    // 初始化字段状态
    this.initializeFieldStates()

    // 设置默认值
    this.setDefaultValues()
  }

  /**
   * 解析字段配置
   */
  private parseFieldConfigs(fields: FormFieldItem[], parentPath = ''): void {
    for (const field of fields) {
      if (field.type === 'group' && 'fields' in field) {
        // 递归处理分组字段
        this.parseFieldConfigs(field.fields, parentPath)
      } else if (field.type !== 'actions' && 'name' in field) {
        // 处理普通字段
        const fieldConfig = field as FormFieldConfig
        const fieldPath = parentPath ? `${parentPath}.${fieldConfig.name}` : fieldConfig.name

        this.fieldConfigs.set(fieldPath, fieldConfig)
        this.fieldPaths.add(fieldPath)

        // 保存默认值
        if (fieldConfig.defaultValue !== undefined) {
          this.setNestedValue(this.defaultValues, fieldPath, fieldConfig.defaultValue)
        }
      }
    }
  }

  /**
   * 初始化字段状态
   */
  private initializeFieldStates(): void {
    for (const fieldPath of this.fieldPaths) {
      const fieldConfig = this.fieldConfigs.get(fieldPath)
      if (!fieldConfig) continue

      const initialState: FieldState = {
        value: this.getNestedValue(this.defaultValues, fieldPath),
        originalValue: this.getNestedValue(this.defaultValues, fieldPath),
        isDirty: false,
        isTouched: false,
        isFocused: false,
        isVisible: this.evaluateCondition(fieldConfig.conditionalRender?.show, true),
        isDisabled: this.evaluateCondition(fieldConfig.disabled, false),
        isRequired: this.evaluateCondition(fieldConfig.required, false),
        errors: [],
        warnings: []
      }

      this.fieldStates.set(fieldPath, initialState)
    }
  }

  /**
   * 设置默认值
   */
  private setDefaultValues(): void {
    this.formData = { ...this.defaultValues }
  }

  /**
   * 评估条件函数
   */
  private evaluateCondition(
    condition: boolean | ConditionalFunction | undefined,
    defaultValue: boolean
  ): boolean {
    if (condition === undefined) {
      return defaultValue
    }

    if (typeof condition === 'boolean') {
      return condition
    }

    if (typeof condition === 'function') {
      try {
        return condition(this.formData)
      } catch (error) {
        console.error('Condition evaluation error:', error)
        return defaultValue
      }
    }

    return defaultValue
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: AnyObject, path: string): any {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current == null || typeof current !== 'object') {
        return undefined
      }
      current = current[key]
    }

    return current
  }

  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: AnyObject, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * 删除嵌套值
   */
  private deleteNestedValue(obj: AnyObject, path: string): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        return
      }
      current = current[key]
    }

    delete current[keys[keys.length - 1]]
  }

  /**
   * 触发状态变化事件
   */
  private emitStateChange(path: string, newValue: any, oldValue: any): void {
    // 触发字段特定的监听器
    const pathListeners = this.listeners.get(path)
    if (pathListeners) {
      for (const listener of pathListeners) {
        try {
          listener(path, newValue, oldValue)
        } catch (error) {
          console.error('State change listener error:', error)
        }
      }
    }

    // 触发全局监听器
    for (const listener of this.globalListeners) {
      try {
        listener(path, newValue, oldValue)
      } catch (error) {
        console.error('Global state change listener error:', error)
      }
    }

    // 触发事件总线事件
    this.eventBus.emit('field:change', {
      type: 'field:change',
      timestamp: Date.now(),
      id: `change_${Date.now()}`,
      field: this.fieldConfigs.get(path),
      value: newValue,
      oldValue,
      formData: this.formData
    })
  }

  /**
   * 更新字段状态
   */
  private updateFieldState(path: string, updates: Partial<FieldState>): void {
    const currentState = this.fieldStates.get(path)
    if (!currentState) {
      return
    }

    const newState = { ...currentState, ...updates }
    this.fieldStates.set(path, newState)

    // 触发字段状态变化事件
    this.eventBus.emit('field:updated', {
      type: 'field:updated',
      timestamp: Date.now(),
      id: `update_${Date.now()}`,
      field: this.fieldConfigs.get(path),
      oldState: currentState,
      newState,
      changes: updates
    })
  }

  /**
   * 设置字段值
   */
  public setValue(path: string, value: any): void {
    if (this.destroyed) {
      return
    }

    const oldValue = this.getNestedValue(this.formData, path)

    if (oldValue === value) {
      return
    }

    // 更新表单数据
    this.setNestedValue(this.formData, path, value)

    // 更新字段状态
    const fieldState = this.fieldStates.get(path)
    if (fieldState) {
      const isDirty = value !== fieldState.originalValue
      this.updateFieldState(path, {
        value,
        isDirty,
        isTouched: true
      })
    }

    // 触发变化事件
    this.emitStateChange(path, value, oldValue)

    // 重新评估条件渲染
    this.reevaluateConditions()
  }

  /**
   * 获取字段值
   */
  public getValue(path: string): any {
    return this.getNestedValue(this.formData, path)
  }

  /**
   * 设置表单数据
   */
  public setFormData(data: AnyObject): void {
    if (this.destroyed) {
      return
    }

    const oldData = { ...this.formData }
    this.formData = { ...data }

    // 更新所有字段状态
    for (const fieldPath of this.fieldPaths) {
      const newValue = this.getNestedValue(this.formData, fieldPath)
      const oldValue = this.getNestedValue(oldData, fieldPath)

      if (newValue !== oldValue) {
        const fieldState = this.fieldStates.get(fieldPath)
        if (fieldState) {
          const isDirty = newValue !== fieldState.originalValue
          this.updateFieldState(fieldPath, {
            value: newValue,
            isDirty
          })
        }

        this.emitStateChange(fieldPath, newValue, oldValue)
      }
    }

    // 重新评估条件渲染
    this.reevaluateConditions()
  }

  /**
   * 获取表单数据
   */
  public getFormData(): AnyObject {
    return { ...this.formData }
  }

  /**
   * 重新评估条件渲染
   */
  private reevaluateConditions(): void {
    for (const fieldPath of this.fieldPaths) {
      const fieldConfig = this.fieldConfigs.get(fieldPath)
      const fieldState = this.fieldStates.get(fieldPath)

      if (!fieldConfig || !fieldState) {
        continue
      }

      const conditionalRender = fieldConfig.conditionalRender
      if (!conditionalRender) {
        continue
      }

      // 评估显示条件
      if (conditionalRender.show !== undefined) {
        const isVisible = this.evaluateCondition(conditionalRender.show, true)
        if (fieldState.isVisible !== isVisible) {
          this.updateFieldState(fieldPath, { isVisible })
        }
      }

      // 评估禁用条件
      if (conditionalRender.disabled !== undefined) {
        const isDisabled = this.evaluateCondition(conditionalRender.disabled, false)
        if (fieldState.isDisabled !== isDisabled) {
          this.updateFieldState(fieldPath, { isDisabled })
        }
      }

      // 评估必填条件
      if (conditionalRender.required !== undefined) {
        const isRequired = this.evaluateCondition(conditionalRender.required, false)
        if (fieldState.isRequired !== isRequired) {
          this.updateFieldState(fieldPath, { isRequired })
        }
      }
    }
  }

  /**
   * 设置字段状态
   */
  public setFieldState(path: string, updates: Partial<FieldState>): void {
    this.updateFieldState(path, updates)
  }

  /**
   * 获取字段状态
   */
  public getFieldState(path: string): FieldState | undefined {
    return this.fieldStates.get(path)
  }

  /**
   * 监听状态变化
   */
  public watch(path: string, listener: StateChangeListener): () => void {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set())
    }

    this.listeners.get(path)!.add(listener)

    // 返回取消监听的函数
    return () => {
      const pathListeners = this.listeners.get(path)
      if (pathListeners) {
        pathListeners.delete(listener)
        if (pathListeners.size === 0) {
          this.listeners.delete(path)
        }
      }
    }
  }

  /**
   * 监听所有状态变化
   */
  public watchAll(listener: StateChangeListener): () => void {
    this.globalListeners.add(listener)

    return () => {
      this.globalListeners.delete(listener)
    }
  }

  /**
   * 重置表单
   */
  public reset(): void {
    if (this.destroyed) {
      return
    }

    // 重置表单数据
    this.formData = { ...this.defaultValues }

    // 重置字段状态
    for (const [fieldPath, fieldState] of this.fieldStates) {
      const originalValue = this.getNestedValue(this.defaultValues, fieldPath)
      this.updateFieldState(fieldPath, {
        value: originalValue,
        originalValue,
        isDirty: false,
        isTouched: false,
        isFocused: false,
        errors: [],
        warnings: []
      })
    }

    // 重新评估条件渲染
    this.reevaluateConditions()

    // 触发重置事件
    this.eventBus.emit('form:reset', {
      type: 'form:reset',
      timestamp: Date.now(),
      id: `reset_${Date.now()}`,
      formData: this.formData
    })
  }

  /**
   * 清空表单
   */
  public clear(): void {
    if (this.destroyed) {
      return
    }

    // 清空表单数据
    this.formData = {}

    // 清空字段状态
    for (const [fieldPath, fieldState] of this.fieldStates) {
      this.updateFieldState(fieldPath, {
        value: undefined,
        isDirty: fieldState.originalValue !== undefined,
        isTouched: true,
        errors: [],
        warnings: []
      })
    }

    // 重新评估条件渲染
    this.reevaluateConditions()
  }

  /**
   * 获取脏字段
   */
  public getDirtyFields(): string[] {
    const dirtyFields: string[] = []

    for (const [fieldPath, fieldState] of this.fieldStates) {
      if (fieldState.isDirty) {
        dirtyFields.push(fieldPath)
      }
    }

    return dirtyFields
  }

  /**
   * 获取已触摸字段
   */
  public getTouchedFields(): string[] {
    const touchedFields: string[] = []

    for (const [fieldPath, fieldState] of this.fieldStates) {
      if (fieldState.isTouched) {
        touchedFields.push(fieldPath)
      }
    }

    return touchedFields
  }

  /**
   * 获取可见字段
   */
  public getVisibleFields(): string[] {
    const visibleFields: string[] = []

    for (const [fieldPath, fieldState] of this.fieldStates) {
      if (fieldState.isVisible) {
        visibleFields.push(fieldPath)
      }
    }

    return visibleFields
  }

  /**
   * 获取调试信息
   */
  public getDebugInfo(): AnyObject {
    return {
      initialized: this.initialized,
      destroyed: this.destroyed,
      fieldCount: this.fieldPaths.size,
      formData: this.formData,
      fieldStates: Object.fromEntries(this.fieldStates),
      defaultValues: this.defaultValues,
      listenerCount: this.listeners.size + this.globalListeners.size
    }
  }

  /**
   * 销毁状态管理器
   */
  public destroy(): void {
    if (this.destroyed) {
      return
    }

    this.destroyed = true

    // 清理所有数据
    this.formData = {}
    this.fieldStates.clear()
    this.fieldConfigs.clear()
    this.fieldPaths.clear()
    this.listeners.clear()
    this.globalListeners.clear()
    this.defaultValues = {}
  }
}
