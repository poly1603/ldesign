/**
 * 定时事件节点
 * 
 * 表示基于时间触发的事件节点
 */

import { CircleNode, CircleNodeModel, h } from '@logicflow/core'

/**
 * 定时事件节点模型
 */
export class TimerEventNodeModel extends CircleNodeModel {
  /**
   * 设置节点属性
   */
  override setAttributes(): void {
    // 设置节点尺寸
    this.r = 25

    // 设置默认文本
    if (!this.text?.value) {
      this.text = {
        value: '定时事件',
        x: this.x,
        y: this.y + 35,
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
      fill: '#fff7e6',
      stroke: '#fa8c16',
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
   * 连接规则：定时事件节点可以作为目标节点
   */
  override isAllowConnectedAsTarget(): boolean {
    return true
  }

  /**
   * 连接规则：定时事件节点可以作为源节点
   */
  override isAllowConnectedAsSource(): boolean {
    return true
  }
}

/**
 * 定时事件节点视图
 */
export class TimerEventNode extends CircleNode {
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
      // 内圆
      h('circle', {
        cx: x,
        cy: y,
        r: r - 4,
        fill: 'none',
        stroke: '#fa8c16',
        strokeWidth: 1.5
      }),
      // 时钟图标
      this.getTimerIcon(x, y)
    ])
  }

  /**
   * 获取时钟图标
   */
  private getTimerIcon(x: number, y: number): h.JSX.Element {
    return h('g', {}, [
      // 时针
      h('path', {
        d: `M${x},${y} L${x},${y - 8}`,
        stroke: '#fa8c16',
        strokeWidth: 2,
        strokeLinecap: 'round'
      }),
      // 分针
      h('path', {
        d: `M${x},${y} L${x + 6},${y + 6}`,
        stroke: '#fa8c16',
        strokeWidth: 2,
        strokeLinecap: 'round'
      })
    ])
  }
}
