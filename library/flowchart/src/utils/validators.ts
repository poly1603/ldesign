import { NodeData, EdgeData, NodeType } from '../types';

/**
 * 验证节点数据
 */
export function validateNodeData(data: NodeData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.id || typeof data.id !== 'string') {
    errors.push('节点ID必须是非空字符串');
  }

  if (!data.type || !Object.values(NodeType).includes(data.type)) {
    errors.push('节点类型无效');
  }

  if (!data.label || typeof data.label !== 'string') {
    errors.push('节点标签必须是非空字符串');
  }

  if (!data.position || typeof data.position.x !== 'number' || typeof data.position.y !== 'number') {
    errors.push('节点位置必须包含有效的 x 和 y 坐标');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证边数据
 */
export function validateEdgeData(data: EdgeData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.id || typeof data.id !== 'string') {
    errors.push('边ID必须是非空字符串');
  }

  if (!data.source || typeof data.source !== 'string') {
    errors.push('源节点ID必须是非空字符串');
  }

  if (!data.target || typeof data.target !== 'string') {
    errors.push('目标节点ID必须是非空字符串');
  }

  if (data.source === data.target) {
    errors.push('源节点和目标节点不能相同');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 检查是否存在循环依赖
 */
export function hasCycle(nodes: Map<string, any>): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = nodes.get(nodeId);
    if (node) {
      const outputs = node.getOutputs();
      for (const output of outputs) {
        if (!visited.has(output.id)) {
          if (dfs(output.id)) {
            return true;
          }
        } else if (recursionStack.has(output.id)) {
          return true;
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const [nodeId] of nodes) {
    if (!visited.has(nodeId)) {
      if (dfs(nodeId)) {
        return true;
      }
    }
  }

  return false;
}


