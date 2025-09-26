/**
 * @ldesign/cropper Canvas渲染引擎
 * 
 * 提供高性能的Canvas渲染功能，包括图片绘制、变换、裁剪区域渲染等
 */

import type { Point, Size, Rect, Matrix, CropArea, RenderConfig } from '../types';
import {
  createCanvas,
  setCanvasPixelRatio,
  clearCanvas,
  fillCanvasBackground,
  drawImage,
  drawTransformedImage,
  drawRect,
  drawCircle,
  drawEllipse,
  drawMask,
  drawCircularMask,
  drawGrid,
  drawRuleOfThirds,
  drawCenterLines
} from '../utils/canvas';
import { applyTransformToContext } from '../utils/transform';
import { globalPerformanceMonitor, globalResourceManager } from '../utils/performance';

// ============================================================================
// 渲染配置
// ============================================================================

/**
 * 默认渲染配置
 */
export const DEFAULT_RENDER_CONFIG: Required<RenderConfig> = {
  pixelRatio: window.devicePixelRatio || 1,
  hardwareAcceleration: true,
  quality: 'high',
  antialiasing: true,
  maxTextureSize: 4096
};

// ============================================================================
// 渲染样式配置
// ============================================================================

/**
 * 渲染样式接口
 */
export interface RenderStyle {
  /** 裁剪区域边框样式 */
  cropBorder: {
    color: string;
    width: number;
    lineDash?: number[];
  };
  /** 控制点样式 */
  controlPoint: {
    size: number;
    color: string;
    borderColor: string;
    borderWidth: number;
    activeColor: string;
  };
  /** 网格线样式 */
  grid: {
    color: string;
    width: number;
    lineDash?: number[];
  };
  /** 遮罩样式 */
  mask: {
    color: string;
    opacity: number;
  };
  /** 背景样式 */
  background: {
    color: string;
    pattern?: 'transparent' | 'solid';
  };
}

/**
 * 默认渲染样式
 */
export const DEFAULT_RENDER_STYLE: RenderStyle = {
  cropBorder: {
    color: '#ffffff',
    width: 2,
    lineDash: [5, 5]
  },
  controlPoint: {
    size: 8,
    color: '#ffffff',
    borderColor: '#000000',
    borderWidth: 1,
    activeColor: '#007bff'
  },
  grid: {
    color: 'rgba(255, 255, 255, 0.5)',
    width: 1,
    lineDash: [2, 2]
  },
  mask: {
    color: 'rgba(0, 0, 0, 0.5)',
    opacity: 0.5
  },
  background: {
    color: '#f0f0f0',
    pattern: 'transparent'
  }
};

// ============================================================================
// Canvas渲染引擎类
// ============================================================================

