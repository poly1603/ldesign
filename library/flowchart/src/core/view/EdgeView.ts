/**
 * 边视图类 - 负责边的SVG渲染
 */

import { EdgeModel } from '../model/Edge';
import { NodeModel } from '../model/Node';
import { Position } from '../../types/model';

export class EdgeView {
  private model: EdgeModel;
  private group: SVGGElement;
  private path: SVGPathElement | null = null;
  private arrow: SVGPolygonElement | null = null;
  private textElement: SVGTextElement | null = null;
  private selected = false;

  // 节点引用（用于计算路径）
  private sourceNode: NodeModel | null = null;
  private targetNode: NodeModel | null = null;

  constructor(model: EdgeModel) {
    this.model = model;
    this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.group.setAttribute('class', 'fc-edge');
    this.group.setAttribute('data-id', model.id);

    this.render();
    this.bindModelEvents();
  }

  /**
   * 绑定模型事件
   */
  private bindModelEvents(): void {
    this.model.on('change:style', () => this.updateStyle());
    this.model.on('change:waypoints', () => this.updatePath());
  }

  /**
   * 设置源节点和目标节点
   */
  setNodes(source: NodeModel, target: NodeModel): void {
    this.sourceNode = source;
    this.targetNode = target;

    // 监听节点位置变化
    source.on('change:position', () => this.updatePath());
    target.on('change:position', () => this.updatePath());

    this.updatePath();
  }

  /**
   * 渲染边
   */
  private render(): void {
    // 创建路径
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.path.setAttribute('fill', 'none');
    this.path.setAttribute('stroke', '#666');
    this.path.setAttribute('stroke-width', '2');
    this.group.appendChild(this.path);

    // 创建箭头
    this.arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    this.arrow.setAttribute('fill', '#666');
    this.group.appendChild(this.arrow);

    // 创建标签
    if (this.model.label) {
      this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      this.textElement.setAttribute('text-anchor', 'middle');
      this.textElement.setAttribute('dominant-baseline', 'middle');
      this.textElement.setAttribute('font-size', '12');
      this.textElement.setAttribute('fill', '#666');
      this.textElement.setAttribute('pointer-events', 'none');
      this.textElement.textContent = this.model.label;
      this.group.appendChild(this.textElement);
    }

    this.updateStyle();
  }

  /**
   * 更新路径
   */
  private updatePath(): void {
    if (!this.sourceNode || !this.targetNode || !this.path) return;

    const sourcePos = this.getNodeConnectionPoint(this.sourceNode, this.targetNode);
    const targetPos = this.getNodeConnectionPoint(this.targetNode, this.sourceNode);

    // 获取自定义路径点
    const waypoints = this.model.getWaypoints();

    let pathData: string;
    if (waypoints.length > 0) {
      // 使用自定义路径点
      pathData = this.createPolylinePath([sourcePos, ...waypoints, targetPos]);
    } else {
      // 创建默认路径（直线或正交路径）
      pathData = this.createOrthogonalPath(sourcePos, targetPos);
    }

    this.path.setAttribute('d', pathData);

    // 更新箭头
    this.updateArrow(targetPos, waypoints.length > 0 ? waypoints[waypoints.length - 1] : sourcePos);

    // 更新标签位置
    if (this.textElement) {
      const midPoint = this.getMidPoint(sourcePos, targetPos);
      this.textElement.setAttribute('x', midPoint.x.toString());
      this.textElement.setAttribute('y', (midPoint.y - 10).toString());
    }
  }

  /**
   * 获取节点连接点
   */
  private getNodeConnectionPoint(node: NodeModel, otherNode: NodeModel): Position {
    const nodeCenter = node.getCenter();
    const otherCenter = otherNode.getCenter();
    const { width, height } = node.getSize();

    const dx = otherCenter.x - nodeCenter.x;
    const dy = otherCenter.y - nodeCenter.y;

    // 计算连接点（节点边框中心）
    if (Math.abs(dx) > Math.abs(dy)) {
      // 水平方向
      return {
        x: nodeCenter.x + (dx > 0 ? width / 2 : -width / 2),
        y: nodeCenter.y,
      };
    } else {
      // 垂直方向
      return {
        x: nodeCenter.x,
        y: nodeCenter.y + (dy > 0 ? height / 2 : -height / 2),
      };
    }
  }

  /**
   * 创建折线路径
   */
  private createPolylinePath(points: Position[]): string {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }

  /**
   * 创建正交路径
   */
  private createOrthogonalPath(start: Position, end: Position): string {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // 简单的正交路径：中点转折
    const midX = start.x + dx / 2;

    return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
  }

  /**
   * 更新箭头
   */
  private updateArrow(target: Position, prev: Position): void {
    if (!this.arrow) return;

    const angle = Math.atan2(target.y - prev.y, target.x - prev.x);
    const arrowSize = 8;

    const points = [
      `${target.x},${target.y}`,
      `${target.x - arrowSize * Math.cos(angle - Math.PI / 6)},${target.y - arrowSize * Math.sin(angle - Math.PI / 6)}`,
      `${target.x - arrowSize * Math.cos(angle + Math.PI / 6)},${target.y - arrowSize * Math.sin(angle + Math.PI / 6)}`,
    ].join(' ');

    this.arrow.setAttribute('points', points);
  }

  /**
   * 获取中点
   */
  private getMidPoint(start: Position, end: Position): Position {
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };
  }

  /**
   * 更新样式
   */
  private updateStyle(): void {
    if (!this.path || !this.arrow) return;

    const style = this.model.getStyle();

    const stroke = style.stroke || '#666';
    const strokeWidth = style.strokeWidth || 2;

    this.path.setAttribute('stroke', stroke);
    this.path.setAttribute('stroke-width', strokeWidth.toString());
    this.arrow.setAttribute('fill', stroke);

    if (style.strokeDasharray) {
      this.path.setAttribute('stroke-dasharray', style.strokeDasharray);
    }

    if (style.opacity !== undefined) {
      this.group.setAttribute('opacity', style.opacity.toString());
    }

    // 应用选中状态
    if (this.selected) {
      this.path.setAttribute('stroke', '#1890ff');
      this.path.setAttribute('stroke-width', '3');
      this.arrow.setAttribute('fill', '#1890ff');
    }
  }

  /**
   * 设置选中状态
   */
  setSelected(selected: boolean): void {
    this.selected = selected;
    this.updateStyle();
  }

  /**
   * 获取DOM元素
   */
  getElement(): SVGGElement {
    return this.group;
  }

  /**
   * 获取模型
   */
  getModel(): EdgeModel {
    return this.model;
  }

  /**
   * 销毁视图
   */
  destroy(): void {
    this.group.remove();
  }
}


