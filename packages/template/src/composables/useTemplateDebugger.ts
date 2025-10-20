import { computed, onMounted, onUnmounted, reactive, readonly, ref, watch } from 'vue'
import { globalAnalytics } from '../utils/templateAnalytics'

/**
 * 调试日志级别
 */
export enum DebugLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * 调试日志条目
 */
export interface DebugLog {
  id: string
  timestamp: number
  level: DebugLevel
  message: string
  data?: any
  templateId?: string
  stack?: string
}

/**
 * 调试器配置
 */
export interface DebuggerConfig {
  enabled?: boolean
  logLevel?: DebugLevel
  maxLogs?: number
  trackLifecycle?: boolean
  trackProps?: boolean
  trackState?: boolean
  showInConsole?: boolean
}

/**
 * 模板状态快照
 */
export interface TemplateStateSnapshot {
  timestamp: number
  props?: Record<string, any>
  state?: Record<string, any>
  computed?: Record<string, any>
}

/**
 * 使用模板调试器
 */
export function useTemplateDebugger(
  templateId: string,
  config: DebuggerConfig = {}
) {
  const {
    enabled = import.meta.env.DEV,
    // logLevel = DebugLevel.DEBUG, // Not used currently
    maxLogs = 100,
    trackLifecycle = true,
    trackProps = true,
    trackState = true,
    showInConsole = true,
  } = config

  // 日志存储
  const logs = ref<DebugLog[]>([])
  
  // 状态快照
  const stateSnapshots = ref<TemplateStateSnapshot[]>([])
  
  // 性能指标
  const performanceMetrics = reactive({
    mountTime: 0,
    updateCount: 0,
    lastUpdateTime: 0,
    totalUpdateTime: 0,
    averageUpdateTime: 0,
  })

  // 当前状态
  const isEnabled = ref(enabled)

  /**
   * 添加日志
   */
  const addLog = (level: DebugLevel, message: string, data?: any, stack?: string) => {
    if (!isEnabled.value) return

    const log: DebugLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      level,
      message,
      data,
      templateId,
      stack,
    }

    logs.value.push(log)

    // 限制日志数量
    if (logs.value.length > maxLogs) {
      logs.value.shift()
    }

    // 输出到控制台
    if (showInConsole) {
      const consoleMethod = level === DebugLevel.ERROR ? 'error' : 
                           level === DebugLevel.WARN ? 'warn' :
                           level === DebugLevel.INFO ? 'info' : 'debug'
      console[consoleMethod](`[${templateId}] ${message}`, data)
    }
  }

  /**
   * 调试方法
   */
  const debug = (message: string, data?: any) => {
    addLog(DebugLevel.DEBUG, message, data)
  }

  const info = (message: string, data?: any) => {
    addLog(DebugLevel.INFO, message, data)
  }

  const warn = (message: string, data?: any) => {
    addLog(DebugLevel.WARN, message, data)
  }

  const error = (message: string, data?: any) => {
    const stack = new Error('Stack trace').stack
    addLog(DebugLevel.ERROR, message, data, stack)
  }

  /**
   * 记录状态快照
   */
  const takeSnapshot = (props?: Record<string, any>, state?: Record<string, any>, computed?: Record<string, any>) => {
    if (!isEnabled.value) return

    stateSnapshots.value.push({
      timestamp: Date.now(),
      props,
      state,
      computed,
    })

    // 限制快照数量
    if (stateSnapshots.value.length > maxLogs) {
      stateSnapshots.value.shift()
    }

    debug('State snapshot taken', { props, state, computed })
  }

  /**
   * 监听 props 变化
   */
  const watchProps = (props: Record<string, import('vue').Ref<any>>) => {
    if (!trackProps || !isEnabled.value) return

    Object.entries(props).forEach(([key, value]) => {
      watch(
        value,
        (newVal, oldVal) => {
          debug(`Prop "${key}" changed`, { oldVal, newVal })
        },
        { deep: true }
      )
    })
  }

  /**
   * 监听状态变化
   */
  const watchState = (state: Record<string, import('vue').Ref<any>>) => {
    if (!trackState || !isEnabled.value) return

    Object.entries(state).forEach(([key, value]) => {
      watch(
        value,
        (newVal, oldVal) => {
          debug(`State "${key}" changed`, { oldVal, newVal })
        },
        { deep: true }
      )
    })
  }

  /**
   * 测量性能
   */
  const measurePerformance = (label: string, fn: () => void | Promise<void>) => {
    if (!isEnabled.value) {
      return fn()
    }

    const startTime = performance.now()
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.then(() => {
        const duration = performance.now() - startTime
        debug(`${label} took ${duration.toFixed(2)}ms`)
        globalAnalytics.trackRender(templateId, templateId, duration)
      })
    } else {
      const duration = performance.now() - startTime
      debug(`${label} took ${duration.toFixed(2)}ms`)
      globalAnalytics.trackRender(templateId, templateId, duration)
    }
  }

  /**
   * 生命周期钩子
   */
  const lifecycleHooks = {
    onBeforeMount() {
      if (trackLifecycle) info('Component before mount')
    },
    onMounted() {
      if (trackLifecycle) {
        const mountTime = performance.now()
        performanceMetrics.mountTime = mountTime
        info('Component mounted', { mountTime })
      }
    },
    onBeforeUpdate() {
      if (trackLifecycle) {
        performanceMetrics.lastUpdateTime = performance.now()
        debug('Component before update')
      }
    },
    onUpdated() {
      if (trackLifecycle) {
        const updateTime = performance.now() - performanceMetrics.lastUpdateTime
        performanceMetrics.updateCount++
        performanceMetrics.totalUpdateTime += updateTime
        performanceMetrics.averageUpdateTime = 
          performanceMetrics.totalUpdateTime / performanceMetrics.updateCount
        debug('Component updated', {
          updateTime: `${updateTime.toFixed(2)}ms`,
          updateCount: performanceMetrics.updateCount,
        })
      }
    },
    onBeforeUnmount() {
      if (trackLifecycle) info('Component before unmount')
    },
    onUnmounted() {
      if (trackLifecycle) info('Component unmounted')
    },
  }

  /**
   * 获取日志
   */
  const getLogs = (level?: DebugLevel) => {
    if (level) {
      return logs.value.filter((log) => log.level === level)
    }
    return logs.value
  }

  /**
   * 清除日志
   */
  const clearLogs = () => {
    logs.value = []
  }

  /**
   * 导出日志
   */
  const exportLogs = (format: 'json' | 'csv' = 'json') => {
    if (format === 'json') {
      return JSON.stringify({
        templateId,
        logs: logs.value,
        snapshots: stateSnapshots.value,
        performance: performanceMetrics,
        exportedAt: new Date().toISOString(),
      }, null, 2)
    }

    // CSV 格式
    const headers = ['Timestamp', 'Level', 'Message', 'Data']
    const rows = logs.value.map((log) => [
      new Date(log.timestamp).toISOString(),
      log.level,
      log.message,
      JSON.stringify(log.data || {}),
    ])

    return [headers, ...rows].map((row) => row.join(',')).join('\n')
  }

  /**
   * 启用/禁用调试器
   */
  const enable = () => {
    isEnabled.value = true
    info('Debugger enabled')
  }

  const disable = () => {
    isEnabled.value = false
  }

  // 组件挂载时的初始化
  onMounted(() => {
    if (isEnabled.value) {
      lifecycleHooks.onMounted()
    }
  })

  onUnmounted(() => {
    if (isEnabled.value) {
      lifecycleHooks.onUnmounted()
    }
  })

  return {
    // 状态
    isEnabled,
    logs: computed(() => logs.value),
    stateSnapshots: computed(() => stateSnapshots.value),
    performanceMetrics: readonly(performanceMetrics),

    // 日志方法
    debug,
    info,
    warn,
    error,

    // 功能方法
    takeSnapshot,
    watchProps,
    watchState,
    measurePerformance,

    // 生命周期
    lifecycleHooks,

    // 工具方法
    getLogs,
    clearLogs,
    exportLogs,
    enable,
    disable,
  }
}

