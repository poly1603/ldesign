/**
 * 节点模型类
 */

import { BaseModel } from './BaseModel';
import { NodeConfig, Position, Size, NodeStyle, NodeType, NodeStatus } from '../../types/model';

export class NodeModel extends BaseModel {
  /** 节点类型 */
  public type: NodeType | string;

  /** 节点位置 */
  private position: Position;

  /** 节点尺寸 */
  private size: Size;

  /** 节点标签 */
  public label: string;

  /** 节点状态 */
  public status?: NodeStatus;

  /** 节点样式 */
  private style: NodeStyle;

  /** 输入边ID列表 */
  private incomingEdges: Set<string> = new Set();

  /** 输出边ID列表 */
  private outgoingEdges: Set<string> = new Set();

  constructor(config: NodeConfig) {
    super(config);

    this.type = config.type || NodeType.PROCESS;
    this.label = config.label || '';
    this.status = config.status;
    this.style = config.style || {};

    this.position = {
      x: config.x || 0,
      y: config.y || 0,
    };

    this.size = {
      width: config.width || 120,
      height: config.height || 60,
    };
  }

  /**
   * 获取位置
   */
  getPosition(): Position {
    return { ...this.position };
  }

  /**
   * 设置位置
   */
  setPosition(position: Position): void {
    const oldPosition = this.getPosition();
    this.position = { ...position };
    this.emit('change:position', { position: this.position, oldPosition });
  }

  /**
   * 移动节点
   */
  move(dx: number, dy: number): void {
    this.setPosition({
      x: this.position.x + dx,
      y: this.position.y + dy,
    });
  }

  /**
   * 获取尺寸
   */
  getSize(): Size {
    return { ...this.size };
  }

  /**
   * 设置尺寸
   */
  setSize(size: Size): void {
    const oldSize = this.getSize();
    this.size = { ...size };
    this.emit('change:size', { size: this.size, oldSize });
  }

  /**
   * 获取样式
   */
  getStyle(): NodeStyle {
    return { ...this.style };
  }

  /**
   * 设置样式
   */
  setStyle(style: NodeStyle): void {
    const oldStyle = this.getStyle();
    this.style = { ...this.style, ...style };
    this.emit('change:style', { style: this.style, oldStyle });
  }

  /**
   * 获取中心点
   */
  getCenter(): Position {
    return {
      x: this.position.x + this.size.width / 2,
      y: this.position.y + this.size.height / 2,
    };
  }

  /**
   * 获取边界框
   */
  getBBox() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.size.width,
      height: this.size.height,
      centerX: this.position.x + this.size.width / 2,
      centerY: this.position.y + this.size.height / 2,
    };
  }

  /**
   * 添加输入边
   */
  addIncomingEdge(edgeId: string): void {
    this.incomingEdges.add(edgeId);
  }

  /**
   * 移除输入边
   */
  removeIncomingEdge(edgeId: string): void {
    this.incomingEdges.delete(edgeId);
  }

  /**
   * 获取输入边列表
   */
  getIncomingEdges(): string[] {
    return Array.from(this.incomingEdges);
  }

  /**
   * 添加输出边
   */
  addOutgoingEdge(edgeId: string): void {
    this.outgoingEdges.add(edgeId);
  }

  /**
   * 移除输出边
   */
  removeOutgoingEdge(edgeId: string): void {
    this.outgoingEdges.delete(edgeId);
  }

  /**
   * 获取输出边列表
   */
  getOutgoingEdges(): string[] {
    return Array.from(this.outgoingEdges);
  }

  /**
   * 克隆节点
   */
  clone(): NodeModel {
    return new NodeModel({
      id: this.id + '-copy',
      type: this.type,
      x: this.position.x,
      y: this.position.y,
      width: this.size.width,
      height: this.size.height,
      label: this.label,
      status: this.status,
      style: { ...this.style },
      data: { ...this.data },
    });
  }

  /**
   * 序列化为JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      type: this.type,
      x: this.position.x,
      y: this.position.y,
      width: this.size.width,
      height: this.size.height,
      label: this.label,
      status: this.status,
      style: this.style,
      data: this.data,
    };
  }

  /**
   * 销毁节点
   */
  destroy(): void {
    this.incomingEdges.clear();
    this.outgoingEdges.clear();
    super.destroy();
  }
}


