/**
 * Rollup 适配器
 *
 * 提供 Rollup 打包器的适配实现
 *
 * @author LDesign Team
 * @version 1.0.0
 */

import type {
  IBundlerAdapter,
  UnifiedConfig,
  AdapterOptions,
  BundlerSpecificConfig,
  BundlerSpecificPlugin
} from '../../types/adapter'
import type { BuildResult, BuildWatcher } from '../../types/builder'
import type { PerformanceMetrics } from '../../types/performance'
import { Logger } from '../../utils/logger'
import { BuilderError } from '../../utils/error-handler'
import { ErrorCode } from '../../constants/errors'

/**
 * Rollup 适配器类
 */
export class RollupAdapter implements IBundlerAdapter {
  readonly name = 'rollup' as const
  readonly version: string
  readonly available: boolean

  private logger: Logger
  private multiConfigs?: any[]

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()

    // 初始化时假设可用，在实际使用时再检查
    this.version = 'unknown'
    this.available = true

    this.logger.debug('Rollup 适配器初始化')
  }

  /**
   * 执行构建
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
      const rollupConfig = await this.transformConfig(config)

      this.logger.info('开始 Rollup 构建...')
      const startTime = Date.now()

      let results: any[] = []

      // 如果有多个配置，分别构建每个配置
      if (this.multiConfigs && this.multiConfigs.length > 1) {
        for (const singleConfig of this.multiConfigs) {
          // 创建 bundle
          const bundle = await rollup.rollup(singleConfig)

          // 生成输出
          const { output } = await bundle.generate(singleConfig.output)
          results.push(...output)

          // 写入文件
          await bundle.write(singleConfig.output)
          await bundle.close()
        }
      } else {
        // 单配置构建
        const bundle = await rollup.rollup(rollupConfig)

        // 生成输出
        const outputs = Array.isArray(rollupConfig.output)
          ? rollupConfig.output
          : [rollupConfig.output]

        for (const outputConfig of outputs) {
          const { output } = await bundle.generate(outputConfig)
          results.push(...output)
        }

        // 写入文件
        for (const outputConfig of outputs) {
          await bundle.write(outputConfig)
        }

        await bundle.close()
      }

      const duration = Date.now() - startTime

      // 构建结果
      const buildResult: BuildResult = {
        success: true,
        outputs: results.map(chunk => ({
          fileName: chunk.fileName,
          size: chunk.type === 'chunk' ? chunk.code.length : chunk.source.length,
          source: chunk.type === 'chunk' ? chunk.code : chunk.source,
          type: chunk.type,
          format: 'esm', // TODO: 从配置获取
          gzipSize: 0 // TODO: 计算 gzip 大小
        })),
        duration,
        stats: {
          buildTime: duration,
          fileCount: results.length,
          totalSize: {
            raw: results.reduce((total, chunk) =>
              total + (chunk.type === 'chunk' ? chunk.code.length : chunk.source.length), 0
            ),
            gzip: 0,
            brotli: 0,
            byType: {},
            byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 },
            largest: { file: '', size: 0 },
            fileCount: results.length
          },
          byFormat: {
            esm: {
              fileCount: results.length,
              size: {
                raw: results.reduce((total, chunk) =>
                  total + (chunk.type === 'chunk' ? chunk.code.length : chunk.source.length), 0
                ),
                gzip: 0,
                brotli: 0,
                byType: {},
                byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 },
                largest: { file: '', size: 0 },
                fileCount: results.length
              }
            },
            cjs: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
            umd: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
            iife: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
            css: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } }
          },
          modules: {
            total: 0,
            external: 0,
            internal: 0,
            largest: {
              id: '',
              size: 0,
              renderedLength: 0,
              originalLength: 0,
              isEntry: false,
              isExternal: false,
              importedIds: [],
              dynamicallyImportedIds: [],
              importers: [],
              dynamicImporters: []
            }
          },
          dependencies: {
            total: 0,
            external: [],
            bundled: [],
            circular: []
          }
        },
        performance: this.getPerformanceMetrics(),
        warnings: [],
        errors: [],
        buildId: `rollup-${Date.now()}`,
        timestamp: Date.now(),
        bundler: 'rollup',
        mode: 'production'
      }

      this.logger.success(`Rollup 构建完成 (${duration}ms)`)
      return buildResult

    } catch (error) {
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `Rollup 构建失败: ${(error as Error).message}`,
        { cause: error as Error }
      )
    }
  }

  /**
   * 启动监听模式
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

      // 添加监听配置
      const watchOptions = config.watch || {}
      const watchConfig = {
        ...rollupConfig,
        watch: {
          include: (watchOptions as any).include || ['src/**/*'],
          exclude: (watchOptions as any).exclude || ['node_modules/**/*'],
          ...(typeof watchOptions === 'object' ? watchOptions : {})
        }
      }

      const watcher = rollup.watch(watchConfig)

      // 创建统一的监听器接口
      const buildWatcher = {
        patterns: watchConfig.watch.include,
        watching: true,

        async close() {
          await watcher.close()
        },

        on(event: string, listener: (...args: any[]) => void) {
          watcher.on(event, listener)
          return this
        },

        off(event: string, listener: (...args: any[]) => void) {
          watcher.off(event, listener)
          return this
        },

        emit(_event: string, ..._args: any[]) {
          return false // Rollup watcher 不支持 emit
        }
      } as BuildWatcher

      this.logger.info('Rollup 监听模式已启动')
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
   * 转换配置
   */
  async transformConfig(config: UnifiedConfig): Promise<BundlerSpecificConfig> {
    // 转换为 Rollup 配置格式
    const basePlugins = await this.getBasePlugins(config)

    const rollupConfig: any = {
      input: config.input,
      external: config.external
    }

    // 注入 Acorn 插件以支持在转换前解析 TSX/JSX/TS 语法，避免早期解析错误
    const acornPlugins = await this.getAcornPlugins()
    if (acornPlugins.length > 0) {
      rollupConfig.acorn = { ...(rollupConfig.acorn || {}), injectPlugins: acornPlugins }
    }

    // 转换输出配置
    if (config.output) {
      const outputConfig = config.output as any

      // 优先处理对象化的输出配置（output.esm / output.cjs / output.umd）
      if (outputConfig.esm || outputConfig.cjs || outputConfig.umd) {
        const configs: any[] = []

        if (outputConfig.esm) {
          const esmDir = outputConfig.esm.dir || 'es'
          const esmPlugins = await this.transformPluginsForFormat(config.plugins || [], esmDir, { emitDts: true })
          configs.push({
            input: config.input,
            external: config.external,
            plugins: [...basePlugins, ...esmPlugins],
            output: {
              dir: esmDir,
              format: 'es',
              sourcemap: outputConfig.esm.sourcemap ?? outputConfig.sourcemap,
              entryFileNames: '[name].js',
              chunkFileNames: '[name].js',
              exports: outputConfig.esm.exports ?? 'auto',
              preserveModules: true,
              preserveModulesRoot: 'src',
              globals: outputConfig.globals,
              name: outputConfig.name,
            },
            treeshake: config.treeshake
          })
        }

        if (outputConfig.cjs) {
          const cjsDir = outputConfig.cjs.dir || 'cjs'
          const cjsPlugins = await this.transformPluginsForFormat(config.plugins || [], cjsDir, { emitDts: true })
          configs.push({
            input: config.input,
            external: config.external,
            plugins: [...basePlugins, ...cjsPlugins],
            output: {
              dir: cjsDir,
              format: 'cjs',
              sourcemap: outputConfig.cjs.sourcemap ?? outputConfig.sourcemap,
              entryFileNames: '[name].cjs',
              chunkFileNames: '[name].cjs',
              exports: outputConfig.cjs.exports ?? 'auto',
              preserveModules: true,
              preserveModulesRoot: 'src',
              globals: outputConfig.globals,
              name: outputConfig.name,
            },
            treeshake: config.treeshake
          })
        }

        if (outputConfig.umd || (config as any).umd) {
          const umdCfg = await this.createUMDConfig(config)
          configs.push(umdCfg)
        }

        // 如果未声明 umd，但存在 src/index-lib.ts 也自动加上
        if (!outputConfig.umd && !(config as any).umd) {
          const fs = await import('fs')
          const path = await import('path')
          const projectRoot = (config as any).root || (config as any).cwd || process.cwd()
          const hasIndexLib = fs.existsSync(path.resolve(projectRoot, 'src/index-lib.ts')) || fs.existsSync(path.resolve(projectRoot, 'src/index-lib.js'))
          if (hasIndexLib) {
            const umdCfg = await this.createUMDConfig(config)
            configs.push(umdCfg)
          }
        }

        if (configs.length > 0) {
          this.multiConfigs = configs
          return configs[0]
        }
        // 如果没有任何子配置，则回退到单一输出逻辑
      }

      // 处理数组或者单一 format 字段
      // 处理多格式输出
      if (Array.isArray(outputConfig.format)) {
        // 原有多格式逻辑（略微精简），同上
        const isMultiEntry = this.isMultiEntryBuild(config.input)
        let formats = outputConfig.format
        let umdConfig: any = null

        if (isMultiEntry) {
          const originalFormats = [...formats]
          const hasUMD = formats.includes('umd')
          const forceUMD = (config as any).umd?.forceMultiEntry || false
          const umdEnabled = (config as any).umd?.enabled
          this.logger.info(`多入口项目UMD检查: hasUMD=${hasUMD}, forceUMD=${forceUMD}, umdEnabled=${umdEnabled}`)

          if (hasUMD && forceUMD) {
            umdConfig = await this.createUMDConfig(config)
            this.logger.info('多入口项目强制启用 UMD 构建')
          } else if (hasUMD) {
            formats = formats.filter((format: any) => format !== 'umd' && format !== 'iife')
            if ((config as any).umd?.enabled !== false) {
              umdConfig = await this.createUMDConfig(config)
              this.logger.info('为多入口项目创建独立的 UMD 构建')
            }
          } else {
            if ((config as any).umd?.enabled) {
              umdConfig = await this.createUMDConfig(config)
              this.logger.info('根据UMD配置为多入口项目创建 UMD 构建')
            }
            formats = formats.filter((format: any) => format !== 'umd' && format !== 'iife')
          }

          const filteredFormats = originalFormats.filter((format: any) => !formats.includes(format))
          if (filteredFormats.length > 0 && !umdConfig) {
            this.logger.warn(`多入口构建不支持 ${filteredFormats.join(', ')} 格式，已自动过滤`)
          }
        } else {
          const hasUmdSection = Boolean((config as any).umd || (config as any).output?.umd)
          const fs = await import('fs')
          const path = await import('path')
          const projectRoot = (config as any).root || (config as any).cwd || process.cwd()
          const hasIndexLib = fs.existsSync(path.resolve(projectRoot, 'src/index-lib.ts')) || fs.existsSync(path.resolve(projectRoot, 'src/index-lib.js'))
          if (formats.includes('umd') || (config as any).umd?.enabled || hasUmdSection || hasIndexLib) {
            umdConfig = await this.createUMDConfig(config)
          }
          formats = formats.filter((f: any) => f !== 'umd' && f !== 'iife')
        }

        const configs: any[] = []
        for (const format of formats) {
          const mapped = this.mapFormat(format)
          const isESM = format === 'esm'
          const isCJS = format === 'cjs'
          const dir = isESM ? 'es' : isCJS ? 'cjs' : 'dist'
          const entryFileNames = isESM ? '[name].js' : isCJS ? '[name].cjs' : '[name].umd.js'
          const chunkFileNames = entryFileNames
          const formatPlugins = await this.transformPluginsForFormat(config.plugins || [], dir, { emitDts: true })
          try {
            const names = [...(formatPlugins || [])].map((p: any) => p?.name || '(anon)')
            this.logger.info(`[${format}] 有效插件: ${names.join(', ')}`)
          } catch {}
          configs.push({
            input: config.input,
            external: config.external,
            plugins: [...basePlugins, ...formatPlugins],
            output: {
              dir,
              format: mapped,
              name: outputConfig.name,
              sourcemap: outputConfig.sourcemap,
              globals: outputConfig.globals,
              entryFileNames,
              chunkFileNames,
              exports: (outputConfig as any).exports ?? 'auto',
              preserveModules: isESM || isCJS,
              preserveModulesRoot: (isESM || isCJS) ? 'src' : undefined
            },
            treeshake: config.treeshake
          })
        }
        if (umdConfig) configs.push(umdConfig)
        this.multiConfigs = configs
        return configs[0]
      } else {
        const format = (outputConfig as any).format
        const mapped = this.mapFormat(format)
        const isESM = format === 'esm'
        const isCJS = format === 'cjs'
        const dir = isESM ? 'es' : isCJS ? 'cjs' : 'dist'
        const entryFileNames = isESM ? '[name].js' : isCJS ? '[name].cjs' : '[name].umd.js'
        const chunkFileNames = entryFileNames
        const userPlugins = await this.transformPluginsForFormat(config.plugins || [], dir, { emitDts: true })
        try {
          const names = [...(userPlugins || [])].map((p: any) => p?.name || '(anon)')
          this.logger.info(`[${format}] 有效插件: ${names.join(', ')}`)
        } catch {}
        rollupConfig.plugins = [...basePlugins, ...userPlugins]
        rollupConfig.output = {
          dir,
          format: mapped,
          name: outputConfig.name,
          sourcemap: outputConfig.sourcemap,
          globals: outputConfig.globals,
          entryFileNames,
          chunkFileNames,
          exports: (outputConfig as any).exports ?? 'auto',
          preserveModules: isESM || isCJS,
          preserveModulesRoot: (isESM || isCJS) ? 'src' : undefined
        }
      }
    }

    // 转换其他选项
    if (config.treeshake !== undefined) {
      rollupConfig.treeshake = config.treeshake
    }

    return rollupConfig
  }

  /**
   * 转换插件
   */
  async transformPlugins(plugins: any[]): Promise<BundlerSpecificPlugin[]> {
    const transformedPlugins: BundlerSpecificPlugin[] = []

    for (const plugin of plugins) {
      try {
        // 如果插件有 plugin 函数，调用它来获取实际插件
        if (plugin.plugin && typeof plugin.plugin === 'function') {
          const actualPlugin = await plugin.plugin()
          transformedPlugins.push(actualPlugin)
        }
        // 如果插件有 rollup 特定配置，使用它
        else if (plugin.rollup) {
          transformedPlugins.push({ ...plugin, ...plugin.rollup })
        }
        // 直接使用插件
        else {
          transformedPlugins.push(plugin)
        }
      } catch (error) {
        this.logger.warn(`插件 ${plugin.name || 'unknown'} 加载失败:`, (error as Error).message)
      }
    }

    return transformedPlugins
  }

  /**
   * 为特定格式转换插件，动态设置TypeScript插件的declarationDir
   */
  async transformPluginsForFormat(plugins: any[], outputDir: string, options?: { emitDts?: boolean }): Promise<BundlerSpecificPlugin[]> {
    const { emitDts = true } = options || {}
    const transformedPlugins: BundlerSpecificPlugin[] = []

    for (const plugin of plugins) {
      try {
        const pluginName: string = (plugin && (plugin.name || plugin?.rollup?.name)) || ''
        const nameLc = String(pluginName).toLowerCase()

        // 当明确不需要 d.ts（例如 UMD/IIFE）时，跳过所有 typescript/dts 相关插件（无论是包装器还是已实例化的插件）
        if (!emitDts && (nameLc.includes('typescript') || nameLc.includes('dts'))) {
          continue
        }

        // 如果插件有 plugin 函数，调用它来获取实际插件
        if (plugin.plugin && typeof plugin.plugin === 'function') {
          // 如果是TypeScript插件，需要特殊处理（为 ESM/CJS 定向声明输出目录）
          if (nameLc === 'typescript') {
            if (!emitDts) {
              // 已在上方统一拦截，这里双重防御
              continue
            }
            // 重新创建TypeScript插件，设置正确的declarationDir
            const typescript = await import('@rollup/plugin-typescript')

            // 直接从插件包装对象读取原始选项（在策略中附加）
            const originalOptions = (plugin as any).options || {}

            // 清理不被 @rollup/plugin-typescript 支持的字段
            const { tsconfigOverride: _ignored, compilerOptions: origCO = {}, ...rest } = originalOptions as any

            // 创建新的TypeScript插件，保留 include/exclude 等选项，并覆盖声明目录
            // 若指定的 tsconfig 不存在，则删除该字段，避免插件内部解析异常
            try {
              const pathMod = await import('path')
              const fsMod = await import('fs')
              if (typeof (rest as any).tsconfig === 'string') {
                const tsconfigAbs = pathMod.resolve(process.cwd(), (rest as any).tsconfig)
                if (!fsMod.existsSync(tsconfigAbs)) {
                  delete (rest as any).tsconfig
                }
              }
            } catch {}

            const newPlugin = typescript.default({
              ...rest,
              compilerOptions: {
                ...origCO,
                declaration: true,
                emitDeclarationOnly: true,
                declarationDir: outputDir,
                outDir: outputDir,
                // 避免 @rollup/plugin-typescript 在缺少 tsconfig 时的根目录推断失败
                rootDir: (origCO as any)?.rootDir ?? 'src'
              }
            })

            transformedPlugins.push(newPlugin)
          } else {
            // 其他插件正常处理
            const actualPlugin = await plugin.plugin()
            transformedPlugins.push(actualPlugin)
          }
        }
        // 如果插件有 rollup 特定配置，使用它
        else if (plugin.rollup) {
          // UMD/IIFE 禁止 d.ts 相关插件
          const rnameLc = String(plugin.rollup.name || '').toLowerCase()
          if (!emitDts && (rnameLc.includes('typescript') || rnameLc.includes('dts'))) {
            continue
          }
          transformedPlugins.push({ ...plugin, ...plugin.rollup })
        }
        // 直接使用已实例化的插件
        else {
          // UMD/IIFE 禁止 d.ts 相关插件
          const inameLc = String((plugin as any)?.name || '').toLowerCase()
          if (!emitDts && (inameLc.includes('typescript') || inameLc.includes('dts'))) {
            continue
          }
          transformedPlugins.push(plugin)
        }
      } catch (error) {
        this.logger.warn(`插件 ${plugin.name || 'unknown'} 加载失败:`, (error as Error).message)
      }
    }

    return transformedPlugins
  }

  /**
   * 检查功能支持
   */
  supportsFeature(feature: any): boolean {
    // Rollup 支持的功能
    const supportedFeatures = [
      'treeshaking',
      'code-splitting',
      'dynamic-import',
      'sourcemap',
      'plugin-system',
      'config-file',
      'cache-support'
    ]

    return supportedFeatures.includes(feature)
  }

  /**
   * 获取功能支持映射
   */
  getFeatureSupport(): any {
    return {
      treeshaking: true,
      'code-splitting': true,
      'dynamic-import': true,
      'worker-support': false,
      'css-bundling': false,
      'asset-processing': true,
      sourcemap: true,
      minification: false,
      'hot-reload': false,
      'module-federation': false,
      'incremental-build': false,
      'parallel-build': false,
      'cache-support': true,
      'plugin-system': true,
      'config-file': true
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    // 返回默认指标，因为 PerformanceMonitor 没有直接的 getMetrics 方法
    // 性能指标应该通过 endBuild 方法获取
    return {
      buildTime: 0,
      memoryUsage: {
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss,
        peak: 0,
        trend: []
      },
      cacheStats: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        entries: 0,
        timeSaved: 0
      },
      fileStats: {
        totalFiles: 0,
        filesByType: {},
        averageProcessingTime: 0,
        slowestFiles: [],
        processingRate: 0
      },
      pluginPerformance: [],
      systemResources: {
        cpuUsage: 0,
        availableMemory: 0,
        diskUsage: {
          total: 0,
          used: 0,
          available: 0,
          usagePercent: 0
        }
      }
    }
  }

  /**
   * 尝试加载 Acorn 插件（JSX 与 TypeScript），以便 Rollup 在插件转换之前也能解析相应语法
   */
  private async getAcornPlugins(): Promise<any[]> {
    const plugins: any[] = []
    try {
      const jsx = (await import('acorn-jsx')).default
      // acorn-jsx 返回一个插件工厂函数
      plugins.push(jsx())
    } catch (e) {
      // 忽略
    }

    try {
      const ts = (await import('acorn-typescript')).default
      plugins.push(ts())
    } catch (e) {
      // 忽略
    }

    return plugins
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    // Rollup 适配器没有需要清理的资源
  }

  /**
   * 加载 Rollup
   */
  private async loadRollup(): Promise<any> {
    try {
      // 使用动态 import 加载 Rollup
      return await import('rollup')
    } catch (error) {
      throw new Error('Rollup 未安装，请运行: npm install rollup --save-dev')
    }
  }

  /**
   * 获取基础插件（内置）
   * - node-resolve: 解决第三方包解析，并优先浏览器分支
   * - commonjs: 兼容 CommonJS 包
   * - json: 允许 import JSON（如某些包内的 package.json 或配置 JSON）
   */
  private async getBasePlugins(config: UnifiedConfig): Promise<BundlerSpecificPlugin[]> {
    try {
      const { nodeResolve } = await import('@rollup/plugin-node-resolve')
      const commonjs = (await import('@rollup/plugin-commonjs')).default
      const json = (await import('@rollup/plugin-json')).default

      const resolvePlugin = nodeResolve({
        browser: true,
        preferBuiltins: false,
        extensions: ['.mjs', '.js', '.json', '.ts', '.tsx']
      })

      const commonjsPlugin = commonjs({
        include: /node_modules/,
        ignoreDynamicRequires: false
      })

      const jsonPlugin = json()

      const plugins = [
        resolvePlugin as unknown as BundlerSpecificPlugin,
        commonjsPlugin as unknown as BundlerSpecificPlugin,
        jsonPlugin as unknown as BundlerSpecificPlugin
      ]

      // 添加 Babel 插件（如果启用）
      const babelPlugin = await this.getBabelPlugin(config)
      if (babelPlugin) {
        plugins.push(babelPlugin)
      }

      return plugins
    } catch (error) {
      this.logger.warn('基础插件加载失败，将尝试继续构建', (error as Error).message)
      return []
    }
  }

  /**
   * 获取 Babel 插件
   */
  private async getBabelPlugin(config: UnifiedConfig): Promise<BundlerSpecificPlugin | null> {
    const babelConfig = (config as any).babel

    if (!babelConfig?.enabled) {
      return null
    }

    try {
      const { getBabelOutputPlugin } = await import('@rollup/plugin-babel')

      const babelOptions: any = {
        babelHelpers: babelConfig.runtime ? 'runtime' : 'bundled',
        exclude: babelConfig.exclude || /node_modules/,
        include: babelConfig.include,
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        presets: babelConfig.presets || [],
        plugins: babelConfig.plugins || []
      }

      // 添加默认预设（如果没有指定）
      if (babelOptions.presets.length === 0) {
        babelOptions.presets = [
          ['@babel/preset-env', {
            targets: babelConfig.targets || 'defaults',
            useBuiltIns: babelConfig.polyfill === 'usage' ? 'usage' : false,
            corejs: babelConfig.polyfill ? 3 : false
          }]
        ]
      }

      // 添加运行时插件（如果启用）
      if (babelConfig.runtime && !babelOptions.plugins.some((p: any) =>
        (Array.isArray(p) ? p[0] : p).includes('@babel/plugin-transform-runtime')
      )) {
        babelOptions.plugins.push(['@babel/plugin-transform-runtime', {
          corejs: false,
          helpers: true,
          regenerator: true,
          useESModules: true
        }])
      }

      // 使用配置文件（如果指定）
      if (babelConfig.configFile !== false) {
        babelOptions.configFile = babelConfig.configFile
      }

      if (babelConfig.babelrc !== false) {
        babelOptions.babelrc = babelConfig.babelrc
      }

      return getBabelOutputPlugin(babelOptions) as unknown as BundlerSpecificPlugin
    } catch (error) {
      this.logger.warn('Babel 插件加载失败，将跳过 Babel 转换', (error as Error).message)
      return null
    }
  }

  /**
   * 映射输出格式
   */
  private mapFormat(format: any): string {
    if (typeof format === 'string') {
      const formatMap: Record<string, string> = {
        esm: 'es',
        cjs: 'cjs',
        umd: 'umd',
        iife: 'iife'
      }
      return formatMap[format] || format
    }
    return 'es'
  }

  /**
   * 检查是否为多入口构建
   */
  private isMultiEntryBuild(input: any): boolean {
    // 如果input是数组，则为多入口
    if (Array.isArray(input)) {
      return input.length > 1
    }

    // 如果input是对象，则为多入口
    if (typeof input === 'object' && input !== null) {
      return Object.keys(input).length > 1
    }

    // 如果input是字符串且包含glob模式，可能为多入口
    if (typeof input === 'string') {
      // 检查是否包含glob通配符
      return input.includes('*') || input.includes('?') || input.includes('[')
    }

    return false
  }

  /**
   * 创建 UMD 配置
   */
  private async createUMDConfig(config: UnifiedConfig): Promise<any> {
    const umdSection = (config as any).umd || (config as any).output?.umd || {}
    const outputConfig = config.output || {}

    // 确定 UMD 入口文件
    const fs = await import('fs')
    const path = await import('path')

    let umdEntry = umdSection.entry || umdSection.input || (typeof config.input === 'string' ? config.input : undefined)

    // 如果未显式指定，优先使用 src/index-lib.ts，其次常见入口
    const candidates = [
      'src/index-lib.ts',
      'src/index-lib.js',
      umdEntry as string,
      'src/index.ts',
      'src/index.js',
      'src/main.ts',
      'src/main.js',
      'index.ts',
      'index.js'
    ].filter(Boolean) as string[]

    const projectRoot = (config as any).root || (config as any).cwd || process.cwd()
    for (const entry of candidates) {
      if (fs.existsSync(path.resolve(projectRoot, entry))) {
        umdEntry = entry
        break
      }
    }

    if (!umdEntry) {
      // 兜底：仍然使用 src/index.ts
      umdEntry = 'src/index.ts'
    }

    // 确定 UMD 全局变量名
    let umdName = umdSection.name || outputConfig.name
    if (!umdName) {
      // 尝试从 package.json 推断
      try {
        const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'))
        umdName = this.generateUMDName(packageJson.name)
      } catch {
        umdName = 'MyLibrary'
      }
    }

    // 创建 UMD 构建配置
    const basePlugins = await this.getBasePlugins(config)
    const userPlugins = await this.transformPluginsForFormat(config.plugins || [], (umdSection.dir || 'dist'), { emitDts: false })

    // 调试：打印 UMD 插件列表，确认没有 typescript/dts 插件
    try {
      const names = [...(userPlugins || [])].map((p: any) => p?.name || '(anon)')
      this.logger.info(`[UMD] 有效插件: ${names.join(', ')}`)
    } catch {}

    // 应用 Banner 和 Footer 配置
    const bannerConfig = (config as any).banner || {}
    const banner = await this.resolveBanner(bannerConfig)
    const footer = await this.resolveFooter(bannerConfig)

    this.logger.info(`UMD Banner配置: ${JSON.stringify(bannerConfig)}`)
    this.logger.info(`解析后的Banner: ${banner}`)

    // 默认 UMD 全局变量映射（用于常见外部库）
    const defaultGlobals: Record<string, string> = {
      react: 'React',
      'react-dom': 'ReactDOM',
      'react/jsx-runtime': 'jsxRuntime',
      'react/jsx-dev-runtime': 'jsxDevRuntime',
      vue: 'Vue',
      'vue-demi': 'VueDemi',
      '@angular/core': 'ngCore',
      '@angular/common': 'ngCommon',
      preact: 'Preact',
'preact/hooks': 'preactHooks',
      'preact/jsx-runtime': 'jsxRuntime',
      'preact/jsx-dev-runtime': 'jsxDevRuntime',
      'solid-js': 'Solid',
'solid-js/web': 'SolidWeb',
      'solid-js/jsx-runtime': 'jsxRuntime',
      svelte: 'Svelte',
      lit: 'Lit',
      'lit-html': 'litHtml'
    }

    const mergedGlobals = {
      ...defaultGlobals,
      ...(outputConfig.globals || {}),
      ...(umdSection.globals || {})
    }

    // 根据入口自动推断默认 UMD 文件名
    const defaultUmdFile = 'index.js'


    return {
      input: umdEntry,
      external: config.external,
      plugins: [...basePlugins, ...userPlugins],
      output: {
        format: 'umd',
        name: umdName,
        file: `${umdSection.dir || 'dist'}/${umdSection.fileName || defaultUmdFile}`,
        sourcemap: (umdSection.sourcemap ?? outputConfig.sourcemap),
        globals: mergedGlobals,
        exports: 'auto',
        banner,
        footer,
        intro: await this.resolveIntro(bannerConfig),
        outro: await this.resolveOutro(bannerConfig)
      },
      treeshake: config.treeshake
    }
  }

  /**
   * 生成 UMD 全局变量名
   */
  private generateUMDName(packageName: string): string {
    if (!packageName) return 'MyLibrary'

    // 移除作用域前缀 (@scope/package -> package)
    const name = packageName.replace(/^@[^/]+\//, '')

    // 转换为 PascalCase
    return name
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('')
  }

  /**
   * 解析 Banner
   */
  private async resolveBanner(bannerConfig: any): Promise<string | undefined> {
    const banners: string[] = []

    // 自定义 Banner
    if (typeof bannerConfig.banner === 'function') {
      const customBanner = await bannerConfig.banner()
      if (customBanner) banners.push(customBanner)
    } else if (typeof bannerConfig.banner === 'string' && bannerConfig.banner) {
      banners.push(bannerConfig.banner)
    }

    // 自动生成版权信息
    if (bannerConfig.copyright) {
      const copyright = this.generateCopyright(bannerConfig.copyright)
      if (copyright) banners.push(copyright)
    }

    // 自动生成构建信息
    if (bannerConfig.buildInfo) {
      const buildInfo = this.generateBuildInfo(bannerConfig.buildInfo)
      if (buildInfo) banners.push(buildInfo)
    }

    return banners.length > 0 ? banners.join('\n') : undefined
  }

  /**
   * 解析 Footer
   */
  private async resolveFooter(bannerConfig: any): Promise<string | undefined> {
    if (typeof bannerConfig.footer === 'function') {
      return await bannerConfig.footer()
    }
    if (typeof bannerConfig.footer === 'string') {
      return bannerConfig.footer
    }
    return undefined
  }

  /**
   * 解析 Intro
   */
  private async resolveIntro(bannerConfig: any): Promise<string | undefined> {
    if (typeof bannerConfig.intro === 'function') {
      return await bannerConfig.intro()
    }
    if (typeof bannerConfig.intro === 'string') {
      return bannerConfig.intro
    }
    return undefined
  }

  /**
   * 解析 Outro
   */
  private async resolveOutro(bannerConfig: any): Promise<string | undefined> {
    if (typeof bannerConfig.outro === 'function') {
      return await bannerConfig.outro()
    }
    if (typeof bannerConfig.outro === 'string') {
      return bannerConfig.outro
    }
    return undefined
  }

  /**
   * 生成版权信息
   */
  private generateCopyright(copyrightConfig: any): string {
    const config = typeof copyrightConfig === 'object' ? copyrightConfig : {}
    const year = config.year || new Date().getFullYear()
    const owner = config.owner || 'Unknown'
    const license = config.license || 'MIT'

    if (config.template) {
      return config.template
        .replace(/\{year\}/g, year)
        .replace(/\{owner\}/g, owner)
        .replace(/\{license\}/g, license)
    }

    return `/*!\n * Copyright (c) ${year} ${owner}\n * Licensed under ${license}\n */`
  }

  /**
   * 生成构建信息
   */
  private generateBuildInfo(buildInfoConfig: any): string {
    const config = typeof buildInfoConfig === 'object' ? buildInfoConfig : {}
    const parts: string[] = []

    if (config.version !== false) {
      try {
        const fs = require('fs')
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
        parts.push(`Version: ${packageJson.version}`)
      } catch {
        // 忽略错误
      }
    }

    if (config.buildTime !== false) {
      parts.push(`Built: ${new Date().toISOString()}`)
    }

    if (config.environment !== false) {
      parts.push(`Environment: ${process.env.NODE_ENV || 'development'}`)
    }

    if (config.git !== false) {
      try {
        const { execSync } = require('child_process')
        const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
        parts.push(`Commit: ${commit}`)
      } catch {
        // 忽略错误
      }
    }

    if (config.template) {
      return config.template
    }

    return parts.length > 0 ? `/*!\n * ${parts.join('\n * ')}\n */` : ''
  }

}
