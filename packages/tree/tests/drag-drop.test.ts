/**
 * 拖拽功能测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DragDropManager, DropPosition } from '../src/features/drag-drop'
import { TreeNodeImpl } from '../src/core/tree-node'
import { DragMode } from '../src/types/tree-node'
import { DEFAULT_TREE_OPTIONS } from '../src/types/tree-options'
import type { TreeNode } from '../src/types/tree-node'

// Mock DOM APIs
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  value: vi.fn(() => ({
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    width: 100,
    height: 100,
  })),
})

describe('DragDropManager', () => {
  let dragDropManager: DragDropManager
  let nodes: TreeNode[]
  let nodeMap: Map<string, TreeNode>

  beforeEach(() => {
    // 创建测试节点
    const node1 = new TreeNodeImpl({ id: '1', label: '节点1', draggable: true, droppable: true })
    const node2 = new TreeNodeImpl({ id: '2', label: '节点2', draggable: true, droppable: true })
    const node3 = new TreeNodeImpl({ id: '3', label: '节点3', draggable: true, droppable: true })

    // 添加子节点
    node1.addChild({ id: '1-1', label: '子节点1-1', draggable: true, droppable: true })
    node1.addChild({ id: '1-2', label: '子节点1-2', draggable: true, droppable: true })

    const node11 = node1.children[0]
    const node12 = node1.children[1]

    nodes = [node1, node2, node3, node11, node12]
    nodeMap = new Map()
    nodes.forEach(node => nodeMap.set(node.id, node))

    dragDropManager = new DragDropManager({
      ...DEFAULT_TREE_OPTIONS,
      drag: {
        enabled: true,
        mode: DragMode.TREE,
      },
    })
    dragDropManager.updateNodeMap(nodeMap)
  })

  describe('拖拽状态管理', () => {
    it('应该能够获取初始拖拽状态', () => {
      const dragState = dragDropManager.getDragState()
      
      expect(dragState.isDragging).toBe(false)
      expect(dragState.dragNode).toBeNull()
      expect(dragState.dragOverNode).toBeNull()
      expect(dragState.dropPosition).toBeNull()
      expect(dragState.allowDrop).toBe(false)
    })

    it('应该能够检查是否正在拖拽', () => {
      expect(dragDropManager.isDragging()).toBe(false)
    })

    it('应该能够获取拖拽节点', () => {
      expect(dragDropManager.getDragNode()).toBeNull()
    })
  })

  describe('拖拽开始', () => {
    it('应该能够开始拖拽可拖拽的节点', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      const result = dragDropManager.handleDragStart(mockEvent, '1')
      
      expect(result).toBe(true)
      expect(dragDropManager.isDragging()).toBe(true)
      expect(dragDropManager.getDragNode()?.id).toBe('1')
      expect(mockEvent.dataTransfer?.setData).toHaveBeenCalledWith('text/plain', '1')
      expect(mockEvent.dataTransfer?.setData).toHaveBeenCalledWith('application/x-tree-node-id', '1')
    })

    it('不应该能够拖拽不可拖拽的节点', () => {
      const node = nodeMap.get('1')!
      node.draggable = false

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      const result = dragDropManager.handleDragStart(mockEvent, '1')
      
      expect(result).toBe(false)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(dragDropManager.isDragging()).toBe(false)
    })

    it('拖拽被禁用时不应该能够开始拖拽', () => {
      dragDropManager = new DragDropManager({
        ...DEFAULT_TREE_OPTIONS,
        drag: {
          enabled: false,
          mode: DragMode.TREE,
        },
      })
      dragDropManager.updateNodeMap(nodeMap)

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      const result = dragDropManager.handleDragStart(mockEvent, '1')
      
      expect(result).toBe(false)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })

  describe('拖拽悬停', () => {
    beforeEach(() => {
      // 先开始拖拽
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragStart(mockEvent, '1')
    })

    it('应该能够处理拖拽悬停事件', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientY: 50,
        currentTarget: {
          getBoundingClientRect: () => ({
            top: 0,
            height: 100,
          }),
        },
      } as unknown as DragEvent

      const result = dragDropManager.handleDragOver(mockEvent, '2')
      
      expect(result).toBe(true)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      
      const dragState = dragDropManager.getDragState()
      expect(dragState.dragOverNode?.id).toBe('2')
      expect(dragState.dropPosition).toBe(DropPosition.INSIDE)
      expect(dragState.allowDrop).toBe(true)
    })

    it('不应该允许拖拽到自己', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientY: 50,
        currentTarget: {
          getBoundingClientRect: () => ({
            top: 0,
            height: 100,
          }),
        },
      } as unknown as DragEvent

      const result = dragDropManager.handleDragOver(mockEvent, '1')
      
      expect(result).toBe(false)
      
      const dragState = dragDropManager.getDragState()
      expect(dragState.allowDrop).toBe(false)
    })

    it('不应该允许拖拽到自己的子节点', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientY: 50,
        currentTarget: {
          getBoundingClientRect: () => ({
            top: 0,
            height: 100,
          }),
        },
      } as unknown as DragEvent

      const result = dragDropManager.handleDragOver(mockEvent, '1-1')
      
      expect(result).toBe(false)
      
      const dragState = dragDropManager.getDragState()
      expect(dragState.allowDrop).toBe(false)
    })
  })

  describe('拖拽位置计算', () => {
    beforeEach(() => {
      // 先开始拖拽
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragStart(mockEvent, '1')
    })

    it('应该能够计算BEFORE位置', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientY: 10, // 在顶部25%区域内
        currentTarget: {
          getBoundingClientRect: () => ({
            top: 0,
            height: 100,
          }),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragOver(mockEvent, '2')
      
      const dragState = dragDropManager.getDragState()
      expect(dragState.dropPosition).toBe(DropPosition.BEFORE)
    })

    it('应该能够计算AFTER位置', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientY: 90, // 在底部25%区域内
        currentTarget: {
          getBoundingClientRect: () => ({
            top: 0,
            height: 100,
          }),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragOver(mockEvent, '2')
      
      const dragState = dragDropManager.getDragState()
      expect(dragState.dropPosition).toBe(DropPosition.AFTER)
    })

    it('应该能够计算INSIDE位置', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientY: 50, // 在中间区域
        currentTarget: {
          getBoundingClientRect: () => ({
            top: 0,
            height: 100,
          }),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragOver(mockEvent, '2')
      
      const dragState = dragDropManager.getDragState()
      expect(dragState.dropPosition).toBe(DropPosition.INSIDE)
    })
  })

  describe('拖拽模式', () => {
    it('排序模式应该只允许同级移动', () => {
      dragDropManager = new DragDropManager({
        ...DEFAULT_TREE_OPTIONS,
        drag: {
          enabled: true,
          mode: DragMode.SORT,
        },
      })
      dragDropManager.updateNodeMap(nodeMap)

      // 开始拖拽
      const mockStartEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragStart(mockStartEvent, '1-1')

      // 尝试拖拽到不同级别的节点
      const mockOverEvent = {
        preventDefault: vi.fn(),
        clientY: 50,
        currentTarget: {
          getBoundingClientRect: () => ({
            top: 0,
            height: 100,
          }),
        },
      } as unknown as DragEvent

      const result = dragDropManager.handleDragOver(mockOverEvent, '2')
      
      expect(result).toBe(false)
      
      const dragState = dragDropManager.getDragState()
      expect(dragState.allowDrop).toBe(false)
    })
  })

  describe('拖拽放置', () => {
    beforeEach(() => {
      // 先开始拖拽
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragStart(mockEvent, '1-1')

      // 设置拖拽悬停状态
      const mockOverEvent = {
        preventDefault: vi.fn(),
        clientY: 50,
        currentTarget: {
          getBoundingClientRect: () => ({
            top: 0,
            height: 100,
          }),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragOver(mockOverEvent, '2')
    })

    it('应该能够处理拖拽放置事件', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as DragEvent

      const result = dragDropManager.handleDrop(mockEvent, '2')
      
      expect(result).toBe(true)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('放置后应该更新节点层级结构', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as DragEvent

      const dragNode = nodeMap.get('1-1')!
      const originalParent = dragNode.parent
      
      dragDropManager.handleDrop(mockEvent, '2')
      
      // 检查节点是否移动到了新的父节点
      expect(dragNode.parent?.id).toBe('2')
      expect(originalParent?.children.includes(dragNode)).toBe(false)
    })
  })

  describe('拖拽结束', () => {
    it('应该能够处理拖拽结束事件', () => {
      // 先开始拖拽
      const mockStartEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragStart(mockStartEvent, '1')

      const mockEndEvent = {} as DragEvent

      dragDropManager.handleDragEnd(mockEndEvent, '1')
      
      expect(dragDropManager.isDragging()).toBe(false)
      expect(dragDropManager.getDragNode()).toBeNull()
    })

    it('结束拖拽后应该清除节点拖拽状态', () => {
      // 先开始拖拽
      const mockStartEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragStart(mockStartEvent, '1')

      const node = nodeMap.get('1')!
      expect(node.dragging).toBe(true)

      const mockEndEvent = {} as DragEvent
      dragDropManager.handleDragEnd(mockEndEvent, '1')
      
      expect(node.dragging).toBe(false)
    })
  })

  describe('拖拽取消', () => {
    it('应该能够强制取消拖拽', () => {
      // 先开始拖拽
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragStart(mockEvent, '1')
      
      expect(dragDropManager.isDragging()).toBe(true)
      
      dragDropManager.cancelDrag()
      
      expect(dragDropManager.isDragging()).toBe(false)
      expect(dragDropManager.getDragNode()).toBeNull()
    })
  })

  describe('回调函数', () => {
    it('应该能够设置和触发拖拽回调', () => {
      const onDragStart = vi.fn(() => true)
      const onDragOver = vi.fn(() => true)
      const onDrop = vi.fn(() => true)
      const onDragEnd = vi.fn()

      dragDropManager.setCallbacks({
        onDragStart,
        onDragOver,
        onDrop,
        onDragEnd,
      })

      // 测试拖拽开始回调
      const mockStartEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragStart(mockStartEvent, '1')
      expect(onDragStart).toHaveBeenCalled()

      // 测试拖拽悬停回调
      const mockOverEvent = {
        preventDefault: vi.fn(),
        clientY: 50,
        currentTarget: {
          getBoundingClientRect: () => ({
            top: 0,
            height: 100,
          }),
        },
      } as unknown as DragEvent

      dragDropManager.handleDragOver(mockOverEvent, '2')
      expect(onDragOver).toHaveBeenCalled()

      // 测试拖拽放置回调
      const mockDropEvent = {
        preventDefault: vi.fn(),
      } as unknown as DragEvent

      dragDropManager.handleDrop(mockDropEvent, '2')
      expect(onDrop).toHaveBeenCalled()

      // 测试拖拽结束回调
      const mockEndEvent = {} as DragEvent
      dragDropManager.handleDragEnd(mockEndEvent, '1')
      expect(onDragEnd).toHaveBeenCalled()
    })

    it('回调返回false应该阻止拖拽操作', () => {
      const onDragStart = vi.fn(() => false)
      dragDropManager.setCallbacks({ onDragStart })

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
        },
      } as unknown as DragEvent

      const result = dragDropManager.handleDragStart(mockEvent, '1')
      
      expect(result).toBe(false)
      expect(dragDropManager.isDragging()).toBe(false)
    })
  })
})
