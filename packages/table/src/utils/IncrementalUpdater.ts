/**
 * 增量更新管理器
 * 
 * 负责数据的增量更新和差异计算
 * 提供高效的数据同步和更新策略
 */

import type { TableRow, TableId } from '../types'
import { EventManager } from '../managers/EventManager'

/**
 * 增量更新配置
 */
export interface IncrementalUpdateConfig {
  /** 是否启用增量更新 */
  enabled?: boolean
  /** 批量更新大小 */
  batchSize?: number
  /** 更新间隔 */
  updateInterval?: number
  /** 是否启用自动合并 */
  enableAutoMerge?: boolean
  /** 最大变更记录数 */
  maxChangeRecords?: number
}

/**
 * 数据变更类型
 */
export type ChangeType = 'add' | 'update' | 'remove' | 'move'

/**
 * 数据变更记录
 */
export interface DataChange<T = any> {
  id: string
  type: ChangeType
  key: TableId
  oldData?: T
  newData?: T
  oldIndex?: number
  newIndex?: number
  timestamp: number
}

/**
 * 批量变更
 */
export interface BatchChange<T = any> {
  id: string
  changes: DataChange<T>[]
  timestamp: number
  applied: boolean
}

/**
 * 差异结果
 */
export interface DiffResult<T = any> {
  added: T[]
  updated: Array<{ key: TableId; oldData: T; newData: T }>
  removed: T[]
  moved: Array<{ key: TableId; oldIndex: number; newIndex: number }>
}

/**
 * 增量更新管理器实现类
 */
export class IncrementalUpdater<T extends TableRow = TableRow> {
  /** 配置 */
  private config: Required<IncrementalUpdateConfig>

  /** 事件管理器 */
  private eventManager: EventManager

  /** 变更记录 */
  private changeRecords: DataChange<T>[] = []

  /** 批量变更队列 */
  private batchQueue: BatchChange<T>[] = []

  /** 当前数据快照 */
  private currentSnapshot: Map<TableId, T> = new Map()

  /** 更新定时器 */
  private updateTimer: number | null = null

  /** 变更ID计数器 */
  private changeIdCounter: number = 0

  /**
   * 构造函数
   * @param config 增量更新配置
   */
  constructor(config: IncrementalUpdateConfig = {}) {
    this.config = {
      enabled: true,
      batchSize: 100,
      updateInterval: 100,
      enableAutoMerge: true,
      maxChangeRecords: 1000,
      ...config
    }

    this.eventManager = new EventManager()
  }

  /**
   * 初始化数据快照
   */
  initializeSnapshot(data: T[], getKey: (item: T) => TableId): void {
    this.currentSnapshot.clear()
    
    data.forEach(item => {
      const key = getKey(item)
      this.currentSnapshot.set(key, { ...item })
    })
  }

  /**
   * 计算数据差异
   */
  calculateDiff(
    newData: T[],
    getKey: (item: T) => TableId,
    compareData?: (a: T, b: T) => boolean
  ): DiffResult<T> {
    const result: DiffResult<T> = {
      added: [],
      updated: [],
      removed: [],
      moved: []
    }

    const newDataMap = new Map<TableId, T>()
    const newDataOrder = new Map<TableId, number>()

    // 构建新数据映射
    newData.forEach((item, index) => {
      const key = getKey(item)
      newDataMap.set(key, item)
      newDataOrder.set(key, index)
    })

    // 查找新增和更新的项
    for (const [key, newItem] of newDataMap.entries()) {
      const oldItem = this.currentSnapshot.get(key)
      
      if (!oldItem) {
        // 新增项
        result.added.push(newItem)
      } else {
        // 检查是否有更新
        const hasChanged = compareData 
          ? !compareData(oldItem, newItem)
          : JSON.stringify(oldItem) !== JSON.stringify(newItem)
        
        if (hasChanged) {
          result.updated.push({
            key,
            oldData: oldItem,
            newData: newItem
          })
        }

        // 检查位置是否变化
        const oldIndex = Array.from(this.currentSnapshot.keys()).indexOf(key)
        const newIndex = newDataOrder.get(key)!
        
        if (oldIndex !== -1 && oldIndex !== newIndex) {
          result.moved.push({
            key,
            oldIndex,
            newIndex
          })
        }
      }
    }

    // 查找删除的项
    for (const [key, oldItem] of this.currentSnapshot.entries()) {
      if (!newDataMap.has(key)) {
        result.removed.push(oldItem)
      }
    }

    return result
  }

  /**
   * 应用差异更新
   */
  applyDiff(
    diff: DiffResult<T>,
    getKey: (item: T) => TableId
  ): DataChange<T>[] {
    if (!this.config.enabled) return []

    const changes: DataChange<T>[] = []

    // 处理新增
    diff.added.forEach(item => {
      const change: DataChange<T> = {
        id: this.generateChangeId(),
        type: 'add',
        key: getKey(item),
        newData: item,
        timestamp: Date.now()
      }
      changes.push(change)
      this.currentSnapshot.set(change.key, { ...item })
    })

    // 处理更新
    diff.updated.forEach(({ key, oldData, newData }) => {
      const change: DataChange<T> = {
        id: this.generateChangeId(),
        type: 'update',
        key,
        oldData,
        newData,
        timestamp: Date.now()
      }
      changes.push(change)
      this.currentSnapshot.set(key, { ...newData })
    })

    // 处理删除
    diff.removed.forEach(item => {
      const key = getKey(item)
      const change: DataChange<T> = {
        id: this.generateChangeId(),
        type: 'remove',
        key,
        oldData: item,
        timestamp: Date.now()
      }
      changes.push(change)
      this.currentSnapshot.delete(key)
    })

    // 处理移动
    diff.moved.forEach(({ key, oldIndex, newIndex }) => {
      const change: DataChange<T> = {
        id: this.generateChangeId(),
        type: 'move',
        key,
        oldIndex,
        newIndex,
        timestamp: Date.now()
      }
      changes.push(change)
    })

    // 记录变更
    this.recordChanges(changes)

    return changes
  }

