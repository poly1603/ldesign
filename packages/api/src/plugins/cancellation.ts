/**
 * 请求取消插件
 * 提供请求取消、超时自动取消等功能
 */
import type { ApiPlugin, RequestMiddleware } from '../types'
import type { RequestCancellationManager } from '../utils/RequestCancellation'
import {
  CancellationToken,
  createRequestCancellationManager,
} from '../utils/RequestCancellation'

/**
 * 取消插件配置
 */
export interface CancellationPluginOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 全局超时时间（毫秒），0表示不设置 */
  globalTimeout?: number
  /** 是否在页面卸载时取消所有请求 */
  cancelOnUnload?: boolean
  /** 是否在路由切换时取消请求 */
  cancelOnRouteChange?: boolean
  /** 取消回调 */
  onCancel?: (methodName: string, reason: string) => void
}

/**
 * 创建请求取消插件
 */
export function createCancellationPlugin(
  options: CancellationPluginOptions = {},
): ApiPlugin {
  const config = {
    enabled: true,
    globalTimeout: 0,
    cancelOnUnload: true,
    cancelOnRouteChange: false,
    onCancel: () => {},
    ...options,
  }

  let cancellationManager: RequestCancellationManager | null = null
  const requestTokens = new Map<string, CancellationToken>()

  const requestMiddleware: RequestMiddleware = async (reqConfig, ctx) => {
    if (!config.enabled || !cancellationManager) {
      return reqConfig
    }

    // 为每个请求创建取消令牌
    const key = `${ctx.methodName}:${Date.now()}`
    const token = cancellationManager.createToken(key)

    requestTokens.set(key, token)

    // 将取消令牌附加到请求配置
    ;(reqConfig as any).__cancellationToken = token
    ;(reqConfig as any).__cancellationKey = key

    // 设置超时自动取消
    if (config.globalTimeout > 0) {
      setTimeout(() => {
        if (!token.isCancelled) {
          token.cancel('Request timeout')
          config.onCancel(ctx.methodName, 'timeout')
        }
      }, config.globalTimeout)
    }

    // 监听取消事件
    token.onCancel(() => {
      requestTokens.delete(key)
    })

    return reqConfig
  }

  // 页面卸载时取消所有请求
  const handleUnload = () => {
    if (cancellationManager) {
      cancellationManager.cancelAll('Page unload')
      requestTokens.clear()
    }
  }

  // 路由切换时取消请求（需要在Vue/React环境中手动调用）
  const handleRouteChange = () => {
    if (cancellationManager) {
      cancellationManager.cancelAll('Route change')
      requestTokens.clear()
    }
  }

  return {
    name: 'cancellation',
    version: '1.0.0',

    install(engine) {
      // 创建取消管理器
      cancellationManager = createRequestCancellationManager()

      // 注册请求中间件
      engine.config.middlewares ||= {}
      engine.config.middlewares.request ||= []
      engine.config.middlewares.request.push(requestMiddleware)

      // 监听页面卸载
      if (config.cancelOnUnload && typeof window !== 'undefined') {
        window.addEventListener('beforeunload', handleUnload)
        window.addEventListener('unload', handleUnload)
      }

      // 存储插件实例到引擎（供外部调用）
      ;(engine as any).__cancellationPlugin = {
        cancelAll: (reason?: string) => {
          if (cancellationManager) {
            cancellationManager.cancelAll(reason)
            requestTokens.clear()
          }
        },
        cancelByMethod: (methodName: string, reason?: string) => {
          for (const [key, token] of requestTokens.entries()) {
            if (key.startsWith(`${methodName}:`)) {
              token.cancel(reason || 'Cancelled by method')
              requestTokens.delete(key)
            }
          }
        },
        onRouteChange: handleRouteChange,
      }
    },

    uninstall(engine) {
      // 清理事件监听
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleUnload)
        window.removeEventListener('unload', handleUnload)
      }

      // 取消所有请求
      if (cancellationManager) {
        cancellationManager.cancelAll('Plugin uninstalled')
        requestTokens.clear()
      }

      // 移除插件实例
      delete (engine as any).__cancellationPlugin
    },
  }
}

/**
 * 类型安全的取消插件API
 */
export interface CancellationPluginAPI {
  /** 取消所有请求 */
  cancelAll: (reason?: string) => void
  /** 取消指定方法的所有请求 */
  cancelByMethod: (methodName: string, reason?: string) => void
  /** 路由切换时调用 */
  onRouteChange: () => void
}

/**
 * 从引擎获取取消插件API
 */
export function getCancellationAPI(engine: any): CancellationPluginAPI | null {
  return (engine as any).__cancellationPlugin || null
}
