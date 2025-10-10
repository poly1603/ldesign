import { CircleNode, CircleNodeModel } from '@logicflow/core';
import { ApprovalNodeType } from '../types';

/**
 * 结束节点模型
 */
class EndNodeModel extends CircleNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data);
    this.r = 30;
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    return {
      ...style,
      fill: '#ff4d4f',
      stroke: '#cf1322',
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
 * 结束节点视图
 */
class EndNodeView extends CircleNode {}

export default {
  type: ApprovalNodeType.END,
  view: EndNodeView,
  model: EndNodeModel,
};
