/**
 * 边渲染优化服务
 * 
 * 提供连线的最优路径计算，避免重叠和交叉，提升视觉效果
 */

export interface Point {
  x: number
  y: number
}

export interface NodeBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface EdgePathConfig {
  pathType: 'straight' | 'orthogonal' | 'curved' | 'auto'
  avoidOverlap: boolean
  minDistance: number
  cornerRadius: number
  smoothness: number
}

export class EdgeRenderOptimizer {
  private defaultConfig: EdgePathConfig = {
    pathType: 'auto',
    avoidOverlap: true,
    minDistance: 20,
    cornerRadius: 8,
    smoothness: 0.3
  }

  /**
   * 计算最优连线路径
   */
  calculateOptimalPath(
    sourceNode: NodeBounds,
    targetNode: NodeBounds,
    pathType: string = 'auto',
    config?: Partial<EdgePathConfig>
  ): Point[] {
    const fullConfig = { ...this.defaultConfig, pathType, ...config }
    
    // 计算节点的连接点
    const sourcePoint = this.getOptimalConnectionPoint(sourceNode, targetNode, 'source')
    const targetPoint = this.getOptimalConnectionPoint(targetNode, sourceNode, 'target')
    
    // 根据路径类型生成路径
    switch (fullConfig.pathType) {
      case 'straight':
        return this.generateStraightPath(sourcePoint, targetPoint)
      case 'orthogonal':
        return this.generateOrthogonalPath(sourcePoint, targetPoint, sourceNode, targetNode, fullConfig)
      case 'curved':
        return this.generateCurvedPath(sourcePoint, targetPoint, fullConfig)
      case 'auto':
      default:
        return this.generateAutoPath(sourcePoint, targetPoint, sourceNode, targetNode, fullConfig)
    }
  }

  /**
   * 获取最优连接点
   */
  private getOptimalConnectionPoint(
    node: NodeBounds,
    otherNode: NodeBounds,
    role: 'source' | 'target'
  ): Point {
    const centerX = node.x
    const centerY = node.y
    const halfWidth = node.width / 2
    const halfHeight = node.height / 2
    
    const otherCenterX = otherNode.x
    const otherCenterY = otherNode.y
    
    // 计算方向向量
    const dx = otherCenterX - centerX
    const dy = otherCenterY - centerY
    
    // 计算与节点边界的交点
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    
    let connectionX = centerX
    let connectionY = centerY
    
    if (absX / halfWidth > absY / halfHeight) {
      // 水平连接
      connectionX = centerX + (dx > 0 ? halfWidth : -halfWidth)
      connectionY = centerY + (dy / absX) * halfWidth
    } else {
      // 垂直连接
      connectionX = centerX + (dx / absY) * halfHeight
      connectionY = centerY + (dy > 0 ? halfHeight : -halfHeight)
    }
    
    return { x: connectionX, y: connectionY }
  }

  /**
   * 生成直线路径
   */
  private generateStraightPath(source: Point, target: Point): Point[] {
    return [source, target]
  }

  /**
   * 生成正交路径（直角连线）
   */
  private generateOrthogonalPath(
    source: Point,
    target: Point,
    sourceNode: NodeBounds,
    targetNode: NodeBounds,
    config: EdgePathConfig
  ): Point[] {
    const points: Point[] = [source]
    
    const dx = target.x - source.x
    const dy = target.y - source.y
    
    // 判断主要方向
    if (Math.abs(dx) > Math.abs(dy)) {
      // 主要是水平方向
      const midX = source.x + dx * 0.5
      
      // 检查是否需要绕过节点
      if (this.isPathBlocked(source, { x: midX, y: source.y }, sourceNode, targetNode)) {
        // 绕过节点
        const offsetY = dy > 0 ? config.minDistance : -config.minDistance
        points.push({ x: source.x + config.minDistance, y: source.y })
        points.push({ x: source.x + config.minDistance, y: source.y + offsetY })
        points.push({ x: target.x - config.minDistance, y: source.y + offsetY })
        points.push({ x: target.x - config.minDistance, y: target.y })
      } else {
        // 标准L型路径
        points.push({ x: midX, y: source.y })
        points.push({ x: midX, y: target.y })
      }
    } else {
      // 主要是垂直方向
      const midY = source.y + dy * 0.5
      
      // 检查是否需要绕过节点
      if (this.isPathBlocked(source, { x: source.x, y: midY }, sourceNode, targetNode)) {
        // 绕过节点
        const offsetX = dx > 0 ? config.minDistance : -config.minDistance
        points.push({ x: source.x, y: source.y + config.minDistance })
        points.push({ x: source.x + offsetX, y: source.y + config.minDistance })
        points.push({ x: source.x + offsetX, y: target.y - config.minDistance })
        points.push({ x: target.x, y: target.y - config.minDistance })
      } else {
        // 标准L型路径
        points.push({ x: source.x, y: midY })
        points.push({ x: target.x, y: midY })
      }
    }
    
    points.push(target)
    return points
  }

