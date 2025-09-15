/**
 * Vue适配器
 * 为Vue 3 Composition API和Vue 2提供WebSocket集成
 */

import { ref, reactive, onUnmounted, type Ref, type App } from 'vue'
import { BaseAdapter, type AdapterState, type AdapterConfig, type AdapterEvents } from './base'
import type { WebSocketClient } from '../core/websocket-client'
import type { WebSocketConfig, WebSocketMessage } from '../types'
import { createWebSocketClient } from '../factory'

/**
 * Vue响应式状态接口
 */
export interface VueWebSocketState {
  /** 连接状态 */
  state: Ref<string>
  /** 是否已连接 */
  connected: Ref<boolean>
  /** 是否正在连接 */
  connecting: Ref<boolean>
  /** 是否正在重连 */
  reconnecting: Ref<boolean>
  /** 最后一次错误 */
  lastError: Ref<Error | null>
  /** 最后接收到的消息 */
  lastMessage: Ref<WebSocketMessage | null>
  /** 重连次数 */
  reconnectCount: Ref<number>
}

/**
 * Vue WebSocket Composition API返回值
 */
export interface UseWebSocketReturn extends VueWebSocketState {
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
 * Vue适配器类
 * 扩展基础适配器，提供Vue特定的响应式状态管理
 */
export class VueAdapter extends BaseAdapter {
  private vueState: VueWebSocketState

  constructor(client: WebSocketClient, config: AdapterConfig = {}) {
    super(client, config)

    // 创建Vue响应式状态
    this.vueState = {
      state: ref(this.state.state),
      connected: ref(this.state.connected),
      connecting: ref(this.state.connecting),
      reconnecting: ref(this.state.reconnecting),
      lastError: ref(this.state.lastError),
      lastMessage: ref(this.state.lastMessage),
      reconnectCount: ref(this.state.reconnectCount)
    }

    // 初始同步状态
    this.syncState()
  }

  /**
   * 同步状态到Vue响应式系统
   */
  protected syncState(): void {
    this.vueState.state.value = this.state.state
    this.vueState.connected.value = this.state.connected
    this.vueState.connecting.value = this.state.connecting
    this.vueState.reconnecting.value = this.state.reconnecting
    this.vueState.lastError.value = this.state.lastError
    this.vueState.lastMessage.value = this.state.lastMessage
    this.vueState.reconnectCount.value = this.state.reconnectCount
  }

  /**
   * 获取Vue响应式状态
   */
  public getVueState(): VueWebSocketState {
    return this.vueState
  }
}

/**
 * Vue 3 Composition API Hook
 * 提供WebSocket功能的组合式API
 * 
 * @param url WebSocket服务器URL
 * @param config WebSocket配置
 * @param adapterConfig 适配器配置
 * @returns WebSocket状态和方法
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <p>状态: {{ state }}</p>
 *     <p>已连接: {{ connected }}</p>
 *     <button @click="connect" :disabled="connecting">连接</button>
 *     <button @click="disconnect" :disabled="!connected">断开</button>
 *     <button @click="sendMessage" :disabled="!connected">发送消息</button>
 *   </div>
 * </template>
 * 
 * <script setup>
 * import { useWebSocket } from '@ldesign/websocket/adapters/vue'
 * 
 * const {
 *   state,
 *   connected,
 *   connecting,
 *   connect,
 *   disconnect,
 *   send,
 *   on
 * } = useWebSocket('ws://localhost:8080')
 * 
 * // 监听消息
 * on('message', (message) => {
 *   console.log('收到消息:', message)
 * })
 * 
 * const sendMessage = () => {
 *   send({ type: 'hello', data: 'world' })
 * }
 * </script>
 * ```
 */
export function useWebSocket(
  url: string,
  config: Partial<WebSocketConfig> = {},
  adapterConfig: AdapterConfig = {}
): UseWebSocketReturn {
  // 创建WebSocket客户端
  const client = createWebSocketClient({ url, ...config })

  // 创建Vue适配器
  const adapter = new VueAdapter(client, {
    autoConnect: true,
    autoDisconnect: true,
    ...adapterConfig
  })

  // 获取响应式状态
  const vueState = adapter.getVueState()

  // 在组件卸载时清理资源
  onUnmounted(() => {
    adapter.destroy()
  })

  // 如果配置了自动连接，则立即连接
  if (adapterConfig.autoConnect !== false) {
    adapter.connect().catch(error => {
      console.error('WebSocket自动连接失败:', error)
    })
  }

  return {
    ...vueState,
    connect: () => adapter.connect(),
    disconnect: (code?: number, reason?: string) => adapter.disconnect(code, reason),
    send: (data: unknown) => adapter.send(data),
    on: <K extends keyof AdapterEvents>(event: K, listener: AdapterEvents[K]) => adapter.on(event, listener),
    off: <K extends keyof AdapterEvents>(event: K, listener: AdapterEvents[K]) => adapter.off(event, listener),
    getClient: () => adapter.getClient()
  }
}

/**
 * Vue插件配置接口
 */
export interface VueWebSocketPluginOptions {
  /** 默认WebSocket配置 */
  defaultConfig?: Partial<WebSocketConfig>
  /** 默认适配器配置 */
  defaultAdapterConfig?: AdapterConfig
  /** 全局实例名称 */
  globalPropertyName?: string
}

/**
 * Vue插件
 * 为Vue应用提供全局WebSocket功能
 * 
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { VueWebSocketPlugin } from '@ldesign/websocket/adapters/vue'
 * 
 * const app = createApp(App)
 * 
 * app.use(VueWebSocketPlugin, {
 *   defaultConfig: {
 *     reconnect: { enabled: true },
 *     heartbeat: { enabled: true }
 *   },
 *   globalPropertyName: '$ws'
 * })
 * ```
 */
export const VueWebSocketPlugin = {
  install(app: App, options: VueWebSocketPluginOptions = {}) {
    const {
      defaultConfig = {},
      defaultAdapterConfig = {},
      globalPropertyName = '$websocket'
    } = options

    // 提供全局配置
    app.provide('websocket-default-config', defaultConfig)
    app.provide('websocket-default-adapter-config', defaultAdapterConfig)

    // 添加全局属性
    app.config.globalProperties[globalPropertyName] = {
      create: (url: string, config?: Partial<WebSocketConfig>) => {
        return createWebSocketClient({ url, ...defaultConfig, ...config })
      },
      useWebSocket: (url: string, config?: Partial<WebSocketConfig>, adapterConfig?: AdapterConfig) => {
        return useWebSocket(url, { ...defaultConfig, ...config }, { ...defaultAdapterConfig, ...adapterConfig })
      }
    }

    // 添加全局方法
    app.provide('createWebSocket', (url: string, config?: Partial<WebSocketConfig>) => {
      return createWebSocketClient({ url, ...defaultConfig, ...config })
    })
  }
}

// 导出类型
export type { VueWebSocketState, UseWebSocketReturn, VueWebSocketPluginOptions }
