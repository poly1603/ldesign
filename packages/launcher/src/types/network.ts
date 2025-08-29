/**
 * 网络配置相关类型定义
 */

/**
 * 代理规则配置
 */
export interface ProxyRule {
  /** 目标地址 */
  target: string
  /** 是否改变源地址 */
  changeOrigin?: boolean
  /** 路径重写规则 */
  pathRewrite?: Record<string, string>
  /** 自定义请求头 */
  headers?: Record<string, string>
  /** 超时时间（毫秒） */
  timeout?: number
  /** 是否启用 WebSocket 代理 */
  ws?: boolean
  /** 是否启用安全连接 */
  secure?: boolean
  /** 日志级别 */
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent'
  /** 自定义配置函数 */
  configure?: (proxy: any, options: any) => void
  /** 代理事件回调 */
  onProxyReq?: (proxyReq: any, req: any, res: any) => void
  onProxyRes?: (proxyRes: any, req: any, res: any) => void
  onError?: (err: any, req: any, res: any) => void
}

/**
 * 代理配置
 */
export interface ProxyConfig {
  [pattern: string]: string | ProxyRule
}

/**
 * 路径别名配置
 */
export interface AliasConfig {
  [key: string]: string
}

/**
 * CORS 配置
 */
export interface CORSConfig {
  /** 允许的源 */
  origin?: string | string[] | boolean | ((origin: string) => boolean)
  /** 允许的方法 */
  methods?: string | string[]
  /** 允许的头部 */
  allowedHeaders?: string | string[]
  /** 暴露的头部 */
  exposedHeaders?: string | string[]
  /** 是否允许凭证 */
  credentials?: boolean
  /** 预检请求缓存时间 */
  maxAge?: number
  /** 是否启用预检请求 */
  preflightContinue?: boolean
  /** 预检请求成功状态码 */
  optionsSuccessStatus?: number
}

/**
 * 网络配置
 */
export interface NetworkConfig {
  /** 代理配置 */
  proxy?: ProxyConfig
  /** 路径别名配置 */
  alias?: AliasConfig
  /** CORS 配置 */
  cors?: CORSConfig
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
    /** 连接超时 */
    connect?: number
    /** 读取超时 */
    read?: number
    /** 写入超时 */
    write?: number
  }
}

/**
 * 代理中间件选项
 */
export interface ProxyMiddlewareOptions {
  /** 代理规则 */
  rules: ProxyConfig
  /** 默认配置 */
  defaults?: Partial<ProxyRule>
  /** 是否启用日志 */
  logging?: boolean
  /** 错误处理 */
  onError?: (error: Error, req: any, res: any) => void
}

/**
 * 别名解析选项
 */
export interface AliasResolveOptions {
  /** 别名映射 */
  aliases: AliasConfig
  /** 基础路径 */
  basePath?: string
  /** 是否区分大小写 */
  caseSensitive?: boolean
  /** 扩展名解析 */
  extensions?: string[]
}

/**
 * 网络管理器接口
 */
export interface INetworkManager {
  /** 配置代理 */
  configureProxy(config: ProxyConfig): void
  
  /** 添加代理规则 */
  addProxyRule(pattern: string, rule: string | ProxyRule): void
  
  /** 移除代理规则 */
  removeProxyRule(pattern: string): void
  
  /** 获取代理配置 */
  getProxyConfig(): ProxyConfig
  
  /** 配置别名 */
  configureAlias(aliases: AliasConfig): void
  
  /** 添加别名 */
  addAlias(key: string, path: string): void
  
  /** 移除别名 */
  removeAlias(key: string): void
  
  /** 解析别名路径 */
  resolveAlias(path: string): string
  
  /** 获取别名配置 */
  getAliasConfig(): AliasConfig
  
  /** 配置 CORS */
  configureCORS(config: CORSConfig): void
  
  /** 获取 CORS 配置 */
  getCORSConfig(): CORSConfig
  
  /** 生成 Vite 代理配置 */
  generateViteProxyConfig(): Record<string, any>
  
  /** 生成 Vite 别名配置 */
  generateViteAliasConfig(): Record<string, string>
  
  /** 验证网络配置 */
  validateConfig(config: NetworkConfig): boolean
  
  /** 重置配置 */
  reset(): void
}

/**
 * 代理规则匹配结果
 */
export interface ProxyMatchResult {
  /** 是否匹配 */
  matched: boolean
  /** 匹配的模式 */
  pattern?: string
  /** 匹配的规则 */
  rule?: ProxyRule
  /** 重写后的路径 */
  rewrittenPath?: string
}

/**
 * 别名解析结果
 */
export interface AliasResolveResult {
  /** 是否解析成功 */
  resolved: boolean
  /** 原始路径 */
  originalPath: string
  /** 解析后的路径 */
  resolvedPath: string
  /** 使用的别名 */
  alias?: string
}

/**
 * 网络配置验证结果
 */
export interface NetworkConfigValidation {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
}

/**
 * 代理事件类型
 */
export type ProxyEventType = 'request' | 'response' | 'error' | 'upgrade'

/**
 * 代理事件数据
 */
export interface ProxyEventData {
  /** 事件类型 */
  type: ProxyEventType
  /** 请求对象 */
  req?: any
  /** 响应对象 */
  res?: any
  /** 错误对象 */
  error?: Error
  /** 代理规则 */
  rule?: ProxyRule
  /** 时间戳 */
  timestamp: number
}

/**
 * 网络统计信息
 */
export interface NetworkStats {
  /** 代理请求统计 */
  proxy: {
    /** 总请求数 */
    totalRequests: number
    /** 成功请求数 */
    successRequests: number
    /** 失败请求数 */
    errorRequests: number
    /** 平均响应时间 */
    averageResponseTime: number
  }
  /** 别名解析统计 */
  alias: {
    /** 总解析次数 */
    totalResolves: number
    /** 成功解析次数 */
    successResolves: number
    /** 缓存命中次数 */
    cacheHits: number
  }
}
