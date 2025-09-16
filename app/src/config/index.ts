/**
 * App Configuration Utilities
 * 
 * 应用配置工具函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { AppConfig, ConfigInput, ConfigFunction } from '../types/app-config'

/**
 * 默认配置
 */
const defaultConfig: Partial<AppConfig> = {
  version: '1.0.0',
  api: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 10000,
    retry: true,
    retryCount: 3,
    cache: true,
    cacheTime: 5 * 60 * 1000 // 5分钟
  },
  theme: {
    primaryColor: '#1677ff',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    darkMode: false
  },
  features: {
    devTools: true,
    mock: false,
    hotReload: true,
    errorBoundary: true,
    performance: false,
    analytics: false,
    pwa: false,
    offline: false
  },
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en', 'ja'],
    autoDetect: true,
    fallbackLocale: 'en',
    loadStrategy: 'lazy'
  },
  router: {
    mode: 'history',
    base: '/',
    strict: false,
    sensitive: false,
    scrollBehavior: 'auto'
  },
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: false,
    codeSplitting: true,
    treeShaking: true,
    bundleAnalyzer: false
  },
  security: {
    https: false,
    cors: true,
    xssProtection: true
  },
  log: {
    level: 'info',
    console: true,
    file: false,
    remote: false
  }
}

/**
 * 深度合并对象
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key]
      const targetValue = result[key]
      
      if (
        sourceValue && 
        typeof sourceValue === 'object' && 
        !Array.isArray(sourceValue) &&
        targetValue && 
        typeof targetValue === 'object' && 
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue)
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }
  
  return result
}

/**
 * 验证配置
 */
function validateConfig(config: AppConfig): void {
  // 必需字段验证
  if (!config.appName) {
    throw new Error('appName is required in app config')
  }
  
  if (!config.version) {
    throw new Error('version is required in app config')
  }
  
  // API 配置验证
  if (config.api?.baseUrl && !isValidUrl(config.api.baseUrl)) {
    throw new Error(`Invalid API baseUrl: ${config.api.baseUrl}`)
  }
  
  // 主题配置验证
  if (config.theme?.primaryColor && !isValidColor(config.theme.primaryColor)) {
    throw new Error(`Invalid primary color: ${config.theme.primaryColor}`)
  }
  
  // 国际化配置验证
  if (config.i18n?.defaultLocale && config.i18n.locales && !config.i18n.locales.includes(config.i18n.defaultLocale)) {
    throw new Error(`Default locale ${config.i18n.defaultLocale} is not in locales list`)
  }
}

/**
 * 验证 URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证颜色值
 */
function isValidColor(color: string): boolean {
  // 简单的颜色验证（支持 hex, rgb, rgba, hsl, hsla, 颜色名称）
  const colorRegex = /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-zA-Z]+).*$/
  return colorRegex.test(color)
}

/**
 * 定义应用配置
 * 
 * 提供类型安全的配置定义，支持智能提示和验证
 * 
 * @param config 配置对象或配置函数
 * @returns 处理后的配置对象
 * 
 * @example
 * ```typescript
 * import { defineConfig } from './defineConfig'
 * 
 * export default defineConfig({
 *   appName: 'My App',
 *   version: '1.0.0',
 *   api: {
 *     baseUrl: 'https://api.example.com'
 *   },
 *   theme: {
 *     primaryColor: '#1677ff'
 *   }
 * })
 * ```
 * 
 * @example
 * ```typescript
 * // 支持函数形式
 * export default defineConfig(() => ({
 *   appName: 'My App',
 *   version: process.env.APP_VERSION || '1.0.0',
 *   api: {
 *     baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api'
 *   }
 * }))
 * ```
 */
export function defineConfig(config: ConfigInput): AppConfig {
  // 处理函数形式的配置
  const resolvedConfig = typeof config === 'function' ? config() : config
  
  // 如果是 Promise，需要在运行时解析
  if (resolvedConfig instanceof Promise) {
    throw new Error('defineConfig does not support async functions. Use sync functions only.')
  }
  
  // 合并默认配置
  const mergedConfig = deepMerge(defaultConfig as AppConfig, resolvedConfig)
  
  // 验证配置
  try {
    validateConfig(mergedConfig)
  } catch (error) {
    console.error('App config validation failed:', error)
    throw error
  }
  
  return mergedConfig
}

/**
 * 异步定义应用配置
 * 
 * 支持异步配置函数
 * 
 * @param config 异步配置函数
 * @returns Promise<AppConfig>
 */
export async function defineConfigAsync(config: ConfigFunction): Promise<AppConfig> {
  const resolvedConfig = await config()
  const mergedConfig = deepMerge(defaultConfig as AppConfig, resolvedConfig)
  
  try {
    validateConfig(mergedConfig)
  } catch (error) {
    console.error('App config validation failed:', error)
    throw error
  }
  
  return mergedConfig
}

/**
 * 获取默认配置
 */
export function getDefaultConfig(): Partial<AppConfig> {
  return { ...defaultConfig }
}

/**
 * 创建配置模板
 */
export function createConfigTemplate(appName: string): AppConfig {
  return defineConfig({
    appName,
    version: '1.0.0',
    description: `${appName} - Built with LDesign`,
    api: {
      baseUrl: 'http://localhost:3000/api'
    },
    theme: {
      primaryColor: '#1677ff'
    },
    features: {
      devTools: true,
      mock: true
    }
  })
}

/**
 * 导出类型
 */
export type { AppConfig, ConfigInput, ConfigFunction } from '../types/app-config'
