/**
 * 生命周期管理器
 * 
 * 管理图表的完整生命周期，包括：
 * - 初始化状态管理
 * - 延迟加载和懒加载
 * - 可见性检测
 * - 资源管理
 * - 状态转换
 */

import type { ECharts } from 'echarts'
import type { ChartConfig } from '../core/types'

/**
 * 图表生命周期状态
 */
export enum ChartLifecycleState {
  /** 未初始化 */
  UNINITIALIZED = 'uninitialized',
  /** 初始化中 */
  INITIALIZING = 'initializing',
  /** 已初始化 */
  INITIALIZED = 'initialized',
  /** 渲染中 */
  RENDERING = 'rendering',
  /** 已渲染 */
  RENDERED = 'rendered',
  /** 暂停 */
  PAUSED = 'paused',
  /** 销毁中 */
  DISPOSING = 'disposing',
  /** 已销毁 */
  DISPOSED = 'disposed',
  /** 错误状态 */
  ERROR = 'error'
}

/**
 * 生命周期配置
 */
export interface LifecycleConfig {
  /** 是否启用懒加载 */
  lazyLoad?: boolean
  /** 是否启用可见性检测 */
  visibilityDetection?: boolean
  /** 可见性阈值 */
  visibilityThreshold?: number
  /** 初始化延迟（毫秒） */
  initDelay?: number
  /** 是否自动暂停不可见的图表 */
  autoPause?: boolean
  /** 资源清理延迟（毫秒） */
  cleanupDelay?: number
}

/**
 * 状态变化事件数据
 */
export interface StateChangeEvent {
  /** 之前的状态 */
  previousState: ChartLifecycleState
  /** 当前状态 */
  currentState: ChartLifecycleState
  /** 状态变化时间 */
  timestamp: number
  /** 额外数据 */
  data?: any
}

/**
 * 生命周期管理器类
 */
export class LifecycleManager {
  /** 当前状态 */
  private _currentState: ChartLifecycleState = ChartLifecycleState.UNINITIALIZED
  
  /** 容器元素 */
  private _container: HTMLElement | null = null
  
  /** ECharts 实例 */
  private _echarts: ECharts | null = null
  
  /** 图表配置 */
  private _config: ChartConfig | null = null
  
  /** 生命周期配置 */
  private _lifecycleConfig: LifecycleConfig
  
  /** 状态变化监听器 */
  private _stateListeners: Map<ChartLifecycleState, Function[]> = new Map()
  
  /** IntersectionObserver 实例 */
  private _intersectionObserver: IntersectionObserver | null = null
  
  /** 是否可见 */
  private _isVisible = true
  
  /** 初始化定时器 */
  private _initTimer: number | null = null
  
  /** 清理定时器 */
  private _cleanupTimer: number | null = null
  
  /** 状态历史 */
  private _stateHistory: StateChangeEvent[] = []

  /**
   * 构造函数
   * @param config - 生命周期配置
   */
  constructor(config: LifecycleConfig = {}) {
    this._lifecycleConfig = {
      lazyLoad: false,
      visibilityDetection: true,
      visibilityThreshold: 0.1,
      initDelay: 0,
      autoPause: true,
      cleanupDelay: 5000,
      ...config
    }
  }

  /**
   * 初始化生命周期管理器
   * @param container - 容器元素
   * @param echarts - ECharts 实例
   * @param config - 图表配置
   */
  initialize(container: HTMLElement, echarts: ECharts | null, config: ChartConfig): void {
    this._container = container
    this._echarts = echarts
    this._config = config
    
    this._setState(ChartLifecycleState.INITIALIZING)
    
    // 设置可见性检测
    if (this._lifecycleConfig.visibilityDetection) {
      this._setupVisibilityDetection()
    }
    
    // 如果启用懒加载且当前不可见，则等待可见
    if (this._lifecycleConfig.lazyLoad && !this._isVisible) {
      return
    }
    
    // 延迟初始化
    if (this._lifecycleConfig.initDelay && this._lifecycleConfig.initDelay > 0) {
      this._initTimer = window.setTimeout(() => {
        this._completeInitialization()
      }, this._lifecycleConfig.initDelay)
    } else {
      this._completeInitialization()
    }
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): ChartLifecycleState {
    return this._currentState
  }

  /**
   * 获取状态历史
   */
  getStateHistory(): StateChangeEvent[] {
    return [...this._stateHistory]
  }

