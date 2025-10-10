import { DiamondNode, PolygonNodeModel } from '@logicflow/core';
import { ApprovalNodeType } from '../types';

/**
 * 条件节点模型
 */
class ConditionNodeModel extends PolygonNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data);
    // 设置菱形的点
    const width = 80;
    const height = 80;
    this.points = [
      [0, -height / 2],
      [width / 2, 0],
      [0, height / 2],
      [-width / 2, 0],
    ];
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    return {
      ...style,
      fill: '#faad14',
      stroke: '#d48806',
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
 * 条件节点视图
 */
class ConditionNodeView extends DiamondNode {}

export default {
  type: ApprovalNodeType.CONDITION,
  view: ConditionNodeView,
  model: ConditionNodeModel,
};
