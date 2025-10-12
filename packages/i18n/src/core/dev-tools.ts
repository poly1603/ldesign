/**
 * i18n开发者工具
 * 
 * 提供调试、可视化、分析等开发者工具
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

import { UnifiedPerformanceMonitor, type PerformanceMetrics } from './unified-performance'
import { TranslationCache } from './unified-cache'
import type { I18nOptions } from './types'

/**
 * 开发工具配置
 */
export interface DevToolsConfig {
  enabled?: boolean
  enableConsoleOutput?: boolean
  enableOverlay?: boolean
  enableChrome?: boolean
  enableProfiling?: boolean
  enableHotReload?: boolean
  highlightMissing?: boolean
  highlightColor?: string
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

/**
 * i18n调试信息
 */
export interface I18nDebugInfo {
  currentLocale: string
  availableLocales: string[]
  loadedNamespaces: string[]
  missingKeys: string[]
  performanceMetrics: PerformanceMetrics
  cacheStats: any
  memoryUsage: number
  translationCount: number
  errorCount: number
}

/**
 * i18n开发者工具类
 */
export class I18nDevTools {
  private config: Required<DevToolsConfig>
  private performanceMonitor: UnifiedPerformanceMonitor
  private missingKeys = new Set<string>()
  private translationHistory: Array<{
    key: string
    locale: string
    value: string
    timestamp: number
    duration: number
  }> = []
  private overlay?: HTMLElement
  private chromeExtension?: ChromeExtensionConnector
  private profiler?: Profiler

  constructor(config: DevToolsConfig = {}) {
    this.config = {
      enabled: process.env.NODE_ENV !== 'production',
      enableConsoleOutput: true,
      enableOverlay: false,
      enableChrome: true,
      enableProfiling: false,
      enableHotReload: true,
      highlightMissing: true,
      highlightColor: '#ff0000',
      logLevel: 'info',
      ...config,
    }

    this.performanceMonitor = new UnifiedPerformanceMonitor({
      enabled: this.config.enableProfiling,
      sampleRate: 1, // 100% sampling in dev mode
    })

    if (this.config.enabled) {
      this.initialize()
    }
  }

  /**
   * 初始化开发工具
   */
  private initialize(): void {
    if (this.config.enableConsoleOutput) {
      this.setupConsoleLogging()
    }

    if (this.config.enableOverlay && typeof document !== 'undefined') {
      this.setupOverlay()
    }

    if (this.config.enableChrome) {
      this.setupChromeExtension()
    }

    if (this.config.enableProfiling) {
      this.setupProfiler()
    }

    if (this.config.enableHotReload) {
      this.setupHotReload()
    }
  }

  /**
   * 设置控制台日志
   */
  private setupConsoleLogging(): void {
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    // 增强console方法
    console.log = (...args: any[]) => {
      if (this.shouldLog('info')) {
        originalLog('[i18n]', ...args)
      }
    }

    console.warn = (...args: any[]) => {
      if (this.shouldLog('warn')) {
        originalWarn('[i18n Warning]', ...args)
      }
    }

    console.error = (...args: any[]) => {
      if (this.shouldLog('error')) {
        originalError('[i18n Error]', ...args)
      }
    }
  }

  /**
   * 设置调试覆盖层
   */
  private setupOverlay(): void {
    this.overlay = document.createElement('div')
    this.overlay.id = 'i18n-dev-overlay'
    this.overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 350px;
      max-height: 500px;
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 999999;
      overflow-y: auto;
      display: none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    `

    // 添加控制按钮
    const toggleButton = document.createElement('button')
    toggleButton.id = 'i18n-dev-toggle'
    toggleButton.textContent = '🌐'
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #4CAF50;
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      z-index: 999998;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `

    toggleButton.addEventListener('click', () => {
      if (this.overlay) {
        this.overlay.style.display = 
          this.overlay.style.display === 'none' ? 'block' : 'none'
      }
    })

    document.body.appendChild(this.overlay)
    document.body.appendChild(toggleButton)

    this.updateOverlay()
  }

