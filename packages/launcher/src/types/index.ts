import type { InlineConfig, ViteDevServer, PluginOption } from 'vite';
// @fileoverview 类型定义统一导出
// @author ViteLauncher Team
// @since 1.0.0

// 核心类型
export type {
  LogLevel,
  RunMode,
  FrameworkType,
  ProjectType,
  CSSPreprocessor,
  PackageManager,
  BuildTool,
  LauncherOptions,
  DevOptions,
  BuildOptions,
  PreviewOptions,
  ProjectInfo,
  ProjectStats,
  BuildStats,
  BuildResult,
  PerformanceMetrics,
  PerformanceConfig,
  DeepReadonly,
  PartialBy,
  RequiredBy,
  NonNullable,
  FunctionType,
  AsyncReturnType,
} from './core'

// 服务相关类型
export type {
  ErrorCode,
  ErrorSeverity,
  LauncherError,
  DetectionStep,
  DetectionReport,
  DetectionResult,
  ConfigMergeOptions,
  PresetConfig,
  PluginConfig,
  IViteLauncher,
  IProjectDetector,
  IConfigManager,
  IPluginManager,
  IErrorHandler,
  CreateProjectOptions,
  ErrorHandlingStrategy,
  ILogger,
} from './services'

// 工具相关类型
export type {
  FileInfo,
  FileSearchOptions,
  FileOperationOptions,
  PackageDependency,
  PackageInfo,
  TemplateVariables,
  TemplateFile,
  TemplateConfig,
  HttpRequestOptions,
  DownloadOptions,
  ValidationRule,
  ValidationResult,
  FormValidationConfig,
  CacheOptions,
  CacheItem,
  EventListener,
  EventConfig,
  IEventEmitter,
  DeepClone,
  Debounce,
  Throttle,
  Retry,
  FormatBytes,
  GenerateRandomString,
} from './utils'

// 常量导出
export { ERROR_CODES } from './services'

// 类型保护函数
export function isLauncherError(error: unknown): error is LauncherError {
  return (
    error instanceof Error &&
    'code' in error &&
    'severity' in error &&
    'timestamp' in error
  )
}

export function isProjectType(value: string): value is ProjectType {
  const validTypes: ProjectType[] = [
    'vue2',
    'vue3', 
    'react',
    'react-next',
    'svelte',
    'lit',
    'angular',
    'vanilla',
    'vanilla-ts',
    'unknown'
  ]
  return validTypes.includes(value as ProjectType)
}

export function isFrameworkType(value: string): value is FrameworkType {
  const validFrameworks: FrameworkType[] = [
    'vue2',
    'vue3',
    'react', 
    'svelte',
    'lit',
    'angular',
    'vanilla',
    'vanilla-ts'
  ]
  return validFrameworks.includes(value as FrameworkType)
}

export function isLogLevel(value: string): value is LogLevel {
  const validLevels: LogLevel[] = ['error', 'warn', 'info', 'silent']
  return validLevels.includes(value as LogLevel)
}

export function isRunMode(value: string): value is RunMode {
  const validModes: RunMode[] = ['development', 'production', 'test']
  return validModes.includes(value as RunMode)
}

export function isPackageManager(value: string): value is PackageManager {
  const validManagers: PackageManager[] = ['npm', 'yarn', 'pnpm', 'bun']
  return validManagers.includes(value as PackageManager)
}

/**
 * 日志级别枚举
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'silent';

/**
 * 运行模式
 */
export type RunMode = 'development' | 'production';

/**
 * 支持的前端框架类型
 */
export type FrameworkType = 'vue2' | 'vue3' | 'react' | 'vanilla' | 'vanilla-ts' | 'lit' | 'svelte';

/**
 * 项目类型（更详细的分类）
 */
export type ProjectType = 'vue2' | 'vue3' | 'react' | 'react-next' | 'lit' | 'svelte' | 'angular' | 'vanilla' | 'vanilla-ts' | 'unknown';

/**
 * CSS预处理器类型
 */
export type CSSPreprocessor = 'sass' | 'less' | 'stylus';

/**
 * 包管理器类型
 */
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

/**
 * 构建工具类型
 */
