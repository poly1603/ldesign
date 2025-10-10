import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApprovalFlowEditor } from '../src/core/ApprovalFlowEditor';
import { ApprovalNodeType, FlowChartData } from '../src/types';

describe('ApprovalFlowEditor', () => {
  let container: HTMLDivElement;
  let editor: ApprovalFlowEditor;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // 创建编辑器实例
    editor = new ApprovalFlowEditor({
      container,
      width: 800,
      height: 600,
    });
  });

  afterEach(() => {
    // 清理
    if (editor) {
      editor.destroy();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('初始化', () => {
    it('应该成功创建编辑器实例', () => {
      expect(editor).toBeDefined();
      expect(editor.getLogicFlow()).toBeTruthy();
    });

    it('应该设置正确的容器尺寸', () => {
      expect(container.style.width).toBe('800px');
      expect(container.style.height).toBe('600px');
    });
  });

  describe('数据操作', () => {
    const testData: FlowChartData = {
      nodes: [
        {
          id: 'start-1',
          type: ApprovalNodeType.START,
          name: '开始',
        },
        {
          id: 'approval-1',
          type: ApprovalNodeType.APPROVAL,
          name: '审批',
          approvalMode: 'single' as any,
          approvers: [{ id: '1', name: '张三' }],
        },
        {
          id: 'end-1',
          type: ApprovalNodeType.END,
          name: '结束',
        },
      ],
      edges: [
        {
          id: 'edge-1',
          sourceNodeId: 'start-1',
          targetNodeId: 'approval-1',
        },
        {
          id: 'edge-2',
          sourceNodeId: 'approval-1',
          targetNodeId: 'end-1',
        },
      ],
    };

    it('应该能够设置数据', () => {
      editor.setData(testData);
      const data = editor.getData();
      expect(data.nodes.length).toBe(3);
      expect(data.edges.length).toBe(2);
    });

    it('应该能够获取数据', () => {
      editor.setData(testData);
      const data = editor.getData();
      expect(data).toBeDefined();
      expect(data.nodes).toBeDefined();
      expect(data.edges).toBeDefined();
    });
  });

  describe('节点操作', () => {
    it('应该能够添加节点', () => {
      const nodeId = editor.addNode({
        type: ApprovalNodeType.APPROVAL,
        name: '新审批节点',
      });

      expect(nodeId).toBeDefined();
      const data = editor.getData();
      expect(data.nodes.length).toBe(1);
    });

    it('应该能够更新节点', () => {
      const nodeId = editor.addNode({
        type: ApprovalNodeType.APPROVAL,
        name: '审批节点',
      });

      editor.updateNode(nodeId, {
        name: '更新后的节点',
      });

      const data = editor.getData();
      const node = data.nodes.find(n => n.id === nodeId);
      expect(node?.name).toBe('更新后的节点');
    });

    it('应该能够删除节点', () => {
      const nodeId = editor.addNode({
        type: ApprovalNodeType.APPROVAL,
        name: '审批节点',
      });

      editor.deleteNode(nodeId);

      const data = editor.getData();
      expect(data.nodes.length).toBe(0);
    });
  });

  describe('验证', () => {
    it('应该验证缺少开始节点', () => {
      editor.setData({
        nodes: [
          {
            id: 'approval-1',
            type: ApprovalNodeType.APPROVAL,
            name: '审批',
          },
          {
            id: 'end-1',
            type: ApprovalNodeType.END,
            name: '结束',
          },
        ],
        edges: [],
      });

      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'missing-start')).toBe(true);
    });

    it('应该验证缺少结束节点', () => {
      editor.setData({
        nodes: [
          {
            id: 'start-1',
            type: ApprovalNodeType.START,
            name: '开始',
          },
          {
            id: 'approval-1',
            type: ApprovalNodeType.APPROVAL,
            name: '审批',
          },
        ],
        edges: [],
      });

      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'missing-end')).toBe(true);
    });

    it('应该验证审批节点缺少审批人', () => {
      editor.setData({
        nodes: [
          {
            id: 'start-1',
            type: ApprovalNodeType.START,
            name: '开始',
          },
          {
            id: 'approval-1',
            type: ApprovalNodeType.APPROVAL,
            name: '审批',
            approvers: [],
          },
          {
            id: 'end-1',
            type: ApprovalNodeType.END,
            name: '结束',
          },
        ],
        edges: [],
      });

      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'missing-approvers')).toBe(true);
    });

    it('应该验证通过完整的流程', () => {
      editor.setData({
        nodes: [
          {
            id: 'start-1',
            type: ApprovalNodeType.START,
            name: '开始',
          },
          {
            id: 'approval-1',
            type: ApprovalNodeType.APPROVAL,
            name: '审批',
            approvers: [{ id: '1', name: '张三' }],
          },
          {
            id: 'end-1',
            type: ApprovalNodeType.END,
            name: '结束',
          },
        ],
        edges: [
          {
            id: 'edge-1',
            sourceNodeId: 'start-1',
            targetNodeId: 'approval-1',
          },
          {
            id: 'edge-2',
            sourceNodeId: 'approval-1',
            targetNodeId: 'end-1',
          },
        ],
      });

      const result = editor.validate();
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('只读模式', () => {
    it('应该能够切换到只读模式', () => {
      editor.setReadonly(true);
      // 验证只读模式已设置
      // 注意：这里需要根据实际实现验证
    });

    it('应该能够切换回编辑模式', () => {
      editor.setReadonly(true);
      editor.setReadonly(false);
      // 验证编辑模式已恢复
    });
  });

  describe('事件', () => {
    it('应该能够监听节点点击事件', () => {
      const handler = vi.fn();
      editor.on('node:click', handler);

      // 添加节点并触发点击
      const nodeId = editor.addNode({
        type: ApprovalNodeType.APPROVAL,
        name: '审批节点',
      });

      // 模拟点击事件
      const lf = editor.getLogicFlow();
      if (lf) {
        const node = lf.getNodeDataById(nodeId);
        lf.emit('node:click', { data: node });
      }

      expect(handler).toHaveBeenCalled();
    });

    it('应该能够移除事件监听', () => {
      const handler = vi.fn();
      editor.on('node:click', handler);
      editor.off('node:click');

      // 模拟点击事件
      const nodeId = editor.addNode({
        type: ApprovalNodeType.APPROVAL,
        name: '审批节点',
      });

      const lf = editor.getLogicFlow();
      if (lf) {
        const node = lf.getNodeDataById(nodeId);
        lf.emit('node:click', { data: node });
      }

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('缩放操作', () => {
    it('应该能够放大画布', () => {
      editor.zoomIn();
      // 验证缩放已改变
    });

    it('应该能够缩小画布', () => {
      editor.zoomOut();
      // 验证缩放已改变
    });

    it('应该能够重置缩放', () => {
      editor.zoomIn();
      editor.resetZoom();
      // 验证缩放已重置
    });
  });

  describe('清空和销毁', () => {
    it('应该能够清空画布', () => {
      editor.setData({
        nodes: [
          {
            id: 'start-1',
            type: ApprovalNodeType.START,
            name: '开始',
          },
        ],
        edges: [],
      });

      editor.clear();

      const data = editor.getData();
      expect(data.nodes.length).toBe(0);
      expect(data.edges.length).toBe(0);
    });

    it('应该能够销毁编辑器', () => {
      editor.destroy();
      expect(editor.getLogicFlow()).toBeNull();
    });
  });
});
