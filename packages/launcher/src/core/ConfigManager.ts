/**
 * 配置管理器
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events'
import { Logger } from '../utils/logger'
import { FileSystem } from '../utils/file-system'
import { PathUtils } from '../utils/path-utils'
import { environmentManager } from '../utils/env'
import type { ViteLauncherConfig, ProjectPreset } from '../types'
import { DEFAULT_VITE_LAUNCHER_CONFIG } from '../constants'
import { configPresets } from './ConfigPresets'
import { pathToFileURL } from 'url'

export interface ConfigManagerOptions {
  configFile?: string
  watch?: boolean
  logger?: Logger
}

export class ConfigManager extends EventEmitter {
  private configFile?: string
  private logger: Logger
  private config: ViteLauncherConfig = {}

  constructor(options: ConfigManagerOptions = {}) {
    super()

    this.configFile = options.configFile
    this.logger = options.logger || new Logger('ConfigManager')

    // 注意：watch 功能暂未实现，预留接口
    if (options.watch) {
      this.logger.debug('文件监听功能暂未实现')
    }
  }

  /**
   * 加载配置文件
   */
  async loadConfig(configPath?: string): Promise<ViteLauncherConfig> {
    const filePath = configPath || this.configFile

    if (!filePath) {
      this.logger.warn('未指定配置文件路径，使用默认配置')
      return this.config
    }

    try {
      if (!(await FileSystem.exists(filePath))) {
        this.logger.warn(`配置文件不存在: ${filePath}`)
        return this.config
      }

      // 动态导入配置文件
      const absolutePath = PathUtils.resolve(filePath)

      let loadedConfig: any = null

      // 对于 TypeScript 文件，先编译再导入
      if (filePath.endsWith('.ts')) {
        try {
          // 使用 jiti 处理 TypeScript 文件
          const jiti = require('jiti')
          const jitiLoader = jiti(process.cwd(), {
            cache: false,
            requireCache: false,
            interopDefault: true,
            esmResolve: true
          })

          const configModule = jitiLoader(absolutePath)
          loadedConfig = configModule?.default || configModule

          // 验证加载的配置
          if (!loadedConfig || typeof loadedConfig !== 'object') {
            throw new Error('配置文件必须导出一个对象')
          }

        } catch (jitiError) {
          this.logger.warn('TypeScript 配置文件通过 jiti 加载失败，尝试使用 TS 转译后动态导入', {
            error: (jitiError as Error).message
          })

          // 进一步降级：使用 TypeScript 转译为 ESM 后再导入
          try {
            const configModule = await this.transpileTsAndImport(absolutePath)
            loadedConfig = (configModule && (configModule as any).default) || configModule
          } catch (tsFallbackErr) {
            this.logger.warn('TS 转译导入失败，使用默认配置', {
              error: (tsFallbackErr as Error).message
            })
            // 最终降级处理：使用默认配置
            loadedConfig = DEFAULT_VITE_LAUNCHER_CONFIG
          }
        }
      } else {
        // JS/MJS/CJS：优先使用动态 import，兼容 ESM 与 CJS
        try {
          const url = pathToFileURL(absolutePath).href
          const configModule = await import(url)
          loadedConfig = (configModule && (configModule as any).default) || configModule

          this.logger.debug('配置模块加载结果', {
            type: typeof configModule,
            hasDefault: !!(configModule && (configModule as any).default),
            keys: configModule ? Object.keys(configModule as any) : []
          })
        } catch (importErr) {
          // 可能是文件编码或 Node 解析问题，尝试以 UTF-8 重编码后再导入
          try {
            const tempUrl = await this.reencodeAndTempImport(absolutePath)
            const configModule = await import(tempUrl)
            loadedConfig = (configModule && (configModule as any).default) || configModule

            this.logger.debug('配置模块经临时重编码后加载成功')
          } catch (fallbackErr) {
            this.logger.warn('动态 import 失败，降级使用 require', {
              error: (importErr as Error).message
            })
            // 最后回退到 require（主要用于 .cjs 或老环境）
            // 注意：在 ESM-only 的项目中，这一步仍可能失败
            // 因此外层会兜底使用默认配置
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const required = require(absolutePath)
            loadedConfig = (required && required.default) || required
          }
        }
      }

      // 确保配置对象有效
      if (!loadedConfig || typeof loadedConfig !== 'object') {
        this.logger.warn('配置文件格式无效，使用默认配置')
        loadedConfig = DEFAULT_VITE_LAUNCHER_CONFIG
      }

      this.config = loadedConfig

      this.logger.success(`配置文件加载成功: ${filePath}`)

      this.emit('configLoaded', this.config)
      return this.config

    } catch (error) {
      const message = `加载配置文件失败: ${filePath}`
      this.logger.error(message, {
        error: (error as Error).message,
        suggestion: '请检查配置文件语法或使用 launcher.config.js 格式'
      })

      // 提供降级处理
      this.logger.warn('使用默认配置继续运行')
      this.config = DEFAULT_VITE_LAUNCHER_CONFIG
      return this.config
    }
  }

  /**
   * 保存配置文件
   */
  async saveConfig(config: ViteLauncherConfig, configPath?: string): Promise<void> {
    const filePath = configPath || this.configFile

    if (!filePath) {
      throw new Error('未指定配置文件路径')
    }

    try {
      // 格式化配置内容
      const configContent = this.formatConfigContent(config)

      // 写入文件
      await FileSystem.writeFile(filePath, configContent)

      this.config = config
      this.logger.success(`配置文件保存成功: ${filePath}`)

      this.emit('configSaved', this.config)

    } catch (error) {
      const message = `保存配置文件失败: ${filePath}`
      this.logger.error(message, error)
      throw error
    }
  }

  /**
   * 合并配置
   */
  mergeConfig(baseConfig: ViteLauncherConfig, userConfig: ViteLauncherConfig): ViteLauncherConfig {
    return this.deepMerge(baseConfig, userConfig)
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<ViteLauncherConfig>): void {
    const newConfig = this.mergeConfig(this.config, updates)
    const oldConfig = { ...this.config }
    this.config = newConfig

    this.emit('configUpdated', this.config, oldConfig)
    this.logger.info('配置已更新')
  }

  /**
   * 获取当前配置
   */
  getConfig(): ViteLauncherConfig {
    return { ...this.config }
  }

  /**
   * 销毁配置管理器
   */
  destroy(): void {
    this.removeAllListeners()
    this.logger.info('ConfigManager 已销毁')
  }

  /**
   * 处理配置继承
   */
  async resolveExtends(config: ViteLauncherConfig, basePath: string): Promise<ViteLauncherConfig> {
    if (!config.launcher?.extends) {
      return config
    }

    const extendsConfig = config.launcher.extends
    const extendsArray = Array.isArray(extendsConfig) ? extendsConfig : [extendsConfig]
    let resolvedConfig = { ...config }

    for (const extendPath of extendsArray) {
      try {
        let baseConfig: ViteLauncherConfig

        // 检查是否是预设名称
        if (configPresets.has(extendPath as ProjectPreset)) {
          baseConfig = configPresets.getConfig(extendPath as ProjectPreset)!
          this.logger.debug(`应用预设配置: ${extendPath}`)
        } else {
          // 作为文件路径处理
          const configPath = PathUtils.isAbsolute(extendPath)
            ? extendPath
            : PathUtils.resolve(basePath, extendPath)

          baseConfig = await this.loadConfig(configPath)
          this.logger.debug(`继承配置文件: ${extendPath}`)
        }

        // 深度合并配置
        resolvedConfig = this.deepMerge(baseConfig, resolvedConfig)
      } catch (error) {
        this.logger.warn(`配置继承失败: ${extendPath}`, error)
      }
    }

    return resolvedConfig
  }

  /**
   * 应用预设配置
   */
  async applyPreset(config: ViteLauncherConfig, preset: ProjectPreset): Promise<ViteLauncherConfig> {
    try {
      const presetConfig = configPresets.getConfig(preset)
      if (!presetConfig) {
        throw new Error(`未找到预设: ${preset}`)
      }

      this.logger.info(`应用预设配置: ${preset}`)
      return this.deepMerge(presetConfig, config)
    } catch (error) {
      this.logger.error(`应用预设配置失败: ${preset}`, error)
      throw error
    }
  }

  /**
   * 自动检测并应用项目预设
   */
  async autoDetectPreset(cwd: string = process.cwd()): Promise<ProjectPreset | null> {
    try {
      const detectedPreset = await configPresets.detectProjectType(cwd)
      if (detectedPreset) {
        this.logger.info(`检测到项目类型: ${detectedPreset}`)
        return detectedPreset
      }
      return null
    } catch (error) {
      this.logger.warn('项目类型检测失败', error)
      return null
    }
  }

  /**
   * 处理环境变量配置
   */
  async processEnvironmentConfig(config: ViteLauncherConfig, cwd: string): Promise<ViteLauncherConfig> {
    if (!config.launcher?.env) {
      return config
    }

    try {
      await environmentManager.loadConfig(config.launcher.env, cwd)
      this.logger.info('环境变量配置处理完成')

      // 更新配置中的环境变量引用
      return this.resolveEnvironmentVariables(config)
    } catch (error) {
      this.logger.warn('环境变量配置处理失败', error)
      return config
    }
  }

  /**
   * 解析配置中的环境变量引用
   */
  private resolveEnvironmentVariables(config: ViteLauncherConfig): ViteLauncherConfig {
    const resolveValue = (value: any): any => {
      if (typeof value === 'string') {
        // 解析环境变量引用 ${VAR_NAME} 或 $VAR_NAME
        return value.replace(/\$\{([^}]+)\}/g, (match, varName) => {
          return process.env[varName] || match
        }).replace(/\$([A-Z_][A-Z0-9_]*)/g, (match, varName) => {
          return process.env[varName] || match
        })
      } else if (Array.isArray(value)) {
        return value.map(resolveValue)
      } else if (value && typeof value === 'object') {
        const resolved: any = {}
        for (const [key, val] of Object.entries(value)) {
          resolved[key] = resolveValue(val)
        }
        return resolved
      }
      return value
    }

    return resolveValue(config)
  }

  /**
   * 生成配置文件模板
   */
  async generateConfigTemplate(
    preset: ProjectPreset,
    filePath: string,
    options: {
      typescript?: boolean
      includeComments?: boolean
    } = {}
  ): Promise<void> {
    const { typescript = true, includeComments = true } = options
    
    const presetConfig = configPresets.getConfig(preset)
    if (!presetConfig) {
      throw new Error(`未找到预设: ${preset}`)
    }

    const content = this.generateConfigFileContent(
      presetConfig,
      typescript,
      includeComments,
      preset
    )

    await FileSystem.writeFile(filePath, content)
    this.logger.success(`配置文件模板生成成功: ${filePath}`)
  }

  /**
   * 生成配置文件内容（增强版）
   */
  private generateConfigFileContent(
    config: ViteLauncherConfig,
    isTypeScript: boolean,
    includeComments: boolean,
    preset?: ProjectPreset
  ): string {
    const typeImport = isTypeScript
      ? "import { defineConfig } from '@ldesign/launcher'\n\n"
      : ''

    const comments = includeComments ? this.generateConfigComments(preset) : ''
    
    const configString = JSON.stringify(config, null, 2)
      .replace(/"([^"]+)":/g, '$1:') // 移除属性名的引号
      .replace(/"/g, "'") // 使用单引号

    return `${typeImport}${comments}export default defineConfig(${configString})\n`
  }

  /**
   * 生成配置注释
   */
  private generateConfigComments(preset?: ProjectPreset): string {
    const presetInfo = preset ? configPresets.get(preset) : null
    
    return `/**
 * @ldesign/launcher 配置文件
 * 
${presetInfo ? ` * 项目类型: ${presetInfo.description}\n` : ''}${presetInfo ? ` * 预设插件: ${presetInfo.plugins.join(', ')}\n` : ''} * 
 * @see https://github.com/ldesign/launcher
 */\n\n`
  }

  /**
   * 验证配置完整性
   */
  validateConfigIntegrity(config: ViteLauncherConfig): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 验证基本结构
      if (!config || typeof config !== 'object') {
        errors.push('配置必须是一个对象')
        return { valid: false, errors, warnings }
      }

      // 验证预设配置
      if (config.launcher?.preset && !configPresets.has(config.launcher.preset)) {
        errors.push(`未知的预设类型: ${config.launcher.preset}`)
      }

      // 验证继承配置
      if (config.launcher?.extends) {
        const extendsArray = Array.isArray(config.launcher.extends)
          ? config.launcher.extends
          : [config.launcher.extends]
        
        for (const extendPath of extendsArray) {
          if (typeof extendPath !== 'string') {
            errors.push('配置继承路径必须是字符串')
          }
        }
      }

      // 验证环境变量配置
      if (config.launcher?.env) {
        if (config.launcher.env.required && !Array.isArray(config.launcher.env.required)) {
          errors.push('必需环境变量配置必须是字符串数组')
        }
        
        if (config.launcher.env.variables && typeof config.launcher.env.variables !== 'object') {
          errors.push('环境变量配置必须是对象')
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      return {
        valid: false,
        errors: [`配置验证过程中发生错误: ${(error as Error).message}`],
        warnings
      }
    }
  }

  /**
   * 获取推荐的项目脚本
   */
  getRecommendedScripts(preset?: ProjectPreset): Record<string, string> {
    if (preset && configPresets.has(preset)) {
      return configPresets.getScripts(preset) || {}
    }
    
    return {
      dev: 'launcher dev',
      build: 'launcher build',
      preview: 'launcher preview'
    }
  }

  /**
   * 获取推荐的依赖
   */
  getRecommendedDependencies(preset?: ProjectPreset) {
    if (preset && configPresets.has(preset)) {
      return configPresets.getDependencies(preset)
    }
    
    return {
      dependencies: [],
      devDependencies: ['@ldesign/launcher']
    }
  }

  private formatConfigContent(config: ViteLauncherConfig): string {
    return `export default ${JSON.stringify(config, null, 2)}\n`
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }

    return result
  }

  /**
   * 将可能为 UTF-16/含 BOM 的 JS 文件转为 UTF-8 临时文件，并返回其 file URL
   */
  private async reencodeAndTempImport(filePath: string): Promise<string> {
    const buffer = await FileSystem.readBuffer(filePath)

    // 简单 BOM/编码探测
    const hasUtf8Bom = buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf
    const isUtf16LE = buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe
    const isUtf16BE = buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff

    let content: string
    if (isUtf16LE) {
      content = buffer.toString('utf16le')
    } else if (isUtf16BE) {
      // 转成 LE 再到字符串
      const swapped = Buffer.alloc(buffer.length)
      for (let i = 0; i < buffer.length; i += 2) {
        swapped[i] = buffer[i + 1]
        swapped[i + 1] = buffer[i]
      }
      content = swapped.toString('utf16le')
    } else {
      content = buffer.toString('utf8')
      if (hasUtf8Bom) {
        content = content.replace(/^\uFEFF/, '')
      }
    }

    const tempPath = await FileSystem.createTempFile('launcher-config', '.mjs')
    await FileSystem.writeFile(tempPath, content, { encoding: 'utf8' })

    return pathToFileURL(tempPath).href
  }

  /**
   * 使用 TypeScript 将 .ts 配置转译为 ESM 后动态导入
   */
  private async transpileTsAndImport(filePath: string): Promise<any> {
    // 动态引入 typescript，避免作为生产依赖
    let ts: any
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      ts = require('typescript')
    } catch {
      // 如果没有 typescript，直接抛出错误给上层兜底
      throw new Error('缺少依赖: typescript')
    }

    const source = await FileSystem.readFile(filePath, { encoding: 'utf8' })
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.Preserve,
        esModuleInterop: true,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true
      },
      fileName: filePath
    })

    const tempPath = await FileSystem.createTempFile('launcher-config-ts', '.mjs')
    await FileSystem.writeFile(tempPath, transpiled.outputText, { encoding: 'utf8' })

    const url = pathToFileURL(tempPath).href
    return import(url)
  }
}
