/**
 * 基础节点类
 * 提供所有节点类型的基础功能和通用接口实现
 */

import type {
  BaseNode as IBaseNode,
  NodeData,
  Point,
  Size,
  Rectangle,
  Style,
  Viewport,
  Port,
  NodeType
} from '@/types/index.js';
import { EventType, PortPosition, NodeStatus } from '@/types/index.js';
import { SimpleEventEmitter, applyStyle, drawCenteredText, measureText } from '@/utils/index.js';

/**
 * 默认节点样式
 */
const DEFAULT_STYLE: Style = {
  fillColor: '#ffffff',
  strokeColor: '#cccccc',
  strokeWidth: 2,
  fontSize: 14,
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
    offsetY: 2,
    blur: 8,
    color: 'var(--ldesign-brand-color-focus)'
  }
};

/**
 * 基础节点抽象类
 */
export abstract class BaseNode extends SimpleEventEmitter implements IBaseNode {
  public id: string;
  public type: NodeType;
  public position: Point;
  public size: Size;
  public label: string;
  public style: Style;
  public ports: Port[] = [];
  public status: NodeStatus;
  public visible = true;
  public locked = false;
  public selected = false;
  public draggable = true;
  public properties: Record<string, any> = {};

  private isDragging = false;
  private dragStartPosition: Point | null = null;
  private dragOffset: Point = { x: 0, y: 0 };

  constructor(data: NodeData) {
    super();

    this.id = data.id;
    this.type = data.type as NodeType;
    this.position = { ...data.position };
    this.size = data.size ? { ...data.size } : { width: 100, height: 60 };
    this.label = data.label;
    this.style = { ...DEFAULT_STYLE, ...data.style };
    this.status = NodeStatus.PENDING;
    this.properties = { ...data.properties };

    // 初始化默认端口
    this.initializePorts();
  }

  /**
   * 初始化端口（子类可重写）
   */
  protected initializePorts(): void {
    this.ports = [
      {
        id: 'input',
        position: PortPosition.LEFT,
        offset: 0.5,
        connectable: true,
        maxConnections: -1,
        currentConnections: 0
      },
      {
        id: 'output',
        position: PortPosition.RIGHT,
        offset: 0.5,
        connectable: true,
        maxConnections: -1,
        currentConnections: 0
      }
    ];
  }

  /**
   * 渲染节点
   */
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    if (!this.visible) {
      return;
    }

    ctx.save();

    // 应用基础样式
    const renderStyle = this.selected
      ? { ...this.style, ...SELECTED_STYLE }
      : this.style;

    applyStyle(ctx, renderStyle);

    // 渲染节点形状（由子类实现）
    this.renderShape(ctx, viewport);

    // 渲染标签
    this.renderLabel(ctx, viewport);

    // 渲染端口
    if (this.selected) {
      this.renderPorts(ctx, viewport);
    }

    // 渲染状态指示器
    this.renderStatusIndicator(ctx, viewport);

