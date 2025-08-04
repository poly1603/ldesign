/**
 * 安全管理器
 */

import type {
  WatermarkInstance,
  SecurityConfig,
  SecurityLevel,
  SecurityViolation,
  SecurityViolationType,
  SecurityWatcher,
  SecurityWatcherType,
  SecurityCallback,
  SecurityManagerState,
  ObfuscationConfig,
  CanvasProtectionConfig
} from '../types'

import { WatermarkError, WatermarkErrorCode, ErrorSeverity } from '../types/error'
import { generateId } from '../utils/id-generator'

/**
 * 安全管理器
 * 负责水印的安全保护，防止被删除、修改或绕过
 */
export class SecurityManager {
  private watchers = new Map<string, SecurityWatcher>()
  private violations = new Map<string, SecurityViolation[]>()
  private callbacks = new Map<string, SecurityCallback[]>()
  private state: SecurityManagerState = {
    enabled: false,
    level: 'none',
    activeWatchers: 0,
    totalViolations: 0,
    lastViolationTime: 0
  }
  private intervals = new Map<string, NodeJS.Timeout>()
  private observers = new Map<string, MutationObserver>()
  private initialized = false

  /**
   * 初始化安全管理器
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    // 设置全局保护
    this.setupGlobalProtection()
    
    this.initialized = true
  }

  /**
   * 为实例启用保护
   */
  async enableProtection(instance: WatermarkInstance): Promise<void> {
    const config = instance.config.security
    if (!config || config.level === 'none') {
      return
    }

    this.state.enabled = true
    this.state.level = config.level

    // 根据安全级别启用不同的保护措施
    switch (config.level) {
      case 'low':
        await this.enableLowLevelProtection(instance)
        break
      case 'medium':
        await this.enableMediumLevelProtection(instance)
        break
      case 'high':
        await this.enableHighLevelProtection(instance)
        break
    }

    // 启用自定义监听器
    if (config.watchers) {
      for (const watcherConfig of config.watchers) {
        await this.addWatcher(instance.id, watcherConfig)
      }
    }

    // 注册回调
    if (config.onViolation) {
      this.addCallback(instance.id, config.onViolation)
    }
  }

  /**
   * 禁用实例保护
   */
  async disableProtection(instance: WatermarkInstance): Promise<void> {
    const instanceId = instance.id

    // 移除所有监听器
    const watchersToRemove = Array.from(this.watchers.entries())
      .filter(([, watcher]) => watcher.instanceId === instanceId)
      .map(([id]) => id)

    for (const watcherId of watchersToRemove) {
      await this.removeWatcher(watcherId)
    }

    // 清理回调
    this.callbacks.delete(instanceId)

    // 清理违规记录
    this.violations.delete(instanceId)

    this.updateState()
  }

  /**
   * 更新实例保护
   */
  async updateProtection(instance: WatermarkInstance): Promise<void> {
    await this.disableProtection(instance)
    await this.enableProtection(instance)
  }

  /**
   * 添加监听器
   */
  async addWatcher(
    instanceId: string,
    config: Omit<SecurityWatcher, 'id' | 'instanceId' | 'active'>
  ): Promise<string> {
    const watcherId = generateId('watcher')
    
    const watcher: SecurityWatcher = {
      id: watcherId,
      instanceId,
      type: config.type,
      interval: config.interval || 1000,
      callback: config.callback,
      active: false
    }

    this.watchers.set(watcherId, watcher)
    await this.startWatcher(watcherId)
    
    this.updateState()
    return watcherId
  }

  /**
   * 移除监听器
   */
  async removeWatcher(watcherId: string): Promise<boolean> {
    const watcher = this.watchers.get(watcherId)
    if (!watcher) {
      return false
    }

    await this.stopWatcher(watcherId)
    this.watchers.delete(watcherId)
    
    this.updateState()
    return true
  }

  /**
   * 添加违规回调
   */
  addCallback(instanceId: string, callback: SecurityCallback): void {
    if (!this.callbacks.has(instanceId)) {
      this.callbacks.set(instanceId, [])
    }
    this.callbacks.get(instanceId)!.push(callback)
  }

  /**
   * 移除违规回调
   */
  removeCallback(instanceId: string, callback: SecurityCallback): boolean {
    const callbacks = this.callbacks.get(instanceId)
    if (!callbacks) {
      return false
    }

    const index = callbacks.indexOf(callback)
    if (index === -1) {
      return false
    }

    callbacks.splice(index, 1)
    if (callbacks.length === 0) {
      this.callbacks.delete(instanceId)
    }

    return true
  }

