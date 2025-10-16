/**
 * 插件配置文件
 *
 * 本文件展示了如何配置和使用 @ldesign/router 的基础功能
 */

import type { App } from 'vue'
import type { Router } from '@ldesign/router'

/**
 * 设置所有插件
 * @param app Vue 应用实例
 * @param router 路由器实例
 */
export async function setupPlugins(app: App, router: Router) {
  
  try {
    // 基础路由功能已经在 main.ts 中设置
      } catch (error) {
    console.error('❌ 插件设置失败:', error)
    throw error
  }
}
