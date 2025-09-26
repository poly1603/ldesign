/**
 * @ldesign/cropper 变换工具函数
 * 
 * 提供2D变换计算、矩阵操作、坐标转换等工具函数
 */

import type { Point, Size, Rect, Matrix } from '../types';
import { 
  createIdentityMatrix, 
  createTranslateMatrix, 
  createScaleMatrix, 
  createRotateMatrix,
  multiplyMatrix,
  transformPoint,
  invertMatrix
} from './math';

// ============================================================================
// 变换构建器
// ============================================================================

/**
 * 变换构建器类
 * 用于链式构建复杂的变换矩阵
 */
export class TransformBuilder {
  private matrix: Matrix;

  constructor(initialMatrix?: Matrix) {
    this.matrix = initialMatrix || createIdentityMatrix();
  }

  /**
   * 平移变换
   * @param x X轴平移量
   * @param y Y轴平移量
   * @returns 变换构建器实例
   */
  translate(x: number, y: number): TransformBuilder {
    const translateMatrix = createTranslateMatrix(x, y);
    this.matrix = multiplyMatrix(this.matrix, translateMatrix);
    return this;
  }

  /**
   * 缩放变换
   * @param scaleX X轴缩放比例
   * @param scaleY Y轴缩放比例（可选，默认与scaleX相同）
   * @param origin 缩放原点（可选，默认为(0,0)）
   * @returns 变换构建器实例
   */
  scale(scaleX: number, scaleY: number = scaleX, origin?: Point): TransformBuilder {
    if (origin) {
      this.translate(origin.x, origin.y);
    }
    
    const scaleMatrix = createScaleMatrix(scaleX, scaleY);
    this.matrix = multiplyMatrix(this.matrix, scaleMatrix);
    
    if (origin) {
      this.translate(-origin.x, -origin.y);
    }
    
    return this;
  }

  /**
   * 旋转变换
   * @param angle 旋转角度（弧度）
   * @param origin 旋转原点（可选，默认为(0,0)）
   * @returns 变换构建器实例
   */
  rotate(angle: number, origin?: Point): TransformBuilder {
    if (origin) {
      this.translate(origin.x, origin.y);
    }
    
    const rotateMatrix = createRotateMatrix(angle);
    this.matrix = multiplyMatrix(this.matrix, rotateMatrix);
    
    if (origin) {
      this.translate(-origin.x, -origin.y);
    }
    
    return this;
  }

  /**
   * 倾斜变换
   * @param skewX X轴倾斜角度（弧度）
   * @param skewY Y轴倾斜角度（弧度）
   * @returns 变换构建器实例
   */
  skew(skewX: number, skewY: number = 0): TransformBuilder {
    const skewMatrix: Matrix = {
      a: 1,
      b: Math.tan(skewY),
      c: Math.tan(skewX),
      d: 1,
      e: 0,
      f: 0
    };
    this.matrix = multiplyMatrix(this.matrix, skewMatrix);
    return this;
  }

  /**
   * 翻转变换
   * @param flipX 是否水平翻转
   * @param flipY 是否垂直翻转
   * @param origin 翻转原点（可选，默认为(0,0)）
   * @returns 变换构建器实例
   */
  flip(flipX: boolean, flipY: boolean, origin?: Point): TransformBuilder {
    const scaleX = flipX ? -1 : 1;
    const scaleY = flipY ? -1 : 1;
    return this.scale(scaleX, scaleY, origin);
  }

  /**
   * 应用自定义矩阵
   * @param matrix 变换矩阵
   * @returns 变换构建器实例
   */
  multiply(matrix: Matrix): TransformBuilder {
    this.matrix = multiplyMatrix(this.matrix, matrix);
    return this;
  }

  /**
   * 重置为单位矩阵
   * @returns 变换构建器实例
   */
  reset(): TransformBuilder {
    this.matrix = createIdentityMatrix();
    return this;
  }

  /**
   * 获取当前变换矩阵
   * @returns 变换矩阵
   */
  getMatrix(): Matrix {
    return { ...this.matrix };
  }

  /**
   * 获取逆变换矩阵
   * @returns 逆变换矩阵，如果不可逆则返回null
   */
  getInverseMatrix(): Matrix | null {
    return invertMatrix(this.matrix);
  }

  /**
   * 克隆变换构建器
   * @returns 新的变换构建器实例
   */
  clone(): TransformBuilder {
    return new TransformBuilder(this.getMatrix());
  }
}

// ============================================================================
// 坐标系转换
// ============================================================================

/**
 * 坐标系转换器类
 * 用于在不同坐标系之间转换坐标
 */
export class CoordinateTransformer {
  private transform: Matrix;
  private inverseTransform: Matrix | null;

