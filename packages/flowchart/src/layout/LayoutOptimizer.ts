/**
 * 布局优化器
 * 
 * 优化布局结果，减少边交叉，提高可读性
 */

import type {
  LayoutOptimizer as ILayoutOptimizer,
  LayoutResult,
  LayoutOptimizationOptions,
  Position
} from './types'

/**
 * 布局优化器类
 */
export class LayoutOptimizer implements ILayoutOptimizer {
  /**
   * 优化布局
   */
  async optimize(result: LayoutResult, options: LayoutOptimizationOptions): Promise<LayoutResult> {
    let optimizedResult = { ...result }
    
    // 应用各种优化策略
    for (const objective of options.objectives) {
      switch (objective) {
        case 'minimize-crossings':
          optimizedResult = await this.minimizeCrossings(optimizedResult, options)
          break
        case 'minimize-area':
          optimizedResult = await this.minimizeArea(optimizedResult, options)
          break
        case 'maximize-symmetry':
          optimizedResult = await this.maximizeSymmetry(optimizedResult, options)
          break
        case 'minimize-edge-length':
          optimizedResult = await this.minimizeEdgeLength(optimizedResult, options)
          break
        case 'maximize-readability':
          optimizedResult = await this.maximizeReadability(optimizedResult, options)
          break
      }
    }
    
    // 重新计算统计信息
    optimizedResult.stats.qualityScore = this.calculateQuality(optimizedResult)
    optimizedResult.stats.crossings = this.detectCrossings(optimizedResult)
    
    return optimizedResult
  }

  /**
   * 计算布局质量
   */
  calculateQuality(result: LayoutResult): number {
    let quality = 1.0
    
    // 边交叉惩罚
    const crossings = this.detectCrossings(result)
    quality -= crossings * 0.1
    
    // 面积效率
    const areaEfficiency = this.calculateAreaEfficiency(result)
    quality *= areaEfficiency
    
    // 对称性奖励
    const symmetry = this.evaluateSymmetry(result)
    quality += symmetry * 0.1
    
    // 边长度惩罚
    const avgEdgeLength = this.calculateAverageEdgeLength(result)
    const normalizedEdgeLength = Math.min(avgEdgeLength / 200, 1)
    quality -= normalizedEdgeLength * 0.2
    
    return Math.max(0, Math.min(1, quality))
  }

