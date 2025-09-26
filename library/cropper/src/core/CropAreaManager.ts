/**
 * @ldesign/cropper 裁剪区域管理器
 * 
 * 负责管理裁剪区域的创建、更新、验证和计算
 */

import type {
  Point,
  Size,
  Rect,
  CropArea,
  CropShape,
  CropConstraints,
  Matrix,
  ImageInfo
} from '../types';
import {
  clamp,
  isPointInRect,
  isRectIntersecting,
  rectIntersection,
  getRectCenter,
  createRectFromCenter,
  distance,
  transformPoint,
  createIdentityMatrix
} from '../utils/math';
import { isValidRect, isValidPoint, isValidSize } from '../utils/validation';
import { globalPerformanceMonitor } from '../utils/performance';

// ============================================================================
// 裁剪区域配置
// ============================================================================

/**
 * 裁剪区域管理器配置接口
 */
export interface CropAreaManagerConfig {
  /** 默认裁剪形状 */
  defaultShape: CropShape;
  /** 最小裁剪尺寸 */
  minCropSize: Size;
  /** 最大裁剪尺寸 */
  maxCropSize?: Size;
  /** 裁剪约束 */
  constraints: CropConstraints;
  /** 是否保持宽高比 */
  maintainAspectRatio: boolean;
  /** 默认宽高比 */
  aspectRatio?: number;
  /** 是否允许超出图片边界 */
  allowOutOfBounds: boolean;
  /** 网格对齐 */
  snapToGrid: boolean;
  /** 网格大小 */
  gridSize: number;
}

/**
 * 默认裁剪区域管理器配置
 */
export const DEFAULT_CROP_AREA_CONFIG: CropAreaManagerConfig = {
  defaultShape: 'rectangle',
  minCropSize: { width: 10, height: 10 },
  constraints: {
    minWidth: 10,
    minHeight: 10,
    maxWidth: Infinity,
    maxHeight: Infinity,
    aspectRatio: undefined
  },
  maintainAspectRatio: false,
  allowOutOfBounds: false,
  snapToGrid: false,
  gridSize: 1
};

// ============================================================================
// 裁剪区域验证结果
// ============================================================================

/**
 * 裁剪区域验证结果接口
 */
export interface CropAreaValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors: string[];
  /** 警告信息 */
  warnings: string[];
  /** 修正后的裁剪区域 */
  correctedArea?: CropArea;
}

// ============================================================================
// 裁剪区域管理器类
// ============================================================================

/**
 * 裁剪区域管理器类
 * 负责管理裁剪区域的创建、更新、验证和计算
 */
export class CropAreaManager {
  private config: CropAreaManagerConfig;
  private currentArea: CropArea | null = null;
  private imageInfo: ImageInfo | null = null;
  private containerSize: Size | null = null;
  private transform: Matrix = createIdentityMatrix();

  constructor(config: Partial<CropAreaManagerConfig> = {}) {
    this.config = { ...DEFAULT_CROP_AREA_CONFIG, ...config };
  }

  /**
   * 设置图片信息
   * @param imageInfo 图片信息
   */
  setImageInfo(imageInfo: ImageInfo): void {
    this.imageInfo = imageInfo;
  }

  /**
   * 设置容器尺寸
   * @param size 容器尺寸
   */
  setContainerSize(size: Size): void {
    this.containerSize = size;
  }

  /**
   * 设置变换矩阵
   * @param transform 变换矩阵
   */
  setTransform(transform: Matrix): void {
    this.transform = transform;
  }

