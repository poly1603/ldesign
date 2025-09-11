/**
 * Angular（基础）策略
 * 仅提供最小可用的 TS 打包（推荐使用 ng-packagr 进行完整 Angular 库打包）
 */

import type { ILibraryStrategy } from '../../types/strategy'
import { LibraryType } from '../../types/library'
import type { BuilderConfig } from '../../types/config'
import type { UnifiedConfig } from '../../types/adapter'

export class AngularStrategy implements ILibraryStrategy {
  readonly name = 'angular'
  readonly supportedTypes = [LibraryType.ANGULAR]
  readonly priority = 7

  async applyStrategy(config: BuilderConfig): Promise<UnifiedConfig> {
    const input = config.input || 'src/public-api.ts'

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
    return config.libraryType === LibraryType.ANGULAR
  }

  getDefaultConfig(): Partial<BuilderConfig> {
    return {
      libraryType: LibraryType.ANGULAR,
      output: { format: ['esm', 'cjs'], sourcemap: true },
      performance: { treeshaking: true, minify: false }
    }
  }

  getRecommendedPlugins(_config: BuilderConfig): any[] { return [] }
  validateConfig(_config: BuilderConfig): any { return { valid: true, errors: [], warnings: ['建议使用 ng-packagr 以获得最佳兼容性'], suggestions: [] } }

  private async buildPlugins(config: BuilderConfig): Promise<any[]> {
    const plugins: any[] = []

    // Node resolve
    const nodeResolve = await import('@rollup/plugin-node-resolve')
    plugins.push(nodeResolve.default({ browser: true, extensions: ['.mjs', '.js', '.json', '.ts'] }))

    // CommonJS
    const commonjs = await import('@rollup/plugin-commonjs')
    plugins.push(commonjs.default())

    // 使用 TypeScript 插件生成 JS（支持装饰器）
    const ts = await import('@rollup/plugin-typescript')
    plugins.push({
      name: '@rollup/plugin-typescript-js',
      plugin: async () => ts.default({
        // 不在此插件中生成声明，只负责 JS 转译
        declaration: false,
        emitDeclarationOnly: false,
        noEmitOnError: false,
        skipLibCheck: true,
        experimentalDecorators: true,
        useDefineForClassFields: false,
        target: 'ES2018',
        module: 'ESNext',
        sourceMap: config.output?.sourcemap !== false
      } as any)
    })

    // 单独的 d.ts 生成（按格式定向到 es/cjs 目录）
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
   * 合并 external 配置，确保 Angular 相关依赖被标记为外部
   */
  private mergeExternal(external: any): any {
    const pkgs = ['@angular/core', '@angular/common']

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

