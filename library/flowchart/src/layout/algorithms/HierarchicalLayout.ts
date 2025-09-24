/**
 * 层次布局算法
 * 
 * 将节点按层次结构排列，适用于有明确层级关系的流程图
 */

import { BaseLayoutAlgorithm } from './BaseLayoutAlgorithm'
import type {
  LayoutConfig,
  Position,
  LayoutDirection
} from '../types'
import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../../types'

/**
 * 层次布局算法类
 */
export class HierarchicalLayout extends BaseLayoutAlgorithm {
  readonly name = 'hierarchical' as const
  readonly description = '层次布局算法，将节点按层级关系排列'

  /**
   * 是否支持约束
   */
  supportsConstraints(): boolean {
    return true
  }

  /**
   * 验证特定配置
   */
  protected validateSpecificConfig(config: LayoutConfig): boolean {
    // 验证方向
    if (config.direction && !['TB', 'BT', 'LR', 'RL'].includes(config.direction)) {
      return false
    }
    
    // 验证间距
    if (config.nodeSpacing) {
      if (config.nodeSpacing.horizontal < 0 || config.nodeSpacing.vertical < 0) {
        return false
      }
    }
    
    return true
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<LayoutConfig> {
    return {
      ...super.getDefaultConfig(),
      direction: 'TB',
      nodeSpacing: {
        horizontal: 120,
        vertical: 100
      },
      levelSpacing: 80
    }
  }

  /**
   * 执行层次布局
   */
  protected async executeLayout(data: FlowchartData, config: LayoutConfig): Promise<Record<string, Position>> {
    const { nodes, edges } = data
    const direction = config.direction || 'TB'
    const nodeSpacing = config.nodeSpacing || { horizontal: 120, vertical: 100 }
    const levelSpacing = config.levelSpacing || 80
    
    // 1. 分层
    const layers = this.assignLayers(nodes, edges)
    
    // 2. 减少边交叉
    const optimizedLayers = this.reduceCrossings(layers, edges)
    
    // 3. 计算位置
    const positions = this.calculatePositions(optimizedLayers, direction, nodeSpacing, levelSpacing)
    
    return positions
  }

  /**
   * 分配层级
   */
  private assignLayers(nodes: FlowchartNode[], edges: FlowchartEdge[]): FlowchartNode[][] {
    const layers: FlowchartNode[][] = []
    const nodeToLayer = new Map<string, number>()
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
    
    // 使用拓扑排序分层
    const queue: { node: FlowchartNode; layer: number }[] = []
    
    // 找到根节点（入度为0）
    for (const node of nodes) {
      if (inDegree.get(node.id) === 0) {
        queue.push({ node, layer: 0 })
        nodeToLayer.set(node.id, 0)
      }
    }
    
    // 分层处理
    while (queue.length > 0) {
      const { node, layer } = queue.shift()!
      
      // 确保层数组存在
      while (layers.length <= layer) {
        layers.push([])
      }
      
      layers[layer].push(node)
      
      // 处理子节点
      const children = adjacencyList.get(node.id) || []
      for (const childId of children) {
        const newInDegree = (inDegree.get(childId) || 0) - 1
        inDegree.set(childId, newInDegree)
        
        if (newInDegree === 0) {
          const childNode = nodes.find(n => n.id === childId)
          if (childNode) {
            const childLayer = layer + 1
            nodeToLayer.set(childId, childLayer)
            queue.push({ node: childNode, layer: childLayer })
          }
        }
      }
    }
    
    // 处理剩余的节点（可能存在环）
    const processedNodes = new Set(Array.from(nodeToLayer.keys()))
    const remainingNodes = nodes.filter(node => !processedNodes.has(node.id))
    
    if (remainingNodes.length > 0) {
      // 将剩余节点放在最后一层
      const lastLayer = layers.length
      layers.push(remainingNodes)
    }
    
    return layers
  }

  /**
   * 减少边交叉
   */
  private reduceCrossings(layers: FlowchartNode[][], edges: FlowchartEdge[]): FlowchartNode[][] {
    const optimizedLayers = layers.map(layer => [...layer])
    const maxIterations = 10
    
    // 构建边的映射
    const edgeMap = new Map<string, string[]>()
    for (const edge of edges) {
      if (!edgeMap.has(edge.sourceNodeId)) {
        edgeMap.set(edge.sourceNodeId, [])
      }
      edgeMap.get(edge.sourceNodeId)!.push(edge.targetNodeId)
    }
    
    // 迭代优化
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let improved = false
      
      // 从上到下优化
      for (let layerIndex = 0; layerIndex < optimizedLayers.length - 1; layerIndex++) {
        const currentLayer = optimizedLayers[layerIndex]
        const nextLayer = optimizedLayers[layerIndex + 1]
        
        // 计算每个节点的重心
        const barycenters = this.calculateBarycenters(currentLayer, nextLayer, edgeMap)
        
        // 根据重心排序
        const sortedLayer = [...currentLayer].sort((a, b) => {
          const baryA = barycenters.get(a.id) || 0
          const baryB = barycenters.get(b.id) || 0
          return baryA - baryB
        })
        
        // 检查是否有改进
        if (!this.arraysEqual(sortedLayer, currentLayer)) {
          optimizedLayers[layerIndex] = sortedLayer
          improved = true
        }
      }
      
      // 从下到上优化
      for (let layerIndex = optimizedLayers.length - 1; layerIndex > 0; layerIndex--) {
        const currentLayer = optimizedLayers[layerIndex]
        const prevLayer = optimizedLayers[layerIndex - 1]
        
        // 构建反向边映射
        const reverseEdgeMap = new Map<string, string[]>()
        for (const edge of edges) {
          if (!reverseEdgeMap.has(edge.targetNodeId)) {
            reverseEdgeMap.set(edge.targetNodeId, [])
          }
          reverseEdgeMap.get(edge.targetNodeId)!.push(edge.sourceNodeId)
        }
        
        // 计算重心
        const barycenters = this.calculateBarycenters(currentLayer, prevLayer, reverseEdgeMap)
        
        // 排序
        const sortedLayer = [...currentLayer].sort((a, b) => {
          const baryA = barycenters.get(a.id) || 0
          const baryB = barycenters.get(b.id) || 0
          return baryA - baryB
        })
        
        if (!this.arraysEqual(sortedLayer, currentLayer)) {
          optimizedLayers[layerIndex] = sortedLayer
          improved = true
        }
      }
      
      // 如果没有改进，提前退出
      if (!improved) {
        break
      }
    }
    
    return optimizedLayers
  }

