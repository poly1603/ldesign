/**
 * 实时数据管理器
 * 
 * 提供实时数据更新、流式数据处理、数据聚合等功能
 */

import type { ChartData, DataPoint, DataSeries } from '../core/types'
import { EventEmitter } from '../events/EventManager'

/**
 * 实时数据配置接口
 */
export interface RealTimeConfig {
  /** 是否启用实时数据 */
  enabled?: boolean
  /** 更新间隔（毫秒） */
  updateInterval?: number
  /** 最大数据点数量 */
  maxDataPoints?: number
  /** 是否启用数据聚合 */
  enableAggregation?: boolean
  /** 聚合窗口大小 */
  aggregationWindow?: number
  /** 是否启用虚拟滚动 */
  enableVirtualScrolling?: boolean
  /** 缓冲区大小 */
  bufferSize?: number
}

/**
 * WebSocket 配置接口
 */
export interface WebSocketConfig {
  /** WebSocket URL */
  url: string
  /** 重连间隔（毫秒） */
  reconnectInterval?: number
  /** 最大重连次数 */
  maxReconnectAttempts?: number
  /** 心跳间隔（毫秒） */
  heartbeatInterval?: number
  /** 协议 */
  protocols?: string | string[]
}

/**
 * 数据聚合类型
 */
export type AggregationType = 'sum' | 'avg' | 'max' | 'min' | 'count'

/**
 * 聚合配置接口
 */
export interface AggregationConfig {
  /** 聚合类型 */
  type: AggregationType
  /** 聚合字段 */
  field: string
  /** 时间窗口（毫秒） */
  timeWindow: number
  /** 分组字段 */
  groupBy?: string
}

/**
 * 实时数据管理器
 */
export class RealTimeDataManager extends EventEmitter {
  private _config: Required<RealTimeConfig>
  private _websocket: WebSocket | null = null
  private _websocketConfig: WebSocketConfig | null = null
  private _dataBuffer: DataPoint[] = []
  private _aggregatedData: Map<string, any> = new Map()
  private _updateTimer: number | null = null
  private _reconnectTimer: number | null = null
  private _heartbeatTimer: number | null = null
  private _reconnectAttempts = 0
  private _isConnected = false
  private _virtualScrollOffset = 0
  private _virtualScrollSize = 1000

  constructor(config: RealTimeConfig = {}) {
    super()
    
    this._config = {
      enabled: config.enabled ?? true,
      updateInterval: config.updateInterval ?? 1000,
      maxDataPoints: config.maxDataPoints ?? 10000,
      enableAggregation: config.enableAggregation ?? false,
      aggregationWindow: config.aggregationWindow ?? 60000,
      enableVirtualScrolling: config.enableVirtualScrolling ?? false,
      bufferSize: config.bufferSize ?? 1000
    }
  }

  /**
   * 启动实时数据处理
   */
  start(): void {
    if (!this._config.enabled) return

    this._startUpdateTimer()
    this.emit('started')
  }

  /**
   * 停止实时数据处理
   */
  stop(): void {
    this._stopUpdateTimer()
    this._disconnectWebSocket()
    this.emit('stopped')
  }

  /**
   * 连接 WebSocket
   * @param config - WebSocket 配置
   */
  connectWebSocket(config: WebSocketConfig): void {
    this._websocketConfig = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    }

