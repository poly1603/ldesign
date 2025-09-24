/**
 * 流程图布局检测服务
 * 
 * 自动检测流程图是横向还是纵向布局，并提供布局优化建议
 */

import type { FlowchartData, ApprovalNodeConfig, Point } from '../types'

export type LayoutDirection = 'horizontal' | 'vertical' | 'mixed' | 'unknown'

export interface LayoutAnalysis {
  direction: LayoutDirection
  confidence: number // 置信度 0-1
  mainAxis: 'x' | 'y' // 主要排列轴
  startNodes: ApprovalNodeConfig[]
  endNodes: ApprovalNodeConfig[]
  suggestedAnchorPositions: {
    start: AnchorPosition[]
    end: AnchorPosition[]
  }
}

export interface AnchorPosition {
  type: 'top' | 'right' | 'bottom' | 'left'
  x: number
  y: number
  id: string
}

export class LayoutDetectionService {
  /**
   * 检测流程图的布局方向
   */
  detectLayout(data: FlowchartData): LayoutAnalysis {
    const nodes = data.nodes
    const edges = data.edges

    if (!nodes || nodes.length < 2) {
      return {
        direction: 'unknown',
        confidence: 0,
        mainAxis: 'x',
        startNodes: [],
        endNodes: [],
        suggestedAnchorPositions: { start: [], end: [] }
      }
    }

    // 分析节点分布
    const distribution = this.analyzeNodeDistribution(nodes)
    
    // 分析连线方向
    const edgeDirection = this.analyzeEdgeDirection(nodes, edges)
    
    // 识别开始和结束节点
    const startNodes = nodes.filter(node => node.type === 'start')
    const endNodes = nodes.filter(node => node.type === 'end')
    
    // 综合分析确定布局方向
    const direction = this.determineLayoutDirection(distribution, edgeDirection)
    
    // 计算置信度
    const confidence = this.calculateConfidence(distribution, edgeDirection, direction)
    
    // 生成锚点建议
    const suggestedAnchorPositions = this.generateAnchorSuggestions(
      direction, 
      startNodes, 
      endNodes,
      distribution
    )

    return {
      direction,
      confidence,
      mainAxis: direction === 'horizontal' ? 'x' : 'y',
      startNodes,
      endNodes,
      suggestedAnchorPositions
    }
  }

  /**
   * 分析节点在画布上的分布
   */
  private analyzeNodeDistribution(nodes: ApprovalNodeConfig[]): {
    horizontalSpread: number
    verticalSpread: number
    horizontalVariance: number
    verticalVariance: number
    aspectRatio: number
  } {
    const xCoords = nodes.map(node => node.x)
    const yCoords = nodes.map(node => node.y)
    
    const minX = Math.min(...xCoords)
    const maxX = Math.max(...xCoords)
    const minY = Math.min(...yCoords)
    const maxY = Math.max(...yCoords)
    
    const horizontalSpread = maxX - minX
    const verticalSpread = maxY - minY
    
    // 计算方差来判断分布密度
    const avgX = xCoords.reduce((sum, x) => sum + x, 0) / xCoords.length
    const avgY = yCoords.reduce((sum, y) => sum + y, 0) / yCoords.length
    
    const horizontalVariance = xCoords.reduce((sum, x) => sum + Math.pow(x - avgX, 2), 0) / xCoords.length
    const verticalVariance = yCoords.reduce((sum, y) => sum + Math.pow(y - avgY, 2), 0) / yCoords.length
    
    const aspectRatio = horizontalSpread / (verticalSpread || 1)
    
    return {
      horizontalSpread,
      verticalSpread,
      horizontalVariance,
      verticalVariance,
      aspectRatio
    }
  }

  /**
   * 分析连线的主要方向
   */
  private analyzeEdgeDirection(nodes: ApprovalNodeConfig[], edges: any[]): {
    horizontalCount: number
    verticalCount: number
    diagonalCount: number
    dominantDirection: 'horizontal' | 'vertical' | 'diagonal'
  } {
    let horizontalCount = 0
    let verticalCount = 0
    let diagonalCount = 0
    
    const nodeMap = new Map(nodes.map(node => [node.id, node]))
    
    edges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.sourceNodeId)
      const targetNode = nodeMap.get(edge.targetNodeId)
      
