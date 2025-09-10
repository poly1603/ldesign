/**
 * 贝塞尔曲线连接线
 * 使用三次贝塞尔曲线连接两个点，提供平滑的连接效果
 */

import type { BezierEdgeData, Point, EdgePath, Viewport } from '@/types/index.js';
import { EdgeType } from '@/types/index.js';
import { BaseEdge } from './BaseEdge.js';
import { cubicBezierPoint } from '@/utils/index.js';

/**
 * 贝塞尔曲线连接线类
 */
export class BezierEdge extends BaseEdge {
  private controlPointOffset: number;
  private customControlPoints?: Point[];
  private lastControlPoints?: { cp1: Point; cp2: Point };

  constructor(data: BezierEdgeData) {
    super(data);
    
    // 控制点偏移量，影响曲线的弯曲程度
    this.controlPointOffset = data.controlPointOffset || 100;
    this.customControlPoints = data.customControlPoints;
  }

  /**
   * 计算贝塞尔曲线路径
   */
  calculatePath(sourcePoint: Point, targetPoint: Point): EdgePath {
    const controlPoints = this.calculateControlPoints(sourcePoint, targetPoint);
    this.lastControlPoints = { cp1: { ...controlPoints.cp1 }, cp2: { ...controlPoints.cp2 } };
    const points = this.generateCurvePoints(
      sourcePoint,
      controlPoints.cp1,
      controlPoints.cp2,
      targetPoint
    );

    const length = this.calculateCurveLength(points);
    const bounds = this.calculateBounds(points);

    this.path = {
      points,
      length,
      bounds
    };

    // 清除边界框缓存
    this.cachedBounds = null;

    return this.path;
  }

  /**
   * 计算控制点
   */
  private calculateControlPoints(start: Point, end: Point): { cp1: Point; cp2: Point } {
    if (this.customControlPoints && this.customControlPoints.length >= 2) {
      return {
        cp1: this.customControlPoints[0]!,
        cp2: this.customControlPoints[1]!
      };
    }

    // 自动计算控制点
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 控制点偏移量，基于距离和设定的偏移量
    const offset = Math.min(this.controlPointOffset, distance * 0.5);

    // 水平方向的贝塞尔曲线
    const cp1: Point = {
      x: start.x + offset,
      y: start.y
    };

    const cp2: Point = {
      x: end.x - offset,
      y: end.y
    };

    return { cp1, cp2 };
  }

  /**
   * 生成曲线上的点
   */
  private generateCurvePoints(p0: Point, p1: Point, p2: Point, p3: Point): Point[] {
    const points: Point[] = [];
    const segments = 50; // 曲线分段数，影响精度

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = cubicBezierPoint(t, p0, p1, p2, p3);
      points.push(point);
    }

