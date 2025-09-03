/**
 * SmartBuilder - 零配置智能打包器
 * 
 * 基于 @ldesign/kit 的 RollupBuilder 实现
 * 自动检测项目类型，生成优化的打包配置
 * 支持 Vue2/Vue3、React、纯 JS/TS 库等多种项目类型
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { rollup, watch } from 'rollup'
import type { RollupOptions, OutputOptions, RollupBuild, RollupWatcher } from 'rollup'
import { resolve, join } from 'path'
import { existsSync, readFileSync, rmSync } from 'fs'
import fg from 'fast-glob'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import { EventEmitter } from 'events'

/**
 * SmartBuilder 类 - 智能零配置打包器
 * 
 * @example
 * ```typescript
 * const builder = new SmartBuilder({
 *   root: process.cwd(),
 *   autoDetect: true
 * })
 * 
 * // 执行打包
 * const result = await builder.build()
 * ```
 */
export class SmartBuilder extends RollupBuilder {
  // 项目根目录
  private readonly root: string
  
  // SmartBuilder 配置选项
  private readonly options: SmartBuilderOptions
  
  // 项目分析器实例
  private projectAnalyzer: ProjectAnalyzer
  
  // 插件配置生成器实例
  private pluginConfigGenerator: PluginConfigGenerator
  
  // 输出配置生成器实例
  private outputConfigGenerator: OutputConfigGenerator
  
  // 类型定义生成器实例
  private dtsGenerator: DtsGenerator
  
  // 文件处理器实例
  private fileProcessor: FileProcessor
  
  // 项目信息缓存
  private projectInfo?: ProjectInfo
  
  // 是否已初始化
  private initialized = false

  /**
   * 构造函数
   * 
   * @param options - SmartBuilder 配置选项
   */
  constructor(options: SmartBuilderOptions = {}) {
    // 设置默认配置
    const defaultOptions: SmartBuilderOptions = {
      root: process.cwd(),
      src: 'src',
      outDir: 'dist',
      autoDetect: true,
      generateDts: true,
      formats: ['esm', 'cjs', 'umd'],
      sourcemap: true,
      minify: true,
      clean: true,
      external: [],
      globals: {},
      ...options
    }

    // 初始化根目录
    const root = resolve(defaultOptions.root!)
    
    // 创建基础 Rollup 配置
    const baseConfig: RollupBuilderConfig = {
      root,
      input: {},
      output: [],
      plugins: [],
      external: defaultOptions.external,
      sourcemap: defaultOptions.sourcemap,
      minify: defaultOptions.minify,
      cleanOutDir: defaultOptions.clean
    }

    // 调用父类构造函数
    super(baseConfig)

    // 保存配置
    this.root = root
    this.options = defaultOptions

    // 初始化各个组件
    this.projectAnalyzer = new ProjectAnalyzer(root)
    this.pluginConfigGenerator = new PluginConfigGenerator(root)
    this.outputConfigGenerator = new OutputConfigGenerator(root)
    this.dtsGenerator = new DtsGenerator(root)
    this.fileProcessor = new FileProcessor(root)
  }

  /**
   * 初始化打包器
   * 分析项目，生成配置
   * 
   * @returns Promise<void>
   */
  private async initialize(): Promise<void> {
    // 如果已经初始化，直接返回
    if (this.initialized) {
      return
    }

    console.log('🔍 正在分析项目结构...')

    // 1. 分析项目类型
    this.projectInfo = await this.projectAnalyzer.analyze()
    console.log(`✅ 检测到项目类型: ${this.projectInfo.type}`)
    
    // 2. 获取所有源文件作为入口
    const srcDir = join(this.root, this.options.src!)
    const entryFiles = await this.findEntryFiles(srcDir)
    console.log(`📦 找到 ${entryFiles.length} 个入口文件`)

    // 3. 生成插件配置
    const plugins = await this.pluginConfigGenerator.generate(
      this.projectInfo,
      this.options
    )
    console.log(`🔌 配置了 ${plugins.length} 个插件`)

    // 4. 生成输出配置
    const outputs = await this.outputConfigGenerator.generate(
      this.options.formats!,
      this.options.outDir!,
      this.projectInfo,
      entryFiles
    )
    console.log(`📤 生成了 ${outputs.length} 个输出配置`)

    // 5. 更新 Rollup 配置
    this.setConfig({
      input: entryFiles,
      output: outputs,
      plugins,
      external: this.generateExternal(),
      sourcemap: this.options.sourcemap,
      minify: this.options.minify,
      cleanOutDir: this.options.clean
    })

    // 标记已初始化
    this.initialized = true
    console.log('✨ 打包器初始化完成')
  }

