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
  /** 是否启用动画过渡 */
  enableTransition?: boolean
  /** 过渡持续时间 */
  transitionDuration?: string
  /** 过渡缓动函数 */
  transitionEasing?: string
}

/**
 * 默认CSS注入选项
 */
const DEFAULT_CSS_OPTIONS: Required<CSSInjectionOptions> = {
  styleId: 'ldesign-size-variables',
  selector: ':root',
  important: false,
  enableTransition: true,
  transitionDuration: '0.3s',
  transitionEasing: 'ease-in-out',
}

/**
 * CSS注入器类
 * 完全独立的CSS注入器，不依赖任何共享实例
 */
export class CSSInjector {
  private options: Required<CSSInjectionOptions>
  private styleElement: HTMLStyleElement | null = null
  private isProtected: boolean = true // 默认启用保护

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
   * 注入CSS字符串（增强版，带保护机制）
   */
  injectCSS(cssString: string): void {
    if (typeof document === 'undefined') {
      console.warn('CSS injection is only available in browser environment')
      return
    }

    // 检查是否已存在相同ID的style标签
    const existingStyle = document.getElementById(this.options.styleId)
    if (existingStyle && existingStyle.textContent === cssString) {
      // 内容相同，无需重新注入
      this.styleElement = existingStyle as HTMLStyleElement
      return
    }

    // 移除现有的样式元素
    this.removeCSS()

    // 创建新的样式元素
    this.styleElement = document.createElement('style')
    this.styleElement.id = this.options.styleId
    this.styleElement.textContent = cssString

    // 添加保护属性，防止被其他包误删（安全检查）
    if (this.isProtected && this.styleElement.setAttribute) {
      try {
        this.styleElement.setAttribute('data-package', 'ldesign-size')
        this.styleElement.setAttribute('data-protected', 'true')
        this.styleElement.setAttribute('data-injector', 'size-css-injector')
      } catch (error) {
        // 在某些环境中 setAttribute 可能不可用，忽略错误
        console.warn('[CSS Injector] Failed to set protection attributes:', error)
      }
    }

    // 插入到head中
    document.head.appendChild(this.styleElement)
  }

  /**
   * 移除CSS（只移除自己管理的样式）
   */
  removeCSS(): void {
    if (typeof document === 'undefined') {
      return
    }

    // 只移除自己管理的样式元素
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.remove()
    }

    // 作为备用，也检查DOM中是否有同ID的元素
    const existingStyle = document.getElementById(this.options.styleId)
    if (existingStyle) {
      // 安全检查 getAttribute 方法是否存在
      try {
        const packageAttr = existingStyle.getAttribute ? existingStyle.getAttribute('data-package') : null
        if (!packageAttr || packageAttr === 'ldesign-size') {
          existingStyle.remove()
        }
      } catch (error) {
        // 如果 getAttribute 失败，直接移除（可能是我们创建的元素）
        if (existingStyle.id === this.options.styleId) {
          existingStyle.remove()
        }
      }
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

    // 添加过渡动画
    let transitionRules = ''
    if (this.options.enableTransition) {
      const transitionProperties = Object.keys(variables).join(', ')
      transitionRules = `  transition: ${transitionProperties} ${this.options.transitionDuration} ${this.options.transitionEasing}${important};\n`
    }

    return `${this.options.selector} {\n${transitionRules}${cssRules}\n}`
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
export function setCSSVariableValue(
  name: string,
  value: string,
  element?: Element,
): void {
  if (typeof document === 'undefined') {
    return
  }

  const target = element || document.documentElement
  if (target instanceof HTMLElement) {
    target.style.setProperty(name, value)
  }
}
