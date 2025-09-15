/**
 * 差异引擎
 * 
 * 计算和应用流程图数据之间的差异
 */

import type {
  DiffEngine as IDiffEngine,
  Difference,
  Conflict,
  ConflictResolutionStrategy
} from './types'
import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../types'

/**
 * 差异引擎类
 */
export class DiffEngine implements IDiffEngine {
  /**
   * 计算差异
   */
  async calculateDiff(source: FlowchartData, target: FlowchartData): Promise<Difference[]> {
    const differences: Difference[] = []
    
    // 计算节点差异
    const nodeDifferences = this.calculateNodeDifferences(source.nodes, target.nodes)
    differences.push(...nodeDifferences)
    
    // 计算边差异
    const edgeDifferences = this.calculateEdgeDifferences(source.edges, target.edges)
    differences.push(...edgeDifferences)
    
    return differences
  }

  /**
   * 应用差异
   */
  async applyDiff(data: FlowchartData, differences: Difference[]): Promise<FlowchartData> {
    const result: FlowchartData = {
      nodes: [...data.nodes],
      edges: [...data.edges]
    }
    
    // 按类型分组差异
    const nodeDiffs = differences.filter(d => d.targetType === 'node')
    const edgeDiffs = differences.filter(d => d.targetType === 'edge')
    
    // 应用节点差异
    result.nodes = this.applyNodeDifferences(result.nodes, nodeDiffs)
    
    // 应用边差异
    result.edges = this.applyEdgeDifferences(result.edges, edgeDiffs)
    
    return result
  }

  /**
   * 检测冲突
   */
  async detectConflicts(differences: Difference[]): Promise<Conflict[]> {
    const conflicts: Conflict[] = []
    
    // 检测同一目标的多个修改
    const targetMap = new Map<string, Difference[]>()
    
    for (const diff of differences) {
      const key = `${diff.targetType}:${diff.targetId}`
      if (!targetMap.has(key)) {
        targetMap.set(key, [])
      }
      targetMap.get(key)!.push(diff)
    }
    
    // 查找冲突
    for (const [key, diffs] of targetMap.entries()) {
      if (diffs.length > 1) {
        const conflictingDiffs = diffs.filter(d => d.type === 'modified')
        if (conflictingDiffs.length > 1) {
          const conflict = this.createConflict(conflictingDiffs)
          if (conflict) {
            conflicts.push(conflict)
          }
        }
      }
    }
    
    return conflicts
  }

  /**
   * 解决冲突
   */
  async resolveConflicts(
    conflicts: Conflict[],
    strategy: ConflictResolutionStrategy
  ): Promise<Difference[]> {
    const resolvedDifferences: Difference[] = []
    
    for (const conflict of conflicts) {
      const resolvedDiff = this.resolveConflict(conflict, strategy)
      if (resolvedDiff) {
        resolvedDifferences.push(resolvedDiff)
      }
    }
    
    return resolvedDifferences
  }

  /**
   * 计算节点差异
   */
  private calculateNodeDifferences(sourceNodes: FlowchartNode[], targetNodes: FlowchartNode[]): Difference[] {
    const differences: Difference[] = []
    
    // 创建节点映射
    const sourceMap = new Map(sourceNodes.map(node => [node.id, node]))
    const targetMap = new Map(targetNodes.map(node => [node.id, node]))
    
    // 查找新增的节点
    for (const targetNode of targetNodes) {
      if (!sourceMap.has(targetNode.id)) {
        differences.push({
          id: this.generateDiffId(),
          type: 'added',
          targetType: 'node',
          targetId: targetNode.id,
          targetValue: targetNode,
          description: `添加节点: ${targetNode.id}`,
          severity: 'medium'
        })
      }
    }
    
    // 查找删除的节点
    for (const sourceNode of sourceNodes) {
      if (!targetMap.has(sourceNode.id)) {
        differences.push({
          id: this.generateDiffId(),
          type: 'removed',
          targetType: 'node',
          targetId: sourceNode.id,
          sourceValue: sourceNode,
          description: `删除节点: ${sourceNode.id}`,
          severity: 'high'
        })
      }
    }
    
    // 查找修改的节点
    for (const targetNode of targetNodes) {
      const sourceNode = sourceMap.get(targetNode.id)
      if (sourceNode) {
        const nodeDiffs = this.compareNodes(sourceNode, targetNode)
        differences.push(...nodeDiffs)
      }
    }
    
    return differences
  }

