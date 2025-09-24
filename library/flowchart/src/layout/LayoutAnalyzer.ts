/**
 * 布局分析器
 * 
 * 分析流程图结构特征，为布局算法选择提供依据
 */

import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../types'
import type { LayoutDirection } from './types'

/**
 * 流程图分析结果
 */
export interface FlowchartAnalysis {
  /** 节点数量 */
  nodeCount: number
  /** 边数量 */
  edgeCount: number
  /** 是否为层次结构 */
  isHierarchical: boolean
  /** 是否为树形结构 */
  isTree: boolean
  /** 是否有循环 */
  hasCycles: boolean
  /** 是否有循环模式 */
  hasCircularPattern: boolean
  /** 最大深度 */
  maxDepth: number
  /** 平均分支因子 */
  averageBranching: number
  /** 连通分量数量 */
  connectedComponents: number
  /** 建议的布局方向 */
  preferredDirection?: LayoutDirection
  /** 复杂度评分 */
  complexityScore: number
  /** 节点类型分布 */
  nodeTypeDistribution: Record<string, number>
  /** 拓扑特征 */
  topologyFeatures: TopologyFeatures
}

/**
 * 拓扑特征
 */
export interface TopologyFeatures {
  /** 入度分布 */
  inDegreeDistribution: number[]
  /** 出度分布 */
  outDegreeDistribution: number[]
  /** 最长路径长度 */
  longestPath: number
  /** 宽度（最大层级节点数） */
  maxWidth: number
  /** 是否为DAG（有向无环图） */
  isDAG: boolean
  /** 强连通分量 */
  stronglyConnectedComponents: string[][]
  /** 关键路径 */
  criticalPaths: string[][]
}

/**
 * 布局分析器类
 */
export class LayoutAnalyzer {
  /**
   * 分析流程图
   */
  analyzeFlowchart(data: FlowchartData): FlowchartAnalysis {
    const nodes = data.nodes
    const edges = data.edges
    
    // 构建邻接表
    const adjacencyList = this.buildAdjacencyList(nodes, edges)
    const reverseAdjacencyList = this.buildReverseAdjacencyList(nodes, edges)
    
    // 基础统计
    const nodeCount = nodes.length
    const edgeCount = edges.length
    
    // 拓扑分析
    const topologyFeatures = this.analyzeTopology(nodes, edges, adjacencyList, reverseAdjacencyList)
    
    // 结构特征分析
    const isTree = this.isTreeStructure(nodes, edges, adjacencyList)
    const isHierarchical = this.isHierarchicalStructure(nodes, edges, adjacencyList)
    const hasCycles = !topologyFeatures.isDAG
    const hasCircularPattern = this.hasCircularPattern(nodes, edges, adjacencyList)
    
    // 深度和分支分析
    const maxDepth = this.calculateMaxDepth(nodes, adjacencyList)
    const averageBranching = this.calculateAverageBranching(adjacencyList)
    
    // 连通性分析
    const connectedComponents = this.countConnectedComponents(nodes, adjacencyList)
    
    // 方向建议
    const preferredDirection = this.suggestDirection(nodes, edges, topologyFeatures)
    
    // 复杂度评分
    const complexityScore = this.calculateComplexityScore(nodeCount, edgeCount, topologyFeatures)
    
    // 节点类型分布
    const nodeTypeDistribution = this.analyzeNodeTypeDistribution(nodes)
    
    return {
      nodeCount,
      edgeCount,
      isHierarchical,
      isTree,
      hasCycles,
      hasCircularPattern,
      maxDepth,
      averageBranching,
      connectedComponents,
      preferredDirection,
      complexityScore,
      nodeTypeDistribution,
      topologyFeatures
    }
  }

