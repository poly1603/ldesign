/**
 * 插件系统类型定义
 */

/**
 * 插件状态
 */
export type PluginStatus = 'installed' | 'active' | 'inactive' | 'error'

/**
 * 插件元数据
 */
export interface PluginMetadata {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  homepage?: string
  keywords?: string[]
  icon?: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

/**
 * 插件配置
 */
export interface PluginConfig {
  enabled: boolean
  options?: Record<string, any>
}

/**
 * 插件信息
 */
export interface PluginInfo {
  metadata: PluginMetadata
  status: PluginStatus
  config: PluginConfig
  installedAt: number
  activatedAt?: number
  error?: string
}

/**
 * 插件上下文
 */
export interface PluginContext {
  logger: PluginLogger
  storage: PluginStorage
  events: PluginEvents
  http: PluginHttp
  cli: PluginCli
  ui: PluginUi
}

/**
 * 插件日志接口
 */
export interface PluginLogger {
  debug(message: string, ...args: any[]): void
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
}

/**
 * 插件存储接口
 */
export interface PluginStorage {
  get<T = any>(key: string): Promise<T | undefined>
  set(key: string, value: any): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

/**
 * 插件事件接口
 */
export interface PluginEvents {
  on(event: string, handler: (...args: any[]) => void): void
  off(event: string, handler: (...args: any[]) => void): void
  emit(event: string, ...args: any[]): void
  once(event: string, handler: (...args: any[]) => void): void
}

/**
 * 插件 HTTP 接口
 */
export interface PluginHttp {
  registerRoute(path: string, handler: any): void
  unregisterRoute(path: string): void
}

/**
 * 插件 CLI 接口
 */
export interface PluginCli {
  registerCommand(name: string, handler: (args: any) => Promise<void>): void
  unregisterCommand(name: string): void
}

/**
 * 插件 UI 接口
 */
export interface PluginUi {
  registerMenuItem(item: PluginMenuItem): void
  unregisterMenuItem(id: string): void
  registerView(view: PluginView): void
  unregisterView(id: string): void
}

/**
 * 插件菜单项
 */
export interface PluginMenuItem {
  id: string
  label: string
  icon?: string
  path: string
  order?: number
}

/**
 * 插件视图
 */
export interface PluginView {
  id: string
  path: string
  component: string
  title: string
}

/**
 * 插件接口
 */
export interface IPlugin {
  metadata: PluginMetadata

  install?(context: PluginContext): Promise<void>
  activate(context: PluginContext): Promise<void>
  deactivate?(context: PluginContext): Promise<void>
  uninstall?(context: PluginContext): Promise<void>
  onConfigChange?(config: PluginConfig, context: PluginContext): Promise<void>
}


