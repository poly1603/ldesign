/**
 * WebSocket 工具函数
 * 提供 WebSocket 连接的初始化和管理
 */

import { useWebSocket } from '../composables/useWebSocket'

/**
 * 设置 WebSocket 连接
 * 在应用启动时调用
 */
export function setupWebSocket(): void {
  const { subscribe } = useWebSocket()

  // 订阅欢迎消息
  subscribe('welcome', (data) => {
      })

  // 订阅心跳消息
  subscribe('ping', (data) => {
    // 响应心跳
    const { send } = useWebSocket()
    send('pong', { timestamp: new Date().toISOString() })
  })

  // 订阅项目更新消息
  subscribe('project-updated', (data) => {
        // 这里可以触发页面刷新或状态更新
  })

  // 订阅错误消息
  subscribe('error', (data) => {
    console.error('WebSocket 错误:', data)
  })

  }
