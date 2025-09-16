/**
 * @ldesign/cropper - 工具函数集合
 * 
 * 提供图片裁剪插件所需的各种工具函数
 */

import type { Point, Size, Rect, Transform, AspectRatio } from '../types';

// ============================================================================
// 数学工具函数
// ============================================================================

/**
 * 限制数值在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 计算两点之间的距离
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 角度转弧度
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * 弧度转角度
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * 标准化角度到 0-360 度范围
 */
export function normalizeAngle(angle: number): number {
  angle = angle % 360;
  return angle < 0 ? angle + 360 : angle;
}

/**
 * 计算点绕中心点旋转后的新坐标
 */
export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const rad = degToRad(angle);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
}

// ============================================================================
// 几何工具函数
// ============================================================================

/**
 * 检查点是否在矩形内
 */
export function isPointInRect(point: Point, rect: Rect): boolean {
  return point.x >= rect.x && 
         point.x <= rect.x + rect.width &&
         point.y >= rect.y && 
         point.y <= rect.y + rect.height;
}

/**
 * 检查点是否在圆形内
 */
export function isPointInCircle(point: Point, center: Point, radius: number): boolean {
  return distance(point, center) <= radius;
}

/**
 * 计算矩形的中心点
 */
export function getRectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}

/**
 * 计算矩形的边界框
 */
export function getBoundingRect(points: Point[]): Rect {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;
  
  for (let i = 1; i < points.length; i++) {
    minX = Math.min(minX, points[i].x);
    minY = Math.min(minY, points[i].y);
    maxX = Math.max(maxX, points[i].x);
    maxY = Math.max(maxY, points[i].y);
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * 约束矩形在边界内
 */
export function constrainRect(rect: Rect, boundary: Rect): Rect {
  const result = { ...rect };
  
  // 确保不超出边界
  result.x = clamp(result.x, boundary.x, boundary.x + boundary.width - result.width);
  result.y = clamp(result.y, boundary.y, boundary.y + boundary.height - result.height);
  
  // 确保尺寸不超出边界
  result.width = Math.min(result.width, boundary.width);
  result.height = Math.min(result.height, boundary.height);
  
  return result;
}

// ============================================================================
// 宽高比工具函数
// ============================================================================

/**
 * 解析宽高比
 */
export function parseAspectRatio(ratio: AspectRatio): number | null {
  if (typeof ratio === 'number') {
    return ratio;
  }
  
  if (ratio === 'free') {
    return null;
  }
  
  const ratioMap: Record<string, number> = {
    '1:1': 1,
    '4:3': 4 / 3,
    '16:9': 16 / 9,
    '3:2': 3 / 2,
    '9:16': 9 / 16
  };
  
  return ratioMap[ratio] || null;
}

/**
 * 根据宽高比调整尺寸
 */
export function adjustSizeByAspectRatio(
  size: Size, 
  aspectRatio: number, 
  mode: 'width' | 'height' | 'fit' | 'fill' = 'fit'
): Size {
  if (mode === 'width') {
    return {
      width: size.width,
      height: size.width / aspectRatio
    };
  }
  
  if (mode === 'height') {
    return {
      width: size.height * aspectRatio,
      height: size.height
    };
  }
  
  const currentRatio = size.width / size.height;
  
  if (mode === 'fit') {
    if (currentRatio > aspectRatio) {
      // 以高度为准
      return {
        width: size.height * aspectRatio,
        height: size.height
      };
    } else {
      // 以宽度为准
      return {
        width: size.width,
        height: size.width / aspectRatio
      };
    }
  }
  
  if (mode === 'fill') {
    if (currentRatio > aspectRatio) {
      // 以宽度为准
      return {
        width: size.width,
        height: size.width / aspectRatio
      };
    } else {
      // 以高度为准
      return {
        width: size.height * aspectRatio,
        height: size.height
      };
    }
  }
  
  return size;
}

// ============================================================================
// 图像工具函数
// ============================================================================

/**
 * 加载图像
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    
    img.src = src;
  });
}

/**
 * 创建 Canvas 元素
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * 获取图像数据 URL
 */
export function getImageDataURL(
  canvas: HTMLCanvasElement, 
  format: string = 'image/png', 
  quality: number = 1
): string {
  return canvas.toDataURL(format, quality);
}

/**
 * Canvas 转 Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement, 
  format: string = 'image/png', 
  quality: number = 1
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
 * 计算适合容器的图像尺寸
 */
export function fitImageToContainer(
  imageSize: Size, 
  containerSize: Size, 
  mode: 'contain' | 'cover' = 'contain'
): Size {
  const imageRatio = imageSize.width / imageSize.height;
  const containerRatio = containerSize.width / containerSize.height;
  
  if (mode === 'contain') {
    if (imageRatio > containerRatio) {
      // 以宽度为准
      return {
        width: containerSize.width,
        height: containerSize.width / imageRatio
      };
    } else {
      // 以高度为准
      return {
        width: containerSize.height * imageRatio,
        height: containerSize.height
      };
    }
  } else {
    // cover 模式
    if (imageRatio > containerRatio) {
      // 以高度为准
      return {
        width: containerSize.height * imageRatio,
        height: containerSize.height
      };
    } else {
      // 以宽度为准
      return {
        width: containerSize.width,
        height: containerSize.width / imageRatio
      };
    }
  }
}

// ============================================================================
// 事件工具函数
// ============================================================================

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    }
  };
}

/**
 * 获取触摸事件的坐标
 */
export function getTouchPoint(event: TouchEvent): Point {
  const touch = event.touches[0] || event.changedTouches[0];
  return {
    x: touch.clientX,
    y: touch.clientY
  };
}

/**
 * 获取鼠标事件的坐标
 */
export function getMousePoint(event: MouseEvent): Point {
  return {
    x: event.clientX,
    y: event.clientY
  };
}

// ============================================================================
// 设备检测工具函数
// ============================================================================

/**
 * 检测是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * 检测是否支持触摸
 */
export function isTouchSupported(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * 检测是否支持 Pointer Events
 */
export function isPointerSupported(): boolean {
  return 'PointerEvent' in window;
}

/**
 * 获取设备像素比
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}
