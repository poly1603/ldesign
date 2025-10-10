import { RectNode, RectNodeModel, h } from '@logicflow/core';
import { ApprovalNodeType } from '../types';

/**
 * 抄送节点模型
 */
class CCNodeModel extends RectNodeModel {
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
      fill: '#13c2c2',
      stroke: '#08979c',
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
 * 抄送节点视图
 */
class CCNodeView extends RectNode {
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
      // 添加抄送图标（信封）
      h('rect', {
        x: x - width / 2 + 8,
        y: y - height / 2 + 8,
        width: 16,
        height: 12,
        rx: 2,
        stroke: '#ffffff',
        strokeWidth: 1.5,
        fill: 'none',
      }),
      h('polyline', {
        points: `${x - width / 2 + 8},${y - height / 2 + 8} ${x - width / 2 + 16},${y - height / 2 + 14} ${x - width / 2 + 24},${y - height / 2 + 8}`,
        stroke: '#ffffff',
        strokeWidth: 1.5,
        fill: 'none',
      }),
    ]);
  }
}

export default {
  type: ApprovalNodeType.CC,
  view: CCNodeView,
  model: CCNodeModel,
};
