/**
 * 截图插件
 * 实现视频截图功能
 */

import { ControlPlugin } from '../../core/base-plugin'
import { createElement } from '../../utils/dom'
import { formatTime } from '../../utils/format'
import { generateId } from '../../utils/common'
import type { PluginContext, PluginMetadata } from '../../types/plugin'

/**
 * 截图插件配置选项
 */
export interface ScreenshotOptions {
  /** 是否启用截图功能 */
  enabled?: boolean
  /** 截图质量 (0-1) */
  quality?: number
  /** 截图格式 */
  format?: 'png' | 'jpeg' | 'webp'
  /** 截图文件名前缀 */
  filename?: string
  /** 是否自动下载截图 */
  autoDownload?: boolean
  /** 截图尺寸 */
  size?: {
    width?: number
    height?: number
  }
  /** 截图回调函数 */
  onScreenshot?: (dataUrl: string, filename: string) => void
  /** 是否显示截图按钮 */
  showButton?: boolean
  /** 快捷键 */
  hotkey?: string
}

/**
 * 截图配置
 */
export interface ScreenshotConfig extends ScreenshotOptions {
  container: HTMLElement
  videoElement: HTMLVideoElement
}

/**
 * 截图插件实现
 */
export class ScreenshotPlugin extends ControlPlugin {
  private _config: ScreenshotConfig
  private _canvas?: HTMLCanvasElement
  private _canvasContext?: CanvasRenderingContext2D

  constructor(options: ScreenshotOptions = {}) {
    const metadata: PluginMetadata = {
      name: 'screenshot',
      version: '1.0.0',
      description: '截图插件，支持视频截图和下载',
      author: 'LDesign Team',
      dependencies: []
    }

    super(metadata, options)

    this._config = this.createConfig(options)
  }

  /**
   * 截图配置
   */
  get config(): ScreenshotConfig {
    return { ...this._config }
  }

  /**
   * 截取当前帧
   */
  async capture(): Promise<string> {
    if (!this._canvas || !this._canvasContext) {
      throw new Error('Screenshot plugin not initialized')
    }

    const video = this._config.videoElement
    if (!video || video.readyState < 2) {
      throw new Error('Video not ready for screenshot')
    }

    try {
      // 设置画布尺寸
      const width = this._config.size?.width || video.videoWidth
      const height = this._config.size?.height || video.videoHeight

      this._canvas.width = width
      this._canvas.height = height

      // 绘制视频帧到画布
      this._canvasContext.drawImage(video, 0, 0, width, height)

      // 转换为数据URL
      const dataUrl = this._canvas.toDataURL(`image/${this._config.format}`, this._config.quality)

      // 生成文件名
      const context = this.getContext()
      const currentTime = context.player.status.currentTime
      const filename = this.generateFilename(currentTime)

      // 触发回调
      if (this._config.onScreenshot) {
        this._config.onScreenshot(dataUrl, filename)
      }

      // 自动下载
      if (this._config.autoDownload) {
        this.downloadScreenshot(dataUrl, filename)
      }

      this.emit('screenshot', { dataUrl, filename, timestamp: currentTime })

      return dataUrl

    } catch (error) {
      this.emit('screenshotError', { error })
      throw error
    }
  }

