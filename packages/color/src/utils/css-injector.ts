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
  /** 是否尝试使用 Constructable Stylesheet（adoptedStyleSheets） */
  useConstructable?: boolean
}

/**
 * 默认 CSS 注入选项
 */
const DEFAULT_CSS_OPTIONS: Required<CSSInjectionOptions> = {
  prefix: '--color',
  selector: ':root',
  important: false,
  styleId: 'ldesign-color-variables',
  useConstructable: false,
}

/**
 * CSS 注入器实现
 */
export class CSSInjectorImpl implements CSSInjector {
  private options: Required<CSSInjectionOptions>
  private styleElements: Map<string, HTMLStyleElement> = new Map()
  private styleSheets: Map<string, CSSStyleSheet> = new Map()
  private lastCssText: Map<string, string> = new Map()

  constructor(options?: CSSInjectionOptions) {
    this.options = { ...DEFAULT_CSS_OPTIONS, ...options }
  }

  /**
   * 注入 CSS 变量
   */
  injectVariables(variables: Record<string, ColorValue>, id?: string): void {
    const styleId = id || this.options.styleId
    const cssText = this.generateCSSText(variables)

    if (this.lastCssText.get(styleId) === cssText)
      return
    this.updateStyleElement(styleId, cssText)
    this.lastCssText.set(styleId, cssText)
  }

  /**
   * 注入带注释的 CSS 变量
   */
  injectVariablesWithComments(
    variableGroups: Array<{ comment: string, variables: Record<string, ColorValue> }>,
    id?: string,
  ): void {
    const styleId = id || this.options.styleId
    const cssText = this.generateCSSTextWithComments(variableGroups)

    if (this.lastCssText.get(styleId) === cssText)
      return
    this.updateStyleElement(styleId, cssText)
    this.lastCssText.set(styleId, cssText)
  }

