/**
 * 主题管理�?- 处理主题的应用、存储和恢复
 */

import { generateThemePalettes, injectThemedCssVariables } from '../core'
import { presetThemes, getPresetTheme, PresetTheme } from './presets'

export interface ThemeOptions {
  prefix?: string
  storageKey?: string
  autoApply?: boolean
  includeSemantics?: boolean
  includeGrays?: boolean
  nameMap?: Record<string, string>
}

export interface ThemeState {
  primaryColor: string
  themeName?: string
  isDark?: boolean
  prefix?: string
  createdAt?: number
  updatedAt?: number
  customColors?: Record<string, string>
  parent?: string  // 父主题名�?
  version?: string  // 主题版本
  author?: string   // 主题作�?
  description?: string  // 主题描述
}

const DEFAULT_STORAGE_KEY = 'ldesign-theme'
const DEFAULT_PREFIX = 'ld'

export class ThemeManager {
  private storageKey: string
  private prefix: string
  private currentTheme: ThemeState | null = null
  private listeners: Set<(theme: ThemeState) => void> = new Set()
  private systemThemeMediaQuery?: MediaQueryList
  private themeHistory: ThemeState[] = []  // 主题历史
  private maxHistorySize = 10  // 最大历史记录数
  private themeRegistry = new Map<string, ThemeState>()  // 主题注册�?
  private aiIntegration?: any  // AI集成实例

  constructor(options: ThemeOptions = {}) {
    this.storageKey = options.storageKey || DEFAULT_STORAGE_KEY
    this.prefix = options.prefix || DEFAULT_PREFIX
    
    // 加载主题注册�?
    this.loadThemeRegistry()
    
    if (options.autoApply !== false) {
      this.restore()
    }
  }

  /**
   * 应用主题
   */
  applyTheme(colorOrName: string, options: ThemeOptions = {}): ThemeState {
    let primaryColor = colorOrName
    let themeName: string | undefined
    
    // 检查是否是预设主题
    const preset = getPresetTheme(colorOrName)
    if (preset) {
      primaryColor = preset.color
      themeName = preset.name
    }
    
    // 生成light和dark主题
    const themes = generateThemePalettes(primaryColor, {
      preserveInput: true
    })
    
    // 注入CSS变量到页面（包含light和dark模式�?
    injectThemedCssVariables(themes, true)
    
    // 更新当前主题状�?
    this.currentTheme = {
      primaryColor,
      themeName,
      prefix: options.prefix || this.prefix,
      createdAt: this.currentTheme?.createdAt || Date.now(),
      updatedAt: Date.now(),
      version: this.currentTheme?.version || '1.0.0'
    }
    
    // 添加到历史记�?
    this.addToHistory(this.currentTheme)
    
    // 保存到存�?
    this.save(this.currentTheme)
    
    // 触发监听�?
    this.notifyListeners(this.currentTheme)
    
    return this.currentTheme
  }

