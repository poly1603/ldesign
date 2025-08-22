/**
 * 引擎预设配置
 * 🎯 提供不同环境的预设配置，让开发者快速上手
 */

import type { CreateEngineOptions } from '../types'
import { createErrorManager } from '../errors/error-manager'
import { createLogger } from '../logger/logger'
import { commonMiddleware } from '../middleware/middleware-manager'

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
  const logger = createLogger('debug')

  return {
    config: {
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
      cache: {
        enabled: true,
        maxSize: 500,
        defaultTTL: 5 * 60 * 1000, // 5分钟
        strategy: 'lru',
        enableStats: true,
        cleanupInterval: 60000, // 1分钟
      },
      security: {
        xss: {
          enabled: true,
          allowedTags: ['b', 'i', 'em', 'strong', 'a', 'span', 'div', 'p'],
          allowedAttributes: {
            a: ['href', 'title', 'target'],
            img: ['src', 'alt', 'title'],
          },
        },
        csrf: {
          enabled: false, // 开发环境通常不需要CSRF保护
          tokenName: 'csrf-token',
          headerName: 'X-CSRF-Token',
        },
        csp: {
          enabled: false, // 开发环境通常不需要严格的CSP
          directives: {},
          reportOnly: true,
        },
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
    },
    enableAutoSave: true,
    autoSaveInterval: 10000, // 10秒
    middleware: [
      commonMiddleware.logger(logger),
      commonMiddleware.performance(logger),
      commonMiddleware.errorHandler(createErrorManager()),
    ],
  }
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
  return {
    config: {
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
      cache: {
        enabled: true,
        maxSize: 1000,
        defaultTTL: 30 * 60 * 1000, // 30分钟
        strategy: 'lru',
        enableStats: false,
        cleanupInterval: 300000, // 5分钟
      },
      security: {
        xss: {
          enabled: true,
          allowedTags: ['b', 'i', 'em', 'strong', 'a', 'span', 'div', 'p'],
          allowedAttributes: {
            a: ['href', 'title', 'target'],
            img: ['src', 'alt', 'title'],
          },
        },
        csrf: {
          enabled: true,
          tokenName: 'csrf-token',
          headerName: 'X-CSRF-Token',
        },
        csp: {
          enabled: true,
          directives: {
            'default-src': ['\'self\''],
            'script-src': ['\'self\''],
            'style-src': ['\'self\'', '\'unsafe-inline\''],
            'img-src': ['\'self\'', 'data:', 'https:'],
          },
          reportOnly: false,
        },
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
    },
    enableAutoSave: true,
    autoSaveInterval: 60000, // 1分钟
    middleware: [
      commonMiddleware.errorHandler(createErrorManager()),
      commonMiddleware.performance(createLogger('warn')),
    ],
  }
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
  const logger = createLogger('debug')

  return {
    config: {
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
        enableDevTools: false,
        enablePerformanceMonitoring: false,
        enableErrorReporting: true,
        enableSecurityProtection: false,
        enableCaching: false,
        enableNotifications: false,
      },
      logger: {
        level: 'debug',
        maxLogs: 100,
        enableConsole: true,
        enableStorage: false,
        storageKey: 'engine-logs-test',
        transports: ['console'],
      },
      cache: {
        enabled: false,
        maxSize: 0,
        defaultTTL: 0,
        strategy: 'lru',
        enableStats: false,
        cleanupInterval: 0,
      },
      security: {
        xss: {
          enabled: false,
          allowedTags: [],
          allowedAttributes: {},
        },
        csrf: {
          enabled: false,
          tokenName: 'csrf-token',
          headerName: 'X-CSRF-Token',
        },
        csp: {
          enabled: false,
          directives: {},
          reportOnly: true,
        },
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
        defaultPosition: 'top-right',
        defaultTheme: 'auto',
      },
    },
    enableAutoSave: false,
    autoSaveInterval: 0,
    middleware: [
      commonMiddleware.logger(logger),
    ],
  }
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
  return {
    config: {
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
      cache: {
        enabled: false,
        maxSize: 0,
        defaultTTL: 0,
        strategy: 'lru',
        enableStats: false,
        cleanupInterval: 0,
      },
      security: {
        xss: {
          enabled: false,
          allowedTags: [],
          allowedAttributes: {},
        },
        csrf: {
          enabled: false,
          tokenName: 'csrf-token',
          headerName: 'X-CSRF-Token',
        },
        csp: {
          enabled: false,
          directives: {},
          reportOnly: true,
        },
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
        defaultPosition: 'top-right',
        defaultTheme: 'auto',
      },
    },
    enableAutoSave: false,
    autoSaveInterval: 0,
    middleware: [],
  }
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
  return {
    config: {
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
      cache: {
        enabled: true,
        maxSize: 200, // 较小的缓存大小
        defaultTTL: 15 * 60 * 1000, // 15分钟
        strategy: 'lru',
        enableStats: false,
        cleanupInterval: 300000, // 5分钟
      },
      security: {
        xss: {
          enabled: true,
          allowedTags: ['b', 'i', 'em', 'strong', 'a', 'span'],
          allowedAttributes: {
            a: ['href', 'title'],
            img: ['src', 'alt'],
          },
        },
        csrf: {
          enabled: true,
          tokenName: 'csrf-token',
          headerName: 'X-CSRF-Token',
        },
        csp: {
          enabled: true,
          directives: {
            'default-src': ['\'self\''],
            'script-src': ['\'self\''],
            'style-src': ['\'self\''],
            'img-src': ['\'self\'', 'data:', 'https:'],
          },
          reportOnly: false,
        },
      },
      performance: {
        enabled: true,
        sampleRate: 0.05, // 5%采样率
        maxEntries: 50,
        thresholds: {
          responseTime: { good: 300, poor: 1500 },
          fps: { good: 30, poor: 15 },
          memory: { warning: 30, critical: 60 },
        },
      },
      notifications: {
        enabled: true,
        maxNotifications: 3,
        defaultDuration: 2000, // 2秒
        defaultPosition: 'top-center',
        defaultTheme: 'auto',
      },
    },
    enableAutoSave: true,
    autoSaveInterval: 120000, // 2分钟
    middleware: [
      commonMiddleware.errorHandler(createErrorManager()),
      commonMiddleware.performance(createLogger('warn')),
    ],
  }
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
  return {
    config: {
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
      cache: {
        enabled: true,
        maxSize: 2000,
        defaultTTL: 60 * 60 * 1000, // 1小时
        strategy: 'lru',
        enableStats: true,
        cleanupInterval: 600000, // 10分钟
      },
      security: {
        xss: {
          enabled: true,
          allowedTags: ['b', 'i', 'em', 'strong', 'a', 'span', 'div', 'p'],
          allowedAttributes: {
            a: ['href', 'title', 'target'],
            img: ['src', 'alt', 'title'],
          },
        },
        csrf: {
          enabled: true,
          tokenName: 'csrf-token',
          headerName: 'X-CSRF-Token',
        },
        csp: {
          enabled: true,
          directives: {
            'default-src': ['\'self\''],
            'script-src': ['\'self\''],
            'style-src': ['\'self\''],
            'img-src': ['\'self\'', 'https:'],
            'font-src': ['\'self\'', 'https:'],
            'connect-src': ['\'self\'', 'https:'],
          },
          reportOnly: false,
        },
      },
      performance: {
        enabled: true,
        sampleRate: 0.2, // 20%采样率
        maxEntries: 200,
        thresholds: {
          responseTime: { good: 150, poor: 800 },
          fps: { good: 60, poor: 30 },
          memory: { warning: 40, critical: 80 },
        },
      },
      notifications: {
        enabled: true,
        maxNotifications: 8,
        defaultDuration: 4000, // 4秒
        defaultPosition: 'top-right',
        defaultTheme: 'auto',
      },
    },
    enableAutoSave: true,
    autoSaveInterval: 300000, // 5分钟
    middleware: [
      commonMiddleware.errorHandler(createErrorManager()),
      commonMiddleware.performance(createLogger('info')),
      commonMiddleware.security(createLogger('info')),
    ],
  }
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

export default presets
