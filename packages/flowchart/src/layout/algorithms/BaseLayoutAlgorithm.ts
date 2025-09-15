/**
 * 布局算法基类
 * 
 * 为所有布局算法提供通用功能和接口实现
 */

import type {
  LayoutAlgorithmInterface,
  LayoutAlgorithm,
  LayoutConfig,
  LayoutResult,
  Position,
  Size
} from '../types'
import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../../types'

/**
 * 布局算法基类
 */
export abstract class BaseLayoutAlgorithm implements LayoutAlgorithmInterface {
  abstract readonly name: LayoutAlgorithm
  abstract readonly description: string

  /**
   * 执行布局
   */
  async layout(data: FlowchartData, config: LayoutConfig): Promise<LayoutResult> {
    const startTime = Date.now()
    
    try {
      // 验证输入
      this.validateInput(data, config)
      
      // 预处理数据
      const processedData = this.preprocessData(data, config)
      
      // 执行具体的布局算法
      const nodePositions = await this.executeLayout(processedData, config)
      
      // 后处理
      const finalPositions = this.postprocessPositions(nodePositions, config)
      
      // 计算边界
      const bounds = this.calculateBounds(finalPositions)
      
      // 生成边路径（如果需要）
      const edgePaths = this.generateEdgePaths(finalPositions, data.edges, config)
      
      const duration = Date.now() - startTime
      
      return {
        nodePositions: finalPositions,
        edgePaths,
        bounds,
        stats: {
          duration,
          iterations: 0,
          qualityScore: 0,
          crossings: 0
        },
        config
      }
    } catch (error) {
      throw new Error(`布局算法 ${this.name} 执行失败: ${error}`)
    }
  }

  /**
   * 验证配置
   */
  validateConfig(config: LayoutConfig): boolean {
    // 基础验证
    if (!config.algorithm) {
      return false
    }
    
    if (config.algorithm !== this.name) {
      return false
    }
    
    // 委托给子类进行具体验证
    return this.validateSpecificConfig(config)
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<LayoutConfig> {
    return {
      algorithm: this.name,
      direction: 'TB',
      nodeSpacing: {
        horizontal: 100,
        vertical: 80
      },
      animated: true,
      animationDuration: 1000,
      preservePositions: false
    }
  }

  /**
   * 是否支持动画
   */
  supportsAnimation(): boolean {
    return true
  }

  /**
   * 是否支持约束
   */
  supportsConstraints(): boolean {
    return false
  }

  /**
   * 执行具体的布局算法（子类实现）
   */
  protected abstract executeLayout(data: FlowchartData, config: LayoutConfig): Promise<Record<string, Position>>

  /**
   * 验证特定配置（子类可重写）
   */
  protected validateSpecificConfig(config: LayoutConfig): boolean {
    return true
  }

  /**
   * 验证输入数据
   */
  protected validateInput(data: FlowchartData, config: LayoutConfig): void {
    if (!data) {
      throw new Error('数据不能为空')
    }
    
    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('节点数据无效')
    }
    
    if (!data.edges || !Array.isArray(data.edges)) {
      throw new Error('边数据无效')
    }
    
    if (!this.validateConfig(config)) {
      throw new Error('配置无效')
    }
  }

  /**
   * 预处理数据
   */
  protected preprocessData(data: FlowchartData, config: LayoutConfig): FlowchartData {
    // 过滤无效数据
    const validNodes = data.nodes.filter(node => node && node.id)
    const validEdges = data.edges.filter(edge => 
      edge && edge.id && edge.sourceNodeId && edge.targetNodeId &&
      validNodes.some(n => n.id === edge.sourceNodeId) &&
      validNodes.some(n => n.id === edge.targetNodeId)
    )
    
    return {
      nodes: validNodes,
      edges: validEdges
    }
  }

  /**
   * 后处理位置
   */
  protected postprocessPositions(positions: Record<string, Position>, config: LayoutConfig): Record<string, Position> {
    // 确保所有位置都是有效的数字
    const processedPositions: Record<string, Position> = {}
    
    for (const [nodeId, position] of Object.entries(positions)) {
      processedPositions[nodeId] = {
        x: Number(position.x) || 0,
        y: Number(position.y) || 0
      }
    }
    
    // 应用偏移，确保所有坐标都是正数
    return this.normalizePositions(processedPositions)
  }

  /**
   * 标准化位置（确保所有坐标为正数）
   */
  protected normalizePositions(positions: Record<string, Position>): Record<string, Position> {
    const nodeIds = Object.keys(positions)
    if (nodeIds.length === 0) return positions
    
    // 找到最小坐标
    let minX = Infinity
    let minY = Infinity
    
    for (const position of Object.values(positions)) {
      minX = Math.min(minX, position.x)
      minY = Math.min(minY, position.y)
    }
    
    // 添加边距
    const margin = 50
    const offsetX = Math.max(0, margin - minX)
    const offsetY = Math.max(0, margin - minY)
    
    // 应用偏移
    const normalizedPositions: Record<string, Position> = {}
    for (const [nodeId, position] of Object.entries(positions)) {
      normalizedPositions[nodeId] = {
        x: position.x + offsetX,
        y: position.y + offsetY
      }
    }
    
    return normalizedPositions
  }

