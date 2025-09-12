/**
 * @file 历史管理器
 * @description 实现撤销/重做功能
 */

import { EventEmitter } from '@/core/event-emitter'

/**
 * 历史记录项
 */
export interface HistoryItem {
  /** 唯一ID */
  id: string
  /** 操作类型 */
  type: string
  /** 操作描述 */
  description: string
  /** 操作数据 */
  data: any
  /** 撤销数据 */
  undoData: any
  /** 时间戳 */
  timestamp: number
}

/**
 * 历史状态
 */
export interface HistoryState {
  /** 当前位置 */
  currentIndex: number
  /** 历史记录数量 */
  totalCount: number
  /** 是否可以撤销 */
  canUndo: boolean
  /** 是否可以重做 */
  canRedo: boolean
}

/**
 * 历史管理器类
 */
export class HistoryManager extends EventEmitter {
  /** 历史记录栈 */
  private history: HistoryItem[] = []

  /** 当前位置 */
  private currentIndex: number = -1

  /** 最大历史记录数 */
  private maxHistorySize: number = 50

  /** 是否正在执行撤销/重做 */
  private isUndoRedoing: boolean = false

  /**
   * 构造函数
   * @param maxHistorySize 最大历史记录数
   */
  constructor(maxHistorySize: number = 50) {
    super()
    this.maxHistorySize = maxHistorySize
  }

  /**
   * 添加历史记录
   * @param type 操作类型
   * @param description 操作描述
   * @param data 操作数据
   * @param undoData 撤销数据
   */
  addHistory(type: string, description: string, data: any, undoData: any): void {
    if (this.isUndoRedoing) return

    const historyItem: HistoryItem = {
      id: this.generateId(),
      type,
      description,
      data,
      undoData,
      timestamp: Date.now()
    }

    // 如果当前不在历史记录的末尾，删除后面的记录
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // 添加新记录
    this.history.push(historyItem)
    this.currentIndex++

    // 限制历史记录数量
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentIndex--
    }

