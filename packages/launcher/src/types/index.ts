import type { InlineConfig, ViteDevServer, PluginOption } from 'vite';

/**
 * 日志级别枚举
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'silent';

/**
 * 支持的前端框架类型
 */
export type FrameworkType = 'vue2' | 'vue3' | 'react' | 'vanilla' | 'vanilla-ts' | 'html' | 'lit' | 'svelte';

/**
 * 项目类型（更详细的分类）
 */
export type ProjectType = 'vue2' | 'vue3' | 'react' | 'react-next' | 'lit' | 'svelte' | 'angular' | 'vanilla' | 'vanilla-ts' | 'html' | 'unknown';

/**
 * CSS预处理器类型
 */
export type CSSPreprocessor = 'sass' | 'less' | 'stylus';

/**
 * 运行模式
 */
export type RunMode = 'development' | 'production';

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
  /** 构建模式 */
  mode?: 'development' | 'production';
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
 * 插件配置信息（旧版本，保持向后兼容）
 */
export interface LegacyPluginConfig {
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
  /** 主要依赖 */
  dependencies?: Record<string, string>;
  /** 检测到的特征文件 */
  detectedFiles?: string[];
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
  registerPlugin(plugin: LegacyPluginConfig): void;
  /** 获取所有可用插件 */
  getAvailablePlugins(): Promise<LegacyPluginConfig[]>;
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
 * 常量定义
 */
export const ERROR_CODES = {
  PROJECT_TYPE_DETECTION_FAILED: 'E001',
  INVALID_CONFIG: 'E002',
  PLUGIN_LOAD_FAILED: 'E003',
  BUILD_FAILED: 'E004',
  DEV_SERVER_START_FAILED: 'E005',
  PREVIEW_SERVER_START_FAILED: 'E006',
  CONFIG_MERGE_FAILED: 'E007',
  DEPENDENCY_NOT_FOUND: 'E008',
  UNSUPPORTED_FRAMEWORK: 'E009',
  INVALID_PROJECT_ROOT: 'E010',
  BUILD_OUTPUT_NOT_FOUND: 'E011'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Launcher 配置文件类型
 */
export interface LauncherConfig {
  /**
   * Vite 配置
   */
  vite?: {
    plugins?: any[]
    define?: Record<string, any>
    resolve?: {
      alias?: Record<string, string>
    }
    server?: {
      port?: number
      host?: string
      open?: boolean
      cors?: boolean
    }
    build?: {
      target?: string
      outDir?: string
      assetsDir?: string
      sourcemap?: boolean
      minify?: boolean | string
      rollupOptions?: any
    }
    css?: {
      preprocessorOptions?: any
      modules?: any
    }
    [key: string]: any
  }

  /**
   * 网络配置
   */
  network?: {
    /** 代理配置 */
    proxy?: Record<string, any>
    /** 路径别名配置 */
    alias?: Record<string, string>
    /** CORS 配置 */
    cors?: Record<string, any>
    /** 主机配置 */
    host?: string
    /** 端口配置 */
    port?: number
    /** 是否自动打开浏览器 */
    open?: boolean | string
    /** 是否启用 HTTPS */
    https?: boolean
    /** 网络超时配置 */
    timeout?: {
      connect?: number
      read?: number
      write?: number
    }
  }

  /**
   * 安全配置
   */
  security?: {
    /** HTTPS 配置 */
    https?: Record<string, any>
    /** SSL 配置 */
    ssl?: Record<string, any>
    /** 安全头配置 */
    headers?: Record<string, any>
    /** CSP 配置 */
    csp?: Record<string, any>
    /** CORS 安全配置 */
    cors?: Record<string, any>
  }

  /**
   * 资源配置
   */
  assets?: {
    /** 字体优化配置 */
    fonts?: Record<string, any>
    /** SVG 处理配置 */
    svg?: {
      /** 是否启用 SVG 组件转换 */
      componentGeneration?: boolean
      /** 是否启用 SVG 优化 */
      optimization?: boolean
      /** 是否生成 SVG 精灵图 */
      sprite?: boolean
      /** SVG 优化选项 */
      optimizationOptions?: Record<string, any>
      /** 组件生成选项 */
      componentOptions?: Record<string, any>
      /** 精灵图生成选项 */
      spriteOptions?: Record<string, any>
    }
    /** 图片优化配置 */
    images?: Record<string, any>
    /** 静态资源目录 */
    staticDir?: string
    /** 输出目录 */
    outputDir?: string
    /** 是否启用资源哈希 */
    hash?: boolean
  }

  /**
   * 插件生态配置
   */
  plugins?: {
    /** 内置插件配置 */
    builtin?: {
      /** 压缩插件 */
      compression?: Record<string, any>
      /** 代码分割插件 */
      codeSplitting?: Record<string, any>
      /** 热重载增强插件 */
      hmrEnhanced?: Record<string, any>
      /** 构建分析插件 */
      bundleAnalyzer?: Record<string, any>
    }
    /** 外部插件 */
    external?: string[]
    /** 禁用的插件 */
    disabled?: string[]
    /** 插件加载顺序 */
    order?: string[]
  }

  /**
   * 环境优化配置
   */
  optimization?: {
    /** 热重载优化 */
    hotReload?: Record<string, any>
    /** 错误提示优化 */
    errorDisplay?: Record<string, any>
    /** 构建分析 */
    buildAnalysis?: Record<string, any>
    /** 性能监控 */
    performance?: Record<string, any>
    /** 缓存优化 */
    cache?: Record<string, any>
    /** 开发服务器优化 */
    devServer?: Record<string, any>
    /** 构建优化 */
    build?: Record<string, any>
  }

  /**
   * 项目类型覆盖
   */
  projectType?: ProjectType



  /**
   * 开发服务器配置
   */
  dev?: DevOptions

  /**
   * 构建配置
   */
  build?: BuildOptions

  /**
   * 预览配置
   */
  preview?: PreviewOptions
}

// 导出网络配置相关类型
export type {
  AliasConfig,
  AliasResolveOptions,
  AliasResolveResult,
  CORSConfig,
  INetworkManager,
  NetworkConfig,
  NetworkConfigValidation,
  NetworkStats,
  ProxyConfig,
  ProxyEventData,
  ProxyEventType,
  ProxyMatchResult,
  ProxyMiddlewareOptions,
  ProxyRule,
} from './network'

// 导出安全配置相关类型
export type {
  CertificateStorageOptions,
  CertificateValidation,
  CORSSecurityConfig,
  CSPConfig,
  HTTPSOptions,
  ISecurityManager,
  SecurityConfig,
  SecurityEventData,
  SecurityEventType,
  SecurityHeaders,
  SecurityStats,
  SSLCertificate,
  SSLCertGenerationOptions,
  SSLConfig,
} from './security'

// 导出资源处理相关类型
export type {
  AssetConfig,
  AssetEventData,
  AssetEventType,
  AssetProcessingResult,
  AssetStats,
  ChineseCharsetType,
  FontInfo,
  FontOptimizationConfig,
  FontProcessingResult,
  IAssetManager,
  ImageOptimizationConfig,
  ImageProcessingResult,
  SVGComponentOptions,
  SVGInfo,
  SVGOptimizationOptions,
  SVGProcessingResult,
  SVGSpriteOptions,
} from './assets'

// 导出插件生态相关类型
export type {
  BuiltinPlugin,
  BuiltinPluginType,
  BundleAnalyzerPluginConfig,
  CodeSplittingPluginConfig,
  CompressionPluginConfig,
  ErrorOverlayPluginConfig,
  HMREnhancedPluginConfig,
  IPluginEcosystem,
  PerformancePluginConfig,
  PluginConfig,
  PluginEcosystemConfig,
  PluginEventData,
  PluginEventType,
  PluginInfo,
  PluginInstallResult,
  PluginSearchResult,
  PluginStats,
  PreloadPluginConfig,
} from './plugins'

// 导出环境优化相关类型
export type {
  BuildAnalysisConfig,
  BuildOptimizationConfig,
  CacheOptimizationConfig,
  DevServerOptimizationConfig,
  EnvironmentOptimizationConfig,
  ErrorDisplayConfig,
  HotReloadOptimizationConfig,
  IEnvironmentOptimizer,
  OptimizationEventData,
  OptimizationEventType,
  OptimizationStats,
  OptimizationSuggestion,
  PerformanceMonitoringConfig,
} from './optimization'