/**
 * 压缩处理器
 * 
 * 提供统一的代码压缩功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { MinifyOptions, JSMinifyOptions, CSSMinifyOptions } from '../types/minify'
import { Logger } from './logger'

export class MinifyProcessor {
  private logger: Logger

  constructor(logger?: Logger) {
    this.logger = logger || new Logger()
  }

  /**
   * 创建 Rollup 压缩插件
   */
  createRollupMinifyPlugin(options: boolean | MinifyOptions): any[] {
    const config = this.resolveMinifyConfig(options)
    const plugins: any[] = []

    if (!config.js) {
      return plugins
    }

    try {
      if (typeof config.js === 'object' && config.js.minifier === 'esbuild') {
        // 使用 esbuild 压缩
        const esbuild = require('rollup-plugin-esbuild')
        plugins.push(esbuild.default({
          minify: true,
          target: config.js.target || 'es2015',
          keepNames: config.js.keep_fnames,
          legalComments: config.legal ? 'inline' : 'none'
        }))
      } else {
        // 使用 terser 压缩
        const terser = require('@rollup/plugin-terser')
        plugins.push(terser.default(this.createTerserOptions(config.js)))
      }
    } catch (error) {
      this.logger.warn('压缩插件加载失败，将跳过压缩:', (error as Error).message)
    }

    return plugins
  }

  /**
   * 创建 Rolldown 压缩配置
   */
  createRolldownMinifyConfig(options: boolean | MinifyOptions): any {
    const config = this.resolveMinifyConfig(options)

    if (!config.js) {
      return { minify: false }
    }

    // Rolldown 内置压缩支持
    return {
      minify: true,
      // 可以根据需要添加更多 Rolldown 特定的压缩选项
    }
  }

  /**
   * 解析压缩配置
   */
  private resolveMinifyConfig(options: boolean | MinifyOptions): MinifyOptions {
    if (typeof options === 'boolean') {
      return options ? { level: 'basic', js: true } : { level: 'none', js: false }
    }
    return options
  }

  /**
   * 创建 Terser 选项
   */
  private createTerserOptions(jsOptions: boolean | JSMinifyOptions): any {
    if (typeof jsOptions === 'boolean') {
      return jsOptions ? {} : undefined
    }

    const terserOptions: any = {}

    // 混淆配置
    if (jsOptions.mangle !== undefined) {
      if (typeof jsOptions.mangle === 'boolean') {
        terserOptions.mangle = jsOptions.mangle
      } else {
        terserOptions.mangle = {
          reserved: jsOptions.mangle.reserved || [],
          properties: jsOptions.mangle.properties || false
        }
      }
    }

    // 压缩配置
    if (jsOptions.compress !== undefined) {
      if (typeof jsOptions.compress === 'boolean') {
        terserOptions.compress = jsOptions.compress
      } else {
        terserOptions.compress = {
          drop_console: jsOptions.compress.drop_console,
          drop_: jsOptions.compress.drop_,
          dead_code: jsOptions.compress.dead_code,
          inline: jsOptions.compress.inline
        }
      }
    }

    // 输出格式配置
    if (jsOptions.format) {
      terserOptions.format = {
        comments: jsOptions.format.comments,
        beautify: jsOptions.format.beautify,
        indent_size: jsOptions.format.indent_size
      }
    }

    // 保留函数名和类名
    if (jsOptions.keep_fnames !== undefined) {
      terserOptions.keep_fnames = jsOptions.keep_fnames
    }
    if (jsOptions.keep_classnames !== undefined) {
      terserOptions.keep_classnames = jsOptions.keep_classnames
    }

    return terserOptions
  }

  /**
   * 创建 CSS 压缩插件
   */
  createCSSMinifyPlugin(options: boolean | CSSMinifyOptions): any | null {
    if (!options) return null

    try {
      const postcss = require('rollup-plugin-postcss')
      const cssnano = require('cssnano')

      const cssOptions = typeof options === 'object' ? options : {}
      const cssnanoOptions: any = {}

      if (cssOptions.removeUnused !== undefined) {
        cssnanoOptions.discardUnused = cssOptions.removeUnused
      }
      if (cssOptions.mergeRules !== undefined) {
        cssnanoOptions.mergeRules = cssOptions.mergeRules
      }
      if (cssOptions.colormin !== undefined) {
        cssnanoOptions.colormin = cssOptions.colormin
      }
      if (cssOptions.discardComments !== undefined) {
        cssnanoOptions.discardComments = cssOptions.discardComments
      }
      if (cssOptions.discardEmpty !== undefined) {
        cssnanoOptions.discardEmpty = cssOptions.discardEmpty
      }

      return postcss({
        plugins: [cssnano(cssnanoOptions)],
        extract: true,
        minimize: true
      })
    } catch (error) {
      this.logger.warn('CSS 压缩插件加载失败:', (error as Error).message)
      return null
    }
  }

  /**
   * 获取压缩统计信息
   */
  getCompressionStats(originalSize: number, compressedSize: number) {
    const ratio = ((originalSize - compressedSize) / originalSize) * 100
    return {
      originalSize,
      compressedSize,
      savedBytes: originalSize - compressedSize,
      compressionRatio: ratio,
      formattedRatio: `${ratio.toFixed(1)}%`,
      formattedOriginalSize: this.formatBytes(originalSize),
      formattedCompressedSize: this.formatBytes(compressedSize),
      formattedSavedBytes: this.formatBytes(originalSize - compressedSize)
    }
  }

  /**
   * 格式化字节大小
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

/**
 * 创建压缩处理器实例
 */
export function createMinifyProcessor(logger?: Logger): MinifyProcessor {
  return new MinifyProcessor(logger)
}

/**
 * 获取默认压缩配置
 */
export function getDefaultMinifyConfig(): MinifyOptions {
  return {
    level: 'basic',
    js: {
      minifier: 'terser',
      mangle: false,
      compress: {
        drop_console: false,
        dead_code: true,
        inline: false
      },
      format: {
        comments: 'some'
      }
    },
    css: {
      minifier: 'cssnano',
      removeUnused: false,
      mergeRules: true,
      colormin: true,
      discardComments: false,
      discardEmpty: true
    },
    comments: 'some',
    legal: true
  }
}

/**
 * 检查是否需要压缩
 */
export function shouldMinify(config: any): boolean {
  // 1) 顶层 minify 优先（boolean 或对象）
  if (typeof config.minify === 'boolean') {
    return config.minify
  }
  if (typeof config.minify === 'object') {
    return config.minify.level !== 'none'
  }
  // 2) 回退到 performance.minify（若显式设置）
  if (config?.performance && typeof config.performance.minify !== 'undefined') {
    return Boolean(config.performance.minify)
  }
  // 3) 最后按模式：生产环境默认压缩，开发环境不压缩
  return config.mode === 'production'
}