    this.emit('historyAdded', { item: historyItem, state: this.getState() })
  }

  /**
   * 撤销操作
   */
  async undo(): Promise<HistoryItem | null> {
    if (!this.canUndo()) return null

    const item = this.history[this.currentIndex]
    this.isUndoRedoing = true

    try {
      this.currentIndex--
      this.emit('beforeUndo', { item })
      
      // 触发撤销事件，让外部处理具体的撤销逻辑
      await this.executeUndo(item)
      
      this.emit('afterUndo', { item, state: this.getState() })
      return item
    } catch (error) {
      // 撤销失败，恢复状态
      this.currentIndex++
      this.emit('undoError', { item, error })
      throw error
    } finally {
      this.isUndoRedoing = false
    }
  }

  /**
   * 重做操作
   */
  async redo(): Promise<HistoryItem | null> {
    if (!this.canRedo()) return null

    this.currentIndex++
    const item = this.history[this.currentIndex]
    this.isUndoRedoing = true

    try {
      this.emit('beforeRedo', { item })
      
      // 触发重做事件，让外部处理具体的重做逻辑
      await this.executeRedo(item)
      
      this.emit('afterRedo', { item, state: this.getState() })
      return item
    } catch (error) {
      // 重做失败，恢复状态
      this.currentIndex--
      this.emit('redoError', { item, error })
      throw error
    } finally {
      this.isUndoRedoing = false
    }
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex >= 0
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * 获取历史状态
   */
  getState(): HistoryState {
    return {
      currentIndex: this.currentIndex,
      totalCount: this.history.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    }
  }

  /**
   * 获取历史记录列表
   */
  getHistory(): HistoryItem[] {
    return [...this.history]
  }

  /**
   * 获取当前历史记录
   */
  getCurrentItem(): HistoryItem | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex]
    }
    return null
  }

  /**
   * 跳转到指定历史记录
   * @param index 目标索引
   */
  async jumpTo(index: number): Promise<void> {
    if (index < -1 || index >= this.history.length) {
      throw new Error('Invalid history index')
    }

    const currentIndex = this.currentIndex
    
    try {
      if (index < currentIndex) {
        // 需要撤销
        while (this.currentIndex > index) {
          await this.undo()
        }
      } else if (index > currentIndex) {
        // 需要重做
        while (this.currentIndex < index) {
          await this.redo()
        }
      }
    } catch (error) {
      this.emit('jumpError', { fromIndex: currentIndex, toIndex: index, error })
      throw error
    }
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    const oldState = this.getState()
    this.history = []
    this.currentIndex = -1
    this.emit('historyCleared', { oldState, newState: this.getState() })
  }

  /**
   * 设置最大历史记录数
   * @param maxSize 最大数量
   */
  setMaxHistorySize(maxSize: number): void {
    this.maxHistorySize = maxSize
    
    // 如果当前历史记录超过限制，删除最旧的记录
    if (this.history.length > maxSize) {
      const removeCount = this.history.length - maxSize
      this.history.splice(0, removeCount)
      this.currentIndex = Math.max(-1, this.currentIndex - removeCount)
      this.emit('historyTrimmed', { removedCount: removeCount, state: this.getState() })
    }
  }

  /**
   * 获取撤销描述
   */
  getUndoDescription(): string | null {
    if (!this.canUndo()) return null
    return this.history[this.currentIndex].description
  }

  /**
   * 获取重做描述
   */
  getRedoDescription(): string | null {
    if (!this.canRedo()) return null
    return this.history[this.currentIndex + 1].description
  }

  /**
   * 批量操作开始
   */
  beginBatch(description: string): void {
    this.emit('batchBegin', { description })
  }

  /**
   * 批量操作结束
   */
  endBatch(): void {
    this.emit('batchEnd')
  }

  /**
   * 导出历史记录
   */
  exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex,
      maxHistorySize: this.maxHistorySize,
      exportTime: Date.now()
    }, null, 2)
  }

  /**
   * 导入历史记录
   * @param historyData 历史数据JSON字符串
   */
  importHistory(historyData: string): void {
    try {
      const data = JSON.parse(historyData)
      
      if (!Array.isArray(data.history)) {
        throw new Error('Invalid history data format')
      }

      this.history = data.history
      this.currentIndex = data.currentIndex ?? -1
      this.maxHistorySize = data.maxHistorySize ?? 50

      // 验证数据完整性
      this.validateHistory()

      this.emit('historyImported', { state: this.getState() })
    } catch (error) {
      this.emit('importError', { error })
      throw new Error(`Failed to import history: ${error}`)
    }
  }

  /**
   * 执行撤销操作
   */
  private async executeUndo(item: HistoryItem): Promise<void> {
    // 这里可以根据操作类型执行具体的撤销逻辑
    // 或者通过事件让外部处理
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Undo operation timeout'))
      }, 5000)

      const cleanup = () => {
        clearTimeout(timeout)
        this.off('undoExecuted', onUndoExecuted)
        this.off('undoFailed', onUndoFailed)
      }

      const onUndoExecuted = () => {
        cleanup()
        resolve()
      }

      const onUndoFailed = (error: any) => {
        cleanup()
        reject(error)
      }

      this.once('undoExecuted', onUndoExecuted)
      this.once('undoFailed', onUndoFailed)

      // 触发撤销执行事件
      this.emit('executeUndo', { item })
    })
  }

  /**
   * 执行重做操作
   */
  private async executeRedo(item: HistoryItem): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Redo operation timeout'))
      }, 5000)

      const cleanup = () => {
        clearTimeout(timeout)
        this.off('redoExecuted', onRedoExecuted)
        this.off('redoFailed', onRedoFailed)
      }

      const onRedoExecuted = () => {
        cleanup()
        resolve()
      }

      const onRedoFailed = (error: any) => {
        cleanup()
        reject(error)
      }

      this.once('redoExecuted', onRedoExecuted)
      this.once('redoFailed', onRedoFailed)

      // 触发重做执行事件
      this.emit('executeRedo', { item })
    })
  }

  /**
   * 验证历史记录完整性
   */
  private validateHistory(): void {
    // 检查索引范围
    if (this.currentIndex >= this.history.length) {
      this.currentIndex = this.history.length - 1
    }

    // 检查历史记录项的完整性
    this.history = this.history.filter(item => 
      item && typeof item.id === 'string' && typeof item.type === 'string'
    )
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 销毁历史管理器
   */
  destroy(): void {
    this.clear()
    this.removeAllListeners()
  }
}