  /**
   * 查找入口文件
   * 
   * @param srcDir - 源代码目录
   * @returns 入口文件列表
   */
  private async findEntryFiles(srcDir: string): Promise<string[] | Record<string, string>> {
    // 对于 UMD 格式，只使用 index 文件作为入口
    const hasUmd = this.options.formats?.includes('umd')
    
    if (hasUmd) {
      // 查找 index 文件
      const indexFile = await this.findIndexFile(srcDir)
      if (indexFile) {
        return indexFile
      }
    }

    // 对于 ESM 和 CJS，收集所有文件作为入口
    const pattern = '**/*.{js,jsx,ts,tsx,vue}'
    const files = await glob(pattern, {
      cwd: srcDir,
      absolute: false,
      ignore: [
        '**/node_modules/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.d.ts',
        '**/dist/**',
        '**/build/**'
      ]
    })

    // 创建入口映射
    const entries: Record<string, string> = {}
    for (const file of files) {
      // 生成入口名称（去除扩展名）
      const entryName = file.replace(/\.[^/.]+$/, '')
      entries[entryName] = join(srcDir, file)
    }

    return entries
  }

  /**
   * 查找 index 文件
   * 
   * @param srcDir - 源代码目录
   * @returns index 文件路径
   */
  private async findIndexFile(srcDir: string): Promise<string | null> {
    // 按优先级查找 index 文件
    const indexFiles = [
      'index.ts',
      'index.tsx',
      'index.js',
      'index.jsx',
      'main.ts',
      'main.tsx',
      'main.js',
      'main.jsx'
    ]

    for (const file of indexFiles) {
      const filePath = join(srcDir, file)
      if (existsSync(filePath)) {
        return filePath
      }
    }

    return null
  }

  /**
   * 生成 external 配置
   * 自动识别外部依赖
   * 
   * @returns 外部依赖配置
   */
  private generateExternal(): string[] | ((id: string) => boolean) {
    // 读取 package.json
    const pkgPath = join(this.root, 'package.json')
    if (!existsSync(pkgPath)) {
      return this.options.external || []
    }

    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      const deps = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
      ]

      // 合并用户配置的 external
      const userExternal = this.options.external || []
      const allExternal = [...new Set([...deps, ...userExternal])]

