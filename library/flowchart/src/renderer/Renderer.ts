import { FlowNode } from '../core/Node';
import { FlowEdge } from '../core/Edge';
import { RenderConfig, NodeType, NodeStatus, Position } from '../types';
import { EdgeRenderer } from './EdgeRenderer';

/**
 * SVG渲染器（支持缩放、拖拽、节点移动）
 */
export class Renderer {
  private svg: SVGSVGElement;
  private container: HTMLElement;
  private config: RenderConfig;
  private nodesGroup: SVGGElement;
  private edgesGroup: SVGGElement;
  private transform = { x: 0, y: 0, scale: 1 };
  
  // 交互状态
  private isDraggingCanvas = false;
  private isDraggingNode = false;
  private dragStartPos = { x: 0, y: 0 };
  private canvasDragStart = { x: 0, y: 0 }; // 画布拖拽起始位置（屏幕坐标）
  private transformStart = { x: 0, y: 0, scale: 1 }; // 拖拽开始时的transform
  private draggedNode: FlowNode | null = null;
  private nodeElements = new Map<string, SVGGElement>();
  private edgeElements: FlowEdge[] = [];
  private onEdgeClickCallback?: (edge: FlowEdge) => void;
  private edgeRenderer: EdgeRenderer;
  
  // 配置
  private enableZoom: boolean;
  private enablePan: boolean;
  private enableNodeDrag: boolean;
  private minScale: number;
  private maxScale: number;
  private scaleStep: number;
  private onZoomChange?: (scale: number) => void;
  private initialPosition?: string | { x: number; y: number };
  private centerOnInit: boolean;

  constructor(container: HTMLElement, config: RenderConfig, options?: {
    enableZoom?: boolean;
    enablePan?: boolean;
    enableNodeDrag?: boolean;
    initialScale?: number;
    minScale?: number;
    maxScale?: number;
    scaleStep?: number;
    initialPosition?: string | { x: number; y: number };
    centerOnInit?: boolean;
    onZoomChange?: (scale: number) => void;
  }) {
    this.container = container;
    this.config = config;
    this.enableZoom = options?.enableZoom ?? true;
    this.enablePan = options?.enablePan ?? true;
    this.enableNodeDrag = options?.enableNodeDrag ?? true;
    this.minScale = options?.minScale ?? 0.1;
    this.maxScale = options?.maxScale ?? 3;
    this.scaleStep = options?.scaleStep ?? 0.1;
    this.onZoomChange = options?.onZoomChange;
    
    // 设置初始缩放比例
    if (options?.initialScale) {
      this.transform.scale = Math.max(this.minScale, Math.min(this.maxScale, options.initialScale));
    }
    
    // 保存初始位置配置，在内容加载后应用
    this.initialPosition = options?.initialPosition;
    this.centerOnInit = options?.centerOnInit ?? true; // 默认居中
    
    this.edgeRenderer = new EdgeRenderer();
    
    // 创建SVG元素
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.style.backgroundColor = '#f8f9fa';
    this.svg.style.cursor = 'grab';
    
    // 创建边组（先渲染）
    this.edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.edgesGroup.setAttribute('class', 'edges-group');
    this.svg.appendChild(this.edgesGroup);
    
    // 创建节点组（后渲染，在边之上）
    this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.nodesGroup.setAttribute('class', 'nodes-group');
    this.svg.appendChild(this.nodesGroup);
    
    container.appendChild(this.svg);
    
    this.initViewBox();
    this.initInteractions();
  }

  /**
   * 初始化视图框
   */
  private initViewBox(): void {
    const rect = this.container.getBoundingClientRect();
    // 以(0,0)为原点，便于坐标计算
    this.svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  }

  /**
   * 初始化交互功能
   */
  private initInteractions(): void {
    // 滚轮缩放
    if (this.enableZoom) {
      this.svg.addEventListener('wheel', this.handleWheel.bind(this));
    }
    
    // 画布拖拽
    if (this.enablePan) {
      this.svg.addEventListener('mousedown', this.handleCanvasMouseDown.bind(this));
      this.svg.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.svg.addEventListener('mouseup', this.handleMouseUp.bind(this));
      this.svg.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    }
  }

  /**
   * 处理滚轮事件（缩放）
   */
  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    
    const delta = -event.deltaY;
    const newScale = delta > 0 
      ? this.transform.scale * (1 + this.scaleStep)
      : this.transform.scale * (1 - this.scaleStep);
    
