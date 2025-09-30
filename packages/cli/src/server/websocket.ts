/**
 * WebSocket 服务
 * 提供实时通信功能
 */

import { WebSocketServer, WebSocket } from 'ws'
import { logger } from '../utils/logger.js'

const wsLogger = logger.withPrefix('WebSocket')

/**
 * WebSocket 消息类型
 */
export interface WSMessage {
  type: string
  data?: any
  timestamp?: string
}

/**
 * 客户端连接管理
 */
class ConnectionManager {
  private connections = new Set<WebSocket>()

  /**
   * 添加连接
   */
  addConnection(ws: WebSocket): void {
    this.connections.add(ws)
    wsLogger.debug(`新连接已建立，当前连接数: ${this.connections.size}`)
  }

  /**
   * 移除连接
   */
  removeConnection(ws: WebSocket): void {
    this.connections.delete(ws)
    wsLogger.debug(`连接已断开，当前连接数: ${this.connections.size}`)
  }

  /**
   * 广播消息到所有连接
   */
  broadcast(message: WSMessage): void {
    const messageStr = JSON.stringify({
      ...message,
      timestamp: new Date().toISOString()
    })

    let sentCount = 0
    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr)
          sentCount++
        } catch (error) {
          // 连接已断开，静默失败
          wsLogger.debug(`发送消息失败，连接已断开`)
        }
      }
    })

    if (sentCount > 0) {
      wsLogger.debug(`广播消息: ${message.type}, 发送成功: ${sentCount}/${this.connections.size}`)
    }
  }

  /**
   * 发送消息到指定连接
   */
  sendToConnection(ws: WebSocket, message: WSMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      })
      ws.send(messageStr)
    }
  }

  /**
   * 获取连接数
   */
  getConnectionCount(): number {
    return this.connections.size
  }
}

const connectionManager = new ConnectionManager()

/**
 * 设置 WebSocket 服务器
 */
export function setupWebSocket(wss: WebSocketServer, debug: boolean = false): void {
  wss.on('connection', (ws, request) => {
    wsLogger.info(`WebSocket 连接建立: ${request.socket.remoteAddress}`)
    
    // 添加到连接管理器
    connectionManager.addConnection(ws)

    // 发送欢迎消息
    connectionManager.sendToConnection(ws, {
      type: 'welcome',
      data: {
        message: '欢迎使用 LDesign UI 管理界面',
        serverTime: new Date().toISOString()
      }
    })

    // 处理消息
    ws.on('message', (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString())
        handleMessage(ws, message, debug)
      } catch (error) {
        wsLogger.error('解析 WebSocket 消息失败:', error)
        connectionManager.sendToConnection(ws, {
          type: 'error',
          data: { message: '消息格式错误' }
        })
      }
    })

    // 处理连接关闭
    ws.on('close', (code, reason) => {
      wsLogger.info(`WebSocket 连接关闭: ${code} ${reason}`)
      connectionManager.removeConnection(ws)
    })

    // 处理错误
    ws.on('error', (error) => {
      wsLogger.error('WebSocket 错误:', error)
      connectionManager.removeConnection(ws)
    })

    // 心跳检测
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        connectionManager.sendToConnection(ws, {
          type: 'ping',
          data: { timestamp: new Date().toISOString() }
        })
      } else {
        clearInterval(heartbeat)
      }
    }, 30000) // 30秒心跳
  })

  wsLogger.info('WebSocket 服务器已启动')
}

/**
 * 处理 WebSocket 消息
 */
function handleMessage(ws: WebSocket, message: WSMessage, debug: boolean): void {
  if (debug) {
    wsLogger.debug(`收到消息: ${message.type}`, message.data)
  }

  switch (message.type) {
    case 'pong':
      // 心跳响应，不需要处理
      break

    case 'subscribe':
      // 订阅特定事件
      handleSubscribe(ws, message.data)
      break

    case 'unsubscribe':
      // 取消订阅
      handleUnsubscribe(ws, message.data)
      break

    case 'project-action':
      // 项目操作
      handleProjectAction(ws, message.data)
      break

    default:
      wsLogger.warn(`未知消息类型: ${message.type}`)
      connectionManager.sendToConnection(ws, {
        type: 'error',
        data: { message: `未知消息类型: ${message.type}` }
      })
  }
}

/**
 * 处理订阅
 */
function handleSubscribe(ws: WebSocket, data: any): void {
  const { event } = data
  wsLogger.debug(`客户端订阅事件: ${event}`)
  
  connectionManager.sendToConnection(ws, {
    type: 'subscribed',
    data: { event, message: `已订阅事件: ${event}` }
  })
}

/**
 * 处理取消订阅
 */
function handleUnsubscribe(ws: WebSocket, data: any): void {
  const { event } = data
  wsLogger.debug(`客户端取消订阅事件: ${event}`)
  
  connectionManager.sendToConnection(ws, {
    type: 'unsubscribed',
    data: { event, message: `已取消订阅事件: ${event}` }
  })
}

/**
 * 处理项目操作
 */
function handleProjectAction(ws: WebSocket, data: any): void {
  const { action, projectId } = data
  wsLogger.info(`项目操作: ${action} - ${projectId}`)

  // 模拟异步操作
  setTimeout(() => {
    connectionManager.broadcast({
      type: 'project-updated',
      data: {
        projectId,
        action,
        status: 'completed',
        message: `项目 ${projectId} 的 ${action} 操作已完成`
      }
    })
  }, 1000)

  connectionManager.sendToConnection(ws, {
    type: 'project-action-received',
    data: { projectId, action, message: '操作已接收，正在处理...' }
  })
}

// 导出连接管理器供其他模块使用
export { connectionManager }
