/**
 * @file 图片加载器
 * @description 处理图片加载、验证和预处理
 */

import type { ImageInfo, Size } from '@/types'
import { ImageFormat } from '@/types'
import { ImageUtils } from '@/utils'

/**
 * 图片加载选项
 */
export interface ImageLoadOptions {
  /** 最大文件大小（字节） */
  maxSize?: number
  /** 允许的图片格式 */
  allowedFormats?: ImageFormat[]
  /** 最大宽度 */
  maxWidth?: number
  /** 最大高度 */
  maxHeight?: number
  /** 是否启用跨域 */
  crossOrigin?: boolean | string
  /** 加载超时时间（毫秒） */
  timeout?: number
  /** 是否启用缓存 */
  cache?: boolean
}

/**
 * 图片加载结果
 */
export interface ImageLoadResult {
  /** 图片元素 */
  image: HTMLImageElement
  /** 图片信息 */
  info: ImageInfo
  /** 是否来自缓存 */
  fromCache: boolean
}

/**
 * 图片加载器类
 * 提供图片加载、验证、缓存等功能
 */
export class ImageLoader {
  /** 图片缓存 */
  private cache = new Map<string, ImageLoadResult>()

  /** 默认配置 */
  private defaultOptions: Required<ImageLoadOptions> = {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedFormats: [ImageFormat.JPEG, ImageFormat.PNG, ImageFormat.WebP, ImageFormat.BMP],
    maxWidth: 8192,
    maxHeight: 8192,
    crossOrigin: true,
    timeout: 30000, // 30秒
    cache: true,
  }

  /**
   * 构造函数
   * @param options 默认选项
   */
  constructor(options: Partial<ImageLoadOptions> = {}) {
    this.defaultOptions = { ...this.defaultOptions, ...options }
  }

