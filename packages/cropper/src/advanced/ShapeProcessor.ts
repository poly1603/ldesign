/**
 * @ldesign/cropper - 形状处理器
 * 
 * 提供各种形状裁剪功能
 */

import type { Point, Size, Rect, CropShape } from '../types';
import { createCanvas, isPointInCircle, getRectCenter } from '../utils';

/**
 * 多边形配置
 */
export interface PolygonConfig {
  sides: number;
  rotation?: number;
  center?: Point;
  radius?: number;
}

/**
 * 自定义路径配置
 */
export interface CustomPathConfig {
  path: string; // SVG path 字符串
  viewBox?: { x: number; y: number; width: number; height: number };
}

/**
 * 贝塞尔曲线点
 */
export interface BezierPoint {
  x: number;
  y: number;
  cp1?: Point; // 控制点1
  cp2?: Point; // 控制点2
}

/**
 * 形状处理器类
 * 
 * 提供各种形状的裁剪和路径生成功能
 */
export class ShapeProcessor {
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
   * 应用形状裁剪
   */
  applyShapeCrop(shape: CropShape, area: Rect, config?: any): HTMLCanvasElement {
    if (!this.sourceImage) {
      throw new Error('No source image set');
    }

    // 创建裁剪路径
    this.ctx.save();
    this.createClipPath(shape, area, config);
    this.ctx.clip();

    // 清空画布并重新绘制图像
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.sourceImage, 0, 0);

