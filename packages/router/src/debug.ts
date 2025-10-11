/**
 * 路由调试工具
 * 提供全面的路由调试能力
 */

import type { RouteLocationNormalized } from './types'

/**
 * 调试日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * 路由事件类型
 */
export interface RouteEvent {
  type: string
  timestamp: number
  route?: RouteLocationNormalized
  from?: string
  to?: string
  params?: Record<string, any>
  error?: Error
  duration?: number
  meta?: Record<string, any>
}

/**
 * 路由性能指标
 */
export interface RouteMetrics {
  navigationTime: number
  renderTime: number
  totalTime: number
  cacheHit: boolean
  prefetched: boolean
  lazyLoaded: boolean
  bundleSize?: number
}

/**
 * 路由调试器类
 */
export class RouterDebugger {
  private logLevel: LogLevel = LogLevel.INFO
  private events: RouteEvent[] = []
  private maxEvents: number = 1000
  private metrics: Map<string, RouteMetrics[]> = new Map()
  private watchers: Set<(event: RouteEvent) => void> = new Set()
  private performanceMarks: Map<string, number> = new Map()
  private enabled: boolean = true
  private consoleEnabled: boolean = true
  private remoteEnabled: boolean = false
  private remoteEndpoint?: string

  constructor(config?: {
    logLevel?: LogLevel
    maxEvents?: number
    consoleEnabled?: boolean
    remoteEnabled?: boolean
    remoteEndpoint?: string
  }) {
    if (config) {
      this.logLevel = config.logLevel ?? this.logLevel
      this.maxEvents = config.maxEvents ?? this.maxEvents
      this.consoleEnabled = config.consoleEnabled ?? this.consoleEnabled
      this.remoteEnabled = config.remoteEnabled ?? this.remoteEnabled
      this.remoteEndpoint = config.remoteEndpoint
    }

    // 监听全局错误
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this))
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
    }
  }

  /**
   * 记录路由导航
   */
  logNavigation(from: string, to: string, params?: Record<string, any>): void {
    if (!this.enabled)
      return

    const event: RouteEvent = {
      type: 'navigation',
      timestamp: Date.now(),
      from,
      to,
      params,
    }

    this.addEvent(event)
    this.log(LogLevel.INFO, `Navigation: ${from} -> ${to}`, params)
    this.startPerformanceMark(`navigation:${to}`)
  }

/**
 * 记录路由加载
 */
logRouteLoad(route: string, duration: number, success: boolean): void {
    if (!this.enabled)
      return

    const event: RouteEvent = {
      type: success ? 'route-load' : 'route-load-error',
      timestamp: Date.now(),
      route,
      duration,
    }

    this.addEvent(event)
    this.log(
      success ? LogLevel.DEBUG : LogLevel.ERROR,
      `Route load ${success ? 'success' : 'failed'}: ${route} (${duration}ms)`,
    )
  }

/**
 * 记录路由错误
 */
logError(error: Error, route?: string, context?: any): void {
    if (!this.enabled)
      return

    const event: RouteEvent = {
      type: 'error',
      timestamp: Date.now(),
      route,
      error,
      meta: { context },
    }

    this.addEvent(event)
    this.log(LogLevel.ERROR, `Route error: ${error.message}`, { route, context, stack: error.stack })
  }

/**
 * 记录路由守卫
 */