    ctx.restore();
  }

  /**
   * 渲染节点形状（抽象方法，由子类实现）
   */
  protected abstract renderShape(ctx: CanvasRenderingContext2D, viewport: Viewport): void;

  /**
   * 渲染标签
   */
  protected renderLabel(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    if (!this.label) {
      return;
    }

    const center = {
      x: this.position.x + this.size.width / 2,
      y: this.position.y + this.size.height / 2
    };

    // 设置文本样式
    applyStyle(ctx, {
      fontSize: this.style.fontSize,
      fontColor: this.style.fontColor,
      fontFamily: this.style.fontFamily
    });

    drawCenteredText(ctx, this.label, center);
  }

  /**
   * 渲染端口
   */
  protected renderPorts(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    for (const port of this.ports) {
      if (!port.connectable) {
        continue;
      }

      const portPosition = this.getPortPosition(port.id);
      if (!portPosition) {
        continue;
      }

      ctx.save();

      // 端口样式
      ctx.fillStyle = port.style?.fillColor || 'var(--ldesign-brand-color)';
      ctx.strokeStyle = port.style?.strokeColor || '#ffffff';
      ctx.lineWidth = 2;

      // 绘制端口圆形
      ctx.beginPath();
      ctx.arc(portPosition.x, portPosition.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  /**
   * 渲染状态指示器
   */
  protected renderStatusIndicator(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    if (this.status === NodeStatus.PENDING) {
      return;
    }

    const indicatorSize = 12;
    const indicatorPosition = {
      x: this.position.x + this.size.width - indicatorSize / 2,
      y: this.position.y - indicatorSize / 2
    };

    ctx.save();

    // 根据状态设置颜色
    let color = '#cccccc';
    switch (this.status) {
      case NodeStatus.RUNNING:
        color = 'var(--ldesign-warning-color)';
        break;
      case NodeStatus.COMPLETED:
        color = 'var(--ldesign-success-color)';
        break;
      case NodeStatus.FAILED:
        color = 'var(--ldesign-error-color)';
        break;
      case NodeStatus.WAITING:
        color = 'var(--ldesign-brand-color)';
        break;
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(indicatorPosition.x, indicatorPosition.y, indicatorSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 获取边界框
   */
  getBounds(): Rectangle {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.size.width,
      height: this.size.height
    };
  }

  /**
   * 点击测试
   */
  hitTest(point: Point): boolean {
    const bounds = this.getBounds();
    return point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height;
  }

  /**
   * 选中节点
   */
  select(): void {
    if (!this.selected) {
      this.selected = true;
      this.emit(EventType.NODE_SELECT, this);
    }
  }

  /**
   * 取消选中
   */
  deselect(): void {
    if (this.selected) {
      this.selected = false;
      this.emit(EventType.NODE_DESELECT, this);
    }
  }

  /**
   * 开始拖拽
   */
  startDrag(point: Point): void {
    if (!this.draggable || this.locked) {
      return;
    }

    this.isDragging = true;
    this.dragStartPosition = { ...this.position };
    this.dragOffset = {
      x: point.x - this.position.x,
      y: point.y - this.position.y
    };

    this.emit(EventType.NODE_DRAG_START, { node: this, point });
  }

  /**
   * 拖拽中
   */
  drag(point: Point): void {
    if (!this.isDragging) {
      return;
    }

    const newPosition = {
      x: point.x - this.dragOffset.x,
      y: point.y - this.dragOffset.y
    };

    this.position = newPosition;
    this.emit(EventType.NODE_DRAG, { node: this, point, position: newPosition });
  }

  /**
   * 结束拖拽
   */
  endDrag(point: Point): void {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;
    this.emit(EventType.NODE_DRAG_END, {
      node: this,
      point,
      startPosition: this.dragStartPosition,
      endPosition: this.position
    });

    this.dragStartPosition = null;
  }

  /**
   * 更新节点数据
   */
  updateData(data: Partial<NodeData>): void {
    const oldData = this.getData();

    if (data.position) {
      this.position = { ...data.position };
    }

    if (data.size) {
      this.size = { ...data.size };
    }

    if (data.label !== undefined) {
      this.label = data.label;
    }

    if (data.style) {
      this.style = { ...this.style, ...data.style };
    }

    if (data.properties) {
      this.properties = { ...this.properties, ...data.properties };
    }

    this.emit(EventType.NODE_UPDATE, { node: this, oldData, newData: this.getData() });
  }

  /**
   * 获取节点数据
   */
  getData(): NodeData {
    return {
      id: this.id,
      type: this.type,
      position: { ...this.position },
      size: { ...this.size },
      label: this.label,
      style: { ...this.style },
      properties: { ...this.properties }
    };
  }

  /**
   * 添加端口
   */
  addPort(port: Port): void {
    if (this.getPort(port.id)) {
      throw new Error(`端口 ${port.id} 已存在`);
    }

    this.ports.push({ ...port });
  }

  /**
   * 移除端口
   */
  removePort(portId: string): void {
    const index = this.ports.findIndex(port => port.id === portId);
    if (index > -1) {
      this.ports.splice(index, 1);
    }
  }

  /**
   * 获取端口
   */
  getPort(portId: string): Port | undefined {
    return this.ports.find(port => port.id === portId);
  }

  /**
   * 获取端口在画布上的绝对位置
   */
  getPortPosition(portId: string): Point | undefined {
    const port = this.getPort(portId);
    if (!port) {
      return undefined;
    }

    const offset = port.offset || 0.5;

    switch (port.position) {
      case PortPosition.TOP:
        return {
          x: this.position.x + this.size.width * offset,
          y: this.position.y
        };
      case PortPosition.RIGHT:
        return {
          x: this.position.x + this.size.width,
          y: this.position.y + this.size.height * offset
        };
      case PortPosition.BOTTOM:
        return {
          x: this.position.x + this.size.width * offset,
          y: this.position.y + this.size.height
        };
      case PortPosition.LEFT:
        return {
          x: this.position.x,
          y: this.position.y + this.size.height * offset
        };
      default:
        return undefined;
    }
  }

  /**
   * 克隆节点
   */
  abstract clone(): BaseNode;

  /**
   * 销毁节点
   */
  destroy(): void {
    this.removeAllListeners();
    this.ports = [];
    this.properties = {};
  }
}