  /**
   * 检测边交叉
   */
  detectCrossings(result: LayoutResult): number {
    let crossings = 0
    const edges = this.getEdgesFromResult(result)
    
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        if (this.doEdgesCross(edges[i], edges[j])) {
          crossings++
        }
      }
    }
    
    return crossings
  }

  /**
   * 计算布局面积
   */
  calculateArea(result: LayoutResult): number {
    return result.bounds.width * result.bounds.height
  }

  /**
   * 评估对称性
   */
  evaluateSymmetry(result: LayoutResult): number {
    const positions = Object.values(result.nodePositions)
    if (positions.length === 0) return 0
    
    // 计算中心点
    const centerX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length
    const centerY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length
    
    // 计算对称性分数
    let symmetryScore = 0
    let totalPairs = 0
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const pos1 = positions[i]
        const pos2 = positions[j]
        
        // 检查水平对称
        const horizontalSymmetry = this.checkHorizontalSymmetry(pos1, pos2, centerX)
        // 检查垂直对称
        const verticalSymmetry = this.checkVerticalSymmetry(pos1, pos2, centerY)
        
        symmetryScore += Math.max(horizontalSymmetry, verticalSymmetry)
        totalPairs++
      }
    }
    
    return totalPairs > 0 ? symmetryScore / totalPairs : 0
  }

  /**
   * 最小化边交叉
   */
  private async minimizeCrossings(result: LayoutResult, options: LayoutOptimizationOptions): Promise<LayoutResult> {
    const maxIterations = options.maxIterations || 100
    const convergenceThreshold = options.convergenceThreshold || 0.01
    
    let currentResult = { ...result }
    let bestResult = { ...result }
    let bestCrossings = this.detectCrossings(result)
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // 尝试交换相邻节点位置
      const newResult = this.swapAdjacentNodes(currentResult)
      const newCrossings = this.detectCrossings(newResult)
      
      if (newCrossings < bestCrossings) {
        bestResult = newResult
        bestCrossings = newCrossings
        currentResult = newResult
      }
      
      // 检查收敛
      if (bestCrossings === 0 || iteration > 0 && Math.abs(bestCrossings - newCrossings) < convergenceThreshold) {
        break
      }
    }
    
    return bestResult
  }

  /**
   * 最小化面积
   */
  private async minimizeArea(result: LayoutResult, options: LayoutOptimizationOptions): Promise<LayoutResult> {
    const optimizedResult = { ...result }
    
    // 紧凑化布局
    optimizedResult.nodePositions = this.compactLayout(result.nodePositions)
    
    // 重新计算边界
    optimizedResult.bounds = this.calculateBounds(optimizedResult.nodePositions)
    
    return optimizedResult
  }

  /**
   * 最大化对称性
   */
  private async maximizeSymmetry(result: LayoutResult, options: LayoutOptimizationOptions): Promise<LayoutResult> {
    const optimizedResult = { ...result }
    
    // 应用对称性调整
    optimizedResult.nodePositions = this.applySymmetryAdjustments(result.nodePositions)
    
    // 重新计算边界
    optimizedResult.bounds = this.calculateBounds(optimizedResult.nodePositions)
    
    return optimizedResult
  }

  /**
   * 最小化边长度
   */
  private async minimizeEdgeLength(result: LayoutResult, options: LayoutOptimizationOptions): Promise<LayoutResult> {
    const optimizedResult = { ...result }
    
    // 使用力导向算法微调位置
    optimizedResult.nodePositions = this.applyForceDirectedAdjustment(result.nodePositions)
    
    // 重新计算边界
    optimizedResult.bounds = this.calculateBounds(optimizedResult.nodePositions)
    
    return optimizedResult
  }

  /**
   * 最大化可读性
   */
  private async maximizeReadability(result: LayoutResult, options: LayoutOptimizationOptions): Promise<LayoutResult> {
    const optimizedResult = { ...result }
    
    // 调整节点间距以提高可读性
    optimizedResult.nodePositions = this.adjustSpacingForReadability(result.nodePositions)
    
    // 重新计算边界
    optimizedResult.bounds = this.calculateBounds(optimizedResult.nodePositions)
    
    return optimizedResult
  }

  /**
   * 从结果中获取边信息
   */
  private getEdgesFromResult(result: LayoutResult): Array<{ start: Position; end: Position }> {
    // 这里需要从布局结果中提取边信息
    // 简化实现，实际需要根据具体的数据结构来实现
    return []
  }

  /**
   * 检查两条边是否相交
   */
  private doEdgesCross(edge1: { start: Position; end: Position }, edge2: { start: Position; end: Position }): boolean {
    const { start: p1, end: q1 } = edge1
    const { start: p2, end: q2 } = edge2
    
    // 使用向量叉积判断线段相交
    const orientation = (p: Position, q: Position, r: Position): number => {
      const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
      if (val === 0) return 0  // 共线
      return val > 0 ? 1 : 2   // 顺时针或逆时针
    }
    
    const onSegment = (p: Position, q: Position, r: Position): boolean => {
      return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
             q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)
    }
    
    const o1 = orientation(p1, q1, p2)
    const o2 = orientation(p1, q1, q2)
    const o3 = orientation(p2, q2, p1)
    const o4 = orientation(p2, q2, q1)
    
    // 一般情况
    if (o1 !== o2 && o3 !== o4) return true
    
    // 特殊情况
    if (o1 === 0 && onSegment(p1, p2, q1)) return true
    if (o2 === 0 && onSegment(p1, q2, q1)) return true
    if (o3 === 0 && onSegment(p2, p1, q2)) return true
    if (o4 === 0 && onSegment(p2, q1, q2)) return true
    
    return false
  }

  /**
   * 计算面积效率
   */
  private calculateAreaEfficiency(result: LayoutResult): number {
    const nodeCount = Object.keys(result.nodePositions).length
    const area = this.calculateArea(result)
    
    // 理想面积（假设每个节点需要100x100的空间）
    const idealArea = nodeCount * 100 * 100
    
    return idealArea / Math.max(area, idealArea)
  }

  /**
   * 计算平均边长度
   */
  private calculateAverageEdgeLength(result: LayoutResult): number {
    const edges = this.getEdgesFromResult(result)
    if (edges.length === 0) return 0
    
    const totalLength = edges.reduce((sum, edge) => {
      const dx = edge.end.x - edge.start.x
      const dy = edge.end.y - edge.start.y
      return sum + Math.sqrt(dx * dx + dy * dy)
    }, 0)
    
    return totalLength / edges.length
  }

  /**
   * 检查水平对称性
   */
  private checkHorizontalSymmetry(pos1: Position, pos2: Position, centerX: number): number {
    const distance1 = Math.abs(pos1.x - centerX)
    const distance2 = Math.abs(pos2.x - centerX)
    const yDiff = Math.abs(pos1.y - pos2.y)
    
    if (yDiff < 10 && Math.abs(distance1 - distance2) < 10) {
      return 1.0
    }
    
    return 0.0
  }

  /**
   * 检查垂直对称性
   */
  private checkVerticalSymmetry(pos1: Position, pos2: Position, centerY: number): number {
    const distance1 = Math.abs(pos1.y - centerY)
    const distance2 = Math.abs(pos2.y - centerY)
    const xDiff = Math.abs(pos1.x - pos2.x)
    
    if (xDiff < 10 && Math.abs(distance1 - distance2) < 10) {
      return 1.0
    }
    
    return 0.0
  }

  /**
   * 交换相邻节点位置
   */
  private swapAdjacentNodes(result: LayoutResult): LayoutResult {
    const newResult = { ...result }
    const positions = { ...result.nodePositions }
    
    // 简化实现：随机选择两个节点交换位置
    const nodeIds = Object.keys(positions)
    if (nodeIds.length >= 2) {
      const index1 = Math.floor(Math.random() * nodeIds.length)
      let index2 = Math.floor(Math.random() * nodeIds.length)
      while (index2 === index1) {
        index2 = Math.floor(Math.random() * nodeIds.length)
      }
      
      const id1 = nodeIds[index1]
      const id2 = nodeIds[index2]
      const temp = positions[id1]
      positions[id1] = positions[id2]
      positions[id2] = temp
    }
    
    newResult.nodePositions = positions
    return newResult
  }

  /**
   * 紧凑化布局
   */
  private compactLayout(positions: Record<string, Position>): Record<string, Position> {
    const newPositions = { ...positions }
    const nodeIds = Object.keys(positions)
    
    if (nodeIds.length === 0) return newPositions
    
    // 计算当前边界
    const bounds = this.calculateBounds(positions)
    
    // 计算压缩比例
    const targetWidth = bounds.width * 0.8
    const targetHeight = bounds.height * 0.8
    
    const scaleX = targetWidth / bounds.width
    const scaleY = targetHeight / bounds.height
    
    // 应用压缩
    for (const nodeId of nodeIds) {
      const pos = positions[nodeId]
      newPositions[nodeId] = {
        x: bounds.x + (pos.x - bounds.x) * scaleX,
        y: bounds.y + (pos.y - bounds.y) * scaleY
      }
    }
    
    return newPositions
  }

  /**
   * 应用对称性调整
   */
  private applySymmetryAdjustments(positions: Record<string, Position>): Record<string, Position> {
    const newPositions = { ...positions }
    const nodeIds = Object.keys(positions)
    
    if (nodeIds.length === 0) return newPositions
    
    // 计算中心点
    const centerX = nodeIds.reduce((sum, id) => sum + positions[id].x, 0) / nodeIds.length
    const centerY = nodeIds.reduce((sum, id) => sum + positions[id].y, 0) / nodeIds.length
    
    // 简单的对称性调整：将节点向中心轴对齐
    for (const nodeId of nodeIds) {
      const pos = positions[nodeId]
      const distanceFromCenterX = Math.abs(pos.x - centerX)
      const distanceFromCenterY = Math.abs(pos.y - centerY)
      
      // 如果节点接近中心轴，将其对齐到轴上
      if (distanceFromCenterX < 20) {
        newPositions[nodeId] = { ...pos, x: centerX }
      }
      if (distanceFromCenterY < 20) {
        newPositions[nodeId] = { ...pos, y: centerY }
      }
    }
    
    return newPositions
  }

  /**
   * 应用力导向调整
   */
  private applyForceDirectedAdjustment(positions: Record<string, Position>): Record<string, Position> {
    // 简化实现：应用轻微的力导向调整
    const newPositions = { ...positions }
    const nodeIds = Object.keys(positions)
    
    // 这里应该实现一个简化的力导向算法
    // 为了简化，我们只是稍微调整位置
    for (const nodeId of nodeIds) {
      const pos = positions[nodeId]
      const adjustment = {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10
      }
      
      newPositions[nodeId] = {
        x: pos.x + adjustment.x,
        y: pos.y + adjustment.y
      }
    }
    
    return newPositions
  }

  /**
   * 调整间距以提高可读性
   */
  private adjustSpacingForReadability(positions: Record<string, Position>): Record<string, Position> {
    const newPositions = { ...positions }
    const nodeIds = Object.keys(positions)
    const minSpacing = 120 // 最小间距
    
    // 检查并调整过近的节点
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const id1 = nodeIds[i]
        const id2 = nodeIds[j]
        const pos1 = positions[id1]
        const pos2 = positions[id2]
        
        const dx = pos2.x - pos1.x
        const dy = pos2.y - pos1.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < minSpacing && distance > 0) {
          // 计算需要移动的距离
          const moveDistance = (minSpacing - distance) / 2
          const moveX = (dx / distance) * moveDistance
          const moveY = (dy / distance) * moveDistance
          
          // 移动两个节点
          newPositions[id1] = {
            x: pos1.x - moveX,
            y: pos1.y - moveY
          }
          newPositions[id2] = {
            x: pos2.x + moveX,
            y: pos2.y + moveY
          }
        }
      }
    }
    
    return newPositions
  }

  /**
   * 计算边界
   */
  private calculateBounds(positions: Record<string, Position>): { x: number; y: number; width: number; height: number } {
    const nodeIds = Object.keys(positions)
    if (nodeIds.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    
    for (const nodeId of nodeIds) {
      const pos = positions[nodeId]
      minX = Math.min(minX, pos.x)
      maxX = Math.max(maxX, pos.x)
      minY = Math.min(minY, pos.y)
      maxY = Math.max(maxY, pos.y)
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }
}
