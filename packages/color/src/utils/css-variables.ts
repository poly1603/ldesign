/**
 * CSS变量管理工具
 * 用于将生成的颜色注入到CSS自定义属性中
 */

import type { ColorConfig, ColorMode, ColorScale, NeutralColors } from '../core/types'

/**
 * CSS变量注入器
 */
export class CSSVariableInjector {
  private styleElement: HTMLStyleElement | null = null
  private currentVariables: Record<string, string> = {}

  constructor() {
    this.createStyleElement()
  }

  /**
   * 创建样式元素
   */
  private createStyleElement(): void {
    if (typeof document === 'undefined')
      return

    this.styleElement = document.createElement('style')
    this.styleElement.id = 'ldesign-color-variables'
    document.head.appendChild(this.styleElement)
  }

  /**
   * 注入CSS变量
   */
  injectVariables(variables: Record<string, string>): void {
    if (!this.styleElement)
      return

    this.currentVariables = { ...variables }

    const cssText = this.generateCSSText(variables)
    this.styleElement.textContent = cssText
  }

  /**
   * 更新单个CSS变量
   */
  updateVariable(name: string, value: string): void {
    this.currentVariables[name] = value
    this.injectVariables(this.currentVariables)
  }

  /**
   * 批量更新CSS变量
   */
  updateVariables(variables: Record<string, string>): void {
    Object.assign(this.currentVariables, variables)
    this.injectVariables(this.currentVariables)
  }

  /**
   * 移除CSS变量
   */
  removeVariable(name: string): void {
    delete this.currentVariables[name]
    this.injectVariables(this.currentVariables)
  }

  /**
   * 清除所有CSS变量
   */
  clearVariables(): void {
    this.currentVariables = {}
    if (this.styleElement) {
      this.styleElement.textContent = ''
    }
  }

  /**
   * 获取当前CSS变量
   */
  getCurrentVariables(): Record<string, string> {
    return { ...this.currentVariables }
  }

  /**
   * 生成CSS文本
   */
  private generateCSSText(variables: Record<string, string>): string {
    const cssRules = Object.entries(variables)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join('\n')

    return `:root {\n${cssRules}\n}`
  }

  /**
   * 销毁注入器
   */
  destroy(): void {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement)
      this.styleElement = null
    }
    this.currentVariables = {}
  }
}

/**
 * 全局CSS变量注入器实例
 */
export const globalCSSInjector = new CSSVariableInjector()

/**
 * 便捷函数：注入颜色主题CSS变量
 */
export function injectThemeVariables(
  colors: ColorConfig,
  scales: Record<string, ColorScale>,
  neutralColors?: NeutralColors,
  mode: ColorMode = 'light',
  prefix = '--color',
): void {
  const variables: Record<string, string> = {}

  // 基础颜色
  variables[`${prefix}-primary`] = colors.primary
  if (colors.success)
    variables[`${prefix}-success`] = colors.success
  if (colors.warning)
    variables[`${prefix}-warning`] = colors.warning
  if (colors.danger)
    variables[`${prefix}-danger`] = colors.danger
  if (colors.gray)
    variables[`${prefix}-gray`] = colors.gray

  // 色阶
  for (const [category, scale] of Object.entries(scales)) {
    if (scale && scale.indices) {
      for (const [index, color] of Object.entries(scale.indices)) {
        variables[`${prefix}-${category}-${index}`] = color
      }
    }
  }

  // 中性色
  if (neutralColors) {
    for (const [category, scale] of Object.entries(neutralColors)) {
      if (scale && scale.indices) {
        for (const [index, color] of Object.entries(scale.indices)) {
          variables[`${prefix}-${category}-${index}`] = color as string
        }
      }
    }
  }

  // 语义化变量
  addSemanticVariables(variables, mode, prefix)

  globalCSSInjector.injectVariables(variables)
}

/**
 * 添加语义化CSS变量
 */
function addSemanticVariables(
  variables: Record<string, string>,
  mode: ColorMode,
  prefix: string,
): void {
  if (mode === 'light') {
    // 亮色模式
    variables[`${prefix}-bg-primary`] = '#ffffff'
    variables[`${prefix}-bg-secondary`] = '#f8f9fa'
    variables[`${prefix}-bg-tertiary`] = '#f1f3f4'
    variables[`${prefix}-text-primary`] = '#212529'
    variables[`${prefix}-text-secondary`] = '#6c757d'
    variables[`${prefix}-text-tertiary`] = '#adb5bd'
    variables[`${prefix}-border-primary`] = '#dee2e6'
    variables[`${prefix}-border-secondary`] = '#e9ecef'
    variables[`${prefix}-shadow-sm`] = 'rgba(0, 0, 0, 0.05)'
    variables[`${prefix}-shadow-md`] = 'rgba(0, 0, 0, 0.1)'
    variables[`${prefix}-shadow-lg`] = 'rgba(0, 0, 0, 0.15)'
  }
  else {
    // 暗色模式
    variables[`${prefix}-bg-primary`] = '#1a1a1a'
    variables[`${prefix}-bg-secondary`] = '#2d2d2d'
    variables[`${prefix}-bg-tertiary`] = '#404040'
    variables[`${prefix}-text-primary`] = '#ffffff'
    variables[`${prefix}-text-secondary`] = '#b3b3b3'
    variables[`${prefix}-text-tertiary`] = '#808080'
    variables[`${prefix}-border-primary`] = '#404040'
    variables[`${prefix}-border-secondary`] = '#333333'
    variables[`${prefix}-shadow-sm`] = 'rgba(0, 0, 0, 0.2)'
    variables[`${prefix}-shadow-md`] = 'rgba(0, 0, 0, 0.3)'
    variables[`${prefix}-shadow-lg`] = 'rgba(0, 0, 0, 0.4)'
  }
}

/**
 * 便捷函数：切换主题模式
 */
export function toggleThemeMode(
  colors: ColorConfig,
  scales: Record<string, ColorScale>,
  neutralColors?: NeutralColors,
  currentMode: ColorMode = 'light',
  prefix = '--color',
): ColorMode {
  const newMode = currentMode === 'light' ? 'dark' : 'light'
  injectThemeVariables(colors, scales, neutralColors, newMode, prefix)
  return newMode
}

/**
 * 便捷函数：获取CSS变量值
 */
export function getCSSVariableValue(name: string): string {
  if (typeof document === 'undefined')
    return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * 便捷函数：设置CSS变量值
 */
export function setCSSVariableValue(name: string, value: string): void {
  if (typeof document === 'undefined')
    return
  document.documentElement.style.setProperty(name, value)
}
