/**
 * API 引擎工厂函数
 * 提供创建 API 引擎实例的便捷方法
 */

import { ApiEngineImpl } from './ApiEngine'
import type { ApiEngine, ApiEngineConfig } from '../types'

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
  options: Omit<ApiEngineConfig, 'http'> & { http?: Omit<ApiEngineConfig['http'], 'baseURL'> } = {}
): ApiEngine {
  const config: ApiEngineConfig = {
    debug: false,
    http: {
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...options.http,
    },
    cache: {
      enabled: true,
      ttl: 300000, // 5分钟
      maxSize: 100,
      storage: 'memory',
    },
    debounce: {
      enabled: true,
      delay: 300,
    },
    deduplication: {
      enabled: true,
    },
    ...options,
  }

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
  options: Omit<ApiEngineConfig, 'debug' | 'http'> & { http?: Omit<ApiEngineConfig['http'], 'baseURL'> } = {}
): ApiEngine {
  return createApiEngineWithDefaults(baseURL, {
    debug: true,
    http: {
      timeout: 30000, // 开发环境超时时间更长
      ...options.http,
    },
    cache: {
      enabled: false, // 开发环境默认禁用缓存
    },
    ...options,
  })
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
  options: Omit<ApiEngineConfig, 'debug' | 'http'> & { http?: Omit<ApiEngineConfig['http'], 'baseURL'> } = {}
): ApiEngine {
  return createApiEngineWithDefaults(baseURL, {
    debug: false,
    http: {
      timeout: 10000,
      ...options.http,
    },
    cache: {
      enabled: true,
      ttl: 600000, // 生产环境缓存时间更长
      maxSize: 200,
      storage: 'memory',
    },
    debounce: {
      enabled: true,
      delay: 500, // 生产环境防抖时间更长
    },
    deduplication: {
      enabled: true,
    },
    ...options,
  })
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
  options: Omit<ApiEngineConfig, 'debug' | 'http'> & { http?: Omit<ApiEngineConfig['http'], 'baseURL'> } = {}
): ApiEngine {
  return createApiEngineWithDefaults(baseURL, {
    debug: true,
    http: {
      timeout: 5000, // 测试环境超时时间较短
      ...options.http,
    },
    cache: {
      enabled: false, // 测试环境禁用缓存
    },
    debounce: {
      enabled: false, // 测试环境禁用防抖
    },
    deduplication: {
      enabled: false, // 测试环境禁用去重
    },
    ...options,
  })
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
 * const apiEngine = createApiEngineByEnv(import.meta.env.VITE_API_BASE_URL)
 * ```
 */
export function createApiEngineByEnv(
  baseURL: string,
  options: Omit<ApiEngineConfig, 'http'> & { http?: Omit<ApiEngineConfig['http'], 'baseURL'> } = {}
): ApiEngine {
  // 检测环境
  const isDevelopment = 
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development')

  const isTest = 
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') ||
    (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test')

  if (isTest) {
    return createTestApiEngine(baseURL, options)
  } else if (isDevelopment) {
    return createDevelopmentApiEngine(baseURL, options)
  } else {
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
  plugins: Array<import('../types').ApiPlugin>
): Promise<ApiEngine> {
  const engine = createApiEngine(config)
  
  // 按顺序安装插件
  for (const plugin of plugins) {
    await engine.use(plugin)
  }
  
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
  
  if (typeof globalThis !== 'undefined') {
    if (!globalThis[globalKey] && config) {
      globalThis[globalKey] = createApiEngine(config)
    }
    return globalThis[globalKey]
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
  
  if (typeof globalThis !== 'undefined' && globalThis[globalKey]) {
    globalThis[globalKey].destroy()
    delete globalThis[globalKey]
  }
}
