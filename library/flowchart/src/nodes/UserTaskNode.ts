/**
 * 用户任务节点
 * 
 * 表示需要用户手动执行的任务节点
 */

import { RectNode, RectNodeModel, h } from '@logicflow/core'
import { applySimpleLayout } from '../utils/SimpleNodeLayout'

/**
 * 用户任务节点模型
 */
export class UserTaskNodeModel extends RectNodeModel {
  /**
   * 设置节点属性
   */
  override setAttributes(): void {
    // 设置节点尺寸
    this.width = 120
    this.height = 60
    this.radius = 8

    // 使用简化的布局系统设置文本位置
    if (!this.text?.value) {
      this.text = {
        value: '用户任务',
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
      fill: 'var(--ldesign-brand-color-1, #e6f7ff)',
      stroke: 'var(--ldesign-brand-color, #1890ff)',
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
   * 连接规则：用户任务节点可以作为目标节点
   */
  override isAllowConnectedAsTarget(): boolean {
    return true
  }

  /**
   * 连接规则：用户任务节点可以作为源节点
   */
  override isAllowConnectedAsSource(): boolean {
    return true
  }
}

/**
 * 用户任务节点视图
 */
export class UserTaskNode extends RectNode {
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
      // 用户图标
      this.getUserIcon(x, y)
    ])
  }

  /**
   * 获取用户图标
   */
  private getUserIcon(x: number, y: number): h.JSX.Element {
    // 使用简化的布局系统计算图标位置
    const { iconX, iconY } = applySimpleLayout(null, x, y, 'rect', { width: 120, height: 60 })

    return h('g', {
      transform: `translate(${iconX}, ${iconY})`,
      className: 'lf-node-icon lf-node-user-task'
    }, [
      // 用户头像
      h('circle', {
        cx: 0,
        cy: -3,
        r: 3,
        fill: 'none',
        stroke: '#1890ff',
        strokeWidth: 1.5
      }),
      // 用户身体
      h('path', {
        d: 'M-5,6 C-5,3 -2,1 0,1 C2,1 5,3 5,6',
        fill: 'none',
        stroke: '#1890ff',
        strokeWidth: 1.5
      })
    ])
  }
}