  /**
   * 计算边差异
   */
  private calculateEdgeDifferences(sourceEdges: FlowchartEdge[], targetEdges: FlowchartEdge[]): Difference[] {
    const differences: Difference[] = []
    
    // 创建边映射
    const sourceMap = new Map(sourceEdges.map(edge => [edge.id, edge]))
    const targetMap = new Map(targetEdges.map(edge => [edge.id, edge]))
    
    // 查找新增的边
    for (const targetEdge of targetEdges) {
      if (!sourceMap.has(targetEdge.id)) {
        differences.push({
          id: this.generateDiffId(),
          type: 'added',
          targetType: 'edge',
          targetId: targetEdge.id,
          targetValue: targetEdge,
          description: `添加边: ${targetEdge.id}`,
          severity: 'medium'
        })
      }
    }
    
    // 查找删除的边
    for (const sourceEdge of sourceEdges) {
      if (!targetMap.has(sourceEdge.id)) {
        differences.push({
          id: this.generateDiffId(),
          type: 'removed',
          targetType: 'edge',
          targetId: sourceEdge.id,
          sourceValue: sourceEdge,
          description: `删除边: ${sourceEdge.id}`,
          severity: 'high'
        })
      }
    }
    
    // 查找修改的边
    for (const targetEdge of targetEdges) {
      const sourceEdge = sourceMap.get(targetEdge.id)
      if (sourceEdge) {
        const edgeDiffs = this.compareEdges(sourceEdge, targetEdge)
        differences.push(...edgeDiffs)
      }
    }
    
    return differences
  }

  /**
   * 比较节点
   */
  private compareNodes(sourceNode: FlowchartNode, targetNode: FlowchartNode): Difference[] {
    const differences: Difference[] = []
    
    // 比较基本属性
    const basicProps = ['type', 'text', 'label']
    for (const prop of basicProps) {
      const sourceValue = (sourceNode as any)[prop]
      const targetValue = (targetNode as any)[prop]
      
      if (sourceValue !== targetValue) {
        differences.push({
          id: this.generateDiffId(),
          type: 'modified',
          targetType: 'node',
          targetId: targetNode.id,
          sourceValue,
          targetValue,
          path: prop,
          description: `修改节点 ${targetNode.id} 的 ${prop}: ${sourceValue} -> ${targetValue}`,
          severity: 'low'
        })
      }
    }
    
    // 比较位置
    const sourcePos = (sourceNode as any).position
    const targetPos = (targetNode as any).position
    
    if (sourcePos && targetPos) {
      if (sourcePos.x !== targetPos.x || sourcePos.y !== targetPos.y) {
        differences.push({
          id: this.generateDiffId(),
          type: 'moved',
          targetType: 'node',
          targetId: targetNode.id,
          sourceValue: sourcePos,
          targetValue: targetPos,
          path: 'position',
          description: `移动节点 ${targetNode.id}: (${sourcePos.x}, ${sourcePos.y}) -> (${targetPos.x}, ${targetPos.y})`,
          severity: 'low'
        })
      }
    }
    
    // 比较属性
    const sourceProps = (sourceNode as any).properties || {}
    const targetProps = (targetNode as any).properties || {}
    
    const allPropKeys = new Set([...Object.keys(sourceProps), ...Object.keys(targetProps)])
    
    for (const key of allPropKeys) {
      const sourceValue = sourceProps[key]
      const targetValue = targetProps[key]
      
      if (JSON.stringify(sourceValue) !== JSON.stringify(targetValue)) {
        differences.push({
          id: this.generateDiffId(),
          type: 'modified',
          targetType: 'property',
          targetId: `${targetNode.id}.${key}`,
          sourceValue,
          targetValue,
          path: `properties.${key}`,
          description: `修改节点 ${targetNode.id} 的属性 ${key}`,
          severity: 'low'
        })
      }
    }
    
    return differences
  }

  /**
   * 比较边
   */
  private compareEdges(sourceEdge: FlowchartEdge, targetEdge: FlowchartEdge): Difference[] {
    const differences: Difference[] = []
    
    // 比较基本属性
    const basicProps = ['sourceNodeId', 'targetNodeId', 'text', 'label']
    for (const prop of basicProps) {
      const sourceValue = (sourceEdge as any)[prop]
      const targetValue = (targetEdge as any)[prop]
      
      if (sourceValue !== targetValue) {
        const severity = (prop === 'sourceNodeId' || prop === 'targetNodeId') ? 'high' : 'low'
        differences.push({
          id: this.generateDiffId(),
          type: 'modified',
          targetType: 'edge',
          targetId: targetEdge.id,
          sourceValue,
          targetValue,
          path: prop,
          description: `修改边 ${targetEdge.id} 的 ${prop}: ${sourceValue} -> ${targetValue}`,
          severity
        })
      }
    }
    
    return differences
  }

