/**
 * @file 主题管理器
 * @description 管理裁剪器的主题和样式
 */

import { EventEmitter } from '@/core/event-emitter'
import type { ThemeConfig } from '@/types'

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 主题变量
 */
export interface ThemeVariables {
  /** 主色调 */
  primaryColor: string
  /** 边框颜色 */
  borderColor: string
  /** 背景颜色 */
  backgroundColor: string
  /** 文本颜色 */
  textColor: string
  /** 阴影颜色 */
  shadowColor: string
  /** 成功颜色 */
  successColor: string
  /** 警告颜色 */
  warningColor: string
  /** 错误颜色 */
  errorColor: string
  /** 禁用颜色 */
  disabledColor: string
  /** 悬停颜色 */
  hoverColor: string
}

/**
 * 内置主题
 */
export interface BuiltinTheme {
  /** 主题名称 */
  name: string
  /** 主题显示名称 */
  displayName: string
  /** 主题描述 */
  description: string
  /** 主题变量 */
  variables: ThemeVariables
  /** 自定义CSS */
  customCSS?: Record<string, string>
}

/**
 * 主题管理器类
 */
export class ThemeManager extends EventEmitter {
  /** 当前主题配置 */
  private currentTheme: ThemeConfig

  /** 内置主题 */
  private builtinThemes: Map<string, BuiltinTheme> = new Map()

  /** 自定义主题 */
  private customThemes: Map<string, BuiltinTheme> = new Map()

  /** 当前主题模式 */
  private currentMode: ThemeMode = 'light'

  /** 媒体查询监听器 */
  private mediaQueryListener?: (e: MediaQueryListEvent) => void

  /** 样式元素 */
  private styleElement?: HTMLStyleElement

  /**
   * 构造函数
   * @param initialTheme 初始主题配置
   */
  constructor(initialTheme: Partial<ThemeConfig> = {}) {
    super()

    // 初始化内置主题
    this.initBuiltinThemes()

    // 设置初始主题
    this.currentTheme = {
      mode: 'light',
      primaryColor: '#722ED1',
      borderColor: '#d9d9d9',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      customCSS: {},
      ...initialTheme
    }

    // 应用主题
    this.applyTheme()

    // 监听系统主题变化
    this.setupSystemThemeListener()
  }

  /**
   * 初始化内置主题
   */
  private initBuiltinThemes(): void {
    // 亮色主题
    this.builtinThemes.set('light', {
      name: 'light',
      displayName: '亮色主题',
      description: '经典的亮色主题，适合大多数场景',
      variables: {
        primaryColor: '#722ED1',
        borderColor: '#d9d9d9',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        successColor: '#52c41a',
        warningColor: '#faad14',
        errorColor: '#f5222d',
        disabledColor: '#d9d9d9',
        hoverColor: '#f5f5f5'
      }
    })

    // 暗色主题
    this.builtinThemes.set('dark', {
      name: 'dark',
      displayName: '暗色主题',
      description: '护眼的暗色主题，适合夜间使用',
      variables: {
        primaryColor: '#722ED1',
        borderColor: '#434343',
        backgroundColor: '#1f1f1f',
        textColor: '#ffffff',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        successColor: '#73d13d',
        warningColor: '#ffc53d',
        errorColor: '#ff7875',
        disabledColor: '#434343',
        hoverColor: '#262626'
      }
    })

    // 高对比度主题
    this.builtinThemes.set('high-contrast', {
      name: 'high-contrast',
      displayName: '高对比度主题',
      description: '高对比度主题，提升可访问性',
      variables: {
        primaryColor: '#0066cc',
        borderColor: '#000000',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        successColor: '#008000',
        warningColor: '#ff8c00',
        errorColor: '#dc143c',
        disabledColor: '#808080',
        hoverColor: '#e6f3ff'
      }
    })

    // 紫色主题
    this.builtinThemes.set('purple', {
      name: 'purple',
      displayName: '紫色主题',
      description: '优雅的紫色主题',
      variables: {
        primaryColor: '#722ED1',
        borderColor: '#d3adf7',
        backgroundColor: '#f9f0ff',
        textColor: '#2f1b69',
        shadowColor: 'rgba(114, 46, 209, 0.1)',
        successColor: '#52c41a',
        warningColor: '#faad14',
        errorColor: '#f5222d',
        disabledColor: '#d3adf7',
        hoverColor: '#efdbff'
      }
    })
  }

  /**
   * 设置主题模式
   * @param mode 主题模式
   */
  setMode(mode: ThemeMode): void {
    if (this.currentMode === mode) return

    this.currentMode = mode
    this.currentTheme.mode = mode

    this.applyTheme()
    this.emit('themeChange', { mode, theme: this.currentTheme })
  }

  /**
   * 获取当前主题模式
   */
  getMode(): ThemeMode {
    return this.currentMode
  }

  /**
   * 设置主题配置
   * @param theme 主题配置
   */
  setTheme(theme: Partial<ThemeConfig>): void {
    this.currentTheme = { ...this.currentTheme, ...theme }
    this.applyTheme()
    this.emit('themeChange', { mode: this.currentMode, theme: this.currentTheme })
  }

