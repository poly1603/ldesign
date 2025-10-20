/**
 * 统一配置管理系统
 * 集中管理编辑器的所有配置：图标、主题、语言等
 */

import { EventEmitter } from '../core/EventEmitter'
import { IconManager, getIconManager, type IconManagerConfig } from '../icons/IconManager'
import { ThemeManager, getThemeManager, type Theme } from '../theme'
import { I18nManager, getI18n, type I18nConfig } from '../i18n'
import type { IconSetType } from '../icons/types'

/**
 * 编辑器配置接口
 */
export interface EditorConfig {
  // 图标配置
  icons?: IconManagerConfig
  
  // 主题配置
  theme?: {
    defaultTheme?: string
    customThemes?: Theme[]
    followSystem?: boolean
  }
  
  // 多语言配置
  i18n?: Partial<I18nConfig>
  
  // 其他配置
  autoSave?: boolean
  autoSaveInterval?: number
  spellCheck?: boolean
  readOnly?: boolean
}

/**
 * 配置管理器
 * 提供统一的接口来管理编辑器的所有配置
 */
export class ConfigManager extends EventEmitter {
  private config: EditorConfig = {}
  private iconManager: IconManager
  private themeManager: ThemeManager
  private i18nManager: I18nManager
  
  constructor(config: EditorConfig = {}) {
    super()
    this.config = config
    
    // 初始化图标管理器
    this.iconManager = getIconManager(config.icons)
    
    // 初始化主题管理器
    this.themeManager = getThemeManager()
    if (config.theme) {
      // 添加自定义主题
      if (config.theme.customThemes) {
        config.theme.customThemes.forEach(theme => {
          this.themeManager.addCustomTheme(theme)
        })
      }
      
      // 设置默认主题
      if (config.theme.defaultTheme) {
        this.themeManager.setTheme(config.theme.defaultTheme)
      }
      
      // 跟随系统主题
      if (config.theme.followSystem) {
        this.themeManager.followSystemTheme()
      }
    }
    
    // 初始化多语言管理器
    this.i18nManager = getI18n(config.i18n)
    
    // 监听各管理器的变化
    this.setupListeners()
  }
  
  /**
   * 设置监听器
   */
  private setupListeners(): void {
    // 监听图标集变化
    this.iconManager.on('iconset:changed', (data: any) => {
      this.emit('config:changed', {
        type: 'icons',
        oldValue: data.oldSet,
        newValue: data.newSet
      })
    })
    
    // 监听主题变化
    this.themeManager.on('themeChange', (data: any) => {
      this.emit('config:changed', {
        type: 'theme',
        oldValue: data.oldTheme,
        newValue: data.newTheme
      })
    })
    
    // 监听语言变化
    this.i18nManager.on('localeChange', (data: any) => {
      this.emit('config:changed', {
        type: 'locale',
        oldValue: data.oldLocale,
        newValue: data.newLocale
      })
    })
  }
  
  /**
   * 获取图标管理器
   */
  getIconManager(): IconManager {
    return this.iconManager
  }
  
  /**
   * 获取主题管理器
   */
  getThemeManager(): ThemeManager {
    return this.themeManager
  }
  
  /**
   * 获取多语言管理器
   */
  getI18nManager(): I18nManager {
    return this.i18nManager
  }
  
  /**
   * 设置图标集
   */
  setIconSet(set: IconSetType): void {
    this.iconManager.setDefaultIconSet(set)
  }
  
  /**
   * 获取当前图标集
   */
  getIconSet(): IconSetType {
    return this.iconManager.getCurrentIconSet()
  }
  
  /**
   * 获取可用图标集
   */
  getAvailableIconSets(): IconSetType[] {
    return this.iconManager.getAvailableIconSets()
  }
  
  /**
   * 设置主题
   */
  setTheme(themeName: string): void {
    this.themeManager.setTheme(themeName)
  }
  
  /**
   * 获取当前主题
   */
  getTheme(): Theme | undefined {
    return this.themeManager.getCurrentTheme()
  }
  
  /**
   * 获取可用主题
   */
  getAvailableThemes(): string[] {
    return this.themeManager.getAvailableThemes()
  }
  
  /**
   * 添加自定义主题
   */
  addTheme(theme: Theme): void {
    this.themeManager.addCustomTheme(theme)
  }
  
  /**
   * 设置语言
   */
  async setLocale(locale: string): Promise<void> {
    await this.i18nManager.setLocale(locale)
  }
  
  /**
   * 获取当前语言
   */
  getLocale(): string {
    return this.i18nManager.getLocale()
  }
  
  /**
   * 获取可用语言
   */
  getAvailableLocales(): string[] {
    return this.i18nManager.getAvailableLocales()
  }
  
  /**
   * 翻译
   */
  t(key: string, params?: Record<string, any>): string {
    return this.i18nManager.t(key, params)
  }
  
  /**
   * 更新配置
   */
  updateConfig(config: Partial<EditorConfig>): void {
    this.config = { ...this.config, ...config }
    this.emit('config:updated', this.config)
  }
  
  /**
   * 获取完整配置
   */
  getConfig(): EditorConfig {
    return { ...this.config }
  }
  
  /**
   * 导出配置（用于保存）
   */
  exportConfig(): string {
    const exportData = {
      iconSet: this.getIconSet(),
      theme: this.themeManager.getCurrentThemeName(),
      locale: this.getLocale(),
      ...this.config
    }
    return JSON.stringify(exportData, null, 2)
  }
  
  /**
   * 导入配置（用于恢复）
   */
  importConfig(configJson: string): void {
    try {
      const importData = JSON.parse(configJson)
      
      if (importData.iconSet) {
        this.setIconSet(importData.iconSet)
      }
      
      if (importData.theme) {
        this.setTheme(importData.theme)
      }
      
      if (importData.locale) {
        this.setLocale(importData.locale)
      }
      
      this.updateConfig(importData)
    } catch (error) {
      console.error('导入配置失败:', error)
      throw new Error('无效的配置文件')
    }
  }
  
  /**
   * 重置为默认配置
   */
  reset(): void {
    this.setIconSet('lucide')
    this.setTheme('light')
    this.setLocale('zh-CN')
    this.config = {}
    this.emit('config:reset')
  }
  
  /**
   * 销毁
   */
  destroy(): void {
    this.iconManager.destroy()
    this.removeAllListeners()
  }
}

// 全局单例
let globalConfigManager: ConfigManager | null = null

/**
 * 获取全局配置管理器
 */
export function getConfigManager(config?: EditorConfig): ConfigManager {
  if (!globalConfigManager) {
    globalConfigManager = new ConfigManager(config)
  }
  return globalConfigManager
}

/**
 * 重置全局配置管理器
 */
export function resetConfigManager(): void {
  if (globalConfigManager) {
    globalConfigManager.destroy()
    globalConfigManager = null
  }
}






