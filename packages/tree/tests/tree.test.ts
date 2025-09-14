/**
 * 树形组件基础功能测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Tree from '../src/core/tree'
import type { TreeNodeData } from '../src/types/tree-node'

describe('Tree Component', () => {
  let container: HTMLElement
  let tree: Tree

  const mockData: TreeNodeData[] = [
    {
      id: '1',
      label: '节点1',
      children: [
        {
          id: '1-1',
          label: '子节点1-1',
          children: [
            { id: '1-1-1', label: '子节点1-1-1' },
            { id: '1-1-2', label: '子节点1-1-2' },
          ],
        },
        { id: '1-2', label: '子节点1-2' },
      ],
    },
    {
      id: '2',
      label: '节点2',
      children: [
        { id: '2-1', label: '子节点2-1' },
        { id: '2-2', label: '子节点2-2' },
      ],
    },
    {
      id: '3',
      label: '节点3',
    },
  ]

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'tree-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (tree) {
      tree.destroy()
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('初始化', () => {
    it('应该能够创建树形组件实例', () => {
      tree = new Tree({
        container,
        data: mockData,
      })

      expect(tree).toBeDefined()
      expect(tree.container).toBe(container)
      expect(container.classList.contains('ldesign-tree')).toBe(true)
    })

    it('应该能够设置初始数据', () => {
      tree = new Tree({
        container,
        data: mockData,
      })

      const rootNodes = tree.getRootNodes()
      expect(rootNodes).toHaveLength(3)
      expect(rootNodes[0].id).toBe('1')
      expect(rootNodes[0].label).toBe('节点1')
      expect(rootNodes[0].children).toHaveLength(2)
    })

    it('应该能够通过选择器创建容器', () => {
      tree = new Tree({
        container: '#tree-container',
        data: mockData,
      })

      expect(tree.container).toBe(container)
    })

    it('容器不存在时应该抛出错误', () => {
      expect(() => {
        new Tree({
          container: '#non-existent',
          data: mockData,
        })
      }).toThrow('Container element not found: #non-existent')
    })
  })

  describe('数据操作', () => {
    beforeEach(() => {
      tree = new Tree({
        container,
        data: mockData,
      })
    })

    it('应该能够获取节点', () => {
      const node = tree.getNode('1')
      expect(node).toBeDefined()
      expect(node?.id).toBe('1')
      expect(node?.label).toBe('节点1')
    })

    it('应该能够获取所有节点', () => {
      const allNodes = tree.getAllNodes()
      expect(allNodes.length).toBeGreaterThan(3)
      
      // 验证包含所有层级的节点
      const nodeIds = allNodes.map(node => node.id)
      expect(nodeIds).toContain('1')
      expect(nodeIds).toContain('1-1')
      expect(nodeIds).toContain('1-1-1')
    })

    it('应该能够添加节点', () => {
      const newNode = tree.addNode({
        id: '4',
        label: '新节点4',
      })

      expect(newNode.id).toBe('4')
      expect(newNode.label).toBe('新节点4')
      
      const rootNodes = tree.getRootNodes()
      expect(rootNodes).toHaveLength(4)
    })

    it('应该能够添加子节点', () => {
      const newNode = tree.addNode({
        id: '1-3',
        label: '新子节点1-3',
      }, '1')

      expect(newNode.id).toBe('1-3')
      expect(newNode.parent?.id).toBe('1')
      
      const parentNode = tree.getNode('1')
      expect(parentNode?.children).toHaveLength(3)
    })

    it('应该能够移除节点', () => {
      const result = tree.removeNode('1-2')
      expect(result).toBe(true)
      
      const node = tree.getNode('1-2')
      expect(node).toBeUndefined()
      
      const parentNode = tree.getNode('1')
      expect(parentNode?.children).toHaveLength(1)
    })

    it('应该能够更新节点', () => {
      const result = tree.updateNode('1', { label: '更新的节点1' })
      expect(result).toBe(true)
      
      const node = tree.getNode('1')
      expect(node?.label).toBe('更新的节点1')
    })
  })

  describe('选择功能', () => {
    beforeEach(() => {
      tree = new Tree({
        container,
        data: mockData,
        selection: {
          mode: 'single',
        },
      })
    })

    it('应该能够选择节点', () => {
      tree.selectNode('1', true)
      
      const node = tree.getNode('1')
      expect(node?.selected).toBe(true)
      
      const selectedNodes = tree.getSelectedNodes()
      expect(selectedNodes).toHaveLength(1)
      expect(selectedNodes[0].id).toBe('1')
    })

    it('应该能够取消选择节点', () => {
      tree.selectNode('1', true)
      tree.selectNode('1', false)
      
      const node = tree.getNode('1')
      expect(node?.selected).toBe(false)
      
      const selectedNodes = tree.getSelectedNodes()
      expect(selectedNodes).toHaveLength(0)
    })

    it('应该能够切换选择状态', () => {
      tree.toggleSelect('1')
      
      const node = tree.getNode('1')
      expect(node?.selected).toBe(true)
      
      tree.toggleSelect('1')
      expect(node?.selected).toBe(false)
    })
  })

  describe('展开功能', () => {
    beforeEach(() => {
      tree = new Tree({
        container,
        data: mockData,
      })
    })

    it('应该能够展开节点', () => {
      tree.expandNode('1', true)
      
      const node = tree.getNode('1')
      expect(node?.expanded).toBe(true)
      
      const expandedNodes = tree.getExpandedNodes()
      expect(expandedNodes).toHaveLength(1)
      expect(expandedNodes[0].id).toBe('1')
    })

    it('应该能够收起节点', () => {
      tree.expandNode('1', true)
      tree.expandNode('1', false)
      
      const node = tree.getNode('1')
      expect(node?.expanded).toBe(false)
      
      const expandedNodes = tree.getExpandedNodes()
      expect(expandedNodes).toHaveLength(0)
    })

    it('应该能够切换展开状态', () => {
      tree.toggleExpand('1')
      
      const node = tree.getNode('1')
      expect(node?.expanded).toBe(true)
      
      tree.toggleExpand('1')
      expect(node?.expanded).toBe(false)
    })
  })

  describe('搜索功能', () => {
    beforeEach(() => {
      tree = new Tree({
        container,
        data: mockData,
        search: {
          enabled: true,
        },
      })
    })

    it('应该能够搜索节点', () => {
      const results = tree.search('节点1')
      
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(node => node.id === '1')).toBe(true)
    })

    it('应该能够清空搜索', () => {
      tree.search('节点1')
      tree.clearSearch()
      
      const state = tree.getState()
      expect(state.searchKeyword).toBe('')
    })
  })

  describe('销毁功能', () => {
    it('应该能够正确销毁组件', () => {
      tree = new Tree({
        container,
        data: mockData,
      })

      tree.destroy()
      
      expect(container.innerHTML).toBe('')
      expect(container.classList.contains('ldesign-tree')).toBe(false)
    })
  })
})