    // 限制缩放范围
    const clampedScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
    
    // 获取鼠标在SVG中的位置
    const rect = this.svg.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // 计算缩放中心点
    const viewBox = this.svg.viewBox.baseVal;
    const svgX = viewBox.x + (mouseX / rect.width) * viewBox.width;
    const svgY = viewBox.y + (mouseY / rect.height) * viewBox.height;
    
    // 调整变换以保持鼠标位置不变
    const scaleFactor = clampedScale / this.transform.scale;
    this.transform.x = svgX - (svgX - this.transform.x) * scaleFactor;
    this.transform.y = svgY - (svgY - this.transform.y) * scaleFactor;
    this.transform.scale = clampedScale;
    
    this.applyTransform();
    
    // 触发缩放变化回调
    if (this.onZoomChange) {
      this.onZoomChange(clampedScale);
    }
  }

  /**
   * 处理画布鼠标按下
   */
  private handleCanvasMouseDown(event: MouseEvent): void {
    // 如果点击的是节点，不处理画布拖拽
    const target = event.target as SVGElement;
    if (target.classList.contains('node') || target.closest('.node')) {
      return;
    }
    
    this.isDraggingCanvas = true;
    // 记录屏幕坐标
    this.canvasDragStart = { x: event.clientX, y: event.clientY };
    // 记录当前transform状态
    this.transformStart = { ...this.transform };
    this.svg.style.cursor = 'grabbing';
  }

  /**
   * 处理鼠标移动
   */
  private handleMouseMove(event: MouseEvent): void {
    if (this.isDraggingCanvas) {
      // 计算屏幕坐标的偏移量
      const dx = event.clientX - this.canvasDragStart.x;
      const dy = event.clientY - this.canvasDragStart.y;
      
      // 将屏幕坐标偏移转换为SVG坐标偏移（考虑缩放）
      this.transform.x = this.transformStart.x + dx;
      this.transform.y = this.transformStart.y + dy;
      
      this.applyTransform();
    } else if (this.isDraggingNode && this.draggedNode) {
      const currentPos = this.getNodePoint(event);
      this.draggedNode.updatePosition(currentPos);
      this.updateNodeElement(this.draggedNode);
      this.updateAllEdges();
    }
  }

  /**
   * 处理鼠标释放
   */
  private handleMouseUp(): void {
    this.isDraggingCanvas = false;
    this.isDraggingNode = false;
    this.draggedNode = null;
    this.svg.style.cursor = 'grab';
  }

  /**
   * 获取SVG坐标系中的点（用于画布拖拽）
   */
  private getSVGPoint(event: MouseEvent): Position {
    const CTM = this.svg.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    
    const point = this.svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(CTM.inverse());
    
    return {
      x: (svgPoint.x - this.transform.x) / this.transform.scale,
      y: (svgPoint.y - this.transform.y) / this.transform.scale
    };
  }

  /**
   * 获取节点坐标（考虑transform，用于节点拖拽）
   */
  private getNodePoint(event: MouseEvent): Position {
    const CTM = this.nodesGroup.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    
    const point = this.svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformedPoint = point.matrixTransform(CTM.inverse());
    
    return {
      x: transformedPoint.x,
      y: transformedPoint.y
    };
  }

  /**
   * 应用变换
   */
  private applyTransform(): void {
    const transform = `translate(${this.transform.x}, ${this.transform.y}) scale(${this.transform.scale})`;
    this.nodesGroup.setAttribute('transform', transform);
    this.edgesGroup.setAttribute('transform', transform);
  }

  /**
   * 渲染节点
   */
  public renderNode(node: FlowNode, onClick?: (node: FlowNode) => void): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', `node node-${node.type}`);
    group.setAttribute('data-node-id', node.id);
    group.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
    
    const style = { ...this.getDefaultNodeStyle(node.type), ...node.style };
    const size = this.config.nodeDefaultSize;
    
    // 创建节点形状
    const shape = this.createNodeShape(node.type, size, style, node.status);
    group.appendChild(shape);
    
    // 创建文本
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '0');
    text.setAttribute('y', '0');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', style.textColor || '#333');
    text.setAttribute('font-size', String(style.fontSize || 14));
    text.setAttribute('pointer-events', 'none'); // 文本不接收鼠标事件
    text.textContent = node.label;
    group.appendChild(text);
    
    // 设置节点可拖拽
    if (this.enableNodeDrag) {
      group.style.cursor = 'move';
      group.addEventListener('mousedown', (e) => this.handleNodeMouseDown(e, node));
    }
    
    // 添加点击事件
    if (onClick) {
      group.addEventListener('click', (e) => {
        if (!this.isDraggingNode) {
          onClick(node);
        }
      });
    }
    
    this.nodesGroup.appendChild(group);
    this.nodeElements.set(node.id, group);
    return group;
  }

  /**
   * 处理节点鼠标按下
   */
  private handleNodeMouseDown(event: MouseEvent, node: FlowNode): void {
    event.stopPropagation();
    this.isDraggingNode = true;
    this.draggedNode = node;
    this.svg.style.cursor = 'move';
  }

  /**
   * 更新节点元素位置
   */
  private updateNodeElement(node: FlowNode): void {
    const element = this.nodeElements.get(node.id);
    if (element) {
      element.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
    }
  }

  /**
   * 更新所有边
   */
  private updateAllEdges(): void {
    this.edgesGroup.innerHTML = '';
    this.edgeElements.forEach(edge => {
      this.renderEdge(edge, this.onEdgeClickCallback);
    });
  }

  /**
   * 创建节点形状
   */
  private createNodeShape(
    type: NodeType, 
    size: { width: number; height: number }, 
    style: any,
    status: NodeStatus
  ): SVGElement {
    const { width, height } = size;
    const halfW = width / 2;
    const halfH = height / 2;
    
    let shape: SVGElement;
    
    switch (type) {
      case NodeType.START:
      case NodeType.END:
        // 圆角矩形
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shape.setAttribute('x', String(-halfW));
        shape.setAttribute('y', String(-halfH));
        shape.setAttribute('width', String(width));
        shape.setAttribute('height', String(height));
        shape.setAttribute('rx', String(height / 2));
        break;
        
      case NodeType.CONDITION:
        // 菱形
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const diamondPath = `M 0,${-halfH} L ${halfW},0 L 0,${halfH} L ${-halfW},0 Z`;
        shape.setAttribute('d', diamondPath);
        break;
        
      default:
        // 默认矩形
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shape.setAttribute('x', String(-halfW));
        shape.setAttribute('y', String(-halfH));
        shape.setAttribute('width', String(width));
        shape.setAttribute('height', String(height));
        shape.setAttribute('rx', String(style.borderRadius || 4));
        break;
    }
    
    // 根据状态设置颜色
    const bgColor = this.getStatusColor(status, style.backgroundColor);
    shape.setAttribute('fill', bgColor);
    shape.setAttribute('stroke', style.borderColor || '#333');
    shape.setAttribute('stroke-width', String(style.borderWidth || 2));
    
    return shape;
  }

  /**
   * 获取状态颜色
   */
  private getStatusColor(status: NodeStatus, defaultColor?: string): string {
    const statusColors: Record<NodeStatus, string> = {
      [NodeStatus.PENDING]: '#e9ecef',
      [NodeStatus.PROCESSING]: '#fff3cd',
      [NodeStatus.APPROVED]: '#d4edda',
      [NodeStatus.REJECTED]: '#f8d7da',
      [NodeStatus.COMPLETED]: '#d1ecf1'
    };
    
    return statusColors[status] || defaultColor || '#fff';
  }

  /**
   * 渲染边
   */
  public renderEdge(edge: FlowEdge, onClick?: (edge: FlowEdge) => void): SVGGElement {
    // 保存边数据和回调，用于节点拖动时更新
    if (!this.edgeElements.includes(edge)) {
      this.edgeElements.push(edge);
    }
    if (onClick) {
      this.onEdgeClickCallback = onClick;
    }
    
    // 合并样式
    const style = { ...this.config.edgeDefaultStyle, ...edge.style };
    
    // 使用新的 EdgeRenderer 渲染
    return this.edgeRenderer.renderEdge(edge, this.edgesGroup, style, onClick);
  }

  /**
   * 设置节点供边路由使用
   */
  public setNodesForEdgeRouting(nodes: Map<string, FlowNode>): void {
    this.edgeRenderer.setNodes(nodes);
  }

  /**
   * 获取当前的 transform 信息
   */
  public getTransform(): { x: number; y: number; scale: number } {
    return { ...this.transform };
  }

  /**
   * 将屏幕坐标转换为流程图坐标（供外部使用）
   */
  public screenToFlowChart(screenX: number, screenY: number): Position {
    try {
      // 创建 SVG 点
      const pt = this.svg.createSVGPoint();
      pt.x = screenX;
      pt.y = screenY;

      // 转换到 SVG viewBox 坐标
      const svgCTM = this.svg.getScreenCTM();
      if (!svgCTM) {
        throw new Error('无法获取 SVG CTM');
      }
      const svgPoint = pt.matrixTransform(svgCTM.inverse());

      // 直接使用 this.transform 反向计算
      // nodesGroup 的 transform: translate(x, y) scale(s)
      // 节点位置 pos 经过变换后显示在: (pos.x * s + x, pos.y * s + y)
      // 反向: pos = ((display - translate) / scale)
      
      const x = (svgPoint.x - this.transform.x) / this.transform.scale;
      const y = (svgPoint.y - this.transform.y) / this.transform.scale;

      console.log('坐标转换:', {
        screen: `(${screenX}, ${screenY})`,
        svg: `(${svgPoint.x.toFixed(1)}, ${svgPoint.y.toFixed(1)})`,
        transform: `translate(${this.transform.x}, ${this.transform.y}) scale(${this.transform.scale})`,
        result: `(${x.toFixed(1)}, ${y.toFixed(1)})`
      });

      return { x, y };
    } catch (error) {
      console.error('坐标转换失败:', error);
      return { x: 0, y: 0 };
    }
  }

  /**
   * 清空画布
   */
  public clear(): void {
    this.nodesGroup.innerHTML = '';
    this.edgesGroup.innerHTML = '';
    this.nodeElements.clear();
    this.edgeElements = [];
    this.edgeRenderer.clear();
  }

  /**
   * 获取默认节点样式
   */
  private getDefaultNodeStyle(type: NodeType): any {
    return this.config.nodeStyles[type] || {
      backgroundColor: '#fff',
      borderColor: '#333',
      borderWidth: 2,
      textColor: '#333',
      fontSize: 14,
      borderRadius: 4
    };
  }

  /**
   * 初始化
   */
  public init(): void {
    // 箭头标记现在由 EdgeRenderer 处理，不再需要在这里创建
  }

  /**
   * 设置缩放和平移
   */
  public setTransform(x: number, y: number, scale: number): void {
    const clampedScale = Math.max(this.minScale, Math.min(this.maxScale, scale));
    this.transform = { x, y, scale: clampedScale };
    this.applyTransform();
    
    if (this.onZoomChange && clampedScale !== scale) {
      this.onZoomChange(clampedScale);
    }
  }
  
  /**
   * 设置缩放比例
   */
  public setScale(scale: number, centerX?: number, centerY?: number): void {
    const clampedScale = Math.max(this.minScale, Math.min(this.maxScale, scale));
    
    if (centerX !== undefined && centerY !== undefined) {
      // 以指定点为中心缩放
      const scaleFactor = clampedScale / this.transform.scale;
      this.transform.x = centerX - (centerX - this.transform.x) * scaleFactor;
      this.transform.y = centerY - (centerY - this.transform.y) * scaleFactor;
    }
    
    this.transform.scale = clampedScale;
    this.applyTransform();
    
    if (this.onZoomChange) {
      this.onZoomChange(clampedScale);
    }
  }
  
  /**
   * 获取当前缩放比例
   */
  public getScale(): number {
    return this.transform.scale;
  }
  
  /**
   * 放大
   */
  public zoomIn(): void {
    this.setScale(this.transform.scale * (1 + this.scaleStep));
  }
  
  /**
   * 缩小
   */
  public zoomOut(): void {
    this.setScale(this.transform.scale * (1 - this.scaleStep));
  }
  
  /**
   * 重置缩放
   */
  public resetZoom(): void {
    this.setTransform(0, 0, 1);
  }

  /**
   * 适应画布
   */
  public fitView(padding: number = 50): void {
    const bbox = this.nodesGroup.getBBox();
    const rect = this.container.getBoundingClientRect();
    
    if (bbox.width === 0 || bbox.height === 0) {
      return;
    }
    
    const scale = Math.min(
      rect.width / (bbox.width + padding * 2),
      rect.height / (bbox.height + padding * 2),
      this.maxScale
    );
    
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    
    this.setTransform(-centerX * scale, -centerY * scale, scale);
  }
  
  /**
   * 应用初始位置
   */
  public applyInitialPosition(): void {
    const bbox = this.nodesGroup.getBBox();
    if (bbox.width === 0 || bbox.height === 0) {
      return;
    }
    
    const rect = this.container.getBoundingClientRect();
    const scale = this.transform.scale;
    
    // 如果设置了居中
    if (this.centerOnInit) {
      this.centerContent();
      return;
    }
    
    // 如果有初始位置配置
    if (!this.initialPosition) {
      return;
    }
    
    let x = 0;
    let y = 0;
    
    if (typeof this.initialPosition === 'object') {
      // 自定义位置
      x = this.initialPosition.x;
      y = this.initialPosition.y;
    } else {
      // 预设位置
      const contentWidth = bbox.width * scale;
      const contentHeight = bbox.height * scale;
      const viewWidth = rect.width;
      const viewHeight = rect.height;
      
      // 计算内容中心和视图中心
      const contentCenterX = bbox.x + bbox.width / 2;
      const contentCenterY = bbox.y + bbox.height / 2;
      const viewCenterX = rect.width / 2;
      const viewCenterY = rect.height / 2;
      const padding = 30; // 边距
      
      switch (this.initialPosition) {
        case 'center':
          // 完全居中
          x = viewCenterX - contentCenterX * scale;
          y = viewCenterY - contentCenterY * scale;
          break;
        case 'top-left':
          x = padding - bbox.x * scale;
          y = padding - bbox.y * scale;
          break;
        case 'top-center':
          // 水平居中，垂直顶部
          x = viewCenterX - contentCenterX * scale;
          y = padding - bbox.y * scale;
          break;
        case 'top-right':
          x = viewWidth - contentWidth - padding - bbox.x * scale;
          y = padding - bbox.y * scale;
          break;
        case 'middle-left':
          // 水平左对齐，垂直居中
          x = padding - bbox.x * scale;
          y = viewCenterY - contentCenterY * scale;
          break;
        case 'middle-right':
          // 水平右对齐，垂直居中
          x = viewWidth - contentWidth - padding - bbox.x * scale;
          y = viewCenterY - contentCenterY * scale;
          break;
        case 'bottom-left':
          x = padding - bbox.x * scale;
          y = viewHeight - contentHeight - padding - bbox.y * scale;
          break;
        case 'bottom-center':
          // 水平居中，垂直底部
          x = viewCenterX - contentCenterX * scale;
          y = viewHeight - contentHeight - padding - bbox.y * scale;
          break;
        case 'bottom-right':
          x = viewWidth - contentWidth - padding - bbox.x * scale;
          y = viewHeight - contentHeight - padding - bbox.y * scale;
          break;
        default:
          // 默认完全居中
          x = viewCenterX - contentCenterX * scale;
          y = viewCenterY - contentCenterY * scale;
      }
    }
    
    this.transform.x = x;
    this.transform.y = y;
    this.applyTransform();
  }
  
  /**
   * 居中内容
   */
  public centerContent(): void {
    const bbox = this.nodesGroup.getBBox();
    const rect = this.container.getBoundingClientRect();
    
    if (bbox.width === 0 || bbox.height === 0) {
      return;
    }
    
    const scale = this.transform.scale;
    
    // 计算内容中心点
    const contentCenterX = bbox.x + bbox.width / 2;
    const contentCenterY = bbox.y + bbox.height / 2;
    
    // 计算视图中心点
    const viewCenterX = rect.width / 2;
    const viewCenterY = rect.height / 2;
    
    // 计算平移量，使内容中心与视图中心对齐
    this.transform.x = viewCenterX - contentCenterX * scale;
    this.transform.y = viewCenterY - contentCenterY * scale;
    
    this.applyTransform();
  }

  /**
   * 重新渲染所有边（节点移动后调用）
   */
  public updateEdges(edges: FlowEdge[], onClick?: (edge: FlowEdge) => void): void {
    this.edgesGroup.innerHTML = '';
    edges.forEach(edge => {
      this.renderEdge(edge, onClick);
    });
  }
}
