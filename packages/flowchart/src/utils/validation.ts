/**
 * 流程验证工具
 * 
 * 提供审批流程图的验证功能，确保流程的合理性和完整性
 */

import type { FlowchartData, ApprovalNodeConfig, ApprovalEdgeConfig } from '../types'

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否通过验证 */
  valid: boolean
  /** 错误信息列表 */
  errors: ValidationError[]
  /** 警告信息列表 */
  warnings: ValidationWarning[]
}

/**
 * 验证错误
 */
export interface ValidationError {
  /** 错误类型 */
  type: 'missing_start' | 'missing_end' | 'isolated_node' | 'invalid_connection' | 'circular_dependency'
  /** 错误消息 */
  message: string
  /** 相关节点ID */
  nodeId?: string
  /** 相关边ID */
  edgeId?: string
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  /** 警告类型 */
  type: 'multiple_start' | 'multiple_end' | 'unused_condition' | 'missing_approver'
  /** 警告消息 */
  message: string
  /** 相关节点ID */
  nodeId?: string
}

/**
 * 流程验证器
 */
export class FlowchartValidator {
  /**
   * 验证流程图数据
   */
  static validate(data: FlowchartData): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 基础数据检查
    if (!data.nodes || data.nodes.length === 0) {
      errors.push({
        type: 'missing_start',
        message: '流程图中没有任何节点'
      })
      return { valid: false, errors, warnings }
    }

    const nodes = data.nodes as ApprovalNodeConfig[]
    const edges = (data.edges || []) as ApprovalEdgeConfig[]

    // 检查开始节点
    this.validateStartNodes(nodes, errors, warnings)

    // 检查结束节点
    this.validateEndNodes(nodes, errors, warnings)

    // 检查孤立节点
    this.validateIsolatedNodes(nodes, edges, errors)

    // 检查连接有效性
    this.validateConnections(nodes, edges, errors)

    // 检查循环依赖
    this.validateCircularDependency(nodes, edges, errors)

    // 检查审批节点配置
    this.validateApprovalNodes(nodes, warnings)

    // 检查条件节点配置
    this.validateConditionNodes(nodes, edges, warnings)

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 验证开始节点
   */
  private static validateStartNodes(
    nodes: ApprovalNodeConfig[],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const startNodes = nodes.filter(node => node.type === 'start')

    if (startNodes.length === 0) {
      errors.push({
        type: 'missing_start',
        message: '流程图必须包含至少一个开始节点'
      })
    } else if (startNodes.length > 1) {
      warnings.push({
        type: 'multiple_start',
        message: `发现多个开始节点（${startNodes.length}个），建议只使用一个开始节点`
      })
    }
  }

  /**
   * 验证结束节点
   */
  private static validateEndNodes(
    nodes: ApprovalNodeConfig[],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const endNodes = nodes.filter(node => node.type === 'end')

    if (endNodes.length === 0) {
      errors.push({
        type: 'missing_end',
        message: '流程图必须包含至少一个结束节点'
      })
    } else if (endNodes.length > 3) {
      warnings.push({
        type: 'multiple_end',
        message: `发现过多结束节点（${endNodes.length}个），建议减少结束节点数量`
      })
    }
  }

