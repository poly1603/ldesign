import { EdgeData, EdgeStyle } from '../types';
import { FlowNode } from './Node';

/**
 * 流程图边类
 */
export class FlowEdge {
  public id: string;
  public source: FlowNode;
  public target: FlowNode;
  public label?: string;
  public condition?: string;
  public style?: EdgeStyle;

  constructor(data: EdgeData, source: FlowNode, target: FlowNode) {
    this.id = data.id;
    this.source = source;
    this.target = target;
    this.label = data.label;
    this.condition = data.condition;
    this.style = data.style;
  }

  /**
   * 更新标签
   */
  public updateLabel(label: string): void {
    this.label = label;
  }

  /**
   * 更新条件
   */
  public updateCondition(condition: string): void {
    this.condition = condition;
  }

  /**
   * 更新样式
   */
  public updateStyle(style: EdgeStyle): void {
    this.style = { ...this.style, ...style };
  }

  /**
   * 导出边数据
   */
  public toJSON(): EdgeData {
    return {
      id: this.id,
      source: this.source.id,
      target: this.target.id,
      label: this.label,
      condition: this.condition,
      style: this.style
    };
  }
}












