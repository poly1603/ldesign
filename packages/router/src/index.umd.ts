/**
 * UMD 专用入口文件
 * 避免代码分割，确保 UMD 构建成功
 *
 * 注意：为了避免代码分割问题，这个文件只导出核心功能
 * 完整功能请使用 ES 或 CJS 版本
 */

// 导入核心组件
import { RouterLink, RouterView } from './components'
// 导入核心 Hooks
import { useRoute, useRouter } from './composables'
// 导入常量
import { AnimationType, CacheStrategy, PreloadStrategy } from './core/constants'
// 导入历史管理
import {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from './core/history'
// 静态导入核心模块
import { createRouter as createVueRouter } from './core/router'

import { createAnimationPlugin } from './plugins/animation'

import { createCachePlugin } from './plugins/cache'

import { createPerformancePlugin } from './plugins/performance'

import { createPreloadPlugin } from './plugins/preload'

// 重新导出核心类型
export type * from './types'

// 重新导出核心组件
export { RouterLink, RouterView }

// 重新导出核心 Hooks
export { useRoute, useRouter }

// 重新导出历史管理
export { createMemoryHistory, createWebHashHistory, createWebHistory }

// 重新导出常量
export { AnimationType, CacheStrategy, PreloadStrategy }

// 重新导出插件创建函数
export {
  createAnimationPlugin,
  createCachePlugin,
  createPerformancePlugin,
  createPreloadPlugin,
}

/**
 * 创建基础路由器实例
 */
export function createRouter(options: {
  history: import('./types').RouterHistory
  routes: import('./types').RouteRecordRaw[]
  linkActiveClass?: string
  linkExactActiveClass?: string
  scrollBehavior?: import('./types').ScrollBehavior
}) {
  return createVueRouter({
    history: options.history,
    routes: options.routes,
    linkActiveClass: options.linkActiveClass,
    linkExactActiveClass: options.linkExactActiveClass,
    scrollBehavior: options.scrollBehavior,
  })
}

/**
 * 创建完整的路由器实例（包含所有插件）
 * UMD 版本使用静态导入，提供同步创建
 */
export function createFullRouter(options: {
  history: import('./types').RouterHistory
  routes: import('./types').RouteRecordRaw[]
  // 动画配置
  animation?: {
    enabled?: boolean
    defaultAnimation?: AnimationType
    customAnimations?: Record<string, any>
  }
  // 缓存配置
  cache?: {
    enabled?: boolean
    strategy?: CacheStrategy
    maxSize?: number
  }
  // 预加载配置
  preload?: {
    enabled?: boolean
    strategy?: PreloadStrategy
    autoPreloadRelated?: boolean
  }
  // 性能监控配置
  performance?: {
    enabled?: boolean
    warningThreshold?: number
    errorThreshold?: number
  }
  // 其他路由器选项
  linkActiveClass?: string
  linkExactActiveClass?: string
  scrollBehavior?: import('./types').ScrollBehavior
}) {
  // 创建基础路由器
  const router = createVueRouter({
    history: options.history,
    routes: options.routes,
    linkActiveClass: options.linkActiveClass,
    linkExactActiveClass: options.linkExactActiveClass,
    scrollBehavior: options.scrollBehavior,
  })

  const plugins: any[] = []

  // 动画插件
  if (options.animation?.enabled !== false) {
    plugins.push(
      createAnimationPlugin({
        defaultAnimation: options.animation?.defaultAnimation,
        customAnimations: options.animation?.customAnimations,
      }),
    )
  }

  // 缓存插件
  if (options.cache?.enabled !== false) {
    plugins.push(
      createCachePlugin({
        strategy: options.cache?.strategy,
        maxSize: options.cache?.maxSize,
      }),
    )
  }

  // 预加载插件
  if (options.preload?.enabled !== false) {
    plugins.push(
      createPreloadPlugin({
        strategy: options.preload?.strategy,
        autoPreloadRelated: options.preload?.autoPreloadRelated,
      }),
    )
  }

  // 性能监控插件
  if (options.performance?.enabled !== false) {
    plugins.push(
      createPerformancePlugin({
        warningThreshold: options.performance?.warningThreshold,
        errorThreshold: options.performance?.errorThreshold,
      }),
    )
  }

  return {
    router,
    plugins,
    install(app: any) {
      app.use(router)
      plugins.forEach((plugin) => {
        if (plugin.install) {
          plugin.install(app, router)
        }
      })
    },
  }
}
