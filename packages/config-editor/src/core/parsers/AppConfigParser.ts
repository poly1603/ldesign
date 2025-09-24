/**
 * App 配置解析器
 * 
 * 专门用于解析和处理 app.config.ts 文件
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { FilePath, OperationResult, ValidationResult } from '../../types/common'
import type { AppConfig } from '../../types/config'
import type { AppConfigParser as IAppConfigParser } from '../../types/parser'
import { BaseConfigParser } from './BaseConfigParser'
import { DEFAULT_APP_CONFIG } from '../../constants/defaults'
import { validateAppConfig, validateUrl, validateColor } from '../../utils/validation'

/**
 * App 配置解析器实现
 * 
 * 提供 app.config.ts 文件的解析、验证和保存功能
 */
export class AppConfigParser extends BaseConfigParser<AppConfig> implements IAppConfigParser {
  
  /**
   * 解析 app.config.ts 文件
   * @param filePath 文件路径
   * @returns 解析结果
   */
  async parseAppConfig(filePath: FilePath): Promise<OperationResult<AppConfig>> {
    return this.parse(filePath, { validate: true })
  }
  
  /**
   * 生成 app.config.ts 文件内容
   * @param config 配置对象
   * @returns 生成的文件内容
   */
  generateConfigFile(config: AppConfig): string {
    const configJson = JSON.stringify(config, null, 2)
    
    return `import { defineConfig } from '@/config'

export default defineConfig(${configJson})
`
  }
  
