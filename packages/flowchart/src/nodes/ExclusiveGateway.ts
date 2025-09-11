/**
 * 排他网关
 * 
 * 审批流程中的排他网关，用于条件分支
 */

import { DiamondNode, DiamondNodeModel, h } from '@logicflow/core'

/**
 * 排他网关模型
 */
export class ExclusiveGatewayModel extends DiamondNodeModel {
  /**
   * 设置节点属性
   */
  setAttributes(): void {
    // 设置节点尺寸
    this.rx = 40
    this.ry = 40

    // 设置默认文本
    if (!this.text?.value) {
      this.text = {
        value: '排他网关',
        x: this.x,
        y: this.y + 50
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
      fill: 'var(--ldesign-warning-color-2, #feecb9)',
      stroke: 'var(--ldesign-warning-color-7, #c2960f)',
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
 * 排他网关视图
 */
export class ExclusiveGateway extends DiamondNode {
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
      // 排他符号（X）
      h('path', {
        d: `M${x - 10},${y - 10} L${x + 10},${y + 10} M${x + 10},${y - 10} L${x - 10},${y + 10}`,
        stroke: 'var(--ldesign-warning-color-7, #c2960f)',
        strokeWidth: 3,
        fill: 'none'
      })
    ])
  }
}
