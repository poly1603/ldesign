import { NodeData, EdgeData, NodeType, EdgeType } from '../types';

/**
 * 工作流节点定义（来自流程引擎）
 */
export interface WorkflowNode {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  next?: string;
  actions?: Array<{ action: string; actionName: string; next: string }>;
  conditions?: Array<{ conditionName: string; expression: string; next: string }>;
  [key: string]: any;
}

/**
 * 工作流定义（来自流程引擎）
 */
export interface WorkflowDefinition {
  processDefinitionId?: string;
  processDefinitionKey?: string;
  processDefinitionName?: string;
  version?: number;
  category?: string;
  nodes: WorkflowNode[];
  [key: string]: any;
}

/**
 * 将工作流数据转换为流程图格式
 */
export function convertWorkflowToFlowChart(
  processDefinition: WorkflowDefinition
): { nodes: NodeData[]; edges: EdgeData[] } {
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];

  // 转换节点
  processDefinition.nodes?.forEach((node, index) => {
    nodes.push({
      id: node.nodeId,
      type: mapNodeType(node.nodeType),
      label: node.nodeName,
      position: { x: 0, y: index * 100 },
      data: node
    });
  });

  // 转换连线
  processDefinition.nodes?.forEach(node => {
    // 简单流转
    if (node.next) {
      edges.push({
        id: `edge_${node.nodeId}_${node.next}`,
        source: node.nodeId,
        target: node.next,
        style: {
          type: EdgeType.POLYLINE,
          radius: 10,
          strokeWidth: 2,
          strokeColor: '#666'
        }
      });
    }

    // 审批动作
    node.actions?.forEach(action => {
      if (action.next) {
        edges.push({
          id: `edge_${node.nodeId}_${action.action}_${action.next}`,
          source: node.nodeId,
          target: action.next,
          label: action.actionName,
          style: {
            type: EdgeType.POLYLINE,
            radius: 10,
            strokeWidth: 2
          }
        });
      }
    });

    // 条件分支
    node.conditions?.forEach((condition, index) => {
      edges.push({
        id: `edge_${node.nodeId}_cond_${index}_${condition.next}`,
        source: node.nodeId,
        target: condition.next,
        label: condition.conditionName,
        style: {
          type: EdgeType.POLYLINE,
          radius: 10,
          strokeWidth: 2
        }
      });
    });
  });

  return { nodes, edges };
}

/**
 * 映射节点类型
 */
function mapNodeType(nodeType: string): NodeType {
  const typeMap: Record<string, NodeType> = {
    'start': NodeType.START,
    'end': NodeType.END,
    'approval': NodeType.APPROVAL,
    'process': NodeType.PROCESS,
    'condition': NodeType.CONDITION,
    'parallel': NodeType.PARALLEL,
    'merge': NodeType.MERGE
  };
  return typeMap[nodeType] || NodeType.PROCESS;
}