  constructor(transform: Matrix) {
    this.transform = transform;
    this.inverseTransform = invertMatrix(transform);
  }

  /**
   * 将点从源坐标系转换到目标坐标系
   * @param point 源坐标系中的点
   * @returns 目标坐标系中的点
   */
  transformPoint(point: Point): Point {
    return transformPoint(point, this.transform);
  }

  /**
   * 将点从目标坐标系转换回源坐标系
   * @param point 目标坐标系中的点
   * @returns 源坐标系中的点
   */
  inverseTransformPoint(point: Point): Point {
    if (!this.inverseTransform) {
      throw new Error('Transform is not invertible');
    }
    return transformPoint(point, this.inverseTransform);
  }

  /**
   * 转换矩形
   * @param rect 源坐标系中的矩形
   * @returns 目标坐标系中的矩形边界框
   */
  transformRect(rect: Rect): Rect {
    const corners = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height }
    ];

    const transformedCorners = corners.map(corner => this.transformPoint(corner));
    
    const xs = transformedCorners.map(p => p.x);
    const ys = transformedCorners.map(p => p.y);
    
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * 更新变换矩阵
   * @param transform 新的变换矩阵
   */
  updateTransform(transform: Matrix): void {
    this.transform = transform;
    this.inverseTransform = invertMatrix(transform);
  }
}

// ============================================================================
// 视口变换
// ============================================================================

/**
 * 创建视口变换矩阵
 * @param sourceRect 源矩形（世界坐标）
 * @param targetRect 目标矩形（屏幕坐标）
 * @param maintainAspectRatio 是否保持宽高比
 * @returns 视口变换矩阵
 */
export function createViewportTransform(
  sourceRect: Rect,
  targetRect: Rect,
  maintainAspectRatio: boolean = true
): Matrix {
  let scaleX = targetRect.width / sourceRect.width;
  let scaleY = targetRect.height / sourceRect.height;

  if (maintainAspectRatio) {
    const scale = Math.min(scaleX, scaleY);
    scaleX = scale;
    scaleY = scale;
  }

  const offsetX = targetRect.x - sourceRect.x * scaleX;
  const offsetY = targetRect.y - sourceRect.y * scaleY;

  return new TransformBuilder()
    .scale(scaleX, scaleY)
    .translate(offsetX, offsetY)
    .getMatrix();
}

/**
 * 创建适应变换矩阵
 * @param contentSize 内容尺寸
 * @param containerSize 容器尺寸
 * @param mode 适应模式
 * @returns 适应变换矩阵
 */
export function createFitTransform(
  contentSize: Size,
  containerSize: Size,
  mode: 'contain' | 'cover' | 'fill' = 'contain'
): Matrix {
  const scaleX = containerSize.width / contentSize.width;
  const scaleY = containerSize.height / contentSize.height;

  let scale: number;
  switch (mode) {
    case 'contain':
      scale = Math.min(scaleX, scaleY);
      break;
    case 'cover':
      scale = Math.max(scaleX, scaleY);
      break;
    case 'fill':
      return new TransformBuilder()
        .scale(scaleX, scaleY)
        .getMatrix();
    default:
      scale = 1;
  }

  const scaledWidth = contentSize.width * scale;
  const scaledHeight = contentSize.height * scale;
  const offsetX = (containerSize.width - scaledWidth) / 2;
  const offsetY = (containerSize.height - scaledHeight) / 2;

  return new TransformBuilder()
    .translate(offsetX, offsetY)
    .scale(scale)
    .getMatrix();
}

// ============================================================================
// 变换分解
// ============================================================================

/**
 * 变换分解结果
 */
export interface DecomposedTransform {
  /** 平移 */
  translation: Point;
  /** 缩放 */
  scale: Point;
  /** 旋转角度（弧度） */
  rotation: number;
  /** 倾斜 */
  skew: Point;
}

/**
 * 分解变换矩阵
 * @param matrix 变换矩阵
 * @returns 分解后的变换参数
 */
export function decomposeTransform(matrix: Matrix): DecomposedTransform {
  const { a, b, c, d, e, f } = matrix;

  // 平移
  const translation: Point = { x: e, y: f };

  // 计算缩放和旋转
  const scaleX = Math.sqrt(a * a + b * b);
  const scaleY = Math.sqrt(c * c + d * d);
  
  // 检查是否有翻转
  const determinant = a * d - b * c;
  const flipY = determinant < 0;
  
  const scale: Point = {
    x: scaleX,
    y: flipY ? -scaleY : scaleY
  };

  // 旋转角度
  const rotation = Math.atan2(b, a);

  // 倾斜（简化计算）
  const skew: Point = {
    x: Math.atan2(c, d) - rotation,
    y: 0
  };

  return {
    translation,
    scale,
    rotation,
    skew
  };
}

