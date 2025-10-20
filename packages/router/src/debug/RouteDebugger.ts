/**
 * 路由调试工具
 * 提供可视化路由树、路由追踪、性能分析、错误诊断
 */

import type {
  RouteLocationNormalized,
  Router,
  RouteRecordNormalized,
} from '../types'
import { logger } from '../utils/logger'

// ============= 调试配置 =============
export interface DebugConfig {
  enabled?: boolean
  visualizer?: {
    enabled?: boolean
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    hotkey?: string
    theme?: 'light' | 'dark' | 'auto'
  }
  tracer?: {
    enabled?: boolean
    maxHistory?: number
    captureStack?: boolean
    logLevel?: 'verbose' | 'info' | 'warn' | 'error'
  }
  performance?: {
    enabled?: boolean
    slowThreshold?: number
    measureComponents?: boolean
    reportInterval?: number
  }
  errorDiagnostics?: {
    enabled?: boolean
    captureErrors?: boolean
    reportErrors?: boolean
    errorEndpoint?: string
  }
}

// ============= 路由树可视化器 =============
export class RouteVisualizer {
  private container?: HTMLDivElement
  private isVisible = false
  private router: Router
  private config: DebugConfig['visualizer']

  constructor(router: Router, config: DebugConfig['visualizer'] = {}) {
    this.router = router
    this.config = {
      enabled: true,
      position: 'bottom-right',
      hotkey: 'ctrl+shift+d',
      theme: 'auto',
      ...config,
    }

    if (this.config?.enabled) {
      this.init()
    }
  }

  // 初始化
  private init(): void {
    this.createContainer()
    this.setupHotkey()
    this.render()
  }

  // 创建容器
  private createContainer(): void {
    this.container = document.createElement('div')
    this.container.id = 'route-visualizer'
    this.container.style.cssText = this.getContainerStyles()
    document.body.appendChild(this.container)
  }

  // 获取容器样式
  private getContainerStyles(): string {
    const positions: Record<string, string> = {
      'top-left': 'top: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'bottom-right': 'bottom: 20px; right: 20px;',
    }

    const theme = this.getTheme()
    const isDark = theme === 'dark'

    return `
      position: fixed;
      ${positions[this.config?.position || 'bottom-right']}
      width: 400px;
      max-height: 600px;
      background: ${isDark ? '#1e1e1e' : '#ffffff'};
      color: ${isDark ? '#ffffff' : '#000000'};
      border: 1px solid ${isDark ? '#444' : '#ddd'};
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      z-index: 999999;
      display: ${this.isVisible ? 'block' : 'none'};
      overflow: hidden;
    `
  }

