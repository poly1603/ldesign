/**
 * CSS Variables 注入和管理系统
 */

import type { ColorCategory, ColorScale, ColorValue, CSSInjector } from '../core/types'

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
  injectVariables(variables: Record<string, ColorValue>, id?: string): void {
    const styleId = id || this.options.styleId
    const cssText = this.generateCSSText(variables)

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
  private generateCSSText(variables: Record<string, ColorValue>): string {
    const declarations = Object.entries(variables)
      .map(([key, value]) => {
        const varName = key.startsWith('--') ? key : `${this.options.prefix}-${key}`
        const important = this.options.important ? ' !important' : ''
        return `  ${varName}: ${value}${important};`
      })
      .join('\n')

    return `${this.options.selector} {\n${declarations}\n}`
  }

  /**
   * 更新样式元素
   */
  private updateStyleElement(id: string, cssText: string): void {
    let styleElement = this.styleElements.get(id)

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = id
      styleElement.type = 'text/css'
      document.head.appendChild(styleElement)
      this.styleElements.set(id, styleElement)
    }

    styleElement.textContent = cssText
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
    prefix?: string,
  ): Record<string, ColorValue> {
    const variables: Record<string, ColorValue> = {}
    const varPrefix = prefix || this.prefix

    for (const [category, scale] of Object.entries(scales) as [ColorCategory, ColorScale][]) {
      // 生成索引变量
      for (const [index, color] of Object.entries(scale.indices)) {
        variables[`${varPrefix}-${category}-${index}`] = color
      }

      // 生成主要变量（使用索引 5 作为主色）
      const primaryColor = scale.indices[5] || scale.colors[4] || scale.colors[0]
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
    prefix?: string,
  ): Record<string, ColorValue> {
    const variables: Record<string, ColorValue> = {}
    const varPrefix = prefix || this.prefix

    // 主要颜色
    const primary = scales.primary?.indices[5] || scales.primary?.colors[4]
    if (primary) {
      variables[`${varPrefix}-primary`] = primary
      variables[`${varPrefix}-primary-hover`] = scales.primary?.indices[6] || primary
      variables[`${varPrefix}-primary-active`] = scales.primary?.indices[7] || primary
      variables[`${varPrefix}-primary-disabled`] = scales.primary?.indices[3] || primary
    }

    // 成功色
    const success = scales.success?.indices[5] || scales.success?.colors[4]
    if (success) {
      variables[`${varPrefix}-success`] = success
      variables[`${varPrefix}-success-hover`] = scales.success?.indices[6] || success
      variables[`${varPrefix}-success-active`] = scales.success?.indices[7] || success
    }

    // 警告色
    const warning = scales.warning?.indices[5] || scales.warning?.colors[4]
    if (warning) {
      variables[`${varPrefix}-warning`] = warning
      variables[`${varPrefix}-warning-hover`] = scales.warning?.indices[6] || warning
      variables[`${varPrefix}-warning-active`] = scales.warning?.indices[7] || warning
    }

    // 危险色
    const danger = scales.danger?.indices[5] || scales.danger?.colors[4]
    if (danger) {
      variables[`${varPrefix}-danger`] = danger
      variables[`${varPrefix}-danger-hover`] = scales.danger?.indices[6] || danger
      variables[`${varPrefix}-danger-active`] = scales.danger?.indices[7] || danger
    }

    // 灰色
    const gray = scales.gray?.indices[5] || scales.gray?.colors[4]
    if (gray) {
      variables[`${varPrefix}-text`] = scales.gray?.indices[8] || gray
      variables[`${varPrefix}-text-secondary`] = scales.gray?.indices[6] || gray
      variables[`${varPrefix}-text-disabled`] = scales.gray?.indices[4] || gray
      variables[`${varPrefix}-border`] = scales.gray?.indices[3] || gray
      variables[`${varPrefix}-background`] = scales.gray?.indices[1] || gray
    }

    return variables
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
export function createCSSVariableGenerator(prefix?: string): CSSVariableGenerator {
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
  options?: CSSInjectionOptions & { prefix?: string, semantic?: boolean },
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
