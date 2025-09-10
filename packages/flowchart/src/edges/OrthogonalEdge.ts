/**
 * 直角连接线
 * 使用直角转折的方式连接两个点，适合流程图的规范化连接
 */

import type { OrthogonalEdgeData, Point, EdgePath, Viewport } from '@/types/index.js';
import { EdgeType } from '@/types/index.js';
import { BaseEdge } from './BaseEdge.js';

/**
 * 直角连接线类
 */
export class OrthogonalEdge extends BaseEdge {
  private waypoints: Point[] = [];
  private minSegmentLength: number;

  constructor(data: OrthogonalEdgeData) {
    super(data);
    
    if (Array.isArray(data.waypoints)) {
      this.waypoints = [...data.waypoints];
    } else {
      this.waypoints = [];
    }
    this.minSegmentLength = data.minSegmentLength || 20;
  }

  /**
   * 计算直角路径
   */
  calculatePath(sourcePoint: Point, targetPoint: Point): EdgePath {
    const points = this.waypoints && this.waypoints.length > 0
      ? this.calculateCustomPath(sourcePoint, targetPoint)
      : this.calculateAutoPath(sourcePoint, targetPoint);

    const length = this.calculatePathLength(points);
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
   * 计算自动路径（智能路由）
   */
  private calculateAutoPath(start: Point, end: Point): Point[] {
    const points: Point[] = [{ ...start }];
    
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // 简单的三段式路径：水平-垂直-水平 或 垂直-水平-垂直
    if (Math.abs(dx) > Math.abs(dy)) {
      // 水平距离更大，优先水平移动
      const midX = start.x + dx / 2;
      
      if (Math.abs(dy) > this.minSegmentLength) {
        points.push({ x: midX, y: start.y });
        points.push({ x: midX, y: end.y });
      }
    } else {
      // 垂直距离更大，优先垂直移动
      const midY = start.y + dy / 2;
      
      if (Math.abs(dx) > this.minSegmentLength) {
        points.push({ x: start.x, y: midY });
        points.push({ x: end.x, y: midY });
      }
    }
    
    points.push({ ...end });
    
    return points;
  }

  /**
   * 计算自定义路径
   */
  private calculateCustomPath(start: Point, end: Point): Point[] {
    const points: Point[] = [{ ...start }];
    
    for (const waypoint of this.waypoints) {
      points.push({ ...waypoint });
    }
    
    points.push({ ...end });
    
    return points;
  }

  /**
   * 计算路径长度
   */
  private calculatePathLength(points: Point[]): number {
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
   * 点击测试（靠近任一折线段）
   */
  override hitTest(point: Point, tolerance: number = 6): boolean {
    if (!this.path || this.path.points.length < 2) return false;
    for (let i = 1; i < this.path.points.length; i++) {
      const a = this.path.points[i - 1]!;
      const b = this.path.points[i]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;
      let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const cx = a.x + t * dx;
      const cy = a.y + t * dy;
      const dist = Math.hypot(point.x - cx, point.y - cy);
      if (dist <= tolerance) return true;
    }
    return false;
  }

  /**
   * 获取最近的线段与最近点
   */
  getClosestSegmentInfo(point: Point, tolerance: number = 8): { segmentIndex: number; nearest: Point } | null {
    if (!this.path || this.path.points.length < 2) return null;
    let best: { segmentIndex: number; nearest: Point; dist: number } | null = null;
    for (let i = 1; i < this.path.points.length; i++) {
      const a = this.path.points[i - 1]!;
      const b = this.path.points[i]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;
      let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const cx = a.x + t * dx;
      const cy = a.y + t * dy;
      const dist = Math.hypot(point.x - cx, point.y - cy);
      if (dist <= tolerance && (!best || dist < best.dist)) {
        best = { segmentIndex: i - 1, nearest: { x: cx, y: cy }, dist };
      }
    }
    return best ? { segmentIndex: best.segmentIndex, nearest: best.nearest } : null;
  }

  /**
   * 渲染连接线路径
   */
  protected override renderPath(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    // 引用以消除未使用参数的类型检查告警
    void viewport;
    if (!this.path || this.path.points.length < 2) {
      return;
    }

    const points = this.path.points;
    
    ctx.beginPath();
    ctx.moveTo(points[0]!.x, points[0]!.y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i]!.x, points[i]!.y);
    }
    
    ctx.stroke();

    // 如果选中，绘制转折点
    if (this.selected) {
      this.renderWaypoints(ctx);
    }
  }

