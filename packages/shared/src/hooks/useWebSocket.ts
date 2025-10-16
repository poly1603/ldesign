/**
 * WebSocket 连接 Hook
 * 
 * @description
 * 提供 WebSocket 连接管理功能，支持自动重连、心跳检测、消息队列等
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * WebSocket 状态
 */
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * WebSocket 配置
 */
export interface WebSocketConfig {
  /** 是否自动连接 */
  autoConnect?: boolean
  /** 是否自动重连 */
  autoReconnect?: boolean
  /** 重连延迟(ms) */
  reconnectDelay?: number
  /** 最大重连次数 */
  maxReconnectAttempts?: number
  /** 心跳间隔(ms) */
  heartbeatInterval?: number
  /** 心跳消息 */
  heartbeatMessage?: string | object
  /** 消息格式 */
  messageFormat?: 'text' | 'json' | 'binary'
  /** 连接超时(ms) */
  timeout?: number
  /** 子协议 */
  protocols?: string | string[]
  /** 连接成功回调 */
  onOpen?: (event: Event) => void
  /** 消息接收回调 */
  onMessage?: (data: any) => void
  /** 错误回调 */
  onError?: (error: Event) => void
  /** 关闭回调 */
  onClose?: (event: CloseEvent) => void
}

/**
 * WebSocket 消息
 */
export interface WebSocketMessage {
  /** 消息 ID */
  id: string
  /** 消息数据 */
  data: any
  /** 时间戳 */
  timestamp: number
  /** 消息类型 */
  type?: string
}

/**
 * useWebSocket Hook
 * 
 * @param url - WebSocket 服务器地址
 * @param config - 配置选项
 * @returns WebSocket 状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { state, send, connect, disconnect } = useWebSocket(
 *       'wss://example.com/socket',
 *       {
 *         autoConnect: true,
 *         autoReconnect: true,
 *         heartbeatInterval: 30000,
 *         messageFormat: 'json',
 *         onMessage: (data) => {
 *           
 *         }
 *       }
 *     )
 *     
 *     const sendMessage = () => {
 *       send({
 *         type: 'chat',
 *         content: 'Hello, WebSocket!'
 *       })
 *     }
 *     
 *     return {
 *       state,
 *       sendMessage,
 *       connect,
 *       disconnect
 *     }
 *   }
 * })
 * ```
 */
