/**
 * 工厂函数模块 - 支持按需导入的便捷创建函数
 */

import type { ThemeManagerInstance, ThemeManagerOptions } from './core/types'

/**
 * 创建基础主题管理器实例
 * @param options 主题管理器配置选项
 * @returns 主题管理器实例
 */
export async function createThemeManager(
  options?: ThemeManagerOptions,
): Promise<ThemeManagerInstance> {
  const { ThemeManager } = await import('./core/theme-manager')
  const manager = new ThemeManager(options)
  await manager.init()
  return manager
}

/**
 * 创建带有预设主题的主题管理器实例
 * @param options 主题管理器配置选项
 * @returns 主题管理器实例
 */
export async function createThemeManagerWithPresets(
  options?: ThemeManagerOptions,
): Promise<ThemeManagerInstance> {
  const [{ ThemeManager }, { presetThemes }] = await Promise.all([
    import('./core/theme-manager'),
    import('./themes/presets'),
  ])

  const manager = new ThemeManager({
    themes: presetThemes,
    ...options,
  })

  await manager.init()
  return manager
}

/**
 * 创建简单的主题管理器实例（仅默认主题）
 * @param options 主题管理器配置选项
 * @returns 主题管理器实例
 */
export async function createSimpleThemeManager(
  options?: ThemeManagerOptions,
): Promise<ThemeManagerInstance> {
  const [{ ThemeManager }, { defaultTheme }] = await Promise.all([
    import('./core/theme-manager'),
    import('./themes/presets'),
  ])

  const manager = new ThemeManager({
    themes: [defaultTheme],
    defaultTheme: 'default',
    ...options,
  })

  await manager.init()
  return manager
}

/**
 * 创建自定义主题管理器
 * @param primaryColor 主色调
 * @param options 主题管理器配置选项
 * @returns 主题管理器实例
 */
export async function createCustomThemeManager(
  primaryColor: string,
  options?: ThemeManagerOptions & {
    themeName?: string
    darkPrimaryColor?: string
  },
): Promise<ThemeManagerInstance> {
  const [{ ThemeManager }, { createCustomTheme }] = await Promise.all([
    import('./core/theme-manager'),
    import('./themes/presets'),
  ])

  const customTheme = createCustomTheme(options?.themeName || 'custom', primaryColor, {
    darkPrimaryColor: options?.darkPrimaryColor,
  })

  const manager = new ThemeManager({
    themes: [customTheme],
    defaultTheme: customTheme.name,
    ...options,
  })

  await manager.init()
  return manager
}

/**
 * 创建轻量级颜色处理器（不包含主题管理）
 */
export async function createColorProcessor() {
  const colorConverter = await import('./utils/color-converter')
  return colorConverter
}

/**
 * 创建颜色生成器（异步版本）
 */
export async function createAsyncColorGenerator() {
  const { ColorGeneratorImpl } = await import('./utils/color-generator')
  return new ColorGeneratorImpl()
}

/**
 * 创建可访问性检查器
 */
export async function createAccessibilityChecker() {
  const accessibility = await import('./utils/accessibility')
  return accessibility
}