  // 获取主题
  private getTheme(): 'light' | 'dark' {
    if (this.config?.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return this.config?.theme || 'light'
  }

  // 设置快捷键
  private setupHotkey(): void {
    document.addEventListener('keydown', (e) => {
      const hotkey = this.config?.hotkey || 'ctrl+shift+d'
      const keys = hotkey.split('+')

      const ctrlKey = keys.includes('ctrl') ? e.ctrlKey : true
      const shiftKey = keys.includes('shift') ? e.shiftKey : true
      const altKey = keys.includes('alt') ? e.altKey : true
      const key = keys[keys.length - 1]?.toLowerCase() || ''

      if (ctrlKey && shiftKey && altKey && e.key.toLowerCase() === key) {
        e.preventDefault()
        this.toggle()
      }
    })
  }

  // 切换显示
  toggle(): void {
    this.isVisible = !this.isVisible
    if (this.container) {
      this.container.style.display = this.isVisible ? 'block' : 'none'
      if (this.isVisible) {
        this.render()
      }
    }
  }

  // 渲染路由树
  render(): void {
    if (!this.container)
      return

    const routes = this.router.getRoutes()
    const currentRoute = this.router.currentRoute.value
    const theme = this.getTheme()
    const isDark = theme === 'dark'

    const html = `
      <div style="padding: 15px; border-bottom: 1px solid ${isDark ? '#444' : '#ddd'};">
        <h3 style="margin: 0 0 10px 0; font-size: 14px;">🗺️ Route Tree</h3>
        <div style="color: ${isDark ? '#888' : '#666'};">
          Current: ${currentRoute.path}
        </div>
      </div>
      <div style="max-height: 500px; overflow-y: auto; padding: 15px;">
        ${this.renderRouteTree(routes, currentRoute)}
      </div>
      <div style="padding: 10px; border-top: 1px solid ${isDark ? '#444' : '#ddd'}; font-size: 11px; color: ${isDark ? '#888' : '#666'};">
        Press ${this.config?.hotkey} to toggle
      </div>
    `

    this.container.innerHTML = html
  }

  // 渲染路由树节点
  private renderRouteTree(routes: RouteRecordNormalized[], currentRoute: RouteLocationNormalized): string {
    return `<ul style="list-style: none; padding: 0; margin: 0;">
      ${routes.map(route => this.renderRouteNode(route, currentRoute)).join('')}
    </ul>`
  }

  // 渲染路由节点
  private renderRouteNode(route: RouteRecordNormalized, currentRoute: RouteLocationNormalized, level = 0): string {
    const isActive = currentRoute.matched.includes(route)
    const theme = this.getTheme()
    const isDark = theme === 'dark'

    const nodeStyle = `
      padding: 5px 10px;
      margin-left: ${level * 20}px;
      background: ${isActive ? (isDark ? '#2a2a2a' : '#e8f4ff') : 'transparent'};
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    `

    const nameColor = isActive ? '#4CAF50' : (isDark ? '#ccc' : '#333')
    const pathColor = isDark ? '#888' : '#666'
    const metaColor = '#FF9800'

    let html = `
      <li>
        <div style="${nodeStyle}" onclick="">
          <span style="color: ${nameColor}; font-weight: ${isActive ? 'bold' : 'normal'};">
            ${route.name ? String(route.name) : '(unnamed)'}
          </span>
          <span style="color: ${pathColor}; margin-left: 10px;">
            ${route.path}
          </span>
          ${route.meta
            ? `<span style="color: ${metaColor}; margin-left: 10px; font-size: 10px;">
            ${JSON.stringify(route.meta)}
          </span>`
            : ''}
        </div>
    `

    if (route.children && route.children.length > 0) {
      html += `<ul style="list-style: none; padding: 0; margin: 0;">
        ${route.children.map(child => this.renderRouteNode(child, currentRoute, level + 1)).join('')}
      </ul>`
    }

    html += '</li>'
    return html
  }

  // 销毁
  destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}

// ============= 路由追踪器 =============
export class RouteTracer {
  private history: RouteTrace[] = []
  private config: DebugConfig['tracer']
  private router: Router

  constructor(router: Router, config: DebugConfig['tracer'] = {}) {
    this.router = router
    this.config = {
      enabled: true,
      maxHistory: 50,
      captureStack: true,
      logLevel: 'info',
      ...config,
    }

    if (this.config?.enabled) {
      this.setupTracing()
    }
  }

  // 设置追踪
  private setupTracing(): void {
    // 追踪导航开始
    this.router.beforeEach((to, from) => {
      const trace: RouteTrace = {
        id: this.generateId(),
        from: this.serializeRoute(from),
        to: this.serializeRoute(to),
        timestamp: Date.now(),
        type: 'navigation',
        status: 'pending',
      }

      if (this.config?.captureStack) {
        trace.stack = new Error('Navigation stack trace').stack
      }

      this.addTrace(trace)
      this.log('info', `🚀 Navigation: ${from.path} → ${to.path}`)

      return true
    })

    // 追踪导航完成
    this.router.afterEach((_to, _from, failure) => {
      const trace = this.history[this.history.length - 1]
      if (trace && trace.status === 'pending') {
        trace.status = failure ? 'failed' : 'success'
        trace.duration = Date.now() - trace.timestamp

        if (failure) {
          trace.error = this.serializeError(failure)
          this.log('error', `❌ Navigation failed: ${failure}`)
        }
        else {
          this.log('info', `✅ Navigation completed in ${trace.duration}ms`)
        }
      }
    })

    // 追踪错误
    this.router.onError((error) => {
      const trace: RouteTrace = {
        id: this.generateId(),
        timestamp: Date.now(),
        type: 'error',
        status: 'failed',
        error: this.serializeError(error),
      }

      if (this.config?.captureStack) {
        trace.stack = error.stack
      }

      this.addTrace(trace)
      this.log('error', `🔥 Router error: ${error.message}`)
    })
  }

