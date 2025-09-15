/**
 * React适配器
 * 为React提供WebSocket集成的Hooks
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { BaseAdapter, type AdapterState, type AdapterConfig, type AdapterEvents } from './base'
import type { WebSocketClient } from '../core/websocket-client'
import type { WebSocketConfig, WebSocketMessage } from '../types'
import { createWebSocketClient } from '../factory'

/**
 * React WebSocket Hook返回值接口
 */
export interface UseWebSocketReturn {
  /** 连接状态 */
  state: string
  /** 是否已连接 */
  connected: boolean
  /** 是否正在连接 */
  connecting: boolean
  /** 是否正在重连 */
  reconnecting: boolean
  /** 最后一次错误 */
  lastError: Error | null
  /** 最后接收到的消息 */
  lastMessage: WebSocketMessage | null
  /** 重连次数 */
  reconnectCount: number
  /** 连接WebSocket */
  connect: () => Promise<void>
  /** 断开连接 */
  disconnect: (code?: number, reason?: string) => void
  /** 发送消息 */
  send: (data: unknown) => Promise<void>
  /** 添加事件监听器 */
  on: <K extends keyof AdapterEvents>(event: K, listener: AdapterEvents[K]) => void
  /** 移除事件监听器 */
  off: <K extends keyof AdapterEvents>(event: K, listener: AdapterEvents[K]) => void
  /** 获取WebSocket客户端实例 */
  getClient: () => WebSocketClient
}

/**
 * React适配器类
 * 扩展基础适配器，提供React特定的状态管理
 */
export class ReactAdapter extends BaseAdapter {
  private stateUpdateCallback?: (state: AdapterState) => void

  constructor(client: WebSocketClient, config: AdapterConfig = {}) {
    super(client, config)
  }

  /**
   * 设置状态更新回调
   * @param callback 状态更新回调函数
   */
  public setStateUpdateCallback(callback: (state: AdapterState) => void): void {
    this.stateUpdateCallback = callback
  }

  /**
   * 同步状态到React
   */
  protected syncState(): void {
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback({ ...this.state })
    }
  }
}

