/**
 * 展开管理器
 *
 * 负责表格行展开状态的管理
 * 支持行展开/折叠、全部展开/折叠等功能
 * 提供高效的展开状态同步和查询
 */

import type {
  IExpandManager,
  IDataManager,
  TableRow,
  TableId
} from '../types'
import { EventManager } from './EventManager'

/**
 * 展开管理器实现类
 *
 * 功能特性：
 * - 支持行展开和折叠
 * - 支持全部展开和折叠
 * - 高效的展开状态管理
 * - 层级展开支持
 * - 展开状态变化通知
 */
export class ExpandManager<T extends TableRow = TableRow> implements IExpandManager<T> {
  /** 展开的行键集合 */
  private expandedKeys: Set<TableId> = new Set()

  /** 数据管理器引用 */
  private dataManager?: IDataManager<T>

  /** 最大展开级别 */
  private maxLevel?: number

  /** 事件管理器 */
  private eventManager: EventManager = new EventManager()

  /**
   * 构造函数
   * @param dataManager 数据管理器实例（可选）
   */
  constructor(dataManager?: IDataManager<T>) {
    this.dataManager = dataManager
  }

  /**
   * 展开行
   * @param keys 行键或行键数组
   */
  expand(keys: TableId | TableId[]): void {
    const keyArray = Array.isArray(keys) ? keys : [keys]

    for (const key of keyArray) {
      this.expandedKeys.add(key)
    }

    this.emitExpandChange('expand', keyArray)
  }

  /**
   * 折叠行
   * @param keys 行键或行键数组
   */
  collapse(keys: TableId | TableId[]): void {
    const keyArray = Array.isArray(keys) ? keys : [keys]

    for (const key of keyArray) {
      this.expandedKeys.delete(key)
    }

    this.emitExpandChange('collapse', keyArray)
  }

  /**
   * 切换行展开状态
   * @param keys 行键或行键数组
   */
  toggle(keys: TableId | TableId[]): void {
    const keyArray = Array.isArray(keys) ? keys : [keys]

    for (const key of keyArray) {
      if (this.expandedKeys.has(key)) {
        this.expandedKeys.delete(key)
      } else {
        this.expandedKeys.add(key)
      }
    }

    this.emitExpandChange('toggle', keyArray)
  }

  /**
   * 展开指定的行
   * @param keys 要展开的行键数组
   */
  expandRows(keys: TableId[]): void {
    keys.forEach(key => {
      this.expandedKeys.add(key)
    })

    this.emitExpandChange('expand', keys)
  }

  /**
   * 折叠指定的行
   * @param keys 要折叠的行键数组
   */
  collapseRows(keys: TableId[]): void {
    keys.forEach(key => {
      this.expandedKeys.delete(key)
    })

    this.emitExpandChange('collapse', keys)
  }

  /**
   * 展开所有行
   * @param allKeys 所有可展开的行键
   */
  expandAll(allKeys: TableId[]): void {
    this.expandedKeys.clear()
    for (const key of allKeys) {
      this.expandedKeys.add(key)
    }

    this.emitExpandChange('expand-all', allKeys)
  }

  /**
   * 折叠所有行
   */
  collapseAll(): void {
    this.expandedKeys.clear()
    this.emitExpandChange('collapse-all', [])
  }

  /**
   * 清除所有展开
   */
  clear(): void {
    this.expandedKeys.clear()
    this.emitExpandChange('clear', [])
  }

  /**
   * 切换全部展开状态
   * @param allKeys 所有可展开的行键
   */
  toggleAll(allKeys: TableId[]): void {
    if (this.isAllExpanded(allKeys)) {
      this.collapseAll()
    } else {
      this.expandAll(allKeys)
    }
  }

  /**
   * 获取展开的行键
   */
  getExpandedKeys(): TableId[] {
    return Array.from(this.expandedKeys)
  }

  /**
   * 获取展开的行数量
   */
  getExpandedCount(): number {
    return this.expandedKeys.size
  }

  /**
   * 检查行是否展开
   * @param key 行键
   */
  isExpanded(key: TableId): boolean {
    return this.expandedKeys.has(key)
  }

  /**
   * 检查是否全部展开
   * @param allKeys 所有可展开的行键
   */
  isAllExpanded(allKeys: TableId[]): boolean {
    if (allKeys.length === 0) {
      return false
    }

    return allKeys.every(key => this.expandedKeys.has(key))
  }

