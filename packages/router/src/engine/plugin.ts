/**
 * @ldesign/router Engine 插件
 *
 * 将路由器集成到 LDesign Engine 中的插件实现
 */

import type { RouteRecordRaw, ScrollBehavior } from '../types'
import { RouterLink, RouterView } from '../components'
import {
  ROUTE_INJECTION_SYMBOL,
  ROUTER_INJECTION_SYMBOL,
} from '../core/constants'
import {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from '../core/history'
import { createRouter } from '../core/router'

// 导入 process 以避免 ESLint 错误
// eslint-disable-next-line node/prefer-global/process
const nodeProcess = typeof process !== 'undefined' ? process : undefined

// 临时使用 any 类型，避免循环依赖
interface Plugin {
  name: string
  version: string
  dependencies?: string[]
  install: (context: any) => Promise<void>
  uninstall?: (context: any) => Promise<void>
  [key: string]: any
}

/**
 * 路由器预设配置
 */
export type RouterPreset =
  | 'spa'
  | 'mpa'
  | 'mobile'
  | 'desktop'
  | 'admin'
  | 'blog'

/**
 * 路由器 Engine 插件选项（增强版）
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

  // ==================== 增强配置 ====================
  /** 预设配置 */
  preset?: RouterPreset
  /** 是否启用预加载 */
  preload?:
  | boolean
  | {
    strategy?: 'hover' | 'visible' | 'idle'
    delay?: number
    enabled?: boolean
  }
  /** 是否启用缓存 */
  cache?:
  | boolean
  | {
    maxSize?: number
    strategy?: 'memory' | 'session' | 'local'
    enabled?: boolean
  }
  /** 动画配置 */
  animation?:
  | boolean
  | {
    type?: 'fade' | 'slide' | 'scale' | 'flip'
    duration?: number
    enabled?: boolean
  }
  /** 性能配置 */
  performance?: {
    enableLazyLoading?: boolean
    enableCodeSplitting?: boolean
    enablePrefetch?: boolean
    cacheSize?: number
  }
  /** 开发配置 */
  development?: {
    enableDevtools?: boolean
    enableHotReload?: boolean
    enableDebugMode?: boolean
  }
  /** 安全配置 */
  security?: {
    enableCSRFProtection?: boolean
    enableXSSProtection?: boolean
    trustedDomains?: string[]
  }
}

// ==================== 预设配置 ====================

/**
 * 获取预设配置
 */
function getPresetConfig(
  preset: RouterPreset,
): Partial<RouterEnginePluginOptions> {
  const presets: Record<RouterPreset, Partial<RouterEnginePluginOptions>> = {
    spa: {
      mode: 'history',
      preload: { strategy: 'hover', delay: 200, enabled: true },
      cache: { maxSize: 20, strategy: 'memory', enabled: true },
      animation: { type: 'fade', duration: 300, enabled: true },
      performance: {
        enableLazyLoading: true,
        enableCodeSplitting: true,
        enablePrefetch: true,
        cacheSize: 50,
      },
    },
    mpa: {
      mode: 'history',
      preload: false,
      cache: false,
      animation: false,
      performance: {
        enableLazyLoading: false,
        enableCodeSplitting: false,
        enablePrefetch: false,
      },
    },
    mobile: {
      mode: 'hash',
      preload: { strategy: 'visible', enabled: true },
      cache: { maxSize: 10, strategy: 'memory', enabled: true },
      animation: { type: 'slide', duration: 250, enabled: true },
      performance: {
        enableLazyLoading: true,
        enableCodeSplitting: true,
        cacheSize: 20,
      },
    },
    desktop: {
      mode: 'history',
      preload: { strategy: 'hover', delay: 100, enabled: true },
      cache: { maxSize: 50, strategy: 'memory', enabled: true },
      animation: { type: 'fade', duration: 200, enabled: true },
      performance: {
        enableLazyLoading: true,
        enableCodeSplitting: true,
        enablePrefetch: true,
        cacheSize: 100,
      },
    },
    admin: {
      mode: 'history',
      preload: { strategy: 'idle', enabled: true },
      cache: { maxSize: 30, strategy: 'session', enabled: true },
      animation: { type: 'scale', duration: 200, enabled: true },
      performance: {
        enableLazyLoading: true,
        enableCodeSplitting: true,
        enablePrefetch: true,
        cacheSize: 50,
      },
      security: {
        enableCSRFProtection: true,
        enableXSSProtection: true,
      },
    },
    blog: {
      mode: 'history',
      preload: { strategy: 'visible', enabled: true },
      cache: { maxSize: 15, strategy: 'local', enabled: true },
      animation: { type: 'fade', duration: 300, enabled: true },
      performance: {
        enableLazyLoading: true,
        enableCodeSplitting: false,
        enablePrefetch: true,
        cacheSize: 30,
      },
    },
  }

  return presets[preset] || {}
}

