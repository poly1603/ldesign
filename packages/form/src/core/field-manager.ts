/**
 * 字段管理器
 * 
 * 负责表单字段的管理，包括：
 * - 字段注册和注销
 * - 字段状态管理
 * - 字段依赖关系
 * - 字段联动逻辑
 * - 字段验证规则管理
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { EventEmitter } from '../utils/event-emitter'
import { deepClone } from '../utils/helpers'
import type { ValidationEngine } from './validation-engine'
import type {
  FieldConfig,
  FieldState,
  ValidationRule,
  FieldInstance
} from '../types'

/**
 * 字段信息
 */
interface FieldInfo {
  /** 字段配置 */
  config: FieldConfig
  /** 字段状态 */
  state: FieldState
  /** 依赖的字段 */
  dependencies: Set<string>
  /** 依赖此字段的字段 */
  dependents: Set<string>
}

/**
 * 字段管理器类
 * 
 * 提供完整的字段管理功能，支持：
 * - 字段注册和配置
 * - 字段状态管理
 * - 字段依赖关系
 * - 字段联动
 * 
 */
export class FieldManager extends EventEmitter {
  /** 字段信息映射 */
  private fields: Map<string, FieldInfo> = new Map()

  /** 验证引擎 */
  private validationEngine: ValidationEngine

  /** 是否已销毁 */
  private destroyed = false

  /**
   * 构造函数
   * 
   * @param validationEngine 验证引擎实例
   */
  constructor(validationEngine: ValidationEngine) {
    super()
    this.validationEngine = validationEngine
  }

  /**
   * 注册字段
   * 
   * @param config 字段配置
   */
  registerField(config: FieldConfig): void {
    this.checkDestroyed()

    const fieldInfo: FieldInfo = {
      config: deepClone(config),
      state: this.createInitialFieldState(config),
      dependencies: new Set(config.dependencies || []),
      dependents: new Set()
    }

    // 如果字段已存在，先注销
    if (this.fields.has(config.name)) {
      this.unregisterField(config.name)
    }

    this.fields.set(config.name, fieldInfo)

    // 建立依赖关系
    this.setupDependencies(config.name, fieldInfo.dependencies)

    this.emit('field:registered', { name: config.name, config })
  }

  /**
   * 注销字段
   * 
   * @param fieldName 字段名称
   */
  unregisterField(fieldName: string): void {
    this.checkDestroyed()

    const fieldInfo = this.fields.get(fieldName)
    if (!fieldInfo) return

    // 清理依赖关系
    this.cleanupDependencies(fieldName, fieldInfo.dependencies)

    // 移除字段
    this.fields.delete(fieldName)

    this.emit('field:unregistered', { name: fieldName })
  }

  /**
   * 获取字段配置
   * 
   * @param fieldName 字段名称
   * @returns 字段配置
   */
  getFieldConfig(fieldName: string): FieldConfig | undefined {
    const fieldInfo = this.fields.get(fieldName)
    return fieldInfo ? deepClone(fieldInfo.config) : undefined
  }

  /**
   * 获取字段状态
   * 
   * @param fieldName 字段名称
   * @returns 字段状态
   */
  getFieldState(fieldName: string): FieldState | undefined {
    const fieldInfo = this.fields.get(fieldName)
    return fieldInfo ? deepClone(fieldInfo.state) : undefined
  }

  /**
   * 更新字段状态
   * 
   * @param fieldName 字段名称
   * @param updates 状态更新
   */
  updateFieldState(fieldName: string, updates: Partial<FieldState>): void {
    this.checkDestroyed()

    const fieldInfo = this.fields.get(fieldName)
    if (!fieldInfo) return

    const oldState = deepClone(fieldInfo.state)
    fieldInfo.state = { ...fieldInfo.state, ...updates }

    this.emit('field:state:change', {
      name: fieldName,
      state: deepClone(fieldInfo.state),
      oldState
    })

    // 触发依赖字段的更新
    this.triggerDependentFields(fieldName)
  }

  /**
   * 获取字段验证规则
   * 
   * @param fieldName 字段名称
   * @returns 验证规则数组
   */
  getFieldValidationRules(fieldName: string): ValidationRule[] {
    const fieldInfo = this.fields.get(fieldName)
    return fieldInfo ? deepClone(fieldInfo.config.rules || []) : []
  }

  /**
   * 获取所有字段的验证规则
   * 
   * @returns 字段验证规则映射
   */
  getAllValidationRules(): Record<string, ValidationRule[]> {
    const rules: Record<string, ValidationRule[]> = {}

    for (const [fieldName, fieldInfo] of this.fields) {
      if (fieldInfo.config.rules && fieldInfo.config.rules.length > 0) {
        rules[fieldName] = deepClone(fieldInfo.config.rules)
      }
    }

    return rules
  }

