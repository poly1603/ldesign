/**
 * 审批节点
 * 
 * 审批流程的核心节点，表示需要人工审批的环节
 */

import { RectNode, RectNodeModel, h } from '@logicflow/core'
import { createNodeIcon } from '../utils/icons'

/**
 * 审批节点模型
 */
export class ApprovalNodeModel extends RectNodeModel {
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
        value: '审批节点',
        x: this.x,
        y: this.y + 12, // 文本在图标下方，整体居中
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
    const status = this.properties?.status

    // 根据审批状态设置不同样式
    let fillColor = 'var(--ldesign-brand-color-1, #f1ecf9)'
    let strokeColor = 'var(--ldesign-brand-color, #722ED1)'

    switch (status) {
      case 'approved':
        fillColor = 'var(--ldesign-success-color-1, #ebfaeb)'
        strokeColor = 'var(--ldesign-success-color, #52c41a)'
        break
      case 'rejected':
        fillColor = 'var(--ldesign-error-color-1, #fde8e8)'
        strokeColor = 'var(--ldesign-error-color, #e54848)'
        break
      case 'processing':
        fillColor = 'var(--ldesign-warning-color-1, #fff8e6)'
        strokeColor = 'var(--ldesign-warning-color, #f5c538)'
        break
    }

    return {
      ...style,
      fill: fillColor,
      stroke: strokeColor,
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
   * 连接规则：审批节点可以作为目标节点
   */
  override isAllowConnectedAsTarget(): boolean {
    return true
  }

  /**
   * 连接规则：审批节点可以作为源节点
   */
  override isAllowConnectedAsSource(): boolean {
    return true
  }

  /**
   * 获取审批人信息
   */
  getApprovers() {
    return this.properties?.approvers || []
  }

  /**
   * 设置审批状态
   */
  setApprovalStatus(status: string) {
    this.setProperties({
      ...this.properties,
      status
    })
  }

  /**
   * 获取审批状态
   */
  getApprovalStatus() {
    return this.properties?.status || 'pending'
  }
}

/**
 * 审批节点视图
 */
export class ApprovalNode extends RectNode {
  /**
   * 获取节点形状
   */
  override getShape(): h.JSX.Element {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    const style = model.getNodeStyle()
    const status = model.properties?.status

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
      // 节点类型图标
      this.getNodeTypeIcon(x, y),
      // 状态图标
      this.getStatusIcon(x, y, status),
      // 审批人数量标识
      this.getApproverCount(x, y, model.getApprovers().length)
    ])
  }

  /**
   * 获取节点类型图标
   */
  private getNodeTypeIcon(x: number, y: number): h.JSX.Element | null {
    const iconData = createNodeIcon('check-square', {
      size: 16,
      color: 'var(--ldesign-brand-color, #722ed1)',
      strokeWidth: 2
    })

    if (!iconData) return null

    return h('g', {
      transform: `translate(${x}, ${y - 8})` // 图标在节点中心稍微上方，为文本留出空间
    }, [
      h('g', {
        transform: 'translate(-8, -8)' // 居中图标 (16/2 = 8)
      }, iconData.paths.map((path: string, index: number) =>
        h('path', {
          key: index,
          d: path,
          fill: 'none',
          stroke: iconData.color,
          strokeWidth: iconData.strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        })
      ))
    ])
  }

  /**
   * 获取状态图标
   */
  private getStatusIcon(x: number, y: number, status?: string): h.JSX.Element | null {
    if (!status || status === 'pending') return null

    let iconPath = ''
    let iconColor = ''

    switch (status) {
      case 'approved':
        iconPath = 'M-6,-2 L-2,2 L6,-6'
        iconColor = 'var(--ldesign-success-color, #52c41a)'
        break
      case 'rejected':
        iconPath = 'M-4,-4 L4,4 M4,-4 L-4,4'
        iconColor = 'var(--ldesign-error-color, #e54848)'
        break
      case 'processing':
        iconPath = 'M-4,0 A4,4 0 1,1 4,0 A4,4 0 1,1 -4,0'
        iconColor = 'var(--ldesign-warning-color, #f5c538)'
        break
    }

    return h('path', {
      d: iconPath,
      transform: `translate(${x}, ${y - 15})`, // 图标在文本上方，整体居中
      stroke: iconColor,
      strokeWidth: 2,
      fill: 'none'
    })
  }

  /**
   * 获取审批人数量标识
   */
  private getApproverCount(x: number, y: number, count: number): h.JSX.Element | null {
    if (count === 0) return null

    return h('g', {}, [
      // 背景圆
      h('circle', {
        cx: x - 20,
        cy: y - 15,
        r: 8,
        fill: 'var(--ldesign-brand-color, #722ED1)',
        stroke: 'white',
        strokeWidth: 1
      }),
      // 数量文本
      h('text', {
        x: x - 20,
        y: y - 11,
        fontSize: 10,
        fill: 'white',
        textAnchor: 'middle',
        fontWeight: 'bold'
      }, count.toString())
    ])
  }
}
