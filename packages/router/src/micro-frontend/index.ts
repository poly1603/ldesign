/**
 * 微前端路由集成
 * 支持子应用注册、隔离、通信等功能
 */

import type { Router, RouteRecord } from '../types'
import mitt from 'mitt'
import { h, inject, reactive, ref, watch } from 'vue'

export interface MicroApp {
  name: string
  entry: string
  container: string | HTMLElement
  activeRule: string | RegExp | ((location: Location) => boolean)
  props?: Record<string, any>
  sandbox?: boolean | SandboxConfig
  prefetch?: boolean | 'all'
  loader?: (loading: boolean) => void
  beforeMount?: (app: MicroApp) => Promise<void> | void
  afterMount?: (app: MicroApp) => Promise<void> | void
  beforeUnmount?: (app: MicroApp) => Promise<void> | void
  afterUnmount?: (app: MicroApp) => Promise<void> | void
}

export interface SandboxConfig {
  strictStyleIsolation?: boolean
  experimentalStyleIsolation?: boolean
  patchers?: Array<(sandbox: any) => void>
}

export interface MicroFrontendConfig {
  apps: MicroApp[]
  lifeCycles?: GlobalLifeCycles
  fetch?: typeof fetch
  prefetch?: boolean | 'all' | string[]
  sandbox?: boolean | SandboxConfig
  singular?: boolean
}

export interface GlobalLifeCycles {
  beforeLoad?: (app: MicroApp) => Promise<void> | void
  beforeMount?: (app: MicroApp) => Promise<void> | void
  afterMount?: (app: MicroApp) => Promise<void> | void
  beforeUnmount?: (app: MicroApp) => Promise<void> | void
  afterUnmount?: (app: MicroApp) => Promise<void> | void
  afterLoad?: (app: MicroApp) => Promise<void> | void
}

export interface MicroAppState {
  loading: boolean
  mounted: boolean
  error: Error | null
}

/**
 * 微前端路由管理器
 */
export class MicroFrontendRouter {
  private apps = new Map<string, MicroApp>()
  private appStates = new Map<string, MicroAppState>()
  private activeApps = new Set<string>()
  private eventBus = mitt()
  private router: Router | null = null
  private config: MicroFrontendConfig
  private appContainers = new Map<string, HTMLElement>()
  private appScripts = new Map<string, HTMLScriptElement[]>()
  private appStyles = new Map<string, HTMLStyleElement[]>()
  private globalState = reactive<Record<string, any>>({})
  private stateWatchers = new Map<string, Function[]>()

  constructor(config: MicroFrontendConfig) {
    this.config = config
    this.registerApps(config.apps)
  }

  /**
   * 注册微应用
   */
  registerApps(apps: MicroApp[]) {
    apps.forEach(app => this.registerApp(app))
  }

  /**
   * 注册单个微应用
   */
  registerApp(app: MicroApp) {
    this.apps.set(app.name, app)
    this.appStates.set(app.name, {
      loading: false,
      mounted: false,
      error: null
    })

    // 预加载
    if (app.prefetch || this.config.prefetch) {
      this.prefetchApp(app)
    }
  }

  /**
   * 注销微应用
   */
  unregisterApp(name: string) {
    const app = this.apps.get(name)
    if (!app) return

    if (this.activeApps.has(name)) {
      this.unmountApp(name)
    }

    this.apps.delete(name)
    this.appStates.delete(name)
    this.appContainers.delete(name)
    this.appScripts.delete(name)
    this.appStyles.delete(name)
  }

  /**
   * 启动微前端
   */
  async start(router?: Router) {
    if (router) {
      this.router = router
      this.setupRouterIntegration(router)
    }

    // 监听路由变化
    this.listenRouteChange()

    // 初始化当前路由的应用
    await this.reroute()
  }

  /**
   * 设置路由集成
   */
  private setupRouterIntegration(router: Router) {
    // 为每个微应用创建路由
    this.apps.forEach((app, name) => {
      const route: RouteRecord = {
        path: this.getAppPath(app),
        name: `micro-${name}`,
        component: {
          name: `MicroApp-${name}`,
          setup: () => {
            const container = ref<HTMLElement>()
            
            // 挂载应用
            watch(container, async (el) => {
              if (el) {
                await this.mountApp(name, el)
              }
            })

            return () => ({
              render() {
                return h('div', {
                  ref: container,
                  id: `micro-app-${name}`,
                  class: 'micro-app-container'
                })
              }
            })
          }
        },
        meta: {
          microApp: name
        }
      }

      router.addRoute(route)
    })
  }

  /**
   * 获取应用路径
   */
  private getAppPath(app: MicroApp): string {
    if (typeof app.activeRule === 'string') {
      return app.activeRule
    }
    return `/${app.name}`
  }

