import { RectNode, RectNodeModel, h } from '@logicflow/core';
import { ApprovalNodeType } from '../types';

/**
 * 审批节点模型
 */
class ApprovalNodeModel extends RectNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data);
    this.width = 120;
    this.height = 60;
    this.radius = 6;
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    return {
      ...style,
      fill: '#1890ff',
      stroke: '#0050b3',
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
 * 审批节点视图
 */
class ApprovalNodeView extends RectNode {
  getShape() {
    const { x, y, width, height, radius } = this.props.model;
    const style = this.props.model.getNodeStyle();

    return h('g', {}, [
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        rx: radius,
        ry: radius,
        ...style,
      }),
      // 添加一个小图标表示这是审批节点
      h('circle', {
        cx: x - width / 2 + 15,
        cy: y - height / 2 + 15,
        r: 8,
        fill: '#ffffff',
        opacity: 0.8,
      }),
    ]);
  }
}

export default {
  type: ApprovalNodeType.APPROVAL,
  view: ApprovalNodeView,
  model: ApprovalNodeModel,
};