/**
 * 合并配置选项
 */
function mergeOptions(
  options: RouterEnginePluginOptions,
): RouterEnginePluginOptions {
  const { preset, ...userOptions } = options

  if (preset) {
    const presetConfig = getPresetConfig(preset)
    return {
      ...presetConfig,
      ...userOptions,
      // 深度合并嵌套对象
      preload:
        typeof userOptions.preload === 'object' && userOptions.preload !== null
          ? {
            ...(presetConfig.preload as any),
            ...(userOptions.preload as any),
          }
          : userOptions.preload ?? presetConfig.preload,
      cache:
        typeof userOptions.cache === 'object' && userOptions.cache !== null
          ? { ...(presetConfig.cache as any), ...(userOptions.cache as any) }
          : userOptions.cache ?? presetConfig.cache,
      animation:
        typeof userOptions.animation === 'object'
          && userOptions.animation !== null
          ? {
            ...(presetConfig.animation as any),
            ...(userOptions.animation as any),
          }
          : userOptions.animation ?? presetConfig.animation,
      performance: {
        ...presetConfig.performance,
        ...userOptions.performance,
      },
      development: {
        ...presetConfig.development,
        ...userOptions.development,
      },
      security: {
        ...presetConfig.security,
        ...userOptions.security,
      },
    }
  }

  return options
}

/**
 * 创建路由器 Engine 插件（增强版）
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
 * // 使用预设配置
 * const routerPlugin = createRouterEnginePlugin({
 *   preset: 'spa',
 *   routes: [
 *     { path: '/', component: Home },
 *     { path: '/about', component: About }
 *   ]
 * })
 *
 * // 自定义配置
 * const customRouterPlugin = createRouterEnginePlugin({
 *   routes: [...],
 *   mode: 'history',
 *   preload: { strategy: 'hover', delay: 200 },
 *   cache: { maxSize: 30, strategy: 'memory' },
 *   animation: { type: 'fade', duration: 300 }
 * })
 *
 * await engine.use(routerPlugin)
 * ```
 */
