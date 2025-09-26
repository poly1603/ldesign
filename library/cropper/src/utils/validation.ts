/**
 * @ldesign/cropper 验证工具函数
 * 
 * 提供参数验证、类型检查、配置验证等工具函数
 */

import type { Point, Size, Rect, CropShape, ImageFormat, Theme, Language } from '../types';

// ============================================================================
// 基础类型验证
// ============================================================================

/**
 * 检查是否为数字
 * @param value 要检查的值
 * @returns 是否为数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * 检查是否为正数
 * @param value 要检查的值
 * @returns 是否为正数
 */
export function isPositiveNumber(value: any): value is number {
  return isNumber(value) && value > 0;
}

/**
 * 检查是否为非负数
 * @param value 要检查的值
 * @returns 是否为非负数
 */
export function isNonNegativeNumber(value: any): value is number {
  return isNumber(value) && value >= 0;
}

/**
 * 检查是否为字符串
 * @param value 要检查的值
 * @returns 是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * 检查是否为非空字符串
 * @param value 要检查的值
 * @returns 是否为非空字符串
 */
export function isNonEmptyString(value: any): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * 检查是否为布尔值
 * @param value 要检查的值
 * @returns 是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查是否为对象
 * @param value 要检查的值
 * @returns 是否为对象
 */
export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 检查是否为数组
 * @param value 要检查的值
 * @returns 是否为数组
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * 检查是否为函数
 * @param value 要检查的值
 * @returns 是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

// ============================================================================
// DOM元素验证
// ============================================================================

/**
 * 检查是否为DOM元素
 * @param value 要检查的值
 * @returns 是否为DOM元素
 */
export function isElement(value: any): value is Element {
  return value instanceof Element;
}

/**
 * 检查是否为HTML元素
 * @param value 要检查的值
 * @returns 是否为HTML元素
 */
export function isHTMLElement(value: any): value is HTMLElement {
  if (!value || typeof value !== 'object') {
    return false;
  }

  // 首先尝试 instanceof 检查
  if (typeof HTMLElement !== 'undefined') {
    try {
      if (value instanceof HTMLElement) {
        return true;
      }
    } catch {
      // instanceof 可能在某些环境中失败
    }
  }

  // 降级检查：检查是否有 DOM 元素的基本属性
  return typeof value.nodeType === 'number' &&
    value.nodeType === 1 && // ELEMENT_NODE
    typeof value.tagName === 'string' &&
    typeof value.appendChild === 'function';
}

/**
 * 检查是否为Canvas元素
 * @param value 要检查的值
 * @returns 是否为Canvas元素
 */
export function isCanvasElement(value: any): value is HTMLCanvasElement {
  return value instanceof HTMLCanvasElement;
}

/**
 * 检查是否为Image元素
 * @param value 要检查的值
 * @returns 是否为Image元素
 */
export function isImageElement(value: any): value is HTMLImageElement {
  return value instanceof HTMLImageElement;
}

/**
 * 检查是否为File对象
 * @param value 要检查的值
 * @returns 是否为File对象
 */
export function isFile(value: any): value is File {
  return value instanceof File;
}

// ============================================================================
// 几何对象验证
// ============================================================================

/**
 * 验证点对象
 * @param value 要验证的值
 * @returns 是否为有效的点对象
 */
export function isValidPoint(value: any): value is Point {
  return isObject(value) &&
    isNumber(value.x) &&
    isNumber(value.y);
}

/**
 * 验证尺寸对象
 * @param value 要验证的值
 * @returns 是否为有效的尺寸对象
 */
export function isValidSize(value: any): value is Size {
  return isObject(value) &&
    isPositiveNumber(value.width) &&
    isPositiveNumber(value.height);
}

/**
 * 验证矩形对象
 * @param value 要验证的值
 * @returns 是否为有效的矩形对象
 */
export function isValidRect(value: any): value is Rect {
  return isObject(value) &&
    isNumber(value.x) &&
    isNumber(value.y) &&
    isPositiveNumber(value.width) &&
    isPositiveNumber(value.height);
}

// ============================================================================
// 枚举值验证
// ============================================================================

/**
 * 验证裁剪形状
 * @param value 要验证的值
 * @returns 是否为有效的裁剪形状
 */
export function isValidCropShape(value: any): value is CropShape {
  const validShapes: CropShape[] = ['rectangle', 'circle', 'ellipse', 'polygon'];
  return validShapes.includes(value);
}

