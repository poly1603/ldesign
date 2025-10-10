import { RectNode, RectNodeModel, h } from '@logicflow/core';
import { ApprovalNodeType } from '../types';

/**
 * 并行节点模型
 */
class ParallelNodeModel extends RectNodeModel {
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
      fill: '#722ed1',
      stroke: '#531dab',
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
 * 并行节点视图
 */
class ParallelNodeView extends RectNode {
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
      // 添加并行符号
      h('line', {
        x1: x - 15,
        y1: y - height / 2 + 10,
        x2: x - 15,
        y2: y - height / 2 + 25,
        stroke: '#ffffff',
        strokeWidth: 2,
      }),
      h('line', {
        x1: x - 5,
        y1: y - height / 2 + 10,
        x2: x - 5,
        y2: y - height / 2 + 25,
        stroke: '#ffffff',
        strokeWidth: 2,
      }),
    ]);
  }
}

export default {
  type: ApprovalNodeType.PARALLEL,
  view: ParallelNodeView,
  model: ParallelNodeModel,
};
