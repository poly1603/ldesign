/**
 * 历史记录管理器
 * 负责管理编辑器的历史记录，支持撤销和重做功能
 */

import type { HistoryState, HistoryEntry, Selection, IEditor } from '../types'

/**
 * 历史记录管理器实现
 */
export class HistoryManager {
  /** 编辑器实例 */
  private editor: IEditor

  /** 历史记录状态 */
  private state: HistoryState

  /** 是否正在执行撤销/重做操作 */
  private isUndoRedo = false

  /** 防抖定时器 */
  private debounceTimer: number | null = null

  /** 防抖延迟时间 */
  private debounceDelay = 1000

  /** 最小变化间隔 */
  private minInterval = 500

  /** 上次记录时间 */
  private lastRecordTime = 0

  constructor(editor: IEditor, maxSize = 100) {
    this.editor = editor
    this.state = {
      stack: [],
      index: -1,
      maxSize
    }
  }

  /**
   * 初始化历史记录系统
   */
  init(): void {
    // 记录初始状态
    this.record('初始状态')
    
    // 绑定内容变化事件
    this.editor.events.on('contentChange' as any, this.handleContentChange.bind(this))
  }

  /**
   * 处理内容变化
   */
  private handleContentChange(): void {
    if (this.isUndoRedo) {
      return // 跳过撤销/重做时的内容变化
    }

    // 防抖处理
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = window.setTimeout(() => {
      const now = Date.now()
      if (now - this.lastRecordTime >= this.minInterval) {
        this.record('内容变化')
        this.lastRecordTime = now
      }
    }, this.debounceDelay)
  }

  /**
   * 记录历史状态
   * @param description 描述信息
   */
  record(description = '用户操作'): void {
    if (this.isUndoRedo) return

    const content = this.editor.getContent()
    const selection = this.editor.selection.getSelection()

    // 检查内容是否真的发生了变化
    if (this.state.stack.length > 0) {
      const lastEntry = this.state.stack[this.state.index]
      if (lastEntry && lastEntry.content === content) {
        return // 内容没有变化，不记录
      }
    }

    const entry: HistoryEntry = {
      content,
      selection,
      timestamp: Date.now(),
      description
    }

    // 如果当前不在最新位置，删除后面的历史记录
    if (this.state.index < this.state.stack.length - 1) {
      this.state.stack.splice(this.state.index + 1)
    }

    // 添加新记录
    this.state.stack.push(entry)
    this.state.index = this.state.stack.length - 1

    // 限制历史记录数量
    if (this.state.stack.length > this.state.maxSize) {
      this.state.stack.shift()
      this.state.index = Math.max(0, this.state.index - 1)
    }

    console.log(`History recorded: ${description}, stack size: ${this.state.stack.length}`)
  }

  /**
   * 撤销操作
   * @returns 是否成功撤销
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false
    }

    this.isUndoRedo = true
    
    try {
      this.state.index--
      const entry = this.state.stack[this.state.index]
      
      // 恢复内容
      this.editor.setContent(entry.content)
      
      // 恢复选区
      if (entry.selection) {
        setTimeout(() => {
          try {
            this.editor.selection.setSelection(entry.selection!)
          } catch (error) {
            console.warn('Failed to restore selection:', error)
          }
        }, 10)
      }

      console.log(`Undo: ${entry.description}`)
      return true
    } finally {
      this.isUndoRedo = false
    }
  }

  /**
   * 重做操作
   * @returns 是否成功重做
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false
    }

    this.isUndoRedo = true
    
    try {
      this.state.index++
      const entry = this.state.stack[this.state.index]
      
      // 恢复内容
      this.editor.setContent(entry.content)
      
      // 恢复选区
      if (entry.selection) {
        setTimeout(() => {
          try {
            this.editor.selection.setSelection(entry.selection!)
          } catch (error) {
            console.warn('Failed to restore selection:', error)
          }
        }, 10)
      }

      console.log(`Redo: ${entry.description}`)
      return true
    } finally {
      this.isUndoRedo = false
    }
  }

  /**
   * 检查是否可以撤销
   * @returns 是否可以撤销
   */
  canUndo(): boolean {
    return this.state.index > 0
  }