export type BuildTool = 'vite' | 'webpack' | 'rollup' | 'parcel';

/**
 * 启动器配置选项
 */
export interface LauncherOptions {
  /** 项目根目录路径 */
  root?: string;
  /** 运行模式 */
  mode?: RunMode;
  /** 日志级别 */
  logLevel?: LogLevel;
  /** Vite配置文件路径，false表示不使用配置文件 */
  configFile?: string | false;
  /** 自定义插件列表 */
  plugins?: PluginOption[];
  /** 是否启用自动项目类型检测 */
  autoDetect?: boolean;
  /** 强制指定项目类型，跳过自动检测 */
  forceFramework?: FrameworkType;
}

/**
 * 项目类型信息
 */
export interface ProjectInfo {
  /** 前端框架类型 */
  framework: FrameworkType;
  /** 是否使用TypeScript */
  typescript: boolean;
  /** CSS预处理器 */
  cssPreprocessor?: CSSPreprocessor;
  /** 项目依赖列表 */
  dependencies: string[];
  /** 检测置信度 (0-1) */
  confidence: number;
}

/**
 * 项目统计信息
 */
export interface ProjectStats {
  /** 项目文件数量 */
  fileCount: number;
  /** 项目大小（字节） */
  size: number;
  /** 项目依赖数量 */
  dependencyCount: number;
}

/**
 * 开发服务器配置选项
 */
export interface DevOptions {
  /** 服务器端口号 */
  port?: number;
  /** 服务器主机地址 */
  host?: string | boolean;
  /** 是否自动打开浏览器 */
  open?: boolean | string;
  /** 是否启用HTTPS */
  https?: boolean;
  /** 代理配置 */
  proxy?: Record<string, string | object>;
  /** CORS配置 */
  cors?: boolean | object;
}

/**
 * 构建配置选项
 */
export interface BuildOptions {
  /** 输出目录 */
  outDir?: string;
  /** 是否压缩代码 */
  minify?: boolean | 'terser' | 'esbuild';
  /** 是否生成sourcemap */
  sourcemap?: boolean | 'inline' | 'hidden';
  /** 是否清空输出目录 */
  emptyOutDir?: boolean;
  /** 构建目标 */
  target?: string | string[];
  /** 是否生成构建报告 */
  reportCompressedSize?: boolean;
}

/**
 * 预览服务器配置选项
 */
export interface PreviewOptions {
  /** 服务器端口号 */
  port?: number;
  /** 服务器主机地址 */
  host?: string | boolean;
  /** 是否自动打开浏览器 */
  open?: boolean | string;
  /** 是否启用HTTPS */
  https?: boolean;
  /** 代理配置 */
  proxy?: Record<string, string | object>;
  /** CORS配置 */
  cors?: boolean | object;
  /** 输出目录 */
  outDir?: string;
}

/**
 * 构建结果信息
 */
export interface BuildResult {
  /** 构建是否成功 */
  success: boolean;
  /** 输出文件列表 */
  outputFiles: string[];
  /** 构建耗时（毫秒） */
  duration: number;
  /** 构建产物总大小（字节） */
  size: number;
  /** 错误信息列表 */
  errors?: string[];
  /** 警告信息列表 */
  warnings?: string[];
  /** 构建统计信息 */
  stats?: BuildStats;
}

/**
 * 构建统计信息
 */
export interface BuildStats {
  /** 入口文件数量 */
  entryCount: number;
  /** 模块数量 */
  moduleCount: number;
  /** 资源文件数量 */
  assetCount: number;
  /** 代码分割块数量 */
  chunkCount: number;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 内存使用情况 */
  memoryUsage: number;
  /** CPU使用情况 */
  cpuUsage: number;
  /** 磁盘读写速度 */
  diskSpeed: number;
  /** 网络速度 */
  networkSpeed: number;
}

/**
 * 性能配置
 */
export interface PerformanceConfig {
  /** 是否启用性能监控 */
  enabled: boolean;
  /** 性能监控间隔（毫秒） */
  interval: number;
}

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

/**
 * 部分属性可选类型
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 部分属性必需类型
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * 非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * 函数类型
 */
export type FunctionType<T extends any[], R> = (...args: T) => R;

