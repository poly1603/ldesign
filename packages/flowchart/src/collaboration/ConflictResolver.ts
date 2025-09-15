/**
 * 冲突解决器
 * 
 * 处理协作编辑中的操作冲突
 */

import type {
  Operation,
  Conflict,
  ConflictResolution,
  ConflictResolver as IConflictResolver,
  OperationTransform
} from './types'

/**
 * 冲突解决器类
 */
export class ConflictResolver implements IConflictResolver {
  private transformFunctions: Map<string, OperationTransform> = new Map()

  constructor() {
    this.initializeTransformFunctions()
  }

  /**
   * 检测操作冲突
   */
  detectConflict(op1: Operation, op2: Operation): Conflict | null {
    // 如果是同一个用户的操作，不存在冲突
    if (op1.userId === op2.userId) {
      return null
    }

    // 如果操作的目标不同，不存在冲突
    if (op1.targetId !== op2.targetId) {
      return null
    }

    // 检查时间戳，如果时间差太大，可能不是并发操作
    const timeDiff = Math.abs(op1.timestamp - op2.timestamp)
    if (timeDiff > 5000) { // 5秒
      return null
    }

    // 根据操作类型检测具体冲突
    const conflictType = this.getConflictType(op1, op2)
    if (!conflictType) {
      return null
    }

    return {
      id: this.generateConflictId(),
      type: conflictType,
      operation1: op1,
      operation2: op2
    }
  }

  /**
   * 解决冲突
   */
  resolveConflict(conflict: Conflict, strategy: ConflictResolution['strategy']): ConflictResolution {
    const resolution: ConflictResolution = {
      strategy,
      resolvedBy: 'system',
      resolvedAt: Date.now()
    }

    switch (strategy) {
      case 'accept_local':
        resolution.resolvedOperation = conflict.operation1
        break
      
      case 'accept_remote':
        resolution.resolvedOperation = conflict.operation2
        break
      
      case 'merge':
        resolution.resolvedOperation = this.mergeOperations(conflict.operation1, conflict.operation2)
        break
      
      case 'manual':
        // 手动解决，不自动生成解决方案
        break
      
      default:
        throw new Error(`不支持的冲突解决策略: ${strategy}`)
    }

    return resolution
  }

  /**
   * 检查是否可以自动解决冲突
   */
  canAutoResolve(conflict: Conflict): boolean {
    switch (conflict.type) {
      case 'concurrent_edit':
        // 并发编辑可以尝试自动合并
        return this.canMergeOperations(conflict.operation1, conflict.operation2)
      
      case 'delete_modified':
        // 删除已修改的元素，通常需要手动解决
        return false
      
      case 'move_conflict':
        // 移动冲突可以自动解决（使用最后写入者获胜）
        return true
      
      default:
        return false
    }
  }

  /**
   * 变换操作以解决冲突
   */
  transformOperation(op: Operation, againstOp: Operation): Operation[] {
    const key = `${op.type}_${againstOp.type}`
    const transformFn = this.transformFunctions.get(key)
    
    if (transformFn) {
      return transformFn(op, againstOp)
    }
    
    // 默认变换：保持原操作不变
    return [op]
  }

  /**
   * 获取冲突类型
   */
  private getConflictType(op1: Operation, op2: Operation): Conflict['type'] | null {
    // 删除 vs 修改
    if ((op1.type === 'node:delete' || op1.type === 'edge:delete') && 
        (op2.type === 'node:update' || op2.type === 'edge:update')) {
      return 'delete_modified'
    }
    
    if ((op2.type === 'node:delete' || op2.type === 'edge:delete') && 
        (op1.type === 'node:update' || op1.type === 'edge:update')) {
      return 'delete_modified'
    }

    // 移动冲突
    if (op1.type === 'node:move' && op2.type === 'node:move') {
      return 'move_conflict'
    }

    // 并发编辑
    if ((op1.type === 'node:update' || op1.type === 'edge:update') &&
        (op2.type === 'node:update' || op2.type === 'edge:update')) {
      return 'concurrent_edit'
    }

    return null
  }

  /**
   * 合并操作
   */
  private mergeOperations(op1: Operation, op2: Operation): Operation {
    // 基于时间戳决定优先级
    const primaryOp = op1.timestamp > op2.timestamp ? op1 : op2
    const secondaryOp = op1.timestamp > op2.timestamp ? op2 : op1

    // 合并数据
    const mergedData = this.mergeOperationData(primaryOp.data, secondaryOp.data)

    return {
      ...primaryOp,
      id: this.generateOperationId(),
      data: mergedData,
      timestamp: Date.now()
    }
  }

  /**
   * 合并操作数据
   */
  private mergeOperationData(data1: any, data2: any): any {
    if (typeof data1 !== 'object' || typeof data2 !== 'object') {
      return data1 // 非对象类型，使用第一个数据
    }

    const merged = { ...data2, ...data1 }
    
    // 特殊处理某些字段
    if (data1.position && data2.position) {
      // 位置冲突，使用平均值
      merged.position = {
        x: (data1.position.x + data2.position.x) / 2,
        y: (data1.position.y + data2.position.y) / 2
      }
    }

    if (data1.style && data2.style) {
      // 样式合并
      merged.style = { ...data2.style, ...data1.style }
    }

    return merged
  }

  /**
   * 检查是否可以合并操作
   */
  private canMergeOperations(op1: Operation, op2: Operation): boolean {
    // 不同类型的操作通常不能合并
    if (op1.type !== op2.type) {
      return false
    }

    // 删除操作不能合并
    if (op1.type.includes('delete')) {
      return false
    }

    return true
  }

  /**
   * 初始化变换函数
   */
  private initializeTransformFunctions(): void {
    // 更新 vs 更新
    this.transformFunctions.set('node:update_node:update', (op1, op2) => {
      const transformed = { ...op1 }
      // 合并更新数据
      transformed.data = this.mergeOperationData(op1.data, op2.data)
      return [transformed]
    })

    // 移动 vs 移动
    this.transformFunctions.set('node:move_node:move', (op1, op2) => {
      // 使用时间戳较新的操作
      return op1.timestamp > op2.timestamp ? [op1] : [op2]
    })

    // 删除 vs 更新
    this.transformFunctions.set('node:delete_node:update', (op1, op2) => {
      // 删除操作优先
      return [op1]
    })

    this.transformFunctions.set('node:update_node:delete', (op1, op2) => {
      // 删除操作优先
      return [op2]
    })

    // 添加 vs 添加（相同ID）
    this.transformFunctions.set('node:add_node:add', (op1, op2) => {
      // 使用时间戳较早的操作，后面的操作需要生成新ID
      if (op1.timestamp < op2.timestamp) {
        return [op1]
      } else {
        const transformed = { ...op2 }
        transformed.targetId = this.generateNodeId()
        transformed.data.id = transformed.targetId
        return [op1, transformed]
      }
    })
  }

  /**
   * 生成冲突ID
   */
  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成操作ID
   */
  private generateOperationId(): string {
    return `op_merged_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成节点ID
   */
  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取冲突解决统计信息
   */
  getStats(): {
    totalConflictsDetected: number
    totalConflictsResolved: number
    autoResolvedCount: number
    manualResolvedCount: number
  } {
    // 这里应该维护统计信息
    return {
      totalConflictsDetected: 0,
      totalConflictsResolved: 0,
      autoResolvedCount: 0,
      manualResolvedCount: 0
    }
  }
}
