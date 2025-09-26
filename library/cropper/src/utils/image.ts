/**
 * @ldesign/cropper 图片处理工具函数
 * 
 * 提供图片加载、格式检测、尺寸计算等图片处理工具函数
 */

import type { ImageSource, ImageFormat, Size, Point } from '../types';

// ============================================================================
// 图片加载和验证
// ============================================================================

/**
 * 加载图片
 * @param src 图片源
 * @param crossOrigin 跨域设置
 * @returns Promise<HTMLImageElement>
 */
export function loadImage(
  src: ImageSource,
  crossOrigin?: 'anonymous' | 'use-credentials'
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (src instanceof HTMLImageElement) {
      if (src.complete && src.naturalWidth > 0) {
        resolve(src);
      } else {
        const onLoad = () => {
          src.removeEventListener('load', onLoad);
          src.removeEventListener('error', onError);
          resolve(src);
        };
        const onError = () => {
          src.removeEventListener('load', onLoad);
          src.removeEventListener('error', onError);
          reject(new Error('Failed to load image'));
        };
        src.addEventListener('load', onLoad);
        src.addEventListener('error', onError);
      }
      return;
    }

    const img = new Image();
    
    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }

    const onLoad = () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
      resolve(img);
    };

    const onError = () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
      reject(new Error(`Failed to load image: ${typeof src === 'string' ? src : 'File'}`));
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);

    if (typeof src === 'string') {
      img.src = src;
    } else if (src instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(src);
    } else if (src instanceof HTMLCanvasElement) {
      img.src = src.toDataURL();
    } else if (src instanceof ImageData) {
      const canvas = document.createElement('canvas');
      canvas.width = src.width;
      canvas.height = src.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.putImageData(src, 0, 0);
        img.src = canvas.toDataURL();
      } else {
        reject(new Error('Failed to create canvas context'));
      }
    }
  });
}

/**
 * 检查是否为有效的图片文件
 * @param file 文件对象
 * @returns 是否为有效图片
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
  ];
  return validTypes.includes(file.type);
}

/**
 * 检查图片URL是否有效
 * @param url 图片URL
 * @returns Promise<boolean>
 */
export function isValidImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * 获取图片的MIME类型
 * @param file 文件对象
 * @returns MIME类型
 */
export function getImageMimeType(file: File): string {
  return file.type;
}

/**
 * 从文件扩展名推断MIME类型
 * @param filename 文件名
 * @returns MIME类型
 */
export function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml'
  };
  return mimeTypes[ext || ''] || 'image/jpeg';
}

// ============================================================================
// 图片尺寸和比例计算
// ============================================================================

/**
 * 获取图片的自然尺寸
 * @param img 图片元素
 * @returns 自然尺寸
 */
export function getNaturalSize(img: HTMLImageElement): Size {
  return {
    width: img.naturalWidth,
    height: img.naturalHeight
  };
}

/**
 * 获取图片的显示尺寸
 * @param img 图片元素
 * @returns 显示尺寸
 */
export function getDisplaySize(img: HTMLImageElement): Size {
  return {
    width: img.width,
    height: img.height
  };
}

/**
 * 计算图片的宽高比
 * @param size 图片尺寸
 * @returns 宽高比
 */
export function getAspectRatio(size: Size): number {
  return size.height === 0 ? 0 : size.width / size.height;
}

/**
 * 根据宽高比计算适合的尺寸
 * @param originalSize 原始尺寸
 * @param containerSize 容器尺寸
 * @param mode 适应模式
 * @returns 计算后的尺寸
 */
export function calculateFitSize(
  originalSize: Size,
  containerSize: Size,
  mode: 'contain' | 'cover' | 'fill' = 'contain'
): Size {
  const originalRatio = getAspectRatio(originalSize);
  const containerRatio = getAspectRatio(containerSize);

  switch (mode) {
    case 'contain': {
      if (originalRatio > containerRatio) {
        // 图片更宽，以宽度为准
        return {
          width: containerSize.width,
          height: containerSize.width / originalRatio
        };
      } else {
        // 图片更高，以高度为准
        return {
          width: containerSize.height * originalRatio,
          height: containerSize.height
        };
      }
    }
    case 'cover': {
      if (originalRatio > containerRatio) {
        // 图片更宽，以高度为准
        return {
          width: containerSize.height * originalRatio,
          height: containerSize.height
        };
      } else {
        // 图片更高，以宽度为准
        return {
          width: containerSize.width,
          height: containerSize.width / originalRatio
        };
      }
    }
    case 'fill':
      return containerSize;
    default:
      return originalSize;
  }
}

/**
 * 计算图片在容器中的居中位置
 * @param imageSize 图片尺寸
 * @param containerSize 容器尺寸
 * @returns 居中位置
 */
export function calculateCenterPosition(imageSize: Size, containerSize: Size): Point {
  return {
    x: (containerSize.width - imageSize.width) / 2,
    y: (containerSize.height - imageSize.height) / 2
  };
}

/**
 * 根据最大尺寸限制计算缩放后的尺寸
 * @param originalSize 原始尺寸
 * @param maxSize 最大尺寸
 * @returns 缩放后的尺寸
 */
export function calculateScaledSize(originalSize: Size, maxSize: Size): Size {
  const scaleX = maxSize.width / originalSize.width;
  const scaleY = maxSize.height / originalSize.height;
  const scale = Math.min(scaleX, scaleY, 1); // 不放大，只缩小

  return {
    width: originalSize.width * scale,
    height: originalSize.height * scale
  };
}

