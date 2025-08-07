/**
 * 插件系统
 *
 * 提供可扩展的插件架构，允许第三方扩展路由器功能
 */

import type { Router, RouteLocationNormalized } from '../types'

/**
 * 路由器插件接口
 */
export interface RouterPlugin {
  name: string
  version?: string
  install: (router: Router, options?: any) => void
  uninstall?: (router: Router) => void
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins = new Map<string, RouterPlugin>()
  private router: Router

  constructor(router: Router) {
    this.router = router
  }

  /**
   * 安装插件
   */
  install(plugin: RouterPlugin, options?: any): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already installed`)
      return
    }

    try {
      plugin.install(this.router, options)
      this.plugins.set(plugin.name, plugin)
      console.log(`Plugin "${plugin.name}" installed successfully`)
    } catch (error) {
      console.error(`Failed to install plugin "${plugin.name}":`, error)
    }
  }

  /**
   * 卸载插件
   */
  uninstall(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      console.warn(`Plugin "${pluginName}" is not installed`)
      return
    }

    try {
      if (plugin.uninstall) {
        plugin.uninstall(this.router)
      }
      this.plugins.delete(pluginName)
      console.log(`Plugin "${pluginName}" uninstalled successfully`)
    } catch (error) {
      console.error(`Failed to uninstall plugin "${pluginName}":`, error)
    }
  }

  /**
   * 获取已安装的插件列表
   */
  getInstalledPlugins(): RouterPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 检查插件是否已安装
   */
  hasPlugin(pluginName: string): boolean {
    return this.plugins.has(pluginName)
  }
}

/**
 * 创建插件管理器
 */
export function createPluginManager(router: Router): PluginManager {
  return new PluginManager(router)
}

/**
 * 内置插件：路由分析插件
 */
export const analyticsPlugin: RouterPlugin = {
  name: 'analytics',
  version: '1.0.0',
  install(
    router: Router,
    options: { trackPageView?: (route: RouteLocationNormalized) => void } = {}
  ) {
    router.afterEach(to => {
      if (options.trackPageView) {
        options.trackPageView(to)
      } else {
        console.log(`Page view: ${to.path}`)
      }
    })
  },
}

/**
 * 内置插件：路由标题插件
 */
export const titlePlugin: RouterPlugin = {
  name: 'title',
  version: '1.0.0',
  install(
    router: Router,
    options: { suffix?: string; separator?: string } = {}
  ) {
    const { suffix = '', separator = ' - ' } = options

    router.afterEach(to => {
      const title = to.meta.title as string
      if (title) {
        document.title = suffix ? `${title}${separator}${suffix}` : title
      }
    })
  },
}

/**
 * 内置插件：进度条插件
 */
export const progressPlugin: RouterPlugin = {
  name: 'progress',
  version: '1.0.0',
  install(
    router: Router,
    options: {
      start?: () => void
      finish?: () => void
      error?: () => void
    } = {}
  ) {
    router.beforeEach((to, from, next) => {
      if (options.start) {
        options.start()
      }
      next()
    })

    router.afterEach(() => {
      if (options.finish) {
        options.finish()
      }
    })

    router.onError(() => {
      if (options.error) {
        options.error()
      }
    })
  },
}
