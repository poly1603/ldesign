/**
 * 节点工厂
 * 负责创建和管理各种类型的节点
 */

import type { NodeFactory as INodeFactory, NodeData } from '@/types/index.js';
import { NodeType } from '@/types/index.js';
import { BaseNode } from './BaseNode.js';
import { StartNode } from './StartNode.js';
import { EndNode } from './EndNode.js';
import { ProcessNode } from './ProcessNode.js';
import { DecisionNode } from './DecisionNode.js';
import { ApprovalNode } from './ApprovalNode.js';

/**
 * 节点构造函数类型
 */
type NodeConstructor = new (data: any) => BaseNode;

/**
 * 节点工厂类
 */
export class NodeFactory implements INodeFactory {
  private nodeTypes: Map<NodeType, NodeConstructor> = new Map();

  constructor() {
    // 注册内置节点类型
    this.registerBuiltinNodeTypes();
  }

  /**
   * 注册内置节点类型
   */
  private registerBuiltinNodeTypes(): void {
    this.nodeTypes.set(NodeType.START, StartNode);
    this.nodeTypes.set(NodeType.END, EndNode);
    this.nodeTypes.set(NodeType.PROCESS, ProcessNode);
    this.nodeTypes.set(NodeType.DECISION, DecisionNode as any);
    this.nodeTypes.set(NodeType.APPROVAL, ApprovalNode as any);
  }

  /**
   * 创建节点
   */
  createNode(type: NodeType, data: Partial<NodeData>): BaseNode {
    const NodeClass = this.nodeTypes.get(type);
    if (!NodeClass) {
      throw new Error(`不支持的节点类型: ${type}`);
    }

    // 确保必要的字段存在
    const nodeData: NodeData = {
      id: data.id || this.generateNodeId(type),
      type: type,
      position: data.position || { x: 0, y: 0 },
      size: data.size || { width: 100, height: 60 },
      label: data.label || this.getDefaultLabel(type),
      style: data.style || {},
      properties: data.properties || {}
    };

    return new NodeClass(nodeData);
  }

  /**
   * 注册节点类型
   */
  registerNodeType(type: NodeType, nodeClass: NodeConstructor): void {
    this.nodeTypes.set(type, nodeClass);
  }

  /**
   * 获取支持的节点类型
   */
  getSupportedTypes(): NodeType[] {
    return Array.from(this.nodeTypes.keys());
  }

  /**
   * 检查是否支持指定的节点类型
   */
  isSupported(type: NodeType): boolean {
    return this.nodeTypes.has(type);
  }

  /**
   * 获取节点类型的默认配置
   */
  getDefaultNodeConfig(type: NodeType): Partial<NodeData> {
    switch (type) {
      case NodeType.START:
        return {
          size: { width: 80, height: 80 },
          label: '开始',
          style: {
            fillColor: 'var(--ldesign-success-color-1)',
            strokeColor: 'var(--ldesign-success-color)',
            strokeWidth: 2
          }
        };

      case NodeType.END:
        return {
          size: { width: 80, height: 80 },
          label: '结束',
          style: {
            fillColor: 'var(--ldesign-error-color-1)',
            strokeColor: 'var(--ldesign-error-color)',
            strokeWidth: 2
          }
        };

      case NodeType.PROCESS:
        return {
          size: { width: 120, height: 60 },
          label: '处理',
          style: {
            fillColor: 'var(--ldesign-brand-color-1)',
            strokeColor: 'var(--ldesign-brand-color)',
            strokeWidth: 2
          }
        };

      case NodeType.DECISION:
        return {
          size: { width: 100, height: 80 },
          label: '决策',
          style: {
            fillColor: 'var(--ldesign-warning-color-1)',
            strokeColor: 'var(--ldesign-warning-color)',
            strokeWidth: 2
          }
        };

      case NodeType.APPROVAL:
        return {
          size: { width: 120, height: 80 },
          label: '审批',
          style: {
            fillColor: 'var(--ldesign-brand-color-1)',
            strokeColor: 'var(--ldesign-brand-color)',
            strokeWidth: 2
          },
          properties: {
            approvalConfig: {
              type: 'single',
              approvers: []
            }
          }
        };

      default:
        return {
          size: { width: 100, height: 60 },
          label: '节点',
          style: {
            fillColor: 'var(--ldesign-gray-color-1)',
            strokeColor: 'var(--ldesign-gray-color-5)',
            strokeWidth: 2
          }
        };
    }
  }

