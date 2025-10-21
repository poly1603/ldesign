/**
 * 环境变量工具类
 * 提供环境变量读取、验证、类型转换等功能
 * 
 * @example
 * ```typescript
 * import { EnvUtils } from '@ldesign/kit'
 * 
 * // 读取环境变量
 * const port = EnvUtils.getNumber('PORT', 3000)
 * const debug = EnvUtils.getBoolean('DEBUG', false)
 * 
 * // 验证必需的环境变量
 * EnvUtils.require(['API_KEY', 'DATABASE_URL'])
 * 
 * // 加载 .env 文件
 * await EnvUtils.load('.env')
 * ```
 */

/**
 * 环境变量选项
 */
export interface EnvOptions {
  /**
   * 环境变量前缀
   */
  prefix?: string
  /**
   * 是否严格模式（未定义的变量抛出异常）
   */
  strict?: boolean
  /**
   * 是否转换类型
   */
  convert?: boolean
}

/**
 * 环境变量模式
 */
export interface EnvSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'json'
    required?: boolean
    default?: any
    pattern?: RegExp
    choices?: any[]
    validate?: (value: any) => boolean | string
  }
}

/**
 * 环境变量工具类
 */
export class EnvUtils {
  private static cache = new Map<string, any>()
  private static loaded = false

  /**
   * 获取环境变量
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 环境变量值
   */
  static get(key: string, defaultValue?: string): string | undefined {
    const value = process.env[key]
    return value !== undefined ? value : defaultValue
  }

  /**
   * 获取字符串类型环境变量
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 字符串值
   */
  static getString(key: string, defaultValue?: string): string | undefined {
    return EnvUtils.get(key, defaultValue)
  }

  /**
   * 获取数字类型环境变量
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 数字值
   */
  static getNumber(key: string, defaultValue?: number): number | undefined {
    const value = EnvUtils.get(key)
    if (value === undefined) {
      return defaultValue
    }

    const num = Number(value)
    if (Number.isNaN(num)) {
      return defaultValue
    }

    return num
  }

  /**
   * 获取整数类型环境变量
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 整数值
   */
  static getInteger(key: string, defaultValue?: number): number | undefined {
    const num = EnvUtils.getNumber(key, defaultValue)
    return num !== undefined ? Math.floor(num) : undefined
  }

  /**
   * 获取浮点数类型环境变量
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 浮点数值
   */
  static getFloat(key: string, defaultValue?: number): number | undefined {
    return EnvUtils.getNumber(key, defaultValue)
  }

  /**
   * 获取布尔类型环境变量
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 布尔值
   */
  static getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    const value = EnvUtils.get(key)
    if (value === undefined) {
      return defaultValue
    }

    const lowerValue = value.toLowerCase()

    if (['true', '1', 'yes', 'on', 'enabled'].includes(lowerValue)) {
      return true
    }

    if (['false', '0', 'no', 'off', 'disabled'].includes(lowerValue)) {
      return false
    }

