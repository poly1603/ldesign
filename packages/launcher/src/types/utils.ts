/**
 * @fileoverview 工具函数类型定义
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import type { FrameworkType, ProjectType, PackageManager } from './core'

/**
 * 文件系统相关类型
 */

/** 文件信息接口 */
export interface FileInfo {
  /** 文件路径 */
  readonly path: string
  /** 文件名 */
  readonly name: string
  /** 文件扩展名 */
  readonly extension: string
  /** 文件大小（字节） */
  readonly size: number
  /** 是否为目录 */
  readonly isDirectory: boolean
  /** 是否为文件 */
  readonly isFile: boolean
  /** 创建时间 */
  readonly createdAt: Date
  /** 修改时间 */
  readonly modifiedAt: Date
  /** 访问时间 */
  readonly accessedAt: Date
}

/** 文件搜索选项接口 */
export interface FileSearchOptions {
  /** 搜索模式（glob pattern） */
  readonly pattern: string
  /** 是否递归搜索 */
  readonly recursive?: boolean
  /** 忽略的文件模式 */
  readonly ignore?: readonly string[]
  /** 最大搜索深度 */
  readonly maxDepth?: number
  /** 是否包含隐藏文件 */
  readonly includeHidden?: boolean
  /** 文件类型过滤 */
  readonly fileTypes?: readonly string[]
}

/** 文件操作选项接口 */
export interface FileOperationOptions {
  /** 是否创建父目录 */
  readonly createParentDirs?: boolean
  /** 文件编码 */
  readonly encoding?: BufferEncoding
  /** 文件权限 */
  readonly mode?: number
  /** 是否覆盖现有文件 */
  readonly overwrite?: boolean
}

/**
 * 包管理器相关类型
 */

/** 包依赖信息接口 */
export interface PackageDependency {
  /** 包名 */
  readonly name: string
  /** 版本号 */
  readonly version: string
  /** 依赖类型 */
  readonly type: 'dependency' | 'devDependency' | 'peerDependency' | 'optionalDependency'
  /** 是否为必需依赖 */
  readonly required: boolean
  /** 包描述 */
  readonly description?: string
  /** 包主页 */
  readonly homepage?: string
}

/** 包信息接口 */
export interface PackageInfo {
  /** 包名 */
  readonly name: string
  /** 版本号 */
  readonly version: string
  /** 包描述 */
  readonly description?: string
  /** 主要文件 */
  readonly main?: string
  /** 模块文件 */
  readonly module?: string
  /** 类型定义文件 */
  readonly types?: string
  /** 脚本命令 */
  readonly scripts: Readonly<Record<string, string>>
  /** 生产依赖 */
  readonly dependencies: Readonly<Record<string, string>>
  /** 开发依赖 */
  readonly devDependencies: Readonly<Record<string, string>>
  /** 同等依赖 */
  readonly peerDependencies: Readonly<Record<string, string>>
  /** 可选依赖 */
  readonly optionalDependencies: Readonly<Record<string, string>>
  /** 包关键词 */
  readonly keywords: readonly string[]
  /** 作者信息 */
  readonly author?: string
  /** 许可证 */
  readonly license?: string
  /** 代码仓库 */
  readonly repository?: string | object
  /** Bug 报告地址 */
  readonly bugs?: string | object
  /** 主页地址 */
  readonly homepage?: string
}

/**
 * 模板相关类型
 */

/** 模板变量接口 */
export interface TemplateVariables {
  /** 项目名称 */
  readonly projectName: string
  /** 项目类型 */
  readonly projectType: ProjectType
  /** 框架类型 */
  readonly framework: FrameworkType
  /** 是否使用 TypeScript */
  readonly useTypeScript: boolean
  /** 包管理器 */
  readonly packageManager: PackageManager
  /** 作者信息 */
  readonly author?: string
  /** 项目描述 */
  readonly description?: string
  /** 额外变量 */
  readonly [key: string]: unknown
}

/** 模板文件接口 */
export interface TemplateFile {
  /** 文件路径 */
  readonly path: string
  /** 文件内容 */
  readonly content: string
  /** 是否为二进制文件 */
  readonly isBinary: boolean
  /** 文件权限 */
  readonly mode?: number
}

/** 模板配置接口 */
export interface TemplateConfig {
  /** 模板名称 */
  readonly name: string
  /** 模板描述 */
  readonly description: string
  /** 适用的框架类型 */
  readonly frameworks: readonly FrameworkType[]
  /** 模板版本 */
  readonly version: string
  /** 模板文件列表 */
  readonly files: readonly TemplateFile[]
  /** 模板变量定义 */
  readonly variables: Readonly<Record<string, string>>
  /** 安装后的钩子脚本 */
  readonly postInstall?: readonly string[]
}