/**
 * 异步函数返回类型
 */
export type AsyncReturnType<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

/**
 * 错误代码枚举
 */
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * 错误严重程度枚举
 */
export type ErrorSeverity = 'error' | 'warn' | 'info';

/**
 * 错误信息接口
 */
export interface LauncherError {
  /** 错误代码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 错误详情 */
  details?: string;
  /** 解决建议 */
  suggestion?: string;
  /** 相关文档链接 */
  docUrl?: string;
  /** 原始错误对象 */
  originalError?: Error;
  /** 错误严重程度 */
  severity: ErrorSeverity;
  /** 错误发生时间戳 */
  timestamp: number;
}

/**
 * 项目检测结果
 */
export interface DetectionResult {
  /** 检测到的项目类型 */
  projectType: ProjectType;
  /** 框架类型 */
  framework: FrameworkType;
  /** 检测置信度 */
  confidence: number;
  /** 检测报告 */
  report: DetectionReport;
  /** 错误信息 */
  error?: LauncherError;
}

/**
 * 项目检测报告
 */
export interface DetectionReport {
  /** 检测到的文件列表 */
  detectedFiles: string[];
  /** 检测到的依赖包 */
  detectedDependencies: string[];
  /** 生产依赖 */
  dependencies: Record<string, string>;
  /** 开发依赖 */
  devDependencies: Record<string, string>;
  /** 检测置信度 (0-100) */
  confidence: number;
  /** 检测步骤日志 */
  steps: DetectionStep[];
  /** 检测耗时（毫秒） */
  duration: number;
}

/**
 * 检测步骤信息
 */
export interface DetectionStep {
  /** 步骤名称 */
  name: string;
  /** 步骤描述 */
  description?: string;
  /** 步骤结果 */
  result: 'success' | 'failed' | 'skipped';
  /** 步骤消息 */
  message: string;
  /** 是否成功 */
  success?: boolean;
  /** 错误信息 */
  error?: string;
  /** 步骤耗时（毫秒） */
  duration: number;
}

/**
 * 配置合并选项
 */
export interface ConfigMergeOptions {
  /** 是否深度合并 */
  deep?: boolean;
  /** 是否覆盖数组 */
  overrideArrays?: boolean;
  /** 自定义合并函数 */
  customMerger?: (target: any, source: any, key: string) => any;
}

/**
 * 预设配置信息
 */
export interface PresetConfig {
  /** 配置名称 */
  name: string;
  /** 适用的框架类型 */
  framework: FrameworkType;
  /** Vite配置对象 */
  config: InlineConfig;
  /** 配置优先级 */
  priority: number;
  /** 配置描述 */
  description?: string;
}

/**
 * 插件配置信息
 */
export interface PluginConfig {
  /** 插件名称 */
  name: string;
  /** 插件包名 */
  packageName: string;
  /** 适用的框架类型 */
  frameworks: FrameworkType[];
  /** 支持的框架类型（别名） */
  supportedFrameworks: FrameworkType[];
  /** 插件版本 */
  version: string;
  /** 插件选项 */
  options?: Record<string, any>;
  /** 默认选项 */
  defaultOptions?: Record<string, any>;
  /** 是否必需 */
  required: boolean;
  /** 插件描述 */
  description?: string;
}

/**
 * 启动器实例接口
 */
export interface IViteLauncher {
  /** 启动开发服务器 */
  dev(projectPath?: string, options?: DevOptions): Promise<ViteDevServer>;
  /** 执行构建任务 */
  build(projectPath?: string, options?: BuildOptions): Promise<BuildResult>;
  /** 启动预览服务器 */
  preview(projectPath?: string, options?: PreviewOptions): Promise<ViteDevServer>;
  /** 获取当前配置 */
  getConfig(): InlineConfig;
  /** 获取项目类型信息 */
  getProjectType(): ProjectType;
  /** 更新配置 */
  configure(config: Partial<InlineConfig>): void;
  /** 销毁实例 */
  destroy(): Promise<void>;
}

/**
 * 项目检测器接口
 */
