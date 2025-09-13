/**
 * @file 历史管理器
 * @description 提供撤销/重做功能
 */

import type { Layer, LayerSystem } from './layer-system'

/**
 * 操作类型
 */
export enum ActionType {
  /** 添加图层 */
  ADD_LAYER = 'add_layer',
  /** 删除图层 */
  REMOVE_LAYER = 'remove_layer',
  /** 更新图层 */
  UPDATE_LAYER = 'update_layer',
  /** 移动图层 */
  MOVE_LAYER = 'move_layer',
  /** 批量操作 */
  BATCH_ACTIONS = 'batch_actions'
}

/**
 * 历史记录项
 */
export interface HistoryItem {
  /** 操作类型 */
  type: ActionType
  /** 图层ID */
  layerId?: string
  /** 图层数据 */
  layerData?: Layer
  /** 旧数据 */
  oldData?: any
  /** 新数据 */
  newData?: any
  /** 批量操作 */
  actions?: HistoryItem[]
  /** 描述 */
  description: string
}

/**
 * 历史管理器配置
 */
export interface HistoryManagerConfig {
  /** 最大历史记录数量 */
  maxHistoryItems: number
}

/**
 * 历史管理器
 */
export class HistoryManager {
  /** 图层系统 */
  private layerSystem: LayerSystem

  /** 历史记录 */
  private history: HistoryItem[] = []

  /** 当前历史位置 */
  private currentIndex: number = -1

  /** 配置选项 */
  private config: HistoryManagerConfig

  /** 是否正在执行撤销/重做操作 */
  private isUndoRedoing: boolean = false

  /** 批量操作收集器 */
  private batchActions: HistoryItem[] | null = null

  /** 事件监听器 */
  private eventListeners = new Map<string, Set<Function>>()

  /** 默认配置 */
  private static readonly DEFAULT_CONFIG: HistoryManagerConfig = {
    maxHistoryItems: 50
  }

  /**
   * 构造函数
   */
  constructor(layerSystem: LayerSystem, config: Partial<HistoryManagerConfig> = {}) {
    this.layerSystem = layerSystem
    this.config = { ...HistoryManager.DEFAULT_CONFIG, ...config }
    this.bindEvents()
  }

  /**
   * 绑定图层系统事件
   */
  private bindEvents(): void {
    // 监听图层系统事件
    this.layerSystem.on('layerAdded', (data: any) => {
      if (this.isUndoRedoing) return
      this.addHistory({
        type: ActionType.ADD_LAYER,
        layerId: data.layerId,
        layerData: JSON.parse(JSON.stringify(data.layer)),
        description: `添加图层 "${data.layer.name}"`
      })
    })

    this.layerSystem.on('layerRemoved', (data: any) => {
      if (this.isUndoRedoing) return
      this.addHistory({
        type: ActionType.REMOVE_LAYER,
        layerId: data.layerId,
        layerData: JSON.parse(JSON.stringify(data.layer)),
        description: `删除图层 "${data.layer.name}"`
      })
    })

    this.layerSystem.on('layerUpdated', (data: any) => {
      if (this.isUndoRedoing) return
      this.addHistory({
        type: ActionType.UPDATE_LAYER,
        layerId: data.layerId,
        oldData: JSON.parse(JSON.stringify(data.oldValue)),
        newData: JSON.parse(JSON.stringify(data.layer)),
        description: `更新图层 "${data.layer.name}"`
      })
    })

    this.layerSystem.on('layerMoved', (data: any) => {
      if (this.isUndoRedoing) return
      this.addHistory({
        type: ActionType.MOVE_LAYER,
        layerId: data.layerId,
        oldData: data.oldValue, // 旧索引
        newData: data.newValue, // 新索引
        description: `移动图层 "${data.layer.name}"`
      })
    })
  }

  /**
   * 添加历史记录
   */
  private addHistory(item: HistoryItem): void {
    // 如果正在收集批量操作，则添加到批量操作中
    if (this.batchActions) {
      this.batchActions.push(item)
      return
    }

    // 如果当前不在历史尽头，则删除后面的历史
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // 添加新历史
    this.history.push(item)
    this.currentIndex = this.history.length - 1

    // 限制历史记录数量
    if (this.history.length > this.config.maxHistoryItems) {
      this.history.shift()
      this.currentIndex--
    }

    // 触发事件
    this.emit('historyAdded', { item, historyLength: this.history.length, currentIndex: this.currentIndex })
  }

