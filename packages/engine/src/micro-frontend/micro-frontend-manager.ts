/**
 * 微前端管理器
 * 支持模块联邦、动态加载和应用隔离
 */

import type { Logger } from '../types'
import type { Engine } from '../types/engine'

// ==================== 类型定义 ====================

export interface MicroApp {
  name: string
  entry: string | MicroAppEntry
  container: string | HTMLElement
  activeRule: string | RegExp | ((location: Location) => boolean)
  props?: Record<string, unknown>
  sandbox?: boolean | SandboxConfig
  prefetch?: boolean | 'all'
  singular?: boolean
  loader?: (loading: boolean) => void
}

export interface MicroAppEntry {
  scripts?: string[]
  styles?: string[]
  html?: string
}

export interface SandboxConfig {
  strictStyleIsolation?: boolean
  experimentalStyleIsolation?: boolean
  patchers?: SandboxPatcher[]
}

export interface SandboxPatcher {
  mount?: (app: LoadedMicroApp) => void
  unmount?: (app: LoadedMicroApp) => void
}

export interface LoadedMicroApp extends MicroApp {
  id: string
  status: 'loading' | 'loaded' | 'mounting' | 'mounted' | 'unmounting' | 'error'
  instance?: MicroAppInstance
  error?: Error
  sandboxInstance?: Sandbox
}

export interface MicroAppInstance {
  mount: (props?: Record<string, unknown>) => Promise<void>
  unmount: () => Promise<void>
  update?: (props: Record<string, unknown>) => Promise<void>
  getStatus?: () => string
}

export interface Sandbox {
  proxy: WindowProxy
  active: boolean
  mount: () => void
  unmount: () => void
  clear: () => void
}

export interface ModuleFederationConfig {
  name: string
  filename?: string
  exposes?: Record<string, string>
  remotes?: Record<string, string>
  shared?: Record<string, SharedConfig>
}

export interface SharedConfig {
  singleton?: boolean
  strictVersion?: boolean
  requiredVersion?: string
  eager?: boolean
}

// ==================== 实现 ====================

export class MicroFrontendManager {
  private apps = new Map<string, LoadedMicroApp>()
  private currentApp?: LoadedMicroApp
  private engine?: Engine
  private logger?: Logger
  private routerMode: 'hash' | 'history' = 'history'
  private globalState = new Map<string, unknown>()
  private eventBus = new Map<string, Set<(...args: any[]) => void>>()
  private prefetchQueue: Set<string> = new Set()
  private moduleFederations = new Map<string, ModuleFederationConfig>()

  constructor(engine?: Engine) {
    this.engine = engine
    this.logger = engine?.logger
    this.initialize()
  }

  // ==================== 公共 API ====================

  /**
   * 注册微应用
   */
  registerApp(app: MicroApp): void {
    const id = this.generateAppId(app.name)
    const loadedApp: LoadedMicroApp = {
      ...app,
      id,
      status: 'loading'
    }
    
    this.apps.set(app.name, loadedApp)
    this.logger?.debug(`Micro app registered: ${app.name}`)
    
    // 预加载
    if (app.prefetch) {
      this.prefetchApp(loadedApp)
    }
  }

  /**
   * 批量注册微应用
   */
  registerApps(apps: MicroApp[]): void {
    apps.forEach(app => this.registerApp(app))
  }

  /**
   * 启动微前端系统
   */
  async start(): Promise<void> {
    this.logger?.info('Starting micro frontend system')
    
    // 监听路由变化
    this.setupRouteListener()
    
    // 检查当前路由
    await this.checkCurrentRoute()
  }