  /**
   * 创建裁剪区域
   * @param rect 矩形区域
   * @param shape 裁剪形状
   * @returns 裁剪区域
   */
  createCropArea(rect: Rect, shape: CropShape = this.config.defaultShape): CropArea {
    const startTime = performance.now();

    try {
      // 验证输入参数
      if (!isValidRect(rect)) {
        throw new Error('Invalid rectangle for crop area');
      }

      // 应用约束
      const constrainedRect = this.applyConstraints(rect);

      // 创建裁剪区域
      const cropArea: CropArea = {
        id: this.generateId(),
        shape,
        rect: constrainedRect,
        rotation: 0,
        editable: true,
        visible: true,
        locked: false,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      };

      // 验证裁剪区域
      const validation = this.validateCropArea(cropArea);
      if (!validation.valid) {
        throw new Error(`Invalid crop area: ${validation.errors.join(', ')}`);
      }

      this.currentArea = cropArea;
      globalPerformanceMonitor.record('crop-area-create', performance.now() - startTime);

      return cropArea;
    } catch (error) {
      globalPerformanceMonitor.record('crop-area-create-error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * 更新裁剪区域
   * @param updates 更新内容
   * @returns 更新后的裁剪区域
   */
  updateCropArea(updates: Partial<CropArea>): CropArea | null {
    if (!this.currentArea) {
      throw new Error('No crop area to update');
    }

    const startTime = performance.now();

    try {
      // 创建更新后的裁剪区域
      const updatedArea: CropArea = {
        ...this.currentArea,
        ...updates,
        metadata: {
          ...this.currentArea.metadata,
          updatedAt: Date.now()
        }
      };

      // 如果更新了矩形，应用约束
      if (updates.rect) {
        updatedArea.rect = this.applyConstraints(updates.rect);
      }

      // 验证更新后的裁剪区域
      const validation = this.validateCropArea(updatedArea);
      if (!validation.valid) {
        // 如果验证失败但有修正版本，使用修正版本
        if (validation.correctedArea) {
          this.currentArea = validation.correctedArea;
          globalPerformanceMonitor.record('crop-area-update-corrected', performance.now() - startTime);
          return validation.correctedArea;
        }
        throw new Error(`Invalid crop area update: ${validation.errors.join(', ')}`);
      }

      this.currentArea = updatedArea;
      globalPerformanceMonitor.record('crop-area-update', performance.now() - startTime);

      return updatedArea;
    } catch (error) {
      globalPerformanceMonitor.record('crop-area-update-error', performance.now() - startTime);
      throw error;
    }
  }

  /**
   * 移动裁剪区域
   * @param delta 移动偏移量
   * @returns 移动后的裁剪区域
   */
  moveCropArea(delta: Point): CropArea | null {
    if (!this.currentArea) {
      return null;
    }

    const newRect = {
      ...this.currentArea.rect,
      x: this.currentArea.rect.x + delta.x,
      y: this.currentArea.rect.y + delta.y
    };

    return this.updateCropArea({ rect: newRect });
  }

  /**
   * 调整裁剪区域大小
   * @param newSize 新尺寸
   * @param anchor 锚点位置
   * @returns 调整后的裁剪区域
   */
  resizeCropArea(newSize: Size, anchor: Point = { x: 0.5, y: 0.5 }): CropArea | null {
    if (!this.currentArea) {
      return null;
    }

    const currentRect = this.currentArea.rect;
    const anchorPoint = {
      x: currentRect.x + currentRect.width * anchor.x,
      y: currentRect.y + currentRect.height * anchor.y
    };

    const newRect = {
      x: anchorPoint.x - newSize.width * anchor.x,
      y: anchorPoint.y - newSize.height * anchor.y,
      width: newSize.width,
      height: newSize.height
    };

    return this.updateCropArea({ rect: newRect });
  }

  /**
   * 旋转裁剪区域
   * @param angle 旋转角度（弧度）
   * @param center 旋转中心点
   * @returns 旋转后的裁剪区域
   */
  rotateCropArea(angle: number, center?: Point): CropArea | null {
    if (!this.currentArea) {
      return null;
    }

    const newRotation = this.currentArea.rotation + angle;
    return this.updateCropArea({ rotation: newRotation });
  }

  /**
   * 获取当前裁剪区域
   * @returns 当前裁剪区域
   */
  getCurrentCropArea(): CropArea | null {
    return this.currentArea;
  }

  /**
   * 清除裁剪区域
   */
  clearCropArea(): void {
    this.currentArea = null;
  }

  /**
   * 验证裁剪区域
   * @param cropArea 裁剪区域
   * @returns 验证结果
   */
  validateCropArea(cropArea: CropArea): CropAreaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let correctedArea: CropArea | undefined;

    // 验证基本结构
    if (!isValidRect(cropArea.rect)) {
      errors.push('Invalid rectangle in crop area');
    }

    // 验证尺寸约束
    const sizeValidation = this.validateSize(cropArea.rect);
    if (!sizeValidation.valid) {
      if (sizeValidation.corrected) {
        correctedArea = { ...cropArea, rect: sizeValidation.corrected };
        warnings.push('Crop area size was adjusted to meet constraints');
      } else {
        errors.push('Crop area size violates constraints');
      }
    }

    // 验证边界约束
    if (!this.config.allowOutOfBounds && this.imageInfo) {
      const boundsValidation = this.validateBounds(cropArea.rect);
      if (!boundsValidation.valid) {
        if (boundsValidation.corrected) {
          correctedArea = { ...cropArea, rect: boundsValidation.corrected };
          warnings.push('Crop area was moved to stay within image bounds');
        } else {
          errors.push('Crop area is outside image bounds');
        }
      }
    }

    // 验证宽高比约束
    if (this.config.maintainAspectRatio && this.config.aspectRatio) {
      const aspectValidation = this.validateAspectRatio(cropArea.rect);
      if (!aspectValidation.valid) {
        if (aspectValidation.corrected) {
          correctedArea = { ...cropArea, rect: aspectValidation.corrected };
          warnings.push('Crop area was adjusted to maintain aspect ratio');
        } else {
          errors.push('Crop area violates aspect ratio constraint');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      correctedArea
    };
  }

  /**
   * 计算裁剪区域的实际像素坐标
   * @param cropArea 裁剪区域
   * @returns 实际像素坐标
   */
  getActualCropRect(cropArea: CropArea = this.currentArea!): Rect | null {
    if (!cropArea || !this.imageInfo) {
      return null;
    }

    // 应用变换矩阵
    const topLeft = transformPoint({ x: cropArea.rect.x, y: cropArea.rect.y }, this.transform);
    const bottomRight = transformPoint({
      x: cropArea.rect.x + cropArea.rect.width,
      y: cropArea.rect.y + cropArea.rect.height
    }, this.transform);

    return {
      x: Math.min(topLeft.x, bottomRight.x),
      y: Math.min(topLeft.y, bottomRight.y),
      width: Math.abs(bottomRight.x - topLeft.x),
      height: Math.abs(bottomRight.y - topLeft.y)
    };
  }





  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<CropAreaManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 应用约束到矩形
   * @param rect 原始矩形
   * @returns 应用约束后的矩形
   */
  private applyConstraints(rect: Rect): Rect {
    let constrainedRect = { ...rect };

    // 应用尺寸约束
    constrainedRect.width = clamp(
      constrainedRect.width,
      this.config.constraints.minWidth,
      this.config.constraints.maxWidth
    );
    constrainedRect.height = clamp(
      constrainedRect.height,
      this.config.constraints.minHeight,
      this.config.constraints.maxHeight
    );

    // 应用最小尺寸约束
    constrainedRect.width = Math.max(constrainedRect.width, this.config.minCropSize.width);
    constrainedRect.height = Math.max(constrainedRect.height, this.config.minCropSize.height);

    // 应用最大尺寸约束
    if (this.config.maxCropSize) {
      constrainedRect.width = Math.min(constrainedRect.width, this.config.maxCropSize.width);
      constrainedRect.height = Math.min(constrainedRect.height, this.config.maxCropSize.height);
    }

    // 应用宽高比约束
    if (this.config.maintainAspectRatio && this.config.aspectRatio) {
      const targetRatio = this.config.aspectRatio;
      const currentRatio = constrainedRect.width / constrainedRect.height;

      if (Math.abs(currentRatio - targetRatio) > 0.001) {
        if (currentRatio > targetRatio) {
          // 宽度过大，调整宽度
          constrainedRect.width = constrainedRect.height * targetRatio;
        } else {
          // 高度过大，调整高度
          constrainedRect.height = constrainedRect.width / targetRatio;
        }
      }
    }

    // 应用网格对齐
    if (this.config.snapToGrid) {
      const gridSize = this.config.gridSize;
      constrainedRect.x = Math.round(constrainedRect.x / gridSize) * gridSize;
      constrainedRect.y = Math.round(constrainedRect.y / gridSize) * gridSize;
      constrainedRect.width = Math.round(constrainedRect.width / gridSize) * gridSize;
      constrainedRect.height = Math.round(constrainedRect.height / gridSize) * gridSize;
    }

    return constrainedRect;
  }

  /**
   * 验证尺寸
   * @param rect 矩形
   * @returns 验证结果
   */
  private validateSize(rect: Rect): { valid: boolean; corrected?: Rect } {
    const minSize = this.config.minCropSize;
    const maxSize = this.config.maxCropSize;

    if (rect.width < minSize.width || rect.height < minSize.height) {
      const corrected = {
        ...rect,
        width: Math.max(rect.width, minSize.width),
        height: Math.max(rect.height, minSize.height)
      };
      return { valid: false, corrected };
    }

    if (maxSize && (rect.width > maxSize.width || rect.height > maxSize.height)) {
      const corrected = {
        ...rect,
        width: Math.min(rect.width, maxSize.width),
        height: Math.min(rect.height, maxSize.height)
      };
      return { valid: false, corrected };
    }

    return { valid: true };
  }

  /**
   * 验证边界
   * @param rect 矩形
   * @returns 验证结果
   */
  private validateBounds(rect: Rect): { valid: boolean; corrected?: Rect } {
    if (!this.imageInfo) {
      return { valid: true };
    }

    const imageBounds = {
      x: 0,
      y: 0,
      width: this.imageInfo.naturalWidth,
      height: this.imageInfo.naturalHeight
    };

    if (!isRectIntersecting(rect, imageBounds)) {
      return { valid: false };
    }

    const intersection = rectIntersection(rect, imageBounds);
    if (!intersection ||
      intersection.width < rect.width ||
      intersection.height < rect.height) {

      const corrected = {
        x: clamp(rect.x, 0, imageBounds.width - rect.width),
        y: clamp(rect.y, 0, imageBounds.height - rect.height),
        width: Math.min(rect.width, imageBounds.width),
        height: Math.min(rect.height, imageBounds.height)
      };

      return { valid: false, corrected };
    }

    return { valid: true };
  }

  /**
   * 验证宽高比
   * @param rect 矩形
   * @returns 验证结果
   */
  private validateAspectRatio(rect: Rect): { valid: boolean; corrected?: Rect } {
    if (!this.config.aspectRatio) {
      return { valid: true };
    }

    const targetRatio = this.config.aspectRatio;
    const currentRatio = rect.width / rect.height;

    if (Math.abs(currentRatio - targetRatio) > 0.001) {
      const center = getRectCenter(rect);
      let newWidth = rect.width;
      let newHeight = rect.height;

      if (currentRatio > targetRatio) {
        newWidth = rect.height * targetRatio;
      } else {
        newHeight = rect.width / targetRatio;
      }

      const corrected = createRectFromCenter(center, { width: newWidth, height: newHeight });
      return { valid: false, corrected };
    }

    return { valid: true };
  }

  /**
   * 生成唯一ID
   * @returns 唯一ID
   */
  private generateId(): string {
    return `crop-area-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
