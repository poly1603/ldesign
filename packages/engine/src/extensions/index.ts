/**
 * Engine扩展管理器
 * 
 * 统一管理所有扩展功能的集成逻辑
 */

import type { Engine, CreateEngineOptions } from '../types'
import { handleRouterConfig } from './router'
import { handleStoreConfig } from './store'

/**
 * 处理所有扩展配置
 * 
 * @param options Engine创建选项
 * @param engine Engine实例
 */
export async function handleExtensions(
  options: CreateEngineOptions,
  engine: Engine,
): Promise<void> {
  const { router, store, i18n, theme } = options

  // 处理router扩展
  if (router) {
    await handleRouterConfig(router, engine)
  }

  // 处理store扩展
  if (store) {
    await handleStoreConfig(store, engine)
  }

  // 处理i18n扩展
  if (i18n) {
    engine.setI18n(i18n)
  }

  // 处理theme扩展
  if (theme) {
    engine.setTheme(theme)
  }
}

// 导出扩展模块
export * from './router'
export * from './store'
