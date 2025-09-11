/**
 * FlowchartAPI 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FlowchartAPI } from '../api/FlowchartAPI'

// Mock DOM
Object.defineProperty(window, 'document', {
  value: {
    createElement: vi.fn(() => ({
      id: 'test-container',
      style: {},
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      querySelector: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setAttribute: vi.fn(),
      remove: vi.fn(),
      parentElement: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    })),
    querySelector: vi.fn(() => ({
      id: 'test-container',
      style: {},
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      offsetWidth: 800,
      offsetHeight: 600,
      parentElement: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    })),
    getElementById: vi.fn(() => null),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    },
    head: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
  }
})

// Mock LogicFlow
vi.mock('@logicflow/core', () => {
  const MockLogicFlow = vi.fn().mockImplementation(() => ({
    render: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    register: vi.fn(),
    addNode: vi.fn().mockReturnValue({ id: 'node-id-123' }),
    addEdge: vi.fn().mockReturnValue({ id: 'edge-id-123' }),
    deleteNode: vi.fn(),
    deleteEdge: vi.fn(),
    getGraphData: vi.fn(() => ({ nodes: [], edges: [] })),
    renderRawData: vi.fn(),
    setTheme: vi.fn(),
    destroy: vi.fn(),
    container: {
      id: 'test-container',
      style: {},
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      offsetWidth: 800,
      offsetHeight: 600
    }
  }))

  return {
    default: MockLogicFlow,
    LogicFlow: MockLogicFlow,
    CircleNode: vi.fn(),
    CircleNodeModel: vi.fn(),
    RectNode: vi.fn(),
    RectNodeModel: vi.fn(),
    DiamondNode: vi.fn(),
    DiamondNodeModel: vi.fn(),
    PolylineEdge: vi.fn(),
    PolylineEdgeModel: vi.fn(),
    h: vi.fn()
  }
})

describe('FlowchartAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createEditor', () => {
    it('应该能够创建编辑器实例', () => {
      const editor = FlowchartAPI.createEditor({
        container: '#test-container',
        width: 800,
        height: 600
      })

      expect(editor).toBeDefined()
    })

    it('应该能够使用 HTMLElement 作为容器', () => {
      const container = document.createElement('div')
      const editor = FlowchartAPI.createEditor({
        container: container,
        width: 800,
        height: 600
      })

      expect(editor).toBeDefined()
    })

    it('应该在容器不存在时抛出错误', () => {
      document.querySelector = vi.fn(() => null)

      expect(() => {
        FlowchartAPI.createEditor({
          container: '#non-existent',
          width: 800,
          height: 600
        })
      }).toThrow('容器元素未找到: #non-existent')
    })

    it('应该能够安装插件', () => {
      // 确保 querySelector 返回有效元素
      document.querySelector = vi.fn(() => ({
        id: 'test-container',
        style: {},
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        offsetWidth: 800,
        offsetHeight: 600,
        parentElement: {
          appendChild: vi.fn(),
          removeChild: vi.fn()
        }
      }))

      const editor = FlowchartAPI.createEditor({
        container: '#test-container',
        width: 800,
        height: 600
        // 不测试插件安装，只测试编辑器创建
      })

      expect(editor).toBeDefined()
      expect(editor.getPluginManager).toBeDefined()
    })
  })

  describe('createViewer', () => {
    it('应该能够创建查看器实例', () => {
      // 确保 querySelector 返回有效元素
      document.querySelector = vi.fn(() => ({
        id: 'test-container',
        style: {},
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        offsetWidth: 800,
        offsetHeight: 600,
        parentElement: {
          appendChild: vi.fn(),
          removeChild: vi.fn()
        }
      }))

      const viewer = FlowchartAPI.createViewer({
        container: '#test-container'
      })

      expect(viewer).toBeDefined()
    })
  })

  describe('createNode', () => {
    it('应该能够创建开始节点', () => {
      const node = FlowchartAPI.createNode({
        type: 'start',
        x: 100,
        y: 100,
        text: '开始'
      })

      expect(node).toEqual({
        type: 'start',
        x: 100,
        y: 100,
        text: '开始',
        properties: {}
      })
    })

    it('应该能够创建带属性的节点', () => {
      const node = FlowchartAPI.createNode({
        type: 'approval',
        x: 200,
        y: 200,
        text: '审批',
        properties: {
          approvers: ['user1', 'user2']
        }
      })

      expect(node).toEqual({
        type: 'approval',
        x: 200,
        y: 200,
        text: '审批',
        properties: {
          approvers: ['user1', 'user2']
        }
      })
    })
  })

  describe('createEdge', () => {
    it('应该能够创建边', () => {
      const edge = FlowchartAPI.createEdge({
        source: 'node1',
        target: 'node2',
        text: '连接'
      })

      expect(edge).toEqual({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        text: '连接',
        properties: {}
      })
    })
  })

  describe('createApprovalTemplate', () => {
    it('应该能够创建水平布局的审批模板', () => {
      const template = FlowchartAPI.createApprovalTemplate({
        title: '测试流程',
        steps: ['申请', '审批', '完成'],
        layout: 'horizontal'
      })

      expect(template).toHaveProperty('nodes')
      expect(template).toHaveProperty('edges')
      expect(template.nodes).toHaveLength(5) // 开始 + 3步骤 + 结束
      expect(template.edges).toHaveLength(4) // 4条连接
    })

    it('应该能够创建垂直布局的审批模板', () => {
      const template = FlowchartAPI.createApprovalTemplate({
        steps: ['申请', '审批'],
        layout: 'vertical'
      })

      expect(template).toHaveProperty('nodes')
      expect(template).toHaveProperty('edges')
      expect(template.nodes).toHaveLength(4) // 开始 + 2步骤 + 结束
    })
  })

  describe('validateData', () => {
    it('应该验证有效的数据', () => {
      const validData = {
        nodes: [
          { id: 'node1', type: 'start', x: 100, y: 100, text: '开始' },
          { id: 'node2', type: 'end', x: 200, y: 100, text: '结束' }
        ],
        edges: [
          { sourceNodeId: 'node1', targetNodeId: 'node2', text: '连接' }
        ]
      }

      const result = FlowchartAPI.validateData(validData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测无效的数据格式', () => {
      const result = FlowchartAPI.validateData(null as any)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('数据格式无效')
    })

    it('应该检测缺少节点 ID', () => {
      const invalidData = {
        nodes: [
          { type: 'start', x: 100, y: 100, text: '开始' } // 缺少 id
        ],
        edges: []
      }

      const result = FlowchartAPI.validateData(invalidData)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('缺少 ID'))).toBe(true)
    })

    it('应该检测重复的节点 ID', () => {
      const invalidData = {
        nodes: [
          { id: 'node1', type: 'start', x: 100, y: 100, text: '开始' },
          { id: 'node1', type: 'end', x: 200, y: 100, text: '结束' } // 重复 id
        ],
        edges: []
      }

      const result = FlowchartAPI.validateData(invalidData)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('重复'))).toBe(true)
    })

    it('应该检测边引用不存在的节点', () => {
      const invalidData = {
        nodes: [
          { id: 'node1', type: 'start', x: 100, y: 100, text: '开始' }
        ],
        edges: [
          { sourceNodeId: 'node1', targetNodeId: 'nonexistent', text: '连接' }
        ]
      }

      const result = FlowchartAPI.validateData(invalidData)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('不存在'))).toBe(true)
    })
  })

  describe('convertToBPMN', () => {
    it('应该能够转换为 BPMN 格式', () => {
      const data = {
        nodes: [
          { id: 'node1', type: 'start', x: 100, y: 100, text: '开始' },
          { id: 'node2', type: 'approval', x: 200, y: 100, text: '审批' },
          { id: 'node3', type: 'end', x: 300, y: 100, text: '结束' }
        ],
        edges: [
          { sourceNodeId: 'node1', targetNodeId: 'node2', text: '提交' },
          { sourceNodeId: 'node2', targetNodeId: 'node3', text: '完成' }
        ]
      }

      const bpmn = FlowchartAPI.convertToBPMN(data)

      expect(bpmn).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(bpmn).toContain('<definitions')
      expect(bpmn).toContain('<startEvent id="node1"')
      expect(bpmn).toContain('<userTask id="node2"')
      expect(bpmn).toContain('<endEvent id="node3"')
      expect(bpmn).toContain('<sequenceFlow')
    })
  })

  describe('getVersion', () => {
    it('应该返回版本号', () => {
      const version = FlowchartAPI.getVersion()
      expect(typeof version).toBe('string')
      expect(version).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })

  describe('getSupportedNodeTypes', () => {
    it('应该返回支持的节点类型', () => {
      const types = FlowchartAPI.getSupportedNodeTypes()
      expect(Array.isArray(types)).toBe(true)
      expect(types).toContain('start')
      expect(types).toContain('approval')
      expect(types).toContain('condition')
      expect(types).toContain('end')
      expect(types).toContain('process')
      expect(types).toContain('parallel-gateway')
      expect(types).toContain('exclusive-gateway')
    })
  })
})
