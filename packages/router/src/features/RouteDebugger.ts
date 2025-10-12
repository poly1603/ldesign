/**
 * @ldesign/router 路由调试增强工具
 * 
 * 提供详细的路由调试、跟踪和问题诊断功能
 */

import type { Router, RouteLocationNormalized, NavigationFailure } from '../types'
import { reactive, watchEffect } from 'vue'

// ==================== 类型定义 ====================

/**
 * 调试事件
 */
export interface DebugEvent {
  /** 事件ID */
  id: string
  /** 事件类型 */
  type: 'navigation' | 'guard' | 'component' | 'error' | 'warning' | 'info'
  /** 事件级别 */
  level: 'debug' | 'info' | 'warn' | 'error'
  /** 时间戳 */
  timestamp: number
  /** 事件消息 */
  message: string
  /** 详细数据 */
  data?: any
  /** 堆栈跟踪 */
  stack?: string
  /** 相关路由 */
  route?: {
    from?: string
    to?: string
    params?: Record<string, any>
    query?: Record<string, any>
  }
  /** 执行时间 */
  duration?: number
  /** 标签 */
  tags?: string[]
}

/**
 * 路由跟踪
 */
export interface RouteTrace {
  /** 跟踪ID */
  id: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 总耗时 */
  duration?: number
  /** 路由链路 */
  chain: TraceStep[]
  /** 是否成功 */
  success?: boolean
  /** 错误信息 */
  error?: Error | NavigationFailure
}

/**
 * 跟踪步骤
 */
export interface TraceStep {
  /** 步骤名称 */
  name: string
  /** 步骤类型 */
  type: 'start' | 'guard' | 'resolve' | 'load' | 'render' | 'end'
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 耗时 */
  duration?: number
  /** 详细信息 */
  details?: any
  /** 是否成功 */
  success?: boolean
}

/**
 * 断点配置
 */
export interface Breakpoint {
  /** 断点ID */
  id: string
  /** 断点类型 */
  type: 'route' | 'guard' | 'component' | 'error'
  /** 条件 */
  condition?: (context: any) => boolean
  /** 路由模式匹配 */
  routePattern?: string | RegExp
  /** 是否启用 */
  enabled: boolean
  /** 命中次数 */
  hitCount: number
  /** 回调函数 */
  callback?: (context: any) => void
}

/**
 * 调试器配置
 */
export interface DebuggerConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 日志级别 */
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  /** 最大事件数 */
  maxEvents?: number
  /** 最大跟踪数 */
  maxTraces?: number
  /** 是否记录组件 */
  trackComponents?: boolean
  /** 是否记录守卫 */
  trackGuards?: boolean
  /** 是否记录性能 */
  trackPerformance?: boolean
  /** 是否在控制台输出 */
  console?: boolean
  /** 是否启用断点 */
  breakpoints?: boolean
  /** 是否启用时间旅行 */
  timeTravel?: boolean
}

// ==================== 路由调试器实现 ====================

/**
 * 路由调试器
 */
export class RouteDebugger {
  private router: Router
  private config: Required<DebuggerConfig>
  private events: DebugEvent[] = []
  private traces: Map<string, RouteTrace> = new Map()
  private breakpoints: Map<string, Breakpoint> = new Map()
  private currentTrace: RouteTrace | null = null
  private navigationCounter = 0
  private componentCache = new Map<string, any>()
  private guardExecutions = new Map<string, number>()
  
  // 响应式状态
  public state = reactive({
    isEnabled: false,
    isPaused: false,
    eventCount: 0,
    traceCount: 0,
    breakpointCount: 0,
    currentRoute: null as RouteLocationNormalized | null,
    lastError: null as Error | null,
    filter: {
      type: 'all' as 'all' | DebugEvent['type'],
      level: 'all' as 'all' | DebugEvent['level'],
      search: '',
    },
  })

  constructor(router: Router, config?: DebuggerConfig) {
    this.router = router
    this.config = {
      enabled: true,
      logLevel: 'info',
      maxEvents: 1000,
      maxTraces: 100,
      trackComponents: true,
      trackGuards: true,
      trackPerformance: true,
      console: true,
      breakpoints: true,
      timeTravel: false,
      ...config,
    }

    if (this.config.enabled) {
      this.initialize()
    }
  }

  /**
   * 初始化调试器
   */
  private initialize(): void {
    this.setupRouterHooks()
    this.setupDevTools()
    this.state.isEnabled = true
    
    // 监听路由变化
    watchEffect(() => {
      this.state.currentRoute = this.router.currentRoute.value
    })
  }

