/**
 * @ldesign/form - Array Field Manager
 * 数组字段管理器
 */

import type { FieldConfig, FormValues } from '../utils/types'
import { EventEmitter } from './event-emitter'
import { deepClone } from '../utils/helpers'

/**
 * 数组字段事件
 */
export interface ArrayFieldEventMap {
  /** 项添加事件 */
  'item:added': { field: string; index: number; value: any }
  /** 项移除事件 */
  'item:removed': { field: string; index: number }
  /** 项移动事件 */
  'item:moved': { field: string; from: number; to: number }
}

/**
 * 数组字段配置
 */
export interface ArrayFieldConfig {
  /** 字段名称 */
  name: string
  /** 项模板配置 */
  itemTemplate: FieldConfig[]
  /** 最小项数 */
  minItems?: number
  /** 最大项数 */
  maxItems?: number
  /** 默认项数 */
  defaultItemCount?: number
  /** 默认项值 */
  defaultItemValue?: any
}

/**
 * 数组字段管理器类
 */
export class ArrayFieldManager extends EventEmitter<ArrayFieldEventMap> {
  private arrayFields: Map<string, ArrayFieldConfig>
  private itemCounts: Map<string, number>

  constructor() {
    super()
    this.arrayFields = new Map()
    this.itemCounts = new Map()
  }

  /**
   * 注册数组字段
   * @param config 数组字段配置
   */
  registerArrayField(config: ArrayFieldConfig): void {
    this.arrayFields.set(config.name, deepClone(config))

    const defaultCount = config.defaultItemCount || config.minItems || 1
    this.itemCounts.set(config.name, defaultCount)
  }

  /**
   * 添加数组项
   * @param fieldName 数组字段名
   * @param value 项值
   * @param index 插入位置
   */
  addItem(fieldName: string, value?: any, index?: number): boolean {
    const config = this.arrayFields.get(fieldName)
    if (!config) {
      return false
    }

    const currentCount = this.itemCounts.get(fieldName) || 0

    // 检查最大项数限制
    if (config.maxItems && currentCount >= config.maxItems) {
      console.warn(
        `Cannot add more items to array field "${fieldName}". ` +
        `Maximum items: ${config.maxItems}`
      )
      return false
    }

    const insertIndex = index !== undefined ? index : currentCount
    const itemValue = value !== undefined ? value : config.defaultItemValue

    this.itemCounts.set(fieldName, currentCount + 1)

    this.emit('item:added', {
      field: fieldName,
      index: insertIndex,
      value: itemValue
    })

    return true
  }

  /**
   * 移除数组项
   * @param fieldName 数组字段名
   * @param index 项索引
   */
  removeItem(fieldName: string, index: number): boolean {
    const config = this.arrayFields.get(fieldName)
    if (!config) {
      return false
    }

    const currentCount = this.itemCounts.get(fieldName) || 0

    // 检查最小项数限制
    if (config.minItems && currentCount <= config.minItems) {
      console.warn(
        `Cannot remove more items from array field "${fieldName}". ` +
        `Minimum items: ${config.minItems}`
      )
      return false
    }

    if (index < 0 || index >= currentCount) {
      return false
    }

    this.itemCounts.set(fieldName, currentCount - 1)

    this.emit('item:removed', {
      field: fieldName,
      index
    })

    return true
  }

  /**
   * 移动数组项
   * @param fieldName 数组字段名
   * @param fromIndex 源索引
   * @param toIndex 目标索引
   */
  moveItem(fieldName: string, fromIndex: number, toIndex: number): boolean {
    const currentCount = this.itemCounts.get(fieldName) || 0

    if (fromIndex < 0 || fromIndex >= currentCount) {
      return false
    }

    if (toIndex < 0 || toIndex >= currentCount) {
      return false
    }

    if (fromIndex === toIndex) {
      return true
    }

    this.emit('item:moved', {
      field: fieldName,
      from: fromIndex,
      to: toIndex
    })

    return true
  }

  /**
   * 获取数组项数量
   * @param fieldName 数组字段名
   */
  getItemCount(fieldName: string): number {
    return this.itemCounts.get(fieldName) || 0
  }

  /**
   * 获取数组字段配置
   * @param fieldName 数组字段名
   */
  getArrayField(fieldName: string): ArrayFieldConfig | undefined {
    const config = this.arrayFields.get(fieldName)
    return config ? deepClone(config) : undefined
  }

  /**
   * 生成字段项的字段配置
   * @param fieldName 数组字段名
   * @param itemIndex 项索引
   */
  generateItemFields(fieldName: string, itemIndex: number): FieldConfig[] {
    const config = this.arrayFields.get(fieldName)
    if (!config) {
      return []
    }

    return config.itemTemplate.map(template => ({
      ...deepClone(template),
      name: `${fieldName}[${itemIndex}].${template.name}`
    }))
  }

  /**
   * 获取所有数组字段的所有项字段配置
   */
  getAllItemFields(): FieldConfig[] {
    const allFields: FieldConfig[] = []

    this.arrayFields.forEach((config, fieldName) => {
      const itemCount = this.getItemCount(fieldName)

      for (let i = 0; i < itemCount; i++) {
        const itemFields = this.generateItemFields(fieldName, i)
        allFields.push(...itemFields)
      }
    })

    return allFields
  }

  /**
   * 检查是否为数组字段
   * @param fieldName 字段名
   */
  isArrayField(fieldName: string): boolean {
    return this.arrayFields.has(fieldName)
  }

  /**
   * 清空所有数组字段
   */
  clear(): void {
    this.arrayFields.clear()
    this.itemCounts.clear()
  }
}

/**
 * 创建数组字段管理器
 */
export function createArrayFieldManager(
  initialFields?: FieldConfig[]
): ArrayFieldManager {
  return new ArrayFieldManager(initialFields)
}



