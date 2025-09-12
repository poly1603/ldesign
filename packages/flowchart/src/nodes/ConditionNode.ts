/**
 * 条件节点
 * 
 * 审批流程中的条件判断节点，用于分支控制
 */

import { DiamondNode, DiamondNodeModel, h } from '@logicflow/core'

/**
 * 条件节点模型
 */
export class ConditionNodeModel extends DiamondNodeModel {
  /**
   * 设置节点属性
   */
  setAttributes(): void {
    // 设置节点尺寸
    this.rx = 60
    this.ry = 30

    // 设置默认文本 - 文本在图标下方，有足够间隔
    if (!this.text?.value) {
      this.text = {
        value: '条件判断',
        x: this.x,
        y: this.y + 15, // 文本在图标下方，增加间隔
        draggable: false,
        editable: true
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
      fill: 'var(--ldesign-warning-color-1, #fff8e6)',
      stroke: 'var(--ldesign-warning-color, #f5c538)',
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
      // 左侧锚点（输入）
      {
        x: x - rx,
        y,
        id: `${this.id}_left`,
        edgeAddable: true,
        type: 'left'
      },
      // 右侧锚点（输出）
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
 * 条件节点视图
 */
export class ConditionNode extends DiamondNode {
  /**
   * 获取节点形状
   */
  getShape(): h.JSX.Element {
    const { model } = this.props
    const { x, y, rx, ry } = model
    const style = model.getNodeStyle()

    // 计算菱形的四个顶点
    const points = [
      [x, y - ry], // 上
      [x + rx, y], // 右
      [x, y + ry], // 下
      [x - rx, y]  // 左
    ].map(point => point.join(',')).join(' ')

    return h('g', {}, [
      // 主菱形
      h('polygon', {
        points,
        ...style
      }),
      // 条件图标 - 问号，在文本上方，增加间隔
      h('g', {
        transform: `translate(${x}, ${y - 15})`
      }, [
        h('text', {
          x: 0,
          y: 0,
          textAnchor: 'middle',
          dominantBaseline: 'middle',
          fontSize: 14,
          fontWeight: 'bold',
          fill: 'var(--ldesign-warning-color, #f5c538)'
        }, '?')
      ])
    ])
  }
}
