import type { Engine, Plugin } from '@ldesign/engine'
import type { Router, RouteRecordRaw, RouterOptions } from '../types'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from '../core'
import {
  createEnhancementConfig,
  EnhancedComponentsPlugin,
  type EnhancedComponentsPluginOptions,
} from '../plugins/components'

/**
 * 路由 Engine 插件配置选项
 */
export interface RouterEnginePluginOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
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
 * 路由 Engine 插件实现
 * 提供简化的路由集成方式，作为标准的 Engine 插件
 */
class RouterEnginePlugin implements Plugin {
  [key: string]: any
  public name: string
  public version: string
  public dependencies: string[] = []
  private router?: Router
  private options: RouterEnginePluginOptions
  private installed = false

  constructor(options: RouterEnginePluginOptions) {
    this.name = options.name || 'router'
    this.version = options.version || '1.0.0'
    this.options = options
  }

  async install(engine: Engine): Promise<void> {
    if (this.installed) {
      engine.logger.warn('Router plugin is already installed')
      return
    }

    try {
      // 记录插件安装开始
      engine.logger.info(`Installing ${this.name} plugin...`, {
        version: this.version,
        options: {
          mode: this.options.mode,
          base: this.options.base,
          routesCount: this.options.routes.length,
        },
      })

      // 创建路由实例
      this.router = this.createRouter()

      // 获取 Vue 应用实例
      const app = engine.getApp()
      if (!app) {
        throw new Error(
          'Vue app not found. Make sure the engine has created a Vue app before installing router plugin.'
        )
      }

      // 安装路由到 Vue 应用
      app.use(this.router)

      // 安装增强组件插件
      if (this.options.enhancedComponents?.enabled !== false) {
        const enhancementConfig = createEnhancementConfig(
          (this.options.enhancedComponents?.options as any) || {}
        )
        app.use(new EnhancedComponentsPlugin(), enhancementConfig)
      }

      // 将路由实例注册到引擎
      ;(engine as any).router = this.router

      // 注册全局状态
      engine.state.set('router:currentRoute', this.router.currentRoute.value)
      engine.state.set('router:isReady', false)

      // 监听路由变化，更新全局状态
      this.router.afterEach((to, from) => {
        engine.state.set('router:currentRoute', to)
        engine.events.emit('router:routeChanged', {
          to,
          from,
          timestamp: Date.now(),
        })
      })

      // 等待路由准备就绪
      // 暂时注释掉，可能导致卡住
      // await this.router.isReady()
      engine.state.set('router:isReady', true)

      this.installed = true

      // 记录插件安装成功
      engine.logger.info(`${this.name} plugin installed successfully`, {
        currentRoute: this.router.currentRoute.value.path,
        routesCount: this.router.getRoutes().length,
      })

      // 触发插件安装完成事件
      engine.events.emit('plugin:router:installed', {
        router: this.router,
        options: this.options,
      })
    } catch (error) {
      // 记录安装失败
      engine.logger.error(`Failed to install ${this.name} plugin`, error)

      // 触发插件安装失败事件
      engine.events.emit('plugin:router:installFailed', {
        error,
        options: this.options,
      })

      throw error
    }
  }

  async uninstall(engine: Engine): Promise<void> {
    if (!this.installed) {
      engine.logger.warn('Router plugin is not installed')
      return
    }

    try {
      engine.logger.info(`Uninstalling ${this.name} plugin...`)

      // 清理全局状态
      ;(engine.state as any).delete('router:currentRoute')
      ;(engine.state as any).delete('router:isReady')

      // 清理引擎上的路由实例
      delete engine.router

      this.installed = false
      this.router = undefined

      // 触发插件卸载完成事件
      engine.events.emit('plugin:router:uninstalled', {
        timestamp: Date.now(),
      })

      engine.logger.info(`${this.name} plugin uninstalled successfully`)
    } catch (error) {
      engine.logger.error(`Failed to uninstall ${this.name} plugin`, error)
      throw error
    }
  }

  /**
   * 获取路由实例
   */
  getRouter(): Router | undefined {
    return this.router
  }

  /**
   * 创建路由实例
   */
  private createRouter(): Router {
    const {
      routes,
      mode = 'hash',
      base = '/',
      scrollBehavior,
      ...otherOptions
    } = this.options

    // 创建历史记录实例
    let history
    switch (mode) {
      case 'history':
        history = createWebHistory(base)
        break
      case 'memory':
        history = createMemoryHistory(base)
        break
      case 'hash':
      default:
        history = createWebHashHistory(base)
        break
    }

    // 创建路由器实例
    const routerOptions: any = {
      history,
      routes,
      ...otherOptions,
    }

    if (scrollBehavior) {
      routerOptions.scrollBehavior = scrollBehavior
    }

    return createRouter(routerOptions)
  }
}

/**
 * 创建路由 Engine 插件
 *
 * @param options 路由配置选项
 * @returns 路由 Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createRouterEnginePlugin } from '@ldesign/router'
 *
 * const routerPlugin = createRouterEnginePlugin({
 *   routes: [
 *     { path: '/', component: Home },
 *     { path: '/about', component: About }
 *   ],
 *   mode: 'history'
 * })
 *
 * await engine.use(routerPlugin)
 * ```
 */
export function createRouterEnginePlugin(
  options: RouterEnginePluginOptions
): RouterEnginePlugin {
  return new RouterEnginePlugin(options)
}

/**
 * 路由插件工厂函数（向后兼容）
 *
 * @param options 路由配置选项
 * @returns 路由 Engine 插件实例
 *
 * @example
 * ```typescript
 * import { routerPlugin } from '@ldesign/router'
 *
 * await engine.use(routerPlugin({
 *   routes: [...],
 *   mode: 'history'
 * }))
 * ```
 */
export function routerPlugin(
  options: RouterEnginePluginOptions
): RouterEnginePlugin {
  return createRouterEnginePlugin(options)
}

/**
 * 默认路由 Engine 插件实例
 *
 * 使用默认配置创建的路由插件，需要提供路由配置
 *
 * @example
 * ```typescript
 * import { createDefaultRouterEnginePlugin } from '@ldesign/router'
 *
 * const defaultRouter = createDefaultRouterEnginePlugin([
 *   { path: '/', component: Home }
 * ])
 *
 * await engine.use(defaultRouter)
 * ```
 */
export function createDefaultRouterEnginePlugin(
  routes: RouteRecordRaw[]
): RouterEnginePlugin {
  return createRouterEnginePlugin({
    routes,
    mode: 'hash',
    base: '/',
    enhancedComponents: {
      enabled: true,
    },
  })
}

// 导出类型和类
export { RouterEnginePlugin }
