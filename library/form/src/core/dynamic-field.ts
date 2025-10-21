/**
 * @ldesign/form - Dynamic Field Manager
 * 动态字段管理器
 */

import type { FieldConfig, FormValues } from '../utils/types'
import { EventEmitter } from './event-emitter'
import { deepClone } from '../utils/helpers'

/**
 * 动态字段事件
 */
export interface DynamicFieldEventMap {
  /** 字段添加事件 */
  'field:added': { field: FieldConfig; index: number }
  /** 字段移除事件 */
  'field:removed': { name: string; index: number }
  /** 字段更新事件 */
  'field:updated': { name: string; config: FieldConfig }
  /** 字段移动事件 */
  'field:moved': { name: string; from: number; to: number }
}

/**
 * 动态字段管理器类
 */
export class DynamicFieldManager extends EventEmitter<DynamicFieldEventMap> {
  private fields: FieldConfig[]
  private fieldIndexMap: Map<string, number>

  constructor(initialFields: FieldConfig[] = []) {
    super()
    this.fields = deepClone(initialFields)
    this.fieldIndexMap = new Map()
    this.rebuildIndexMap()
  }

  /**
   * 重建字段索引映射
   */
  private rebuildIndexMap(): void {
    this.fieldIndexMap.clear()
    this.fields.forEach((field, index) => {
      this.fieldIndexMap.set(field.name, index)
    })
  }

  /**
   * 添加字段
   * @param config 字段配置
   * @param index 插入位置（默认末尾）
   */
  addField(config: FieldConfig, index?: number): void {
    // 检查字段是否已存在
    if (this.fieldIndexMap.has(config.name)) {
      console.warn(`Field "${config.name}" already exists`)
      return
    }

    const clonedConfig = deepClone(config)
    const insertIndex = index !== undefined ? index : this.fields.length

    this.fields.splice(insertIndex, 0, clonedConfig)
    this.rebuildIndexMap()

    this.emit('field:added', { field: clonedConfig, index: insertIndex })
  }

  /**
   * 批量添加字段
   * @param configs 字段配置数组
   * @param index 插入位置
   */
  addFields(configs: FieldConfig[], index?: number): void {
    const insertIndex = index !== undefined ? index : this.fields.length

    configs.forEach((config, offset) => {
      this.addField(config, insertIndex + offset)
    })
  }

  /**
   * 移除字段
   * @param name 字段名
   */
  removeField(name: string): boolean {
    const index = this.fieldIndexMap.get(name)
    if (index === undefined) {
      return false
    }

    this.fields.splice(index, 1)
    this.rebuildIndexMap()

    this.emit('field:removed', { name, index })
    return true
  }

  /**
   * 批量移除字段
   * @param names 字段名数组
   */
  removeFields(names: string[]): void {
    names.forEach(name => this.removeField(name))
  }

  /**
   * 更新字段配置
   * @param name 字段名
   * @param updates 更新内容
   */
  updateField(name: string, updates: Partial<FieldConfig>): boolean {
    const index = this.fieldIndexMap.get(name)
    if (index === undefined) {
      return false
    }

    const field = this.fields[index]
    const updatedConfig = { ...field, ...updates }
    this.fields[index] = updatedConfig

    this.emit('field:updated', { name, config: updatedConfig })
    return true
  }

  /**
   * 移动字段位置
   * @param name 字段名
   * @param toIndex 目标位置
   */
  moveField(name: string, toIndex: number): boolean {
    const fromIndex = this.fieldIndexMap.get(name)
    if (fromIndex === undefined) {
      return false
    }

    if (toIndex < 0 || toIndex >= this.fields.length) {
      return false
    }

    if (fromIndex === toIndex) {
      return true
    }

    const [field] = this.fields.splice(fromIndex, 1)
    this.fields.splice(toIndex, 0, field)
    this.rebuildIndexMap()

    this.emit('field:moved', { name, from: fromIndex, to: toIndex })
    return true
  }

  /**
   * 获取字段配置
   * @param name 字段名
   */
  getField(name: string): FieldConfig | undefined {
    const index = this.fieldIndexMap.get(name)
    if (index === undefined) {
      return undefined
    }
    return deepClone(this.fields[index])
  }

  /**
   * 获取所有字段配置
   */
  getAllFields(): FieldConfig[] {
    return deepClone(this.fields)
  }

  /**
   * 获取字段索引
   * @param name 字段名
   */
  getFieldIndex(name: string): number | undefined {
    return this.fieldIndexMap.get(name)
  }

  /**
   * 检查字段是否存在
   * @param name 字段名
   */
  hasField(name: string): boolean {
    return this.fieldIndexMap.has(name)
  }

  /**
   * 获取字段数量
   */
  getFieldCount(): number {
    return this.fields.length
  }

  /**
   * 清空所有字段
   */
  clear(): void {
    const names = Array.from(this.fieldIndexMap.keys())
    this.fields = []
    this.fieldIndexMap.clear()

    names.forEach((name, index) => {
      this.emit('field:removed', { name, index })
    })
  }

  /**
   * 克隆字段
   * @param name 源字段名
   * @param newName 新字段名
   * @param index 插入位置
   */
  cloneField(name: string, newName: string, index?: number): boolean {
    const field = this.getField(name)
    if (!field) {
      return false
    }

    const clonedField = { ...field, name: newName }
    this.addField(clonedField, index)
    return true
  }

  /**
   * 交换两个字段的位置
   * @param name1 字段1
   * @param name2 字段2
   */
  swapFields(name1: string, name2: string): boolean {
    const index1 = this.fieldIndexMap.get(name1)
    const index2 = this.fieldIndexMap.get(name2)

    if (index1 === undefined || index2 === undefined) {
      return false
    }

    const temp = this.fields[index1]
    this.fields[index1] = this.fields[index2]
    this.fields[index2] = temp

    this.rebuildIndexMap()

    return true
  }
}

/**
 * 创建动态字段管理器
 */
export function createDynamicFieldManager(
  initialFields?: FieldConfig[]
): DynamicFieldManager {
  return new DynamicFieldManager(initialFields)
}