  /**
   * 是否可见
   */
  isVisible(): boolean {
    return this._isVisible
  }

  /**
   * 暂停图表
   */
  pause(): void {
    if (this._currentState === ChartLifecycleState.RENDERED) {
      this._setState(ChartLifecycleState.PAUSED)
    }
  }

  /**
   * 恢复图表
   */
  resume(): void {
    if (this._currentState === ChartLifecycleState.PAUSED) {
      this._setState(ChartLifecycleState.RENDERED)
    }
  }

  /**
   * 开始渲染
   */
  startRendering(): void {
    if (this._currentState === ChartLifecycleState.INITIALIZED) {
      this._setState(ChartLifecycleState.RENDERING)
    }
  }

  /**
   * 完成渲染
   */
  completeRendering(): void {
    if (this._currentState === ChartLifecycleState.RENDERING) {
      this._setState(ChartLifecycleState.RENDERED)
    }
  }

  /**
   * 设置错误状态
   * @param error - 错误信息
   */
  setError(error: any): void {
    this._setState(ChartLifecycleState.ERROR, { error })
  }

  /**
   * 监听状态变化
   * @param state - 要监听的状态
   * @param listener - 监听器函数
   */
  onStateChange(state: ChartLifecycleState, listener: (event: StateChangeEvent) => void): void {
    if (!this._stateListeners.has(state)) {
      this._stateListeners.set(state, [])
    }
    this._stateListeners.get(state)!.push(listener)
  }

  /**
   * 移除状态监听器
   * @param state - 状态
   * @param listener - 监听器函数
   */
  offStateChange(state: ChartLifecycleState, listener?: (event: StateChangeEvent) => void): void {
    if (!this._stateListeners.has(state)) return
    
    if (listener) {
      const listeners = this._stateListeners.get(state)!
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this._stateListeners.delete(state)
    }
  }

  /**
   * 销毁生命周期管理器
   */
  dispose(): void {
    this._setState(ChartLifecycleState.DISPOSING)
    
    // 清理定时器
    if (this._initTimer) {
      clearTimeout(this._initTimer)
      this._initTimer = null
    }
    
    if (this._cleanupTimer) {
      clearTimeout(this._cleanupTimer)
      this._cleanupTimer = null
    }
    
    // 清理观察器
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect()
      this._intersectionObserver = null
    }
    
    // 清理监听器
    this._stateListeners.clear()
    
    // 重置状态
    this._container = null
    this._echarts = null
    this._config = null
    this._stateHistory = []
    
    this._setState(ChartLifecycleState.DISPOSED)
  }

  /**
   * 完成初始化
   */
  private _completeInitialization(): void {
    this._setState(ChartLifecycleState.INITIALIZED)
  }

  /**
   * 设置状态
   * @param newState - 新状态
   * @param data - 额外数据
   */
  private _setState(newState: ChartLifecycleState, data?: any): void {
    const previousState = this._currentState
    this._currentState = newState
    
    const event: StateChangeEvent = {
      previousState,
      currentState: newState,
      timestamp: Date.now(),
      data
    }
    
    // 记录状态历史
    this._stateHistory.push(event)
    
    // 限制历史记录长度
    if (this._stateHistory.length > 100) {
      this._stateHistory.shift()
    }
    
    // 触发状态监听器
    const listeners = this._stateListeners.get(newState)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          console.error('状态监听器执行失败:', error)
        }
      })
    }
  }

  /**
   * 设置可见性检测
   */
  private _setupVisibilityDetection(): void {
    if (!this._container || typeof IntersectionObserver === 'undefined') return
    
    this._intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const wasVisible = this._isVisible
          this._isVisible = entry.isIntersecting
          
          // 可见性状态变化时的处理
          if (!wasVisible && this._isVisible) {
            // 从不可见变为可见
            if (this._lifecycleConfig.lazyLoad && this._currentState === ChartLifecycleState.INITIALIZING) {
              this._completeInitialization()
            } else if (this._lifecycleConfig.autoPause && this._currentState === ChartLifecycleState.PAUSED) {
              this.resume()
            }
          } else if (wasVisible && !this._isVisible) {
            // 从可见变为不可见
            if (this._lifecycleConfig.autoPause && this._currentState === ChartLifecycleState.RENDERED) {
              this.pause()
            }
          }
        }
      },
      {
        threshold: this._lifecycleConfig.visibilityThreshold
      }
    )
    
    this._intersectionObserver.observe(this._container)
  }
}
