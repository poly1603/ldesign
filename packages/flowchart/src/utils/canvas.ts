/**
 * Canvas工具函数
 * 提供Canvas相关的工具函数和辅助方法
 */

import type { Point, Rectangle, Size, Style, Viewport } from '@/types/index.js';

/**
 * 创建高DPI Canvas
 * @param width 宽度
 * @param height 高度
 * @param container 容器元素
 * @returns Canvas元素和上下文
 */
export function createHighDPICanvas(width: number, height: number, container?: HTMLElement): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  pixelRatio: number;
} {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('无法获取Canvas 2D上下文');
  }

  const pixelRatio = window.devicePixelRatio || 1;
  
  // 设置Canvas的实际尺寸
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  
  // 设置Canvas的显示尺寸
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  // 缩放上下文以适应高DPI
  ctx.scale(pixelRatio, pixelRatio);
  
  if (container) {
    container.appendChild(canvas);
  }
  
  return { canvas, ctx, pixelRatio };
}

/**
 * 清除Canvas
 * @param ctx Canvas上下文
 * @param width 宽度
 * @param height 高度
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * 应用样式到Canvas上下文
 * @param ctx Canvas上下文
 * @param style 样式配置
 */
export function applyStyle(ctx: CanvasRenderingContext2D, style: Style): void {
  if (style.fillColor) {
    ctx.fillStyle = style.fillColor;
  }
  
  if (style.strokeColor) {
    ctx.strokeStyle = style.strokeColor;
  }
  
  if (style.strokeWidth !== undefined) {
    ctx.lineWidth = style.strokeWidth;
  }
  
  if (style.opacity !== undefined) {
    ctx.globalAlpha = style.opacity;
  }
  
  if (style.dashArray) {
    ctx.setLineDash(style.dashArray);
  } else {
    ctx.setLineDash([]);
  }
  
  // 设置字体样式
  if (style.fontSize || style.fontFamily || style.fontWeight) {
    const fontSize = style.fontSize || 14;
    const fontFamily = style.fontFamily || 'Arial, sans-serif';
    const fontWeight = style.fontWeight || 'normal';
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  }
  
  if (style.fontColor) {
    ctx.fillStyle = style.fontColor;
  }
  
  // 设置阴影
  if (style.shadow) {
    ctx.shadowOffsetX = style.shadow.offsetX;
    ctx.shadowOffsetY = style.shadow.offsetY;
    ctx.shadowBlur = style.shadow.blur;
    ctx.shadowColor = style.shadow.color;
  } else {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }
}

/**
 * 绘制圆角矩形
 * @param ctx Canvas上下文
 * @param x X坐标
 * @param y Y坐标
 * @param width 宽度
 * @param height 高度
 * @param radius 圆角半径
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * 绘制箭头
 * @param ctx Canvas上下文
 * @param start 起点
 * @param end 终点
 * @param arrowSize 箭头大小
 */
export function drawArrow(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  arrowSize: number = 10
): void {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  
  // 绘制箭头头部
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(
    end.x - arrowSize * Math.cos(angle - Math.PI / 6),
    end.y - arrowSize * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(
    end.x - arrowSize * Math.cos(angle + Math.PI / 6),
    end.y - arrowSize * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

/**
 * 绘制虚线
 * @param ctx Canvas上下文
 * @param start 起点
 * @param end 终点
 * @param dashArray 虚线样式
 */
export function drawDashedLine(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  dashArray: number[] = [5, 5]
): void {
  ctx.setLineDash(dashArray);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * 测量文本尺寸
 * @param ctx Canvas上下文
 * @param text 文本
 * @param style 样式
 * @returns 文本尺寸
 */
export function measureText(ctx: CanvasRenderingContext2D, text: string, style?: Style): Size {
  if (style) {
    applyStyle(ctx, style);
  }
  
  const metrics = ctx.measureText(text);
  return {
    width: metrics.width,
    height: (metrics.actualBoundingBoxAscent || 0) + (metrics.actualBoundingBoxDescent || 0) || 14
  };
}

/**
 * 绘制居中文本
 * @param ctx Canvas上下文
 * @param text 文本
 * @param center 中心点
 * @param style 样式
 */
export function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  center: Point,
  style?: Style
): void {
  if (style) {
    applyStyle(ctx, style);
  }
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, center.x, center.y);
}

/**
 * 绘制多行文本
 * @param ctx Canvas上下文
 * @param text 文本
 * @param x X坐标
 * @param y Y坐标
 * @param maxWidth 最大宽度
 * @param lineHeight 行高
 * @param style 样式
 */
export function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  style?: Style
): void {
  if (style) {
    applyStyle(ctx, style);
  }
  
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  
  ctx.fillText(line, x, currentY);
}

/**
 * 坐标转换：世界坐标转屏幕坐标
 * @param worldPoint 世界坐标点
 * @param viewport 视口信息
 * @returns 屏幕坐标点
 */
export function worldToScreen(worldPoint: Point, viewport: Viewport): Point {
  return {
    x: (worldPoint.x + viewport.offset.x) * viewport.scale,
    y: (worldPoint.y + viewport.offset.y) * viewport.scale
  };
}

/**
 * 坐标转换：屏幕坐标转世界坐标
 * @param screenPoint 屏幕坐标点
 * @param viewport 视口信息
 * @returns 世界坐标点
 */
export function screenToWorld(screenPoint: Point, viewport: Viewport): Point {
  return {
    x: screenPoint.x / viewport.scale - viewport.offset.x,
    y: screenPoint.y / viewport.scale - viewport.offset.y
  };
}

/**
 * 获取Canvas相对坐标
 * @param canvas Canvas元素
 * @param clientX 客户端X坐标
 * @param clientY 客户端Y坐标
 * @returns Canvas相对坐标
 */
export function getCanvasCoordinates(canvas: HTMLCanvasElement, clientX: number, clientY: number): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

/**
 * 保存Canvas状态
 * @param ctx Canvas上下文
 */
export function saveCanvasState(ctx: CanvasRenderingContext2D): void {
  ctx.save();
}

/**
 * 恢复Canvas状态
 * @param ctx Canvas上下文
 */
export function restoreCanvasState(ctx: CanvasRenderingContext2D): void {
  ctx.restore();
}

/**
 * 设置Canvas变换
 * @param ctx Canvas上下文
 * @param viewport 视口信息
 */
export function setCanvasTransform(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
  ctx.setTransform(
    viewport.scale,
    0,
    0,
    viewport.scale,
    viewport.offset.x * viewport.scale,
    viewport.offset.y * viewport.scale
  );
}

/**
 * 重置Canvas变换
 * @param ctx Canvas上下文
 */
export function resetCanvasTransform(ctx: CanvasRenderingContext2D): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
