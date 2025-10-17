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
import type { BuilderConfig } from '../../types/config'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import { Logger } from '../../utils/logger'
import { BuilderError } from '../../utils/error-handler'
import { ErrorCode } from '../../constants/errors'
import { normalizeInput } from '../../utils/glob'
import { BannerGenerator } from '../../utils/banner-generator'
import { RollupCache } from '../../utils/cache'

/**
 * Rollup 适配器类
 */
export class RollupAdapter implements IBundlerAdapter {
  readonly name = 'rollup' as const
  version: string
  available: boolean

  private logger: Logger
  private multiConfigs?: any[]

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()

    // 初始化为可用状态，实际检查在第一次使用时进行
    this.version = 'unknown'
    this.available = true
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
      // 检查是否为清理模式
      const isCleanMode = (config as any)?.clean === true
      this.logger.info(`清理模式检查: config.clean=${(config as any)?.clean}, isCleanMode=${isCleanMode}`)

      // 受控启用构建缓存（清理模式下禁用缓存）
      const cacheEnabled = !isCleanMode && this.isCacheEnabled(config)
      const cacheOptions = this.resolveCacheOptions(config)
      const cache = new RollupCache({
        cacheDir: cacheOptions.cacheDir,
        ttl: cacheOptions.ttl,
        maxSize: cacheOptions.maxSize,
      })

      // 如果是清理模式，清除相关缓存
      if (isCleanMode) {
        this.logger.info('清理模式：跳过缓存并清除现有缓存')
        const cacheKey = { adapter: this.name, config }
        const crypto = await import('crypto')
        const configHash = crypto.createHash('md5').update(JSON.stringify(cacheKey)).digest('hex')
        await cache.delete(`build:${configHash}`)
      }

      const cacheKey = { adapter: this.name, config }
      const lookupStart = Date.now()
      // 清理模式下强制跳过缓存查找
      const cachedResult = (cacheEnabled && !isCleanMode) ? await cache.getBuildResult(cacheKey) : null
      const lookupMs = Date.now() - lookupStart

      // 检查缓存结果和输出产物的存在性
      if (cacheEnabled && cachedResult) {
        // 验证输出产物是否存在
        const outputExists = await this.validateOutputArtifacts(config)

        if (outputExists) {
          // 附加缓存信息并返回
          cachedResult.cache = {
            enabled: true,
            hit: true,
            lookupMs,
            savedMs: typeof cachedResult.duration === 'number' ? cachedResult.duration : 0,
            dir: cache.getDirectory?.() || undefined,
            ttl: cache.getTTL?.() || undefined,
            maxSize: cache.getMaxSize?.() || undefined,
          }
          this.logger.info('使用缓存的构建结果 (cache hit, artifacts verified)')
          return cachedResult
        } else {
          // 输出产物不存在，尝试从缓存恢复文件
          this.logger.info('缓存命中但输出产物不存在，尝试从缓存恢复文件')

          const restored = await cache.restoreFilesFromCache(cachedResult)
          if (restored) {
            // 文件恢复成功，验证产物是否存在
            const outputExistsAfterRestore = await this.validateOutputArtifacts(config)
            if (outputExistsAfterRestore) {
              // 附加缓存信息并返回
              cachedResult.cache = {
                enabled: true,
                hit: true,
                lookupMs,
                savedMs: typeof cachedResult.duration === 'number' ? cachedResult.duration : 0,
                dir: cache.getDirectory?.() || undefined,
                ttl: cache.getTTL?.() || undefined,
                maxSize: cache.getMaxSize?.() || undefined,
              }
              this.logger.info('从缓存恢复文件成功 (cache hit, files restored)')
              return cachedResult
            }
          }

          // 文件恢复失败，使缓存失效并重新构建
          this.logger.info('从缓存恢复文件失败，使缓存失效并重新构建')
          const crypto = await import('crypto')
          const configHash = crypto.createHash('md5').update(JSON.stringify(cacheKey)).digest('hex')
          await cache.delete(`build:${configHash}`)
        }
      } else if (cacheEnabled) {
        this.logger.debug('未命中构建缓存 (cache miss)')
      } else if (isCleanMode) {
        this.logger.debug('清理模式：已禁用缓存')
      }

      const rollup = await this.loadRollup()
      const rollupConfig = await this.transformConfig(config)

      this.logger.info('开始 Rollup 构建...')

      // 显示构建配置信息
      if (this.multiConfigs && this.multiConfigs.length > 1) {
        const formats = this.multiConfigs.map(c => String(c.output?.format || 'es').toUpperCase()).join(', ')
        this.logger.info(`构建格式: ${formats}`)
      }

      const startTime = Date.now()

      // 收集带格式信息的输出
      const results: Array<{ chunk: any; format: string }> = []

