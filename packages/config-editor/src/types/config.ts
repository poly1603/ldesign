/**
 * 配置相关类型定义
 * 
 * 定义各种配置文件的类型和接口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { ConfigFieldDefinition, FilePath } from './common'

/**
 * Launcher 配置接口
 * 基于 @ldesign/launcher 的配置结构
 */
export interface LauncherConfig {
  /** 项目名称 */
  projectName?: string
  /** 框架类型 */
  framework?: 'vue' | 'react' | 'lit' | 'vanilla'
  
  /** 服务器配置 */
  server?: {
    /** 端口号 */
    port?: number
    /** 主机地址 */
    host?: string
    /** 是否自动打开浏览器 */
    open?: boolean
    /** HTTPS 配置 */
    https?: boolean | {
      key: string
      cert: string
    }
    /** 代理配置 */
    proxy?: Record<string, string | ProxyOptions>
  }
  
  /** 构建配置 */
  build?: {
    /** 输出目录 */
    outDir?: string
    /** 是否生成 sourcemap */
    sourcemap?: boolean
    /** 压缩选项 */
    minify?: boolean | 'terser' | 'esbuild'
    /** 构建目标 */
    target?: string | string[]
    /** 是否清空输出目录 */
    emptyOutDir?: boolean
  }
  
  /** 插件配置 */
  plugins?: any[]
  
  /** 路径解析配置 */
  resolve?: {
    /** 别名配置 */
    alias?: Record<string, string>
    /** 扩展名 */
    extensions?: string[]
  }
  
  /** CSS 配置 */
  css?: {
    /** 预处理器选项 */
    preprocessorOptions?: {
      less?: any
      scss?: any
      sass?: any
      stylus?: any
    }
  }
  
  /** 环境变量 */
  define?: Record<string, any>
  
  /** Launcher 特有配置 */
  launcher?: {
    /** 日志级别 */
    logLevel?: 'debug' | 'info' | 'warn' | 'error'
    /** 运行模式 */
    mode?: 'development' | 'production' | 'test'
    /** 是否启用自动重启 */
    autoRestart?: boolean
    /** 是否启用调试模式 */
    debug?: boolean
  }
}

/**
 * 代理选项接口
 */
export interface ProxyOptions {
  /** 目标地址 */
  target: string
  /** 是否改变源 */
  changeOrigin?: boolean
  /** 是否重写路径 */
  rewrite?: (path: string) => string
  /** 是否启用 WebSocket */
  ws?: boolean
  /** 是否验证 SSL */
  secure?: boolean
}

/**
 * App 配置接口
 * 基于应用程序的配置结构
 */
export interface AppConfig {
  /** 应用名称 */
  appName: string
  /** 应用版本 */
  version: string
  /** 应用描述 */
  description?: string
  /** 应用作者 */
  author?: string
  /** 应用许可证 */
  license?: string
  /** 应用主页 */
  homepage?: string
  /** 应用仓库 */
  repository?: string
  /** 应用关键词 */
  keywords?: string[]
  
  /** API 配置 */
  api?: {
    /** 基础 URL */
    baseUrl: string
    /** 超时时间 */
    timeout?: number
    /** 是否启用重试 */
    retry?: boolean
    /** 重试次数 */
    retryCount?: number
    /** 是否启用缓存 */
    cache?: boolean
    /** 缓存时间 */
    cacheTime?: number
  }
  
  /** 主题配置 */
  theme?: {
    /** 主色调 */
    primaryColor?: string
    /** 边框圆角 */
    borderRadius?: string
    /** 字体大小 */
    fontSize?: string
    /** 字体族 */
    fontFamily?: string
    /** 是否启用暗色模式 */
    darkMode?: boolean
  }
  
  /** 功能特性配置 */
  features?: {
    /** 是否启用开发工具 */
    devTools?: boolean
    /** 是否启用模拟数据 */
    mock?: boolean
    /** 是否启用热重载 */
    hotReload?: boolean
    /** 是否启用错误边界 */
    errorBoundary?: boolean
    /** 是否启用性能监控 */
    performance?: boolean
    /** 是否启用分析统计 */
    analytics?: boolean
    /** 是否启用 PWA */
    pwa?: boolean
    /** 是否启用离线模式 */
    offline?: boolean
  }
  
