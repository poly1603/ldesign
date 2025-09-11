/**
 * 流程图编辑器集成测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowchartEditor } from '@/FlowchartEditor.js';
import type { FlowchartEditorConfig, FlowchartData } from '@/types/index.js';

describe('FlowchartEditor 集成测试', () => {
  let container: HTMLElement;
  let editor: FlowchartEditor;

  beforeEach(() => {
    // 创建容器元素
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('编辑器初始化', () => {
    it('应该能够正确初始化编辑器', () => {
      const config: FlowchartEditorConfig = {
        container,
        width: 800,
        height: 600
      };

      editor = new FlowchartEditor(config);
      
      expect(editor).toBeDefined();
      expect(container.children.length).toBeGreaterThan(0);
    });

    it('应该能够使用初始数据初始化编辑器', () => {
      const initialData: FlowchartData = {
        nodes: [
          {
            id: 'start',
            type: 'start',
            position: { x: 100, y: 100 },
            label: '开始',
            properties: {}
          },
          {
            id: 'end',
            type: 'end',
            position: { x: 300, y: 100 },
            label: '结束',
            properties: {}
          }
        ],
        edges: [
          {
            id: 'edge1',
            type: 'straight',
            source: 'start',
            target: 'end',
            properties: {}
          }
        ],
        metadata: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      const config: FlowchartEditorConfig = {
        container,
        data: initialData
      };

      editor = new FlowchartEditor(config);
      
      const data = editor.getData();
      expect(data.nodes).toHaveLength(2);
      expect(data.edges).toHaveLength(1);
    });

    it('应该能够禁用工具栏和属性面板', () => {
      const config: FlowchartEditorConfig = {
        container,
        toolbar: false,
        propertyPanel: false
      };

      editor = new FlowchartEditor(config);
      
      expect(editor).toBeDefined();
      // 验证工具栏和属性面板没有被创建
      const toolbars = container.querySelectorAll('.flowchart-toolbar');
      const panels = container.querySelectorAll('.flowchart-property-panel');
      expect(toolbars.length).toBe(0);
      expect(panels.length).toBe(0);
    });
  });

  describe('节点操作', () => {
    beforeEach(() => {
      const config: FlowchartEditorConfig = {
        container
      };
      editor = new FlowchartEditor(config);
    });

    it('应该能够添加节点', () => {
      const nodeData = {
        id: 'test-node',
        type: 'start' as const,
        position: { x: 100, y: 100 },
        label: '测试节点',
        properties: {}
      };

      editor.addNode(nodeData);
      
      const data = editor.getData();
      expect(data.nodes).toHaveLength(1);
      expect(data.nodes[0]?.id).toBe('test-node');
    });

    it('应该能够更新节点', () => {
      const nodeData = {
        id: 'test-node',
        type: 'start' as const,
        position: { x: 100, y: 100 },
        label: '测试节点',
        properties: {}
      };

      editor.addNode(nodeData);
      editor.updateNode('test-node', {
        label: '更新后的节点',
        position: { x: 200, y: 200 }
      });
      
      const data = editor.getData();
      const updatedNode = data.nodes.find(n => n.id === 'test-node');
      expect(updatedNode?.label).toBe('更新后的节点');
      expect(updatedNode?.position).toEqual({ x: 200, y: 200 });
    });

    it('应该能够删除节点', () => {
      const nodeData = {
        id: 'test-node',
        type: 'start' as const,
        position: { x: 100, y: 100 },
        label: '测试节点',
        properties: {}
      };

      editor.addNode(nodeData);
      editor.removeNode('test-node');
      
      const data = editor.getData();
      expect(data.nodes).toHaveLength(0);
    });
  });

  describe('连接线操作', () => {
    beforeEach(() => {
      const config: FlowchartEditorConfig = {
        container
      };
      editor = new FlowchartEditor(config);

      // 添加两个节点用于连接
      editor.addNode({
        id: 'node1',
        type: 'start',
        position: { x: 100, y: 100 },
        label: '节点1',
        properties: {}
      });

      editor.addNode({
        id: 'node2',
        type: 'end',
        position: { x: 300, y: 100 },
        label: '节点2',
        properties: {}
      });
    });

    it('应该能够添加连接线', () => {
      const edgeData = {
        id: 'test-edge',
        type: 'straight' as const,
        source: 'node1',
        target: 'node2',
        properties: {}
      };

      editor.addEdge(edgeData);
      
      const data = editor.getData();
      expect(data.edges).toHaveLength(1);
      expect(data.edges[0]?.id).toBe('test-edge');
    });

    it('应该能够更新连接线', () => {
      const edgeData = {
        id: 'test-edge',
        type: 'straight' as const,
        source: 'node1',
        target: 'node2',
        properties: {}
      };

      editor.addEdge(edgeData);
      editor.updateEdge('test-edge', {
        label: '连接线标签',
        style: { strokeColor: '#ff0000' }
      });
      
      const data = editor.getData();
      const updatedEdge = data.edges.find(e => e.id === 'test-edge');
      expect(updatedEdge?.label).toBe('连接线标签');
      expect(updatedEdge?.style?.strokeColor).toBe('#ff0000');
    });

    it('应该能够删除连接线', () => {
      const edgeData = {
        id: 'test-edge',
        type: 'straight' as const,
        source: 'node1',
        target: 'node2',
        properties: {}
      };

      editor.addEdge(edgeData);
      editor.removeEdge('test-edge');
      
      const data = editor.getData();
      expect(data.edges).toHaveLength(0);
    });
  });

  describe('缩放和视图操作', () => {
    beforeEach(() => {
      const config: FlowchartEditorConfig = {
        container
      };
      editor = new FlowchartEditor(config);
    });

    it('应该能够设置缩放级别', () => {
      editor.setZoom(2);
      expect(editor.getZoom()).toBe(2);
    });

    it('应该能够放大', () => {
      const initialZoom = editor.getZoom();
      editor.zoomIn();
      expect(editor.getZoom()).toBeGreaterThan(initialZoom);
    });

    it('应该能够缩小', () => {
      editor.setZoom(2); // 先设置一个较大的缩放级别
      const initialZoom = editor.getZoom();
      editor.zoomOut();
      expect(editor.getZoom()).toBeLessThan(initialZoom);
    });

    it('应该能够重置缩放', () => {
      editor.setZoom(2);
      editor.zoomReset();
      expect(editor.getZoom()).toBe(1);
    });

    it('应该限制缩放范围', () => {
      const config: FlowchartEditorConfig = {
        container,
        minZoom: 0.5,
        maxZoom: 3
      };
      editor = new FlowchartEditor(config);

      editor.setZoom(0.1); // 小于最小值
      expect(editor.getZoom()).toBe(0.5);

      editor.setZoom(5); // 大于最大值
      expect(editor.getZoom()).toBe(3);
    });
  });

  describe('撤销重做', () => {
    beforeEach(() => {
      const config: FlowchartEditorConfig = {
        container
      };
      editor = new FlowchartEditor(config);
    });

    it('应该能够撤销节点添加操作', () => {
      const nodeData = {
        id: 'test-node',
        type: 'start' as const,
        position: { x: 100, y: 100 },
        label: '测试节点',
        properties: {}
      };

      editor.addNode(nodeData);
      expect(editor.getData().nodes).toHaveLength(1);

      const undoResult = editor.undo();
      expect(undoResult).toBe(true);
      expect(editor.getData().nodes).toHaveLength(0);
    });

    it('应该能够重做节点添加操作', () => {
      const nodeData = {
        id: 'test-node',
        type: 'start' as const,
        position: { x: 100, y: 100 },
        label: '测试节点',
        properties: {}
      };

      editor.addNode(nodeData);
      editor.undo();
      
      const redoResult = editor.redo();
      expect(redoResult).toBe(true);
      expect(editor.getData().nodes).toHaveLength(1);
    });
  });

  describe('只读模式', () => {
    beforeEach(() => {
      const config: FlowchartEditorConfig = {
        container,
        readonly: true
      };
      editor = new FlowchartEditor(config);
    });

    it('应该正确设置只读模式', () => {
      expect(editor.isReadonly()).toBe(true);
    });

    it('应该能够切换只读模式', () => {
      editor.setReadonly(false);
      expect(editor.isReadonly()).toBe(false);

      editor.setReadonly(true);
      expect(editor.isReadonly()).toBe(true);
    });
  });

  describe('数据导入导出', () => {
    beforeEach(() => {
      const config: FlowchartEditorConfig = {
        container
      };
      editor = new FlowchartEditor(config);
    });

    it('应该能够导出为图片', () => {
      const imageData = editor.exportAsImage('png');
      expect(imageData).toMatch(/^data:image\/png;base64,/);
    });

    it('应该能够加载和导出数据', () => {
      const testData: FlowchartData = {
        nodes: [
          {
            id: 'node1',
            type: 'start',
            position: { x: 100, y: 100 },
            label: '开始',
            properties: {}
          }
        ],
        edges: [],
        metadata: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      editor.loadData(testData);
      const exportedData = editor.getData();
      
      expect(exportedData.nodes).toHaveLength(1);
      expect(exportedData.nodes[0]?.id).toBe('node1');
    });
  });

  describe('事件系统', () => {
    beforeEach(() => {
      const config: FlowchartEditorConfig = {
        container
      };
      editor = new FlowchartEditor(config);
    });

    it('应该在编辑器准备就绪时触发事件', (done) => {
      const config: FlowchartEditorConfig = {
        container: document.createElement('div')
      };

      const newEditor = new FlowchartEditor(config);
      
      newEditor.on('editor-ready', () => {
        expect(true).toBe(true);
        newEditor.destroy();
        done();
      });
    });

    it('应该在添加节点时触发事件', (done) => {
      editor.on('node-add', (nodeData) => {
        expect(nodeData.id).toBe('test-node');
        done();
      });

      editor.addNode({
        id: 'test-node',
        type: 'start',
        position: { x: 100, y: 100 },
        label: '测试节点',
        properties: {}
      });
    });
  });

  describe('销毁', () => {
    it('应该能够正确销毁编辑器', () => {
      const config: FlowchartEditorConfig = {
        container
      };
      editor = new FlowchartEditor(config);

      const initialChildCount = container.children.length;
      expect(initialChildCount).toBeGreaterThan(0);

      editor.destroy();
      
      // 验证DOM元素被清理
      expect(container.children.length).toBeLessThan(initialChildCount);
    });
  });
});
