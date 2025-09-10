/**
 * 节点工厂测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NodeFactory } from '@/nodes/NodeFactory.js';
import { StartNode, EndNode, ProcessNode, DecisionNode, ApprovalNode } from '@/nodes/index.js';
import { NodeType } from '@/types/index.js';
import type { NodeData } from '@/types/index.js';

describe('NodeFactory', () => {
  let nodeFactory: NodeFactory;

  beforeEach(() => {
    nodeFactory = new NodeFactory();
  });

  describe('节点创建', () => {
    it('应该能够创建开始节点', () => {
      const nodeData: Partial<NodeData> = {
        position: { x: 100, y: 100 },
        label: '开始'
      };

      const node = nodeFactory.createNode(NodeType.START, nodeData);
      
      expect(node).toBeInstanceOf(StartNode);
      expect(node.type).toBe(NodeType.START);
      expect(node.position).toEqual({ x: 100, y: 100 });
      expect(node.label).toBe('开始');
    });

    it('应该能够创建结束节点', () => {
      const nodeData: Partial<NodeData> = {
        position: { x: 200, y: 200 },
        label: '结束'
      };

      const node = nodeFactory.createNode(NodeType.END, nodeData);
      
      expect(node).toBeInstanceOf(EndNode);
      expect(node.type).toBe(NodeType.END);
      expect(node.position).toEqual({ x: 200, y: 200 });
      expect(node.label).toBe('结束');
    });

    it('应该能够创建处理节点', () => {
      const nodeData: Partial<NodeData> = {
        position: { x: 150, y: 150 },
        label: '处理'
      };

      const node = nodeFactory.createNode(NodeType.PROCESS, nodeData);
      
      expect(node).toBeInstanceOf(ProcessNode);
      expect(node.type).toBe(NodeType.PROCESS);
      expect(node.position).toEqual({ x: 150, y: 150 });
      expect(node.label).toBe('处理');
    });

    it('应该能够创建决策节点', () => {
      const nodeData: Partial<NodeData> = {
        position: { x: 175, y: 175 },
        label: '决策'
      };

      const node = nodeFactory.createNode(NodeType.DECISION, nodeData);
      
      expect(node).toBeInstanceOf(DecisionNode);
      expect(node.type).toBe(NodeType.DECISION);
      expect(node.position).toEqual({ x: 175, y: 175 });
      expect(node.label).toBe('决策');
    });

    it('应该能够创建审批节点', () => {
      const nodeData: Partial<NodeData> = {
        position: { x: 125, y: 125 },
        label: '审批'
      };

      const node = nodeFactory.createNode(NodeType.APPROVAL, nodeData);
      
      expect(node).toBeInstanceOf(ApprovalNode);
      expect(node.type).toBe(NodeType.APPROVAL);
      expect(node.position).toEqual({ x: 125, y: 125 });
      expect(node.label).toBe('审批');
    });

    it('应该在创建不支持的节点类型时抛出错误', () => {
      expect(() => {
        nodeFactory.createNode('unsupported' as NodeType, {});
      }).toThrow('不支持的节点类型');
    });
  });

  describe('默认配置', () => {
    it('应该为开始节点提供正确的默认配置', () => {
      const config = nodeFactory.getDefaultNodeConfig(NodeType.START);
      
      expect(config.size).toEqual({ width: 80, height: 80 });
      expect(config.style?.fillColor).toBe('var(--ldesign-success-color-1)');
      expect(config.style?.strokeColor).toBe('var(--ldesign-success-color)');
    });

    it('应该为结束节点提供正确的默认配置', () => {
      const config = nodeFactory.getDefaultNodeConfig(NodeType.END);
      
      expect(config.size).toEqual({ width: 80, height: 80 });
      expect(config.style?.fillColor).toBe('var(--ldesign-error-color-1)');
      expect(config.style?.strokeColor).toBe('var(--ldesign-error-color)');
    });

    it('应该为处理节点提供正确的默认配置', () => {
      const config = nodeFactory.getDefaultNodeConfig(NodeType.PROCESS);
      
      expect(config.size).toEqual({ width: 120, height: 60 });
      expect(config.style?.fillColor).toBe('var(--ldesign-brand-color-1)');
      expect(config.style?.strokeColor).toBe('var(--ldesign-brand-color)');
    });

    it('应该为决策节点提供正确的默认配置', () => {
      const config = nodeFactory.getDefaultNodeConfig(NodeType.DECISION);
      
      expect(config.size).toEqual({ width: 100, height: 80 });
      expect(config.style?.fillColor).toBe('var(--ldesign-warning-color-1)');
      expect(config.style?.strokeColor).toBe('var(--ldesign-warning-color)');
    });

    it('应该为审批节点提供正确的默认配置', () => {
      const config = nodeFactory.getDefaultNodeConfig(NodeType.APPROVAL);
      
      expect(config.size).toEqual({ width: 120, height: 80 });
      expect(config.style?.fillColor).toBe('var(--ldesign-brand-color-1)');
      expect(config.style?.strokeColor).toBe('var(--ldesign-brand-color)');
    });
  });

  describe('节点验证', () => {
    it('应该验证节点数据的有效性', () => {
      const validData: NodeData = {
        id: 'node1',
        type: NodeType.START,
        position: { x: 100, y: 100 },
        label: '开始节点',
        properties: {}
      };

      const result = nodeFactory.validateNodeData(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测缺少必需字段的节点数据', () => {
      const invalidData = {
        type: NodeType.START,
        // 缺少 id, position, label
      } as NodeData;

      const result = nodeFactory.validateNodeData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('节点ID不能为空');
      expect(result.errors).toContain('节点位置不能为空');
      expect(result.errors).toContain('节点标签不能为空');
    });

    it('应该检测不支持的节点类型', () => {
      const invalidData: NodeData = {
        id: 'node1',
        type: 'invalid' as NodeType,
        position: { x: 100, y: 100 },
        label: '节点',
        properties: {}
      };

      const result = nodeFactory.validateNodeData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('不支持的节点类型: invalid');
    });
  });

  describe('支持的节点类型', () => {
    it('应该返回所有支持的节点类型', () => {
      const supportedTypes = nodeFactory.getSupportedTypes();
      
      expect(supportedTypes).toContain(NodeType.START);
      expect(supportedTypes).toContain(NodeType.END);
      expect(supportedTypes).toContain(NodeType.PROCESS);
      expect(supportedTypes).toContain(NodeType.DECISION);
      expect(supportedTypes).toContain(NodeType.APPROVAL);
    });

    it('应该正确检查节点类型是否支持', () => {
      expect(nodeFactory.isSupported(NodeType.START)).toBe(true);
      expect(nodeFactory.isSupported(NodeType.END)).toBe(true);
      expect(nodeFactory.isSupported(NodeType.PROCESS)).toBe(true);
      expect(nodeFactory.isSupported(NodeType.DECISION)).toBe(true);
      expect(nodeFactory.isSupported(NodeType.APPROVAL)).toBe(true);
      expect(nodeFactory.isSupported('unsupported' as NodeType)).toBe(false);
    });
  });

  describe('节点克隆', () => {
    it('应该能够克隆节点', () => {
      const originalNode = nodeFactory.createNode(NodeType.START, {
        position: { x: 100, y: 100 },
        label: '原始节点'
      });

      const clonedNode = nodeFactory.cloneNode(originalNode);
      
      expect(clonedNode).not.toBe(originalNode);
      expect(clonedNode.type).toBe(originalNode.type);
      expect(clonedNode.position).toEqual(originalNode.position);
      expect(clonedNode.label).toBe(originalNode.label);
      expect(clonedNode.id).not.toBe(originalNode.id); // ID应该不同
    });
  });

  describe('批量创建', () => {
    it('应该能够批量创建节点', () => {
      const nodesData: Partial<NodeData>[] = [
        {
          type: NodeType.START,
          position: { x: 100, y: 100 },
          label: '开始'
        },
        {
          type: NodeType.PROCESS,
          position: { x: 200, y: 100 },
          label: '处理'
        },
        {
          type: NodeType.END,
          position: { x: 300, y: 100 },
          label: '结束'
        }
      ];

      const nodes = nodeFactory.createNodes(nodesData);
      
      expect(nodes).toHaveLength(3);
      expect(nodes[0]).toBeInstanceOf(StartNode);
      expect(nodes[1]).toBeInstanceOf(ProcessNode);
      expect(nodes[2]).toBeInstanceOf(EndNode);
    });

    it('应该在批量创建时跳过无效的节点数据', () => {
      const nodesData: Partial<NodeData>[] = [
        {
          type: NodeType.START,
          position: { x: 100, y: 100 },
          label: '开始'
        },
        {
          // 无效数据：缺少必需字段
          type: NodeType.PROCESS
        },
        {
          type: NodeType.END,
          position: { x: 300, y: 100 },
          label: '结束'
        }
      ];

      const nodes = nodeFactory.createNodes(nodesData);
      
      expect(nodes).toHaveLength(2); // 只创建了有效的节点
      expect(nodes[0]).toBeInstanceOf(StartNode);
      expect(nodes[1]).toBeInstanceOf(EndNode);
    });
  });

  describe('节点类型信息', () => {
    it('应该返回正确的节点类型信息', () => {
      const startInfo = nodeFactory.getNodeTypeInfo(NodeType.START);
      
      expect(startInfo.name).toBe('开始节点');
      expect(startInfo.description).toBe('流程的起始点');
      expect(startInfo.category).toBe('控制节点');
      expect(startInfo.icon).toBe('⭕');
    });

    it('应该为所有支持的节点类型返回信息', () => {
      const supportedTypes = nodeFactory.getSupportedTypes();
      
      for (const type of supportedTypes) {
        const info = nodeFactory.getNodeTypeInfo(type);
        expect(info.name).toBeDefined();
        expect(info.description).toBeDefined();
        expect(info.category).toBeDefined();
      }
    });
  });
});