  /**
   * 计算边界
   */
  protected calculateBounds(positions: Record<string, Position>): { x: number; y: number; width: number; height: number } {
    const nodeIds = Object.keys(positions)
    if (nodeIds.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    
    for (const position of Object.values(positions)) {
      minX = Math.min(minX, position.x)
      maxX = Math.max(maxX, position.x)
      minY = Math.min(minY, position.y)
      maxY = Math.max(maxY, position.y)
    }
    
    // 添加节点尺寸的估算
    const nodeWidth = 100
    const nodeHeight = 60
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX + nodeWidth,
      height: maxY - minY + nodeHeight
    }
  }

  /**
   * 生成边路径
   */
  protected generateEdgePaths(
    positions: Record<string, Position>,
    edges: FlowchartEdge[],
    config: LayoutConfig
  ): Record<string, Position[]> {
    const edgePaths: Record<string, Position[]> = {}
    
    for (const edge of edges) {
      const sourcePos = positions[edge.sourceNodeId]
      const targetPos = positions[edge.targetNodeId]
      
      if (sourcePos && targetPos) {
        // 简单的直线路径
        edgePaths[edge.id] = [sourcePos, targetPos]
      }
    }
    
    return edgePaths
  }

  /**
   * 获取节点的默认尺寸
   */
  protected getNodeSize(node: FlowchartNode): Size {
    // 根据节点类型返回不同的尺寸
    const nodeType = (node as any).type
    
    switch (nodeType) {
      case 'start':
      case 'end':
        return { width: 80, height: 80 }
      case 'condition':
        return { width: 120, height: 80 }
      case 'process':
      case 'approval':
        return { width: 140, height: 60 }
      default:
        return { width: 100, height: 60 }
    }
  }

  /**
   * 构建邻接表
   */
  protected buildAdjacencyList(nodes: FlowchartNode[], edges: FlowchartEdge[]): Map<string, string[]> {
    const adjacencyList = new Map<string, string[]>()
    
    // 初始化所有节点
    for (const node of nodes) {
      adjacencyList.set(node.id, [])
    }
    
    // 添加边
    for (const edge of edges) {
      const sourceList = adjacencyList.get(edge.sourceNodeId) || []
      sourceList.push(edge.targetNodeId)
      adjacencyList.set(edge.sourceNodeId, sourceList)
    }
    
    return adjacencyList
  }

  /**
   * 构建反向邻接表
   */
  protected buildReverseAdjacencyList(nodes: FlowchartNode[], edges: FlowchartEdge[]): Map<string, string[]> {
    const reverseAdjacencyList = new Map<string, string[]>()
    
    // 初始化所有节点
    for (const node of nodes) {
      reverseAdjacencyList.set(node.id, [])
    }
    
    // 添加反向边
    for (const edge of edges) {
      const targetList = reverseAdjacencyList.get(edge.targetNodeId) || []
      targetList.push(edge.sourceNodeId)
      reverseAdjacencyList.set(edge.targetNodeId, targetList)
    }
    
    return reverseAdjacencyList
  }

  /**
   * 查找根节点（入度为0的节点）
   */
  protected findRootNodes(nodes: FlowchartNode[], edges: FlowchartEdge[]): FlowchartNode[] {
    const inDegree = new Map<string, number>()
    
    // 初始化入度
    for (const node of nodes) {
      inDegree.set(node.id, 0)
    }
    
    // 计算入度
    for (const edge of edges) {
      const currentInDegree = inDegree.get(edge.targetNodeId) || 0
      inDegree.set(edge.targetNodeId, currentInDegree + 1)
    }
    
    // 返回入度为0的节点
    return nodes.filter(node => inDegree.get(node.id) === 0)
  }

  /**
   * 拓扑排序
   */
  protected topologicalSort(nodes: FlowchartNode[], edges: FlowchartEdge[]): FlowchartNode[] {
    const inDegree = new Map<string, number>()
    const adjacencyList = this.buildAdjacencyList(nodes, edges)
    
    // 初始化入度
    for (const node of nodes) {
      inDegree.set(node.id, 0)
    }
    
    // 计算入度
    for (const edge of edges) {
      const currentInDegree = inDegree.get(edge.targetNodeId) || 0
      inDegree.set(edge.targetNodeId, currentInDegree + 1)
    }
    
    // 队列初始化
    const queue: FlowchartNode[] = []
    const result: FlowchartNode[] = []
    
    for (const node of nodes) {
      if (inDegree.get(node.id) === 0) {
        queue.push(node)
      }
    }
    
    // 拓扑排序
    while (queue.length > 0) {
      const current = queue.shift()!
      result.push(current)
      
      const neighbors = adjacencyList.get(current.id) || []
      for (const neighborId of neighbors) {
        const newInDegree = (inDegree.get(neighborId) || 0) - 1
        inDegree.set(neighborId, newInDegree)
        
        if (newInDegree === 0) {
          const neighborNode = nodes.find(n => n.id === neighborId)
          if (neighborNode) {
            queue.push(neighborNode)
          }
        }
      }
    }
    
    return result
  }
}
