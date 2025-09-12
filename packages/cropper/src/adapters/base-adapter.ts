/**
 * @file 基础适配器
 * @description 所有框架适配器的基类
 */

import { Cropper } from '@/cropper'
import type { CropperOptions, CropperEventType, CropperEventListener } from '@/types'

/**
 * 适配器配置
 */
export interface AdapterOptions extends CropperOptions {
  /** 是否自动初始化 */
  autoInit?: boolean
  /** 是否自动销毁 */
  autoDestroy?: boolean
  /** 错误处理函数 */
  onError?: (error: Error) => void
}

/**
 * 适配器状态
 */
export enum AdapterState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error',
  DESTROYED = 'destroyed',
}

/**
 * 基础适配器类
 * 提供所有框架适配器的通用功能
 */
export abstract class BaseAdapter {
  /** 裁剪器实例 */
  protected cropper: Cropper | null = null

  /** 适配器配置 */
  protected options: AdapterOptions

  /** 适配器状态 */
  protected state = AdapterState.IDLE

  /** 事件监听器映射 */
  protected eventListeners = new Map<CropperEventType, Set<CropperEventListener>>()

  /** 默认配置 */
  protected static readonly DEFAULT_OPTIONS: AdapterOptions = {
    autoInit: true,
    autoDestroy: true,
    aspectRatio: null,
    minWidth: 0,
    minHeight: 0,
    maxWidth: Infinity,
    maxHeight: Infinity,
    initialCropArea: null,
    cropShape: 'rectangle' as const,
    enableResize: true,
    enableMove: true,
    enableRotate: true,
    enableFlip: true,
    showGrid: true,
    showCenterLines: false,
    gridLines: 2,
    quality: 0.92,
    format: 'image/png',
    backgroundColor: 'transparent',
    smoothing: true,
    pixelRatio: window.devicePixelRatio || 1,
  }

  /**
   * 构造函数
   * @param container 容器元素或选择器
   * @param options 适配器配置
   */
  constructor(container: HTMLElement | string, options: Partial<AdapterOptions> = {}) {
    this.options = { ...BaseAdapter.DEFAULT_OPTIONS, ...options }

    if (this.options.autoInit) {
      // 验证容器参数
      if (!container || (typeof container === 'string' && container.trim() === '')) {
        throw new Error('Container is required and cannot be empty')
      }
      this.init(container)
    }
  }

  /**
   * 初始化适配器
   * @param container 容器元素或选择器
   */
  async init(container: HTMLElement | string): Promise<void> {
    if (this.state !== AdapterState.IDLE) {
      throw new Error(`Cannot initialize adapter in state: ${this.state}`)
    }

    try {
      this.setState(AdapterState.INITIALIZING)

      // 验证容器参数
      if (!container || (typeof container === 'string' && container.trim() === '')) {
        throw new Error('Container is required and cannot be empty')
      }

      // 创建裁剪器实例，将容器添加到配置中
      const cropperOptions = {
        ...this.options,
        container
      }
      this.cropper = new Cropper(cropperOptions)

      // 设置事件监听器
      this.setupEventListeners()

      // 框架特定的初始化
      await this.onInit()

      this.setState(AdapterState.READY)
    } catch (error) {
      this.setState(AdapterState.ERROR)
      this.handleError(error as Error)
      throw error
    }
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    if (this.state === AdapterState.DESTROYED) {
      return
    }

    try {
      // 框架特定的清理
      this.onDestroy()

      // 清理事件监听器
      this.eventListeners.clear()

      // 销毁裁剪器实例
      if (this.cropper) {
        this.cropper.destroy()
        this.cropper = null
      }

      this.setState(AdapterState.DESTROYED)
    } catch (error) {
      this.handleError(error as Error)
    }
  }

  /**
   * 获取裁剪器实例
   */
  getCropper(): Cropper | null {
    return this.cropper
  }

  /**
   * 获取适配器状态
   */
  getState(): AdapterState {
    return this.state
  }