      // 如果有多个配置，使用并行构建提升速度
      if (this.multiConfigs && this.multiConfigs.length > 1) {
        this.logger.info(`开始并行构建 ${this.multiConfigs.length} 个配置...`)

        // 并行构建所有配置
        const buildPromises = this.multiConfigs.map(async (singleConfig, index) => {
          const formatName = String(singleConfig.output?.format || 'es').toUpperCase()
          this.logger.info(`[${index + 1}/${this.multiConfigs!.length}] 构建 ${formatName} 格式...`)

          const bundle = await rollup.rollup(singleConfig)

          // 生成并记录输出（保留每个配置的 format）
          const { output } = await bundle.generate(singleConfig.output)
          const formatResults = output.map((item: any) => ({
            chunk: item,
            format: String(singleConfig.output?.format || 'es')
          }))

          // 写入文件
          await bundle.write(singleConfig.output)
          await bundle.close()

          this.logger.success(`[${index + 1}/${this.multiConfigs!.length}] ${formatName} 格式构建完成`)

          return formatResults
        })

        // 等待所有构建完成
        const allResults = await Promise.all(buildPromises)
        results.push(...allResults.flat())
      } else {
        // 单配置构建
        const bundle = await rollup.rollup(rollupConfig)

        const outputs = Array.isArray(rollupConfig.output)
          ? rollupConfig.output
          : [rollupConfig.output]

        for (const outputConfig of outputs) {
          const { output } = await bundle.generate(outputConfig)
          for (const item of output) {
            results.push({ chunk: item, format: String(outputConfig?.format || 'es') })
          }
        }

        // 写入文件
        for (const outputConfig of outputs) {
          await bundle.write(outputConfig)
        }

        await bundle.close()
      }

      const duration = Date.now() - startTime

      // 计算 gzip 大小并产出规范化的 outputs
      const { gzipSize } = await import('gzip-size')
      const outputs = [] as any[]
      let totalRaw = 0
      let largest = { file: '', size: 0 }
      for (const r of results) {
        const chunk = r.chunk
        const codeOrSource = chunk.type === 'chunk' ? chunk.code : chunk.source
        const rawSize = typeof codeOrSource === 'string' ? codeOrSource.length : (codeOrSource?.byteLength || 0)
        const gz = typeof codeOrSource === 'string' ? await gzipSize(codeOrSource) : 0
        totalRaw += rawSize
        if (rawSize > largest.size) {
          largest = { file: chunk.fileName, size: rawSize }
        }
        outputs.push({
          fileName: chunk.fileName,
          size: rawSize,
          source: codeOrSource,
          type: chunk.type,
          format: r.format,
          gzipSize: gz
        })
      }

