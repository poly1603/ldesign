/**
 * 开始节点
 * 
 * 审批流程的开始节点，通常表示流程的起始点
 * 支持自适应布局和防重叠渲染
 */

import { CircleNode, CircleNodeModel, h } from '@logicflow/core'
import { createNodeIcon } from '../utils/icons'
import { layoutDetectionService, type LayoutDirection } from '../services/LayoutDetectionService'
import { nodeRenderOptimizer, type NodeLayout } from '../services/NodeRenderOptimizer'

/**
 * 开始节点模型
 */
export class StartNodeModel extends CircleNodeModel {
  private layoutDirection?: LayoutDirection
  private nodeLayout?: NodeLayout
  private isLayoutOptimized = false

  /**
   * 设置节点属性
   */
  override setAttributes(): void {
    // 如果还未优化布局，使用默认设置
    if (!this.isLayoutOptimized) {
      this.r = 30
      
      // 设置默认文本
      if (!this.text?.value) {
        this.text = {
          value: '开始',
          x: this.x,
          y: this.y + 12, // 临时位置，将被优化调整
          draggable: false,
          editable: true
        }
      }
    }
    
    // 尝试应用布局优化
    this.optimizeLayout()
  }

  /**
   * 优化节点布局
   */
  private optimizeLayout(): void {
    try {
      // 获取当前流程图数据进行布局分析
      const graphData = this.graphModel?.getGraphData()
      if (!graphData) return
      
      // 检测布局方向
      const layoutAnalysis = layoutDetectionService.detectLayout(graphData)
      this.layoutDirection = layoutAnalysis.direction
      
      // 计算优化后的布局
      const textValue = this.text?.value || '开始'
      this.nodeLayout = nodeRenderOptimizer.calculateOptimalLayout(
        textValue,
        'start',
        undefined,
        this.layoutDirection
      )
      
      // 应用优化后的样式
      const styles = nodeRenderOptimizer.generateAdaptiveStyles(
        'start',
        this.nodeLayout,
        this.layoutDirection
      )
      
      // 更新节点半径
      this.r = styles.nodeStyle.r
      
      // 更新文本位置 - 确保与图标不重叠
      if (this.text) {
        this.text.x = this.x + this.nodeLayout.textPosition.x
        this.text.y = this.y + this.nodeLayout.textPosition.y
      }
      
      this.isLayoutOptimized = true
    } catch (error) {
      // 失败时使用默认布局
      this.r = 30
    }
  }

  /**
   * 获取节点样式
   */
  override getNodeStyle() {
    const style = super.getNodeStyle()
    return {
      ...style,
      fill: 'var(--ldesign-success-color-1, #ebfaeb)',
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
      fontWeight: 'bold'
    }
  }

  /**
   * 获取锚点 - 根据布局方向自适应
   */
  override getDefaultAnchor() {
    const { x, y, r } = this
    const anchors: any[] = []
    
    // 根据检测到的布局方向设置锚点
    if (this.layoutDirection === 'horizontal') {
      // 横向布局：开始节点使用右侧锚点
      anchors.push({
        x: x + r,
        y,
        id: `${this.id}_right`,
        edgeAddable: true,
        type: 'right'
      })
    } else if (this.layoutDirection === 'vertical') {
      // 纵向布局：开始节点使用下方锚点
      anchors.push({
        x,
        y: y + r,
        id: `${this.id}_bottom`,
        edgeAddable: true,
        type: 'bottom'
      })
    } else {
      // 混合或未知布局：提供右侧和下方锚点
      anchors.push(
        {
          x: x + r,
          y,
          id: `${this.id}_right`,
          edgeAddable: true,
          type: 'right'
        },
        {
          x,
          y: y + r,
          id: `${this.id}_bottom`,
          edgeAddable: true,
          type: 'bottom'
        }
      )
    }
    
    return anchors
  }

  /**
   * 连接规则：开始节点只能作为源节点
   */
  override isAllowConnectedAsTarget(): boolean {
    return false
  }

  /**
   * 连接规则：开始节点可以作为源节点
   */
  override isAllowConnectedAsSource(): boolean {
    return true
  }
}

/**
 * 开始节点视图
 */
export class StartNode extends CircleNode {
  /**
   * 获取节点形状 - 支持优化布局和防重叠
   */
  override getShape(): h.JSX.Element {
    const { model } = this.props as { model: StartNodeModel }
    const { x, y, r } = model
    const style = model.getNodeStyle()
    
    // 获取优化后的布局信息
    const nodeLayout = (model as any).nodeLayout
    const layoutDirection = (model as any).layoutDirection

    // 计算图标位置 - 确保不与文本重叠
    let iconX = x
    let iconY = y - 6 // 图标稍微向上，为文本留出空间
    let iconSize = 12

    if (nodeLayout) {
      iconX = x + nodeLayout.iconPosition.x
      iconY = y + nodeLayout.iconPosition.y
      iconSize = nodeLayout.iconSize
    } else {
      // 如果没有优化布局，使用安全的默认位置
      // 图标在上方，文本在下方，确保不重叠
      iconY = y - 8
    }

    // 获取lucide图标数据
    const iconData = createNodeIcon('play', {
      size: iconSize,
      color: 'var(--ldesign-success-color, #52c41a)',
      strokeWidth: 2
    })

    const iconElements = []
    if (iconData) {
      // 创建SVG图标 - 使用优化后的位置，确保完全居中
      const scale = iconSize / 24
      iconElements.push(
        h('g', {
          transform: `translate(${iconX}, ${iconY})`
        }, [
          h('g', {
            transform: `scale(${scale}) translate(-12, -12)` // 先缩放再居中
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
      )
    }

    // 添加布局方向指示器（调试用，可选）
    const debugElements = []
    if (process.env.NODE_ENV === 'development' && layoutDirection) {
      debugElements.push(
        h('text', {
          x: x + r + 5,
          y: y - r - 5,
          fontSize: 10,
          fill: '#999',
          opacity: 0.7
        }, layoutDirection.charAt(0).toUpperCase())
      )
    }

    return h('g', {}, [
      // 主圆形
      h('circle', {
        cx: x,
        cy: y,
        r,
        ...style
      }),
      // 优化后的图标
      ...iconElements,
      // 调试信息
      ...debugElements
    ])
  }
  
  /**
   * 手动设置布局方向
   */
  setLayoutDirection(direction: LayoutDirection): void {
    (this.model as any).layoutDirection = direction;
    (this.model as any).isLayoutOptimized = false
    this.model.setAttributes()
  }
  
  /**
   * 获取当前布局方向
   */
  getLayoutDirection(): LayoutDirection | undefined {
    return (this.model as any).layoutDirection
  }
}
