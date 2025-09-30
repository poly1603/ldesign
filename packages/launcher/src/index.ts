/**
 * @ldesign/launcher - 基于 Vite JavaScript API 的前端项目启动器
 * 
 * 提供统一的开发服务器、构建工具和预览服务，支持多种前端技术栈
 * 
 * @author LDesign Team
 * @version 1.0.0
 * @since 1.0.0
 */

// 导出核心类
export { ViteLauncher } from './core/ViteLauncher'
export { ConfigManager } from './core/ConfigManager'
export { PluginMarketManager, pluginMarket } from './core/PluginMarket'
export { CacheManager, cacheManager } from './core/CacheManager'
export { ToolsManager, createToolsManager, createToolsPlugins } from './core/ToolsManager'

// 导出新增的优化和增强模块
export { PerformanceOptimizer, createPerformanceOptimizer } from './core/PerformanceOptimizer'
export type { OptimizationOptions, PerformanceMetrics as OptimizerMetrics } from './core/PerformanceOptimizer'

export { DevExperience, createDevExperience } from './core/DevExperience'
export type { DevExperienceOptions, DevMetrics } from './core/DevExperience'

export { TestIntegration, createTestIntegration } from './core/TestIntegration'
export type { TestConfig, TestResult, TestFramework } from './core/TestIntegration'

export { DashboardServer, createDashboardServer } from './dashboard/server'
export type { DashboardConfig, DashboardMetrics, BuildRecord } from './dashboard/server'

export { BenchmarkReporter } from './benchmark/reporter'

// 导出插件预设系统
export { presetManager, definePreset } from './plugins/presets'
export type { PresetType, PresetOptions } from './plugins/presets'
export * from './plugins/presets'

// 导出开发工具插件
export * from './plugins'

// 导出别名相关类型定义和工具函数
export type { AliasEntry, BuildStage } from './utils/aliases'
export {
  createAlias,
  createBasicAliases,
  createDevAlias,
  createBuildAlias,
  createUniversalAlias
} from './utils/aliases'

// 导出别名管理器
export { AliasManager, createAliasManager } from './core/AliasManager'
export type { BuildStage as AliasStage } from './core/AliasManager'

// 导出 AI 优化器
export { AIOptimizer, createAIOptimizer } from './ai/optimizer'
export type { ProjectAnalysis, OptimizationSuggestion } from './ai/optimizer'

// 导出插件市场模块
export {
  pluginRegistry,
  pluginManager,
  marketplace,
  PluginMarketplace,
  PluginStatus
} from './marketplace'
export type {
  PluginMetadata,
  InstallOptions,
  PluginOperationResult,
  MarketplaceConfig
} from './marketplace'

// 导出所有类型定义
export * from './types'

// 导出UI配置相关函数
export {
  getConfigFields,
  getFieldByPath,
  getDefaultConfig,
  validateConfigValue,
  getEnvironmentConfig,
  getDefaultEnvironment,
  getEnvironmentConfigPath,
  getNestedValue,
  setNestedValue,
  SUPPORTED_ENVIRONMENTS,
  LAUNCHER_CONFIG_FIELDS
} from './types/ui-config'

// 导出常量
export * from './constants'

// 导出工具函数 - 只导出特定的工具，避免冲突
export { Logger } from './utils/logger'
export { ErrorHandler, LauncherError } from './utils/error-handler'
export { FileSystem } from './utils/file-system'
export { PathUtils } from './utils/path-utils'
export {
  EnvironmentManager,
  environmentManager,
  loadEnv,
  getClientEnv,
  generateDefines
} from './utils/env'

// 配置和构建工具 - 避免重复导出
export {
  loadConfigFile,
  validateConfig,
  mergeConfigs,
  createPathResolver
} from './utils/config'

export {
  analyzeBuildResult,
  generateBuildReport
} from './utils/build'

export {
  getServerUrl
} from './utils/server'

export {
  validatePlugin
} from './utils/plugin'

export {
  validateObjectSchema,
  batchValidate
} from './utils/validation'

export {
  formatDuration
} from './utils/format'

export {
  isValidUrl
} from './utils/server'

export {
  PerformanceMonitor
} from './utils/performance'

// 导出配置定义函数
export { defineConfig } from './utils/config'

// 导出版本信息
export const version = '1.0.0'

// 为了保持导出一致性，使用 createLauncher 函数
// 提供懒加载的方式访问所有模块
export function createLauncher() {
  return {
    version,
    ViteLauncher: () => import('./core/ViteLauncher').then(m => m.ViteLauncher),
    ConfigManager: () => import('./core/ConfigManager').then(m => m.ConfigManager),
    PluginMarketManager: () => import('./core/PluginMarket').then(m => m.PluginMarketManager),
    CacheManager: () => import('./core/CacheManager').then(m => m.CacheManager),
    PluginManager: () => import('./core/PluginManager').then(m => m.PluginManager),
    createCli: () => import('./cli').then(m => m.createCli)
  }
}