  /**
   * 加载图片
   * @param src 图片源
   * @param options 加载选项
   * @returns Promise<ImageLoadResult>
   */
  async load(
    src: string | File | HTMLImageElement,
    options: Partial<ImageLoadOptions> = {},
  ): Promise<ImageLoadResult> {
    const opts = { ...this.defaultOptions, ...options }

    // 如果已经是 HTMLImageElement，直接处理
    if (src instanceof HTMLImageElement) {
      return this.processLoadedImage(src, opts)
    }

    // 生成缓存键
    const cacheKey = this.generateCacheKey(src)

    // 检查缓存
    if (opts.cache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      return { ...cached, fromCache: true }
    }

    try {
      // 验证输入
      await this.validateInput(src, opts)

      // 加载图片
      const image = await this.loadImageElement(src, opts)

      // 验证加载的图片
      this.validateLoadedImage(image, opts)

      // 创建结果
      const result: ImageLoadResult = {
        image,
        info: this.createImageInfo(image, src),
        fromCache: false,
      }

      // 缓存结果
      if (opts.cache) {
        this.cache.set(cacheKey, result)
      }

      return result
    } catch (error) {
      throw new Error(`Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 预加载图片
   * @param sources 图片源数组
   * @param options 加载选项
   * @returns Promise<ImageLoadResult[]>
   */
  async preload(
    sources: Array<string | File | HTMLImageElement>,
    options: Partial<ImageLoadOptions> = {},
  ): Promise<ImageLoadResult[]> {
    const promises = sources.map(src => this.load(src, options))
    return Promise.all(promises)
  }

  /**
   * 清除缓存
   * @param src 可选的特定图片源，不提供则清除所有缓存
   */
  clearCache(src?: string | File): void {
    if (src) {
      const cacheKey = this.generateCacheKey(src)
      this.cache.delete(cacheKey)
    } else {
      this.cache.clear()
    }
  }

  /**
   * 获取缓存大小
   * @returns 缓存项数量
   */
  getCacheSize(): number {
    return this.cache.size
  }

  /**
   * 验证输入
   * @param src 图片源
   * @param options 选项
   */
  private async validateInput(src: string | File, options: ImageLoadOptions): Promise<void> {
    if (typeof src === 'string') {
      // 验证 URL
      if (!this.isValidUrl(src)) {
        throw new Error('Invalid image URL')
      }
    } else if (src instanceof File) {
      // 验证文件
      if (!src.type.startsWith('image/')) {
        throw new Error('File is not an image')
      }

      if (src.size > options.maxSize!) {
        throw new Error(`File size (${src.size} bytes) exceeds maximum allowed size (${options.maxSize} bytes)`)
      }

      const format = src.type as ImageFormat
      if (!options.allowedFormats!.includes(format)) {
        throw new Error(`Image format ${format} is not allowed`)
      }
    }
  }

  /**
   * 加载图片元素
   * @param src 图片源
   * @param options 选项
   * @returns Promise<HTMLImageElement>
   */
  private async loadImageElement(
    src: string | File,
    options: ImageLoadOptions,
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      // 设置跨域
      if (options.crossOrigin && typeof src === 'string') {
        img.crossOrigin = typeof options.crossOrigin === 'string'
          ? options.crossOrigin
          : 'anonymous'
      }

      // 设置超时
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image load timeout after ${options.timeout}ms`))
      }, options.timeout)

      // 成功加载
      img.onload = () => {
        clearTimeout(timeoutId)
        resolve(img)
      }

      // 加载失败
      img.onerror = () => {
        clearTimeout(timeoutId)
        reject(new Error('Failed to load image'))
      }

      // 设置图片源
      if (typeof src === 'string') {
        img.src = src
      } else {
        // File 对象需要转换为 Data URL
        const reader = new FileReader()
        reader.onload = (e) => {
          img.src = e.target?.result as string
        }
        reader.onerror = () => {
          clearTimeout(timeoutId)
          reject(new Error('Failed to read file'))
        }
        reader.readAsDataURL(src)
      }
    })
  }

  /**
   * 验证加载的图片
   * @param image 图片元素
   * @param options 选项
   */
  private validateLoadedImage(image: HTMLImageElement, options: ImageLoadOptions): void {
    if (image.naturalWidth === 0 || image.naturalHeight === 0) {
      throw new Error('Invalid image: zero dimensions')
    }

    if (image.naturalWidth > options.maxWidth!) {
      throw new Error(`Image width (${image.naturalWidth}) exceeds maximum allowed width (${options.maxWidth})`)
    }

    if (image.naturalHeight > options.maxHeight!) {
      throw new Error(`Image height (${image.naturalHeight}) exceeds maximum allowed height (${options.maxHeight})`)
    }
  }

  /**
   * 处理已加载的图片
   * @param image 图片元素
   * @param options 选项
   * @returns ImageLoadResult
   */
  private processLoadedImage(
    image: HTMLImageElement,
    options: ImageLoadOptions,
  ): ImageLoadResult {
    this.validateLoadedImage(image, options)

    return {
      image,
      info: this.createImageInfo(image, image.src),
      fromCache: false,
    }
  }

  /**
   * 创建图片信息
   * @param image 图片元素
   * @param src 原始源
   * @returns ImageInfo
   */
  private createImageInfo(image: HTMLImageElement, src: string | File): ImageInfo {
    const format = typeof src === 'string'
      ? ImageUtils.getImageFormat(src)
      : (src.type as ImageFormat)

    return {
      src: typeof src === 'string' ? src : src.name,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      displayWidth: image.width || image.naturalWidth,
      displayHeight: image.height || image.naturalHeight,
      format,
      size: typeof src === 'string' ? undefined : src.size,
      lastModified: typeof src === 'string' ? undefined : src.lastModified,
    }
  }

  /**
   * 生成缓存键
   * @param src 图片源
   * @returns 缓存键
   */
  private generateCacheKey(src: string | File): string {
    if (typeof src === 'string') {
      return src
    }
    return `${src.name}_${src.size}_${src.lastModified}`
  }

  /**
   * 验证 URL 是否有效
   * @param url URL 字符串
   * @returns 是否有效
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      // 可能是相对路径
      return url.length > 0 && !url.includes('<') && !url.includes('>')
    }
  }

  /**
   * 销毁加载器
   * 清理缓存和资源
   */
  destroy(): void {
    this.cache.clear()
  }
}