  /**
   * 构建邻接表
   */
  private buildAdjacencyList(nodes: FlowchartNode[], edges: FlowchartEdge[]): Map<string, string[]> {
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
  private buildReverseAdjacencyList(nodes: FlowchartNode[], edges: FlowchartEdge[]): Map<string, string[]> {
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
   * 分析拓扑特征
   */
  private analyzeTopology(
    nodes: FlowchartNode[],
    edges: FlowchartEdge[],
    adjacencyList: Map<string, string[]>,
    reverseAdjacencyList: Map<string, string[]>
  ): TopologyFeatures {
    // 计算度分布
    const inDegreeDistribution: number[] = []
    const outDegreeDistribution: number[] = []
    
    for (const node of nodes) {
      const inDegree = reverseAdjacencyList.get(node.id)?.length || 0
      const outDegree = adjacencyList.get(node.id)?.length || 0
      
      inDegreeDistribution.push(inDegree)
      outDegreeDistribution.push(outDegree)
    }
    
    // 检测是否为DAG
    const isDAG = this.isDirectedAcyclicGraph(nodes, adjacencyList)
    
    // 计算最长路径
    const longestPath = this.calculateLongestPath(nodes, adjacencyList)
    
    // 计算最大宽度
    const maxWidth = this.calculateMaxWidth(nodes, adjacencyList)
    
    // 强连通分量
    const stronglyConnectedComponents = this.findStronglyConnectedComponents(nodes, adjacencyList)
    
    // 关键路径
    const criticalPaths = this.findCriticalPaths(nodes, adjacencyList)
    
    return {
      inDegreeDistribution,
      outDegreeDistribution,
      longestPath,
      maxWidth,
      isDAG,
      stronglyConnectedComponents,
      criticalPaths
    }
  }

  /**
   * 检查是否为树形结构
   */
  private isTreeStructure(nodes: FlowchartNode[], edges: FlowchartEdge[], adjacencyList: Map<string, string[]>): boolean {
    // 树的特征：n个节点，n-1条边，连通，无环
    if (edges.length !== nodes.length - 1) {
      return false
    }
    
    // 检查是否连通
    if (this.countConnectedComponents(nodes, adjacencyList) !== 1) {
      return false
    }
    
    // 检查是否无环
    return this.isDirectedAcyclicGraph(nodes, adjacencyList)
  }

  /**
   * 检查是否为层次结构
   */
  private isHierarchicalStructure(nodes: FlowchartNode[], edges: FlowchartEdge[], adjacencyList: Map<string, string[]>): boolean {
    // 层次结构特征：有明确的层级，每个节点只有一个父节点（除根节点）
    const inDegreeCount = new Map<string, number>()
    
    for (const node of nodes) {
      inDegreeCount.set(node.id, 0)
    }
    
    for (const edge of edges) {
      const currentCount = inDegreeCount.get(edge.targetNodeId) || 0
      inDegreeCount.set(edge.targetNodeId, currentCount + 1)
    }
    
    // 检查是否只有一个根节点（入度为0）
    let rootCount = 0
    for (const [nodeId, inDegree] of inDegreeCount.entries()) {
      if (inDegree === 0) {
        rootCount++
      } else if (inDegree > 1) {
        // 如果有节点的入度大于1，可能不是严格的层次结构
        // 但在流程图中，这种情况也可以用层次布局
        continue
      }
    }
    
    // 至少要有一个根节点，且是DAG
    return rootCount >= 1 && this.isDirectedAcyclicGraph(nodes, adjacencyList)
  }

  /**
   * 检查是否有循环模式
   */
  private hasCircularPattern(nodes: FlowchartNode[], edges: FlowchartEdge[], adjacencyList: Map<string, string[]>): boolean {
    // 简单检测：如果有环且节点数量不多，可能适合圆形布局
    if (nodes.length > 20) {
      return false
    }
    
    return !this.isDirectedAcyclicGraph(nodes, adjacencyList)
  }

  /**
   * 检查是否为有向无环图
   */
  private isDirectedAcyclicGraph(nodes: FlowchartNode[], adjacencyList: Map<string, string[]>): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    
    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)
      
      const neighbors = adjacencyList.get(nodeId) || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true
          }
        } else if (recursionStack.has(neighbor)) {
          return true
        }
      }
      
      recursionStack.delete(nodeId)
      return false
    }
    
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          return false
        }
      }
    }
    
    return true
  }

  /**
   * 计算最大深度
   */
  private calculateMaxDepth(nodes: FlowchartNode[], adjacencyList: Map<string, string[]>): number {
    const depths = new Map<string, number>()
    
    // 找到根节点（入度为0的节点）
    const inDegree = new Map<string, number>()
    for (const node of nodes) {
      inDegree.set(node.id, 0)
    }
    
    for (const [nodeId, neighbors] of adjacencyList.entries()) {
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1)
      }
    }
    
    const roots = nodes.filter(node => inDegree.get(node.id) === 0)
    
    let maxDepth = 0
    
    const dfs = (nodeId: string, depth: number): void => {
      depths.set(nodeId, Math.max(depths.get(nodeId) || 0, depth))
      maxDepth = Math.max(maxDepth, depth)
      
      const neighbors = adjacencyList.get(nodeId) || []
      for (const neighbor of neighbors) {
        dfs(neighbor, depth + 1)
      }
    }
    
    for (const root of roots) {
      dfs(root.id, 0)
    }
    
    return maxDepth
  }

  /**
   * 计算平均分支因子
   */
  private calculateAverageBranching(adjacencyList: Map<string, string[]>): number {
    let totalBranching = 0
    let nodeCount = 0
    
    for (const [nodeId, neighbors] of adjacencyList.entries()) {
      totalBranching += neighbors.length
      nodeCount++
    }
    
    return nodeCount > 0 ? totalBranching / nodeCount : 0
  }

  /**
   * 计算连通分量数量
   */
  private countConnectedComponents(nodes: FlowchartNode[], adjacencyList: Map<string, string[]>): number {
    const visited = new Set<string>()
    let componentCount = 0
    
    const dfs = (nodeId: string): void => {
      visited.add(nodeId)
      const neighbors = adjacencyList.get(nodeId) || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor)
        }
      }
    }
    
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id)
        componentCount++
      }
    }
    
    return componentCount
  }

  /**
   * 建议布局方向
   */
  private suggestDirection(nodes: FlowchartNode[], edges: FlowchartEdge[], topology: TopologyFeatures): LayoutDirection {
    // 基于拓扑特征建议方向
    if (topology.longestPath > topology.maxWidth) {
      // 如果深度大于宽度，建议垂直布局
      return 'TB'
    } else {
      // 如果宽度大于深度，建议水平布局
      return 'LR'
    }
  }

  /**
   * 计算复杂度评分
   */
  private calculateComplexityScore(nodeCount: number, edgeCount: number, topology: TopologyFeatures): number {
    // 基于多个因素计算复杂度
    let score = 0
    
    // 节点数量因子
    score += Math.min(nodeCount / 50, 1) * 0.3
    
    // 边密度因子
    const maxEdges = nodeCount * (nodeCount - 1)
    const edgeDensity = maxEdges > 0 ? edgeCount / maxEdges : 0
    score += edgeDensity * 0.3
    
    // 深度因子
    score += Math.min(topology.longestPath / 10, 1) * 0.2
    
    // 分支因子
    const avgOutDegree = topology.outDegreeDistribution.reduce((sum, degree) => sum + degree, 0) / topology.outDegreeDistribution.length
    score += Math.min(avgOutDegree / 5, 1) * 0.2
    
    return Math.min(score, 1)
  }

  /**
   * 分析节点类型分布
   */
  private analyzeNodeTypeDistribution(nodes: FlowchartNode[]): Record<string, number> {
    const distribution: Record<string, number> = {}
    
    for (const node of nodes) {
      const type = (node as any).type || 'unknown'
      distribution[type] = (distribution[type] || 0) + 1
    }
    
    return distribution
  }

  /**
   * 计算最长路径
   */
  private calculateLongestPath(nodes: FlowchartNode[], adjacencyList: Map<string, string[]>): number {
    // 使用拓扑排序计算最长路径
    const inDegree = new Map<string, number>()
    const distances = new Map<string, number>()
    
    // 初始化
    for (const node of nodes) {
      inDegree.set(node.id, 0)
      distances.set(node.id, 0)
    }
    
    // 计算入度
    for (const [nodeId, neighbors] of adjacencyList.entries()) {
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1)
      }
    }
    
    // 拓扑排序
    const queue: string[] = []
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(nodeId)
      }
    }
    
    let maxDistance = 0
    
    while (queue.length > 0) {
      const current = queue.shift()!
      const currentDistance = distances.get(current) || 0
      
      const neighbors = adjacencyList.get(current) || []
      for (const neighbor of neighbors) {
        distances.set(neighbor, Math.max(distances.get(neighbor) || 0, currentDistance + 1))
        maxDistance = Math.max(maxDistance, distances.get(neighbor) || 0)
        
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1)
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor)
        }
      }
    }
    
    return maxDistance
  }

  /**
   * 计算最大宽度
   */
  private calculateMaxWidth(nodes: FlowchartNode[], adjacencyList: Map<string, string[]>): number {
    // 计算每一层的节点数量
    const levels = new Map<number, number>()
    const nodeLevel = new Map<string, number>()
    
    // 使用BFS计算层级
    const inDegree = new Map<string, number>()
    for (const node of nodes) {
      inDegree.set(node.id, 0)
    }
    
    for (const [nodeId, neighbors] of adjacencyList.entries()) {
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1)
      }
    }
    
    const queue: { nodeId: string; level: number }[] = []
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push({ nodeId, level: 0 })
        nodeLevel.set(nodeId, 0)
      }
    }
    
    while (queue.length > 0) {
      const { nodeId, level } = queue.shift()!
      levels.set(level, (levels.get(level) || 0) + 1)
      
      const neighbors = adjacencyList.get(nodeId) || []
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1)
        if (inDegree.get(neighbor) === 0) {
          const neighborLevel = level + 1
          nodeLevel.set(neighbor, neighborLevel)
          queue.push({ nodeId: neighbor, level: neighborLevel })
        }
      }
    }
    
    return Math.max(...Array.from(levels.values()), 0)
  }

  /**
   * 查找强连通分量
   */
  private findStronglyConnectedComponents(nodes: FlowchartNode[], adjacencyList: Map<string, string[]>): string[][] {
    // 简化实现，实际应该使用Tarjan算法
    return []
  }

  /**
   * 查找关键路径
   */
  private findCriticalPaths(nodes: FlowchartNode[], adjacencyList: Map<string, string[]>): string[][] {
    // 简化实现，实际应该计算关键路径
    return []
  }
}