  // 添加追踪记录
  private addTrace(trace: RouteTrace): void {
    this.history.push(trace)

    // 限制历史记录数量
    if (this.history.length > (this.config?.maxHistory || 50)) {
      this.history.shift()
    }
  }

  // 生成ID
  private generateId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 序列化路由
  private serializeRoute(route: RouteLocationNormalized): SerializedRoute {
    return {
      path: route.path,
      name: route.name,
      params: route.params,
      query: route.query,
      hash: route.hash,
      meta: route.meta,
    }
  }

  // 序列化错误
  private serializeError(error: any): SerializedError {
    return {
      message: error.message || String(error),
      type: error.constructor?.name || 'Error',
      stack: error.stack,
    }
  }

  // 日志输出
  private log(level: string, message: string, data?: any): void {
    const levels = ['verbose', 'info', 'warn', 'error']
    const configLevel = levels.indexOf(this.config?.logLevel || 'info')
    const messageLevel = levels.indexOf(level)

    if (messageLevel >= configLevel) {
      const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info'
      logger[method](`[Router] ${message}`, data || '')
    }
  }

  // 获取历史记录
  getHistory(): RouteTrace[] {
    return [...this.history]
  }

  // 获取最近的错误
  getRecentErrors(count = 10): RouteTrace[] {
    return this.history
      .filter(trace => trace.status === 'failed')
      .slice(-count)
  }

  // 清除历史
  clearHistory(): void {
    this.history = []
  }

  // 导出追踪数据
  exportTraces(): string {
    return JSON.stringify(this.history, null, 2)
  }
}

// ============= 性能分析器 =============
export class RoutePerformanceAnalyzer {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private componentTimings: Map<string, number[]> = new Map()
  private config: DebugConfig['performance']
  private router: Router
  private reportTimer?: NodeJS.Timeout

  constructor(router: Router, config: DebugConfig['performance'] = {}) {
    this.router = router
    this.config = {
      enabled: true,
      slowThreshold: 100,
      measureComponents: true,
      reportInterval: 30000,
      ...config,
    }

    if (this.config?.enabled) {
      this.setupMeasurement()

      if (this.config?.reportInterval) {
        this.startAutoReporting()
      }
    }
  }

  // 设置性能测量
  private setupMeasurement(): void {
    // 测量路由导航性能
    this.router.beforeEach((to, _from) => {
      const metric: PerformanceMetric = {
        route: to.path,
        startTime: performance.now(),
        type: 'navigation',
      }

      this.addMetric(to.path, metric)

      // 标记导航开始
      performance.mark(`route-start-${to.path}`)

      return true
    })

    this.router.afterEach((to) => {
      const metrics = this.metrics.get(to.path)
      if (metrics && metrics.length > 0) {
        const lastMetric = metrics[metrics.length - 1]
        if (lastMetric && !lastMetric.endTime) {
          lastMetric.endTime = performance.now()
          lastMetric.duration = lastMetric.endTime - lastMetric.startTime

          // 标记导航结束
          performance.mark(`route-end-${to.path}`)

          // 测量导航时间
          try {
            performance.measure(
              `route-${to.path}`,
              `route-start-${to.path}`,
              `route-end-${to.path}`,
            )
          }
          catch {
            // 忽略测量错误
          }

          // 检测慢路由
          if (lastMetric.duration && lastMetric.duration > (this.config?.slowThreshold || 100)) {
            logger.warn(`⚠️ Slow route detected: ${to.path} took ${lastMetric.duration.toFixed(2)}ms`)
            this.analyzeSlow(to.path, lastMetric)
          }
        }
      }
    })
  }

