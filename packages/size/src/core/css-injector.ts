/**
 * CSS注入器
 */

/**
 * CSS注入选项
 */
export interface CSSInjectionOptions {
  /** 样式标签ID */
  styleId?: string
  /** 目标选择器 */
  selector?: string
  /** 是否使用 !important */
  important?: boolean
}

/**
 * 默认CSS注入选项
 */
const DEFAULT_CSS_OPTIONS: Required<CSSInjectionOptions> = {
  styleId: 'ldesign-size-variables',
  selector: ':root',
  important: false,
}

/**
 * CSS注入器类
 */
export class CSSInjector {
  private options: Required<CSSInjectionOptions>
  private styleElement: HTMLStyleElement | null = null

  constructor(options?: CSSInjectionOptions) {
    this.options = { ...DEFAULT_CSS_OPTIONS, ...options }
  }

  /**
   * 注入CSS变量
   */
  injectVariables(variables: Record<string, string>): void {
    if (typeof document === 'undefined') {
      console.warn('CSS injection is only available in browser environment')
      return
    }

    const cssString = this.generateCSSString(variables)
    this.injectCSS(cssString)
  }

  /**
   * 注入CSS字符串
   */
  injectCSS(cssString: string): void {
    if (typeof document === 'undefined') {
      console.warn('CSS injection is only available in browser environment')
      return
    }

    // 移除现有的样式元素
    this.removeCSS()

    // 创建新的样式元素
    this.styleElement = document.createElement('style')
    this.styleElement.id = this.options.styleId
    this.styleElement.textContent = cssString

    // 插入到head中
    document.head.appendChild(this.styleElement)
  }

  /**
   * 移除CSS
   */
  removeCSS(): void {
    if (typeof document === 'undefined') {
      return
    }

    // 移除现有的样式元素
    const existingStyle = document.getElementById(this.options.styleId)
    if (existingStyle) {
      existingStyle.remove()
    }

    this.styleElement = null
  }

  /**
   * 更新CSS变量
   */
  updateVariables(variables: Record<string, string>): void {
    this.injectVariables(variables)
  }

  /**
   * 生成CSS字符串
   */
  private generateCSSString(variables: Record<string, string>): string {
    const important = this.options.important ? ' !important' : ''
    const cssRules = Object.entries(variables)
      .map(([name, value]) => `  ${name}: ${value}${important};`)
      .join('\n')

    return `${this.options.selector} {\n${cssRules}\n}`
  }

  /**
   * 检查是否已注入
   */
  isInjected(): boolean {
    if (typeof document === 'undefined') {
      return false
    }

    return document.getElementById(this.options.styleId) !== null
  }

  /**
   * 获取当前选项
   */
  getOptions(): Required<CSSInjectionOptions> {
    return { ...this.options }
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<CSSInjectionOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取样式元素
   */
  getStyleElement(): HTMLStyleElement | null {
    return this.styleElement
  }

  /**
   * 销毁注入器
   */
  destroy(): void {
    this.removeCSS()
  }
}

/**
 * 全局CSS注入器实例
 */
export const globalCSSInjector = new CSSInjector()

/**
 * 创建CSS注入器实例
 */
export function createCSSInjector(options?: CSSInjectionOptions): CSSInjector {
  return new CSSInjector(options)
}

/**
 * 便捷函数：注入CSS变量到全局
 */
export function injectGlobalVariables(
  variables: Record<string, string>,
  options?: CSSInjectionOptions,
): void {
  const injector = options ? new CSSInjector(options) : globalCSSInjector
  injector.injectVariables(variables)
}

/**
 * 便捷函数：移除全局CSS变量
 */
export function removeGlobalVariables(styleId?: string): void {
  if (styleId) {
    const injector = new CSSInjector({ styleId })
    injector.removeCSS()
  }
  else {
    globalCSSInjector.removeCSS()
  }
}

/**
 * 便捷函数：检查CSS变量是否已注入
 */
export function isVariablesInjected(styleId?: string): boolean {
  if (typeof document === 'undefined') {
    return false
  }

  const id = styleId || DEFAULT_CSS_OPTIONS.styleId
  return document.getElementById(id) !== null
}

/**
 * 便捷函数：获取CSS变量值
 */
export function getCSSVariableValue(name: string, element?: Element): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const target = element || document.documentElement
  return getComputedStyle(target).getPropertyValue(name).trim()
}

/**
 * 便捷函数：设置CSS变量值
 */
export function setCSSVariableValue(name: string, value: string, element?: Element): void {
  if (typeof document === 'undefined') {
    return
  }

  const target = element || document.documentElement
  if (target instanceof HTMLElement) {
    target.style.setProperty(name, value)
  }
}
