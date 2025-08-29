/**
 * 插件生态相关类型定义
 */

/**
 * 内置插件类型
 */
export type BuiltinPluginType = 'optimization' | 'development' | 'build' | 'analysis' | 'assets'

/**
 * 内置插件信息
 */
export interface BuiltinPlugin {
  /** 插件名称 */
  name: string
  /** 插件描述 */
  description: string
  /** 插件类别 */
  category: BuiltinPluginType
  /** 支持的框架 */
  framework?: string[]
  /** 配置模式 */
  configSchema?: any
  /** 是否默认启用 */
  defaultEnabled?: boolean
  /** 插件版本 */
  version?: string
  /** 插件作者 */
  author?: string
  /** 插件依赖 */
  dependencies?: string[]
  /** 插件标签 */
  tags?: string[]
}

/**
 * 插件配置
 */
export interface PluginConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 插件选项 */
  options?: Record<string, any>
  /** 应用条件 */
  apply?: 'build' | 'serve' | ((config: any, env: any) => boolean)
  /** 插件顺序 */
  enforce?: 'pre' | 'post'
}

/**
 * 压缩插件配置
 */
export interface CompressionPluginConfig extends PluginConfig {
  options?: {
    /** 压缩算法 */
    algorithm?: 'gzip' | 'brotli' | 'deflate'
    /** 压缩级别 */
    level?: number
    /** 最小文件大小 */
    threshold?: number
    /** 文件过滤器 */
    filter?: RegExp | ((fileName: string) => boolean)
    /** 是否删除原文件 */
    deleteOriginalAssets?: boolean
  }
}

/**
 * 代码分割插件配置
 */
export interface CodeSplittingPluginConfig extends PluginConfig {
  options?: {
    /** 分割策略 */
    strategy?: 'vendor' | 'async' | 'manual'
    /** 最小块大小 */
    minSize?: number
    /** 最大块大小 */
    maxSize?: number
    /** 分割规则 */
    chunks?: {
      [chunkName: string]: string[]
    }
    /** 缓存组 */
    cacheGroups?: Record<string, any>
  }
}

/**
 * 预加载插件配置
 */
export interface PreloadPluginConfig extends PluginConfig {
  options?: {
    /** 预加载资源类型 */
    resourceTypes?: ('script' | 'style' | 'font' | 'image')[]
    /** 预加载策略 */
    strategy?: 'prefetch' | 'preload' | 'modulepreload'
    /** 资源过滤器 */
    filter?: RegExp | ((fileName: string) => boolean)
    /** 是否包含异步块 */
    includeAsyncChunks?: boolean
    /** 自定义属性 */
    attributes?: Record<string, string>
  }
}

/**
 * 热重载增强插件配置
 */
export interface HMREnhancedPluginConfig extends PluginConfig {
  options?: {
    /** 是否启用快速刷新 */
    fastRefresh?: boolean
    /** 是否保留状态 */
    preserveState?: boolean
    /** 错误覆盖 */
    errorOverlay?: boolean
    /** 自定义更新处理 */
    customUpdateHandlers?: Record<string, (module: any) => void>
    /** 忽略的文件模式 */
    ignored?: string[]
  }
}

/**
 * 错误覆盖插件配置
 */
export interface ErrorOverlayPluginConfig extends PluginConfig {
  options?: {
    /** 是否显示警告 */
    showWarnings?: boolean
    /** 是否显示错误详情 */
    showErrorDetails?: boolean
    /** 自定义样式 */
    customStyles?: string
    /** 错误过滤器 */
    errorFilter?: (error: Error) => boolean
    /** 点击行为 */
    clickToOpen?: boolean
  }
}

/**
 * 构建分析插件配置
 */
export interface BundleAnalyzerPluginConfig extends PluginConfig {
  options?: {
    /** 分析模式 */
    mode?: 'server' | 'static' | 'json'
    /** 输出目录 */
    outputDir?: string
    /** 报告文件名 */
    reportFilename?: string
    /** 是否自动打开 */
    openAnalyzer?: boolean
    /** 服务器端口 */
    port?: number
    /** 分析器主机 */
    host?: string
  }
}

/**
 * 性能监控插件配置
 */
export interface PerformancePluginConfig extends PluginConfig {
  options?: {
    /** 是否启用构建时间分析 */
    buildTime?: boolean
    /** 是否启用包大小分析 */
    bundleSize?: boolean
    /** 是否启用依赖分析 */
    dependencies?: boolean
    /** 性能预算 */
    budget?: {
      /** 最大包大小 */
      maxBundleSize?: number
      /** 最大资源大小 */
      maxAssetSize?: number
      /** 最大构建时间 */
      maxBuildTime?: number
    }
    /** 报告格式 */
    reportFormat?: 'console' | 'json' | 'html'
  }
}