  /**
   * 验证孤立节点
   */
  private static validateIsolatedNodes(
    nodes: ApprovalNodeConfig[],
    edges: ApprovalEdgeConfig[],
    errors: ValidationError[]
  ): void {
    const connectedNodeIds = new Set<string>()

    // 收集所有连接的节点ID
    edges.forEach(edge => {
      connectedNodeIds.add(edge.sourceNodeId)
      connectedNodeIds.add(edge.targetNodeId)
    })

    // 检查孤立节点（除了单独的开始节点）
    nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id) && node.type !== 'start') {
        errors.push({
          type: 'isolated_node',
          message: `节点"${node.text || node.id}"没有连接到任何其他节点`,
          nodeId: node.id
        })
      }
    })
  }

  /**
   * 验证连接有效性
   */
  private static validateConnections(
    nodes: ApprovalNodeConfig[],
    edges: ApprovalEdgeConfig[],
    errors: ValidationError[]
  ): void {
    const nodeMap = new Map(nodes.map(node => [node.id, node]))

    edges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.sourceNodeId)
      const targetNode = nodeMap.get(edge.targetNodeId)

      if (!sourceNode) {
        errors.push({
          type: 'invalid_connection',
          message: `边的源节点"${edge.sourceNodeId}"不存在`,
          edgeId: edge.id
        })
        return
      }

      if (!targetNode) {
        errors.push({
          type: 'invalid_connection',
          message: `边的目标节点"${edge.targetNodeId}"不存在`,
          edgeId: edge.id
        })
        return
      }

      // 检查不合理的连接
      if (sourceNode.type === 'end') {
        errors.push({
          type: 'invalid_connection',
          message: `结束节点"${sourceNode.text || sourceNode.id}"不能作为连接的起点`,
          edgeId: edge.id,
          nodeId: sourceNode.id
        })
      }

      if (targetNode.type === 'start') {
        errors.push({
          type: 'invalid_connection',
          message: `开始节点"${targetNode.text || targetNode.id}"不能作为连接的终点`,
          edgeId: edge.id,
          nodeId: targetNode.id
        })
      }
    })
  }

  /**
   * 验证循环依赖
   */
  private static validateCircularDependency(
    nodes: ApprovalNodeConfig[],
    edges: ApprovalEdgeConfig[],
    errors: ValidationError[]
  ): void {
    const graph = new Map<string, string[]>()
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    // 构建邻接表
    nodes.forEach(node => graph.set(node.id, []))
    edges.forEach(edge => {
      const neighbors = graph.get(edge.sourceNodeId) || []
      neighbors.push(edge.targetNodeId)
      graph.set(edge.sourceNodeId, neighbors)
    })

    // DFS检测循环
    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)

      const neighbors = graph.get(nodeId) || []
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

    // 检查每个节点
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          errors.push({
            type: 'circular_dependency',
            message: '流程图中存在循环依赖，这可能导致无限循环'
          })
          break
        }
      }
    }
  }

  /**
   * 验证审批节点配置
   */
  private static validateApprovalNodes(
    nodes: ApprovalNodeConfig[],
    warnings: ValidationWarning[]
  ): void {
    nodes
      .filter(node => node.type === 'approval')
      .forEach(node => {
        const approvers = node.properties?.approvers || []
        if (approvers.length === 0) {
          warnings.push({
            type: 'missing_approver',
            message: `审批节点"${node.text || node.id}"没有配置审批人`,
            nodeId: node.id
          })
        }
      })
  }

  /**
   * 验证条件节点配置
   */
  private static validateConditionNodes(
    nodes: ApprovalNodeConfig[],
    edges: ApprovalEdgeConfig[],
    warnings: ValidationWarning[]
  ): void {
    const conditionNodes = nodes.filter(node => node.type === 'condition')
    
    conditionNodes.forEach(node => {
      const outgoingEdges = edges.filter(edge => edge.sourceNodeId === node.id)
      const conditionEdges = outgoingEdges.filter(edge => edge.properties?.condition)

      if (outgoingEdges.length > 0 && conditionEdges.length === 0) {
        warnings.push({
          type: 'unused_condition',
          message: `条件节点"${node.text || node.id}"的输出边没有设置条件表达式`,
          nodeId: node.id
        })
      }
    })
  }
}

/**
 * 快速验证流程图
 */
export function validateFlowchart(data: FlowchartData): ValidationResult {
  return FlowchartValidator.validate(data)
}

/**
 * 检查流程图是否有效
 */
export function isValidFlowchart(data: FlowchartData): boolean {
  return FlowchartValidator.validate(data).valid
}
