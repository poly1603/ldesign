/**
 * 构建工具类型定义
 * @module types
 * @description 定义 ViteBuilder 和 RollupBuilder 的接口和配置选项
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { 
  Plugin as VitePlugin, 
  UserConfig as ViteConfig, 
  BuildOptions as ViteBuildOptions,
  InlineConfig as ViteInlineConfig,
  ServerOptions,
  PreviewServerOptions
} from 'vite'
import type { 
  Plugin as RollupPlugin, 
  RollupOptions, 
  OutputOptions,
  WatcherOptions,
  TreeshakingOptions,
  ModuleFormat
} from 'rollup'

/**
 * 构建环境类型
 */
export type BuildEnvironment = 'development' | 'production' | 'test'

/**
 * 构建模式类型
 */
export type BuildMode = 'build' | 'dev' | 'preview' | 'watch'

/**
 * 输出格式类型
 */
export type OutputFormat = 'es' | 'cjs' | 'umd' | 'iife' | 'amd' | 'system'

/**
 * 基础构建配置接口
 */
export interface BaseBuilderConfig {
  /** 项目根目录 */
  root?: string
  /** 构建环境 */
  env?: BuildEnvironment
  /** 是否启用源码映射 */
  sourcemap?: boolean | 'inline' | 'hidden'
  /** 是否压缩代码 */
  minify?: boolean | 'terser' | 'esbuild'
  /** 目标浏览器或 Node.js 版本 */
  target?: string | string[]
  /** 外部依赖 */
  external?: string[] | ((id: string) => boolean)
  /** 全局变量定义 */
  define?: Record<string, any>
  /** 别名配置 */
  alias?: Record<string, string>
  /** 是否清理输出目录 */
  cleanOutDir?: boolean
}

/**
 * Vite 构建器配置接口
 * @interface ViteBuilderConfig
 * @extends BaseBuilderConfig
 * @description Vite 构建器的完整配置选项
 */
export interface ViteBuilderConfig extends BaseBuilderConfig {
  /** 入口文件 */
  entry?: string | Record<string, string>
  /** 输出目录 */
  outDir?: string
  /** 资源目录 */
  assetsDir?: string
  /** 公共基础路径 */
  base?: string
  /** 开发服务器配置 */
  server?: {
    /** 端口号 */
    port?: number
    /** 主机地址 */
    host?: string | boolean
    /** 是否自动打开浏览器 */
    open?: boolean | string
    /** 是否启用 HTTPS */
    https?: boolean
    /** 代理配置 */
    proxy?: Record<string, any>
    /** CORS 配置 */
    cors?: boolean
    /** 是否启用热重载 */
    hmr?: boolean | { port?: number }
  }
  /** 预览服务器配置 */
  preview?: {
    /** 端口号 */
    port?: number
    /** 主机地址 */
    host?: string | boolean
    /** 是否自动打开浏览器 */
    open?: boolean | string
    /** 是否启用 HTTPS */
    https?: boolean
  }
  /** 库模式配置 */
  lib?: {
    /** 入口文件 */
    entry: string | Record<string, string>
    /** 库名称 */
    name?: string
    /** 输出格式 */
    formats?: OutputFormat[]
    /** 文件名模板 */
    fileName?: string | ((format: OutputFormat, entryName: string) => string)
  }
  /** CSS 配置 */
  css?: {
    /** 是否提取 CSS */
    extract?: boolean
    /** CSS 模块配置 */
    modules?: boolean | Record<string, any>
    /** PostCSS 配置 */
    postcss?: Record<string, any>
    /** 预处理器配置 */
    preprocessorOptions?: Record<string, any>
  }
  /** 插件列表 */
  plugins?: VitePlugin[]
  /** 原始 Vite 配置 */
  viteConfig?: Partial<ViteConfig>
  /** 构建选项 */
  build?: Partial<ViteBuildOptions>
  /** SSR 配置 */
  ssr?: {
    entry?: string | string[]
    external?: string[]
    noExternal?: string[] | boolean
    target?: 'node' | 'webworker'
  }
  /** 优化依赖配置 */
  optimizeDeps?: {
    include?: string[]
    exclude?: string[]
    esbuildOptions?: Record<string, any>
    force?: boolean
  }
  /** 构建优化配置 */
  optimization?: {
    treeshake?: boolean
    sideEffects?: boolean
    usedExports?: boolean
    concatenateModules?: boolean
    splitChunks?: boolean
    runtimeChunk?: boolean | 'single' | 'multiple'
    moduleIds?: 'natural' | 'named' | 'deterministic' | 'size'
    chunkIds?: 'natural' | 'named' | 'deterministic' | 'size' | 'total-size'
  }
  /** 输出配置 */
  output?: {
    format?: OutputFormat
    exports?: 'auto' | 'default' | 'named' | 'none'
    preserveModules?: boolean
    preserveModulesRoot?: string
    entryFileNames?: string
    chunkFileNames?: string
    assetFileNames?: string
    manualChunks?: Record<string, string[]> | ((id: string) => string | undefined)
    inlineDynamicImports?: boolean
  }
  /** 解析配置 */
  resolve?: {
    extensions?: string[]
    mainFields?: string[]
    conditions?: string[]
    preserveSymlinks?: boolean
  }
  /** esbuild 配置 */
  esbuild?: {
    jsxFactory?: string
    jsxFragment?: string
    jsxInject?: string
    target?: string | string[]
  }
  /** 公共目录 */
  publicDir?: string | false
  /** 缓存目录 */
  cacheDir?: string
  /** 环境目录 */
  envDir?: string
  /** 环境变量前缀 */
  envPrefix?: string | string[]
  /** 日志级别 */
  logLevel?: 'error' | 'warn' | 'info' | 'silent'
  /** 清屏 */
  clearScreen?: boolean
  /** 自动插件 */
  autoPlugins?: boolean
  /** 资源包含规则 */
  assetsInclude?: string | RegExp | (string | RegExp)[]
  /** 版本信息 */
  version?: string
}