logGuard(guardName: string, route: string, allowed: boolean, reason?: string): void {
    if (!this.enabled)
      return

    const event: RouteEvent = {
      type: 'guard',
      timestamp: Date.now(),
      route,
      meta: { guardName, allowed, reason },
    }

    this.addEvent(event)
    this.log(
      allowed ? LogLevel.DEBUG : LogLevel.WARN,
      `Guard ${guardName}: ${allowed ? 'allowed' : 'blocked'} for ${route}`,
      { reason },
    )
  }

  /**
   * 记录路由缓存
   */
  logCache(action: 'hit' | 'miss' | 'set' | 'clear', route: string, data?: any): void {
    if (!this.enabled)
      return

    const event: RouteEvent = {
      type: 'cache',
      timestamp: Date.now(),
      to: route,
      meta: { action, data },
    }

    this.addEvent(event)
    this.log(LogLevel.DEBUG, `Cache ${action}: ${route}`, data)
  }

  /**
   * 记录路由性能
   */
  logPerformance(route: string, metrics: RouteMetrics): void {
    if (!this.enabled)
      return

    // 存储性能指标
    if (!this.metrics.has(route)) {
      this.metrics.set(route, [])
    }
    const routeMetrics = this.metrics.get(route)!
    routeMetrics.push(metrics)
    if (routeMetrics.length > 100) {
      routeMetrics.shift()
    }

    const event: RouteEvent = {
      type: 'performance',
      timestamp: Date.now(),
      to: route,
      meta: metrics as any,
    }

    this.addEvent(event)
    this.log(LogLevel.DEBUG, `Performance metrics for ${route}:`, metrics)
  }

  /**
   * 开始性能标记
   */
  startPerformanceMark(mark: string): void {
    if (!this.enabled)
      return
    this.performanceMarks.set(mark, performance.now())
  }

  /**
   * 结束性能标记
   */
  endPerformanceMark(mark: string): number {
    if (!this.enabled)
      return 0

    const start = this.performanceMarks.get(mark)
    if (!start)
      return 0

    const duration = performance.now() - start
    this.performanceMarks.delete(mark)
    return duration
  }

  /**
   * 获取路由历史
   */
  getHistory(filter?: {
    type?: string
    route?: string
    since?: number
    limit?: number
  }): RouteEvent[] {
    let events = [...this.events]

    if (filter) {
      if (filter.type) {
        events = events.filter(e => e.type === filter.type)
      }
      if (filter.route) {
        events = events.filter(e =>
          e.route?.path === filter.route
          || e.to === filter.route
          || e.from === filter.route,
        )
      }
      if (filter.since) {
        events = events.filter(e => e.timestamp >= filter.since)
      }
      if (filter.limit) {
        events = events.slice(-filter.limit)
      }
    }

    return events
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(route?: string): Record<string, any> {
    if (route) {
      const metrics = this.metrics.get(route)
      if (!metrics || metrics.length === 0)
        return {}

      return this.calculateStats(metrics)
    }

    // 获取所有路由的统计
    const allStats: Record<string, any> = {}
    for (const [routePath, metrics] of this.metrics.entries()) {
      if (metrics.length > 0) {
        allStats[routePath] = this.calculateStats(metrics)
      }
    }
    return allStats
  }

  /**
   * 计算统计数据
   */
  private calculateStats(metrics: RouteMetrics[]): Record<string, any> {
    const times = metrics.map(m => m.totalTime)
    const navigationTimes = metrics.map(m => m.navigationTime)
    const renderTimes = metrics.map(m => m.renderTime)

    return {
      count: metrics.length,
      avgTotalTime: this.average(times),
      minTotalTime: Math.min(...times),
      maxTotalTime: Math.max(...times),
      avgNavigationTime: this.average(navigationTimes),
      avgRenderTime: this.average(renderTimes),
      cacheHitRate: metrics.filter(m => m.cacheHit).length / metrics.length,
      prefetchRate: metrics.filter(m => m.prefetched).length / metrics.length,
      lazyLoadRate: metrics.filter(m => m.lazyLoaded).length / metrics.length,
    }
  }

  /**
   * 导出调试数据
   */
  exportDebugData(): string {
    const data = {
      events: this.events,
      metrics: Object.fromEntries(this.metrics),
      performanceStats: this.getPerformanceStats(),
      timestamp: Date.now(),
      config: {
        logLevel: this.logLevel,
        maxEvents: this.maxEvents,
        enabled: this.enabled,
      },
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * 导入调试数据
   */
  importDebugData(data: string): void {
    try {
      const parsed = JSON.parse(data)
      if (parsed.events) {
        this.events = parsed.events
      }
      if (parsed.metrics) {
        this.metrics = new Map(Object.entries(parsed.metrics))
      }
      this.log(LogLevel.INFO, 'Debug data imported successfully')
    }
    catch (error) {
      this.log(LogLevel.ERROR, 'Failed to import debug data', error)
    }
  }

  /**
   * 清除调试数据
   */
  clear(): void {
    this.events = []
    this.metrics.clear()
    this.performanceMarks.clear()
    this.log(LogLevel.INFO, 'Debug data cleared')
  }

  /**
   * 监听事件
   */
  watch(callback: (event: RouteEvent) => void): () => void {
    this.watchers.add(callback)
    return () => this.watchers.delete(callback)
  }

  /**
   * 启用/禁用调试器
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.log(LogLevel.INFO, `Debugger ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * 设置日志级别
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level
    this.log(LogLevel.INFO, `Log level set to ${LogLevel[level]}`)
  }

  /**
   * 获取错误报告
   */
  getErrorReport(): {
    errors: RouteEvent[]
    summary: Record<string, number>
  } {
    const errors = this.events.filter(e =>
      e.type === 'error'
      || e.type === 'route-load-error',
    )

    const summary: Record<string, number> = {}
    errors.forEach((error) => {
      const key = error.error?.message || error.type
      summary[key] = (summary[key] || 0) + 1
    })

    return { errors, summary }
  }

  /**
   * 创建性能报告
   */
  createPerformanceReport(): string {
    const stats = this.getPerformanceStats()
    const report: string[] = [
      '=== Router Performance Report ===',
      `Generated: ${new Date().toISOString()}`,
      '',
    ]

    for (const [route, data] of Object.entries(stats)) {
      report.push(`Route: ${route}`)
      report.push(`  Requests: ${data.count}`)
      report.push(`  Avg Total Time: ${data.avgTotalTime.toFixed(2)}ms`)
      report.push(`  Min/Max Time: ${data.minTotalTime.toFixed(2)}ms / ${data.maxTotalTime.toFixed(2)}ms`)
      report.push(`  Cache Hit Rate: ${(data.cacheHitRate * 100).toFixed(1)}%`)
      report.push(`  Prefetch Rate: ${(data.prefetchRate * 100).toFixed(1)}%`)
      report.push('')
    }

    return report.join('\n')
  }

  /**
   * 发送远程日志
   */
  private async sendRemoteLog(event: RouteEvent): Promise<void> {
    if (!this.remoteEnabled || !this.remoteEndpoint)
      return

    try {
      await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          sessionId: this.getSessionId(),
          userAgent: navigator.userAgent,
        }),
      })
    }
    catch (error) {
      console.error('Failed to send remote log:', error)
    }
  }

  /**
   * 添加事件
   */
  private addEvent(event: RouteEvent): void {
    this.events.push(event)
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    // 通知观察者
    this.watchers.forEach(callback => callback(event))

    // 发送远程日志
    if (this.remoteEnabled) {
      this.sendRemoteLog(event)
    }
  }

  /**
   * 日志输出
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (level < this.logLevel || !this.consoleEnabled)
      return

    const prefix = `[Router ${LogLevel[level]}]`
    const timestamp = new Date().toISOString()

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${timestamp} ${message}`, data)
        break
      case LogLevel.INFO:
        console.info(`${prefix} ${timestamp} ${message}`, data)
        break
      case LogLevel.WARN:
        console.warn(`${prefix} ${timestamp} ${message}`, data)
        break
      case LogLevel.ERROR:
        console.error(`${prefix} ${timestamp} ${message}`, data)
        break
    }
  }

  /**
   * 处理全局错误
   */
  private handleGlobalError(event: ErrorEvent): void {
    if (!this.enabled)
      return

    // 检查是否是路由相关错误
    if (event.filename?.includes('router') || event.message?.includes('route')) {
      this.logError(new Error(event.message), undefined, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }
  }

  /**
   * 处理未处理的Promise拒绝
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    if (!this.enabled)
      return

    // 检查是否是路由相关错误
    const reason = event.reason
    if (reason?.toString?.().includes('route') || reason?.stack?.includes('router')) {
      this.logError(
        reason instanceof Error ? reason : new Error(String(reason)),
        undefined,
        { type: 'unhandled-rejection' },
      )
    }
  }

  /**
   * 获取会话ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('router-debug-session')
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('router-debug-session', sessionId)
    }
    return sessionId
  }

  /**
   * 计算平均值
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0)
      return 0
    return numbers.reduce((a, b) => a + b, 0) / numbers.length
  }
}

/**
 * 路由可视化调试工具
 */
export class RouterVisualDebugger {
  private container?: HTMLElement
  private routerDebugger: RouterDebugger
  private updateInterval?: number
  private charts: Map<string, any> = new Map()

  constructor(routerDebugger: RouterDebugger, containerId?: string) {
    this.routerDebugger = routerDebugger

    if (typeof document !== 'undefined' && containerId) {
      this.container = document.getElementById(containerId) || undefined
      this.init()
    }
  }

  /**
   * 初始化可视化界面
   */
  private init(): void {
    if (!this.container)
      return

    // 创建调试面板
    this.container.innerHTML = `
      <div class="router-debug-panel">
        <div class="debug-header">
          <h3>Router Debug Panel</h3>
          <div class="debug-controls">
            <button id="debug-toggle">Pause</button>
            <button id="debug-clear">Clear</button>
            <button id="debug-export">Export</button>
          </div>
        </div>
        
        <div class="debug-tabs">
          <button class="tab-btn active" data-tab="events">Events</button>
          <button class="tab-btn" data-tab="performance">Performance</button>
          <button class="tab-btn" data-tab="errors">Errors</button>
          <button class="tab-btn" data-tab="metrics">Metrics</button>
        </div>
        
        <div class="debug-content">
          <div id="debug-events" class="tab-content active"></div>
          <div id="debug-performance" class="tab-content"></div>
          <div id="debug-errors" class="tab-content"></div>
          <div id="debug-metrics" class="tab-content"></div>
        </div>
      </div>
    `

    this.attachEventListeners()
    this.startAutoUpdate()
    this.addStyles()
  }

  /**
   * 添加事件监听器
   */
  private attachEventListeners(): void {
    if (!this.container)
      return

    // 标签切换
    this.container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const tab = target.dataset.tab
        if (tab)
          this.switchTab(tab)
      })
    })

    // 控制按钮
    const toggleBtn = this.container.querySelector('#debug-toggle')
    toggleBtn?.addEventListener('click', () => {
      if (this.updateInterval) {
        this.stopAutoUpdate()
        toggleBtn.textContent = 'Resume'
      }
      else {
        this.startAutoUpdate()
        toggleBtn.textContent = 'Pause'
      }
    })

    const clearBtn = this.container.querySelector('#debug-clear')
    clearBtn?.addEventListener('click', () => {
      this.routerDebugger.clear()
      this.update()
    })

    const exportBtn = this.container.querySelector('#debug-export')
    exportBtn?.addEventListener('click', () => {
      this.exportData()
    })
  }

  /**
   * 切换标签
   */
  private switchTab(tab: string): void {
    if (!this.container)
      return

    // 更新标签按钮状态
    this.container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab)
    })

    // 更新内容显示
    this.container.querySelectorAll('.tab-content').forEach((content) => {
      content.classList.toggle('active', content.id === `debug-${tab}`)
    })

    // 更新当前标签内容
    this.updateTab(tab)
  }

  /**
   * 更新标签内容
   */
  private updateTab(tab: string): void {
    switch (tab) {
      case 'events':
        this.updateEvents()
        break
      case 'performance':
        this.updatePerformance()
        break
      case 'errors':
        this.updateErrors()
        break
      case 'metrics':
        this.updateMetrics()
        break
    }
  }

  /**
   * 更新事件列表
   */
  private updateEvents(): void {
    const container = this.container?.querySelector('#debug-events')
    if (!container)
      return

    const events = this.routerDebugger.getHistory({ limit: 50 })
    const html = events.reverse().map(event => `
      <div class="event-item event-${event.type}">
        <span class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
        <span class="event-type">${event.type}</span>
        <span class="event-details">
          ${event.to || event.route?.path || event.error?.message || ''}
        </span>
      </div>
    `).join('')

    container.innerHTML = html || '<div class="no-data">No events yet</div>'
  }

  /**
   * 更新性能数据
   */
  private updatePerformance(): void {
    const container = this.container?.querySelector('#debug-performance')
    if (!container)
      return

    const stats = this.routerDebugger.getPerformanceStats()
    const html = Object.entries(stats).map(([route, data]) => `
      <div class="perf-item">
        <h4>${route}</h4>
        <div class="perf-stats">
          <div class="stat">
            <span class="stat-label">Avg Time:</span>
            <span class="stat-value">${data.avgTotalTime?.toFixed(2) || 0}ms</span>
          </div>
          <div class="stat">
            <span class="stat-label">Cache Hit:</span>
            <span class="stat-value">${(data.cacheHitRate * 100).toFixed(1)}%</span>
          </div>
          <div class="stat">
            <span class="stat-label">Requests:</span>
            <span class="stat-value">${data.count}</span>
          </div>
        </div>
      </div>
    `).join('')

    container.innerHTML = html || '<div class="no-data">No performance data yet</div>'
  }

  /**
   * 更新错误信息
   */
  private updateErrors(): void {
    const container = this.container?.querySelector('#debug-errors')
    if (!container)
      return

    const { errors, summary } = this.routerDebugger.getErrorReport()

    let html = '<div class="error-summary">'
    html += '<h4>Error Summary</h4>'
    for (const [error, count] of Object.entries(summary)) {
      html += `<div class="summary-item">
        <span>${error}:</span>
        <span class="error-count">${count}</span>
      </div>`
    }
    html += '</div>'

    html += '<div class="error-list">'
    html += '<h4>Recent Errors</h4>'
    html += errors.slice(-10).reverse().map(event => `
      <div class="error-item">
        <div class="error-time">${new Date(event.timestamp).toLocaleTimeString()}</div>
        <div class="error-message">${event.error?.message || event.type}</div>
        ${event.route ? `<div class="error-route">Route: ${event.route.path}</div>` : ''}
      </div>
    `).join('')
    html += '</div>'

    container.innerHTML = html || '<div class="no-data">No errors</div>'
  }

  /**
   * 更新指标
   */
  private updateMetrics(): void {
    const container = this.container?.querySelector('#debug-metrics')
    if (!container)
      return

    const events = this.routerDebugger.getHistory()
    const eventCounts: Record<string, number> = {}

    events.forEach((event) => {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1
    })

    let html = '<div class="metrics-grid">'
    for (const [type, count] of Object.entries(eventCounts)) {
      html += `
        <div class="metric-card">
          <div class="metric-type">${type}</div>
          <div class="metric-count">${count}</div>
        </div>
      `
    }
    html += '</div>'

    container.innerHTML = html || '<div class="no-data">No metrics available</div>'
  }

  /**
   * 开始自动更新
   */
  private startAutoUpdate(): void {
    this.update()
    this.updateInterval = window.setInterval(() => this.update(), 1000)
  }

  /**
   * 停止自动更新
   */
  private stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = undefined
    }
  }

  /**
   * 更新所有数据
   */
  private update(): void {
    const activeTab = this.container?.querySelector('.tab-btn.active')
    if (activeTab) {
      const tab = activeTab.getAttribute('data-tab')
      if (tab)
        this.updateTab(tab)
    }
  }

  /**
   * 导出数据
   */
  private exportData(): void {
    const data = this.routerDebugger.exportDebugData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `router-debug-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 添加样式
   */
  private addStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      .router-debug-panel {
        font-family: monospace;
        background: #1e1e1e;
        color: #d4d4d4;
        border-radius: 8px;
        padding: 16px;
      }
      
      .debug-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #333;
      }
      
      .debug-header h3 {
        margin: 0;
        color: #569cd6;
      }
      
      .debug-controls button {
        margin-left: 8px;
        padding: 4px 12px;
        background: #3c3c3c;
        color: #d4d4d4;
        border: 1px solid #555;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .debug-controls button:hover {
        background: #4c4c4c;
      }
      
      .debug-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }
      
      .tab-btn {
        padding: 8px 16px;
        background: #2d2d2d;
        color: #969696;
        border: none;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
      }
      
      .tab-btn:hover {
        background: #3c3c3c;
      }
      
      .tab-btn.active {
        background: #3c3c3c;
        color: #d4d4d4;
      }
      
      .tab-content {
        display: none;
        max-height: 400px;
        overflow-y: auto;
      }
      
      .tab-content.active {
        display: block;
      }
      
      .event-item {
        padding: 8px;
        margin-bottom: 4px;
        background: #2d2d2d;
        border-left: 3px solid #555;
        display: flex;
        gap: 12px;
      }
      
      .event-navigation { border-left-color: #569cd6; }
      .event-error { border-left-color: #d16969; }
      .event-cache { border-left-color: #b5cea8; }
      .event-performance { border-left-color: #ce9178; }
      
      .event-time {
        color: #969696;
        font-size: 0.9em;
      }
      
      .event-type {
        color: #4ec9b0;
        font-weight: bold;
      }
      
      .perf-item {
        background: #2d2d2d;
        padding: 12px;
        margin-bottom: 8px;
        border-radius: 4px;
      }
      
      .perf-item h4 {
        margin: 0 0 8px 0;
        color: #569cd6;
      }
      
      .perf-stats {
        display: flex;
        gap: 16px;
      }
      
      .stat {
        display: flex;
        flex-direction: column;
      }
      
      .stat-label {
        color: #969696;
        font-size: 0.9em;
      }
      
      .stat-value {
        color: #b5cea8;
        font-weight: bold;
      }
      
      .error-item {
        background: #2d2d2d;
        padding: 8px;
        margin-bottom: 4px;
        border-left: 3px solid #d16969;
      }
      
      .error-message {
        color: #d16969;
      }
      
      .error-route {
        color: #969696;
        font-size: 0.9em;
      }
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }
      
      .metric-card {
        background: #2d2d2d;
        padding: 12px;
        border-radius: 4px;
        text-align: center;
      }
      
      .metric-type {
        color: #969696;
        font-size: 0.9em;
        margin-bottom: 4px;
      }
      
      .metric-count {
        color: #4ec9b0;
        font-size: 1.5em;
        font-weight: bold;
      }
      
      .no-data {
        color: #969696;
        text-align: center;
        padding: 32px;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 销毁调试器
   */
  destroy(): void {
    this.stopAutoUpdate()
    if (this.container) {
      this.container.innerHTML = ''
    }
  }
}

// 导出默认调试器实例
export const routerDebugger = new RouterDebugger({
  logLevel: process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
  maxEvents: 1000,
  consoleEnabled: process.env.NODE_ENV !== 'production',
})
