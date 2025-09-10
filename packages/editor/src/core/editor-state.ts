/**
 * 编辑器状态管理器
 * 负责管理编辑器的状态，包括内容、选区、历史记录等
 */

import type { 
  EditorState, 
  HistoryState, 
  HistoryEntry, 
  Selection, 
  DeviceType, 
  PluginState 
} from '../types'
import { deepClone, getDeviceType } from '../utils'

/**
 * 编辑器状态管理器实现
 * 提供完整的状态管理功能，包括状态更新、历史记录、状态恢复等
 */
export class EditorStateManager {
  /** 当前状态 */
  private currentState: EditorState

  /** 状态变更监听器 */
  private stateChangeListeners: Array<(state: EditorState, prevState: EditorState) => void> = []

  /** 历史记录配置 */
  private historyConfig = {
    maxSize: 50,
    mergeInterval: 1000 // 1秒内的连续操作会被合并
  }

  constructor(initialContent = '', breakpoints = { mobile: 768, tablet: 1024 }) {
    this.currentState = {
      content: initialContent,
      selection: null,
      history: {
        stack: [],
        index: -1,
        maxSize: this.historyConfig.maxSize
      },
      focused: false,
      readonly: false,
      deviceType: getDeviceType(breakpoints) as DeviceType,
      plugins: {}
    }

    // 添加初始历史记录
    this.addHistoryEntry(initialContent, null)
  }

  /**
   * 获取当前状态
   * @returns 当前状态的深拷贝
   */
  getState(): EditorState {
    return deepClone(this.currentState)
  }

  /**
   * 更新状态
   * @param updates 状态更新对象
   * @param addToHistory 是否添加到历史记录
   */
  updateState(updates: Partial<EditorState>, addToHistory = false): void {
    const prevState = deepClone(this.currentState)
    
    // 更新状态
    this.currentState = {
      ...this.currentState,
      ...updates
    }

    // 如果内容发生变化且需要添加到历史记录
    if (addToHistory && updates.content !== undefined && updates.content !== prevState.content) {
      this.addHistoryEntry(updates.content, updates.selection || null)
    }

    // 通知状态变更监听器
    this.notifyStateChange(this.currentState, prevState)
  }

  /**
   * 设置内容
   * @param content 新内容
   * @param addToHistory 是否添加到历史记录
   */
  setContent(content: string, addToHistory = true): void {
    this.updateState({ content }, addToHistory)
  }

  /**
   * 获取内容
   * @returns 当前内容
   */
  getContent(): string {
    return this.currentState.content
  }

  /**
   * 设置选区
   * @param selection 选区对象
   */
  setSelection(selection: Selection | null): void {
    this.updateState({ selection })
  }

  /**
   * 获取选区
   * @returns 当前选区
   */
  getSelection(): Selection | null {
    return this.currentState.selection
  }

  /**
   * 设置焦点状态
   * @param focused 是否聚焦
   */
  setFocused(focused: boolean): void {
    this.updateState({ focused })
  }

  /**
   * 获取焦点状态
   * @returns 是否聚焦
   */
  isFocused(): boolean {
    return this.currentState.focused
  }

  /**
   * 设置只读状态
   * @param readonly 是否只读
   */
  setReadonly(readonly: boolean): void {
    this.updateState({ readonly })
  }

  /**
   * 获取只读状态
   * @returns 是否只读
   */
  isReadonly(): boolean {
    return this.currentState.readonly
  }

  /**
   * 设置设备类型
   * @param deviceType 设备类型
   */
  setDeviceType(deviceType: DeviceType): void {
    this.updateState({ deviceType })
  }

  /**
   * 获取设备类型
   * @returns 设备类型
   */
  getDeviceType(): DeviceType {
    return this.currentState.deviceType
  }

  /**
   * 设置插件状态
   * @param pluginName 插件名称
   * @param state 插件状态
   */
  setPluginState(pluginName: string, state: PluginState): void {
    const plugins = { ...this.currentState.plugins }
    plugins[pluginName] = state
    this.updateState({ plugins })
  }

  /**
   * 获取插件状态
   * @param pluginName 插件名称
   * @returns 插件状态
   */
  getPluginState(pluginName: string): PluginState | undefined {
    return this.currentState.plugins[pluginName]
  }

