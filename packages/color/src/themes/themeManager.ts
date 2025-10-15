/**
 * 主题管理器 - 处理主题的应用、存储和恢复
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
}

const DEFAULT_STORAGE_KEY = 'ldesign-theme'
const DEFAULT_PREFIX = 'ld'

export class ThemeManager {
  private storageKey: string
  private prefix: string
  private currentTheme: ThemeState | null = null
  private listeners: Set<(theme: ThemeState) => void> = new Set()

  constructor(options: ThemeOptions = {}) {
    this.storageKey = options.storageKey || DEFAULT_STORAGE_KEY
    this.prefix = options.prefix || DEFAULT_PREFIX
    
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
    
    // 注入CSS变量到页面（包含light和dark模式）
    injectThemedCssVariables(themes, true)
    
    // 更新当前主题状态
    this.currentTheme = {
      primaryColor,
      themeName,
      prefix: options.prefix || this.prefix
    }
    
    // 保存到存储
    this.save(this.currentTheme)
    
    // 触发监听器
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
   * 保存主题到本地存储
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
   * 从本地存储恢复主题
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
   * 清除存储的主题
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
   * 添加主题变化监听器
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
   * 获取所有预设主题
   */
  getPresets(): PresetTheme[] {
    return presetThemes
  }
}

// 创建默认实例
export const defaultThemeManager = new ThemeManager()

/**
 * 快捷方法：应用主题
 */
export function applyTheme(colorOrName: string, options?: ThemeOptions): ThemeState {
  return defaultThemeManager.applyTheme(colorOrName, options)
}

/**
 * 快捷方法：应用预设主题
 */
export function applyPresetTheme(name: string, options?: ThemeOptions): ThemeState {
  return defaultThemeManager.applyPresetTheme(name, options)
}

/**
 * 快捷方法：恢复主题
 */
export function restoreTheme(): ThemeState | null {
  return defaultThemeManager.restore()
}

/**
 * 快捷方法：获取当前主题
 */
export function getCurrentTheme(): ThemeState | null {
  return defaultThemeManager.getCurrentTheme()
}