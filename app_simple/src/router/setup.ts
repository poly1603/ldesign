/**
 * 路由设置和初始化
 */

import type { App } from 'vue'
import { setupGuards } from './guards'

/**
 * 设置路由
 */
export async function setupRouter(app: App): Promise<void> {
  // 获取路由实例
  const router = (app as any).$router || (app.config.globalProperties.$router)

  if (!router) {
    console.warn('Router not found in app instance')
    return
  }

  // 设置路由守卫
  setupGuards({ router } as any)
}

/**
 * 获取路由实例（辅助方法）
 */
export function getRouter(app: App) {
  return (app as any).$router || app.config.globalProperties.$router
}