      if (!sourceNode || !targetNode) return
      
      const deltaX = Math.abs(targetNode.x - sourceNode.x)
      const deltaY = Math.abs(targetNode.y - sourceNode.y)
      
      if (deltaX > deltaY * 2) {
        horizontalCount++
      } else if (deltaY > deltaX * 2) {
        verticalCount++
      } else {
        diagonalCount++
      }
    })
    
    let dominantDirection: 'horizontal' | 'vertical' | 'diagonal' = 'horizontal'
    if (verticalCount > horizontalCount && verticalCount > diagonalCount) {
      dominantDirection = 'vertical'
    } else if (diagonalCount > horizontalCount && diagonalCount > verticalCount) {
      dominantDirection = 'diagonal'
    }
    
    return {
      horizontalCount,
      verticalCount,
      diagonalCount,
      dominantDirection
    }
  }

  /**
   * 确定最终的布局方向
   */
  private determineLayoutDirection(
    distribution: ReturnType<LayoutDetectionService['analyzeNodeDistribution']>,
    edgeDirection: ReturnType<LayoutDetectionService['analyzeEdgeDirection']>
  ): LayoutDirection {
    const { aspectRatio, horizontalVariance, verticalVariance } = distribution
    const { dominantDirection } = edgeDirection
    
    // 基于宽高比的初步判断
    let layoutByAspectRatio: LayoutDirection
    if (aspectRatio > 1.5) {
      layoutByAspectRatio = 'horizontal'
    } else if (aspectRatio < 0.67) {
      layoutByAspectRatio = 'vertical'
    } else {
      layoutByAspectRatio = 'mixed'
    }
    
    // 基于方差的判断（方差大说明分布广）
    const varianceRatio = horizontalVariance / (verticalVariance || 1)
    let layoutByVariance: LayoutDirection
    if (varianceRatio > 2) {
      layoutByVariance = 'horizontal'
    } else if (varianceRatio < 0.5) {
      layoutByVariance = 'vertical'
    } else {
      layoutByVariance = 'mixed'
    }
    
    // 基于连线方向的判断
    let layoutByEdges: LayoutDirection
    if (dominantDirection === 'horizontal') {
      layoutByEdges = 'horizontal'
    } else if (dominantDirection === 'vertical') {
      layoutByEdges = 'vertical'
    } else {
      layoutByEdges = 'mixed'
    }
    
    // 综合判断
    const votes = [layoutByAspectRatio, layoutByVariance, layoutByEdges]
    const horizontalVotes = votes.filter(v => v === 'horizontal').length
    const verticalVotes = votes.filter(v => v === 'vertical').length
    
    if (horizontalVotes >= 2) {
      return 'horizontal'
    } else if (verticalVotes >= 2) {
      return 'vertical'
    } else {
      return 'mixed'
    }
  }

  /**
   * 计算检测置信度
   */
  private calculateConfidence(
    distribution: ReturnType<LayoutDetectionService['analyzeNodeDistribution']>,
    edgeDirection: ReturnType<LayoutDetectionService['analyzeEdgeDirection']>,
    finalDirection: LayoutDirection
  ): number {
    if (finalDirection === 'unknown') return 0
    if (finalDirection === 'mixed') return 0.5
    
    const { aspectRatio, horizontalVariance, verticalVariance } = distribution
    const { horizontalCount, verticalCount } = edgeDirection
    
    let confidence = 0.5
    
    // 基于宽高比的置信度
    if (finalDirection === 'horizontal') {
      confidence += Math.min(0.3, (aspectRatio - 1) * 0.15)
    } else if (finalDirection === 'vertical') {
      confidence += Math.min(0.3, (1 / aspectRatio - 1) * 0.15)
    }
    
    // 基于方差的置信度
    const varianceRatio = horizontalVariance / (verticalVariance || 1)
    if (finalDirection === 'horizontal' && varianceRatio > 1) {
      confidence += Math.min(0.2, Math.log(varianceRatio) * 0.1)
    } else if (finalDirection === 'vertical' && varianceRatio < 1) {
      confidence += Math.min(0.2, Math.log(1 / varianceRatio) * 0.1)
    }
    
    // 基于连线方向的置信度
    const totalEdges = horizontalCount + verticalCount
    if (totalEdges > 0) {
      if (finalDirection === 'horizontal') {
        confidence += (horizontalCount / totalEdges) * 0.2
      } else if (finalDirection === 'vertical') {
        confidence += (verticalCount / totalEdges) * 0.2
      }
    }
    
    return Math.min(1, Math.max(0, confidence))
  }

  /**
   * 生成锚点位置建议
   */
  private generateAnchorSuggestions(
    direction: LayoutDirection,
    startNodes: ApprovalNodeConfig[],
    endNodes: ApprovalNodeConfig[],
    distribution: ReturnType<LayoutDetectionService['analyzeNodeDistribution']>
  ): { start: AnchorPosition[], end: AnchorPosition[] } {
    const startAnchors: AnchorPosition[] = []
    const endAnchors: AnchorPosition[] = []
    
    // 根据布局方向确定锚点位置
    const getAnchorType = (nodeType: 'start' | 'end'): ('top' | 'right' | 'bottom' | 'left')[] => {
      if (direction === 'horizontal') {
        return nodeType === 'start' ? ['right'] : ['left']
      } else if (direction === 'vertical') {
        return nodeType === 'start' ? ['bottom'] : ['top']
      } else {
        // mixed 或 unknown 情况下提供多个选项
        return nodeType === 'start' ? ['right', 'bottom'] : ['left', 'top']
      }
    }
    
    // 为开始节点生成锚点
    startNodes.forEach(node => {
      const anchorTypes = getAnchorType('start')
      anchorTypes.forEach(type => {
        const anchor = this.createAnchorPosition(node, type)
        if (anchor) {
          startAnchors.push(anchor)
        }
      })
    })
    
    // 为结束节点生成锚点
    endNodes.forEach(node => {
      const anchorTypes = getAnchorType('end')
      anchorTypes.forEach(type => {
        const anchor = this.createAnchorPosition(node, type)
        if (anchor) {
          endAnchors.push(anchor)
        }
      })
    })
    
    return { start: startAnchors, end: endAnchors }
  }

  /**
   * 创建单个锚点位置
   */
  private createAnchorPosition(
    node: ApprovalNodeConfig, 
    type: 'top' | 'right' | 'bottom' | 'left'
  ): AnchorPosition | null {
    if (!node.id) return null
    
    const radius = 30 // 假设节点半径为30
    let x = node.x
    let y = node.y
    
    switch (type) {
      case 'top':
        y -= radius
        break
      case 'right':
        x += radius
        break
      case 'bottom':
        y += radius
        break
      case 'left':
        x -= radius
        break
    }
    
    return {
      type,
      x,
      y,
      id: `${node.id}_${type}`
    }
  }

  /**
   * 获取推荐的节点间距
   */
  getRecommendedSpacing(direction: LayoutDirection): { horizontal: number, vertical: number } {
    switch (direction) {
      case 'horizontal':
        return { horizontal: 150, vertical: 100 }
      case 'vertical':
        return { horizontal: 100, vertical: 150 }
      default:
        return { horizontal: 120, vertical: 120 }
    }
  }

  /**
   * 获取布局优化建议
   */
  getLayoutSuggestions(analysis: LayoutAnalysis): string[] {
    const suggestions: string[] = []
    
    if (analysis.confidence < 0.6) {
      suggestions.push('建议手动调整节点位置以获得更清晰的布局')
    }
    
    if (analysis.direction === 'mixed') {
      suggestions.push('检测到混合布局，建议统一为横向或纵向布局')
    }
    
    if (analysis.startNodes.length === 0) {
      suggestions.push('建议添加开始节点来明确流程起点')
    }
    
    if (analysis.endNodes.length === 0) {
      suggestions.push('建议添加结束节点来明确流程终点')
    }
    
    if (analysis.direction === 'horizontal') {
      suggestions.push('检测到横向布局，建议开始节点使用右侧锚点，结束节点使用左侧锚点')
    } else if (analysis.direction === 'vertical') {
      suggestions.push('检测到纵向布局，建议开始节点使用下方锚点，结束节点使用上方锚点')
    }
    
    return suggestions
  }
}

// 导出单例实例
export const layoutDetectionService = new LayoutDetectionService()
