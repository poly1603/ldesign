/**
 * 地图引擎抽象基类
 * 定义统一的地图操作接口，支持多种地图引擎实现
 */

import type { 
  MapOptions, 
  LngLat, 
  FlyToOptions, 
  IMapEngine,
  MapEventMap,
  MapEventListener,
  GenericEventListener,
  LayerOptions,
  DataSource,
  MarkerOptions,
  PopupOptions,
  ControlOptions
} from '../types'

/**
 * 地图引擎抽象基类
 * 提供统一的地图操作接口，隐藏底层引擎差异
 */
export abstract class MapEngine implements IMapEngine {
  /** 地图容器元素 */
  protected container: HTMLElement
  
  /** 地图配置选项 */
  protected options: MapOptions
  
  /** 是否已初始化 */
  protected initialized = false
  
  /** 是否已销毁 */
  protected destroyed = false
  
  /** 事件监听器映射 */
  protected eventListeners = new Map<string, Set<Function>>()

  constructor(options: MapOptions) {
    this.options = { ...options }
    
    // 解析容器元素
    if (typeof options.container === 'string') {
      const element = document.querySelector(options.container)
      if (!element) {
        throw new Error(`找不到容器元素: ${options.container}`)
      }
      this.container = element as HTMLElement
    } else {
      this.container = options.container
    }
  }

  /**
   * 初始化地图
   * 子类必须实现此方法
   */
  abstract initialize(): Promise<void>

  /**
   * 销毁地图
   * 清理资源和事件监听器
   */
  destroy(): void {
    if (this.destroyed) return
    
    // 清理所有事件监听器
    this.eventListeners.clear()
    
    // 标记为已销毁
    this.destroyed = true
    this.initialized = false
  }

  /**
   * 检查是否已初始化
   */
  protected checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('地图引擎尚未初始化')
    }
    if (this.destroyed) {
      throw new Error('地图引擎已被销毁')
    }
  }

  /**
   * 设置地图中心点
   */
  abstract setCenter(center: LngLat): void

  /**
   * 获取地图中心点
   */
  abstract getCenter(): LngLat

  /**
   * 设置地图缩放级别
   */
  abstract setZoom(zoom: number): void

  /**
   * 获取地图缩放级别
   */
  abstract getZoom(): number

  /**
   * 设置地图方位角
   */
  abstract setBearing(bearing: number): void

  /**
   * 获取地图方位角
   */
  abstract getBearing(): number

  /**
   * 设置地图倾斜角
   */
  abstract setPitch(pitch: number): void

  /**
   * 获取地图倾斜角
   */
  abstract getPitch(): number

  /**
   * 飞行到指定位置
   */
  abstract flyTo(options: FlyToOptions): void

  /**
   * 适应边界
   */
  abstract fitBounds(bounds: [LngLat, LngLat], options?: any): void

  /**
   * 添加事件监听器
   */
  on<T extends keyof MapEventMap>(type: T, listener: MapEventListener<T>): void
  on(type: string, listener: GenericEventListener): void
  on(type: string, listener: Function): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set())
    }
    this.eventListeners.get(type)!.add(listener)
    this.addNativeEventListener(type, listener)
  }

  /**
   * 添加一次性事件监听器
   */
  once<T extends keyof MapEventMap>(type: T, listener: MapEventListener<T>): void
  once(type: string, listener: GenericEventListener): void
  once(type: string, listener: Function): void {
    const onceListener = (event: any) => {
      listener(event)
      this.off(type, onceListener)
    }
    this.on(type, onceListener)
  }

  /**
   * 移除事件监听器
   */
  off<T extends keyof MapEventMap>(type: T, listener: MapEventListener<T>): void
  off(type: string, listener: GenericEventListener): void
  off(type: string, listener: Function): void {
    const listeners = this.eventListeners.get(type)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.eventListeners.delete(type)
      }
    }
    this.removeNativeEventListener(type, listener)
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(type?: string): void {
    if (type) {
      const listeners = this.eventListeners.get(type)
      if (listeners) {
        listeners.forEach(listener => {
          this.removeNativeEventListener(type, listener)
        })
        this.eventListeners.delete(type)
      }
    } else {
      this.eventListeners.forEach((listeners, eventType) => {
        listeners.forEach(listener => {
          this.removeNativeEventListener(eventType, listener)
        })
      })
      this.eventListeners.clear()
    }
  }

  /**
   * 添加原生事件监听器
   * 子类需要实现此方法
   */
  protected abstract addNativeEventListener(type: string, listener: Function): void

  /**
   * 移除原生事件监听器
   * 子类需要实现此方法
   */
  protected abstract removeNativeEventListener(type: string, listener: Function): void

  /**
   * 调整地图大小
   */
  abstract resize(): void

  /**
   * 获取地图容器
   */
  getContainer(): HTMLElement {
    return this.container
  }

  /**
   * 获取原始地图实例
   * 子类需要实现此方法
   */
  abstract getMapInstance(): any

  /**
   * 添加数据源
   */
  abstract addSource(id: string, source: DataSource): void

  /**
   * 移除数据源
   */
  abstract removeSource(id: string): void

  /**
   * 添加图层
   */
  abstract addLayer(layer: LayerOptions, beforeId?: string): void

  /**
   * 移除图层
   */
  abstract removeLayer(id: string): void

  /**
   * 设置图层可见性
   */
  abstract setLayerVisibility(id: string, visible: boolean): void

  /**
   * 添加标记点
   */
  abstract addMarker(options: MarkerOptions): any

  /**
   * 移除标记点
   */
  abstract removeMarker(marker: any): void

  /**
   * 添加弹窗
   */
  abstract addPopup(options: PopupOptions): any

  /**
   * 移除弹窗
   */
  abstract removePopup(popup: any): void

  /**
   * 添加控件
   */
  abstract addControl(control: any, options?: ControlOptions): void

  /**
   * 移除控件
   */
  abstract removeControl(control: any): void

  /**
   * 屏幕坐标转地理坐标
   */
  abstract unproject(point: [number, number]): LngLat

  /**
   * 地理坐标转屏幕坐标
   */
  abstract project(lngLat: LngLat): [number, number]

  /**
   * 获取地图边界
   */
  abstract getBounds(): [LngLat, LngLat]

  /**
   * 获取地图样式
   */
  abstract getStyle(): any

  /**
   * 设置地图样式
   */
  abstract setStyle(style: string | object): void

  /**
   * 判断是否已加载完成
   */
  abstract isLoaded(): boolean

  /**
   * 等待地图加载完成
   */
  async waitForLoad(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isLoaded()) {
        resolve()
      } else {
        this.once('load', () => resolve())
      }
    })
  }

  /**
   * 获取地图配置选项
   */
  getOptions(): MapOptions {
    return { ...this.options }
  }

  /**
   * 更新地图配置选项
   */
  updateOptions(options: Partial<MapOptions>): void {
    this.options = { ...this.options, ...options }
  }
}
