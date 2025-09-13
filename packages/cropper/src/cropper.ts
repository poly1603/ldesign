/**
 * @file 主要的 Cropper 类
 * @description 提供简洁易用的图片裁剪器 API
 */

import type {
  CropperOptions,
  CropperInstance,
  CropArea,
  OutputConfig,
  CropperEventType,
  CropperEventListener,
} from './types'
import { CropShape } from '@/types'
import { ImageFormat } from './types'
import { CropperCore } from './core'
import { ImageUtils } from './utils'
import { Toolbar, type ToolbarConfig } from './ui/toolbar'

/**
 * 图片裁剪器类
 * 提供简洁易用的 API 接口
 */
export class Cropper implements CropperInstance {
  /** 核心实例 */
  private core: CropperCore
  /** 工具栏实例 */
  private toolbar?: Toolbar

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: CropperOptions) {
    this.core = new CropperCore(options)

    // 初始化工具栏
    console.log('Toolbar config:', options.toolbar)
    if (options.toolbar && options.toolbar.show !== false) {
      console.log('Initializing toolbar...')
      this.initializeToolbar(options.toolbar)
    } else {
      console.log('Toolbar not enabled or show is false')
    }
  }

  /**
   * 设置图片
   * @param src 图片源
   */
  async setImage(src: string | File | HTMLImageElement): Promise<void> {
    return this.core.setImage(src)
  }

  /**
   * 获取裁剪后的 Canvas
   * @param config 输出配置
   * @returns 裁剪后的 Canvas
   */
  getCroppedCanvas(config?: OutputConfig): HTMLCanvasElement {
    return this.core.getCroppedCanvas(config)
  }

  /**
   * 获取裁剪后的 Blob
   * @param config 输出配置
   * @returns Promise<Blob>
   */
  async getCroppedBlob(configOrFormat?: OutputConfig | string, quality?: number): Promise<Blob> {
    const isConfig = typeof configOrFormat === 'object' || configOrFormat === undefined
    const config = (isConfig ? configOrFormat : { format: configOrFormat, quality }) as OutputConfig | undefined
    const canvas = this.getCroppedCanvas(config)
    const format = config?.format || ImageFormat.PNG
    const qual = (config?.quality as number | undefined) ?? 0.9

    return ImageUtils.canvasToBlob(canvas, format, qual)
  }

  /**
   * 获取裁剪后的 Data URL
   * @param config 输出配置
   * @returns Data URL 字符串
   */
  getCroppedDataURL(configOrFormat?: OutputConfig | string, quality?: number): string {
    const isConfig = typeof configOrFormat === 'object' || configOrFormat === undefined
    const config = (isConfig ? configOrFormat : { format: configOrFormat, quality }) as OutputConfig | undefined
    const canvas = this.getCroppedCanvas(config)
    const format = config?.format || ImageFormat.PNG
    const qual = (config?.quality as number | undefined) ?? 0.9

    return canvas.toDataURL(format, qual)
  }

  /**
   * 下载裁剪后的图片
   * @param filename 文件名
   * @param config 输出配置
   */
  async downloadCroppedImage(
    filename = 'cropped-image',
    config?: OutputConfig,
  ): Promise<void> {
    const canvas = this.getCroppedCanvas(config)
    const format = config?.format || ImageFormat.PNG
    const quality = config?.quality || 0.9

    return ImageUtils.downloadImage(canvas, filename, format, quality)
  }

  /**
   * 获取裁剪数据
   * @returns 裁剪区域数据
   */
  getCropData(): CropArea {
    return this.core.getCropData()
  }

  /**
   * 设置裁剪数据
   * @param cropArea 裁剪区域数据
   */
  setCropData(cropArea: Partial<CropArea>): void {
    this.core.setCropData(cropArea)
  }

  /**
   * 缩放
   * @param ratio 缩放比例
   */
  zoom(ratio: number): void {
    this.core.zoom(ratio)
  }

  /**
   * 放大
   * @param step 缩放步长
   */
  zoomIn(step = 0.1): void {
    this.zoom(1 + step)
  }

  /**
   * 缩小
   * @param step 缩放步长
   */
  zoomOut(step = 0.1): void {
    this.zoom(1 - step)
  }

  /**
   * 旋转
   * @param angle 旋转角度（度）
   */
  rotate(angle: number): void {
    this.core.rotate(angle)
  }

  /**
   * 向左旋转
   * @param angle 旋转角度（度）
   */
  rotateLeft(angle = 90): void {
    this.rotate(-angle)
  }

  /**
   * 向右旋转
   * @param angle 旋转角度（度）
   */
  rotateRight(angle = 90): void {
    this.rotate(angle)
  }

  /**
   * 翻转
   * @param horizontal 是否水平翻转
   * @param vertical 是否垂直翻转
   */
  flip(horizontal?: boolean, vertical?: boolean): void {
    this.core.flip(horizontal, vertical)
  }

  /**
   * 水平翻转
   */
  flipHorizontal(): void {
    const cropData = this.getCropData()
    this.flip(!cropData.flipX, cropData.flipY)
  }

  /**
   * 垂直翻转
   */
  flipVertical(): void {
    const cropData = this.getCropData()
    this.flip(cropData.flipX, !cropData.flipY)
  }

  /**
   * 水平缩放
   * @param scale 缩放比例
   */
  scaleX(scale: number): void {
    this.core.scaleX(scale)
  }

  /**
   * 垂直缩放
   * @param scale 缩放比例
   */
  scaleY(scale: number): void {
    this.core.scaleY(scale)
  }

  /**
   * 重置
   */
  reset(): void {
    this.core.reset()
  }

  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on(event: CropperEventType, listener: CropperEventListener): void {
    this.core.on(event, listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  off(event: CropperEventType, listener: CropperEventListener): void {
    this.core.off(event, listener)
  }

  /**
   * 触发事件
   * @param event 事件类型
   * @param data 事件数据
   */
  emit(event: CropperEventType, data?: any): void {
    this.core.emit(event, data)
  }

  /**
   * 移动图片
   */
  moveImage(deltaX: number, deltaY: number): void {
    this.core.moveImage(deltaX, deltaY)
  }

  /**
   * 应用滤镜
   */
  applyFilter(filter: string): void {
    this.core.applyFilter(filter)
  }

  /**
   * 设置边框样式
   */
  setBorderStyle(style: string): void {
    this.core.setBorderStyle(style)
  }

  /**
   * 销毁裁剪器
   */
  destroy(): void {
    this.core.destroy()
  }

  /**
   * 设置裁剪形状
   * @param shape 裁剪形状
   */
  setShape(shape: CropShape): void {
    this.core.setShape(shape)
  }

  /**
   * 设置宽高比
   * @param aspectRatio 宽高比，null表示自由比例
   */
  setAspectRatio(aspectRatio: number | null): void {
    this.core.setAspectRatio(aspectRatio)
  }

  /**
   * 更新配置
   * @param config 新的配置
   */
  updateConfig(config: Partial<CropperOptions>): void {
    this.core.updateConfig(config)
  }

  /**
   * 获取核心实例（用于高级用法）
   * @returns 核心实例
   */
  getCore(): CropperCore {
    return this.core
  }

  // 静态方法

  /**
   * 创建裁剪器实例
   * @param options 配置选项
   * @returns 裁剪器实例
   */
  static create(options: CropperOptions): Cropper {
    return new Cropper(options)
  }

  /**
   * 检查浏览器兼容性
   * @returns 兼容性检查结果
   */
  static checkCompatibility(): {
    supported: boolean
    features: {
      canvas: boolean
      fileReader: boolean
      blob: boolean
      touch: boolean
    }
  } {
    const features = {
      canvas: !!document.createElement('canvas').getContext,
      fileReader: typeof FileReader !== 'undefined',
      blob: typeof Blob !== 'undefined',
      touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    }

    return {
      supported: features.canvas && features.fileReader && features.blob,
      features,
    }
  }

  /**
   * 获取版本信息
   * @returns 版本字符串
   */
  static getVersion(): string {
    return '0.1.0'
  }

  /**
   * 设置全局默认配置
   * @param options 默认配置
   */
  static setDefaults(options: Partial<CropperOptions>): void {
    // 这里可以实现全局默认配置的设置
    // 暂时留空，后续可以扩展
  }

  /**
   * 初始化工具栏
   * @param config 工具栏配置
   */
  private initializeToolbar(config: ToolbarConfig): void {
    const container = this.core.getContainer()
    this.toolbar = new Toolbar(container, this, config)
  }
}
