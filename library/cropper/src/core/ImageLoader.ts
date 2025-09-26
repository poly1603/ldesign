/**
 * @ldesign/cropper 图片加载器
 * 
 * 负责加载和预处理各种图片源，提供统一的图片加载接口
 */

import type { ImageSource, ImageInfo, Size } from '../types';
import { loadImage, isValidImageFile, getImageInfoFromFile, getNaturalSize } from '../utils/image';
import { isString, isFile, isImageElement, isCanvasElement } from '../utils/validation';
import { globalPerformanceMonitor } from '../utils/performance';

// ============================================================================
// 图片加载配置
// ============================================================================

/**
 * 图片加载配置接口
 */
export interface ImageLoadConfig {
  /** 跨域设置 */
  crossOrigin?: 'anonymous' | 'use-credentials';
  /** 加载超时时间（毫秒） */
  timeout: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试间隔（毫秒） */
  retryInterval: number;
  /** 是否启用缓存 */
  cache: boolean;
  /** 支持的图片格式 */
  supportedFormats: string[];
  /** 最大文件大小（字节） */
  maxFileSize: number;
  /** 最大图片尺寸 */
  maxImageSize: Size;
}

/**
 * 默认图片加载配置
 */
export const DEFAULT_IMAGE_LOAD_CONFIG: ImageLoadConfig = {
  crossOrigin: 'anonymous',
  timeout: 30000,
  maxRetries: 3,
  retryInterval: 1000,
  cache: true,
  supportedFormats: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
  ],
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxImageSize: { width: 8192, height: 8192 }
};

// ============================================================================
// 图片加载结果
// ============================================================================

/**
 * 图片加载结果接口
 */
export interface ImageLoadResult {
  /** 加载的图片元素 */
  image: HTMLImageElement;
  /** 图片信息 */
  info: ImageInfo;
  /** 加载耗时（毫秒） */
  loadTime: number;
  /** 是否来自缓存 */
  fromCache: boolean;
}

/**
 * 图片加载错误类
 */
export class ImageLoadError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly source?: ImageSource
  ) {
    super(message);
    this.name = 'ImageLoadError';
  }
}

// ============================================================================
// 图片加载器类
// ============================================================================

/**
 * 图片加载器类
 * 提供统一的图片加载接口，支持多种图片源和加载配置
 */
export class ImageLoader {
  private config: ImageLoadConfig;
  private cache: Map<string, ImageLoadResult> = new Map();
  private loadingPromises: Map<string, Promise<ImageLoadResult>> = new Map();

  constructor(config: Partial<ImageLoadConfig> = {}) {
    this.config = { ...DEFAULT_IMAGE_LOAD_CONFIG, ...config };
  }

