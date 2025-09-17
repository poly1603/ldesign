/**
 * 混合策略
 */

import type { ILibraryStrategy } from '../../types/strategy'
import { LibraryType } from '../../types/library'
import type { BuilderConfig } from '../../types/config'
import type { UnifiedConfig } from '../../types/adapter'

export class MixedStrategy implements ILibraryStrategy {
  readonly name = 'mixed'
  readonly supportedTypes: LibraryType[] = [LibraryType.MIXED]
  readonly priority = 5

  async applyStrategy(config: BuilderConfig): Promise<UnifiedConfig> {
    // 解析入口配置
    const resolvedInput = await this.resolveInputEntries(config)

    const unifiedConfig: UnifiedConfig = {
      input: resolvedInput,
      output: this.buildOutputConfig(config),
      plugins: await this.buildPlugins(config),
      external: config.external || [],
      treeshake: config.performance?.treeshaking !== false,
      onwarn: this.createWarningHandler()
    }

    return unifiedConfig
  }

  isApplicable(config: BuilderConfig): boolean {
    return config.libraryType === LibraryType.MIXED
  }

  getDefaultConfig(): Partial<BuilderConfig> {
    return {
      libraryType: LibraryType.MIXED,
      output: {
        format: ['esm', 'cjs'],
        sourcemap: true
      },
      typescript: {
        declaration: true
      },
      style: {
        extract: true
      },
      performance: {
        treeshaking: true,
        minify: true
      }
    }
  }

  getRecommendedPlugins(_config: BuilderConfig): any[] {
    return []
  }

  validateConfig(_config: BuilderConfig): any {
    return {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }
  }

  /**
   * 解析入口配置
   * - 若用户未传入 input，则将 src 下所有源文件作为入口（排除测试与声明文件）
   * - 若用户传入 glob 模式的数组，则解析为多入口
   * - 若用户传入单个文件或对象，则直接返回
   */
  private async resolveInputEntries(config: BuilderConfig): Promise<string | string[] | Record<string, string>> {
    // 如果没有提供input，自动扫描src目录
    if (!config.input) {
      return this.autoDiscoverEntries()
    }

    // 如果是字符串数组且包含glob模式，解析为多入口
    if (Array.isArray(config.input)) {
      return this.resolveGlobEntries(config.input)
    }

    // 其他情况直接返回用户配置
    return config.input
  }

  /**
   * 自动发现入口文件
   */
  private async autoDiscoverEntries(): Promise<string | Record<string, string>> {
    const { findFiles } = await import('../../utils/file-system')
    const { relative, extname } = await import('path')

    const files = await findFiles([
      'src/**/*.{ts,tsx,js,jsx,vue,css,less,scss,sass,json}'
    ], {
      cwd: process.cwd(),
      ignore: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*', '**/__tests__/**']
    })

    if (files.length === 0) return 'src/index.ts'

    const entryMap: Record<string, string> = {}
    for (const abs of files) {
      const rel = relative(process.cwd(), abs)
      const relFromSrc = rel.replace(/^src[\\/]/, '')
      const noExt = relFromSrc.slice(0, relFromSrc.length - extname(relFromSrc).length)
      const key = noExt.replace(/\\/g, '/')
      entryMap[key] = abs
    }
    return entryMap
  }

  /**
   * 解析glob模式的入口配置
   */
  private async resolveGlobEntries(patterns: string[]): Promise<Record<string, string>> {
    const { findFiles } = await import('../../utils/file-system')
    const { relative, extname } = await import('path')

    const files = await findFiles(patterns, {
      cwd: process.cwd(),
      ignore: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*', '**/__tests__/**']
    })

    if (files.length === 0) {
      throw new Error(`No files found matching patterns: ${patterns.join(', ')}`)
    }

    const entryMap: Record<string, string> = {}
    for (const abs of files) {
      const rel = relative(process.cwd(), abs)
      const relFromSrc = rel.replace(/^src[\\/]/, '')
      const noExt = relFromSrc.slice(0, relFromSrc.length - extname(relFromSrc).length)
      const key = noExt.replace(/\\/g, '/')
      entryMap[key] = abs
    }
    return entryMap
  }

  /**
   * 构建输出配置
   */
  private buildOutputConfig(config: BuilderConfig): any {
    const outputConfig = config.output || {}
    const formats = Array.isArray(outputConfig.format)
      ? outputConfig.format
      : [outputConfig.format || 'esm']

    return {
      dir: outputConfig.dir || 'dist',
      format: formats,
      sourcemap: outputConfig.sourcemap !== false,
      exports: 'named'
    }
  }

  /**
   * 构建插件配置
   */
  private async buildPlugins(config: BuilderConfig): Promise<any[]> {
    const plugins: any[] = []

    try {
      // Node resolve
      const nodeResolve = await import('@rollup/plugin-node-resolve')
      plugins.push(nodeResolve.default({
        preferBuiltins: false,
        browser: true,
        extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.vue', '.css', '.less', '.scss']
      }))

      // CommonJS
      const commonjs = await import('@rollup/plugin-commonjs')
      plugins.push(commonjs.default())

      // TypeScript
      const ts = await import('@rollup/plugin-typescript')
      plugins.push({
        name: 'typescript',
        plugin: async () => ts.default({
          tsconfig: 'tsconfig.json',
          declaration: config.typescript?.declaration !== false,
          // declarationDir 将由 RollupAdapter 动态设置
          target: config.typescript?.target || 'ES2020',
          module: config.typescript?.module || 'ESNext',
          strict: config.typescript?.strict !== false,
          skipLibCheck: true,
          sourceMap: config.output?.sourcemap !== false
        } as any)
      })

      // PostCSS for styles
      if (config.style?.extract !== false) {
        const postcss = await import('rollup-plugin-postcss')
        plugins.push(postcss.default({
          extract: true,
          minimize: config.style?.minimize !== false,
          sourceMap: config.output?.sourcemap !== false,
          modules: config.style?.modules || false
        }))
      }

    } catch (error) {
      console.error('插件加载失败:', error)
    }

    return plugins
  }

  /**
   * 创建警告处理器
   */
  private createWarningHandler() {
    return (warning: any) => {
      // 忽略一些常见的无害警告
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return
      }

      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        return
      }

      console.warn(`Warning: ${warning.message}`)
    }
  }
}
