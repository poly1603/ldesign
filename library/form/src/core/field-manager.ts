/**
 * @ldesign/form - Field Manager
 * 字段管理器
 */

import type { FieldConfig, FormValues } from '../utils/types'
import { deepClone, isFunction } from '../utils/helpers'

/**
 * 字段依赖关系
 */
export interface FieldDependency {
  /** 依赖的字段名 */
  field: string
  /** 被依赖的字段列表 */
  dependencies: string[]
}

/**
 * 字段管理器类
 */
export class FieldManager {
  private fields: Map<string, FieldConfig>
  private dependencies: Map<string, Set<string>>
  private reverseDependencies: Map<string, Set<string>>

  constructor() {
    this.fields = new Map()
    this.dependencies = new Map()
    this.reverseDependencies = new Map()
  }

  /**
   * 注册字段
   * @param config 字段配置
   */
  registerField(config: FieldConfig): void {
    this.fields.set(config.name, deepClone(config))

    // 注册依赖关系
    if (config.dependencies && config.dependencies.length > 0) {
      this.dependencies.set(config.name, new Set(config.dependencies))

      // 更新反向依赖
      config.dependencies.forEach(dep => {
        if (!this.reverseDependencies.has(dep)) {
          this.reverseDependencies.set(dep, new Set())
        }
        this.reverseDependencies.get(dep)!.add(config.name)
      })
    }
  }

  /**
   * 批量注册字段
   * @param configs 字段配置数组
   */
  registerFields(configs: FieldConfig[]): void {
    configs.forEach(config => this.registerField(config))
  }

  /**
   * 注销字段
   * @param name 字段名
   */
  unregisterField(name: string): void {
    // 移除字段
    this.fields.delete(name)

    // 移除依赖关系
    const deps = this.dependencies.get(name)
    if (deps) {
      deps.forEach(dep => {
        const reverseDeps = this.reverseDependencies.get(dep)
        if (reverseDeps) {
          reverseDeps.delete(name)
          if (reverseDeps.size === 0) {
            this.reverseDependencies.delete(dep)
          }
        }
      })
      this.dependencies.delete(name)
    }

    // 移除反向依赖
    const reverseDeps = this.reverseDependencies.get(name)
    if (reverseDeps) {
      reverseDeps.forEach(field => {
        const fieldDeps = this.dependencies.get(field)
        if (fieldDeps) {
          fieldDeps.delete(name)
          if (fieldDeps.size === 0) {
            this.dependencies.delete(field)
          }
        }
      })
      this.reverseDependencies.delete(name)
    }
  }

  /**
   * 获取字段配置
   * @param name 字段名
   * @param clone 是否克隆
   */
  getField(name: string, clone = true): FieldConfig | undefined {
    const field = this.fields.get(name)
    return field && clone ? deepClone(field) : field
  }

  /**
   * 获取所有字段配置
   * @param clone 是否克隆
   */
  getAllFields(clone = true): FieldConfig[] {
    const fields: FieldConfig[] = []
    this.fields.forEach(field => {
      fields.push(clone ? deepClone(field) : field)
    })
    return fields
  }

  /**
   * 更新字段配置
   * @param name 字段名
   * @param updates 更新内容
   */
  updateField(name: string, updates: Partial<FieldConfig>): void {
    const field = this.fields.get(name)
    if (!field) {
      return
    }

    const updatedField = { ...field, ...updates }
    this.fields.set(name, updatedField)

    // 如果依赖关系变更，更新依赖映射
    if (updates.dependencies !== undefined) {
      this.updateDependencies(name, updates.dependencies || [])
    }
  }

  /**
   * 更新字段依赖关系
   * @param name 字段名
   * @param dependencies 新的依赖列表
   */
  private updateDependencies(name: string, dependencies: string[]): void {
    // 清除旧的依赖关系
    const oldDeps = this.dependencies.get(name)
    if (oldDeps) {
      oldDeps.forEach(dep => {
        const reverseDeps = this.reverseDependencies.get(dep)
        if (reverseDeps) {
          reverseDeps.delete(name)
          if (reverseDeps.size === 0) {
            this.reverseDependencies.delete(dep)
          }
        }
      })
    }

    // 设置新的依赖关系
    if (dependencies.length > 0) {
      this.dependencies.set(name, new Set(dependencies))

      dependencies.forEach(dep => {
        if (!this.reverseDependencies.has(dep)) {
          this.reverseDependencies.set(dep, new Set())
        }
        this.reverseDependencies.get(dep)!.add(name)
      })
    } else {
      this.dependencies.delete(name)
    }
  }

  /**
   * 获取字段的依赖字段
   * @param name 字段名
   */
  getDependencies(name: string): string[] {
    const deps = this.dependencies.get(name)
    return deps ? Array.from(deps) : []
  }

  /**
   * 获取依赖某个字段的所有字段
   * @param name 字段名
   */
  getDependents(name: string): string[] {
    const deps = this.reverseDependencies.get(name)
    return deps ? Array.from(deps) : []
  }

  /**
   * 检查是否存在循环依赖
   * @param name 字段名
   * @param visited 已访问的字段集合
   */
  hasCircularDependency(name: string, visited: Set<string> = new Set()): boolean {
    if (visited.has(name)) {
      return true
    }

    visited.add(name)
    const deps = this.getDependencies(name)

    for (const dep of deps) {
      if (this.hasCircularDependency(dep, new Set(visited))) {
        return true
      }
    }

    return false
  }

  /**
   * 计算字段可见性
   * @param name 字段名
   * @param values 表单值
   */
  isFieldVisible(name: string, values: FormValues): boolean {
    const field = this.fields.get(name)
    if (!field) {
      return false
    }

    const visible = field.visible
    if (visible === undefined || visible === null) {
      return true
    }

    if (typeof visible === 'boolean') {
      return visible
    }

    if (isFunction(visible)) {
      try {
        return visible(values)
      } catch (error) {
        console.error(`Error in visible function for field "${name}":`, error)
        return true
      }
    }

    return true
  }

  /**
   * 获取可见字段列表
   * @param values 表单值
   */
  getVisibleFields(values: FormValues): FieldConfig[] {
    const visibleFields: FieldConfig[] = []

    this.fields.forEach(field => {
      if (this.isFieldVisible(field.name, values)) {
        visibleFields.push(deepClone(field))
      }
    })

    return visibleFields
  }

  /**
   * 获取字段数量
   */
  getFieldCount(): number {
    return this.fields.size
  }

  /**
   * 检查字段是否存在
   * @param name 字段名
   */
  hasField(name: string): boolean {
    return this.fields.has(name)
  }

  /**
   * 获取所有字段名
   */
  getFieldNames(): string[] {
    return Array.from(this.fields.keys())
  }

  /**
   * 清空所有字段
   */
  clear(): void {
    this.fields.clear()
    this.dependencies.clear()
    this.reverseDependencies.clear()
  }

  /**
   * 销毁字段管理器
   */
  destroy(): void {
    this.clear()
  }
}

/**
 * 创建字段管理器
 */
export function createFieldManager(): FieldManager {
  return new FieldManager()
}