export interface IProjectDetector {
  /** 检测项目类型 */
  detect(root: string): Promise<DetectionResult>;
  /** 检测框架类型 */
  detectFramework(root: string): Promise<FrameworkType>;
  /** 检测TypeScript使用情况 */
  detectTypeScript(root: string): Promise<boolean>;
  /** 检测CSS预处理器 */
  detectCSSPreprocessor(root: string): Promise<CSSPreprocessor | undefined>;
}

/**
 * 配置管理器接口
 */
export interface IConfigManager {
  /** 加载预设配置 */
  loadPreset(framework: FrameworkType): Promise<PresetConfig>;
  /** 合并配置 */
  mergeConfig(base: InlineConfig, override: Partial<InlineConfig>, options?: ConfigMergeOptions): InlineConfig;
  /** 验证配置 */
  validateConfig(config: InlineConfig): Promise<boolean>;
  /** 获取所有预设配置 */
  getAllPresets(): Promise<PresetConfig[]>;
}

/**
 * 插件管理器接口
 */
export interface IPluginManager {
  /** 加载框架插件 */
  loadFrameworkPlugins(framework: FrameworkType): Promise<PluginOption[]>;
  /** 注册自定义插件 */
  registerPlugin(plugin: PluginConfig): void;
  /** 获取所有可用插件 */
  getAvailablePlugins(): Promise<PluginConfig[]>;
  /** 解析插件选项 */
  resolvePluginOptions(pluginName: string, options?: Record<string, any>): Record<string, any>;
}

/**
 * 错误处理器接口
 */
export interface IErrorHandler {
  /** 处理错误 */
  handleError(error: Error, context?: string): LauncherError;
  /** 格式化错误信息 */
  formatError(error: LauncherError): string;
  /** 记录错误日志 */
  logError(error: LauncherError): void;
  /** 获取错误建议 */
  getSuggestion(errorCode: string): string | undefined;
}

/**
 * 创建项目选项
 */
export interface CreateProjectOptions {
  /** 项目名称 */
  name: string;
  /** 项目类型 */
  type: ProjectType;
  /** 项目目录 */
  directory: string;
  /** 是否使用TypeScript */
  typescript?: boolean;
  /** 是否使用CSS预处理器 */
  cssPreprocessor?: CSSPreprocessor;
  /** 是否使用包管理器 */
  packageManager?: PackageManager;
  /** 是否使用构建工具 */
  buildTool?: BuildTool;
  /** 是否使用模板 */
  template?: string;
  /** 是否使用示例代码 */
  example?: boolean;
  /** 是否使用Git */
  git?: boolean;
  /** 是否使用CI/CD */
  ci?: boolean;
  /** 是否使用Docker */
  docker?: boolean;
  /** 是否使用GitHub Actions */
  githubActions?: boolean;
  /** 是否使用GitLab CI/CD */
  gitlabCI?: boolean;
  /** 是否使用Bitbucket Pipelines */
  bitbucketPipelines?: boolean;
  /** 是否使用Netlify */
  netlify?: boolean;
  /** 是否使用Vercel */
  vercel?: boolean;
  /** 是否使用Firebase */
  firebase?: boolean;
  /** 是否使用AWS Amplify */
  awsAmplify?: boolean;
  /** 是否使用Netlify Functions */
  netlifyFunctions?: boolean;
  /** 是否使用Vercel Functions */
  vercelFunctions?: boolean;
  /** 是否使用Firebase Functions */
  firebaseFunctions?: boolean;
  /** 是否使用AWS Lambda */
  awsLambda?: boolean;
  /** 是否使用AWS API Gateway */
  awsApiGateway?: boolean;
  /** 是否使用AWS S3 */
  awsS3?: boolean;
  /** 是否使用AWS DynamoDB */
  awsDynamoDB?: boolean;
  /** 是否使用AWS RDS */
  awsRDS?: boolean;
  /** 是否使用AWS CloudFront */
  awsCloudFront?: boolean;
  /** 是否使用AWS CloudWatch */
  awsCloudWatch?: boolean;
  /** 是否使用AWS IAM */
  awsIAM?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSSS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  awsSNS?: boolean;
  /** 是否使用AWS SQS */
  awsSQS?: boolean;
  /** 是否使用AWS SNS */
  /```

```

```
