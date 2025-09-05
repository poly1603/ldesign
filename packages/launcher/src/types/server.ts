/**
 * 服务器相关类型定义
 * 
 * 定义开发服务器和预览服务器的相关类型
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { ViteDevServer, PreviewServer } from 'vite'
import type { Host, Port, AsyncResult } from './common'
import type { ViteLauncherConfig } from './config'

/**
 * 服务器类型枚举
 * 定义服务器的类型
 */
export enum ServerType {
  /** 开发服务器 */
  DEV = 'dev',
  /** 预览服务器 */
  PREVIEW = 'preview'
}

/**
 * 服务器状态枚举
 * 定义服务器的运行状态
 */
export enum ServerStatus {
  /** 未启动 */
  IDLE = 'idle',
  /** 正在启动 */
  STARTING = 'starting',
  /** 运行中 */
  RUNNING = 'running',
  /** 正在重启 */
  RESTARTING = 'restarting',
  /** 正在停止 */
  STOPPING = 'stopping',
  /** 已停止 */
  STOPPED = 'stopped',
  /** 错误状态 */
  ERROR = 'error'
}

/**
 * 服务器配置接口
 * 定义服务器的配置选项
 */
export interface ServerConfig {
  /** 服务器类型 */
  type: ServerType
  
  /** 主机地址 */
  host?: Host
  
  /** 端口号 */
  port?: Port
  
  /** 是否自动打开浏览器 */
  open?: boolean | string
  
  /** 是否启用 HTTPS */
  https?: boolean
  
  /** SSL 证书配置 */
  ssl?: SSLConfig
  
  /** 代理配置 */
  proxy?: ProxyConfig
  
  /** CORS 配置 */
  cors?: CorsConfig
  
  /** 中间件配置 */
  middlewares?: MiddlewareConfig[]
  
  /** 静态文件配置 */
  static?: StaticConfig
  
  /** 压缩配置 */
  compression?: CompressionConfig
  
  /** 缓存配置 */
  cache?: CacheConfig
}

/**
 * SSL 配置接口
 * 定义 HTTPS 服务器的 SSL 配置
 */
export interface SSLConfig {
  /** 证书文件路径 */
  cert?: string
  
  /** 私钥文件路径 */
  key?: string
  
  /** CA 证书文件路径 */
  ca?: string
  
  /** 密码短语 */
  passphrase?: string
  
  /** 是否拒绝未授权的连接 */
  rejectUnauthorized?: boolean
}

/**
 * 代理配置接口
 * 定义代理服务器的配置
 */
export interface ProxyConfig {
  /** 代理规则映射 */
  [path: string]: ProxyRule
}

/**
 * 代理规则接口
 * 定义单个代理规则的配置
 */
export interface ProxyRule {
  /** 目标地址 */
  target: string
  
  /** 是否改变源 */
  changeOrigin?: boolean
  
  /** 是否重写路径 */
  rewrite?: (path: string) => string
  
  /** 是否启用 WebSocket 代理 */
  ws?: boolean
  
  /** 是否启用安全模式 */
  secure?: boolean
  
  /** 自定义请求头 */
  headers?: Record<string, string>
  
  /** 超时时间 */
  timeout?: number
}

/**
 * CORS 配置接口
 * 定义跨域资源共享的配置
 */
export interface CorsConfig {
  /** 允许的源 */
  origin?: string | string[] | boolean
  
  /** 允许的方法 */
  methods?: string[]
  
  /** 允许的请求头 */
  allowedHeaders?: string[]
  
  /** 暴露的响应头 */
  exposedHeaders?: string[]
  
  /** 是否允许凭证 */
  credentials?: boolean
  
  /** 预检请求的缓存时间 */
  maxAge?: number
}

/**
 * 中间件配置接口
 * 定义服务器中间件的配置
 */
export interface MiddlewareConfig {
  /** 中间件名称 */
  name: string
  
  /** 中间件函数 */
  handler: (req: any, res: any, next: any) => void
  
  /** 应用路径 */
  path?: string
  
  /** 中间件选项 */
  options?: Record<string, any>
  
  /** 中间件优先级 */
  priority?: number
}

/**
 * 静态文件配置接口
 * 定义静态文件服务的配置
 */
export interface StaticConfig {
  /** 静态文件目录 */
  dir: string
  
  /** 访问路径前缀 */
  prefix?: string
  
  /** 是否启用目录浏览 */
  index?: boolean
  
  /** 默认文件名 */
  indexFile?: string
  
  /** 缓存配置 */
  cache?: {
    maxAge?: number
    etag?: boolean
    lastModified?: boolean
  }
}

/**
 * 压缩配置接口
 * 定义响应压缩的配置
 */
export interface CompressionConfig {
  /** 是否启用压缩 */
  enabled?: boolean
  
  /** 压缩算法 */
  algorithm?: 'gzip' | 'deflate' | 'br'
  