  /**
   * 移除插件状态
   * @param pluginName 插件名称
   */
  removePluginState(pluginName: string): void {
    const plugins = { ...this.currentState.plugins }
    delete plugins[pluginName]
    this.updateState({ plugins })
  }

  /**
   * 添加历史记录条目
   * @param content 内容
   * @param selection 选区
   */
  private addHistoryEntry(content: string, selection: Selection | null): void {
    const now = Date.now()
    const history = { ...this.currentState.history }
    
    // 检查是否应该与上一个条目合并
    if (history.stack.length > 0 && history.index >= 0) {
      const lastEntry = history.stack[history.index]
      if (now - lastEntry.timestamp < this.historyConfig.mergeInterval) {
        // 更新最后一个条目而不是创建新条目
        history.stack[history.index] = {
          content,
          selection: deepClone(selection),
          timestamp: now
        }
        this.currentState.history = history
        return
      }
    }

    // 创建新的历史记录条目
    const entry: HistoryEntry = {
      content,
      selection: deepClone(selection),
      timestamp: now
    }

    // 如果当前不在历史记录的末尾，则删除后续的记录
    if (history.index < history.stack.length - 1) {
      history.stack = history.stack.slice(0, history.index + 1)
    }

    // 添加新条目
    history.stack.push(entry)
    history.index = history.stack.length - 1

    // 限制历史记录大小
    if (history.stack.length > history.maxSize) {
      history.stack.shift()
      history.index--
    }

    this.currentState.history = history
  }

  /**
   * 撤销操作
   * @returns 是否成功撤销
   */
  undo(): boolean {
    const history = this.currentState.history
    
    if (history.index > 0) {
      history.index--
      const entry = history.stack[history.index]
      
      this.updateState({
        content: entry.content,
        selection: entry.selection,
        history
      })
      
      return true
    }
    
    return false
  }

  /**
   * 重做操作
   * @returns 是否成功重做
   */
  redo(): boolean {
    const history = this.currentState.history
    
    if (history.index < history.stack.length - 1) {
      history.index++
      const entry = history.stack[history.index]
      
      this.updateState({
        content: entry.content,
        selection: entry.selection,
        history
      })
      
      return true
    }
    
    return false
  }

  /**
   * 检查是否可以撤销
   * @returns 是否可以撤销
   */
  canUndo(): boolean {
    return this.currentState.history.index > 0
  }

  /**
   * 检查是否可以重做
   * @returns 是否可以重做
   */
  canRedo(): boolean {
    const history = this.currentState.history
    return history.index < history.stack.length - 1
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    const history: HistoryState = {
      stack: [],
      index: -1,
      maxSize: this.historyConfig.maxSize
    }
    
    this.updateState({ history })
    
    // 添加当前状态到历史记录
    this.addHistoryEntry(this.currentState.content, this.currentState.selection)
  }

  /**
   * 设置历史记录配置
   * @param config 配置对象
   */
  setHistoryConfig(config: Partial<typeof this.historyConfig>): void {
    this.historyConfig = { ...this.historyConfig, ...config }
    
    // 更新历史记录最大大小
    if (config.maxSize !== undefined) {
      const history = { ...this.currentState.history }
      history.maxSize = config.maxSize
      
      // 如果当前历史记录超过新的限制，则截断
      if (history.stack.length > config.maxSize) {
        const removeCount = history.stack.length - config.maxSize
        history.stack = history.stack.slice(removeCount)
        history.index = Math.max(0, history.index - removeCount)
      }
      
      this.updateState({ history })
    }
  }

  /**
   * 添加状态变更监听器
   * @param listener 监听器函数
   */
  onStateChange(listener: (state: EditorState, prevState: EditorState) => void): void {
    this.stateChangeListeners.push(listener)
  }

  /**
   * 移除状态变更监听器
   * @param listener 监听器函数
   */
  offStateChange(listener: (state: EditorState, prevState: EditorState) => void): void {
    const index = this.stateChangeListeners.indexOf(listener)
    if (index > -1) {
      this.stateChangeListeners.splice(index, 1)
    }
  }

  /**
   * 通知状态变更
   * @param state 当前状态
   * @param prevState 之前状态
   */
  private notifyStateChange(state: EditorState, prevState: EditorState): void {
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(state, prevState)
      } catch (error) {
        console.error('Error in state change listener:', error)
      }
    })
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    this.stateChangeListeners = []
  }
}
