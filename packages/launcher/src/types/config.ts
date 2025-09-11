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
  
  /** 配置文件路径 */
  configFile?: FilePath
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
  env?: EnvironmentConfig

  /** 工作目录 */
  cwd?: FilePath

  /** 缓存配置 */
  cache?: CacheOptions

  /** 预设配置 */
  preset?: ProjectPreset

  /** SSR 配置 */
  ssr?: SSROptions

  /** 库模式配置 */
  lib?: LibraryOptions

  /** 多入口配置 */
  entry?: MultiEntryOptions

  /** 代理配置增强 */
  proxy?: ProxyOptions

  /** 构建优化配置 */
  optimization?: OptimizationOptions

  /** 开发服务器高级配置 */
  devServer?: DevServerAdvancedOptions

  /** 热更新配置 */
  hmr?: HMROptions

  /** 配置继承 */
  extends?: string | string[]
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
  https?: boolean | Record<string, any>

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
  https?: boolean | Record<string, any>

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

/**
 * 环境变量配置接口
 * 定义环境变量的处理选项
 */
export interface EnvironmentConfig {
  /** 环境变量映射 */
  variables?: Record<string, string>

  /** 环境变量文件路径 */
  envFile?: string | string[]

  /** 环境变量前缀 */
  prefix?: string

  /** 是否展开环境变量 */
  expand?: boolean

  /** 默认环境变量 */
  defaults?: Record<string, string>

  /** 必需的环境变量 */
  required?: string[]
}

/**
 * 项目预设类型
 * 定义支持的项目类型预设
 */
export type ProjectPreset =
  | 'vue2'
  | 'vue3'
  | 'vue3-ts'
  | 'react'
  | 'react-ts'
  | 'svelte'
  | 'svelte-ts'
  | 'vanilla'
  | 'vanilla-ts'
  | 'lit'
  | 'lit-ts'
  | 'custom'

/**
 * SSR 配置选项接口
 * 定义服务端渲染的配置选项
 */
export interface SSROptions {
  /** 是否启用 SSR */
  enabled?: boolean

  /** 入口文件 */
  entry?: string

  /** 输出目录 */
  outDir?: string

  /** 是否生成客户端 manifest */
  manifest?: boolean

  /** 预渲染路径 */
  prerender?: string[]

  /** SSR 外部依赖 */
  external?: string[]

  /** Node.js 适配器配置 */
  adapter?: {
    name: string
    options?: Record<string, any>
  }
}

/**
 * 库模式配置选项接口
 * 定义库构建的配置选项
 */
export interface LibraryOptions {
  /** 入口文件 */
  entry: string | Record<string, string>

  /** 库名称 */
  name?: string

  /** 输出格式 */
  formats?: ('es' | 'cjs' | 'umd' | 'iife')[]

  /** 文件名模板 */
  fileName?: string | ((format: string, entryName: string) => string)

  /** 外部依赖 */
  external?: (string | RegExp)[] | RegExp | string

  /** 全局变量映射 */
  globals?: Record<string, string>

  /** TypeScript 定义文件生成 */
  dts?: boolean | {
    outDir?: string
    include?: string[]
    exclude?: string[]
  }
}

/**
 * 多入口配置选项接口
 * 定义多入口构建的配置选项
 */
export interface MultiEntryOptions {
  /** 入口配置 */
  entries: Record<string, string | {
    entry: string
    template?: string
    filename?: string
    title?: string
    chunks?: string[]
  }>

  /** 是否启用代码分割 */
  codeSplit?: boolean

  /** 公共块配置 */
  commonChunks?: {
    vendor?: boolean
    runtime?: boolean
    manifest?: boolean
  }

  /** HTML 模板配置 */
  htmlTemplate?: {
    template: string
    inject?: boolean | 'head' | 'body'
    minify?: boolean
  }
}

/**
 * 代理配置增强接口
 * 扩展 Vite 原生代理配置
 */
export interface ProxyOptions extends Record<string, any> {
  /** 代理规则 */
  rules?: ExtendedProxyRule[]

  /** 全局代理配置 */
  global?: {
    timeout?: number
    retry?: number
    headers?: Record<string, string>
    auth?: {
      username: string
      password: string
    }
  }

  /** 代理中间件 */
  middleware?: ProxyMiddleware[]

