/**
 * 配置文件加载器
 */

import path from 'path'
import createJiti from 'jiti'
import { CONFIG_FILE_NAMES } from '../../constants/defaults'
import { exists, readFile } from '../file-system'
import type { BuilderConfig, ConfigFileInfo, ConfigFileType } from '../../types/config'
import { ErrorCode } from '../../constants/errors'
import { BuilderError } from '../error-handler'

/**
 * 配置文件加载器类
 */
export class ConfigLoader {
  /**
   * 查找配置文件
   */
  async findConfigFile(startDir: string = process.cwd()): Promise<string | null> {
    for (const fileName of CONFIG_FILE_NAMES) {
      const configPath = path.resolve(startDir, fileName)
      if (await exists(configPath)) {
        return configPath
      }
    }
    return null
  }

  /**
   * 获取配置文件信息
   */
  async getConfigFileInfo(configPath: string): Promise<ConfigFileInfo> {
    const fileExists = await exists(configPath)
    const ext = path.extname(configPath)

    let type: ConfigFileType
    switch (ext) {
      case '.ts':
        type = 'ts'
        break
      case '.js':
      case '.mjs':
        type = 'js'
        break
      case '.json':
        type = 'json'
        break
      default:
        type = 'js'
    }

    const info: ConfigFileInfo = {
      path: configPath,
      type,
      exists: fileExists
    }

    if (fileExists) {
      try {
        const stats = await import('fs').then(fs => fs.promises.stat(configPath))
        info.mtime = stats.mtime
        info.size = stats.size
      } catch {
        // 忽略获取文件信息失败的错误
      }
    }

    return info
  }

  /**
   * 加载配置文件
   */
  async loadConfigFile(configPath: string): Promise<BuilderConfig> {
    const info = await this.getConfigFileInfo(configPath)

    if (!info.exists) {
      throw new BuilderError(
        ErrorCode.CONFIG_NOT_FOUND,
        `配置文件不存在: ${configPath}`
      )
    }

    try {
      switch (info.type) {
        case 'ts':
        case 'js':
          return this.loadJSConfig(configPath)
        case 'json':
          return this.loadJSONConfig(configPath)
        default:
          throw new BuilderError(
            ErrorCode.CONFIG_PARSE_ERROR,
            `不支持的配置文件格式: ${info.type}`
          )
      }
    } catch (error) {
      if (error instanceof BuilderError) {
        throw error
      }

      throw new BuilderError(
        ErrorCode.CONFIG_PARSE_ERROR,
        `加载配置文件失败: ${configPath}`,
        { cause: error as Error }
      )
    }
  }

  /**
   * 加载 JavaScript/TypeScript 配置
   */
  private async loadJSConfig(configPath: string): Promise<BuilderConfig> {
    try {
      // 使用 jiti 动态导入，支持 TypeScript
      const jiti = createJiti(import.meta.url, {
        interopDefault: true,
        esmResolve: true,
        cache: false // 禁用缓存以支持配置热重载
      })

      const configModule = await jiti(configPath)

      // 处理不同的导出格式
      let config: BuilderConfig
      if (typeof configModule === 'function') {
        // 函数式配置
        const env: Record<string, string> = Object.fromEntries(
          Object.entries(process.env || {}).map(([k, v]) => [k, v ?? ''])
        )
        config = await configModule({
          mode: process.env.NODE_ENV || 'production',
          bundler: process.env.BUILDER_BUNDLER || 'rollup',
          env
        })
      } else if (configModule && typeof configModule === 'object') {
        // 对象配置
        config = configModule
      } else {
        throw new Error('配置文件必须导出对象或函数')
      }

      return config
    } catch (error) {
      throw new BuilderError(
        ErrorCode.CONFIG_PARSE_ERROR,
        `解析 JavaScript/TypeScript 配置文件失败: ${configPath}`,
        {
          cause: error as Error,
          suggestion: '请检查配置文件语法是否正确'
        }
      )
    }
  }

  /**
   * 加载 JSON 配置
   */
  private async loadJSONConfig(configPath: string): Promise<BuilderConfig> {
    try {
      const content = await readFile(configPath, 'utf-8')

      // 特殊处理 package.json
      if (path.basename(configPath) === 'package.json') {
        const pkg = JSON.parse(content)
        return pkg.builder || {}
      }

      return JSON.parse(content)
    } catch (error) {
      throw new BuilderError(
        ErrorCode.CONFIG_PARSE_ERROR,
        `解析 JSON 配置文件失败: ${configPath}`,
        {
          cause: error as Error,
          suggestion: '请检查 JSON 格式是否正确'
        }
      )
    }
  }