export function createRouterEnginePlugin(
  options: RouterEnginePluginOptions,
): Plugin {
  // 合并预设配置和用户配置
  const mergedOptions = mergeOptions(options)

  const {
    name = 'router',
    version = '1.0.0',
    routes,
    mode = 'history',
    base = '/',
    scrollBehavior,
    linkActiveClass,
    linkExactActiveClass
  } = mergedOptions

  return {
    name,
    version,
    dependencies: [], // 路由器插件通常不依赖其他插件

    async install(context) {
      try {
        // 从上下文中获取引擎实例
        const engine = context.engine || context

        // 定义实际的安装逻辑
        const performInstall = async () => {
          // 获取 Vue 应用实例
          const vueApp = engine.getApp()
          if (!vueApp) {
            throw new Error(
              'Vue app not found. Make sure the engine has created a Vue app before installing router plugin.',
            )
          }

          // Installing router plugin (日志已禁用)

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
          const routerOptions: any = {
            history,
            routes,
            linkActiveClass: linkActiveClass || 'router-link-active',
            linkExactActiveClass: linkExactActiveClass || 'router-link-exact-active',
          }
          if (scrollBehavior) {
            routerOptions.scrollBehavior = scrollBehavior
          }
          const router = createRouter(routerOptions)

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
          // 创建路由器适配器
          const routerAdapter = {
            install: (_engine: any) => {
              // 已经安装，无需重复安装
            },
            push: router.push.bind(router),
            replace: router.replace.bind(router),
            go: router.go.bind(router),
            back: router.back.bind(router),
            forward: router.forward.bind(router),
            getCurrentRoute: () => router.currentRoute,
            getRoutes: router.getRoutes.bind(router),
            addRoute: router.addRoute.bind(router),
            removeRoute: router.removeRoute.bind(router),
            hasRoute: router.hasRoute.bind(router),
            resolve: router.resolve.bind(router),
            beforeEach: router.beforeEach.bind(router),
            beforeResolve: router.beforeResolve.bind(router),
            afterEach: router.afterEach.bind(router),
            onError: router.onError.bind(router),
            getRouter: () => router, // 返回原始路由器实例
          }

          engine.router = routerAdapter

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
          router.onError((error) => {
            engine.logger.error('Router navigation error:', error)
            if (engine.events) {
              engine.events.emit('router:error', error)
            }
          })

          // 等待路由器准备就绪（在测试环境中跳过）
          const isTestEnv = nodeProcess?.env?.NODE_ENV === 'test'
          if (!isTestEnv) {
            // Waiting for router to be ready (日志已禁用)
            await router.isReady()
            // Router is ready (日志已禁用)
          }

          // Router plugin installed successfully (日志已禁用)

          // 触发插件安装完成事件
          if (engine.events) {
            engine.events.emit(`plugin:${name}:installed`, {
              router,
              mode,
              base,
              routesCount: routes.length,
            })
          }
        }

        // 检查Vue应用是否已经创建
        const vueApp = engine.getApp()
        if (vueApp) {
          // 如果Vue应用已经创建，立即安装
          await performInstall()
        }
        else {
          // 如果Vue应用还没创建，监听应用创建事件
          engine.events.once('app:created', async () => {
            try {
              await performInstall()
            }
            catch (error) {
              engine.logger.error(`Failed to install ${name} plugin after app creation:`, error)
            }
          })

          // Router plugin registered (日志已禁用)
        }
      }
      catch (error) {
        // 安全地记录错误，避免 engine.logger 为 undefined 的情况
        if (
          context.engine
          && context.engine.logger
          && typeof context.engine.logger.error === 'function'
        ) {
          context.engine.logger.error(
            `Failed to install ${name} plugin:`,
            error,
          )
        }
        else {
          console.error(`Failed to install ${name} plugin:`, error)
        }
        throw error
      }
    },

    async uninstall(context) {
      try {
        // 从上下文中获取引擎实例
        const engine = context.engine || context

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
      }
      catch (error) {
        const engine = context.engine || context
        if (
          engine
          && engine.logger
          && typeof engine.logger.error === 'function'
        ) {
          engine.logger.error(`Failed to uninstall ${name} plugin:`, error)
        }
        else {
          console.error(`Failed to uninstall ${name} plugin:`, error)
        }
        throw error
      }
    },
  }
}

// ==================== 便捷工厂函数 ====================

/**
 * 创建 SPA 路由插件
 */
export function createSPARouter(
  routes: RouteRecordRaw[],
  options?: Partial<RouterEnginePluginOptions>,
) {
  return createRouterEnginePlugin({
    preset: 'spa',
    routes,
    ...options,
  })
}

/**
 * 创建移动端路由插件
 */
export function createMobileRouter(
  routes: RouteRecordRaw[],
  options?: Partial<RouterEnginePluginOptions>,
) {
  return createRouterEnginePlugin({
    preset: 'mobile',
    routes,
    ...options,
  })
}

/**
 * 创建桌面端路由插件
 */
export function createDesktopRouter(
  routes: RouteRecordRaw[],
  options?: Partial<RouterEnginePluginOptions>,
) {
  return createRouterEnginePlugin({
    preset: 'desktop',
    routes,
    ...options,
  })
}

/**
 * 创建管理后台路由插件
 */
export function createAdminRouter(
  routes: RouteRecordRaw[],
  options?: Partial<RouterEnginePluginOptions>,
) {
  return createRouterEnginePlugin({
    preset: 'admin',
    routes,
    ...options,
  })
}

/**
 * 创建博客路由插件
 */