  /**
   * 应用预设主题
   */
  applyPresetTheme(name: string, options: ThemeOptions = {}): ThemeState {
    const preset = getPresetTheme(name)
    if (!preset) {
      throw new Error(`Preset theme "${name}" not found`)
    }
    return this.applyTheme(name, options)
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeState | null {
    return this.currentTheme
  }

  /**
   * 导出主题配置
   */
  exportTheme(): string {
    if (!this.currentTheme) {
      throw new Error('No theme to export')
    }
    return JSON.stringify(this.currentTheme, null, 2)
  }

  /**
   * 导入主题配置
   */
  importTheme(themeData: string | ThemeState): ThemeState {
    try {
      const theme = typeof themeData === 'string' ? JSON.parse(themeData) : themeData
      
      if (!theme.primaryColor) {
        throw new Error('Invalid theme data: primaryColor is required')
      }
      
      return this.applyTheme(theme.primaryColor, {
        prefix: theme.prefix
      })
    } catch (error) {
      throw new Error(`Failed to import theme: ${(error as Error).message}`)
    }
  }

  /**
   * 检测系统主题偏�?
   */
  detectSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDark ? 'dark' : 'light'
    }
    return 'light'
  }

  /**
   * 监听系统主题变化
   */
  watchSystemTheme(callback: (mode: 'light' | 'dark') => void): () => void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handler = (e: MediaQueryListEvent) => {
        callback(e.matches ? 'dark' : 'light')
      }
      
      this.systemThemeMediaQuery.addEventListener('change', handler)
      
      // 返回清理函数
      return () => {
        this.systemThemeMediaQuery?.removeEventListener('change', handler)
      }
    }
    
    return () => {}
  }

  /**
   * 下载主题配置文件
   */
  downloadTheme(filename = 'theme.json'): void {
    if (typeof window === 'undefined' || !this.currentTheme) {
      throw new Error('Cannot download theme in non-browser environment or no theme set')
    }
    
    const blob = new Blob([this.exportTheme()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * 保存主题到本地存�?
   */
  private save(theme: ThemeState): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(theme))
      } catch (error) {
        console.error('Failed to save theme:', error)
      }
    }
  }

  /**
   * 从本地存储恢复主�?
   */
  restore(): ThemeState | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(this.storageKey)
        if (stored) {
          const theme = JSON.parse(stored) as ThemeState
          this.applyTheme(theme.themeName || theme.primaryColor, {
            prefix: theme.prefix
          })
          return theme
        }
      } catch (error) {
        console.error('Failed to restore theme:', error)
      }
    }
    return null
  }

  /**
   * 清除存储的主�?
   */
  clear(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(this.storageKey)
        this.currentTheme = null
      } catch (error) {
        console.error('Failed to clear theme:', error)
      }
    }
  }

  /**
   * 添加主题变化监听�?
   */
  onChange(listener: (theme: ThemeState) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(theme: ThemeState): void {
    this.listeners.forEach(listener => listener(theme))
  }

  /**
   * 获取所有预设主�?
   */
  getPresets(): PresetTheme[] {
    return presetThemes
  }
  
  /**
   * 主题继承 - 创建基于父主题的新主�?
   */
  createChildTheme(
    parentName: string,
    childName: string,
    overrides: Partial<ThemeState>
  ): ThemeState {
    const parentTheme = this.getTheme(parentName)
    if (!parentTheme) {
      throw new Error(`Parent theme "${parentName}" not found`)
    }
    
    const childTheme: ThemeState = {
      ...parentTheme,
      ...overrides,
      themeName: childName,
      parent: parentName,
      version: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    // 注册子主�?
    this.registerTheme(childName, childTheme)
    
    return childTheme
  }
  
  /**
   * 获取主题
   */
  getTheme(name: string): ThemeState | undefined {
    // 先从注册表查�?
    if (this.themeRegistry.has(name)) {
      return this.themeRegistry.get(name)
    }
    
    // 再从预设主题查找
    const preset = getPresetTheme(name)
    if (preset) {
      return {
        primaryColor: preset.color,
        themeName: preset.name,
        version: '1.0.0'
      }
    }
    
    return undefined
  }
  
  /**
   * 注册主题
   */
  registerTheme(name: string, theme: ThemeState): void {
    this.themeRegistry.set(name, theme)
    this.saveThemeRegistry()
  }
  
  /**
   * 保存主题注册�?
   */
  private saveThemeRegistry(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const themes = Array.from(this.themeRegistry.entries())
        localStorage.setItem(`${this.storageKey}-registry`, JSON.stringify(themes))
      } catch (error) {
        console.error('Failed to save theme registry:', error)
      }
    }
  }
  
  /**
   * 加载主题注册�?
   */
  private loadThemeRegistry(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(`${this.storageKey}-registry`)
        if (stored) {
          const themes = JSON.parse(stored) as [string, ThemeState][]
          this.themeRegistry = new Map(themes)
        }
      } catch (error) {
        console.error('Failed to load theme registry:', error)
      }
    }
  }
  
  /**
   * 版本管理 - 更新主题版本
   */
  updateThemeVersion(themeName: string, version: string): void {
    const theme = this.getTheme(themeName)
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`)
    }
    
    theme.version = version
    theme.updatedAt = Date.now()
    
    if (this.currentTheme?.themeName === themeName) {
      this.currentTheme = theme
      this.save(this.currentTheme)
    }
    
    this.registerTheme(themeName, theme)
  }
  
  /**
   * 主题历史管理
   */
  addToHistory(theme: ThemeState): void {
    this.themeHistory.unshift(theme)
    if (this.themeHistory.length > this.maxHistorySize) {
      this.themeHistory.pop()
    }
  }
  
  /**
   * 获取主题历史
   */
  getThemeHistory(): ThemeState[] {
    return [...this.themeHistory]
  }
  
  /**
   * 回滚到历史主�?
   */
  rollbackTheme(steps = 1): ThemeState | null {
    if (steps >= this.themeHistory.length) {
      console.warn('Cannot rollback beyond history limit')
      return null
    }
    
    const historicalTheme = this.themeHistory[steps]
    if (historicalTheme) {
      return this.applyTheme(
        historicalTheme.themeName || historicalTheme.primaryColor
      )
    }
    
    return null
  }
  
  /**
   * 集成AI配色建议
   */
  async enableAIIntegration(apiKey?: string): Promise<void> {
    try {
      const { ColorAI } = await import('../ai/colorAI')
      this.aiIntegration = new ColorAI({ apiKey })
    } catch (error) {
      console.error('Failed to enable AI integration:', error)
    }
  }
  
  /**
   * 获取AI配色建议
   */
  async getAISuggestions(context?: any): Promise<any> {
    if (!this.aiIntegration) {
      await this.enableAIIntegration()
    }
    
    if (this.aiIntegration) {
      return this.aiIntegration.getSuggestions(context || {
        mood: ['professional', 'modern'],
        industry: 'technology'
      })
    }
    
    return []
  }
  
  /**
   * 基于AI建议应用主题
   */
  async applyAISuggestedTheme(
    context?: any,
    index = 0
  ): Promise<ThemeState | null> {
    const suggestions = await this.getAISuggestions(context)
    
    if (suggestions && suggestions.length > index) {
      const suggestion = suggestions[index]
      const primaryColor = suggestion.colors[0].toHex()
      
      return this.applyTheme(primaryColor, {
        prefix: this.prefix
      })
    }
    
    return null
  }
  
  /**
   * 比较两个主题
   */
  compareThemes(
    theme1Name: string,
    theme2Name: string
  ): {
    differences: string[]
    similarity: number
  } {
    const theme1 = this.getTheme(theme1Name)
    const theme2 = this.getTheme(theme2Name)
    
    if (!theme1 || !theme2) {
      throw new Error('One or both themes not found')
    }
    
    const differences: string[] = []
    let similarityScore = 0
    const totalFields = 5
    
    // 比较主色
    if (theme1.primaryColor !== theme2.primaryColor) {
      differences.push(`Primary color: ${theme1.primaryColor} vs ${theme2.primaryColor}`)
    } else {
      similarityScore++
    }
    
    // 比较其他属�?
    if (theme1.isDark !== theme2.isDark) {
      differences.push(`Dark mode: ${theme1.isDark} vs ${theme2.isDark}`)
    } else {
      similarityScore++
    }
    
    if (theme1.prefix !== theme2.prefix) {
      differences.push(`Prefix: ${theme1.prefix} vs ${theme2.prefix}`)
    } else {
      similarityScore++
    }
    
    if (theme1.parent !== theme2.parent) {
      differences.push(`Parent theme: ${theme1.parent} vs ${theme2.parent}`)
    } else {
      similarityScore++
    }
    
    if (theme1.version !== theme2.version) {
      differences.push(`Version: ${theme1.version} vs ${theme2.version}`)
    } else {
      similarityScore++
    }
    
    return {
      differences,
      similarity: (similarityScore / totalFields) * 100
    }
  }
  
  /**
   * 批量导出主题
   */
  exportAllThemes(): string {
    const themes = {
      current: this.currentTheme,
      history: this.themeHistory,
      registry: Array.from(this.themeRegistry.entries())
    }
    
    return JSON.stringify(themes, null, 2)
  }
  
  /**
   * 批量导入主题
   */
  importAllThemes(data: string): void {
    try {
      const themes = JSON.parse(data)
      
      if (themes.registry) {
        this.themeRegistry = new Map(themes.registry)
        this.saveThemeRegistry()
      }
      
      if (themes.history) {
        this.themeHistory = themes.history
      }
      
      if (themes.current) {
        this.applyTheme(
          themes.current.themeName || themes.current.primaryColor
        )
      }
    } catch (error) {
      throw new Error(`Failed to import themes: ${(error as Error).message}`)
    }
  }
}

// 创建默认实例
export const defaultThemeManager = new ThemeManager()

/**
 * 快捷方法：应用主�?
 */
export function applyTheme(colorOrName: string, options?: ThemeOptions): ThemeState {
  return defaultThemeManager.applyTheme(colorOrName, options)
}

/**
 * 快捷方法：应用预设主�?
 */
export function applyPresetTheme(name: string, options?: ThemeOptions): ThemeState {
  return defaultThemeManager.applyPresetTheme(name, options)
}

/**
 * 快捷方法：恢复主�?
 */
export function restoreTheme(): ThemeState | null {
  return defaultThemeManager.restore()
}

/**
 * 快捷方法：获取当前主�?
 */
export function getCurrentTheme(): ThemeState | null {
  return defaultThemeManager.getCurrentTheme()
}