  /**
   * 手动加载应用
   */
  async loadApp(name: string): Promise<LoadedMicroApp> {
    const app = this.apps.get(name)
    if (!app) {
      throw new Error(`Micro app not found: ${name}`)
    }
    
    if (app.status === 'loaded' || app.status === 'mounted') {
      return app
    }
    
    try {
      app.status = 'loading'
      app.loader?.(true)
      
      // 加载应用资源
      const { scripts, styles } = await this.fetchAppResources(app)
      
      // 创建沙箱
      if (app.sandbox !== false) {
        app.sandboxInstance = this.createSandbox(app)
      }
      
      // 执行脚本
      const instance = await this.executeScripts(scripts, app)
      app.instance = instance
      
      // 应用样式
      this.applyStyles(styles, app)
      
      app.status = 'loaded'
      app.loader?.(false)
      
      this.logger?.info(`Micro app loaded: ${name}`)
      return app
      
    } catch (error) {
      app.status = 'error'
      app.error = error as Error
      app.loader?.(false)
      this.logger?.error(`Failed to load micro app: ${name}`, error)
      throw error
    }
  }

  /**
   * 挂载应用
   */
  async mountApp(name: string, props?: Record<string, unknown>): Promise<void> {
    const app = await this.loadApp(name)
    
    if (app.status === 'mounted') {
      return
    }
    
    // 卸载当前应用（如果是单例模式）
    if (app.singular && this.currentApp && this.currentApp !== app) {
      await this.unmountApp(this.currentApp.name)
    }
    
    try {
      app.status = 'mounting'
      
      // 激活沙箱
      if (app.sandboxInstance) {
        app.sandboxInstance.mount()
      }
      
      // 挂载应用
      await app.instance?.mount({
        ...app.props,
        ...props,
        container: this.getContainer(app.container),
        globalState: this.globalState,
        onGlobalStateChange: this.onGlobalStateChange.bind(this),
        setGlobalState: this.setGlobalState.bind(this),
        emit: this.emit.bind(this),
        on: this.on.bind(this),
        off: this.off.bind(this)
      })
      
      app.status = 'mounted'
      this.currentApp = app
      
      this.logger?.info(`Micro app mounted: ${name}`)
      
    } catch (error) {
      app.status = 'error'
      app.error = error as Error
      this.logger?.error(`Failed to mount micro app: ${name}`, error)
      throw error
    }
  }

  /**
   * 卸载应用
   */
  async unmountApp(name: string): Promise<void> {
    const app = this.apps.get(name)
    if (!app || app.status !== 'mounted') {
      return
    }
    
    try {
      app.status = 'unmounting'
      
      // 卸载应用
      await app.instance?.unmount()
      
      // 停用沙箱
      if (app.sandboxInstance) {
        app.sandboxInstance.unmount()
      }
      
      app.status = 'loaded'
      
      if (this.currentApp === app) {
        this.currentApp = undefined
      }
      
      this.logger?.info(`Micro app unmounted: ${name}`)
      
    } catch (error) {
      app.error = error as Error
      this.logger?.error(`Failed to unmount micro app: ${name}`, error)
      throw error
    }
  }

  /**
   * 更新应用
   */
  async updateApp(name: string, props: Record<string, unknown>): Promise<void> {
    const app = this.apps.get(name)
    if (!app || app.status !== 'mounted') {
      return
    }
    
    if (app.instance?.update) {
      await app.instance.update(props)
    }
  }

  /**
   * 设置全局状态
   */
  setGlobalState(state: Record<string, unknown>): void {
    Object.entries(state).forEach(([key, value]) => {
      const oldValue = this.globalState.get(key)
      this.globalState.set(key, value)
      
      // 触发变化监听
      this.emit(`globalState:${key}`, { oldValue, newValue: value })
    })
    
    this.emit('globalStateChange', state)
  }

  /**
   * 监听全局状态变化
   */
  onGlobalStateChange(
    callback: (state: Map<string, unknown>, prev: Map<string, unknown>) => void
  ): () => void {
    const handler = (_data?: unknown) => {
      callback(this.globalState, new Map(this.globalState))
    }
    
    this.on('globalStateChange', handler)
    
    return () => this.off('globalStateChange', handler)
  }

  /**
   * 配置模块联邦
   */
  configureModuleFederation(config: ModuleFederationConfig): void {
    this.moduleFederations.set(config.name, config)
    this.setupModuleFederation(config)
  }

