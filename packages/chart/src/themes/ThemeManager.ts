/**
 * 主题管理器
 * 
 * 负责管理图表主题，支持预设主题和自定义主题
 */

import type { ThemeConfig, ColorConfig, ThemeEditorConfig, ThemePreview } from '../core/types'
import {
  PRESET_THEMES,
  LIGHT_THEME_COLORS,
  DARK_THEME_COLORS,
  COLORFUL_THEME_COLORS,
  BUSINESS_THEME_COLORS,
  TECH_THEME_COLORS,
  NATURE_THEME_COLORS,
  ELEGANT_THEME_COLORS
} from '../core/constants'
import { deepClone, deepMerge } from '../utils/helpers'

/**
 * 主题管理器类
 * 
 * 提供主题注册、切换、自定义等功能
 */
export class ThemeManager {
  /** 已注册的主题 */
  private _themes: Map<string, ThemeConfig> = new Map()

  /** 当前主题名称 */
  private _currentTheme = 'light'

  /** CSS 变量前缀 */
  private readonly _cssPrefix = '--ldesign-'

  constructor() {
    this._initializePresetThemes()
  }

  /**
   * 注册主题
   * @param theme - 主题配置
   */
  registerTheme(theme: ThemeConfig): void {
    this._validateTheme(theme)
    this._themes.set(theme.name, deepClone(theme))
  }

  /**
   * 获取主题
   * @param name - 主题名称
   * @returns 主题配置
   */
  getTheme(name: string): ThemeConfig | undefined {
    return this._themes.get(name)
  }

  /**
   * 获取当前主题
   * @returns 当前主题配置
   */
  getCurrentTheme(): ThemeConfig {
    const theme = this._themes.get(this._currentTheme)
    if (!theme) {
      throw new Error(`主题 "${this._currentTheme}" 不存在`)
    }
    return theme
  }

  /**
   * 设置当前主题
   * @param name - 主题名称
   */
  setCurrentTheme(name: string): void {
    if (!this._themes.has(name)) {
      throw new Error(`主题 "${name}" 不存在`)
    }
    this._currentTheme = name
    this._applyThemeToDOM()
  }

  /**
   * 获取所有主题名称
   * @returns 主题名称数组
   */
  getThemeNames(): string[] {
    return Array.from(this._themes.keys())
  }

  /**
   * 检查主题是否存在
   * @param name - 主题名称
   * @returns 是否存在
   */
  hasTheme(name: string): boolean {
    return this._themes.has(name)
  }

  /**
   * 移除主题
   * @param name - 主题名称
   */
  removeTheme(name: string): void {
    if (Object.keys(PRESET_THEMES).includes(name)) {
      throw new Error(`不能移除预设主题: ${name}`)
    }
    this._themes.delete(name)
  }

  /**
   * 创建自定义主题
   * @param name - 主题名称
   * @param baseTheme - 基础主题名称
   * @param overrides - 覆盖配置
   * @returns 自定义主题配置
   */
  createCustomTheme(
    name: string,
    baseTheme: string = 'light',
    overrides: Partial<ThemeConfig> = {}
  ): ThemeConfig {
    const base = this.getTheme(baseTheme)
    if (!base) {
      throw new Error(`基础主题 "${baseTheme}" 不存在`)
    }

    const customTheme: ThemeConfig = deepMerge(
      deepClone(base),
      { name, ...overrides }
    )

    this.registerTheme(customTheme)
    return customTheme
  }

  /**
   * 获取主题的 ECharts 配置
   * @param themeName - 主题名称
   * @returns ECharts 主题配置
   */
  getEChartsTheme(themeName?: string): any {
    const theme = themeName ? this.getTheme(themeName) : this.getCurrentTheme()
    if (!theme) {
      throw new Error(`主题 "${themeName}" 不存在`)
    }

    return this._convertToEChartsTheme(theme)
  }

  /**
   * 应用主题到 DOM
   * @param container - 容器元素（可选）
   */
  applyThemeToDOM(container?: HTMLElement): void {
    const theme = this.getCurrentTheme()
    const target = container || document.documentElement

    // 应用 CSS 变量
    this._applyCSSVariables(theme.colors, target)

    // 应用字体配置
    if (theme.font) {
      this._applyFontStyles(theme.font, target)
    }
  }