export function createBlogRouter(
  routes: RouteRecordRaw[],
  options?: Partial<RouterEnginePluginOptions>,
) {
  return createRouterEnginePlugin({
    preset: 'blog',
    routes,
    ...options,
  })
}

/**
 * 创建简单路由插件（最小配置）
 */
export function createSimpleRouter(
  routes: RouteRecordRaw[],
  mode: 'history' | 'hash' = 'history',
) {
  return createRouterEnginePlugin({
    routes,
    mode,
    preload: false,
    cache: false,
    animation: false,
  })
}

// ==================== 配置验证 ====================

/**
 * 验证路由配置
 */
export function validateRouterConfig(
  options: RouterEnginePluginOptions,
): string[] {
  const errors: string[] = []

  if (!options.routes || !Array.isArray(options.routes)) {
    errors.push('routes 必须是一个数组')
  }

  if (options.routes && options.routes.length === 0) {
    errors.push('routes 不能为空')
  }

  if (options.mode && !['history', 'hash', 'memory'].includes(options.mode)) {
    errors.push('mode 必须是 "history", "hash" 或 "memory" 之一')
  }

  if (
    options.preset
    && !['spa', 'mpa', 'mobile', 'desktop', 'admin', 'blog'].includes(
      options.preset,
    )
  ) {
    errors.push('preset 必须是有效的预设类型')
  }

  return errors
}

// ==================== 默认导出 ====================

export default {
  createRouterEnginePlugin,
  createSPARouter,
  createMobileRouter,
  createDesktopRouter,
  createAdminRouter,
  createBlogRouter,
  createSimpleRouter,
  validateRouterConfig,
  getPresetConfig,
  mergeOptions,
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
  routes: RouteRecordRaw[],
): Plugin {
  return createRouterEnginePlugin({
    routes,
    mode: 'history',
    base: '/',
  })
}

// ==================== 简化路由器创建函数（用于测试和简单场景） ====================

/**
 * 创建简单的 SPA 路由器实例（直接返回路由器，不是插件）
 * 主要用于测试和不需要 Engine 集成的简单场景
 */
export function createSimpleSPARouter(
  routes: RouteRecordRaw[],
  options?: {
    mode?: 'history' | 'hash' | 'memory'
    base?: string
    scrollBehavior?: ScrollBehavior
  },
) {
  const { mode = 'history', base = '/', scrollBehavior } = options || {}

  // 创建历史对象
  let history
  switch (mode) {
    case 'hash':
      history = createWebHashHistory(base)
      break
    case 'memory':
      history = createMemoryHistory(base)
      break
    default:
      history = createWebHistory(base)
  }

  // 创建路由器实例
  const routerOptions: any = {
    history,
    routes,
    linkActiveClass: 'router-link-active',
    linkExactActiveClass: 'router-link-exact-active',
  }
  if (scrollBehavior) {
    routerOptions.scrollBehavior = scrollBehavior
  }
  const router = createRouter(routerOptions)

  return router
}

/**
 * 创建简单的移动端路由器实例
 */
export function createSimpleMobileRouter(
  routes: RouteRecordRaw[],
  options?: {
    animation?: { type: string, duration: number }
    mode?: 'history' | 'hash' | 'memory'
    base?: string
  },
) {
  const {
    mode = 'hash', // 移动端默认使用 hash 模式
    base = '/',
    animation,
  } = options || {}

  const router = createSimpleSPARouter(routes, { mode, base })

  // 添加移动端特有的配置
  if (animation) {
    ; (router as any).options = {
      ...(router as any).options,
      mode,
      animation,
    }
  }

  return router
}

/**
 * 创建简单的管理后台路由器实例
 */
export function createSimpleAdminRouter(
  routes: RouteRecordRaw[],
  options?: {
    security?: { enableCSRFProtection: boolean }
    mode?: 'history' | 'hash' | 'memory'
    base?: string
  },
) {
  const { mode = 'history', base = '/', security } = options || {}

  const router = createSimpleSPARouter(routes, { mode, base })

  // 添加管理后台特有的配置
  if (security) {
    ; (router as any).options = {
      ...(router as any).options,
      mode,
      security,
    }
  }

  return router
}
