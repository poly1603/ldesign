/**
 * 配置相关类型定义
 * 
 * 定义 ViteLauncher 的配置接口和相关类型
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { UserConfig, Plugin } from 'vite'
import type { LogLevel, Mode, LifecycleHook, ValidationResult, FilePath, Host, Port } from './common'

/**
 * ViteLauncher 扩展配置接口
 * 扩展 Vite 原生配置，添加 launcher 特有的配置选项
 */
export interface ViteLauncherConfig extends UserConfig {
  /** Launcher 特有的配置选项 */
  launcher?: LauncherConfigOptions
}

/**
 * Launcher 配置选项接口
 * 定义 launcher 包特有的配置选项
 */
export interface LauncherConfigOptions {
  /** 是否启用自动重启功能 */
  autoRestart?: boolean

  /** 日志级别 */
  logLevel?: LogLevel

  /** 运行模式 */
  mode?: Mode

  /** 生命周期钩子函数 */
  hooks?: LauncherHooks

  /** 服务器配置 */
  server?: ServerOptions

  /** 构建配置 */
  build?: BuildOptions

  /** 预览配置 */
  preview?: PreviewOptions

  /** 插件配置（为后续 plugin 包预留） */
  plugins?: PluginOptions

  /** 配置文件路径 */
  configFile?: FilePath

  /** 是否启用调试模式 */
  debug?: boolean

  /** 自定义环境变量 */
  env?: Record<string, string>

  /** 工作目录 */
  cwd?: FilePath

  /** 缓存配置 */
  cache?: CacheOptions
}

/**
 * 生命周期钩子函数接口
 * 定义各个生命周期阶段的回调函数
 */
export interface LauncherHooks {
  /** 启动前钩子 */
  beforeStart?: LifecycleHook

  /** 启动后钩子 */
  afterStart?: LifecycleHook

  /** 构建前钩子 */
  beforeBuild?: LifecycleHook

  /** 构建后钩子 */
  afterBuild?: LifecycleHook

  /** 预览前钩子 */
  beforePreview?: LifecycleHook

  /** 预览后钩子 */
  afterPreview?: LifecycleHook

  /** 关闭前钩子 */
  beforeClose?: LifecycleHook

  /** 关闭后钩子 */
  afterClose?: LifecycleHook

  /** 错误处理钩子 */
  onError?: (error: Error) => void | Promise<void>

  /** 配置变更钩子 */
  onConfigChange?: (config: ViteLauncherConfig) => void | Promise<void>
}

/**
 * 服务器配置选项接口
 * 扩展开发服务器的配置选项
 */
export interface ServerOptions {
  /** 主机地址 */
  host?: Host

  /** 端口号 */
  port?: Port

  /** 是否自动打开浏览器 */
  open?: boolean | string

  /** 是否启用 HTTPS */
  https?: boolean

  /** 代理配置 */
  proxy?: Record<string, any>

  /** CORS 配置 */
  cors?: boolean | Record<string, any>

  /** 中间件配置 */
  middlewares?: any[]
}

/**
 * 构建配置选项接口
 * 扩展生产构建的配置选项
 */
export interface BuildOptions {
  /** 输出目录 */
  outDir?: FilePath

  /** 是否生成 sourcemap */
  sourcemap?: boolean

  /** 是否压缩代码 */
  minify?: boolean

  /** 是否启用监听模式 */
  watch?: boolean

  /** 是否清空输出目录 */
  emptyOutDir?: boolean

  /** 构建目标 */
  target?: string | string[]

  /** 是否生成构建报告 */
  reportCompressedSize?: boolean
}

/**
 * 预览配置选项接口
 * 定义预览服务器的配置选项
 */
export interface PreviewOptions {
  /** 主机地址 */
  host?: Host

  /** 端口号 */
  port?: Port

  /** 是否自动打开浏览器 */
  open?: boolean | string

  /** 是否启用 HTTPS */
  https?: boolean

  /** 代理配置 */
  proxy?: Record<string, any>

  /** CORS 配置 */
  cors?: boolean | Record<string, any>
}

/**
 * 插件配置选项接口（为后续 plugin 包预留）
 * 定义插件系统的配置选项
 */
export interface PluginOptions {
  /** 插件列表 */
  plugins?: Plugin[]

  /** 插件配置 */
  config?: Record<string, any>

  /** 是否启用插件热重载 */
  hotReload?: boolean
}

/**
 * 缓存配置选项接口
 * 定义缓存系统的配置选项
 */
export interface CacheOptions {
  /** 是否启用缓存 */
  enabled?: boolean

  /** 缓存目录 */
  dir?: FilePath

  /** 缓存策略 */
  strategy?: 'memory' | 'disk' | 'hybrid'

  /** 缓存过期时间（毫秒） */
  ttl?: number

  /** 最大缓存大小（字节） */
  maxSize?: number
}

/**
 * 配置验证选项接口
 * 定义配置验证的选项
 */
export interface ConfigValidationOptions {
  /** 是否启用严格模式 */
  strict?: boolean

  /** 是否允许未知属性 */
  allowUnknown?: boolean

  /** 自定义验证规则 */
  customRules?: ValidationRule[]
}

/**
 * 验证规则接口
 * 定义自定义验证规则的结构
 */
export interface ValidationRule {
  /** 规则名称 */
  name: string

  /** 验证函数 */
  validate: (value: any, config: ViteLauncherConfig) => ValidationResult

  /** 规则描述 */
  description?: string
}

/**
 * 配置加载选项接口
 * 定义配置文件加载的选项
 */
export interface ConfigLoadOptions {
  /** 配置文件路径 */
  configFile?: FilePath

  /** 工作目录 */
  cwd?: FilePath

  /** 运行模式 */
  mode?: Mode

  /** 环境变量 */
  env?: Record<string, string>

  /** 是否启用配置缓存 */
  cache?: boolean
}

/**
 * 配置合并选项接口
 * 定义配置合并的选项
 */
export interface ConfigMergeOptions {
  /** 合并策略 */
  strategy?: 'merge' | 'override' | 'deep'

  /** 是否合并数组 */
  mergeArrays?: boolean

  /** 自定义合并函数 */
  customMerge?: (base: any, override: any) => any
}