    this.ctx.restore();
    return this.canvas;
  }

  /**
   * 创建裁剪路径
   */
  private createClipPath(shape: CropShape, area: Rect, config?: any): void {
    switch (shape) {
      case 'rect':
        this.createRectPath(area);
        break;
      case 'circle':
        this.createCirclePath(area);
        break;
      case 'ellipse':
        this.createEllipsePath(area);
        break;
      case 'polygon':
        this.createPolygonPath(area, config as PolygonConfig);
        break;
      case 'custom':
        this.createCustomPath(area, config as CustomPathConfig);
        break;
    }
  }

  /**
   * 创建矩形路径
   */
  private createRectPath(area: Rect): void {
    this.ctx.beginPath();
    this.ctx.rect(area.x, area.y, area.width, area.height);
  }

  /**
   * 创建圆形路径
   */
  private createCirclePath(area: Rect): void {
    const center = getRectCenter(area);
    const radius = Math.min(area.width, area.height) / 2;
    
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  }

  /**
   * 创建椭圆路径
   */
  private createEllipsePath(area: Rect): void {
    const center = getRectCenter(area);
    const radiusX = area.width / 2;
    const radiusY = area.height / 2;
    
    this.ctx.beginPath();
    this.ctx.ellipse(center.x, center.y, radiusX, radiusY, 0, 0, Math.PI * 2);
  }

  /**
   * 创建多边形路径
   */
  private createPolygonPath(area: Rect, config: PolygonConfig): void {
    const { sides = 6, rotation = 0 } = config;
    const center = getRectCenter(area);
    const radius = Math.min(area.width, area.height) / 2;
    
    this.ctx.beginPath();
    
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI / sides) + (rotation * Math.PI / 180);
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.closePath();
  }

  /**
   * 创建自定义路径
   */
  private createCustomPath(area: Rect, config: CustomPathConfig): void {
    const { path, viewBox } = config;
    
    if (viewBox) {
      // 计算缩放比例
      const scaleX = area.width / viewBox.width;
      const scaleY = area.height / viewBox.height;
      
      this.ctx.save();
      this.ctx.translate(area.x - viewBox.x * scaleX, area.y - viewBox.y * scaleY);
      this.ctx.scale(scaleX, scaleY);
    }
    
    // 解析并绘制 SVG 路径
    this.drawSVGPath(path);
    
    if (viewBox) {
      this.ctx.restore();
    }
  }

  /**
   * 绘制 SVG 路径
   */
  private drawSVGPath(pathString: string): void {
    // 简化的 SVG 路径解析器
    const path = new Path2D(pathString);
    this.ctx.beginPath();
    this.ctx.addPath(path);
  }

  /**
   * 创建星形路径
   */
  createStarPath(area: Rect, points: number = 5, innerRadius: number = 0.5): void {
    const center = getRectCenter(area);
    const outerRadius = Math.min(area.width, area.height) / 2;
    const innerRadiusActual = outerRadius * innerRadius;
    
    this.ctx.beginPath();
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI / points) - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadiusActual;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.closePath();
  }

  /**
   * 创建心形路径
   */
  createHeartPath(area: Rect): void {
    const center = getRectCenter(area);
    const size = Math.min(area.width, area.height) / 2;
    
    this.ctx.beginPath();
    
    // 心形的数学公式
    for (let t = 0; t <= 2 * Math.PI; t += 0.01) {
      const x = center.x + size * (16 * Math.pow(Math.sin(t), 3)) / 16;
      const y = center.y - size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
      
      if (t === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.closePath();
  }

  /**
   * 创建贝塞尔曲线路径
   */
  createBezierPath(points: BezierPoint[]): void {
    if (points.length < 2) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const prevPoint = points[i - 1];
      
      if (point.cp1 && point.cp2) {
        // 三次贝塞尔曲线
        this.ctx.bezierCurveTo(
          prevPoint.cp2?.x || prevPoint.x,
          prevPoint.cp2?.y || prevPoint.y,
          point.cp1.x,
          point.cp1.y,
          point.x,
          point.y
        );
      } else if (point.cp1) {
        // 二次贝塞尔曲线
        this.ctx.quadraticCurveTo(point.cp1.x, point.cp1.y, point.x, point.y);
      } else {
        // 直线
        this.ctx.lineTo(point.x, point.y);
      }
    }
  }

  /**
   * 检测点是否在形状内
   */
  isPointInShape(point: Point, shape: CropShape, area: Rect, config?: any): boolean {
    switch (shape) {
      case 'rect':
        return this.isPointInRect(point, area);
      case 'circle':
        return this.isPointInCircle(point, area);
      case 'ellipse':
        return this.isPointInEllipse(point, area);
      case 'polygon':
        return this.isPointInPolygon(point, area, config as PolygonConfig);
      default:
        return false;
    }
  }

  /**
   * 检测点是否在矩形内
   */
  private isPointInRect(point: Point, area: Rect): boolean {
    return point.x >= area.x && 
           point.x <= area.x + area.width &&
           point.y >= area.y && 
           point.y <= area.y + area.height;
  }

  /**
   * 检测点是否在圆形内
   */
  private isPointInCircle(point: Point, area: Rect): boolean {
    const center = getRectCenter(area);
    const radius = Math.min(area.width, area.height) / 2;
    return isPointInCircle(point, center, radius);
  }

  /**
   * 检测点是否在椭圆内
   */
  private isPointInEllipse(point: Point, area: Rect): boolean {
    const center = getRectCenter(area);
    const radiusX = area.width / 2;
    const radiusY = area.height / 2;
    
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    
    return (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1;
  }

  /**
   * 检测点是否在多边形内
   */
  private isPointInPolygon(point: Point, area: Rect, config: PolygonConfig): boolean {
    const { sides = 6, rotation = 0 } = config;
    const center = getRectCenter(area);
    const radius = Math.min(area.width, area.height) / 2;
    
    // 生成多边形顶点
    const vertices: Point[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI / sides) + (rotation * Math.PI / 180);
      vertices.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }
    
    // 使用射线法检测点是否在多边形内
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      if (((vertices[i].y > point.y) !== (vertices[j].y > point.y)) &&
          (point.x < (vertices[j].x - vertices[i].x) * (point.y - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  /**
   * 获取形状边界框
   */
  getShapeBounds(shape: CropShape, area: Rect, config?: any): Rect {
    // 大多数形状的边界框就是原始区域
    // 对于复杂形状，可能需要计算实际边界
    return area;
  }

  /**
   * 创建形状预览
   */
  createShapePreview(shape: CropShape, size: Size, config?: any): HTMLCanvasElement {
    const previewCanvas = createCanvas(size.width, size.height);
    const previewCtx = previewCanvas.getContext('2d')!;
    
    const area: Rect = {
      x: size.width * 0.1,
      y: size.height * 0.1,
      width: size.width * 0.8,
      height: size.height * 0.8
    };
    
    previewCtx.save();
    
    // 创建路径
    switch (shape) {
      case 'rect':
        this.createRectPath(area);
        break;
      case 'circle':
        this.createCirclePath(area);
        break;
      case 'ellipse':
        this.createEllipsePath(area);
        break;
      case 'polygon':
        this.createPolygonPath(area, config as PolygonConfig);
        break;
    }
    
    // 绘制形状
    previewCtx.fillStyle = 'rgba(24, 144, 255, 0.3)';
    previewCtx.fill();
    previewCtx.strokeStyle = '#1890ff';
    previewCtx.lineWidth = 2;
    previewCtx.stroke();
    
    previewCtx.restore();
    
    return previewCanvas;
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