// ============================================================================
// 图片格式转换
// ============================================================================

/**
 * 将图片转换为Canvas
 * @param img 图片元素
 * @param size 目标尺寸（可选）
 * @returns Canvas元素
 */
export function imageToCanvas(img: HTMLImageElement, size?: Size): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const targetSize = size || getNaturalSize(img);
  canvas.width = targetSize.width;
  canvas.height = targetSize.height;

  ctx.drawImage(img, 0, 0, targetSize.width, targetSize.height);
  return canvas;
}

/**
 * 将Canvas转换为Blob
 * @param canvas Canvas元素
 * @param format 输出格式
 * @param quality 质量（0-1）
 * @returns Promise<Blob>
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat = 'image/png',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      format,
      quality
    );
  });
}

/**
 * 将Canvas转换为DataURL
 * @param canvas Canvas元素
 * @param format 输出格式
 * @param quality 质量（0-1）
 * @returns DataURL字符串
 */
export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  format: ImageFormat = 'image/png',
  quality: number = 0.92
): string {
  return canvas.toDataURL(format, quality);
}

/**
 * 将图片转换为指定格式的Blob
 * @param img 图片元素
 * @param format 输出格式
 * @param quality 质量（0-1）
 * @param size 目标尺寸（可选）
 * @returns Promise<Blob>
 */
export function convertImageFormat(
  img: HTMLImageElement,
  format: ImageFormat,
  quality: number = 0.92,
  size?: Size
): Promise<Blob> {
  const canvas = imageToCanvas(img, size);
  return canvasToBlob(canvas, format, quality);
}

// ============================================================================
// 图片压缩和优化
// ============================================================================

/**
 * 压缩图片
 * @param img 图片元素
 * @param maxSize 最大尺寸
 * @param quality 质量（0-1）
 * @param format 输出格式
 * @returns Promise<Blob>
 */
export function compressImage(
  img: HTMLImageElement,
  maxSize: Size,
  quality: number = 0.8,
  format: ImageFormat = 'image/jpeg'
): Promise<Blob> {
  const originalSize = getNaturalSize(img);
  const targetSize = calculateScaledSize(originalSize, maxSize);
  return convertImageFormat(img, format, quality, targetSize);
}

/**
 * 计算压缩后的文件大小（估算）
 * @param originalSize 原始尺寸
 * @param targetSize 目标尺寸
 * @param quality 质量
 * @param format 格式
 * @returns 估算的文件大小（字节）
 */
export function estimateCompressedSize(
  originalSize: Size,
  targetSize: Size,
  quality: number,
  format: ImageFormat
): number {
  const pixelCount = targetSize.width * targetSize.height;
  let bytesPerPixel: number;

  switch (format) {
    case 'image/jpeg':
      bytesPerPixel = 0.5 + (quality * 2); // JPEG压缩率估算
      break;
    case 'image/png':
      bytesPerPixel = 3; // PNG通常较大
      break;
    case 'image/webp':
      bytesPerPixel = 0.3 + (quality * 1.5); // WebP压缩率更好
      break;
    default:
      bytesPerPixel = 2;
  }

  return Math.round(pixelCount * bytesPerPixel);
}

// ============================================================================
// 图片信息提取
// ============================================================================

/**
 * 获取图片的基本信息
 * @param img 图片元素
 * @returns 图片信息对象
 */
export function getImageInfo(img: HTMLImageElement): {
  naturalSize: Size;
  displaySize: Size;
  aspectRatio: number;
  src: string;
} {
  const naturalSize = getNaturalSize(img);
  const displaySize = getDisplaySize(img);
  
  return {
    naturalSize,
    displaySize,
    aspectRatio: getAspectRatio(naturalSize),
    src: img.src
  };
}

/**
 * 从文件获取图片信息
 * @param file 文件对象
 * @returns Promise<图片信息>
 */
export function getImageInfoFromFile(file: File): Promise<{
  naturalSize: Size;
  aspectRatio: number;
  fileSize: number;
  mimeType: string;
  name: string;
}> {
  return new Promise((resolve, reject) => {
    if (!isValidImageFile(file)) {
      reject(new Error('Invalid image file'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const naturalSize = getNaturalSize(img);
      URL.revokeObjectURL(url);
      
      resolve({
        naturalSize,
        aspectRatio: getAspectRatio(naturalSize),
        fileSize: file.size,
        mimeType: file.type,
        name: file.name
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image from file'));
    };

    img.src = url;
  });
}

// ============================================================================
// 图片预览和缩略图
// ============================================================================

/**
 * 创建图片缩略图
 * @param img 图片元素
 * @param size 缩略图尺寸
 * @param quality 质量
 * @returns Promise<Blob>
 */
export function createThumbnail(
  img: HTMLImageElement,
  size: Size,
  quality: number = 0.8
): Promise<Blob> {
  const originalSize = getNaturalSize(img);
  const thumbnailSize = calculateFitSize(originalSize, size, 'cover');
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  canvas.width = size.width;
  canvas.height = size.height;

  // 计算裁剪位置以实现居中裁剪
  const scale = Math.max(size.width / originalSize.width, size.height / originalSize.height);
  const scaledWidth = originalSize.width * scale;
  const scaledHeight = originalSize.height * scale;
  const offsetX = (size.width - scaledWidth) / 2;
  const offsetY = (size.height - scaledHeight) / 2;

  ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
  
  return canvasToBlob(canvas, 'image/jpeg', quality);
}

/**
 * 创建图片预览URL
 * @param file 文件对象
 * @returns 预览URL
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * 释放预览URL
 * @param url 预览URL
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
