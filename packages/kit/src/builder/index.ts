/**
 * 构建工具模块
 * 提供 Vite 和 Rollup 构建器的封装
 */

// 导出类型定义
export * from './types'

// 导出构建器类
export { ViteBuilder } from './vite-builder'
export { RollupBuilder } from './rollup-builder'

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
  BaseBuilder,
  PresetConfig,
  PluginConfig
} from './types'