/**
 * Rollup 构建器配置接口
 * @interface RollupBuilderConfig
 * @extends BaseBuilderConfig
 * @description Rollup 构建器的完整配置选项
 */
export interface RollupBuilderConfig extends BaseBuilderConfig {
  /** 入口文件 */
  input: string | string[] | Record<string, string>
  /** 输出配置 */
  output: OutputOptions | OutputOptions[]
  /** 插件列表 */
  plugins?: RollupPlugin[]
  /** 监听模式配置 */
  watch?: {
    /** 监听的文件模式 */
    include?: string | string[]
    /** 排除的文件模式 */
    exclude?: string | string[]
    /** 清除屏幕 */
    clearScreen?: boolean
    /** 跳过写入 */
    skipWrite?: boolean
  }
  /** 原始 Rollup 配置 */
  rollupConfig?: Partial<RollupOptions>
  /** treeshake 配置 */
  treeshake?: boolean | TreeshakingOptions
  /** 缓存配置 */
  cache?: boolean | Record<string, any>
  /** 严格废弃警告 */
  strictDeprecations?: boolean
  /** 保留入口签名 */
  preserveEntrySignatures?: boolean | 'strict' | 'allow-extension' | 'exports-only'
  /** 最大并行文件操作数 */
  maxParallelFileOps?: number
  /** 性能 */
  perf?: boolean
  /** 上下文 */
  context?: string
  /** 模块上下文 */
  moduleContext?: Record<string, string> | ((id: string) => string)
  /** acorn 配置 */
  acorn?: Record<string, any>
  /** acorn 插件注入 */
  acornInjectPlugins?: any[]
  /** 保留符号链接 */
  preserveSymlinks?: boolean
  /** 自动插件 */
  autoPlugins?: boolean
}

/**
 * 构建结果接口
 */
export interface BuildResult {
  /** 是否成功 */
  success: boolean
  /** 构建时间（毫秒） */
  duration: number
  /** 输出文件信息 */
  outputs: Array<{
    /** 文件路径 */
    fileName: string
    /** 文件大小（字节） */
    size: number
    /** 压缩后大小（字节） */
    compressedSize?: number
    /** 输出格式 */
    format?: OutputFormat
  }>
  /** 错误信息 */
  errors?: string[]
  /** 警告信息 */
  warnings?: string[]
  /** 额外信息 */
  metadata?: Record<string, any>
}

/**
 * 开发服务器结果接口
 */
export interface DevServerResult {
  /** 服务器 URL */
  url: string
  /** 端口号 */
  port: number
  /** 主机地址 */
  host: string
  /** 是否启用 HTTPS */
  https: boolean
  /** 关闭服务器的方法 */
  close: () => Promise<void>
}

/**
 * 构建器事件类型
 */
export interface BuilderEvents {
  /** 构建开始 */
  'build:start': { mode: BuildMode; config: any }
  /** 构建完成 */
  'build:end': { result: BuildResult }
  /** 构建错误 */
  'build:error': { error: Error }
  /** 文件变更 */
  'file:change': { path: string; event: 'add' | 'change' | 'unlink' }
  /** 服务器启动 */
  'server:start': { server: DevServerResult }
  /** 服务器关闭 */
  'server:close': {}
}

/**
 * 构建器基础接口
 */
export interface BaseBuilder {
  /** 构建项目 */
  build(): Promise<BuildResult>
  /** 监听模式构建 */
  watch(): Promise<void>
  /** 获取配置 */
  getConfig(): any
  /** 设置配置 */
  setConfig(config: any): void
  /** 添加插件 */
  addPlugin(plugin: any): void
  /** 移除插件 */
  removePlugin(pluginName: string): void
  /** 销毁构建器 */
  destroy(): Promise<void>
}

/**
 * Vite 构建器接口
 */
export interface IViteBuilder extends BaseBuilder {
  /** 启动开发服务器 */
  dev(): Promise<DevServerResult>
  /** 启动预览服务器 */
  preview(): Promise<DevServerResult>
  /** 构建库 */
  buildLib(): Promise<BuildResult>
  /** 获取 Vite 配置 */
  getViteConfig(): ViteConfig
}

/**
 * Rollup 构建器接口
 */
export interface IRollupBuilder extends BaseBuilder {
  /** 构建多个输出格式 */
  buildMultiple(formats: OutputFormat[]): Promise<BuildResult[]>
  /** 获取 Rollup 配置 */
  getRollupConfig(): RollupOptions
}

/**
 * 插件配置接口
 */
export interface PluginConfig {
  /** 插件名称 */
  name: string
  /** 插件选项 */
  options?: Record<string, any>
  /** 是否启用 */
  enabled?: boolean
  /** 应用条件 */
  apply?: BuildEnvironment | BuildEnvironment[] | ((config: any) => boolean)
}

/**
 * 预设配置接口
 */
export interface PresetConfig {
  /** 预设名称 */
  name: string
  /** 预设描述 */
  description?: string
  /** 基础配置 */
  config: Partial<ViteBuilderConfig | RollupBuilderConfig>
  /** 插件列表 */
  plugins?: PluginConfig[]
  /** 扩展配置函数 */
  extend?: (config: any) => any
}
