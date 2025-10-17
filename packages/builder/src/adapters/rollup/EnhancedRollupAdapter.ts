/**
 * 增强版 Rollup 适配器
 *
 * 提供更强大的 Rollup 打包器适配实现，确保打包产物的正确性
 *
 * @author LDesign Team
 * @version 2.0.0
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import { createHash } from 'crypto'
import type {
  IBundlerAdapter,
  UnifiedConfig,
  AdapterOptions,
  BundlerSpecificConfig,
  BundlerSpecificPlugin,
  BundlerFeature,
  FeatureSupportMap
} from '../../types/adapter'
import type { BuildResult, BuildWatcher } from '../../types/builder'
import type { PerformanceMetrics } from '../../types/performance'
import { Logger } from '../../utils/logger'
import { BuilderError } from '../../utils/error-handler'
import { ErrorCode } from '../../constants/errors'

/**
 * 插件验证结果
 */
interface PluginValidation {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 输出格式配置
 */
interface FormatConfig {
  format: string
  dir: string
  entryFileNames: string
  chunkFileNames: string
  preserveModules: boolean
  preserveModulesRoot?: string
  exports?: string
  sourcemap?: boolean | 'inline' | 'hidden'
  globals?: Record<string, string>
  name?: string
  plugins?: any[]
}

/**
 * 增强版 Rollup 适配器类
 */
export class EnhancedRollupAdapter implements IBundlerAdapter {
  readonly name = 'rollup' as const
  readonly version: string
  readonly available: boolean

  private logger: Logger
  private performanceMonitor: any
  private multiConfigs?: any[]
  private pluginCache: Map<string, any> = new Map()
  private outputCache: Map<string, any> = new Map()
  private rollupInstance: any = null

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()
    this.performanceMonitor = options.performanceMonitor

    this.version = 'unknown'
    this.available = true

    this.logger.debug('增强版 Rollup 适配器初始化')
  }

