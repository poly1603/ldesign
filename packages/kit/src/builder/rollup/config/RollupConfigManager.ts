/**
 * Rollup 配置管理器
 * @module RollupConfigManager
 * @description 提供 Rollup 构建器的高级配置管理功能，支持多入口和通配符
 */

import { glob } from 'glob'
import { resolve, relative, dirname, basename, extname } from 'path'
import type { RollupOptions, OutputOptions } from 'rollup'
import { ConfigManager } from '../../common/ConfigManager'
import type { RollupBuilderConfig } from '../../types'
import { fileExists, normalizePath } from '../../utils'

/**
 * 入口配置类型
 */
export type InputConfig = 
  | string 
  | string[] 
  | Record<string, string>
  | {
      pattern: string | string[]
      options?: {
        ignore?: string[]
        cwd?: string
        absolute?: boolean
      }
    }

/**
 * Rollup 配置管理器
 * @class RollupConfigManager
 * @extends ConfigManager<RollupBuilderConfig>
 */
export class RollupConfigManager extends ConfigManager<RollupBuilderConfig> {
  /**
   * 默认配置
   */
  protected static defaultConfig: Partial<RollupBuilderConfig> = {
    root: process.cwd(),
    env: 'production',
    input: 'src/index.ts',
    output: {
      format: 'es',
      dir: 'dist',
      entryFileNames: '[name].js',
      chunkFileNames: 'chunks/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]'
    },
    sourcemap: true,
    minify: true,
    target: 'es2015',
    cleanOutDir: true,
    // TreeShaking 默认配置
    treeshake: {
      moduleSideEffects: true,
      propertyReadSideEffects: true,
      tryCatchDeoptimization: true,
      unknownGlobalSideEffects: true
    },
    // 监听模式配置
    watch: {
      clearScreen: true,
      skipWrite: false,
      buildDelay: 200,
      chokidar: {
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 50,
          pollInterval: 10
        }
      }
    },
    // 缓存配置
    cache: true,
    strictDeprecations: false,
    preserveEntrySignatures: 'strict',
    maxParallelFileOps: 20,
    preserveSymlinks: false
  }

  constructor(config: RollupBuilderConfig) {
    super(config, {
      defaults: RollupConfigManager.defaultConfig,
      validationRules: RollupConfigManager.createValidationRules(),
      transformers: RollupConfigManager.createTransformers(),
      required: ['root', 'input']
    })
  }

  /**
   * 创建验证规则
   */
  protected static createValidationRules() {
    return [
      {
        field: 'input',
        validator: (value: any) => {
          if (!value) return 'input 是必需的'
          if (typeof value === 'string' || Array.isArray(value) || typeof value === 'object') {
            return true
          }
          return 'input 必须是字符串、数组或对象'
        }
      },
      {
        field: 'output.format',
        validator: (value: any) => {
          const validFormats = ['amd', 'cjs', 'es', 'iife', 'umd', 'system']
          if (Array.isArray(value)) {
            return value.every(f => validFormats.includes(f)) || '无效的输出格式'
          }
          return validFormats.includes(value) || '无效的输出格式'
        }
      },
      {
        field: 'target',
        validator: (value: any) => {
          const validTargets = ['es5', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'esnext']
          if (typeof value === 'string') {
            return validTargets.includes(value) || '无效的目标版本'
          }
          if (Array.isArray(value)) {
            return value.every(t => validTargets.includes(t)) || '无效的目标版本'
          }
          return '目标必须是字符串或字符串数组'
        }
      }
    ]
  }

  /**
   * 创建转换器
   */
  protected static createTransformers() {
    return [
      {
        field: 'output.dir',
        transformer: (value: string) => {
          if (!value) return 'dist'
          return normalizePath(value)
        }
      },
      {
        field: 'external',
        transformer: (value: any) => {
          if (typeof value === 'string') {
            return [value]
          }
          if (Array.isArray(value)) {
            return value
          }
          return value
        }
      }
    ]
  }

  /**
   * 解析入口配置
   * @param input 入口配置
   * @returns 解析后的入口配置
   */
  async resolveInput(input: InputConfig): Promise<string | string[] | Record<string, string>> {
    if (typeof input === 'string') {
      return await this.resolveStringInput(input)
    }
    
    if (Array.isArray(input)) {
      return await this.resolveArrayInput(input)
    }
    
    if (input && typeof input === 'object') {
      // 检查是否是通配符配置
      if ('pattern' in input) {
        return await this.resolveGlobInput(input)
      }
      
      // 普通对象配置
      return await this.resolveObjectInput(input as Record<string, string>)
    }
    
    throw new Error('无效的入口配置')
  }

  /**
   * 解析字符串入口
   */
  protected async resolveStringInput(input: string): Promise<string | string[]> {
    // 检查是否包含通配符
    if (this.hasGlobPattern(input)) {
      const files = await this.expandGlob(input)
      return files.length === 1 ? files[0] : files
    }
    
    // 普通文件路径
    const resolved = resolve(this.config.root || process.cwd(), input)
    if (await fileExists(resolved)) {
      return normalizePath(resolved)
    }
    
    throw new Error(`入口文件不存在: ${resolved}`)
  }

  /**
   * 解析数组入口
   */
  protected async resolveArrayInput(input: string[]): Promise<string[]> {
    const resolved: string[] = []
    
    for (const item of input) {
      if (this.hasGlobPattern(item)) {
        const files = await this.expandGlob(item)
        resolved.push(...files)
      } else {
        const resolvedPath = resolve(this.config.root || process.cwd(), item)
        if (await fileExists(resolvedPath)) {
          resolved.push(normalizePath(resolvedPath))
        } else {
          console.warn(`警告: 入口文件不存在: ${resolvedPath}`)
        }
      }
    }
    
    return resolved
  }

  /**
   * 解析对象入口
   */
  protected async resolveObjectInput(input: Record<string, string>): Promise<Record<string, string>> {
    const resolved: Record<string, string> = {}
    
    for (const [name, path] of Object.entries(input)) {
      if (this.hasGlobPattern(path)) {
        const files = await this.expandGlob(path)
        // 对于通配符匹配的多个文件，使用文件名作为 key
        for (const file of files) {
          const fileName = basename(file, extname(file))
          resolved[`${name}-${fileName}`] = file
        }
      } else {
        const resolvedPath = resolve(this.config.root || process.cwd(), path)
        if (await fileExists(resolvedPath)) {
          resolved[name] = normalizePath(resolvedPath)
        } else {
          console.warn(`警告: 入口文件不存在: ${resolvedPath}`)
        }
      }
    }
    
    return resolved
  }

  /**
   * 解析通配符配置
   */
  protected async resolveGlobInput(input: {
    pattern: string | string[]
    options?: {
      ignore?: string[]
      cwd?: string
      absolute?: boolean
    }
  }): Promise<Record<string, string>> {
    const patterns = Array.isArray(input.pattern) ? input.pattern : [input.pattern]
    const options = {
      cwd: input.options?.cwd || this.config.root || process.cwd(),
      ignore: input.options?.ignore || ['node_modules/**'],
      absolute: input.options?.absolute !== false,
      ...input.options
    }
    
    const resolved: Record<string, string> = {}
    
    for (const pattern of patterns) {
      const files = await this.expandGlob(pattern, options)
      
      for (const file of files) {
        const relativePath = relative(options.cwd, file)
        const fileName = basename(file, extname(file))
        const dirName = dirname(relativePath)
        
        // 生成合理的入口名称
        let entryName = fileName
        if (dirName !== '.') {
          entryName = `${dirName.replace(/[/\\]/g, '-')}-${fileName}`
        }
        
        resolved[entryName] = normalizePath(file)
      }
    }
    
    return resolved
  }

  /**
   * 检查是否包含通配符模式
   */
  protected hasGlobPattern(pattern: string): boolean {
    return /[*{},?[\]]/.test(pattern)
  }

  /**
   * 展开通配符
   */
  protected async expandGlob(pattern: string, options: any = {}): Promise<string[]> {
    try {
      const files = await glob(pattern, {
        cwd: options.cwd || this.config.root || process.cwd(),
        ignore: options.ignore || ['node_modules/**'],
        absolute: options.absolute !== false,
        ...options
      })
      return files.map(file => normalizePath(file))
    } catch (error) {
      console.error(`通配符展开失败: ${pattern}`, error)
      return []
    }
  }

  /**
   * 生成 Rollup 配置
   */
  async generateRollupConfig(mode: 'build' | 'watch' = 'build'): Promise<RollupOptions> {
    const config = this.getConfig()
    const isWatch = mode === 'watch'
    
    // 解析入口文件
    const input = await this.resolveInput(config.input)
    
    const rollupConfig: RollupOptions = {
      input,
      external: this.processExternal(config.external),
      plugins: config.plugins || [],
      cache: isWatch && config.cache ? true : config.cache,
      treeshake: config.treeshake,
      strictDeprecations: config.strictDeprecations,
      preserveEntrySignatures: config.preserveEntrySignatures,
      maxParallelFileOps: config.maxParallelFileOps,
      perf: config.perf,
      context: config.context,
      moduleContext: config.moduleContext,
      preserveSymlinks: config.preserveSymlinks,
      ...config.rollupConfig
    }
    
    // 监听模式配置
    if (isWatch && config.watch) {
      rollupConfig.watch = {
        ...config.watch,
        include: config.watch.include || this.generateWatchIncludes(input),
        exclude: config.watch.exclude || ['node_modules/**']
      }
    }
    
    // 危险区域配置
    if (config.acorn) {
      rollupConfig.acorn = config.acorn
    }
    
    if (config.acornInjectPlugins) {
      rollupConfig.acornInjectPlugins = config.acornInjectPlugins
    }
    
    return rollupConfig
  }

  /**
   * 生成监听包含模式
   */
  protected generateWatchIncludes(input: any): string[] {
    const includes: string[] = []
    
    if (typeof input === 'string') {
      includes.push(dirname(input) + '/**')
    } else if (Array.isArray(input)) {
      input.forEach(file => {
        includes.push(dirname(file) + '/**')
      })
    } else if (typeof input === 'object') {
      Object.values(input).forEach(file => {
        if (typeof file === 'string') {
          includes.push(dirname(file) + '/**')
        }
      })
    }
    
    // 默认包含 src 目录
    if (includes.length === 0) {
      includes.push('src/**')
    }
    
    return [...new Set(includes)] // 去重
  }

  /**
   * 处理外部依赖配置
   */
  protected processExternal(external?: any): any {
    if (!external) {
      return []
    }
    
    // 如果是函数，直接返回
    if (typeof external === 'function') {
      return external
    }
    
    // 如果是数组，创建匹配函数
    if (Array.isArray(external)) {
      return (id: string) => {
        // 精确匹配
        if (external.includes(id)) {
          return true
        }
        
        // 模块名匹配（处理子路径）
        return external.some(ext => {
          if (ext.endsWith('*')) {
            return id.startsWith(ext.slice(0, -1))
          }
          return id === ext || id.startsWith(ext + '/')
        })
      }
    }
    
    return external
  }

  /**
   * 获取入口统计信息
   */
  async getInputStatistics(): Promise<{
    total: number
    files: string[]
    patterns: string[]
    missing: string[]
  }> {
    const config = this.getConfig()
    const files: string[] = []
    const patterns: string[] = []
    const missing: string[] = []
    
    try {
      const resolved = await this.resolveInput(config.input)
      
      if (typeof resolved === 'string') {
        files.push(resolved)
      } else if (Array.isArray(resolved)) {
        files.push(...resolved)
      } else if (typeof resolved === 'object') {
        files.push(...Object.values(resolved))
      }
      
      // 检查文件是否存在
      for (const file of files) {
        if (!await fileExists(file)) {
          missing.push(file)
        }
      }
      
      // 提取模式
      const extractPatterns = (input: any) => {
        if (typeof input === 'string' && this.hasGlobPattern(input)) {
          patterns.push(input)
        } else if (Array.isArray(input)) {
          input.forEach(item => {
            if (typeof item === 'string' && this.hasGlobPattern(item)) {
              patterns.push(item)
            }
          })
        }
      }
      
      extractPatterns(config.input)
    } catch (error) {
      console.error('获取入口统计信息失败:', error)
    }
    
    return {
      total: files.length,
      files,
      patterns,
      missing
    }
  }

  /**
   * 验证入口配置
   */
  async validateInput(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []
    
    try {
      const resolved = await this.resolveInput(this.config.input)
      
      if (typeof resolved === 'string') {
        if (!await fileExists(resolved)) {
          errors.push(`入口文件不存在: ${resolved}`)
        }
      } else if (Array.isArray(resolved)) {
        if (resolved.length === 0) {
          errors.push('没有找到匹配的入口文件')
        }
        for (const file of resolved) {
          if (!await fileExists(file)) {
            errors.push(`入口文件不存在: ${file}`)
          }
        }
      } else if (typeof resolved === 'object') {
        const entries = Object.entries(resolved)
        if (entries.length === 0) {
          errors.push('没有找到匹配的入口文件')
        }
        for (const [name, file] of entries) {
          if (!await fileExists(file)) {
            errors.push(`入口文件不存在: ${name} -> ${file}`)
          }
        }
      }
    } catch (error) {
      errors.push(`入口配置解析失败: ${error}`)
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取推荐的入口配置模式
   */
  getRecommendedInputPatterns(): { name: string; pattern: InputConfig; description: string }[] {
    return [
      {
        name: '单入口',
        pattern: 'src/index.ts',
        description: '适用于简单的单页应用或库'
      },
      {
        name: '多入口',
        pattern: ['src/main.ts', 'src/worker.ts'],
        description: '适用于多个独立的入口点'
      },
      {
        name: '命名入口',
        pattern: {
          main: 'src/main.ts',
          admin: 'src/admin.ts'
        },
        description: '为不同入口指定名称'
      },
      {
        name: '通配符入口',
        pattern: 'src/pages/*.ts',
        description: '自动发现页面文件'
      },
      {
        name: '高级通配符',
        pattern: {
          pattern: ['src/apps/**/index.ts', 'src/components/**/index.ts'],
          options: {
            ignore: ['**/*.test.ts', '**/*.spec.ts']
          }
        },
        description: '复杂的文件匹配模式'
      }
    ]
  }

  /**
   * 导出为 Rollup 配置文件内容
   */
  async exportAsRollupConfig(): Promise<string> {
    const rollupConfig = await this.generateRollupConfig()
    
    return `import { defineConfig } from 'rollup'

export default defineConfig(${JSON.stringify(rollupConfig, null, 2)})
`
  }
}
