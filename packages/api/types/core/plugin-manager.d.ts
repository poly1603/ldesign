import { ApiEngine, ApiPlugin } from '../types/index.js'

/**
 * 插件管理器
 */
declare class PluginManager {
  /** 已注册的插件 */
  private readonly plugins
  /** 插件加载顺序 */
  private readonly loadOrder
  /** API 引擎实例 */
  private readonly engine
  constructor(engine: ApiEngine)
  /**
   * 注册插件
   */
  register(plugin: ApiPlugin): Promise<void>
  /**
   * 卸载插件
   */
  unregister(name: string): Promise<void>
  /**
   * 获取插件
   */
  get(name: string): ApiPlugin | undefined
  /**
   * 获取所有插件
   */
  getAll(): ApiPlugin[]
  /**
   * 检查插件是否已注册
   */
  isRegistered(name: string): boolean
  /**
   * 获取插件依赖
   */
  getDependencies(name: string): string[]
  /**
   * 获取依赖此插件的其他插件
   */
  getDependents(name: string): string[]
  /**
   * 获取加载顺序
   */
  getLoadOrder(): string[]
  /**
   * 清空所有插件
   */
  clear(): void
  /**
   * 验证插件格式
   */
  private validatePlugin
  /**
   * 日志输出
   */
  private log
}

export { PluginManager }
