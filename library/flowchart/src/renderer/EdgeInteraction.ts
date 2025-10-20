import { Position } from '../types';
import { FlowEdge } from '../core/Edge';
import { ConnectionSide, ConnectionPointManager } from './ConnectionPointManager';

/**
 * 折点信息
 */
export interface Waypoint {
  id: string;
  position: Position;
  index: number;           // 在路径中的索引
  isDragging: boolean;
}

/**
 * 连接锚点信息（连接点拖拽）
 */
export interface ConnectionAnchor {
  id: string;
  edgeId: string;
  isSource: boolean;       // 是源端点还是目标端点
  position: Position;
  side: ConnectionSide;
  isDragging: boolean;
}

/**
 * 拖拽事件
 */
export interface DragEvent {
  type: 'waypoint' | 'anchor';
  id: string;
  edgeId: string;
  position: Position;
  originalPosition: Position;
}

/**
 * 连线交互管理器
 * 参考 bpmn.js 的交互系统
 * 支持：
 * 1. 连接点拖拽（改变连线的起始/结束位置）
 * 2. 折点拖拽（调整连线路径）
 * 3. 添加/删除折点
 */
export class EdgeInteraction {
  private waypoints: Map<string, Waypoint[]> = new Map();
  private anchors: Map<string, ConnectionAnchor[]> = new Map();
  private dragging: DragEvent | null = null;
  private hoveredElement: { type: 'waypoint' | 'anchor'; id: string; edgeId: string } | null = null;

  private onWaypointDrag?: (edgeId: string, waypointIndex: number, position: Position) => void;
  private onAnchorDrag?: (edgeId: string, isSource: boolean, position: Position) => void;
  private onWaypointAdd?: (edgeId: string, position: Position, index: number) => void;
  private onWaypointDelete?: (edgeId: string, index: number) => void;

  constructor(callbacks?: {
    onWaypointDrag?: (edgeId: string, waypointIndex: number, position: Position) => void;
    onAnchorDrag?: (edgeId: string, isSource: boolean, position: Position) => void;
    onWaypointAdd?: (edgeId: string, position: Position, index: number) => void;
    onWaypointDelete?: (edgeId: string, index: number) => void;
  }) {
    this.onWaypointDrag = callbacks?.onWaypointDrag;
    this.onAnchorDrag = callbacks?.onAnchorDrag;
    this.onWaypointAdd = callbacks?.onWaypointAdd;
    this.onWaypointDelete = callbacks?.onWaypointDelete;
  }

  /**
   * 为边创建交互元素
   */
  public createInteractionElements(
    edgeId: string,
    pathPoints: Position[],
    container: SVGGElement,
    svgElement: SVGSVGElement
  ): void {
    // 创建折点
    this.createWaypoints(edgeId, pathPoints, container, svgElement);

    // 创建连接锚点
    this.createAnchors(edgeId, pathPoints, container, svgElement);
  }

  /**
   * 创建折点（中间的可拖拽点）
   */
  private createWaypoints(
    edgeId: string,
    pathPoints: Position[],
    container: SVGGElement,
    svgElement: SVGSVGElement
  ): void {
    const waypoints: Waypoint[] = [];

    // 排除起点和终点，只为中间点创建折点
    for (let i = 1; i < pathPoints.length - 1; i++) {
      const waypointId = `${edgeId}-waypoint-${i}`;
      const waypoint: Waypoint = {
        id: waypointId,
        position: pathPoints[i],
        index: i,
        isDragging: false
      };

      waypoints.push(waypoint);

      // 创建可视化元素
      const element = this.createWaypointElement(waypoint, edgeId, container, svgElement);
      container.appendChild(element);
    }

    this.waypoints.set(edgeId, waypoints);
  }

