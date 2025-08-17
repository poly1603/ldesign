import type { Engine } from '../../types'
import { getCurrentInstance, inject } from 'vue'

/**
 * 获取引擎实例的组合式函数
 */
export function useEngine(): Engine {
  // 尝试从注入中获取
  const injectedEngine = inject<Engine>('engine')
  if (injectedEngine) {
    return injectedEngine
  }

  // 尝试从全局属性中获取
  const instance = getCurrentInstance()
  if (instance?.appContext.app.config.globalProperties.$engine) {
    return instance.appContext.app.config.globalProperties.$engine
  }

  // 尝试从全局变量中获取（开发环境）
  if (typeof window !== 'undefined' && (window as any).__LDESIGN_ENGINE__) {
    return (window as any).__LDESIGN_ENGINE__
  }

  throw new Error(
    'Engine instance not found. Make sure the engine is properly initialized.',
  )
}

/**
 * 获取引擎配置的组合式函数
 */
export function useEngineConfig() {
  const engine = useEngine()
  return engine.config
}

/**
 * 获取引擎插件管理器的组合式函数
 */
export function useEnginePlugins() {
  const engine = useEngine()
  return engine.plugins
}

/**
 * 获取引擎中间件管理器的组合式函数
 */
export function useEngineMiddleware() {
  const engine = useEngine()
  return engine.middleware
}

/**
 * 获取引擎事件管理器的组合式函数
 */
export function useEngineEvents() {
  const engine = useEngine()
  return engine.events
}

/**
 * 获取引擎状态管理器的组合式函数
 */
export function useEngineState() {
  const engine = useEngine()
  return engine.state
}

/**
 * 获取引擎日志器的组合式函数
 */
export function useEngineLogger() {
  const engine = useEngine()
  return engine.logger
}

/**
 * 获取引擎通知管理器的组合式函数
 */
export function useEngineNotifications() {
  const engine = useEngine()
  return engine.notifications
}

/**
 * 获取引擎错误管理器的组合式函数
 */
export function useEngineErrors() {
  const engine = useEngine()
  return engine.errors
}