  /**
   * 开始批量操作
   */
  startBatch(): void {
    if (this.batchActions !== null) {
      console.warn('Already in batch mode')
      return
    }
    this.batchActions = []
  }

  /**
   * 结束批量操作
   */
  endBatch(description: string = '批量操作'): void {
    if (this.batchActions === null) {
      console.warn('Not in batch mode')
      return
    }

    if (this.batchActions.length === 0) {
      // 空批量操作，直接重置
      this.batchActions = null
      return
    }

    // 创建批量操作历史项
    const batchItem: HistoryItem = {
      type: ActionType.BATCH_ACTIONS,
      actions: [...this.batchActions],
      description
    }

    // 重置批量操作收集器
    this.batchActions = null

    // 添加批量操作到历史
    this.addHistory(batchItem)
  }

  /**
   * 撤销操作
   */
  undo(): boolean {
    if (!this.canUndo()) return false

    this.isUndoRedoing = true
    const item = this.history[this.currentIndex]

    try {
      if (item.type === ActionType.BATCH_ACTIONS && item.actions) {
        // 批量操作，从后向前撤销
        for (let i = item.actions.length - 1; i >= 0; i--) {
          this.undoAction(item.actions[i])
        }
      } else {
        this.undoAction(item)
      }

      this.currentIndex--
      this.emit('historyChanged', { direction: 'undo', currentIndex: this.currentIndex })
      return true
    } catch (error) {
      console.error('Error undoing action:', error)
      return false
    } finally {
      this.isUndoRedoing = false
    }
  }

  /**
   * 重做操作
   */
  redo(): boolean {
    if (!this.canRedo()) return false

    this.isUndoRedoing = true
    const item = this.history[this.currentIndex + 1]

    try {
      if (item.type === ActionType.BATCH_ACTIONS && item.actions) {
        // 批量操作，从前向后重做
        for (const action of item.actions) {
          this.redoAction(action)
        }
      } else {
        this.redoAction(item)
      }

      this.currentIndex++
      this.emit('historyChanged', { direction: 'redo', currentIndex: this.currentIndex })
      return true
    } catch (error) {
      console.error('Error redoing action:', error)
      return false
    } finally {
      this.isUndoRedoing = false
    }
  }

  /**
   * 撤销单个操作
   */
  private undoAction(item: HistoryItem): void {
    switch (item.type) {
      case ActionType.ADD_LAYER:
        if (item.layerId) {
          this.layerSystem.removeLayer(item.layerId)
        }
        break

      case ActionType.REMOVE_LAYER:
        if (item.layerData) {
          this.layerSystem.addLayer(item.layerData)
        }
        break

      case ActionType.UPDATE_LAYER:
        if (item.layerId && item.oldData) {
          this.layerSystem.updateLayer(item.layerId, item.oldData)
        }
        break

      case ActionType.MOVE_LAYER:
        if (item.layerId && item.oldData !== undefined) {
          this.layerSystem.moveLayer(item.layerId, item.oldData)
        }
        break
    }
  }

  /**
   * 重做单个操作
   */
  private redoAction(item: HistoryItem): void {
    switch (item.type) {
      case ActionType.ADD_LAYER:
        if (item.layerData) {
          this.layerSystem.addLayer(item.layerData)
        }
        break

      case ActionType.REMOVE_LAYER:
        if (item.layerId) {
          this.layerSystem.removeLayer(item.layerId)
        }
        break

      case ActionType.UPDATE_LAYER:
        if (item.layerId && item.newData) {
          this.layerSystem.updateLayer(item.layerId, item.newData)
        }
        break

      case ActionType.MOVE_LAYER:
        if (item.layerId && item.newData !== undefined) {
          this.layerSystem.moveLayer(item.layerId, item.newData)
        }
        break
    }
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex >= 0
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * 获取历史记录
   */
  getHistory(): HistoryItem[] {
    return [...this.history]
  }

  /**
   * 获取当前索引
   */
  getCurrentIndex(): number {
    return this.currentIndex
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.history = []
    this.currentIndex = -1
    this.emit('historyCleared', {})
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.eventListeners.delete(event)
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error('Error in history event listener:', error)
        }
      })
    }
  }
}
