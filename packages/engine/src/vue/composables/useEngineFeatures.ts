/**
 * Engine 功能相关的组合式 API
 * 提供便捷的功能访问和状态管理
 */

import { ref, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'
import { useEngine } from './useEngine'
import type { NotificationOptions } from '../../types/notification'
import type { LogLevel } from '../../types/logger'

/**
 * 使用通知系统
 * 提供便捷的通知发送接口
 */
export function useNotification() {
  const engine = useEngine()
  
  const show = (options: NotificationOptions) => {
    return engine.notifications.show(options)
  }
  
  const success = (message: string, title?: string, duration?: number) => {
    return engine.notifications.show({
      type: 'success',
      title: title || 'Success',
      message,
      duration: duration || 3000,
    })
  }
  
  const error = (message: string, title?: string, duration?: number) => {
    return engine.notifications.show({
      type: 'error',
      title: title || 'Error',
      message,
      duration: duration || 5000,
    })
  }
  
  const warning = (message: string, title?: string, duration?: number) => {
    return engine.notifications.show({
      type: 'warning',
      title: title || 'Warning',
      message,
      duration: duration || 4000,
    })
  }
  
  const info = (message: string, title?: string, duration?: number) => {
    return engine.notifications.show({
      type: 'info',
      title: title || 'Info',
      message,
      duration: duration || 3000,
    })
  }
  
  const loading = (message: string, title?: string) => {
    return engine.notifications.show({
      type: 'info',
      title: title || 'Loading',
      message,
      duration: 0, // 不自动关闭
      showClose: false,
    })
  }
  
  const clear = () => {
    engine.notifications.clear()
  }
  
  return {
    show,
    success,
    error,
    warning,
    info,
    loading,
    clear,
  }
}

/**
 * 使用日志系统
 * 提供响应式的日志功能
 */
export function useLogger(context?: string) {
  const engine = useEngine()
  const logger = engine.logger
  
  const logs: Ref<Array<{ level: LogLevel; message: string; timestamp: Date }>> = ref([])
  const maxLogs = 100
  
  const addLog = (level: LogLevel, message: string) => {
    logs.value.push({ level, message, timestamp: new Date() })
    if (logs.value.length > maxLogs) {
      logs.value.shift()
    }
  }
  
  const debug = (message: string, ...args: any[]) => {
    logger.debug(context ? `[${context}] ${message}` : message, ...args)
    addLog('debug', message)
  }
  
  const info = (message: string, ...args: any[]) => {
    logger.info(context ? `[${context}] ${message}` : message, ...args)
    addLog('info', message)
  }
  
  const warn = (message: string, ...args: any[]) => {
    logger.warn(context ? `[${context}] ${message}` : message, ...args)
    addLog('warn', message)
  }
  
  const error = (message: string, ...args: any[]) => {
    logger.error(context ? `[${context}] ${message}` : message, ...args)
    addLog('error', message)
  }
  
  const clearLogs = () => {
    logs.value = []
  }
  
  return {
    logs: computed(() => logs.value),
    debug,
    info,
    warn,
    error,
    clearLogs,
  }
}

/**
 * 使用缓存系统
 * 提供响应式的缓存管理
 */
export function useCache<T = any>(key: string, defaultValue?: T) {
  const engine = useEngine()
  const cache = engine.cache
  
  const value: Ref<T | undefined> = ref(cache.get(key) || defaultValue)
  
  const set = (newValue: T, ttl?: number) => {
    cache.set(key, newValue, ttl)
    value.value = newValue
  }
  
  const remove = () => {
    cache.delete(key)
    value.value = defaultValue
  }
  
  const refresh = () => {
    value.value = cache.get(key) || defaultValue
  }
  
  // 监听缓存变化
  const unsubscribe = cache.on?.('change', (changedKey: string) => {
    if (changedKey === key) {
      refresh()
    }
  })
  
  onUnmounted(() => {
    unsubscribe?.()
  })
  
  return {
    value: computed(() => value.value),
    set,
    remove,
    refresh,
  }
}

/**
 * 使用事件系统
 * 提供事件监听和发送
 */
export function useEvents() {
  const engine = useEngine()
  const events = engine.events
  const listeners: Array<() => void> = []
  
  const on = (event: string, handler: (...args: any[]) => void) => {
    events.on(event, handler)
    const off = () => events.off(event, handler)
    listeners.push(off)
    return off
  }
  
  const once = (event: string, handler: (...args: any[]) => void) => {
    events.once(event, handler)
  }
  
  const emit = (event: string, ...args: any[]) => {
    events.emit(event, ...args)
  }
  
  const off = (event: string, handler?: (...args: any[]) => void) => {
    events.off(event, handler!)
  }
  
  // 组件卸载时自动清理
  onUnmounted(() => {
    listeners.forEach(off => off())
  })
  
  return {
    on,
    once,
    emit,
    off,
  }
}

/**
 * 使用性能监控
 * 提供性能指标的响应式访问
 */
export function usePerformance() {
  const engine = useEngine()
  const performance = engine.performance
  
  const metrics: Ref<Record<string, any>> = ref({})
  const isMonitoring = ref(false)
  
  const startMonitoring = () => {
    if (isMonitoring.value) return
    
    isMonitoring.value = true
    performance.startMonitoring()
    
    // 定期更新指标
    const interval = setInterval(() => {
      if (!isMonitoring.value) {
        clearInterval(interval)
        return
      }
      
      metrics.value = {
        memory: performance.getMemoryUsage?.(),
        timing: performance.getTimingMetrics?.(),
        fps: performance.getFPS?.(),
      }
    }, 1000)
  }
  
  const stopMonitoring = () => {
    isMonitoring.value = false
    performance.stopMonitoring()
  }
  
  const measure = (name: string, fn: () => void | Promise<void>) => {
    return performance.measure(name, fn)
  }
  
  const mark = (name: string) => {
    performance.mark(name)
  }
  
  onMounted(() => {
    if (engine.config.get('features.enablePerformanceMonitoring')) {
      startMonitoring()
    }
  })
  
  onUnmounted(() => {
    stopMonitoring()
  })
  
  return {
    metrics: computed(() => metrics.value),
    isMonitoring: computed(() => isMonitoring.value),
    startMonitoring,
    stopMonitoring,
    measure,
    mark,
  }
}

/**
 * 使用配置系统
 * 提供配置的响应式访问和修改
 */
export function useConfig<T = any>(path: string, defaultValue?: T) {
  const engine = useEngine()
  const config = engine.config
  
  const value: Ref<T> = ref(config.get(path, defaultValue))
  
  const set = (newValue: T) => {
    config.set(path, newValue)
    value.value = newValue
  }
  
  const reset = () => {
    config.reset(path)
    value.value = config.get(path, defaultValue)
  }
  
  // 监听配置变化
  const unsubscribe = config.on('change', (changedPath: string) => {
    if (changedPath === path || changedPath.startsWith(path + '.')) {
      value.value = config.get(path, defaultValue)
    }
  })
  
  onUnmounted(() => {
    unsubscribe()
  })
  
  return {
    value: computed(() => value.value),
    set,
    reset,
  }
}

/**
 * 使用错误处理
 * 提供错误捕获和处理
 */
export function useErrorHandler() {
  const engine = useEngine()
  const errors = engine.errors
  const errorList: Ref<Error[]> = ref([])
  
  const handle = (error: Error, context?: string) => {
    errorList.value.push(error)
    errors.handle(error, context)
  }
  
  const capture = async <T>(
    fn: () => T | Promise<T>,
    context?: string
  ): Promise<[T | null, Error | null]> => {
    try {
      const result = await fn()
      return [result, null]
    } catch (error) {
      handle(error as Error, context)
      return [null, error as Error]
    }
  }
  
  const clearErrors = () => {
    errorList.value = []
  }
  
  return {
    errors: computed(() => errorList.value),
    handle,
    capture,
    clearErrors,
  }
}

/**
 * 使用插件系统
 * 提供插件状态管理
 */
export function usePlugins() {
  const engine = useEngine()
  const plugins = engine.plugins
  
  const installedPlugins = computed(() => plugins.getInstalledPlugins())
  const pluginCount = computed(() => installedPlugins.value.length)
  
  const isInstalled = (name: string) => {
    return plugins.isInstalled(name)
  }
  
  const getPlugin = (name: string) => {
    return plugins.getPlugin(name)
  }
  
  const getPluginStatus = (name: string) => {
    return plugins.getPluginStatus?.(name)
  }
  
  return {
    plugins: installedPlugins,
    count: pluginCount,
    isInstalled,
    getPlugin,
    getPluginStatus,
  }
}