/**
 * 主题管理器
 * 负责主题的注册、切换和管理
 */

import type { ThemeConfig } from '../types'
import { StyleManager } from '../renderers'

/**
 * 主题定义接口
 */
export interface ThemeDefinition {
  /** 主题名称 */
  name: string
  /** 主题显示名称 */
  displayName: string
  /** 主题描述 */
  description?: string
  /** CSS变量 */
  variables: Record<string, string>
  /** 自定义CSS类名 */
  className?: string
  /** 是否为暗色主题 */
  dark?: boolean
  /** 主题预览图 */
  preview?: string
}

/**
 * 主题管理器实现
 */
export class ThemeManager {
  /** 样式管理器 */
  private styleManager: StyleManager

  /** 已注册的主题 */
  private themes: Map<string, ThemeDefinition> = new Map()

  /** 当前主题 */
  private currentTheme: string | null = null

  /** 主题变更监听器 */
  private themeChangeListeners: Array<(theme: string, prevTheme: string | null) => void> = []

  constructor(styleManager: StyleManager) {
    this.styleManager = styleManager
    this.registerBuiltinThemes()
  }

  /**
   * 注册主题
   * @param theme 主题定义
   */
  registerTheme(theme: ThemeDefinition): void {
    if (this.themes.has(theme.name)) {
      console.warn(`Theme "${theme.name}" is already registered. Overwriting.`)
    }
    
    this.themes.set(theme.name, theme)
    console.log(`Theme "${theme.name}" registered successfully`)
  }

  /**
   * 批量注册主题
   * @param themes 主题定义数组
   */
  registerMultipleThemes(themes: ThemeDefinition[]): void {
    themes.forEach(theme => this.registerTheme(theme))
  }

  /**
   * 注销主题
   * @param name 主题名称
   */
  unregisterTheme(name: string): void {
    if (!this.themes.has(name)) {
      console.warn(`Theme "${name}" is not registered.`)
      return
    }

    // 如果是当前主题，切换到默认主题
    if (this.currentTheme === name) {
      this.setTheme('default')
    }

    this.themes.delete(name)
    console.log(`Theme "${name}" unregistered successfully`)
  }

  /**
   * 设置主题
   * @param name 主题名称
   */
  setTheme(name: string): void {
    const theme = this.themes.get(name)
    if (!theme) {
      console.error(`Theme "${name}" is not registered.`)
      return
    }

    const prevTheme = this.currentTheme

    try {
      // 构建主题配置
      const themeConfig: ThemeConfig = {
        name: theme.name,
        variables: theme.variables,
        className: theme.className || `ldesign-editor-theme-${theme.name}`
      }

      // 应用主题
      this.styleManager.setTheme(themeConfig)
      
      // 更新当前主题
      this.currentTheme = name

      // 通知主题变更监听器
      this.notifyThemeChange(name, prevTheme)

      console.log(`Theme switched to "${name}" successfully`)
    } catch (error) {
      console.error(`Failed to set theme "${name}":`, error)
    }
  }

  /**
   * 获取当前主题
   * @returns 当前主题名称
   */
  getCurrentTheme(): string | null {
    return this.currentTheme
  }

  /**
   * 获取主题定义
   * @param name 主题名称
   * @returns 主题定义或undefined
   */
  getTheme(name: string): ThemeDefinition | undefined {
    return this.themes.get(name)
  }