  /**
   * 执行构建（增强版）
   */
  async build(config: UnifiedConfig): Promise<BuildResult> {
    if (!this.available) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Rollup 适配器不可用'
      )
    }

    try {
      const rollup = await this.loadRollup()

      // 验证配置
      const configValidation = await this.validateConfig(config)
      if (!configValidation.valid) {
        throw new BuilderError(
          ErrorCode.CONFIG_VALIDATION_ERROR,
          `配置验证失败: ${configValidation.errors.join(', ')}`
        )
      }

      // 转换配置
      const rollupConfig = await this.transformConfig(config)

      this.logger.info('开始增强版 Rollup 构建...')
      const startTime = Date.now()

      let results: any[] = []
      const outputMetadata: Map<string, any> = new Map()

      // 处理多配置构建 - 添加并行构建支持
      if (this.multiConfigs && this.multiConfigs.length > 0) {
        // 对于小量配置，使用并行构建提高性能
        if (this.multiConfigs.length <= 3) {
          const buildPromises = this.multiConfigs.map(async (singleConfig, index) => {
            this.logger.debug(`并行构建配置 ${index + 1}/${this.multiConfigs?.length || 0}`)

            // 验证单个配置
            await this.validateSingleConfig(singleConfig)

            // 创建 bundle
            const bundle = await rollup.rollup(singleConfig)

            try {
              // 生成和写入输出
              const outputs = await this.generateAndWriteOutputs(bundle, singleConfig)

              // 收集输出元数据
              const metadata = outputs.map(output => ({
                fileName: output.fileName,
                format: singleConfig.output.format,
                preserveModules: singleConfig.output.preserveModules,
                sourcemap: singleConfig.output.sourcemap
              }))

              return { outputs, metadata }
            } finally {
              await bundle.close()
            }
          })

          const buildResults = await Promise.all(buildPromises)
          buildResults.forEach(({ outputs, metadata }) => {
            results.push(...outputs)
            metadata.forEach(meta => {
              outputMetadata.set(meta.fileName, {
                format: meta.format,
                preserveModules: meta.preserveModules,
                sourcemap: meta.sourcemap
              })
            })
          })
        } else {
          // 对于大量配置，使用串行构建避免内存压力
          for (const [index, singleConfig] of this.multiConfigs.entries()) {
            this.logger.debug(`串行构建配置 ${index + 1}/${this.multiConfigs.length}`)

            // 验证单个配置
            await this.validateSingleConfig(singleConfig)

            // 创建 bundle
            const bundle = await rollup.rollup(singleConfig)

            try {
              // 生成和写入输出
              const outputs = await this.generateAndWriteOutputs(bundle, singleConfig)
              results.push(...outputs)

              // 收集输出元数据
              outputs.forEach(output => {
                outputMetadata.set(output.fileName, {
                  format: singleConfig.output.format,
                  preserveModules: singleConfig.output.preserveModules,
                  sourcemap: singleConfig.output.sourcemap
                })
              })
            } finally {
              await bundle.close()
            }
          }
        }
      } else {
        // 单配置构建
        const bundle = await rollup.rollup(rollupConfig)

        const outputs = Array.isArray(rollupConfig.output)
          ? rollupConfig.output
          : [rollupConfig.output]

        for (const outputConfig of outputs) {
          const { output } = await bundle.generate(outputConfig)

          // 验证输出
          await this.validateOutputs(output, outputConfig)

          results.push(...output)

          // 写入文件
          await bundle.write(outputConfig)
        }

        await bundle.close()
      }

      const duration = Date.now() - startTime

      // 处理和增强输出结果
      const enhancedOutputs = await this.enhanceOutputs(results, outputMetadata)

      // 生成详细的构建统计
      const stats = await this.generateBuildStats(enhancedOutputs, duration)

      // 验证构建产物
      const validation = await this.validateBuildOutputs(enhancedOutputs, config)

      // 构建结果
      const buildResult: BuildResult = {
        success: validation.success,
        outputs: enhancedOutputs,
        duration,
        stats,
        performance: this.getPerformanceMetrics(),
        warnings: validation.warnings || [],
        errors: validation.errors || [],
        buildId: `rollup-${Date.now()}`,
        timestamp: Date.now(),
        bundler: 'rollup',
        mode: config.mode || 'production',
        validation
      }

      this.logger.success(`增强版 Rollup 构建完成 (${duration}ms)`)
      return buildResult

    } catch (error) {
      // 增强的错误处理
      const enhancedError = await this.enhanceError(error as Error)
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `Rollup 构建失败: ${enhancedError.message}`,
        { cause: enhancedError }
      )
    }
  }

  /**
   * 启动监听模式（增强版）
   */
  async watch(config: UnifiedConfig): Promise<BuildWatcher> {
    if (!this.available) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Rollup 适配器不可用'
      )
    }

    try {
      const rollup = await this.loadRollup()
      const rollupConfig = await this.transformConfig(config)

      // 添加增强的监听配置
      const watchOptions = config.watch || {}
      const watchConfig = {
        ...rollupConfig,
        watch: {
          include: (watchOptions as any).include || ['src/**/*'],
          exclude: (watchOptions as any).exclude || ['node_modules/**/*'],
          clearScreen: false,
          chokidar: {
            ignoreInitial: true,
            awaitWriteFinish: {
              stabilityThreshold: 100,
              pollInterval: 10
            }
          },
          ...(typeof watchOptions === 'object' ? watchOptions : {})
        }
      }

      const watcher = rollup.watch(watchConfig)

      // 增强的监听器接口
      const buildWatcher = {
        patterns: watchConfig.watch.include,
        watching: true,

        async close() {
          await watcher.close()
        },

        on(event: string, listener: (...args: any[]) => void) {
          // 包装监听器以提供更好的错误处理
          const wrappedListener = (...args: any[]) => {
            try {
              listener(...args)
            } catch (error) {
              console.error('Watcher event listener error:', error)
            }
          }

          watcher.on(event, wrappedListener)
          return this
        },

        off(event: string, listener: (...args: any[]) => void) {
          watcher.off(event, listener)
          return this
        },

        emit(_event: string, ..._args: any[]) {
          return false
        }
      } as BuildWatcher

      // 添加错误处理
      watcher.on('error', (error: Error) => {
        this.logger.error('监听模式错误:', error)
      })

      // 添加构建事件处理
      watcher.on('event', (event: any) => {
        switch (event.code) {
          case 'START':
            this.logger.info('检测到文件变化，重新构建...')
            break
          case 'BUNDLE_END':
            this.logger.success(`构建完成 (${event.duration}ms)`)
            break
          case 'ERROR':
            this.logger.error('构建错误:', event.error)
            break
        }
      })

      this.logger.info('增强版 Rollup 监听模式已启动')
      return buildWatcher

    } catch (error) {
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `启动 Rollup 监听模式失败: ${(error as Error).message}`,
        { cause: error as Error }
      )
    }
  }

  /**
   * 转换配置（增强版）
   */
  async transformConfig(config: UnifiedConfig): Promise<BundlerSpecificConfig> {
    // 获取基础插件
    const basePlugins = await this.getEnhancedBasePlugins(config)

    const rollupConfig: any = {
      input: config.input,
      external: this.processExternal(config.external),
      cache: config.cache !== false,
      strictDeprecations: true,
      maxParallelFileOps: 5
    }

    // 注入 Acorn 插件
    const acornPlugins = await this.getAcornPlugins()
    if (acornPlugins.length > 0) {
      rollupConfig.acorn = {
        ecmaVersion: 2022,
        sourceType: 'module',
        allowAwaitOutsideFunction: true,
        injectPlugins: acornPlugins
      }
    }

    // 高级 tree-shaking 配置
    if (config.treeshake !== false) {
      const tsOptions = typeof config.treeshake === 'object' ? config.treeshake : undefined
      rollupConfig.treeshake = {
        moduleSideEffects: tsOptions?.moduleSideEffects ?? true,
        propertyReadSideEffects: tsOptions?.propertyReadSideEffects ?? true,
        tryCatchDeoptimization: tsOptions?.tryCatchDeoptimization ?? true,
        unknownGlobalSideEffects: tsOptions?.unknownGlobalSideEffects ?? true,
        correctVarValueBeforeDeclaration: true,
        ...(tsOptions || {})
      }
    }

    // 处理输出配置
    if (config.output) {
      const outputConfigs = await this.processOutputConfig(config)

      if (outputConfigs.length > 1) {
        // 多格式输出
        this.multiConfigs = outputConfigs.map(outputConfig => ({
          ...rollupConfig,
          plugins: [...basePlugins, ...(outputConfig.plugins || [])],
          output: outputConfig
        }))

        return this.multiConfigs[0]
      } else {
        // 单格式输出
        rollupConfig.plugins = [...basePlugins, ...(outputConfigs[0].plugins || [])]
        rollupConfig.output = outputConfigs[0]
      }
    }

    // 性能优化配置
    if (config.performance?.chunkSizeWarningLimit) {
      rollupConfig.onwarn = (warning: any, warn: any) => {
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          this.logger.warn('检测到循环依赖:', warning.message)
        } else if (warning.code === 'EVAL') {
          this.logger.warn('代码中使用了 eval:', warning.message)
        } else {
          warn(warning)
        }
      }
    }

    return rollupConfig
  }

  /**
   * 处理输出配置
   */
  private async processOutputConfig(config: UnifiedConfig): Promise<FormatConfig[]> {
    const outputConfig = config.output!
    const formats = Array.isArray(outputConfig.format)
      ? outputConfig.format
      : [outputConfig.format || 'esm']

    const configs: FormatConfig[] = []
    const isMultiEntry = this.isMultiEntryBuild(config.input)

    for (const format of formats) {
      // 智能格式处理
      if (isMultiEntry && (format === 'umd' || format === 'iife')) {
        if (config.umd?.forceMultiEntry) {
          // 强制为多入口创建 UMD/IIFE
          const umdConfig = await this.createEnhancedUMDConfig(config, format)
          configs.push(umdConfig)
        } else {
          this.logger.warn(`多入口构建跳过 ${format} 格式`)
          continue
        }
      } else {
        const formatConfig = await this.createFormatConfig(format, config)
        configs.push(formatConfig)
      }
    }

    return configs
  }

  /**
   * 创建格式配置
   */
  private async createFormatConfig(format: string, config: UnifiedConfig): Promise<FormatConfig> {
    const mapped = this.mapFormat(format)
    const isESM = format === 'esm'
    const isCJS = format === 'cjs'
    const isUMD = format === 'umd'
    const isIIFE = format === 'iife'

    // 智能目录分配
    let dir = config.output?.dir || 'dist'
    if (isESM) {
      dir = path.join(dir, 'es')
    } else if (isCJS) {
      dir = path.join(dir, 'cjs')
    }

    // 智能文件命名
    const entryFileNames = this.getEntryFileName(format, config)
    const chunkFileNames = this.getChunkFileName(format, config)

    // 格式特定插件
    const formatPlugins = await this.getFormatSpecificPlugins(format, config)

    return {
      format: mapped,
      dir,
      entryFileNames,
      chunkFileNames,
      preserveModules: (isESM || isCJS),
      preserveModulesRoot: (isESM || isCJS) ? 'src' : undefined,
      sourcemap: config.output?.sourcemap ?? true,
      globals: config.output?.globals,
      name: (isUMD || isIIFE) ? config.output?.name : undefined,
      plugins: formatPlugins
    }
  }

  /**
   * 获取增强的基础插件
   */
  private async getEnhancedBasePlugins(config: UnifiedConfig): Promise<any[]> {
    const plugins: any[] = []

    try {
      // Node resolve 插件
      const resolve = await import('@rollup/plugin-node-resolve')
      plugins.push(resolve.default({
        preferBuiltins: false,
        browser: config.browser ?? true,
        mainFields: ['module', 'jsnext:main', 'main'],
        extensions: ['.mjs', '.js', '.jsx', '.json', '.node', '.ts', '.tsx'],
        dedupe: config.dedupe || [],
        resolveOnly: config.resolveOnly
      }))

      // CommonJS 插件
      const commonjs = await import('@rollup/plugin-commonjs')
      plugins.push(commonjs.default({
        include: /node_modules/,
        requireReturnsDefault: 'auto',
        defaultIsModuleExports: true,
        esmExternals: true,
        transformMixedEsModules: true
      }))

      // JSON 插件
      const json = await import('@rollup/plugin-json')
      plugins.push(json.default({
        compact: true,
        preferConst: true,
        indent: '  '
      }))

      // TypeScript 处理
      if (await this.hasTypeScriptFiles(config)) {
        const typescript = await import('@rollup/plugin-typescript')
        plugins.push(typescript.default({
          tsconfig: await this.findTsConfig(),
          declaration: true,
          declarationMap: true,
          sourceMap: true,
          inlineSources: true,
          exclude: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/*.spec.tsx']
        }))
      }

      // 压缩插件
      if (config.minify !== false && config.mode === 'production') {
        const terser = await import('@rollup/plugin-terser')
        plugins.push(terser.default({
          compress: {
            ecma: 2015,
            passes: 2,
            drop_console: config.dropConsole ?? false,
            pure_funcs: config.pureFuncs || []
          },
          mangle: {
            safari10: true
          },
          format: {
            comments: false,
            preserve_annotations: true
          }
        }))
      }

      // 替换插件
      if (config.define || config.env) {
        const replace = await import('@rollup/plugin-replace')
        const replacements: Record<string, string> = {}

        if (config.define) {
          Object.assign(replacements, config.define)
        }

        if (config.env) {
          Object.keys(config.env).forEach(key => {
            replacements[`process.env.${key}`] = JSON.stringify(config.env![key])
          })
        }

        plugins.push(replace.default({
          preventAssignment: true,
          values: replacements
        }))
      }

      // 用户自定义插件
      if (config.plugins) {
        const transformedPlugins = await this.transformPlugins(config.plugins)
        plugins.push(...transformedPlugins)
      }

    } catch (error) {
      this.logger.error('加载插件失败:', error)
      throw error
    }

    return plugins
  }

  /**
   * 验证配置
   */
  private async validateConfig(config: UnifiedConfig): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证入口
    if (!config.input) {
      errors.push('未指定入口文件')
    }

    // 验证输出
    if (!config.output) {
      errors.push('未指定输出配置')
    } else {
      if (!config.output.dir && !config.output.file) {
        errors.push('未指定输出目录或文件')
      }
    }

    // 验证插件
    if (config.plugins) {
      for (const plugin of config.plugins) {
        const validation = await this.validatePlugin(plugin)
        errors.push(...validation.errors)
        warnings.push(...validation.warnings)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 验证插件
   */
  private async validatePlugin(plugin: any): Promise<PluginValidation> {
    const errors: string[] = []
    const warnings: string[] = []

    if (!plugin) {
      errors.push('插件为空')
    } else if (typeof plugin === 'object') {
      if (!plugin.name) {
        warnings.push('插件缺少名称')
      }

      // 检查必要的钩子
      const hasHooks = ['buildStart', 'buildEnd', 'renderChunk', 'generateBundle', 'transform', 'load', 'resolveId']
        .some(hook => typeof plugin[hook] === 'function')

      if (!hasHooks && !plugin.plugin) {
        warnings.push('插件没有实现任何钩子')
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  /**
   * 验证单个配置
   */
  private async validateSingleConfig(config: any): Promise<void> {
    if (!config.input) {
      throw new Error('配置缺少入口文件')
    }

    if (!config.output) {
      throw new Error('配置缺少输出设置')
    }

    // 检查输出目录权限
    const outputDir = config.output.dir || path.dirname(config.output.file)
    try {
      await fs.ensureDir(outputDir)
    } catch (error) {
      throw new Error(`无法创建输出目录 ${outputDir}: ${(error as Error).message}`)
    }
  }

  /**
   * 生成和写入输出
   */
  private async generateAndWriteOutputs(bundle: any, config: any): Promise<any[]> {
    const outputs: any[] = []

    try {
      // 生成输出
      const { output } = await bundle.generate(config.output)

      // 验证输出
      await this.validateOutputs(output, config.output)

      // 增强输出
      for (const chunk of output) {
        if (chunk.type === 'chunk') {
          // 添加源码映射链接
          if (config.output.sourcemap && config.output.sourcemap !== 'inline') {
            chunk.code += `\n//# sourceMappingURL=${chunk.fileName}.map`
          }
        }
      }

      outputs.push(...output)

      // 写入文件
      await bundle.write(config.output)

    } catch (error) {
      throw new Error(`生成输出失败: ${(error as Error).message}`)
    }

    return outputs
  }

  /**
   * 验证输出
   */
  private async validateOutputs(outputs: any[], config: any): Promise<void> {
    for (const output of outputs) {
      // 检查输出大小
      const size = output.type === 'chunk' ? output.code.length : output.source.length
      if (size === 0) {
        this.logger.warn(`输出文件 ${output.fileName} 为空`)
      }

      // 检查必要的导出
      if (output.type === 'chunk' && config.format === 'cjs') {
        if (!output.code.includes('exports.') && !output.code.includes('module.exports')) {
          this.logger.warn(`CommonJS 输出 ${output.fileName} 可能没有导出`)
        }
      }
    }
  }

  /**
   * 增强输出结果
   */
  private async enhanceOutputs(outputs: any[], metadata: Map<string, any>): Promise<any[]> {
    const enhanced = []

    for (const output of outputs) {
      const meta = metadata.get(output.fileName) || {}
      const size = output.type === 'chunk' ? output.code.length : output.source.length
      const source = output.type === 'chunk' ? output.code : output.source

      // 计算哈希
      const hash = createHash('md5').update(source).digest('hex')

      // 计算 gzip 大小
      let gzipSize = 0
      try {
        const { gzipSize: getGzipSize } = await import('gzip-size')
        gzipSize = await getGzipSize(source)
      } catch (error) {
        this.logger.debug('无法计算 gzip 大小:', error)
      }

      enhanced.push({
        fileName: output.fileName,
        size,
        source,
        type: output.type,
        format: meta.format || 'unknown',
        gzipSize,
        hash,
        map: output.map,
        isEntry: output.isEntry || false,
        isDynamicEntry: output.isDynamicEntry || false,
        facadeModuleId: output.facadeModuleId,
        modules: output.modules,
        imports: output.imports || [],
        exports: output.exports || []
      })
    }

    return enhanced
  }

  /**
   * 生成构建统计
   */
  private async generateBuildStats(outputs: any[], duration: number): Promise<any> {
    const totalSize = outputs.reduce((sum, o) => sum + o.size, 0)
    const totalGzipSize = outputs.reduce((sum, o) => sum + o.gzipSize, 0)

    const byFormat: Record<string, any> = {}
    const formats = ['esm', 'cjs', 'umd', 'iife', 'css']

    for (const format of formats) {
      const formatOutputs = outputs.filter(o => o.format === format ||
        (format === 'css' && o.fileName.endsWith('.css')))

      byFormat[format] = {
        fileCount: formatOutputs.length,
        size: {
          raw: formatOutputs.reduce((sum, o) => sum + o.size, 0),
          gzip: formatOutputs.reduce((sum, o) => sum + o.gzipSize, 0),
          brotli: 0,
          byType: {},
          byFormat: {},
          largest: formatOutputs.length > 0 ? {
            file: formatOutputs.sort((a, b) => b.size - a.size)[0].fileName,
            size: formatOutputs.sort((a, b) => b.size - a.size)[0].size
          } : { file: '', size: 0 },
          fileCount: formatOutputs.length
        }
      }
    }

    // 分析模块
    const modules = new Set<string>()
    const externalModules = new Set<string>()

    for (const output of outputs) {
      if (output.modules) {
        Object.keys(output.modules).forEach(m => modules.add(m))
      }
      if (output.imports) {
        output.imports.forEach((i: string) => externalModules.add(i))
      }
    }

    return {
      buildTime: duration,
      fileCount: outputs.length,
      totalSize: {
        raw: totalSize,
        gzip: totalGzipSize,
        brotli: 0,
        byType: {
          js: outputs.filter(o => o.fileName.endsWith('.js')).reduce((sum, o) => sum + o.size, 0),
          css: outputs.filter(o => o.fileName.endsWith('.css')).reduce((sum, o) => sum + o.size, 0),
          map: outputs.filter(o => o.fileName.endsWith('.map')).reduce((sum, o) => sum + o.size, 0)
        },
        byFormat,
        largest: outputs.length > 0 ? {
          file: outputs.sort((a, b) => b.size - a.size)[0].fileName,
          size: outputs.sort((a, b) => b.size - a.size)[0].size
        } : { file: '', size: 0 },
        fileCount: outputs.length
      },
      byFormat,
      modules: {
        total: modules.size,
        external: externalModules.size,
        internal: modules.size - externalModules.size,
        largest: null
      },
      dependencies: {
        total: externalModules.size,
        external: Array.from(externalModules),
        bundled: [],
        circular: []
      }
    }
  }

  /**
   * 验证构建产物
   */
  private async validateBuildOutputs(outputs: any[], config: UnifiedConfig): Promise<any> {
    const errors: string[] = []
    const warnings: string[] = []
    let success = true

    // 检查是否有输出
    if (outputs.length === 0) {
      errors.push('没有生成任何输出文件')
      success = false
    }

    // 检查必要的文件
    if (config.output?.format) {
      const formats = Array.isArray(config.output.format) ? config.output.format : [config.output.format]

      for (const format of formats) {
        const hasFormat = outputs.some(o => o.format === this.mapFormat(format))
        if (!hasFormat) {
          warnings.push(`缺少 ${format} 格式的输出`)
        }
      }
    }

    // 检查文件完整性
    for (const output of outputs) {
      if (output.size === 0) {
        warnings.push(`文件 ${output.fileName} 为空`)
      }

      // 检查源码映射
      if (config.output?.sourcemap && !output.fileName.endsWith('.map')) {
        const mapFile = `${output.fileName}.map`
        const hasMap = outputs.some(o => o.fileName === mapFile)
        if (!hasMap && output.type === 'chunk') {
          warnings.push(`缺少源码映射文件: ${mapFile}`)
        }
      }
    }

    return {
      success,
      errors,
      warnings
    }
  }

  /**
   * 增强错误信息
   */
  private async enhanceError(error: Error): Promise<Error> {
    // 添加更多上下文信息
    const enhancedError = new Error(error.message)
    enhancedError.stack = error.stack

    // 添加建议
    if (error.message.includes('Could not resolve')) {
      (enhancedError as any).suggestion = '请检查模块路径或安装缺失的依赖'
    } else if (error.message.includes('Unexpected token')) {
      (enhancedError as any).suggestion = '请检查语法错误或配置相应的转换插件'
    } else if (error.message.includes('ENOENT')) {
      (enhancedError as any).suggestion = '文件或目录不存在，请检查路径'
    }

    return enhancedError
  }

  /**
   * 获取格式特定插件
   */
  private async getFormatSpecificPlugins(format: string, config: UnifiedConfig): Promise<any[]> {
    const plugins: any[] = []

    // TypeScript 声明文件插件
    if (format === 'esm' && await this.hasTypeScriptFiles(config)) {
      try {
        const dts = await import('rollup-plugin-dts')
        void dts
        if (config.typescript?.declaration) {
          // 这里可以添加 dts 插件配置
        }
      } catch (error) {
        this.logger.debug('rollup-plugin-dts 不可用')
      }
    }

    // CSS 处理插件
    if (await this.hasStyleFiles(config)) {
      try {
        const postcss = await import('rollup-plugin-postcss')
        plugins.push(postcss.default({
          extract: true,
          minimize: config.mode === 'production',
          sourceMap: config.output?.sourcemap !== false,
          use: {
            sass: await this.hasSassFiles(config) ? {} : undefined,
            less: await this.hasLessFiles(config) ? {} : undefined,
            stylus: await this.hasStylusFiles(config) ? {} : undefined
          }
        }))
      } catch (error) {
        this.logger.debug('样式处理插件不可用')
      }
    }

    return plugins
  }

  /**
   * 处理外部依赖配置
   */
  private processExternal(external: any): any {
    if (!external) return []

    if (Array.isArray(external)) {
      return external
    }

    if (typeof external === 'function') {
      return external
    }

    if (external instanceof RegExp) {
      return (id: string) => external.test(id)
    }

    if (typeof external === 'string') {
      return [external]
    }

    if (typeof external === 'object') {
      return Object.keys(external)
    }

    return []
  }

  /**
   * 获取入口文件名
   */
  private getEntryFileName(format: string, config: UnifiedConfig): string {
    const out: any = config.output as any
    if (out?.entryFileNames) {
      return out.entryFileNames
    }
    if (config.output?.fileName) {
      return config.output.fileName as string
    }

    switch (format) {
      case 'esm':
        return '[name].js'
      case 'cjs':
        return '[name].cjs'
      case 'umd':
        return '[name].js'
      case 'iife':
        return '[name].iife.js'
      default:
        return '[name].js'
    }
  }

  /**
   * 获取代码块文件名
   */
  private getChunkFileName(format: string, config: UnifiedConfig): string {
    if (config.output?.chunkFileNames) {
      return config.output.chunkFileNames
    }

    switch (format) {
      case 'esm':
        return 'chunks/[name]-[hash].js'
      case 'cjs':
        return 'chunks/[name]-[hash].cjs'
      default:
        return 'chunks/[name]-[hash].js'
    }
  }

  /**
   * 创建增强的 UMD 配置
   */
  private async createEnhancedUMDConfig(config: UnifiedConfig, format: string): Promise<FormatConfig> {
    const name = config.output?.name || 'Library'
    const globals = config.output?.globals || {}

    // 创建单入口包装器
    const tempEntry = path.join(process.cwd(), '.temp', `umd-entry-${Date.now()}.js`)
    await fs.ensureDir(path.dirname(tempEntry))

    // 生成包装器代码
    const entries = Array.isArray(config.input) ? config.input : [config.input]
    const imports = entries.map((entry, index) =>
      `export * as module${index} from '${entry}'`
    ).join('\n')

    await fs.writeFile(tempEntry, imports)

    return {
      format: format === 'umd' ? 'umd' : 'iife',
      dir: config.output?.dir || 'dist',
      entryFileNames: `[name].${format}.js`,
      chunkFileNames: `chunks/[name]-[hash].${format}.js`,
      preserveModules: false,
      name,
      globals,
      sourcemap: config.output?.sourcemap ?? true,
      plugins: []
    }
  }

  /**
   * 检查是否有 TypeScript 文件
   */
  private async hasTypeScriptFiles(config: UnifiedConfig): Promise<boolean> {
    const input = config.input as any

    let entries: string[] = []
    if (Array.isArray(input)) {
      entries = input.filter((e: any): e is string => typeof e === 'string')
    } else if (typeof input === 'object' && input !== null) {
      // 命名入口对象 { name: path }
      entries = Object.values(input).filter((e: any): e is string => typeof e === 'string')
    } else if (typeof input === 'string') {
      entries = [input]
    }

    return entries.some((entry) => entry.endsWith('.ts') || entry.endsWith('.tsx'))
  }

  /**
   * 查找 tsconfig.json
   */
  private async findTsConfig(): Promise<string | undefined> {
    const candidates = [
      'tsconfig.json',
      'tsconfig.build.json',
      '../tsconfig.json',
      '../../tsconfig.json'
    ]

    for (const candidate of candidates) {
      const fullPath = path.join(process.cwd(), candidate)
      if (await fs.pathExists(fullPath)) {
        return fullPath
      }
    }

    return undefined
  }

  /**
   * 检查是否有样式文件
   */
  private async hasStyleFiles(_config: UnifiedConfig): Promise<boolean> {
    // 简单检查，实际实现可以更复杂
    return true
  }

  /**
   * 检查是否有 Sass 文件
   */
  private async hasSassFiles(_config: UnifiedConfig): Promise<boolean> {
    return false // 简化实现
  }

  /**
   * 检查是否有 Less 文件
   */
  private async hasLessFiles(_config: UnifiedConfig): Promise<boolean> {
    return false // 简化实现
  }

  /**
   * 检查是否有 Stylus 文件
   */
  private async hasStylusFiles(_config: UnifiedConfig): Promise<boolean> {
    return false // 简化实现
  }

  /**
   * 检查是否是多入口构建
   */
  private isMultiEntryBuild(input: any): boolean {
    if (Array.isArray(input)) {
      return input.length > 1
    }

    if (typeof input === 'object' && input !== null) {
      return Object.keys(input).length > 1
    }

    return false
  }

  /**
   * 映射格式
   */
  private mapFormat(format: string): string {
    const formatMap: Record<string, string> = {
      'esm': 'es',
      'es': 'es',
      'cjs': 'cjs',
      'commonjs': 'cjs',
      'umd': 'umd',
      'iife': 'iife',
      'amd': 'amd',
      'system': 'system'
    }

    return formatMap[format] || format
  }

  /**
   * 转换插件
   */
  async transformPlugins(plugins: any[]): Promise<BundlerSpecificPlugin[]> {
    const transformedPlugins: BundlerSpecificPlugin[] = []

    for (const plugin of plugins) {
      try {
        // 缓存插件
        const cacheKey = JSON.stringify(plugin.name || plugin)
        if (this.pluginCache.has(cacheKey)) {
          transformedPlugins.push(this.pluginCache.get(cacheKey))
          continue
        }

        let actualPlugin

        if (plugin.plugin && typeof plugin.plugin === 'function') {
          actualPlugin = await plugin.plugin()
        } else if (plugin.rollup) {
          actualPlugin = { ...plugin, ...plugin.rollup }
        } else {
          actualPlugin = plugin
        }

        this.pluginCache.set(cacheKey, actualPlugin)
        transformedPlugins.push(actualPlugin)

      } catch (error) {
        this.logger.warn(`插件 ${plugin.name || 'unknown'} 加载失败:`, (error as Error).message)
      }
    }

    return transformedPlugins
  }

  /**
   * 获取 Acorn 插件
   */
  private async getAcornPlugins(): Promise<any[]> {
    const plugins = []

    try {
      // JSX 支持
      const jsx = await import('acorn-jsx')
      plugins.push(jsx.default())
    } catch (error) {
      this.logger.debug('acorn-jsx 不可用')
    }

    try {
      // TypeScript 支持
      const ts = await import('acorn-typescript')
      plugins.push(ts.default())
    } catch (error) {
      this.logger.debug('acorn-typescript 不可用')
    }

    return plugins
  }

  /**
   * 加载 Rollup
   */
  private async loadRollup(): Promise<any> {
    if (this.rollupInstance) {
      return this.rollupInstance
    }

    try {
      const rollup = await import('rollup')
      this.rollupInstance = rollup

      // 获取版本
      if (rollup.VERSION) {
        (this as any).version = rollup.VERSION
      }

      return rollup
    } catch (error) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Rollup 未安装或无法加载',
        { cause: error as Error }
      )
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMonitor?.getMetrics() || {
      buildTime: 0,
      bundleTime: 0,
      optimizeTime: 0,
      emitTime: 0,
      totalTime: 0,
      memoryUsage: {
        peak: 0,
        average: 0
      },
      phases: []
    }
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    this.pluginCache.clear()
    this.outputCache.clear()
    this.multiConfigs = undefined
    this.rollupInstance = null

    this.logger.debug('增强版 Rollup 适配器已清理')
  }

  supportsFeature(feature: BundlerFeature): boolean {
    const support = this.getFeatureSupport()
    return support[feature] ?? false
  }

  getFeatureSupport(): FeatureSupportMap {
    return {
      'treeshaking': true,
      'code-splitting': true,
      'dynamic-import': true,
      'worker-support': true,
      'css-bundling': true,
      'asset-processing': true,
      'sourcemap': true,
      'minification': true,
      'hot-reload': false,
      'module-federation': false,
      'incremental-build': true,
      'parallel-build': true,
      'cache-support': true,
      'plugin-system': true,
      'config-file': true
    } as unknown as FeatureSupportMap
  }
}
