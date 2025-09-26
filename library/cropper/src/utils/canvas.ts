/**
 * @ldesign/cropper Canvas操作工具函数
 * 
 * 提供Canvas绘制、图像处理、性能优化等工具函数
 */

import type { Point, Size, Rect, Matrix } from '../types';

// ============================================================================
// Canvas创建和基础操作
// ============================================================================

/**
 * 创建Canvas元素
 * @param width 宽度
 * @param height 高度
 * @param options 选项
 * @returns Canvas元素和上下文
 */
export function createCanvas(
  width: number,
  height: number,
  options: {
    alpha?: boolean;
    desynchronized?: boolean;
    colorSpace?: PredefinedColorSpace;
    willReadFrequently?: boolean;
  } = {}
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d', {
    alpha: options.alpha !== false,
    desynchronized: options.desynchronized || false,
    colorSpace: options.colorSpace || 'srgb',
    willReadFrequently: options.willReadFrequently || false
  });
  
  if (!ctx) {
    throw new Error('Failed to get 2D rendering context');
  }
  
  return { canvas, ctx };
}

/**
 * 设置Canvas的设备像素比
 * @param canvas Canvas元素
 * @param ctx 渲染上下文
 * @param pixelRatio 像素比（可选，默认为设备像素比）
 */
export function setCanvasPixelRatio(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  pixelRatio: number = window.devicePixelRatio || 1
): void {
  const rect = canvas.getBoundingClientRect();
  
  // 设置实际像素尺寸
  canvas.width = rect.width * pixelRatio;
  canvas.height = rect.height * pixelRatio;
  
  // 设置显示尺寸
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  
  // 缩放上下文以匹配设备像素比
  ctx.scale(pixelRatio, pixelRatio);
}

/**
 * 清空Canvas
 * @param ctx 渲染上下文
 * @param rect 清空区域（可选，默认清空整个Canvas）
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, rect?: Rect): void {
  if (rect) {
    ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
  } else {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

/**
 * 填充Canvas背景
 * @param ctx 渲染上下文
 * @param color 背景颜色
 * @param rect 填充区域（可选，默认填充整个Canvas）
 */
export function fillCanvasBackground(
  ctx: CanvasRenderingContext2D,
  color: string,
  rect?: Rect
): void {
  ctx.save();
  ctx.fillStyle = color;
  
  if (rect) {
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  } else {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  
  ctx.restore();
}

// ============================================================================
// 图像绘制
// ============================================================================

/**
 * 绘制图像
 * @param ctx 渲染上下文
 * @param image 图像源
 * @param dest 目标区域
 * @param src 源区域（可选）
 */
export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  dest: Rect,
  src?: Rect
): void {
  if (src) {
    ctx.drawImage(
      image,
      src.x, src.y, src.width, src.height,
      dest.x, dest.y, dest.width, dest.height
    );
  } else {
    ctx.drawImage(image, dest.x, dest.y, dest.width, dest.height);
  }
}

/**
 * 绘制带变换的图像
 * @param ctx 渲染上下文
 * @param image 图像源
 * @param transform 变换矩阵
 * @param dest 目标区域
 * @param src 源区域（可选）
 */
export function drawTransformedImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  transform: Matrix,
  dest: Rect,
  src?: Rect
): void {
  ctx.save();
  ctx.setTransform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
  drawImage(ctx, image, dest, src);
  ctx.restore();
}

/**
 * 绘制圆形裁剪的图像
 * @param ctx 渲染上下文
 * @param image 图像源
 * @param center 圆心
 * @param radius 半径
 * @param dest 目标区域
 */
export function drawCircularImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  center: Point,
  radius: number,
  dest: Rect
): void {
  ctx.save();
  
  // 创建圆形裁剪路径
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.clip();
  
  // 绘制图像
  drawImage(ctx, image, dest);
  
  ctx.restore();
}

// ============================================================================
// 形状绘制
// ============================================================================

/**
 * 绘制矩形
 * @param ctx 渲染上下文
 * @param rect 矩形区域
 * @param style 样式选项
 */
