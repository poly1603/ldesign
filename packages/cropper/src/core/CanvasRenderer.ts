/**
 * @ldesign/cropper - Canvas 渲染引擎
 * 
 * 负责图像的渲染和绘制操作
 */

import type { Point, Size, Rect, Transform, ImageProcessOptions } from '../types';
import { createCanvas, clamp, degToRad, getDevicePixelRatio } from '../utils';
import { ImageProcessor } from '../processing/ImageProcessor';
import { TransformProcessor } from '../processing/TransformProcessor';

/**
 * Canvas 渲染引擎类
 * 
 * 提供高性能的图像渲染和绘制功能
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private devicePixelRatio: number;
  private imageData: HTMLImageElement | null = null;
  private imageProcessor: ImageProcessor;
  private transformProcessor: TransformProcessor;
  private transform: Transform = {
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.devicePixelRatio = getDevicePixelRatio();
    this.imageProcessor = new ImageProcessor();
    this.transformProcessor = new TransformProcessor();

    this.setupCanvas();
  }

  /**
   * 设置 Canvas
   */
  private setupCanvas(): void {
    // 设置高分辨率支持
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width * this.devicePixelRatio;
    const height = rect.height * this.devicePixelRatio;
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    
    // 设置图像渲染质量
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  /**
   * 设置图像数据
   */
  setImageData(image: HTMLImageElement): void {
    this.imageData = image;
    this.resetTransform();
  }

  /**
   * 重置变换
   */
  resetTransform(): void {
    this.transform = {
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      translateX: 0,
      translateY: 0
    };
  }

  /**
   * 设置变换
   */
  setTransform(transform: Partial<Transform>): void {
    this.transform = { ...this.transform, ...transform };
  }

  /**
   * 获取变换
   */
  getTransform(): Transform {
    return { ...this.transform };
  }

  /**
   * 清空画布
   */
  clear(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
  }

  /**
   * 渲染图像
   */
  renderImage(
    cropArea?: Rect,
    imageProcessOptions?: ImageProcessOptions
  ): void {
    if (!this.imageData) return;

    this.clear();
    
    // 保存当前状态
    this.ctx.save();
    
    // 应用图像处理
    if (imageProcessOptions) {
      this.applyImageProcessing(imageProcessOptions);
    }
    
    // 应用变换
    this.applyTransform();
    
    // 绘制图像
    if (cropArea) {
      this.drawCroppedImage(cropArea);
    } else {
      this.drawFullImage();
    }
    
    // 恢复状态
    this.ctx.restore();
  }

  /**
   * 应用图像处理
   */
  private applyImageProcessing(options: ImageProcessOptions): void {
    const {
      brightness = 0,
      contrast = 0,
      saturation = 0,
      hue = 0,
      blur = 0,
      sharpen = 0
    } = options;

    // 构建滤镜字符串
    const filters: string[] = [];
    
    if (brightness !== 0) {
      filters.push(`brightness(${100 + brightness}%)`);
    }
    
    if (contrast !== 0) {
      filters.push(`contrast(${100 + contrast}%)`);
    }
    
    if (saturation !== 0) {
      filters.push(`saturate(${100 + saturation}%)`);
    }
    
    if (hue !== 0) {
      filters.push(`hue-rotate(${hue}deg)`);
    }
    
    if (blur > 0) {
      filters.push(`blur(${blur}px)`);
    }
    
    // 应用滤镜
    if (filters.length > 0) {
      this.ctx.filter = filters.join(' ');
    }
  }

  /**
   * 应用变换
   */
  private applyTransform(): void {
    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // 移动到中心点
    this.ctx.translate(centerX, centerY);
    
    // 应用旋转
    if (this.transform.rotation !== 0) {
      this.ctx.rotate(degToRad(this.transform.rotation));
    }
    
    // 应用缩放
    this.ctx.scale(this.transform.scaleX, this.transform.scaleY);
    
    // 应用平移
    this.ctx.translate(this.transform.translateX, this.transform.translateY);
    
    // 移回原点
    this.ctx.translate(-centerX, -centerY);
  }

  /**
   * 绘制完整图像
   */
  private drawFullImage(): void {
    if (!this.imageData) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const imageSize = this.getImageDisplaySize();
    
    const x = (rect.width - imageSize.width) / 2;
    const y = (rect.height - imageSize.height) / 2;
    
    this.ctx.drawImage(
      this.imageData,
      x, y,
      imageSize.width, imageSize.height
    );
  }

  /**
   * 绘制裁剪后的图像
   */
  private drawCroppedImage(cropArea: Rect): void {
    if (!this.imageData) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const imageSize = this.getImageDisplaySize();
    
    const imageX = (rect.width - imageSize.width) / 2;
    const imageY = (rect.height - imageSize.height) / 2;
    
    // 计算裁剪区域在原图中的位置
    const scaleX = this.imageData.naturalWidth / imageSize.width;
    const scaleY = this.imageData.naturalHeight / imageSize.height;
    
    const sourceX = (cropArea.x - imageX) * scaleX;
    const sourceY = (cropArea.y - imageY) * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;
    
    // 确保裁剪区域在图像范围内
    const clampedSourceX = clamp(sourceX, 0, this.imageData.naturalWidth);
    const clampedSourceY = clamp(sourceY, 0, this.imageData.naturalHeight);
    const clampedSourceWidth = clamp(
      sourceWidth,
      0,
      this.imageData.naturalWidth - clampedSourceX
    );
    const clampedSourceHeight = clamp(
      sourceHeight,
      0,
      this.imageData.naturalHeight - clampedSourceY
    );
    
    // 绘制裁剪区域
    this.ctx.drawImage(
      this.imageData,
      clampedSourceX, clampedSourceY,
      clampedSourceWidth, clampedSourceHeight,
      cropArea.x, cropArea.y,
      cropArea.width, cropArea.height
    );
  }

  /**
   * 获取图像显示尺寸
   */
  private getImageDisplaySize(): Size {
    if (!this.imageData) {
      return { width: 0, height: 0 };
    }
    
    const rect = this.canvas.getBoundingClientRect();
    const containerSize = { width: rect.width, height: rect.height };
    const imageSize = {
      width: this.imageData.naturalWidth,
      height: this.imageData.naturalHeight
    };
    
    // 计算适合容器的尺寸
    const imageRatio = imageSize.width / imageSize.height;
    const containerRatio = containerSize.width / containerSize.height;
    
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
  }

  /**
   * 绘制裁剪区域边框
   */
  drawCropArea(cropArea: Rect): void {
    this.ctx.save();
    
    // 设置边框样式
    this.ctx.strokeStyle = '#1890ff';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([]);
    
    // 绘制边框
    this.ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    this.ctx.restore();
  }

  /**
   * 绘制控制点
   */
  drawControlPoints(cropArea: Rect): void {
    const points = this.getControlPoints(cropArea);
    
    this.ctx.save();
    
    // 设置控制点样式
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#1890ff';
    this.ctx.lineWidth = 2;
    
    points.forEach(point => {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    });
    
    this.ctx.restore();
  }

  /**
   * 获取控制点位置
   */
  private getControlPoints(cropArea: Rect): Point[] {
    const { x, y, width, height } = cropArea;
    
    return [
      { x, y }, // 左上
      { x: x + width / 2, y }, // 上中
      { x: x + width, y }, // 右上
      { x: x + width, y: y + height / 2 }, // 右中
      { x: x + width, y: y + height }, // 右下
      { x: x + width / 2, y: y + height }, // 下中
      { x, y: y + height }, // 左下
      { x, y: y + height / 2 } // 左中
    ];
  }

  /**
   * 绘制网格线
   */
  drawGrid(cropArea: Rect, type: 'thirds' | 'golden' | 'diagonal' = 'thirds'): void {
    this.ctx.save();
    
    // 设置网格线样式
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([]);
    
    const { x, y, width, height } = cropArea;
    
    if (type === 'thirds') {
      // 三等分网格
      const thirdWidth = width / 3;
      const thirdHeight = height / 3;
      
      // 垂直线
      for (let i = 1; i < 3; i++) {
        const lineX = x + thirdWidth * i;
        this.ctx.beginPath();
        this.ctx.moveTo(lineX, y);
        this.ctx.lineTo(lineX, y + height);
        this.ctx.stroke();
      }
      
      // 水平线
      for (let i = 1; i < 3; i++) {
        const lineY = y + thirdHeight * i;
        this.ctx.beginPath();
        this.ctx.moveTo(x, lineY);
        this.ctx.lineTo(x + width, lineY);
        this.ctx.stroke();
      }
    } else if (type === 'golden') {
      // 黄金分割线
      const goldenRatio = 0.618;
      
      // 垂直线
      const goldenX1 = x + width * goldenRatio;
      const goldenX2 = x + width * (1 - goldenRatio);
      
      this.ctx.beginPath();
      this.ctx.moveTo(goldenX1, y);
      this.ctx.lineTo(goldenX1, y + height);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(goldenX2, y);
      this.ctx.lineTo(goldenX2, y + height);
      this.ctx.stroke();
      
      // 水平线
      const goldenY1 = y + height * goldenRatio;
      const goldenY2 = y + height * (1 - goldenRatio);
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, goldenY1);
      this.ctx.lineTo(x + width, goldenY1);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, goldenY2);
      this.ctx.lineTo(x + width, goldenY2);
      this.ctx.stroke();
    } else if (type === 'diagonal') {
      // 对角线
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + width, y + height);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(x + width, y);
      this.ctx.lineTo(x, y + height);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  /**
   * 绘制遮罩
   */
  drawMask(cropArea: Rect): void {
    const rect = this.canvas.getBoundingClientRect();
    
    this.ctx.save();
    
    // 设置遮罩样式
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    // 绘制四个遮罩区域
    // 上方
    this.ctx.fillRect(0, 0, rect.width, cropArea.y);
    
    // 下方
    this.ctx.fillRect(
      0,
      cropArea.y + cropArea.height,
      rect.width,
      rect.height - cropArea.y - cropArea.height
    );
    
    // 左侧
    this.ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
    
    // 右侧
    this.ctx.fillRect(
      cropArea.x + cropArea.width,
      cropArea.y,
      rect.width - cropArea.x - cropArea.width,
      cropArea.height
    );
    
    this.ctx.restore();
  }

  /**
   * 导出图像
   */
  exportImage(
    cropArea: Rect,
    outputSize?: Size,
    format: string = 'image/png',
    quality: number = 1
  ): HTMLCanvasElement {
    if (!this.imageData) {
      throw new Error('No image data available');
    }
    
    const exportCanvas = createCanvas(
      outputSize?.width || cropArea.width,
      outputSize?.height || cropArea.height
    );
    const exportCtx = exportCanvas.getContext('2d')!;
    
    // 计算源区域
    const imageSize = this.getImageDisplaySize();
    const rect = this.canvas.getBoundingClientRect();
    const imageX = (rect.width - imageSize.width) / 2;
    const imageY = (rect.height - imageSize.height) / 2;
    
    const scaleX = this.imageData.naturalWidth / imageSize.width;
    const scaleY = this.imageData.naturalHeight / imageSize.height;
    
    const sourceX = (cropArea.x - imageX) * scaleX;
    const sourceY = (cropArea.y - imageY) * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;
    
    // 绘制到导出画布
    exportCtx.drawImage(
      this.imageData,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, exportCanvas.width, exportCanvas.height
    );
    
    return exportCanvas;
  }

  /**
   * 调整画布大小
   */
  resize(width: number, height: number): void {
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.setupCanvas();
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.clear();
    this.imageData = null;
  }
}