  /**
   * 获取当前主题配置
   */
  getTheme(): ThemeConfig {
    return { ...this.currentTheme }
  }

  /**
   * 应用内置主题
   * @param themeName 主题名称
   */
  applyBuiltinTheme(themeName: string): void {
    const theme = this.builtinThemes.get(themeName)
    if (!theme) {
      throw new Error(`Builtin theme not found: ${themeName}`)
    }

    this.currentTheme = {
      mode: this.currentMode,
      primaryColor: theme.variables.primaryColor,
      borderColor: theme.variables.borderColor,
      backgroundColor: theme.variables.backgroundColor,
      textColor: theme.variables.textColor,
      customCSS: theme.customCSS || {}
    }

    this.applyTheme()
    this.emit('themeChange', { mode: this.currentMode, theme: this.currentTheme })
  }

  /**
   * 注册自定义主题
   * @param theme 自定义主题
   */
  registerCustomTheme(theme: BuiltinTheme): void {
    this.customThemes.set(theme.name, theme)
    this.emit('themeRegistered', theme)
  }

  /**
   * 获取所有可用主题
   */
  getAvailableThemes(): BuiltinTheme[] {
    return [
      ...Array.from(this.builtinThemes.values()),
      ...Array.from(this.customThemes.values())
    ]
  }

  /**
   * 获取主题变量
   * @param themeName 主题名称
   */
  getThemeVariables(themeName?: string): ThemeVariables {
    if (themeName) {
      const theme = this.builtinThemes.get(themeName) || this.customThemes.get(themeName)
      if (theme) {
        return theme.variables
      }
    }

    // 返回当前主题的变量
    const effectiveMode = this.getEffectiveMode()
    const theme = this.builtinThemes.get(effectiveMode)
    
    if (theme) {
      return {
        ...theme.variables,
        primaryColor: this.currentTheme.primaryColor,
        borderColor: this.currentTheme.borderColor,
        backgroundColor: this.currentTheme.backgroundColor,
        textColor: this.currentTheme.textColor
      }
    }

    // 默认变量
    return this.builtinThemes.get('light')!.variables
  }

  /**
   * 应用主题
   */
  private applyTheme(): void {
    const variables = this.getThemeVariables()
    
    // 创建或更新样式元素
    if (!this.styleElement) {
      this.styleElement = document.createElement('style')
      this.styleElement.setAttribute('data-cropper-theme', 'true')
      document.head.appendChild(this.styleElement)
    }

    // 生成CSS变量
    const cssVariables = this.generateCSSVariables(variables)
    
    // 生成自定义CSS
    const customCSS = this.generateCustomCSS()
    
    // 更新样式内容
    this.styleElement.textContent = `
      :root {
        ${cssVariables}
      }
      
      ${customCSS}
    `
  }

  /**
   * 生成CSS变量
   */
  private generateCSSVariables(variables: ThemeVariables): string {
    return Object.entries(variables)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        return `--cropper-${cssKey}: ${value};`
      })
      .join('\n        ')
  }

  /**
   * 生成自定义CSS
   */
  private generateCustomCSS(): string {
    const customCSS = this.currentTheme.customCSS || {}
    
    return Object.entries(customCSS)
      .map(([selector, styles]) => {
        if (typeof styles === 'string') {
          return `${selector} { ${styles} }`
        } else {
          const styleString = Object.entries(styles)
            .map(([prop, value]) => `${prop}: ${value};`)
            .join(' ')
          return `${selector} { ${styleString} }`
        }
      })
      .join('\n      ')
  }

  /**
   * 获取有效的主题模式
   */
  private getEffectiveMode(): ThemeMode {
    if (this.currentMode === 'auto') {
      return this.getSystemTheme()
    }
    return this.currentMode
  }

  /**
   * 获取系统主题
   */
  private getSystemTheme(): ThemeMode {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  /**
   * 设置系统主题监听器
   */
  private setupSystemThemeListener(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      this.mediaQueryListener = (e: MediaQueryListEvent) => {
        if (this.currentMode === 'auto') {
          this.applyTheme()
          this.emit('systemThemeChange', e.matches ? 'dark' : 'light')
        }
      }
      
      mediaQuery.addEventListener('change', this.mediaQueryListener)
    }
  }

  /**
   * 移除系统主题监听器
   */
  private removeSystemThemeListener(): void {
    if (typeof window !== 'undefined' && window.matchMedia && this.mediaQueryListener) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.removeEventListener('change', this.mediaQueryListener)
      this.mediaQueryListener = undefined
    }
  }

  /**
   * 导出主题配置
   */
  exportTheme(): string {
    return JSON.stringify(this.currentTheme, null, 2)
  }

  /**
   * 导入主题配置
   * @param themeJson 主题JSON字符串
   */
  importTheme(themeJson: string): void {
    try {
      const theme = JSON.parse(themeJson) as ThemeConfig
      this.setTheme(theme)
    } catch (error) {
      throw new Error('Invalid theme JSON format')
    }
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    this.removeSystemThemeListener()
    
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement)
      this.styleElement = undefined
    }
    
    this.removeAllListeners()
    this.builtinThemes.clear()
    this.customThemes.clear()
  }
}