  /**
   * 记录变更
   * @private
   */
  private recordChanges(changes: DataChange<T>[]): void {
    this.changeRecords.push(...changes)

    // 限制记录数量
    if (this.changeRecords.length > this.config.maxChangeRecords) {
      this.changeRecords = this.changeRecords.slice(-this.config.maxChangeRecords / 2)
    }

    // 触发变更事件
    this.eventManager.emit('changes-recorded', { changes })

    // 如果启用自动合并，添加到批量队列
    if (this.config.enableAutoMerge) {
      this.addToBatchQueue(changes)
    }
  }

  /**
   * 添加到批量队列
   * @private
   */
  private addToBatchQueue(changes: DataChange<T>[]): void {
    const batchChange: BatchChange<T> = {
      id: this.generateChangeId(),
      changes,
      timestamp: Date.now(),
      applied: false
    }

    this.batchQueue.push(batchChange)

    // 检查是否需要立即处理
    if (this.batchQueue.length >= this.config.batchSize) {
      this.processBatchQueue()
    } else if (!this.updateTimer) {
      this.updateTimer = window.setTimeout(() => {
        this.processBatchQueue()
      }, this.config.updateInterval)
    }
  }

  /**
   * 处理批量队列
   * @private
   */
  private processBatchQueue(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }

    if (this.batchQueue.length === 0) return

    const batches = [...this.batchQueue]
    this.batchQueue = []

    // 合并变更
    const mergedChanges = this.mergeChanges(
      batches.flatMap(batch => batch.changes)
    )

    // 标记批次为已应用
    batches.forEach(batch => {
      batch.applied = true
    })

    // 触发批量更新事件
    this.eventManager.emit('batch-update', {
      batches,
      mergedChanges,
      totalChanges: mergedChanges.length
    })
  }

  /**
   * 合并变更
   * @private
   */
  private mergeChanges(changes: DataChange<T>[]): DataChange<T>[] {
    const changeMap = new Map<TableId, DataChange<T>>()

    // 按时间顺序处理变更
    changes.sort((a, b) => a.timestamp - b.timestamp)

    for (const change of changes) {
      const existingChange = changeMap.get(change.key)

      if (!existingChange) {
        changeMap.set(change.key, { ...change })
        continue
      }

      // 合并逻辑
      switch (existingChange.type) {
        case 'add':
          if (change.type === 'update') {
            // add + update = add (with updated data)
            existingChange.newData = change.newData
          } else if (change.type === 'remove') {
            // add + remove = no change
            changeMap.delete(change.key)
          }
          break

        case 'update':
          if (change.type === 'update') {
            // update + update = update (with latest data)
            existingChange.newData = change.newData
          } else if (change.type === 'remove') {
            // update + remove = remove
            existingChange.type = 'remove'
            existingChange.newData = undefined
          }
          break

        case 'remove':
          if (change.type === 'add') {
            // remove + add = update
            existingChange.type = 'update'
            existingChange.newData = change.newData
          }
          break
      }

      // 更新时间戳
      existingChange.timestamp = change.timestamp
    }

    return Array.from(changeMap.values())
  }

  /**
   * 获取变更记录
   */
  getChangeRecords(since?: number): DataChange<T>[] {
    if (since === undefined) {
      return [...this.changeRecords]
    }

    return this.changeRecords.filter(change => change.timestamp > since)
  }

  /**
   * 获取批量变更
   */
  getBatchChanges(since?: number): BatchChange<T>[] {
    if (since === undefined) {
      return [...this.batchQueue]
    }

    return this.batchQueue.filter(batch => batch.timestamp > since)
  }

  /**
   * 清除变更记录
   */
  clearChangeRecords(before?: number): void {
    if (before === undefined) {
      this.changeRecords = []
    } else {
      this.changeRecords = this.changeRecords.filter(
        change => change.timestamp >= before
      )
    }
  }

  /**
   * 生成变更ID
   * @private
   */
  private generateChangeId(): string {
    return `change_${Date.now()}_${++this.changeIdCounter}`
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalChanges: this.changeRecords.length,
      pendingBatches: this.batchQueue.length,
      snapshotSize: this.currentSnapshot.size,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * 估算内存使用量
   * @private
   */
  private estimateMemoryUsage(): number {
    let usage = 0

    // 变更记录内存
    usage += JSON.stringify(this.changeRecords).length * 2

    // 快照内存
    usage += JSON.stringify(Array.from(this.currentSnapshot.values())).length * 2

    return usage
  }

  /**
   * 添加事件监听器
   */
  on(eventName: string, listener: (data: any) => void): void {
    this.eventManager.on(eventName, listener)
  }

  /**
   * 移除事件监听器
   */
  off(eventName: string, listener?: (data: any) => void): void {
    this.eventManager.off(eventName, listener)
  }

  /**
   * 销毁增量更新器
   */
  destroy(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }

    this.changeRecords = []
    this.batchQueue = []
    this.currentSnapshot.clear()
    this.eventManager.destroy()
  }
}
