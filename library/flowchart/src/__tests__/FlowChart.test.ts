/**
 * FlowChart 核心功能单元测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { FlowChart } from '../core/FlowChart';
import { FlowNode } from '../core/Node';
import { FlowEdge } from '../core/Edge';
import { NodeType, NodeStatus, EdgeType } from '../types';

describe('FlowChart', () => {
  let container: HTMLElement;
  let flowChart: FlowChart;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    // 创建流程图实例
    flowChart = new FlowChart({
      container,
      width: 800,
      height: 600,
      enableDrag: false,
      autoLayout: false
    });
  });

  afterEach(() => {
    // 清理
    flowChart.destroy();
    document.body.removeChild(container);
  });

  describe('节点管理', () => {
    test('应该能添加节点', () => {
      const nodeData = {
        id: 'node1',
        type: NodeType.PROCESS,
        label: '处理节点',
        position: { x: 100, y: 100 }
      };

      const node = flowChart.addNode(nodeData);
      
      expect(node).toBeInstanceOf(FlowNode);
      expect(node.id).toBe('node1');
      expect(node.type).toBe(NodeType.PROCESS);
      expect(node.label).toBe('处理节点');
      expect(flowChart.getNode('node1')).toBe(node);
    });

    test('不应该添加重复ID的节点', () => {
      const nodeData = {
        id: 'node1',
        type: NodeType.PROCESS,
        label: '节点1',
        position: { x: 100, y: 100 }
      };

      flowChart.addNode(nodeData);
      
      expect(() => {
        flowChart.addNode(nodeData);
      }).toThrow('Node with id node1 already exists');
    });

    test('应该能删除节点', () => {
      const node1 = flowChart.addNode({
        id: 'node1',
        type: NodeType.START,
        label: '开始',
        position: { x: 100, y: 100 }
      });

      const node2 = flowChart.addNode({
        id: 'node2',
        type: NodeType.END,
        label: '结束',
        position: { x: 300, y: 100 }
      });

      flowChart.addEdge({
        id: 'edge1',
        source: 'node1',
        target: 'node2'
      });

      const result = flowChart.removeNode('node1');
      
      expect(result).toBe(true);
      expect(flowChart.getNode('node1')).toBeUndefined();
      expect(flowChart.getEdge('edge1')).toBeUndefined();
    });

    test('应该能更新节点状态', () => {
      flowChart.addNode({
        id: 'node1',
        type: NodeType.APPROVAL,
        label: '审批',
        position: { x: 100, y: 100 },
        status: NodeStatus.PENDING
      });

      flowChart.updateNodeStatus('node1', NodeStatus.APPROVED);
      const node = flowChart.getNode('node1');
      
      expect(node?.status).toBe(NodeStatus.APPROVED);
    });
  });

  describe('边管理', () => {
    beforeEach(() => {
      // 添加测试节点
      flowChart.addNode({
        id: 'node1',
        type: NodeType.START,
        label: '开始',
        position: { x: 100, y: 100 }
      });

      flowChart.addNode({
        id: 'node2',
        type: NodeType.PROCESS,
        label: '处理',
        position: { x: 300, y: 100 }
      });

      flowChart.addNode({
        id: 'node3',
        type: NodeType.END,
        label: '结束',
        position: { x: 500, y: 100 }
      });
    });

    test('应该能添加边', () => {
      const edge = flowChart.addEdge({
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        label: '连接'
      });

      expect(edge).toBeInstanceOf(FlowEdge);
      expect(edge.id).toBe('edge1');
      expect(edge.source.id).toBe('node1');
      expect(edge.target.id).toBe('node2');
      expect(flowChart.getEdge('edge1')).toBe(edge);
    });

    test('不应该添加无效的边', () => {
      expect(() => {
        flowChart.addEdge({
          id: 'edge1',
          source: 'invalid',
          target: 'node2'
        });
      }).toThrow('Source node not found: invalid');

      expect(() => {
        flowChart.addEdge({
          id: 'edge1',
          source: 'node1',
          target: 'invalid'
        });
      }).toThrow('Target node not found: invalid');
    });

    test('应该能删除边', () => {
      flowChart.addEdge({
        id: 'edge1',
        source: 'node1',
        target: 'node2'
      });

      const result = flowChart.removeEdge('edge1');
      
      expect(result).toBe(true);
      expect(flowChart.getEdge('edge1')).toBeUndefined();
    });

    test('删除节点应同时删除相关的边', () => {
      flowChart.addEdge({
        id: 'edge1',
        source: 'node1',
        target: 'node2'
      });

      flowChart.addEdge({
        id: 'edge2',
        source: 'node2',
        target: 'node3'
      });

      flowChart.removeNode('node2');

      expect(flowChart.getEdge('edge1')).toBeUndefined();
      expect(flowChart.getEdge('edge2')).toBeUndefined();
    });
  });

  describe('流程图查询', () => {
    beforeEach(() => {
      // 创建测试流程图
      flowChart.addNode({
        id: 'start',
        type: NodeType.START,
        label: '开始',
        position: { x: 100, y: 100 }
      });

      flowChart.addNode({
        id: 'process1',
        type: NodeType.PROCESS,
        label: '处理1',
        position: { x: 300, y: 100 }
      });

      flowChart.addNode({
        id: 'condition',
        type: NodeType.CONDITION,
        label: '条件',
        position: { x: 500, y: 100 }
      });

      flowChart.addNode({
        id: 'process2',
        type: NodeType.PROCESS,
        label: '处理2',
        position: { x: 700, y: 50 }
      });

      flowChart.addNode({
        id: 'process3',
        type: NodeType.PROCESS,
        label: '处理3',
        position: { x: 700, y: 150 }
      });

      flowChart.addNode({
        id: 'end',
        type: NodeType.END,
        label: '结束',
        position: { x: 900, y: 100 }
      });

      // 添加边
      flowChart.addEdge({ id: 'e1', source: 'start', target: 'process1' });
      flowChart.addEdge({ id: 'e2', source: 'process1', target: 'condition' });
      flowChart.addEdge({ id: 'e3', source: 'condition', target: 'process2', label: '是' });
      flowChart.addEdge({ id: 'e4', source: 'condition', target: 'process3', label: '否' });
      flowChart.addEdge({ id: 'e5', source: 'process2', target: 'end' });
      flowChart.addEdge({ id: 'e6', source: 'process3', target: 'end' });
    });

    test('应该能找到起始节点', () => {
      const startNodes = flowChart.findStartNodes();
      
      expect(startNodes).toHaveLength(1);
      expect(startNodes[0].id).toBe('start');
    });

    test('应该能找到结束节点', () => {
      const endNodes = flowChart.findEndNodes();
      
      expect(endNodes).toHaveLength(1);
      expect(endNodes[0].id).toBe('end');
    });

    test('应该能获取后继节点', () => {
      const successors = flowChart.getSuccessors('condition');
      
      expect(successors).toHaveLength(2);
      expect(successors.map(n => n.id)).toContain('process2');
      expect(successors.map(n => n.id)).toContain('process3');
    });

    test('应该能获取前驱节点', () => {
      const predecessors = flowChart.getPredecessors('end');
      
      expect(predecessors).toHaveLength(2);
      expect(predecessors.map(n => n.id)).toContain('process2');
      expect(predecessors.map(n => n.id)).toContain('process3');
    });
  });

  describe('流程图验证', () => {
    test('应该验证有效的流程图', () => {
      flowChart.addNode({
        id: 'start',
        type: NodeType.START,
        label: '开始',
        position: { x: 100, y: 100 }
      });

      flowChart.addNode({
        id: 'process',
        type: NodeType.PROCESS,
        label: '处理',
        position: { x: 300, y: 100 }
      });

      flowChart.addNode({
        id: 'end',
        type: NodeType.END,
        label: '结束',
        position: { x: 500, y: 100 }
      });

      flowChart.addEdge({ id: 'e1', source: 'start', target: 'process' });
      flowChart.addEdge({ id: 'e2', source: 'process', target: 'end' });

      const validation = flowChart.validate();
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('应该检测缺少起始节点', () => {
      flowChart.addNode({
        id: 'process',
        type: NodeType.PROCESS,
        label: '处理',
        position: { x: 300, y: 100 }
      });

      const validation = flowChart.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('No start node found');
    });

    test('应该检测孤立节点', () => {
      flowChart.addNode({
        id: 'start',
        type: NodeType.START,
        label: '开始',
        position: { x: 100, y: 100 }
      });

      flowChart.addNode({
        id: 'isolated',
        type: NodeType.PROCESS,
        label: '孤立节点',
        position: { x: 300, y: 100 }
      });

      flowChart.addNode({
        id: 'end',
        type: NodeType.END,
        label: '结束',
        position: { x: 500, y: 100 }
      });

      flowChart.addEdge({ id: 'e1', source: 'start', target: 'end' });

      const validation = flowChart.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Isolated node found: isolated');
    });
  });

  describe('数据导入导出', () => {
    test('应该能导出JSON', () => {
      flowChart.addNode({
        id: 'node1',
        type: NodeType.START,
        label: '开始',
        position: { x: 100, y: 100 }
      });

      flowChart.addNode({
        id: 'node2',
        type: NodeType.END,
        label: '结束',
        position: { x: 300, y: 100 }
      });

      flowChart.addEdge({
        id: 'edge1',
        source: 'node1',
        target: 'node2'
      });

      const json = flowChart.toJSON();
      
      expect(json.nodes).toHaveLength(2);
      expect(json.edges).toHaveLength(1);
      expect(json.nodes[0].id).toBe('node1');
      expect(json.edges[0].id).toBe('edge1');
    });

    test('应该能从JSON加载', () => {
      const data = {
        nodes: [
          {
            id: 'node1',
            type: NodeType.START,
            label: '开始',
            position: { x: 100, y: 100 }
          },
          {
            id: 'node2',
            type: NodeType.END,
            label: '结束',
            position: { x: 300, y: 100 }
          }
        ],
        edges: [
          {
            id: 'edge1',
            source: 'node1',
            target: 'node2',
            label: '流程'
          }
        ]
      };

      flowChart.fromJSON(data);
      
      expect(flowChart.getAllNodes()).toHaveLength(2);
      expect(flowChart.getAllEdges()).toHaveLength(1);
      expect(flowChart.getNode('node1')).toBeDefined();
      expect(flowChart.getEdge('edge1')).toBeDefined();
    });
  });
});