/**
 * 服务器相关类型定义
 * 
 * 定义 Express 服务器和 API 的类型和接口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Request, Response } from 'express'
import type { FilePath, OperationResult } from './common'
import type { LauncherConfig, AppConfig, PackageJsonConfig } from './config'

/**
 * 服务器配置接口
 */
export interface ServerConfig {
  /** 服务器端口 */
  port: number
  /** 服务器主机 */
  host: string
  /** 客户端端口 */
  clientPort?: number
  /** 工作目录 */
  cwd?: FilePath
  /** 是否启用 CORS */
  cors?: boolean
  /** 静态文件目录 */
  staticDir?: FilePath
  /** 上传文件大小限制 */
  uploadLimit?: string
  /** 是否启用日志 */
  enableLogging?: boolean
}

/**
 * API 响应接口
 */
export interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean
  /** 响应数据 */
  data?: T
  /** 错误消息 */
  message?: string
  /** 错误详情 */
  error?: any
  /** 时间戳 */
  timestamp: number
}

/**
 * 配置文件信息接口
 */
export interface ConfigFileInfo {
  /** 文件类型 */
  type: 'launcher' | 'app' | 'package'
  /** 文件路径 */
  path: FilePath
  /** 文件名 */
  name: string
  /** 是否存在 */
  exists: boolean
  /** 文件大小 */
  size: number
  /** 最后修改时间 */
  lastModified: Date
  /** 是否可读 */
  readable: boolean
  /** 是否可写 */
  writable: boolean
}

/**
 * 配置文件列表响应
 */
export interface ConfigFileListResponse {
  /** 配置文件列表 */
  files: ConfigFileInfo[]
  /** 工作目录 */
  cwd: FilePath
  /** 总数量 */
  total: number
}

/**
 * 配置保存请求
 */
export interface ConfigSaveRequest {
  /** 文件类型 */
  type: 'launcher' | 'app' | 'package'
  /** 文件路径 */
  path: FilePath
  /** 配置内容 */
  config: LauncherConfig | AppConfig | PackageJsonConfig
  /** 是否备份 */
  backup?: boolean
}

/**
 * 配置加载响应
 */
export interface ConfigLoadResponse<T = any> {
  /** 配置内容 */
  config: T
  /** 文件信息 */
  fileInfo: ConfigFileInfo
  /** 模式定义 */
  schema?: any
}

/**
 * 文件上传请求
 */
export interface FileUploadRequest extends Request {
  /** 上传的文件 */
  file?: Express.Multer.File
  /** 上传的多个文件 */
  files?: Express.Multer.File[]
}

/**
 * 文件下载响应
 */
export interface FileDownloadResponse extends Response {
  /** 下载文件 */
  download(path: FilePath, filename?: string): void
}

/**
 * WebSocket 消息接口
 */
export interface WebSocketMessage {
  /** 消息类型 */
  type: 'config-change' | 'file-change' | 'error' | 'ping' | 'pong'
  /** 消息数据 */
  data?: any
  /** 时间戳 */
  timestamp: number
  /** 消息 ID */
  id?: string
}

/**
 * 配置更改通知
 */
export interface ConfigChangeNotification {
  /** 文件类型 */
  type: 'launcher' | 'app' | 'package'
  /** 文件路径 */
  path: FilePath
  /** 更改类型 */
  changeType: 'created' | 'modified' | 'deleted'
  /** 更改内容 */
  changes?: any
  /** 时间戳 */
  timestamp: number
}

/**
 * 文件监听选项
 */
export interface FileWatchOptions {
  /** 是否监听子目录 */
  recursive?: boolean
  /** 忽略的文件模式 */
  ignored?: string | RegExp | (string | RegExp)[]
  /** 防抖延迟（毫秒） */
  debounceDelay?: number
  /** 是否启用轮询 */
  usePolling?: boolean
  /** 轮询间隔（毫秒） */
  interval?: number
}

/**
 * 服务器事件接口
 */
export interface ServerEvents {
  /** 服务器启动事件 */
  'server:start': (config: ServerConfig) => void
  /** 服务器停止事件 */
  'server:stop': () => void
  /** 配置文件更改事件 */
  'config:change': (notification: ConfigChangeNotification) => void
  /** 文件上传事件 */
  'file:upload': (file: Express.Multer.File) => void
  /** 错误事件 */
  'error': (error: Error) => void
}

/**
 * 中间件选项接口
 */
export interface MiddlewareOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 中间件配置 */
  options?: any
}

/**
 * 路由处理器类型
 */
export type RouteHandler = (req: Request, res: Response) => Promise<void> | void

/**
 * API 路由定义
 */
export interface ApiRoute {
  /** HTTP 方法 */
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  /** 路由路径 */
  path: string
  /** 路由处理器 */
  handler: RouteHandler
  /** 中间件列表 */
  middlewares?: any[]
  /** 路由描述 */
  description?: string
}
