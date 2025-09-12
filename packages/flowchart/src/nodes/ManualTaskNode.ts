/**
 * 手工任务节点
 * 
 * 表示需要手工操作的任务节点
 */

import { RectNode, RectNodeModel, h } from '@logicflow/core'

/**
 * 手工任务节点模型
 */
export class ManualTaskNodeModel extends RectNodeModel {
  /**
   * 设置节点属性
   */
  override setAttributes(): void {
    // 设置节点尺寸
    this.width = 120
    this.height = 60
    this.radius = 8

    // 设置默认文本 - 文本在图标下方，整体居中
    if (!this.text?.value) {
      this.text = {
        value: '手工任务',
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
      fill: 'var(--ldesign-brand-color-1, #f9f0ff)',
      stroke: 'var(--ldesign-brand-color, #722ed1)',
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
    const { x, y, width, height } = this
    return [
      // 左侧锚点（输入）
      {
        x: x - width / 2,
        y,
        id: `${this.id}_left`,
        edgeAddable: true,
        type: 'left'
      },
      // 右侧锚点（输出）
      {
        x: x + width / 2,
        y,
        id: `${this.id}_right`,
        edgeAddable: true,
        type: 'right'
      },
      // 上方锚点
      {
        x,
        y: y - height / 2,
        id: `${this.id}_top`,
        edgeAddable: true,
        type: 'top'
      },
      // 下方锚点
      {
        x,
        y: y + height / 2,
        id: `${this.id}_bottom`,
        edgeAddable: true,
        type: 'bottom'
      }
    ]
  }

  /**
   * 连接规则：手工任务节点可以作为目标节点
   */
  override isAllowConnectedAsTarget(): boolean {
    return true
  }

  /**
   * 连接规则：手工任务节点可以作为源节点
   */
  override isAllowConnectedAsSource(): boolean {
    return true
  }
}

/**
 * 手工任务节点视图
 */
export class ManualTaskNode extends RectNode {
  /**
   * 获取节点形状
   */
  override getShape(): h.JSX.Element {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    const style = model.getNodeStyle()

    return h('g', {}, [
      // 主矩形
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        rx: radius,
        ry: radius,
        ...style
      }),
      // 手工图标
      this.getManualIcon(x, y)
    ])
  }

  /**
   * 获取手工图标
   */
  private getManualIcon(x: number, y: number): h.JSX.Element {
    // 图标在文本上方，整体居中
    return h('g', { transform: `translate(${x - 45}, ${y - 35})` }, [
      // 手掌
      h('path', {
        d: 'M-2,-3 C-2,-5 -1,-6 0,-6 C1,-6 2,-5 2,-3 L2,2 C2,3 1,4 0,4 C-1,4 -2,3 -2,2 L-2,-3 Z',
        fill: '#722ed1'
      }),
      // 手指
      h('path', {
        d: 'M2,-1 L6,-1 C7,-1 8,0 8,1 C8,2 7,3 6,3 L2,3',
        fill: 'none',
        stroke: '#722ed1',
        strokeWidth: 1.5
      })
    ])
  }
}
