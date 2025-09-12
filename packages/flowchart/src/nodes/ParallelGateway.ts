/**
 * 并行网关
 * 
 * 审批流程中的并行网关，用于并行分支和汇聚
 */

import { DiamondNode, DiamondNodeModel, h } from '@logicflow/core'

/**
 * 并行网关模型
 */
export class ParallelGatewayModel extends DiamondNodeModel {
  /**
   * 设置节点属性
   */
  setAttributes(): void {
    // 设置节点尺寸
    this.rx = 40
    this.ry = 40

    // 设置默认文本 - 文本在图标下方，整体居中
    if (!this.text?.value) {
      this.text = {
        value: '并行网关',
        x: this.x,
        y: this.y + 12
      }
    }
  }

  /**
   * 获取节点样式
   */
  getNodeStyle() {
    const style = super.getNodeStyle()
    return {
      ...style,
      fill: 'var(--ldesign-brand-color-2, #d8c8ee)',
      stroke: 'var(--ldesign-brand-color-7, #5e2aa7)',
      strokeWidth: 2,
      cursor: 'pointer'
    }
  }

  /**
   * 获取文本样式
   */
  getTextStyle() {
    const style = super.getTextStyle()
    return {
      ...style,
      fontSize: 12,
      fill: 'var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9))',
      fontWeight: 'normal'
    }
  }

  /**
   * 获取锚点
   */
  getDefaultAnchor() {
    const { x, y, rx, ry } = this
    return [
      // 左侧锚点
      {
        x: x - rx,
        y,
        id: `${this.id}_left`,
        edgeAddable: true,
        type: 'left'
      },
      // 右侧锚点
      {
        x: x + rx,
        y,
        id: `${this.id}_right`,
        edgeAddable: true,
        type: 'right'
      },
      // 上方锚点
      {
        x,
        y: y - ry,
        id: `${this.id}_top`,
        edgeAddable: true,
        type: 'top'
      },
      // 下方锚点
      {
        x,
        y: y + ry,
        id: `${this.id}_bottom`,
        edgeAddable: true,
        type: 'bottom'
      }
    ]
  }
}

/**
 * 并行网关视图
 */
export class ParallelGateway extends DiamondNode {
  /**
   * 获取节点形状
   */
  getShape(): h.JSX.Element {
    const { model } = this.props
    const { x, y, rx, ry } = model
    const style = model.getNodeStyle()

    return h('g', {}, [
      // 主菱形
      h('ellipse', {
        cx: x,
        cy: y,
        rx,
        ry,
        transform: `rotate(45 ${x} ${y})`,
        ...style
      }),
      // 并行符号（+） - 图标在文本上方，整体居中
      h('path', {
        d: `M${x - 12},${y - 15} L${x + 12},${y - 15} M${x},${y - 27} L${x},${y - 3}`,
        stroke: 'var(--ldesign-brand-color-7, #5e2aa7)',
        strokeWidth: 3,
        fill: 'none'
      })
    ])
  }
}
