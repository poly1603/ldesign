/**
 * @ldesign/router 核心模块导出
 */

// 路由器
export { createRouter } from './router'
export type { RouterImpl } from './router'

// 历史管理
export {
  createWebHistory,
  createWebHashHistory,
  createMemoryHistory,
} from './history'

// 路由匹配
export { RouteMatcher } from './matcher'

// 常量
export * from './constants'
