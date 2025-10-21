/**
 * 边模型类
 */

import { BaseModel } from './BaseModel';
import { EdgeConfig, Position, EdgeStyle } from '../../types/model';

export class EdgeModel extends BaseModel {
  /** 源节点ID */
  public source: string;

  /** 目标节点ID */
  public target: string;

  /** 边标签 */
  public label: string;

  /** 边样式 */
  private style: EdgeStyle;

  /** 路径点 */
  private waypoints: Position[];

  constructor(config: EdgeConfig) {
    super(config);

    this.source = config.source;
    this.target = config.target;
    this.label = config.label || '';
    this.style = config.style || {};
    this.waypoints = config.waypoints || [];
  }

  /**
   * 获取样式
   */
  getStyle(): EdgeStyle {
    return { ...this.style };
  }

  /**
   * 设置样式
   */
  setStyle(style: EdgeStyle): void {
    const oldStyle = this.getStyle();
    this.style = { ...this.style, ...style };
    this.emit('change:style', { style: this.style, oldStyle });
  }

  /**
   * 获取路径点
   */
  getWaypoints(): Position[] {
    return [...this.waypoints];
  }

  /**
   * 设置路径点
   */
  setWaypoints(waypoints: Position[]): void {
    const oldWaypoints = this.getWaypoints();
    this.waypoints = [...waypoints];
    this.emit('change:waypoints', { waypoints: this.waypoints, oldWaypoints });
  }

  /**
   * 添加路径点
   */
  addWaypoint(point: Position, index?: number): void {
    if (index === undefined || index >= this.waypoints.length) {
      this.waypoints.push(point);
    } else {
      this.waypoints.splice(index, 0, point);
    }
    this.emit('change:waypoints', { waypoints: this.waypoints });
  }

  /**
   * 移除路径点
   */
  removeWaypoint(index: number): void {
    if (index >= 0 && index < this.waypoints.length) {
      this.waypoints.splice(index, 1);
      this.emit('change:waypoints', { waypoints: this.waypoints });
    }
  }

  /**
   * 更新路径点
   */
  updateWaypoint(index: number, point: Position): void {
    if (index >= 0 && index < this.waypoints.length) {
      this.waypoints[index] = point;
      this.emit('change:waypoints', { waypoints: this.waypoints });
    }
  }

  /**
   * 克隆边
   */
  clone(): EdgeModel {
    return new EdgeModel({
      id: this.id + '-copy',
      source: this.source,
      target: this.target,
      label: this.label,
      style: { ...this.style },
      waypoints: [...this.waypoints],
      data: { ...this.data },
    });
  }

  /**
   * 序列化为JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      source: this.source,
      target: this.target,
      label: this.label,
      style: this.style,
      waypoints: this.waypoints,
      data: this.data,
    };
  }
}


