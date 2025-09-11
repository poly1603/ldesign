/**
 * 效果基类
 * 提供所有效果的通用功能和接口实现
 */

import type { IEffect, IMapEngine, EffectType, EffectOptions } from '../types'

/**
 * 效果基类
 * 所有效果插件的基础实现
 */
export abstract class BaseEffect implements IEffect {
  /** 效果唯一标识 */
  readonly id: string
  
  /** 效果类型 */
  readonly type: EffectType
  
  /** 地图引擎实例 */
  protected mapEngine: IMapEngine | null = null
  
  /** 效果配置选项 */
  protected options: EffectOptions
  
  /** 是否已初始化 */
  protected initialized = false
  
  /** 是否可见 */
  protected visible = true
  
  /** 是否已销毁 */
  protected destroyed = false
  
  /** 效果容器元素 */
  protected container: HTMLElement | null = null
  
  /** 动画帧ID */
  protected animationFrameId: number | null = null

  constructor(id: string, type: EffectType, options: EffectOptions) {
    this.id = id
    this.type = type
    this.options = { ...options }
    
    // 设置默认值
    if (this.options.visible === undefined) {
      this.options.visible = true
    }
    if (this.options.opacity === undefined) {
      this.options.opacity = 1
    }
    if (this.options.zIndex === undefined) {
      this.options.zIndex = 1000
    }
  }

  /**
   * 初始化效果
   * 子类必须实现此方法
   */
  async initialize(mapEngine: IMapEngine, options: EffectOptions): Promise<void> {
    if (this.initialized) return

    this.mapEngine = mapEngine
    this.options = { ...this.options, ...options }
    
    try {
      // 创建效果容器
      this.createContainer()
      
      // 执行子类初始化
      await this.onInitialize()
      
      // 设置初始状态
      this.setVisibility(this.options.visible !== false)
      this.setOpacity(this.options.opacity || 1)
      
      this.initialized = true
      
      console.log(`效果初始化成功: ${this.type} (${this.id})`)
      
    } catch (error) {
      console.error(`效果初始化失败: ${this.type} (${this.id})`, error)
      throw error
    }
  }

  /**
   * 子类初始化方法
   * 子类需要实现此方法
   */
  protected abstract onInitialize(): Promise<void>

  /**
   * 创建效果容器
   */
  protected createContainer(): void {
    const mapContainer = this.mapEngine!.getContainer()
    
    this.container = document.createElement('div')
    this.container.className = `ldesign-map-effect ldesign-map-effect-${this.type}`
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: ${this.options.zIndex || 1000};
      overflow: hidden;
    `
    
    mapContainer.appendChild(this.container)
  }

  /**
   * 更新效果配置
   */
  update(options: Partial<EffectOptions>): void {
    if (this.destroyed) return
    
    const oldOptions = { ...this.options }
    this.options = { ...this.options, ...options }
    
    // 处理可见性变化
    if (options.visible !== undefined && options.visible !== oldOptions.visible) {
      this.setVisibility(options.visible)
    }
    
    // 处理透明度变化
    if (options.opacity !== undefined && options.opacity !== oldOptions.opacity) {
      this.setOpacity(options.opacity)
    }
    
    // 处理层级变化
    if (options.zIndex !== undefined && options.zIndex !== oldOptions.zIndex) {
      this.setZIndex(options.zIndex)
    }
    
    // 执行子类更新
    this.onUpdate(options, oldOptions)
  }

  /**
   * 子类更新方法
   * 子类可以重写此方法
   */
  protected onUpdate(newOptions: Partial<EffectOptions>, oldOptions: EffectOptions): void {
    // 默认实现为空，子类可以重写
  }

  /**
   * 显示效果
   */
  show(): void {
    this.setVisibility(true)
  }

  /**
   * 隐藏效果
   */
  hide(): void {
    this.setVisibility(false)
  }

  /**
   * 设置可见性
   */
  protected setVisibility(visible: boolean): void {
    this.visible = visible
    this.options.visible = visible
    
    if (this.container) {
      this.container.style.display = visible ? 'block' : 'none'
    }
    
    if (visible) {
      this.startAnimation()
    } else {
      this.stopAnimation()
    }
  }

  /**
   * 设置透明度
   */
  setOpacity(opacity: number): void {
    this.options.opacity = Math.max(0, Math.min(1, opacity))
    
    if (this.container) {
      this.container.style.opacity = this.options.opacity.toString()
    }
    
    this.onOpacityChange(this.options.opacity)
  }

  /**
   * 透明度变化回调
   * 子类可以重写此方法
   */
  protected onOpacityChange(opacity: number): void {
    // 默认实现为空，子类可以重写
  }

  /**
   * 设置层级
   */
  protected setZIndex(zIndex: number): void {
    this.options.zIndex = zIndex
    
    if (this.container) {
      this.container.style.zIndex = zIndex.toString()
    }
  }

  /**
   * 获取当前配置
   */
  getOptions(): EffectOptions {
    return { ...this.options }
  }

  /**
   * 销毁效果
   */
  destroy(): void {
    if (this.destroyed) return
    
    // 停止动画
    this.stopAnimation()
    
    // 执行子类销毁
    this.onDestroy()
    
    // 移除容器
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
      this.container = null
    }
    
    // 清理引用
    this.mapEngine = null
    
    this.destroyed = true
    this.initialized = false
    
    console.log(`效果销毁完成: ${this.type} (${this.id})`)
  }

  /**
   * 子类销毁方法
   * 子类可以重写此方法
   */
  protected onDestroy(): void {
    // 默认实现为空，子类可以重写
  }

  /**
   * 开始动画
   */
  protected startAnimation(): void {
    if (!this.visible || this.destroyed) return
    
    this.stopAnimation()
    
    const animate = () => {
      if (!this.visible || this.destroyed) return
      
      this.onAnimate()
      this.animationFrameId = requestAnimationFrame(animate)
    }
    
    this.animationFrameId = requestAnimationFrame(animate)
  }

  /**
   * 停止动画
   */
  protected stopAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * 动画帧回调
   * 子类可以重写此方法
   */
  protected onAnimate(): void {
    // 默认实现为空，子类可以重写
  }

  /**
   * 检查是否已初始化
   */
  protected checkInitialized(): void {
    if (!this.initialized) {
      throw new Error(`效果尚未初始化: ${this.type} (${this.id})`)
    }
    if (this.destroyed) {
      throw new Error(`效果已被销毁: ${this.type} (${this.id})`)
    }
  }

  /**
   * 获取地图容器尺寸
   */
  protected getMapSize(): { width: number; height: number } {
    if (!this.mapEngine) {
      return { width: 0, height: 0 }
    }
    
    const container = this.mapEngine.getContainer()
    return {
      width: container.clientWidth,
      height: container.clientHeight
    }
  }

  /**
   * 地理坐标转屏幕坐标
   */
  protected project(lngLat: [number, number]): [number, number] {
    if (!this.mapEngine) {
      return [0, 0]
    }
    return this.mapEngine.project(lngLat)
  }

  /**
   * 屏幕坐标转地理坐标
   */
  protected unproject(point: [number, number]): [number, number] {
    if (!this.mapEngine) {
      return [0, 0]
    }
    return this.mapEngine.unproject(point)
  }
}
