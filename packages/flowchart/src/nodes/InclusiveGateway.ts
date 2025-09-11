/**
 * 包容网关节点
 * 
 * 包容网关可以激活一个或多个输出分支，根据条件决定激活哪些分支
 */

import { PolygonNode, PolygonNodeModel, h } from '@logicflow/core'

/**
 * 包容网关节点模型
 */
export class InclusiveGatewayNodeModel extends PolygonNodeModel {
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

    // 设置默认文本
    if (!this.text?.value) {
      this.text = {
        value: '包容网关',
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
      fill: '#e6f4ff',
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
   * 连接规则：包容网关可以作为目标节点
   */
  override isAllowConnectedAsTarget(): boolean {
    return true
  }

  /**
   * 连接规则：包容网关可以作为源节点
   */
  override isAllowConnectedAsSource(): boolean {
    return true
  }
}

/**
 * 包容网关节点视图
 */
export class InclusiveGatewayNode extends PolygonNode {
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
      // 包容网关图标（圆圈）
      this.getInclusiveIcon(x, y)
    ])
  }

  /**
   * 获取包容网关图标
   */
  private getInclusiveIcon(x: number, y: number): h.JSX.Element {
    return h('circle', {
      cx: x,
      cy: y,
      r: 8,
      fill: 'none',
      stroke: 'white',
      strokeWidth: 3
    })
  }
}