/**
 * 验证图片格式
 * @param value 要验证的值
 * @returns 是否为有效的图片格式
 */
export function isValidImageFormat(value: any): value is ImageFormat {
  const validFormats: ImageFormat[] = ['image/jpeg', 'image/png', 'image/webp'];
  return validFormats.includes(value);
}

/**
 * 验证主题
 * @param value 要验证的值
 * @returns 是否为有效的主题
 */
export function isValidTheme(value: any): value is Theme {
  const validThemes: Theme[] = ['light', 'dark', 'auto'];
  return validThemes.includes(value);
}

/**
 * 验证语言
 * @param value 要验证的值
 * @returns 是否为有效的语言
 */
export function isValidLanguage(value: any): value is Language {
  const validLanguages: Language[] = ['zh-CN', 'en-US'];
  return validLanguages.includes(value);
}

// ============================================================================
// 范围验证
// ============================================================================

/**
 * 验证数值是否在指定范围内
 * @param value 要验证的值
 * @param min 最小值
 * @param max 最大值
 * @returns 是否在范围内
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return isNumber(value) && value >= min && value <= max;
}

/**
 * 验证质量参数（0-1）
 * @param value 要验证的值
 * @returns 是否为有效的质量参数
 */
export function isValidQuality(value: any): boolean {
  return isNumber(value) && isInRange(value, 0, 1);
}

/**
 * 验证角度（弧度）
 * @param value 要验证的值
 * @returns 是否为有效的角度
 */
export function isValidAngle(value: any): boolean {
  return isNumber(value) && isInRange(value, -Math.PI * 2, Math.PI * 2);
}

/**
 * 验证缩放比例
 * @param value 要验证的值
 * @param min 最小缩放比例
 * @param max 最大缩放比例
 * @returns 是否为有效的缩放比例
 */
export function isValidScale(value: any, min: number = 0.1, max: number = 10): boolean {
  return isNumber(value) && isInRange(value, min, max);
}

// ============================================================================
// 容器验证
// ============================================================================

/**
 * 验证容器元素或选择器
 * @param container 容器元素或选择器
 * @returns 验证结果
 */
export function validateContainer(container: string | HTMLElement): {
  valid: boolean;
  element?: HTMLElement;
  error?: string;
} {
  if (isHTMLElement(container)) {
    return { valid: true, element: container };
  }

  if (isNonEmptyString(container)) {
    try {
      const element = document.querySelector(container) as HTMLElement;
      if (element) {
        return { valid: true, element };
      } else {
        return { valid: false, error: `Element not found: ${container}` };
      }
    } catch (error) {
      return { valid: false, error: `Invalid selector: ${container}` };
    }
  }

  return { valid: false, error: 'Container must be an HTMLElement or a valid CSS selector' };
}

// ============================================================================
// 图片源验证
// ============================================================================

/**
 * 验证图片源
 * @param src 图片源
 * @returns 验证结果
 */
export function validateImageSource(src: any): {
  valid: boolean;
  type?: 'url' | 'file' | 'element' | 'canvas' | 'imageData';
  error?: string;
} {
  if (isNonEmptyString(src)) {
    // URL验证
    try {
      new URL(src);
      return { valid: true, type: 'url' };
    } catch {
      // 可能是相对路径
      return { valid: true, type: 'url' };
    }
  }

  if (isFile(src)) {
    if (src.type.startsWith('image/')) {
      return { valid: true, type: 'file' };
    } else {
      return { valid: false, error: 'File is not an image' };
    }
  }

  if (isImageElement(src)) {
    return { valid: true, type: 'element' };
  }

  if (isCanvasElement(src)) {
    return { valid: true, type: 'canvas' };
  }

  if (typeof ImageData !== 'undefined' && src instanceof ImageData) {
    return { valid: true, type: 'imageData' };
  }

  return { valid: false, error: 'Invalid image source' };
}

// ============================================================================
// 配置验证
// ============================================================================

/**
 * 验证裁剪配置
 * @param config 裁剪配置
 * @returns 验证结果
 */