  /** 压缩级别 */
  level?: number
  
  /** 最小压缩大小 */
  threshold?: number
  
  /** 压缩的 MIME 类型 */
  mimeTypes?: string[]
}

/**
 * 缓存配置接口
 * 定义服务器缓存的配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean
  
  /** 缓存策略 */
  strategy?: 'memory' | 'disk' | 'redis'
  
  /** 缓存过期时间 */
  ttl?: number
  
  /** 最大缓存大小 */
  maxSize?: number
  
  /** 缓存键前缀 */
  keyPrefix?: string
}

/**
 * 服务器信息接口
 * 定义服务器的运行时信息
 */
export interface ServerInfo {
  /** 服务器类型 */
  type: ServerType
  
  /** 服务器状态 */
  status: ServerStatus
  
  /** 服务器实例 */
  instance: ViteDevServer | PreviewServer | null
  
  /** 服务器配置 */
  config: ServerConfig
  
  /** 访问 URL */
  url?: string
  
  /** 网络 URL */
  networkUrl?: string
  
  /** 主机地址 */
  host: Host
  
  /** 端口号 */
  port: Port
  
  /** 是否启用 HTTPS */
  https: boolean
  
  /** 启动时间 */
  startTime?: number
  
  /** 运行时长 */
  uptime?: number
  
  /** 错误信息 */
  error?: Error
}

/**
 * 服务器事件类型枚举
 * 定义服务器相关的事件类型
 */
export enum ServerEvent {
  /** 服务器启动事件 */
  SERVER_START = 'serverStart',
  /** 服务器停止事件 */
  SERVER_STOP = 'serverStop',
  /** 服务器重启事件 */
  SERVER_RESTART = 'serverRestart',
  /** 服务器就绪事件 */
  SERVER_READY = 'serverReady',
  /** 服务器错误事件 */
  SERVER_ERROR = 'serverError',
  /** 请求事件 */
  REQUEST = 'request',
  /** 响应事件 */
  RESPONSE = 'response'
}

/**
 * 服务器事件数据接口
 * 定义服务器事件携带的数据
 */
export interface ServerEventData {
  [ServerEvent.SERVER_START]: {
    type: ServerType
    config: ServerConfig
    timestamp: number
  }
  
  [ServerEvent.SERVER_STOP]: {
    type: ServerType
    uptime: number
    timestamp: number
  }
  
  [ServerEvent.SERVER_RESTART]: {
    type: ServerType
    reason?: string
    timestamp: number
  }
  
  [ServerEvent.SERVER_READY]: {
    type: ServerType
    url: string
    networkUrl?: string
    startupTime: number
    timestamp: number
  }
  
  [ServerEvent.SERVER_ERROR]: {
    type: ServerType
    error: Error
    timestamp: number
  }
  
  [ServerEvent.REQUEST]: {
    method: string
    url: string
    headers: Record<string, string>
    timestamp: number
  }
  
  [ServerEvent.RESPONSE]: {
    statusCode: number
    headers: Record<string, string>
    responseTime: number
    timestamp: number
  }
}

/**
 * 服务器管理器接口
 * 定义服务器管理器的功能
 */
export interface IServerManager {
  /** 启动开发服务器 */
  startDev(config?: ViteLauncherConfig): Promise<AsyncResult<ViteDevServer>>
  
  /** 启动预览服务器 */
  startPreview(config?: ViteLauncherConfig): Promise<AsyncResult<PreviewServer>>
  
  /** 停止服务器 */
  stop(type?: ServerType): Promise<AsyncResult>
  
  /** 重启服务器 */
  restart(type?: ServerType): Promise<AsyncResult>
  
  /** 获取服务器信息 */
  getServerInfo(type: ServerType): ServerInfo | null
  
  /** 获取所有服务器信息 */
  getAllServerInfo(): ServerInfo[]
  
  /** 检查端口是否可用 */
  isPortAvailable(port: Port, host?: Host): Promise<boolean>
  
  /** 查找可用端口 */
  findAvailablePort(startPort: Port, host?: Host): Promise<Port>
  
  /** 验证服务器配置 */
  validateConfig(config: ServerConfig): AsyncResult
}

/**
 * 服务器统计信息接口
 * 定义服务器的统计数据
 */
export interface ServerStats {
  /** 请求总数 */
  totalRequests: number
  
  /** 成功请求数 */
  successRequests: number
  
  /** 错误请求数 */
  errorRequests: number
  
  /** 平均响应时间 */
  averageResponseTime: number
  
  /** 最大响应时间 */
  maxResponseTime: number
  
  /** 最小响应时间 */
  minResponseTime: number
  
  /** 数据传输量 */
  bytesTransferred: number
  
  /** 活跃连接数 */
  activeConnections: number
  
  /** 启动次数 */
  startCount: number
  
  /** 总运行时间 */
  totalUptime: number
}
