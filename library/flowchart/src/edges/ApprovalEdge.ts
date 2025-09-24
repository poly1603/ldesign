/**
 * 审批边
 * 
 * 审批流程中的连接线，支持条件表达式和优先级
 */

import { PolylineEdge, PolylineEdgeModel, h } from '@logicflow/core'
import { edgeRenderOptimizer } from '../services/EdgeRenderOptimizer'

/**
 * 审批边模型
 */
export class ApprovalEdgeModel extends PolylineEdgeModel {
  /**
   * 设置边属性
   */
  setAttributes(): void {
    // 设置默认样式
    this.strokeWidth = 2
    this.stroke = 'var(--ldesign-border-color, #d9d9d9)'

    // 设置箭头
    this.arrowConfig = {
      markerEnd: 'url(#approval-arrow)',
      markerStart: ''
    }

    // 优化连线路径
    this.optimizeEdgePath()
  }

  /**
   * 优化连线路径
   */
  private optimizeEdgePath(): void {
    try {
      // 获取源节点和目标节点
      const sourceNode = this.sourceNode
      const targetNode = this.targetNode

      if (!sourceNode || !targetNode) return

      // 使用边渲染优化器计算最优路径
      const optimizedPath = edgeRenderOptimizer.calculateOptimalPath(
        { x: sourceNode.x, y: sourceNode.y, width: sourceNode.width || 80, height: sourceNode.height || 40 },
        { x: targetNode.x, y: targetNode.y, width: targetNode.width || 80, height: targetNode.height || 40 },
        this.properties?.pathType || 'auto'
      )

      // 更新连线路径
      if (optimizedPath && optimizedPath.length > 0) {
        this.pointsList = optimizedPath
      }
    } catch (error) {
      // 优化失败时保持默认路径
    }
  }

  /**
   * 获取边样式
   */
  getEdgeStyle() {
    const style = super.getEdgeStyle()
    const priority = this.properties?.priority || 0

    // 根据优先级设置不同样式
    let strokeColor = 'var(--ldesign-border-color, #d9d9d9)'
    let strokeWidth = 2

    if (priority > 0) {
      strokeColor = 'var(--ldesign-brand-color, #722ED1)'
      strokeWidth = 3
    }

    return {
      ...style,
      stroke: strokeColor,
      strokeWidth,
      strokeDasharray: this.properties?.condition ? '5,5' : 'none'
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
      fill: 'var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7))',
      background: {
        fill: 'white',
        stroke: 'var(--ldesign-border-color, #d9d9d9)',
        strokeWidth: 1,
        rx: 4,
        ry: 4
      }
    }
  }

  /**
   * 更新文本位置
   */
  updateTextPosition(): void {
    if (!this.text || !this.pointsList || this.pointsList.length < 2) {
      return
    }

    try {
      // 使用边渲染优化器计算最佳文本位置
      const optimalPosition = edgeRenderOptimizer.optimizeTextPosition(
        this.pointsList,
        this.text.value || ''
      )

      // 更新文本位置
      this.text.x = optimalPosition.x
      this.text.y = optimalPosition.y
    } catch (error) {
      // 优化失败时使用默认位置
      const midIndex = Math.floor(this.pointsList.length / 2)
      const midPoint = this.pointsList[midIndex]
      if (this.text && midPoint) {
        this.text.x = midPoint.x
        this.text.y = midPoint.y - 10
      }
    }
  }

  /**
   * 获取条件表达式
   */
  getCondition() {
    return this.properties?.condition
  }

  /**
   * 设置条件表达式
   */
  setCondition(condition: string) {
    this.setProperties({
      ...this.properties,
      condition
    })
  }

  /**
   * 获取优先级
   */
  getPriority() {
    return this.properties?.priority || 0
  }

  /**
   * 设置优先级
   */
  setPriority(priority: number) {
    this.setProperties({
      ...this.properties,
      priority
    })
  }
}

/**
 * 审批边视图
 */
export class ApprovalEdge extends PolylineEdge {
  /**
   * 获取边形状
   */
  getShape(): h.JSX.Element {
    const { model } = this.props
    const { pointsList } = model
    const style = model.getEdgeStyle()

    if (!pointsList || pointsList.length < 2) {
      return h('g', {})
    }

    // 构建路径
    const path = this.getPath(pointsList)

    return h('g', {}, [
      // 主路径
      h('path', {
        d: path,
        ...style,
        fill: 'none'
      }),
      // 条件标识
      this.getConditionIndicator(model),
      // 优先级标识
      this.getPriorityIndicator(model)
    ])
  }

  /**
   * 构建路径
   */
  private getPath(points: Array<{ x: number; y: number }>): string {
    if (points.length < 2) return ''

    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`
    }

    return path
  }

  /**
   * 获取条件标识
   */
  private getConditionIndicator(model: any): h.JSX.Element | null {
    const condition = model.getCondition()
    if (!condition) return null

    const { pointsList } = model
    if (!pointsList || pointsList.length < 2) return null

    // 在边的中点显示条件
    const midIndex = Math.floor(pointsList.length / 2)
    const midPoint = pointsList[midIndex]

    return h('g', {}, [
      // 背景
      h('rect', {
        x: midPoint.x - 20,
        y: midPoint.y - 8,
        width: 40,
        height: 16,
        rx: 8,
        ry: 8,
        fill: 'var(--ldesign-warning-color-1, #fff8e6)',
        stroke: 'var(--ldesign-warning-color, #f5c538)',
        strokeWidth: 1
      }),
      // 条件文本
      h('text', {
        x: midPoint.x,
        y: midPoint.y + 3,
        fontSize: 10,
        fill: 'var(--ldesign-warning-color-7, #c2960f)',
        textAnchor: 'middle',
        fontWeight: 'bold'
      }, '条件')
    ])
  }

  /**
   * 获取优先级标识
   */
  private getPriorityIndicator(model: any): h.JSX.Element | null {
    const priority = model.getPriority()
    if (priority <= 0) return null

    const { pointsList } = model
    if (!pointsList || pointsList.length < 2) return null

    // 在起点附近显示优先级
    const startPoint = pointsList[0]
    const secondPoint = pointsList[1] || startPoint

    // 计算标识位置
    const dx = secondPoint.x - startPoint.x
    const dy = secondPoint.y - startPoint.y
    const length = Math.sqrt(dx * dx + dy * dy)

    if (length === 0) return null

    const unitX = dx / length
    const unitY = dy / length
    const indicatorX = startPoint.x + unitX * 20
    const indicatorY = startPoint.y + unitY * 20

    return h('g', {}, [
      // 背景圆
      h('circle', {
        cx: indicatorX,
        cy: indicatorY,
        r: 8,
        fill: 'var(--ldesign-brand-color, #722ED1)',
        stroke: 'white',
        strokeWidth: 1
      }),
      // 优先级数字
      h('text', {
        x: indicatorX,
        y: indicatorY + 3,
        fontSize: 10,
        fill: 'white',
        textAnchor: 'middle',
        fontWeight: 'bold'
      }, priority.toString())
    ])
  }
}