  /**
   * 检查是否部分展开（半展开状态）
   * @param allKeys 所有可展开的行键
   */
  isIndeterminate(allKeys: TableId[]): boolean {
    if (allKeys.length === 0) {
      return false
    }

    const expandedCount = allKeys.filter(key => this.expandedKeys.has(key)).length
    return expandedCount > 0 && expandedCount < allKeys.length
  }

  /**
   * 检查是否有展开
   */
  hasExpanded(): boolean {
    return this.expandedKeys.size > 0
  }

  /**
   * 层级展开（展开节点及其所有子节点）
   * @param key 节点键
   * @param hierarchicalData 层级数据
   */
  expandWithChildren(key: TableId, hierarchicalData: any[]): void {
    const children = this.getChildren(key, hierarchicalData)
    const keysToExpand = [key, ...children.map(child => child.id)]

    for (const k of keysToExpand) {
      if (!this.maxLevel || this.getNodeLevel(k, hierarchicalData) <= this.maxLevel) {
        this.expandedKeys.add(k)
      }
    }

    this.emitExpandChange('expand-with-children', keysToExpand)
  }

  /**
   * 层级折叠（折叠节点及其所有子节点）
   * @param key 节点键
   * @param hierarchicalData 层级数据
   */
  collapseWithChildren(key: TableId, hierarchicalData: any[]): void {
    const children = this.getChildren(key, hierarchicalData)
    const keysToCollapse = [key, ...children.map(child => child.id)]

    for (const k of keysToCollapse) {
      this.expandedKeys.delete(k)
    }

    this.emitExpandChange('collapse-with-children', keysToCollapse)
  }

  /**
   * 获取所有子节点（递归）
   * @param parentKey 父节点键
   * @param hierarchicalData 层级数据
   */
  getChildren(parentKey: TableId, hierarchicalData: any[]): any[] {
    const children: any[] = []
    const queue: TableId[] = [parentKey]

    while (queue.length > 0) {
      const currentParent = queue.shift()!
      const directChildren = hierarchicalData.filter(item => item.parentId === currentParent)

      for (const child of directChildren) {
        children.push(child)
        queue.push(child.id)
      }
    }

    return children
  }

  /**
   * 获取直接子节点
   * @param parentKey 父节点键
   * @param hierarchicalData 层级数据
   */
  getDirectChildren(parentKey: TableId, hierarchicalData: any[]): any[] {
    return hierarchicalData.filter(item => item.parentId === parentKey)
  }

  /**
   * 获取节点级别
   * @param key 节点键
   * @param hierarchicalData 层级数据
   */
  private getNodeLevel(key: TableId, hierarchicalData: any[]): number {
    const node = hierarchicalData.find(item => item.id === key)
    return node ? node.level || 0 : 0
  }

  /**
   * 设置最大展开级别
   * @param level 最大级别
   */
  setMaxLevel(level: number): void {
    this.maxLevel = level
  }

  /**
   * 按级别展开
   * @param level 展开到的级别
   * @param hierarchicalData 层级数据
   */
  expandToLevel(level: number, hierarchicalData: any[]): void {
    this.expandedKeys.clear()

    for (const item of hierarchicalData) {
      if (item.level < level) {
        this.expandedKeys.add(item.id)
      }
    }

    this.emitExpandChange('expand-to-level', Array.from(this.expandedKeys))
  }

  /**
   * 获取展开状态
   */
  getExpandState() {
    return {
      expandedKeys: this.getExpandedKeys(),
      expandedCount: this.getExpandedCount(),
      maxLevel: this.maxLevel
    }
  }

  /**
   * 设置展开状态
   * @param state 展开状态
   */
  setExpandState(state: { expandedKeys: TableId[]; expandedCount: number; maxLevel?: number }): void {
    this.maxLevel = state.maxLevel
    this.expandedKeys.clear()

    for (const key of state.expandedKeys) {
      this.expandedKeys.add(key)
    }
  }

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  on(event: string, listener: (data: any) => void): void {
    this.eventManager.on(event, listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event: string, listener?: (data: any) => void): void {
    this.eventManager.off(event, listener)
  }

  /**
   * 触发展开变更事件
   * @param type 变更类型
   * @param keys 相关的键
   */
  private emitExpandChange(type: string, keys: TableId[]): void {
    this.eventManager.emit('expand-change', {
      type,
      keys,
      expandedKeys: this.getExpandedKeys()
    })
  }

  /**
   * 销毁展开管理器
   */
  destroy(): void {
    this.expandedKeys.clear()
    this.eventManager.destroy()
  }
}
