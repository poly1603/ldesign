/**
 * 视口管理器 - 处理缩放和平移
 */

import { ViewportConfig, ViewportState } from '../../types/view';
import { Position } from '../../types/model';
import { EventBus } from '../../utils/EventBus';

export class Viewport {
  private state: ViewportState;
  private config: Required<ViewportConfig>;
  private eventBus: EventBus;
  private svg: SVGSVGElement;
  private contentGroup: SVGGElement;

  // 交互状态
  private isPanning = false;
  private panStart: Position = { x: 0, y: 0 };
  private stateStart: ViewportState = { x: 0, y: 0, zoom: 1 };

  constructor(svg: SVGSVGElement, contentGroup: SVGGElement, config: ViewportConfig = {}) {
    this.svg = svg;
    this.contentGroup = contentGroup;
    this.eventBus = new EventBus();

    this.config = {
      zoom: config.zoom || 1,
      minZoom: config.minZoom || 0.1,
      maxZoom: config.maxZoom || 3,
      zoomStep: config.zoomStep || 0.1,
      position: config.position || { x: 0, y: 0 },
      enableZoom: config.enableZoom !== false,
      enablePan: config.enablePan !== false,
    };

    this.state = {
      x: this.config.position.x,
      y: this.config.position.y,
      zoom: this.config.zoom,
    };

    this.applyTransform();
    this.bindEvents();
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (this.config.enableZoom) {
      this.svg.addEventListener('wheel', this.handleWheel);
    }

    if (this.config.enablePan) {
      this.svg.addEventListener('mousedown', this.handleMouseDown);
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    }
  }

  /**
   * 解绑事件
   */
  private unbindEvents(): void {
    this.svg.removeEventListener('wheel', this.handleWheel);
    this.svg.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  /**
   * 处理滚轮事件
   */
  private handleWheel = (e: WheelEvent): void => {
    if (!this.config.enableZoom) return;

    e.preventDefault();

    const delta = e.deltaY > 0 ? -1 : 1;
    const zoomFactor = 1 + this.config.zoomStep * delta;

    // 获取鼠标在SVG中的位置
    const point = this.svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgPoint = point.matrixTransform(this.svg.getScreenCTM()!.inverse());

    this.zoomAt(zoomFactor, svgPoint.x, svgPoint.y);
  };

  /**
   * 处理鼠标按下
   */
  private handleMouseDown = (e: MouseEvent): void => {
    if (!this.config.enablePan) return;
    if (e.button !== 0) return; // 只响应左键

    // 检查是否点击在节点上
    const target = e.target as Element;
    if (target.closest('.fc-node') || target.closest('.fc-edge')) {
      return;
    }

    this.isPanning = true;
    this.panStart = { x: e.clientX, y: e.clientY };
    this.stateStart = { ...this.state };
    this.svg.style.cursor = 'grabbing';
  };

  /**
   * 处理鼠标移动
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isPanning) return;

    const dx = e.clientX - this.panStart.x;
    const dy = e.clientY - this.panStart.y;

    this.state.x = this.stateStart.x + dx;
    this.state.y = this.stateStart.y + dy;

    this.applyTransform();
    this.eventBus.emit('change', this.state);
  };

  /**
   * 处理鼠标抬起
   */
  private handleMouseUp = (): void => {
    if (!this.isPanning) return;

    this.isPanning = false;
    this.svg.style.cursor = 'grab';
  };

  /**
   * 应用变换
   */
  private applyTransform(): void {
    const { x, y, zoom } = this.state;
    this.contentGroup.setAttribute(
      'transform',
      `translate(${x}, ${y}) scale(${zoom})`
    );
  }

  /**
   * 在指定点缩放
   */
  private zoomAt(factor: number, x: number, y: number): void {
    const newZoom = Math.max(
      this.config.minZoom,
      Math.min(this.config.maxZoom, this.state.zoom * factor)
    );

    if (newZoom === this.state.zoom) return;

    // 计算缩放后的偏移
    const scale = newZoom / this.state.zoom;
    this.state.x = x - (x - this.state.x) * scale;
    this.state.y = y - (y - this.state.y) * scale;
    this.state.zoom = newZoom;

    this.applyTransform();
    this.eventBus.emit('change', this.state);
  }

  /**
   * 放大
   */
  zoomIn(): void {
    const rect = this.svg.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    this.zoomAt(1 + this.config.zoomStep, centerX, centerY);
  }

  /**
   * 缩小
   */
  zoomOut(): void {
    const rect = this.svg.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    this.zoomAt(1 - this.config.zoomStep, centerX, centerY);
  }

  /**
   * 设置缩放
   */
  setZoom(zoom: number): void {
    const newZoom = Math.max(
      this.config.minZoom,
      Math.min(this.config.maxZoom, zoom)
    );

    if (newZoom === this.state.zoom) return;

    this.state.zoom = newZoom;
    this.applyTransform();
    this.eventBus.emit('change', this.state);
  }

  /**
   * 获取缩放
   */
  getZoom(): number {
    return this.state.zoom;
  }

  /**
   * 设置位置
   */
  setPosition(position: Position): void {
    this.state.x = position.x;
    this.state.y = position.y;
    this.applyTransform();
    this.eventBus.emit('change', this.state);
  }

  /**
   * 获取位置
   */
  getPosition(): Position {
    return { x: this.state.x, y: this.state.y };
  }

  /**
   * 平移
   */
  pan(dx: number, dy: number): void {
    this.state.x += dx;
    this.state.y += dy;
    this.applyTransform();
    this.eventBus.emit('change', this.state);
  }

  /**
   * 居中内容
   */
  centerContent(bbox: { x: number; y: number; width: number; height: number }): void {
    const svgRect = this.svg.getBoundingClientRect();

    const x = (svgRect.width - bbox.width * this.state.zoom) / 2 - bbox.x * this.state.zoom;
    const y = (svgRect.height - bbox.height * this.state.zoom) / 2 - bbox.y * this.state.zoom;

    this.setPosition({ x, y });
  }

  /**
   * 适应内容
   */
  fitContent(bbox: { x: number; y: number; width: number; height: number }, padding = 50): void {
    const svgRect = this.svg.getBoundingClientRect();

    const scaleX = (svgRect.width - padding * 2) / bbox.width;
    const scaleY = (svgRect.height - padding * 2) / bbox.height;
    const zoom = Math.min(scaleX, scaleY, this.config.maxZoom);

    this.setZoom(zoom);

    const x = (svgRect.width - bbox.width * zoom) / 2 - bbox.x * zoom;
    const y = (svgRect.height - bbox.height * zoom) / 2 - bbox.y * zoom;

    this.setPosition({ x, y });
  }

  /**
   * 重置视口
   */
  reset(): void {
    this.state = {
      x: this.config.position.x,
      y: this.config.position.y,
      zoom: this.config.zoom,
    };
    this.applyTransform();
    this.eventBus.emit('change', this.state);
  }

  /**
   * 获取状态
   */
  getState(): ViewportState {
    return { ...this.state };
  }

  /**
   * 监听变化
   */
  onChange(handler: (state: ViewportState) => void): void {
    this.eventBus.on('change', handler);
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.unbindEvents();
    this.eventBus.clear();
  }
}


