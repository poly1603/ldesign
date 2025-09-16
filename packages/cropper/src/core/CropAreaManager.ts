/**
 * @ldesign/cropper - 裁剪区域管理器
 * 
 * 负责管理裁剪区域的创建、调整和约束
 */

import type { Point, Size, Rect, CropShape, AspectRatio, CropData, CropOptions } from '../types';
import {
  clamp,
  parseAspectRatio,
  adjustSizeByAspectRatio,
  constrainRect,
  getRectCenter
} from '../utils';
import { MIN_CROP_SIZE } from '../constants';

/**
 * 裁剪区域管理器类
 * 
 * 提供裁剪区域的创建、调整、约束和验证功能
 */
export class CropAreaManager {
  private cropArea: Rect = { x: 0, y: 0, width: 0, height: 0 };
  private aspectRatio: AspectRatio = 'free';
  private shape: CropShape = 'rect';
  private rotation: number = 0;
  private scale: number = 1;
  private flip = { horizontal: false, vertical: false };
  private options: CropOptions;
  private containerSize: Size = { width: 0, height: 0 };
  private imageSize: Size = { width: 0, height: 0 };
  private imageDisplaySize: Size = { width: 0, height: 0 };
  private imageOffset: Point = { x: 0, y: 0 };

  constructor(options: CropOptions = {}) {
    this.options = {
      minSize: { width: MIN_CROP_SIZE, height: MIN_CROP_SIZE },
      maintainAspectRatio: false,
      allowedShapes: ['rect'],
      allowRotation: true,
      allowScale: true,
      allowFlip: true,
      ...options
    };
  }

  /**
   * 设置容器尺寸
   */
  setContainerSize(size: Size): void {
    this.containerSize = size;
    this.updateImageDisplayInfo();
  }

  /**
   * 设置图像尺寸
   */
  setImageSize(size: Size): void {
    this.imageSize = size;
    this.updateImageDisplayInfo();
  }

  /**
   * 更新图像显示信息
   */
  private updateImageDisplayInfo(): void {
    if (this.containerSize.width === 0 || this.containerSize.height === 0 ||
        this.imageSize.width === 0 || this.imageSize.height === 0) {
      return;
    }

    // 计算图像在容器中的显示尺寸和位置
    const imageRatio = this.imageSize.width / this.imageSize.height;
    const containerRatio = this.containerSize.width / this.containerSize.height;

    if (imageRatio > containerRatio) {
      // 以宽度为准
      this.imageDisplaySize = {
        width: this.containerSize.width,
        height: this.containerSize.width / imageRatio
      };
    } else {
      // 以高度为准
      this.imageDisplaySize = {
        width: this.containerSize.height * imageRatio,
        height: this.containerSize.height
      };
    }

    // 计算图像偏移
    this.imageOffset = {
      x: (this.containerSize.width - this.imageDisplaySize.width) / 2,
      y: (this.containerSize.height - this.imageDisplaySize.height) / 2
    };
  }

  /**
   * 初始化裁剪区域
   */
  initializeCropArea(initialCrop?: Partial<CropData>): void {
    if (initialCrop?.area) {
      this.cropArea = { ...initialCrop.area };
    } else {
      // 默认裁剪区域为图像的80%
      const margin = 0.1;
      this.cropArea = {
        x: this.imageOffset.x + this.imageDisplaySize.width * margin,
        y: this.imageOffset.y + this.imageDisplaySize.height * margin,
        width: this.imageDisplaySize.width * (1 - margin * 2),
        height: this.imageDisplaySize.height * (1 - margin * 2)
      };
    }

    if (initialCrop?.aspectRatio) {
      this.setAspectRatio(initialCrop.aspectRatio);
    }

    if (initialCrop?.shape) {
      this.setShape(initialCrop.shape);
    }

    if (initialCrop?.rotation) {
      this.setRotation(initialCrop.rotation);
    }

    if (initialCrop?.scale) {
      this.setScale(initialCrop.scale);
    }

    if (initialCrop?.flip) {
      this.setFlip(initialCrop.flip.horizontal, initialCrop.flip.vertical);
    }

    this.constrainCropArea();
  }