  /**
   * 加载联邦模块
   */
  async loadFederatedModule<T = any>(
    scope: string,
    module: string
  ): Promise<T> {
    try {
      // @ts-expect-error webpack runtime
      await __webpack_init_sharing__('default')
      
      const container = (window as any)[scope]
      // @ts-expect-error webpack runtime
      await container.init(__webpack_share_scopes__.default)
      
      const factory = await container.get(module)
      const Module = factory()
      
      return Module as T
    } catch (error) {
      this.logger?.error(`Failed to load federated module: ${scope}/${module}`, error)
      throw error
    }
  }

  // ==================== 私有方法 ====================

  private initialize(): void {
    // 初始化全局错误处理
    this.setupErrorHandler()
    
    // 初始化性能监控
    this.setupPerformanceMonitor()
  }

  private generateAppId(name: string): string {
    return `micro-app-${name}-${Date.now()}`
  }

  private setupRouteListener(): void {
    const handleRouteChange = async () => {
      await this.checkCurrentRoute()
    }
    
    // 监听 popstate 事件
    window.addEventListener('popstate', handleRouteChange)
    
    // 劫持 pushState 和 replaceState
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState
    
    window.history.pushState = (...args) => {
      originalPushState.apply(window.history, args)
      handleRouteChange()
    }
    
    window.history.replaceState = (...args) => {
      originalReplaceState.apply(window.history, args)
      handleRouteChange()
    }
  }

  private async checkCurrentRoute(): Promise<void> {
    const location = window.location
    
    for (const app of this.apps.values()) {
      const isActive = this.isAppActive(app, location)
      
      if (isActive && app.status !== 'mounted') {
        await this.mountApp(app.name)
      } else if (!isActive && app.status === 'mounted') {
        await this.unmountApp(app.name)
      }
    }
  }

  private isAppActive(app: LoadedMicroApp, location: Location): boolean {
    const { activeRule } = app
    
    if (typeof activeRule === 'string') {
      return location.pathname.startsWith(activeRule)
    } else if (activeRule instanceof RegExp) {
      return activeRule.test(location.pathname)
    } else if (typeof activeRule === 'function') {
      return activeRule(location)
    }
    
    return false
  }

  private async fetchAppResources(app: LoadedMicroApp): Promise<{
    scripts: string[]
    styles: string[]
    html: string
  }> {
    const entry = app.entry
    
    if (typeof entry === 'string') {
      // 从 HTML 入口加载
      const html = await fetch(entry).then(res => res.text())
      const { scripts, styles } = this.extractResources(html, entry)
      return { scripts, styles, html }
    } else {
      // 直接使用配置的资源
      return {
        scripts: entry.scripts || [],
        styles: entry.styles || [],
        html: entry.html || ''
      }
    }
  }

  private extractResources(html: string, baseUrl: string): {
    scripts: string[]
    styles: string[]
  } {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    const scripts = Array.from(doc.querySelectorAll('script[src]'))
      .map(script => this.resolveUrl(script.getAttribute('src')!, baseUrl))
    
    const styles = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
      .map(link => this.resolveUrl(link.getAttribute('href')!, baseUrl))
    
    return { scripts, styles }
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http') || url.startsWith('//')) {
      return url
    }
    
