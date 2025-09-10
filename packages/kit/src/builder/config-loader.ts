/**
 * 配置文件加载器
 *
 * 负责自动发现和加载构建配置文件
 */

import type { BuildOptions, ConfigFile } from './types'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * 支持的配置文件名
 */
const CONFIG_FILES = [
  'builder.config.ts',
  'builder.config.js',
  'builder.config.mjs',
  'ldesign.config.ts',
  'ldesign.config.js',
  'ldesign.config.mjs',
  'rollup.config.ts',
  'rollup.config.js',
  'rollup.config.mjs',
]

/**
 * 配置文件加载器
 */
export class ConfigLoader {
  private cwd: string

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd
  }

  /**
   * 自动发现配置文件
   */
  async discoverConfig(): Promise<ConfigFile | null> {
    for (const fileName of CONFIG_FILES) {
      const configPath = path.resolve(this.cwd, fileName)

      if (fs.existsSync(configPath)) {
        try {
          const config = await this.loadConfig(configPath)
          return {
            path: configPath,
            config,
            exists: true,
          }
        }
        catch (error) {
          console.warn(`Failed to load config file ${configPath}:`, error)
          continue
        }
      }
    }

    return null
  }

  /**
   * 加载指定的配置文件
   */
  async loadConfigFile(configPath: string): Promise<ConfigFile> {
    const resolvedPath = path.resolve(this.cwd, configPath)

    if (!fs.existsSync(resolvedPath)) {
      return {
        path: resolvedPath,
        config: {},
        exists: false,
      }
    }

    try {
      const config = await this.loadConfig(resolvedPath)
      return {
        path: resolvedPath,
        config,
        exists: true,
      }
    }
    catch (error) {
      throw new Error(`Failed to load config file ${resolvedPath}: ${error}`)
    }
  }

  /**
   * 加载配置文件内容
   */
  private async loadConfig(configPath: string): Promise<BuildOptions> {
    const ext = path.extname(configPath)

    if (ext === '.ts') {
      // 使用 jiti 加载 TypeScript 配置文件
      const jiti = await import('jiti').then(m => m.default)
      const load = jiti(configPath, {
        esmResolve: true,
        interopDefault: true,
      })

      const config = await load(configPath)
      return this.normalizeConfig(config)
    }
    else if (ext === '.mjs' || (ext === '.js' && this.isESModule(configPath))) {
      // 加载 ES 模块
      const fileUrl = pathToFileURL(configPath).href
      const module = await import(fileUrl)
      const config = module.default || module
      return this.normalizeConfig(config)
    }
    else {
      // 加载 CommonJS 模块（通过动态导入并添加时间戳避免缓存）
      const fileUrl = pathToFileURL(configPath).href
      const module = await import(`${fileUrl}?t=${Date.now()}`)
      const config = (module as any).default ?? module
      return this.normalizeConfig(config)
    }
  }

  /**
   * 检查是否为 ES 模块
   */
  private isESModule(configPath: string): boolean {
    const packageJsonPath = this.findPackageJson(path.dirname(configPath))

    if (packageJsonPath) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
        return packageJson.type === 'module'
      }
      catch {
        return false
      }
    }

    return false
  }

  /**
   * 查找 package.json 文件
   */
  private findPackageJson(dir: string): string | null {
    const packageJsonPath = path.join(dir, 'package.json')

    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath
    }

    const parentDir = path.dirname(dir)
    if (parentDir === dir) {
      return null
    }

    return this.findPackageJson(parentDir)
  }

  /**
   * 规范化配置对象
   */
  private normalizeConfig(config: any): BuildOptions {
    // 如果配置是函数，则调用它
    if (typeof config === 'function') {
      config = config()
    }

    // 如果配置是 Promise，则等待它
    if (config && typeof config.then === 'function') {
      throw new Error('Async config functions are not supported yet')
    }

    // 确保返回有效的配置对象
    if (!config || typeof config !== 'object') {
      return {}
    }

    return config as BuildOptions
  }

  /**
   * 合并配置
   */
  mergeConfig(baseConfig: BuildOptions, overrides: Partial<BuildOptions>): BuildOptions {
    return {
      ...baseConfig,
      ...overrides,
      // 特殊处理数组和对象字段
      external: overrides.external || baseConfig.external,
      globals: {
        ...(baseConfig.globals || {}),
        ...(overrides.globals || {}),
      },
      plugins: [
        ...(baseConfig.plugins || []),
        ...(overrides.plugins || []),
      ],
      rollupOptions: {
        ...(baseConfig.rollupOptions || {}),
        ...(overrides.rollupOptions || {}),
      },
      output: overrides.output || baseConfig.output,
    }
  }
}
