import { CircleNode, CircleNodeModel } from '@logicflow/core';
import { ApprovalNodeType } from '../types';

/**
 * 开始节点模型
 */
class StartNodeModel extends CircleNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data);
    this.r = 30;
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    return {
      ...style,
      fill: '#52c41a',
      stroke: '#389e0d',
      strokeWidth: 2,
    };
  }

  getTextStyle() {
    const style = super.getTextStyle();
    return {
      ...style,
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 'bold',
    };
  }
}

/**
 * 开始节点视图
 */
class StartNodeView extends CircleNode {}

export default {
  type: ApprovalNodeType.START,
  view: StartNodeView,
  model: StartNodeModel,
};
