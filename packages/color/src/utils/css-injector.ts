/**
 * CSS Variables 注入和管理系统
 */

import type {
  ColorCategory,
  ColorScale,
  ColorValue,
  CSSInjector,
} from '../core/types'

/**
 * CSS 注入选项
 */
export interface CSSInjectionOptions {
  /** CSS 变量前缀 */
  prefix?: string
  /** 目标选择器 */
  selector?: string
  /** 是否使用 !important */
  important?: boolean
  /** 样式标签 ID */
  styleId?: string
}

/**
 * 默认 CSS 注入选项
 */
const DEFAULT_CSS_OPTIONS: Required<CSSInjectionOptions> = {
  prefix: '--color',
  selector: ':root',
  important: false,
  styleId: 'ldesign-color-variables',
}

/**
 * CSS 注入器实现
 */
export class CSSInjectorImpl implements CSSInjector {
  private options: Required<CSSInjectionOptions>
  private styleElements: Map<string, HTMLStyleElement> = new Map()

  constructor(options?: CSSInjectionOptions) {
    this.options = { ...DEFAULT_CSS_OPTIONS, ...options }
  }

  /**
   * 注入 CSS 变量
   */
  injectVariables(
    variables: Record<string, ColorValue>,
    id?: string,
    themeInfo?: { name?: string; mode?: string; primaryColor?: string }
  ): void {
    const styleId = id || this.options.styleId
    const cssText = this.generateCSSText(variables, themeInfo)

    this.updateStyleElement(styleId, cssText)
  }

  /**
   * 移除 CSS 变量
   */
  removeVariables(id?: string): void {
    const styleId = id || this.options.styleId
    const styleElement = this.styleElements.get(styleId)

    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement)
      this.styleElements.delete(styleId)
    }
  }

  /**
   * 更新 CSS 变量
   */
  updateVariables(variables: Record<string, ColorValue>, id?: string): void {
    this.injectVariables(variables, id)
  }

  /**
   * 生成 CSS 文本
   */
  private generateCSSText(
    variables: Record<string, ColorValue>,
    themeInfo?: { name?: string; mode?: string; primaryColor?: string }
  ): string {
    const declarations = Object.entries(variables)
      .map(([key, value]) => {
        const varName = key.startsWith('--')
          ? key
          : `${this.options.prefix}-${key}`
        const important = this.options.important ? ' !important' : ''
        return `  ${varName}: ${value}${important};`
      })
      .join('\n')

    // 生成主题信息注释
    let comment = ''
    if (themeInfo) {
      const timestamp = new Date().toLocaleString('zh-CN')
      comment = `/*
 * LDesign 主题色彩变量
 * ==========================================
 * 主题名称: ${themeInfo.name || '默认主题'}
 * 颜色模式: ${themeInfo.mode || 'light'}
 * 主色调: ${themeInfo.primaryColor || 'N/A'}
 * 生成时间: ${timestamp}
 *
 * 变量说明:
 * - 色阶变量: --color-{category}-{1-10} (从浅到深)
 * - 语义化变量: --color-{semantic} (功能性颜色)
 *
 * 文本颜色层次:
 * - text-primary: 主要文本 (最深)
 * - text-secondary: 次要文本
 * - text-tertiary: 三级文本
 * - text-quaternary: 四级文本
 * - text-disabled: 禁用文本
 * - text-placeholder: 占位符文本 (最浅)
 *
 * 边框颜色层次:
 * - border-light: 浅色边框
 * - border: 标准边框
 * - border-strong: 深色边框
 *
 * 背景颜色层次:
 * - background-primary: 主背景 (白色)
 * - background-secondary: 次背景
 * - background-tertiary: 三级背景
 * - background-quaternary: 四级背景
 *
 * 阴影颜色层次:
 * - shadow-light: 浅阴影 (8% 透明度)
 * - shadow: 标准阴影 (12% 透明度)
 * - shadow-strong: 深阴影 (16% 透明度)
 * ==========================================
 */

`
    }

    return `${comment}${this.options.selector} {\n${declarations}\n}`
  }

  /**
   * 更新样式元素
   */
  private updateStyleElement(id: string, cssText: string): void {
    // 先移除所有同名的样式元素（包括可能存在的重复元素）
    const existingElements = document.querySelectorAll(`style[id="${id}"]`)
    existingElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })

    // 清理缓存中的引用
    this.styleElements.delete(id)

    // 创建新的样式元素
    const styleElement = document.createElement('style')
    styleElement.id = id
    styleElement.type = 'text/css'
    styleElement.textContent = cssText
    document.head.appendChild(styleElement)
    this.styleElements.set(id, styleElement)
  }

  /**
   * 获取所有已注入的样式 ID
   */
  getInjectedIds(): string[] {
    return Array.from(this.styleElements.keys())
  }

  /**
   * 清空所有注入的样式
   */
  clearAll(): void {
    for (const id of this.styleElements.keys()) {
      this.removeVariables(id)
    }
  }

  /**
   * 更新注入选项
   */
  updateOptions(options: Partial<CSSInjectionOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取当前选项
   */
  getOptions(): Required<CSSInjectionOptions> {
    return { ...this.options }
  }
}

