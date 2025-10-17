/**
 * 统一配置管理中心
 * 集中管理所有配置，提供类型安全和验证
 */

import { computed, ref, type Ref } from 'vue'
import type { 
  AppConfig, 
  EngineConfig, 
  I18nConfig, 
  RouterConfig,
  ThemeConfig,
  SizeConfig 
} from './types'

// 导出配置类型定义
export * from './types'

/**
 * 配置管理器类
 */
class ConfigManager {
  private readonly configs = new Map<string, any>()
  private readonly validators = new Map<string, (config: any) => boolean>()
  
  /**
   * 注册配置
   */
  register<T>(key: string, config: T, validator?: (config: T) => boolean): void {
    if (validator && !validator(config)) {
      throw new Error(`Invalid configuration for key: ${key}`)
    }
    this.configs.set(key, config)
    if (validator) {
      this.validators.set(key, validator)
    }
  }
  
  /**
   * 获取配置
   */
  get<T>(key: string): T {
    if (!this.configs.has(key)) {
      throw new Error(`Configuration not found for key: ${key}`)
    }
    return this.configs.get(key)
  }
  
  /**
   * 更新配置
   */
  update<T>(key: string, updates: Partial<T>): void {
    const current = this.get<T>(key)
    const updated = { ...current, ...updates }
    
    const validator = this.validators.get(key)
    if (validator && !validator(updated)) {
      throw new Error(`Invalid configuration update for key: ${key}`)
    }
    
    this.configs.set(key, updated)
  }
  
  /**
   * 获取所有配置
   */
  getAll(): Record<string, any> {
    return Object.fromEntries(this.configs)
  }
  
  /**
   * 导出配置（用于调试）
   */
  export(): string {
    return JSON.stringify(this.getAll(), null, 2)
  }
}

// 创建全局配置管理器实例
export const configManager = new ConfigManager()

/**
 * 配置组合器 - 智能合并多个配置源
 */
export function createUnifiedConfig() {
  // 基础配置
  const baseConfig: AppConfig = {
    name: 'LDesign Simple App',
    version: '1.0.0',
    description: 'Modern Vue 3 Application with LDesign',
    author: 'LDesign Team',
    debug: import.meta.env.DEV,
    environment: import.meta.env.MODE as 'development' | 'production' | 'test',
    
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 30000,
      retries: 3,
      headers: {}
    },
    
    storage: {
      prefix: 'ldesign_',
      expire: 7 * 24 * 60 * 60 * 1000,
      encrypt: false
    }
  }
  
  // 引擎配置（优化版）
  const engineConfig: EngineConfig = {
    name: `${baseConfig.name} Engine`,
    version: baseConfig.version,
    debug: baseConfig.debug,
    environment: baseConfig.environment,
    
    features: {
      hotReload: true,
      devTools: baseConfig.debug,
      performanceMonitoring: !baseConfig.debug,
      errorReporting: true,
      securityProtection: baseConfig.environment === 'production',
      caching: true,
      notifications: false,
      analytics: baseConfig.environment === 'production'
    },
    
    plugins: {
      autoLoad: true,
      lazyLoad: true,
      preload: ['router', 'i18n']
    },
    
    performance: {
      enabled: !baseConfig.debug,
      sampleRate: 0.1,
      slowThreshold: 1000,
      memoryWarningThreshold: 100 * 1024 * 1024 // 100MB
    },
    
    logger: {
      enabled: true,
      level: baseConfig.debug ? 'debug' : 'warn',
      maxLogs: 1000,
      persistLogs: baseConfig.debug,
      remoteLogging: baseConfig.environment === 'production'
    }
  }
  
  // 注册配置
  configManager.register('app', baseConfig)
  configManager.register('engine', engineConfig)
  
  return {
    app: baseConfig,
    engine: engineConfig,
    configManager
  }
}

/**
 * 配置热更新支持（开发环境）
 */
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('🔄 Configuration updated')
  })
}