/**
 * 基础连接线类
 * 提供所有连接线类型的基础功能和通用接口实现
 */

import type {
  BaseEdge as IBaseEdge,
  EdgeData,
  Point,
  Rectangle,
  Style,
  Viewport,
  EdgePath,
  LabelConfig
} from '@/types/index.js';
import { EventType, EdgeType, EdgeStatus, ArrowType } from '@/types/index.js';
import { SimpleEventEmitter, applyStyle, pointToLineDistance } from '@/utils/index.js';

/**
 * 默认连接线样式
 */
const DEFAULT_STYLE: Style = {
  strokeColor: '#666666',
  strokeWidth: 2,
  fontSize: 12,
  fontColor: '#333333',
  fontFamily: 'Arial, sans-serif',
  opacity: 1
};

/**
 * 默认选中样式
 */
const SELECTED_STYLE: Style = {
  strokeColor: 'var(--ldesign-brand-color)',
  strokeWidth: 3,
  shadow: {
    offsetX: 0,
    offsetY: 1,
    blur: 4,
    color: 'var(--ldesign-brand-color-focus)'
  }
};

/**
 * 基础连接线抽象类
 */
export abstract class BaseEdge extends SimpleEventEmitter implements IBaseEdge {
  public id: string;
  public type: EdgeType;
  public source: string;
  public target: string;
  public sourcePort?: string;
  public targetPort?: string;
  public style: Style;
  public status: EdgeStatus;
  public startArrow: ArrowType;
  public endArrow: ArrowType;
  public labels: LabelConfig[] = [];
  public visible = true;
  public locked = false;
  public selected = false;
  public properties: Record<string, any> = {};

  protected path: EdgePath | null = null;
  protected cachedBounds: Rectangle | null = null;

  constructor(data: EdgeData) {
    super();

    this.id = data.id;
    this.type = data.type as EdgeType;
    this.source = data.source;
    this.target = data.target;
    if (data.sourcePort !== undefined) {
      this.sourcePort = data.sourcePort;
    }
    if (data.targetPort !== undefined) {
      this.targetPort = data.targetPort;
    }
    this.style = { ...DEFAULT_STYLE, ...data.style };
    this.status = EdgeStatus.NORMAL;
    this.startArrow = ArrowType.NONE;
    this.endArrow = ArrowType.ARROW;
    this.properties = { ...data.properties };

    // 如果有标签，添加到标签列表
    if (data.label) {
      this.labels.push({
        text: data.label,
        position: 0.5,
        editable: true,
        background: {
          show: true,
          padding: 4,
          style: {
            fillColor: '#ffffff',
            strokeColor: '#cccccc',
            strokeWidth: 1
          }
        }
      });
    }
  }

  /**
   * 渲染连接线
   */
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    if (!this.visible || !this.path) {
      return;
    }

    ctx.save();

    // 应用基础样式
    const renderStyle = this.selected
      ? { ...this.style, ...SELECTED_STYLE }
      : this.style;

    applyStyle(ctx, renderStyle);

    // 渲染连接线路径
    this.renderPath(ctx, viewport);

    // 渲染箭头
    this.renderArrows(ctx, viewport);

    // 渲染标签
    this.renderLabels(ctx, viewport);

