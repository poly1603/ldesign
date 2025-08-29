/**
 * Vite 前端项目启动器
 * 提供开箱即用的 Vite 项目创建、开发、构建和预览功能
 *
 * @author Vite Launcher Team
 * @version 1.0.0
 */

import type { BuildOptions, DevOptions, LauncherOptions, PreviewOptions, ProjectType } from './types'
import { ViteLauncher } from './core/ViteLauncher'

// 核心类导出
export { ViteLauncher } from './core/ViteLauncher'

export { AssetManager, assetManager } from './services/AssetManager'
export { ConfigManager } from './services/ConfigManager'
export { EnvironmentOptimizer, environmentOptimizer } from './services/EnvironmentOptimizer'
// 服务类导出
export { ErrorHandler } from './services/ErrorHandler'
export { NetworkManager, networkManager } from './services/NetworkManager'
export { PluginEcosystem, pluginEcosystem } from './services/PluginEcosystem'
export { PluginManager, pluginManager } from './services/PluginManager'
export { ProjectDetector } from './services/ProjectDetector'
export { SecurityManager, securityManager } from './services/SecurityManager'

// 默认配置
const defaultOptions: LauncherOptions = {
  logLevel: 'info',
  mode: 'development',
  autoDetect: true,
}

const viteLauncher = new ViteLauncher(defaultOptions)

// 类型定义导出
export type {
  BuildOptions,
  // 结果类型
  BuildResult,
  BuildStats,
  ConfigMergeOptions,
  CSSPreprocessor,

  DetectionReport,
  DetectionResult,
  DetectionStep,
  DevOptions,
  FrameworkType,

  IConfigManager,
  IErrorHandler,
  IPluginManager,
  IProjectDetector,
  // 核心接口
  IViteLauncher,

  // 错误类型
  LauncherError,
  // 选项类型
  LauncherOptions,
  // 基础类型
  LogLevel,
  PluginConfig,
  // 配置类型
  PresetConfig,
  PreviewOptions,

  ProjectInfo,
  ProjectType,

  RunMode,
} from './types'

// 网络配置工具导出
export {
  ProxyTemplates,
  ProxyConfigBuilder,
  ProxyConfigValidator,
  ProxyConfigMerger,
  createProxyBuilder,
  createApiProxy,
  createDevProxy,
  createMicroserviceProxy,
} from './utils/proxy-helper'

// SSL 证书工具导出
export {
  SSLCertificateGenerator,
  generateDevSSLCert,
  saveDevSSLCert,
} from './utils/ssl-generator'

// 字体处理工具导出
export {
  FontProcessor,
  optimizeChineseFont,
  generateWebFont,
} from './utils/font-processor'

// 插件生态导出
export {
  PluginPresets,
  PluginFactory,
  PluginConfigHelper,
  createQuickPlugins,
  // 优化插件
  createCompressionPlugin,
  createCodeSplittingPlugin,
  // 开发插件
  createHMREnhancedPlugin,
  // 分析插件
  createBundleAnalyzerPlugin,
} from './plugins'

// 常量导出
export { ERROR_CODES } from './types'

// 默认实例导出（便于快速使用）
export default viteLauncher

/**
 * 快速创建项目的便捷函数
 * @param projectPath 项目路径
 * @param projectType 项目类型
 * @param options 创建选项
 */
export async function createProject(
  projectPath: string,
  projectType: ProjectType,
  options?: { template?: string, force?: boolean },
) {
  return viteLauncher.create(projectPath, projectType, options)
}

/**
 * 快速启动开发服务器的便捷函数
 * @param projectPath 项目路径
 * @param options 开发选项
 */
export async function startDev(
  projectPath?: string,
  options?: DevOptions,
) {
  return viteLauncher.dev(projectPath, options)
}

/**
 * 快速构建项目的便捷函数
 * @param projectPath 项目路径
 * @param options 构建选项
 */
export async function buildProject(
  projectPath?: string,
  options?: BuildOptions,
) {
  return viteLauncher.build(projectPath, options)
}

/**
 * 快速启动预览服务器的便捷函数
 * @param projectPath 项目路径
 * @param options 预览选项
 */
export async function startPreview(
  projectPath?: string,
  options?: PreviewOptions,
) {
  return viteLauncher.preview(projectPath, options)
}

/**
 * 获取项目信息的便捷函数
 * @param projectPath 项目路径
 */
export async function getProjectInfo(projectPath?: string) {
  return viteLauncher.getProjectInfo(projectPath)
}

/**
 * 停止开发服务器的便捷函数
 */
export async function stopDev() {
  return viteLauncher.stop()
}

// 简化的便捷函数别名
export const create = createProject
export const dev = startDev
export const build = buildProject
export const preview = startPreview
export const info = getProjectInfo
export const stop = stopDev

/**
 * 创建自定义配置的启动器实例
 * @param options 启动器配置选项
 * @returns ViteLauncher实例
 */
export function createLauncher(options?: LauncherOptions): ViteLauncher {
  return new ViteLauncher(options)
}

/**
 * 检测项目类型的便捷函数
 * @param projectPath 项目路径
 */
export async function detectProject(projectPath?: string) {
  const detector = new (await import('./services/ProjectDetector')).ProjectDetector()
  return detector.detectProjectType(projectPath || process.cwd())
}

// 导出配置相关
export { loadUserConfig, mergeConfig } from './utils/config-loader'

/**
 * 定义 Launcher 配置的辅助函数
 * 提供类型提示和智能补全
 * @param config 配置对象
 * @returns 配置对象
 */
export function defineConfig(config: import('./types').LauncherConfig): import('./types').LauncherConfig {
  return config
}
