/**
 * 热模块替换(HMR)管理器
 * 🔥 提供开发环境的热更新支持，提升开发体验
 */

import type { Component } from 'vue'
import type { Engine } from '../types/engine'
import type { Plugin } from '../types/plugin'

export interface HMROptions {
  /** 是否启用HMR */
  enabled?: boolean
  /** HMR服务器地址 */
  host?: string
  /** HMR服务器端口 */
  port?: number
  /** 是否启用自动重连 */
  autoReconnect?: boolean
  /** 重连间隔(ms) */
  reconnectInterval?: number
  /** 最大重连次数 */
  maxReconnectAttempts?: number
  /** 是否保留应用状态 */
  preserveState?: boolean
  /** 自定义更新策略 */
  updateStrategy?: 'reload' | 'patch' | 'preserve'
}

export interface HMRModule {
  /** 模块ID */
  id: string
  /** 模块类型 */
  type: 'component' | 'plugin' | 'store' | 'route' | 'style'
  /** 模块内容 */
  content: unknown
  /** 时间戳 */
  timestamp: number
  /** 依赖模块 */
  dependencies?: string[]
  /** 热更新处理器 */
  hot?: {
    accept?: (callback: (module: HMRModule) => void) => void
    dispose?: (callback: () => void) => void
    data?: Record<string, unknown>
  }
}

export interface HMRUpdateEvent {
  /** 更新类型 */
  type: 'added' | 'modified' | 'removed'
  /** 更新的模块 */
  modules: HMRModule[]
  /** 更新时间戳 */
  timestamp: number
}

/**
 * HMR管理器实现
 */
export class HMRManager {
  private engine: Engine
  private options: Required<HMROptions>
  private ws?: WebSocket
  private modules: Map<string, HMRModule> = new Map()
  private updateQueue: HMRUpdateEvent[] = []
  private isProcessing = false
  private reconnectAttempts = 0
  private reconnectTimer?: NodeJS.Timeout
  private stateSnapshot?: Record<string, unknown>

  /** HMR事件监听器 */
  private listeners: Map<string, Set<(event: HMRUpdateEvent) => void>> = new Map()

  constructor(engine: Engine, options: HMROptions = {}) {
    this.engine = engine
    this.options = {
      enabled: options.enabled ?? true,
      host: options.host ?? 'localhost',
      port: options.port ?? 3000,
      autoReconnect: options.autoReconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? 2000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
      preserveState: options.preserveState ?? true,
      updateStrategy: options.updateStrategy ?? 'patch'
    }

    if (this.options.enabled && this.isDevelopment()) {
      this.initialize()
    }
  }

  /**
   * 初始化HMR
   */
  private initialize(): void {
    this.connect()
    this.setupGlobalHandlers()
    this.engine.logger.info('HMR Manager initialized', {
      host: this.options.host,
      port: this.options.port,
      strategy: this.options.updateStrategy
    })
  }

