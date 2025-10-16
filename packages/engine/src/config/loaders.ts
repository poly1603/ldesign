/**
 * 配置加载器模块
 *
 * 提供多种配置加载器实现，支持从不同来源加载配置
 */

// 配置项类型定义

import { getLogger } from '../logger/logger'

export type ConfigValue = string | number | boolean | null | undefined | ConfigObject | ConfigValue[]

export interface ConfigObject {
  [key: string]: ConfigValue
}

// 配置加载器接口
export interface ConfigLoader {
  load: () => Promise<ConfigObject> | ConfigObject
  watch?: (callback: (config: ConfigObject) => void) => (() => void) | void
}

/**
 * 环境变量配置加载器
 *
 * 从环境变量中加载配置，支持自定义前缀
 *
 * @example
 * ```ts
 * const loader = new EnvironmentConfigLoader('APP_')
 * const config = loader.load()
 * ```
 */
export class EnvironmentConfigLoader implements ConfigLoader {
  private logger = getLogger('EnvironmentConfigLoader')

  constructor(private prefix: string = 'VUE_APP_') {}

  load(): ConfigObject {
    const config: ConfigObject = {}

    // 在浏览器环境中，只能访问通过 Vite 或 webpack 注入的环境变量
    try {
      // 检查是否在Node.js环境中
      const processKey = 'process'
      const processEnv = (globalThis as unknown as Record<string, { env?: Record<string, string> }>)?.[processKey]?.env
      if (processEnv) {
        Object.keys(processEnv).forEach((key) => {
          if (key.startsWith(this.prefix)) {
            const configKey = key.substring(this.prefix.length).toLowerCase()
            const value = processEnv[key]

            // 尝试解析为合适的类型
            config[configKey] = this.parseValue(value)
          }
        })
      }
    }
    catch {
      // 在浏览器环境中，process 可能不可用
    }

    return config
  }

  private parseValue(value: string | undefined): ConfigValue {
    if (value === undefined)
      return undefined

    // 尝试解析为布尔值
    if (value.toLowerCase() === 'true')
      return true
    if (value.toLowerCase() === 'false')
      return false

    // 尝试解析为数字
    const numValue = Number(value)
    if (!Number.isNaN(numValue) && Number.isFinite(numValue))
      return numValue

    // 尝试解析为 JSON
    try {
      return JSON.parse(value)
    }
    catch {
      return value // 返回原始字符串
    }
  }
}

/**
 * JSON 文件配置加载器
 *
 * 从远程 JSON 文件加载配置，支持热重载
 *
 * @example
 * ```ts
 * const loader = new JsonConfigLoader('/config.json')
 * const config = await loader.load()
 * ```
 */
export class JsonConfigLoader implements ConfigLoader {
  private logger = getLogger('JsonConfigLoader')

  constructor(private configPath: string) {}

  async load(): Promise<ConfigObject> {
    try {
      const response = await fetch(this.configPath)
      if (!response.ok) {
        throw new Error(`Failed to load config from ${this.configPath}`)
      }
      return await response.json()
    }
    catch (error) {
      this.logger.warn(`Failed to load config from ${this.configPath}:`, error)
      return {}
    }
  }

  watch(callback: (config: ConfigObject) => void): (() => void) | void {
    // 在生产环境中，可以实现文件监听逻辑
    // 这里提供一个简单的轮询实现
    const interval = setInterval(async () => {
      try {
        const newConfig = await this.load()
        callback(newConfig)
      }
      catch (error) {
        this.logger.error('Config watch error:', error)
      }
    }, 5000) // 每5秒检查一次

    return () => clearInterval(interval)
  }
}

/**
 * 内存配置加载器
 *
 * 从内存中加载配置，适用于测试和简单场景
 *
 * @example
 * ```ts
 * const loader = new MemoryConfigLoader({ apiUrl: 'https://api.example.com' })
 * const config = loader.load()
 * ```
 */
export class MemoryConfigLoader implements ConfigLoader {
  constructor(private config: ConfigObject) {}

  load(): ConfigObject {
    return { ...this.config }
  }

  updateConfig(updates: Partial<ConfigObject>): void {
    Object.assign(this.config, updates)
  }
}

/**
 * LocalStorage 配置加载器
 *
 * 从浏览器 LocalStorage 加载配置
 *
 * @example
 * ```ts
 * const loader = new LocalStorageConfigLoader('app-config')
 * const config = loader.load()
 * ```
 */
export class LocalStorageConfigLoader implements ConfigLoader {
  private logger = getLogger('LocalStorageConfigLoader')

  constructor(private key: string) {}

  load(): ConfigObject {
    try {
      const stored = localStorage.getItem(this.key)
      if (stored) {
        return JSON.parse(stored)
      }
    }
    catch (error) {
      this.logger.warn(`Failed to load config from localStorage:`, error)
    }
    return {}
  }

  save(config: ConfigObject): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(config))
    }
    catch (error) {
      this.logger.error(`Failed to save config to localStorage:`, error)
    }
  }

  watch(callback: (config: ConfigObject) => void): (() => void) | void {
    // 监听 storage 事件
    const handler = (event: StorageEvent) => {
      if (event.key === this.key && event.newValue) {
        try {
          const newConfig = JSON.parse(event.newValue)
          callback(newConfig)
        }
        catch (error) {
          this.logger.error('Failed to parse storage event:', error)
        }
      }
    }

    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }
}

/**
 * 组合配置加载器
 *
 * 按顺序加载多个配置源，后面的配置会覆盖前面的
 *
 * @example
 * ```ts
 * const loader = new CompositeConfigLoader([
 *   new EnvironmentConfigLoader(),
 *   new JsonConfigLoader('/config.json'),
 *   new LocalStorageConfigLoader('user-config')
 * ])
 * const config = await loader.load()
 * ```
 */
export class CompositeConfigLoader implements ConfigLoader {
  private logger = getLogger('CompositeConfigLoader')

  constructor(private loaders: ConfigLoader[]) {}

  async load(): Promise<ConfigObject> {
    let config: ConfigObject = {}

    for (const loader of this.loaders) {
      try {
        const loadedConfig = await loader.load()
        config = { ...config, ...loadedConfig }
      }
      catch (error) {
        this.logger.error('Failed to load config from loader:', error)
      }
    }

    return config
  }

  watch(callback: (config: ConfigObject) => void): (() => void) | void {
    const unwatchers: Array<() => void> = []

    for (const loader of this.loaders) {
      if (loader.watch) {
        const unwatcher = loader.watch(callback)
        if (unwatcher) {
          unwatchers.push(unwatcher)
        }
      }
    }

    return () => {
      unwatchers.forEach(unwatch => unwatch())
    }
  }
}
