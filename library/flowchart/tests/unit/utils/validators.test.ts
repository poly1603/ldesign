import { describe, it, expect } from 'vitest';
import { validateNodeData, validateEdgeData } from '@/utils/validators';
import { NodeType } from '@/types';

describe('validators', () => {
  describe('validateNodeData', () => {
    it('应该验证有效的节点数据', () => {
      const nodeData = {
        id: 'node1',
        type: NodeType.START,
        label: '开始',
        position: { x: 0, y: 0 }
      };

      const result = validateNodeData(nodeData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测缺失的节点ID', () => {
      const nodeData = {
        id: '',
        type: NodeType.START,
        label: '开始',
        position: { x: 0, y: 0 }
      };

      const result = validateNodeData(nodeData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('节点ID必须是非空字符串');
    });

    it('应该检测无效的节点类型', () => {
      const nodeData = {
        id: 'node1',
        type: 'invalid' as any,
        label: '开始',
        position: { x: 0, y: 0 }
      };

      const result = validateNodeData(nodeData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('节点类型无效');
    });

    it('应该检测缺失的节点位置', () => {
      const nodeData = {
        id: 'node1',
        type: NodeType.START,
        label: '开始',
        position: { x: 0 } as any
      };

      const result = validateNodeData(nodeData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('节点位置必须包含有效的 x 和 y 坐标');
    });
  });

  describe('validateEdgeData', () => {
    it('应该验证有效的边数据', () => {
      const edgeData = {
        id: 'edge1',
        source: 'node1',
        target: 'node2'
      };

      const result = validateEdgeData(edgeData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测源节点和目标节点相同', () => {
      const edgeData = {
        id: 'edge1',
        source: 'node1',
        target: 'node1'
      };

      const result = validateEdgeData(edgeData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('源节点和目标节点不能相同');
    });

    it('应该检测缺失的边ID', () => {
      const edgeData = {
        id: '',
        source: 'node1',
        target: 'node2'
      };

      const result = validateEdgeData(edgeData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('边ID必须是非空字符串');
    });
  });
});