  /** 是否启用代理日志 */
  logging?: boolean
}

/**
 * 代理规则接口（增强版本）
 */
export interface ExtendedProxyRule {
  /** 匹配路径 */
  path: string | RegExp

  /** 目标地址 */
  target: string

  /** 是否修改来源 */
  changeOrigin?: boolean

  /** 路径重写 */
  rewrite?: (path: string) => string

  /** 请求头配置 */
  headers?: Record<string, string>

  /** 是否启用 WebSocket */
  ws?: boolean

  /** 是否启用安全模式 */
  secure?: boolean

  /** 超时时间 */
  timeout?: number
}

/**
 * 代理中间件接口
 */
export interface ProxyMiddleware {
  name: string
  handler: (req: any, res: any, next: any) => void
  options?: Record<string, any>
}

/**
 * 构建优化配置接口
 * 定义构建优化的配置选项
 */
export interface OptimizationOptions {
  /** 是否启用压缩 */
  minify?: boolean | 'terser' | 'esbuild' | 'swc'

  /** 代码分割配置 */
  splitChunks?: {
    strategy?: 'split-by-experience' | 'unbundle' | 'experimental-split-by-experience'
    granularChunks?: boolean
    maxSize?: number
    minSize?: number
  }

  /** Tree Shaking 配置 */
  treeShaking?: {
    enabled?: boolean
    sideEffects?: boolean | string[]
    preset?: 'safest' | 'smallest'
  }

  /** 包分析配置 */
  bundleAnalyzer?: {
    enabled?: boolean
    openAnalyzer?: boolean
    filename?: string
    reportFilename?: string
  }

  /** 依赖优化 */
  deps?: {
    include?: string[]
    exclude?: string[]
    entries?: string[]
    force?: boolean
  }

  /** 输出优化 */
  output?: {
    manualChunks?: Record<string, string[]> | ((id: string) => string | void)
    experimentalMinChunkSize?: number
    hashSalt?: string
    generatedCode?: {
      symbols?: boolean
      preset?: 'es5' | 'es2015'
    }
  }
}

/**
 * 开发服务器高级配置接口
 * 扩展开发服务器配置选项
 */
export interface DevServerAdvancedOptions {
  /** 预热文件 */
  warmup?: {
    clientFiles?: string[]
    ssrFiles?: string[]
  }

  /** 文件系统缓存 */
  fs?: {
    strict?: boolean
    allow?: string[]
    deny?: string[]
    cachedChecks?: boolean
  }

  /** 源码映射配置 */
  sourcemap?: {
    server?: boolean | 'inline' | 'hidden'
    client?: boolean | 'inline' | 'hidden'
  }

  /** 性能监控 */
  performance?: {
    hints?: boolean | 'warning' | 'error'
    maxEntrypointSize?: number
    maxAssetSize?: number
    assetFilter?: (assetFilename: string) => boolean
  }

  /** 错误覆盖 */
  errorOverlay?: {
    enabled?: boolean
    theme?: 'dark' | 'light' | 'auto'
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  }

  /** 中间件配置 */
  middleware?: {
    pre?: any[]
    post?: any[]
  }
}

/**
 * 热更新配置接口
 * 定义热更新的配置选项
 */
export interface HMROptions {
  /** 是否启用 HMR */
  enabled?: boolean

  /** HMR 端口 */
  port?: number

  /** HMR 主机 */
  host?: string

  /** 客户端配置 */
  clientPort?: number

  /** 覆盖模式 */
  overlay?: boolean

  /** 接受的文件扩展名 */
  accept?: string[]

  /** 忽略的文件模式 */
  ignore?: string[]

  /** 热更新策略 */
  strategy?: 'native' | 'inject'

  /** 自定义热更新处理器 */
  handlers?: HMRHandler[]

  /** 延迟时间 */
  delay?: number

  /** 日志配置 */
  logging?: {
    level?: 'off' | 'error' | 'warn' | 'info' | 'debug'
    hmrClientErrors?: boolean
  }
}

/**
 * HMR 处理器接口
 */
export interface HMRHandler {
  /** 匹配模式 */
  test: RegExp | string

  /** 处理函数 */
  handler: (ctx: {
    file: string
    timestamp: number
    server: any
  }) => void | Promise<void>

  /** 处理器名称 */
  name?: string
}
