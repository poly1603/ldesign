/**
 * 插件相关类型定义
 */

import type { AnyObject, AnyFunction, VersionInfo } from './common'
import type { FormInstance, FormConfig } from './form'
import type { EventBus } from './events'

// 插件类型
export type PluginType = 'core' | 'ui' | 'validation' | 'layout' | 'data' | 'integration' | 'utility' | 'custom'

// 插件状态
export type PluginStatus = 'installed' | 'enabled' | 'disabled' | 'error' | 'loading'

// 插件生命周期钩子
export type PluginHook = 
  | 'beforeInstall'
  | 'installed'
  | 'beforeEnable'
  | 'enabled'
  | 'beforeDisable'
  | 'disabled'
  | 'beforeUninstall'
  | 'uninstalled'
  | 'error'

// 插件依赖类型
export interface PluginDependency {
  // 依赖名称
  name: string
  
  // 版本要求
  version?: string
  
  // 是否可选
  optional?: boolean
  
  // 依赖描述
  description?: string
}

// 插件元数据
export interface PluginMetadata {
  // 基础信息
  name: string
  version: string
  description?: string
  author?: string
  license?: string
  homepage?: string
  repository?: string
  
  // 分类信息
  type: PluginType
  category?: string
  tags?: string[]
  keywords?: string[]
  
  // 兼容性
  compatibility?: {
    formVersion?: string
    vueVersion?: string
    nodeVersion?: string
    browsers?: string[]
  }
  
  // 依赖关系
  dependencies?: PluginDependency[]
  peerDependencies?: PluginDependency[]
  optionalDependencies?: PluginDependency[]
  
  // 配置模式
  configSchema?: AnyObject
  
  // 权限要求
  permissions?: string[]
  
  // 资源文件
  assets?: {
    styles?: string[]
    scripts?: string[]
    images?: string[]
    fonts?: string[]
  }
  
  // 国际化
  i18n?: {
    locales?: string[]
    defaultLocale?: string
    messages?: Record<string, Record<string, string>>
  }
  
  // 文档链接
  documentation?: {
    readme?: string
    api?: string
    examples?: string
    changelog?: string
  }
}

// 插件配置
export interface PluginOptions {
  // 是否启用
  enabled?: boolean
  
  // 插件配置
  config?: AnyObject
  
  // 加载优先级
  priority?: number
  
  // 延迟加载
  lazy?: boolean
  
  // 条件加载
  condition?: (context: PluginContext) => boolean
  
  // 自定义选项
  [key: string]: any
}

// 插件上下文
export interface PluginContext {
  // 表单实例
  form: FormInstance
  
  // 表单配置
  config: FormConfig
  
  // 事件总线
  eventBus: EventBus
  
  // 插件管理器
  pluginManager: PluginManager
  
  // 工具函数
  utils: PluginUtils
  
  // 环境信息
  env: {
    isDevelopment: boolean
    isProduction: boolean
    version: string
    platform: string
  }
}

// 插件工具函数
export interface PluginUtils {
  // 日志工具
  logger: {
    debug: (message: string, data?: AnyObject) => void
    info: (message: string, data?: AnyObject) => void
    warn: (message: string, data?: AnyObject) => void
    error: (message: string, data?: AnyObject) => void
  }
  
  // 存储工具
  storage: {
    get: (key: string) => any
    set: (key: string, value: any) => void
    remove: (key: string) => void
    clear: () => void
  }
  
  // HTTP工具
  http: {
    get: (url: string, options?: AnyObject) => Promise<any>
    post: (url: string, data?: AnyObject, options?: AnyObject) => Promise<any>
    put: (url: string, data?: AnyObject, options?: AnyObject) => Promise<any>
    delete: (url: string, options?: AnyObject) => Promise<any>
  }
  
  // DOM工具
  dom: {
    createElement: (tag: string, props?: AnyObject) => HTMLElement
    querySelector: (selector: string) => HTMLElement | null
    querySelectorAll: (selector: string) => NodeList
    addClass: (element: HTMLElement, className: string) => void
    removeClass: (element: HTMLElement, className: string) => void
    hasClass: (element: HTMLElement, className: string) => boolean
  }
  
  // 验证工具
  validation: {
    isEmail: (value: string) => boolean
    isPhone: (value: string) => boolean
    isUrl: (value: string) => boolean
    isNumber: (value: any) => boolean
    isEmpty: (value: any) => boolean
  }
  
  // 格式化工具
  format: {
    date: (date: Date, format: string) => string
    number: (number: number, options?: AnyObject) => string
    currency: (amount: number, currency: string) => string
    fileSize: (bytes: number) => string
  }
  