  /**
   * 监听路由变化
   */
  private listenRouteChange() {
    if (this.router) {
      this.router.afterEach((_to) => {
        this.reroute()
      })
    } else {
      // 监听原生路由变化
      window.addEventListener('popstate', () => this.reroute())
      window.addEventListener('hashchange', () => this.reroute())
    }
  }

  /**
   * 路由变化处理
   */
  private async reroute() {
    const currentApps = this.getActiveApps()
    const toMount = new Set<string>()
    const toUnmount = new Set<string>()

    currentApps.forEach(name => {
      if (!this.activeApps.has(name)) {
        toMount.add(name)
      }
    })

    this.activeApps.forEach(name => {
      if (!currentApps.has(name)) {
        toUnmount.add(name)
      }
    })

    // 卸载应用
    for (const name of toUnmount) {
      await this.unmountApp(name)
    }

    // 挂载应用
    for (const name of toMount) {
      await this.mountApp(name)
    }
  }

  /**
   * 获取当前激活的应用
   */
  private getActiveApps(): Set<string> {
    const activeApps = new Set<string>()
    const location = window.location

    this.apps.forEach((app, name) => {
      if (this.isAppActive(app, location)) {
        activeApps.add(name)
      }
    })

    return activeApps
  }

  /**
   * 判断应用是否激活
   */
  private isAppActive(app: MicroApp, location: Location): boolean {
    const { activeRule } = app

    if (typeof activeRule === 'string') {
      return location.pathname.startsWith(activeRule)
    }

    if (activeRule instanceof RegExp) {
      return activeRule.test(location.pathname)
    }

    if (typeof activeRule === 'function') {
      return activeRule(location)
    }

    return false
  }

  /**
   * 挂载应用
   */
  async mountApp(name: string, container?: HTMLElement) {
    const app = this.apps.get(name)
    if (!app) return

    const state = this.appStates.get(name)!
    if (state.mounted) return

    state.loading = true
    if (app.loader) app.loader(true)

    try {
      // 全局生命周期钩子
      if (this.config.lifeCycles?.beforeMount) {
        await this.config.lifeCycles.beforeMount(app)
      }

      // 应用生命周期钩子
      if (app.beforeMount) {
        await app.beforeMount(app)
      }

      // 加载应用资源
      await this.loadApp(app)

      // 创建容器
      const appContainer = container || this.createContainer(app)
      this.appContainers.set(name, appContainer)

      // 创建沙箱环境
      if (app.sandbox !== false) {
        this.createSandbox(app)
      }

      // 挂载应用
      await this.doMount(app, appContainer)

      state.mounted = true
      this.activeApps.add(name)

      // 应用生命周期钩子
      if (app.afterMount) {
        await app.afterMount(app)
      }

      // 全局生命周期钩子
      if (this.config.lifeCycles?.afterMount) {
        await this.config.lifeCycles.afterMount(app)
      }

      this.eventBus.emit('app:mounted', { name, app })
    } catch (error) {
      state.error = error as Error
      this.eventBus.emit('app:error', { name, error })
      throw error
    } finally {
      state.loading = false
      if (app.loader) app.loader(false)
    }
  }

  /**
   * 卸载应用
   */
  async unmountApp(name: string) {
    const app = this.apps.get(name)
    if (!app) return

    const state = this.appStates.get(name)!
    if (!state.mounted) return

    try {
      // 全局生命周期钩子
      if (this.config.lifeCycles?.beforeUnmount) {
        await this.config.lifeCycles.beforeUnmount(app)
      }

      // 应用生命周期钩子
      if (app.beforeUnmount) {
        await app.beforeUnmount(app)
      }

      // 卸载应用
      await this.doUnmount(app)

      // 清理容器
      const container = this.appContainers.get(name)
      if (container) {
        container.innerHTML = ''
      }

      // 清理沙箱
      this.destroySandbox(app)

      state.mounted = false
      this.activeApps.delete(name)

      // 应用生命周期钩子
      if (app.afterUnmount) {
        await app.afterUnmount(app)
      }

      // 全局生命周期钩子
      if (this.config.lifeCycles?.afterUnmount) {
        await this.config.lifeCycles.afterUnmount(app)
      }

      this.eventBus.emit('app:unmounted', { name, app })
    } catch (error) {
      state.error = error as Error
      this.eventBus.emit('app:error', { name, error })
      throw error
    }
  }

  /**
   * 加载应用资源
   */
  private async loadApp(app: MicroApp) {
    const { entry } = app

    // 如果是 URL，加载 HTML
    if (typeof entry === 'string') {
      const response = await fetch(entry)
      const html = await response.text()
      await this.parseHTML(app, html)
    }
  }