  /**
   * 计算重心
   */
  private calculateBarycenters(
    layer: FlowchartNode[],
    adjacentLayer: FlowchartNode[],
    edgeMap: Map<string, string[]>
  ): Map<string, number> {
    const barycenters = new Map<string, number>()
    
    // 创建位置映射
    const positionMap = new Map<string, number>()
    adjacentLayer.forEach((node, index) => {
      positionMap.set(node.id, index)
    })
    
    for (const node of layer) {
      const connectedNodes = edgeMap.get(node.id) || []
      
      if (connectedNodes.length === 0) {
        barycenters.set(node.id, 0)
        continue
      }
      
      let sum = 0
      let count = 0
      
      for (const connectedNodeId of connectedNodes) {
        const position = positionMap.get(connectedNodeId)
        if (position !== undefined) {
          sum += position
          count++
        }
      }
      
      const barycenter = count > 0 ? sum / count : 0
      barycenters.set(node.id, barycenter)
    }
    
    return barycenters
  }

  /**
   * 计算节点位置
   */
  private calculatePositions(
    layers: FlowchartNode[][],
    direction: LayoutDirection,
    nodeSpacing: { horizontal: number; vertical: number },
    levelSpacing: number
  ): Record<string, Position> {
    const positions: Record<string, Position> = {}
    
    // 计算每层的宽度
    const layerWidths = layers.map(layer => {
      if (layer.length === 0) return 0
      return (layer.length - 1) * nodeSpacing.horizontal
    })
    
    const maxLayerWidth = Math.max(...layerWidths, 0)
    
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const layer = layers[layerIndex]
      const layerWidth = layerWidths[layerIndex]
      
      // 计算层的起始位置（居中对齐）
      const layerStartX = (maxLayerWidth - layerWidth) / 2
      
      for (let nodeIndex = 0; nodeIndex < layer.length; nodeIndex++) {
        const node = layer[nodeIndex]
        
        let x: number
        let y: number
        
        switch (direction) {
          case 'TB': // 从上到下
            x = layerStartX + nodeIndex * nodeSpacing.horizontal
            y = layerIndex * (nodeSpacing.vertical + levelSpacing)
            break
          case 'BT': // 从下到上
            x = layerStartX + nodeIndex * nodeSpacing.horizontal
            y = (layers.length - 1 - layerIndex) * (nodeSpacing.vertical + levelSpacing)
            break
          case 'LR': // 从左到右
            x = layerIndex * (nodeSpacing.horizontal + levelSpacing)
            y = layerStartX + nodeIndex * nodeSpacing.vertical
            break
          case 'RL': // 从右到左
            x = (layers.length - 1 - layerIndex) * (nodeSpacing.horizontal + levelSpacing)
            y = layerStartX + nodeIndex * nodeSpacing.vertical
            break
          default:
            x = layerStartX + nodeIndex * nodeSpacing.horizontal
            y = layerIndex * (nodeSpacing.vertical + levelSpacing)
        }
        
        positions[node.id] = { x, y }
      }
    }
    
    return positions
  }

  /**
   * 检查两个数组是否相等
   */
  private arraysEqual(a: FlowchartNode[], b: FlowchartNode[]): boolean {
    if (a.length !== b.length) return false
    
    for (let i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id) return false
    }
    
    return true
  }
}