  /**
   * 检查是否可以重做
   * @returns 是否可以重做
   */
  canRedo(): boolean {
    return this.state.index < this.state.stack.length - 1
  }

  /**
   * 获取历史记录状态
   * @returns 历史记录状态
   */
  getState(): HistoryState {
    return { ...this.state }
  }

  /**
   * 获取当前历史记录条目
   * @returns 当前历史记录条目
   */
  getCurrentEntry(): HistoryEntry | null {
    if (this.state.index >= 0 && this.state.index < this.state.stack.length) {
      return this.state.stack[this.state.index]
    }
    return null
  }

  /**
   * 获取历史记录列表
   * @returns 历史记录列表
   */
  getHistory(): HistoryEntry[] {
    return [...this.state.stack]
  }

  /**
   * 跳转到指定的历史记录
   * @param index 历史记录索引
   * @returns 是否成功跳转
   */
  goTo(index: number): boolean {
    if (index < 0 || index >= this.state.stack.length) {
      return false
    }

    this.isUndoRedo = true
    
    try {
      this.state.index = index
      const entry = this.state.stack[index]
      
      // 恢复内容
      this.editor.setContent(entry.content)
      
      // 恢复选区
      if (entry.selection) {
        setTimeout(() => {
          try {
            this.editor.selection.setSelection(entry.selection!)
          } catch (error) {
            console.warn('Failed to restore selection:', error)
          }
        }, 10)
      }

      console.log(`Go to history: ${entry.description}`)
      return true
    } finally {
      this.isUndoRedo = false
    }
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.state.stack = []
    this.state.index = -1
    
    // 清理定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  /**
   * 重新开始记录
   */
  restart(): void {
    this.clear()
    this.record('重新开始')
  }

  /**
   * 设置最大历史记录数量
   * @param maxSize 最大数量
   */
  setMaxSize(maxSize: number): void {
    this.state.maxSize = Math.max(1, maxSize)
    
    // 如果当前记录数超过了新的最大值，删除旧记录
    while (this.state.stack.length > this.state.maxSize) {
      this.state.stack.shift()
      this.state.index = Math.max(0, this.state.index - 1)
    }
  }

  /**
   * 设置防抖延迟
   * @param delay 延迟时间（毫秒）
   */
  setDebounceDelay(delay: number): void {
    this.debounceDelay = Math.max(100, delay)
  }

  /**
   * 设置最小记录间隔
   * @param interval 间隔时间（毫秒）
   */
  setMinInterval(interval: number): void {
    this.minInterval = Math.max(0, interval)
  }

  /**
   * 获取历史记录统计信息
   */
  getStats(): {
    total: number
    current: number
    canUndo: boolean
    canRedo: boolean
    memoryUsage: number
  } {
    const memoryUsage = this.state.stack.reduce((total, entry) => {
      return total + entry.content.length + JSON.stringify(entry.selection || {}).length
    }, 0)

    return {
      total: this.state.stack.length,
      current: this.state.index + 1,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      memoryUsage
    }
  }

  /**
   * 创建历史记录快照
   */
  createSnapshot(): {
    content: string
    selection: Selection | null
    timestamp: number
  } {
    return {
      content: this.editor.getContent(),
      selection: this.editor.selection.getSelection(),
      timestamp: Date.now()
    }
  }

  /**
   * 从快照恢复
   * @param snapshot 快照数据
   */
  restoreSnapshot(snapshot: {
    content: string
    selection: Selection | null
    timestamp: number
  }): void {
    this.isUndoRedo = true
    
    try {
      this.editor.setContent(snapshot.content)
      
      if (snapshot.selection) {
        setTimeout(() => {
          try {
            this.editor.selection.setSelection(snapshot.selection!)
          } catch (error) {
            console.warn('Failed to restore selection from snapshot:', error)
          }
        }, 10)
      }
    } finally {
      this.isUndoRedo = false
    }
  }

  /**
   * 销毁历史记录管理器
   */
  destroy(): void {
    // 清理定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    // 清空历史记录
    this.clear()

    console.log('HistoryManager destroyed')
  }
}