  /** 国际化配置 */
  i18n?: {
    /** 默认语言 */
    defaultLocale: string
    /** 支持的语言列表 */
    locales: string[]
    /** 是否自动检测语言 */
    autoDetect?: boolean
    /** 回退语言 */
    fallbackLocale?: string
    /** 加载策略 */
    loadStrategy?: 'eager' | 'lazy'
  }
  
  /** 路由配置 */
  router?: {
    /** 路由模式 */
    mode: 'hash' | 'history'
    /** 基础路径 */
    base?: string
    /** 是否严格模式 */
    strict?: boolean
    /** 是否大小写敏感 */
    sensitive?: boolean
    /** 滚动行为 */
    scrollBehavior?: 'auto' | 'smooth' | 'instant'
  }
  
  /** 构建配置 */
  build?: {
    /** 输出目录 */
    outDir?: string
    /** 公共路径 */
    publicPath?: string
    /** 是否生成 sourcemap */
    sourcemap?: boolean
    /** 压缩选项 */
    minify?: boolean
    /** 是否分析包大小 */
    analyze?: boolean
  }
  
  /** 安全配置 */
  security?: {
    /** CSP 策略 */
    csp?: string
    /** 是否启用 HTTPS */
    https?: boolean
    /** 是否启用 HSTS */
    hsts?: boolean
  }
  
  /** 日志配置 */
  log?: {
    /** 日志级别 */
    level: 'debug' | 'info' | 'warn' | 'error'
    /** 是否启用控制台输出 */
    console?: boolean
    /** 是否启用文件输出 */
    file?: boolean
    /** 日志文件路径 */
    filePath?: string
  }
  
  /** 自定义配置 */
  [key: string]: any
}

/**
 * Package.json 配置接口
 */
export interface PackageJsonConfig {
  /** 包名 */
  name: string
  /** 版本 */
  version: string
  /** 描述 */
  description?: string
  /** 主入口文件 */
  main?: string
  /** 模块入口文件 */
  module?: string
  /** 类型定义文件 */
  types?: string
  /** 导出配置 */
  exports?: Record<string, any>
  /** 脚本配置 */
  scripts?: Record<string, string>
  /** 生产依赖 */
  dependencies?: Record<string, string>
  /** 开发依赖 */
  devDependencies?: Record<string, string>
  /** 同级依赖 */
  peerDependencies?: Record<string, string>
  /** 可选依赖 */
  optionalDependencies?: Record<string, string>
  /** 关键词 */
  keywords?: string[]
  /** 作者 */
  author?: string | {
    name: string
    email?: string
    url?: string
  }
  /** 许可证 */
  license?: string
  /** 仓库信息 */
  repository?: string | {
    type: string
    url: string
    directory?: string
  }
  /** 主页 */
  homepage?: string
  /** 问题反馈 */
  bugs?: string | {
    url?: string
    email?: string
  }
  /** 发布文件 */
  files?: string[]
  /** 二进制文件 */
  bin?: string | Record<string, string>
  /** 引擎要求 */
  engines?: Record<string, string>
  /** 包管理器 */
  packageManager?: string
  /** 是否私有 */
  private?: boolean
  /** 工作空间 */
  workspaces?: string[]
}

/**
 * 配置模式定义
 */
export interface ConfigSchema {
  /** 配置类型 */
  type: 'launcher' | 'app' | 'package'
  /** 配置标题 */
  title: string
  /** 配置描述 */
  description: string
  /** 字段定义列表 */
  fields: ConfigFieldDefinition[]
  /** 分组定义 */
  groups?: ConfigGroup[]
}

/**
 * 配置分组接口
 */
export interface ConfigGroup {
  /** 分组键名 */
  key: string
  /** 分组标题 */
  title: string
  /** 分组描述 */
  description?: string
  /** 分组字段列表 */
  fields: string[]
  /** 是否可折叠 */
  collapsible?: boolean
  /** 默认是否展开 */
  defaultExpanded?: boolean
}
