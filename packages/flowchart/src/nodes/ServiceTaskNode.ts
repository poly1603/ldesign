/**
 * 服务任务节点
 * 
 * 表示由系统服务自动执行的任务节点
 */

import { RectNode, RectNodeModel, h } from '@logicflow/core'

/**
 * 服务任务节点模型
 */
export class ServiceTaskNodeModel extends RectNodeModel {
  /**
   * 设置节点属性
   */
  override setAttributes(): void {
    // 设置节点尺寸
    this.width = 120
    this.height = 60
    this.radius = 8

    // 使用简化的文本位置设置
    if (!this.text?.value) {
      this.text = {
        value: '服务任务',
        x: this.x,
        y: this.y + 25, // 增加偏移量，确保在图标下方且不重叠
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
      fill: 'var(--ldesign-success-color-1, #f6ffed)',
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
   * 连接规则：服务任务节点可以作为目标节点
   */
  override isAllowConnectedAsTarget(): boolean {
    return true
  }

  /**
   * 连接规则：服务任务节点可以作为源节点
   */
  override isAllowConnectedAsSource(): boolean {
    return true
  }
}

/**
 * 服务任务节点视图
 */
export class ServiceTaskNode extends RectNode {
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
      // 服务图标
      this.getServiceIcon(x, y)
    ])
  }

  /**
   * 获取服务图标
   */
  private getServiceIcon(x: number, y: number): h.JSX.Element {
    // 图标在文本上方，整体居中
    return h('g', { transform: `translate(${x - 45}, ${y - 35})` }, [
      // 齿轮外圈
      h('circle', {
        cx: 0,
        cy: 0,
        r: 6,
        fill: 'none',
        stroke: '#52c41a',
        strokeWidth: 2
      }),
      // 齿轮内圈
      h('circle', {
        cx: 0,
        cy: 0,
        r: 3,
        fill: 'none',
        stroke: '#52c41a',
        strokeWidth: 1.5
      }),
      // 对勾
      h('path', {
        d: 'M-2,-1 L0,1 L3,-2',
        stroke: '#52c41a',
        strokeWidth: 2,
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      })
    ])
  }
}