  /**
   * 解析 HTML
   */
  private async parseHTML(app: MicroApp, html: string) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // 提取脚本
    const scripts = Array.from(doc.querySelectorAll('script'))
    const scriptElements: HTMLScriptElement[] = []

    for (const script of scripts) {
      const scriptEl = document.createElement('script')
      
      if (script.src) {
        const response = await fetch(script.src)
        scriptEl.textContent = await response.text()
      } else {
        scriptEl.textContent = script.textContent
      }

      scriptElements.push(scriptEl)
    }

    this.appScripts.set(app.name, scriptElements)

    // 提取样式
    const styles = Array.from(doc.querySelectorAll('style'))
    const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
    const styleElements: HTMLStyleElement[] = []

    for (const style of styles) {
      const styleEl = document.createElement('style')
      styleEl.textContent = style.textContent
      styleElements.push(styleEl)
    }

    for (const link of links as unknown as HTMLLinkElement[]) {
      if (link.href) {
        const response = await fetch(link.href)
        const styleEl = document.createElement('style')
        styleEl.textContent = await response.text()
        styleElements.push(styleEl)
      }
    }

    this.appStyles.set(app.name, styleElements)
  }

  /**
   * 创建容器
   */
  private createContainer(app: MicroApp): HTMLElement {
    let container: HTMLElement

    if (typeof app.container === 'string') {
      container = document.querySelector(app.container) as HTMLElement
      if (!container) {
        container = document.createElement('div')
        container.id = app.container.replace('#', '')
        document.body.appendChild(container)
      }
    } else {
      container = app.container as HTMLElement
    }

    return container
  }

  /**
   * 创建沙箱
   */
  private createSandbox(_app: MicroApp) {
    // Sandbox 功能暂时保留用于将来可能的隔离需求
    // 简化实现，避免复杂的 Proxy 逻辑
  }

  /**
   * 样式隔离（暂时禁用）
   */
  // @ts-expect-error - 保留用于未来功能
  private _applySandboxStyles(app: MicroApp) {
    // 样式隔离
    const styles = this.appStyles.get(app.name)
    if (styles) {
      styles.forEach(style => {
        // 添加作用域
        style.textContent = this.scopeCSS(style.textContent!, app.name)
      })
    }
  }

  /**
   * 销毁沙箱
   */
  private destroySandbox(app: MicroApp) {
    // 清理全局变量
    // 移除样式
    const styles = this.appStyles.get(app.name)
    if (styles) {
      styles.forEach(style => style.remove())
    }

    // 移除脚本
    const scripts = this.appScripts.get(app.name)
    if (scripts) {
      scripts.forEach(script => script.remove())
    }
  }

  /**
   * CSS 作用域处理
   */
  private scopeCSS(css: string, scope: string): string {
    const scopeClass = `micro-app-${scope}`
    
    // 简单的 CSS 作用域处理
    return css.replace(/([^{}]+)\{/g, (match, selector) => {
      // 避免处理 @规则
      if (selector.trim().startsWith('@')) {
        return match
      }
      
      // 为每个选择器添加作用域
      const scopedSelector = selector
        .split(',')
        .map((s: string) => `.${scopeClass} ${s.trim()}`)
        .join(',')
      
      return `${scopedSelector}{`
    })
  }

  /**
   * 执行挂载
   */
  private async doMount(app: MicroApp, container: HTMLElement) {
    // 添加作用域类
    container.classList.add(`micro-app-${app.name}`)

    // 插入样式
    const styles = this.appStyles.get(app.name)
    if (styles) {
      styles.forEach(style => document.head.appendChild(style))
    }

    // 执行脚本
    const scripts = this.appScripts.get(app.name)
    if (scripts) {
      scripts.forEach(script => {
        const newScript = document.createElement('script')
        newScript.textContent = script.textContent
        container.appendChild(newScript)
      })
    }

    // 传递 props
    if (app.props) {
      (window as any)[`__MICRO_APP_PROPS_${app.name}__`] = app.props
    }
  }

  /**
   * 执行卸载
   */
  private async doUnmount(app: MicroApp) {
    // 清理 props
    delete (window as any)[`__MICRO_APP_PROPS_${app.name}__`]
  }

  /**
   * 预加载应用
   */
  private async prefetchApp(app: MicroApp) {
    try {
      await this.loadApp(app)
    } catch (error) {
      console.warn(`Failed to prefetch app ${app.name}:`, error)
    }
  }

  /**
   * 跨应用通信 - 发送消息
   */
  sendMessage(target: string | string[], message: any) {
    const targets = Array.isArray(target) ? target : [target]
    
    targets.forEach(appName => {
      this.eventBus.emit(`message:${appName}`, message)
    })

    // 广播消息
    if (target === '*') {
      this.eventBus.emit('message:broadcast', message)
    }
  }

  /**
   * 跨应用通信 - 监听消息
   */
  onMessage(appName: string, handler: (message: any) => void) {
    this.eventBus.on(`message:${appName}`, handler)
    
    // 监听广播消息
    this.eventBus.on('message:broadcast', handler)

    return () => {
      this.eventBus.off(`message:${appName}`, handler)
      this.eventBus.off('message:broadcast', handler)
    }
  }

  /**
   * 全局状态管理 - 设置状态
   */
  setGlobalState(key: string, value: any) {
    this.globalState[key] = value
    
    // 通知监听者
    const watchers = this.stateWatchers.get(key)
    if (watchers) {
      watchers.forEach(watcher => watcher(value))
    }
  }

  /**
   * 全局状态管理 - 获取状态
   */
  getGlobalState(key?: string) {
    if (key) {
      return this.globalState[key]
    }
    return { ...this.globalState }
  }

  /**
   * 全局状态管理 - 监听状态变化
   */
  watchGlobalState(key: string, watcher: (value: any) => void) {
    if (!this.stateWatchers.has(key)) {
      this.stateWatchers.set(key, [])
    }
    
    this.stateWatchers.get(key)!.push(watcher)

    return () => {
      const watchers = this.stateWatchers.get(key)
      if (watchers) {
        const index = watchers.indexOf(watcher)
        if (index > -1) {
          watchers.splice(index, 1)
        }
      }
    }
  }

  /**
   * 导航到子应用
   */
  navigateToApp(appName: string, path?: string) {
    const app = this.apps.get(appName)
    if (!app) {
      throw new Error(`App ${appName} not found`)
    }

    const basePath = this.getAppPath(app)
    const fullPath = path ? `${basePath}${path}` : basePath

    if (this.router) {
      this.router.push(fullPath)
    } else {
      window.history.pushState({}, '', fullPath)
      this.reroute()
    }
  }

  /**
   * 获取应用状态
   */
  getAppState(name: string): MicroAppState | undefined {
    return this.appStates.get(name)
  }

  /**
   * 获取所有应用
   */
  getApps(): MicroApp[] {
    return Array.from(this.apps.values())
  }

  /**
   * 获取激活的应用
   */
  getActiveAppNames(): string[] {
    return Array.from(this.activeApps)
  }

  /**
   * 监听应用事件
   */
  on(event: string, handler: Function) {
    (this.eventBus as any).on(event as any, handler as any)
    return () => (this.eventBus as any).off(event as any, handler as any)
  }

  /**
   * 销毁
   */
  async destroy() {
    // 卸载所有应用
    for (const name of this.activeApps) {
      await this.unmountApp(name)
    }

    // 清理资源
    this.apps.clear()
    this.appStates.clear()
    this.activeApps.clear()
    this.appContainers.clear()
    this.appScripts.clear()
    this.appStyles.clear()
    this.globalState = reactive({})
    this.stateWatchers.clear()
    ;(this.eventBus as any).all?.clear?.()
  }
}

