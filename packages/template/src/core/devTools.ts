/**
 * 模板开发工具系统
 */

import type { App, ComponentPublicInstance } from 'vue'
import type { Template } from '../types'
import { reactive, ref } from 'vue'

/**
 * 开发工具配置
 */
export interface DevToolsConfig {
  enabled: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  theme?: 'light' | 'dark'
  collapsed?: boolean
  features?: {
    inspector?: boolean
    debugger?: boolean
    profiler?: boolean
    analyzer?: boolean
    network?: boolean
    console?: boolean
  }
}

/**
 * 调试信息
 */
export interface DebugInfo {
  id: string
  timestamp: number
  type: 'log' | 'error' | 'warning' | 'info'
  category: string
  message: string
  data?: any
  stack?: string
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  renderTime: number
  updateTime: number
  mountTime: number
  unmountTime: number
  memoryUsage?: number
  componentCount?: number
  propUpdateCount?: number
}

/**
 * 模板调试器
 */
export class TemplateDebugger {
  private logs: DebugInfo[] = reactive([])
  private breakpoints: Map<string, Set<string>> = new Map()
  private watchedTemplates: Set<string> = new Set()
  private paused = ref(false)
  private currentContext: any = null
  
  /**
   * 添加日志
   */
  log(info: Omit<DebugInfo, 'id' | 'timestamp'>) {
    const debugInfo: DebugInfo = {
      ...info,
      id: this.generateId(),
      timestamp: Date.now()
    }
    
    this.logs.push(debugInfo)
    
    // 限制日志数量
    if (this.logs.length > 1000) {
      this.logs.shift()
    }
    
    // 触发断点
    if (this.shouldBreak(info.category)) {
      this.pause(debugInfo)
    }
  }
  
  /**
   * 设置断点
   */
  setBreakpoint(templateId: string, point: string) {
    if (!this.breakpoints.has(templateId)) {
      this.breakpoints.set(templateId, new Set())
    }
    this.breakpoints.get(templateId)!.add(point)
  }
  
  /**
   * 移除断点
   */
  removeBreakpoint(templateId: string, point: string) {
    const points = this.breakpoints.get(templateId)
    if (points) {
      points.delete(point)
      if (points.size === 0) {
        this.breakpoints.delete(templateId)
      }
    }
  }
  
  /**
   * 监视模板
   */
  watchTemplate(templateId: string) {
    this.watchedTemplates.add(templateId)
  }
  
  /**
   * 取消监视
   */
  unwatchTemplate(templateId: string) {
    this.watchedTemplates.delete(templateId)
  }
  
  /**
   * 暂停执行
   */
  private pause(info: DebugInfo) {
    this.paused.value = true
    this.currentContext = info
    
    // 在控制台中显示断点信息
    console.log('🔴 Breakpoint hit:', info)
    
    // 等待继续命令
    return new Promise(resolve => {
      const checkResume = () => {
        if (!this.paused.value) {
          resolve(undefined)
        } else {
          setTimeout(checkResume, 100)
        }
      }
      checkResume()
    })
  }
  
  /**
   * 继续执行
   */
  resume() {
    this.paused.value = false
    this.currentContext = null
  }
  
  /**
   * 步进执行
   */
  stepOver() {
    // 实现步进逻辑
    this.resume()
  }
  
  /**
   * 步入执行
   */
  stepInto() {
    // 实现步入逻辑
    this.resume()
  }
  
  /**
   * 步出执行
   */
  stepOut() {
    // 实现步出逻辑
    this.resume()
  }
  
  /**
   * 清空日志
   */
  clearLogs() {
    this.logs.splice(0, this.logs.length)
  }
  
  /**
   * 获取日志
   */
  getLogs(filter?: {
    type?: DebugInfo['type']
    category?: string
    startTime?: number
    endTime?: number
  }): DebugInfo[] {
    let result = [...this.logs]
    
    if (filter) {
      if (filter.type) {
        result = result.filter(log => log.type === filter.type)
      }
      if (filter.category) {
        result = result.filter(log => log.category === filter.category)
      }
      if (filter.startTime) {
        result = result.filter(log => log.timestamp >= filter.startTime!)
      }
      if (filter.endTime) {
        result = result.filter(log => log.timestamp <= filter.endTime!)
      }
    }
    
    return result
  }
  
  /**
   * 导出日志
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
  
  /**
   * 是否应该中断
   */
  private shouldBreak(category: string): boolean {
    // 检查是否有对应的断点
for (const points of this.breakpoints.values()) {
      if (points.has(category) || points.has('*')) {
        return true
      }
    }
    return false
  }
  
  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 性能分析器
 */
export class TemplateProfiler {
  private metrics: Map<string, PerformanceMetrics[]> = new Map()
  private timers: Map<string, number> = new Map()
  private enabled = ref(true)
  
