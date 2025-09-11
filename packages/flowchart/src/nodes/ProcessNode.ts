/**
 * 处理节点
 * 
 * 审批流程中的一般处理节点
 */

import { RectNode, RectNodeModel, h } from '@logicflow/core'

/**
 * 处理节点模型
 */
export class ProcessNodeModel extends RectNodeModel {
  /**
   * 设置节点属性
   */
  setAttributes(): void {
    // 设置节点尺寸
    this.width = 100
    this.height = 50
    this.radius = 6

    // 设置默认文本
    if (!this.text?.value) {
      this.text = {
        value: '处理节点',
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
      fill: 'var(--ldesign-gray-color-1, #f2f2f2)',
      stroke: 'var(--ldesign-gray-color-6, #808080)',
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
}

/**
 * 处理节点视图
 */
export class ProcessNode extends RectNode {
  /**
   * 获取节点形状
   */
  getShape(): h.JSX.Element {
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
      // 处理图标
      h('circle', {
        cx: x - 25,
        cy: y - 15,
        r: 3,
        fill: 'var(--ldesign-gray-color-6, #808080)',
        stroke: 'none'
      }),
      h('circle', {
        cx: x - 15,
        cy: y - 15,
        r: 3,
        fill: 'var(--ldesign-gray-color-6, #808080)',
        stroke: 'none'
      }),
      h('circle', {
        cx: x - 5,
        cy: y - 15,
        r: 3,
        fill: 'var(--ldesign-gray-color-6, #808080)',
        stroke: 'none'
      })
    ])
  }
}
