/**
 * 圆形布局算法
 * 
 * 将节点排列成圆形，适用于循环流程或展示节点间的平等关系
 */

import { BaseLayoutAlgorithm } from './BaseLayoutAlgorithm'
import type {
  LayoutConfig,
  Position
} from '../types'
import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../../types'

/**
 * 圆形布局算法类
 */
export class CircularLayout extends BaseLayoutAlgorithm {
  readonly name = 'circular' as const
  readonly description = '圆形布局算法，将节点排列成圆形'

  /**
   * 验证特定配置
   */
  protected validateSpecificConfig(config: LayoutConfig): boolean {
    const algorithmConfig = config.algorithmConfig || {}
    
    // 验证半径
    if (algorithmConfig.radius && algorithmConfig.radius < 0) {
      return false
    }
    
    // 验证角度
    if (algorithmConfig.startAngle && (algorithmConfig.startAngle < -360 || algorithmConfig.startAngle > 360)) {
      return false
    }
    
    return true
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<LayoutConfig> {
    return {
      ...super.getDefaultConfig(),
      algorithmConfig: {
        radius: 200,
        startAngle: -90, // 从顶部开始
        clockwise: true,
        centerX: 0,
        centerY: 0,
        sortBy: 'none', // 'none', 'type', 'name', 'degree', 'custom'
        groupBy: 'none', // 'none', 'type', 'custom'
        equalSpacing: true, // 是否等间距
        minRadius: 100,
        maxRadius: 500
      }
    }
  }

  /**
   * 执行圆形布局
   */
  protected async executeLayout(data: FlowchartData, config: LayoutConfig): Promise<Record<string, Position>> {
    const { nodes, edges } = data
    const algorithmConfig = { ...this.getDefaultConfig().algorithmConfig, ...config.algorithmConfig }
    
    // 分组节点
    const nodeGroups = this.groupNodes(nodes, algorithmConfig.groupBy, edges)
    
    // 计算布局
    const positions = this.calculateCircularPositions(nodeGroups, algorithmConfig)
    
    return positions
  }

  /**
   * 分组节点
   */
  private groupNodes(
    nodes: FlowchartNode[],
    groupBy: string,
    edges: FlowchartEdge[]
  ): { [key: string]: FlowchartNode[] } {
    const groups: { [key: string]: FlowchartNode[] } = {}
    
    switch (groupBy) {
      case 'type':
        for (const node of nodes) {
          const type = (node as any).type || 'default'
          if (!groups[type]) {
            groups[type] = []
          }
          groups[type].push(node)
        }
        break
      
      case 'custom':
        for (const node of nodes) {
          const group = (node as any).group || 'default'
          if (!groups[group]) {
            groups[group] = []
          }
          groups[group].push(node)
        }
        break
      
      default:
        groups['default'] = [...nodes]
        break
    }
    
    return groups
  }

  /**
   * 计算圆形位置
   */
  private calculateCircularPositions(
    nodeGroups: { [key: string]: FlowchartNode[] },
    config: any
  ): Record<string, Position> {
    const positions: Record<string, Position> = {}
    const groupKeys = Object.keys(nodeGroups)
    
    if (groupKeys.length === 1) {
      // 单个组，使用单圆布局
      const nodes = nodeGroups[groupKeys[0]]
      const groupPositions = this.calculateSingleCirclePositions(nodes, config)
      Object.assign(positions, groupPositions)
    } else {
      // 多个组，使用多圆布局
      const groupPositions = this.calculateMultiCirclePositions(nodeGroups, config)
      Object.assign(positions, groupPositions)
    }
    
    return positions
  }

  /**
   * 计算单圆布局位置
   */
  private calculateSingleCirclePositions(
    nodes: FlowchartNode[],
    config: any
  ): Record<string, Position> {
    const positions: Record<string, Position> = {}
    const {
      radius,
      startAngle,
      clockwise,
      centerX,
      centerY,
      sortBy,
      equalSpacing
    } = config
    
    // 排序节点
    const sortedNodes = this.sortNodes(nodes, sortBy)
    
    // 计算角度间隔
    const totalAngle = 360
    const angleStep = totalAngle / sortedNodes.length
    
    for (let i = 0; i < sortedNodes.length; i++) {
      const node = sortedNodes[i]
      
      let angle: number
      if (equalSpacing) {
        angle = startAngle + (clockwise ? i : -i) * angleStep
      } else {
        // 可以根据节点权重调整角度
        const weight = this.getNodeWeight(node)
        angle = startAngle + (clockwise ? i : -i) * angleStep * weight
      }
      
      // 转换为弧度
      const radian = (angle * Math.PI) / 180
      
      // 计算位置
      const x = centerX + radius * Math.cos(radian)
      const y = centerY + radius * Math.sin(radian)
      
      positions[node.id] = { x, y }
    }
    
    return positions
  }

  /**
   * 计算多圆布局位置
   */
  private calculateMultiCirclePositions(
    nodeGroups: { [key: string]: FlowchartNode[] },
    config: any
  ): Record<string, Position> {
    const positions: Record<string, Position> = {}
    const groupKeys = Object.keys(nodeGroups)
    const {
      minRadius,
      maxRadius,
      centerX,
      centerY
    } = config
    
    // 计算每个组的半径
    const radiusStep = (maxRadius - minRadius) / Math.max(1, groupKeys.length - 1)
    
    for (let groupIndex = 0; groupIndex < groupKeys.length; groupIndex++) {
      const groupKey = groupKeys[groupIndex]
      const groupNodes = nodeGroups[groupKey]
      
      // 计算该组的半径
      const groupRadius = groupKeys.length === 1 
        ? config.radius 
        : minRadius + groupIndex * radiusStep
      
      // 为该组创建配置
      const groupConfig = {
        ...config,
        radius: groupRadius,
        centerX,
        centerY
      }
      
      // 计算该组的位置
      const groupPositions = this.calculateSingleCirclePositions(groupNodes, groupConfig)
      Object.assign(positions, groupPositions)
    }
    
    return positions
  }

  /**
   * 排序节点
   */
  private sortNodes(nodes: FlowchartNode[], sortBy: string): FlowchartNode[] {
    const sortedNodes = [...nodes]
    
    switch (sortBy) {
      case 'type':
        sortedNodes.sort((a, b) => {
          const typeA = (a as any).type || ''
          const typeB = (b as any).type || ''
          return typeA.localeCompare(typeB)
        })
        break
      
      case 'name':
        sortedNodes.sort((a, b) => {
          const nameA = (a as any).text || (a as any).label || a.id
          const nameB = (b as any).text || (b as any).label || b.id
          return nameA.localeCompare(nameB)
        })
        break
      
      case 'degree':
        // 根据连接度排序（需要边信息）
        sortedNodes.sort((a, b) => {
          const degreeA = (a as any).degree || 0
          const degreeB = (b as any).degree || 0
          return degreeB - degreeA // 降序
        })
        break
      
      case 'custom':
        sortedNodes.sort((a, b) => {
          const orderA = (a as any).order || 0
          const orderB = (b as any).order || 0
          return orderA - orderB
        })
        break
      
      default:
        // 保持原有顺序
        break
    }
    
    return sortedNodes
  }

  /**
   * 获取节点权重
   */
  private getNodeWeight(node: FlowchartNode): number {
    // 可以根据节点的重要性、连接数等计算权重
    const weight = (node as any).weight || 1
    return Math.max(0.5, Math.min(2, weight)) // 限制权重范围
  }
}