  /**
   * 渲染转折点
   */
  private renderWaypoints(ctx: CanvasRenderingContext2D): void {
    if (!this.path || this.path.points.length < 3) {
      return;
    }

    ctx.save();
    
    // 转折点样式
    ctx.fillStyle = 'var(--ldesign-brand-color)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // 绘制中间的转折点（不包括起点和终点）
    for (let i = 1; i < this.path.points.length - 1; i++) {
      const point = this.path.points[i]!;
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 设置转折点
   */
  setWaypoints(waypoints: Point[]): void {
    this.waypoints = [...waypoints];
    this.path = null; // 清除路径缓存
    this.cachedBounds = null;
  }

  /**
   * 获取转折点
   */
  getWaypoints(): Point[] {
    return [...this.waypoints];
  }

  /**
   * 添加转折点
   */
  addWaypoint(point: Point, index?: number): void {
    if (index !== undefined && index >= 0 && index <= this.waypoints.length) {
      this.waypoints.splice(index, 0, { ...point });
    } else {
      this.waypoints.push({ ...point });
    }
    
    this.path = null; // 清除路径缓存
    this.cachedBounds = null;
  }

  /**
   * 移除转折点
   */
  removeWaypoint(index: number): void {
    if (index >= 0 && index < this.waypoints.length) {
      this.waypoints.splice(index, 1);
      this.path = null; // 清除路径缓存
      this.cachedBounds = null;
    }
  }

  /**
   * 清除所有转折点
   */
  clearWaypoints(): void {
    this.waypoints = [];
    this.path = null; // 清除路径缓存
    this.cachedBounds = null;
  }

  /**
   * 设置最小线段长度
   */
  setMinSegmentLength(length: number): void {
    this.minSegmentLength = Math.max(0, length);
    this.path = null; // 清除路径缓存
    this.cachedBounds = null;
  }

  /**
   * 获取最小线段长度
   */
  getMinSegmentLength(): number {
    return this.minSegmentLength;
  }

  /**
   * 检测转折点点击
   */
  hitTestWaypoint(point: Point, tolerance: number = 8): number {
    if (!this.path || this.path.points.length < 3) {
      return -1;
    }

    // 检查中间的转折点（不包括起点和终点）
    for (let i = 1; i < this.path.points.length - 1; i++) {
      const waypoint = this.path.points[i]!;
      const distance = Math.sqrt(
        Math.pow(point.x - waypoint.x, 2) + Math.pow(point.y - waypoint.y, 2)
      );
      
      if (distance <= tolerance) {
        return i - 1; // 返回在waypoints数组中的索引
      }
    }

    return -1;
  }

  /**
   * 更新连接线数据
   */
  override updateData(data: Partial<OrthogonalEdgeData>): void {
    super.updateData(data);
    
    if (data.waypoints !== undefined) {
      this.waypoints = data.waypoints ? [...data.waypoints] : [];
    }
    
    if (data.minSegmentLength !== undefined) {
      this.minSegmentLength = data.minSegmentLength;
    }
  }

  /**
   * 获取连接线数据
   */
  override getData(): OrthogonalEdgeData {
    const base = {
      ...super.getData(),
      type: EdgeType.ORTHOGONAL as const,
      minSegmentLength: this.minSegmentLength
    } as OrthogonalEdgeData;
    if (this.waypoints.length > 0) {
      (base as any).waypoints = [...this.waypoints];
    }
    return base;
  }

  /**
   * 克隆连接线
   */
  override clone(): OrthogonalEdge {
    const data: OrthogonalEdgeData = {
      ...this.getData(),
      id: `${this.id}_copy_${Date.now()}`
    };
    
    return new OrthogonalEdge(data);
  }
}