/**
 * CSS 变量生成器
 */
export class CSSVariableGenerator {
  private prefix: string

  constructor(prefix: string = '--color') {
    this.prefix = prefix
  }

  /**
   * 从色阶生成 CSS 变量
   */
  generateFromScales(
    scales: Record<ColorCategory, ColorScale>,
    prefix?: string
  ): Record<string, ColorValue> {
    const variables: Record<string, ColorValue> = {}
    const varPrefix = prefix || this.prefix

    for (const [category, scale] of Object.entries(scales) as [
      ColorCategory,
      ColorScale
    ][]) {
      // 生成索引变量
      for (const [index, color] of Object.entries(scale.indices)) {
        variables[`${varPrefix}-${category}-${index}`] = color
      }

      // 生成主要变量（使用索引 5 作为主色）
      const primaryColor =
        scale.indices[5] || scale.colors[4] || scale.colors[0]
      if (primaryColor) {
        variables[`${varPrefix}-${category}`] = primaryColor
      }
    }

    return variables
  }

  /**
   * 生成语义化 CSS 变量
   */
  generateSemanticVariables(
    scales: Record<ColorCategory, ColorScale>,
    prefix?: string
  ): Record<string, ColorValue> {
    const variables: Record<string, ColorValue> = {}
    const varPrefix = prefix || this.prefix

    // 主要颜色
    const primary = scales.primary?.indices[5] || scales.primary?.colors[4]
    if (primary) {
      variables[`${varPrefix}-primary`] = primary
      variables[`${varPrefix}-primary-hover`] =
        scales.primary?.indices[6] || primary
      variables[`${varPrefix}-primary-active`] =
        scales.primary?.indices[7] || primary
      variables[`${varPrefix}-primary-disabled`] =
        scales.primary?.indices[3] || primary
    }

    // 成功色
    const success = scales.success?.indices[5] || scales.success?.colors[4]
    if (success) {
      variables[`${varPrefix}-success`] = success
      variables[`${varPrefix}-success-hover`] =
        scales.success?.indices[6] || success
      variables[`${varPrefix}-success-active`] =
        scales.success?.indices[7] || success
    }

    // 警告色
    const warning = scales.warning?.indices[5] || scales.warning?.colors[4]
    if (warning) {
      variables[`${varPrefix}-warning`] = warning
      variables[`${varPrefix}-warning-hover`] =
        scales.warning?.indices[6] || warning
      variables[`${varPrefix}-warning-active`] =
        scales.warning?.indices[7] || warning
    }

    // 危险色
    const danger = scales.danger?.indices[5] || scales.danger?.colors[4]
    if (danger) {
      variables[`${varPrefix}-danger`] = danger
      variables[`${varPrefix}-danger-hover`] =
        scales.danger?.indices[6] || danger
      variables[`${varPrefix}-danger-active`] =
        scales.danger?.indices[7] || danger
    }

    // 灰色系统 - 扩展文本、边框、背景和阴影变量
    const gray = scales.gray?.indices[5] || scales.gray?.colors[4]
    if (gray) {
      // 文本颜色 - 6个层次
      variables[`${varPrefix}-text-primary`] =
        scales.gray?.indices[9] || scales.gray?.colors[8] || gray
      variables[`${varPrefix}-text-secondary`] =
        scales.gray?.indices[7] || scales.gray?.colors[6] || gray
      variables[`${varPrefix}-text-tertiary`] =
        scales.gray?.indices[6] || scales.gray?.colors[5] || gray
      variables[`${varPrefix}-text-quaternary`] =
        scales.gray?.indices[5] || scales.gray?.colors[4] || gray
      variables[`${varPrefix}-text-disabled`] =
        scales.gray?.indices[4] || scales.gray?.colors[3] || gray
      variables[`${varPrefix}-text-placeholder`] =
        scales.gray?.indices[3] || scales.gray?.colors[2] || gray

      // 保持向后兼容
      variables[`${varPrefix}-text`] = variables[`${varPrefix}-text-primary`]

      // 边框颜色 - 3个层次
      variables[`${varPrefix}-border-light`] =
        scales.gray?.indices[2] || scales.gray?.colors[1] || gray
      variables[`${varPrefix}-border`] =
        scales.gray?.indices[3] || scales.gray?.colors[2] || gray
      variables[`${varPrefix}-border-strong`] =
        scales.gray?.indices[4] || scales.gray?.colors[3] || gray

      // 背景颜色 - 4个层次
      variables[`${varPrefix}-background-primary`] = '#ffffff'
      variables[`${varPrefix}-background-secondary`] =
        scales.gray?.indices[1] || scales.gray?.colors[0] || '#fafafa'
      variables[`${varPrefix}-background-tertiary`] =
        scales.gray?.indices[2] || scales.gray?.colors[1] || gray
      variables[`${varPrefix}-background-quaternary`] =
        scales.gray?.indices[3] || scales.gray?.colors[2] || gray

      // 保持向后兼容
      variables[`${varPrefix}-background`] =
        variables[`${varPrefix}-background-secondary`]

      // 阴影颜色 - 3个层次
      const shadowBase =
        scales.gray?.indices[8] || scales.gray?.colors[7] || '#000000'
      variables[`${varPrefix}-shadow-light`] = this.convertToRgba(
        shadowBase,
        0.08
      )
      variables[`${varPrefix}-shadow`] = this.convertToRgba(shadowBase, 0.12)
      variables[`${varPrefix}-shadow-strong`] = this.convertToRgba(
        shadowBase,
        0.16
      )
    }

    return variables
  }

