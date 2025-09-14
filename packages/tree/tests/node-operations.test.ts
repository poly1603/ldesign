/**
 * 节点操作功能测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NodeOperationsManager, OperationType } from '../src/features/node-operations'
import { TreeNodeImpl } from '../src/core/tree-node'
import { DEFAULT_TREE_OPTIONS } from '../src/types/tree-options'
import type { TreeNode } from '../src/types/tree-node'

describe('NodeOperationsManager', () => {
  let operationsManager: NodeOperationsManager
  let nodes: TreeNode[]
  let nodeMap: Map<string, TreeNode>
  let rootNodes: TreeNode[]

  beforeEach(() => {
    // 创建测试节点
    const node1 = new TreeNodeImpl({ id: '1', label: '节点1' })
    const node2 = new TreeNodeImpl({ id: '2', label: '节点2' })
    const node3 = new TreeNodeImpl({ id: '3', label: '节点3' })

    // 添加子节点
    node1.addChild({ id: '1-1', label: '子节点1-1' })
    node1.addChild({ id: '1-2', label: '子节点1-2' })

    const node11 = node1.children[0]
    const node12 = node1.children[1]

    nodes = [node1, node2, node3, node11, node12]
    rootNodes = [node1, node2, node3]
    nodeMap = new Map()
    nodes.forEach(node => nodeMap.set(node.id, node))

    operationsManager = new NodeOperationsManager({
      ...DEFAULT_TREE_OPTIONS,
      operations: {
        maxHistorySize: 10,
      },
    })
    operationsManager.updateData(nodeMap, rootNodes)
  })

  describe('添加节点', () => {
    it('应该能够添加根节点', () => {
      const result = operationsManager.addNode({
        id: '4',
        label: '新节点4',
      })

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('4')
      expect(rootNodes).toHaveLength(4)
    })

    it('应该能够添加子节点', () => {
      const result = operationsManager.addNode({
        id: '1-3',
        label: '新子节点1-3',
      }, '1')

      expect(result.success).toBe(true)
      expect(result.data?.parent?.id).toBe('1')

      const parentNode = nodeMap.get('1')
      expect(parentNode?.children).toHaveLength(3)
    })

    it('应该能够在指定位置添加节点', () => {
      const result = operationsManager.addNode({
        id: '1-0',
        label: '插入节点1-0',
      }, '1', 0)

      expect(result.success).toBe(true)

      const parentNode = nodeMap.get('1')
      expect(parentNode?.children[0].id).toBe('1-0')
    })

    it('父节点不存在时应该返回错误', () => {
      const result = operationsManager.addNode({
        id: '999-1',
        label: '无效子节点',
      }, 'non-existent')

      expect(result.success).toBe(false)
      expect(result.message).toContain('不存在')
    })
  })

  describe('更新节点', () => {
    it('应该能够更新节点标签', () => {
      const result = operationsManager.updateNode('1', {
        label: '更新的节点1',
      })

      expect(result.success).toBe(true)

      const node = nodeMap.get('1')
      expect(node?.label).toBe('更新的节点1')
    })

    it('应该能够更新节点的多个属性', () => {
      const result = operationsManager.updateNode('1', {
        label: '更新的节点1',
        disabled: true,
        icon: 'new-icon',
      })

      expect(result.success).toBe(true)

      const node = nodeMap.get('1')
      expect(node?.label).toBe('更新的节点1')
      expect(node?.disabled).toBe(true)
      expect(node?.icon).toBe('new-icon')
    })

    it('节点不存在时应该返回错误', () => {
      const result = operationsManager.updateNode('non-existent', {
        label: '无效更新',
      })

      expect(result.success).toBe(false)
      expect(result.message).toContain('不存在')
    })
  })

  describe('删除节点', () => {
    it('应该能够删除叶子节点', () => {
      const result = operationsManager.removeNode('1-1')

      expect(result.success).toBe(true)
      expect(nodeMap.has('1-1')).toBe(false)

      const parentNode = nodeMap.get('1')
      expect(parentNode?.children).toHaveLength(1)
    })

    it('应该能够删除根节点', () => {
      const result = operationsManager.removeNode('3')

      expect(result.success).toBe(true)
      expect(nodeMap.has('3')).toBe(false)
      expect(rootNodes).toHaveLength(2)
    })

    it('删除节点应该同时删除其子节点', () => {
      const result = operationsManager.removeNode('1')

      expect(result.success).toBe(true)
      expect(nodeMap.has('1')).toBe(false)
      expect(nodeMap.has('1-1')).toBe(false)
      expect(nodeMap.has('1-2')).toBe(false)
      expect(rootNodes).toHaveLength(2)
    })

    it('节点不存在时应该返回错误', () => {
      const result = operationsManager.removeNode('non-existent')

      expect(result.success).toBe(false)
      expect(result.message).toContain('不存在')
    })
  })

  describe('移动节点', () => {
    it('应该能够移动节点到新的父节点', () => {
      const result = operationsManager.moveNode('1-1', '2')

      expect(result.success).toBe(true)

      const movedNode = nodeMap.get('1-1')
      expect(movedNode?.parent?.id).toBe('2')

      const oldParent = nodeMap.get('1')
      const newParent = nodeMap.get('2')
      expect(oldParent?.children).toHaveLength(1)
      expect(newParent?.children).toHaveLength(1)
    })

    it('应该能够移动节点到根级别', () => {
      const result = operationsManager.moveNode('1-1')

      expect(result.success).toBe(true)

      const movedNode = nodeMap.get('1-1')
      expect(movedNode?.parent).toBeUndefined()
      expect(rootNodes).toHaveLength(4)
    })

    it('应该能够在指定位置插入节点', () => {
      const result = operationsManager.moveNode('1-1', '2', 0)

      expect(result.success).toBe(true)

      const newParent = nodeMap.get('2')
      expect(newParent?.children[0].id).toBe('1-1')
    })

    it('不应该允许移动到自己的子节点', () => {
      const result = operationsManager.moveNode('1', '1-1')

      expect(result.success).toBe(false)
      expect(result.message).toContain('子节点')
    })

    it('节点不存在时应该返回错误', () => {
      const result = operationsManager.moveNode('non-existent', '2')

      expect(result.success).toBe(false)
      expect(result.message).toContain('不存在')
    })

    it('目标父节点不存在时应该返回错误', () => {
      const result = operationsManager.moveNode('1-1', 'non-existent')

      expect(result.success).toBe(false)
      expect(result.message).toContain('不存在')
    })
  })

  describe('复制和粘贴', () => {
    it('应该能够复制节点', () => {
      const result = operationsManager.copyNode('1')

      expect(result.success).toBe(true)

      const clipboardStatus = operationsManager.getClipboardStatus()
      expect(clipboardStatus.hasData).toBe(true)
      expect(clipboardStatus.operation).toBe('copy')
      expect(clipboardStatus.nodeCount).toBe(1)
    })

    it('应该能够粘贴复制的节点', () => {
      operationsManager.copyNode('1')
      const result = operationsManager.pasteNode('2')

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)

      const newParent = nodeMap.get('2')
      expect(newParent?.children).toHaveLength(1)

      // 原节点应该仍然存在
      expect(nodeMap.has('1')).toBe(true)
    })

    it('应该能够剪切节点', () => {
      const result = operationsManager.cutNode('1-1')

      expect(result.success).toBe(true)

      const clipboardStatus = operationsManager.getClipboardStatus()
      expect(clipboardStatus.hasData).toBe(true)
      expect(clipboardStatus.operation).toBe('cut')
    })

    it('应该能够粘贴剪切的节点', () => {
      operationsManager.cutNode('1-1')
      const result = operationsManager.pasteNode('2')

      expect(result.success).toBe(true)

      const movedNode = nodeMap.get('1-1')
      expect(movedNode?.parent?.id).toBe('2')

      // 剪贴板应该被清空
      const clipboardStatus = operationsManager.getClipboardStatus()
      expect(clipboardStatus.hasData).toBe(false)
    })

    it('剪贴板为空时粘贴应该返回错误', () => {
      const result = operationsManager.pasteNode('2')

      expect(result.success).toBe(false)
      expect(result.message).toContain('剪贴板为空')
    })

    it('应该能够清空剪贴板', () => {
      operationsManager.copyNode('1')
      operationsManager.clearClipboard()

      const clipboardStatus = operationsManager.getClipboardStatus()
      expect(clipboardStatus.hasData).toBe(false)
    })
  })

  describe('操作历史', () => {
    it('应该记录操作历史', () => {
      operationsManager.addNode({ id: '4', label: '节点4' })
      operationsManager.updateNode('1', { label: '更新节点1' })
      operationsManager.removeNode('2')

      const history = operationsManager.getOperationHistory()
      expect(history).toHaveLength(3)
      expect(history[0].type).toBe(OperationType.ADD)
      expect(history[1].type).toBe(OperationType.UPDATE)
      expect(history[2].type).toBe(OperationType.REMOVE)
    })

    it('应该能够清空操作历史', () => {
      operationsManager.addNode({ id: '4', label: '节点4' })
      operationsManager.clearOperationHistory()

      const history = operationsManager.getOperationHistory()
      expect(history).toHaveLength(0)
    })

    it('应该限制历史记录数量', () => {
      // 添加超过限制的操作
      for (let i = 0; i < 15; i++) {
        operationsManager.addNode({ id: `test-${i}`, label: `测试节点${i}` })
      }

      const history = operationsManager.getOperationHistory()
      expect(history.length).toBeLessThanOrEqual(10)
    })
  })

  describe('回调函数', () => {
    it('应该能够设置和触发操作回调', () => {
      const onBeforeOperation = vi.fn(() => true)
      const onAfterOperation = vi.fn()

      operationsManager.setCallbacks({
        onBeforeOperation,
        onAfterOperation,
      })

      operationsManager.addNode({ id: '4', label: '节点4' })

      expect(onBeforeOperation).toHaveBeenCalledWith(OperationType.ADD, expect.any(Object))
      expect(onAfterOperation).toHaveBeenCalledWith(OperationType.ADD, expect.any(Object))
    })

    it('前置回调返回false应该阻止操作', () => {
      const onBeforeOperation = vi.fn(() => false)
      operationsManager.setCallbacks({ onBeforeOperation })

      const result = operationsManager.addNode({ id: '4', label: '节点4' })

      expect(result.success).toBe(false)
      expect(result.message).toContain('阻止')
      expect(nodeMap.has('4')).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理操作异常', () => {
      // 测试添加到不存在的父节点
      const result = operationsManager.addNode({
        id: '999',
        label: '测试节点',
      }, 'non-existent-parent')

      expect(result.success).toBe(false)
      expect(result.message).toContain('不存在')
    })
  })
})