  /**
   * 从 CSS 变量创建主题
   * @param name - 主题名称
   * @param container - 容器元素
   * @returns 主题配置
   */
  createThemeFromCSS(name: string, container?: HTMLElement): ThemeConfig {
    const target = container || document.documentElement
    const computedStyle = window.getComputedStyle ? window.getComputedStyle(target) : null

    const colors: ColorConfig = {
      primary: this._getCSSVariable('brand-color', computedStyle),
      background: this._getCSSVariable('bg-color-page', computedStyle),
      text: this._getCSSVariable('text-color-primary', computedStyle),
      border: this._getCSSVariable('border-color', computedStyle),
      palette: this._extractColorPalette(computedStyle),
    }

    const theme: ThemeConfig = {
      name,
      colors,
      font: {
        family: computedStyle?.getPropertyValue('font-family') || 'Arial, sans-serif',
        size: parseInt(computedStyle?.getPropertyValue('font-size') || '14') || 14,
      },
    }

    this.registerTheme(theme)
    return theme
  }

  /**
   * 初始化预设主题
   */
  private _initializePresetThemes(): void {
    // 浅色主题
    this.registerTheme({
      name: 'light',
      colors: LIGHT_THEME_COLORS,
      font: {
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        size: 14,
        weight: 'normal',
      },
    })

    // 深色主题
    this.registerTheme({
      name: 'dark',
      colors: DARK_THEME_COLORS,
      font: {
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        size: 14,
        weight: 'normal',
      },
    })

    // 彩色主题
    this.registerTheme({
      name: 'colorful',
      colors: COLORFUL_THEME_COLORS,
      font: {
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        size: 14,
        weight: 'normal',
      },
    })
  }

  /**
   * 验证主题配置
   * @param theme - 主题配置
   */
  private _validateTheme(theme: ThemeConfig): void {
    if (!theme.name || typeof theme.name !== 'string') {
      throw new Error('主题必须有有效的名称')
    }

    if (!theme.colors || typeof theme.colors !== 'object') {
      throw new Error('主题必须包含颜色配置')
    }

    const requiredColors = ['primary', 'background', 'text']
    for (const color of requiredColors) {
      if (!theme.colors[color as keyof ColorConfig]) {
        throw new Error(`主题缺少必需的颜色配置: ${color}`)
      }
    }
  }

  /**
   * 转换为 ECharts 主题配置
   * @param theme - 主题配置
   * @returns ECharts 主题配置
   */
  private _convertToEChartsTheme(theme: ThemeConfig): any {
    return {
      color: theme.colors.palette || [theme.colors.primary],
      backgroundColor: theme.colors.background,
      textStyle: {
        color: theme.colors.text,
        fontFamily: theme.font?.family,
        fontSize: theme.font?.size,
        fontWeight: theme.font?.weight,
      },
      title: {
        textStyle: {
          color: theme.colors.text,
          fontFamily: theme.font?.family,
          fontSize: (theme.font?.size || 14) + 2,
          fontWeight: theme.font?.weight || 'bold',
        },
      },
      legend: {
        textStyle: {
          color: theme.colors.text,
          fontFamily: theme.font?.family,
          fontSize: theme.font?.size,
        },
      },
      categoryAxis: {
        axisLine: {
          lineStyle: {
            color: theme.colors.border,
          },
        },
        axisLabel: {
          color: theme.colors.text,
          fontFamily: theme.font?.family,
          fontSize: theme.font?.size,
        },
        splitLine: {
          lineStyle: {
            color: theme.colors.border,
          },
        },
      },
      valueAxis: {
        axisLine: {
          lineStyle: {
            color: theme.colors.border,
          },
        },
        axisLabel: {
          color: theme.colors.text,
          fontFamily: theme.font?.family,
          fontSize: theme.font?.size,
        },
        splitLine: {
          lineStyle: {
            color: theme.colors.border,
          },
        },
      },
    }
  }

  /**
   * 应用主题到 DOM
   */
  private _applyThemeToDOM(): void {
    this.applyThemeToDOM()
  }

  /**
   * 应用 CSS 变量
   * @param colors - 颜色配置
   * @param target - 目标元素
   */
  private _applyCSSVariables(colors: ColorConfig, target: HTMLElement): void {
    const style = target.style

    // 应用基础颜色
    if (colors.primary) style.setProperty(`${this._cssPrefix}brand-color`, colors.primary)
    if (colors.background) style.setProperty(`${this._cssPrefix}bg-color-page`, colors.background)
    if (colors.text) style.setProperty(`${this._cssPrefix}text-color-primary`, colors.text)
    if (colors.border) style.setProperty(`${this._cssPrefix}border-color`, colors.border)

    // 应用调色板
    if (colors.palette && Array.isArray(colors.palette)) {
      colors.palette.forEach((color, index) => {
        style.setProperty(`${this._cssPrefix}color-${index + 1}`, color)
      })
    }
  }

