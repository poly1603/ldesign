/**
 * @ldesign/websocket - 通用 WebSocket 客户端库
 * 
 * 提供完整的 WebSocket 客户端功能，支持自动重连、心跳检测、消息队列等高级特性
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

// 导出核心类
export { WebSocketClient } from './core/websocket-client'
export { WebSocketEventEmitter } from './core/event-emitter'
export { ConnectionPool } from './core/connection-pool'
export { AuthManager, AuthState } from './core/auth-manager'
export type { AuthStrategy, AuthResult, AuthEventMap } from './core/auth-manager'
export { ConfigManager } from './core/config-manager'
export type { ConfigEventMap, ConfigValidator } from './core/config-manager'
export { ConfigPresets } from './core/config-presets'
export type { ConfigPresetType, ConfigPreset } from './core/config-presets'

// 导出类型定义
export type {
  // 基础类型
  WebSocketClientConfig,
  WebSocketMessage,
  WebSocketEventMap,
  ConnectionStats,

  // 枚举类型
  WebSocketState,
  MessageType,
  MessagePriority,
  ReconnectStrategy,
  AuthType,
  LogLevel,

  // 配置类型
  ReconnectConfig,
  HeartbeatConfig,
  AuthConfig,
  MessageQueueConfig,
  ConnectionPoolConfig,
  ConnectionReuseStrategy,
  LoadBalanceStrategy,
  PoolStats,
  ConnectionPoolEventMap,

  // 事件类型
  EventListener,
  EventListenerOptions,
  EventListenerInfo,
  EventEmitter,
  AdvancedEventEmitter,
  EventMiddleware,
  EventFilter,
  EventTransformer,

  // 工具类型
  DeepPartial,
  DeepRequired,
  Nullable,
  Optional,
  Maybe,
  Fn,
  AsyncFn,
  Callback,
  AsyncCallback,
  Dictionary,
  JsonValue,
  JsonObject,
  JsonArray,
  RetryOptions,
  DebounceOptions,
  ThrottleOptions,
  ValidationResult,
  PerformanceMetrics
} from './types'

// 导出工具函数
export {
  generateUUID,
  generateShortId,
  delay,
  withTimeout,
  retry,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  isValidUrl,
  isWebSocketUrl,
  formatBytes,
  now,
  isEmpty,
  safeJsonParse,
  safeJsonStringify
} from './utils'

// 导出工厂函数
export { createWebSocketClient } from './factory'
export {
  createBasicPool,
  createHighPerformancePool,
  createLoadBalancedPool,
  createSmartPool,
  createDebugPool,
  createLightweightPool
} from './core/pool-factory'

// 导出框架适配器
export * from './adapters'

// 导出Web Worker支持
export * from './worker'

// 导出版本信息
export const VERSION = '1.0.0'

/**
 * 创建 WebSocket 客户端的便捷函数
 * @param url WebSocket 服务器 URL
 * @param config 可选配置
 * @returns WebSocket 客户端实例
 */
export function createClient(url: string, config?: Partial<WebSocketClientConfig>): WebSocketClient {
  return new WebSocketClient({ url, ...config })
}

/**
 * 检查浏览器是否支持 WebSocket
 * @returns 是否支持
 */
export function isWebSocketSupported(): boolean {
  return typeof WebSocket !== 'undefined'
}

/**
 * 获取 WebSocket 就绪状态的描述
 * @param readyState WebSocket 就绪状态
 * @returns 状态描述
 */
export function getReadyStateDescription(readyState: number): string {
  switch (readyState) {
    case WebSocket.CONNECTING:
      return 'CONNECTING'
    case WebSocket.OPEN:
      return 'OPEN'
    case WebSocket.CLOSING:
      return 'CLOSING'
    case WebSocket.CLOSED:
      return 'CLOSED'
    default:
      return 'UNKNOWN'
  }
}

/**
 * 默认导出 WebSocketClient 类
 */
export default WebSocketClient