  /**
   * 更新覆盖层内容
   */
  private updateOverlay(): void {
    if (!this.overlay) return

    const info = this.getDebugInfo()
    
    this.overlay.innerHTML = `
      <h3 style="margin-top: 0; color: #4CAF50;">i18n DevTools</h3>
      <div style="margin-bottom: 10px;">
        <strong>Locale:</strong> ${info.currentLocale}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Available:</strong> ${info.availableLocales.join(', ')}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Namespaces:</strong> ${info.loadedNamespaces.join(', ') || 'none'}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Cache Hit Rate:</strong> ${(info.performanceMetrics.cache.hitRate * 100).toFixed(2)}%
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Avg Translation Time:</strong> ${info.performanceMetrics.avgOperationTime.toFixed(2)}ms
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Memory:</strong> ${(info.memoryUsage / 1024 / 1024).toFixed(2)}MB
      </div>
      ${info.missingKeys.length > 0 ? `
        <div style="margin-bottom: 10px; color: #ff5252;">
          <strong>Missing Keys (${info.missingKeys.length}):</strong>
          <ul style="margin: 5px 0; padding-left: 20px;">
            ${info.missingKeys.slice(0, 10).map(key => 
              `<li>${key}</li>`
            ).join('')}
            ${info.missingKeys.length > 10 ? '<li>...</li>' : ''}
          </ul>
        </div>
      ` : ''}
      ${info.errorCount > 0 ? `
        <div style="color: #ff5252;">
          <strong>Errors:</strong> ${info.errorCount}
        </div>
      ` : ''}
    `
  }

  /**
   * 设置Chrome扩展连接
   */
  private setupChromeExtension(): void {
    if (typeof window === 'undefined') return

    this.chromeExtension = new ChromeExtensionConnector()
    this.chromeExtension.connect()

    // 监听来自扩展的消息
    this.chromeExtension.on('request-debug-info', () => {
      this.chromeExtension?.send('debug-info', this.getDebugInfo())
    })

    this.chromeExtension.on('change-locale', (locale: string) => {
      // 触发语言切换
      window.dispatchEvent(new CustomEvent('i18n:change-locale', { detail: { locale } }))
    })
  }

  /**
   * 设置性能分析器
   */
  private setupProfiler(): void {
    this.profiler = new Profiler()
    this.profiler.start()
  }

  /**
   * 设置热重载
   */
  private setupHotReload(): void {
    if (typeof window === 'undefined') return

    // 监听文件变化（需要开发服务器支持）
    if ('WebSocket' in window) {
      const ws = new WebSocket(`ws://localhost:3001/i18n-hot-reload`)
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'translation-update') {
          console.log('[i18n] Hot reloading translations...', data.locale)
          window.dispatchEvent(new CustomEvent('i18n:hot-reload', { 
            detail: { locale: data.locale, translations: data.translations } 
          }))
        }
      }

