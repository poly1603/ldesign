/**
 * 结束节点
 * 
 * 审批流程的结束节点，表示流程的终点
 */

import { CircleNode, CircleNodeModel, h } from '@logicflow/core'

/**
 * 结束节点模型
 */
export class EndNodeModel extends CircleNodeModel {
  /**
   * 设置节点属性
   */
  setAttributes(): void {
    // 设置节点尺寸
    this.r = 30

    // 设置默认文本
    if (!this.text?.value) {
      this.text = {
        value: '结束',
        x: this.x,
        y: this.y
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
      fill: 'var(--ldesign-error-color-1, #fde8e8)',
      stroke: 'var(--ldesign-error-color, #e54848)',
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
      fontWeight: 'bold'
    }
  }

  /**
   * 获取锚点
   */
  getDefaultAnchor() {
    const { x, y, r } = this
    return [
      // 左侧锚点（只允许输入）
      {
        x: x - r,
        y,
        id: `${this.id}_left`,
        edgeAddable: true,
        type: 'left'
      }
    ]
  }

  /**
   * 连接规则：结束节点可以作为目标节点
   */
  isAllowConnectedAsTarget(): boolean {
    return true
  }

  /**
   * 连接规则：结束节点不能作为源节点
   */
  isAllowConnectedAsSource(): boolean {
    return false
  }
}

/**
 * 结束节点视图
 */
export class EndNode extends CircleNode {
  /**
   * 获取节点形状
   */
  getShape(): h.JSX.Element {
    const { model } = this.props
    const { x, y, r } = model
    const style = model.getNodeStyle()

    return h('g', {}, [
      // 主圆形
      h('circle', {
        cx: x,
        cy: y,
        r,
        ...style
      }),
      // 内部停止图标
      h('rect', {
        x: x - 8,
        y: y - 8,
        width: 16,
        height: 16,
        rx: 2,
        ry: 2,
        fill: 'var(--ldesign-error-color, #e54848)',
        stroke: 'none'
      })
    ])
  }
}