  /**
   * 连接到HMR服务器
   */
  private connect(): void {
    const wsUrl = `ws://${this.options.host}:${this.options.port}/hmr`

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.engine.logger.info('HMR connected to server')
        this.engine.events.emit('hmr:connected', { url: wsUrl })
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.ws.onerror = (error) => {
        this.engine.logger.error('HMR connection error', error)
      }

      this.ws.onclose = () => {
        this.engine.logger.warn('HMR connection closed')
        this.engine.events.emit('hmr:disconnected')

        if (this.options.autoReconnect) {
          this.scheduleReconnect()
        }
      }
    } catch (error) {
      this.engine.logger.error('Failed to create HMR connection', error)
    }
  }

  /**
   * 处理HMR消息
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data)

      switch (message.type) {
        case 'update':
          this.handleUpdate(message.payload)
          break
        case 'full-reload':
          this.handleFullReload()
          break
        case 'error':
          this.handleError(message.payload)
          break
        case 'heartbeat':
          // 心跳包，保持连接
          break
        default:
          this.engine.logger.warn('Unknown HMR message type', message.type)
      }
    } catch (error) {
      this.engine.logger.error('Failed to parse HMR message', error)
    }
  }

  /**
   * 处理模块更新
   */
  private async handleUpdate(payload: HMRUpdateEvent): Promise<void> {
    // 加入更新队列
    this.updateQueue.push(payload)

    // 如果正在处理，直接返回
    if (this.isProcessing) {
      return
    }

    // 批量处理更新
    this.isProcessing = true

    try {
      // 保存当前状态
      if (this.options.preserveState) {
        this.saveState()
      }

      while (this.updateQueue.length > 0) {
        const update = this.updateQueue.shift()!
        await this.applyUpdate(update)
      }

      // 恢复状态
      if (this.options.preserveState) {
        this.restoreState()
      }

      this.engine.logger.info('HMR updates applied successfully')
      this.engine.events.emit('hmr:updated', payload)
    } catch (error) {
      this.engine.logger.error('Failed to apply HMR updates', error)
      this.handleFullReload()
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 应用单个更新
   */
  private async applyUpdate(update: HMRUpdateEvent): Promise<void> {
    for (const module of update.modules) {
      switch (module.type) {
        case 'component':
          await this.updateComponent(module)
          break
        case 'plugin':
          await this.updatePlugin(module)
          break
        case 'store':
          await this.updateStore(module)
          break
        case 'route':
          await this.updateRoute(module)
          break
        case 'style':
          await this.updateStyle(module)
          break
        default:
          this.engine.logger.warn('Unknown module type', module.type)
      }

      // 更新模块缓存
      this.modules.set(module.id, module)

      // 触发模块的热更新回调
      if (module.hot?.accept) {
        module.hot.accept(module)
      }
    }

    // 通知监听器
    this.notifyListeners(update)
  }

  /**
   * 更新组件
   */
  private async updateComponent(module: HMRModule): Promise<void> {
    const component = module.content as Component

    // 使用Vue的热更新API
    if (import.meta.hot && typeof import.meta.hot.accept === 'function') {
      import.meta.hot.accept(module.id, (newModule) => {
        // 更新组件实例
        this.engine.logger.debug('Component hot updated', module.id)
      })
    }
  }

  /**
   * 更新插件
   */
  private async updatePlugin(module: HMRModule): Promise<void> {
    const plugin = module.content as Plugin

    // 先卸载旧插件
    if (module.hot?.dispose) {
      module.hot.dispose()
    }

    // 重新安装插件
    await this.engine.use(plugin)

    this.engine.logger.debug('Plugin hot updated', module.id)
  }

  /**
   * 更新存储
   */
  private async updateStore(module: HMRModule): Promise<void> {
    // 获取当前状态
    const currentState = this.engine.state.getState()

    // 应用新的store模块
    // 这里需要根据具体的状态管理方案实现

    // 合并状态
    if (this.options.preserveState) {
      this.engine.state.setState({
        ...currentState,
        ...module.content as Record<string, unknown>
      })
    }

    this.engine.logger.debug('Store hot updated', module.id)
  }

  /**
   * 更新路由
   */
  private async updateRoute(module: HMRModule): Promise<void> {
    if (!this.engine.router) {
      return
    }

    // 更新路由配置
    // 这里需要根据具体的路由方案实现

    this.engine.logger.debug('Route hot updated', module.id)
  }

  /**
   * 更新样式
   */
  private async updateStyle(module: HMRModule): Promise<void> {
    const styleId = `hmr-style-${module.id}`
    let styleElement = document.getElementById(styleId)

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = module.content as string

    this.engine.logger.debug('Style hot updated', module.id)
  }

  /**
   * 处理完全重载
   */
  private handleFullReload(): void {
    this.engine.logger.info('Full reload required')
    window.location.reload()
  }

  /**
   * 处理错误
   */
  private handleError(error: unknown): void {
    this.engine.logger.error('HMR error', error)

    // 显示错误覆盖层
    this.showErrorOverlay(error)
  }

  /**
   * 显示错误覆盖层
   */
  private showErrorOverlay(error: unknown): void {
    const overlay = document.createElement('div')
    overlay.id = 'hmr-error-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      color: #e74c3c;
      font-family: monospace;
      padding: 20px;
      z-index: 999999;
      overflow: auto;
    `

    const errorText = error instanceof Error
      ? `${error.message}\n\n${error.stack}`
      : String(error)

    overlay.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">⚠️ HMR Error</h2>
        <pre style="white-space: pre-wrap; word-wrap: break-word;">${errorText}</pre>
        <button onclick="document.getElementById('hmr-error-overlay').remove()" 
                style="margin-top: 20px; padding: 10px 20px; background: #e74c3c; color: white; border: none; cursor: pointer;">
          Dismiss
        </button>
      </div>
    `

    document.body.appendChild(overlay)
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.engine.logger.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++

    this.reconnectTimer = setTimeout(() => {
      this.engine.logger.info('Attempting to reconnect HMR...', {
        attempt: this.reconnectAttempts
      })
      this.connect()
    }, this.options.reconnectInterval)
  }

  /**
   * 保存当前状态
   */
  private saveState(): void {
    this.stateSnapshot = {
      store: this.engine.state.getState(),
      router: this.engine.router?.getCurrentRoute?.(),
      // 可以添加更多需要保存的状态
    }
  }

  /**
   * 恢复状态
   */
  private restoreState(): void {
    if (!this.stateSnapshot) {
      return
    }

    // 恢复存储状态
    if (this.stateSnapshot.store) {
      this.engine.state.setState(this.stateSnapshot.store as Record<string, unknown>)
    }

    // 恢复路由状态
    if (this.stateSnapshot.router && this.engine.router?.navigate) {
      this.engine.router.navigate(this.stateSnapshot.router as string)
    }

    this.stateSnapshot = undefined
  }

  /**
   * 设置全局处理器
   */
  private setupGlobalHandlers(): void {
    // 监听Vite/Webpack的HMR API
    if (import.meta.hot) {
      import.meta.hot.on('vite:beforeUpdate', () => {
        this.engine.logger.debug('Vite HMR update detected')
      })

      import.meta.hot.on('vite:error', (error) => {
        this.handleError(error)
      })
    }

    // 监听webpack的HMR API
    if ((module as any).hot) {
      (module as any).hot.addStatusHandler((status: string) => {
        this.engine.logger.debug('Webpack HMR status', status)
      })
    }
  }

  /**
   * 检查是否为开发环境
   */
  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development' ||
           this.engine.config.get('debug', false) as boolean
  }

  /**
   * 注册HMR监听器
   */
  on(event: string, listener: (event: HMRUpdateEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  /**
   * 移除HMR监听器
   */
  off(event: string, listener: (event: HMRUpdateEvent) => void): void {
    this.listeners.get(event)?.delete(listener)
  }

  /**
   * 通知监听器
   */
  private notifyListeners(event: HMRUpdateEvent): void {
    const listeners = this.listeners.get(event.type)
    if (listeners) {
      listeners.forEach(listener => listener(event))
    }
  }

  /**
   * 手动触发模块更新
   */
  async updateModule(moduleId: string, content: unknown): Promise<void> {
    const module: HMRModule = {
      id: moduleId,
      type: 'component', // 默认类型
      content,
      timestamp: Date.now()
    }

    await this.applyUpdate({
      type: 'modified',
      modules: [module],
      timestamp: Date.now()
    })
  }

  /**
   * 获取模块
   */
  getModule(moduleId: string): HMRModule | undefined {
    return this.modules.get(moduleId)
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * 销毁HMR管理器
   */
  destroy(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = undefined
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }

    this.modules.clear()
    this.updateQueue.length = 0
    this.listeners.clear()

    this.engine.logger.info('HMR Manager destroyed')
  }
}

/**
 * 创建HMR管理器
 */
export function createHMRManager(engine: Engine, options?: HMROptions): HMRManager {
  return new HMRManager(engine, options)
}