  /**
   * 报告违规
   */
  async reportViolation(
    instanceId: string,
    type: SecurityViolationType,
    details: Record<string, any> = {}
  ): Promise<void> {
    const violation: SecurityViolation = {
      id: generateId('violation'),
      instanceId,
      type,
      timestamp: Date.now(),
      details,
      severity: this.getViolationSeverity(type)
    }

    // 记录违规
    if (!this.violations.has(instanceId)) {
      this.violations.set(instanceId, [])
    }
    this.violations.get(instanceId)!.push(violation)

    // 更新状态
    this.state.totalViolations++
    this.state.lastViolationTime = violation.timestamp

    // 执行回调
    const callbacks = this.callbacks.get(instanceId) || []
    for (const callback of callbacks) {
      try {
        await callback(violation)
      } catch (error) {
        console.error('Security callback error:', error)
      }
    }

    // 记录日志
    console.warn(`Security violation detected:`, violation)
  }

  /**
   * 获取违规记录
   */
  getViolations(instanceId?: string): SecurityViolation[] {
    if (instanceId) {
      return this.violations.get(instanceId) || []
    }

    const allViolations: SecurityViolation[] = []
    for (const violations of this.violations.values()) {
      allViolations.push(...violations)
    }
    return allViolations
  }

  /**
   * 清空违规记录
   */
  clearViolations(instanceId?: string): void {
    if (instanceId) {
      this.violations.delete(instanceId)
    } else {
      this.violations.clear()
      this.state.totalViolations = 0
    }
  }

  /**
   * 获取状态
   */
  getState(): SecurityManagerState {
    return { ...this.state }
  }

  /**
   * 销毁安全管理器
   */
  async dispose(): Promise<void> {
    // 停止所有监听器
    for (const watcherId of this.watchers.keys()) {
      await this.stopWatcher(watcherId)
    }

    // 清理所有数据
    this.watchers.clear()
    this.violations.clear()
    this.callbacks.clear()
    this.intervals.clear()
    this.observers.clear()

    this.state = {
      enabled: false,
      level: 'none',
      activeWatchers: 0,
      totalViolations: 0,
      lastViolationTime: 0
    }

    this.initialized = false
  }

  // 私有方法

  private async enableLowLevelProtection(instance: WatermarkInstance): Promise<void> {
    // 基础DOM监听
    await this.addWatcher(instance.id, {
      type: 'dom-mutation',
      interval: 2000,
      callback: async (violation) => {
        await this.reportViolation(instance.id, 'element-removed', violation)
      }
    })
  }

  private async enableMediumLevelProtection(instance: WatermarkInstance): Promise<void> {
    // 包含低级别保护
    await this.enableLowLevelProtection(instance)

    // 添加样式监听
    await this.addWatcher(instance.id, {
      type: 'style-change',
      interval: 1000,
      callback: async (violation) => {
        await this.reportViolation(instance.id, 'style-modified', violation)
      }
    })

    // 添加控制台监听
    await this.addWatcher(instance.id, {
      type: 'console-access',
      interval: 5000,
      callback: async (violation) => {
        await this.reportViolation(instance.id, 'console-manipulation', violation)
      }
    })
  }

  private async enableHighLevelProtection(instance: WatermarkInstance): Promise<void> {
    // 包含中级别保护
    await this.enableMediumLevelProtection(instance)

    // 添加开发者工具检测
    await this.addWatcher(instance.id, {
      type: 'devtools-detection',
      interval: 500,
      callback: async (violation) => {
        await this.reportViolation(instance.id, 'devtools-opened', violation)
      }
    })

    // 添加网络监听
    await this.addWatcher(instance.id, {
      type: 'network-monitoring',
      interval: 3000,
      callback: async (violation) => {
        await this.reportViolation(instance.id, 'network-interception', violation)
      }
    })

    // 启用代码混淆保护
    this.enableObfuscationProtection(instance)
  }

  private async startWatcher(watcherId: string): Promise<void> {
    const watcher = this.watchers.get(watcherId)
    if (!watcher || watcher.active) {
      return
    }

    watcher.active = true

    switch (watcher.type) {
      case 'dom-mutation':
        this.startDOMMutationWatcher(watcher)
        break
      case 'style-change':
        this.startStyleChangeWatcher(watcher)
        break
      case 'console-access':
        this.startConsoleAccessWatcher(watcher)
        break
      case 'devtools-detection':
        this.startDevToolsDetectionWatcher(watcher)
        break
      case 'network-monitoring':
        this.startNetworkMonitoringWatcher(watcher)
        break
      case 'performance-monitoring':
        this.startPerformanceMonitoringWatcher(watcher)
        break
    }
  }

  private async stopWatcher(watcherId: string): Promise<void> {
    const watcher = this.watchers.get(watcherId)
    if (!watcher || !watcher.active) {
      return
    }

    watcher.active = false

    // 清理定时器
    const interval = this.intervals.get(watcherId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(watcherId)
    }

    // 清理观察器
    const observer = this.observers.get(watcherId)
    if (observer) {
      observer.disconnect()
      this.observers.delete(watcherId)
    }
  }