export function useWebSocket(
  url: string | Ref<string>,
  config: WebSocketConfig = {}
) {
  const {
    autoConnect = true,
    autoReconnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
    heartbeatMessage = 'ping',
    messageFormat = 'text',
    timeout = 10000,
    protocols,
    onOpen,
    onMessage,
    onError,
    onClose,
  } = config

  // 状态
  const status = ref<WebSocketStatus>('disconnected')
  const error = ref<Error | null>(null)
  const latency = ref<number>(0)
  const messageQueue = ref<WebSocketMessage[]>([])
  const reconnectCount = ref(0)
  const isConnecting = ref(false)

  // WebSocket 实例
  let ws: WebSocket | null = null
  let heartbeatTimer: NodeJS.Timeout | null = null
  let reconnectTimer: NodeJS.Timeout | null = null
  let connectTimeoutTimer: NodeJS.Timeout | null = null
  let lastPingTime = 0

  /**
   * 获取 WebSocket URL
   */
  const getUrl = (): string => {
    return typeof url === 'string' ? url : url.value
  }

  /**
   * 清理定时器
   */
  const clearTimers = (): void => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    
    if (connectTimeoutTimer) {
      clearTimeout(connectTimeoutTimer)
      connectTimeoutTimer = null
    }
  }

  /**
   * 开始心跳
   */
  const startHeartbeat = (): void => {
    if (!heartbeatInterval || heartbeatInterval <= 0) return
    
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        lastPingTime = Date.now()
        const message = typeof heartbeatMessage === 'string' 
          ? heartbeatMessage 
          : JSON.stringify(heartbeatMessage)
        ws.send(message)
      }
    }, heartbeatInterval)
  }

  /**
   * 处理消息
   */
  const handleMessage = (event: MessageEvent): void => {
    let data = event.data
    
    // 解析消息格式
    if (messageFormat === 'json') {
      try {
        data = JSON.parse(event.data)
      } catch (e) {
        console.error('Failed to parse JSON message:', e)
      }
    }
    
    // 计算延迟
    if (lastPingTime > 0) {
      latency.value = Date.now() - lastPingTime
      lastPingTime = 0
    }
    
    // 添加到消息队列
    const message: WebSocketMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      data,
      timestamp: Date.now(),
      type: data?.type,
    }
    messageQueue.value.push(message)
    
    // 限制队列大小
    if (messageQueue.value.length > 100) {
      messageQueue.value.shift()
    }
    
    // 执行回调
    onMessage?.(data)
  }

  /**
   * 连接 WebSocket
   */
  const connect = (): void => {
    if (isConnecting.value || (ws && ws.readyState === WebSocket.OPEN)) {
      return
    }
    
    isConnecting.value = true
    status.value = 'connecting'
    error.value = null
    
    try {
      ws = protocols 
        ? new WebSocket(getUrl(), protocols)
        : new WebSocket(getUrl())
      
      // 设置连接超时
      if (timeout > 0) {
        connectTimeoutTimer = setTimeout(() => {
          if (ws && ws.readyState === WebSocket.CONNECTING) {
            ws.close()
            error.value = new Error('Connection timeout')
            status.value = 'error'
            isConnecting.value = false
            
            // 尝试重连
            if (autoReconnect) {
              scheduleReconnect()
            }
          }
        }, timeout)
      }
      
      // 连接成功
      ws.onopen = (event) => {
        clearTimeout(connectTimeoutTimer!)
        status.value = 'connected'
        isConnecting.value = false
        reconnectCount.value = 0
        startHeartbeat()
        onOpen?.(event)
      }
      
      // 接收消息
      ws.onmessage = handleMessage
      
      // 连接错误
      ws.onerror = (event) => {
        error.value = new Error('WebSocket error')
        status.value = 'error'
        isConnecting.value = false
        onError?.(event)
      }
      
      // 连接关闭
      ws.onclose = (event) => {
        clearTimers()
        status.value = 'disconnected'
        isConnecting.value = false
        onClose?.(event)
        
        // 尝试重连
        if (autoReconnect && !event.wasClean) {
          scheduleReconnect()
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      status.value = 'error'
      isConnecting.value = false
      
      // 尝试重连
      if (autoReconnect) {
        scheduleReconnect()
      }
    }
  }

  /**
   * 调度重连
   */
  const scheduleReconnect = (): void => {
    if (reconnectCount.value >= maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      return
    }
    
    reconnectCount.value++
    const delay = reconnectDelay * Math.pow(2, reconnectCount.value - 1) // 指数退避
    
    reconnectTimer = setTimeout(() => {
      `)
      connect()
    }, delay)
  }

  /**
   * 断开连接
   */
  const disconnect = (): void => {
    clearTimers()
    reconnectCount.value = maxReconnectAttempts // 防止自动重连
    
    if (ws) {
      ws.close()
      ws = null
    }
    
    status.value = 'disconnected'
    isConnecting.value = false
  }

  /**
   * 发送消息
   */
  const send = (data: any): void => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected')
      return
    }
    
    const message = messageFormat === 'json' 
      ? JSON.stringify(data)
      : data
    
    ws.send(message)
  }

  /**
   * 清空消息队列
   */
  const clearMessages = (): void => {
    messageQueue.value = []
  }

  /**
   * 获取最新消息
   */
  const getLastMessage = (): WebSocketMessage | undefined => {
    return messageQueue.value[messageQueue.value.length - 1]
  }

  // 组件挂载时自动连接
  onMounted(() => {
    if (autoConnect) {
      connect()
    }
  })

  // 组件卸载时断开连接
  onUnmounted(() => {
    disconnect()
  })

  // 计算状态
  const state = {
    status,
    error,
    latency,
    messageQueue,
    reconnectCount,
    isConnecting,
  }

  return {
    state,
    connect,
    disconnect,
    send,
    clearMessages,
    getLastMessage,
  }
}