      ws.onerror = () => {
        console.debug('[i18n] Hot reload server not available')
      }
    }
  }

  /**
   * 记录翻译
   */
  recordTranslation(key: string, locale: string, value: string, duration: number): void {
    if (!this.config.enabled) return

    this.translationHistory.push({
      key,
      locale,
      value,
      timestamp: Date.now(),
      duration,
    })

    // 保持历史记录大小
    if (this.translationHistory.length > 1000) {
      this.translationHistory.shift()
    }

    // 更新覆盖层
    if (this.overlay) {
      this.updateOverlay()
    }
  }

  /**
   * 记录缺失的键
   */
  recordMissingKey(key: string, locale: string): void {
    if (!this.config.enabled) return

    const fullKey = `${locale}:${key}`
    this.missingKeys.add(fullKey)

    if (this.config.enableConsoleOutput) {
      console.warn(`[i18n] Missing translation: ${fullKey}`)
    }

    if (this.config.highlightMissing && typeof document !== 'undefined') {
      this.highlightMissingTranslation(key)
    }

    this.updateOverlay()
  }

  /**
   * 高亮显示缺失的翻译
   */
  private highlightMissingTranslation(key: string): void {
    // 查找包含该键的元素
    const elements = document.querySelectorAll(`[data-i18n-key="${key}"]`)
    elements.forEach(element => {
      (element as HTMLElement).style.outline = `2px solid ${this.config.highlightColor}`
      (element as HTMLElement).style.outlineOffset = '2px'
    })
  }

  /**
   * 获取调试信息
   */
  getDebugInfo(): I18nDebugInfo {
    return {
      currentLocale: this.getCurrentLocale(),
      availableLocales: this.getAvailableLocales(),
      loadedNamespaces: this.getLoadedNamespaces(),
      missingKeys: Array.from(this.missingKeys),
      performanceMetrics: this.performanceMonitor.getMetrics(),
      cacheStats: this.getCacheStats(),
      memoryUsage: this.getMemoryUsage(),
      translationCount: this.translationHistory.length,
      errorCount: this.getErrorCount(),
    }
  }

  /**
   * 导出调试报告
   */
  exportDebugReport(): string {
    const info = this.getDebugInfo()
    const report = {
      timestamp: new Date().toISOString(),
      ...info,
      translationHistory: this.translationHistory.slice(-100), // 最近100条
      performanceReport: this.performanceMonitor.generateReport(),
      suggestions: this.performanceMonitor.getOptimizationSuggestions(),
    }

    return JSON.stringify(report, null, 2)
  }

  /**
   * 控制台表格输出
   */
  printTable(data: any[], columns?: string[]): void {
    if (!this.config.enableConsoleOutput) return

    if (console.table) {
      console.table(data, columns)
    } else {
      console.log(data)
    }
  }

  /**
   * 性能追踪装饰器
   */
  trace(name: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      if (!this.config.enabled || !this.config.enableProfiling) {
        return descriptor
      }

      const originalMethod = descriptor.value

      descriptor.value = function (...args: any[]) {
        const startTime = performance.now()
        const result = originalMethod.apply(this, args)
        const endTime = performance.now()
        const duration = endTime - startTime

        console.debug(`[i18n Trace] ${name}.${propertyKey}: ${duration.toFixed(2)}ms`)

        return result
      }

      return descriptor
    }
  }

  /**
   * 断言助手
   */
  assert(condition: boolean, message: string): void {
    if (!this.config.enabled) return

    if (!condition) {
      const error = new Error(`[i18n Assert] ${message}`)
      console.error(error)
      throw error
    }
  }

  /**
   * 检查是否应该记录日志
   */
  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    const configLevel = levels.indexOf(this.config.logLevel)
    const messageLevel = levels.indexOf(level)
    return messageLevel >= configLevel
  }

  // 获取辅助方法（需要从i18n实例获取）
  private getCurrentLocale(): string {
    // 从全局i18n实例获取
    return (window as any).__i18n?.locale || 'unknown'
  }

  private getAvailableLocales(): string[] {
    return (window as any).__i18n?.availableLocales || []
  }

  private getLoadedNamespaces(): string[] {
    return (window as any).__i18n?.loadedNamespaces || []
  }

  private getCacheStats(): any {
    return (window as any).__i18n?.cache?.getStats() || {}
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  private getErrorCount(): number {
    return this.performanceMonitor.getMetrics().errors.total
  }

  /**
   * 销毁开发工具
   */
  destroy(): void {
    if (this.overlay) {
      this.overlay.remove()
    }

    if (this.chromeExtension) {
      this.chromeExtension.disconnect()
    }

    if (this.profiler) {
      this.profiler.stop()
    }

    this.missingKeys.clear()
    this.translationHistory = []
  }
}

/**
 * Chrome扩展连接器
 */
class ChromeExtensionConnector {
  private port?: any
  private listeners = new Map<string, Set<(data: any) => void>>()

  connect(): void {
    if (typeof window === 'undefined' || !(window as any).chrome?.runtime) {
      return
    }

    try {
      // 尝试连接到Chrome扩展
      this.port = (window as any).chrome.runtime.connect('i18n-devtools-extension')
      
      this.port.onMessage.addListener((message: any) => {
        const listeners = this.listeners.get(message.type)
        if (listeners) {
          listeners.forEach(listener => listener(message.data))
        }
      })

      this.port.onDisconnect.addListener(() => {
        console.log('[i18n] Chrome extension disconnected')
        this.port = null
      })

      console.log('[i18n] Connected to Chrome DevTools extension')
    } catch (error) {
      console.debug('[i18n] Chrome DevTools extension not available')
    }
  }

  on(event: string, listener: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  send(type: string, data: any): void {
    if (this.port) {
      this.port.postMessage({ type, data })
    }
  }

  disconnect(): void {
    if (this.port) {
      this.port.disconnect()
      this.port = null
    }
    this.listeners.clear()
  }
}

/**
 * 性能分析器
 */
class Profiler {
  private marks = new Map<string, number>()
  private measures: Array<{ name: string; duration: number }> = []
  private isRunning = false

  start(): void {
    this.isRunning = true
    console.log('[i18n Profiler] Started')
  }

  mark(name: string): void {
    if (!this.isRunning) return
    this.marks.set(name, performance.now())
  }

  measure(name: string, startMark: string, endMark?: string): void {
    if (!this.isRunning) return

    const startTime = this.marks.get(startMark)
    const endTime = endMark ? this.marks.get(endMark) : performance.now()

    if (startTime && endTime) {
      const duration = endTime - startTime
      this.measures.push({ name, duration })
      console.debug(`[i18n Profile] ${name}: ${duration.toFixed(2)}ms`)
    }
  }