  // 添加性能指标
  private addMetric(route: string, metric: PerformanceMetric): void {
    if (!this.metrics.has(route)) {
      this.metrics.set(route, [])
    }

    const metrics = this.metrics.get(route)!
    metrics.push(metric)

    // 限制存储的指标数量
    if (metrics.length > 100) {
      metrics.shift()
    }
  }

  // 测量组件性能
  measureComponent(name: string, fn: () => void): void {
    if (!this.config?.measureComponents) {
      fn()
      return
    }

    const startTime = performance.now()
    fn()
    const duration = performance.now() - startTime

    if (!this.componentTimings.has(name)) {
      this.componentTimings.set(name, [])
    }

    const timings = this.componentTimings.get(name)!
    timings.push(duration)

    // 限制存储的时间数量
    if (timings.length > 100) {
      timings.shift()
    }
  }

  // 分析慢路由
  private analyzeSlow(_route: string, metric: PerformanceMetric): void {
    const suggestions: string[] = []

    // 分析可能的原因
    if (metric.duration! > 500) {
      suggestions.push('Consider lazy loading heavy components')
    }

    if (metric.duration! > 200) {
      suggestions.push('Check for synchronous data fetching in route guards')
    }

    if (this.componentTimings.size > 0) {
      const slowComponents = Array.from(this.componentTimings.entries())
        .filter(([_, timings]) => {
          const avg = timings.reduce((a, b) => a + b, 0) / timings.length
          return avg > 50
        })
        .map(([name]) => name)

      if (slowComponents.length > 0) {
        suggestions.push(`Slow components detected: ${slowComponents.join(', ')}`)
      }
    }

    if (suggestions.length > 0) {
      logger.info('📊 Performance suggestions:')
      suggestions.forEach(s => logger.info(`  - ${s}`))
    }
  }

  // 开始自动报告
  private startAutoReporting(): void {
    this.reportTimer = setInterval(() => {
      this.generateReport()
    }, this.config?.reportInterval || 30000) as unknown as NodeJS.Timeout
  }

  // 生成性能报告
  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      routes: [],
      components: [],
      summary: {
        totalNavigations: 0,
        avgNavigationTime: 0,
        slowestRoute: '',
        slowestTime: 0,
      },
    }

    // 分析路由性能
    this.metrics.forEach((metrics, route) => {
      const validMetrics = metrics.filter(m => m.duration)
      if (validMetrics.length === 0)
        return

      const durations = validMetrics.map(m => m.duration!)
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length
      const max = Math.max(...durations)
      const min = Math.min(...durations)

      report.routes.push({
        route,
        count: validMetrics.length,
        avg,
        min,
        max,
        p95: this.percentile(durations, 95),
      })

      report.summary.totalNavigations += validMetrics.length

      if (max > report.summary.slowestTime) {
        report.summary.slowestTime = max
        report.summary.slowestRoute = route
      }
    })

    // 计算平均导航时间
    if (report.routes.length > 0) {
      report.summary.avgNavigationTime
        = report.routes.reduce((sum, r) => sum + r.avg, 0) / report.routes.length
    }

    // 分析组件性能
    this.componentTimings.forEach((timings, component) => {
      if (timings.length === 0)
        return

      const avg = timings.reduce((a, b) => a + b, 0) / timings.length
      const max = Math.max(...timings)
      const min = Math.min(...timings)

      const componentMetric = {
        component,
        count: timings.length,
        avg,
        min,
        max
      }
      report.components.push(componentMetric)
    })

    logger.info('📊 Performance report generated', report)
    return report
  }

  // 计算百分位数
  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)] ?? 0
  }

  // 清理
  destroy(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
    }
    this.metrics.clear()
    this.componentTimings.clear()
  }
}

// ============= 错误诊断器 =============
export class RouteErrorDiagnostics {
  private errors: ErrorRecord[] = []
  private config: DebugConfig['errorDiagnostics']
  private router: Router

  constructor(router: Router, config: DebugConfig['errorDiagnostics'] = {}) {
    this.router = router
    this.config = {
      enabled: true,
      captureErrors: true,
      reportErrors: false,
      ...config,
    }

    if (this.config?.enabled) {
      this.setupErrorCapture()
    }
  }

