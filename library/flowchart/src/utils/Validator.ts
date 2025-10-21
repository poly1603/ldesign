/**
 * 数据验证器
 */

import { NodeConfig, EdgeConfig } from '../types/model';

export class Validator {
  /**
   * 验证节点配置
   */
  static validateNode(config: NodeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.id) {
      errors.push('Node id is required');
    }

    if (typeof config.id !== 'string') {
      errors.push('Node id must be a string');
    }

    if (config.x !== undefined && typeof config.x !== 'number') {
      errors.push('Node x must be a number');
    }

    if (config.y !== undefined && typeof config.y !== 'number') {
      errors.push('Node y must be a number');
    }

    if (config.width !== undefined && (typeof config.width !== 'number' || config.width <= 0)) {
      errors.push('Node width must be a positive number');
    }

    if (config.height !== undefined && (typeof config.height !== 'number' || config.height <= 0)) {
      errors.push('Node height must be a positive number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证边配置
   */
  static validateEdge(config: EdgeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.id) {
      errors.push('Edge id is required');
    }

    if (typeof config.id !== 'string') {
      errors.push('Edge id must be a string');
    }

    if (!config.source) {
      errors.push('Edge source is required');
    }

    if (typeof config.source !== 'string') {
      errors.push('Edge source must be a string');
    }

    if (!config.target) {
      errors.push('Edge target is required');
    }

    if (typeof config.target !== 'string') {
      errors.push('Edge target must be a string');
    }

    if (config.source === config.target) {
      errors.push('Edge source and target cannot be the same');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证图数据
   */
  static validateGraphData(data: { nodes: NodeConfig[]; edges: EdgeConfig[] }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.nodes || !Array.isArray(data.nodes)) {
      errors.push('Nodes must be an array');
      return { valid: false, errors };
    }

    if (!data.edges || !Array.isArray(data.edges)) {
      errors.push('Edges must be an array');
      return { valid: false, errors };
    }

    // 验证节点ID唯一性
    const nodeIds = new Set<string>();
    data.nodes.forEach((node, index) => {
      const result = this.validateNode(node);
      if (!result.valid) {
        errors.push(`Node[${index}]: ${result.errors.join(', ')}`);
      }
      if (node.id && nodeIds.has(node.id)) {
        errors.push(`Duplicate node id: ${node.id}`);
      }
      nodeIds.add(node.id);
    });

    // 验证边
    data.edges.forEach((edge, index) => {
      const result = this.validateEdge(edge);
      if (!result.valid) {
        errors.push(`Edge[${index}]: ${result.errors.join(', ')}`);
      }
      // 验证边的source和target是否存在
      if (edge.source && !nodeIds.has(edge.source)) {
        errors.push(`Edge[${index}]: source node "${edge.source}" not found`);
      }
      if (edge.target && !nodeIds.has(edge.target)) {
        errors.push(`Edge[${index}]: target node "${edge.target}" not found`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}


