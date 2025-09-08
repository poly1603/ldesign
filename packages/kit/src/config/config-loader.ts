/**
 * 配置加载器
 * 支持多种格式的配置文件加载和保存
 */

import { EventEmitter } from 'node:events'
import { promises as fs } from 'node:fs'
import { dirname, extname, isAbsolute, resolve } from 'node:path'
import * as JSON5 from 'json5'
import { FileSystem } from '../filesystem'

/**
 * 配置加载器选项
 */
export interface ConfigLoaderOptions {
  configDir?: string
  caseSensitive?: boolean
  encoding?: BufferEncoding
  allowMissingFiles?: boolean
}

/**
 * 配置加载器类
 */
export class ConfigLoader extends EventEmitter {
  private options: Required<ConfigLoaderOptions>

  constructor(options: ConfigLoaderOptions = {}) {
    super()

    this.options = {
      configDir: options.configDir || process.cwd(),
      caseSensitive: options.caseSensitive !== false,
      encoding: options.encoding || 'utf8',
      allowMissingFiles: options.allowMissingFiles !== false,
    }
  }

  /**
   * 加载配置文件
   */
  async load(configFile: string): Promise<Record<string, unknown>> {
    const filePath = this.resolveConfigPath(configFile)

    try {
      // 检查文件是否存在
      if (!(await FileSystem.exists(filePath))) {
        if (this.options.allowMissingFiles) {
          this.emit('missingFile', filePath)
          return {}
        }
        throw new Error(`Configuration file not found: ${filePath}`)
      }

      // 读取文件内容
      const content = await fs.readFile(filePath, this.options.encoding)

      // 根据文件扩展名解析内容
      const config = await this.parseContent(content, filePath)

      this.emit('loaded', { file: filePath, config })
      return config
    }
    catch (error) {
      this.emit('error', { file: filePath, error })
      throw error
    }
  }

  /**
   * 加载多个配置文件
   */
  async loadMultiple(configFiles: string[]): Promise<Record<string, unknown>> {
    const configs = await Promise.all(configFiles.map(file => this.load(file)))

    // 合并所有配置
    return configs.reduce<Record<string, unknown>>((merged, config) => {
      return { ...merged, ...config }
    }, {})
  }

  /**
   * 保存配置到文件
   */
  async save(configFile: string, config: Record<string, unknown>): Promise<void> {
    const filePath = this.resolveConfigPath(configFile)

    try {
      // 确保目录存在
      await FileSystem.ensureDir(dirname(filePath))

      // 根据文件扩展名序列化内容
      const content = this.serializeContent(config, filePath)

      // 写入文件
      await fs.writeFile(filePath, content, this.options.encoding)

      this.emit('saved', { file: filePath, config })
    }
    catch (error) {
      this.emit('error', { file: filePath, error })
      throw error
    }
  }

  /**
   * 解析文件内容
   */
  private async parseContent(content: string, filePath: string): Promise<Record<string, unknown>> {
    const ext = extname(filePath).toLowerCase()

    switch (ext) {
      case '.json':
        return this.parseJSON(content)

      case '.json5':
        return this.parseJSON5(content)

      case '.yaml':
      case '.yml':
        return this.parseYAML(content)

      case '.toml':
        return this.parseTOML(content)

      case '.js':
      case '.mjs':
      case '.cjs':
        return this.parseJavaScript(filePath)

      case '.ts':
      case '.mts':
      case '.cts':
        return this.parseTypeScript(filePath)

      case '.ini':
        return this.parseINI(content)

      case '.env':
      case '.env.local':
      case '.env.development':
      case '.env.production':
      case '.env.test':
        return this.parseEnv(content)

      default:
        // 尝试作为 JSON 解析
        try {
          return this.parseJSON(content)
        }
        catch {
          throw new Error(`Unsupported configuration file format: ${ext}`)
        }
    }
  }

  /**
   * 序列化配置内容
   */
  private serializeContent(config: Record<string, unknown>, filePath: string): string {
    const ext = extname(filePath).toLowerCase()

    switch (ext) {
      case '.json':
        return JSON.stringify(config, null, 2)

      case '.yaml':
      case '.yml':
        return this.serializeYAML(config)

      case '.toml':
        return this.serializeTOML(config)

      case '.ini':
        return this.serializeINI(config)

      case '.env':
        return this.serializeEnv(config)

      default:
        return JSON.stringify(config, null, 2)
    }
  }

