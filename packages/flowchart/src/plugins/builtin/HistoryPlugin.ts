/**
 * 历史记录插件
 * 
 * 为流程图编辑器添加撤销/重做功能
 */

import { BasePlugin } from '../BasePlugin'
import type { FlowchartEditor } from '../../core/FlowchartEditor'

/**
 * 历史记录项
 */
interface HistoryItem {
  /** 时间戳 */
  timestamp: number
  /** 图形数据 */
  data: any
  /** 操作描述 */
  description: string
}

/**
 * 历史记录插件配置
 */
export interface HistoryConfig {
  /** 最大历史记录数量 */
  maxSize?: number
  /** 是否启用键盘快捷键 */
  enableKeyboard?: boolean
  /** 撤销快捷键 */
  undoKey?: string
  /** 重做快捷键 */
  redoKey?: string
}

/**
 * 历史记录插件类
 */
export class HistoryPlugin extends BasePlugin {
  readonly name = 'history'
  readonly version = '1.0.0'
  readonly description = '历史记录插件，提供撤销/重做功能'

  private config: HistoryConfig
  private history: HistoryItem[] = []
  private currentIndex: number = -1
  private isUndoRedo: boolean = false
  private keyboardHandler?: (event: KeyboardEvent) => void

  /**
   * 构造函数
   * @param config 插件配置
   */
  constructor(config: HistoryConfig = {}) {
    super()
    this.config = {
      maxSize: 50,
      enableKeyboard: true,
      undoKey: 'ctrl+z',
      redoKey: 'ctrl+y',
      ...config
    }
  }

  /**
   * 安装插件
   */
  protected onInstall(): void {
    this.bindEvents()
    this.saveInitialState()
    
    if (this.config.enableKeyboard) {
      this.bindKeyboardEvents()
    }
  }

  /**
   * 卸载插件
   */
  protected onUninstall(): void {
    this.unbindEvents()
    this.unbindKeyboardEvents()
    this.clear()
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 监听图形数据变化
    this.addEventListener('history:record', this.onHistoryRecord.bind(this))
    this.addEventListener('node:add', this.onGraphChange.bind(this))
    this.addEventListener('node:delete', this.onGraphChange.bind(this))
    this.addEventListener('node:dnd', this.onGraphChange.bind(this))
    this.addEventListener('edge:add', this.onGraphChange.bind(this))
    this.addEventListener('edge:delete', this.onGraphChange.bind(this))
  }

  /**
   * 解绑事件
   */
  private unbindEvents(): void {
    this.removeEventListener('history:record', this.onHistoryRecord.bind(this))
    this.removeEventListener('node:add', this.onGraphChange.bind(this))
    this.removeEventListener('node:delete', this.onGraphChange.bind(this))
    this.removeEventListener('node:dnd', this.onGraphChange.bind(this))
    this.removeEventListener('edge:add', this.onGraphChange.bind(this))
    this.removeEventListener('edge:delete', this.onGraphChange.bind(this))
  }

  /**
   * 绑定键盘事件
   */
  private bindKeyboardEvents(): void {
    this.keyboardHandler = (event: KeyboardEvent) => {
      if (this.matchShortcut(event, this.config.undoKey!)) {
        event.preventDefault()
        this.undo()
      } else if (this.matchShortcut(event, this.config.redoKey!)) {
        event.preventDefault()
        this.redo()
      }
    }

    document.addEventListener('keydown', this.keyboardHandler)
  }

