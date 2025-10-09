/**
 * 配置管理器
 * 
 * 负责配置文件的加载、验证、合并和监听
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events'
import type {
  BuilderConfig,
  ConfigManagerOptions,
  ConfigLoadOptions,
  ConfigMergeOptions,
  ConfigValidationOptions
} from '../types/config'
import type { ValidationResult } from '../types/common'
import { configLoader } from '../utils/config/config-loader'
import { DEFAULT_BUILDER_CONFIG } from '../constants/defaults'
import { Logger } from '../utils/logger'
import { ErrorHandler, BuilderError } from '../utils/error-handler'
import { ErrorCode } from '../constants/errors'
import { LibraryType } from '../types/library'
import { createAutoConfigEnhancer } from '../utils/auto-config-enhancer'

/**
 * 配置管理器类
 * 
 * 提供配置文件的完整生命周期管理
 */
export class ConfigManager extends EventEmitter {
  private logger: Logger
  private errorHandler: ErrorHandler
  private options: ConfigManagerOptions
  private currentConfig?: BuilderConfig
  private configWatcher?: () => void

  constructor(options: ConfigManagerOptions = {}) {
    super()

    this.options = {
      validateOnLoad: true,
      freezeConfig: false,
      ...options
    }

    this.logger = options.logger || new Logger()
    this.errorHandler = new ErrorHandler({ logger: this.logger })
  }

  /**
   * 加载配置文件
   */
  async loadConfig(options?: ConfigLoadOptions, userConfig?: Partial<BuilderConfig>): Promise<BuilderConfig> {
    // 支持两种调用方式：loadConfig(options) 或 loadConfig(options, userConfig)
    const loadOptions = options || {}
    const providedConfig = userConfig || {}
    try {
      const configPath = loadOptions.configFile || await this.findConfigFile()

      let config: Partial<BuilderConfig> = {}

      // 如果提供了用户配置，直接使用
      if (Object.keys(providedConfig).length > 0) {
        config = providedConfig
      } else if (configPath) {
        this.logger.debug(`加载配置文件: ${configPath}`)
        config = await configLoader.loadConfigFile(configPath)
      } else {
        this.logger.debug('未找到配置文件，使用默认配置')
        config = {}
      }

      // 合并默认配置
      let mergedConfig = this.mergeConfigs(DEFAULT_BUILDER_CONFIG, config as BuilderConfig)

      // 处理环境变量替换
      mergedConfig = this.resolveEnvironmentVariables(mergedConfig)

      // 应用环境特定配置
      if (loadOptions.applyEnvConfig && mergedConfig.env) {
        const envConfig = this.getEnvConfig(mergedConfig)
        if (envConfig) {
          Object.assign(mergedConfig, envConfig)
        }
      }

      // 自动增强配置
      if (loadOptions.autoEnhance !== false) {
        const enhancer = createAutoConfigEnhancer(process.cwd(), this.logger)
        mergedConfig = await enhancer.enhanceConfig(mergedConfig)
      }

      // 验证配置
      if (loadOptions.validate !== false && this.options.validateOnLoad) {
        const validation = this.validateConfig(mergedConfig)
        if (!validation.valid) {
          throw new BuilderError(
            ErrorCode.CONFIG_VALIDATION_ERROR,
            `配置验证失败: ${validation.errors.join(', ')}`
          )
        }
      }

      // 冻结配置（如果启用）
      if (this.options.freezeConfig) {
        Object.freeze(mergedConfig)
      }

      this.currentConfig = mergedConfig

      // 启动配置文件监听
      if (this.options.watch && configPath) {
        await this.startWatching(configPath)
      }

      this.emit('config:loaded', mergedConfig, configPath)

      return mergedConfig

    } catch (error) {
      this.errorHandler.handle(error as Error, 'loadConfig')
      throw error
    }
  }