  /**
   * 解析 JSON
   */
  private parseJSON(content: string): Record<string, unknown> {
    try {
      const parsed = JSON.parse(content) as unknown
      if (this.isRecord(parsed)) {
        return parsed
      }
      throw new Error('Top-level JSON must be an object')
    }
    catch (error) {
      throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 解析 JSON5
   */
  private parseJSON5(content: string): Record<string, unknown> {
    try {
      const parsed = JSON5.parse(content) as unknown
      if (this.isRecord(parsed)) {
        return parsed
      }
      throw new Error('Top-level JSON5 must be an object')
    }
    catch (error) {
      throw new Error(
        `Invalid JSON5 format: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * 解析 YAML
   */
  private parseYAML(_content: string): Record<string, unknown> {
    try {
      // 这里应该使用 yaml 库，但为了避免依赖，我们提供一个基础实现
      // 在实际使用中，建议安装 js-yaml 库
      throw new Error('YAML parsing requires js-yaml library. Please install it.')
    }
    catch (error) {
      throw new Error(`Invalid YAML format: ${error}`)
    }
  }

  /**
   * 解析 TOML
   */
  private parseTOML(_content: string): Record<string, unknown> {
    try {
      // 这里应该使用 toml 库，但为了避免依赖，我们提供一个基础实现
      // 在实际使用中，建议安装 @iarna/toml 库
      throw new Error('TOML parsing requires @iarna/toml library. Please install it.')
    }
    catch (error) {
      throw new Error(`Invalid TOML format: ${error}`)
    }
  }

  /**
   * 解析 JavaScript 模块
   */
  private async parseJavaScript(filePath: string): Promise<Record<string, unknown>> {
    try {
      // 动态导入 JavaScript 配置文件
      const module = (await import(filePath)) as { default?: unknown }
      const exported = module.default ?? (module as unknown)
      if (this.isRecord(exported)) {
        return exported
      }
      throw new Error('JavaScript config must export an object (default or module)')
    }
    catch (error) {
      throw new Error(`Failed to load JavaScript config: ${error}`)
    }
  }

  /**
   * 解析 TypeScript 模块
   */
  private async parseTypeScript(_filePath: string): Promise<Record<string, unknown>> {
    try {
      // 这里需要 TypeScript 编译支持
      // 在实际使用中，可能需要使用 ts-node 或预编译
      throw new Error('TypeScript config loading requires ts-node or pre-compilation')
    }
    catch (error) {
      throw new Error(`Failed to load TypeScript config: ${error}`)
    }
  }

  /**
   * 解析 INI 格式
   */
  private parseINI(content: string): Record<string, unknown> {
    const config: Record<string, unknown> = {}
    let currentSection = ''

    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()

      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) {
        continue
      }

      // 处理节
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentSection = trimmed.slice(1, -1)
        if (!this.isRecord(config[currentSection])) {
          config[currentSection] = {}
        }
        continue
      }

      // 处理键值对
      const equalIndex = trimmed.indexOf('=')
      if (equalIndex > 0) {
        const key = trimmed.slice(0, equalIndex).trim()
        const value = trimmed.slice(equalIndex + 1).trim()

        if (currentSection) {
          const section = config[currentSection] as Record<string, unknown>
          section[key] = this.parseValue(value)
        }
        else {
          config[key] = this.parseValue(value)
        }
      }
    }

    return config
  }

  /**
   * 解析环境变量格式
   */
  private parseEnv(content: string): Record<string, unknown> {
    const config: Record<string, unknown> = {}
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
          value = value.slice(1, -1)
        }

        config[key] = value
      }
    }

    return config
  }

  /**
   * 解析值类型
   */
  private parseValue(value: string): string | number | boolean {
    // 移除引号
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith('\'') && value.endsWith('\''))
    ) {
      return value.slice(1, -1)
    }

    // 布尔值
    if (value.toLowerCase() === 'true')
      return true
    if (value.toLowerCase() === 'false')
      return false

    // 数字
    if (/^\d+$/.test(value))
      return Number.parseInt(value, 10)
    if (/^\d+\.\d+$/.test(value))
      return Number.parseFloat(value)

    return value
  }

  /**
   * 序列化 YAML
   */
  private serializeYAML(_config: Record<string, unknown>): string {
    // 基础 YAML 序列化实现
    // 在实际使用中，建议使用 js-yaml 库
    throw new Error('YAML serialization requires js-yaml library. Please install it.')
  }

  /**
   * 序列化 TOML
   */
  private serializeTOML(_config: Record<string, unknown>): string {
    // 基础 TOML 序列化实现
    // 在实际使用中，建议使用 @iarna/toml 库
    throw new Error('TOML serialization requires @iarna/toml library. Please install it.')
  }

  /**
   * 序列化 INI
   */
  private serializeINI(config: Record<string, unknown>): string {
    let content = ''

    for (const [key, value] of Object.entries(config)) {
      if (this.isRecord(value)) {
        content += `[${key}]\n`
        for (const [subKey, subValue] of Object.entries(value)) {
          content += `${subKey}=${String(subValue)}\n`
        }
        content += '\n'
      }
      else {
        content += `${key}=${String(value)}\n`
      }
    }

    return content
  }

  /**
   * 序列化环境变量格式
   */
  private serializeEnv(config: Record<string, unknown>): string {
    let content = ''

    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string' && value.includes(' ')) {
        content += `${key}="${value}"\n`
      }
      else {
        content += `${key}=${String(value)}\n`
      }
    }

    return content
  }

  /**
   * 解析配置文件路径
   */
  private resolveConfigPath(configFile: string): string {
    if (isAbsolute(configFile)) {
      return configFile
    }

    return resolve(this.options.configDir, configFile)
  }

  /**
   * 简单对象类型守卫
   */
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  /**
   * 导出配置
   */
  export(
    config: Record<string, unknown>,
    format: 'json' | 'json5' | 'yaml' | 'toml' | 'ini' | 'env',
  ): string {
    switch (format) {
      case 'json':
        return JSON.stringify(config, null, 2)
      case 'json5':
        return JSON5.stringify(config, null, 2)
      case 'yaml':
        return this.serializeYAML(config)
      case 'toml':
        return this.serializeTOML(config)
      case 'ini':
        return this.serializeINI(config)
      case 'env':
        return this.serializeEnv(config)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * 导入配置
   */
  import(
    data: string,
    format: 'json' | 'json5' | 'yaml' | 'toml' | 'ini' | 'env',
  ): Record<string, unknown> {
    switch (format) {
      case 'json':
        return this.parseJSON(data)
      case 'json5':
        return this.parseJSON5(data)
      case 'yaml':
        return this.parseYAML(data)
      case 'toml':
        return this.parseTOML(data)
      case 'ini':
        return this.parseINI(data)
      case 'env':
        return this.parseEnv(data)
      default:
        throw new Error(`Unsupported import format: ${format}`)
    }
  }

  /**
   * 创建配置加载器实例
   */
  static create(options?: ConfigLoaderOptions): ConfigLoader {
    return new ConfigLoader(options)
  }
}