export function validateCropConfig(config: any): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 验证必需字段
  if (!config.container) {
    errors.push('Container is required');
  } else {
    const containerValidation = validateContainer(config.container);
    if (!containerValidation.valid) {
      errors.push(containerValidation.error || 'Invalid container');
    }
  }

  // 验证可选字段
  if (config.src !== undefined) {
    const srcValidation = validateImageSource(config.src);
    if (!srcValidation.valid) {
      errors.push(srcValidation.error || 'Invalid image source');
    }
  }

  if (config.shape !== undefined && !isValidCropShape(config.shape)) {
    errors.push('Invalid crop shape');
  }

  if (config.aspectRatio !== undefined && !isPositiveNumber(config.aspectRatio)) {
    errors.push('Aspect ratio must be a positive number');
  }

  if (config.minCropSize !== undefined && !isValidSize(config.minCropSize)) {
    errors.push('Invalid minimum crop size');
  }

  if (config.maxCropSize !== undefined && !isValidSize(config.maxCropSize)) {
    errors.push('Invalid maximum crop size');
  }

  if (config.minZoom !== undefined && !isPositiveNumber(config.minZoom)) {
    errors.push('Minimum zoom must be a positive number');
  }

  if (config.maxZoom !== undefined && !isPositiveNumber(config.maxZoom)) {
    errors.push('Maximum zoom must be a positive number');
  }

  if (config.minZoom !== undefined && config.maxZoom !== undefined && config.minZoom >= config.maxZoom) {
    errors.push('Minimum zoom must be less than maximum zoom');
  }

  if (config.quality !== undefined && !isValidQuality(config.quality)) {
    errors.push('Quality must be a number between 0 and 1');
  }

  if (config.format !== undefined && !isValidImageFormat(config.format)) {
    errors.push('Invalid image format');
  }

  if (config.theme !== undefined && !isValidTheme(config.theme)) {
    errors.push('Invalid theme');
  }

  if (config.language !== undefined && !isValidLanguage(config.language)) {
    errors.push('Invalid language');
  }

  // 验证布尔值字段
  const booleanFields = [
    'showGrid', 'showControls', 'zoomable', 'rotatable', 'movable',
    'responsive', 'touchEnabled'
  ];

  booleanFields.forEach(field => {
    if (config[field] !== undefined && !isBoolean(config[field])) {
      errors.push(`${field} must be a boolean`);
    }
  });

  // 添加警告
  if (config.minCropSize && config.maxCropSize) {
    if (config.minCropSize.width >= config.maxCropSize.width ||
      config.minCropSize.height >= config.maxCropSize.height) {
      warnings.push('Minimum crop size should be smaller than maximum crop size');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 验证配置对象
 * @param config 配置对象
 * @returns 是否为有效配置
 */
export function isValidConfig(config: any): boolean {
  if (!config || typeof config !== 'object') {
    return false;
  }

  // 使用详细的配置验证
  const validation = validateCropConfig(config);
  return validation.valid;
}

// ============================================================================
// 运行时验证
// ============================================================================

/**
 * 断言函数
 * @param condition 条件
 * @param message 错误消息
 */
export function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * 验证参数不为空
 * @param value 要验证的值
 * @param name 参数名
 */
export function assertNotNull<T>(value: T | null | undefined, name: string): asserts value is T {
  if (value == null) {
    throw new Error(`${name} cannot be null or undefined`);
  }
}

/**
 * 验证参数为正数
 * @param value 要验证的值
 * @param name 参数名
 */
export function assertPositiveNumber(value: any, name: string): asserts value is number {
  if (!isPositiveNumber(value)) {
    throw new Error(`${name} must be a positive number, got: ${value}`);
  }
}

/**
 * 验证参数在范围内
 * @param value 要验证的值
 * @param min 最小值
 * @param max 最大值
 * @param name 参数名
 */
export function assertInRange(value: number, min: number, max: number, name: string): void {
  if (!isInRange(value, min, max)) {
    throw new Error(`${name} must be between ${min} and ${max}, got: ${value}`);
  }
}

/**
 * 验证参数为有效的矩形
 * @param value 要验证的值
 * @param name 参数名
 */
export function assertValidRect(value: any, name: string): asserts value is Rect {
  if (!isValidRect(value)) {
    throw new Error(`${name} must be a valid rectangle object`);
  }
}

/**
 * 验证参数为有效的点
 * @param value 要验证的值
 * @param name 参数名
 */
export function assertValidPoint(value: any, name: string): asserts value is Point {
  if (!isValidPoint(value)) {
    throw new Error(`${name} must be a valid point object`);
  }
}

/**
 * 验证参数为有效的尺寸
 * @param value 要验证的值
 * @param name 参数名
 */
export function assertValidSize(value: any, name: string): asserts value is Size {
  if (!isValidSize(value)) {
    throw new Error(`${name} must be a valid size object`);
  }
}
