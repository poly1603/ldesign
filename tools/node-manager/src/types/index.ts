/**
 * Node 版本管理器类型定义
 * @module types
 */

/**
 * 管理器类型枚举
 */
export enum ManagerType {
  /** Node Version Manager (Unix/Linux/macOS) */
  NVM = 'nvm',
  /** NVM for Windows */
  NVM_WINDOWS = 'nvm-windows',
  /** Fast Node Manager */
  FNM = 'fnm',
  /** Volta - JavaScript Tool Manager */
  VOLTA = 'volta',
  /** LDesign 自研管理器 */
  LDESIGN = 'ldesign',
}

/**
 * Node.js 版本信息
 */
export interface NodeVersion {
  /** 版本号 (例如: "20.10.0") */
  version: string
  /** 是否已安装 */
  installed: boolean
  /** 是否为当前激活版本 */
  active: boolean
  /** LTS 代号 (例如: "Iron", "Hydrogen") */
  lts?: string | false
  /** 发布日期 */
  date?: string
  /** npm 版本 */
  npm?: string
  /** V8 引擎版本 */
  v8?: string
}

/**
 * 操作结果基础接口
 */
export interface OperationResult {
  /** 操作是否成功 */
  success: boolean
  /** 结果消息 */
  message: string
}

/**
 * 安装结果
 */
export interface InstallResult extends OperationResult {
  /** 安装的版本号 */
  version?: string
  /** 安装路径 */
  path?: string
}

/**
 * 切换结本结果
 */
export interface SwitchResult extends OperationResult {
  /** 切换前的版本 */
  from?: string
  /** 切换后的版本 */
  to?: string
}

/**
 * 删除结果
 */
export interface RemoveResult extends OperationResult {
  /** 删除的版本号 */
  version?: string
  /** 释放的磁盘空间（字节） */
  freedSpace?: number
}

/**
 * 下载进度信息
 */
export interface DownloadProgress {
  /** 已下载字节数 */
  downloaded: number
  /** 总字节数 */
  total: number
  /** 下载百分比 (0-100) */
  percent: number
  /** 下载速度 (字节/秒) */
  speed: number
}

/**
 * 镜像源配置
 */
export interface MirrorConfig {
  /** 镜像源名称 */
  name: string
  /** 镜像源 URL */
  url: string
  /** 是否为默认镜像 */
  isDefault?: boolean
}

/**
 * 预定义镜像源
 */
export const Mirrors = {
  /** 官方镜像 */
  OFFICIAL: {
    name: 'Official',
    url: 'https://nodejs.org/dist/',
    isDefault: true,
  } as MirrorConfig,
  /** 淘宝镜像 */
  TAOBAO: {
    name: 'Taobao',
    url: 'https://npmmirror.com/mirrors/node/',
  } as MirrorConfig,
  /** 腾讯云镜像 */
  TENCENT: {
    name: 'Tencent Cloud',
    url: 'https://mirrors.cloud.tencent.com/nodejs-release/',
  } as MirrorConfig,
}

/**
 * 管理器配置选项
 */
export interface ManagerOptions {
  /** 安装目录 */
  installDir?: string
  /** 镜像源配置 */
  mirror?: string | MirrorConfig
  /** 是否启用调试模式 */
  debug?: boolean
  /** 超时时间（毫秒） */
  timeout?: number
  /** 下载进度回调 */
  onProgress?: (progress: DownloadProgress) => void
}

/**
 * 管理器信息
 */
export interface ManagerInfo {
  /** 管理器类型 */
  type: ManagerType
  /** 管理器名称 */
  name: string
  /** 是否已安装 */
  installed: boolean
  /** 版本号 */
  version?: string
  /** 安装路径 */
  path?: string
}

/**
 * 平台类型
 */
export type Platform = 'win32' | 'darwin' | 'linux' | 'sunos' | 'aix' | 'freebsd' | 'openbsd'

/**
 * CPU 架构类型
 */
export type Architecture = 'x64' | 'x86' | 'arm64' | 'arm' | 'ppc64' | 's390x'

/**
 * Node.js 发布信息（来自官方 API）
 */
export interface NodeRelease {
  version: string
  date: string
  files: string[]
  npm?: string
  v8?: string
  uv?: string
  zlib?: string
  openssl?: string
  modules?: string
  lts: string | false
  security: boolean
}

/**
 * 错误类型
 */
export class NodeManagerError extends Error {
  constructor(
    message: string,
    public code?: string,
    public cause?: Error,
  ) {
    super(message)
    this.name = 'NodeManagerError'
  }
}

/**
 * 版本不存在错误
 */
export class VersionNotFoundError extends NodeManagerError {
  constructor(version: string) {
    super(`版本 ${version} 不存在`, 'VERSION_NOT_FOUND')
    this.name = 'VersionNotFoundError'
  }
}

/**
 * 版本已安装错误
 */
export class VersionAlreadyInstalledError extends NodeManagerError {
  constructor(version: string) {
    super(`版本 ${version} 已经安装`, 'VERSION_ALREADY_INSTALLED')
    this.name = 'VersionAlreadyInstalledError'
  }
}

/**
 * 管理器未安装错误
 */
export class ManagerNotInstalledError extends NodeManagerError {
  constructor(managerType: ManagerType) {
    super(`管理器 ${managerType} 未安装`, 'MANAGER_NOT_INSTALLED')
    this.name = 'ManagerNotInstalledError'
  }
}

/**
 * 下载失败错误
 */
export class DownloadError extends NodeManagerError {
  constructor(message: string, cause?: Error) {
    super(`下载失败: ${message}`, 'DOWNLOAD_ERROR', cause)
    this.name = 'DownloadError'
  }
}

/**
 * 安装失败错误
 */
export class InstallError extends NodeManagerError {
  constructor(message: string, cause?: Error) {
    super(`安装失败: ${message}`, 'INSTALL_ERROR', cause)
    this.name = 'InstallError'
  }
}


