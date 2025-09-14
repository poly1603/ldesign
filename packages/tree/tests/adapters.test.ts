/**
 * 多框架适配器测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VanillaTree, createTree, registerGlobal } from '../src/adapters/vanilla'
import type { TreeNodeData } from '../src/types'

// Mock DOM environment
const mockElement = {
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
    toggle: vi.fn(),
  },
  style: {},
  innerHTML: '',
  textContent: '',
}

// Mock Tree class
vi.mock('../src/core/tree', () => ({
  Tree: vi.fn().mockImplementation(() => ({
    setData: vi.fn(),
    getData: vi.fn(() => []),
    addNode: vi.fn(),
    removeNode: vi.fn(),
    updateNode: vi.fn(),
    selectNode: vi.fn(),
    unselectNode: vi.fn(),
    selectAll: vi.fn(),
    unselectAll: vi.fn(),
    getSelectedNodes: vi.fn(() => []),
    setSelectedNodes: vi.fn(),
    expandNode: vi.fn(),
    collapseNode: vi.fn(),
    expandAll: vi.fn(),
    collapseAll: vi.fn(),
    setExpandedNodes: vi.fn(),
    search: vi.fn(),
    clearSearch: vi.fn(),
    scrollToNode: vi.fn(),
    refresh: vi.fn(),
    updateOptions: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}))

describe('多框架适配器', () => {
  let testData: TreeNodeData[]

  beforeEach(() => {
    vi.clearAllMocks()
    
    testData = [
      {
        id: '1',
        label: '节点1',
        children: [
          { id: '1-1', label: '子节点1-1' },
          { id: '1-2', label: '子节点1-2' },
        ],
      },
      {
        id: '2',
        label: '节点2',
      },
    ]
  })

  describe('原生JavaScript适配器', () => {
    it('应该能够创建VanillaTree实例', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
      })

      expect(tree).toBeInstanceOf(VanillaTree)
      expect(tree.getTreeInstance()).toBeDefined()
    })

    it('应该能够通过工厂函数创建树', () => {
      const tree = createTree({
        container: mockElement as any,
        data: testData,
      })

      expect(tree).toBeInstanceOf(VanillaTree)
    })

    it('应该能够通过选择器创建树', () => {
      // Mock document.querySelector
      global.document = {
        querySelector: vi.fn(() => mockElement),
      } as any

      const tree = new VanillaTree({
        container: '#tree-container',
        data: testData,
      })

      expect(tree).toBeInstanceOf(VanillaTree)
      expect(document.querySelector).toHaveBeenCalledWith('#tree-container')
    })

    it('容器不存在时应该抛出错误', () => {
      global.document = {
        querySelector: vi.fn(() => null),
      } as any

      expect(() => {
        new VanillaTree({
          container: '#non-existent',
          data: testData,
        })
      }).toThrow('Container element not found')
    })

    it('应该能够设置和获取数据', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
      })

      tree.setData(testData)
      const data = tree.getData()

      expect(tree.getTreeInstance().setData).toHaveBeenCalledWith(testData)
      expect(tree.getTreeInstance().getData).toHaveBeenCalled()
    })

    it('应该能够操作节点', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
      })

      // 添加节点
      const newNode = { id: '3', label: '新节点' }
      tree.addNode(newNode, '1')
      expect(tree.getTreeInstance().addNode).toHaveBeenCalledWith(newNode, '1')

      // 删除节点
      tree.removeNode('2')
      expect(tree.getTreeInstance().removeNode).toHaveBeenCalledWith('2')

      // 更新节点
      tree.updateNode('1', { label: '更新的节点1' })
      expect(tree.getTreeInstance().updateNode).toHaveBeenCalledWith('1', { label: '更新的节点1' })
    })

    it('应该能够操作选择状态', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
      })

      // 选中节点
      tree.selectNode('1')
      expect(tree.getTreeInstance().selectNode).toHaveBeenCalledWith('1')

      // 取消选中节点
      tree.unselectNode('1')
      expect(tree.getTreeInstance().unselectNode).toHaveBeenCalledWith('1')

      // 选中所有
      tree.selectAll()
      expect(tree.getTreeInstance().selectAll).toHaveBeenCalled()

      // 取消选中所有
      tree.unselectAll()
      expect(tree.getTreeInstance().unselectAll).toHaveBeenCalled()

      // 获取选中节点
      tree.getSelectedNodes()
      expect(tree.getTreeInstance().getSelectedNodes).toHaveBeenCalled()
    })

    it('应该能够操作展开状态', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
      })

      // 展开节点
      tree.expandNode('1')
      expect(tree.getTreeInstance().expandNode).toHaveBeenCalledWith('1')

      // 收起节点
      tree.collapseNode('1')
      expect(tree.getTreeInstance().collapseNode).toHaveBeenCalledWith('1')

      // 展开所有
      tree.expandAll()
      expect(tree.getTreeInstance().expandAll).toHaveBeenCalled()

      // 收起所有
      tree.collapseAll()
      expect(tree.getTreeInstance().collapseAll).toHaveBeenCalled()
    })

    it('应该能够搜索节点', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
      })

      // 搜索
      tree.search('节点1')
      expect(tree.getTreeInstance().search).toHaveBeenCalledWith('节点1')

      // 清除搜索
      tree.clearSearch()
      expect(tree.getTreeInstance().clearSearch).toHaveBeenCalled()
    })

    it('应该能够滚动到节点', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
      })

      tree.scrollToNode('1')
      expect(tree.getTreeInstance().scrollToNode).toHaveBeenCalledWith('1')
    })

    it('应该能够刷新树', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
      })

      tree.refresh()
      expect(tree.getTreeInstance().refresh).toHaveBeenCalled()
    })

    it('应该能够更新配置', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
      })

      const newConfig = { theme: 'dark' as const }
      tree.updateConfig(newConfig)
      expect(tree.getTreeInstance().updateOptions).toHaveBeenCalledWith(newConfig)
    })

    it('应该能够销毁树', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
      })

      tree.destroy()
      expect(tree.getTreeInstance().destroy).toHaveBeenCalled()
    })

    it('应该能够监听和触发事件', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
      })

      const callback = vi.fn()

      // 监听事件
      tree.on('select', callback)
      expect(tree.getTreeInstance().on).toHaveBeenCalledWith('select', callback)

      // 取消监听
      tree.off('select', callback)
      expect(tree.getTreeInstance().off).toHaveBeenCalledWith('select', callback)

      // 触发事件
      tree.emit('select', ['1'])
      expect(tree.getTreeInstance().emit).toHaveBeenCalledWith('select', ['1'])
    })

    it('应该能够绑定事件回调', () => {
      const onSelect = vi.fn()
      const onExpand = vi.fn()

      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
        onSelect,
        onExpand,
      })

      expect(tree.getTreeInstance().on).toHaveBeenCalledWith('select', onSelect)
      expect(tree.getTreeInstance().on).toHaveBeenCalledWith('expand', onExpand)
    })

    it('应该能够设置初始状态', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
        selectedKeys: ['1'],
        expandedKeys: ['1'],
      })

      expect(tree.getTreeInstance().setData).toHaveBeenCalledWith(testData)
      expect(tree.getTreeInstance().setSelectedNodes).toHaveBeenCalledWith(['1'])
      expect(tree.getTreeInstance().setExpandedNodes).toHaveBeenCalledWith(['1'])
    })
  })

  describe('全局注册', () => {
    it('应该能够注册到全局', () => {
      const mockWindow = {} as any
      global.window = mockWindow

      registerGlobal('TestTree')

      expect(mockWindow.TestTree).toBeDefined()
      expect(mockWindow.TestTree.Tree).toBe(VanillaTree)
      expect(mockWindow.TestTree.createTree).toBe(createTree)
    })

    it('应该能够使用默认名称注册', () => {
      const mockWindow = {} as any
      global.window = mockWindow

      registerGlobal()

      expect(mockWindow.LDesignTree).toBeDefined()
    })

    it('在非浏览器环境中不应该注册', () => {
      const originalWindow = global.window
      delete (global as any).window

      expect(() => registerGlobal()).not.toThrow()

      global.window = originalWindow
    })
  })

  describe('类型检查', () => {
    it('应该有正确的类型定义', () => {
      const tree = new VanillaTree({
        container: mockElement as any,
        data: testData,
        selection: {
          mode: 'multiple',
          showCheckbox: true,
        },
        dragDrop: {
          enabled: true,
        },
        search: {
          enabled: true,
        },
        virtualScroll: {
          enabled: true,
        },
        theme: 'dark',
        size: 'large',
        disabled: false,
        loading: false,
      })

      expect(tree).toBeInstanceOf(VanillaTree)
    })

    it('应该支持事件回调类型', () => {
      const config = {
        container: mockElement as any,
        data: testData,
        onSelect: (keys: string[]) => console.log('Selected:', keys),
        onExpand: (nodeId: string) => console.log('Expanded:', nodeId),
        onCollapse: (nodeId: string) => console.log('Collapsed:', nodeId),
        onCheck: (keys: string[]) => console.log('Checked:', keys),
        onUncheck: (keys: string[]) => console.log('Unchecked:', keys),
        onDragStart: (nodeId: string) => console.log('Drag start:', nodeId),
        onDragEnd: (nodeId: string) => console.log('Drag end:', nodeId),
        onDrop: (data: any) => console.log('Drop:', data),
        onSearch: (keyword: string, results: any[]) => console.log('Search:', keyword, results),
        onLoad: (nodeId: string, data: TreeNodeData[]) => console.log('Load:', nodeId, data),
        onError: (error: Error) => console.error('Error:', error),
      }

      const tree = new VanillaTree(config)
      expect(tree).toBeInstanceOf(VanillaTree)
    })
  })
})