  /**
   * 获取裁剪数据
   */
  getCropData(): CropData {
    return {
      area: { ...this.cropArea },
      aspectRatio: this.aspectRatio,
      shape: this.shape,
      rotation: this.rotation,
      scale: this.scale,
      flip: { ...this.flip }
    };
  }

  /**
   * 设置裁剪区域
   */
  setCropArea(area: Rect): void {
    this.cropArea = { ...area };
    this.constrainCropArea();
  }

  /**
   * 获取裁剪区域
   */
  getCropArea(): Rect {
    return { ...this.cropArea };
  }

  /**
   * 设置宽高比
   */
  setAspectRatio(ratio: AspectRatio): void {
    this.aspectRatio = ratio;
    
    if (ratio !== 'free') {
      this.adjustCropAreaByAspectRatio();
    }
  }

  /**
   * 根据宽高比调整裁剪区域
   */
  private adjustCropAreaByAspectRatio(): void {
    const ratio = parseAspectRatio(this.aspectRatio);
    if (!ratio) return;

    const center = getRectCenter(this.cropArea);
    const newSize = adjustSizeByAspectRatio(
      { width: this.cropArea.width, height: this.cropArea.height },
      ratio,
      'fit'
    );

    this.cropArea = {
      x: center.x - newSize.width / 2,
      y: center.y - newSize.height / 2,
      width: newSize.width,
      height: newSize.height
    };

    this.constrainCropArea();
  }

  /**
   * 设置形状
   */
  setShape(shape: CropShape): void {
    if (!this.options.allowedShapes?.includes(shape)) {
      return;
    }
    
    this.shape = shape;
    
    // 如果是圆形，强制设置为正方形
    if (shape === 'circle') {
      this.setAspectRatio('1:1');
    }
  }

  /**
   * 设置旋转角度
   */
  setRotation(angle: number): void {
    if (!this.options.allowRotation) return;
    
    this.rotation = angle % 360;
  }

  /**
   * 设置缩放比例
   */
  setScale(scale: number): void {
    if (!this.options.allowScale) return;
    
    this.scale = clamp(scale, 0.1, 10);
  }

  /**
   * 设置翻转
   */
  setFlip(horizontal: boolean, vertical: boolean): void {
    if (!this.options.allowFlip) return;
    
    this.flip = { horizontal, vertical };
  }

  /**
   * 移动裁剪区域
   */
  moveCropArea(deltaX: number, deltaY: number): void {
    this.cropArea.x += deltaX;
    this.cropArea.y += deltaY;
    this.constrainCropArea();
  }

  /**
   * 调整裁剪区域大小
   */
  resizeCropArea(
    deltaWidth: number,
    deltaHeight: number,
    anchor: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' = 'se'
  ): void {
    const newArea = { ...this.cropArea };

    // 根据锚点调整位置和尺寸
    switch (anchor) {
      case 'nw':
        newArea.x += deltaWidth;
        newArea.y += deltaHeight;
        newArea.width -= deltaWidth;
        newArea.height -= deltaHeight;
        break;
      case 'n':
        newArea.y += deltaHeight;
        newArea.height -= deltaHeight;
        break;
      case 'ne':
        newArea.y += deltaHeight;
        newArea.width += deltaWidth;
        newArea.height -= deltaHeight;
        break;
      case 'e':
        newArea.width += deltaWidth;
        break;
      case 'se':
        newArea.width += deltaWidth;
        newArea.height += deltaHeight;
        break;
      case 's':
        newArea.height += deltaHeight;
        break;
      case 'sw':
        newArea.x += deltaWidth;
        newArea.width -= deltaWidth;
        newArea.height += deltaHeight;
        break;
      case 'w':
        newArea.x += deltaWidth;
        newArea.width -= deltaWidth;
        break;
    }

    // 保持宽高比
    if (this.aspectRatio !== 'free' && this.options.maintainAspectRatio) {
      const ratio = parseAspectRatio(this.aspectRatio);
      if (ratio) {
        const center = getRectCenter(this.cropArea);
        const adjustedSize = adjustSizeByAspectRatio(
          { width: newArea.width, height: newArea.height },
          ratio,
          'fit'
        );
        
        newArea.x = center.x - adjustedSize.width / 2;
        newArea.y = center.y - adjustedSize.height / 2;
        newArea.width = adjustedSize.width;
        newArea.height = adjustedSize.height;
      }
    }

    this.cropArea = newArea;
    this.constrainCropArea();
  }

