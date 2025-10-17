/**
 * 路由守卫配置
 * 集中管理所有路由守卫
 */

import type { RouterEnginePlugin } from '@ldesign/router'
import { setupAuthGuard } from './auth.guard'
import { setupPermissionGuard } from './permission.guard'
import { setupProgressGuard } from './progress.guard'
import { setupTitleGuard } from './title.guard'

/**
 * 设置所有路由守卫
 */
export function setupGuards(router: RouterEnginePlugin) {
  // 进度条守卫
  setupProgressGuard(router)

  // 认证守卫
  setupAuthGuard(router)

  // 权限守卫
  setupPermissionGuard(router)

  // 页面标题守卫（已移至 app-setup.ts 中处理以避免 inject 警告）
  // setupTitleGuard(router)
}