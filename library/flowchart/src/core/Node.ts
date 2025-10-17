import { NodeData, NodeType, NodeStatus, Position, NodeStyle } from '../types';

/**
 * 流程图节点类
 */
export class FlowNode {
  public id: string;
  public type: NodeType;
  public label: string;
  public position: Position;
  public status: NodeStatus;
  public data: Record<string, any>;
  public style?: NodeStyle;
  public manualPosition?: boolean;
  
  private inputs: FlowNode[] = [];
  private outputs: FlowNode[] = [];

  constructor(data: NodeData) {
    this.id = data.id;
    this.type = data.type;
    this.label = data.label;
    this.position = { ...data.position };
    this.status = data.status || NodeStatus.PENDING;
    this.data = data.data || {};
    this.style = data.style;
    this.manualPosition = data.manualPosition;
  }

  /**
   * 添加输入节点
   */
  public addInput(node: FlowNode): void {
    if (!this.inputs.includes(node)) {
      this.inputs.push(node);
    }
  }

  /**
   * 添加输出节点
   */
  public addOutput(node: FlowNode): void {
    if (!this.outputs.includes(node)) {
      this.outputs.push(node);
    }
  }

  /**
   * 移除输入节点
   */
  public removeInput(node: FlowNode): void {
    const index = this.inputs.indexOf(node);
    if (index > -1) {
      this.inputs.splice(index, 1);
    }
  }

  /**
   * 移除输出节点
   */
  public removeOutput(node: FlowNode): void {
    const index = this.outputs.indexOf(node);
    if (index > -1) {
      this.outputs.splice(index, 1);
    }
  }

  /**
   * 获取所有输入节点
   */
  public getInputs(): FlowNode[] {
    return [...this.inputs];
  }

  /**
   * 获取所有输出节点
   */
  public getOutputs(): FlowNode[] {
    return [...this.outputs];
  }

  /**
   * 更新节点位置
   */
  public updatePosition(position: Position): void {
    this.position = { ...position };
  }

  /**
   * 更新节点状态
   */
  public updateStatus(status: NodeStatus): void {
    this.status = status;
  }

  /**
   * 更新节点数据
   */
  public updateData(data: Record<string, any>): void {
    this.data = { ...this.data, ...data };
  }

  /**
   * 克隆节点
   */
  public clone(): FlowNode {
    return new FlowNode({
      id: this.id,
      type: this.type,
      label: this.label,
      position: { ...this.position },
      status: this.status,
      data: { ...this.data },
      style: this.style ? { ...this.style } : undefined
    });
  }

  /**
   * 导出节点数据
   */
  public toJSON(): NodeData {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      position: { ...this.position },
      status: this.status,
      data: { ...this.data },
      style: this.style
    };
  }
}




