/**
 * 错误处理器
 * 
 * 负责全局错误处理、错误恢复、错误报告和用户通知
 */

import { EventEmitter } from 'events'
import type {
  IErrorHandler,
  ErrorInfo,
  ErrorHandlerConfig,
  ErrorType
} from './types'

/**
 * 错误处理器实现
 */
export class ErrorHandler extends EventEmitter implements IErrorHandler {
  private config: ErrorHandlerConfig
  private errorHistory: ErrorInfo[] = []
  private retryAttempts: Map<string, number> = new Map()
  private notificationContainer?: HTMLElement
  private sessionId: string

  constructor(config: ErrorHandlerConfig) {
    super()
    this.config = {
      enabled: true,
      autoRecover: true,
      retry: {
        enabled: true,
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential'
      },
      reporting: {
        enabled: false,
        includeStack: true,
        includeContext: true
      },
      notification: {
        enabled: true,
        showDetails: false,
        allowDismiss: true,
        autoHide: true,
        duration: 5000
      },
      ...config
    }

    this.sessionId = this.generateSessionId()

    if (this.config.enabled) {
      this.initialize()
    }
  }

  /**
   * 初始化错误处理器
   */
  private initialize(): void {
    // 设置全局错误处理
    this.setupGlobalErrorHandling()

    // 设置Promise错误处理
    this.setupPromiseErrorHandling()

    // 设置网络错误处理
    this.setupNetworkErrorHandling()

    // 创建通知容器
    if (this.config.notification.enabled) {
      this.createNotificationContainer()
    }

    console.log('错误处理器已初始化')
    this.emit('initialized', { sessionId: this.sessionId, timestamp: Date.now() })
  }

  /**
   * 处理错误
   */
  handleError(error: Error, context: Record<string, any> = {}): void {
    const errorInfo = this.createErrorInfo(error, context)
    
    // 添加到历史记录
    this.errorHistory.push(errorInfo)
    
    // 限制历史记录大小
    if (this.errorHistory.length > 100) {
      this.errorHistory.shift()
    }

    console.error('处理错误:', errorInfo)

    // 尝试恢复
    if (this.config.autoRecover) {
      this.attemptRecovery(errorInfo)
    }

    // 显示用户通知
    if (this.config.notification.enabled) {
      this.showErrorNotification(errorInfo)
    }

    // 报告错误
    if (this.config.reporting.enabled) {
      this.reportError(errorInfo)
    }

    this.emit('errorHandled', errorInfo)
  }

