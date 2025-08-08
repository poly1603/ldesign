import { createLDesignRouterAdapter } from './adapter'
import { routes } from './routes'

/**
 * 创建简化的路由器适配器
 */
export function createRouterAdapter() {
  return createLDesignRouterAdapter(routes)
}

// 导出基本内容
export { createLDesignRouterAdapter } from './adapter'
export { routes } from './routes'