  /**
   * 约束裁剪区域
   */
  private constrainCropArea(): void {
    // 确保最小尺寸
    if (this.options.minSize) {
      this.cropArea.width = Math.max(this.cropArea.width, this.options.minSize.width);
      this.cropArea.height = Math.max(this.cropArea.height, this.options.minSize.height);
    }

    // 确保最大尺寸
    if (this.options.maxSize) {
      this.cropArea.width = Math.min(this.cropArea.width, this.options.maxSize.width);
      this.cropArea.height = Math.min(this.cropArea.height, this.options.maxSize.height);
    }

    // 约束在图像边界内
    const imageBounds: Rect = {
      x: this.imageOffset.x,
      y: this.imageOffset.y,
      width: this.imageDisplaySize.width,
      height: this.imageDisplaySize.height
    };

    this.cropArea = constrainRect(this.cropArea, imageBounds);
  }

  /**
   * 检查点是否在裁剪区域内
   */
  isPointInCropArea(point: Point): boolean {
    if (this.shape === 'rect') {
      return point.x >= this.cropArea.x &&
             point.x <= this.cropArea.x + this.cropArea.width &&
             point.y >= this.cropArea.y &&
             point.y <= this.cropArea.y + this.cropArea.height;
    }
    
    if (this.shape === 'circle') {
      const center = getRectCenter(this.cropArea);
      const radius = Math.min(this.cropArea.width, this.cropArea.height) / 2;
      const distance = Math.sqrt(
        Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
      );
      return distance <= radius;
    }
    
    // 其他形状的实现...
    return false;
  }

  /**
   * 获取控制点位置
   */
  getControlPoints(): Point[] {
    const { x, y, width, height } = this.cropArea;
    
    return [
      { x, y }, // nw
      { x: x + width / 2, y }, // n
      { x: x + width, y }, // ne
      { x: x + width, y: y + height / 2 }, // e
      { x: x + width, y: y + height }, // se
      { x: x + width / 2, y: y + height }, // s
      { x, y: y + height }, // sw
      { x, y: y + height / 2 } // w
    ];
  }

  /**
   * 获取旋转控制点位置
   */
  getRotationControlPoint(): Point {
    return {
      x: this.cropArea.x + this.cropArea.width / 2,
      y: this.cropArea.y - 24
    };
  }

  /**
   * 检查控制点
   */
  hitTestControlPoint(point: Point, tolerance: number = 10): string | null {
    const controlPoints = this.getControlPoints();
    const directions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    
    for (let i = 0; i < controlPoints.length; i++) {
      const cp = controlPoints[i];
      const distance = Math.sqrt(
        Math.pow(point.x - cp.x, 2) + Math.pow(point.y - cp.y, 2)
      );
      
      if (distance <= tolerance) {
        return directions[i];
      }
    }
    
    // 检查旋转控制点
    if (this.options.allowRotation) {
      const rotationPoint = this.getRotationControlPoint();
      const distance = Math.sqrt(
        Math.pow(point.x - rotationPoint.x, 2) + Math.pow(point.y - rotationPoint.y, 2)
      );
      
      if (distance <= tolerance) {
        return 'rotate';
      }
    }
    
    return null;
  }

  /**
   * 重置裁剪区域
   */
  reset(): void {
    this.initializeCropArea();
    this.rotation = 0;
    this.scale = 1;
    this.flip = { horizontal: false, vertical: false };
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<CropOptions>): void {
    this.options = { ...this.options, ...options };
    this.constrainCropArea();
  }
}
