/**
 * 选择功能测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SelectionManager } from '../src/features/selection'
import { TreeNodeImpl } from '../src/core/tree-node'
import { SelectionMode } from '../src/types/tree-node'
import { DEFAULT_TREE_OPTIONS } from '../src/types/tree-options'
import type { TreeNode } from '../src/types/tree-node'

describe('SelectionManager', () => {
  let selectionManager: SelectionManager
  let nodes: TreeNode[]
  let nodeMap: Map<string, TreeNode>

  beforeEach(() => {
    // 创建测试节点
    const node1 = new TreeNodeImpl({ id: '1', label: '节点1' })
    const node2 = new TreeNodeImpl({ id: '2', label: '节点2' })

    // 添加子节点
    node1.addChild({ id: '1-1', label: '子节点1-1' })
    node1.addChild({ id: '1-2', label: '子节点1-2' })

    // 获取子节点实例
    const node11 = node1.children[0]
    const node12 = node1.children[1]

    // 添加孙子节点
    node11.addChild({ id: '1-1-1', label: '子节点1-1-1' })
    const node111 = node11.children[0]

    nodes = [node1, node11, node12, node111, node2]
    nodeMap = new Map()
    nodes.forEach(node => nodeMap.set(node.id, node))

    selectionManager = new SelectionManager({
      ...DEFAULT_TREE_OPTIONS,
      selection: {
        mode: SelectionMode.MULTIPLE,
        cascade: false,
      },
    })
    selectionManager.updateNodeMap(nodeMap)
  })

  describe('单选模式', () => {
    beforeEach(() => {
      selectionManager = new SelectionManager({
        ...DEFAULT_TREE_OPTIONS,
        selection: {
          mode: SelectionMode.SINGLE,
          cascade: false,
        },
      })
      selectionManager.updateNodeMap(nodeMap)
    })

    it('应该只能选择一个节点', () => {
      selectionManager.selectNode('1', true)
      selectionManager.selectNode('2', true)

      const selectedIds = selectionManager.getSelectedIds()
      expect(selectedIds.size).toBe(1)
      expect(selectedIds.has('2')).toBe(true)
      expect(selectedIds.has('1')).toBe(false)
    })

    it('应该能够取消选择', () => {
      selectionManager.selectNode('1', true)
      selectionManager.selectNode('1', false)

      const selectedIds = selectionManager.getSelectedIds()
      expect(selectedIds.size).toBe(0)
    })

    it('不应该支持全选', () => {
      selectionManager.selectAll()
      const selectedIds = selectionManager.getSelectedIds()
      expect(selectedIds.size).toBe(0)
    })
  })

  describe('多选模式', () => {
    it('应该能够选择多个节点', () => {
      selectionManager.selectNode('1', true)
      selectionManager.selectNode('2', true)

      const selectedIds = selectionManager.getSelectedIds()
      expect(selectedIds.size).toBe(2)
      expect(selectedIds.has('1')).toBe(true)
      expect(selectedIds.has('2')).toBe(true)
    })

    it('应该能够取消选择特定节点', () => {
      selectionManager.selectNode('1', true)
      selectionManager.selectNode('2', true)
      selectionManager.selectNode('1', false)

      const selectedIds = selectionManager.getSelectedIds()
      expect(selectedIds.size).toBe(1)
      expect(selectedIds.has('2')).toBe(true)
      expect(selectedIds.has('1')).toBe(false)
    })

    it('应该支持全选', () => {
      selectionManager.selectAll()
      const selectedIds = selectionManager.getSelectedIds()
      expect(selectedIds.size).toBe(nodes.length)
    })

    it('应该支持取消全选', () => {
      selectionManager.selectAll()
      selectionManager.deselectAll()
      const selectedIds = selectionManager.getSelectedIds()
      expect(selectedIds.size).toBe(0)
    })

    it('应该支持反选', () => {
      selectionManager.selectNode('1', true)
      selectionManager.selectNode('2', true)

      const beforeInvert = selectionManager.getSelectedIds()
      selectionManager.invertSelection()
      const afterInvert = selectionManager.getSelectedIds()

      expect(afterInvert.size).toBe(nodes.length - beforeInvert.size)
      expect(afterInvert.has('1')).toBe(false)
      expect(afterInvert.has('2')).toBe(false)
    })
  })

  describe('级联选择模式', () => {
    beforeEach(() => {
      selectionManager = new SelectionManager({
        ...DEFAULT_TREE_OPTIONS,
        selection: {
          mode: SelectionMode.CASCADE,
          cascade: true,
        },
      })
      selectionManager.updateNodeMap(nodeMap)
    })

    it('选择父节点应该选择所有子节点', () => {
      selectionManager.selectNode('1', true)

      const selectedIds = selectionManager.getSelectedIds()
      expect(selectedIds.has('1')).toBe(true)
      expect(selectedIds.has('1-1')).toBe(true)
      expect(selectedIds.has('1-2')).toBe(true)
      expect(selectedIds.has('1-1-1')).toBe(true)
    })

    it('取消选择父节点应该取消选择所有子节点', () => {
      selectionManager.selectNode('1', true)
      selectionManager.selectNode('1', false)

      const selectedIds = selectionManager.getSelectedIds()
      expect(selectedIds.has('1')).toBe(false)
      expect(selectedIds.has('1-1')).toBe(false)
      expect(selectedIds.has('1-2')).toBe(false)
      expect(selectedIds.has('1-1-1')).toBe(false)
    })

    it('选择所有子节点应该自动选择父节点', () => {
      selectionManager.selectNode('1-1', true)
      selectionManager.selectNode('1-2', true)

      const selectedIds = selectionManager.getSelectedIds()
      expect(selectedIds.has('1')).toBe(true)
    })

    it('部分选择子节点应该设置父节点为半选状态', () => {
      selectionManager.selectNode('1-1', true)

      const node1 = nodeMap.get('1')
      expect(node1?.indeterminate).toBe(true)
      expect(node1?.selected).toBe(false)
    })
  })

  describe('工具方法', () => {
    it('应该能够检查节点是否被选中', () => {
      selectionManager.selectNode('1', true)

      expect(selectionManager.isSelected('1')).toBe(true)
      expect(selectionManager.isSelected('2')).toBe(false)
    })

    it('应该能够检查是否有选中的节点', () => {
      expect(selectionManager.hasSelection()).toBe(false)

      selectionManager.selectNode('1', true)
      expect(selectionManager.hasSelection()).toBe(true)
    })

    it('应该能够获取选中节点的数量', () => {
      expect(selectionManager.getSelectionCount()).toBe(0)

      selectionManager.selectNode('1', true)
      selectionManager.selectNode('2', true)
      expect(selectionManager.getSelectionCount()).toBe(2)
    })

    it('应该能够获取选中的节点', () => {
      selectionManager.selectNode('1', true)
      selectionManager.selectNode('2', true)

      const selectedNodes = selectionManager.getSelectedNodes()
      expect(selectedNodes).toHaveLength(2)
      expect(selectedNodes.map(node => node.id)).toContain('1')
      expect(selectedNodes.map(node => node.id)).toContain('2')
    })

    it('应该能够清空选择', () => {
      selectionManager.selectNode('1', true)
      selectionManager.selectNode('2', true)
      selectionManager.clear()

      expect(selectionManager.getSelectionCount()).toBe(0)
    })

    it('应该能够设置选中的节点ID集合', () => {
      const selectedIds = new Set(['1', '2'])
      selectionManager.setSelectedIds(selectedIds)

      expect(selectionManager.getSelectionCount()).toBe(2)
      expect(selectionManager.isSelected('1')).toBe(true)
      expect(selectionManager.isSelected('2')).toBe(true)
    })
  })

  describe('不可选择的节点', () => {
    beforeEach(() => {
      const node3 = new TreeNodeImpl({
        id: '3',
        label: '不可选择节点',
        selectable: false,
      })
      nodeMap.set('3', node3)
      selectionManager.updateNodeMap(nodeMap)
    })

    it('不应该能够选择不可选择的节点', () => {
      selectionManager.selectNode('3', true)

      expect(selectionManager.isSelected('3')).toBe(false)
      expect(selectionManager.getSelectionCount()).toBe(0)
    })

    it('全选时应该跳过不可选择的节点', () => {
      selectionManager.selectAll()

      expect(selectionManager.isSelected('3')).toBe(false)
      expect(selectionManager.getSelectionCount()).toBe(nodes.length)
    })
  })
})
