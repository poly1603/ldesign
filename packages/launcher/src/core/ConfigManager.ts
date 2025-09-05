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
import type { ViteLauncherConfig } from '../types'
import { DEFAULT_VITE_LAUNCHER_CONFIG } from '../constants'
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
