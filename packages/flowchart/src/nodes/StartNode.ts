/**
 * 开始节点
 * 
 * 审批流程的开始节点，通常表示流程的起始点
 */

import { CircleNode, CircleNodeModel, h } from '@logicflow/core'

/**
 * 开始节点模型
 */
export class StartNodeModel extends CircleNodeModel {
  /**
   * 设置节点属性
   */
  override setAttributes(): void {
    // 设置节点尺寸
    this.r = 30

    // 设置默认文本
    if (!this.text?.value) {
      this.text = {
        value: '开始',
        x: this.x,
        y: this.y,
        draggable: false,
        editable: true
      }
    }
  }

  /**
   * 获取节点样式
   */
  override getNodeStyle() {
    const style = super.getNodeStyle()
    return {
      ...style,
      fill: 'var(--ldesign-success-color-1, #ebfaeb)',
      stroke: 'var(--ldesign-success-color, #52c41a)',
      strokeWidth: 2,
      cursor: 'pointer'
    }
  }

  /**
   * 获取文本样式
   */
  override getTextStyle() {
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
  override getDefaultAnchor() {
    const { x, y, r } = this
    return [
      // 右侧锚点（只允许输出）
      {
        x: x + r,
        y,
        id: `${this.id}_right`,
        edgeAddable: true,
        type: 'right'
      }
    ]
  }

  /**
   * 连接规则：开始节点只能作为源节点
   */
  override isAllowConnectedAsTarget(): boolean {
    return false
  }

  /**
   * 连接规则：开始节点可以作为源节点
   */
  override isAllowConnectedAsSource(): boolean {
    return true
  }
}

/**
 * 开始节点视图
 */
export class StartNode extends CircleNode {
  /**
   * 获取节点形状
   */
  override getShape(): h.JSX.Element {
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
      // 内部图标
      h('path', {
        d: 'M-8,-4 L-8,4 L8,0 Z',
        transform: `translate(${x}, ${y})`,
        fill: 'var(--ldesign-success-color, #52c41a)',
        stroke: 'none'
      })
    ])
  }
}