  /**
   * 生成曲线路径
   */
  private generateCurvedPath(source: Point, target: Point, config: EdgePathConfig): Point[] {
    const dx = target.x - source.x
    const dy = target.y - source.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // 计算控制点
    const controlOffset = distance * config.smoothness
    const midX = source.x + dx * 0.5
    const midY = source.y + dy * 0.5
    
    // 垂直于连线方向的偏移
    const perpX = -dy / distance * controlOffset
    const perpY = dx / distance * controlOffset
    
    return [
      source,
      { x: source.x + dx * 0.25 + perpX, y: source.y + dy * 0.25 + perpY },
      { x: source.x + dx * 0.75 - perpX, y: source.y + dy * 0.75 - perpY },
      target
    ]
  }

  /**
   * 生成自动路径（智能选择最佳路径类型）
   */
  private generateAutoPath(
    source: Point,
    target: Point,
    sourceNode: NodeBounds,
    targetNode: NodeBounds,
    config: EdgePathConfig
  ): Point[] {
    const dx = Math.abs(target.x - source.x)
    const dy = Math.abs(target.y - source.y)
    
    // 如果距离很近，使用直线
    if (dx < 50 && dy < 50) {
      return this.generateStraightPath(source, target)
    }
    
    // 如果主要是水平或垂直方向，使用正交路径
    if (dx > dy * 2 || dy > dx * 2) {
      return this.generateOrthogonalPath(source, target, sourceNode, targetNode, config)
    }
    
    // 其他情况使用曲线路径
    return this.generateCurvedPath(source, target, config)
  }

  /**
   * 检查路径是否被节点阻挡
   */
  private isPathBlocked(
    start: Point,
    end: Point,
    sourceNode: NodeBounds,
    targetNode: NodeBounds
  ): boolean {
    // 简化的碰撞检测，实际应用中可以更复杂
    const lineRect = {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y)
    }
    
    // 检查是否与源节点或目标节点重叠（除了连接点）
    return this.isRectangleOverlapping(lineRect, sourceNode) || 
           this.isRectangleOverlapping(lineRect, targetNode)
  }

  /**
   * 检查两个矩形是否重叠
   */
  private isRectangleOverlapping(
    rect1: { x: number, y: number, width: number, height: number },
    rect2: { x: number, y: number, width: number, height: number }
  ): boolean {
    const r1 = {
      left: rect1.x - rect1.width / 2,
      right: rect1.x + rect1.width / 2,
      top: rect1.y - rect1.height / 2,
      bottom: rect1.y + rect1.height / 2
    }
    
    const r2 = {
      left: rect2.x - rect2.width / 2,
      right: rect2.x + rect2.width / 2,
      top: rect2.y - rect2.height / 2,
      bottom: rect2.y + rect2.height / 2
    }
    
    return !(r1.right < r2.left || r2.right < r1.left || r1.bottom < r2.top || r2.bottom < r1.top)
  }

  /**
   * 优化连线文本位置
   */
  optimizeTextPosition(points: Point[], text: string): Point {
    if (points.length < 2) {
      return points[0] || { x: 0, y: 0 }
    }
    
    // 找到路径的中点
    const totalLength = this.calculatePathLength(points)
    const targetLength = totalLength / 2
    
    let currentLength = 0
    for (let i = 0; i < points.length - 1; i++) {
      const segmentLength = this.calculateDistance(points[i], points[i + 1])
      
      if (currentLength + segmentLength >= targetLength) {
        // 在这个线段上找到中点
        const ratio = (targetLength - currentLength) / segmentLength
        return {
          x: points[i].x + (points[i + 1].x - points[i].x) * ratio,
          y: points[i].y + (points[i + 1].y - points[i].y) * ratio - 10 // 稍微向上偏移
        }
      }
      
      currentLength += segmentLength
    }
    
    // 如果没找到，返回最后一个点
    return points[points.length - 1]
  }

  /**
   * 计算路径总长度
   */
  private calculatePathLength(points: Point[]): number {
    let length = 0
    for (let i = 0; i < points.length - 1; i++) {
      length += this.calculateDistance(points[i], points[i + 1])
    }
    return length
  }

  /**
   * 计算两点间距离
   */
  private calculateDistance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
  }
}

// 导出单例实例
export const edgeRenderOptimizer = new EdgeRenderOptimizer()
