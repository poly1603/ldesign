/**
 * @file 预览面板组件
 * @description 显示裁剪预览和相关信息
 */

import { BaseComponent, type BaseComponentOptions } from './base-component'
import type { CropArea, ImageInfo } from '@/types'
import { ImageUtils } from '@/utils'

/**
 * 预览面板配置
 */
export interface PreviewPanelOptions extends BaseComponentOptions {
  /** 预览尺寸 */
  previewSize: { width: number; height: number }
  /** 是否显示信息 */
  showInfo: boolean
  /** 是否显示尺寸 */
  showDimensions: boolean
  /** 是否显示文件大小 */
  showFileSize: boolean
  /** 是否显示格式 */
  showFormat: boolean
  /** 是否实时更新 */
  realTimeUpdate: boolean
  /** 预览质量 */
  previewQuality: number
}

/**
 * 预览数据
 */
export interface PreviewData {
  /** 预览图片 */
  canvas: HTMLCanvasElement
  /** 裁剪区域 */
  cropArea: CropArea
  /** 图片信息 */
  imageInfo: ImageInfo
  /** 文件大小（字节） */
  fileSize: number
}

/**
 * 预览面板类
 */
export class PreviewPanel extends BaseComponent {
  /** 面板配置 */
  private panelOptions: PreviewPanelOptions

  /** 预览画布 */
  private previewCanvas: HTMLCanvasElement

  /** 预览上下文 */
  private previewContext: CanvasRenderingContext2D

  /** 信息容器 */
  private infoContainer: HTMLElement

  /** 当前预览数据 */
  private currentPreviewData: PreviewData | null = null

  /** 默认配置 */
  private static readonly DEFAULT_PREVIEW_OPTIONS: PreviewPanelOptions = {
    ...BaseComponent.DEFAULT_OPTIONS,
    previewSize: { width: 200, height: 200 },
    showInfo: true,
    showDimensions: true,
    showFileSize: true,
    showFormat: true,
    realTimeUpdate: true,
    previewQuality: 0.8,
  }

  /**
   * 构造函数
   * @param options 面板配置
   */
  constructor(options: Partial<PreviewPanelOptions> = {}) {
    // 设置PreviewPanel特定的配置
    const mergedOptions = { ...PreviewPanel.DEFAULT_PREVIEW_OPTIONS, ...options }

    // 初始化基础组件，但不立即调用initialize
    super('div', mergedOptions)
    this.panelOptions = mergedOptions

    // 创建预览画布
    this.previewCanvas = document.createElement('canvas')
    this.previewContext = this.previewCanvas.getContext('2d')!

    // 创建信息容器
    this.infoContainer = document.createElement('div')

    // 现在可以安全地初始化
    this.initialize()
  }

  /**
   * 获取组件名称
   */
  protected getComponentName(): string {
    return 'preview-panel'
  }

  /**
   * 渲染组件
   */
  protected render(): void {
    this.element.innerHTML = ''

    // 设置面板样式
    this.element.style.display = 'flex'
    this.element.style.flexDirection = 'column'
    this.element.style.gap = 'var(--ls-spacing-sm)'
    this.element.style.padding = 'var(--ls-padding-base)'
    this.element.style.backgroundColor = 'var(--ldesign-bg-color-container)'
    this.element.style.border = '1px solid var(--ldesign-border-color)'
    this.element.style.borderRadius = 'var(--ls-border-radius-base)'
    this.element.style.boxShadow = 'var(--ldesign-shadow-1)'

    // 渲染预览区域
    this.renderPreviewArea()

    // 渲染信息区域
    if (this.panelOptions.showInfo) {
      this.renderInfoArea()
    }
  }

  /**
   * 渲染预览区域
   */
  private renderPreviewArea(): void {
    const previewContainer = document.createElement('div')
    previewContainer.className = `${this.options.classPrefix}__preview-container`
    previewContainer.style.display = 'flex'
    previewContainer.style.alignItems = 'center'
    previewContainer.style.justifyContent = 'center'
    previewContainer.style.width = `${this.panelOptions.previewSize.width}px`
    previewContainer.style.height = `${this.panelOptions.previewSize.height}px`
    previewContainer.style.backgroundColor = 'var(--ldesign-bg-color-component)'
    previewContainer.style.border = '1px solid var(--ldesign-border-color)'
    previewContainer.style.borderRadius = 'var(--ls-border-radius-sm)'
    previewContainer.style.overflow = 'hidden'

    // 设置画布样式
    this.previewCanvas.className = `${this.options.classPrefix}__preview-canvas`
    this.previewCanvas.style.maxWidth = '100%'
    this.previewCanvas.style.maxHeight = '100%'
    this.previewCanvas.style.objectFit = 'contain'

    previewContainer.appendChild(this.previewCanvas)
    this.element.appendChild(previewContainer)
  }

  /**
   * 渲染信息区域
   */
  private renderInfoArea(): void {
    this.infoContainer.className = `${this.options.classPrefix}__preview-info`
    this.infoContainer.style.fontSize = 'var(--ls-font-size-xs)'
    this.infoContainer.style.color = 'var(--ldesign-text-color-secondary)'
    this.infoContainer.style.lineHeight = '1.4'

    this.element.appendChild(this.infoContainer)
    this.updateInfoDisplay()
  }

