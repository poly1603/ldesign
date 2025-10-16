/**
 * Package.json 自动更新工具
 * 
 * 负责在构建完成后自动更新 package.json 的 exports、main、module、types、files 等字段
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { promises as fs } from 'fs'
import path from 'path'
import { Logger } from './logger'

/**
 * Package.json 更新配置
 */
export interface PackageUpdaterConfig {
  /** 项目根目录 */
  projectRoot: string
  /** 源码目录，默认为 'src' */
  srcDir?: string
  /** 输出目录配置 */
  outputDirs?: {
    /** ESM 输出目录，默认为 'es' */
    esm?: string
    /** CJS 输出目录，默认为 'lib' */
    cjs?: string
    /** UMD 输出目录，默认为 'dist' */
    umd?: string
    /** 类型声明目录，默认为 'types' 或与 esm 相同 */
    types?: string
  }
  /** 是否启用自动 exports 生成 */
  autoExports?: boolean
  /** 是否更新 main/module/types 字段 */
  updateEntryPoints?: boolean
  /** 是否更新 files 字段 */
  updateFiles?: boolean
  /** 自定义 exports 配置 */
  customExports?: Record<string, any>
  /** 日志记录器 */
  logger?: Logger
}

/**
 * Package.json 更新器
 */
export class PackageUpdater {
  private config: Required<PackageUpdaterConfig>
  private logger: Logger

  constructor(config: PackageUpdaterConfig) {
    this.config = {
      projectRoot: config.projectRoot,
      srcDir: config.srcDir || 'src',
      outputDirs: {
        esm: 'es',
        cjs: 'lib',
        umd: 'dist',
        types: 'es',
        ...config.outputDirs
      },
      autoExports: config.autoExports ?? true,
      updateEntryPoints: config.updateEntryPoints ?? true,
      updateFiles: config.updateFiles ?? true,
      customExports: config.customExports || {},
      logger: config.logger || new Logger()
    }
    this.logger = this.config?.logger
  }

  /**
   * 执行 package.json 更新
   */
  async update(): Promise<void> {
    try {
      this.logger.info('开始更新 package.json...')

      const packageJsonPath = path.join(this.config?.projectRoot, 'package.json')
      const packageJson = await this.readPackageJson(packageJsonPath)

      if (this.config?.autoExports) {
        packageJson.exports = await this.generateExports()
      }

      if (this.config?.updateEntryPoints) {
        this.updateEntryPoints(packageJson)
      }

      if (this.config?.updateFiles) {
        packageJson.files = await this.generateFiles()
      }

      // 优化字段排序
      const sortedPackageJson = this.sortPackageJsonFields(packageJson)

      await this.writePackageJson(packageJsonPath, sortedPackageJson)
      this.logger.success('package.json 更新完成')

    } catch (error) {
      this.logger.error('package.json 更新失败:', error)
      throw error
    }
  }

  /**
   * 扫描 src 目录并生成 exports 配置
   */
  private async generateExports(): Promise<Record<string, any>> {
    const srcPath = path.join(this.config?.projectRoot, this.config?.srcDir)
    const exports: Record<string, any> = {}

    // 主入口
    exports['.'] = this.createExportEntry('index')

    // 只扫描 src 下的直接子目录
    const directDirectories = await this.scanDirectDirectories(srcPath)

    for (const dir of directDirectories) {
      const dirName = path.basename(dir)

      // 检查是否有 TypeScript 文件
      const hasTypeScriptFiles = await this.hasTypeScriptFiles(dir)
      if (hasTypeScriptFiles) {
        // 检查是否有 index 文件
        const hasIndex = await this.hasIndexFile(dir)

        if (hasIndex) {
          // 为有 index.ts 的目录创建导出：package/utils
          exports[`./${dirName}`] = this.createExportEntry(`${dirName}/index`)
        }

        // 支持子目录下的所有文件：package/utils/*
        exports[`./${dirName}/*`] = this.createWildcardExportEntry(dirName)
      }
    }

    // 检测并添加CSS文件exports
    await this.addCssExports(exports)

    // 合并自定义 exports
    return { ...exports, ...this.config?.customExports }
  }

