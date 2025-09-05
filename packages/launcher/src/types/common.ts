/**
 * 通用类型定义
 * 
 * 定义在整个 launcher 包中使用的通用类型和接口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 日志级别枚举
 * 用于控制日志输出的详细程度
 */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug'

/**
 * 运行模式枚举
 * 定义应用程序的运行环境
 */
export type Mode = 'development' | 'production' | 'test'

/**
 * 验证结果接口
 * 用于配置验证和其他验证操作的结果
 */
export interface ValidationResult {
  /** 验证是否通过 */
  valid: boolean
  /** 错误信息列表 */
  errors: string[]
  /** 警告信息列表 */
  warnings: string[]
}

/**
 * 异步操作结果接口
 * 用于包装异步操作的结果
 */
export interface AsyncResult<T = any> {
  /** 操作是否成功 */
  success: boolean
  /** 返回的数据 */
  data?: T
  /** 错误信息 */
  error?: string
  /** 错误详情 */
  details?: any
}

/**
 * 生命周期钩子函数类型
 * 用于定义各种生命周期事件的回调函数
 */
export type LifecycleHook = () => void | Promise<void>

/**
 * 错误处理回调函数类型
 * 用于处理错误事件的回调函数
 */
export type ErrorHandler = (error: Error) => void | Promise<void>

/**
 * 事件监听器类型
 * 用于定义事件监听器的函数签名
 */
export type EventListener<T = any> = (data: T) => void | Promise<void>

/**
 * 键值对映射类型
 * 用于定义通用的键值对结构
 */
export type KeyValueMap<T = any> = Record<string, T>

/**
 * 可选的深度部分类型
 * 递归地将对象的所有属性设为可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 必需的深度类型
 * 递归地将对象的所有属性设为必需
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

/**
 * 文件路径类型
 * 用于表示文件系统路径
 */
export type FilePath = string

/**
 * URL 类型
 * 用于表示网络地址
 */
export type URL = string

/**
 * 端口号类型
 * 用于表示网络端口
 */
export type Port = number

/**
 * 主机地址类型
 * 用于表示主机名或 IP 地址
 */
export type Host = string

/**
 * 时间戳类型
 * 用于表示时间戳（毫秒）
 */
export type Timestamp = number

/**
 * 版本号类型
 * 用于表示语义化版本号
 */
export type Version = string