  /**
   * 创建折点元素
   */
  private createWaypointElement(
    waypoint: Waypoint,
    edgeId: string,
    container: SVGGElement,
    svgElement: SVGSVGElement
  ): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'waypoint');
    group.setAttribute('data-waypoint-id', waypoint.id);
    group.setAttribute('data-edge-id', edgeId);
    group.style.cursor = 'move';

    // 外圈（悬停区域）
    const hoverCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hoverCircle.setAttribute('cx', String(waypoint.position.x));
    hoverCircle.setAttribute('cy', String(waypoint.position.y));
    hoverCircle.setAttribute('r', '8');
    hoverCircle.setAttribute('fill', 'transparent');
    hoverCircle.setAttribute('stroke', 'none');
    group.appendChild(hoverCircle);

    // 内圈（可见部分）
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(waypoint.position.x));
    circle.setAttribute('cy', String(waypoint.position.y));
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#fff');
    circle.setAttribute('stroke', '#2196f3');
    circle.setAttribute('stroke-width', '2');
    circle.style.opacity = '0';
    circle.style.transition = 'opacity 0.2s';
    group.appendChild(circle);

    // 悬停效果
    group.addEventListener('mouseenter', () => {
      circle.style.opacity = '1';
      this.hoveredElement = { type: 'waypoint', id: waypoint.id, edgeId };
    });

    group.addEventListener('mouseleave', () => {
      if (!waypoint.isDragging) {
        circle.style.opacity = '0';
      }
      if (this.hoveredElement?.id === waypoint.id) {
        this.hoveredElement = null;
      }
    });

    // 拖拽处理
    this.addDragBehavior(group, waypoint, edgeId, 'waypoint', svgElement, circle);

    // 双击删除
    group.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this.deleteWaypoint(edgeId, waypoint.index);
    });

    return group;
  }

  /**
   * 创建连接锚点（起点和终点）
   */
  private createAnchors(
    edgeId: string,
    pathPoints: Position[],
    container: SVGGElement,
    svgElement: SVGSVGElement
  ): void {
    if (pathPoints.length < 2) return;

    const anchors: ConnectionAnchor[] = [];

    // 源锚点
    const sourceAnchor: ConnectionAnchor = {
      id: `${edgeId}-anchor-source`,
      edgeId,
      isSource: true,
      position: pathPoints[0],
      side: ConnectionSide.RIGHT, // 默认，实际会从manager获取
      isDragging: false
    };

    anchors.push(sourceAnchor);
    const sourceElement = this.createAnchorElement(sourceAnchor, edgeId, container, svgElement);
    container.appendChild(sourceElement);

    // 目标锚点
    const targetAnchor: ConnectionAnchor = {
      id: `${edgeId}-anchor-target`,
      edgeId,
      isSource: false,
      position: pathPoints[pathPoints.length - 1],
      side: ConnectionSide.LEFT, // 默认，实际会从manager获取
      isDragging: false
    };

    anchors.push(targetAnchor);
    const targetElement = this.createAnchorElement(targetAnchor, edgeId, container, svgElement);
    container.appendChild(targetElement);

    this.anchors.set(edgeId, anchors);
  }

  /**
   * 创建锚点元素
   */
  private createAnchorElement(
    anchor: ConnectionAnchor,
    edgeId: string,
    container: SVGGElement,
    svgElement: SVGSVGElement
  ): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'connection-anchor');
    group.setAttribute('data-anchor-id', anchor.id);
    group.setAttribute('data-edge-id', edgeId);
    group.style.cursor = 'move';

    // 悬停区域
    const hoverCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hoverCircle.setAttribute('cx', String(anchor.position.x));
    hoverCircle.setAttribute('cy', String(anchor.position.y));
    hoverCircle.setAttribute('r', '8');
    hoverCircle.setAttribute('fill', 'transparent');
    hoverCircle.setAttribute('stroke', 'none');
    group.appendChild(hoverCircle);

    // 菱形锚点
    const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    diamond.setAttribute('x', String(anchor.position.x - 4));
    diamond.setAttribute('y', String(anchor.position.y - 4));
    diamond.setAttribute('width', '8');
    diamond.setAttribute('height', '8');
    diamond.setAttribute('fill', '#fff');
    diamond.setAttribute('stroke', '#4caf50');
    diamond.setAttribute('stroke-width', '2');
    diamond.setAttribute('transform', `rotate(45 ${anchor.position.x} ${anchor.position.y})`);
    diamond.style.opacity = '0';
    diamond.style.transition = 'opacity 0.2s';
    group.appendChild(diamond);

    // 悬停效果
    group.addEventListener('mouseenter', () => {
      diamond.style.opacity = '1';
      this.hoveredElement = { type: 'anchor', id: anchor.id, edgeId };
    });

    group.addEventListener('mouseleave', () => {
      if (!anchor.isDragging) {
        diamond.style.opacity = '0';
      }
      if (this.hoveredElement?.id === anchor.id) {
        this.hoveredElement = null;
      }
    });

    // 拖拽处理
    this.addDragBehavior(group, anchor, edgeId, 'anchor', svgElement, diamond);

    return group;
  }

  /**
   * 添加拖拽行为
   */
  private addDragBehavior(
    element: SVGGElement,
    target: Waypoint | ConnectionAnchor,
    edgeId: string,
    type: 'waypoint' | 'anchor',
    svgElement: SVGSVGElement,
    visualElement: SVGElement
  ): void {
    let startPos: Position = { x: 0, y: 0 };
    let isDragging = false;

    const onMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      isDragging = true;
      target.isDragging = true;
      visualElement.style.opacity = '1';

      const pt = this.getSVGPoint(svgElement, e.clientX, e.clientY);
      startPos = { x: pt.x, y: pt.y };

      this.dragging = {
        type,
        id: target.id,
        edgeId,
        position: { ...target.position },
        originalPosition: { ...target.position }
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const pt = this.getSVGPoint(svgElement, e.clientX, e.clientY);
      const newPos = { x: pt.x, y: pt.y };

      // 更新位置
      target.position = newPos;

      // 更新视觉元素位置
      this.updateElementPosition(element, newPos);

      // 触发回调
      if (type === 'waypoint' && this.onWaypointDrag) {
        this.onWaypointDrag(edgeId, (target as Waypoint).index, newPos);
      } else if (type === 'anchor' && this.onAnchorDrag) {
        this.onAnchorDrag(edgeId, (target as ConnectionAnchor).isSource, newPos);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      target.isDragging = false;

      if (this.hoveredElement?.id !== target.id) {
        visualElement.style.opacity = '0';
      }

      this.dragging = null;

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    element.addEventListener('mousedown', onMouseDown);
  }

  /**
   * 获取SVG坐标
   */
  private getSVGPoint(svg: SVGSVGElement, clientX: number, clientY: number): Position {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: svgP.x, y: svgP.y };
  }

  /**
   * 更新元素位置
   */
  private updateElementPosition(element: SVGGElement, position: Position): void {
    const circles = element.querySelectorAll('circle');
    circles.forEach(circle => {
      circle.setAttribute('cx', String(position.x));
      circle.setAttribute('cy', String(position.y));
    });

    const rect = element.querySelector('rect');
    if (rect) {
      rect.setAttribute('x', String(position.x - 4));
      rect.setAttribute('y', String(position.y - 4));
      rect.setAttribute('transform', `rotate(45 ${position.x} ${position.y})`);
    }
  }

  /**
   * 删除折点
   */
  private deleteWaypoint(edgeId: string, index: number): void {
    if (this.onWaypointDelete) {
      this.onWaypointDelete(edgeId, index);
    }
  }

  /**
   * 在路径上添加折点
   */
  public addWaypointOnPath(
    edgeId: string,
    position: Position,
    pathPoints: Position[]
  ): void {
    // 找到最近的线段
    let minDist = Infinity;
    let insertIndex = 1;

    for (let i = 0; i < pathPoints.length - 1; i++) {
      const dist = this.distanceToSegment(position, pathPoints[i], pathPoints[i + 1]);
      if (dist < minDist) {
        minDist = dist;
        insertIndex = i + 1;
      }
    }

    if (this.onWaypointAdd) {
      this.onWaypointAdd(edgeId, position, insertIndex);
    }
  }

  /**
   * 计算点到线段的距离
   */
  private distanceToSegment(point: Position, start: Position, end: Position): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return Math.sqrt((point.x - start.x) ** 2 + (point.y - start.y) ** 2);
    }

    let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const projX = start.x + t * dx;
    const projY = start.y + t * dy;

    return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
  }

  /**
   * 清除边的交互元素
   */
  public clearEdgeInteraction(edgeId: string): void {
    this.waypoints.delete(edgeId);
    this.anchors.delete(edgeId);
  }

  /**
   * 清除所有交互元素
   */
  public clear(): void {
    this.waypoints.clear();
    this.anchors.clear();
    this.dragging = null;
    this.hoveredElement = null;
  }

  /**
   * 获取当前拖拽状态
   */
  public getDraggingState(): DragEvent | null {
    return this.dragging;
  }

  /**
   * 显示/隐藏交互元素
   */
  public setInteractionVisible(edgeId: string, visible: boolean): void {
    // 实现显示/隐藏逻辑
    // 可以通过CSS类或直接修改opacity
  }
}