  /**
   * 开始计时
   */
  startTimer(id: string) {
    if (!this.enabled.value) return
    
    this.timers.set(id, performance.now())
  }
  
  /**
   * 结束计时
   */
  endTimer(id: string): number {
    if (!this.enabled.value) return 0
    
    const startTime = this.timers.get(id)
    if (!startTime) return 0
    
    const duration = performance.now() - startTime
    this.timers.delete(id)
    
    return duration
  }
  
  /**
   * 记录性能指标
   */
  recordMetrics(templateId: string, metrics: PerformanceMetrics) {
    if (!this.metrics.has(templateId)) {
      this.metrics.set(templateId, [])
    }
    
    const templateMetrics = this.metrics.get(templateId)!
    templateMetrics.push(metrics)
    
    // 限制存储数量
    if (templateMetrics.length > 100) {
      templateMetrics.shift()
    }
  }
  
  /**
   * 获取性能指标
   */
  getMetrics(templateId?: string): Map<string, PerformanceMetrics[]> | PerformanceMetrics[] | undefined {
    if (templateId) {
      return this.metrics.get(templateId)
    }
    return this.metrics
  }
  
  /**
   * 获取平均性能
   */
  getAverageMetrics(templateId: string): PerformanceMetrics | undefined {
    const metrics = this.metrics.get(templateId)
    if (!metrics || metrics.length === 0) return undefined
    
    const sum = metrics.reduce((acc, m) => ({
      renderTime: acc.renderTime + m.renderTime,
      updateTime: acc.updateTime + m.updateTime,
      mountTime: acc.mountTime + m.mountTime,
      unmountTime: acc.unmountTime + m.unmountTime,
      memoryUsage: (acc.memoryUsage || 0) + (m.memoryUsage || 0),
      componentCount: (acc.componentCount || 0) + (m.componentCount || 0),
      propUpdateCount: (acc.propUpdateCount || 0) + (m.propUpdateCount || 0)
    }), {
      renderTime: 0,
      updateTime: 0,
      mountTime: 0,
      unmountTime: 0,
      memoryUsage: 0,
      componentCount: 0,
      propUpdateCount: 0
    })
    
    const count = metrics.length
    
    return {
      renderTime: sum.renderTime / count,
      updateTime: sum.updateTime / count,
      mountTime: sum.mountTime / count,
      unmountTime: sum.unmountTime / count,
      memoryUsage: sum.memoryUsage ? sum.memoryUsage / count : undefined,
      componentCount: sum.componentCount ? Math.round(sum.componentCount / count) : undefined,
      propUpdateCount: sum.propUpdateCount ? Math.round(sum.propUpdateCount / count) : undefined
    }
  }
  
  /**
   * 清空性能数据
   */
  clearMetrics(templateId?: string) {
    if (templateId) {
      this.metrics.delete(templateId)
    } else {
      this.metrics.clear()
    }
  }
  
  /**
   * 导出性能数据
   */
  exportMetrics(): string {
    const data: Record<string, any> = {}
    
    for (const [id, metrics] of this.metrics) {
      data[id] = {
        metrics,
        average: this.getAverageMetrics(id)
      }
    }
    
    return JSON.stringify(data, null, 2)
  }
  
  /**
   * 启用/禁用性能分析
   */
  setEnabled(enabled: boolean) {
    this.enabled.value = enabled
  }
}

/**
 * 模板检查器
 */
export class TemplateInspector {
  private selectedTemplate = ref<Template | null>(null)
  private selectedComponent = ref<ComponentPublicInstance | null>(null)
  private highlightEnabled = ref(false)
  
  /**
   * 选择模板
   */
  selectTemplate(template: Template) {
    this.selectedTemplate.value = template
  }
  
  /**
   * 选择组件
   */
  selectComponent(component: ComponentPublicInstance) {
    this.selectedComponent.value = component
  }
  
  /**
   * 获取模板信息
   */
  getTemplateInfo(template: Template): Record<string, any> {
    return {
      id: template.id,
      name: template.name,
      category: template.category,
      metadata: template.metadata,
      config: template.config,
      component: template.component,
      content: template.content,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }
  }
  
  /**
   * 获取组件信息
   */
  getComponentInfo(component: ComponentPublicInstance): Record<string, any> {
    return {
      name: component.$options.name || 'Anonymous',
      props: component.$props,
      data: component.$data,
      computed: this.getComputedProperties(component),
      methods: this.getMethods(component),
      refs: component.$refs,
      parent: component.$parent?.$options.name || null,
      children: []  // $children is not available in Vue 3
    }
  }
  
