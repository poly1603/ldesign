/**
 * Lit / Web Components 策略
 * 使用 esbuild 处理 TS，postcss 可选
 */

import type { ILibraryStrategy } from '../../types/strategy'
import { LibraryType } from '../../types/library'
import type { BuilderConfig } from '../../types/config'
import type { UnifiedConfig } from '../../types/adapter'
import { shouldMinify } from '../../utils/minify-processor'

export class LitStrategy implements ILibraryStrategy {
  readonly name = 'lit'
  readonly supportedTypes = [LibraryType.LIT]
  readonly priority = 8

  async applyStrategy(config: BuilderConfig): Promise<UnifiedConfig> {
    const input = config.input || 'src/index.ts'

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
    return config.libraryType === LibraryType.LIT
  }

  getDefaultConfig(): Partial<BuilderConfig> {
    return {
      libraryType: LibraryType.LIT,
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
    plugins.push(nodeResolve.default({ browser: true, extensions: ['.mjs', '.js', '.json', '.ts'] }))

    // CommonJS
    const commonjs = await import('@rollup/plugin-commonjs')
    plugins.push(commonjs.default())

    // 生成类型声明（仅 d.ts，不参与代码转译）
    const ts = await import('@rollup/plugin-typescript')
    plugins.push({
      name: 'typescript',
      plugin: async () => ts.default({
        declaration: true,
        emitDeclarationOnly: true,
        noEmitOnError: false,
        skipLibCheck: true,
        sourceMap: config.output?.sourcemap !== false
        // declarationDir 将由适配器按格式重写为对应输出目录
      } as any)
    })

    // PostCSS (optional)
    if (config.style?.extract !== false) {
      const postcss = await import('rollup-plugin-postcss')
plugins.push(postcss.default({ extract: true, minimize: config.style?.minimize !== false }))
    }

    // esbuild for TS
    const esbuild = await import('rollup-plugin-esbuild')
    plugins.push(esbuild.default({
      include: /\.(ts|js)$/,
      exclude: [/node_modules/],
      target: 'es2020',
      sourceMap: config.output?.sourcemap !== false,
minify: shouldMinify(config)
    }))

    return plugins
  }

  private buildOutputConfig(config: BuilderConfig): any {
    const out = config.output || {}
    const formats = Array.isArray(out.format) ? out.format : ['esm', 'cjs']
    return { dir: out.dir || 'dist', format: formats, sourcemap: out.sourcemap !== false, exports: 'auto' }
  }

  private createWarningHandler() {
    return (_warning: any) => { /* 可按需过滤 */ }
  }

  /**
   * 合并 external 配置，确保 Lit 相关依赖被标记为外部
   */
  private mergeExternal(external: any): any {
    const pkgs = ['lit']

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

