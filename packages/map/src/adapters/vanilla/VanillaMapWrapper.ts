/**
 * 原生JavaScript地图包装器
 * 提供原生JavaScript的地图集成，包含完整的UI状态管理
 */

import { LDesignMap } from '../../core/LDesignMap'
import type { VanillaMapOptions, VanillaMapInstance } from './types'
import type { MapOptions } from '../../types'

/**
 * 原生JavaScript地图包装器类
 * 
 * @example
 * ```javascript
 * import { VanillaMapWrapper } from '@ldesign/map/vanilla'
 * 
 * const mapWrapper = new VanillaMapWrapper('#map-container', {
 *   center: [116.404, 39.915],
 *   zoom: 10,
 *   accessToken: 'your-mapbox-token',
 *   autoInit: true,
 *   showLoading: true
 * })
 * 
 * mapWrapper.on('load', () => {
 *   console.log('地图加载完成')
 *   
 *   // 添加标记点
 *   mapWrapper.map.addMarker({
 *     lngLat: [116.404, 39.915],
 *     popup: { content: '北京' }
 *   })
 * })
 * 
 * mapWrapper.on('error', (error) => {
 *   console.error('地图加载失败:', error)
 * })
 * ```
 */
export class VanillaMapWrapper implements VanillaMapInstance {
  /** 地图实例 */
  public map: LDesignMap | null = null
  
  /** 容器元素 */
  public container: HTMLElement
  
  /** 是否已初始化 */
  public isInitialized = false
  
  /** 是否正在加载 */
  public isLoading = false
  
  /** 错误信息 */
  public error: Error | null = null

  /** 配置选项 */
  private options: VanillaMapOptions

  /** 事件监听器 */
  private eventListeners = new Map<string, EventListener[]>()

  /** UI元素 */
  private loadingElement: HTMLElement | null = null
  private errorElement: HTMLElement | null = null

  /**
   * 构造函数
   * 
   * @param container 地图容器选择器或元素
   * @param options 地图配置选项
   */
  constructor(container: string | HTMLElement, options: VanillaMapOptions) {
    // 获取容器元素
    this.container = typeof container === 'string' 
      ? document.querySelector(container) as HTMLElement
      : container

    if (!this.container) {
      throw new Error('Map container not found')
    }

    this.options = options

    // 设置容器样式
    this.setupContainer()

    // 自动初始化
    if (options.autoInit !== false) {
      this.initialize().catch(error => {
        this.showErrorState(error)
        this.emit('error', error)
      })
    }
  }

  /**
   * 初始化地图
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || this.isLoading) return

    try {
      this.isLoading = true
      this.error = null
      
      if (this.options.showLoading !== false) {
        this.showLoadingState()
      }

      // 创建地图配置
      const mapOptions: MapOptions = {
        ...this.options,
        container: this.container
      }

      // 创建地图实例
      this.map = new LDesignMap(mapOptions)
      await this.map.initialize()

      // 设置事件监听器
      this.setupMapEventListeners()

      this.isInitialized = true
      this.hideLoadingState()
      this.hideErrorState()
      
      this.emit('load')
    } catch (error) {
      this.error = error instanceof Error ? error : new Error('Failed to initialize map')
      this.hideLoadingState()
      
      if (this.options.showError !== false) {
        this.showErrorState(this.error)
      }
      
      throw this.error
    } finally {
      this.isLoading = false
    }
  }

  /**
   * 销毁地图
   */
  destroy(): void {
    if (this.map) {
      this.map.destroy()
      this.map = null
    }

    this.hideLoadingState()
    this.hideErrorState()
    this.eventListeners.clear()
    this.isInitialized = false
    this.isLoading = false
    this.error = null

    this.emit('destroy')
  }

  /**
   * 显示加载状态
   */
  showLoadingState(): void {
    this.hideErrorState()

    if (!this.loadingElement) {
      this.loadingElement = this.createLoadingElement()
    }

    if (!this.container.contains(this.loadingElement)) {
      this.container.appendChild(this.loadingElement)
    }
  }

  /**
   * 隐藏加载状态
   */
  hideLoadingState(): void {
    if (this.loadingElement && this.container.contains(this.loadingElement)) {
      this.container.removeChild(this.loadingElement)
    }
  }

  /**
   * 显示错误状态
   */
  showErrorState(error: Error): void {
    this.hideLoadingState()

    if (!this.errorElement) {
      this.errorElement = this.createErrorElement(error)
    }

    if (!this.container.contains(this.errorElement)) {
      this.container.appendChild(this.errorElement)
    }
  }

  /**
   * 隐藏错误状态
   */
  hideErrorState(): void {
    if (this.errorElement && this.container.contains(this.errorElement)) {
      this.container.removeChild(this.errorElement)
    }
  }

  /**
   * 重试初始化
   */
  async retry(): Promise<void> {
    this.hideErrorState()
    await this.initialize()
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: EventListener): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  /**
   * 设置容器样式
   */
  private setupContainer(): void {
    this.container.classList.add('ldesign-map-vanilla-container')
    
    // 确保容器有相对定位
    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative'
    }
  }

  /**
   * 设置地图事件监听器
   */
  private setupMapEventListeners(): void {
    if (!this.map) return

    // 代理地图事件
    const mapEvents = ['click', 'move', 'zoom', 'load', 'error']
    
    mapEvents.forEach(eventName => {
      this.map!.on(eventName, (data: any) => {
        this.emit(eventName, data)
      })
    })
  }

  /**
   * 创建加载元素
   */
  private createLoadingElement(): HTMLElement {
    if (this.options.loadingContent) {
      if (typeof this.options.loadingContent === 'string') {
        const element = document.createElement('div')
        element.innerHTML = this.options.loadingContent
        return element
      } else {
        return this.options.loadingContent
      }
    }

    // 默认加载UI
    const loadingElement = document.createElement('div')
    loadingElement.className = 'ldesign-map-loading-overlay'
    loadingElement.innerHTML = `
      <div class="ldesign-map-spinner"></div>
      <span class="ldesign-map-loading-text">地图加载中...</span>
    `
    return loadingElement
  }

  /**
   * 创建错误元素
   */
  private createErrorElement(error: Error): HTMLElement {
    if (this.options.errorContent) {
      if (typeof this.options.errorContent === 'string') {
        const element = document.createElement('div')
        element.innerHTML = this.options.errorContent
        return element
      } else if (typeof this.options.errorContent === 'function') {
        return this.options.errorContent(error, () => this.retry())
      } else {
        return this.options.errorContent
      }
    }

    // 默认错误UI
    const errorElement = document.createElement('div')
    errorElement.className = 'ldesign-map-error-overlay'
    errorElement.innerHTML = `
      <div class="ldesign-map-error-content">
        <h3>地图加载失败</h3>
        <p>${error.message}</p>
        <button class="ldesign-map-retry-btn">重试</button>
      </div>
    `

    // 添加重试按钮事件
    const retryBtn = errorElement.querySelector('.ldesign-map-retry-btn') as HTMLButtonElement
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.retry())
    }

    return errorElement
  }
}