    const base = new URL(baseUrl)
    return new URL(url, base.origin + base.pathname).href
  }

  private async executeScripts(
    scripts: string[],
    app: LoadedMicroApp
  ): Promise<MicroAppInstance> {
    const sandbox = app.sandboxInstance
    const context = sandbox?.proxy || window
    
    // 执行脚本
    for (const script of scripts) {
      const code = await fetch(script).then(res => res.text())
      
      if (sandbox) {
        // 在沙箱中执行 - 使用动态 script 标签
        const scriptEl = document.createElement('script')
        scriptEl.textContent = `
          (function(window, self, globalThis) {
            ${code}
          }).call(this, window, window, window);
        `
        scriptEl.dataset.microApp = app.name
        document.head.appendChild(scriptEl)
        document.head.removeChild(scriptEl)
      } else {
        // 直接执行 - 使用动态 script 标签
        const scriptEl = document.createElement('script')
        scriptEl.textContent = code
        scriptEl.dataset.microApp = app.name
        document.head.appendChild(scriptEl)
        document.head.removeChild(scriptEl)
      }
    }
    
    // 获取应用导出
    const exports = (context as any)[app.name]
    
    if (!exports) {
      throw new Error(`Micro app ${app.name} did not export lifecycle methods`)
    }
    
    return exports as MicroAppInstance
  }

  private applyStyles(styles: string[], app: LoadedMicroApp): void {
    const container = this.getContainer(app.container)
    
    styles.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.dataset.microApp = app.name
      
      if (app.sandbox && (app.sandbox as SandboxConfig).strictStyleIsolation) {
        // 样式隔离
        container.appendChild(link)
      } else {
        document.head.appendChild(link)
      }
    })
  }

  private createSandbox(_app: LoadedMicroApp): Sandbox {
    const fakeWindow = {} as any
    const proxy = new Proxy(fakeWindow, {
      get(target, prop) {
        if (prop in target) {
          return target[prop]
        }
        return (window as any)[prop]
      },
      set(target, prop, value) {
        target[prop] = value
        return true
      },
      has(target, prop) {
        return prop in target || prop in window
      }
    })
    
    return {
      proxy,
      active: false,
      mount() {
        this.active = true
      },
      unmount() {
        this.active = false
      },
      clear() {
        Object.keys(fakeWindow).forEach(key => {
          delete fakeWindow[key]
        })
      }
    }
  }

  private getContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container)
      if (!element) {
        throw new Error(`Container not found: ${container}`)
      }
      return element as HTMLElement
    }
    return container
  }

  private prefetchApp(app: LoadedMicroApp): void {
    if (this.prefetchQueue.has(app.name)) {
      return
    }
    
    this.prefetchQueue.add(app.name)
    
    // 使用 requestIdleCallback 进行预加载
    const prefetch = () => {
      this.loadApp(app.name).catch(error => {
        this.logger?.warn(`Failed to prefetch app: ${app.name}`, error)
      }).finally(() => {
        this.prefetchQueue.delete(app.name)
      })
    }
    
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prefetch)
    } else {
      setTimeout(prefetch, 1000)
    }
  }

  private setupModuleFederation(config: ModuleFederationConfig): void {
    // 这里应该配置 webpack module federation
    // 简化示例
    this.logger?.info(`Module federation configured: ${config.name}`)
  }

  private setupErrorHandler(): void {
    window.addEventListener('error', event => {
      const app = this.findAppByError(event.error)
      if (app) {
        this.logger?.error(`Error in micro app ${app.name}:`, event.error)
        app.error = event.error
      }
    })
  }

  private setupPerformanceMonitor(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'navigation') {
            this.logger?.debug('Navigation performance:', entry)
          }
        })
      })
      
      observer.observe({ entryTypes: ['navigation'] })
    }
  }

  private findAppByError(error: Error): LoadedMicroApp | undefined {
    // 简化实现：通过错误栈判断来源
    const stack = error.stack || ''
    
    for (const app of this.apps.values()) {
      if (stack.includes(app.name)) {
        return app
      }
    }
    
    return undefined
  }

  // ==================== 事件系统 ====================

  private emit(event: string, data?: unknown): void {
    const handlers = this.eventBus.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  private on(event: string, handler: (data?: unknown) => void): void {
    if (!this.eventBus.has(event)) {
      this.eventBus.set(event, new Set())
    }
    this.eventBus.get(event)!.add(handler as any)
  }

  private off(event: string, handler: (data?: unknown) => void): void {
    this.eventBus.get(event)?.delete(handler as any)
  }

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    // 卸载所有应用
    for (const app of this.apps.values()) {
      if (app.status === 'mounted') {
        await this.unmountApp(app.name)
      }
    }
    
    // 清理资源
    this.apps.clear()
    this.globalState.clear()
    this.eventBus.clear()
    this.prefetchQueue.clear()
    this.moduleFederations.clear()
  }
}

// 导出工厂函数
export function createMicroFrontendManager(engine?: Engine): MicroFrontendManager {
  return new MicroFrontendManager(engine)
}