  // 加密工具
  crypto: {
    hash: (data: string, algorithm?: string) => string
    encrypt: (data: string, key: string) => string
    decrypt: (data: string, key: string) => string
    uuid: () => string
  }
  
  // 深度克隆
  clone: <T>(obj: T) => T
  
  // 深度合并
  merge: <T>(target: T, ...sources: Partial<T>[]) => T
  
  // 防抖函数
  debounce: <T extends AnyFunction>(fn: T, delay: number) => T
  
  // 节流函数
  throttle: <T extends AnyFunction>(fn: T, interval: number) => T
}

// 插件接口
export interface Plugin {
  // 插件元数据
  metadata: PluginMetadata
  
  // 安装插件
  install(context: PluginContext, options?: PluginOptions): void | Promise<void>
  
  // 卸载插件
  uninstall?(context: PluginContext): void | Promise<void>
  
  // 启用插件
  enable?(context: PluginContext): void | Promise<void>
  
  // 禁用插件
  disable?(context: PluginContext): void | Promise<void>
  
  // 配置更新
  configure?(context: PluginContext, options: PluginOptions): void | Promise<void>
  
  // 生命周期钩子
  hooks?: Partial<Record<PluginHook, (context: PluginContext) => void | Promise<void>>>
  
  // 插件API
  api?: AnyObject
  
  // 插件组件
  components?: Record<string, any>
  
  // 插件指令
  directives?: Record<string, any>
  
  // 插件过滤器
  filters?: Record<string, AnyFunction>
  
  // 插件混入
  mixins?: any[]
  
  // 插件提供者
  providers?: Record<string, any>
}

// 插件注册信息
export interface PluginRegistration {
  // 插件实例
  plugin: Plugin
  
  // 插件选项
  options: PluginOptions
  
  // 插件状态
  status: PluginStatus
  
  // 安装时间
  installedAt: Date
  
  // 启用时间
  enabledAt?: Date
  
  // 错误信息
  error?: Error
  
  // 插件实例
  instance?: any
  
  // 插件上下文
  context?: PluginContext
}

// 插件管理器接口
export interface PluginManager {
  // 注册插件
  register(plugin: Plugin, options?: PluginOptions): Promise<void>
  
  // 注销插件
  unregister(name: string): Promise<void>
  
  // 安装插件
  install(name: string, options?: PluginOptions): Promise<void>
  
  // 卸载插件
  uninstall(name: string): Promise<void>
  
  // 启用插件
  enable(name: string): Promise<void>
  
  // 禁用插件
  disable(name: string): Promise<void>
  
  // 配置插件
  configure(name: string, options: PluginOptions): Promise<void>
  
  // 获取插件
  get(name: string): PluginRegistration | undefined
  
  // 获取所有插件
  getAll(): PluginRegistration[]
  
  // 获取已启用插件
  getEnabled(): PluginRegistration[]
  
  // 获取已禁用插件
  getDisabled(): PluginRegistration[]
  
  // 检查插件是否存在
  has(name: string): boolean
  
  // 检查插件是否启用
  isEnabled(name: string): boolean
  
  // 检查依赖关系
  checkDependencies(plugin: Plugin): { satisfied: boolean; missing: string[] }
  
  // 解析依赖关系
  resolveDependencies(plugins: Plugin[]): Plugin[]
  
  // 加载插件
  load(source: string | Plugin): Promise<Plugin>
  
  // 从URL加载插件
  loadFromUrl(url: string): Promise<Plugin>
  
  // 从文件加载插件
  loadFromFile(file: File): Promise<Plugin>
  
  // 搜索插件
  search(query: string): PluginRegistration[]
  
  // 过滤插件
  filter(predicate: (plugin: PluginRegistration) => boolean): PluginRegistration[]
  
  // 排序插件
  sort(compareFn?: (a: PluginRegistration, b: PluginRegistration) => number): PluginRegistration[]
  
  // 清除所有插件
  clear(): Promise<void>
  
  // 重置插件管理器
  reset(): Promise<void>
  
  // 获取插件统计
  getStats(): PluginStats
  
  // 导出插件配置
  exportConfig(): AnyObject
  
  // 导入插件配置
  importConfig(config: AnyObject): Promise<void>
  
  // 事件监听
  on(event: string, listener: AnyFunction): void
  off(event: string, listener?: AnyFunction): void
  emit(event: string, data?: AnyObject): void
}

// 插件统计信息
export interface PluginStats {
  // 总插件数
  total: number
  
