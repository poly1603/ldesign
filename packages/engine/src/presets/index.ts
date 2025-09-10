/**
 * 引擎预设配置
 * 🎯 提供不同环境的预设配置，让开发者快速上手
 */

import type { CreateEngineOptions } from '../types'
import { createErrorManager } from '../errors/error-manager'
import { createLogger } from '../logger/logger'
import { commonMiddleware } from '../middleware/middleware-manager'

// 导入类型
import type { PresetTemplate } from './types'

// 导出类型
export type { PresetTemplate } from './types'

/**
 * 创建预设配置的工厂函数
 * 🏭 统一配置创建逻辑，减少重复代码
 */
function createPresetConfig(
  template: PresetTemplate,
  overrides: Partial<CreateEngineOptions> = {}
): CreateEngineOptions {
  const baseConfig: CreateEngineOptions = {
    config: {
      app: template.app,
      environment: template.environment,
      debug: template.debug,
      features: template.features,
      logger: template.logger,
      cache: {
        enabled: template.features.enableCaching,
        maxSize:
          template.environment === 'development'
            ? 1000
            : template.environment === 'production'
              ? 500
              : 100,
        defaultTTL: template.environment === 'development' ? 600000 : 300000, // 开发环境10分钟，其他5分钟
        strategy: 'lru',
        enableStats: true,
        cleanupInterval: 60000, // 1分钟清理一次
      },
      security: {
        xss: {
          enabled: template.features.enableSecurityProtection,
          allowedTags: ['b', 'i', 'em', 'strong', 'a', 'span', 'div', 'p'],
          allowedAttributes: {
            a: ['href', 'title', 'target'],
            img: ['src', 'alt', 'title'],
          },
        },
        csrf: {
          enabled:
            template.environment === 'production' &&
            template.features.enableSecurityProtection,
          tokenName: 'csrf-token',
          headerName: 'X-CSRF-Token',
        },
        csp: {
          enabled:
            template.environment === 'production' &&
            template.features.enableSecurityProtection,
          directives: {},
          reportOnly: template.environment !== 'production',
        },
      },
      performance: template.performance,
      notifications: template.notifications,
      env: {},
      custom: {},
    },
    enableAutoSave: template.environment !== 'test',
    autoSaveInterval:
      template.environment === 'development'
        ? 30000
        : template.environment === 'production'
          ? 60000
          : 300000,
  }

  // 根据环境添加中间件
  const middleware = [commonMiddleware.errorHandler(createErrorManager())]

  if (template.features.enablePerformanceMonitoring) {
    const logLevel = template.debug ? 'debug' : 'info'
    middleware.push(commonMiddleware.performance(createLogger(logLevel)))
  }

  if (
    template.features.enableSecurityProtection &&
    template.environment === 'production'
  ) {
    middleware.push(commonMiddleware.security(createLogger('info')))
  }

  baseConfig.middleware = middleware

  // 应用覆盖配置
  const result = {
    ...baseConfig,
    ...overrides,
  }

  if (overrides.config) {
    result.config = {
      ...baseConfig.config,
      ...overrides.config,
    }
  }

  return result
}

/**
 * 开发环境预设配置
 * 🚀 专为开发环境优化，启用所有调试功能
 *
 * @returns 开发环境配置选项
 *
 * @example
 * ```typescript
 * import { presets } from '@ldesign/engine'
 *
 * const engine = createEngine(presets.development())
 * ```
 */
export function development(): CreateEngineOptions {
  const template: PresetTemplate = {
    app: {
      name: 'Development App',
      version: '1.0.0',
      description: '开发环境应用',
      author: 'Development Team',
    },
    environment: 'development',
    debug: true,
    features: {
      enableHotReload: true,
      enableDevTools: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      enableSecurityProtection: true,
      enableCaching: true,
      enableNotifications: true,
    },
    logger: {
      level: 'debug',
      maxLogs: 1000,
      enableConsole: true,
      enableStorage: true,
      storageKey: 'engine-logs-dev',
      transports: ['console', 'localStorage'],
    },
    performance: {
      enabled: true,
      sampleRate: 1.0, // 100%采样率
      maxEntries: 1000,
      thresholds: {
        responseTime: { good: 100, poor: 500 },
        fps: { good: 60, poor: 30 },
        memory: { warning: 100, critical: 200 },
      },
    },
    notifications: {
      enabled: true,
      maxNotifications: 10,
      defaultDuration: 5000, // 5秒
      defaultPosition: 'top-right',
      defaultTheme: 'auto',
    },
  }

  return createPresetConfig(template)
}

