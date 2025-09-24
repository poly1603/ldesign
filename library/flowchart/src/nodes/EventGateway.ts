/**
 * 事件网关节点
 * 
 * 事件网关用于基于事件的分支决策
 */

import { PolygonNode, PolygonNodeModel, h } from '@logicflow/core'

/**
 * 事件网关节点模型
 */
export class EventGatewayNodeModel extends PolygonNodeModel {
  /**
   * 设置节点属性
   */
  override setAttributes(): void {
    // 设置菱形的点坐标
    const size = 50
    this.points = [
      [this.x, this.y - size / 2], // 上
      [this.x + size / 2, this.y], // 右
      [this.x, this.y + size / 2], // 下
      [this.x - size / 2, this.y]  // 左
    ]

    // 设置默认文本 - 文本在图标下方，整体居中
    if (!this.text?.value) {
      this.text = {
        value: '事件网关',
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
      fill: '#fff1f0',
      stroke: '#ff4d4f',
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
    const { x, y } = this
    const size = 25
    return [
      // 上方锚点
      {
        x,
        y: y - size,
        id: `${this.id}_top`,
        edgeAddable: true,
        type: 'top'
      },
      // 右侧锚点
      {
        x: x + size,
        y,
        id: `${this.id}_right`,
        edgeAddable: true,
        type: 'right'
      },
      // 下方锚点
      {
        x,
        y: y + size,
        id: `${this.id}_bottom`,
        edgeAddable: true,
        type: 'bottom'
      },
      // 左侧锚点
      {
        x: x - size,
        y,
        id: `${this.id}_left`,
        edgeAddable: true,
        type: 'left'
      }
    ]
  }

  /**
   * 连接规则：事件网关可以作为目标节点
   */
  override isAllowConnectedAsTarget(): boolean {
    return true
  }

  /**
   * 连接规则：事件网关可以作为源节点
   */
  override isAllowConnectedAsSource(): boolean {
    return true
  }
}

/**
 * 事件网关节点视图
 */
export class EventGatewayNode extends PolygonNode {
  /**
   * 获取节点形状
   */
  override getShape(): h.JSX.Element {
    const { model } = this.props
    const { x, y, points } = model
    const style = model.getNodeStyle()

    // 将points数组转换为路径字符串
    const pathStr = points.map((point, index) => {
      const [px, py] = point
      return `${index === 0 ? 'M' : 'L'} ${px} ${py}`
    }).join(' ') + ' Z'

    return h('g', {}, [
      // 菱形主体
      h('path', {
        d: pathStr,
        ...style
      }),
      // 事件网关图标
      this.getEventIcon(x, y)
    ])
  }

  /**
   * 获取事件网关图标
   */
  private getEventIcon(x: number, y: number): h.JSX.Element {
    // 图标在文本上方，整体居中
    const iconY = y - 15
    return h('g', {}, [
      // 外圆
      h('circle', {
        cx: x,
        cy: iconY,
        r: 6,
        fill: 'none',
        stroke: 'white',
        strokeWidth: 2
      }),
      // 五角星
      h('polygon', {
        points: `${x},${iconY - 4} ${x + 1.2},${iconY - 1.2} ${x + 4},${iconY - 1.2} ${x + 1.6},${iconY + 0.8} ${x + 2.4},${iconY + 4} ${x},${iconY + 2} ${x - 2.4},${iconY + 4} ${x - 1.6},${iconY + 0.8} ${x - 4},${iconY - 1.2} ${x - 1.2},${iconY - 1.2}`,
        fill: 'white'
      })
    ])
  }
}