  /**
   * 应用字体样式
   * @param font - 字体配置
   * @param target - 目标元素
   */
  private _applyFontStyles(font: any, target: HTMLElement): void {
    const style = target.style

    if (font.family) style.setProperty('font-family', font.family)
    if (font.size) style.setProperty('font-size', `${font.size}px`)
    if (font.weight) style.setProperty('font-weight', font.weight)
  }

  /**
   * 获取 CSS 变量值
   * @param name - 变量名
   * @param computedStyle - 计算样式
   * @returns 变量值
   */
  private _getCSSVariable(name: string, computedStyle: CSSStyleDeclaration | null): string {
    if (!computedStyle) {
      return ''
    }

    const value = computedStyle.getPropertyValue(`${this._cssPrefix}${name}`).trim()

    // 在测试环境中，如果 getComputedStyle 不工作，尝试从 style 属性获取
    if (!value && typeof window !== 'undefined' && process?.env?.NODE_ENV === 'test') {
      const element = computedStyle as any
      if (element && element.style && element.style.getPropertyValue) {
        return element.style.getPropertyValue(`${this._cssPrefix}${name}`).trim()
      }
    }

    return value
  }

  /**
   * 提取调色板
   * @param computedStyle - 计算样式
   * @returns 调色板数组
   */
  private _extractColorPalette(computedStyle: CSSStyleDeclaration | null): string[] {
    const palette: string[] = []

    for (let i = 1; i <= 10; i++) {
      const color = this._getCSSVariable(`color-${i}`, computedStyle)
      if (color) {
        palette.push(color)
      }
    }

    return palette.length > 0 ? palette : [
      '#722ED1', '#1890FF', '#52C41A', '#FAAD14', '#F5222D'
    ]
  }

  /**
   * 创建主题编辑器配置
   * @param themeName - 主题名称
   * @returns 主题编辑器配置
   */
  createThemeEditor(themeName: string): ThemeEditorConfig {
    const theme = this.getTheme(themeName)
    if (!theme) {
      throw new Error(`主题 "${themeName}" 不存在`)
    }

    return {
      name: theme.name,
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        background: theme.colors.background,
        text: theme.colors.text,
        border: theme.colors.border,
        palette: [...theme.colors.palette]
      },
      fonts: {
        family: theme.fonts.family,
        size: theme.fonts.size,
        weight: theme.fonts.weight,
        lineHeight: theme.fonts.lineHeight
      },
      previewData: this._generatePreviewData()
    }
  }

  /**
   * 从编辑器配置应用主题
   * @param editorConfig - 编辑器配置
   */
  applyFromEditor(editorConfig: ThemeEditorConfig): void {
    const theme: ThemeConfig = {
      name: editorConfig.name,
      colors: editorConfig.colors,
      fonts: editorConfig.fonts
    }

    this.registerTheme(theme)
    this.setTheme(theme.name)
  }

  /**
   * 生成主题预览数据
   * @returns 预览数据
   */
  private _generatePreviewData(): any {
    return {
      categories: ['一月', '二月', '三月', '四月', '五月'],
      series: [
        {
          name: '销售额',
          data: [120, 200, 150, 80, 70]
        },
        {
          name: '利润',
          data: [80, 120, 100, 60, 50]
        }
      ]
    }
  }

  /**
   * 导出主题配置
   * @param themeName - 主题名称
   * @returns 主题配置 JSON 字符串
   */
  exportTheme(themeName: string): string {
    const theme = this.getTheme(themeName)
    if (!theme) {
      throw new Error(`主题 "${themeName}" 不存在`)
    }

    return JSON.stringify(theme, null, 2)
  }

  /**
   * 导入主题配置
   * @param themeJson - 主题配置 JSON 字符串
   */
  importTheme(themeJson: string): void {
    try {
      const theme = JSON.parse(themeJson) as ThemeConfig
      this._validateTheme(theme)
      this.registerTheme(theme)
    } catch (error) {
      throw new Error(`导入主题失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 获取主题预览
   * @param themeName - 主题名称
   * @returns 主题预览配置
   */
  getThemePreview(themeName: string): ThemePreview {
    const theme = this.getTheme(themeName)
    if (!theme) {
      throw new Error(`主题 "${themeName}" 不存在`)
    }

    return {
      name: theme.name,
      primaryColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
      textColor: theme.colors.text,
      palette: theme.colors.palette.slice(0, 5), // 只显示前5个颜色
      fontFamily: theme.fonts.family
    }
  }
}

/**
 * 全局主题管理器实例
 */
export const themeManager = new ThemeManager()

/**
 * 创建主题管理器实例
 * @returns 主题管理器实例
 */
export function createThemeManager(): ThemeManager {
  return new ThemeManager()
}