  /**
   * 是否已准备就绪
   */
  isReady(): boolean {
    return this.state === AdapterState.READY && this.cropper !== null
  }

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  on(type: CropperEventType, listener: CropperEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set())
    }
    this.eventListeners.get(type)!.add(listener)

    // 如果裁剪器已存在，直接添加监听器
    if (this.cropper) {
      this.cropper.on(type, listener)
    }
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  off(type: CropperEventType, listener: CropperEventListener): void {
    const listeners = this.eventListeners.get(type)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.eventListeners.delete(type)
      }
    }

    // 如果裁剪器已存在，移除监听器
    if (this.cropper) {
      this.cropper.off(type, listener)
    }
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param data 事件数据
   */
  protected emit(type: CropperEventType, data?: any): void {
    if (this.cropper) {
      this.cropper.emit(type, data)
    }
  }

  /**
   * 设置适配器状态
   * @param state 新状态
   */
  protected setState(state: AdapterState): void {
    if (this.state !== state) {
      const oldState = this.state
      this.state = state
      this.onStateChange(oldState, state)
    }
  }

  /**
   * 设置事件监听器
   */
  protected setupEventListeners(): void {
    if (!this.cropper) return

    // 将已注册的事件监听器添加到裁剪器
    this.eventListeners.forEach((listeners, type) => {
      listeners.forEach(listener => {
        this.cropper!.on(type, listener)
      })
    })
  }

  /**
   * 处理错误
   * @param error 错误对象
   */
  protected handleError(error: Error): void {
    console.error('Adapter error:', error)

    if (this.options.onError) {
      try {
        this.options.onError(error)
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    }
  }

  /**
   * 框架特定的初始化（子类实现）
   */
  protected abstract onInit(): Promise<void> | void

  /**
   * 框架特定的销毁（子类实现）
   */
  protected abstract onDestroy(): void

  /**
   * 状态变化回调（子类可重写）
   * @param oldState 旧状态
   * @param newState 新状态
   */
  protected onStateChange(oldState: AdapterState, newState: AdapterState): void {
    // 子类可以重写此方法
  }

  /**
   * 代理裁剪器方法
   */

  /**
   * 加载图片
   * @param source 图片源
   */
  async loadImage(source: string | File | HTMLImageElement): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Adapter is not ready')
    }
    return this.cropper!.loadImage(source)
  }

  /**
   * 获取裁剪数据
   */
  getCropData() {
    if (!this.isReady()) {
      throw new Error('Adapter is not ready')
    }
    return this.cropper!.getCropData()
  }

  /**
   * 设置裁剪数据
   * @param cropData 裁剪数据
   */
  setCropData(cropData: any): void {
    if (!this.isReady()) {
      throw new Error('Adapter is not ready')
    }
    this.cropper!.setCropData(cropData)
  }

  /**
   * 获取裁剪后的Canvas
   * @param options 选项
   */
  getCroppedCanvas(options?: any): HTMLCanvasElement {
    if (!this.isReady()) {
      throw new Error('Adapter is not ready')
    }
    return this.cropper!.getCroppedCanvas(options)
  }

  /**
   * 获取裁剪后的Data URL
   * @param format 格式
   * @param quality 质量
   */
  getCroppedDataURL(format?: string, quality?: number): string {
    if (!this.isReady()) {
      throw new Error('Adapter is not ready')
    }
    return this.cropper!.getCroppedDataURL(format, quality)
  }

  /**
   * 获取裁剪后的Blob
   * @param format 格式
   * @param quality 质量
   */
  async getCroppedBlob(format?: string, quality?: number): Promise<Blob> {
    if (!this.isReady()) {
      throw new Error('Adapter is not ready')
    }
    return this.cropper!.getCroppedBlob(format, quality)
  }

  /**
   * 缩放
   * @param ratio 缩放比例
   */
  zoom(ratio: number): void {
    if (!this.isReady()) {
      throw new Error('Adapter is not ready')
    }
    this.cropper!.zoom(ratio)
  }

  /**
   * 旋转
   * @param degree 旋转角度
   */
  rotate(degree: number): void {
    if (!this.isReady()) {
      throw new Error('Adapter is not ready')
    }
    this.cropper!.rotate(degree)
  }

  /**
   * 翻转
   * @param horizontal 是否水平翻转
   * @param vertical 是否垂直翻转
   */
  flip(horizontal?: boolean, vertical?: boolean): void {
    if (!this.isReady()) {
      throw new Error('Adapter is not ready')
    }
    this.cropper!.flip(horizontal, vertical)
  }

  /**
   * 重置
   */
  reset(): void {
    if (!this.isReady()) {
      throw new Error('Adapter is not ready')
    }
    this.cropper!.reset()
  }
}
