/**
 * 环境变量配置
 * 提供环境变量加载和转换功能
 */

/**
 * 环境变量配置选项
 */
export interface EnvConfigOptions {
  prefix?: string
  separator?: string
  caseSensitive?: boolean
  parseValues?: boolean
  allowList?: string[]
  denyList?: string[]
  transform?: (key: string, value: unknown) => unknown
}

/**
 * 环境变量配置类
 */
export class EnvConfig {
  private options: Required<EnvConfigOptions>

  constructor(options: EnvConfigOptions = {}) {
    this.options = {
      prefix: options.prefix || 'APP',
      separator: options.separator || '_',
      caseSensitive: options.caseSensitive !== false,
      parseValues: options.parseValues !== false,
      allowList: options.allowList || [],
      denyList: options.denyList || [],
      transform: options.transform || ((_key: string, value: unknown) => value),
    }
  }

  /**
   * 加载环境变量配置
   */
  load(): Record<string, unknown> {
    const config: Record<string, unknown> = {}
    const env = process.env

    for (const [key, value] of Object.entries(env)) {
      if (value === undefined)
        continue

      // 检查前缀
      if (!this.matchesPrefix(key))
        continue

      // 检查允许/拒绝列表
      if (!this.isAllowed(key))
        continue

      // 移除前缀并转换键名
      const configKey = this.transformKey(key)

      // 解析值
      const parsedValue = this.parseValue(value)

      // 应用自定义转换
      const transformedValue = this.options.transform(configKey, parsedValue)

      // 设置嵌套配置
      this.setNestedValue(config, configKey, transformedValue)
    }

    return config
  }

  /**
   * 检查键是否匹配前缀
   */
  private matchesPrefix(key: string): boolean {
    if (!this.options.prefix)
      return true

    const prefix = this.options.caseSensitive
      ? this.options.prefix
      : this.options.prefix.toUpperCase()

    const keyToCheck = this.options.caseSensitive ? key : key.toUpperCase()

    return keyToCheck.startsWith(prefix + this.options.separator)
  }

  /**
   * 检查键是否被允许
   */
  private isAllowed(key: string): boolean {
    // 检查拒绝列表
    if (this.options.denyList.length > 0) {
      const keyToCheck = this.options.caseSensitive ? key : key.toLowerCase()
      const denyList = this.options.caseSensitive
        ? this.options.denyList
        : this.options.denyList.map(k => k.toLowerCase())

      if (denyList.some(denied => keyToCheck.includes(denied))) {
        return false
      }
    }

    // 检查允许列表
    if (this.options.allowList.length > 0) {
      const keyToCheck = this.options.caseSensitive ? key : key.toLowerCase()
      const allowList = this.options.caseSensitive
        ? this.options.allowList
        : this.options.allowList.map(k => k.toLowerCase())

      return allowList.some(allowed => keyToCheck.includes(allowed))
    }

    return true
  }

  /**
   * 转换键名
   */
  private transformKey(key: string): string {
    // 移除前缀
    let configKey = key
    if (this.options.prefix) {
      const prefix = this.options.caseSensitive
        ? this.options.prefix
        : this.options.prefix.toUpperCase()

      const keyToProcess = this.options.caseSensitive ? key : key.toUpperCase()
      const prefixWithSeparator = prefix + this.options.separator

      if (keyToProcess.startsWith(prefixWithSeparator)) {
        configKey = key.slice(prefixWithSeparator.length)
      }
    }

    // 转换分隔符为点号（用于嵌套配置）
    configKey = configKey.replace(new RegExp(this.options.separator, 'g'), '.')

    // 转换为小写（如果不区分大小写）
    if (!this.options.caseSensitive) {
      configKey = configKey.toLowerCase()
    }

    return configKey
  }

  /**
   * 解析环境变量值
   */
  private parseValue(value: string): unknown {
    if (!this.options.parseValues) {
      return value
    }

    // 布尔值
    if (value.toLowerCase() === 'true')
      return true
    if (value.toLowerCase() === 'false')
      return false

    // null 和 undefined
    if (value.toLowerCase() === 'null')
      return null
    if (value.toLowerCase() === 'undefined')
      return undefined

    // 数字
    if (/^\d+$/.test(value)) {
      const num = Number.parseInt(value, 10)
      return Number.isSafeInteger(num) ? num : value
    }

    if (/^\d+\.\d+$/.test(value)) {
      const num = Number.parseFloat(value)
      return Number.isFinite(num) ? num : value
    }

    // JSON 数组或对象
    if (
      (value.startsWith('[') && value.endsWith(']'))
      || (value.startsWith('{') && value.endsWith('}'))
    ) {
      try {
        return JSON.parse(value)
      }
      catch {
        return value
      }
    }

    // 逗号分隔的数组
    if (value.includes(',')) {
      return value.split(',').map((item) => {
        const trimmed = item.trim()
        return this.parseValue(trimmed)
      })
    }

    return value
  }