    return defaultValue
  }

  /**
   * 获取数组类型环境变量
   * @param key 键名
   * @param defaultValue 默认值
   * @param separator 分隔符
   * @returns 数组值
   */
  static getArray(key: string, defaultValue?: string[], separator = ','): string[] | undefined {
    const value = EnvUtils.get(key)
    if (value === undefined) {
      return defaultValue
    }

    return value.split(separator).map(item => item.trim()).filter(Boolean)
  }

  /**
   * 获取 JSON 类型环境变量
   * @param key 键名
   * @param defaultValue 默认值
   * @returns JSON 对象
   */
  static getJson<T = any>(key: string, defaultValue?: T): T | undefined {
    const value = EnvUtils.get(key)
    if (value === undefined) {
      return defaultValue
    }

    try {
      return JSON.parse(value) as T
    }
    catch {
      return defaultValue
    }
  }

  /**
   * 设置环境变量
   * @param key 键名
   * @param value 值
   */
  static set(key: string, value: string | number | boolean): void {
    process.env[key] = String(value)
    EnvUtils.cache.set(key, value)
  }

  /**
   * 批量设置环境变量
   * @param vars 环境变量对象
   */
  static setMany(vars: Record<string, string | number | boolean>): void {
    for (const [key, value] of Object.entries(vars)) {
      EnvUtils.set(key, value)
    }
  }

  /**
   * 删除环境变量
   * @param key 键名
   */
  static unset(key: string): void {
    delete process.env[key]
    EnvUtils.cache.delete(key)
  }

  /**
   * 检查环境变量是否存在
   * @param key 键名
   * @returns 是否存在
   */
  static has(key: string): boolean {
    return process.env[key] !== undefined
  }

  /**
   * 要求必需的环境变量
   * @param keys 键名数组
   * @throws 如果缺少必需的环境变量
   */
  static require(keys: string[]): void {
    const missing = keys.filter(key => !EnvUtils.has(key))

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }

  /**
   * 验证环境变量模式
   * @param schema 模式定义
   * @returns 验证结果
   */
  static validate(schema: EnvSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const [key, config] of Object.entries(schema)) {
      const value = EnvUtils.get(key)

      // 检查必需项
      if (config.required && value === undefined) {
        errors.push(`Missing required environment variable: ${key}`)
        continue
      }

      // 使用默认值
      if (value === undefined && config.default !== undefined) {
        EnvUtils.set(key, config.default)
        continue
      }

      if (value === undefined) {
        continue
      }

      // 类型验证
      let parsedValue: any = value

      switch (config.type) {
        case 'number': {
          parsedValue = Number(value)
          if (Number.isNaN(parsedValue)) {
            errors.push(`Invalid number for ${key}: ${value}`)
          }
          break
        }
        case 'boolean': {
          parsedValue = EnvUtils.getBoolean(key)
          if (parsedValue === undefined) {
            errors.push(`Invalid boolean for ${key}: ${value}`)
          }
          break
        }
        case 'array': {
          parsedValue = EnvUtils.getArray(key)
          if (!Array.isArray(parsedValue)) {
            errors.push(`Invalid array for ${key}: ${value}`)
          }
          break
        }
        case 'json': {
          try {
            parsedValue = JSON.parse(value)
          }
          catch {
            errors.push(`Invalid JSON for ${key}: ${value}`)
          }
          break
        }
      }

      // 模式验证
      if (config.pattern && typeof parsedValue === 'string' && !config.pattern.test(parsedValue)) {
        errors.push(`${key} does not match pattern: ${config.pattern}`)
      }

      // 选项验证
      if (config.choices && !config.choices.includes(parsedValue)) {
        errors.push(`${key} must be one of: ${config.choices.join(', ')}`)
      }

      // 自定义验证
      if (config.validate) {
        const result = config.validate(parsedValue)
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `Invalid value for ${key}`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 加载 .env 文件
   * @param path 文件路径
   * @param override 是否覆盖现有变量
   */
  static async load(path = '.env', override = false): Promise<void> {
    if (EnvUtils.loaded && !override) {
      return
    }

    try {
      const { promises: fs } = await import('node:fs')
      const { resolve } = await import('node:path')

      const fullPath = resolve(process.cwd(), path)
      const content = await fs.readFile(fullPath, 'utf-8')

      EnvUtils.parse(content, override)
      EnvUtils.loaded = true
    }
    catch {
      // 文件不存在或读取失败，忽略
    }
  }

  /**
   * 解析环境变量字符串
   * @param content 环境变量内容
   * @param override 是否覆盖现有变量
   */
  static parse(content: string, override = false): void {
    const lines = content.split('\n')

    for (const line of lines) {
      // 跳过空行和注释
      if (!line || line.trim().startsWith('#')) {
        continue
      }

      // 解析键值对
      const match = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)?\s*$/)
      if (!match || !match[1]) {
        continue
      }

      const key = match[1]
      const value = match[2] || ''

      // 移除引号
      let processedValue = value.trim()
      if (
        (processedValue.startsWith('"') && processedValue.endsWith('"'))
        || (processedValue.startsWith("'") && processedValue.endsWith("'"))
      ) {
        processedValue = processedValue.slice(1, -1)
      }

      // 展开变量引用
      processedValue = EnvUtils.expand(processedValue)

      // 设置环境变量
      if (override || !EnvUtils.has(key)) {
        EnvUtils.set(key, processedValue)
      }
    }
  }

  /**
   * 展开变量引用
   * @param value 值
   * @returns 展开后的值
   */
  static expand(value: string): string {
    return value.replace(/\$\{([^}]+)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, p1, p2) => {
      const key = p1 || p2
      return EnvUtils.get(key) || ''
    })
  }

  /**
   * 保存环境变量到文件
   * @param path 文件路径
   * @param vars 环境变量对象
   */
  static async save(path: string, vars: Record<string, string | number | boolean>): Promise<void> {
    const { promises: fs } = await import('node:fs')
    const { dirname } = await import('node:path')

    const lines = Object.entries(vars).map(([key, value]) => {
      const strValue = String(value)
      // 如果值包含特殊字符，使用引号
      const needsQuotes = /[\s#"'\\]/.test(strValue)
      return `${key}=${needsQuotes ? `"${strValue.replace(/"/g, '\\"')}"` : strValue}`
    })

    const content = lines.join('\n') + '\n'

    const dir = dirname(path)
    await fs.mkdir(dir, { recursive: true })

    await fs.writeFile(path, content, 'utf-8')
  }

  /**
   * 获取所有环境变量
   * @param prefix 前缀过滤
   * @returns 环境变量对象
   */
  static getAll(prefix?: string): Record<string, string> {
    const vars: Record<string, string> = {}

    for (const [key, value] of Object.entries(process.env)) {
      if (!prefix || key.startsWith(prefix)) {
        vars[key] = value || ''
      }
    }

    return vars
  }

  /**
   * 过滤环境变量
   * @param predicate 过滤函数
   * @returns 过滤后的环境变量对象
   */
  static filter(predicate: (key: string, value: string) => boolean): Record<string, string> {
    const vars: Record<string, string> = {}

    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined && predicate(key, value)) {
        vars[key] = value
      }
    }

    return vars
  }

  /**
   * 清除所有环境变量
   * @param keepSystemVars 是否保留系统变量
   */
  static clear(keepSystemVars = true): void {
    const systemVars = ['PATH', 'HOME', 'USER', 'SHELL', 'LANG', 'TERM']

    for (const key of Object.keys(process.env)) {
      if (!keepSystemVars || !systemVars.includes(key)) {
        delete process.env[key]
      }
    }

    EnvUtils.cache.clear()
  }

  /**
   * 克隆环境变量
   * @returns 环境变量副本
   */
  static clone(): Record<string, string> {
    return { ...process.env } as Record<string, string>
  }

  /**
   * 获取 Node 环境
   * @returns 环境名称
   */
  static getNodeEnv(): 'development' | 'production' | 'test' | string {
    return EnvUtils.get('NODE_ENV') || 'development'
  }

  /**
   * 检查是否为开发环境
   * @returns 是否为开发环境
   */
  static isDevelopment(): boolean {
    return EnvUtils.getNodeEnv() === 'development'
  }

  /**
   * 检查是否为生产环境
   * @returns 是否为生产环境
   */
  static isProduction(): boolean {
    return EnvUtils.getNodeEnv() === 'production'
  }

  /**
   * 检查是否为测试环境
   * @returns 是否为测试环境
   */
  static isTest(): boolean {
    return EnvUtils.getNodeEnv() === 'test'
  }

  /**
   * 获取环境变量统计信息
   * @returns 统计信息
   */
  static stats(): {
    total: number
    empty: number
    nonEmpty: number
    prefixes: Record<string, number>
  } {
    const vars = Object.entries(process.env)
    const prefixes: Record<string, number> = {}

    for (const [key] of vars) {
      const prefix = key.split('_')[0]
      if (prefix) {
        prefixes[prefix] = (prefixes[prefix] || 0) + 1
      }
    }

    return {
      total: vars.length,
      empty: vars.filter(([, value]) => !value).length,
      nonEmpty: vars.filter(([, value]) => !!value).length,
      prefixes,
    }
  }

  /**
   * 创建环境变量快照
   * @param keys 要快照的键名数组（不提供则快照全部）
   * @returns 快照对象
   */
  static snapshot(keys?: string[]): Record<string, string> {
    if (keys) {
      const snapshot: Record<string, string> = {}
      for (const key of keys) {
        const value = EnvUtils.get(key)
        if (value !== undefined) {
          snapshot[key] = value
        }
      }
      return snapshot
    }

    return EnvUtils.clone()
  }

  /**
   * 恢复环境变量快照
   * @param snapshot 快照对象
   */
  static restore(snapshot: Record<string, string>): void {
    for (const [key, value] of Object.entries(snapshot)) {
      EnvUtils.set(key, value)
    }
  }
}



