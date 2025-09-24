/**
 * 网格布局算法
 * 
 * 将节点排列成规整的网格，适用于大量节点的整齐排列
 */

import { BaseLayoutAlgorithm } from './BaseLayoutAlgorithm'
import type {
  LayoutConfig,
  Position
} from '../types'
import type { FlowchartData, FlowchartNode } from '../../types'

/**
 * 网格布局算法类
 */
export class GridLayout extends BaseLayoutAlgorithm {
  readonly name = 'grid' as const
  readonly description = '网格布局算法，将节点整齐排列成网格'

  /**
   * 验证特定配置
   */
  protected validateSpecificConfig(config: LayoutConfig): boolean {
    const algorithmConfig = config.algorithmConfig || {}
    
    // 验证网格参数
    if (algorithmConfig.columns && algorithmConfig.columns < 1) {
      return false
    }
    
    if (algorithmConfig.rows && algorithmConfig.rows < 1) {
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
      nodeSpacing: {
        horizontal: 150,
        vertical: 120
      },
      algorithmConfig: {
        columns: 0, // 0 表示自动计算
        rows: 0,    // 0 表示自动计算
        alignment: 'center', // 'left', 'center', 'right'
        sortBy: 'none', // 'none', 'type', 'name', 'custom'
        fillDirection: 'row' // 'row', 'column'
      }
    }
  }

  /**
   * 执行网格布局
   */
  protected async executeLayout(data: FlowchartData, config: LayoutConfig): Promise<Record<string, Position>> {
    const { nodes } = data
    const nodeSpacing = config.nodeSpacing || { horizontal: 150, vertical: 120 }
    const algorithmConfig = { ...this.getDefaultConfig().algorithmConfig, ...config.algorithmConfig }
    
    // 排序节点
    const sortedNodes = this.sortNodes(nodes, algorithmConfig.sortBy)
    
    // 计算网格尺寸
    const { columns, rows } = this.calculateGridSize(sortedNodes.length, algorithmConfig)
    
    // 计算位置
    const positions = this.calculateGridPositions(
      sortedNodes,
      columns,
      rows,
      nodeSpacing,
      algorithmConfig
    )
    
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
      
      case 'custom':
        // 可以根据自定义属性排序
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
   * 计算网格尺寸
   */
  private calculateGridSize(nodeCount: number, config: any): { columns: number; rows: number } {
    let { columns, rows } = config
    
    if (columns > 0 && rows > 0) {
      // 如果都指定了，直接使用
      return { columns, rows }
    } else if (columns > 0) {
      // 指定了列数，计算行数
      rows = Math.ceil(nodeCount / columns)
      return { columns, rows }
    } else if (rows > 0) {
      // 指定了行数，计算列数
      columns = Math.ceil(nodeCount / rows)
      return { columns, rows }
    } else {
      // 都没指定，自动计算最接近正方形的布局
      columns = Math.ceil(Math.sqrt(nodeCount))
      rows = Math.ceil(nodeCount / columns)
      return { columns, rows }
    }
  }

  /**
   * 计算网格位置
   */
  private calculateGridPositions(
    nodes: FlowchartNode[],
    columns: number,
    rows: number,
    nodeSpacing: { horizontal: number; vertical: number },
    config: any
  ): Record<string, Position> {
    const positions: Record<string, Position> = {}
    const { alignment, fillDirection } = config
    
    // 计算网格的总尺寸
    const gridWidth = (columns - 1) * nodeSpacing.horizontal
    const gridHeight = (rows - 1) * nodeSpacing.vertical
    
    // 计算起始位置（用于对齐）
    let startX = 0
    let startY = 0
    
    switch (alignment) {
      case 'left':
        startX = 0
        break
      case 'center':
        startX = -gridWidth / 2
        break
      case 'right':
        startX = -gridWidth
        break
      default:
        startX = -gridWidth / 2
    }
    
    startY = -gridHeight / 2 // 垂直居中
    
    // 为每个节点分配位置
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      let row: number
      let col: number
      
      if (fillDirection === 'column') {
        // 按列填充
        col = Math.floor(i / rows)
        row = i % rows
      } else {
        // 按行填充（默认）
        row = Math.floor(i / columns)
        col = i % columns
      }
      
      const x = startX + col * nodeSpacing.horizontal
      const y = startY + row * nodeSpacing.vertical
      
      positions[node.id] = { x, y }
    }
    
    return positions
  }
}
