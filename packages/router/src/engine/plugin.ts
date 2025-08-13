/**
 * @ldesign/router Engine 插件
 *
 * 将路由器集成到 LDesign Engine 中的插件实现
 */

import type { RouteRecordRaw, ScrollBehavior } from '../types'
import { createRouter } from '../core/router'
import {
  createWebHistory,
  createWebHashHistory,
  createMemoryHistory,
} from '../core/history'
import {
  ROUTER_INJECTION_SYMBOL,
  ROUTE_INJECTION_SYMBOL,
} from '../core/constants'
import { RouterView, RouterLink } from '../components'

// 临时使用 any 类型，避免循环依赖
interface Plugin {
  name: string
  version: string
  dependencies?: string[]
  install: (engine: any) => Promise<void>
  uninstall?: (engine: any) => Promise<void>
  [key: string]: any
}

/**
 * 路由器 Engine 插件选项
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
  scrollBehavior?: ScrollBehavior
  /** 活跃链接类名 */
  linkActiveClass?: string
  /** 精确活跃链接类名 */
  linkExactActiveClass?: string
}

/**
 * 创建路由器 Engine 插件
 *
 * 将路由器集成到 LDesign Engine 中，提供统一的路由管理体验
 *
 * @param options 路由器配置选项
 * @returns Engine 插件实例
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
 *   mode: 'hash',
 *   base: '/'
 * })
 *
 * await engine.use(routerPlugin)
 * ```
 */
export function createRouterEnginePlugin(
  options: RouterEnginePluginOptions
): Plugin {
  const {
    name = 'router',
    version = '1.0.0',
    routes,
    mode = 'history',
    base = '/',
    scrollBehavior,
    linkActiveClass,
    linkExactActiveClass,
  } = options

  return {
    name,
    version,
    dependencies: [], // 路由器插件通常不依赖其他插件

    async install(engine) {
      try {
        // 获取 Vue 应用实例
        const vueApp = engine.getApp()
        if (!vueApp) {
          throw new Error(
            'Vue app not found. Make sure the engine has created a Vue app before installing router plugin.'
          )
        }

        // 记录插件安装开始
        engine.logger.info(`Installing ${name} plugin...`, {
          version,
          mode,
          base,
          routesCount: routes.length,
        })

        // 创建历史管理器
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

        // 创建路由器实例
        const router = createRouter({
          history,
          routes,
          scrollBehavior,
          linkActiveClass,
          linkExactActiveClass,
        })

        // 手动安装路由器到 Vue 应用（避免调用 router.install）
        // 提供路由器注入
        vueApp.provide(ROUTER_INJECTION_SYMBOL, router)
        vueApp.provide(ROUTE_INJECTION_SYMBOL, router.currentRoute)

        // 注册路由器组件
        vueApp.component('RouterView', RouterView)
        vueApp.component('RouterLink', RouterLink)

        // 设置全局属性
        if (vueApp.config && vueApp.config.globalProperties) {
          vueApp.config.globalProperties.$router = router
          vueApp.config.globalProperties.$route = router.currentRoute
        }

        // 将路由器注册到 engine 上，使其可以通过 engine.router 访问
        // 直接设置属性，避免调用 setRouter 方法（它会调用 router.install）
        engine.router = router

        // 注册路由状态到 engine 状态管理
        if (engine.state) {
          // 同步当前路由信息
          engine.state.set('router:currentRoute', router.currentRoute)
          engine.state.set('router:mode', mode)
          engine.state.set('router:base', base)

          // 监听路由变化，更新状态
          router.afterEach((to, from) => {
            engine.state.set('router:currentRoute', to)

            // 触发路由变化事件
            if (engine.events) {
              engine.events.emit('router:navigated', { to, from })
            }
          })
        }

        // 监听路由错误
        router.onError(error => {
          engine.logger.error('Router navigation error:', error)
          if (engine.events) {
            engine.events.emit('router:error', error)
          }
        })

        // 等待路由器准备就绪（在测试环境中跳过）
        if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
          engine.logger.info('Waiting for router to be ready...')
          await router.isReady()
          engine.logger.info('Router is ready!')
        }

        // 记录插件安装完成
        engine.logger.info(`${name} plugin installed successfully`, {
          currentRoute: router.currentRoute.value?.path || '/',
        })

        // 触发插件安装完成事件
        if (engine.events) {
          engine.events.emit(`plugin:${name}:installed`, {
            router,
            mode,
            base,
            routesCount: routes.length,
          })
        }
      } catch (error) {
        engine.logger.error(`Failed to install ${name} plugin:`, error)
        throw error
      }
    },

    async uninstall(engine) {
      try {
        engine.logger.info(`Uninstalling ${name} plugin...`)

        // 清理路由器引用
        if (engine.router) {
          engine.router = null
        }

        // 清理状态
        if (engine.state) {
          engine.state.delete('router:currentRoute')
          engine.state.delete('router:mode')
          engine.state.delete('router:base')
        }

        // 触发插件卸载事件
        if (engine.events) {
          engine.events.emit(`plugin:${name}:uninstalled`)
        }

        engine.logger.info(`${name} plugin uninstalled successfully`)
      } catch (error) {
        engine.logger.error(`Failed to uninstall ${name} plugin:`, error)
        throw error
      }
    },
  }
}

/**
 * 路由器插件工厂函数（向后兼容）
 *
 * @param options 路由器配置选项
 * @returns 路由器 Engine 插件实例
 *
 * @example
 * ```typescript
 * import { routerPlugin } from '@ldesign/router'
 *
 * await engine.use(routerPlugin({
 *   routes: [
 *     { path: '/', component: Home },
 *     { path: '/about', component: About }
 *   ],
 *   mode: 'hash'
 * }))
 * ```
 */
export function routerPlugin(options: RouterEnginePluginOptions): Plugin {
  return createRouterEnginePlugin(options)
}

/**
 * 默认路由器 Engine 插件实例
 *
 * 使用默认配置创建的路由器插件，需要提供路由配置
 *
 * @example
 * ```typescript
 * import { createDefaultRouterEnginePlugin } from '@ldesign/router'
 *
 * const defaultRouterPlugin = createDefaultRouterEnginePlugin([
 *   { path: '/', component: Home }
 * ])
 *
 * await engine.use(defaultRouterPlugin)
 * ```
 */
export function createDefaultRouterEnginePlugin(
  routes: RouteRecordRaw[]
): Plugin {
  return createRouterEnginePlugin({
    routes,
    mode: 'history',
    base: '/',
  })
}