  /**
   * 更新预览
   * @param previewData 预览数据
   */
  updatePreview(previewData: PreviewData): void {
    this.currentPreviewData = previewData
    this.renderPreview()
    this.updateInfoDisplay()
  }

  /**
   * 渲染预览图片
   */
  private renderPreview(): void {
    if (!this.currentPreviewData) {
      this.clearPreview()
      return
    }

    const { canvas, cropArea } = this.currentPreviewData
    const { width: previewWidth, height: previewHeight } = this.panelOptions.previewSize

    // 计算预览尺寸，保持宽高比
    const aspectRatio = cropArea.width / cropArea.height
    let displayWidth = previewWidth
    let displayHeight = previewHeight

    if (aspectRatio > 1) {
      // 宽图
      displayHeight = previewWidth / aspectRatio
      if (displayHeight > previewHeight) {
        displayHeight = previewHeight
        displayWidth = previewHeight * aspectRatio
      }
    } else {
      // 高图
      displayWidth = previewHeight * aspectRatio
      if (displayWidth > previewWidth) {
        displayWidth = previewWidth
        displayHeight = previewWidth / aspectRatio
      }
    }

    // 设置画布尺寸
    this.previewCanvas.width = displayWidth
    this.previewCanvas.height = displayHeight

    // 清除画布
    this.previewContext.clearRect(0, 0, displayWidth, displayHeight)

    // 绘制预览图片
    this.previewContext.drawImage(
      canvas,
      0, 0, canvas.width, canvas.height,
      0, 0, displayWidth, displayHeight
    )
  }

  /**
   * 更新信息显示
   */
  private updateInfoDisplay(): void {
    if (!this.panelOptions.showInfo || !this.infoContainer) return

    if (!this.currentPreviewData) {
      this.infoContainer.innerHTML = '<div>暂无预览</div>'
      return
    }

    const { cropArea, imageInfo, fileSize } = this.currentPreviewData
    const infoItems: string[] = []

    // 显示尺寸
    if (this.panelOptions.showDimensions) {
      infoItems.push(`尺寸: ${Math.round(cropArea.width)} × ${Math.round(cropArea.height)}`)
    }

    // 显示文件大小
    if (this.panelOptions.showFileSize) {
      infoItems.push(`大小: ${this.formatFileSize(fileSize)}`)
    }

    // 显示格式
    if (this.panelOptions.showFormat && imageInfo.format) {
      infoItems.push(`格式: ${imageInfo.format.toUpperCase()}`)
    }

    // 显示位置
    infoItems.push(`位置: (${Math.round(cropArea.x)}, ${Math.round(cropArea.y)})`)

    // 显示旋转角度
    if (cropArea.rotation !== 0) {
      infoItems.push(`旋转: ${Math.round(cropArea.rotation * 180 / Math.PI)}°`)
    }

    // 显示翻转状态
    const flipStatus = []
    if (cropArea.flipX) flipStatus.push('水平')
    if (cropArea.flipY) flipStatus.push('垂直')
    if (flipStatus.length > 0) {
      infoItems.push(`翻转: ${flipStatus.join(', ')}`)
    }

    this.infoContainer.innerHTML = infoItems.map(item => `<div>${item}</div>`).join('')
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  /**
   * 清除预览
   */
  private clearPreview(): void {
    if (this.previewContext) {
      this.previewContext.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height)
    }
  }

  /**
   * 获取预览画布
   */
  getPreviewCanvas(): HTMLCanvasElement {
    return this.previewCanvas
  }

  /**
   * 获取当前预览数据
   */
  getCurrentPreviewData(): PreviewData | null {
    return this.currentPreviewData
  }

  /**
   * 设置预览尺寸
   * @param size 新尺寸
   */
  setPreviewSize(size: { width: number; height: number }): void {
    this.panelOptions.previewSize = size
    this.render()
    if (this.currentPreviewData) {
      this.renderPreview()
    }
  }

  /**
   * 设置信息显示选项
   * @param options 显示选项
   */
  setInfoOptions(options: {
    showInfo?: boolean
    showDimensions?: boolean
    showFileSize?: boolean
    showFormat?: boolean
  }): void {
    Object.assign(this.panelOptions, options)
    this.render()
  }

  /**
   * 设置实时更新
   * @param enabled 是否启用
   */
  setRealTimeUpdate(enabled: boolean): void {
    this.panelOptions.realTimeUpdate = enabled
  }

  /**
   * 导出预览图片
   * @param format 图片格式
   * @param quality 图片质量
   */
  exportPreview(format = 'image/png', quality = this.panelOptions.previewQuality): string {
    return this.previewCanvas.toDataURL(format, quality)
  }

  /**
   * 下载预览图片
   * @param filename 文件名
   * @param format 图片格式
   * @param quality 图片质量
   */
  downloadPreview(filename = 'cropped-image', format = 'image/png', quality = this.panelOptions.previewQuality): void {
    const dataURL = this.exportPreview(format, quality)
    const link = document.createElement('a')
    link.download = filename
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * 更新面板配置
   * @param options 新配置
   */
  updatePanelOptions(options: Partial<PreviewPanelOptions>): void {
    this.panelOptions = { ...this.panelOptions, ...options }
    this.render()
    if (this.currentPreviewData) {
      this.renderPreview()
    }
  }
}