  /**
   * 移除 CSS 变量
   */
  removeVariables(id?: string): void {
    const styleId = id || this.options.styleId

    // 移除 constructable sheet
    const sheet = this.styleSheets.get(styleId)
    if (sheet) {
      const adopted = (document as any).adoptedStyleSheets || []
        ; (document as any).adoptedStyleSheets = adopted.filter((s: any) => s !== sheet)
      this.styleSheets.delete(styleId)
    }

    // 移除 style 标签
    const styleElement = this.styleElements.get(styleId)
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement)
      this.styleElements.delete(styleId)
    }

    // 清理缓存的最后 CSS 文本
    this.lastCssText.delete(styleId)
  }

  /**
   * 更新 CSS 变量
   */
  updateVariables(variables: Record<string, ColorValue>, id?: string): void {
    this.injectVariables(variables, id)
  }

  /**
   * 注入主题变量（亮色和暗色两套）
   * @param lightVariables 亮色模式变量
   * @param darkVariables 暗色模式变量
   * @param themeInfo 主题信息（用于生成注释）
   * @param themeInfo.name 主题名称
   * @param themeInfo.primaryColor 主题主色调
   * @param id 样式标签ID
   */
  injectThemeVariables(
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
    themeInfo?: { name: string, primaryColor: string },
    id?: string,
  ): void {
    const styleId = id || this.options.styleId
    console.log('🔧 [CSSInjectorImpl] injectThemeVariables 被调用', {
      styleId,
      lightCount: Object.keys(lightVariables).length,
      darkCount: Object.keys(darkVariables).length,
      themeInfo,
    })
    const cssText = this.composeThemeCSSText(lightVariables, darkVariables, themeInfo)
    console.log('🔧 [CSSInjectorImpl] 生成的CSS长度', cssText.length)
    if (this.lastCssText.get(styleId) === cssText) {
      console.log('🔧 [CSSInjectorImpl] CSS内容未变化，跳过更新')
      return
    }
    console.log('🔧 [CSSInjectorImpl] 准备更新样式元素', styleId)
    this.updateStyleElement(styleId, cssText)
    this.lastCssText.set(styleId, cssText)
    console.log('🔧 [CSSInjectorImpl] 样式元素已更新')
  }

  /**
   * 构建主题 CSS 文本（不注入，仅返回字符串）
   */
  buildThemeCSSText(
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
    themeInfo?: { name: string, primaryColor: string },
  ): string {
    return this.composeThemeCSSText(lightVariables, darkVariables, themeInfo)
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
   * 生成带注释的 CSS 文本
   */
  private generateCSSTextWithComments(
    variableGroups: Array<{ comment: string, variables: Record<string, ColorValue> }>,
  ): string {
    const sections = variableGroups
      .map(({ comment, variables }) => {
        const declarations = Object.entries(variables)
          .map(([key, value]) => {
            const varName = key.startsWith('--') ? key : `${this.options.prefix}-${key}`
            const important = this.options.important ? ' !important' : ''
            return `  ${varName}: ${value}${important};`
          })
          .join('\n')

        return `  /* ${comment} */\n${declarations}`
      })
      .join('\n\n')

    return `${this.options.selector} {\n${sections}\n}`
  }

  /**
   * 更新样式元素（优化版本）
   */
  private updateStyleElement(id: string, cssText: string): void {
    // 优先使用 Constructable Stylesheet（如果开启且环境支持）
    const canUseConstructable
      = this.options.useConstructable
      && typeof (document as any).adoptedStyleSheets !== 'undefined'
      && typeof (window as any).CSSStyleSheet !== 'undefined'

    if (canUseConstructable) {
      this.updateConstructableStyleSheet(id, cssText)
      return
    }

    // 回退：使用 <style> 标签
    this.updateStyleTag(id, cssText)
  }

  /**
   * 更新 Constructable StyleSheet
   */
  private updateConstructableStyleSheet(id: string, cssText: string): void {
    let sheet = this.styleSheets.get(id)
    if (!sheet) {
      sheet = new (window as any).CSSStyleSheet()
      this.styleSheets.set(id, sheet!)
      // 采用样式表（避免重复）
      const adopted = (document as any).adoptedStyleSheets || []
      if (!adopted.includes(sheet)) {
        ; (document as any).adoptedStyleSheets = [...adopted, sheet]
      }
    }

    if (sheet) {
      try {
        // 同步替换内容（测试环境更稳定）
        ; (sheet as any).replaceSync(cssText)
      }
      catch {
        // 某些环境只能异步
        ; (sheet as any).replace(cssText)
      }
    }
  }

  /**
   * 更新 Style 标签（批量优化）
   */
  private updateStyleTag(id: string, cssText: string): void {
    console.log('🔧 [CSSInjectorImpl] updateStyleTag 被调用', { id, cssLength: cssText.length })
    let styleElement = this.styleElements.get(id)
    if (!styleElement) {
      console.log('🔧 [CSSInjectorImpl] 创建新的style元素', id)
      // 创建样式元素
      styleElement = document.createElement('style')
      styleElement.id = id
      styleElement.type = 'text/css'
      document.head.appendChild(styleElement)
      this.styleElements.set(id, styleElement)
      console.log('🔧 [CSSInjectorImpl] style元素已创建并添加到head')
    }
    else {
      console.log('🔧 [CSSInjectorImpl] 使用已存在的style元素', id)
    }

    // 使用 requestAnimationFrame 进行异步更新，避免阻塞主线程
    if (typeof requestAnimationFrame !== 'undefined') {
      console.log('🔧 [CSSInjectorImpl] 使用 requestAnimationFrame 更新内容')
      requestAnimationFrame(() => {
        styleElement!.textContent = cssText
        console.log('🔧 [CSSInjectorImpl] textContent 已设置', { id, length: cssText.length })
      })
    }
    else {
      console.log('🔧 [CSSInjectorImpl] 直接更新内容（无 requestAnimationFrame）')
      styleElement.textContent = cssText
      console.log('🔧 [CSSInjectorImpl] textContent 已设置', { id, length: cssText.length })
    }
  }

  /**
   * 组合主题 CSS 文本
   */
  private composeThemeCSSText(
    lightVariables: Record<string, string>,
    darkVariables: Record<string, string>,
    themeInfo?: { name: string, primaryColor: string },
  ): string {
    const themeComment = themeInfo
      ? `/* LDesign Theme: ${themeInfo.name} | Primary Color: ${themeInfo.primaryColor} | Generated: ${new Date().toISOString()} */\n`
      : `/* LDesign Theme Variables | Generated: ${new Date().toISOString()} */\n`

    const makeDecls = (vars: Record<string, string>) =>
      Object.entries(vars)
        .map(([key, value]) => {
          const varName = key.startsWith('--') ? key : `${this.options.prefix}-${key}`
          const important = this.options.important ? ' !important' : ''
          return `  ${varName}: ${value}${important};`
        })
        .join('\n')

    const lightDeclarations = makeDecls(lightVariables)
    const darkDeclarations = makeDecls(darkVariables)

    const baseSelector = this.options.selector || ':root'
    const darkSelector = `${baseSelector}[data-theme-mode=\"dark\"]`
    return `${themeComment}/* Light Mode Variables */\n${baseSelector} {\n${lightDeclarations}\n}\n\n/* Dark Mode Variables */\n${darkSelector} {\n${darkDeclarations}\n}`
  }

  /**
   * 获取所有已注入的样式 ID
   */
  getInjectedIds(): string[] {
    return Array.from(this.styleElements.keys())
  }

  /**
   * 接管（hydrate）已有的样式标签
   */
  hydrate(id?: string): void {
    const targetId = id || this.options.styleId
    const el = document.getElementById(targetId) as HTMLStyleElement | null
    if (el) {
      this.styleElements.set(targetId, el)
    }
  }

  /**
   * 清空所有注入的样式
   * 只清理由当前注入器管理的color相关样式，避免影响其他包的样式
   */
  clearAll(): void {
    // 先清除 constructable sheets
    for (const id of Array.from(this.styleSheets.keys())) {
      this.removeVariables(id)
    }
    // 再清除 style 标签
    for (const id of Array.from(this.styleElements.keys())) {
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
   * 从色阶生成完整的 CSS 变量集合
   */
  generateCompleteVariables(
    scales: Record<string, ColorScale>,
    prefix?: string,
  ): Array<{ comment: string, variables: Record<string, ColorValue> }> {
    const varPrefix = prefix || this.prefix
    const groups: Array<{ comment: string, variables: Record<string, ColorValue> }> = []

    // 1. 色阶变量组
    const scaleVariables: Record<string, ColorValue> = {}
    for (const [category, scale] of Object.entries(scales) as [ColorCategory, ColorScale][]) {
      // 生成标准色阶 (50, 100, 200, ..., 950)
      const standardScales = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
      standardScales.forEach((scaleValue, index) => {
        const color = scale.indices[index] || scale.colors[index] || scale.colors[0]
        if (color) {
          scaleVariables[`${varPrefix}-${category}-${scaleValue}`] = color
        }
      })
    }
    groups.push({ comment: '色阶变量 - Color Scales', variables: scaleVariables })

    // 2. 主色变量组
    const primaryVariables: Record<string, ColorValue> = {}
    for (const [category, scale] of Object.entries(scales) as [ColorCategory, ColorScale][]) {
      const baseColor = scale.indices[5] || scale.colors[4] || scale.colors[0]
      if (baseColor) {
        primaryVariables[`${varPrefix}-${category}`] = baseColor
        primaryVariables[`${varPrefix}-${category}-hover`] = scale.indices[6] || baseColor
        primaryVariables[`${varPrefix}-${category}-active`] = scale.indices[7] || baseColor
        primaryVariables[`${varPrefix}-${category}-disabled`] = scale.indices[3] || baseColor
        primaryVariables[`${varPrefix}-${category}-light`] = scale.indices[2] || baseColor
        primaryVariables[`${varPrefix}-${category}-lighter`] = scale.indices[1] || baseColor
        primaryVariables[`${varPrefix}-${category}-dark`] = scale.indices[8] || baseColor
        primaryVariables[`${varPrefix}-${category}-darker`] = scale.indices[9] || baseColor
      }
    }
    groups.push({ comment: '主色变量 - Primary Colors', variables: primaryVariables })

    return groups
  }

  /**
   * 从色阶生成 CSS 变量（兼容旧版本）
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
   * 生成完整的语义化 CSS 变量
   */
  generateCompleteSemanticVariables(
    scales: Record<string, ColorScale>,
    prefix?: string,
  ): Array<{ comment: string, variables: Record<string, ColorValue> }> {
    const varPrefix = prefix || this.prefix
    const groups: Array<{ comment: string, variables: Record<string, ColorValue> }> = []

    // 文本颜色变量组
    const textVariables: Record<string, ColorValue> = {}
    if (scales.gray) {
      textVariables[`${varPrefix}-text-primary`]
        = scales.gray.indices[9] || scales.gray.colors[8] || '#000000'
      textVariables[`${varPrefix}-text-secondary`]
        = scales.gray.indices[7] || scales.gray.colors[6] || '#666666'
      textVariables[`${varPrefix}-text-tertiary`]
        = scales.gray.indices[5] || scales.gray.colors[4] || '#999999'
      textVariables[`${varPrefix}-text-disabled`]
        = scales.gray.indices[3] || scales.gray.colors[2] || '#cccccc'
      textVariables[`${varPrefix}-text-placeholder`]
        = scales.gray.indices[4] || scales.gray.colors[3] || '#aaaaaa'
      textVariables[`${varPrefix}-text-inverse`] = scales.gray.indices[0] || '#ffffff'
    }
    groups.push({ comment: '文本颜色 - Text Colors', variables: textVariables })

    // 背景颜色变量组
    const backgroundVariables: Record<string, ColorValue> = {}
    if (scales.gray) {
      backgroundVariables[`${varPrefix}-bg-primary`] = scales.gray.indices[0] || '#ffffff'
      backgroundVariables[`${varPrefix}-bg-secondary`]
        = scales.gray.indices[1] || scales.gray.colors[0] || '#fafafa'
      backgroundVariables[`${varPrefix}-bg-tertiary`]
        = scales.gray.indices[2] || scales.gray.colors[1] || '#f5f5f5'
      backgroundVariables[`${varPrefix}-bg-disabled`]
        = scales.gray.indices[2] || scales.gray.colors[1] || '#f5f5f5'
      backgroundVariables[`${varPrefix}-bg-hover`]
        = scales.gray.indices[1] || scales.gray.colors[0] || '#fafafa'
      backgroundVariables[`${varPrefix}-bg-active`]
        = scales.gray.indices[2] || scales.gray.colors[1] || '#f0f0f0'
    }
    groups.push({ comment: '背景颜色 - Background Colors', variables: backgroundVariables })

    // 边框颜色变量组
    const borderVariables: Record<string, ColorValue> = {}
    if (scales.gray) {
      borderVariables[`${varPrefix}-border-primary`]
        = scales.gray.indices[3] || scales.gray.colors[2] || '#d9d9d9'
      borderVariables[`${varPrefix}-border-secondary`]
        = scales.gray.indices[2] || scales.gray.colors[1] || '#e8e8e8'
      borderVariables[`${varPrefix}-border-tertiary`]
        = scales.gray.indices[1] || scales.gray.colors[0] || '#f0f0f0'
      borderVariables[`${varPrefix}-border-disabled`]
        = scales.gray.indices[2] || scales.gray.colors[1] || '#e8e8e8'
      borderVariables[`${varPrefix}-border-hover`]
        = scales.gray.indices[4] || scales.gray.colors[3] || '#bfbfbf'
      borderVariables[`${varPrefix}-border-focus`]
        = scales.primary?.indices[5] || scales.primary?.colors[4] || '#1890ff'
    }
    groups.push({ comment: '边框颜色 - Border Colors', variables: borderVariables })

    // 阴影颜色变量组
    const shadowVariables: Record<string, ColorValue> = {}
    if (scales.gray) {
      shadowVariables[`${varPrefix}-shadow-light`]
        = scales.gray.indices[2] || scales.gray.colors[1] || '#f0f0f0'
      shadowVariables[`${varPrefix}-shadow-medium`]
        = scales.gray.indices[3] || scales.gray.colors[2] || '#d9d9d9'
      shadowVariables[`${varPrefix}-shadow-dark`]
        = scales.gray.indices[4] || scales.gray.colors[3] || '#bfbfbf'
    }
    groups.push({ comment: '阴影颜色 - Shadow Colors', variables: shadowVariables })

    return groups
  }

  /**
   * 生成语义化 CSS 变量（兼容旧版本）
   */
  generateSemanticVariables(
    scales: Record<string, ColorScale>,
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
  scales: Record<string, ColorScale>,
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
 * 只移除color包管理的样式，不影响其他包
 */
export function removeAllColorVariables(): void {
  // 只移除color相关的样式ID
  const colorStyleIds = ['ldesign-color-variables', 'ldesign-theme-variables']

  colorStyleIds.forEach((id) => {
    const element = document.getElementById(id)
    if (element) {
      element.remove()
    }
  })

  // 清理defaultCSSInjector中color相关的样式
  const injectedIds = defaultCSSInjector.getInjectedIds()
  injectedIds.forEach((id) => {
    if (id.startsWith('ldesign-color-') || id.startsWith('ldesign-theme-')) {
      defaultCSSInjector.removeVariables(id)
    }
  })
}