  getReport(): any {
    const report = {
      marks: Array.from(this.marks.entries()),
      measures: this.measures,
      summary: {
        totalMeasures: this.measures.length,
        averageDuration: this.measures.reduce((sum, m) => sum + m.duration, 0) / this.measures.length,
        slowest: this.measures.sort((a, b) => b.duration - a.duration).slice(0, 10),
      },
    }
    return report
  }

  clear(): void {
    this.marks.clear()
    this.measures = []
  }

  stop(): void {
    this.isRunning = false
    console.log('[i18n Profiler] Stopped')
    console.log('[i18n Profiler] Report:', this.getReport())
  }
}

/**
 * 可视化仪表板
 */
export class I18nDashboard {
  private container: HTMLElement
  private charts: Map<string, any> = new Map()
  private updateInterval?: NodeJS.Timeout

  constructor(containerId: string) {
    const element = document.getElementById(containerId)
    if (!element) {
      throw new Error(`Container element with id "${containerId}" not found`)
    }
    this.container = element
    this.initialize()
  }

  private initialize(): void {
    this.container.innerHTML = `
      <div class="i18n-dashboard" style="
        padding: 20px;
        background: #f5f5f5;
        border-radius: 8px;
      ">
        <h2 style="margin-top: 0;">i18n Dashboard</h2>
        
        <div class="metrics-grid" style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        ">
          <div class="metric-card" id="locale-card">
            <h3>Current Locale</h3>
            <div class="value" style="font-size: 24px; font-weight: bold;">--</div>
          </div>
          
          <div class="metric-card" id="cache-card">
            <h3>Cache Hit Rate</h3>
            <div class="value" style="font-size: 24px; font-weight: bold;">--%</div>
          </div>
          
          <div class="metric-card" id="performance-card">
            <h3>Avg Translation Time</h3>
            <div class="value" style="font-size: 24px; font-weight: bold;">--ms</div>
          </div>
          
          <div class="metric-card" id="memory-card">
            <h3>Memory Usage</h3>
            <div class="value" style="font-size: 24px; font-weight: bold;">--MB</div>
          </div>
        </div>
        
        <div class="charts-container" style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        ">
          <div id="performance-chart" style="
            background: white;
            padding: 15px;
            border-radius: 4px;
            min-height: 300px;
          ">
            <h3>Performance Trend</h3>
            <canvas id="perf-canvas"></canvas>
          </div>
          
          <div id="usage-chart" style="
            background: white;
            padding: 15px;
            border-radius: 4px;
            min-height: 300px;
          ">
            <h3>Translation Usage</h3>
            <canvas id="usage-canvas"></canvas>
          </div>
        </div>
        
        <div class="actions" style="
          margin-top: 20px;
          display: flex;
          gap: 10px;
        ">
          <button onclick="i18nDashboard.exportReport()">Export Report</button>
          <button onclick="i18nDashboard.clearStats()">Clear Stats</button>
          <button onclick="i18nDashboard.refresh()">Refresh</button>
        </div>
      </div>
    `

    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      .i18n-dashboard .metric-card {
        background: white;
        padding: 15px;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .i18n-dashboard .metric-card h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #666;
      }
      
      .i18n-dashboard button {
        padding: 8px 16px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .i18n-dashboard button:hover {
        background: #45a049;
      }
    `
    document.head.appendChild(style)

    // 开始自动更新
    this.startAutoUpdate()
  }

  private startAutoUpdate(): void {
    this.updateInterval = setInterval(() => {
      this.updateMetrics()
    }, 1000)
  }

  private updateMetrics(): void {
    // 更新指标卡片
    const localeCard = document.querySelector('#locale-card .value')
    const cacheCard = document.querySelector('#cache-card .value')
    const perfCard = document.querySelector('#performance-card .value')
    const memoryCard = document.querySelector('#memory-card .value')

    if (localeCard) {
      localeCard.textContent = (window as any).__i18n?.locale || 'N/A'
    }

    // 获取并更新其他指标...
  }

  exportReport(): void {
    // 导出报告逻辑
    console.log('Exporting report...')
  }

  clearStats(): void {
    // 清除统计逻辑
    console.log('Clearing stats...')
  }

  refresh(): void {
    this.updateMetrics()
  }

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.charts.clear()
    this.container.innerHTML = ''
  }
}

/**
 * 创建全局开发工具实例
 */
export const globalDevTools = new I18nDevTools()

/**
 * 导出工具函数
 */
export function enableDevTools(config?: DevToolsConfig): I18nDevTools {
  return new I18nDevTools({ ...config, enabled: true })
}

export function createDashboard(containerId: string): I18nDashboard {
  return new I18nDashboard(containerId)
}