  /**
   * 验证 App 配置
   * @param config 配置对象
   * @returns 验证结果
   */
  async validate(config: AppConfig): Promise<ValidationResult> {
    const errors: string[] = []
    
    // 使用通用验证函数
    const baseValidation = validateAppConfig(config)
    errors.push(...baseValidation.errors)
    
    // 额外的自定义验证
    this.validateApiConfig(config, errors)
    this.validateThemeConfig(config, errors)
    this.validateI18nConfig(config, errors)
    this.validateRouterConfig(config, errors)
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  /**
   * 获取默认 App 配置
   * @returns 默认配置对象
   */
  getDefaultConfig(): AppConfig {
    return { ...DEFAULT_APP_CONFIG }
  }
  
  /**
   * 获取配置类型
   * @returns 配置类型
   */
  protected getConfigType(): 'app' {
    return 'app'
  }
  
  /**
   * 验证 API 配置
   * @param config 配置对象
   * @param errors 错误列表
   */
  private validateApiConfig(config: AppConfig, errors: string[]): void {
    if (!config.api) return
    
    const { api } = config
    
    // 验证基础 URL
    if (api.baseUrl) {
      const urlValidation = validateUrl(api.baseUrl)
      if (!urlValidation.valid) {
        errors.push(...urlValidation.errors.map(err => `api.baseUrl: ${err}`))
      }
    }
    
    // 验证超时时间
    if (api.timeout !== undefined) {
      if (typeof api.timeout !== 'number' || api.timeout <= 0) {
        errors.push('api.timeout: 超时时间必须是正数')
      }
    }
    
    // 验证重试次数
    if (api.retryCount !== undefined) {
      if (typeof api.retryCount !== 'number' || api.retryCount < 0) {
        errors.push('api.retryCount: 重试次数必须是非负整数')
      }
    }
    
    // 验证缓存时间
    if (api.cacheTime !== undefined) {
      if (typeof api.cacheTime !== 'number' || api.cacheTime < 0) {
        errors.push('api.cacheTime: 缓存时间必须是非负数')
      }
    }
  }
  
  /**
   * 验证主题配置
   * @param config 配置对象
   * @param errors 错误列表
   */
  private validateThemeConfig(config: AppConfig, errors: string[]): void {
    if (!config.theme) return
    
    const { theme } = config
    
    // 验证主色调
    if (theme.primaryColor) {
      const colorValidation = validateColor(theme.primaryColor)
      if (!colorValidation.valid) {
        errors.push(...colorValidation.errors.map(err => `theme.primaryColor: ${err}`))
      }
    }
    
    // 验证边框圆角
    if (theme.borderRadius !== undefined) {
      if (typeof theme.borderRadius !== 'string' || theme.borderRadius.trim().length === 0) {
        errors.push('theme.borderRadius: 边框圆角不能为空')
      }
    }
    
    // 验证字体大小
    if (theme.fontSize !== undefined) {
      if (typeof theme.fontSize !== 'string' || theme.fontSize.trim().length === 0) {
        errors.push('theme.fontSize: 字体大小不能为空')
      }
    }
    
    // 验证字体族
    if (theme.fontFamily !== undefined) {
      if (typeof theme.fontFamily !== 'string' || theme.fontFamily.trim().length === 0) {
        errors.push('theme.fontFamily: 字体族不能为空')
      }
    }
  }
  
  /**
   * 验证国际化配置
   * @param config 配置对象
   * @param errors 错误列表
   */
  private validateI18nConfig(config: AppConfig, errors: string[]): void {
    if (!config.i18n) return
    
    const { i18n } = config
    
    // 验证默认语言
    if (!i18n.defaultLocale || i18n.defaultLocale.trim().length === 0) {
      errors.push('i18n.defaultLocale: 默认语言不能为空')
    }
    
    // 验证支持的语言列表
    if (!Array.isArray(i18n.locales) || i18n.locales.length === 0) {
      errors.push('i18n.locales: 支持的语言列表不能为空')
    } else {
      // 检查默认语言是否在支持列表中
      if (!i18n.locales.includes(i18n.defaultLocale)) {
        errors.push('i18n.defaultLocale: 默认语言必须在支持的语言列表中')
      }
      
      // 检查回退语言是否在支持列表中
      if (i18n.fallbackLocale && !i18n.locales.includes(i18n.fallbackLocale)) {
        errors.push('i18n.fallbackLocale: 回退语言必须在支持的语言列表中')
      }
    }
    
    // 验证加载策略
    if (i18n.loadStrategy !== undefined) {
      const validStrategies = ['eager', 'lazy']
      if (!validStrategies.includes(i18n.loadStrategy)) {
        errors.push('i18n.loadStrategy: 加载策略必须是 "eager" 或 "lazy"')
      }
    }
  }
  
  /**
   * 验证路由配置
   * @param config 配置对象
   * @param errors 错误列表
   */
  private validateRouterConfig(config: AppConfig, errors: string[]): void {
    if (!config.router) return
    
    const { router } = config
    
    // 验证路由模式
    const validModes = ['hash', 'history']
    if (!validModes.includes(router.mode)) {
      errors.push('router.mode: 路由模式必须是 "hash" 或 "history"')
    }
    
    // 验证基础路径
    if (router.base !== undefined) {
      if (typeof router.base !== 'string') {
        errors.push('router.base: 基础路径必须是字符串')
      } else if (!router.base.startsWith('/')) {
        errors.push('router.base: 基础路径必须以 "/" 开头')
      }
    }
    
    // 验证滚动行为
    if (router.scrollBehavior !== undefined) {
      const validBehaviors = ['auto', 'smooth', 'instant']
      if (!validBehaviors.includes(router.scrollBehavior)) {
        errors.push('router.scrollBehavior: 滚动行为必须是 "auto"、"smooth" 或 "instant"')
      }
    }
  }
  
  /**
   * 创建默认的 App 配置
   * @param appName 应用名称
   * @param options 其他选项
   * @returns 默认配置
   */
  createDefaultConfig(
    appName: string,
    options: {
      version?: string
      description?: string
      author?: string
    } = {}
  ): AppConfig {
    const defaultConfig = this.getDefaultConfig()
    
    return {
      ...defaultConfig,
      appName,
      version: options.version || '1.0.0',
      description: options.description || `${appName} - Built with LDesign`,
      author: options.author || 'LDesign Team'
    }
  }
  
  /**
   * 更新 API 配置
   * @param config 当前配置
   * @param apiConfig 新的 API 配置
   * @returns 更新后的配置
   */
  updateApiConfig(
    config: AppConfig, 
    apiConfig: Partial<AppConfig['api']>
  ): AppConfig {
    return {
      ...config,
      api: {
        ...config.api,
        ...apiConfig
      }
    }
  }
  
  /**
   * 更新主题配置
   * @param config 当前配置
   * @param themeConfig 新的主题配置
   * @returns 更新后的配置
   */
  updateThemeConfig(
    config: AppConfig, 
    themeConfig: Partial<AppConfig['theme']>
  ): AppConfig {
    return {
      ...config,
      theme: {
        ...config.theme,
        ...themeConfig
      }
    }
  }
  
  /**
   * 更新功能特性配置
   * @param config 当前配置
   * @param featuresConfig 新的功能特性配置
   * @returns 更新后的配置
   */
  updateFeaturesConfig(
    config: AppConfig, 
    featuresConfig: Partial<AppConfig['features']>
  ): AppConfig {
    return {
      ...config,
      features: {
        ...config.features,
        ...featuresConfig
      }
    }
  }
}