      // 返回函数形式，支持子路径
      return (id: string) => {
        // 检查是否是外部依赖
        return allExternal.some(dep => 
          id === dep || id.startsWith(`${dep}/`)
        )
      }
    } catch (error) {
      console.warn('⚠️ 无法读取 package.json，使用默认 external 配置')
      return this.options.external || []
    }
  }

  /**
   * 执行打包
   * 
   * @returns 打包结果
   */
  async build(): Promise<BuildResult> {
    // 初始化配置
    await this.initialize()

    console.log('\n🚀 开始打包...')
    
    try {
      // 执行打包
      const result = await super.build()

      // 如果需要生成类型定义
      if (this.options.generateDts && this.projectInfo?.hasTypeScript) {
        console.log('\n📝 生成类型定义文件...')
        await this.dtsGenerator.generate(
          join(this.root, this.options.src!),
          join(this.root, this.options.outDir!)
        )
        console.log('✅ 类型定义文件生成完成')
      }

      // 打印结果摘要
      this.printBuildSummary(result)

      return result
    } catch (error) {
      console.error('❌ 打包失败:', error)
      throw error
    }
  }

  /**
   * 批量打包多种格式
   * 
   * @returns 所有格式的打包结果
   */
  async buildAll(): Promise<BuildOutput[]> {
    // 初始化配置
    await this.initialize()

    const results: BuildOutput[] = []
    const formats = this.options.formats || ['esm', 'cjs', 'umd']

    console.log(`\n📦 开始打包 ${formats.length} 种格式...`)

    for (const format of formats) {
      console.log(`\n🔨 正在打包 ${format.toUpperCase()} 格式...`)
      
      try {
        // 为每种格式创建独立的输出目录
        const formatOutDir = join(this.root, this.options.outDir!, format)
        
        // 更新输出配置
        const outputs = await this.outputConfigGenerator.generate(
          [format as OutputFormat],
          formatOutDir,
          this.projectInfo!,
          await this.findEntryFiles(join(this.root, this.options.src!))
        )

        // 更新配置
        this.setConfig({ output: outputs })

        // 执行打包
        const result = await super.build()

        results.push({
          format: format as OutputFormat,
          result,
          outDir: formatOutDir
        })

        console.log(`✅ ${format.toUpperCase()} 格式打包完成`)
      } catch (error) {
        console.error(`❌ ${format.toUpperCase()} 格式打包失败:`, error)
        results.push({
          format: format as OutputFormat,
          result: {
            success: false,
            duration: 0,
            outputs: [],
            errors: [error instanceof Error ? error.message : String(error)]
          },
          outDir: ''
        })
      }
    }

    // 生成类型定义（只需生成一次）
    if (this.options.generateDts && this.projectInfo?.hasTypeScript) {
      console.log('\n📝 生成类型定义文件...')
      await this.dtsGenerator.generate(
        join(this.root, this.options.src!),
        join(this.root, this.options.outDir!, 'types')
      )
      console.log('✅ 类型定义文件生成完成')
    }

    // 打印总结
    this.printBuildAllSummary(results)

    return results
  }

  /**
   * 监听模式
   * 
   * @returns Promise<void>
   */
  async watch(): Promise<void> {
    // 初始化配置
    await this.initialize()

    console.log('\n👀 启动监听模式...')
    console.log('📁 监听目录:', join(this.root, this.options.src!))
    console.log('⌨️  按 Ctrl+C 停止监听\n')

    // 启动监听
    await super.watch()
  }

  /**
   * 打印打包结果摘要
   * 
   * @param result - 打包结果
   */
  private printBuildSummary(result: BuildResult): void {
    console.log('\n' + '='.repeat(50))
    console.log(result.success ? '✅ 打包成功！' : '❌ 打包失败！')
    console.log('='.repeat(50))
    
    if (result.success) {
      console.log(`⏱️  用时: ${result.duration}ms`)
      console.log(`📦 输出文件: ${result.outputs.length} 个`)
      
      result.outputs.forEach(output => {
        const size = this.formatSize(output.size)
        console.log(`  - ${output.fileName} (${size})`)
      })
    } else {
      console.log('错误信息:')
      result.errors?.forEach(error => {
        console.log(`  ❌ ${error}`)
      })
    }

    if (result.warnings && result.warnings.length > 0) {
      console.log('\n⚠️  警告:')
      result.warnings.forEach(warning => {
        console.log(`  - ${warning}`)
      })
    }
  }

  /**
   * 打印批量打包结果摘要
   * 
   * @param results - 所有格式的打包结果
   */
  private printBuildAllSummary(results: BuildOutput[]): void {
    console.log('\n' + '='.repeat(50))
    console.log('📊 打包结果汇总')
    console.log('='.repeat(50))

    const successful = results.filter(r => r.result.success)
    const failed = results.filter(r => !r.result.success)

    console.log(`✅ 成功: ${successful.length} 个格式`)
    console.log(`❌ 失败: ${failed.length} 个格式`)

    if (successful.length > 0) {
      console.log('\n成功的格式:')
      successful.forEach(({ format, result, outDir }) => {
        console.log(`  ✅ ${format.toUpperCase()}`)
        console.log(`     输出目录: ${outDir}`)
        console.log(`     文件数量: ${result.outputs.length}`)
        console.log(`     打包用时: ${result.duration}ms`)
      })
    }

    if (failed.length > 0) {
      console.log('\n失败的格式:')
      failed.forEach(({ format, result }) => {
        console.log(`  ❌ ${format.toUpperCase()}`)
        result.errors?.forEach(error => {
          console.log(`     ${error}`)
        })
      })
    }

    const totalTime = results.reduce((sum, r) => sum + r.result.duration, 0)
    console.log(`\n⏱️  总用时: ${totalTime}ms`)
  }

  /**
   * 格式化文件大小
   * 
   * @param bytes - 字节数
   * @returns 格式化后的大小字符串
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  /**
   * 获取项目信息
   * 
   * @returns 项目信息
   */
  async getProjectInfo(): Promise<ProjectInfo> {
    if (!this.projectInfo) {
      this.projectInfo = await this.projectAnalyzer.analyze()
    }
    return this.projectInfo
  }

  /**
   * 设置自定义配置
   * 允许用户覆盖自动生成的配置
   * 
   * @param config - 自定义配置
   */
  setCustomConfig(config: Partial<RollupBuilderConfig>): void {
    this.setConfig(config)
    console.log('✅ 已应用自定义配置')
  }

  /**
   * 添加自定义插件
   * 
   * @param plugin - Rollup 插件
   */
  addCustomPlugin(plugin: any): void {
    this.addPlugin(plugin)
    console.log('✅ 已添加自定义插件')
  }
}