  // 设置错误捕获
  private setupErrorCapture(): void {
    // 捕获路由错误
    this.router.onError((error) => {
      this.captureError(error, 'router')
    })

    // 捕获全局错误
    if (this.config?.captureErrors) {
      window.addEventListener('error', (event) => {
        this.captureError(event.error, 'global', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(event.reason, 'promise')
      })
    }
  }

  // 捕获错误
  private captureError(error: Error, source: string, extra?: any): void {
    const record: ErrorRecord = {
      id: this.generateId(),
      timestamp: Date.now(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      source,
      route: this.router.currentRoute.value.path,
      extra,
      diagnosis: this.diagnoseError(error),
    }

    this.errors.push(record)

    // 限制错误记录数量
    if (this.errors.length > 100) {
      this.errors.shift()
    }

    // 输出诊断信息
    this.outputDiagnosis(record)

    // 报告错误
    if (this.config?.reportErrors && this.config?.errorEndpoint) {
      this.reportError(record)
    }
  }

  // 诊断错误
  private diagnoseError(error: Error): ErrorDiagnosis {
    const diagnosis: ErrorDiagnosis = {
      type: error.name,
      category: 'unknown',
      severity: 'error',
      suggestions: [],
    }

    // 分类错误
    if (error.message.includes('Cannot find module')) {
      diagnosis.category = 'module'
      diagnosis.suggestions.push('Check if the module is installed')
      diagnosis.suggestions.push('Verify the import path is correct')
    }
    else if (error.message.includes('Navigation')) {
      diagnosis.category = 'navigation'
      diagnosis.suggestions.push('Check route configuration')
      diagnosis.suggestions.push('Verify route guards are returning correct values')
    }
    else if (error.message.includes('Permission') || error.message.includes('401') || error.message.includes('403')) {
      diagnosis.category = 'permission'
      diagnosis.suggestions.push('Check user authentication status')
      diagnosis.suggestions.push('Verify required permissions')
    }
    else if (error.message.includes('Network') || error.message.includes('fetch')) {
      diagnosis.category = 'network'
      diagnosis.suggestions.push('Check network connectivity')
      diagnosis.suggestions.push('Verify API endpoints')
    }

    // 确定严重程度
    if (error.message.includes('Critical') || error.message.includes('Fatal')) {
      diagnosis.severity = 'critical'
    }
    else if (error.message.includes('Warning')) {
      diagnosis.severity = 'warning'
    }

    return diagnosis
  }

  // 输出诊断信息
  private outputDiagnosis(record: ErrorRecord): void {
    const diagnosis = record.diagnosis

    logger.group(`🔍 Error Diagnosis [${diagnosis.severity}]`)
    logger.error('Error:', record.error.message)
    logger.info(`Category: ${diagnosis.category}`)
    logger.info(`Type: ${diagnosis.type}`)
    logger.info(`Route: ${record.route}`)

    if (diagnosis.suggestions.length > 0) {
      logger.info('Suggestions:')
      diagnosis.suggestions.forEach(s => logger.info(`  - ${s}`))
    }

    if (record.error.stack) {
      logger.debug('Stack trace:', record.error.stack)
    }

    logger.groupEnd()
  }

  // 报告错误
  private async reportError(record: ErrorRecord): Promise<void> {
    if (!this.config?.errorEndpoint)
      return

    try {
      await fetch(this.config?.errorEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
    }
    catch (e) {
      logger.error('Failed to report error:', e)
    }
  }

  // 生成ID
  private generateId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 获取错误记录
  getErrors(): ErrorRecord[] {
    return [...this.errors]
  }

  // 清除错误
  clearErrors(): void {
    this.errors = []
  }
}

// ============= 路由调试器主类 =============
export class RouteDebugger {
  private visualizer?: RouteVisualizer
  private tracer?: RouteTracer
  private performanceAnalyzer?: RoutePerformanceAnalyzer
  private errorDiagnostics?: RouteErrorDiagnostics
  private router: Router
  private config: DebugConfig

  constructor(router: Router, config: DebugConfig = {}) {
    this.router = router
    this.config = {
      enabled: true,
      ...config,
    }

    if (!this.config?.enabled)
      return

    this.visualizer = new RouteVisualizer(router, config.visualizer)
    this.tracer = new RouteTracer(router, config.tracer)
    this.performanceAnalyzer = new RoutePerformanceAnalyzer(router, config.performance)
    this.errorDiagnostics = new RouteErrorDiagnostics(router, config.errorDiagnostics)

    this.setupConsoleCommands()
  }

  // 设置控制台命令
  private setupConsoleCommands(): void {
    if (typeof window !== 'undefined') {
      (window as any).routeDebugger = {
        showVisualizer: () => this.visualizer?.toggle(),
        getHistory: () => this.tracer?.getHistory() || [],
        getErrors: () => this.errorDiagnostics?.getErrors() || [],
        getPerformance: () => this.performanceAnalyzer?.generateReport(),
        exportTraces: () => this.tracer?.exportTraces() || '[]',
        clearHistory: () => this.tracer?.clearHistory(),
        clearErrors: () => this.errorDiagnostics?.clearErrors(),
      }

      logger.info('[RouteDebugger] Console commands registered. Use window.routeDebugger to access.')
    }
  }

  // 获取调试信息
  getDebugInfo(): DebugInfo {
    return {
      currentRoute: this.router.currentRoute.value,
      routes: this.router.getRoutes(),
      history: this.tracer?.getHistory() || [],
      errors: this.errorDiagnostics?.getErrors() || [],
      performance: this.performanceAnalyzer?.generateReport() || {} as any,
    }
  }

  // 销毁
  destroy(): void {
    this.visualizer?.destroy()
    this.performanceAnalyzer?.destroy()
  }
}

// ============= 类型定义 =============
interface RouteTrace {
  id: string
  from?: SerializedRoute
  to?: SerializedRoute
  timestamp: number
  duration?: number
  type: 'navigation' | 'error'
  status: 'pending' | 'success' | 'failed'
  error?: SerializedError
  stack?: string
}

interface SerializedRoute {
  path: string
  name?: string | symbol | undefined
  params?: any
  query?: any
  hash?: string
  meta?: any
}

interface SerializedError {
  message: string
  type: string
  stack?: string
}

interface PerformanceMetric {
  route: string
  startTime: number
  endTime?: number
  duration?: number
  type: string
}

interface PerformanceReport {
  timestamp: number
  routes: Array<{
    route: string
    count: number
    avg: number
    min: number
    max: number
    p95: number
  }>
  components: Array<{
    component: string
    count: number
    avg: number
    min: number
    max: number
  }>
  summary: {
    totalNavigations: number
    avgNavigationTime: number
    slowestRoute: string
    slowestTime: number
  }
}

interface ErrorRecord {
  id: string
  timestamp: number
  error: {
    message: string
    stack?: string
    name: string
  }
  source: string
  route: string
  extra?: any
  diagnosis: ErrorDiagnosis
}

interface ErrorDiagnosis {
  type: string
  category: string
  severity: 'warning' | 'error' | 'critical'
  suggestions: string[]
}

interface DebugInfo {
  currentRoute: RouteLocationNormalized
  routes: RouteRecordNormalized[]
  history: RouteTrace[]
  errors: ErrorRecord[]
  performance: PerformanceReport
}

// ============= 导出便捷函数 =============
let defaultDebugger: RouteDebugger | null = null

export function setupRouteDebugger(
  router: Router,
  config?: DebugConfig,
): RouteDebugger {
  if (!defaultDebugger) {
    defaultDebugger = new RouteDebugger(router, config)
  }
  return defaultDebugger
}

export function getDebugInfo(): DebugInfo | null {
  return defaultDebugger?.getDebugInfo() || null
}

export function getRouteDebugger(): RouteDebugger | null {
  return defaultDebugger
}

// Debug logging functions
export function debugLog(...args: any[]): void {
  logger.info('[RouteDebug]', ...args)
}

export function debugWarn(...args: any[]): void {
  logger.warn('[RouteDebug Warning]', ...args)
}

export function debugError(...args: any[]): void {
  logger.error('[RouteDebug Error]', ...args)
}
