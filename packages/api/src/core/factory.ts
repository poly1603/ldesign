/**
 * API 引擎工厂函数
 * 提供创建 API 引擎实例的便捷方法
 */

import type { ApiEngine, ApiEngineConfig } from '../types'
import { systemApiPlugin } from '../plugins/systemApi'
import { ApiEngineImpl } from './ApiEngine'

/**
 * 创建 API 引擎实例
 *
 * @param config API 引擎配置
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createApiEngine } from '@ldesign/api'
 *
 * const apiEngine = createApiEngine({
 *   debug: true,
 *   http: {
 *     baseURL: 'https://api.example.com',
 *     timeout: 10000,
 *   },
 *   cache: {
 *     enabled: true,
 *     ttl: 300000, // 5分钟
 *   },
 * })
 * ```
 */
export function createApiEngine(config: ApiEngineConfig = {}): ApiEngine {
  return new ApiEngineImpl(config)
}

/**
 * 默认配置预设
 */
const DEFAULT_PRESETS = {
  base: {
    http: {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    cache: {
      enabled: true,
      ttl: 300000, // 5分钟
      maxSize: 100,
      storage: 'memory' as const,
    },
    debounce: {
      enabled: true,
      delay: 300,
    },
    deduplication: {
      enabled: true,
    },
  },
  development: {
    debug: true,
    http: {
      timeout: 30000,
    },
    cache: {
      enabled: false,
    },
  },
  production: {
    debug: false,
    http: {
      timeout: 10000,
    },
    cache: {
      enabled: true,
      ttl: 600000, // 10分钟
      maxSize: 200,
      storage: 'lru' as const,
    },
    debounce: {
      enabled: true,
      delay: 500,
    },
  },
  test: {
    debug: true,
    http: {
      timeout: 5000,
    },
    cache: {
      enabled: false,
    },
    debounce: {
      enabled: false,
    },
    deduplication: {
      enabled: false,
    },
  },
}

/**
 * 合并配置（深度合并）
 */
function mergeConfig(
  baseURL: string,
  preset: Partial<ApiEngineConfig>,
  options: Omit<ApiEngineConfig, 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>
  } = {},
): ApiEngineConfig {
  return {
    ...preset,
    ...options,
    http: {
      baseURL,
      ...preset.http,
      ...options.http,
    },
    cache: {
      ...preset.cache,
      ...options.cache,
    },
    debounce: {
      ...preset.debounce,
      ...options.debounce,
    },
    deduplication: {
      ...preset.deduplication,
      ...options.deduplication,
    },
  }
}

/**
 * 创建带有默认配置的 API 引擎
 *
 * @param baseURL API 基础地址
 * @param options 额外配置选项
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createApiEngineWithDefaults } from '@ldesign/api'
 *
 * const apiEngine = createApiEngineWithDefaults('https://api.example.com', {
 *   debug: true,
 *   cache: { ttl: 600000 }, // 10分钟缓存
 * })
 * ```
 */
export function createApiEngineWithDefaults(
  baseURL: string,
  options: Omit<ApiEngineConfig, 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>
  } = {},
): ApiEngine {
  const config = mergeConfig(baseURL, DEFAULT_PRESETS.base, options)
  return new ApiEngineImpl(config)
}

/**
 * 创建开发环境的 API 引擎
 *
 * @param baseURL API 基础地址
 * @param options 额外配置选项
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createDevelopmentApiEngine } from '@ldesign/api'
 *
 * const apiEngine = createDevelopmentApiEngine('http://localhost:3000/api')
 * ```
 */
export function createDevelopmentApiEngine(
  baseURL: string,
  options: Omit<ApiEngineConfig, 'debug' | 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>
  } = {},
): ApiEngine {
  const config = mergeConfig(baseURL, {
    ...DEFAULT_PRESETS.base,
    ...DEFAULT_PRESETS.development,
  }, options)
  return new ApiEngineImpl(config)
}

/**
 * 创建生产环境的 API 引擎
 *
 * @param baseURL API 基础地址
 * @param options 额外配置选项
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createProductionApiEngine } from '@ldesign/api'
 *
 * const apiEngine = createProductionApiEngine('https://api.example.com')
 * ```
 */
export function createProductionApiEngine(
  baseURL: string,
  options: Omit<ApiEngineConfig, 'debug' | 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>
  } = {},
): ApiEngine {
  const config = mergeConfig(baseURL, {
    ...DEFAULT_PRESETS.base,
    ...DEFAULT_PRESETS.production,
  }, options)
  return new ApiEngineImpl(config)
}

/**
 * 创建测试环境的 API 引擎
 *
 * @param baseURL API 基础地址
 * @param options 额外配置选项
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createTestApiEngine } from '@ldesign/api'
 *
 * const apiEngine = createTestApiEngine('http://test-api.example.com')
 * ```
 */