  /**
   * 获取所有已注册的主题
   * @returns 主题定义数组
   */
  getAllThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values())
  }

  /**
   * 获取所有主题名称
   * @returns 主题名称数组
   */
  getThemeNames(): string[] {
    return Array.from(this.themes.keys())
  }

  /**
   * 检查主题是否已注册
   * @param name 主题名称
   * @returns 是否已注册
   */
  isThemeRegistered(name: string): boolean {
    return this.themes.has(name)
  }

  /**
   * 创建自定义主题
   * @param name 主题名称
   * @param baseTheme 基础主题名称
   * @param overrides 变量覆盖
   * @returns 自定义主题定义
   */
  createCustomTheme(
    name: string,
    baseTheme: string = 'default',
    overrides: Record<string, string> = {}
  ): ThemeDefinition {
    const base = this.themes.get(baseTheme)
    if (!base) {
      throw new Error(`Base theme "${baseTheme}" is not registered.`)
    }

    const customTheme: ThemeDefinition = {
      name,
      displayName: name,
      description: `Custom theme based on ${base.displayName}`,
      variables: {
        ...base.variables,
        ...overrides
      },
      className: `ldesign-editor-theme-${name}`,
      dark: base.dark
    }

    this.registerTheme(customTheme)
    return customTheme
  }

  /**
   * 导出主题配置
   * @param name 主题名称
   * @returns 主题配置JSON字符串
   */
  exportTheme(name: string): string | null {
    const theme = this.themes.get(name)
    if (!theme) {
      console.error(`Theme "${name}" is not registered.`)
      return null
    }

    return JSON.stringify(theme, null, 2)
  }

  /**
   * 导入主题配置
   * @param themeJson 主题配置JSON字符串
   * @returns 是否导入成功
   */
  importTheme(themeJson: string): boolean {
    try {
      const theme = JSON.parse(themeJson) as ThemeDefinition
      
      // 验证主题定义
      if (!this.validateThemeDefinition(theme)) {
        console.error('Invalid theme definition')
        return false
      }

      this.registerTheme(theme)
      return true
    } catch (error) {
      console.error('Failed to import theme:', error)
      return false
    }
  }

  /**
   * 添加主题变更监听器
   * @param listener 监听器函数
   */
  onThemeChange(listener: (theme: string, prevTheme: string | null) => void): void {
    this.themeChangeListeners.push(listener)
  }

  /**
   * 移除主题变更监听器
   * @param listener 监听器函数
   */
  offThemeChange(listener: (theme: string, prevTheme: string | null) => void): void {
    const index = this.themeChangeListeners.indexOf(listener)
    if (index > -1) {
      this.themeChangeListeners.splice(index, 1)
    }
  }

  /**
   * 注册内置主题
   */
  private registerBuiltinThemes(): void {
    // 默认主题
    this.registerTheme({
      name: 'default',
      displayName: '默认主题',
      description: '基于 LDesign 设计系统的默认主题',
      variables: {
        '--ldesign-editor-bg': 'var(--ldesign-bg-color-container)',
        '--ldesign-editor-color': 'var(--ldesign-text-color-primary)',
        '--ldesign-editor-border': 'var(--ldesign-border-color)',
        '--ldesign-editor-border-focus': 'var(--ldesign-border-color-focus)',
        '--ldesign-editor-placeholder': 'var(--ldesign-text-color-placeholder)'
      },
      className: 'ldesign-editor-theme-default',
      dark: false
    })

    // 暗色主题
    this.registerTheme({
      name: 'dark',
      displayName: '暗色主题',
      description: '适合夜间使用的暗色主题',
      variables: {
        '--ldesign-editor-bg': '#1a1a1a',
        '--ldesign-editor-color': '#ffffff',
        '--ldesign-editor-border': '#404040',
        '--ldesign-editor-border-focus': '#722ED1',
        '--ldesign-editor-placeholder': '#888888'
      },
      className: 'ldesign-editor-theme-dark',
      dark: true
    })

    // 简洁主题
    this.registerTheme({
      name: 'minimal',
      displayName: '简洁主题',
      description: '极简风格的主题',
      variables: {
        '--ldesign-editor-bg': '#ffffff',
        '--ldesign-editor-color': '#333333',
        '--ldesign-editor-border': '#e0e0e0',
        '--ldesign-editor-border-focus': '#007acc',
        '--ldesign-editor-placeholder': '#999999'
      },
      className: 'ldesign-editor-theme-minimal',
      dark: false
    })
  }

  /**
   * 验证主题定义
   * @param theme 主题定义
   * @returns 是否有效
   */
  private validateThemeDefinition(theme: any): theme is ThemeDefinition {
    return (
      typeof theme === 'object' &&
      typeof theme.name === 'string' &&
      typeof theme.displayName === 'string' &&
      typeof theme.variables === 'object' &&
      theme.variables !== null
    )
  }

  /**
   * 通知主题变更
   * @param theme 当前主题
   * @param prevTheme 之前主题
   */
  private notifyThemeChange(theme: string, prevTheme: string | null): void {
    this.themeChangeListeners.forEach(listener => {
      try {
        listener(theme, prevTheme)
      } catch (error) {
        console.error('Error in theme change listener:', error)
      }
    })
  }

  /**
   * 获取调试信息
   * @returns 调试信息对象
   */
  getDebugInfo(): {
    totalThemes: number
    currentTheme: string | null
    registeredThemes: string[]
    themeChangeListeners: number
  } {
    return {
      totalThemes: this.themes.size,
      currentTheme: this.currentTheme,
      registeredThemes: this.getThemeNames(),
      themeChangeListeners: this.themeChangeListeners.length
    }
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    this.themes.clear()
    this.themeChangeListeners = []
    this.currentTheme = null
  }
}
