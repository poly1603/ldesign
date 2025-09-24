/**
 * 信号事件节点
 * 
 * 表示基于信号触发的事件节点
 */

import { CircleNode, CircleNodeModel, h } from '@logicflow/core'

/**
 * 信号事件节点模型
 */
export class SignalEventNodeModel extends CircleNodeModel {
  /**
   * 设置节点属性
   */
  override setAttributes(): void {
    // 设置节点尺寸
    this.r = 25

    // 设置默认文本 - 文本在图标下方，整体居中
    if (!this.text?.value) {
      this.text = {
        value: '信号事件',
        x: this.x,
        y: this.y + 12,
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
      fill: '#e6f7ff',
      stroke: '#1890ff',
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
      fontWeight: 'normal'
    }
  }

  /**
   * 获取锚点
   */
  override getDefaultAnchor() {
    const { x, y, r } = this
    return [
      // 上方锚点
      {
        x,
        y: y - r,
        id: `${this.id}_top`,
        edgeAddable: true,
        type: 'top'
      },
      // 右侧锚点
      {
        x: x + r,
        y,
        id: `${this.id}_right`,
        edgeAddable: true,
        type: 'right'
      },
      // 下方锚点
      {
        x,
        y: y + r,
        id: `${this.id}_bottom`,
        edgeAddable: true,
        type: 'bottom'
      },
      // 左侧锚点
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
   * 连接规则：信号事件节点可以作为目标节点
   */
  override isAllowConnectedAsTarget(): boolean {
    return true
  }

  /**
   * 连接规则：信号事件节点可以作为源节点
   */
  override isAllowConnectedAsSource(): boolean {
    return true
  }
}

/**
 * 信号事件节点视图
 */
export class SignalEventNode extends CircleNode {
  /**
   * 获取节点形状
   */
  override getShape(): h.JSX.Element {
    const { model } = this.props
    const { x, y, r } = model
    const style = model.getNodeStyle()

    return h('g', {}, [
      // 外圆
      h('circle', {
        cx: x,
        cy: y,
        r: r,
        ...style
      }),
      // 信号图标
      this.getSignalIcon(x, y)
    ])
  }

  /**
   * 获取信号图标
   */
  private getSignalIcon(x: number, y: number): h.JSX.Element {
    // 图标在文本上方，整体居中
    const iconY = y - 15
    return h('polygon', {
      points: `${x},${iconY - 8} ${x + 8},${iconY + 6} ${x - 8},${iconY + 6}`,
      fill: 'none',
      stroke: '#1890ff',
      strokeWidth: 2
    })
  }
}