      // 构建结果
      const buildResult: BuildResult = {
        success: true,
        outputs,
        duration,
        stats: {
          buildTime: duration,
          fileCount: outputs.length,
          totalSize: {
            raw: totalRaw,
            gzip: outputs.reduce((s, o) => s + (o.gzipSize || 0), 0),
            brotli: 0,
            byType: {},
            byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 },
            largest,
            fileCount: outputs.length
          },
          byFormat: {
            esm: { fileCount: outputs.filter(o => o.format === 'es' || o.format === 'esm').length, size: { raw: outputs.filter(o => o.format === 'es' || o.format === 'esm').reduce((s, o) => s + o.size, 0), gzip: outputs.filter(o => o.format === 'es' || o.format === 'esm').reduce((s, o) => s + (o.gzipSize || 0), 0), brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
            cjs: { fileCount: outputs.filter(o => o.format === 'cjs').length, size: { raw: outputs.filter(o => o.format === 'cjs').reduce((s, o) => s + o.size, 0), gzip: outputs.filter(o => o.format === 'cjs').reduce((s, o) => s + (o.gzipSize || 0), 0), brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
            umd: { fileCount: outputs.filter(o => o.format === 'umd').length, size: { raw: outputs.filter(o => o.format === 'umd').reduce((s, o) => s + o.size, 0), gzip: outputs.filter(o => o.format === 'umd').reduce((s, o) => s + (o.gzipSize || 0), 0), brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
            iife: { fileCount: outputs.filter(o => o.format === 'iife').length, size: { raw: outputs.filter(o => o.format === 'iife').reduce((s, o) => s + o.size, 0), gzip: outputs.filter(o => o.format === 'iife').reduce((s, o) => s + (o.gzipSize || 0), 0), brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } },
            css: { fileCount: outputs.filter(o => o.format === 'css').length, size: { raw: outputs.filter(o => o.format === 'css').reduce((s, o) => s + o.size, 0), gzip: outputs.filter(o => o.format === 'css').reduce((s, o) => s + (o.gzipSize || 0), 0), brotli: 0, byType: {}, byFormat: { esm: 0, cjs: 0, umd: 0, iife: 0, css: 0 }, largest: { file: '', size: 0 }, fileCount: 0 } }
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

      // 复制 DTS 文件到所有格式的输出目录
      await this.copyDtsFiles(config as any)

      // 缓存构建结果
      if (cacheEnabled) {
        await cache.cacheBuildResult(cacheKey, buildResult)
        buildResult.cache = {
          enabled: true,
          hit: false,
          lookupMs,
          savedMs: 0,
          dir: cache.getDirectory?.() || undefined,
          ttl: cache.getTTL?.() || undefined,
          maxSize: cache.getMaxSize?.() || undefined,
        }
        this.logger.debug('构建结果已缓存')
      }

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

    // 应用 exclude 过滤到输入配置
    const filteredInput = await normalizeInput(config.input, process.cwd(), config.exclude)

    const rollupConfig: any = {
      input: filteredInput,
      external: config.external,
      onwarn: this.getOnWarn(config)
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

        // 处理 ESM 配置
        if (outputConfig.esm && outputConfig.esm !== false) {
          const isSimpleConfig = outputConfig.esm === true
          const esmConfig = isSimpleConfig ? {} : outputConfig.esm
          const esmDir = esmConfig.dir || 'es'
          const esmPlugins = await this.transformPluginsForFormat(config.plugins || [], esmDir, { emitDts: true })
          // 使用 output 中的 input 配置，如果没有则使用默认或顶层 input
          const esmInput = esmConfig.input
            ? await normalizeInput(esmConfig.input, process.cwd(), config.exclude)
            : filteredInput
          // 统一注入 Banner/Footer/Intro/Outro
          const bannerCfgEsm = (config as any).banner
          const _bannerEsm = await this.resolveBanner(bannerCfgEsm, config)
          const _footerEsm = await this.resolveFooter(bannerCfgEsm)
          const _introEsm = await this.resolveIntro(bannerCfgEsm)
          const _outroEsm = await this.resolveOutro(bannerCfgEsm)
          configs.push({
            input: esmInput,
            external: config.external,
            plugins: [...basePlugins, ...esmPlugins],
            output: {
              dir: esmDir,
              format: 'es',
              sourcemap: esmConfig.sourcemap ?? outputConfig.sourcemap,
              entryFileNames: '[name].js',
              chunkFileNames: '[name].js',
              assetFileNames: '[name].[ext]',
              exports: esmConfig.exports ?? 'auto',
              preserveModules: esmConfig.preserveStructure ?? true,
              preserveModulesRoot: 'src',
              globals: outputConfig.globals,
              name: outputConfig.name,
              banner: _bannerEsm,
              footer: _footerEsm,
              intro: _introEsm,
              outro: _outroEsm
            },
            treeshake: config.treeshake,
            onwarn: this.getOnWarn(config)
          })
        }

        // 处理 CJS 配置
        if (outputConfig.cjs && outputConfig.cjs !== false) {
          const isSimpleConfig = outputConfig.cjs === true
          const cjsConfig = isSimpleConfig ? {} : outputConfig.cjs
          const cjsDir = cjsConfig.dir || 'lib'
          // CJS 格式也生成 DTS 文件
          const cjsPlugins = await this.transformPluginsForFormat(config.plugins || [], cjsDir, { emitDts: true })
          // 使用 output 中的 input 配置，如果没有则使用默认或顶层 input
          const cjsInput = cjsConfig.input
            ? await normalizeInput(cjsConfig.input, process.cwd(), config.exclude)
            : filteredInput
          // 统一注入 Banner/Footer/Intro/Outro
          const bannerCfgCjs = (config as any).banner
          const _bannerCjs = await this.resolveBanner(bannerCfgCjs, config)
          const _footerCjs = await this.resolveFooter(bannerCfgCjs)
          const _introCjs = await this.resolveIntro(bannerCfgCjs)
          const _outroCjs = await this.resolveOutro(bannerCfgCjs)
          configs.push({
            input: cjsInput,
            external: config.external,
            plugins: [...basePlugins, ...cjsPlugins],
            output: {
              dir: cjsDir,
              format: 'cjs',
              sourcemap: cjsConfig.sourcemap ?? outputConfig.sourcemap,
              entryFileNames: '[name].cjs',
              chunkFileNames: '[name].cjs',
              assetFileNames: '[name].[ext]',
              exports: cjsConfig.exports ?? 'named',
              preserveModules: cjsConfig.preserveStructure ?? true,
              preserveModulesRoot: 'src',
              globals: outputConfig.globals,
              name: outputConfig.name,
              banner: _bannerCjs,
              footer: _footerCjs,
              intro: _introCjs,
              outro: _outroCjs
            },
            treeshake: config.treeshake,
            onwarn: this.getOnWarn(config)
          })
        }

        if (outputConfig.umd || (config as any).umd) {
          const umdCfg = await this.createUMDConfig(config, filteredInput)
          // umdCfg 现在可能是数组（包含常规版本和压缩版本）
          if (Array.isArray(umdCfg)) {
            configs.push(...umdCfg)
          } else {
            configs.push(umdCfg)
          }
        }

        // 如果未声明 umd，不自动添加
        // UMD 应该通过配置显式启用，或者在 output.format 中包含 'umd'

        if (configs.length > 0) {
          this.multiConfigs = configs

          // 为了兼容测试，返回包含output数组的配置
          if (configs.length > 1) {
            return {
              ...rollupConfig,
              output: configs.map(config => config.output).filter(Boolean)
            }
          }
          return configs[0]
        }
        // 如果没有任何子配置，则回退到单一输出逻辑
      }

      // 处理数组或者单一 format 字段
      // 处理多格式输出
      if (Array.isArray(outputConfig.format)) {
        // 原有多格式逻辑（略微精简），同上
        const isMultiEntry = this.isMultiEntryBuild(filteredInput)
        let formats = outputConfig.format
        let umdConfig: any = null

        if (isMultiEntry) {
          const originalFormats = [...formats]
          const hasUMD = formats.includes('umd')
          const forceUMD = (config as any).umd?.forceMultiEntry || false
          const umdEnabled = (config as any).umd?.enabled
          this.logger.info(`多入口项目UMD检查: hasUMD=${hasUMD}, forceUMD=${forceUMD}, umdEnabled=${umdEnabled}`)

          if (hasUMD && forceUMD) {
            umdConfig = await this.createUMDConfig(config, filteredInput)
            this.logger.info('多入口项目强制启用 UMD 构建')
          } else if (hasUMD) {
            formats = formats.filter((format: any) => format !== 'umd' && format !== 'iife')
            if ((config as any).umd?.enabled !== false) {
              umdConfig = await this.createUMDConfig(config, filteredInput)
              this.logger.info('为多入口项目创建独立的 UMD 构建')
            }
          } else {
            if ((config as any).umd?.enabled) {
              umdConfig = await this.createUMDConfig(config, filteredInput)
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
          if (formats.includes('umd') || (config as any).umd?.enabled || hasUmdSection) {
            umdConfig = await this.createUMDConfig(config, filteredInput)
          }
          formats = formats.filter((f: any) => f !== 'umd' && f !== 'iife')
        }

        const configs: any[] = []
        for (const format of formats) {
          const mapped = this.mapFormat(format)
          const isESM = format === 'esm'
          const isCJS = format === 'cjs'
          const dir = isESM ? 'es' : isCJS ? 'lib' : 'dist'
          const entryFileNames = isESM ? '[name].js' : isCJS ? '[name].cjs' : '[name].js'
          const chunkFileNames = entryFileNames
          const formatPlugins = await this.transformPluginsForFormat(config.plugins || [], dir, { emitDts: true })
          try {
            const names = [...(formatPlugins || [])].map((p: any) => p?.name || '(anon)')
            this.logger.info(`[${format}] 有效插件: ${names.join(', ')}`)
          } catch { }
          const bannerCfg = (config as any).banner
          const _banner = await this.resolveBanner(bannerCfg, config)
          const _footer = await this.resolveFooter(bannerCfg)
          const _intro = await this.resolveIntro(bannerCfg)
          const _outro = await this.resolveOutro(bannerCfg)
          configs.push({
            input: filteredInput,
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
              assetFileNames: '[name].[ext]',
              exports: isESM ? (outputConfig as any).exports ?? 'auto' : 'named',
              preserveModules: isESM || isCJS,
              preserveModulesRoot: (isESM || isCJS) ? 'src' : undefined,
              banner: _banner,
              footer: _footer,
              intro: _intro,
              outro: _outro
            },
            treeshake: config.treeshake,
            onwarn: this.getOnWarn(config)
          })
        }
        if (umdConfig) {
          // umdConfig 现在可能是数组（包含常规版本和压缩版本）
          if (Array.isArray(umdConfig)) {
            configs.push(...umdConfig)
          } else {
            configs.push(umdConfig)
          }
        }
        this.multiConfigs = configs

        // 为了兼容测试，返回包含output数组的配置
        if (configs.length > 1) {
          return {
            ...rollupConfig,
            output: configs.map(config => config.output).filter(Boolean)
          }
        }
        return configs[0]
      } else {
        const format = (outputConfig as any).format
        const mapped = this.mapFormat(format)
        const isESM = format === 'esm'
        const isCJS = format === 'cjs'
        // 使用配置中的输出目录，如果没有则使用默认值
        const defaultDir = isESM ? 'es' : isCJS ? 'lib' : 'dist'
        const dir = outputConfig.dir || defaultDir
        const entryFileNames = isESM ? '[name].js' : isCJS ? '[name].cjs' : '[name].js'
        const chunkFileNames = entryFileNames
        const userPlugins = await this.transformPluginsForFormat(config.plugins || [], dir, { emitDts: true })
        try {
          const names = [...(userPlugins || [])].map((p: any) => p?.name || '(anon)')
          this.logger.info(`[${format}] 有效插件: ${names.join(', ')}`)
        } catch { }
        const bannerCfg2 = (config as any).banner
        const _banner2 = await this.resolveBanner(bannerCfg2, config)
        const _footer2 = await this.resolveFooter(bannerCfg2)
        const _intro2 = await this.resolveIntro(bannerCfg2)
        const _outro2 = await this.resolveOutro(bannerCfg2)
        rollupConfig.plugins = [...basePlugins, ...userPlugins]
        rollupConfig.output = {
          dir,
          format: mapped,
          name: outputConfig.name,
          sourcemap: outputConfig.sourcemap,
          globals: outputConfig.globals,
          entryFileNames,
          chunkFileNames,
          assetFileNames: '[name].[ext]',
          exports: isESM ? (outputConfig as any).exports ?? 'auto' : 'named',
          preserveModules: isESM || isCJS,
          preserveModulesRoot: (isESM || isCJS) ? 'src' : undefined,
          banner: _banner2,
          footer: _footer2,
          intro: _intro2,
          outro: _outro2
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

        // 当明确不需要 d.ts（例如 UMD/IIFE）时，跳过纯 dts 插件，但保留 typescript 插件（用于解析 .ts 文件）
        if (!emitDts && nameLc.includes('dts') && !nameLc.includes('typescript')) {
          continue
        }

        // 如果插件有 plugin 函数，调用它来获取实际插件
        if (plugin.plugin && typeof plugin.plugin === 'function') {
          // 如果是TypeScript插件，需要特殊处理（为 ESM/CJS 定向声明输出目录）
          if (nameLc === 'typescript') {
            // 重新创建TypeScript插件，设置正确的declarationDir
            const typescript = await import('@rollup/plugin-typescript')

            // 直接从插件包装对象读取原始选项（在策略中附加）
            const originalOptions = (plugin as any).options || {}

            // 清理不被 @rollup/plugin-typescript 支持的字段
            const { tsconfigOverride: _ignored, compilerOptions: origCO = {}, tsconfig: _tsconfig, ...rest } = originalOptions as any

            // 从 origCO 中排除 outDir,避免与 Rollup 的输出配置冲突
            const { outDir: _outDir, ...cleanedCO } = origCO as any

            // 不传递 tsconfig 选项,避免从文件中读取 outDir
            // 所有配置都通过 compilerOptions 显式传递

            const newPlugin = typescript.default({
              ...rest,
              compilerOptions: {
                ...cleanedCO,
                declaration: emitDts,
                // 不使用 emitDeclarationOnly,因为 Rollup 需要 JS 文件
                // 关闭 d.ts 的 sourceMap，避免生成到上级目录等不合法路径
                declarationMap: false,
                declarationDir: emitDts ? outputDir : undefined,
                // 显式设置 outDir 为 undefined,覆盖 tsconfig.json 中的值
                // 让 Rollup 自己处理 JS 文件的输出
                outDir: undefined,
                // 避免 @rollup/plugin-typescript 在缺少 tsconfig 时的根目录推断失败
                rootDir: cleanedCO?.rootDir ?? 'src',
                // 性能优化: 禁用不必要的检查
                skipLibCheck: true,
                // 性能优化: 只编译必要的文件
                isolatedModules: !emitDts
              }
            })

            // 如果需要生成 DTS，包装插件以添加进度日志
            if (emitDts) {
              const wrappedPlugin = this.wrapPluginWithProgress(newPlugin, 'TypeScript 类型定义')
              transformedPlugins.push(wrappedPlugin)
            } else {
              transformedPlugins.push(newPlugin)
            }
          } else {
            // 其他插件正常处理
            const actualPlugin = await plugin.plugin()
            transformedPlugins.push(actualPlugin)
          }
        }
        // 如果插件有 rollup 特定配置，使用它
        else if (plugin.rollup) {
          // UMD/IIFE 禁止纯 dts 插件，但保留 typescript 插件
          const rnameLc = String(plugin.rollup.name || '').toLowerCase()
          if (!emitDts && rnameLc.includes('dts') && !rnameLc.includes('typescript')) {
            continue
          }
          transformedPlugins.push({ ...plugin, ...plugin.rollup })
        }
        // 直接使用已实例化的插件
        else {
          // UMD/IIFE 禁止纯 dts 插件，但保留 typescript 插件
          const inameLc = String((plugin as any)?.name || '').toLowerCase()
          if (!emitDts && inameLc.includes('dts') && !inameLc.includes('typescript')) {
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
      },
      bundleSize: 0 // 添加bundleSize属性
    }
  }



  /**
   * 判断是否启用构建缓存
   */
  private isCacheEnabled(config: any): boolean {
    const c = (config as any)?.cache
    if (c === false) return false
    if (typeof c === 'object' && c) {
      if ('enabled' in c) return (c as any).enabled !== false
    }
    return true
  }
  /**
   * 验证输出产物是否存在
   * 检查关键输出文件是否存在，如果不存在则缓存应该失效
   */
  private async validateOutputArtifacts(config: any): Promise<boolean> {
    try {
      const fs = await import('fs-extra')

      // 获取输出配置 - 使用 any 类型避免类型问题
      const outputConfig = config.output || {}
      const outputDir = config.outDir || 'dist'

      // 检查主要输出文件
      const mainOutputFiles: string[] = []

      // ESM 输出
      if (outputConfig.esm) {
        const esmDir = typeof outputConfig.esm === 'object' && outputConfig.esm.dir
          ? outputConfig.esm.dir
          : (outputConfig.esm === true ? 'es' : outputDir)
        mainOutputFiles.push(path.join(esmDir, 'index.js'))
      }

      // CJS 输出
      if (outputConfig.cjs) {
        const cjsDir = typeof outputConfig.cjs === 'object' && outputConfig.cjs.dir
          ? outputConfig.cjs.dir
          : (outputConfig.cjs === true ? 'lib' : outputDir)
        mainOutputFiles.push(path.join(cjsDir, 'index.cjs'))
      }

      // UMD 输出
      if (outputConfig.umd) {
        const umdDir = typeof outputConfig.umd === 'object' && outputConfig.umd.dir
          ? outputConfig.umd.dir
          : outputDir
        mainOutputFiles.push(path.join(umdDir, 'index.umd.js'))
      }

      // 检查通用格式配置
      if (outputConfig.format) {
        const formats = Array.isArray(outputConfig.format) ? outputConfig.format : [outputConfig.format]
        for (const format of formats) {
          if (format === 'esm' && !outputConfig.esm) {
            mainOutputFiles.push(path.join(outputDir, 'index.js'))
          } else if (format === 'cjs' && !outputConfig.cjs) {
            mainOutputFiles.push(path.join(outputDir, 'index.cjs'))
          } else if (format === 'umd' && !outputConfig.umd) {
            mainOutputFiles.push(path.join(outputDir, 'index.js'))
          }
        }
      }

      // 如果没有配置输出格式，检查默认输出
      if (mainOutputFiles.length === 0) {
        mainOutputFiles.push(path.join(outputDir, 'index.js'))
      }

      // 检查至少一个主要输出文件是否存在
      for (const outputFile of mainOutputFiles) {
        const fullPath = path.isAbsolute(outputFile)
          ? outputFile
          : path.resolve(process.cwd(), outputFile)

        if (await fs.pathExists(fullPath)) {
          this.logger.debug(`输出产物验证通过: ${fullPath}`)
          return true
        }
      }

      this.logger.debug(`输出产物验证失败，未找到任何主要输出文件: ${mainOutputFiles.join(', ')}`)
      return false
    } catch (error) {
      this.logger.warn(`验证输出产物时出错: ${(error as Error).message}`)
      // 出错时保守处理，认为产物不存在
      return false
    }
  }

  /**
   * 解析 config.cache -> RollupCache 选项
   */
  private resolveCacheOptions(config: any): { cacheDir?: string; ttl?: number; maxSize?: number } {
    const c = (config as any)?.cache
    const opts: { cacheDir?: string; ttl?: number; maxSize?: number } = {}
    if (typeof c === 'object' && c) {
      if (typeof c.dir === 'string' && c.dir.trim()) {
        opts.cacheDir = path.isAbsolute(c.dir) ? c.dir : path.resolve(process.cwd(), c.dir)
      }
      if (typeof c.maxAge === 'number' && isFinite(c.maxAge) && c.maxAge > 0) {
        opts.ttl = Math.floor(c.maxAge)
      }
      if (typeof c.maxSize === 'number' && isFinite(c.maxSize) && c.maxSize > 0) {
        opts.maxSize = Math.floor(c.maxSize)
      }
    }
    return opts
  }


  /**
   * 包装插件以添加进度日志
   * 用于在 DTS 生成等耗时操作时提供进度反馈
   */
  private wrapPluginWithProgress(plugin: any, taskName: string): any {
    const logger = this.logger
    let fileCount = 0
    let startTime = 0

    return {
      ...plugin,
      name: plugin.name,

      // 在构建开始时记录
      buildStart(...args: any[]) {
        startTime = Date.now()
        fileCount = 0
        logger.info(`开始生成 ${taskName}...`)

        if (plugin.buildStart) {
          return plugin.buildStart.apply(this, args)
        }
      },

      // 在处理每个文件时记录
      transform(...args: any[]) {
        fileCount++
        if (fileCount % 10 === 0) {
          logger.debug(`${taskName}: 已处理 ${fileCount} 个文件...`)
        }

        if (plugin.transform) {
          return plugin.transform.apply(this, args)
        }
      },

      // 在构建结束时记录
      buildEnd(...args: any[]) {
        const duration = Date.now() - startTime
        logger.success(`${taskName} 生成完成 (${fileCount} 个文件, ${duration}ms)`)

        if (plugin.buildEnd) {
          return plugin.buildEnd.apply(this, args)
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

      const jsonPlugin = json({
        // 优化 JSON 插件配置
        compact: false,  // 保持 JSON 格式化，便于调试
        namedExports: true,  // 支持命名导出
        preferConst: true,  // 使用 const 声明
        // 包含所有 JSON 文件
        include: ['**/*.json'],
        exclude: ['node_modules/**']
      })

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
   * 创建 UMD 配置（返回常规版本和压缩版本的数组）
   */
  private async createUMDConfig(config: UnifiedConfig, filteredInput?: string | string[] | Record<string, string>): Promise<any[]> {
    // 检查顶层 umd 配置和 output.umd 配置的 enabled 字段
    const topLevelUmd = (config as any).umd
    const outputUmd = (config as any).output?.umd

    // 如果顶层 umd.enabled === false，禁用 UMD
    if (topLevelUmd && typeof topLevelUmd === 'object' && topLevelUmd.enabled === false) {
      return [] // 通过顶层 umd.enabled: false 禁用 UMD，返回空数组
    }

    // 如果 output.umd.enabled === false，禁用 UMD
    if (outputUmd && typeof outputUmd === 'object' && outputUmd.enabled === false) {
      return [] // 通过 output.umd.enabled: false 禁用 UMD，返回空数组
    }

    // 处理 boolean 配置
    let umdSection = topLevelUmd || outputUmd || {}
    if (umdSection === true) {
      umdSection = {} // 使用默认配置
    } else if (umdSection === false) {
      return [] // 禁用 UMD，返回空数组
    } else if (typeof umdSection === 'object' && umdSection.enabled === false) {
      return [] // 通过 enabled: false 禁用 UMD，返回空数组
    }
    const outputConfig = config.output || {}

    // 确定 UMD 入口文件
    const fs = await import('fs')
    const path = await import('path')
    const projectRoot = (config as any).root || (config as any).cwd || process.cwd()

    // 优先使用 output.umd.input，然后是 umd.entry，最后是顶层 input
    let umdEntry = umdSection.input || umdSection.entry || (typeof filteredInput === 'string' ? filteredInput : undefined)

    // 如果有通配符，需要解析
    if (umdEntry && (umdEntry.includes('*') || Array.isArray(umdEntry))) {
      const resolved = await normalizeInput(umdEntry, projectRoot, config.exclude)
      // UMD 必须是单入口
      if (Array.isArray(resolved)) {
        throw new Error('UMD 格式不支持多入口，请在配置中指定单个入口文件。例如: umd: { entry: "src/index.ts" }')
      }
      if (typeof resolved === 'object' && !Array.isArray(resolved)) {
        throw new Error('UMD 格式不支持多入口配置。请指定单个入口文件，例如: umd: { entry: "src/index.ts" }')
      }
      umdEntry = resolved as string
    }

    // 如果未显式指定，优先使用 UMD 专用入口，然后回退到通用入口
    if (!umdEntry) {
      const candidates = [
        'src/index-lib.ts',
        'src/index-lib.js',
        'src/index-umd.ts',
        'src/index-umd.js',
        'src/index.ts',
        'src/index.js',
        'src/main.ts',
        'src/main.js',
        'index.ts',
        'index.js'
      ]

      for (const entry of candidates) {
        if (fs.existsSync(path.resolve(projectRoot, entry))) {
          umdEntry = entry
          this.logger.info(`UMD 入口文件自动检测: ${entry}`)
          break
        }
      }

      if (!umdEntry) {
        // 兜底：使用 src/index.ts，但如果不存在会在后续报错
        umdEntry = 'src/index.ts'
        this.logger.warn(`未找到有效的 UMD 入口文件，使用默认值: ${umdEntry}`)
      }
    }

    // 验证入口文件是否存在
    if (!fs.existsSync(path.resolve(projectRoot, umdEntry))) {
      throw new Error(`UMD 入口文件不存在: ${umdEntry}\n\n请检查：\n1. 确保文件存在于指定路径\n2. 或在配置中指定正确的入口文件: umd: { entry: "your-entry.ts" }\n3. 或禁用 UMD 构建: umd: { enabled: false }`)
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
    } catch { }

    // 应用 Banner 和 Footer 配置
    const bannerConfig = (config as any).banner
    const banner = await this.resolveBanner(bannerConfig, config)
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


    // 创建两个 UMD 配置：常规版本和压缩版本
    const baseConfig = {
      input: umdEntry,
      external: config.external,
      treeshake: config.treeshake,
      onwarn: this.getOnWarn(config)
    }

    const outputDir = umdSection.dir || 'dist'
    const fileName = umdSection.fileName || defaultUmdFile
    const baseFileName = fileName.replace(/\.js$/, '')

    // 常规版本配置
    const regularConfig = {
      ...baseConfig,
      plugins: [...basePlugins, ...userPlugins],
      output: {
        format: 'umd',
        name: umdName,
        file: `${outputDir}/${fileName}`,
        inlineDynamicImports: true,
        sourcemap: (umdSection.sourcemap ?? outputConfig.sourcemap),
        globals: mergedGlobals,
        exports: 'named',
        assetFileNames: '[name].[ext]',
        banner,
        footer,
        intro: await this.resolveIntro(bannerConfig),
        outro: await this.resolveOutro(bannerConfig)
      }
    }

    // 压缩版本配置
    const terserPlugin = await this.getTerserPlugin()
    const minifiedPlugins = terserPlugin ? [...basePlugins, ...userPlugins, terserPlugin] : [...basePlugins, ...userPlugins]

    const minifiedConfig = {
      ...baseConfig,
      plugins: minifiedPlugins,
      output: {
        format: 'umd',
        name: umdName,
        file: `${outputDir}/${baseFileName}.min.js`,
        inlineDynamicImports: true,
        sourcemap: (umdSection.sourcemap ?? outputConfig.sourcemap),
        globals: mergedGlobals,
        exports: 'named',
        assetFileNames: '[name].[ext]',
        banner,
        footer,
        intro: await this.resolveIntro(bannerConfig),
        outro: await this.resolveOutro(bannerConfig)
      }
    }

    // 返回数组配置，Rollup 会分别构建两个版本
    return [regularConfig, minifiedConfig]
  }

  /**
   * 获取 Terser 压缩插件
   */
  private async getTerserPlugin(): Promise<any> {
    try {
      const { default: terser } = await import('@rollup/plugin-terser')
      return terser({
        compress: {
          drop_console: false,
          pure_funcs: ['console.log']
        },
        mangle: {
          reserved: ['exports', 'require', 'module', '__dirname', '__filename']
        },
        format: {
          comments: /^!/
        }
      })
    } catch (error) {
      this.logger.warn('Terser 插件不可用，跳过压缩:', error)
      return null
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
  private async resolveBanner(bannerConfig: any, config?: any): Promise<string | undefined> {
    // 显式禁用
    if (bannerConfig === false) return undefined

    const banners: string[] = []

    // 自定义 Banner
    if (bannerConfig && typeof bannerConfig.banner === 'function') {
      const customBanner = await bannerConfig.banner()
      if (customBanner) banners.push(customBanner)
    } else if (bannerConfig && typeof bannerConfig.banner === 'string' && bannerConfig.banner) {
      banners.push(bannerConfig.banner)
    }

    // 自动生成版权信息
    if (bannerConfig && (bannerConfig as any).copyright) {
      const copyright = this.generateCopyright((bannerConfig as any).copyright)
      if (copyright) banners.push(copyright)
    }

    // 自动生成构建信息
    if (bannerConfig && (bannerConfig as any).buildInfo) {
      const buildInfo = await this.generateBuildInfo((bannerConfig as any).buildInfo)
      if (buildInfo) banners.push(buildInfo)
    }

    if (banners.length > 0) return banners.join('\n')

    // 未提供任何 banner 配置时，自动生成默认 banner（从 package.json 推断）
    try {
      const projectInfo = await BannerGenerator.getProjectInfo()
      const auto = BannerGenerator.generate({
        bundler: this.name,
        bundlerVersion: this.version !== 'unknown' ? this.version : undefined,
        ...projectInfo,
        buildMode: (config as any)?.mode || process.env.NODE_ENV || 'production',
        minified: Boolean((config as any)?.minify)
      })
      return auto
    } catch {
      return undefined
    }
  }

  /**
   * 解析 Footer
   */
  private async resolveFooter(bannerConfig: any): Promise<string | undefined> {
    if (bannerConfig === false) return undefined
    if (bannerConfig && typeof bannerConfig.footer === 'function') {
      return await bannerConfig.footer()
    }
    if (bannerConfig && typeof bannerConfig.footer === 'string') {
      return bannerConfig.footer
    }
    // 默认 Footer（未提供时自动生成）
    try {
      const info = await BannerGenerator.getProjectInfo()
      if (info.projectName) {
        return `/*! End of ${info.projectName} | Powered by @ldesign/builder */`
      }
    } catch { }
    return '/*! Powered by @ldesign/builder */'
  }

  /**
   * 解析 Intro
   */
  private async resolveIntro(bannerConfig: any): Promise<string | undefined> {
    if (!bannerConfig) return undefined
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
    if (!bannerConfig) return undefined
    if (typeof bannerConfig.outro === 'function') {
      return await bannerConfig.outro()
    }
    if (typeof bannerConfig.outro === 'string') {
      return bannerConfig.outro
    }
    return undefined
  }

  /**
   * 统一的 onwarn 处理：过滤不必要的告警
   */
  private getOnWarn(config?: any) {
    // 如果配置了 logLevel 为 silent，完全抑制所有警告
    if (config?.logLevel === 'silent') {
      return () => {
        // 完全静默，不输出任何警告
      }
    }

    // 如果用户配置了自定义的 onwarn 处理器，优先使用用户的配置
    if (config?.build?.rollupOptions?.onwarn) {
      return config.build.rollupOptions.onwarn
    }

    const ignoredCodes = new Set([
      'NAMESPACE_CONFLICT',
      'MIXED_EXPORTS',
      'EMPTY_BUNDLE',           // 忽略空chunk警告
      'FILE_NAME_CONFLICT',     // 忽略文件名冲突警告
      'MISSING_GLOBAL_NAME',    // 忽略外部模块globals警告
      'UNRESOLVED_IMPORT',      // 忽略未解析的导入警告
    ])

    return (warning: any, defaultHandler: (w: any) => void) => {
      // 过滤常见非致命告警
      if (ignoredCodes.has(warning.code)) return

      // 过滤 CSS 文件覆盖警告
      if (warning.code === 'FILE_NAME_CONFLICT' && warning.message?.includes('.css.map')) {
        return
      }

      // 过滤 Vue 组件文件的类型声明警告
      if (warning.code === 'UNRESOLVED_IMPORT' && warning.source?.endsWith('.vue')) {
        return
      }

      // 过滤 Node.js 内置模块警告
      if (warning.code === 'UNRESOLVED_IMPORT' && warning.source?.startsWith('node:')) {
        return
      }

      // 过滤 typescript 插件的 TS5096 等诊断噪音
      if (warning.code === 'PLUGIN_WARNING' && warning.plugin === 'typescript') {
        const msg = String(warning.message || '')
        if (msg.includes('TS5096')) return
      }

      // 其他告警交给默认处理
      defaultHandler(warning)
    }
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
  private async generateBuildInfo(buildInfoConfig: any): Promise<string> {
    const config = typeof buildInfoConfig === 'object' ? buildInfoConfig : {}
    const parts: string[] = []

    if (config.version !== false) {
      try {
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

  /**
   * 复制 DTS 文件到所有格式的输出目录
   * 确保 ESM 和 CJS 格式都有完整的类型定义文件
   */
  private async copyDtsFiles(config: BuilderConfig): Promise<void> {
    const fs = await import('fs-extra')
    const path = await import('path')

    // 获取输出配置
    const outputConfig = config.output || {}
    const esmDir = (typeof outputConfig.esm === 'object' ? outputConfig.esm.dir : 'es') || 'es'
    const cjsDir = (typeof outputConfig.cjs === 'object' ? outputConfig.cjs.dir : 'lib') || 'lib'

    // 如果两个目录相同，不需要复制
    if (esmDir === cjsDir) {
      return
    }

    // 如果没有启用 CJS 输出，不需要复制
    if (!outputConfig.cjs) {
      return
    }

    // 确定源目录和目标目录
    // ESM 目录有 .d.ts 文件，需要复制到 CJS 目录并重命名为 .d.cts
    const sourceDir = path.resolve(process.cwd(), esmDir)
    const targetDir = path.resolve(process.cwd(), cjsDir)

    // 检查源目录是否存在
    if (!await fs.pathExists(sourceDir)) {
      return
    }

    try {
      // 递归查找所有 .d.ts 文件
      const dtsFiles = await this.findDtsFiles(sourceDir)

      if (dtsFiles.length === 0) {
        return
      }

      this.logger.debug(`复制 ${dtsFiles.length} 个 DTS 文件从 ${esmDir} 到 ${cjsDir} (重命名为 .d.cts)...`)

      // 复制每个 DTS 文件并重命名
      for (const dtsFile of dtsFiles) {
        const relativePath = path.relative(sourceDir, dtsFile)
        // 将 .d.ts 替换为 .d.cts
        const targetRelativePath = relativePath.replace(/\.d\.ts$/, '.d.cts')
        const targetPath = path.join(targetDir, targetRelativePath)

        // 确保目标目录存在
        await fs.ensureDir(path.dirname(targetPath))

        // 复制文件
        await fs.copy(dtsFile, targetPath, { overwrite: true })
      }

      this.logger.debug(`DTS 文件复制完成 (${dtsFiles.length} 个文件)`)
    } catch (error) {
      this.logger.warn(`复制 DTS 文件失败:`, (error as Error).message)
    }
  }

  /**
   * 递归查找目录中的所有 .d.ts 文件
   */
  private async findDtsFiles(dir: string): Promise<string[]> {
    const fs = await import('fs-extra')
    const path = await import('path')
    const files: string[] = []

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          // 递归查找子目录
          const subFiles = await this.findDtsFiles(fullPath)
          files.push(...subFiles)
        } else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
          // 添加 .d.ts 文件
          files.push(fullPath)
        }
      }
    } catch (error) {
      // 忽略错误
    }

    return files
  }

}