  /**
   * 下载截图
   */
  downloadScreenshot(dataUrl: string, filename: string): void {
    const link = createElement('a', {
      attributes: {
        href: dataUrl,
        download: filename
      },
      styles: {
        display: 'none'
      }
    })

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * 下载截图（别名方法）
   */
  async download(filename?: string): Promise<void> {
    const dataUrl = await this.capture()
    const finalFilename = filename || `${this._config.filename}-${Date.now()}.${this._config.format}`
    this.downloadScreenshot(dataUrl, finalFilename)
  }

  /**
   * 设置截图质量
   */
  setQuality(quality: number): void {
    this._config.quality = Math.max(0, Math.min(1, quality))
    this.emit('qualityChanged', { quality: this._config.quality })
  }

  /**
   * 设置截图格式
   */
  setFormat(format: 'png' | 'jpeg' | 'webp'): void {
    this._config.format = format
    this.emit('formatChanged', { format })
  }

  /**
   * 设置截图尺寸
   */
  setSize(width?: number, height?: number): void {
    this._config.size = { width, height }
    this.emit('sizeChanged', { size: this._config.size })
  }

  protected createButton(): HTMLElement {
    const button = createElement('button', {
      className: 'lv-controls__button lv-controls__screenshot-button',
      attributes: {
        'aria-label': '截图',
        'type': 'button',
        'title': '截图'
      },
      innerHTML: `
        <svg class="lv-icon lv-icon--screenshot" viewBox="0 0 24 24">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      `
    })

    // 绑定点击事件
    button.addEventListener('click', async () => {
      try {
        await this.capture()
      } catch (error) {
        console.error('Screenshot failed:', error)
      }
    })

    return button
  }

  protected createElement(): HTMLElement {
    // 截图插件不需要额外的UI元素
    return createElement('div', {
      className: 'lv-screenshot-plugin',
      styles: { display: 'none' }
    })
  }

  protected async onInstall(context: PluginContext): Promise<void> {
    await super.onInstall(context)

    this._config.container = context.player.container
    this._config.videoElement = context.player.videoElement

    // 创建画布
    this.createCanvas()

    // 绑定快捷键
    if (this._config.hotkey) {
      this.bindHotkey(context)
    }
  }

  protected async onUninstall(context: PluginContext): Promise<void> {
    // 清理画布
    if (this._canvas) {
      this._canvas.remove()
      this._canvas = undefined
      this._canvasContext = undefined
    }

    // 解绑快捷键
    if (this._config.hotkey) {
      this.unbindHotkey(context)
    }

    await super.onUninstall(context)
  }

  /**
   * 创建配置对象
   */
  private createConfig(options: ScreenshotOptions): ScreenshotConfig {
    return {
      enabled: true,
      quality: 0.9,
      format: 'png',
      filename: 'screenshot',
      autoDownload: true,
      showButton: true,
      hotkey: 'KeyS',
      ...options,
      container: null as any,
      videoElement: null as any
    }
  }

  /**
   * 创建画布
   */
  private createCanvas(): void {
    this._canvas = createElement('canvas', {
      styles: {
        display: 'none'
      }
    })

    this._canvasContext = this._canvas.getContext('2d')
    if (!this._canvasContext) {
      throw new Error('Failed to get canvas 2D context')
    }

    // 添加到文档中（隐藏）
    document.body.appendChild(this._canvas)
  }

  /**
   * 生成文件名
   */
  private generateFilename(currentTime: number): string {
    const timestamp = formatTime(currentTime).replace(/:/g, '-')
    const date = new Date().toISOString().split('T')[0]
    const extension = this._config.format === 'jpeg' ? 'jpg' : this._config.format

    return `${this._config.filename}-${date}-${timestamp}.${extension}`
  }

  /**
   * 绑定快捷键
   */
  private bindHotkey(context: PluginContext): void {
    const handleKeydown = async (event: KeyboardEvent) => {
      if (event.code === this._config.hotkey && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        try {
          await this.capture()
        } catch (error) {
          console.error('Screenshot hotkey failed:', error)
        }
      }
    }

    context.player.container.addEventListener('keydown', handleKeydown)

      // 保存引用以便后续解绑
      ; (this as any)._hotkeyHandler = handleKeydown
  }

  /**
   * 解绑快捷键
   */
  private unbindHotkey(context: PluginContext): void {
    const handler = (this as any)._hotkeyHandler
    if (handler) {
      context.player.container.removeEventListener('keydown', handler)
      delete (this as any)._hotkeyHandler
    }
  }
}