  /**
   * 设置路由钩子
   */
  private setupRouterHooks(): void {
    // 导航开始前
    this.router.beforeEach((to, from, next) => {
      this.startTrace(to, from)
      
      // 记录导航事件
      this.logEvent({
        type: 'navigation',
        level: 'info',
        message: `Navigation from ${from.path} to ${to.path}`,
        route: {
          from: from.path,
          to: to.path,
          params: to.params,
          query: to.query,
        },
      })

      // 检查断点
      this.checkBreakpoint('route', { to, from })

      // 包装 next 函数
      const wrappedNext = (arg?: any) => {
        if (this.currentTrace) {
          this.addTraceStep('guard', 'Navigation guard executed')
        }
        return next(arg)
      }

      return wrappedNext
    })

    // 导航解析后
    this.router.beforeResolve((to, from, next) => {
      if (this.currentTrace) {
        this.addTraceStep('resolve', 'Route resolved')
      }

      // 检查组件
      if (this.config.trackComponents) {
        this.trackComponentLoad(to)
      }

      return next()
    })

    // 导航完成后
    this.router.afterEach((to, from, failure) => {
      if (failure) {
        this.logEvent({
          type: 'error',
          level: 'error',
          message: `Navigation failed: ${failure.message}`,
          data: failure,
          route: {
            from: from.path,
            to: to.path,
          },
        })
      }

      this.endTrace(!failure)
    })

    // 错误处理
    this.router.onError((error) => {
      this.state.lastError = error
      
      this.logEvent({
        type: 'error',
        level: 'error',
        message: `Router error: ${error.message}`,
        data: error,
        stack: error.stack,
      })

      // 检查错误断点
      this.checkBreakpoint('error', { error })
    })
  }

  /**
   * 开始跟踪
   */
  private startTrace(to: RouteLocationNormalized, from: RouteLocationNormalized): void {
    const traceId = `trace_${++this.navigationCounter}_${Date.now()}`
    
    this.currentTrace = {
      id: traceId,
      startTime: performance.now(),
      chain: [
        {
          name: 'Navigation Start',
          type: 'start',
          startTime: performance.now(),
          details: { from: from.path, to: to.path },
        },
      ],
    }

    this.traces.set(traceId, this.currentTrace)
    this.state.traceCount++

    // 清理旧跟踪
    if (this.traces.size > this.config.maxTraces) {
      const firstKey = this.traces.keys().next().value
      this.traces.delete(firstKey)
      this.state.traceCount--
    }
  }

  /**
   * 添加跟踪步骤
   */
  private addTraceStep(type: TraceStep['type'], name: string, details?: any): void {
    if (!this.currentTrace) return

    const step: TraceStep = {
      name,
      type,
      startTime: performance.now(),
      details,
    }

    // 结束上一步
    const lastStep = this.currentTrace.chain[this.currentTrace.chain.length - 1]
    if (lastStep && !lastStep.endTime) {
      lastStep.endTime = step.startTime
      lastStep.duration = lastStep.endTime - lastStep.startTime
      lastStep.success = true
    }

    this.currentTrace.chain.push(step)
  }

  /**
   * 结束跟踪
   */
  private endTrace(success: boolean): void {
    if (!this.currentTrace) return

    const endTime = performance.now()
    this.currentTrace.endTime = endTime
    this.currentTrace.duration = endTime - this.currentTrace.startTime
    this.currentTrace.success = success

    // 结束最后一步
    const lastStep = this.currentTrace.chain[this.currentTrace.chain.length - 1]
    if (lastStep && !lastStep.endTime) {
      lastStep.endTime = endTime
      lastStep.duration = lastStep.endTime - lastStep.startTime
      lastStep.success = success
    }

    // 添加结束步骤
    this.currentTrace.chain.push({
      name: 'Navigation End',
      type: 'end',
      startTime: endTime,
      endTime,
      duration: 0,
      success,
    })

    this.currentTrace = null
  }

  /**
   * 跟踪组件加载
   */
  private trackComponentLoad(route: RouteLocationNormalized): void {
    const componentName = route.name || route.path
    
    if (!this.componentCache.has(componentName)) {
      this.logEvent({
        type: 'component',
        level: 'debug',
        message: `Loading component: ${componentName}`,
        route: { to: route.path },
      })

      // 模拟组件加载时间测量
      const loadStart = performance.now()
      
      // 使用 nextTick 模拟组件加载完成
      Promise.resolve().then(() => {
        const loadEnd = performance.now()
        const loadTime = loadEnd - loadStart

        this.logEvent({
          type: 'component',
          level: 'info',
          message: `Component loaded: ${componentName}`,
          duration: loadTime,
          route: { to: route.path },
        })

        if (this.currentTrace) {
          this.addTraceStep('load', `Component ${componentName} loaded`, {
            duration: loadTime,
          })
        }

        this.componentCache.set(componentName, { loadTime })
      })
    }
  }

  /**
   * 记录事件
   */
  private logEvent(event: Partial<DebugEvent>): void {
    const fullEvent: DebugEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'info',
      level: 'info',
      message: '',
      ...event,
    }