  private startDOMMutationWatcher(watcher: SecurityWatcher): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const removedNode of mutation.removedNodes) {
            if (this.isWatermarkElement(removedNode as Element)) {
              watcher.callback({
                type: 'element-removed',
                element: removedNode,
                mutation
              })
            }
          }
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    })

    this.observers.set(watcher.id, observer)
  }

  private startStyleChangeWatcher(watcher: SecurityWatcher): void {
    const interval = setInterval(() => {
      // 检查水印元素的样式是否被修改
      const watermarkElements = this.findWatermarkElements()
      for (const element of watermarkElements) {
        if (this.hasStyleViolation(element)) {
          watcher.callback({
            type: 'style-modified',
            element,
            computedStyle: window.getComputedStyle(element)
          })
        }
      }
    }, watcher.interval)

    this.intervals.set(watcher.id, interval)
  }

  private startConsoleAccessWatcher(watcher: SecurityWatcher): void {
    // 监听控制台访问
    const originalConsole = { ...console }
    
    const consoleProxy = new Proxy(console, {
      get(target, prop) {
        if (typeof target[prop as keyof Console] === 'function') {
          watcher.callback({
            type: 'console-access',
            method: prop as string,
            timestamp: Date.now()
          })
        }
        return target[prop as keyof Console]
      }
    })

    // 替换全局console（注意：这可能影响正常的调试）
    if (watcher.instanceId) {
      // 仅在特定条件下启用
    }
  }

  private startDevToolsDetectionWatcher(watcher: SecurityWatcher): void {
    const interval = setInterval(() => {
      // 检测开发者工具是否打开
      const threshold = 160
      
      if (window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold) {
        watcher.callback({
          type: 'devtools-opened',
          windowSize: {
            outer: { width: window.outerWidth, height: window.outerHeight },
            inner: { width: window.innerWidth, height: window.innerHeight }
          }
        })
      }
    }, watcher.interval)

    this.intervals.set(watcher.id, interval)
  }

  private startNetworkMonitoringWatcher(watcher: SecurityWatcher): void {
    // 监听网络请求（简化实现）
    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      watcher.callback({
        type: 'network-request',
        url: args[0],
        timestamp: Date.now()
      })
      return originalFetch.apply(window, args)
    }
  }

  private startPerformanceMonitoringWatcher(watcher: SecurityWatcher): void {
    const interval = setInterval(() => {
      const performance = window.performance
      const memory = (performance as any).memory
      
      if (memory) {
        watcher.callback({
          type: 'performance-anomaly',
          memory: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          }
        })
      }
    }, watcher.interval)

    this.intervals.set(watcher.id, interval)
  }

  private setupGlobalProtection(): void {
    // 防止页面被嵌入iframe
    if (window.top !== window.self) {
      document.body.style.display = 'none'
    }

    // 禁用右键菜单
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })

    // 禁用常见快捷键
    document.addEventListener('keydown', (e) => {
      // F12, Ctrl+Shift+I, Ctrl+U 等
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault()
      }
    })
  }

  private enableObfuscationProtection(instance: WatermarkInstance): void {
    // 代码混淆保护（简化实现）
    const elements = instance.elements
    
    elements.forEach(element => {
      // 添加随机属性
      element.setAttribute('data-' + this.generateRandomString(), this.generateRandomString())
      
      // 混淆类名
      if (element.className) {
        element.className = this.obfuscateClassName(element.className)
      }
    })
  }

  private isWatermarkElement(element: Element): boolean {
    // 检查元素是否为水印元素
    return element && (
      element.hasAttribute('data-watermark') ||
      element.classList.contains('watermark') ||
      element.tagName === 'CANVAS' && element.hasAttribute('data-watermark-canvas')
    )
  }

  private findWatermarkElements(): Element[] {
    return Array.from(document.querySelectorAll('[data-watermark], .watermark, canvas[data-watermark-canvas]'))
  }

  private hasStyleViolation(element: Element): boolean {
    const style = window.getComputedStyle(element)
    
    // 检查是否被隐藏
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return true
    }
    
    // 检查是否被移出视口
    const rect = element.getBoundingClientRect()
    if (rect.left < -1000 || rect.top < -1000) {
      return true
    }
    
    return false
  }

  private getViolationSeverity(type: SecurityViolationType): 'low' | 'medium' | 'high' | 'critical' {
    switch (type) {
      case 'element-removed':
      case 'style-modified':
        return 'high'
      case 'devtools-opened':
      case 'console-manipulation':
        return 'medium'
      case 'network-interception':
        return 'critical'
      default:
        return 'low'
    }
  }

  private updateState(): void {
    this.state.activeWatchers = Array.from(this.watchers.values())
      .filter(watcher => watcher.active).length
  }

  private generateRandomString(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private obfuscateClassName(className: string): string {
    // 简单的类名混淆
    return className.split(' ').map(cls => 
      'wm-' + this.generateRandomString(6)
    ).join(' ')
  }
}