  /**
   * 应用节点差异
   */
  private applyNodeDifferences(nodes: FlowchartNode[], differences: Difference[]): FlowchartNode[] {
    let result = [...nodes]
    
    for (const diff of differences) {
      switch (diff.type) {
        case 'added':
          if (diff.targetValue) {
            result.push(diff.targetValue as FlowchartNode)
          }
          break
        
        case 'removed':
          result = result.filter(node => node.id !== diff.targetId)
          break
        
        case 'modified':
        case 'moved':
          const nodeIndex = result.findIndex(node => node.id === diff.targetId)
          if (nodeIndex !== -1) {
            const updatedNode = { ...result[nodeIndex] }
            this.applyPropertyChange(updatedNode, diff.path, diff.targetValue)
            result[nodeIndex] = updatedNode
          }
          break
      }
    }
    
    return result
  }

  /**
   * 应用边差异
   */
  private applyEdgeDifferences(edges: FlowchartEdge[], differences: Difference[]): FlowchartEdge[] {
    let result = [...edges]
    
    for (const diff of differences) {
      switch (diff.type) {
        case 'added':
          if (diff.targetValue) {
            result.push(diff.targetValue as FlowchartEdge)
          }
          break
        
        case 'removed':
          result = result.filter(edge => edge.id !== diff.targetId)
          break
        
        case 'modified':
          const edgeIndex = result.findIndex(edge => edge.id === diff.targetId)
          if (edgeIndex !== -1) {
            const updatedEdge = { ...result[edgeIndex] }
            this.applyPropertyChange(updatedEdge, diff.path, diff.targetValue)
            result[edgeIndex] = updatedEdge
          }
          break
      }
    }
    
    return result
  }

  /**
   * 应用属性变更
   */
  private applyPropertyChange(target: any, path: string | undefined, value: any): void {
    if (!path) return
    
    const pathParts = path.split('.')
    let current = target
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i]
      if (!(part in current)) {
        current[part] = {}
      }
      current = current[part]
    }
    
    const lastPart = pathParts[pathParts.length - 1]
    current[lastPart] = value
  }

  /**
   * 创建冲突
   */
  private createConflict(conflictingDiffs: Difference[]): Conflict | null {
    if (conflictingDiffs.length < 2) return null
    
    const firstDiff = conflictingDiffs[0]
    const secondDiff = conflictingDiffs[1]
    
    return {
      id: this.generateConflictId(),
      type: 'content',
      targetType: firstDiff.targetType,
      targetId: firstDiff.targetId,
      sourceValue: firstDiff.sourceValue,
      targetValue: secondDiff.targetValue,
      description: `冲突: ${firstDiff.targetType} ${firstDiff.targetId} 有多个修改`,
      resolved: false
    }
  }

  /**
   * 解决冲突
   */
  private resolveConflict(conflict: Conflict, strategy: ConflictResolutionStrategy): Difference | null {
    switch (strategy) {
      case 'keep_source':
        return {
          id: this.generateDiffId(),
          type: 'modified',
          targetType: conflict.targetType,
          targetId: conflict.targetId,
          sourceValue: conflict.targetValue,
          targetValue: conflict.sourceValue,
          description: `解决冲突: 保留源值`,
          severity: 'medium'
        }
      
      case 'keep_target':
        return {
          id: this.generateDiffId(),
          type: 'modified',
          targetType: conflict.targetType,
          targetId: conflict.targetId,
          sourceValue: conflict.sourceValue,
          targetValue: conflict.targetValue,
          description: `解决冲突: 保留目标值`,
          severity: 'medium'
        }
      
      case 'merge':
        // 简单合并策略
        const mergedValue = this.mergeValues(conflict.sourceValue, conflict.targetValue)
        return {
          id: this.generateDiffId(),
          type: 'modified',
          targetType: conflict.targetType,
          targetId: conflict.targetId,
          sourceValue: conflict.sourceValue,
          targetValue: mergedValue,
          description: `解决冲突: 合并值`,
          severity: 'medium'
        }
      
      default:
        return null
    }
  }

  /**
   * 合并值
   */
  private mergeValues(sourceValue: any, targetValue: any): any {
    if (typeof sourceValue === 'object' && typeof targetValue === 'object') {
      return { ...sourceValue, ...targetValue }
    }
    
    // 对于非对象值，优先使用目标值
    return targetValue
  }

  /**
   * 生成差异ID
   */
  private generateDiffId(): string {
    return `diff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成冲突ID
   */
  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