    this._connectWebSocket()
  }

  /**
   * 断开 WebSocket 连接
   */
  disconnectWebSocket(): void {
    this._disconnectWebSocket()
  }

  /**
   * 添加数据点
   * @param dataPoint - 数据点
   */
  addDataPoint(dataPoint: DataPoint): void {
    this._dataBuffer.push(dataPoint)

    // 限制缓冲区大小
    if (this._dataBuffer.length > this._config.bufferSize) {
      this._dataBuffer.shift()
    }

    this.emit('dataAdded', dataPoint)
  }

  /**
   * 批量添加数据点
   * @param dataPoints - 数据点数组
   */
  addDataPoints(dataPoints: DataPoint[]): void {
    this._dataBuffer.push(...dataPoints)

    // 限制缓冲区大小
    while (this._dataBuffer.length > this._config.bufferSize) {
      this._dataBuffer.shift()
    }

    this.emit('dataBatchAdded', dataPoints)
  }

  /**
   * 获取缓冲区数据
   * @returns 缓冲区数据
   */
  getBufferData(): DataPoint[] {
    if (this._config.enableVirtualScrolling) {
      return this._getVirtualScrollData()
    }
    return [...this._dataBuffer]
  }

  /**
   * 清空缓冲区
   */
  clearBuffer(): void {
    this._dataBuffer = []
    this._aggregatedData.clear()
    this.emit('bufferCleared')
  }

  /**
   * 设置虚拟滚动参数
   * @param offset - 偏移量
   * @param size - 大小
   */
  setVirtualScroll(offset: number, size: number): void {
    this._virtualScrollOffset = offset
    this._virtualScrollSize = size
  }

  /**
   * 配置数据聚合
   * @param config - 聚合配置
   */
  configureAggregation(config: AggregationConfig): void {
    if (!this._config.enableAggregation) return

    const key = `${config.type}_${config.field}_${config.timeWindow}`
    this._aggregatedData.set(key, config)
  }

  /**
   * 获取聚合数据
   * @param key - 聚合键
   * @returns 聚合结果
   */
  getAggregatedData(key: string): any {
    return this._aggregatedData.get(key)
  }

  /**
   * 获取连接状态
   * @returns 是否已连接
   */
  isConnected(): boolean {
    return this._isConnected
  }

  /**
   * 获取缓冲区大小
   * @returns 缓冲区大小
   */
  getBufferSize(): number {
    return this._dataBuffer.length
  }

  /**
   * 更新配置
   * @param config - 新配置
   */
  updateConfig(config: Partial<RealTimeConfig>): void {
    Object.assign(this._config, config)
    
    if (!this._config.enabled) {
      this.stop()
    } else if (!this._updateTimer) {
      this.start()
    }
  }

  /**
   * 启动更新定时器
   */
  private _startUpdateTimer(): void {
    if (this._updateTimer) return

    this._updateTimer = (typeof window !== 'undefined' ? window.setInterval : setInterval)(() => {
      this._processData()
    }, this._config.updateInterval)
  }

  /**
   * 停止更新定时器
   */
  private _stopUpdateTimer(): void {
    if (this._updateTimer) {
      (typeof window !== 'undefined' ? window.clearInterval : clearInterval)(this._updateTimer)
      this._updateTimer = null
    }
  }

  /**
   * 连接 WebSocket
   */
  private _connectWebSocket(): void {
    if (!this._websocketConfig || typeof WebSocket === 'undefined') return

    try {
      this._websocket = new WebSocket(
        this._websocketConfig.url,
        this._websocketConfig.protocols
      )

      this._websocket.onopen = () => {
        this._isConnected = true
        this._reconnectAttempts = 0
        this._startHeartbeat()
        this.emit('connected')
      }

      this._websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this._handleWebSocketData(data)
        } catch (error) {
          this.emit('error', new Error(`解析 WebSocket 数据失败: ${error}`))
        }
      }

      this._websocket.onclose = () => {
        this._isConnected = false
        this._stopHeartbeat()
        this.emit('disconnected')
        this._scheduleReconnect()
      }

      this._websocket.onerror = (error) => {
        this.emit('error', new Error(`WebSocket 错误: ${error}`))
      }
    } catch (error) {
      this.emit('error', new Error(`WebSocket 连接失败: ${error}`))
    }
  }

  /**
   * 断开 WebSocket 连接
   */
  private _disconnectWebSocket(): void {
    if (this._websocket) {
      this._websocket.close()
      this._websocket = null
    }
    
    this._isConnected = false
    this._stopHeartbeat()
    this._stopReconnectTimer()
  }

  /**
   * 处理 WebSocket 数据
   * @param data - 接收到的数据
   */
  private _handleWebSocketData(data: any): void {
    if (Array.isArray(data)) {
      this.addDataPoints(data)
    } else {
      this.addDataPoint(data)
    }
  }

  /**
   * 安排重连
   */
  private _scheduleReconnect(): void {
    if (!this._websocketConfig || 
        this._reconnectAttempts >= this._websocketConfig.maxReconnectAttempts!) {
      return
    }

    this._reconnectTimer = (typeof window !== 'undefined' ? window.setTimeout : setTimeout)(() => {
      this._reconnectAttempts++
      this._connectWebSocket()
    }, this._websocketConfig.reconnectInterval!)
  }

  /**
   * 停止重连定时器
   */
  private _stopReconnectTimer(): void {
    if (this._reconnectTimer) {
      (typeof window !== 'undefined' ? window.clearTimeout : clearTimeout)(this._reconnectTimer)
      this._reconnectTimer = null
    }
  }

  /**
   * 启动心跳
   */
  private _startHeartbeat(): void {
    if (!this._websocketConfig?.heartbeatInterval) return

    this._heartbeatTimer = (typeof window !== 'undefined' ? window.setInterval : setInterval)(() => {
      if (this._websocket?.readyState === WebSocket.OPEN) {
        this._websocket.send(JSON.stringify({ type: 'ping' }))
      }
    }, this._websocketConfig.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private _stopHeartbeat(): void {
    if (this._heartbeatTimer) {
      (typeof window !== 'undefined' ? window.clearInterval : clearInterval)(this._heartbeatTimer)
      this._heartbeatTimer = null
    }
  }

  /**
   * 处理数据
   */
  private _processData(): void {
    if (this._dataBuffer.length === 0) return

    // 限制数据点数量
    if (this._dataBuffer.length > this._config.maxDataPoints) {
      const excess = this._dataBuffer.length - this._config.maxDataPoints
      this._dataBuffer.splice(0, excess)
    }

    // 执行数据聚合
    if (this._config.enableAggregation) {
      this._performAggregation()
    }

    this.emit('dataProcessed', this.getBufferData())
  }

  /**
   * 执行数据聚合
   */
  private _performAggregation(): void {
    // 这里可以实现具体的聚合逻辑
    // 例如：按时间窗口聚合数据
    const now = Date.now()
    const windowStart = now - this._config.aggregationWindow

    const windowData = this._dataBuffer.filter(point => {
      const timestamp = typeof point.value === 'object' && point.value.timestamp
        ? point.value.timestamp
        : now
      return timestamp >= windowStart
    })

    // 发出聚合数据事件
    this.emit('dataAggregated', windowData)
  }

  /**
   * 获取虚拟滚动数据
   * @returns 虚拟滚动数据
   */
  private _getVirtualScrollData(): DataPoint[] {
    const start = this._virtualScrollOffset
    const end = start + this._virtualScrollSize
    return this._dataBuffer.slice(start, end)
  }
}

/**
 * 创建实时数据管理器
 * @param config - 配置
 * @returns 实时数据管理器实例
 */
export function createRealTimeDataManager(config?: RealTimeConfig): RealTimeDataManager {
  return new RealTimeDataManager(config)
}