  /**
   * 设置嵌套配置值
   */
  private setNestedValue(config: Record<string, unknown>, key: string, value: unknown): void {
    const keys = key.split('.')
    let current: Record<string, unknown> = config

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!k)
        continue
      const next = current[k]
      if (!this.isRecord(next)) {
        current[k] = {}
      }
      current = current[k] as Record<string, unknown>
    }

    const lastKey = keys[keys.length - 1]
    if (lastKey) {
      current[lastKey] = value
    }
  }

  /**
   * 获取环境变量
   */
  get<T = unknown>(key: string, defaultValue?: T): T {
    const envKey = this.buildEnvKey(key)
    const value = process.env[envKey]

    if (value === undefined) {
      return defaultValue as T
    }

    return (this.options.parseValues ? this.parseValue(value) : value) as unknown as T
  }

  /**
   * 设置环境变量
   */
  set(key: string, value: unknown): void {
    const envKey = this.buildEnvKey(key)
    process.env[envKey] = String(value)
  }

  /**
   * 检查环境变量是否存在
   */
  has(key: string): boolean {
    const envKey = this.buildEnvKey(key)
    return envKey in process.env
  }

  /**
   * 删除环境变量
   */
  delete(key: string): boolean {
    const envKey = this.buildEnvKey(key)
    if (envKey in process.env) {
      delete process.env[envKey]
      return true
    }
    return false
  }

  /**
   * 构建环境变量键名
   */
  private buildEnvKey(key: string): string {
    // 将点号转换为分隔符
    const transformedKey = key.replace(/\./g, this.options.separator)

    // 添加前缀
    let envKey = this.options.prefix
      ? `${this.options.prefix}${this.options.separator}${transformedKey}`
      : transformedKey

    // 转换大小写
    if (!this.options.caseSensitive) {
      envKey = envKey.toUpperCase()
    }

    return envKey
  }

  /**
   * 获取所有匹配的环境变量
   */
  getAll(): Record<string, string> {
    const result: Record<string, string> = {}
    const env = process.env

    for (const [key, value] of Object.entries(env)) {
      if (value !== undefined && this.matchesPrefix(key) && this.isAllowed(key)) {
        result[key] = value
      }
    }

    return result
  }

  /**
   * 清除所有匹配的环境变量
   */
  clear(): void {
    const env = process.env
    const keysToDelete: string[] = []

    for (const key of Object.keys(env)) {
      if (this.matchesPrefix(key) && this.isAllowed(key)) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      delete process.env[key]
    }
  }

  /**
   * 从对象设置多个环境变量
   */
  setFromObject(config: Record<string, unknown>, prefix = ''): void {
    for (const [key, value] of Object.entries(config)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (this.isRecord(value)) {
        this.setFromObject(value, fullKey)
      }
      else {
        this.set(fullKey, value)
      }
    }
  }

  /**
   * 导出为 .env 格式
   */
  exportToEnv(): string {
    const envVars = this.getAll()
    let content = ''

    for (const [key, value] of Object.entries(envVars)) {
      // 如果值包含空格或特殊字符，添加引号
      if (typeof value === 'string' && (/\s/.test(value) || /[#"'\\]/.test(value))) {
        content += `${key}="${value.replace(/"/g, '\\"')}"\n`
      }
      else {
        content += `${key}=${value}\n`
      }
    }

    return content
  }

  /**
   * 从 .env 文件内容加载
   */
  loadFromEnv(content: string): void {
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()

      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      const equalIndex = trimmed.indexOf('=')
      if (equalIndex > 0) {
        const key = trimmed.slice(0, equalIndex).trim()
        let value = trimmed.slice(equalIndex + 1).trim()

        // 移除引号
        if (
          (value.startsWith('"') && value.endsWith('"'))
          || (value.startsWith('\'') && value.endsWith('\''))
        ) {
          value = value.slice(1, -1).replace(/\\"/g, '"')
        }

        process.env[key] = value
      }
    }
  }

  /**
   * 获取配置选项
   */
  getOptions(): Required<EnvConfigOptions> {
    return { ...this.options }
  }

  /**
   * 更新配置选项
   */
  updateOptions(options: Partial<EnvConfigOptions>): void {
    this.options = { ...this.options, ...options } as Required<EnvConfigOptions>
  }

  /**
   * 创建环境变量配置实例
   */
  static create(options?: EnvConfigOptions): EnvConfig {
    return new EnvConfig(options)
  }

  /**
   * 快速加载环境变量配置
   */
  static load(prefix?: string): Record<string, unknown> {
    const envConfig = new EnvConfig({ prefix })
    return envConfig.load()
  }

  /**
   * 简单对象类型守卫
   */
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
