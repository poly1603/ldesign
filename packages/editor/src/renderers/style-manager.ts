/**
 * 样式管理器
 * 负责编辑器的样式管理，包括主题切换、CSS变量管理等
 */

import type { ThemeConfig } from '../types'
import { addClass, removeClass, setStyles } from '../utils'

/**
 * 样式管理器实现
 * 提供完整的样式管理功能
 */
export class StyleManager {
  /** 编辑器容器元素 */
  private container: HTMLElement

  /** 当前主题配置 */
  private currentTheme: ThemeConfig | null = null

  /** 动态样式表 */
  private dynamicStyleSheet: CSSStyleSheet | null = null

  /** 样式元素 */
  private styleElement: HTMLStyleElement | null = null

  /** CSS变量缓存 */
  private cssVariables: Map<string, string> = new Map()

  constructor(container: HTMLElement) {
    this.container = container
    this.initializeStyleSheet()
  }

  /**
   * 设置主题
   * @param theme 主题配置
   */
  setTheme(theme: string | ThemeConfig): void {
    // 移除旧主题
    if (this.currentTheme) {
      this.removeTheme(this.currentTheme)
    }

    // 解析主题配置
    const themeConfig = this.parseThemeConfig(theme)
    
    // 应用新主题
    this.applyTheme(themeConfig)
    
    // 保存当前主题
    this.currentTheme = themeConfig
  }

  /**
   * 获取当前主题
   * @returns 当前主题配置
   */
  getCurrentTheme(): ThemeConfig | null {
    return this.currentTheme
  }

  /**
   * 设置CSS变量
   * @param variables CSS变量映射
   */
  setCSSVariables(variables: Record<string, string>): void {
    Object.entries(variables).forEach(([key, value]) => {
      this.setCSSVariable(key, value)
    })
  }

  /**
   * 设置单个CSS变量
   * @param name 变量名
   * @param value 变量值
   */
  setCSSVariable(name: string, value: string): void {
    const varName = name.startsWith('--') ? name : `--${name}`
    this.container.style.setProperty(varName, value)
    this.cssVariables.set(varName, value)
  }

  /**
   * 获取CSS变量值
   * @param name 变量名
   * @returns 变量值
   */
  getCSSVariable(name: string): string | undefined {
    const varName = name.startsWith('--') ? name : `--${name}`
    return this.cssVariables.get(varName) || 
           getComputedStyle(this.container).getPropertyValue(varName)
  }

  /**
   * 移除CSS变量
   * @param name 变量名
   */
  removeCSSVariable(name: string): void {
    const varName = name.startsWith('--') ? name : `--${name}`
    this.container.style.removeProperty(varName)
    this.cssVariables.delete(varName)
  }

  /**
   * 添加动态样式规则
   * @param selector 选择器
   * @param styles 样式对象
   */
  addStyleRule(selector: string, styles: Record<string, string>): void {
    if (!this.dynamicStyleSheet) {
      return
    }

    const styleText = Object.entries(styles)
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ')

    const rule = `${selector} { ${styleText} }`
    
    try {
      this.dynamicStyleSheet.insertRule(rule, this.dynamicStyleSheet.cssRules.length)
    } catch (error) {
      console.error('Failed to add style rule:', error)
    }
  }

  /**
   * 移除动态样式规则
   * @param index 规则索引
   */
  removeStyleRule(index: number): void {
    if (!this.dynamicStyleSheet) {
      return
    }

    try {
      this.dynamicStyleSheet.deleteRule(index)
    } catch (error) {
      console.error('Failed to remove style rule:', error)
    }
  }

  /**
   * 清除所有动态样式规则
   */
  clearStyleRules(): void {
    if (!this.dynamicStyleSheet) {
      return
    }

    while (this.dynamicStyleSheet.cssRules.length > 0) {
      this.dynamicStyleSheet.deleteRule(0)
    }
  }

  /**
   * 添加CSS类名
   * @param className 类名
   */
  addClass(className: string): void {
    addClass(this.container, className)
  }

  /**
   * 移除CSS类名
   * @param className 类名
   */
  removeClass(className: string): void {
    removeClass(this.container, className)
  }

  /**
   * 检查是否包含CSS类名
   * @param className 类名
   * @returns 是否包含
   */
  hasClass(className: string): boolean {
    return this.container.classList.contains(className)
  }

  /**
   * 切换CSS类名
   * @param className 类名
   * @returns 切换后是否包含该类名
   */
  toggleClass(className: string): boolean {
    return this.container.classList.toggle(className)
  }

  /**
   * 设置内联样式
   * @param styles 样式对象
   */
  setInlineStyles(styles: Record<string, string>): void {
    setStyles(this.container, styles)
  }

  /**
   * 获取计算样式
   * @param property 样式属性
   * @returns 样式值
   */
  getComputedStyle(property: string): string {
    return getComputedStyle(this.container).getPropertyValue(property)
  }

  /**
   * 初始化样式表
   */
  private initializeStyleSheet(): void {
    // 创建样式元素
    this.styleElement = document.createElement('style')
    this.styleElement.setAttribute('data-ldesign-editor', 'dynamic-styles')
    document.head.appendChild(this.styleElement)

    // 获取样式表
    this.dynamicStyleSheet = this.styleElement.sheet as CSSStyleSheet
  }

  /**
   * 解析主题配置
   * @param theme 主题配置
   * @returns 解析后的主题配置
   */
  private parseThemeConfig(theme: string | ThemeConfig): ThemeConfig {
    if (typeof theme === 'string') {
      return {
        name: theme,
        variables: {},
        className: `ldesign-editor-theme-${theme}`
      }
    }
    
    return {
      ...theme,
      className: theme.className || `ldesign-editor-theme-${theme.name}`
    }
  }

  /**
   * 应用主题
   * @param theme 主题配置
   */
  private applyTheme(theme: ThemeConfig): void {
    // 添加主题类名
    if (theme.className) {
      this.addClass(theme.className)
    }

    // 设置CSS变量
    if (theme.variables) {
      this.setCSSVariables(theme.variables)
    }
  }

  /**
   * 移除主题
   * @param theme 主题配置
   */
  private removeTheme(theme: ThemeConfig): void {
    // 移除主题类名
    if (theme.className) {
      this.removeClass(theme.className)
    }

    // 移除主题相关的CSS变量
    if (theme.variables) {
      Object.keys(theme.variables).forEach(varName => {
        this.removeCSSVariable(varName)
      })
    }
  }

  /**
   * 获取所有CSS变量
   * @returns CSS变量映射
   */
  getAllCSSVariables(): Record<string, string> {
    return Object.fromEntries(this.cssVariables)
  }

  /**
   * 重置所有样式
   */
  reset(): void {
    // 移除当前主题
    if (this.currentTheme) {
      this.removeTheme(this.currentTheme)
      this.currentTheme = null
    }

    // 清除CSS变量
    this.cssVariables.clear()

    // 清除动态样式规则
    this.clearStyleRules()

    // 移除所有编辑器相关的类名
    const classList = Array.from(this.container.classList)
    classList.forEach(className => {
      if (className.startsWith('ldesign-editor')) {
        this.removeClass(className)
      }
    })
  }

  /**
   * 销毁样式管理器
   */
  destroy(): void {
    // 重置样式
    this.reset()

    // 移除样式元素
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement)
    }

    // 清理引用
    this.dynamicStyleSheet = null
    this.styleElement = null
    this.cssVariables.clear()
  }
}