  /**
   * 加载多个配置文件并合并
   */
  async loadMultipleConfigs(configPaths: string[]): Promise<BuilderConfig> {
    const configs: BuilderConfig[] = []

    for (const configPath of configPaths) {
      try {
        const config = await this.loadConfigFile(configPath)
        configs.push(config)
      } catch (error) {
        // 如果是文件不存在，跳过；其他错误抛出
        if (error instanceof BuilderError && error.code === ErrorCode.CONFIG_NOT_FOUND) {
          continue
        }
        throw error
      }
    }

    if (configs.length === 0) {
      return { input: 'src/index.ts' }
    }

    // 合并配置（后面的配置覆盖前面的）
    return configs.reduce((merged, config) => ({
      ...merged,
      ...config
    }), { input: 'src/index.ts' })
  }

  /**
   * 监听配置文件变化
   */
  async watchConfigFile(
    configPath: string,
    callback: (config: BuilderConfig) => void
  ): Promise<() => void> {
    const chokidar = await import('chokidar')

    const watcher = chokidar.watch(configPath, {
      ignoreInitial: true,
      persistent: true
    })

    const handleChange = async () => {
      try {
        const config = await this.loadConfigFile(configPath)
        callback(config)
      } catch (error) {
        console.error('重新加载配置文件失败:', error)
      }
    }

    watcher.on('change', handleChange)
    watcher.on('add', handleChange)

    // 返回清理函数
    return () => {
      watcher.close()
    }
  }

  /**
   * 获取所有可能的配置文件路径
   */
  getAllConfigPaths(baseDir: string = process.cwd()): string[] {
    return CONFIG_FILE_NAMES.map(name => path.resolve(baseDir, name))
  }

  /**
   * 检查配置文件是否存在
   */
  async hasConfigFile(baseDir: string = process.cwd()): Promise<boolean> {
    const configPath = await this.findConfigFile(baseDir)
    return configPath !== null
  }

  /**
   * 获取配置文件的优先级
   */
  getConfigFilePriority(configPath: string): number {
    const fileName = path.basename(configPath)
    const index = CONFIG_FILE_NAMES.indexOf(fileName as any)
    return index >= 0 ? index : CONFIG_FILE_NAMES.length
  }

  /**
   * 选择最高优先级的配置文件
   */
  async selectBestConfigFile(baseDir: string = process.cwd()): Promise<string | null> {
    const allPaths = this.getAllConfigPaths(baseDir)
    const existingPaths: Array<{ path: string; priority: number }> = []

    for (const configPath of allPaths) {
      if (await exists(configPath)) {
        existingPaths.push({
          path: configPath,
          priority: this.getConfigFilePriority(configPath)
        })
      }
    }

    if (existingPaths.length === 0) {
      return null
    }

    // 按优先级排序，返回优先级最高的
    existingPaths.sort((a, b) => a.priority - b.priority)
    return existingPaths[0].path
  }
}

/**
 * 默认配置加载器实例
 */
export const configLoader = new ConfigLoader()

/**
 * 便捷函数：查找配置文件
 */
export function findConfigFile(startDir?: string): Promise<string | null> {
  return configLoader.findConfigFile(startDir)
}

/**
 * 便捷函数：加载配置文件
 */
export function loadConfigFile(configPath: string): Promise<BuilderConfig> {
  return configLoader.loadConfigFile(configPath)
}

/**
 * 定义配置的上下文参数
 */
export interface DefineConfigContext {
  mode: 'development' | 'production' | string
  bundler: 'rollup' | 'rolldown'
  env: Record<string, string>
}

/**
 * 便捷函数：定义配置
 * 
 * @param config - 构建配置对象或返回配置的函数
 * @returns 配置对象或函数
 * 
 * @example
 * // 对象配置
 * export default defineConfig({
 *   input: 'src/index.ts',
 *   output: {
 *     esm: true,
 *     cjs: true,
 *     umd: { name: 'MyLib' }
 *   }
 * })
 * 
 * @example
 * // 函数配置
 * export default defineConfig((context) => ({
 *   input: 'src/index.ts',
 *   minify: context.mode === 'production'
 * }))
 */
export function defineConfig(
  config: BuilderConfig | ((context: DefineConfigContext) => BuilderConfig | Promise<BuilderConfig>)
): BuilderConfig | ((context: DefineConfigContext) => BuilderConfig | Promise<BuilderConfig>) {
  return config
}

/**
 * 便捷函数：定义异步配置
 * 用于异步计算配置（例如读取远程/本地元数据后生成配置）
 */
export function defineAsyncConfig(
  config:
    | Promise<BuilderConfig>
    | ((context: DefineConfigContext) => Promise<BuilderConfig> | BuilderConfig)
): Promise<BuilderConfig> | ((context: DefineConfigContext) => Promise<BuilderConfig> | BuilderConfig) {
  return config as any
}