/**
 * 从分解的变换参数重建变换矩阵
 * @param decomposed 分解的变换参数
 * @returns 重建的变换矩阵
 */
export function recomposeTransform(decomposed: DecomposedTransform): Matrix {
  return new TransformBuilder()
    .translate(decomposed.translation.x, decomposed.translation.y)
    .rotate(decomposed.rotation)
    .scale(decomposed.scale.x, decomposed.scale.y)
    .skew(decomposed.skew.x, decomposed.skew.y)
    .getMatrix();
}

// ============================================================================
// 变换插值
// ============================================================================

/**
 * 在两个变换矩阵之间进行插值
 * @param from 起始变换矩阵
 * @param to 结束变换矩阵
 * @param t 插值参数（0-1）
 * @returns 插值后的变换矩阵
 */
export function interpolateTransform(from: Matrix, to: Matrix, t: number): Matrix {
  // 分解变换
  const fromDecomposed = decomposeTransform(from);
  const toDecomposed = decomposeTransform(to);

  // 插值各个分量
  const interpolated: DecomposedTransform = {
    translation: {
      x: fromDecomposed.translation.x + (toDecomposed.translation.x - fromDecomposed.translation.x) * t,
      y: fromDecomposed.translation.y + (toDecomposed.translation.y - fromDecomposed.translation.y) * t
    },
    scale: {
      x: fromDecomposed.scale.x + (toDecomposed.scale.x - fromDecomposed.scale.x) * t,
      y: fromDecomposed.scale.y + (toDecomposed.scale.y - fromDecomposed.scale.y) * t
    },
    rotation: fromDecomposed.rotation + (toDecomposed.rotation - fromDecomposed.rotation) * t,
    skew: {
      x: fromDecomposed.skew.x + (toDecomposed.skew.x - fromDecomposed.skew.x) * t,
      y: fromDecomposed.skew.y + (toDecomposed.skew.y - fromDecomposed.skew.y) * t
    }
  };

  // 重建变换矩阵
  return recomposeTransform(interpolated);
}

// ============================================================================
// 变换约束
// ============================================================================

/**
 * 约束变换参数
 * @param transform 原始变换
 * @param constraints 约束条件
 * @returns 约束后的变换
 */
export function constrainTransform(
  transform: Matrix,
  constraints: {
    minScale?: number;
    maxScale?: number;
    minRotation?: number;
    maxRotation?: number;
    allowFlip?: boolean;
    boundingRect?: Rect;
  }
): Matrix {
  const decomposed = decomposeTransform(transform);

  // 约束缩放
  if (constraints.minScale !== undefined) {
    decomposed.scale.x = Math.max(decomposed.scale.x, constraints.minScale);
    decomposed.scale.y = Math.max(decomposed.scale.y, constraints.minScale);
  }
  if (constraints.maxScale !== undefined) {
    decomposed.scale.x = Math.min(decomposed.scale.x, constraints.maxScale);
    decomposed.scale.y = Math.min(decomposed.scale.y, constraints.maxScale);
  }

  // 约束旋转
  if (constraints.minRotation !== undefined) {
    decomposed.rotation = Math.max(decomposed.rotation, constraints.minRotation);
  }
  if (constraints.maxRotation !== undefined) {
    decomposed.rotation = Math.min(decomposed.rotation, constraints.maxRotation);
  }

  // 约束翻转
  if (!constraints.allowFlip) {
    decomposed.scale.x = Math.abs(decomposed.scale.x);
    decomposed.scale.y = Math.abs(decomposed.scale.y);
  }

  // 约束边界（简化实现）
  if (constraints.boundingRect) {
    const rect = constraints.boundingRect;
    decomposed.translation.x = Math.max(rect.x, Math.min(rect.x + rect.width, decomposed.translation.x));
    decomposed.translation.y = Math.max(rect.y, Math.min(rect.y + rect.height, decomposed.translation.y));
  }

  return recomposeTransform(decomposed);
}

// ============================================================================
// 变换应用
// ============================================================================

/**
 * 将变换应用到Canvas上下文
 * @param ctx Canvas渲染上下文
 * @param transform 变换矩阵
 */
export function applyTransformToContext(
  ctx: CanvasRenderingContext2D,
  transform: Matrix
): void {
  ctx.setTransform(
    transform.a,
    transform.b,
    transform.c,
    transform.d,
    transform.e,
    transform.f
  );
}

/**
 * 将变换应用到DOM元素
 * @param element DOM元素
 * @param transform 变换矩阵
 */
export function applyTransformToElement(
  element: HTMLElement,
  transform: Matrix
): void {
  const { a, b, c, d, e, f } = transform;
  element.style.transform = `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
}