  /**
   * 验证配置
   */
  validateConfig(config: BuilderConfig, _options: ConfigValidationOptions = {}): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    }

    try {
      // 基础验证 - 检查是否有入口配置（顶层或在 output 中）
      const hasTopLevelInput = !!config.input

      // 检查各格式的 input 配置
      const esmHasInput = config.output?.esm && typeof config.output.esm === 'object' && 'input' in config.output.esm
      const cjsHasInput = config.output?.cjs && typeof config.output.cjs === 'object' && 'input' in config.output.cjs
      const umdHasInput = config.output?.umd && typeof config.output.umd === 'object' && 'input' in config.output.umd
      const hasOutputInput = esmHasInput || cjsHasInput || umdHasInput

      if (!hasTopLevelInput && !hasOutputInput) {
        // 如果没有显式的 input 配置，但有启用的输出格式，也可以使用默认值
        const hasEnabledFormat = (config.output?.esm === true || (config.output?.esm && typeof config.output.esm === 'object')) ||
          (config.output?.cjs === true || (config.output?.cjs && typeof config.output.cjs === 'object')) ||
          (config.output?.umd === true || (config.output?.umd && typeof config.output.umd === 'object'))

        if (!hasEnabledFormat) {
          result.errors.push('缺少入口文件配置（需要在顶层或 output 中指定 input）')
        }
      }

      // 检查空的input
      if (config.input === '') {
        result.errors.push('input 不能为空字符串')
      }

      // 验证 libraryType
      if (config.libraryType) {
        const validLibraryTypes = Object.values(LibraryType)
        if (!validLibraryTypes.includes(config.libraryType as LibraryType)) {
          result.errors.push(`无效的 libraryType: ${config.libraryType}`)
        }
      }

      // 输出配置验证
      if (config.output) {
        if (!config.output.dir && !config.output.file) {
          result.errors.push('输出配置必须指定 dir 或 file')
        }
      }

      // 打包器验证
      if (config.bundler && !['rollup', 'rolldown'].includes(config.bundler)) {
        result.errors.push(`不支持的打包器: ${config.bundler}`)
      }

      // 格式验证
      if (config.output?.format) {
        const formats = Array.isArray(config.output.format)
          ? config.output.format
          : [config.output.format]

        const validFormats = ['esm', 'cjs', 'umd', 'iife', 'css']
        for (const format of formats) {
          if (!validFormats.includes(format)) {
            result.errors.push(`不支持的输出格式: ${format}`)
          }
        }
      }

      // 设置验证结果
      result.valid = result.errors.length === 0

    } catch (error) {
      result.valid = false
      result.errors.push(`配置验证异常: ${(error as Error).message}`)
    }

    return result
  }

  /**
   * 合并配置
   */
  mergeConfigs(base: BuilderConfig, override: BuilderConfig, options: ConfigMergeOptions = {}): BuilderConfig {
    const { deep = true, arrayMergeStrategy = 'replace' } = options

    if (!deep) {
      return { ...base, ...override }
    }

    const result = { ...base }

    for (const [key, value] of Object.entries(override)) {
      if (value === undefined) {
        continue
      }

      if (!(key in result)) {
        (result as any)[key] = value
        continue
      }

      const baseValue = (result as any)[key]

      if (Array.isArray(value) && Array.isArray(baseValue)) {
        switch (arrayMergeStrategy) {
          case 'concat':
            (result as any)[key] = [...baseValue, ...value]
            break
          case 'unique':
            (result as any)[key] = [...new Set([...baseValue, ...value])]
            break
          case 'replace':
          default:
            (result as any)[key] = value
            break
        }
      } else if (
        typeof value === 'object' &&
        value !== null &&
        typeof baseValue === 'object' &&
        baseValue !== null
      ) {
        (result as any)[key] = this.mergeConfigs(baseValue, value, options)
      } else {
        (result as any)[key] = value
      }
    }

    return result
  }

  /**
   * 获取当前配置
   */
  getCurrentConfig(): BuilderConfig | undefined {
    return this.currentConfig
  }

  /**
   * 查找配置文件
   */
  private async findConfigFile(): Promise<string | null> {
    return configLoader.findConfigFile()
  }

  /**
   * 标准化配置
   */
  normalizeConfig(config: Partial<BuilderConfig>): BuilderConfig {
    let normalized = { ...config } as BuilderConfig

    // 标准化输出配置
    if (normalized.output) {
      // 如果output是字符串，转换为对象
      if (typeof normalized.output === 'string') {
        normalized.output = {
          file: normalized.output
        } as any
      }

      // 确保输出配置有 file 属性
      if (typeof normalized.output === 'object' && !normalized.output.file && normalized.output.dir) {
        normalized.output.file = `${normalized.output.dir}/index.js`
      }
    }

    // 标准化插件配置
    if (normalized.plugins && !Array.isArray(normalized.plugins)) {
      normalized.plugins = []
    }

    // 处理环境变量替换
    normalized = this.resolveEnvironmentVariables(normalized)

    return normalized
  }

  /**
   * 解析环境变量
   */
  private resolveEnvironmentVariables(config: BuilderConfig): BuilderConfig {
    const resolved = JSON.parse(JSON.stringify(config))

    const replaceEnvVars = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.replace(/\$\{([^}]+)\}/g, (match, varName) => {
          return process.env[varName] || match
        })
      }

      if (Array.isArray(obj)) {
        return obj.map(replaceEnvVars)
      }

      if (obj && typeof obj === 'object') {
        const result: any = {}
        for (const [key, value] of Object.entries(obj)) {
          result[key] = replaceEnvVars(value)
        }
        return result
      }

      return obj
    }

    return replaceEnvVars(resolved)
  }

  /**
   * 获取环境特定配置
   */
  private getEnvConfig(config: BuilderConfig): Partial<BuilderConfig> | undefined {
    const env = process.env.NODE_ENV || config.mode || 'production'
    return config.env?.[env]
  }

  /**
   * 启动配置文件监听
   */
  private async startWatching(configPath: string): Promise<void> {
    if (this.configWatcher) {
      this.configWatcher()
    }

    this.configWatcher = await configLoader.watchConfigFile(configPath, (newConfig) => {
      this.logger.info('配置文件已更改，重新加载...')

      try {
        const mergedConfig = this.mergeConfigs(DEFAULT_BUILDER_CONFIG, newConfig)
        this.currentConfig = mergedConfig

        this.emit('config:change', mergedConfig, configPath)
        this.logger.success('配置重新加载完成')
      } catch (error) {
        this.logger.error('配置重新加载失败:', error)
        this.emit('config:error', error)
      }
    })
  }

  /**
   * 停止监听
   */
  async dispose(): Promise<void> {
    if (this.configWatcher) {
      this.configWatcher()
      this.configWatcher = undefined
    }

    this.removeAllListeners()
  }
}