  /**
   * 将颜色转换为RGBA格式
   */
  private convertToRgba(color: string, alpha: number): string {
    // 如果已经是rgba格式，直接返回
    if (color.startsWith('rgba')) {
      return color
    }

    // 如果是rgb格式，转换为rgba
    if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`)
    }

    // 如果是hex格式，转换为rgba
    if (color.startsWith('#')) {
      const hex = color.replace('#', '')
      // 处理3位和6位hex格式
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16)
        const g = parseInt(hex[1] + hex[1], 16)
        const b = parseInt(hex[2] + hex[2], 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      } else if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
    }

    // 默认返回黑色半透明
    return `rgba(0, 0, 0, ${alpha})`
  }

  /**
   * 更新前缀
   */
  updatePrefix(prefix: string): void {
    this.prefix = prefix
  }

  /**
   * 获取当前前缀
   */
  getPrefix(): string {
    return this.prefix
  }
}

/**
 * 创建 CSS 注入器实例
 */
export function createCSSInjector(options?: CSSInjectionOptions): CSSInjector {
  return new CSSInjectorImpl(options)
}

/**
 * 创建 CSS 变量生成器实例
 */
export function createCSSVariableGenerator(
  prefix?: string
): CSSVariableGenerator {
  return new CSSVariableGenerator(prefix)
}

/**
 * 默认 CSS 注入器实例
 */
export const defaultCSSInjector = new CSSInjectorImpl()

/**
 * 默认 CSS 变量生成器实例
 */
export const defaultCSSVariableGenerator = new CSSVariableGenerator()

/**
 * 便捷函数：直接注入色阶变量
 */
export function injectScaleVariables(
  scales: Record<ColorCategory, ColorScale>,
  options?: CSSInjectionOptions & { prefix?: string; semantic?: boolean }
): void {
  const injector = options ? new CSSInjectorImpl(options) : defaultCSSInjector
  const generator = new CSSVariableGenerator(options?.prefix)

  const variables = options?.semantic
    ? generator.generateSemanticVariables(scales, options.prefix)
    : generator.generateFromScales(scales, options?.prefix)

  injector.injectVariables(variables, options?.styleId)
}

/**
 * 便捷函数：移除所有颜色变量
 */
export function removeAllColorVariables(): void {
  defaultCSSInjector.clearAll()
}
