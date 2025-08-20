/**
 * Vite 前端项目启动器
 * 提供开箱即用的 Vite 项目创建、开发、构建和预览功能
 * 
 * @author Vite Launcher Team
 * @version 1.0.0
 */

// 核心类导出
export { ViteLauncher } from './core/ViteLauncher';

// 服务类导出
export { ErrorHandler } from './services/ErrorHandler';
export { ProjectDetector } from './services/ProjectDetector';
export { ConfigManager } from './services/ConfigManager';
export { PluginManager, pluginManager } from './services/PluginManager';

// 创建默认实例
import { ViteLauncher } from './core/ViteLauncher';
import type { ProjectType, DevOptions, BuildOptions, PreviewOptions } from './types';
const viteLauncher = new ViteLauncher();

// 类型定义导出
export type {
  // 核心接口
  IViteLauncher,
  IProjectDetector,
  IConfigManager,
  IPluginManager,
  IErrorHandler,
  
  // 基础类型
  LogLevel,
  FrameworkType,
  RunMode,
  ProjectType,
  
  // 选项类型
  LauncherOptions,
  DevOptions,
  BuildOptions,
  PreviewOptions,
  ConfigMergeOptions,
  
  // 结果类型
  BuildResult,
  BuildStats,
  DetectionResult,
  DetectionReport,
  DetectionStep,
  
  // 配置类型
  PresetConfig,
  PluginConfig,
  
  // 错误类型
  LauncherError
} from './types';

// 常量导出
export { ERROR_CODES } from './types';

// 默认实例导出（便于快速使用）
export default viteLauncher;

/**
 * 快速创建项目的便捷函数
 * @param projectPath 项目路径
 * @param projectType 项目类型
 * @param options 创建选项
 */
export async function createProject(
  projectPath: string,
  projectType: ProjectType,
  options?: { template?: string; force?: boolean }
) {
  return viteLauncher.create(projectPath, projectType, options);
}

/**
 * 快速启动开发服务器的便捷函数
 * @param projectPath 项目路径
 * @param options 开发选项
 */
export async function startDev(
  projectPath?: string,
  options?: DevOptions
) {
  return viteLauncher.dev(projectPath, options);
}

/**
 * 快速构建项目的便捷函数
 * @param projectPath 项目路径
 * @param options 构建选项
 */
export async function buildProject(
  projectPath?: string,
  options?: BuildOptions
) {
  return viteLauncher.build(projectPath, options);
}

/**
 * 快速启动预览服务器的便捷函数
 * @param projectPath 项目路径
 * @param options 预览选项
 */
export async function startPreview(
  projectPath?: string,
  options?: PreviewOptions
) {
  return viteLauncher.preview(projectPath, options);
}

// 简化的便捷函数别名
export const create = createProject;
export const dev = startDev;
export const build = buildProject;
export const preview = startPreview;

/**
 * 获取项目信息的便捷函数
 * @param projectPath 项目路径
 */
export async function getProjectInfo(projectPath?: string) {
  return viteLauncher.getProjectInfo(projectPath);
}