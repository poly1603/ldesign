/**
 * @ldesign/node-manager
 * 
 * 功能强大的 Node.js 版本管理工具
 * 封装 nvm/fnm/volta + 自研版本管理器
 * 
 * @packageDocumentation
 */

// 导出类型
export * from './types'

// 导出核心模块
export type { INodeManager } from './core/base-manager'
export { BaseNodeManager } from './core/base-manager'
export { VersionDetector } from './core/version-detector'
export { NodeManagerFactory } from './core/factory'

// 导出管理器实现
export { FnmManager } from './managers/fnm-manager'
export { NvmWindowsManager } from './managers/nvm-windows-manager'
export { VoltaManager } from './managers/volta-manager'
export { LDesignManager } from './managers/ldesign-manager'

// 导出工具类
export { NodeDownloader } from './downloaders/node-downloader'
export { VersionRegistry } from './registry/version-registry'
export { ExecHelper } from './utils/exec-helper'
export { PathHelper } from './utils/path-helper'

// 版本信息
export const VERSION = '1.0.0'