  /**
   * 创建带有默认配置的节点
   */
  createDefaultNode(type: NodeType, position: { x: number; y: number }): BaseNode {
    const defaultConfig = this.getDefaultNodeConfig(type);
    const nodeData: Partial<NodeData> = {
      ...defaultConfig,
      position,
      id: this.generateNodeId(type)
    };

    return this.createNode(type, nodeData);
  }

  /**
   * 生成节点ID
   */
  private generateNodeId(type: NodeType): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${type}_${timestamp}_${random}`;
  }


  /**
   * 批量创建节点
   */
  createNodes(nodesData: Partial<NodeData>[]): BaseNode[] {
    const nodes: BaseNode[] = [];

    for (const data of nodesData) {
      try {
        if (!data.type || !data.position || !data.label) continue;
        const node = this.createNode(data.type as NodeType, data);
        nodes.push(node);
      } catch (error) {
        console.warn('创建节点失败:', error);
      }
    }

    return nodes;
  }

  /**
   * 获取节点类型信息
   */
  getNodeTypeInfo(type: NodeType) {
    const defaultConfig = this.getDefaultNodeConfig(type);

    switch (type) {
      case NodeType.START:
        return {
          type,
          name: '开始节点',
          description: '流程的起始点',
          category: '控制节点',
          icon: '⭕',
          defaultConfig
        };
      case NodeType.END:
        return {
          type,
          name: '结束节点',
          description: '流程的终止点',
          category: '控制节点',
          icon: '⛔',
          defaultConfig
        };
      case NodeType.PROCESS:
        return {
          type,
          name: '处理节点',
          description: '一般的处理步骤',
          category: '处理节点',
          icon: '■️',
          defaultConfig
        };
      case NodeType.DECISION:
        return {
          type,
          name: '决策节点',
          description: '条件判断分支',
          category: '处理节点',
          icon: '◆️',
          defaultConfig
        };
      case NodeType.APPROVAL:
        return {
          type,
          name: '审批节点',
          description: 'OA系统专用的审批节点',
          category: 'OA节点',
          icon: '✅',
          defaultConfig
        };
      default:
        return {
          type,
          name: '未知节点',
          description: '',
          category: '基础节点',
          icon: '❓',
          defaultConfig
        };
    }
  }

  /**
   * 获取所有节点类型信息
   */
  getAllNodeTypeInfo() {
    return this.getSupportedTypes().map(type => this.getNodeTypeInfo(type));
  }

  /**
   * 获取默认标签
   */
  private getDefaultLabel(type: NodeType): string {
    switch (type) {
      case NodeType.START:
        return '开始';
      case NodeType.END:
        return '结束';
      case NodeType.PROCESS:
        return '处理';
      case NodeType.DECISION:
        return '决策';
      case NodeType.APPROVAL:
        return '审批';
      case NodeType.TASK:
        return '任务';
      case NodeType.USER_TASK:
        return '用户任务';
      case NodeType.SERVICE_TASK:
        return '服务任务';
      case NodeType.SCRIPT_TASK:
        return '脚本任务';
      case NodeType.MANUAL_TASK:
        return '手工任务';
      case NodeType.SUBPROCESS:
        return '子流程';
      case NodeType.PARALLEL_GATEWAY:
        return '并行网关';
      case NodeType.EXCLUSIVE_GATEWAY:
        return '排他网关';
      case NodeType.INCLUSIVE_GATEWAY:
        return '包容网关';
      case NodeType.EVENT:
        return '事件';
      default:
        return '节点';
    }
  }

  /**
   * 克隆节点
   */
  cloneNode(node: BaseNode): BaseNode {
    const nodeData = node.getData();
    const clonedData: NodeData = {
      ...nodeData,
      id: this.generateNodeId(nodeData.type as NodeType),
      position: {
        x: nodeData.position.x,
        y: nodeData.position.y
      }
    };

    return this.createNode(nodeData.type as NodeType, clonedData);
  }

  /**
   * 验证节点数据
   */
  validateNodeData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查必要字段
    if (!data.id) {
      errors.push('节点ID不能为空');
    }

    if (!data.type) {
      errors.push('节点类型不能为空');
    } else if (!this.isSupported(data.type as NodeType)) {
      errors.push(`不支持的节点类型: ${data.type}`);
    }

    if (!data.position) {
      errors.push('节点位置不能为空');
    }

    if (!data.label) {
      errors.push('节点标签不能为空');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
