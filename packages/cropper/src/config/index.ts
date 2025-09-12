/**
 * @file 配置系统统一导出
 * @description 导出所有配置相关的类和接口
 */

// 导入所有管理器
import { ConfigManager } from './config-manager'
import { ThemeManager } from '../themes/theme-manager'
import { I18nManager } from '../i18n/i18n-manager'
import { PresetManager } from '../presets/preset-manager'

// 导出所有管理器
export { ConfigManager } from './config-manager'
export type { ConfigChangeEvent, ConfigValidationResult } from './config-manager'

export { ThemeManager } from '../themes/theme-manager'
export type { ThemeMode, ThemeVariables, BuiltinTheme } from '../themes/theme-manager'

export { I18nManager } from '../i18n/i18n-manager'
export type { MessageMap, LanguagePack, InterpolationParams } from '../i18n/i18n-manager'

export { PresetManager } from '../presets/preset-manager'
export type { PresetConfig, PresetCategory } from '../presets/preset-manager'

/**
 * 配置系统集成类
 * 统一管理所有配置相关的功能
 */
export class ConfigSystem {
  /** 配置管理器 */
  public readonly config: ConfigManager

  /** 主题管理器 */
  public readonly theme: ThemeManager

  /** 国际化管理器 */
  public readonly i18n: I18nManager

  /** 预设管理器 */
  public readonly preset: PresetManager

  /**
   * 构造函数
   * @param options 初始化选项
   */
  constructor(options: {
    config?: any
    theme?: any
    i18n?: any
  } = {}) {
    // 初始化各个管理器
    this.config = new ConfigManager(options.config)
    this.theme = new ThemeManager(options.theme)
    this.i18n = new I18nManager(options.i18n)
    this.preset = new PresetManager()

    // 设置管理器之间的联动
    this.setupInteractions()
  }

  /**
   * 设置管理器之间的交互
   */
  private setupInteractions(): void {
    // 配置变更时更新主题
    this.config.on('configChange:theme', (event) => {
      this.theme.setTheme(event.newValue)
    })

    // 配置变更时更新国际化
    this.config.on('configChange:i18n', (event) => {
      if (event.newValue.locale) {
        this.i18n.setLocale(event.newValue.locale)
      }
      if (event.newValue.fallbackLocale) {
        this.i18n.setFallbackLocale(event.newValue.fallbackLocale)
      }
    })

    // 主题变更时更新配置
    this.theme.on('themeChange', (event) => {
      this.config.set('theme', event.theme)
    })

    // 语言变更时更新配置
    this.i18n.on('localeChange', (event) => {
      this.config.set('i18n.locale', event.newLocale)
    })
  }

  /**
   * 应用预设配置
   * @param presetName 预设名称
   */
  applyPreset(presetName: string): void {
    const preset = this.preset.getPreset(presetName)
    if (!preset) {
      throw new Error(`Preset not found: ${presetName}`)
    }

    this.config.setMultiple(preset.options)
  }

  /**
   * 获取当前完整配置
   */
  getCurrentConfig(): any {
    return {
      ...this.config.getAll(),
      theme: this.theme.getTheme(),
      i18n: {
        locale: this.i18n.getLocale(),
        fallbackLocale: this.i18n.getFallbackLocale()
      }
    }
  }

  /**
   * 重置所有配置
   */
  resetAll(): void {
    this.config.reset()
    this.theme.setMode('light')
    this.i18n.setLocale('zh-CN')
  }

  /**
   * 导出所有配置
   */
  exportAll(): string {
    return JSON.stringify(this.getCurrentConfig(), null, 2)
  }

  /**
   * 导入配置
   * @param configJson 配置JSON字符串
   */
  importAll(configJson: string): void {
    try {
      const config = JSON.parse(configJson)

      if (config.theme) {
        this.theme.setTheme(config.theme)
        // 如果有模式设置，也要应用
        if (config.theme.mode) {
          this.theme.setMode(config.theme.mode)
        }
      }

      if (config.i18n) {
        if (config.i18n.locale) {
          this.i18n.setLocale(config.i18n.locale)
        }
        if (config.i18n.fallbackLocale) {
          this.i18n.setFallbackLocale(config.i18n.fallbackLocale)
        }
      }

      // 设置其他配置
      const { theme, i18n, ...otherConfig } = config
      this.config.setMultiple(otherConfig)

    } catch (error) {
      throw new Error('Invalid configuration JSON format')
    }
  }

  /**
   * 销毁配置系统
   */
  destroy(): void {
    this.config.destroy()
    this.theme.destroy()
    this.i18n.destroy()
    this.preset.destroy()
  }
}

/**
 * 默认导出配置系统
 */
export default ConfigSystem
