import { EventEmitter } from '../utils/event-emitter.js'
import { ResourceManagerInstance, ResourceStats } from './types.js'

/**
 * @ldesign/theme - 资源管理器
 *
 * 负责主题资源的加载、缓存和管理
 */

/**
 * 资源管理器实现
 */
declare class ResourceManager implements ResourceManagerInstance {
  private cache
  private loading
  private eventEmitter
  private maxCacheSize
  private currentCacheSize
  constructor(
    eventEmitter: EventEmitter,
    options?: {
      maxCacheSize?: number
    }
  )
  /**
   * 加载资源
   */
  load(src: string, type?: string): Promise<any>
  /**
   * 预加载资源
   */
  preload(resources: string[]): Promise<void>
  /**
   * 获取缓存的资源
   */
  get(src: string): any
  /**
   * 清理资源
   */
  clear(pattern?: string): void
  /**
   * 获取资源统计信息
   */
  getStats(): ResourceStats
  /**
   * 销毁资源管理器
   */
  destroy(): void
  /**
   * 实际加载资源的方法
   */
  private loadResource
  /**
   * 检测资源类型
   */
  private detectResourceType
  /**
   * 加载图片
   */
  private loadImage
  /**
   * 加载图标（SVG）
   */
  private loadIcon
  /**
   * 加载音频
   */
  private loadSound
  /**
   * 加载字体
   */
  private loadFont
  /**
   * 加载 JSON
   */
  private loadJson
  /**
   * 加载 CSS
   */
  private loadCss
  /**
   * 加载 JavaScript
   */
  private loadJs
  /**
   * 加载通用资源
   */
  private loadGeneric
  /**
   * 缓存资源
   */
  private cacheResource
  /**
   * 计算资源大小
   */
  private calculateResourceSize
  /**
   * LRU 缓存淘汰
   */
  private evictLRU
}
/**
 * 创建资源管理器实例
 */
declare function createResourceManager(
  eventEmitter: EventEmitter,
  options?: {
    maxCacheSize?: number
  }
): ResourceManagerInstance

export { ResourceManager, createResourceManager }
