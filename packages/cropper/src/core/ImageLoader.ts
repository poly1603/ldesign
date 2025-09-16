/**
 * @ldesign/cropper - 图像加载器
 * 
 * 负责加载和预处理图像
 */

import type { ImageSource, ImageMetadata, Size } from '../types';
import { loadImage, createCanvas } from '../utils';
import { SUPPORTED_IMAGE_FORMATS, MAX_IMAGE_SIZE, ERROR_MESSAGES } from '../constants';

/**
 * 图像加载器类
 * 
 * 提供图像加载、验证和预处理功能
 */
export class ImageLoader {
  /**
   * 加载图像
   * 
   * @param source 图像源
   * @returns Promise<HTMLImageElement>
   */
  static async loadImage(source: ImageSource): Promise<HTMLImageElement> {
    if (typeof source === 'string') {
      return this.loadImageFromURL(source);
    }
    
    if (source instanceof File) {
      return this.loadImageFromFile(source);
    }
    
    if (source instanceof HTMLImageElement) {
      return this.loadImageFromElement(source);
    }
    
    if (source instanceof HTMLCanvasElement) {
      return this.loadImageFromCanvas(source);
    }
    
    if (source instanceof ImageData) {
      return this.loadImageFromImageData(source);
    }
    
    throw new Error(ERROR_MESSAGES.INVALID_IMAGE_SOURCE);
  }

  /**
   * 从 URL 加载图像
   */
  private static async loadImageFromURL(url: string): Promise<HTMLImageElement> {
    try {
      const img = await loadImage(url);
      this.validateImage(img);
      return img;
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.IMAGE_LOAD_FAILED}: ${error}`);
    }
  }

  /**
   * 从文件加载图像
   */
  private static async loadImageFromFile(file: File): Promise<HTMLImageElement> {
    // 验证文件类型
    if (!this.isValidImageFile(file)) {
      throw new Error(ERROR_MESSAGES.UNSUPPORTED_FORMAT);
    }
    
    // 验证文件大小
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(ERROR_MESSAGES.IMAGE_TOO_LARGE);
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const dataURL = event.target?.result as string;
          const img = await this.loadImageFromURL(dataURL);
          resolve(img);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error(ERROR_MESSAGES.IMAGE_LOAD_FAILED));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * 从 HTMLImageElement 加载图像
   */
  private static async loadImageFromElement(img: HTMLImageElement): Promise<HTMLImageElement> {
    // 如果图像还没有加载完成，等待加载
    if (!img.complete) {
      return new Promise((resolve, reject) => {
        img.onload = () => {
          this.validateImage(img);
          resolve(img);
        };
        img.onerror = () => {
          reject(new Error(ERROR_MESSAGES.IMAGE_LOAD_FAILED));
        };
      });
    }
    
    this.validateImage(img);
    return img;
  }

  /**
   * 从 Canvas 加载图像
   */
  private static async loadImageFromCanvas(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
    const dataURL = canvas.toDataURL();
    return this.loadImageFromURL(dataURL);
  }

  /**
   * 从 ImageData 加载图像
   */
  private static async loadImageFromImageData(imageData: ImageData): Promise<HTMLImageElement> {
    const canvas = createCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);
    
    return this.loadImageFromCanvas(canvas);
  }

  /**
   * 验证图像是否有效
   */
  private static validateImage(img: HTMLImageElement): void {
    if (!img.naturalWidth || !img.naturalHeight) {
      throw new Error(ERROR_MESSAGES.INVALID_IMAGE_SOURCE);
    }
    
    // 检查图像尺寸是否过大
    const imageSize = img.naturalWidth * img.naturalHeight * 4; // RGBA
    if (imageSize > MAX_IMAGE_SIZE) {
      throw new Error(ERROR_MESSAGES.IMAGE_TOO_LARGE);
    }
  }

  /**
   * 验证文件是否为有效的图像文件
   */
  private static isValidImageFile(file: File): boolean {
    // 检查 MIME 类型
    if (!file.type.startsWith('image/')) {
      return false;
    }
    
    // 检查文件扩展名
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !SUPPORTED_IMAGE_FORMATS.includes(extension as any)) {
      return false;
    }
    
    return true;
  }

  /**
   * 获取图像元数据
   */
  static getImageMetadata(img: HTMLImageElement, file?: File): ImageMetadata {
    const originalSize: Size = {
      width: img.naturalWidth,
      height: img.naturalHeight
    };
    
    // 估算文件大小（如果没有提供文件）
    let fileSize = 0;
    if (file) {
      fileSize = file.size;
    } else {
      // 粗略估算：RGBA * 压缩比
      fileSize = originalSize.width * originalSize.height * 4 * 0.3;
    }
    
    // 从文件名或 MIME 类型推断格式
    let format: any = 'jpeg';
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension && SUPPORTED_IMAGE_FORMATS.includes(extension as any)) {
        format = extension === 'jpg' ? 'jpeg' : extension;
      }
    }
    
    return {
      originalSize,
      fileSize,
      format,
      createdAt: new Date()
    };
  }

  /**
   * 预加载图像（用于性能优化）
   */
  static preloadImage(src: string): Promise<HTMLImageElement> {
    return loadImage(src);
  }

  /**
   * 批量预加载图像
   */
  static async preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
    const promises = sources.map(src => this.preloadImage(src));
    return Promise.all(promises);
  }

  /**
   * 检查浏览器是否支持指定的图像格式
   */
  static isFormatSupported(format: string): boolean {
    const canvas = createCanvas(1, 1);
    const dataURL = canvas.toDataURL(`image/${format}`);
    return dataURL.startsWith(`data:image/${format}`);
  }

  /**
   * 获取支持的图像格式列表
   */
  static getSupportedFormats(): string[] {
    return SUPPORTED_IMAGE_FORMATS.filter(format => 
      this.isFormatSupported(format === 'jpg' ? 'jpeg' : format)
    );
  }
}