export function createTestApiEngine(
  baseURL: string,
  options: Omit<ApiEngineConfig, 'debug' | 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>
  } = {},
): ApiEngine {
  const config = mergeConfig(baseURL, {
    ...DEFAULT_PRESETS.base,
    ...DEFAULT_PRESETS.test,
  }, options)
  return new ApiEngineImpl(config)
}

/**
 * 根据环境变量创建 API 引擎
 *
 * @param baseURL API 基础地址
 * @param options 额外配置选项
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createApiEngineByEnv } from '@ldesign/api'
 *
 * // 根据 NODE_ENV 或 VITE_MODE 自动选择配置
 * const apiEngine = createApiEngineByEnv(import.meta.env?.VITE_API_BASE_URL)
 * ```
 */
export function createApiEngineByEnv(
  baseURL: string,
  options: Omit<ApiEngineConfig, 'http'> & {
    http?: Omit<ApiEngineConfig['http'], 'baseURL'>
  } = {},
): ApiEngine {
  // 检测环境（同时支持 Node 与 Vite）
  const nodeEnv = process?.env?.NODE_ENV as string | undefined
  const viteEnv = (typeof import.meta !== 'undefined' ? import.meta.env : undefined)

  const hasNodeEnv = typeof nodeEnv === 'string' && nodeEnv.length > 0
  const isDevelopment = hasNodeEnv
    ? nodeEnv === 'development'
    : (viteEnv?.DEV === true || viteEnv?.MODE === 'development')
  const isTest = hasNodeEnv
    ? nodeEnv === 'test'
    : (viteEnv?.MODE === 'test')

  if (isTest) {
    return createTestApiEngine(baseURL, options)
  }
  else if (isDevelopment) {
    return createDevelopmentApiEngine(baseURL, options)
  }
  else {
    return createProductionApiEngine(baseURL, options)
  }
}

/**
 * 创建带有预设插件的 API 引擎
 *
 * @param config API 引擎配置
 * @param plugins 要预装的插件列表
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createApiEngineWithPlugins, systemApiPlugin } from '@ldesign/api'
 *
 * const apiEngine = await createApiEngineWithPlugins(
 *   { http: { baseURL: 'https://api.example.com' } },
 *   [systemApiPlugin]
 * )
 * ```
 */
export async function createApiEngineWithPlugins(
  config: ApiEngineConfig,
  plugins: Array<import('../types').ApiPlugin>,
): Promise<ApiEngine> {
  const engine = createApiEngine(config)

  // 按顺序安装插件
  for (const plugin of plugins) {
    await engine.use(plugin)
  }

  return engine
}

/**
 * 创建包含系统 API 插件的引擎（便捷）
 */
export async function createSystemApiEngine(
  baseURL: string,
  options: Omit<ApiEngineConfig, 'http'> & { http?: Omit<ApiEngineConfig['http'], 'baseURL'> } = {},
): Promise<ApiEngine> {
  const engine = createApiEngineWithDefaults(baseURL, options)
  await engine.use(systemApiPlugin)
  return engine
}

/**
 * 根据环境创建包含系统 API 插件的引擎（便捷）
 */
export async function createSystemApiEngineByEnv(
  baseURL: string,
  options: Omit<ApiEngineConfig, 'http'> & { http?: Omit<ApiEngineConfig['http'], 'baseURL'> } = {},
): Promise<ApiEngine> {
  const engine = createApiEngineByEnv(baseURL, options)
  await engine.use(systemApiPlugin)
  return engine
}

/**
 * 创建单例 API 引擎
 *
 * @param config API 引擎配置
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { createSingletonApiEngine } from '@ldesign/api'
 *
 * // 第一次调用创建实例
 * const engine1 = createSingletonApiEngine({ http: { baseURL: 'https://api.example.com' } })
 *
 * // 后续调用返回相同实例
 * const engine2 = createSingletonApiEngine() // 返回 engine1
 * ```
 */
export function createSingletonApiEngine(config?: ApiEngineConfig): ApiEngine {
  // 使用全局变量存储单例实例
  const globalKey = '__LDESIGN_API_ENGINE_SINGLETON__'

  const g = globalThis as unknown as Record<string, unknown>
  if (typeof g !== 'undefined') {
    if (!g[globalKey] && config) {
      g[globalKey] = createApiEngine(config)
    }
    return g[globalKey] as ApiEngine
  }

  // 降级到普通创建方式
  return createApiEngine(config || {})
}

/**
 * 销毁单例 API 引擎
 *
 * @example
 * ```typescript
 * import { destroySingletonApiEngine } from '@ldesign/api'
 *
 * destroySingletonApiEngine()
 * ```
 */
export function destroySingletonApiEngine(): void {
  const globalKey = '__LDESIGN_API_ENGINE_SINGLETON__'

  const g = globalThis as unknown as Record<string, unknown>
  if (typeof g !== 'undefined' && g[globalKey]) {
    (g[globalKey] as ApiEngine).destroy()
    delete g[globalKey]
  }
}
