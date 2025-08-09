// import type { Engine, Plugin } from '@ldesign/engine'
import type { App } from 'vue'
import type { Router, RouteRecordRaw, RouterOptions } from './types'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from './core'
import {
  createEnhancementConfig,
  EnhancedComponentsPlugin,
  type EnhancedComponentsPluginOptions,
} from './plugins/enhanced-components-plugin'

// 临时类型定义，直到engine包可用
interface Engine {
  getApp(): App | undefined
  use(plugin: Plugin): Promise<void>
  mount(selector: string): Promise<any>
  router?: any
  logger?: any
  notifications?: any
}

interface Plugin {
  name: string
  version: string
  install: (engine: Engine) => Promise<void>
}

/**
 * 路由插件配置选项
 */
export interface RouterPluginOptions {
  /** 路由配置 */
  routes: RouteRecordRaw[]
  /** 路由模式 */
  mode?: 'history' | 'hash' | 'memory'
  /** 基础路径 */
  base?: string
  /** 滚动行为 */
  scrollBehavior?: RouterOptions['scrollBehavior']

  /** 增强组件选项 */
  enhancedComponents?: {
    /** 是否启用增强组件 */
    enabled?: boolean
    /** 增强组件配置 */
    options?: EnhancedComponentsPluginOptions
  }

  /** 其他路由选项 */
  [key: string]: any
}

/**
 * 路由插件实现
 * 提供简化的路由集成方式，作为唯一的集成入口
 */
class RouterPlugin implements Plugin {
  public name = 'router'
  public version = '1.0.0'
  private router?: Router
  private options: RouterPluginOptions
  private installed = false

  constructor(options: RouterPluginOptions) {
    this.options = options
  }

  /**
   * 安装插件到 Engine
   */
  async install(engine: Engine): Promise<void> {
    if (this.installed) {
      throw new Error('Router plugin is already installed')
    }

    try {
      // 创建路由器实例
      this.router = this.createRouter()

      // 获取Vue应用实例
      const app = engine.getApp()
      if (!app) {
        throw new Error('Vue应用实例未创建，请先调用 engine.createApp()')
      }

      // 将路由器安装到 Vue 应用
      this.installToApp(app)

      // 安装增强组件
      this.installEnhancedComponents(app)

      // 将路由器注册到 Engine
      engine.router = {
        push: (to: any) => this.router!.push(to),
        replace: (to: any) => this.router!.replace(to),
        back: () => this.router!.back(),
        forward: () => this.router!.forward(),
        go: (delta: number) => this.router!.go(delta),
        getCurrentRoute: () => this.router!.currentRoute,
        getRouter: () => this.router!,
      }

      this.installed = true

      // 记录安装成功
      if (engine.logger) {
        engine.logger.info(`Plugin "${this.name}" registered successfully`)
      }
    } catch (error) {
      if (engine.logger) {
        engine.logger.error(`Failed to install router plugin:`, error)
      }
      throw error
    }
  }

  /**
   * 安装到 Vue 应用
   */
  installToApp(app: App): void {
    if (!this.router) {
      throw new Error('Router not initialized. Call install() first.')
    }

    app.use(this.router)
  }

  /**
   * 创建路由器实例
   */
  private createRouter(): Router {
    const {
      routes,
      mode = 'history',
      base = '/',
      scrollBehavior,
      ...otherOptions
    } = this.options

    // 根据模式创建历史记录
    let history
    switch (mode) {
      case 'hash':
        history = createWebHashHistory(base)
        break
      case 'memory':
        history = createMemoryHistory(base)
        break
      case 'history':
      default:
        history = createWebHistory(base)
        break
    }

    const routerOptions: any = {
      history,
      routes,
      ...otherOptions,
    }

    // 只有在明确提供时才设置 scrollBehavior
    if (scrollBehavior !== undefined) {
      routerOptions.scrollBehavior = scrollBehavior
    }

    return createRouter(routerOptions)
  }

  /**
   * 安装增强组件
   */
  private installEnhancedComponents(app: App): void {
    const enhancedConfig = this.options.enhancedComponents

    // 默认启用增强组件
    if (enhancedConfig?.enabled !== false) {
      const enhancementConfig = createEnhancementConfig(
        enhancedConfig?.options?.enhancementConfig
      )

      const enhancedPlugin = new EnhancedComponentsPlugin({
        replaceRouterLink: true,
        replaceRouterView: true,
        keepOriginal: false,
        ...enhancedConfig?.options,
        enhancementConfig,
      })

      enhancedPlugin.install(app)
    }
  }

  /**
   * 获取路由器实例
   */
  getRouter(): Router | undefined {
    return this.router
  }

  /**
   * 卸载插件
   */
  uninstall(): void {
    this.router = undefined as any
    this.installed = false
  }
}

/**
 * 创建路由插件
 * 这是推荐的路由集成方式
 *
 * @param options 路由配置选项
 * @returns 路由插件实例
 *
 * @example
 * ```typescript
 * import { createApp } from '@ldesign/engine'
 * import { routerPlugin } from '@ldesign/router'
 *
 * const engine = createApp(App)
 *
 * await engine.use(routerPlugin({
 *   routes: [
 *     { path: '/', component: Home },
 *     { path: '/about', component: About }
 *   ],
 *   mode: 'history'
 * }))
 *
 * engine.mount('#app')
 * ```
 */
export function routerPlugin(options: RouterPluginOptions): RouterPlugin {
  return new RouterPlugin(options)
}

// 导出类型和类
export { RouterPlugin }