/**
 * 生产环境预设配置
 * 🏭 专为生产环境优化，注重性能和安全性
 *
 * @returns 生产环境配置选项
 *
 * @example
 * ```typescript
 * import { presets } from '@ldesign/engine'
 *
 * const engine = createEngine(presets.production())
 * ```
 */
export function production(): CreateEngineOptions {
  const template: PresetTemplate = {
    app: {
      name: 'Production App',
      version: '1.0.0',
      description: '生产环境应用',
      author: 'Production Team',
    },
    environment: 'production',
    debug: false,
    features: {
      enableHotReload: false,
      enableDevTools: false,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      enableSecurityProtection: true,
      enableCaching: true,
      enableNotifications: true,
    },
    logger: {
      level: 'warn',
      maxLogs: 500,
      enableConsole: false,
      enableStorage: true,
      storageKey: 'engine-logs-prod',
      transports: ['localStorage'],
    },
    performance: {
      enabled: true,
      sampleRate: 0.1, // 10%采样率
      maxEntries: 100,
      thresholds: {
        responseTime: { good: 200, poor: 1000 },
        fps: { good: 60, poor: 30 },
        memory: { warning: 50, critical: 100 },
      },
    },
    notifications: {
      enabled: true,
      maxNotifications: 5,
      defaultDuration: 3000, // 3秒
      defaultPosition: 'top-center',
      defaultTheme: 'auto',
    },
  }

  return createPresetConfig(template)
}

/**
 * 测试环境预设配置
 * 🧪 专为测试环境优化，启用测试相关功能
 *
 * @returns 测试环境配置选项
 *
 * @example
 * ```typescript
 * import { presets } from '@ldesign/engine'
 *
 * const engine = createEngine(presets.test())
 * ```
 */
export function test(): CreateEngineOptions {
  const template: PresetTemplate = {
    app: {
      name: 'Test App',
      version: '1.0.0',
      description: '测试环境应用',
      author: 'Test Team',
    },
    environment: 'test',
    debug: true,
    features: {
      enableHotReload: false,
      enableDevTools: true,
      enablePerformanceMonitoring: false,
      enableErrorReporting: true,
      enableSecurityProtection: false,
      enableCaching: false,
      enableNotifications: false,
    },
    logger: {
      level: 'debug',
      maxLogs: 500,
      enableConsole: true,
      enableStorage: false,
      storageKey: 'engine-logs-test',
      transports: ['console'],
    },
    performance: {
      enabled: false,
      sampleRate: 1.0,
      maxEntries: 100,
      thresholds: {
        responseTime: { good: 100, poor: 500 },
        fps: { good: 60, poor: 30 },
        memory: { warning: 100, critical: 200 },
      },
    },
    notifications: {
      enabled: false,
      maxNotifications: 5,
      defaultDuration: 1000, // 1秒
      defaultPosition: 'top-center',
      defaultTheme: 'auto',
    },
  }

  return createPresetConfig(template, {
    enableAutoSave: false, // 测试环境不需要自动保存
  })
}

/**
 * 最小配置预设
 * 🎯 提供最基本的配置，适合轻量级应用
 *
 * @returns 最小配置选项
 *
 * @example
 * ```typescript
 * import { presets } from '@ldesign/engine'
 *
 * const engine = createEngine(presets.minimal())
 * ```
 */
