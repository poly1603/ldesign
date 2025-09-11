/**
 * 主题预设索引
 * 
 * 导出所有预设主题配置
 */

import lightTheme, { lightEChartsTheme } from './light'
import darkTheme, { darkEChartsTheme } from './dark'
import colorfulTheme, { colorfulEChartsTheme } from './colorful'
import type { ThemeConfig } from '../../core/types'

// ============================================================================
// 主题配置导出
// ============================================================================

export { lightTheme, darkTheme, colorfulTheme }
export { lightEChartsTheme, darkEChartsTheme, colorfulEChartsTheme }

// ============================================================================
// 主题映射
// ============================================================================

/**
 * 主题配置映射
 */
export const themeConfigs: Record<string, ThemeConfig> = {
  light: lightTheme,
  dark: darkTheme,
  colorful: colorfulTheme,
}

/**
 * ECharts 主题配置映射
 */
export const echartsThemes: Record<string, any> = {
  light: lightEChartsTheme,
  dark: darkEChartsTheme,
  colorful: colorfulEChartsTheme,
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 获取主题配置
 * @param name - 主题名称
 * @returns 主题配置
 */
export function getThemeConfig(name: string): ThemeConfig | undefined {
  return themeConfigs[name]
}

/**
 * 获取 ECharts 主题配置
 * @param name - 主题名称
 * @returns ECharts 主题配置
 */
export function getEChartsTheme(name: string): any {
  return echartsThemes[name]
}

/**
 * 获取所有可用的主题名称
 * @returns 主题名称数组
 */
export function getAvailableThemes(): string[] {
  return Object.keys(themeConfigs)
}

/**
 * 检查主题是否存在
 * @param name - 主题名称
 * @returns 是否存在
 */
export function hasTheme(name: string): boolean {
  return name in themeConfigs
}

/**
 * 创建主题变体
 * @param baseName - 基础主题名称
 * @param overrides - 覆盖配置
 * @param newName - 新主题名称
 * @returns 新主题配置
 */
export function createThemeVariant(
  baseName: string,
  overrides: Partial<ThemeConfig>,
  newName?: string
): ThemeConfig {
  const baseTheme = getThemeConfig(baseName)
  if (!baseTheme) {
    throw new Error(`基础主题 "${baseName}" 不存在`)
  }

  return {
    ...baseTheme,
    ...overrides,
    name: newName || `${baseName}-variant`,
    colors: {
      ...baseTheme.colors,
      ...overrides.colors,
    },
    font: {
      ...baseTheme.font,
      ...overrides.font,
    },
    chart: {
      ...baseTheme.chart,
      ...overrides.chart,
    },
  }
}

// ============================================================================
// 默认导出
// ============================================================================

export default {
  light: lightTheme,
  dark: darkTheme,
  colorful: colorfulTheme,
}