/**
 * 插件生态配置
 */
export interface PluginEcosystemConfig {
  /** 内置插件配置 */
  builtin?: {
    /** 压缩插件 */
    compression?: CompressionPluginConfig
    /** 代码分割插件 */
    codeSplitting?: CodeSplittingPluginConfig
    /** 预加载插件 */
    preload?: PreloadPluginConfig
    /** 热重载增强插件 */
    hmrEnhanced?: HMREnhancedPluginConfig
    /** 错误覆盖插件 */
    errorOverlay?: ErrorOverlayPluginConfig
    /** 构建分析插件 */
    bundleAnalyzer?: BundleAnalyzerPluginConfig
    /** 性能监控插件 */
    performance?: PerformancePluginConfig
  }
  /** 外部插件 */
  external?: string[]
  /** 禁用的插件 */
  disabled?: string[]
  /** 插件加载顺序 */
  order?: string[]
}

/**
 * 插件信息
 */
export interface PluginInfo {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件描述 */
  description: string
  /** 插件作者 */
  author?: string
  /** 插件主页 */
  homepage?: string
  /** 插件仓库 */
  repository?: string
  /** 插件许可证 */
  license?: string
  /** 插件关键词 */
  keywords?: string[]
  /** 下载量 */
  downloads?: number
  /** 评分 */
  rating?: number
  /** 是否官方插件 */
  official?: boolean
}

/**
 * 插件市场搜索结果
 */
export interface PluginSearchResult {
  /** 搜索结果 */
  plugins: PluginInfo[]
  /** 总数量 */
  total: number
  /** 当前页 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 搜索关键词 */
  query: string
}

/**
 * 插件安装结果
 */
export interface PluginInstallResult {
  /** 是否成功 */
  success: boolean
  /** 插件名称 */
  pluginName: string
  /** 安装的版本 */
  version?: string
  /** 错误信息 */
  error?: string
  /** 安装时间 */
  installTime?: number
  /** 依赖信息 */
  dependencies?: string[]
}

/**
 * 插件生态管理器接口
 */
export interface IPluginEcosystem {
  /** 获取内置插件列表 */
  getBuiltinPlugins(): BuiltinPlugin[]
  
  /** 启用内置插件 */
  enableBuiltinPlugin(name: string, config?: PluginConfig): void
  
  /** 禁用内置插件 */
  disableBuiltinPlugin(name: string): void
  
  /** 配置插件 */
  configurePlugin(name: string, config: PluginConfig): void
  
  /** 获取插件配置 */
  getPluginConfig(name: string): PluginConfig | undefined
  
  /** 搜索插件 */
  searchPlugins(query: string, page?: number, pageSize?: number): Promise<PluginSearchResult>
  
  /** 安装插件 */
  installPlugin(name: string, version?: string): Promise<PluginInstallResult>
  
  /** 卸载插件 */
  uninstallPlugin(name: string): Promise<boolean>
  
  /** 获取已安装插件 */
  getInstalledPlugins(): PluginInfo[]
  
  /** 生成 Vite 插件配置 */
  generateVitePlugins(): any[]
  
  /** 验证插件配置 */
  validateConfig(config: PluginEcosystemConfig): boolean
  
  /** 重置配置 */
  reset(): void
}

/**
 * 插件统计信息
 */
export interface PluginStats {
  /** 内置插件统计 */
  builtin: {
    /** 总数量 */
    total: number
    /** 已启用数量 */
    enabled: number
    /** 已禁用数量 */
    disabled: number
  }
  /** 外部插件统计 */
  external: {
    /** 已安装数量 */
    installed: number
    /** 可更新数量 */
    updatable: number
  }
  /** 使用统计 */
  usage: {
    /** 最常用插件 */
    mostUsed: string[]
    /** 最近使用插件 */
    recentlyUsed: string[]
  }
}

/**
 * 插件事件类型
 */
export type PluginEventType = 'plugin-enabled' | 'plugin-disabled' | 'plugin-installed' | 'plugin-uninstalled' | 'plugin-configured'

/**
 * 插件事件数据
 */
export interface PluginEventData {
  /** 事件类型 */
  type: PluginEventType
  /** 插件名称 */
  pluginName: string
  /** 插件配置 */
  config?: PluginConfig
  /** 时间戳 */
  timestamp: number
  /** 额外数据 */
  metadata?: Record<string, any>
}