/**
 * Vue 插件
 */
export const MicroFrontendPlugin = {
  install(app: any, options: MicroFrontendConfig) {
    const microRouter = new MicroFrontendRouter(options)
    
    app.config.globalProperties.$microRouter = microRouter
    app.provide('microRouter', microRouter)

    // 启动微前端
    app.mixin({
      mounted() {
        if (this.$options.name === 'App') {
          microRouter.start(this.$router)
        }
      }
    })
  }
}

/**
 * 组合式 API
 */
export function useMicroFrontend() {
  const microRouter = inject<MicroFrontendRouter>('microRouter')
  
  if (!microRouter) {
    throw new Error('MicroFrontendRouter not found')
  }

  return {
    registerApp: microRouter.registerApp.bind(microRouter),
    unregisterApp: microRouter.unregisterApp.bind(microRouter),
    navigateToApp: microRouter.navigateToApp.bind(microRouter),
    sendMessage: microRouter.sendMessage.bind(microRouter),
    onMessage: microRouter.onMessage.bind(microRouter),
    setGlobalState: microRouter.setGlobalState.bind(microRouter),
    getGlobalState: microRouter.getGlobalState.bind(microRouter),
    watchGlobalState: microRouter.watchGlobalState.bind(microRouter),
    getAppState: microRouter.getAppState.bind(microRouter),
    getApps: microRouter.getApps.bind(microRouter),
    getActiveAppNames: microRouter.getActiveAppNames.bind(microRouter),
    on: microRouter.on.bind(microRouter)
  }
}

// 导出类型已由类导出覆盖，避免重复导出