/**
 * Canvas渲染引擎类
 * 提供高性能的Canvas渲染功能
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<RenderConfig>;
  private style: RenderStyle;
  private size: Size;
  private transform: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

  constructor(
    canvas: HTMLCanvasElement,
    config: Partial<RenderConfig> = {},
    style: Partial<RenderStyle> = {}
  ) {
    this.config = { ...DEFAULT_RENDER_CONFIG, ...config };
    this.style = { ...DEFAULT_RENDER_STYLE, ...style };

    // 使用传入的Canvas
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;

    // 获取Canvas尺寸
    this.size = {
      width: canvas.width,
      height: canvas.height
    };

    // 设置像素比
    setCanvasPixelRatio(this.canvas, this.ctx, this.config.pixelRatio);

    // 设置渲染质量
    this.setupRenderingQuality();

    // 注册资源清理
    globalResourceManager.register(() => this.destroy());
  }

  /**
   * 获取Canvas元素
   * @returns Canvas元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 获取渲染上下文
   * @returns 渲染上下文
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * 获取Canvas尺寸
   * @returns Canvas尺寸
   */
  getSize(): Size {
    return { ...this.size };
  }

  /**
   * 调整Canvas尺寸
   * @param size 新尺寸
   */
  resize(size: Size): void {
    this.size = size;
    this.canvas.width = size.width * this.config.pixelRatio;
    this.canvas.height = size.height * this.config.pixelRatio;
    this.canvas.style.width = `${size.width}px`;
    this.canvas.style.height = `${size.height}px`;

    this.ctx.scale(this.config.pixelRatio, this.config.pixelRatio);
    this.setupRenderingQuality();
  }

  /**
   * 设置变换矩阵
   * @param transform 变换矩阵
   */
  setTransform(transform: Matrix): void {
    this.transform = { ...transform };
  }

  /**
   * 清空Canvas
   * @param rect 清空区域（可选）
   */
  clear(rect?: Rect): void {
    clearCanvas(this.ctx, rect);
  }

  /**
   * 填充背景
   * @param color 背景颜色（可选）
   */
  fillBackground(color?: string): void {
    const bgColor = color || this.style.background.color;

    if (this.style.background.pattern === 'transparent') {
      // 绘制透明背景图案
      this.drawTransparentPattern();
    } else {
      fillCanvasBackground(this.ctx, bgColor);
    }
  }

  /**
   * 渲染图片
   * @param image 图片元素
   * @param dest 目标区域
   * @param src 源区域（可选）
   * @param transform 变换矩阵（可选）
   */
  renderImage(
    image: CanvasImageSource,
    dest: Rect,
    src?: Rect,
    transform?: Matrix
  ): void {
    const startTime = performance.now();

    this.ctx.save();

    try {
      if (transform) {
        applyTransformToContext(this.ctx, transform);
      }

      drawImage(this.ctx, image, dest, src);

      globalPerformanceMonitor.record('canvas-render-image', performance.now() - startTime);
    } finally {
      this.ctx.restore();
    }
  }

  /**
   * 渲染裁剪区域
   * @param cropArea 裁剪区域
   * @param showControls 是否显示控制点
   */
  renderCropArea(cropArea: CropArea, showControls: boolean = true): void {
    const startTime = performance.now();

    this.ctx.save();

    try {
      // 应用旋转变换
      if (cropArea.rotation !== 0) {
        const center = {
          x: cropArea.rect.x + cropArea.rect.width / 2,
          y: cropArea.rect.y + cropArea.rect.height / 2
        };
        this.ctx.translate(center.x, center.y);
        this.ctx.rotate(cropArea.rotation);
        this.ctx.translate(-center.x, -center.y);
      }

      // 绘制裁剪区域边框
      this.drawCropAreaBorder(cropArea);

      // 绘制控制点
      if (showControls && cropArea.editable) {
        this.drawControlPoints(cropArea);
      }

      globalPerformanceMonitor.record('canvas-render-crop-area', performance.now() - startTime);
    } finally {
      this.ctx.restore();
    }
  }

  /**
   * 渲染遮罩层
   * @param cropArea 裁剪区域
   */
  renderMask(cropArea: CropArea): void {
    const startTime = performance.now();

    const maskColor = `rgba(0, 0, 0, ${this.style.mask.opacity})`;

    if (cropArea.shape === 'circle') {
      const center = {
        x: cropArea.rect.x + cropArea.rect.width / 2,
        y: cropArea.rect.y + cropArea.rect.height / 2
      };
      const radius = Math.min(cropArea.rect.width, cropArea.rect.height) / 2;
      drawCircularMask(this.ctx, this.size, center, radius, maskColor);
    } else {
      drawMask(this.ctx, this.size, cropArea.rect, maskColor);
    }

    globalPerformanceMonitor.record('canvas-render-mask', performance.now() - startTime);
  }

  /**
   * 渲染网格线
   * @param cropArea 裁剪区域
   * @param type 网格类型
   */
  renderGrid(cropArea: CropArea, type: 'grid' | 'thirds' | 'center' = 'thirds'): void {
    const startTime = performance.now();

    this.ctx.save();

    try {
      // 限制绘制区域到裁剪区域内
      this.ctx.beginPath();
      this.ctx.rect(cropArea.rect.x, cropArea.rect.y, cropArea.rect.width, cropArea.rect.height);
      this.ctx.clip();

      const style = {
        stroke: this.style.grid.color,
        lineWidth: this.style.grid.width,
        lineDash: this.style.grid.lineDash
      };

      switch (type) {
        case 'grid':
          drawGrid(this.ctx, cropArea.rect, { width: 50, height: 50 }, style);
          break;
        case 'thirds':
          drawRuleOfThirds(this.ctx, cropArea.rect, style);
          break;
        case 'center':
          drawCenterLines(this.ctx, cropArea.rect, style);
          break;
      }

      globalPerformanceMonitor.record('canvas-render-grid', performance.now() - startTime);
    } finally {
      this.ctx.restore();
    }
  }

  /**
   * 更新样式
   * @param style 新样式
   */
  updateStyle(style: Partial<RenderStyle>): void {
    this.style = { ...this.style, ...style };
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<RenderConfig>): void {
    this.config = { ...this.config, ...config };
    this.setupRenderingQuality();
  }

  /**
   * 导出Canvas内容
   * @param format 导出格式
   * @param quality 质量（0-1）
   * @returns DataURL字符串
   */
  export(format: string = 'image/png', quality: number = 0.92): string {
    return this.canvas.toDataURL(format, quality);
  }

  /**
   * 导出为Blob
   * @param format 导出格式
   * @param quality 质量（0-1）
   * @returns Promise<Blob>
   */
  exportBlob(format: string = 'image/png', quality: number = 0.92): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to export canvas as blob'));
          }
        },
        format,
        quality
      );
    });
  }

  /**
   * 渲染控制点
   * @param controlPoint 控制点
   * @param style 控制点样式
   */
  renderControlPoint(controlPoint: any, style: any): void {
    if (!this.ctx || !controlPoint.visible) {
      return;
    }

    const { position } = controlPoint;
    const { size, color, borderColor, borderWidth } = style;
    const radius = size / 2;

    this.ctx.save();

    // 绘制控制点
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // 绘制边框
    if (borderWidth > 0) {
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = borderWidth;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * 导出裁剪后的图片
   * @param imageInfo 图片信息
   * @param cropRect 裁剪矩形
   * @param options 导出选项
   * @returns 导出结果
   */
  async exportCroppedImage(imageInfo: any, cropRect: any, options: any): Promise<any> {
    // 创建临时canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      throw new Error('Failed to create export canvas context');
    }

    // 设置导出尺寸
    const exportWidth = options.width || cropRect.width;
    const exportHeight = options.height || cropRect.height;

    tempCanvas.width = exportWidth;
    tempCanvas.height = exportHeight;

    // 绘制裁剪后的图片
    const img = new Image();
    img.src = imageInfo.src;

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // 绘制图片的裁剪部分
        tempCtx.drawImage(
          img,
          cropRect.x, cropRect.y, cropRect.width, cropRect.height,
          0, 0, exportWidth, exportHeight
        );

        // 转换为blob和dataURL
        tempCanvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to export image'));
            return;
          }

          const dataURL = tempCanvas.toDataURL(
            `image/${options.format}`,
            options.quality
          );

          resolve({
            dataURL,
            blob,
            size: { width: exportWidth, height: exportHeight },
            format: options.format,
            fileSize: blob.size
          });
        }, `image/${options.format}`, options.quality);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for export'));
      };
    });
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }

  /**
   * 设置渲染质量
   */
  private setupRenderingQuality(): void {
    // 设置图像平滑
    this.ctx.imageSmoothingEnabled = this.config.antialiasing;

    if (this.config.quality === 'high') {
      this.ctx.imageSmoothingQuality = 'high';
    } else if (this.config.quality === 'medium') {
      this.ctx.imageSmoothingQuality = 'medium';
    } else {
      this.ctx.imageSmoothingQuality = 'low';
    }

    // 设置文本渲染
    this.ctx.textRenderingOptimization = 'optimizeQuality';
  }

  /**
   * 绘制透明背景图案
   */
  private drawTransparentPattern(): void {
    const patternSize = 20;
    const lightColor = '#ffffff';
    const darkColor = '#e0e0e0';

    this.ctx.save();

    for (let x = 0; x < this.size.width; x += patternSize) {
      for (let y = 0; y < this.size.height; y += patternSize) {
        const isEven = (Math.floor(x / patternSize) + Math.floor(y / patternSize)) % 2 === 0;
        this.ctx.fillStyle = isEven ? lightColor : darkColor;
        this.ctx.fillRect(x, y, patternSize, patternSize);
      }
    }

    this.ctx.restore();
  }

  /**
   * 绘制裁剪区域边框
   * @param cropArea 裁剪区域
   */
  private drawCropAreaBorder(cropArea: CropArea): void {
    const style = {
      stroke: this.style.cropBorder.color,
      lineWidth: this.style.cropBorder.width,
      lineDash: this.style.cropBorder.lineDash
    };

    switch (cropArea.shape) {
      case 'rectangle':
        drawRect(this.ctx, cropArea.rect, style);
        break;
      case 'circle':
        const center = {
          x: cropArea.rect.x + cropArea.rect.width / 2,
          y: cropArea.rect.y + cropArea.rect.height / 2
        };
        const radius = Math.min(cropArea.rect.width, cropArea.rect.height) / 2;
        drawCircle(this.ctx, center, radius, style);
        break;
      case 'ellipse':
        const ellipseCenter = {
          x: cropArea.rect.x + cropArea.rect.width / 2,
          y: cropArea.rect.y + cropArea.rect.height / 2
        };
        drawEllipse(
          this.ctx,
          ellipseCenter,
          cropArea.rect.width / 2,
          cropArea.rect.height / 2,
          0,
          style
        );
        break;
    }
  }

  /**
   * 绘制控制点
   * @param cropArea 裁剪区域
   */
  private drawControlPoints(cropArea: CropArea): void {
    if (cropArea.shape !== 'rectangle') return;

    const points = this.getControlPoints(cropArea.rect);
    const pointStyle = this.style.controlPoint;

    points.forEach(point => {
      // 绘制控制点背景
      drawCircle(this.ctx, point, pointStyle.size, {
        fill: pointStyle.color,
        stroke: pointStyle.borderColor,
        lineWidth: pointStyle.borderWidth
      });
    });
  }

  /**
   * 获取控制点位置
   * @param rect 矩形区域
   * @returns 控制点位置数组
   */
  private getControlPoints(rect: Rect): Point[] {
    const { x, y, width, height } = rect;

    return [
      { x, y },                           // 左上
      { x: x + width / 2, y },           // 上中
      { x: x + width, y },               // 右上
      { x: x + width, y: y + height / 2 }, // 右中
      { x: x + width, y: y + height },   // 右下
      { x: x + width / 2, y: y + height }, // 下中
      { x, y: y + height },              // 左下
      { x, y: y + height / 2 }           // 左中
    ];
  }
}
