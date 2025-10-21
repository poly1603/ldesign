/**
 * @ldesign/builder - 主入口文件
 * 
 * 基于 rollup/rolldown 的通用库打包工具
 * 支持多种前端库类型的打包和双打包核心的灵活切换
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

// 核心类导出
export { LibraryBuilder } from './core/LibraryBuilder'
export { ConfigManager } from './core/ConfigManager'
export { StrategyManager } from './core/StrategyManager'
export { PluginManager } from './core/PluginManager'
export { LibraryDetector } from './core/LibraryDetector'
export { PerformanceMonitor } from './core/PerformanceMonitor'
export { PostBuildValidator } from './core/PostBuildValidator'
export { TestRunner } from './core/TestRunner'
export { ValidationReporter } from './core/ValidationReporter'
export { TemporaryEnvironment } from './core/TemporaryEnvironment'

// 适配器导出
export { BundlerAdapterFactory } from './adapters/base/AdapterFactory'
export { RollupAdapter } from './adapters/rollup/RollupAdapter'
export { RolldownAdapter } from './adapters/rolldown/RolldownAdapter'
export { UnifiedBundlerAdapter } from './adapters/UnifiedBundlerAdapter'
export type { UnifiedAdapterOptions, BundlerType } from './adapters/UnifiedBundlerAdapter'

// 策略导出
export { TypeScriptStrategy } from './strategies/typescript/TypeScriptStrategy'
export { StyleStrategy } from './strategies/style/StyleStrategy'
export { Vue2Strategy } from './strategies/vue2/Vue2Strategy'
export { Vue3Strategy } from './strategies/vue3/Vue3Strategy'
export { ReactStrategy } from './strategies/react/ReactStrategy'
export { SvelteStrategy } from './strategies/svelte/SvelteStrategy'
export { SolidStrategy } from './strategies/solid/SolidStrategy'
export { PreactStrategy } from './strategies/preact/PreactStrategy'
export { LitStrategy } from './strategies/lit/LitStrategy'
export { AngularStrategy } from './strategies/angular/AngularStrategy'
export { MixedStrategy } from './strategies/mixed/MixedStrategy'

// 插件导出
export * from './plugins'

// 类型定义导出
export * from './types'

// 常量导出
export * from './constants'

// 工具函数导出
export * from './utils'
export { MemoryOptimizer, getGlobalMemoryOptimizer } from './utils/memory-optimizer'
export type { MemoryStats, MemoryConfig } from './utils/memory-optimizer'

// 便捷函数
export { defineConfig, defineAsyncConfig } from './utils/config'
export { createBuilder } from './utils/factory'

// 增强配置导出
export * from './config/enhanced-config'

/**
 * 默认导出 - LibraryBuilder 类
 */
export { LibraryBuilder as default } from './core/LibraryBuilder'
