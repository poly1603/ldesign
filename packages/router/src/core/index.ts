/**
 * @ldesign/router 核心模块导出
 */

// 常量
export * from './constants'
// 历史管理
export {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from './history'

// 路由匹配
export { RouteMatcher } from './matcher'

// 路由器
export { createRouter } from './router'

export type { RouterImpl } from './router'