/**
 * 全局调试器管理
 */
class GlobalDebuggerManager {
  private debuggers = new Map<string, ReturnType<typeof useTemplateDebugger>>()

  register(templateId: string, templateDebugger: ReturnType<typeof useTemplateDebugger>) {
    this.debuggers.set(templateId, templateDebugger)
  }

  unregister(templateId: string) {
    this.debuggers.delete(templateId)
  }

  get(templateId: string) {
    return this.debuggers.get(templateId)
  }

  getAll() {
    return Array.from(this.debuggers.entries())
  }

  clearAll() {
    this.debuggers.forEach((templateDebugger) => templateDebugger.clearLogs())
  }

  disableAll() {
    this.debuggers.forEach((templateDebugger) => templateDebugger.disable())
  }

  enableAll() {
    this.debuggers.forEach((templateDebugger) => templateDebugger.enable())
  }

  exportAll() {
    const data: Record<string, any> = {}
    this.debuggers.forEach((templateDebugger, id) => {
      data[id] = JSON.parse(templateDebugger.exportLogs())
    })
    return JSON.stringify(data, null, 2)
  }
}

export const globalDebuggerManager = new GlobalDebuggerManager()

/**
 * 创建调试面板数据
 */
export function createDebugPanelData() {
  const templates = computed(() => globalDebuggerManager.getAll())
  const totalLogs = computed(() => {
    return templates.value.reduce((sum, [_, templateDebugger]) => sum + templateDebugger.logs.value.length, 0)
  })

  return {
    templates,
    totalLogs,
    clearAll: () => globalDebuggerManager.clearAll(),
    exportAll: () => globalDebuggerManager.exportAll(),
  }
}