  /**
   * 尝试恢复错误
   */
  async recover(errorId: string): Promise<boolean> {
    const errorInfo = this.errorHistory.find(e => e.id === errorId)
    if (!errorInfo) {
      return false
    }

    console.log('尝试恢复错误:', errorId)

    try {
      const recovered = await this.attemptRecovery(errorInfo)
      if (recovered) {
        errorInfo.recovered = true
        this.emit('errorRecovered', { errorId, timestamp: Date.now() })
      }
      return recovered
    } catch (recoveryError) {
      console.error('错误恢复失败:', recoveryError)
      return false
    }
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(): ErrorInfo[] {
    return [...this.errorHistory]
  }

  /**
   * 清除错误历史
   */
  clearErrors(): void {
    this.errorHistory = []
    this.retryAttempts.clear()
    this.emit('errorsCleared', { timestamp: Date.now() })
  }

  /**
   * 设置全局错误处理
   */
  private setupGlobalErrorHandling(): void {
    // JavaScript错误
    window.addEventListener('error', (event) => {
      const error = new Error(event.message)
      error.stack = `${event.filename}:${event.lineno}:${event.colno}`
      
      this.handleError(error, {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement
        const error = new Error(`资源加载失败: ${target.tagName}`)
        
        this.handleError(error, {
          type: 'resource',
          element: target.tagName,
          src: target.getAttribute('src') || target.getAttribute('href')
        })
      }
    }, true)
  }

  /**
   * 设置Promise错误处理
   */
  private setupPromiseErrorHandling(): void {
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))
      
      this.handleError(error, {
        type: 'promise',
        reason: event.reason
      })
    })
  }

  /**
   * 设置网络错误处理
   */
  private setupNetworkErrorHandling(): void {
    // 拦截fetch请求
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        if (!response.ok) {
          const error = new Error(`网络请求失败: ${response.status} ${response.statusText}`)
          this.handleError(error, {
            type: 'network',
            url: args[0],
            status: response.status,
            statusText: response.statusText
          })
        }
        
        return response
      } catch (error) {
        this.handleError(error as Error, {
          type: 'network',
          url: args[0]
        })
        throw error
      }
    }
  }

  /**
   * 创建错误信息
   */
  private createErrorInfo(error: Error, context: Record<string, any>): ErrorInfo {
    return {
      id: this.generateErrorId(),
      type: this.determineErrorType(error, context),
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      line: this.extractLineNumber(error.stack),
      column: this.extractColumnNumber(error.stack),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      context,
      severity: this.determineSeverity(error, context),
      recovered: false
    }
  }

  /**
   * 确定错误类型
   */
  private determineErrorType(error: Error, context: Record<string, any>): ErrorType {
    if (context.type) {
      return context.type as ErrorType
    }

    if (error.name === 'TypeError') {
      return 'javascript'
    }

    if (error.message.includes('网络') || error.message.includes('fetch')) {
      return 'network'
    }

    if (error.message.includes('权限') || error.message.includes('permission')) {
      return 'permission'
    }

    if (error.message.includes('超时') || error.message.includes('timeout')) {
      return 'timeout'
    }

    if (error.message.includes('内存') || error.message.includes('memory')) {
      return 'memory'
    }

    return 'unknown'
  }

  /**
   * 确定错误严重程度
   */
  private determineSeverity(error: Error, context: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    const type = this.determineErrorType(error, context)

    switch (type) {
      case 'memory':
        return 'critical'
      case 'network':
        return context.status >= 500 ? 'high' : 'medium'
      case 'javascript':
        return error.message.includes('Cannot read property') ? 'high' : 'medium'
      case 'permission':
        return 'medium'
      case 'timeout':
        return 'medium'
      case 'resource':
        return 'low'
      default:
        return 'low'
    }
  }

  /**
   * 尝试错误恢复
   */
  private async attemptRecovery(errorInfo: ErrorInfo): Promise<boolean> {
    if (!this.config.retry.enabled) {
      return false
    }

    const attempts = this.retryAttempts.get(errorInfo.id) || 0
    if (attempts >= this.config.retry.maxAttempts) {
      return false
    }

    // 增加重试次数
    this.retryAttempts.set(errorInfo.id, attempts + 1)

    // 计算延迟时间
    const delay = this.calculateRetryDelay(attempts)
    
    console.log(`尝试恢复错误 ${errorInfo.id}，第 ${attempts + 1} 次重试，延迟 ${delay}ms`)

    await this.sleep(delay)

    try {
      const recovered = await this.executeRecoveryStrategy(errorInfo)
      
      if (recovered) {
        this.retryAttempts.delete(errorInfo.id)
        console.log(`错误 ${errorInfo.id} 恢复成功`)
      }
      
      return recovered
    } catch (recoveryError) {
      console.error('恢复策略执行失败:', recoveryError)
      return false
    }
  }

  /**
   * 执行恢复策略
   */
  private async executeRecoveryStrategy(errorInfo: ErrorInfo): Promise<boolean> {
    switch (errorInfo.type) {
      case 'network':
        return this.recoverNetworkError(errorInfo)
      case 'memory':
        return this.recoverMemoryError(errorInfo)
      case 'javascript':
        return this.recoverJavaScriptError(errorInfo)
      case 'resource':
        return this.recoverResourceError(errorInfo)
      default:
        return false
    }
  }

  /**
   * 恢复网络错误
   */
  private async recoverNetworkError(errorInfo: ErrorInfo): Promise<boolean> {
    const url = errorInfo.context.url
    if (!url) return false

    try {
      const response = await fetch(url)
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * 恢复内存错误
   */
  private async recoverMemoryError(errorInfo: ErrorInfo): Promise<boolean> {
    // 触发垃圾回收
    if ((window as any).gc) {
      (window as any).gc()
    }

    // 清理缓存
    this.emit('clearCache')

    // 检查内存使用情况
    const memory = (performance as any).memory
    if (memory) {
      const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
      return usage < 0.8 // 如果内存使用率降到80%以下认为恢复成功
    }

    return true
  }

  /**
   * 恢复JavaScript错误
   */
  private async recoverJavaScriptError(errorInfo: ErrorInfo): Promise<boolean> {
    // 重新初始化相关组件
    this.emit('reinitialize')
    return true
  }

  /**
   * 恢复资源错误
   */
  private async recoverResourceError(errorInfo: ErrorInfo): Promise<boolean> {
    const src = errorInfo.context.src
    if (!src) return false

    // 尝试重新加载资源
    return new Promise((resolve) => {
      const element = errorInfo.context.element === 'IMG' 
        ? new Image() 
        : document.createElement('script')

      element.onload = () => resolve(true)
      element.onerror = () => resolve(false)

      if (element instanceof HTMLImageElement) {
        element.src = src
      } else {
        (element as HTMLScriptElement).src = src
      }
    })
  }

  /**
   * 计算重试延迟
   */
  private calculateRetryDelay(attempts: number): number {
    const baseDelay = this.config.retry.delay

    if (this.config.retry.backoff === 'exponential') {
      return baseDelay * Math.pow(2, attempts)
    } else {
      return baseDelay * (attempts + 1)
    }
  }

  /**
   * 创建通知容器
   */
  private createNotificationContainer(): void {
    this.notificationContainer = document.createElement('div')
    this.notificationContainer.className = 'error-notifications'
    this.notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `
    document.body.appendChild(this.notificationContainer)
  }

  /**
   * 显示错误通知
   */
  private showErrorNotification(errorInfo: ErrorInfo): void {
    if (!this.notificationContainer) return

    const notification = document.createElement('div')
    notification.className = `error-notification severity-${errorInfo.severity}`
    notification.style.cssText = `
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `

    const title = document.createElement('div')
    title.style.fontWeight = 'bold'
    title.textContent = this.getErrorTitle(errorInfo.type)

    const message = document.createElement('div')
    message.textContent = this.getUserFriendlyMessage(errorInfo)

    notification.appendChild(title)
    notification.appendChild(message)

    // 添加详情按钮
    if (this.config.notification.showDetails) {
      const detailsButton = document.createElement('button')
      detailsButton.textContent = '查看详情'
      detailsButton.style.cssText = `
        background: none;
        border: none;
        color: #721c24;
        text-decoration: underline;
        cursor: pointer;
        margin-top: 8px;
      `
      detailsButton.onclick = () => this.showErrorDetails(errorInfo)
      notification.appendChild(detailsButton)
    }

    // 添加关闭按钮
    if (this.config.notification.allowDismiss) {
      const closeButton = document.createElement('button')
      closeButton.textContent = '×'
      closeButton.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #721c24;
      `
      closeButton.onclick = () => notification.remove()
      notification.style.position = 'relative'
      notification.appendChild(closeButton)
    }

    this.notificationContainer.appendChild(notification)

    // 自动隐藏
    if (this.config.notification.autoHide) {
      setTimeout(() => {
        notification.remove()
      }, this.config.notification.duration)
    }
  }

  /**
   * 获取错误标题
   */
  private getErrorTitle(type: ErrorType): string {
    const titles = {
      javascript: 'JavaScript错误',
      network: '网络错误',
      validation: '验证错误',
      permission: '权限错误',
      resource: '资源加载错误',
      timeout: '超时错误',
      memory: '内存错误',
      unknown: '未知错误'
    }
    return titles[type] || '错误'
  }

  /**
   * 获取用户友好的错误消息
   */
  private getUserFriendlyMessage(errorInfo: ErrorInfo): string {
    switch (errorInfo.type) {
      case 'network':
        return '网络连接出现问题，请检查您的网络连接'
      case 'memory':
        return '应用使用了过多内存，正在尝试优化'
      case 'resource':
        return '某些资源加载失败，正在尝试重新加载'
      case 'permission':
        return '权限不足，请检查相关权限设置'
      case 'timeout':
        return '操作超时，请稍后重试'
      default:
        return '应用遇到了一个问题，正在尝试自动修复'
    }
  }

  /**
   * 显示错误详情
   */
  private showErrorDetails(errorInfo: ErrorInfo): void {
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    const content = document.createElement('div')
    content.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 600px;
      max-height: 80%;
      overflow: auto;
    `

    content.innerHTML = `
      <h3>错误详情</h3>
      <p><strong>ID:</strong> ${errorInfo.id}</p>
      <p><strong>类型:</strong> ${errorInfo.type}</p>
      <p><strong>消息:</strong> ${errorInfo.message}</p>
      <p><strong>时间:</strong> ${new Date(errorInfo.timestamp).toLocaleString()}</p>
      ${errorInfo.stack ? `<p><strong>堆栈:</strong><br><pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${errorInfo.stack}</pre></p>` : ''}
      <button onclick="this.closest('.error-modal').remove()" style="margin-top: 10px; padding: 8px 16px;">关闭</button>
    `

    modal.className = 'error-modal'
    modal.appendChild(content)
    document.body.appendChild(modal)

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    }
  }

  /**
   * 报告错误
   */
  private async reportError(errorInfo: ErrorInfo): void {
    if (!this.config.reporting.endpoint) {
      return
    }

    const reportData = {
      id: errorInfo.id,
      type: errorInfo.type,
      message: errorInfo.message,
      timestamp: errorInfo.timestamp,
      url: errorInfo.url,
      userAgent: errorInfo.userAgent,
      sessionId: errorInfo.sessionId,
      severity: errorInfo.severity
    }

    if (this.config.reporting.includeStack && errorInfo.stack) {
      (reportData as any).stack = errorInfo.stack
    }

    if (this.config.reporting.includeContext) {
      (reportData as any).context = errorInfo.context
    }

    try {
      await fetch(this.config.reporting.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      })
    } catch (error) {
      console.error('错误报告发送失败:', error)
    }
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 提取行号
   */
  private extractLineNumber(stack?: string): number | undefined {
    if (!stack) return undefined
    const match = stack.match(/:(\d+):\d+/)
    return match ? parseInt(match[1]) : undefined
  }

  /**
   * 提取列号
   */
  private extractColumnNumber(stack?: string): number | undefined {
    if (!stack) return undefined
    const match = stack.match(/:(\d+):(\d+)/)
    return match ? parseInt(match[2]) : undefined
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 销毁错误处理器
   */
  destroy(): void {
    if (this.notificationContainer) {
      this.notificationContainer.remove()
    }

    this.errorHistory = []
    this.retryAttempts.clear()

    console.log('错误处理器已销毁')
    this.emit('destroyed', { timestamp: Date.now() })
  }
}
