/**
 * @ldesign/cropper - 特效处理器
 * 
 * 提供各种图像特效和装饰功能
 */

import type { Point, Size, Rect } from '../types';
import { createCanvas, clamp } from '../utils';

/**
 * 边框样式
 */
export interface BorderStyle {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  radius?: number;
}

/**
 * 阴影样式
 */
export interface ShadowStyle {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  opacity: number;
}

/**
 * 水印配置
 */
export interface WatermarkConfig {
  type: 'text' | 'image';
  content: string; // 文字内容或图片URL
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  offset?: Point;
  opacity: number;
  size?: number; // 文字大小或图片缩放
  color?: string; // 文字颜色
  font?: string; // 文字字体
}

/**
 * 背景配置
 */
export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image' | 'blur';
  value: string; // 颜色值、渐变CSS、图片URL等
  opacity?: number;
  blur?: number; // 背景模糊程度
}

/**
 * 特效处理器类
 * 
 * 提供各种图像特效和装饰功能
 */
export class EffectsProcessor {
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
    this.canvas.width = image.naturalWidth;
    this.canvas.height = image.naturalHeight;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(image, 0, 0);
  }

  /**
   * 添加边框
   */
  addBorder(style: BorderStyle): HTMLCanvasElement {
    if (!this.sourceImage) {
      throw new Error('No source image set');
    }

    const { width: borderWidth, color, style: borderStyle, radius = 0 } = style;
    const originalWidth = this.sourceImage.naturalWidth;
    const originalHeight = this.sourceImage.naturalHeight;
    
    // 创建新画布，尺寸包含边框
    const newWidth = originalWidth + borderWidth * 2;
    const newHeight = originalHeight + borderWidth * 2;
    
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    this.ctx.clearRect(0, 0, newWidth, newHeight);

    // 绘制边框
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = borderWidth;
    
    if (borderStyle === 'dashed') {
      this.ctx.setLineDash([borderWidth * 2, borderWidth]);
    } else if (borderStyle === 'dotted') {
      this.ctx.setLineDash([borderWidth, borderWidth]);
    }

    if (radius > 0) {
      this.drawRoundedRect(
        borderWidth / 2, 
        borderWidth / 2, 
        originalWidth + borderWidth, 
        originalHeight + borderWidth, 
        radius
      );
      this.ctx.stroke();
    } else {
      this.ctx.strokeRect(
        borderWidth / 2, 
        borderWidth / 2, 
        originalWidth + borderWidth, 
        originalHeight + borderWidth
      );
    }
    
    this.ctx.restore();

    // 绘制原图像
    this.ctx.drawImage(this.sourceImage, borderWidth, borderWidth);

    return this.canvas;
  }

  /**
   * 添加阴影
   */
  addShadow(style: ShadowStyle): HTMLCanvasElement {
    if (!this.sourceImage) {
      throw new Error('No source image set');
    }

    const { offsetX, offsetY, blur, color, opacity } = style;
    const originalWidth = this.sourceImage.naturalWidth;
    const originalHeight = this.sourceImage.naturalHeight;
    
    // 计算新画布尺寸
    const shadowExtent = Math.max(Math.abs(offsetX), Math.abs(offsetY)) + blur;
    const newWidth = originalWidth + shadowExtent * 2;
    const newHeight = originalHeight + shadowExtent * 2;
    
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    this.ctx.clearRect(0, 0, newWidth, newHeight);

    // 绘制阴影
    this.ctx.save();
    this.ctx.shadowOffsetX = offsetX;
    this.ctx.shadowOffsetY = offsetY;
    this.ctx.shadowBlur = blur;
    this.ctx.shadowColor = color;
    this.ctx.globalAlpha = opacity;
    
    this.ctx.drawImage(
      this.sourceImage,
      shadowExtent,
      shadowExtent,
      originalWidth,
      originalHeight
    );
    
    this.ctx.restore();

    // 绘制原图像（在阴影上方）
    this.ctx.drawImage(
      this.sourceImage,
      shadowExtent,
      shadowExtent,
      originalWidth,
      originalHeight
    );

    return this.canvas;
  }

  /**
   * 添加水印
   */
  addWatermark(config: WatermarkConfig): HTMLCanvasElement {
    if (!this.sourceImage) {
      throw new Error('No source image set');
    }

    const { type, content, position, offset = { x: 0, y: 0 }, opacity } = config;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;

    if (type === 'text') {
      this.addTextWatermark(config);
    } else if (type === 'image') {
      this.addImageWatermark(config);
    }

    this.ctx.restore();
    return this.canvas;
  }

  /**
   * 添加文字水印
   */
  private addTextWatermark(config: WatermarkConfig): void {
    const { 
      content, 
      position, 
      offset = { x: 0, y: 0 }, 
      size = 24, 
      color = '#ffffff',
      font = 'Arial'
    } = config;

    this.ctx.font = `${size}px ${font}`;
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'top';

    // 测量文字尺寸
    const textMetrics = this.ctx.measureText(content);
    const textWidth = textMetrics.width;
    const textHeight = size;

    // 计算位置
    const pos = this.calculateWatermarkPosition(
      position, 
      { width: textWidth, height: textHeight }, 
      offset
    );

    // 绘制文字
    this.ctx.fillText(content, pos.x, pos.y);
  }

  /**
   * 添加图片水印
   */
  private async addImageWatermark(config: WatermarkConfig): Promise<void> {
    const { content, position, offset = { x: 0, y: 0 }, size = 1 } = config;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const watermarkWidth = img.naturalWidth * size;
        const watermarkHeight = img.naturalHeight * size;
        
        const pos = this.calculateWatermarkPosition(
          position,
          { width: watermarkWidth, height: watermarkHeight },
          offset
        );

        this.ctx.drawImage(img, pos.x, pos.y, watermarkWidth, watermarkHeight);
        resolve();
      };

      img.onerror = () => reject(new Error('Failed to load watermark image'));
      img.src = content;
    });
  }

  /**
   * 计算水印位置
   */
  private calculateWatermarkPosition(
    position: string,
    watermarkSize: Size,
    offset: Point
  ): Point {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const { width: wmWidth, height: wmHeight } = watermarkSize;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top-left':
        x = 10 + offset.x;
        y = 10 + offset.y;
        break;
      case 'top-right':
        x = canvasWidth - wmWidth - 10 + offset.x;
        y = 10 + offset.y;
        break;
      case 'bottom-left':
        x = 10 + offset.x;
        y = canvasHeight - wmHeight - 10 + offset.y;
        break;
      case 'bottom-right':
        x = canvasWidth - wmWidth - 10 + offset.x;
        y = canvasHeight - wmHeight - 10 + offset.y;
        break;
      case 'center':
        x = (canvasWidth - wmWidth) / 2 + offset.x;
        y = (canvasHeight - wmHeight) / 2 + offset.y;
        break;
    }

    return { x, y };
  }

  /**
   * 设置背景
   */
  setBackground(config: BackgroundConfig): HTMLCanvasElement {
    if (!this.sourceImage) {
      throw new Error('No source image set');
    }

    const { type, value, opacity = 1, blur = 0 } = config;

    // 创建背景画布
    const bgCanvas = createCanvas(this.canvas.width, this.canvas.height);
    const bgCtx = bgCanvas.getContext('2d')!;

    bgCtx.save();
    bgCtx.globalAlpha = opacity;

    switch (type) {
      case 'color':
        bgCtx.fillStyle = value;
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        break;
      case 'gradient':
        this.drawGradientBackground(bgCtx, value);
        break;
      case 'blur':
        this.drawBlurBackground(bgCtx, blur);
        break;
    }

    bgCtx.restore();

    // 将背景绘制到主画布
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.drawImage(bgCanvas, 0, 0);
    this.ctx.restore();

    return this.canvas;
  }

  /**
   * 绘制渐变背景
   */
  private drawGradientBackground(ctx: CanvasRenderingContext2D, gradientCSS: string): void {
    // 简化实现：解析线性渐变
    const match = gradientCSS.match(/linear-gradient\(([^)]+)\)/);
    if (!match) return;

    const parts = match[1].split(',').map(s => s.trim());
    const angle = parts[0].includes('deg') ? parseFloat(parts[0]) : 0;
    const colors = parts.slice(1);

    if (colors.length < 2) return;

    // 创建渐变
    const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    colors.forEach((color, index) => {
      const stop = index / (colors.length - 1);
      gradient.addColorStop(stop, color.trim());
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  /**
   * 绘制模糊背景
   */
  private drawBlurBackground(ctx: CanvasRenderingContext2D, blurAmount: number): void {
    if (!this.sourceImage) return;

    // 绘制放大的原图作为背景
    ctx.save();
    ctx.filter = `blur(${blurAmount}px)`;
    
    // 计算缩放比例以填满画布
    const scaleX = ctx.canvas.width / this.sourceImage.naturalWidth;
    const scaleY = ctx.canvas.height / this.sourceImage.naturalHeight;
    const scale = Math.max(scaleX, scaleY) * 1.2; // 稍微放大一点

    const scaledWidth = this.sourceImage.naturalWidth * scale;
    const scaledHeight = this.sourceImage.naturalHeight * scale;
    const offsetX = (ctx.canvas.width - scaledWidth) / 2;
    const offsetY = (ctx.canvas.height - scaledHeight) / 2;

    ctx.drawImage(this.sourceImage, offsetX, offsetY, scaledWidth, scaledHeight);
    ctx.restore();
  }

  /**
   * 创建拼贴效果
   */
  createCollage(images: HTMLImageElement[], layout: 'grid' | 'mosaic' = 'grid'): HTMLCanvasElement {
    if (images.length === 0) {
      throw new Error('No images provided for collage');
    }

    if (layout === 'grid') {
      return this.createGridCollage(images);
    } else {
      return this.createMosaicCollage(images);
    }
  }

  /**
   * 创建网格拼贴
   */
  private createGridCollage(images: HTMLImageElement[]): HTMLCanvasElement {
    const cols = Math.ceil(Math.sqrt(images.length));
    const rows = Math.ceil(images.length / cols);
    
    const cellWidth = this.canvas.width / cols;
    const cellHeight = this.canvas.height / rows;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    images.forEach((img, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = col * cellWidth;
      const y = row * cellHeight;

      // 计算图像在单元格中的适配尺寸
      const scale = Math.min(cellWidth / img.naturalWidth, cellHeight / img.naturalHeight);
      const scaledWidth = img.naturalWidth * scale;
      const scaledHeight = img.naturalHeight * scale;
      
      const offsetX = (cellWidth - scaledWidth) / 2;
      const offsetY = (cellHeight - scaledHeight) / 2;

      this.ctx.drawImage(img, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
    });

    return this.canvas;
  }

  /**
   * 创建马赛克拼贴
   */
  private createMosaicCollage(images: HTMLImageElement[]): HTMLCanvasElement {
    // 简化实现：随机放置图像
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    images.forEach((img, index) => {
      const scale = 0.3 + Math.random() * 0.4; // 随机缩放
      const scaledWidth = img.naturalWidth * scale;
      const scaledHeight = img.naturalHeight * scale;
      
      const x = Math.random() * (this.canvas.width - scaledWidth);
      const y = Math.random() * (this.canvas.height - scaledHeight);
      
      const rotation = (Math.random() - 0.5) * 30; // 随机旋转

      this.ctx.save();
      this.ctx.translate(x + scaledWidth / 2, y + scaledHeight / 2);
      this.ctx.rotate(rotation * Math.PI / 180);
      this.ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
      this.ctx.restore();
    });

    return this.canvas;
  }

  /**
   * 绘制圆角矩形
   */
  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  /**
   * 获取处理后的画布
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 重置到原始图像
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
