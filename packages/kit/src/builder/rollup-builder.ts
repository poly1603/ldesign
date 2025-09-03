/**
 * Rollup 构建器类
 * 封装 Rollup 的打包功能，提供灵活的插件配置和多种输出格式支持
 */

import { rollup, watch, type RollupBuild, type RollupWatcher } from 'rollup'
import { EventEmitter } from 'events'
import { resolve } from 'path'
import { existsSync, statSync } from 'fs'
import type {
  RollupBuilderConfig,
  BuildResult,
  IRollupBuilder,
  BuilderEvents,
  BuildMode,
  OutputFormat
} from './types'

/**
 * Rollup 构建器类
 * 提供 Rollup 构建工具的高级封装
 */
export class RollupBuilder extends EventEmitter implements IRollupBuilder {
  private config: RollupBuilderConfig
  private watcher?: RollupWatcher
  private isDestroyed = false

  /**
   * 构造函数
   * @param config Rollup 构建器配置
   */
  constructor(config: RollupBuilderConfig) {
    super()
    this.config = this.normalizeConfig(config)
  }

  /**
   * 标准化配置
   * @param config 原始配置
   * @returns 标准化后的配置
   */
  private normalizeConfig(config: RollupBuilderConfig): RollupBuilderConfig {
    const root = config.root || process.cwd()
    
    return {
      root,
      env: config.env || 'production',
      input: config.input,
      output: config.output,
      sourcemap: config.sourcemap ?? true,
      minify: config.minify ?? true,
      target: config.target || 'es2015',
      external: config.external || [],
      define: config.define || {},
      alias: config.alias || {},
      cleanOutDir: config.cleanOutDir ?? true,
      plugins: config.plugins || [],
      watch: {
        clearScreen: true,
        skipWrite: false,
        ...config.watch
      },
      ...config
    }
  }

  /**
   * 构建 Rollup 配置
   * @param mode 构建模式
   * @returns Rollup 配置对象
   */
  private buildRollupConfig(mode: BuildMode = 'build') {
    const { config } = this
    const isWatch = mode === 'watch'

    // 基础配置
    const rollupConfig: any = {
      input: config.input,
      external: config.external,
      plugins: [...(config.plugins || [])],
      output: config.output,
      ...config.rollupConfig
    }

    // 监听模式配置
    if (isWatch && config.watch) {
      rollupConfig.watch = config.watch
    }

    return rollupConfig
  }

  /**
   * 构建项目
   * @returns 构建结果
   */
  async build(): Promise<BuildResult> {
    if (this.isDestroyed) {
      throw new Error('RollupBuilder has been destroyed')
    }

    const startTime = Date.now()
    this.emit('build:start', { mode: 'build', config: this.config })

    try {
      const rollupConfig = this.buildRollupConfig('build')
      const bundle = await rollup(rollupConfig)
      
      const outputs = Array.isArray(rollupConfig.output) 
        ? rollupConfig.output 
        : [rollupConfig.output]
      
      const results = []
      for (const outputConfig of outputs) {
        const { output } = await bundle.write(outputConfig)
        results.push(...output)
      }

      await bundle.close()
      
      const duration = Date.now() - startTime
      const buildResult: BuildResult = {
        success: true,
        duration,
        outputs: this.extractOutputInfo(results),
        errors: [],
        warnings: []
      }

      this.emit('build:end', { result: buildResult })
      return buildResult
    } catch (error) {
      const buildResult: BuildResult = {
        success: false,
        duration: Date.now() - startTime,
        outputs: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: []
      }

      this.emit('build:error', { error: error as Error })
      return buildResult
    }
  }

  /**
   * 构建多个输出格式
   * @param formats 输出格式数组
   * @returns 构建结果数组
   */
  async buildMultiple(formats: OutputFormat[]): Promise<BuildResult[]> {
    if (this.isDestroyed) {
      throw new Error('RollupBuilder has been destroyed')
    }

    const results: BuildResult[] = []
    
    for (const format of formats) {
      // 创建临时配置
      const tempConfig = { ...this.config }
      
      // 更新输出格式
      if (Array.isArray(tempConfig.output)) {
        tempConfig.output = tempConfig.output.map(output => ({
          ...output,
          format
        }))
      } else {
        tempConfig.output = {
          ...tempConfig.output,
          format
        }
      }

      // 临时更新配置
      const originalConfig = this.config
      this.config = tempConfig
      
      try {
        const result = await this.build()
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          duration: 0,
          outputs: [],
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: []
        })
      } finally {
        // 恢复原始配置
        this.config = originalConfig
      }
    }

    return results
  }

  /**
   * 监听模式构建
   */
  async watch(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('RollupBuilder has been destroyed')
    }

    if (this.watcher) {
      this.watcher.close()
    }

    const rollupConfig = this.buildRollupConfig('watch')
    this.watcher = watch(rollupConfig)

    this.emit('build:start', { mode: 'watch', config: this.config })

    this.watcher.on('event', (event) => {
      switch (event.code) {
        case 'START':
          this.emit('build:start', { mode: 'watch', config: this.config })
          break
        case 'BUNDLE_END':
          if (event.result) {
            const buildResult: BuildResult = {
              success: true,
              duration: event.duration || 0,
              outputs: [],
              errors: [],
              warnings: []
            }
            this.emit('build:end', { result: buildResult })
            event.result.close()
          }
          break
        case 'ERROR':
          this.emit('build:error', { error: event.error })
          break
      }
    })

    // 返回 Promise，但不会 resolve（监听模式持续运行）
    return new Promise((resolve, reject) => {
      if (this.watcher) {
        this.watcher.on('event', (event) => {
          if (event.code === 'FATAL') {
            reject(event.error)
          }
        })
      }
    })
  }

  /**
   * 提取输出文件信息
   * @param outputs Rollup 输出结果
   * @returns 输出文件信息数组
   */
  private extractOutputInfo(outputs: any[]): BuildResult['outputs'] {
    return outputs.map(output => {
      const size = output.type === 'chunk' 
        ? output.code.length 
        : output.source.length

      return {
        fileName: output.fileName,
        size,
        format: output.format as OutputFormat
      }
    })
  }

  /**
   * 获取配置
   * @returns 当前配置
   */
  getConfig(): RollupBuilderConfig {
    return { ...this.config }
  }

  /**
   * 获取 Rollup 配置
   * @returns Rollup 配置对象
   */
  getRollupConfig() {
    return this.buildRollupConfig()
  }

  /**
   * 设置配置
   * @param config 新配置
   */
  setConfig(config: Partial<RollupBuilderConfig>): void {
    this.config = this.normalizeConfig({ ...this.config, ...config })
  }

  /**
   * 添加插件
   * @param plugin Rollup 插件
   */
  addPlugin(plugin: any): void {
    this.config.plugins = this.config.plugins || []
    this.config.plugins.push(plugin)
  }

  /**
   * 移除插件
   * @param pluginName 插件名称
   */
  removePlugin(pluginName: string): void {
    if (this.config.plugins) {
      this.config.plugins = this.config.plugins.filter(
        plugin => plugin.name !== pluginName
      )
    }
  }

  /**
   * 销毁构建器
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) {
      return
    }

    this.isDestroyed = true

    if (this.watcher) {
      this.watcher.close()
      this.watcher = undefined
    }

    this.removeAllListeners()
  }
}