  /**
   * 获取计算属性
   */
  private getComputedProperties(component: ComponentPublicInstance): Record<string, any> {
    const computed: Record<string, any> = {}
    const options = component.$options.computed
    
    if (options) {
      for (const key of Object.keys(options)) {
        try {
          computed[key] = (component as any)[key]
        } catch {
          computed[key] = '<Error>'
        }
      }
    }
    
    return computed
  }
  
  /**
   * 获取方法
   */
  private getMethods(component: ComponentPublicInstance): string[] {
    const methods: string[] = []
    const options = component.$options.methods
    
    if (options) {
      methods.push(...Object.keys(options))
    }
    
    return methods
  }
  
  /**
   * 高亮元素
   */
  highlightElement(element: HTMLElement) {
    if (!this.highlightEnabled.value) return
    
    // 添加高亮样式
    const originalOutline = element.style.outline
    element.style.outline = '2px solid #FF6B6B'
    
    // 3秒后移除高亮
    setTimeout(() => {
      element.style.outline = originalOutline
    }, 3000)
  }
  
  /**
   * 启用/禁用高亮
   */
  setHighlightEnabled(enabled: boolean) {
    this.highlightEnabled.value = enabled
  }
}

/**
 * 网络监控器
 */
export class NetworkMonitor {
  private requests: any[] = reactive([])
  private enabled = ref(true)
  
  /**
   * 拦截请求
   */
  interceptRequest(config: any) {
    if (!this.enabled.value) return config
    
    const request = {
      id: this.generateId(),
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      timestamp: Date.now(),
      status: 'pending'
    }
    
    this.requests.push(request)
    
    // 限制存储数量
    if (this.requests.length > 500) {
      this.requests.shift()
    }
    
    // 添加请求ID到配置
    config._requestId = request.id
    
    return config
  }
  
  /**
   * 处理响应
   */
  handleResponse(response: any) {
    if (!this.enabled.value) return response
    
    const requestId = response.config?._requestId
    if (requestId) {
      const request = this.requests.find(r => r.id === requestId)
      if (request) {
        request.status = 'success'
        request.response = {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        }
        request.duration = Date.now() - request.timestamp
      }
    }
    
    return response
  }
  
  /**
   * 处理错误
   */
  handleError(error: any) {
    if (!this.enabled.value) return Promise.reject(error)
    
    const requestId = error.config?._requestId
    if (requestId) {
      const request = this.requests.find(r => r.id === requestId)
      if (request) {
        request.status = 'error'
        request.error = error.message
        request.duration = Date.now() - request.timestamp
      }
    }
    
    return Promise.reject(error)
  }
  
  /**
   * 获取请求列表
   */
  getRequests(filter?: {
    status?: string
    method?: string
    url?: string
  }): any[] {
    let result = [...this.requests]
    
    if (filter) {
      if (filter.status) {
        result = result.filter(r => r.status === filter.status)
      }
      if (filter.method) {
        result = result.filter(r => r.method === filter.method)
      }
      if (filter.url) {
        result = result.filter(r => r.url.includes(filter.url))
      }
    }
    
    return result
  }
  
  /**
   * 清空请求记录
   */
  clearRequests() {
    this.requests.splice(0, this.requests.length)
  }
  
  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * 启用/禁用网络监控
   */
  setEnabled(enabled: boolean) {
    this.enabled.value = enabled
  }
}

/**
 * 控制台增强
 */
export class ConsoleEnhancer {
  private originalConsole: any = {}
  private logs: any[] = reactive([])
  private filters: Set<string> = new Set(['log', 'info', 'warn', 'error', 'debug'])
  
  /**
   * 增强控制台
   */
  enhance() {
    // 保存原始console方法
    this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    }
    
    // 重写console方法
    const methods = ['log', 'info', 'warn', 'error', 'debug']
    
    for (const method of methods) {
      (console as any)[method] = (...args: any[]) => {
        // 记录日志
        this.addLog(method, args)
        
        // 调用原始方法
        this.originalConsole[method](...args)
      }
    }
  }
  
  /**
   * 恢复控制台
   */
  restore() {
    Object.assign(console, this.originalConsole)
  }
  
  /**
   * 添加日志
   */
  private addLog(type: string, args: any[]) {
    const log = {
      id: this.generateId(),
      type,
      timestamp: Date.now(),
      args,
stack: new Error('Stack').stack
    }
    
    this.logs.push(log)
    
    // 限制日志数量
    if (this.logs.length > 1000) {
      this.logs.shift()
    }
  }
  
  /**
   * 获取日志
   */
  getLogs(filter?: string[]): any[] {
    if (!filter || filter.length === 0) {
      return [...this.logs]
    }
    
    return this.logs.filter(log => filter.includes(log.type))
  }
  
  /**
   * 清空日志
   */
  clearLogs() {
    this.logs.splice(0, this.logs.length)
  }
  
