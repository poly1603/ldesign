/**
 * FlowchartEditor 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FlowchartEditor } from '../core/FlowchartEditor'

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
    container: document.createElement('div')
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

describe('FlowchartEditor', () => {
  let container: HTMLDivElement
  let editor: FlowchartEditor

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'flowchart-container'
    document.body.appendChild(container)
  })

  it('应该能够创建编辑器实例', () => {
    editor = new FlowchartEditor({
      container: container,
      width: 800,
      height: 600
    })

    expect(editor).toBeInstanceOf(FlowchartEditor)
  })

  it('应该能够添加开始节点', () => {
    editor = new FlowchartEditor({
      container: container,
      width: 800,
      height: 600
    })

    const nodeId = editor.addNode({
      type: 'start',
      x: 100,
      y: 100,
      text: '开始'
    })

    expect(nodeId).toBeDefined()
    expect(typeof nodeId).toBe('string')
  })

  it('应该能够添加审批节点', () => {
    editor = new FlowchartEditor({
      container: container,
      width: 800,
      height: 600
    })

    const nodeId = editor.addNode({
      type: 'approval',
      x: 200,
      y: 200,
      text: '审批节点',
      properties: {
        approvers: ['user1', 'user2'],
        status: 'pending'
      }
    })

    expect(nodeId).toBeDefined()
    expect(typeof nodeId).toBe('string')
  })

  it('应该能够添加连接线', () => {
    editor = new FlowchartEditor({
      container: container,
      width: 800,
      height: 600
    })

    const startNodeId = editor.addNode({
      type: 'start',
      x: 100,
      y: 100,
      text: '开始'
    })

    const approvalNodeId = editor.addNode({
      type: 'approval',
      x: 200,
      y: 200,
      text: '审批节点'
    })

    const edgeId = editor.addEdge({
      type: 'approval-edge',
      sourceNodeId: startNodeId,
      targetNodeId: approvalNodeId
    })

    expect(edgeId).toBeDefined()
    expect(typeof edgeId).toBe('string')
  })

  it('应该能够获取流程图数据', () => {
    editor = new FlowchartEditor({
      container: container,
      width: 800,
      height: 600
    })

    const data = editor.getFlowchartData()
    expect(data).toHaveProperty('nodes')
    expect(data).toHaveProperty('edges')
    expect(Array.isArray(data.nodes)).toBe(true)
    expect(Array.isArray(data.edges)).toBe(true)
  })

  it('应该能够设置主题', () => {
    editor = new FlowchartEditor({
      container: container,
      width: 800,
      height: 600
    })

    expect(() => {
      editor.setTheme('dark')
    }).not.toThrow()
  })

  it('应该能够销毁编辑器', () => {
    editor = new FlowchartEditor({
      container: container,
      width: 800,
      height: 600
    })

    expect(() => {
      editor.destroy()
    }).not.toThrow()
  })
})