  /**
   * 解绑键盘事件
   */
  private unbindKeyboardEvents(): void {
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler)
      this.keyboardHandler = undefined
    }
  }

  /**
   * 匹配快捷键
   */
  private matchShortcut(event: KeyboardEvent, shortcut: string): boolean {
    const keys = shortcut.toLowerCase().split('+')
    const pressedKeys: string[] = []

    if (event.ctrlKey) pressedKeys.push('ctrl')
    if (event.altKey) pressedKeys.push('alt')
    if (event.shiftKey) pressedKeys.push('shift')
    if (event.metaKey) pressedKeys.push('meta')
    
    pressedKeys.push(event.key.toLowerCase())

    return keys.every(key => pressedKeys.includes(key)) && keys.length === pressedKeys.length
  }

  /**
   * 保存初始状态
   */
  private saveInitialState(): void {
    const lf = this.getLogicFlow()
    const data = lf.getGraphData()
    
    this.addHistoryItem({
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(data)),
      description: '初始状态'
    })
  }

  /**
   * 图形变化事件处理
   */
  private onGraphChange(): void {
    if (this.isUndoRedo) return

    // 延迟记录，避免频繁操作
    setTimeout(() => {
      this.recordCurrentState('图形变化')
    }, 100)
  }

  /**
   * 历史记录事件处理
   */
  private onHistoryRecord(data: { description?: string }): void {
    if (this.isUndoRedo) return
    
    this.recordCurrentState(data.description || '用户操作')
  }

  /**
   * 记录当前状态
   */
  private recordCurrentState(description: string): void {
    const lf = this.getLogicFlow()
    const data = lf.getGraphData()
    
    // 检查是否与上一个状态相同
    if (this.currentIndex >= 0) {
      const lastItem = this.history[this.currentIndex]
      if (JSON.stringify(lastItem.data) === JSON.stringify(data)) {
        return // 状态未变化，不记录
      }
    }

    this.addHistoryItem({
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(data)),
      description
    })
  }

  /**
   * 添加历史记录项
   */
  private addHistoryItem(item: HistoryItem): void {
    // 删除当前位置之后的所有记录
    this.history = this.history.slice(0, this.currentIndex + 1)
    
    // 添加新记录
    this.history.push(item)
    this.currentIndex = this.history.length - 1

    // 限制历史记录数量
    if (this.history.length > this.config.maxSize!) {
      this.history.shift()
      this.currentIndex--
    }

    console.log(`历史记录: ${item.description} (${this.currentIndex + 1}/${this.history.length})`)
  }

  /**
   * 撤销操作
   */
  public undo(): boolean {
    if (!this.canUndo()) {
      this.showNotification('无法撤销', 'warning')
      return false
    }

    this.currentIndex--
    const item = this.history[this.currentIndex]
    
    this.isUndoRedo = true
    const lf = this.getLogicFlow()
    lf.render(item.data)
    this.isUndoRedo = false

    this.showNotification(`撤销: ${item.description}`, 'success')
    console.log(`撤销到: ${item.description} (${this.currentIndex + 1}/${this.history.length})`)
    
    return true
  }

  /**
   * 重做操作
   */
  public redo(): boolean {
    if (!this.canRedo()) {
      this.showNotification('无法重做', 'warning')
      return false
    }

    this.currentIndex++
    const item = this.history[this.currentIndex]
    
    this.isUndoRedo = true
    const lf = this.getLogicFlow()
    lf.render(item.data)
    this.isUndoRedo = false

    this.showNotification(`重做: ${item.description}`, 'success')
    console.log(`重做到: ${item.description} (${this.currentIndex + 1}/${this.history.length})`)
    
    return true
  }

  /**
   * 检查是否可以撤销
   */
  public canUndo(): boolean {
    return this.currentIndex > 0
  }

  /**
   * 检查是否可以重做
   */
  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * 清空历史记录
   */
  public clear(): void {
    this.history = []
    this.currentIndex = -1
    console.log('历史记录已清空')
  }

  /**
   * 获取历史记录列表
   */
  public getHistory(): HistoryItem[] {
    return [...this.history]
  }

  /**
   * 获取当前历史记录索引
   */
  public getCurrentIndex(): number {
    return this.currentIndex
  }

  /**
   * 跳转到指定历史记录
   */
  public goTo(index: number): boolean {
    if (index < 0 || index >= this.history.length) {
      this.showNotification('无效的历史记录索引', 'error')
      return false
    }

    this.currentIndex = index
    const item = this.history[this.currentIndex]
    
    this.isUndoRedo = true
    const lf = this.getLogicFlow()
    lf.render(item.data)
    this.isUndoRedo = false

    this.showNotification(`跳转到: ${item.description}`, 'success')
    console.log(`跳转到: ${item.description} (${this.currentIndex + 1}/${this.history.length})`)
    
    return true
  }

  /**
   * 手动记录当前状态
   */
  public record(description: string = '手动记录'): void {
    this.recordCurrentState(description)
  }

  /**
   * 设置配置
   */
  public setConfig(config: Partial<HistoryConfig>): void {
    const oldConfig = this.config
    this.config = { ...this.config, ...config }

    // 如果键盘快捷键配置发生变化，重新绑定
    if (this.installed && oldConfig.enableKeyboard !== this.config.enableKeyboard) {
      this.unbindKeyboardEvents()
      if (this.config.enableKeyboard) {
        this.bindKeyboardEvents()
      }
    }
  }
}
