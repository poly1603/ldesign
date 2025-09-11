/**
 * 脚本任务节点
 * 
 * 表示由脚本自动执行的任务节点
 */

import { RectNode, RectNodeModel, h } from '@logicflow/core'

/**
 * 脚本任务节点模型
 */
export class ScriptTaskNodeModel extends RectNodeModel {
  /**
   * 设置节点属性
   */
  override setAttributes(): void {
    // 设置节点尺寸
    this.width = 120
    this.height = 60
    this.radius = 8

    // 设置默认文本
    if (!this.text?.value) {
      this.text = {
        value: '脚本任务',
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
      fill: 'var(--ldesign-warning-color-1, #fff7e6)',
      stroke: 'var(--ldesign-warning-color, #fa8c16)',
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
   * 连接规则：脚本任务节点可以作为目标节点
   */
  override isAllowConnectedAsTarget(): boolean {
    return true
  }

  /**
   * 连接规则：脚本任务节点可以作为源节点
   */
  override isAllowConnectedAsSource(): boolean {
    return true
  }
}

/**
 * 脚本任务节点视图
 */
export class ScriptTaskNode extends RectNode {
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
      // 脚本图标
      this.getScriptIcon(x, y)
    ])
  }

  /**
   * 获取脚本图标
   */
  private getScriptIcon(x: number, y: number): h.JSX.Element {
    return h('g', { transform: `translate(${x - 45}, ${y - 20})` }, [
      // 命令行提示符
      h('path', {
        d: 'M-4,-2 L0,0 L-4,2',
        stroke: '#fa8c16',
        strokeWidth: 2,
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }),
      // 下划线
      h('rect', {
        x: 2,
        y: 1,
        width: 6,
        height: 1.5,
        fill: '#fa8c16'
      })
    ])
  }
}