  /**
   * 加载图片
   * @param source 图片源
   * @returns Promise<ImageLoadResult>
   */
  async load(source: ImageSource): Promise<ImageLoadResult> {
    const startTime = performance.now();
    
    try {
      // 验证图片源
      this.validateImageSource(source);
      
      // 生成缓存键
      const cacheKey = this.generateCacheKey(source);
      
      // 检查缓存
      if (this.config.cache && this.cache.has(cacheKey)) {
        const cachedResult = this.cache.get(cacheKey)!;
        globalPerformanceMonitor.record('image-load-cache-hit', performance.now() - startTime);
        return { ...cachedResult, fromCache: true };
      }
      
      // 检查是否正在加载
      if (this.loadingPromises.has(cacheKey)) {
        return await this.loadingPromises.get(cacheKey)!;
      }
      
      // 开始加载
      const loadPromise = this.performLoad(source, startTime);
      this.loadingPromises.set(cacheKey, loadPromise);
      
      try {
        const result = await loadPromise;
        
        // 缓存结果
        if (this.config.cache) {
          this.cache.set(cacheKey, result);
        }
        
        return result;
      } finally {
        this.loadingPromises.delete(cacheKey);
      }
    } catch (error) {
      globalPerformanceMonitor.record('image-load-error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * 预加载图片
   * @param sources 图片源数组
   * @returns Promise<ImageLoadResult[]>
   */
  async preload(sources: ImageSource[]): Promise<ImageLoadResult[]> {
    const promises = sources.map(source => this.load(source));
    return Promise.all(promises);
  }

  /**
   * 清除缓存
   * @param source 特定图片源（可选，不提供则清除所有缓存）
   */
  clearCache(source?: ImageSource): void {
    if (source) {
      const cacheKey = this.generateCacheKey(source);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 获取缓存大小
   * @returns 缓存项数量
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<ImageLoadConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 验证图片源
   * @param source 图片源
   */
  private validateImageSource(source: ImageSource): void {
    if (isString(source)) {
      if (!source.trim()) {
        throw new ImageLoadError('Image URL cannot be empty', 'INVALID_URL', source);
      }
    } else if (isFile(source)) {
      if (!isValidImageFile(source)) {
        throw new ImageLoadError('Invalid image file type', 'INVALID_FILE_TYPE', source);
      }
      if (source.size > this.config.maxFileSize) {
        throw new ImageLoadError('File size exceeds maximum limit', 'FILE_TOO_LARGE', source);
      }
    } else if (!isImageElement(source) && !isCanvasElement(source) && !(source instanceof ImageData)) {
      throw new ImageLoadError('Unsupported image source type', 'UNSUPPORTED_SOURCE', source);
    }
  }

  /**
   * 生成缓存键
   * @param source 图片源
   * @returns 缓存键
   */
  private generateCacheKey(source: ImageSource): string {
    if (isString(source)) {
      return `url:${source}`;
    } else if (isFile(source)) {
      return `file:${source.name}:${source.size}:${source.lastModified}`;
    } else if (isImageElement(source)) {
      return `img:${source.src}`;
    } else if (isCanvasElement(source)) {
      return `canvas:${source.toDataURL()}`;
    } else if (source instanceof ImageData) {
      return `imagedata:${source.width}x${source.height}`;
    }
    return 'unknown';
  }

  /**
   * 执行图片加载
   * @param source 图片源
   * @param startTime 开始时间
   * @returns Promise<ImageLoadResult>
   */
  private async performLoad(source: ImageSource, startTime: number): Promise<ImageLoadResult> {
    let retries = 0;
    
    while (retries <= this.config.maxRetries) {
      try {
        const image = await this.loadWithTimeout(source);
        
        // 验证图片尺寸
        this.validateImageSize(image);
        
        // 创建图片信息
        const info = this.createImageInfo(source, image);
        
        const loadTime = performance.now() - startTime;
        globalPerformanceMonitor.record('image-load-success', loadTime);
        
        return {
          image,
          info,
          loadTime,
          fromCache: false
        };
      } catch (error) {
        retries++;
        
        if (retries > this.config.maxRetries) {
          throw new ImageLoadError(
            `Failed to load image after ${this.config.maxRetries} retries: ${error.message}`,
            'LOAD_FAILED',
            source
          );
        }
        
        // 等待重试间隔
        await this.delay(this.config.retryInterval);
      }
    }
    
    throw new ImageLoadError('Unexpected error in image loading', 'UNKNOWN_ERROR', source);
  }

  /**
   * 带超时的图片加载
   * @param source 图片源
   * @returns Promise<HTMLImageElement>
   */
  private async loadWithTimeout(source: ImageSource): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, this.config.timeout);

      const cleanup = () => {
        clearTimeout(timeoutId);
      };

      loadImage(source, this.config.crossOrigin)
        .then(image => {
          cleanup();
          resolve(image);
        })
        .catch(error => {
          cleanup();
          reject(error);
        });
    });
  }

  /**
   * 验证图片尺寸
   * @param image 图片元素
   */
  private validateImageSize(image: HTMLImageElement): void {
    const size = getNaturalSize(image);
    const maxSize = this.config.maxImageSize;
    
    if (size.width > maxSize.width || size.height > maxSize.height) {
      throw new ImageLoadError(
        `Image size (${size.width}x${size.height}) exceeds maximum allowed size (${maxSize.width}x${maxSize.height})`,
        'IMAGE_TOO_LARGE'
      );
    }
    
    if (size.width === 0 || size.height === 0) {
      throw new ImageLoadError('Invalid image dimensions', 'INVALID_DIMENSIONS');
    }
  }

  /**
   * 创建图片信息
   * @param source 图片源
   * @param image 图片元素
   * @returns 图片信息
   */
  private createImageInfo(source: ImageSource, image: HTMLImageElement): ImageInfo {
    const naturalSize = getNaturalSize(image);
    
    return {
      source,
      naturalWidth: naturalSize.width,
      naturalHeight: naturalSize.height,
      displayWidth: image.width || naturalSize.width,
      displayHeight: image.height || naturalSize.height,
      format: this.detectImageFormat(source),
      size: this.getImageFileSize(source)
    };
  }

  /**
   * 检测图片格式
   * @param source 图片源
   * @returns 图片格式
   */
  private detectImageFormat(source: ImageSource): string | undefined {
    if (isFile(source)) {
      return source.type;
    } else if (isString(source)) {
      // 从URL扩展名推断格式
      const ext = source.toLowerCase().split('.').pop();
      const formatMap: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'bmp': 'image/bmp',
        'svg': 'image/svg+xml'
      };
      return formatMap[ext || ''];
    }
    return undefined;
  }

  /**
   * 获取图片文件大小
   * @param source 图片源
   * @returns 文件大小（字节）
   */
  private getImageFileSize(source: ImageSource): number | undefined {
    if (isFile(source)) {
      return source.size;
    }
    return undefined;
  }

  /**
   * 延迟函数
   * @param ms 延迟时间（毫秒）
   * @returns Promise<void>
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// 导出默认实例
// ============================================================================

/**
 * 默认图片加载器实例
 */
export const defaultImageLoader = new ImageLoader();