  // 已启用插件数
  enabled: number
  
  // 已禁用插件数
  disabled: number
  
  // 错误插件数
  error: number
  
  // 按类型分组
  byType: Record<PluginType, number>
  
  // 按状态分组
  byStatus: Record<PluginStatus, number>
  
  // 内存使用
  memoryUsage: number
  
  // 加载时间
  loadTime: number
  
  // 最后更新时间
  lastUpdated: Date
}

// 插件仓库接口
export interface PluginRepository {
  // 搜索插件
  search(query: string, options?: {
    type?: PluginType
    category?: string
    tags?: string[]
    author?: string
    limit?: number
    offset?: number
  }): Promise<PluginMetadata[]>
  
  // 获取插件详情
  getPlugin(name: string, version?: string): Promise<Plugin>
  
  // 获取插件版本列表
  getVersions(name: string): Promise<VersionInfo[]>
  
  // 下载插件
  download(name: string, version?: string): Promise<Blob>
  
  // 发布插件
  publish(plugin: Plugin): Promise<void>
  
  // 更新插件
  update(name: string, plugin: Plugin): Promise<void>
  
  // 删除插件
  delete(name: string, version?: string): Promise<void>
  
  // 获取热门插件
  getPopular(limit?: number): Promise<PluginMetadata[]>
  
  // 获取最新插件
  getLatest(limit?: number): Promise<PluginMetadata[]>
  
  // 获取推荐插件
  getRecommended(context?: AnyObject): Promise<PluginMetadata[]>
  
  // 检查更新
  checkUpdates(plugins: string[]): Promise<Array<{ name: string; currentVersion: string; latestVersion: string }>>
}

// 插件开发工具接口
export interface PluginDevTools {
  // 创建插件模板
  createTemplate(type: PluginType, options?: AnyObject): Plugin
  
  // 验证插件
  validate(plugin: Plugin): { valid: boolean; errors: string[] }
  
  // 构建插件
  build(plugin: Plugin, options?: AnyObject): Promise<Blob>
  
  // 测试插件
  test(plugin: Plugin, testSuite?: AnyObject): Promise<{ passed: number; failed: number; results: any[] }>
  
  // 生成文档
  generateDocs(plugin: Plugin): Promise<string>
  
  // 打包插件
  package(plugin: Plugin, options?: AnyObject): Promise<Blob>
  
  // 发布插件
  publish(plugin: Plugin, repository: PluginRepository): Promise<void>
  
  // 调试插件
  debug(plugin: Plugin, options?: AnyObject): PluginDebugger
}

// 插件调试器接口
export interface PluginDebugger {
  // 设置断点
  setBreakpoint(location: string): void
  
  // 移除断点
  removeBreakpoint(location: string): void
  
  // 单步执行
  step(): void
  
  // 继续执行
  continue(): void
  
  // 暂停执行
  pause(): void
  
  // 获取变量值
  getVariable(name: string): any
  
  // 设置变量值
  setVariable(name: string, value: any): void
  
  // 获取调用栈
  getCallStack(): any[]
  
  // 获取日志
  getLogs(): any[]
  
  // 清除日志
  clearLogs(): void
}

// 插件市场接口
export interface PluginMarketplace {
  // 浏览插件
  browse(options?: {
    category?: string
    type?: PluginType
    sort?: 'name' | 'downloads' | 'rating' | 'updated'
    order?: 'asc' | 'desc'
    page?: number
    limit?: number
  }): Promise<{ plugins: PluginMetadata[]; total: number }>
  
  // 搜索插件
  search(query: string, options?: AnyObject): Promise<PluginMetadata[]>
  
  // 获取插件详情
  getDetails(name: string): Promise<PluginMetadata & {
    downloads: number
    rating: number
    reviews: any[]
    screenshots: string[]
    changelog: VersionInfo[]
  }>
  
  // 安装插件
  install(name: string, version?: string): Promise<void>
  
  // 卸载插件
  uninstall(name: string): Promise<void>
  
  // 更新插件
  update(name: string): Promise<void>
  
  // 评价插件
  rate(name: string, rating: number, review?: string): Promise<void>
  
  // 举报插件
  report(name: string, reason: string, description?: string): Promise<void>
  
  // 收藏插件
  favorite(name: string): Promise<void>
  
  // 取消收藏
  unfavorite(name: string): Promise<void>
  
  // 获取收藏列表
  getFavorites(): Promise<PluginMetadata[]>
  
  // 获取安装历史
  getInstallHistory(): Promise<Array<{ name: string; version: string; installedAt: Date }>>
}