    ctx.restore();
  }

  /**
   * 渲染连接线路径（由子类实现）
   */
  protected abstract renderPath(ctx: CanvasRenderingContext2D, viewport: Viewport): void;

  /**
   * 渲染箭头
   */
  protected renderArrows(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    // 引用以消除未使用参数的类型检查告警
    void viewport;
    if (!this.path || this.path.points.length < 2) {
      return;
    }

    const points = this.path.points;

    // 渲染起始箭头
    if (this.startArrow !== ArrowType.NONE) {
      const startPoint = points[0]!;
      const secondPoint = points[1]!;
      const direction = this.calculateDirection(secondPoint, startPoint);
      this.renderArrow(ctx, this.startArrow, startPoint, direction);
    }

    // 渲染结束箭头
    if (this.endArrow !== ArrowType.NONE) {
      const endPoint = points[points.length - 1]!;
      const prevPoint = points[points.length - 2]!;
      const direction = this.calculateDirection(prevPoint, endPoint);
      this.renderArrow(ctx, this.endArrow, endPoint, direction);
    }
  }

  /**
   * 渲染单个箭头
   */
  protected renderArrow(ctx: CanvasRenderingContext2D, type: ArrowType, position: Point, direction: Point): void {
    const arrowSize = 10;
    const angle = Math.atan2(direction.y, direction.x);

    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(angle);

    switch (type) {
      case ArrowType.ARROW:
        this.renderStandardArrow(ctx, arrowSize);
        break;
      case ArrowType.FILLED_ARROW:
        this.renderFilledArrow(ctx, arrowSize);
        break;
      case ArrowType.CIRCLE:
        this.renderCircleArrow(ctx, arrowSize);
        break;
      case ArrowType.FILLED_CIRCLE:
        this.renderFilledCircleArrow(ctx, arrowSize);
        break;
      case ArrowType.DIAMOND:
        this.renderDiamondArrow(ctx, arrowSize);
        break;
      case ArrowType.FILLED_DIAMOND:
        this.renderFilledDiamondArrow(ctx, arrowSize);
        break;
    }

    ctx.restore();
  }

  /**
   * 渲染标准箭头
   */
  private renderStandardArrow(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size / 2);
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, size / 2);
    ctx.stroke();
  }

  /**
   * 渲染实心箭头
   */
  private renderFilledArrow(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size / 2);
    ctx.lineTo(-size * 0.7, 0);
    ctx.lineTo(-size, size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  /**
   * 渲染圆形箭头
   */
  private renderCircleArrow(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.beginPath();
    ctx.arc(-size / 2, 0, size / 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * 渲染实心圆形箭头
   */
  private renderFilledCircleArrow(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.beginPath();
    ctx.arc(-size / 2, 0, size / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  /**
   * 渲染菱形箭头
   */
  private renderDiamondArrow(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size / 2, -size / 4);
    ctx.lineTo(-size, 0);
    ctx.lineTo(-size / 2, size / 4);
    ctx.closePath();
    ctx.stroke();
  }

  /**
   * 渲染实心菱形箭头
   */
  private renderFilledDiamondArrow(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size / 2, -size / 4);
    ctx.lineTo(-size, 0);
    ctx.lineTo(-size / 2, size / 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  /**
   * 渲染标签
   */
  protected renderLabels(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    // 引用以消除未使用参数的类型检查告警
    void viewport;
    for (const label of this.labels) {
      if (!label.text) {
        continue;
      }

      const position = this.getPointAtPosition(label.position);
      if (!position) {
        continue;
      }

      // 应用偏移
      const labelPosition = {
        x: position.x + (label.offset?.x || 0),
        y: position.y + (label.offset?.y || 0)
      };

      ctx.save();

      // 渲染背景
      if (label.background?.show) {
        this.renderLabelBackground(ctx, label, labelPosition);
      }

      // 渲染文本
      applyStyle(ctx, label.style || this.style);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.text, labelPosition.x, labelPosition.y);

      ctx.restore();
    }
  }

  /**
   * 渲染标签背景
   */
  private renderLabelBackground(ctx: CanvasRenderingContext2D, label: LabelConfig, position: Point): void {
    const metrics = ctx.measureText(label.text);
    const padding = label.background?.padding || 4;
    const width = metrics.width + padding * 2;
    const height = (this.style.fontSize || 12) + padding * 2;

    ctx.save();

    if (label.background?.style) {
      applyStyle(ctx, label.background.style);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
    }

    ctx.fillRect(
      position.x - width / 2,
      position.y - height / 2,
      width,
      height
    );

    ctx.strokeRect(
      position.x - width / 2,
      position.y - height / 2,
      width,
      height
    );

    ctx.restore();
  }

  /**
   * 计算方向向量
   */
  protected calculateDirection(from: Point, to: Point): Point {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      return { x: 1, y: 0 };
    }

    return {
      x: dx / length,
      y: dy / length
    };
  }

  /**
   * 计算路径（抽象方法，由子类实现）
   */
  abstract calculatePath(sourcePoint: Point, targetPoint: Point): EdgePath;

  /**
   * 获取路径上的点
   */
  getPointAtPosition(position: number): Point {
    if (!this.path || this.path.points.length === 0) {
      // 在严格类型下始终返回一个点；此处返回原点作为兜底。
      return { x: 0, y: 0 };
    }

    position = Math.max(0, Math.min(1, position));

    if (position === 0) {
      return { ...this.path.points[0]! };
    }

    if (position === 1) {
      return { ...this.path.points[this.path.points.length - 1]! };
    }

    // 简化实现：线性插值
    const targetLength = this.path.length * position;
    let currentLength = 0;

    for (let i = 0; i < this.path.points.length - 1; i++) {
      const p1 = this.path.points[i]!;
      const p2 = this.path.points[i + 1]!;
      const segmentLength = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );

      if (currentLength + segmentLength >= targetLength) {
        const t = (targetLength - currentLength) / segmentLength;
        return {
          x: p1.x + (p2.x - p1.x) * t,
          y: p1.y + (p2.y - p1.y) * t
        };
      }

      currentLength += segmentLength;
    }

    return { ...this.path.points[this.path.points.length - 1]! };
  }

  /**
   * 获取路径上点的切线方向
   */
  getTangentAtPosition(position: number): Point {
    if (!this.path || this.path.points.length < 2) {
      return { x: 1, y: 0 };
    }

    position = Math.max(0, Math.min(1, position));

    // 简化实现：使用相邻点计算切线
    const index = Math.floor(position * (this.path.points.length - 1));
    const nextIndex = Math.min(index + 1, this.path.points.length - 1);

    const p1 = this.path.points[index]!;
    const p2 = this.path.points[nextIndex]!;

    return this.calculateDirection(p1, p2);
  }

  /**
   * 获取边界框
   */
  getBounds(): Rectangle {
    if (this.cachedBounds) {
      return this.cachedBounds;
    }

    if (!this.path || this.path.points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const point of this.path.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    this.cachedBounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    return this.cachedBounds;
  }

  /**
   * 点击测试
   */
  hitTest(point: Point, tolerance: number = 5): boolean {
    if (!this.path || this.path.points.length < 2) {
      return false;
    }

    // 检查每个线段
    for (let i = 0; i < this.path.points.length - 1; i++) {
      const p1 = this.path.points[i]!;
      const p2 = this.path.points[i + 1]!;

      if (pointToLineDistance(point, p1, p2) <= tolerance) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取最近的点
   */
  getClosestPoint(point: Point): Point {
    if (!this.path || this.path.points.length === 0) {
      return point;
    }

    let closestPoint = this.path.points[0]!;
    let minDistance = Infinity;

    for (const pathPoint of this.path.points) {
      const distance = Math.sqrt(
        Math.pow(point.x - pathPoint.x, 2) + Math.pow(point.y - pathPoint.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = pathPoint;
      }
    }

    return { ...closestPoint };
  }

  /**
   * 选中连接线
   */
  select(): void {
    if (!this.selected) {
      this.selected = true;
      this.emit(EventType.EDGE_SELECT, this);
    }
  }

  /**
   * 取消选中
   */
  deselect(): void {
    if (this.selected) {
      this.selected = false;
      this.emit(EventType.EDGE_DESELECT, this);
    }
  }

  /**
   * 更新连接线数据
   */
  updateData(data: Partial<EdgeData>): void {
    const oldData = this.getData();

    if (data.source !== undefined) {
      this.source = data.source;
    }

    if (data.target !== undefined) {
      this.target = data.target;
    }

    if (data.sourcePort !== undefined) {
      this.sourcePort = data.sourcePort;
    }

    if (data.targetPort !== undefined) {
      this.targetPort = data.targetPort;
    }

    if (data.style) {
      this.style = { ...this.style, ...data.style };
    }

    if (data.properties) {
      this.properties = { ...this.properties, ...data.properties };
    }

    // 清除缓存
    this.cachedBounds = null;
    this.path = null;

    this.emit(EventType.EDGE_UPDATE, { edge: this, oldData, newData: this.getData() });
  }

  /**
   * 获取连接线数据
   */
  getData(): EdgeData {
    const data: EdgeData = {
      id: this.id,
      type: this.type,
      source: this.source,
      target: this.target,
      style: { ...this.style },
      properties: { ...this.properties }
    };

    if (this.sourcePort !== undefined) {
      data.sourcePort = this.sourcePort;
    }
    if (this.targetPort !== undefined) {
      data.targetPort = this.targetPort;
    }
    if (this.labels.length > 0) {
      data.label = this.labels[0]!.text;
    }

    return data;
  }

  /**
   * 添加标签
   */
  addLabel(label: LabelConfig): void {
    this.labels.push({ ...label });
  }

  /**
   * 移除标签
   */
  removeLabel(index: number): void {
    if (index >= 0 && index < this.labels.length) {
      this.labels.splice(index, 1);
    }
  }

  /**
   * 更新标签
   */
  updateLabel(index: number, label: Partial<LabelConfig>): void {
    if (index >= 0 && index < this.labels.length) {
      this.labels[index] = { ...this.labels[index]!, ...label };
    }
  }

  /**
   * 克隆连接线
   */
  abstract clone(): BaseEdge;

  /**
   * 销毁连接线
   */
  destroy(): void {
    this.removeAllListeners();
    this.labels = [];
    this.properties = {};
    this.path = null;
    this.cachedBounds = null;
  }
}
