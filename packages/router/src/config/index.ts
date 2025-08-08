/**
 * 配置管理模块
 *
 * 提供路由器的配置管理功能
 */

import type {
  PreloadStrategy,
  RouteCacheConfig,
  RouterOptions,
  RouteTransition,
} from '../types'

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  linkActiveClass: 'router-link-active',
  linkExactActiveClass: 'router-link-exact-active',
  preloadStrategy: 'none' as PreloadStrategy,
  performance: false,
  sensitive: false,
  strict: false,
  cache: {
    max: 10,
    ttl: 5 * 60 * 1000, // 5分钟
    include: [],
    exclude: [],
  } as RouteCacheConfig,
  transition: {
    name: 'fade',
    mode: 'out-in',
    appear: true,
    duration: 300,
  } as RouteTransition,
}

/**
 * 配置验证器
 */
export class ConfigValidator {
  /**
   * 验证路由器选项
   */
  static validateRouterOptions(options: RouterOptions): string[] {
    const errors: string[] = []

    if (!options.history) {
      errors.push('history is required')
    }

    if (!options.routes || !Array.isArray(options.routes)) {
      errors.push('routes must be an array')
    }

    if (
      options.linkActiveClass &&
      typeof options.linkActiveClass !== 'string'
    ) {
      errors.push('linkActiveClass must be a string')
    }

    if (
      options.linkExactActiveClass &&
      typeof options.linkExactActiveClass !== 'string'
    ) {
      errors.push('linkExactActiveClass must be a string')
    }

    if (
      options.preloadStrategy &&
      !['none', 'hover', 'visible', 'immediate'].includes(
        options.preloadStrategy
      )
    ) {
      errors.push(
        'preloadStrategy must be one of: none, hover, visible, immediate'
      )
    }

    if (options.cache) {
      const cacheErrors = this.validateCacheConfig(options.cache)
      errors.push(...cacheErrors)
    }

    return errors
  }

  /**
   * 验证缓存配置
   */
  static validateCacheConfig(config: RouteCacheConfig): string[] {
    const errors: string[] = []

    if (
      config.max !== undefined &&
      (typeof config.max !== 'number' || config.max < 0)
    ) {
      errors.push('cache.max must be a non-negative number')
    }

    if (
      config.ttl !== undefined &&
      (typeof config.ttl !== 'number' || config.ttl < 0)
    ) {
      errors.push('cache.ttl must be a non-negative number')
    }

    if (config.include !== undefined && !Array.isArray(config.include)) {
      errors.push('cache.include must be an array')
    }

    if (config.exclude !== undefined && !Array.isArray(config.exclude)) {
      errors.push('cache.exclude must be an array')
    }

    return errors
  }

  /**
   * 验证过渡配置
   */
  static validateTransitionConfig(config: RouteTransition): string[] {
    const errors: string[] = []

    if (config.name !== undefined && typeof config.name !== 'string') {
      errors.push('transition.name must be a string')
    }

    if (
      config.mode !== undefined &&
      !['in-out', 'out-in', 'default'].includes(config.mode)
    ) {
      errors.push('transition.mode must be one of: in-out, out-in, default')
    }

    if (config.appear !== undefined && typeof config.appear !== 'boolean') {
      errors.push('transition.appear must be a boolean')
    }

    if (config.duration !== undefined) {
      if (typeof config.duration === 'number') {
        if (config.duration < 0) {
          errors.push('transition.duration must be non-negative')
        }
      } else if (typeof config.duration === 'object') {
        if (
          typeof config.duration.enter !== 'number' ||
          config.duration.enter < 0
        ) {
          errors.push('transition.duration.enter must be a non-negative number')
        }
        if (
          typeof config.duration.leave !== 'number' ||
          config.duration.leave < 0
        ) {
          errors.push('transition.duration.leave must be a non-negative number')
        }
      } else {
        errors.push(
          'transition.duration must be a number or object with enter/leave properties'
        )
      }
    }

    return errors
  }
}

/**
 * 配置合并器
 */
export class ConfigMerger {
  /**
   * 合并路由器选项
   */
  static mergeRouterOptions(
    userOptions: Partial<RouterOptions>
  ): RouterOptions {
    const merged = {
      ...DEFAULT_CONFIG,
      ...userOptions,
    } as RouterOptions

    // 深度合并缓存配置
    if (userOptions.cache) {
      merged.cache = {
        ...DEFAULT_CONFIG.cache,
        ...userOptions.cache,
      }
    }

    // 深度合并过渡配置
    if (userOptions.transition) {
      merged.transition = {
        ...DEFAULT_CONFIG.transition,
        ...userOptions.transition,
      }
    }

    return merged
  }

  /**
   * 合并缓存配置
   */
  static mergeCacheConfig(
    userConfig: Partial<RouteCacheConfig>
  ): RouteCacheConfig {
    return {
      ...DEFAULT_CONFIG.cache,
      ...userConfig,
    }
  }

  /**
   * 合并过渡配置
   */
  static mergeTransitionConfig(
    userConfig: Partial<RouteTransition>
  ): RouteTransition {
    return {
      ...DEFAULT_CONFIG.transition,
      ...userConfig,
    }
  }
}

/**
 * 配置管理器
 */
export class ConfigManager {
  private config: RouterOptions

  constructor(options: RouterOptions) {
    // 验证配置
    const errors = ConfigValidator.validateRouterOptions(options)
    if (errors.length > 0) {
      throw new Error(`Invalid router configuration: ${errors.join(', ')}`)
    }

    // 合并默认配置
    this.config = ConfigMerger.mergeRouterOptions(options)
  }

  /**
   * 获取配置
   */
  getConfig(): RouterOptions {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<RouterOptions>): void {
    const newConfig = { ...this.config, ...updates }

    // 验证新配置
    const errors = ConfigValidator.validateRouterOptions(newConfig)
    if (errors.length > 0) {
      throw new Error(`Invalid configuration update: ${errors.join(', ')}`)
    }

    this.config = newConfig
  }

  /**
   * 获取特定配置项
   */
  get<K extends keyof RouterOptions>(key: K): RouterOptions[K] {
    return this.config[key]
  }

  /**
   * 设置特定配置项
   */
  set<K extends keyof RouterOptions>(key: K, value: RouterOptions[K]): void {
    this.config[key] = value
  }
}

/**
 * 创建配置管理器
 */
export function createConfigManager(options: RouterOptions): ConfigManager {
  return new ConfigManager(options)
}
