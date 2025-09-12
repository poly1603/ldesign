/**
 * Solid 策略
 * 使用 rollup-plugin-solid 处理 JSX/TSX，postcss 可选
 */

import type { ILibraryStrategy } from '../../types/strategy'
import { LibraryType } from '../../types/library'
import type { BuilderConfig } from '../../types/config'
import type { UnifiedConfig } from '../../types/adapter'
import { shouldMinify } from '../../utils/minify-processor'

export class SolidStrategy implements ILibraryStrategy {
  readonly name = 'solid'
  readonly supportedTypes = [LibraryType.SOLID]
  readonly priority = 9

  async applyStrategy(config: BuilderConfig): Promise<UnifiedConfig> {
    const input = config.input || 'src/index.tsx'

    return {
      input,
      output: this.buildOutputConfig(config),
      plugins: await this.buildPlugins(config),
      external: this.mergeExternal(config.external),
      treeshake: config.performance?.treeshaking !== false,
      onwarn: this.createWarningHandler()
    }
  }

  isApplicable(config: BuilderConfig): boolean {
    return config.libraryType === LibraryType.SOLID
  }

  getDefaultConfig(): Partial<BuilderConfig> {
    return {
      libraryType: LibraryType.SOLID,
      output: { format: ['esm', 'cjs'], sourcemap: true },
      performance: { treeshaking: true, minify: true }
    }
  }

  getRecommendedPlugins(_config: BuilderConfig): any[] { return [] }
  validateConfig(_config: BuilderConfig): any { return { valid: true, errors: [], warnings: [], suggestions: [] } }

  private async buildPlugins(config: BuilderConfig): Promise<any[]> {
    const plugins: any[] = []

    // Node resolve
    const nodeResolve = await import('@rollup/plugin-node-resolve')
    plugins.push(nodeResolve.default({ browser: true, extensions: ['.mjs', '.js', '.json', '.ts', '.tsx'] }))

    // CommonJS
    const commonjs = await import('@rollup/plugin-commonjs')
    plugins.push(commonjs.default())

    // 使用 esbuild 处理 TS/TSX，启用自动 JSX，指向 solid-js 的 jsx-runtime
    const esbuild = await import('rollup-plugin-esbuild')
    plugins.push(esbuild.default({
      include: /\.(tsx?|jsx?)$/, exclude: [/node_modules/], target: 'es2020',
      jsx: 'automatic', jsxImportSource: 'solid-js', tsconfig: 'tsconfig.json',
sourceMap: config.output?.sourcemap !== false, minify: shouldMinify(config)
    }))

    // PostCSS (optional)
    if (config.style?.extract !== false) {
      const postcss = await import('rollup-plugin-postcss')
plugins.push(postcss.default({ extract: true, minimize: config.style?.minimize !== false }))
    }

    return plugins
  }

  private buildOutputConfig(config: BuilderConfig): any {
    const out = config.output || {}
    const formats = Array.isArray(out.format) ? out.format : ['esm', 'cjs']
    return { dir: out.dir || 'dist', format: formats, sourcemap: out.sourcemap !== false, exports: 'auto' }
  }

  private createWarningHandler() {
    return (warning: any) => { void warning; /* 可按需过滤 Solid 特定警告 */ }
  }

  /**
   * 合并 external 配置，确保 Solid 相关依赖被标记为外部
   */
  private mergeExternal(external: any): any {
    const pkgs = ['solid-js']

    if (!external) return pkgs

    if (Array.isArray(external)) {
      return [...external, ...pkgs]
    }

    if (typeof external === 'function') {
      return (id: string, ...args: any[]) => pkgs.includes(id) || external(id, ...args)
    }

    if (external instanceof RegExp) {
      return (id: string) => pkgs.includes(id) || (external as RegExp).test(id)
    }

    if (typeof external === 'string') {
      return [external, ...pkgs]
    }

    if (typeof external === 'object') {
      return [...Object.keys(external), ...pkgs]
    }

    return pkgs
  }
}

