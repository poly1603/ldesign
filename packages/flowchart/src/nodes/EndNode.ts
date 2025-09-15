/**
 * 结束节点
 * 
 * 审批流程的结束节点，表示流程的终点
 * 支持自适应布局和防重叠渲染
 */

import { CircleNode, CircleNodeModel, h } from '@logicflow/core'
import { createNodeIcon } from '../utils/icons'
import { layoutDetectionService, type LayoutDirection } from '../services/LayoutDetectionService'
import { nodeRenderOptimizer, type NodeLayout } from '../services/NodeRenderOptimizer'
import { applySimpleLayout } from '../utils/SimpleNodeLayout'

/**
 * 结束节点模型
 */
export class EndNodeModel extends CircleNodeModel {
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
          value: '结束',
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
      const textValue = this.text?.value || '结束'
      this.nodeLayout = nodeRenderOptimizer.calculateOptimalLayout(
        textValue,
        'end',
        undefined,
        this.layoutDirection
      )
      
      // 应用优化后的样式
      const styles = nodeRenderOptimizer.generateAdaptiveStyles(
        'end',
        this.nodeLayout,
        this.layoutDirection
      )
      
      // 更新节点半径
      this.r = styles.nodeStyle.r
      
      // 使用简化的布局系统更新文本位置
      if (this.text) {
        applySimpleLayout(this.text, this.x, this.y, 'circle', { radius: this.r })
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
  getNodeStyle() {
    const style = super.getNodeStyle()
    return {
      ...style,
      fill: 'var(--ldesign-error-color-1, #fde8e8)',
      stroke: 'var(--ldesign-error-color, #e54848)',
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
      // 横向布局：结束节点使用左侧锚点
      anchors.push({
        x: x - r,
        y,
        id: `${this.id}_left`,
        edgeAddable: true,
        type: 'left'
      })
    } else if (this.layoutDirection === 'vertical') {
      // 纵向布局：结束节点使用上方锚点
      anchors.push({
        x,
        y: y - r,
        id: `${this.id}_top`,
        edgeAddable: true,
        type: 'top'
      })
    } else {
      // 混合或未知布局：提供左侧和上方锚点
      anchors.push(
        {
          x: x - r,
          y,
          id: `${this.id}_left`,
          edgeAddable: true,
          type: 'left'
        },
        {
          x,
          y: y - r,
          id: `${this.id}_top`,
          edgeAddable: true,
          type: 'top'
        }
      )
    }
    
    return anchors
  }

  /**
   * 连接规则：结束节点可以作为目标节点
   */
  isAllowConnectedAsTarget(): boolean {
    return true
  }

  /**
   * 连接规则：结束节点不能作为源节点
   */
  isAllowConnectedAsSource(): boolean {
    return false
  }
}

/**
 * 结束节点视图
 */
export class EndNode extends CircleNode {
  /**
   * 获取节点形状 - 支持优化布局和防重叠
   */
  override getShape(): h.JSX.Element {
    const { model } = this.props
    const { x, y, r } = model
    const style = model.getNodeStyle()
    
    // 获取优化后的布局信息
    const nodeLayout = (model as any).nodeLayout

    // 使用简化的布局系统计算图标位置
    const { iconX, iconY } = applySimpleLayout(null, x, y, 'circle', { radius: r })
    const iconSize = 14

    // 添加布局方向指示器（调试用，可选）
    const debugElements = []
    const layoutDirection = (model as any).layoutDirection
    if (process.env.NODE_ENV === 'development' && layoutDirection) {
      debugElements.push(
        h('text', {
          x: x - r - 15,
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
      // 优化后的结束图标
      this.getEndIcon(iconX, iconY, iconSize),
      // 调试信息
      ...debugElements
    ])
  }

  /**
   * 获取结束图标 - 支持优化布局
   */
  private getEndIcon(x: number, y: number, size: number = 14): h.JSX.Element | null {
    const iconData = createNodeIcon('square', {
      size,
      color: 'var(--ldesign-error-color, #e54848)',
      strokeWidth: 2
    })

    if (!iconData) return null

    const scale = size / 24
    return h('g', {
      transform: `translate(${x}, ${y})`
    }, [
      h('g', {
        transform: `scale(${scale}) translate(-12, -12)` // 先缩放再居中
      }, iconData.paths.map((path: string, index: number) =>
        h('path', {
          key: index,
          d: path,
          fill: 'var(--ldesign-error-color, #e54848)', // 结束节点填充颜色
          stroke: iconData.color,
          strokeWidth: iconData.strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        })
      ))
    ])
  }
  
  /**
   * 手动设置布局方向
   */
  setLayoutDirection(direction: LayoutDirection): void {
    const { model } = this.props;
    (model as any).layoutDirection = direction;
    (model as any).isLayoutOptimized = false
    model.setAttributes()
  }

  /**
   * 获取当前布局方向
   */
  getLayoutDirection(): LayoutDirection | undefined {
    const { model } = this.props
    return (model as any).layoutDirection
  }
}