export function drawRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  style: {
    fill?: string;
    stroke?: string;
    lineWidth?: number;
    lineDash?: number[];
  } = {}
): void {
  ctx.save();
  
  if (style.lineDash) {
    ctx.setLineDash(style.lineDash);
  }
  
  if (style.fill) {
    ctx.fillStyle = style.fill;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }
  
  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.lineWidth || 1;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }
  
  ctx.restore();
}

/**
 * 绘制圆形
 * @param ctx 渲染上下文
 * @param center 圆心
 * @param radius 半径
 * @param style 样式选项
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  style: {
    fill?: string;
    stroke?: string;
    lineWidth?: number;
    lineDash?: number[];
  } = {}
): void {
  ctx.save();
  
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  
  if (style.lineDash) {
    ctx.setLineDash(style.lineDash);
  }
  
  if (style.fill) {
    ctx.fillStyle = style.fill;
    ctx.fill();
  }
  
  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.lineWidth || 1;
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * 绘制椭圆
 * @param ctx 渲染上下文
 * @param center 中心点
 * @param radiusX X轴半径
 * @param radiusY Y轴半径
 * @param rotation 旋转角度
 * @param style 样式选项
 */
export function drawEllipse(
  ctx: CanvasRenderingContext2D,
  center: Point,
  radiusX: number,
  radiusY: number,
  rotation: number = 0,
  style: {
    fill?: string;
    stroke?: string;
    lineWidth?: number;
    lineDash?: number[];
  } = {}
): void {
  ctx.save();
  
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, radiusX, radiusY, rotation, 0, 2 * Math.PI);
  
  if (style.lineDash) {
    ctx.setLineDash(style.lineDash);
  }
  
  if (style.fill) {
    ctx.fillStyle = style.fill;
    ctx.fill();
  }
  
  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.lineWidth || 1;
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * 绘制线条
 * @param ctx 渲染上下文
 * @param points 点数组
 * @param style 样式选项
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  style: {
    stroke?: string;
    lineWidth?: number;
    lineDash?: number[];
    lineCap?: CanvasLineCap;
    lineJoin?: CanvasLineJoin;
  } = {}
): void {
  if (points.length < 2) return;
  
  ctx.save();
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  if (style.lineDash) {
    ctx.setLineDash(style.lineDash);
  }
  
  ctx.strokeStyle = style.stroke || '#000000';
  ctx.lineWidth = style.lineWidth || 1;
  ctx.lineCap = style.lineCap || 'butt';
  ctx.lineJoin = style.lineJoin || 'miter';
  
  ctx.stroke();
  ctx.restore();
}

// ============================================================================
// 网格和辅助线
// ============================================================================

/**
 * 绘制网格
 * @param ctx 渲染上下文
 * @param rect 网格区域
 * @param gridSize 网格大小
 * @param style 样式选项
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  gridSize: Size,
  style: {
    stroke?: string;
    lineWidth?: number;
    lineDash?: number[];
  } = {}
): void {
  ctx.save();
  
  ctx.strokeStyle = style.stroke || '#cccccc';
  ctx.lineWidth = style.lineWidth || 1;
  
  if (style.lineDash) {
    ctx.setLineDash(style.lineDash);
  }
  
  ctx.beginPath();
  
  // 绘制垂直线
  for (let x = rect.x; x <= rect.x + rect.width; x += gridSize.width) {
    ctx.moveTo(x, rect.y);
    ctx.lineTo(x, rect.y + rect.height);
  }
  
  // 绘制水平线
  for (let y = rect.y; y <= rect.y + rect.height; y += gridSize.height) {
    ctx.moveTo(rect.x, y);
    ctx.lineTo(rect.x + rect.width, y);
  }
  
  ctx.stroke();
  ctx.restore();
}

/**
 * 绘制三分线
 * @param ctx 渲染上下文
 * @param rect 区域
 * @param style 样式选项
 */