    // 检查日志级别
    const levels = ['debug', 'info', 'warn', 'error']
    const configLevel = levels.indexOf(this.config.logLevel)
    const eventLevel = levels.indexOf(fullEvent.level)
    
    if (eventLevel < configLevel) return

    this.events.push(fullEvent)
    this.state.eventCount++

    // 清理旧事件
    if (this.events.length > this.config.maxEvents) {
      this.events.shift()
      this.state.eventCount--
    }

    // 控制台输出
    if (this.config.console) {
      this.consoleLog(fullEvent)
    }
  }

  /**
   * 控制台输出
   */
  private consoleLog(event: DebugEvent): void {
    const style = this.getConsoleStyle(event.level)
    const prefix = `[Router Debug ${event.type}]`
    
    console.log(
      `%c${prefix}%c ${event.message}`,
      style,
      'color: inherit',
      event.data
    )

    if (event.stack) {
      console.log(event.stack)
    }
  }

  /**
   * 获取控制台样式
   */
  private getConsoleStyle(level: DebugEvent['level']): string {
    const styles = {
      debug: 'color: #888; font-weight: normal',
      info: 'color: #2196F3; font-weight: normal',
      warn: 'color: #FF9800; font-weight: bold',
      error: 'color: #F44336; font-weight: bold',
    }
    return styles[level]
  }

  /**
   * 检查断点
   */
  private checkBreakpoint(type: string, context: any): void {
    if (!this.config.breakpoints || this.state.isPaused) return

    for (const [id, breakpoint] of this.breakpoints.entries()) {
      if (!breakpoint.enabled || breakpoint.type !== type) continue

      // 检查条件
      let shouldBreak = true
      
      if (breakpoint.condition) {
        shouldBreak = breakpoint.condition(context)
      }

      if (breakpoint.routePattern && context.to) {
        const pattern = typeof breakpoint.routePattern === 'string'
          ? new RegExp(breakpoint.routePattern)
          : breakpoint.routePattern
        
        shouldBreak = shouldBreak && pattern.test(context.to.path)
      }

      if (shouldBreak) {
        breakpoint.hitCount++
        
        this.logEvent({
          type: 'info',
          level: 'warn',
          message: `Breakpoint hit: ${id}`,
          data: { breakpoint, context },
        })

        // 执行回调
        if (breakpoint.callback) {
          breakpoint.callback(context)
        }

        // 暂停执行
        if (this.config.timeTravel) {
          this.pause()
        }
      }
    }
  }

  /**
   * 设置开发工具
   */
  private setupDevTools(): void {
    // 添加到 window 对象以便在控制台访问
    if (typeof window !== 'undefined') {
      (window as any).__ROUTER_DEBUGGER__ = this
    }

    // Vue DevTools 集成
    if (typeof window !== 'undefined' && (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      const devtoolsHook = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__
      
      devtoolsHook.emit('router:init', {
        router: this.router,
        debugger: this,
      })
    }
  }

  // ==================== 公共 API ====================

  /**
   * 启用调试器
   */
  enable(): void {
    this.config.enabled = true
    this.state.isEnabled = true
    if (!this.router.hasHooks) {
      this.initialize()
    }
  }

  /**
   * 禁用调试器
   */
  disable(): void {
    this.config.enabled = false
    this.state.isEnabled = false
  }

  /**
   * 暂停调试
   */
  pause(): void {
    this.state.isPaused = true
    this.logEvent({
      type: 'info',
      level: 'info',
      message: 'Debugger paused',
    })
  }

  /**
   * 恢复调试
   */
  resume(): void {
    this.state.isPaused = false
    this.logEvent({
      type: 'info',
      level: 'info',
      message: 'Debugger resumed',
    })
  }

  /**
   * 清除所有数据
   */
  clear(): void {
    this.events = []
    this.traces.clear()
    this.state.eventCount = 0
    this.state.traceCount = 0
    this.state.lastError = null
  }

  /**
   * 获取事件列表
   */
  getEvents(filter?: Partial<DebugEvent>): DebugEvent[] {
    let events = [...this.events]
    
    if (filter) {
      if (filter.type) {
        events = events.filter(e => e.type === filter.type)
      }
      if (filter.level) {
        events = events.filter(e => e.level === filter.level)
      }
    }

    if (this.state.filter.search) {
      const search = this.state.filter.search.toLowerCase()
      events = events.filter(e => 
        e.message.toLowerCase().includes(search) ||
        JSON.stringify(e.data).toLowerCase().includes(search)
      )
    }

    return events
  }

  /**
   * 获取跟踪记录
   */
  getTraces(): RouteTrace[] {
    return Array.from(this.traces.values())
      .sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
  }

  /**
   * 获取特定跟踪
   */
  getTrace(id: string): RouteTrace | undefined {
    return this.traces.get(id)
  }

  /**
   * 添加断点
   */
  addBreakpoint(breakpoint: Omit<Breakpoint, 'id' | 'hitCount'>): string {
    const id = `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const fullBreakpoint: Breakpoint = {
      id,
      hitCount: 0,
      enabled: true,
      ...breakpoint,
    }

    this.breakpoints.set(id, fullBreakpoint)
    this.state.breakpointCount++

    this.logEvent({
      type: 'info',
      level: 'debug',
      message: `Breakpoint added: ${id}`,
      data: fullBreakpoint,
    })

    return id
  }

  /**
   * 移除断点
   */
  removeBreakpoint(id: string): boolean {
    const deleted = this.breakpoints.delete(id)
    if (deleted) {
      this.state.breakpointCount--
      this.logEvent({
        type: 'info',
        level: 'debug',
        message: `Breakpoint removed: ${id}`,
      })
    }
    return deleted
  }

  /**
   * 启用/禁用断点
   */
  toggleBreakpoint(id: string): void {
    const breakpoint = this.breakpoints.get(id)
    if (breakpoint) {
      breakpoint.enabled = !breakpoint.enabled
      this.logEvent({
        type: 'info',
        level: 'debug',
        message: `Breakpoint ${breakpoint.enabled ? 'enabled' : 'disabled'}: ${id}`,
      })
    }
  }

  /**
   * 获取所有断点
   */
  getBreakpoints(): Breakpoint[] {
    return Array.from(this.breakpoints.values())
  }

  /**
   * 导出调试数据
   */
  exportData(): string {
    const data = {
      events: this.events,
      traces: Array.from(this.traces.entries()),
      breakpoints: Array.from(this.breakpoints.entries()),
      state: this.state,
      timestamp: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  }

  /**
   * 导入调试数据
   */
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      this.events = data.events || []
      this.traces = new Map(data.traces || [])
      this.breakpoints = new Map(data.breakpoints || [])
      
      this.state.eventCount = this.events.length
      this.state.traceCount = this.traces.size
      this.state.breakpointCount = this.breakpoints.size
      
      return true
    } catch (error) {
      console.error('Failed to import debug data:', error)
      return false
    }
  }

  /**
   * 生成调试报告
   */
  generateReport(): any {
    const events = this.getEvents()
    const traces = this.getTraces()
    
    const errorCount = events.filter(e => e.level === 'error').length
    const warnCount = events.filter(e => e.level === 'warn').length
    
    const avgNavigationTime = traces.length > 0
      ? traces.reduce((sum, t) => sum + (t.duration || 0), 0) / traces.length
      : 0
    
    const slowestRoutes = traces
      .filter(t => t.duration)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5)
    
    return {
      summary: {
        totalEvents: events.length,
        totalTraces: traces.length,
        errorCount,
        warnCount,
        avgNavigationTime,
      },
      slowestRoutes,
      recentErrors: events
        .filter(e => e.level === 'error')
        .slice(-10),
      guardExecutions: Array.from(this.guardExecutions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    }
  }

  /**
   * 销毁调试器
   */
  destroy(): void {
    this.clear()
    this.breakpoints.clear()
    this.componentCache.clear()
    this.guardExecutions.clear()
    
    if (typeof window !== 'undefined') {
      delete (window as any).__ROUTER_DEBUGGER__
    }
  }
}

// ==================== 导出便捷函数 ====================

let defaultDebugger: RouteDebugger | null = null

/**
 * 设置路由调试器
 */
export function setupRouteDebugger(
  router: Router,
  config?: DebuggerConfig
): RouteDebugger {
  if (!defaultDebugger) {
    defaultDebugger = new RouteDebugger(router, config)
  }
  return defaultDebugger
}

/**
 * 获取调试器实例
 */
export function getRouteDebugger(): RouteDebugger | null {
  return defaultDebugger
}

/**
 * 记录调试信息
 */
export function debugLog(message: string, data?: any): void {
  if (!defaultDebugger) {
    console.log('[Router Debug]', message, data)
    return
  }
  
  defaultDebugger['logEvent']({
    type: 'info',
    level: 'debug',
    message,
    data,
  })
}

/**
 * 记录警告
 */
export function debugWarn(message: string, data?: any): void {
  if (!defaultDebugger) {
    console.warn('[Router Debug]', message, data)
    return
  }
  
  defaultDebugger['logEvent']({
    type: 'warning',
    level: 'warn',
    message,
    data,
  })
}

/**
 * 记录错误
 */
export function debugError(message: string, error?: Error): void {
  if (!defaultDebugger) {
    console.error('[Router Debug]', message, error)
    return
  }
  
  defaultDebugger['logEvent']({
    type: 'error',
    level: 'error',
    message,
    data: error,
    stack: error?.stack,
  })
}