  /**
   * 设置过滤器
   */
  setFilters(filters: string[]) {
    this.filters = new Set(filters)
  }
  
  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `console_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 开发工具管理器
 */
export class DevToolsManager {
  private static instance: DevToolsManager | null = null
  private config: DevToolsConfig
  private templateDebugger: TemplateDebugger | null = null
  private profiler: TemplateProfiler | null = null
  private inspector: TemplateInspector | null = null
  private networkMonitor: NetworkMonitor | null = null
  private consoleEnhancer: ConsoleEnhancer | null = null
  private app: App | null = null
  private disposed = false
  
  private constructor(config: DevToolsConfig) {
    this.config = reactive(config)
    
    // 只在开发环境创建工具实例
if (import.meta.env.DEV && config.enabled) {
      this.templateDebugger = new TemplateDebugger()
      this.profiler = new TemplateProfiler()
      this.inspector = new TemplateInspector()
      this.networkMonitor = new NetworkMonitor()
      this.consoleEnhancer = new ConsoleEnhancer()
    }
  }
  
  /**
   * 获取实例
   */
  static getInstance(config?: DevToolsConfig): DevToolsManager {
    if (!this.instance) {
      this.instance = new DevToolsManager(config || {
        enabled: true,
        position: 'bottom-right',
        theme: 'dark',
        collapsed: true,
        features: {
          inspector: true,
          debugger: true,
          profiler: true,
          analyzer: true,
          network: true,
          console: true
        }
      })
    }
    return this.instance
  }
  
  /**
   * 安装到Vue应用
   */
  install(app: App) {
    this.app = app
    
    // 注入全局属性
    app.config.globalProperties.$devTools = this
    
    // 增强控制台
    if (this.config.features?.console && this.consoleEnhancer) {
      this.consoleEnhancer.enhance()
    }
    
    // 添加全局错误处理
    app.config.errorHandler = (err, instance, info) => {
      if (this.templateDebugger) {
        const error = err as Error
        this.templateDebugger.log({
          type: 'error',
          category: 'global',
          message: error.message || String(err),
          data: {
            error: err,
            instance,
            info
          },
          stack: error.stack
        })
      }
    }
    
    // 添加警告处理
    app.config.warnHandler = (msg, instance, trace) => {
      if (this.templateDebugger) {
        this.templateDebugger.log({
          type: 'warning',
          category: 'global',
          message: msg,
          data: {
            instance,
            trace
          }
        })
      }
    }
  }
  
  /**
   * 卸载
   */
  uninstall() {
    if (this.disposed) return
    
    if (this.config.features?.console && this.consoleEnhancer) {
      this.consoleEnhancer.restore()
    }
    
    if (this.app) {
      delete this.app.config.globalProperties.$devTools
      this.app.config.errorHandler = undefined
      this.app.config.warnHandler = undefined
      this.app = null
    }
    
    // 清理所有工具实例
    this.dispose()
  }
  
  /**
   * 销毁实例
   */
  private dispose() {
    this.disposed = true
    
    // 清理所有工具
    if (this.templateDebugger) {
      this.templateDebugger.clearLogs()
      this.templateDebugger = null
    }
    if (this.profiler) {
      this.profiler.clearMetrics()
      this.profiler = null
    }
    if (this.inspector) {
      this.inspector = null
    }
    if (this.networkMonitor) {
      this.networkMonitor.clearRequests()
      this.networkMonitor = null
    }
    if (this.consoleEnhancer) {
      this.consoleEnhancer.clearLogs()
      this.consoleEnhancer = null
    }
    
    // 清理单例引用
    if (DevToolsManager.instance === this) {
      DevToolsManager.instance = null
    }
  }
  
  /**
   * 获取调试器
   */
  getDebugger(): TemplateDebugger | null {
    return this.templateDebugger
  }
  
  /**
   * 获取性能分析器
   */
  getProfiler(): TemplateProfiler | null {
    return this.profiler
  }
  
  /**
   * 获取检查器
   */
  getInspector(): TemplateInspector | null {
    return this.inspector
  }
  
  /**
   * 获取网络监控器
   */
  getNetworkMonitor(): NetworkMonitor | null {
    return this.networkMonitor
  }
  
  /**
   * 获取控制台增强器
   */
  getConsoleEnhancer(): ConsoleEnhancer | null {
    return this.consoleEnhancer
  }
  
  /**
   * 更新配置
   */
  updateConfig(config: Partial<DevToolsConfig>) {
    Object.assign(this.config, config)
  }
  
  /**
   * 获取配置
   */
  getConfig(): DevToolsConfig {
    return this.config
  }
  
  /**
   * 启用/禁用
   */
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled
    
    if (!enabled) {
      this.consoleEnhancer?.restore()
    } else if (this.config.features?.console) {
      this.consoleEnhancer?.enhance()
    }
  }
}

// 导出单例
export const devTools = DevToolsManager.getInstance()