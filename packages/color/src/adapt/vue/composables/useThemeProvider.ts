/**
 * 主题提供者组合式 API
 */

import type { ThemeManagerInstance } from '../../../core/types'
import { inject, provide } from 'vue'
import { THEME_MANAGER_KEY } from '../types'

/**
 * 提供主题管理器实例
 * @param manager 主题管理器实例
 * @param key 注入键，默认使用 THEME_MANAGER_KEY
 */
export function provideThemeManager(
  manager: ThemeManagerInstance,
  key: string | symbol = THEME_MANAGER_KEY,
): void {
  provide(key, manager)
}

/**
 * 注入主题管理器实例
 * @param key 注入键，默认使用 THEME_MANAGER_KEY
 * @returns 主题管理器实例或 undefined
 */
export function injectThemeManager(
  key: string | symbol = THEME_MANAGER_KEY,
): ThemeManagerInstance | undefined {
  return inject<ThemeManagerInstance>(key)
}
