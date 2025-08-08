/**
 * 插件系统
 *
 * 提供可扩展的插件架构，允许第三方扩展路由器功能
 */

// 导出类型定义
// 向后兼容的简化接口
import type { Router } from '../types'
import { PluginManager } from './manager'

// 导出内置插件
export * from './builtin'

// 导出插件管理器
export * from './manager'

export * from './types'

/**
 * 简化的插件接口（向后兼容）
 * @deprecated 请使用新的 RouterPlugin 接口
 */
export interface LegacyRouterPlugin {
  name: string
  version?: string
  install: (router: Router, options?: any) => void
  uninstall?: (router: Router) => void
}

/**
 * 创建插件管理器
 */
export function createPluginManager(router: Router): PluginManager {
  return new PluginManager(router)
}