export function drawRuleOfThirds(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  style: {
    stroke?: string;
    lineWidth?: number;
    lineDash?: number[];
  } = {}
): void {
  const thirdWidth = rect.width / 3;
  const thirdHeight = rect.height / 3;
  
  const lines: Point[][] = [
    // 垂直线
    [
      { x: rect.x + thirdWidth, y: rect.y },
      { x: rect.x + thirdWidth, y: rect.y + rect.height }
    ],
    [
      { x: rect.x + thirdWidth * 2, y: rect.y },
      { x: rect.x + thirdWidth * 2, y: rect.y + rect.height }
    ],
    // 水平线
    [
      { x: rect.x, y: rect.y + thirdHeight },
      { x: rect.x + rect.width, y: rect.y + thirdHeight }
    ],
    [
      { x: rect.x, y: rect.y + thirdHeight * 2 },
      { x: rect.x + rect.width, y: rect.y + thirdHeight * 2 }
    ]
  ];
  
  lines.forEach(line => drawLine(ctx, line, style));
}

/**
 * 绘制中心线
 * @param ctx 渲染上下文
 * @param rect 区域
 * @param style 样式选项
 */
export function drawCenterLines(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  style: {
    stroke?: string;
    lineWidth?: number;
    lineDash?: number[];
  } = {}
): void {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  
  const lines: Point[][] = [
    // 垂直中心线
    [
      { x: centerX, y: rect.y },
      { x: centerX, y: rect.y + rect.height }
    ],
    // 水平中心线
    [
      { x: rect.x, y: centerY },
      { x: rect.x + rect.width, y: centerY }
    ]
  ];
  
  lines.forEach(line => drawLine(ctx, line, style));
}

// ============================================================================
// 遮罩和蒙版
// ============================================================================

/**
 * 绘制遮罩层
 * @param ctx 渲染上下文
 * @param canvasSize Canvas尺寸
 * @param cropArea 裁剪区域
 * @param maskColor 遮罩颜色
 */
export function drawMask(
  ctx: CanvasRenderingContext2D,
  canvasSize: Size,
  cropArea: Rect,
  maskColor: string = 'rgba(0, 0, 0, 0.5)'
): void {
  ctx.save();
  
  // 绘制整个Canvas的遮罩
  ctx.fillStyle = maskColor;
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  
  // 使用复合操作清除裁剪区域
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
  
  ctx.restore();
}

/**
 * 绘制圆形遮罩层
 * @param ctx 渲染上下文
 * @param canvasSize Canvas尺寸
 * @param center 圆心
 * @param radius 半径
 * @param maskColor 遮罩颜色
 */
export function drawCircularMask(
  ctx: CanvasRenderingContext2D,
  canvasSize: Size,
  center: Point,
  radius: number,
  maskColor: string = 'rgba(0, 0, 0, 0.5)'
): void {
  ctx.save();
  
  // 绘制整个Canvas的遮罩
  ctx.fillStyle = maskColor;
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  
  // 使用复合操作清除圆形区域
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.restore();
}

// ============================================================================
// 图像数据处理
// ============================================================================

/**
 * 获取Canvas的图像数据
 * @param ctx 渲染上下文
 * @param rect 区域（可选，默认整个Canvas）
 * @returns 图像数据
 */
export function getImageData(
  ctx: CanvasRenderingContext2D,
  rect?: Rect
): ImageData {
  if (rect) {
    return ctx.getImageData(rect.x, rect.y, rect.width, rect.height);
  } else {
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

/**
 * 设置Canvas的图像数据
 * @param ctx 渲染上下文
 * @param imageData 图像数据
 * @param position 位置（可选，默认(0,0)）
 */
export function putImageData(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  position: Point = { x: 0, y: 0 }
): void {
  ctx.putImageData(imageData, position.x, position.y);
}

/**
 * 复制Canvas内容到另一个Canvas
 * @param sourceCtx 源Canvas上下文
 * @param targetCtx 目标Canvas上下文
 * @param sourceRect 源区域（可选）
 * @param targetPosition 目标位置（可选）
 */
export function copyCanvas(
  sourceCtx: CanvasRenderingContext2D,
  targetCtx: CanvasRenderingContext2D,
  sourceRect?: Rect,
  targetPosition: Point = { x: 0, y: 0 }
): void {
  if (sourceRect) {
    const imageData = getImageData(sourceCtx, sourceRect);
    putImageData(targetCtx, imageData, targetPosition);
  } else {
    targetCtx.drawImage(sourceCtx.canvas, targetPosition.x, targetPosition.y);
  }
}
