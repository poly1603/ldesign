/**
 * @ldesign/cropper - 变换处理器
 * 
 * 处理图像的几何变换操作
 */

import type { Transform, Size, Point } from '../types';
import { createCanvas, degToRad, normalizeAngle } from '../utils';

/**
 * 变换处理器类
 * 
 * 提供图像的旋转、缩放、翻转等几何变换功能
 */
export class TransformProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sourceImage: HTMLImageElement | null = null;

  constructor() {
    this.canvas = createCanvas(1, 1);
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * 设置源图像
   */
  setSourceImage(image: HTMLImageElement): void {
    this.sourceImage = image;
  }

  /**
   * 应用变换
   */
  applyTransform(transform: Transform, outputSize?: Size): HTMLCanvasElement {
    if (!this.sourceImage) {
      throw new Error('No source image set');
    }

    const { scaleX, scaleY, rotation, translateX, translateY } = transform;
    
    // 计算输出尺寸
    const size = outputSize || this.calculateTransformedSize(transform);
    
    // 设置画布尺寸
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    
    // 清空画布
    this.ctx.clearRect(0, 0, size.width, size.height);
    
    // 保存当前状态
    this.ctx.save();
    
    // 移动到画布中心
    this.ctx.translate(size.width / 2, size.height / 2);
    
    // 应用变换
    this.ctx.scale(scaleX, scaleY);
    this.ctx.rotate(degToRad(rotation));
    this.ctx.translate(translateX, translateY);
    
    // 绘制图像（以中心为原点）
    this.ctx.drawImage(
      this.sourceImage,
      -this.sourceImage.naturalWidth / 2,
      -this.sourceImage.naturalHeight / 2
    );
    
    // 恢复状态
    this.ctx.restore();
    
    return this.canvas;
  }

  /**
   * 旋转图像
   */
  rotate(angle: number, outputSize?: Size): HTMLCanvasElement {
    const transform: Transform = {
      scaleX: 1,
      scaleY: 1,
      rotation: angle,
      translateX: 0,
      translateY: 0
    };
    
    return this.applyTransform(transform, outputSize);
  }

  /**
   * 缩放图像
   */
  scale(scaleX: number, scaleY: number = scaleX, outputSize?: Size): HTMLCanvasElement {
    const transform: Transform = {
      scaleX,
      scaleY,
      rotation: 0,
      translateX: 0,
      translateY: 0
    };
    
    return this.applyTransform(transform, outputSize);
  }

  /**
   * 翻转图像
   */
  flip(horizontal: boolean, vertical: boolean, outputSize?: Size): HTMLCanvasElement {
    const transform: Transform = {
      scaleX: horizontal ? -1 : 1,
      scaleY: vertical ? -1 : 1,
      rotation: 0,
      translateX: 0,
      translateY: 0
    };
    
    return this.applyTransform(transform, outputSize);
  }

  /**
   * 平移图像
   */
  translate(translateX: number, translateY: number, outputSize?: Size): HTMLCanvasElement {
    const transform: Transform = {
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      translateX,
      translateY
    };
    
    return this.applyTransform(transform, outputSize);
  }

  /**
   * 计算变换后的尺寸
   */
  private calculateTransformedSize(transform: Transform): Size {
    if (!this.sourceImage) {
      return { width: 0, height: 0 };
    }

    const { scaleX, scaleY, rotation } = transform;
    const width = this.sourceImage.naturalWidth;
    const height = this.sourceImage.naturalHeight;

    // 如果没有旋转，直接计算缩放后的尺寸
    if (rotation === 0) {
      return {
        width: Math.abs(width * scaleX),
        height: Math.abs(height * scaleY)
      };
    }

    // 计算旋转后的边界框
    const rad = degToRad(rotation);
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));

    const rotatedWidth = width * cos + height * sin;
    const rotatedHeight = width * sin + height * cos;

    return {
      width: Math.abs(rotatedWidth * scaleX),
      height: Math.abs(rotatedHeight * scaleY)
    };
  }

  /**
   * 获取旋转后的四个角点
   */
  getRotatedCorners(rotation: number): Point[] {
    if (!this.sourceImage) {
      return [];
    }

    const width = this.sourceImage.naturalWidth;
    const height = this.sourceImage.naturalHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const corners = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ];

    const rad = degToRad(rotation);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return corners.map(corner => {
      const x = corner.x - centerX;
      const y = corner.y - centerY;
      
      return {
        x: centerX + x * cos - y * sin,
        y: centerY + x * sin + y * cos
      };
    });
  }

  /**
   * 自动校正图像方向
   */
  autoCorrectOrientation(maxAngle: number = 45): HTMLCanvasElement {
    if (!this.sourceImage) {
      throw new Error('No source image set');
    }

    // 这里可以实现自动检测图像倾斜角度的算法
    // 简化实现：检测边缘并计算主要方向
    const detectedAngle = this.detectSkewAngle();
    
    if (Math.abs(detectedAngle) <= maxAngle) {
      return this.rotate(-detectedAngle);
    }
    
    return this.canvas;
  }

  /**
   * 检测图像倾斜角度
   */
  private detectSkewAngle(): number {
    // 简化实现：返回0度
    // 实际实现需要使用霍夫变换或其他边缘检测算法
    return 0;
  }

  /**
   * 创建镜像效果
   */
  createMirrorEffect(direction: 'horizontal' | 'vertical' | 'both'): HTMLCanvasElement {
    if (!this.sourceImage) {
      throw new Error('No source image set');
    }

    const width = this.sourceImage.naturalWidth;
    const height = this.sourceImage.naturalHeight;

    let canvasWidth = width;
    let canvasHeight = height;

    if (direction === 'horizontal' || direction === 'both') {
      canvasWidth *= 2;
    }
    if (direction === 'vertical' || direction === 'both') {
      canvasHeight *= 2;
    }

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 绘制原图
    this.ctx.drawImage(this.sourceImage, 0, 0);

    if (direction === 'horizontal' || direction === 'both') {
      // 水平镜像
      this.ctx.save();
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(this.sourceImage, -width * 2, 0);
      this.ctx.restore();
    }

    if (direction === 'vertical' || direction === 'both') {
      // 垂直镜像
      this.ctx.save();
      this.ctx.scale(1, -1);
      this.ctx.drawImage(this.sourceImage, 0, -height * 2);
      this.ctx.restore();
    }

    if (direction === 'both') {
      // 对角镜像
      this.ctx.save();
      this.ctx.scale(-1, -1);
      this.ctx.drawImage(this.sourceImage, -width * 2, -height * 2);
      this.ctx.restore();
    }

    return this.canvas;
  }

  /**
   * 透视变换
   */
  perspectiveTransform(corners: Point[]): HTMLCanvasElement {
    if (!this.sourceImage || corners.length !== 4) {
      throw new Error('Invalid parameters for perspective transform');
    }

    // 简化实现：使用 CSS transform 的 perspective
    // 实际实现需要使用矩阵变换
    const width = this.sourceImage.naturalWidth;
    const height = this.sourceImage.naturalHeight;

    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.clearRect(0, 0, width, height);

    // 这里应该实现真正的透视变换算法
    // 目前只是绘制原图
    this.ctx.drawImage(this.sourceImage, 0, 0);

    return this.canvas;
  }

  /**
   * 创建阴影效果
   */
  createShadow(
    offsetX: number = 5,
    offsetY: number = 5,
    blur: number = 10,
    color: string = 'rgba(0, 0, 0, 0.5)'
  ): HTMLCanvasElement {
    if (!this.sourceImage) {
      throw new Error('No source image set');
    }

    const width = this.sourceImage.naturalWidth;
    const height = this.sourceImage.naturalHeight;
    const shadowOffset = Math.max(Math.abs(offsetX), Math.abs(offsetY));
    const totalBlur = blur * 2;

    this.canvas.width = width + shadowOffset + totalBlur;
    this.canvas.height = height + shadowOffset + totalBlur;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制阴影
    this.ctx.save();
    this.ctx.shadowOffsetX = offsetX;
    this.ctx.shadowOffsetY = offsetY;
    this.ctx.shadowBlur = blur;
    this.ctx.shadowColor = color;
    
    this.ctx.drawImage(
      this.sourceImage,
      totalBlur / 2,
      totalBlur / 2,
      width,
      height
    );
    
    this.ctx.restore();

    // 绘制原图（在阴影上方）
    this.ctx.drawImage(
      this.sourceImage,
      totalBlur / 2,
      totalBlur / 2,
      width,
      height
    );

    return this.canvas;
  }

  /**
   * 获取变换后的画布
   */
  getTransformedCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 重置变换
   */
  reset(): void {
    if (this.sourceImage) {
      this.canvas.width = this.sourceImage.naturalWidth;
      this.canvas.height = this.sourceImage.naturalHeight;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.sourceImage, 0, 0);
    }
  }

  /**
   * 销毁处理器
   */
  destroy(): void {
    this.sourceImage = null;
  }
}
