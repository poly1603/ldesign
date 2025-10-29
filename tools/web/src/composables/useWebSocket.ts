/**
 * WebSocket 组合式函数
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { WS_BASE_URL } from '../config/env'

export interface WSMessage<T = any> {
  type: string
  data: T
  timestamp: number
}

export function useWebSocket(url?: string) {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  const reconnectTimer = ref<number | null>(null)
  const messageHandlers = new Map<string, Set<(data: any) => void>>()

  // 使用环境配置的 WebSocket URL
  // 开发模式: ws://localhost:3000/ws
  // 生产模式: ws://${window.location.host}/ws
  const wsUrl = url || `${WS_BASE_URL}/ws`

  function connect() {
    try {
      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        console.log('[WebSocket] 已连接')
        connected.value = true

        // 发送 ping 保持连接
        startPing()
      }

      ws.value.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error('[WebSocket] 消息解析失败:', error)
        }
      }

      ws.value.onerror = (error) => {
        console.error('[WebSocket] 连接错误:', error)
      }

      ws.value.onclose = () => {
        console.log('[WebSocket] 连接已关闭')
        connected.value = false
        stopPing()

        // 5秒后尝试重连
        reconnectTimer.value = window.setTimeout(() => {
          console.log('[WebSocket] 尝试重连...')
          connect()
        }, 5000)
      }
    } catch (error) {
      console.error('[WebSocket] 创建连接失败:', error)
    }
  }

  function disconnect() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }

    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }

    stopPing()
  }

  function send(message: WSMessage) {
    if (ws.value && connected.value) {
      ws.value.send(JSON.stringify(message))
    }
  }

  function on(type: string, handler: (data: any) => void) {
    if (!messageHandlers.has(type)) {
      messageHandlers.set(type, new Set())
    }
    messageHandlers.get(type)!.add(handler)
  }

  function off(type: string, handler: (data: any) => void) {
    const handlers = messageHandlers.get(type)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  function handleMessage(message: WSMessage) {
    const handlers = messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.data)
        } catch (error) {
          console.error(`[WebSocket] 消息处理器错误 (${message.type}):`, error)
        }
      })
    }
  }

  let pingTimer: number | null = null

  function startPing() {
    pingTimer = window.setInterval(() => {
      send({ type: 'ping', data: {}, timestamp: Date.now() })
    }, 30000) // 每30秒发送一次ping
  }

  function stopPing() {
    if (pingTimer) {
      clearInterval(pingTimer)
      pingTimer = null
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    connected,
    send,
    on,
    off,
    connect,
    disconnect,
  }
}