  /**
   * 获取字段实例
   * 
   * @param fieldName 字段名称
   * @returns 字段实例
   */
  getField(fieldName: string): FieldInstance | undefined {
    const fieldInfo = this.fields.get(fieldName)
    if (!fieldInfo) return undefined

    return {
      name: fieldName,
      config: deepClone(fieldInfo.config),
      state: deepClone(fieldInfo.state),
      updateState: (updates: Partial<FieldState>) => {
        this.updateFieldState(fieldName, updates)
      },
      validate: async () => {
        // 这里需要与表单核心协调进行验证
        // 暂时返回当前状态的有效性
        return fieldInfo.state.valid
      }
    }
  }

  /**
   * 获取所有字段名称
   * 
   * @returns 字段名称数组
   */
  getFieldNames(): string[] {
    return Array.from(this.fields.keys())
  }

  /**
   * 检查字段是否存在
   * 
   * @param fieldName 字段名称
   * @returns 是否存在
   */
  hasField(fieldName: string): boolean {
    return this.fields.has(fieldName)
  }

  /**
   * 重置所有字段
   */
  resetAllFields(): void {
    this.checkDestroyed()

    for (const [fieldName, fieldInfo] of this.fields) {
      fieldInfo.state = this.createInitialFieldState(fieldInfo.config)

      this.emit('field:reset', { name: fieldName })
    }
  }

  /**
   * 重置指定字段
   * 
   * @param fieldName 字段名称
   */
  resetField(fieldName: string): void {
    this.checkDestroyed()

    const fieldInfo = this.fields.get(fieldName)
    if (!fieldInfo) return

    fieldInfo.state = this.createInitialFieldState(fieldInfo.config)

    this.emit('field:reset', { name: fieldName })
  }

  /**
   * 创建初始字段状态
   */
  private createInitialFieldState(config: FieldConfig): FieldState {
    return {
      value: config.defaultValue,
      error: undefined,
      errors: [],
      touched: false,
      dirty: false,
      validating: false,
      valid: true
    }
  }

  /**
   * 设置依赖关系
   */
  private setupDependencies(fieldName: string, dependencies: Set<string>): void {
    for (const depName of dependencies) {
      const depField = this.fields.get(depName)
      if (depField) {
        depField.dependents.add(fieldName)
      }
    }
  }

  /**
   * 清理依赖关系
   */
  private cleanupDependencies(fieldName: string, dependencies: Set<string>): void {
    for (const depName of dependencies) {
      const depField = this.fields.get(depName)
      if (depField) {
        depField.dependents.delete(fieldName)
      }
    }
  }

  /**
   * 触发依赖字段的更新
   */
  private triggerDependentFields(fieldName: string): void {
    const fieldInfo = this.fields.get(fieldName)
    if (!fieldInfo) return

    // 通知所有依赖此字段的字段
    for (const dependentName of fieldInfo.dependents) {
      this.emit('field:dependency:change', {
        dependent: dependentName,
        dependency: fieldName
      })
    }
  }

  /**
   * 获取字段的依赖关系
   * 
   * @param fieldName 字段名称
   * @returns 依赖关系信息
   */
  getFieldDependencies(fieldName: string): {
    dependencies: string[]
    dependents: string[]
  } {
    const fieldInfo = this.fields.get(fieldName)
    if (!fieldInfo) {
      return { dependencies: [], dependents: [] }
    }

    return {
      dependencies: Array.from(fieldInfo.dependencies),
      dependents: Array.from(fieldInfo.dependents)
    }
  }

  /**
   * 检查字段是否可见
   * 
   * @param fieldName 字段名称
   * @param formValues 表单值
   * @returns 是否可见
   */
  isFieldVisible(fieldName: string, formValues: Record<string, any>): boolean {
    const fieldInfo = this.fields.get(fieldName)
    if (!fieldInfo) return false

    const { visible } = fieldInfo.config

    if (typeof visible === 'boolean') {
      return visible
    }

    if (typeof visible === 'function') {
      return visible(formValues)
    }

    return true // 默认可见
  }

  /**
   * 检查字段是否禁用
   * 
   * @param fieldName 字段名称
   * @param formValues 表单值
   * @returns 是否禁用
   */
  isFieldDisabled(fieldName: string, formValues: Record<string, any>): boolean {
    const fieldInfo = this.fields.get(fieldName)
    if (!fieldInfo) return false

    const { disabled } = fieldInfo.config

    if (typeof disabled === 'boolean') {
      return disabled
    }

    if (typeof disabled === 'function') {
      return disabled(formValues)
    }

    return false // 默认不禁用
  }

  /**
   * 销毁字段管理器
   */
  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.fields.clear()

    // 直接清理监听器映射，避免调用checkDestroyed
    this.listeners.clear()
  }

  /**
   * 检查是否已销毁
   */
  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error('FieldManager has been destroyed')
    }
  }
}
