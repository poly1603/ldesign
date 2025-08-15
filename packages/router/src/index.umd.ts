/**
 * UMD 专用入口文件
 * 避免动态导入，确保 UMD 构建成功
 *
 * 注意：为了避免代码分割问题，这个文件只导出核心功能
 * 完整功能请使用 ES 或 CJS 版本
 */

// 静态导入核心模块
import { createRouter as createVueRouter } from './core/router'
import { createAnimationPlugin } from './plugins/animation'
import { createCachePlugin } from './plugins/cache'
import { createPerformancePlugin } from './plugins/performance'
import { createPreloadPlugin } from './plugins/preload'

// 重新导出核心类型
export type * from './types'

// 重新导出插件创建函数
export {
  createAnimationPlugin,
  createCachePlugin,
  createPerformancePlugin,
  createPreloadPlugin,
}

/**
 * 简化的 createRouter 函数，用于 UMD 构建
 * 不包含插件系统，避免代码分割
 */
export function createRouter(options: {
  history: any
  routes: any[]
  // 其他路由器选项
  linkActiveClass?: string
  linkExactActiveClass?: string
  scrollBehavior?: any
}) {
  // 简化版本，只创建基础路由器，不包含插件
  return createVueRouter({
    history: options.history,
    routes: options.routes,
    linkActiveClass: options.linkActiveClass,
    linkExactActiveClass: options.linkExactActiveClass,
    scrollBehavior: options.scrollBehavior,
  })
}
