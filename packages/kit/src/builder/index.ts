/**
 * 构建工具模块
 * @module builder  
 * @description 提供 Vite 和 Rollup 构建器的高级封装，支持丰富的配置和插件系统
 * 
 * @example
 * ```typescript
 * // 使用 Vite 构建器
 * import { ViteBuilder } from '@ldesign/kit/builder'
 * 
 * const viteBuilder = new ViteBuilder({
 *   entry: 'src/main.ts',
 *   outDir: 'dist'
 * })
 * 
 * await viteBuilder.build()
 * 
 * // 使用 Rollup 构建器
 * import { RollupBuilder } from '@ldesign/kit/builder'
 * 
 * const rollupBuilder = new RollupBuilder({
 *   input: 'src/index.ts',
 *   output: { file: 'dist/bundle.js', format: 'es' }
 * })
 * 
 * await rollupBuilder.build()
 * ```
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

// 导出类型定义
export * from './types'

// 导出基础构建器
export { BaseBuilder } from './base'

// 导出 Vite 构建器相关
export { ViteBuilder, VitePluginManager } from './vite'
export type { PluginOptions } from './vite'

// 导出 Rollup 构建器相关
export { RollupBuilder } from './rollup'

// 导出工厂类和预设
export { 
  BuilderFactory,
  BuiltinPresets,
  createViteBuilder,
  createRollupBuilder,
  createViteBuilderWithPreset,
  createRollupBuilderWithPreset
} from './builder-factory'

// 导出工具类
export { BuilderUtils } from './builder-utils'

// 重新导出主要类型
export type {
  ViteBuilderConfig,
  RollupBuilderConfig,
  BuildResult,
  DevServerResult,
  BuildEnvironment,
  BuildMode,
  OutputFormat,
  IViteBuilder,
  IRollupBuilder,
  BaseBuilder as BaseBuilderInterface,
  BaseBuilderConfig,
  PresetConfig,
  PluginConfig,
  BuilderEvents
} from './types'