export function minimal(): CreateEngineOptions {
  const template: PresetTemplate = {
    app: {
      name: 'Minimal App',
      version: '1.0.0',
      description: '最小配置应用',
      author: 'Minimal Team',
    },
    environment: 'production',
    debug: false,
    features: {
      enableHotReload: false,
      enableDevTools: false,
      enablePerformanceMonitoring: false,
      enableErrorReporting: false,
      enableSecurityProtection: false,
      enableCaching: false,
      enableNotifications: false,
    },
    logger: {
      level: 'error',
      maxLogs: 100,
      enableConsole: true,
      enableStorage: false,
      storageKey: 'engine-logs-minimal',
      transports: ['console'],
    },
    performance: {
      enabled: false,
      sampleRate: 0,
      maxEntries: 0,
      thresholds: {
        responseTime: { good: 0, poor: 0 },
        fps: { good: 0, poor: 0 },
        memory: { warning: 0, critical: 0 },
      },
    },
    notifications: {
      enabled: false,
      maxNotifications: 0,
      defaultDuration: 0,
      defaultPosition: 'top-center',
      defaultTheme: 'auto',
    },
  }

  return createPresetConfig(template, {
    enableAutoSave: false,
    autoSaveInterval: 0,
    middleware: [], // 最小配置不使用中间件
  })
}

/**
 * 移动端优化预设配置
 * 📱 专为移动端应用优化，注重性能和电池寿命
 *
 * @returns 移动端优化配置选项
 *
 * @example
 * ```typescript
 * import { presets } from '@ldesign/engine'
 *
 * const engine = createEngine(presets.mobile())
 * ```
 */
export function mobile(): CreateEngineOptions {
  const template: PresetTemplate = {
    app: {
      name: 'Mobile App',
      version: '1.0.0',
      description: '移动端应用',
      author: 'Mobile Team',
    },
    environment: 'production',
    debug: false,
    features: {
      enableHotReload: false,
      enableDevTools: false,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      enableSecurityProtection: true,
      enableCaching: true,
      enableNotifications: true,
    },
    logger: {
      level: 'warn',
      maxLogs: 200,
      enableConsole: false,
      enableStorage: true,
      storageKey: 'engine-logs-mobile',
      transports: ['localStorage'],
    },
    performance: {
      enabled: true,
      sampleRate: 0.05, // 5%采样率，节省电池
      maxEntries: 50,
      thresholds: {
        responseTime: { good: 300, poor: 1500 },
        fps: { good: 30, poor: 15 }, // 移动端较低的FPS要求
        memory: { warning: 30, critical: 60 }, // 移动端内存限制更严格
      },
    },
    notifications: {
      enabled: true,
      maxNotifications: 3, // 移动端显示更少通知
      defaultDuration: 2000, // 2秒，更短的显示时间
      defaultPosition: 'top-center',
      defaultTheme: 'auto',
    },
  }

  return createPresetConfig(template, {
    autoSaveInterval: 120000, // 2分钟，减少频繁保存
  })
}

/**
 * 企业级应用预设配置
 * 🏢 专为企业级应用优化，注重安全性和可维护性
 *
 * @returns 企业级应用配置选项
 *
 * @example
 * ```typescript
 * import { presets } from '@ldesign/engine'
 *
 * const engine = createEngine(presets.enterprise())
 * ```
 */
export function enterprise(): CreateEngineOptions {
  const template: PresetTemplate = {
    app: {
      name: 'Enterprise App',
      version: '1.0.0',
      description: '企业级应用',
      author: 'Enterprise Team',
    },
    environment: 'production',
    debug: false,
    features: {
      enableHotReload: false,
      enableDevTools: false,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      enableSecurityProtection: true,
      enableCaching: true,
      enableNotifications: true,
    },
    logger: {
      level: 'info',
      maxLogs: 2000,
      enableConsole: false,
      enableStorage: true,
      storageKey: 'engine-logs-enterprise',
      transports: ['localStorage'],
    },
    performance: {
      enabled: true,
      sampleRate: 0.2, // 20%采样率，企业级需要更多监控
      maxEntries: 500,
      thresholds: {
        responseTime: { good: 150, poor: 800 },
        fps: { good: 60, poor: 30 },
        memory: { warning: 80, critical: 150 },
      },
    },
    notifications: {
      enabled: true,
      maxNotifications: 8,
      defaultDuration: 4000, // 4秒
      defaultPosition: 'top-right',
      defaultTheme: 'auto',
    },
  }

  return createPresetConfig(template, {
    autoSaveInterval: 300000, // 5分钟，企业级应用更频繁保存
  })
}

/**
 * 预设配置集合
 * 📚 提供所有可用的预设配置
 */
export const presets = {
  development,
  production,
  test,
  minimal,
  mobile,
  enterprise,
} as const