    return points;
  }

  /**
   * 计算曲线长度
   */
  private calculateCurveLength(points: Point[]): number {
    let length = 0;
    
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1]!;
      const p2 = points[i]!;
      length += Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );
    }
    
    return length;
  }

  /**
   * 计算边界框
   */
  private calculateBounds(points: Point[]): { x: number; y: number; width: number; height: number } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * 渲染连接线路径
   */
  protected override renderPath(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    // 引用以消除未使用参数的类型检查告警
    void viewport;
    if (!this.path || this.path.points.length < 4) {
      return;
    }

    // 使用Canvas的贝塞尔曲线API进行渲染（此处继续使用多段直线近似以保持一致）
    const points = this.path.points;
    
    ctx.beginPath();
    ctx.moveTo(points[0]!.x, points[0]!.y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i]!.x, points[i]!.y);
    }
    
    ctx.stroke();

    // 若选中，则渲染控制点
    if (this.selected) {
      const cps = this.getEffectiveControlPoints();
      if (cps) {
        ctx.save();
        // 控制点样式
        ctx.fillStyle = 'var(--ldesign-brand-color)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        // 画控制点标记
        const drawHandle = (p: Point) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        };

        // 连接起点与cp1、cp2与终点的辅助线（便于观察）
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        const start = points[0]!;
        const end = points[points.length - 1]!;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(cps.cp1.x, cps.cp1.y);
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(cps.cp2.x, cps.cp2.y);
        ctx.stroke();
        ctx.restore();

        drawHandle(cps.cp1);
        drawHandle(cps.cp2);
        ctx.restore();
      }
    }
  }

  /**
   * 渲染原生贝塞尔曲线（可选的高质量渲染）
   */
  private renderNativeBezier(ctx: CanvasRenderingContext2D, start: Point, end: Point): void {
    const controlPoints = this.calculateControlPoints(start, end);
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(
      controlPoints.cp1.x, controlPoints.cp1.y,
      controlPoints.cp2.x, controlPoints.cp2.y,
      end.x, end.y
    );
    ctx.stroke();
  }

  /**
   * 获取路径上的点（使用贝塞尔曲线公式）
   */
  override getPointAtPosition(position: number): Point {
    if (!this.path || this.path.points.length < 4) {
      return { x: 0, y: 0 };
    }

    position = Math.max(0, Math.min(1, position));
    
    // 使用预计算的点进行插值
    const index = position * (this.path.points.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    
    if (lowerIndex === upperIndex) {
      return { ...this.path.points[lowerIndex]! };
    }
    
    const t = index - lowerIndex;
    const p1 = this.path.points[lowerIndex]!;
    const p2 = this.path.points[upperIndex]!;
    
    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t
    };
  }

  /**
   * 获取路径上点的切线方向
   */
  override getTangentAtPosition(position: number): Point {
    if (!this.path || this.path.points.length < 4) {
      return { x: 1, y: 0 };
    }

    position = Math.max(0, Math.min(1, position));
    
    // 使用相邻点计算切线方向
    const index = position * (this.path.points.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.min(lowerIndex + 1, this.path.points.length - 1);
    
    const p1 = this.path.points[lowerIndex]!;
    const p2 = this.path.points[upperIndex]!;
    
    return this.calculateDirection(p1, p2);
  }

  /**
   * 设置控制点偏移量
   */
  setControlPointOffset(offset: number): void {
    this.controlPointOffset = offset;
    this.path = null; // 清除路径缓存
    this.cachedBounds = null;
  }

  /**
   * 获取控制点偏移量
   */
  getControlPointOffset(): number {
    return this.controlPointOffset;
  }

  /**
   * 设置自定义控制点
   */
  setCustomControlPoints(controlPoints: Point[]): void {
    this.customControlPoints = [...controlPoints];
    this.path = null; // 清除路径缓存
    this.cachedBounds = null;
  }

  /**
   * 获取自定义控制点
   */
  getCustomControlPoints(): Point[] | undefined {
    return this.customControlPoints ? [...this.customControlPoints] : undefined;
  }

  /**
   * 获取有效的控制点（优先自定义，否则使用最后一次计算）
   */
  getEffectiveControlPoints(): { cp1: Point; cp2: Point } | null {
    if (this.customControlPoints && this.customControlPoints.length >= 2) {
      return {
        cp1: this.customControlPoints[0]!,
        cp2: this.customControlPoints[1]!
      };
    }
    if (this.lastControlPoints) {
      return {
        cp1: this.lastControlPoints.cp1,
        cp2: this.lastControlPoints.cp2
      };
    }
    return null;
  }

  /**
   * 命中测试控制点
   */
  hitTestControlPoint(point: Point, tolerance: number = 8): number {
    const cps = this.getEffectiveControlPoints();
    if (!cps) return -1;
    const d1 = Math.hypot(point.x - cps.cp1.x, point.y - cps.cp1.y);
    if (d1 <= tolerance) return 0;
    const d2 = Math.hypot(point.x - cps.cp2.x, point.y - cps.cp2.y);
    if (d2 <= tolerance) return 1;
    return -1;
  }

  /**
   * 清除自定义控制点
   */
  clearCustomControlPoints(): void {
    this.customControlPoints = undefined;
    this.path = null; // 清除路径缓存
    this.cachedBounds = null;
  }

  /**
   * 更新连接线数据
   */
  override updateData(data: Partial<BezierEdgeData>): void {
    super.updateData(data);
    
    if (data.controlPointOffset !== undefined) {
      this.controlPointOffset = data.controlPointOffset;
    }
    
    if (data.customControlPoints !== undefined) {
      this.customControlPoints = data.customControlPoints ? [...data.customControlPoints] : undefined;
    }
  }

  /**
   * 获取连接线数据
   */
  override getData(): BezierEdgeData {
    const base = {
      ...super.getData(),
      type: EdgeType.BEZIER as const,
      controlPointOffset: this.controlPointOffset,
    } as BezierEdgeData;
    if (this.customControlPoints) {
      (base as any).customControlPoints = [...this.customControlPoints];
    }
    return base;
  }

  /**
   * 克隆连接线
   */
  clone(): BezierEdge {
    const data: BezierEdgeData = {
      ...this.getData(),
      id: `${this.id}_copy_${Date.now()}`
    };
    
    return new BezierEdge(data);
  }
}