/**
 * 网络相关类型
 */

/** HTTP 请求选项接口 */
export interface HttpRequestOptions {
  /** 请求方法 */
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  /** 请求头 */
  readonly headers?: Readonly<Record<string, string>>
  /** 请求体 */
  readonly body?: string | Buffer | object
  /** 请求超时时间（毫秒） */
  readonly timeout?: number
  /** 是否跟随重定向 */
  readonly followRedirects?: boolean
  /** 最大重定向次数 */
  readonly maxRedirects?: number
}

/** 下载选项接口 */
export interface DownloadOptions extends HttpRequestOptions {
  /** 保存路径 */
  readonly savePath: string
  /** 进度回调函数 */
  readonly onProgress?: (downloaded: number, total: number) => void
  /** 是否覆盖现有文件 */
  readonly overwrite?: boolean
}

/**
 * 验证相关类型
 */

/** 验证规则接口 */
export interface ValidationRule<T = unknown> {
  /** 规则名称 */
  readonly name: string
  /** 验证函数 */
  readonly validate: (value: T) => boolean | Promise<boolean>
  /** 错误消息 */
  readonly message: string
  /** 是否为必需验证 */
  readonly required?: boolean
}

/** 验证结果接口 */
export interface ValidationResult {
  /** 验证是否通过 */
  readonly isValid: boolean
  /** 错误消息列表 */
  readonly errors: readonly string[]
  /** 警告消息列表 */
  readonly warnings: readonly string[]
  /** 验证的字段名 */
  readonly field?: string
}

/** 表单验证配置接口 */
export interface FormValidationConfig {
  /** 字段验证规则 */
  readonly rules: Readonly<Record<string, readonly ValidationRule[]>>
  /** 是否立即验证 */
  readonly immediate?: boolean
  /** 是否在首次失败后停止验证 */
  readonly stopOnFirstFailure?: boolean
}

/**
 * 缓存相关类型
 */

/** 缓存选项接口 */
export interface CacheOptions {
  /** 缓存键 */
  readonly key: string
  /** 过期时间（毫秒） */
  readonly ttl?: number
  /** 最大缓存大小 */
  readonly maxSize?: number
  /** 是否持久化 */
  readonly persistent?: boolean
}

/** 缓存项接口 */
export interface CacheItem<T = unknown> {
  /** 缓存键 */
  readonly key: string
  /** 缓存值 */
  readonly value: T
  /** 创建时间 */
  readonly createdAt: Date
  /** 过期时间 */
  readonly expiresAt?: Date
  /** 访问次数 */
  readonly accessCount: number
  /** 最后访问时间 */
  readonly lastAccessedAt: Date
}

/**
 * 事件相关类型
 */

/** 事件监听器函数类型 */
export type EventListener<T = unknown> = (event: T) => void | Promise<void>

/** 事件配置接口 */
export interface EventConfig {
  /** 是否只触发一次 */
  readonly once?: boolean
  /** 事件优先级 */
  readonly priority?: number
  /** 事件命名空间 */
  readonly namespace?: string
}

/** 事件发射器接口 */
export interface IEventEmitter<T = Record<string, unknown>> {
  /** 监听事件 */
  on<K extends keyof T>(event: K, listener: EventListener<T[K]>, config?: EventConfig): void
  /** 监听事件（仅一次） */
  once<K extends keyof T>(event: K, listener: EventListener<T[K]>): void
  /** 移除事件监听器 */
  off<K extends keyof T>(event: K, listener: EventListener<T[K]>): void
  /** 发射事件 */
  emit<K extends keyof T>(event: K, data: T[K]): void
  /** 移除所有监听器 */
  removeAllListeners<K extends keyof T>(event?: K): void
}

/**
 * 工具函数类型
 */

/** 深拷贝函数类型 */
export type DeepClone = <T>(obj: T) => T

/** 防抖函数类型 */
export type Debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
) => (...args: Parameters<T>) => void

/** 节流函数类型 */
export type Throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
) => (...args: Parameters<T>) => void

/** 重试函数类型 */
export type Retry = <T>(
  func: () => Promise<T>,
  maxAttempts: number,
  delay?: number
) => Promise<T>

/** 格式化字节大小函数类型 */
export type FormatBytes = (bytes: number, decimals?: number) => string

/** 随机字符串生成函数类型 */
export type GenerateRandomString = (length: number, charset?: string) => string