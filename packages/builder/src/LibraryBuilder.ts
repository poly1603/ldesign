/**
 * 主打包类 - 整合所有打包功能
 */

import { rollup, RollupOptions } from 'rollup'
import { dts } from 'rollup-plugin-dts'
import { rimrafSync } from 'rimraf'
import { existsSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'
import { promisify } from 'util'
import { exec } from 'child_process'
import chalk from 'chalk'
import ora from 'ora'

// 内部模块
import { ProjectAnalyzer, ProjectAnalysis } from './analyzer/ProjectAnalyzer'
import { PresetFactory, PresetConfig } from './presets'
import { ArtifactValidator, ValidatorConfig, ValidationResult } from './validator/ArtifactValidator'

const execAsync = promisify(exec)

// 构建器配置
export interface LibraryBuilderConfig {
  // 项目根目录
  rootDir?: string
  // 源码目录
  srcDir?: string
  // 入口文件
  entry?: string
  // 输出目录配置
  output?: {
    cjs?: string
    es?: string
    umd?: string
  }
  // UMD 全局变量名
  name?: string
  // 外部依赖
  external?: string[] | ((id: string) => boolean)
  // 全局变量映射（UMD）
  globals?: Record<string, string>
  // 是否压缩
  minify?: boolean
  // 是否生成 source map
  sourcemap?: boolean
  // 是否生成类型声明
  dts?: boolean
  // 是否提取 CSS
  extractCss?: boolean
  // 是否清空输出目录
  clean?: boolean
  // 是否执行验证
  validate?: boolean
  // 验证配置
  validatorConfig?: Partial<ValidatorConfig>
  // 是否使用 @ldesign/kit 的 builder
  useKitBuilder?: boolean
  // 覆盖预设配置
  presetOverrides?: Partial<PresetConfig>
}

// 构建结果
export interface BuildResult {
  success: boolean
  duration: number
  analysis: ProjectAnalysis
  validation?: ValidationResult
  errors: Error[]
}

export class LibraryBuilder {
  private config: LibraryBuilderConfig
  private projectRoot: string
  private analyzer: ProjectAnalyzer
  private validator?: ArtifactValidator

  constructor(config: LibraryBuilderConfig = {}) {
    this.config = {
      rootDir: process.cwd(),
      srcDir: 'src',
      output: {
        cjs: 'lib',
        es: 'es',
        umd: 'dist'
      },
      minify: true,
      sourcemap: false,
      dts: true,
      extractCss: true,
      clean: true,
      validate: true,
      useKitBuilder: false,
      ...config
    }

    this.projectRoot = resolve(this.config.rootDir!)
    this.analyzer = new ProjectAnalyzer(this.projectRoot, this.config.srcDir!)

    if (this.config.validate) {
      this.validator = new ArtifactValidator({
        rootDir: this.projectRoot,
        outputDirs: this.config.output!,
        srcDir: this.config.srcDir,
        checkDts: this.config.dts,
        checkStyles: true,
        checkSourceMaps: this.config.sourcemap,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxTotalSize: 50 * 1024 * 1024, // 50MB
        ...this.config.validatorConfig
      })
    }
  }

  /**
   * 执行构建
   */
  async build(): Promise<BuildResult> {
    const startTime = Date.now()
    const errors: Error[] = []
    let analysis: ProjectAnalysis
    let validation: ValidationResult | undefined

    try {
      // 1. 分析项目
      this.log('info', '🔍 Analyzing project...')
      analysis = await this.analyzer.analyze()
      this.log('success', `Project type: ${analysis.projectType}`)
      
      // 2. 清理输出目录
      if (this.config.clean) {
        this.log('info', '🧹 Cleaning output directories...')
        this.cleanOutputDirs()
      }

      // 3. 使用 Rollup 构建
      await this.buildWithRollup(analysis)

      // 4. 生成类型声明文件
      if (this.config.dts && analysis.hasTypeScript) {
        await this.generateDts(analysis)
      }

      // 5. 验证构建产物
      if (this.config.validate && this.validator) {
        this.log('info', '✅ Validating artifacts...')
        validation = await this.validator.validate()
        
        if (!validation.success) {
          this.log('error', 'Validation failed!')
          console.log(this.validator.generateReport(validation))
        } else {
          this.log('success', 'Validation passed!')
        }
      }

      const duration = Date.now() - startTime
      this.log('success', `✨ Build completed in ${duration}ms`)

      return {
        success: validation ? validation.success : true,
        duration,
        analysis,
        validation,
        errors
      }
    } catch (error: any) {
      errors.push(error)
      this.log('error', `Build failed: ${error.message}`)
      
      return {
        success: false,
        duration: Date.now() - startTime,
        analysis: {} as ProjectAnalysis,
        errors
      }
    }
  }

  /**
   * 使用 Rollup 构建
   */
  private async buildWithRollup(analysis: ProjectAnalysis) {
    this.log('info', '📦 Building with Rollup...')

    // 获取入口文件
    const entry = this.config.entry || analysis.entry || 'src/index.ts'

    // 创建预设配置
    const presetConfig: PresetConfig = {
      entry,
      outputDir: {
        cjs: this.config.output?.cjs || 'lib',
        es: this.config.output?.es || 'es',
        umd: this.config.output?.umd || 'dist'
      },
      external: this.config.external,
      globals: this.config.globals,
      name: this.config.name || analysis.packageName,
      minify: this.config.minify,
      sourcemap: this.config.sourcemap,
      dts: this.config.dts,
      extractCss: this.config.extractCss,
      ...this.config.presetOverrides
    }

    // 获取预设
    const preset = PresetFactory.create(analysis, presetConfig)
    const configs = preset.getRollupConfig()

    // 执行构建
    for (const config of configs) {
      await this.runRollup(config)
    }
  }


  /**
   * 运行 Rollup 构建
   */
  private async runRollup(config: RollupOptions) {
    const spinner = this.startSpinner(`Building ${config.output}...`)
    
    try {
      const bundle = await rollup(config)
      
      if (Array.isArray(config.output)) {
        for (const output of config.output) {
          await bundle.write(output)
        }
      } else if (config.output) {
        await bundle.write(config.output)
      }
      
      await bundle.close()
      this.stopSpinner(spinner, 'success')
    } catch (error) {
      this.stopSpinner(spinner, 'error')
      throw error
    }
  }

  /**
   * 生成类型声明文件
   */
  private async generateDts(analysis: ProjectAnalysis) {
    this.log('info', '📝 Generating TypeScript declarations...')

    const entry = this.config.entry || analysis.entry || 'src/index.ts'
    
    // ES 模块的类型声明
    if (this.config.output?.es) {
      const spinner = this.startSpinner('Generating ES module declarations...')
      try {
        const config: RollupOptions = {
          input: entry,
          external: () => true,
          plugins: [dts()],
          output: {
            dir: this.config.output.es,
            format: 'es',
            preserveModules: true,
            preserveModulesRoot: 'src'
          }
        }
        await this.runRollup(config)
        this.stopSpinner(spinner, 'success')
      } catch (error) {
        this.stopSpinner(spinner, 'error')
        throw error
      }
    }

    // CommonJS 模块的类型声明（复制 ES 的声明）
    if (this.config.output?.cjs && this.config.output?.es) {
      const spinner = this.startSpinner('Copying declarations to CommonJS...')
      try {
        // 使用系统命令复制
        const src = join(this.projectRoot, this.config.output.es, '**/*.d.ts')
        const dest = join(this.projectRoot, this.config.output.cjs)
        
        if (process.platform === 'win32') {
          await execAsync(`xcopy "${src}" "${dest}" /s /y`)
        } else {
          await execAsync(`cp -r ${src} ${dest}`)
        }
        this.stopSpinner(spinner, 'success')
      } catch (error) {
        this.stopSpinner(spinner, 'error')
        // 忽略复制错误
      }
    }
  }

  /**
   * 清理输出目录
   */
  private cleanOutputDirs() {
    const dirs = [
      this.config.output?.cjs,
      this.config.output?.es,
      this.config.output?.umd
    ].filter(Boolean)

    for (const dir of dirs) {
      const fullPath = join(this.projectRoot, dir!)
      if (existsSync(fullPath)) {
        rimrafSync(fullPath)
      }
      mkdirSync(fullPath, { recursive: true })
    }
  }

  /**
   * 开始 spinner
   */
  private startSpinner(text: string) {
    if (process.env.CI) {
      console.log(text)
      return null
    }
    const spinner = ora(text).start()
    return spinner
  }

  /**
   * 停止 spinner
   */
  private stopSpinner(spinner: any, status: 'success' | 'error') {
    if (!spinner) return
    
    if (status === 'success') {
      spinner.succeed()
    } else {
      spinner.fail()
    }
  }

  /**
   * 日志输出
   */
  private log(level: 'info' | 'success' | 'warning' | 'error', message: string) {
    const prefix = {
      info: chalk.blue('ℹ'),
      success: chalk.green('✓'),
      warning: chalk.yellow('⚠'),
      error: chalk.red('✖')
    }

    console.log(`${prefix[level]} ${message}`)
  }

  /**
   * 静态构建方法
   */
  static async build(config?: LibraryBuilderConfig): Promise<BuildResult> {
    const builder = new LibraryBuilder(config)
    return builder.build()
  }

  /**
   * 监听模式
   */
  async watch() {
    this.log('info', '👀 Watching for changes...')
    // TODO: 实现 watch 模式
  }

  /**
   * 获取项目分析结果
   */
  async analyze(): Promise<ProjectAnalysis> {
    return this.analyzer.analyze()
  }

  /**
   * 验证构建产物
   */
  async validate(): Promise<ValidationResult | undefined> {
    if (!this.validator) return undefined
    return this.validator.validate()
  }
}
