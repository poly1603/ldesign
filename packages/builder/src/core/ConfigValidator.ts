/**
 * 配置验证器
 * 
 * 验证和规范化构建配置
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import path from 'path'
import fs from 'fs'
import type { BuilderConfig } from '../types/config'
import type { MinifyOptions } from '../types/minify'
import { Logger } from '../utils/logger'

export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
  /** 规范化后的配置 */
  normalizedConfig?: BuilderConfig
}

export interface ConfigValidationOptions {
  /** 是否严格模式 */
  strict?: boolean
  /** 是否检查文件存在性 */
  checkFiles?: boolean
  /** 工作目录 */
  cwd?: string
}

export class ConfigValidator {
  private logger: Logger
  private options: ConfigValidationOptions

  constructor(options: ConfigValidationOptions = {}, logger?: Logger) {
    this.options = {
      strict: false,
      checkFiles: true,
      cwd: process.cwd(),
      ...options
    }
    this.logger = logger || new Logger()
  }

  /**
   * 验证配置
   */
  validate(config: Partial<BuilderConfig>): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 使用 logger 以避免未使用成员告警
    this.logger.debug('Validating config...')

    try {
      // 基础验证
      this.validateBasicConfig(config, errors, warnings)
      
      // 输入验证
      this.validateInput(config, errors, warnings)
      
      // 输出验证
      this.validateOutput(config, errors, warnings)
      
      // 打包器验证
      this.validateBundler(config, errors, warnings)
      
      // 压缩配置验证
      this.validateMinifyConfig(config, errors, warnings)
      
      // 外部依赖验证
      this.validateExternal(config, errors, warnings)
      
      // 插件验证
      this.validatePlugins(config, errors, warnings)
      
      // 性能配置验证
      this.validatePerformance(config, errors, warnings)
      
      // 文件存在性验证
      if (this.options.checkFiles) {
        this.validateFileExistence(config, errors, warnings)
      }

      // 规范化配置
      const normalizedConfig = this.normalizeConfig(config)

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        normalizedConfig
      }
    } catch (error) {
      errors.push(`配置验证过程中发生错误: ${(error as Error).message}`)
      return {
        valid: false,
        errors,
        warnings
      }
    }
  }

  /**
   * 验证基础配置
   */
  private validateBasicConfig(config: Partial<BuilderConfig>, errors: string[], _warnings: string[]): void {
    if (!config.input) {
      errors.push('缺少必需的 input 配置')
    }

    if (config.logLevel && !['silent', 'error', 'warn', 'info', 'debug'].includes(config.logLevel)) {
      errors.push(`无效的日志级别: ${config.logLevel}`)
    }

    if (config.mode && !['development', 'production'].includes(config.mode)) {
      errors.push(`无效的构建模式: ${config.mode}`)
    }
  }

  /**
   * 验证输入配置
   */
  private validateInput(config: Partial<BuilderConfig>, errors: string[], _warnings: string[]): void {
    if (!config.input) return

    const input = config.input

    if (typeof input === 'string') {
      // 单入口验证
      if (!input.trim()) {
        errors.push('入口文件路径不能为空')
      }
    } else if (Array.isArray(input)) {
      // 多入口数组验证
      if (input.length === 0) {
        errors.push('入口文件数组不能为空')
      }
      input.forEach((entry, index) => {
        if (typeof entry !== 'string' || !entry.trim()) {
          errors.push(`入口文件数组第 ${index + 1} 项无效`)
        }
      })
    } else if (typeof input === 'object') {
      // 多入口对象验证
      const entries = Object.entries(input)
      if (entries.length === 0) {
        errors.push('入口文件对象不能为空')
      }
      entries.forEach(([key, value]) => {
        if (!key.trim()) {
          errors.push('入口文件对象的键不能为空')
        }
        if (typeof value !== 'string' || !value.trim()) {
          errors.push(`入口文件对象的值 "${key}" 无效`)
        }
      })
    } else {
      errors.push('input 配置必须是字符串、数组或对象')
    }
  }

  /**
   * 验证输出配置
   */
  private validateOutput(config: Partial<BuilderConfig>, errors: string[], _warnings: string[]): void {
    if (!config.output) return

    const output = config.output

    if (output.dir && typeof output.dir !== 'string') {
      errors.push('output.dir 必须是字符串')
    }

    if (output.format) {
      const validFormats = ['esm', 'cjs', 'umd', 'iife']
      const formats = Array.isArray(output.format) ? output.format : [output.format]
      
      formats.forEach(format => {
        if (!validFormats.includes(format)) {
          errors.push(`无效的输出格式: ${format}`)
        }
      })
    }

    if (output.name && typeof output.name !== 'string') {
      errors.push('output.name 必须是字符串')
    }

    if (output.sourcemap !== undefined && typeof output.sourcemap !== 'boolean') {
      errors.push('output.sourcemap 必须是布尔值')
    }
  }

  /**
   * 验证打包器配置
   */
  private validateBundler(config: Partial<BuilderConfig>, errors: string[], _warnings: string[]): void {
    if (config.bundler && !['rollup', 'rolldown', 'auto'].includes(config.bundler)) {
      errors.push(`无效的打包器: ${config.bundler}`)
    }
  }

  /**
   * 验证压缩配置
   */
  private validateMinifyConfig(config: Partial<BuilderConfig>, errors: string[], _warnings: string[]): void {
    if (!config.minify) return

    if (typeof config.minify === 'boolean') {
      return // 布尔值是有效的
    }

    if (typeof config.minify === 'object') {
      const minifyConfig = config.minify as MinifyOptions
      
      if (minifyConfig.level && !['none', 'whitespace', 'basic', 'advanced'].includes(minifyConfig.level)) {
        errors.push(`无效的压缩级别: ${minifyConfig.level}`)
      }

      // 验证 JS 压缩配置
      if (minifyConfig.js && typeof minifyConfig.js === 'object') {
        const jsConfig = minifyConfig.js
        if (jsConfig.minifier && !['terser', 'esbuild', 'swc'].includes(jsConfig.minifier)) {
          errors.push(`无效的 JS 压缩器: ${jsConfig.minifier}`)
        }
      }

      // 验证 CSS 压缩配置
      if (minifyConfig.css && typeof minifyConfig.css === 'object') {
        const cssConfig = minifyConfig.css
        if (cssConfig.minifier && !['cssnano', 'clean-css', 'lightningcss'].includes(cssConfig.minifier)) {
          errors.push(`无效的 CSS 压缩器: ${cssConfig.minifier}`)
        }
      }
    } else {
      errors.push('minify 配置必须是布尔值或对象')
    }
  }

  /**
   * 验证外部依赖配置
   */
  private validateExternal(config: Partial<BuilderConfig>, errors: string[], _warnings: string[]): void {
    if (!config.external) return

    // 允许函数或字符串数组两种形式
    if (typeof config.external === 'function') {
      return
    }

    if (Array.isArray(config.external)) {
      config.external.forEach((dep, index) => {
        if (typeof dep !== 'string') {
          errors.push(`external 鏁扮粍绗?${index + 1} 椤瑰繀椤绘槸瀛楃涓?`)
        }
      })
      return
    }

    errors.push('external 閰嶇疆蹇呴』鏄暟缁勬垨鍑芥暟')
  }

  /**
   * 验证插件配置
   */
  private validatePlugins(config: Partial<BuilderConfig>, errors: string[], _warnings: string[]): void {
    if (!config.plugins) return

    if (!Array.isArray(config.plugins)) {
      errors.push('plugins 配置必须是数组')
      return
    }

    config.plugins.forEach((plugin, index) => {
      if (typeof plugin !== 'object' || plugin === null) {
        errors.push(`plugins 数组第 ${index + 1} 项必须是对象`)
      }
    })
  }

  /**
   * 验证性能配置
   */
  private validatePerformance(config: Partial<BuilderConfig>, errors: string[], _warnings: string[]): void {
    if (!config.performance) return

    const perf = config.performance

    if (perf.treeshaking !== undefined && typeof perf.treeshaking !== 'boolean') {
      errors.push('performance.treeshaking 必须是布尔值')
    }

    if (perf.bundleAnalyzer !== undefined && typeof perf.bundleAnalyzer !== 'boolean') {
      errors.push('performance.bundleAnalyzer 必须是布尔值')
    }
  }

  /**
   * 验证文件存在性
   */
  private validateFileExistence(config: Partial<BuilderConfig>, errors: string[], _warnings: string[]): void {
    if (!config.input) return

    const checkFile = (filePath: string) => {
      const fullPath = path.resolve(this.options.cwd!, filePath)
      if (!fs.existsSync(fullPath)) {
        errors.push(`入口文件不存在: ${filePath}`)
      }
    }

    if (typeof config.input === 'string') {
      checkFile(config.input)
    } else if (Array.isArray(config.input)) {
      config.input.forEach(checkFile)
    } else if (typeof config.input === 'object') {
      Object.values(config.input).forEach(checkFile)
    }
  }

  /**
   * 规范化配置
   */
  private normalizeConfig(config: Partial<BuilderConfig>): BuilderConfig {
    const normalized: BuilderConfig = {
      input: config.input || 'src/index.ts',
      output: {
        dir: 'dist',
        format: 'esm',
        sourcemap: true,
        ...config.output
      },
      bundler: (config.bundler === 'rollup' || config.bundler === 'rolldown') ? config.bundler : undefined,
      mode: config.mode || 'production',
      minify: config.minify ?? true,
      external: config.external || [],
      plugins: config.plugins || [],
      clean: config.clean ?? true,
      logLevel: config.logLevel || 'info',
      performance: {
        treeshaking: true,
        bundleAnalyzer: false,
        ...config.performance
      },
      ...config
    }

    return normalized
  }

  /**
   * 获取配置建议
   */
  getSuggestions(config: Partial<BuilderConfig>): string[] {
    const suggestions: string[] = []

    // 性能建议
    if (!config.performance?.treeshaking) {
      suggestions.push('建议启用 Tree Shaking 以减少包体积')
    }

    if (config.mode === 'production' && !config.minify) {
      suggestions.push('生产模式建议启用代码压缩')
    }

    // 输出格式建议
    if (config.output?.format === 'umd' && !config.output?.name) {
      suggestions.push('UMD 格式需要指定全局变量名 (output.name)')
    }

    // 源码映射建议
    if (config.mode === 'development' && config.output?.sourcemap === false) {
      suggestions.push('开发模式建议启用 source map 以便调试')
    }

    return suggestions
  }
}

/**
 * 创建配置验证器
 */
export function createConfigValidator(options?: ConfigValidationOptions, logger?: Logger): ConfigValidator {
  return new ConfigValidator(options, logger)
}

/**
 * 快速验证配置
 */
export function validateConfig(config: Partial<BuilderConfig>, options?: ConfigValidationOptions): ValidationResult {
  const validator = createConfigValidator(options)
  return validator.validate(config)
}
