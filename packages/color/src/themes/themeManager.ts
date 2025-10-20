/**
 * 主题管理�?- 处理主题的应用、存储和恢复
 */

import type { PresetTheme } from './presets';
import { generateThemePalettes, injectThemedCssVariables } from '../core'
import { getPresetTheme, presetThemes } from './presets'

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
  private systemThemeHandler?: (e: MediaQueryListEvent) => void
  private themeHistory: ThemeState[] = []  // 主题历史
  private maxHistorySize = 5  // 减少历史记录数以节省内存
  private themeRegistry = new Map<string, ThemeState>()  // 主题注册表
  private aiIntegration?: any  // AI集成实例
  private destroyed = false  // 标记是否已销毁
  private themeCache = new Map<string, ThemeState>()  // 简单缓存主题

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
   * 监听系统主题变化 - 修复内存泄漏
   */
  watchSystemTheme(callback: (mode: 'light' | 'dark') => void): () => void {
    // 清理之前的监听器
    this.cleanupSystemThemeWatcher()
    
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      this.systemThemeHandler = (e: MediaQueryListEvent) => {
        if (!this.destroyed) {
          callback(e.matches ? 'dark' : 'light')
        }
      }
      
      this.systemThemeMediaQuery.addEventListener('change', this.systemThemeHandler)
      
      // 返回清理函数
      return () => {
        this.cleanupSystemThemeWatcher()
      }
    }
    
    return () => {}
  }
  
  /**
   * 清理系统主题监听器
   */
  private cleanupSystemThemeWatcher(): void {
    if (this.systemThemeMediaQuery && this.systemThemeHandler) {
      this.systemThemeMediaQuery.removeEventListener('change', this.systemThemeHandler)
      this.systemThemeHandler = undefined
    }
  }

  /**
   * 下载主题配置文件 - 修复内存泄漏
   */
  downloadTheme(filename = 'theme.json'): void {
    if (typeof window === 'undefined' || !this.currentTheme) {
      throw new Error('Cannot download theme in non-browser environment or no theme set')
    }
    
    const blob = new Blob([this.exportTheme()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    
    try {
      a.href = url
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
    } finally {
      // 确保清理资源
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    }
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
   * 获取主题 - 优化内存使用，使用缓存
   */
  getTheme(name: string): ThemeState | undefined {
    // 先从缓存查找
    const cached = this.themeCache.get(name)
    if (cached) {
      return cached
    }
    
    // 从注册表查找
    if (this.themeRegistry.has(name)) {
      const theme = this.themeRegistry.get(name)
      if (theme) {
        // 存入缓存
        this.themeCache.set(name, theme)
        return theme
      }
    }
    
    // 再从预设主题查找
    const preset = getPresetTheme(name)
    if (preset) {
      const theme: ThemeState = {
        primaryColor: preset.color,
        themeName: preset.name,
        version: '1.0.0'
      }
      // 存入缓存
      this.themeCache.set(name, theme)
      return theme
    }
    
    return undefined
  }
  
  /**
   * 注册主题 - 优化内存使用
   */
  registerTheme(name: string, theme: ThemeState): void {
    // 限制注册表大小
    const MAX_REGISTRY_SIZE = 50
    if (this.themeRegistry.size >= MAX_REGISTRY_SIZE && !this.themeRegistry.has(name)) {
      // 删除最久未使用的主题
      const firstKey = this.themeRegistry.keys().next().value
      if (firstKey) {
        this.themeRegistry.delete(firstKey)
        this.themeCache.delete(firstKey)
      }
    }
    
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
   * 主题历史管理 - 优化内存使用
   */
  addToHistory(theme: ThemeState): void {
    // 避免重复添加相同主题
    const lastTheme = this.themeHistory[0]
    if (lastTheme && lastTheme.primaryColor === theme.primaryColor) {
      return
    }
    
    // 创建轻量级副本，只保留必要属性
    const lightTheme: ThemeState = {
      primaryColor: theme.primaryColor,
      themeName: theme.themeName,
      isDark: theme.isDark,
      updatedAt: theme.updatedAt
    }
    
    this.themeHistory.unshift(lightTheme)
    while (this.themeHistory.length > this.maxHistorySize) {
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
   * 集成AI配色建议 - 延迟加载，节省内存
   */
  async enableAIIntegration(apiKey?: string): Promise<void> {
    // 如果已销毁，不再加载
    if (this.destroyed) {
      return
    }
    
    // 避免重复加载
    if (this.aiIntegration) {
      return
    }
    
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
   * 批量导入主题 - 优化内存使用
   */
  importAllThemes(data: string): void {
    try {
      const themes = JSON.parse(data)
      
      if (themes.registry) {
        // 清理缓存以避免内存泄漏
        this.themeCache.clear()
        this.themeRegistry = new Map(themes.registry)
        this.saveThemeRegistry()
      }
      
      if (themes.history) {
        // 限制历史记录大小
        this.themeHistory = themes.history.slice(0, this.maxHistorySize)
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
  
  /**
   * 销毁主题管理器，清理所有资源
   */
  destroy(): void {
    this.destroyed = true
    
    // 清理系统主题监听器
    this.cleanupSystemThemeWatcher()
    
    // 清理监听器
    this.listeners.clear()
    
    // 清理AI集成
    if (this.aiIntegration && typeof this.aiIntegration.destroy === 'function') {
      this.aiIntegration.destroy()
    }
    this.aiIntegration = undefined
    
    // 清理主题历史
    this.themeHistory.length = 0  // 更高效的数组清空
    
    // 清理主题注册表
    this.themeRegistry.clear()
    
    // 清理主题缓存
    this.themeCache.clear()
    
    // 清理当前主题
    this.currentTheme = null
  }
}

// 创建默认实例
export const defaultThemeManager = new ThemeManager()

// 全局清理
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    defaultThemeManager.destroy()
  }, { once: true })
}

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