/**
 * React WebSocket Hook
 * 提供WebSocket功能的React Hook
 * 
 * @param url WebSocket服务器URL
 * @param config WebSocket配置
 * @param adapterConfig 适配器配置
 * @returns WebSocket状态和方法
 * 
 * @example
 * ```tsx
 * import React from 'react'
 * import { useWebSocket } from '@ldesign/websocket/adapters/react'
 * 
 * function WebSocketComponent() {
 *   const {
 *     state,
 *     connected,
 *     connecting,
 *     lastMessage,
 *     connect,
 *     disconnect,
 *     send,
 *     on
 *   } = useWebSocket('ws://localhost:8080')
 * 
 *   // 监听消息
 *   React.useEffect(() => {
 *     const handleMessage = (message) => {
 *       console.log('收到消息:', message)
 *     }
 *     
 *     on('message', handleMessage)
 *     
 *     return () => {
 *       off('message', handleMessage)
 *     }
 *   }, [on, off])
 * 
 *   const sendMessage = () => {
 *     send({ type: 'hello', data: 'world' })
 *   }
 * 
 *   return (
 *     <div>
 *       <p>状态: {state}</p>
 *       <p>已连接: {connected ? '是' : '否'}</p>
 *       <button onClick={connect} disabled={connecting}>
 *         连接
 *       </button>
 *       <button onClick={disconnect} disabled={!connected}>
 *         断开
 *       </button>
 *       <button onClick={sendMessage} disabled={!connected}>
 *         发送消息
 *       </button>
 *       {lastMessage && (
 *         <div>
 *           <h3>最后收到的消息:</h3>
 *           <pre>{JSON.stringify(lastMessage, null, 2)}</pre>
 *         </div>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useWebSocket(
  url: string,
  config: Partial<WebSocketConfig> = {},
  adapterConfig: AdapterConfig = {}
): UseWebSocketReturn {
  // 使用ref保存适配器实例，避免重复创建
  const adapterRef = useRef<ReactAdapter | null>(null)

  // 状态管理
  const [state, setState] = useState<AdapterState>(() => ({
    state: 'disconnected',
    connected: false,
    connecting: false,
    reconnecting: false,
    lastError: null,
    lastMessage: null,
    reconnectCount: 0
  }))

  // 初始化适配器
  useEffect(() => {
    if (!adapterRef.current) {
      const client = createWebSocketClient({ url, ...config })
      const adapter = new ReactAdapter(client, {
        autoConnect: true,
        autoDisconnect: true,
        ...adapterConfig
      })

      // 设置状态更新回调
      adapter.setStateUpdateCallback(setState)

      // 初始化状态
      setState(adapter.getState())

      adapterRef.current = adapter

      // 如果配置了自动连接，则立即连接
      if (adapterConfig.autoConnect !== false) {
        adapter.connect().catch(error => {
          console.error('WebSocket自动连接失败:', error)
        })
      }
    }

    // 清理函数
    return () => {
      if (adapterRef.current) {
        adapterRef.current.destroy()
        adapterRef.current = null
      }
    }
  }, [url]) // 只在URL变化时重新创建

  // 连接方法
  const connect = useCallback(async () => {
    if (adapterRef.current) {
      return adapterRef.current.connect()
    }
  }, [])

  // 断开连接方法
  const disconnect = useCallback((code?: number, reason?: string) => {
    if (adapterRef.current) {
      adapterRef.current.disconnect(code, reason)
    }
  }, [])

  // 发送消息方法
  const send = useCallback(async (data: unknown) => {
    if (adapterRef.current) {
      return adapterRef.current.send(data)
    }
    throw new Error('WebSocket未初始化')
  }, [])

  // 添加事件监听器方法
  const on = useCallback(<K extends keyof AdapterEvents>(event: K, listener: AdapterEvents[K]) => {
    if (adapterRef.current) {
      adapterRef.current.on(event, listener)
    }
  }, [])

  // 移除事件监听器方法
  const off = useCallback(<K extends keyof AdapterEvents>(event: K, listener: AdapterEvents[K]) => {
    if (adapterRef.current) {
      adapterRef.current.off(event, listener)
    }
  }, [])

  // 获取客户端实例方法
  const getClient = useCallback(() => {
    if (adapterRef.current) {
      return adapterRef.current.getClient()
    }
    throw new Error('WebSocket未初始化')
  }, [])

  return {
    state: state.state,
    connected: state.connected,
    connecting: state.connecting,
    reconnecting: state.reconnecting,
    lastError: state.lastError,
    lastMessage: state.lastMessage,
    reconnectCount: state.reconnectCount,
    connect,
    disconnect,
    send,
    on,
    off,
    getClient
  }
}

/**
 * 使用WebSocket消息的Hook
 * 专门用于处理WebSocket消息的Hook
 * 
 * @param url WebSocket服务器URL
 * @param config WebSocket配置
 * @returns 消息相关的状态和方法
 * 
 * @example
 * ```tsx
 * function MessageComponent() {
 *   const { messages, sendMessage, clearMessages } = useWebSocketMessages('ws://localhost:8080')
 * 
 *   return (
 *     <div>
 *       <button onClick={() => sendMessage('Hello')}>发送消息</button>
 *       <button onClick={clearMessages}>清空消息</button>
 *       <ul>
 *         {messages.map((msg, index) => (
 *           <li key={index}>{JSON.stringify(msg)}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   )
 * }
 * ```
 */
export function useWebSocketMessages(
  url: string,
  config: Partial<WebSocketConfig> = {}
) {
  const [messages, setMessages] = useState<WebSocketMessage[]>([])

  const { connected, send, on, off } = useWebSocket(url, config, {
    autoConnect: true
  })

  // 监听消息
  useEffect(() => {
    const handleMessage = (message: WebSocketMessage) => {
      setMessages(prev => [...prev, message])
    }

    on('message', handleMessage)

    return () => {
      off('message', handleMessage)
    }
  }, [on, off])

  // 发送消息方法
  const sendMessage = useCallback(async (data: unknown) => {
    if (connected) {
      return send(data)
    }
    throw new Error('WebSocket未连接')
  }, [connected, send])

  // 清空消息方法
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    sendMessage,
    clearMessages,
    connected
  }
}

// 导出类型
export type { UseWebSocketReturn }