  /**
   * 创建单个 export 条目
   */
  private createExportEntry(relativePath: string): Record<string, string> {
    const { esm, cjs, types } = this.config?.outputDirs
    const entry: Record<string, string> = {}

    // 类型声明 - 使用 types 目录配置
    if (types) {
      entry.types = `./${types}/${relativePath}.d.ts`
    }

    // ESM - 使用 esm 目录配置
    if (esm) {
      entry.import = `./${esm}/${relativePath}.js`
    }

    // CJS - 使用 cjs 目录配置
    if (cjs) {
      entry.require = `./${cjs}/${relativePath}.cjs`
    }

    return entry
  }

  /**
   * 创建通配符 export 条目（支持 package/utils/* 导入）
   */
  private createWildcardExportEntry(dirName: string): Record<string, string> {
    const { esm, cjs, types } = this.config?.outputDirs
    const entry: Record<string, string> = {}

    // 类型声明 - 使用 types 目录配置
    if (types) {
      entry.types = `./${types}/${dirName}/*.d.ts`
    }

    // ESM - 使用 esm 目录配置
    if (esm) {
      entry.import = `./${esm}/${dirName}/*.js`
    }

    // CJS - 使用 cjs 目录配置
    if (cjs) {
      entry.require = `./${cjs}/${dirName}/*.cjs`
    }

    return entry
  }

  /**
   * 扫描 src 下的直接子目录（不递归）
   */
  private async scanDirectDirectories(srcPath: string): Promise<string[]> {
    try {
      const fs = await import('fs')
      const entries = await fs.promises.readdir(srcPath, { withFileTypes: true })
      const directories: string[] = []

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          directories.push(path.join(srcPath, entry.name))
        }
      }

      return directories
    } catch (error) {
      this.logger.warn('扫描直接子目录失败:', error)
      return []
    }
  }



  /**
   * 检查目录是否有 index 文件
   */
  private async hasIndexFile(dir: string): Promise<boolean> {
    const indexFiles = ['index.ts', 'index.js', 'index.vue']

    for (const file of indexFiles) {
      const filePath = path.join(dir, file)
      try {
        await fs.access(filePath)
        return true
      } catch {
        // 文件不存在，继续检查下一个
      }
    }

    return false
  }

  /**
   * 检查目录是否包含 TypeScript 文件
   */
  private async hasTypeScriptFiles(dir: string): Promise<boolean> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      // 检查是否有 .ts 或 .tsx 文件
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          return true
        }
      }

      return false
    } catch {
      return false
    }
  }

  /**
   * 更新入口点字段
   */
  private updateEntryPoints(packageJson: any): void {
    const { esm, cjs, umd, types } = this.config?.outputDirs

    // 主入口点 - CJS 格式
    if (cjs) {
      packageJson.main = `./${cjs}/index.cjs`
    }

    // ESM 入口点 - 使用 esm 目录
    if (esm) {
      packageJson.module = `./${esm}/index.js`
    }

    // TypeScript 类型定义 - 使用 types 目录
    if (types) {
      packageJson.types = `./${types}/index.d.ts`
    }

    // UMD 格式 - 用于 CDN
    if (umd) {
      // 检查是否存在压缩版本
      const minifiedPath = `./${umd}/index.min.js`
      const regularPath = `./${umd}/index.js`

      const minifiedFullPath = path.join(this.config?.projectRoot, umd, 'index.min.js')
      const regularFullPath = path.join(this.config?.projectRoot, umd, 'index.js')

      // 优先使用压缩版本，如果不存在则使用常规版本
      if (this.fileExistsSync(minifiedFullPath)) {
        packageJson.unpkg = minifiedPath
        packageJson.jsdelivr = minifiedPath
        this.logger.info(`使用压缩版本 UMD 文件: ${minifiedPath}`)
      } else if (this.fileExistsSync(regularFullPath)) {
        packageJson.unpkg = regularPath
        packageJson.jsdelivr = regularPath
        this.logger.info(`使用常规版本 UMD 文件: ${regularPath}`)
      } else {
        // 如果都不存在，默认使用压缩版本路径（构建时可能还没生成）
        packageJson.unpkg = minifiedPath
        packageJson.jsdelivr = minifiedPath
        this.logger.warn(`UMD 文件不存在，使用默认路径: ${minifiedPath}`)
      }
    }
  }

  /**
   * 生成 files 字段
   */
  private async generateFiles(): Promise<string[]> {
    const files = ['README.md', 'LICENSE', 'package.json']
    const { esm, cjs, umd, types } = this.config?.outputDirs

    // 检查输出目录是否存在
    for (const dir of [esm, cjs, umd, types]) {
      if (dir) {
        const dirPath = path.join(this.config?.projectRoot, dir)
        try {
          await fs.access(dirPath)
          if (!files.includes(dir)) {
            files.push(dir)
          }
        } catch {
          // 目录不存在，跳过
        }
      }
    }

    return files
  }

  /**
   * 读取 package.json
   */
  private async readPackageJson(packageJsonPath: string): Promise<any> {
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      throw new Error(`读取 package.json 失败: ${error}`)
    }
  }

  /**
   * 检查文件是否存在（同步）
   */
  private fileExistsSync(filePath: string): boolean {
    try {
      const fs = require('fs')
      fs.accessSync(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * 写入 package.json
   */
  private async writePackageJson(packageJsonPath: string, packageJson: any): Promise<void> {
    try {
      const content = JSON.stringify(packageJson, null, 2)
      await fs.writeFile(packageJsonPath, content, 'utf-8')
    } catch (error) {
      throw new Error(`写入 package.json 失败: ${error}`)
    }
  }

  /**
   * 按照最佳实践排序 package.json 字段
   */
  private sortPackageJsonFields(packageJson: any): any {
    // 定义字段的优先级顺序
    const fieldOrder = [
      // 基本信息
      'name',
      'version',
      'description',
      'keywords',
      'author',
      'license',
      'homepage',
      'repository',
      'bugs',

      // 模块配置
      'type',
      'sideEffects',

      // 入口点
      'exports',
      'main',
      'module',
      'types',
      'unpkg',
      'jsdelivr',

      // 文件配置
      'files',

      // 脚本
      'scripts',

      // 依赖
      'dependencies',
      'peerDependencies',
      'devDependencies',
      'optionalDependencies',

      // 其他配置
      'engines',
      'os',
      'cpu',
      'publishConfig',
      'size-limit'
    ]

    const sorted: any = {}

    // 按照定义的顺序添加字段
    for (const field of fieldOrder) {
      if (packageJson[field] !== undefined) {
        sorted[field] = packageJson[field]
      }
    }

    // 添加其他未在顺序中定义的字段
    for (const [key, value] of Object.entries(packageJson)) {
      if (!fieldOrder.includes(key)) {
        sorted[key] = value
      }
    }

    return sorted
  }

  /**
   * 检测并添加CSS文件exports
   */
  private async addCssExports(exports: Record<string, any>): Promise<void> {
    const { esm, cjs, umd } = this.config?.outputDirs
    const fs = await import('fs')
    const path = await import('path')

    // 检查各个输出目录中的CSS文件
    const cssFiles = new Set<string>()

    // 检查ESM目录
    if (esm) {
      const esmDir = path.join(this.config?.projectRoot, esm)
      if (fs.existsSync(esmDir)) {
        await this.findCssFiles(esmDir, cssFiles, esm)
      }
    }

    // 检查CJS目录
    if (cjs) {
      const cjsDir = path.join(this.config?.projectRoot, cjs)
      if (fs.existsSync(cjsDir)) {
        await this.findCssFiles(cjsDir, cssFiles, cjs)
      }
    }

    // 检查UMD目录
    if (umd) {
      const umdDir = path.join(this.config?.projectRoot, umd)
      if (fs.existsSync(umdDir)) {
        await this.findCssFiles(umdDir, cssFiles, umd)
      }
    }

    // 为每个CSS文件添加exports
    for (const cssFile of cssFiles) {
      const exportKey = `./${cssFile}`
      if (!exports[exportKey]) {
        exports[exportKey] = `./${cssFile}`
      }
    }
  }

  /**
   * 在指定目录中查找CSS文件
   */
  private async findCssFiles(dir: string, cssFiles: Set<string>, prefix: string): Promise<void> {
    const fs = await import('fs')
    const path = await import('path')

    try {
      const files = fs.readdirSync(dir, { withFileTypes: true })

      for (const file of files) {
        const fullPath = path.join(dir, file.name)

        if (file.isDirectory()) {
          // 递归搜索子目录
          await this.findCssFiles(fullPath, cssFiles, `${prefix}/${file.name}`)
        } else if (file.name.endsWith('.css')) {
          // 添加CSS文件
          cssFiles.add(`${prefix}/${file.name}`)
        }
      }
    } catch (error) {
      // 忽略读取错误
    }
  }
}

/**
 * 创建 Package 更新器的便捷函数
 */
export function createPackageUpdater(config: PackageUpdaterConfig): PackageUpdater {
  return new PackageUpdater(config)
}
