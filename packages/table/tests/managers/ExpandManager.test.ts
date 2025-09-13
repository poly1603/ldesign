/**
 * ExpandManager单元测试
 * 
 * 测试展开管理器功能
 * 确保行展开/折叠操作正常工作
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ExpandManager } from '@/managers/ExpandManager'
import { createTestData } from '../setup'

describe('ExpandManager', () => {
  let expandManager: ExpandManager
  let testData: any[]

  beforeEach(() => {
    testData = createTestData(10)
    expandManager = new ExpandManager()
  })

  describe('基础展开功能', () => {
    it('应该正确初始化', () => {
      expect(expandManager.getExpandedKeys()).toEqual([])
      expect(expandManager.isExpanded(1)).toBe(false)
      expect(expandManager.getExpandedCount()).toBe(0)
    })

    it('应该正确展开单行', () => {
      expandManager.expand(1)
      
      expect(expandManager.isExpanded(1)).toBe(true)
      expect(expandManager.getExpandedKeys()).toEqual([1])
      expect(expandManager.getExpandedCount()).toBe(1)
    })

    it('应该正确折叠单行', () => {
      expandManager.expand(1)
      expandManager.collapse(1)
      
      expect(expandManager.isExpanded(1)).toBe(false)
      expect(expandManager.getExpandedKeys()).toEqual([])
      expect(expandManager.getExpandedCount()).toBe(0)
    })

    it('应该正确切换展开状态', () => {
      expandManager.toggle(1)
      expect(expandManager.isExpanded(1)).toBe(true)
      
      expandManager.toggle(1)
      expect(expandManager.isExpanded(1)).toBe(false)
    })

    it('应该正确展开多行', () => {
      expandManager.expand([1, 2, 3])
      
      expect(expandManager.isExpanded(1)).toBe(true)
      expect(expandManager.isExpanded(2)).toBe(true)
      expect(expandManager.isExpanded(3)).toBe(true)
      expect(expandManager.getExpandedKeys()).toEqual([1, 2, 3])
      expect(expandManager.getExpandedCount()).toBe(3)
    })

    it('应该正确折叠多行', () => {
      expandManager.expand([1, 2, 3, 4])
      expandManager.collapse([2, 3])
      
      expect(expandManager.isExpanded(1)).toBe(true)
      expect(expandManager.isExpanded(2)).toBe(false)
      expect(expandManager.isExpanded(3)).toBe(false)
      expect(expandManager.isExpanded(4)).toBe(true)
      expect(expandManager.getExpandedKeys()).toEqual([1, 4])
      expect(expandManager.getExpandedCount()).toBe(2)
    })
  })

  describe('全部展开/折叠', () => {
    it('应该正确展开所有行', () => {
      const allKeys = testData.map(item => item.id)
      expandManager.expandAll(allKeys)
      
      expect(expandManager.getExpandedCount()).toBe(testData.length)
      expect(expandManager.isAllExpanded(allKeys)).toBe(true)
      expect(expandManager.isIndeterminate(allKeys)).toBe(false)
    })

    it('应该正确折叠所有行', () => {
      const allKeys = testData.map(item => item.id)
      expandManager.expandAll(allKeys)
      expandManager.collapseAll()
      
      expect(expandManager.getExpandedCount()).toBe(0)
      expect(expandManager.isAllExpanded(allKeys)).toBe(false)
      expect(expandManager.isIndeterminate(allKeys)).toBe(false)
    })

    it('应该正确检测半展开状态', () => {
      const allKeys = testData.map(item => item.id)
      expandManager.expand([1, 2, 3])
      
      expect(expandManager.isAllExpanded(allKeys)).toBe(false)
      expect(expandManager.isIndeterminate(allKeys)).toBe(true)
    })

    it('应该正确切换全部展开状态', () => {
      const allKeys = testData.map(item => item.id)
      
      // 从无展开到全展开
      expandManager.toggleAll(allKeys)
      expect(expandManager.isAllExpanded(allKeys)).toBe(true)
      
      // 从全展开到无展开
      expandManager.toggleAll(allKeys)
      expect(expandManager.getExpandedCount()).toBe(0)
      
      // 从半展开到全展开
      expandManager.expand([1, 2])
      expandManager.toggleAll(allKeys)
      expect(expandManager.isAllExpanded(allKeys)).toBe(true)
    })
  })

  describe('层级展开', () => {
    it('应该正确处理层级展开', () => {
      // 模拟层级数据
      const hierarchicalData = [
        { id: 1, parentId: null, level: 0 },
        { id: 2, parentId: 1, level: 1 },
        { id: 3, parentId: 1, level: 1 },
        { id: 4, parentId: 2, level: 2 },
        { id: 5, parentId: null, level: 0 }
      ]

      expandManager.expandWithChildren(1, hierarchicalData)
      
      expect(expandManager.isExpanded(1)).toBe(true)
      expect(expandManager.isExpanded(2)).toBe(true)
      expect(expandManager.isExpanded(3)).toBe(true)
      expect(expandManager.isExpanded(4)).toBe(true)
      expect(expandManager.isExpanded(5)).toBe(false)
    })

    it('应该正确处理层级折叠', () => {
      const hierarchicalData = [
        { id: 1, parentId: null, level: 0 },
        { id: 2, parentId: 1, level: 1 },
        { id: 3, parentId: 1, level: 1 },
        { id: 4, parentId: 2, level: 2 }
      ]

      expandManager.expandWithChildren(1, hierarchicalData)
      expandManager.collapseWithChildren(1, hierarchicalData)
      
      expect(expandManager.isExpanded(1)).toBe(false)
      expect(expandManager.isExpanded(2)).toBe(false)
      expect(expandManager.isExpanded(3)).toBe(false)
      expect(expandManager.isExpanded(4)).toBe(false)
    })

    it('应该正确获取子节点', () => {
      const hierarchicalData = [
        { id: 1, parentId: null, level: 0 },
        { id: 2, parentId: 1, level: 1 },
        { id: 3, parentId: 1, level: 1 },
        { id: 4, parentId: 2, level: 2 },
        { id: 5, parentId: null, level: 0 }
      ]

      const children = expandManager.getChildren(1, hierarchicalData)
      expect(children.map(item => item.id)).toEqual([2, 3, 4])
    })

    it('应该正确获取直接子节点', () => {
      const hierarchicalData = [
        { id: 1, parentId: null, level: 0 },
        { id: 2, parentId: 1, level: 1 },
        { id: 3, parentId: 1, level: 1 },
        { id: 4, parentId: 2, level: 2 }
      ]

      const directChildren = expandManager.getDirectChildren(1, hierarchicalData)
      expect(directChildren.map(item => item.id)).toEqual([2, 3])
    })
  })

  describe('展开级别控制', () => {
    it('应该正确设置最大展开级别', () => {
      expandManager.setMaxLevel(2)
      
      const hierarchicalData = [
        { id: 1, parentId: null, level: 0 },
        { id: 2, parentId: 1, level: 1 },
        { id: 3, parentId: 2, level: 2 },
        { id: 4, parentId: 3, level: 3 }
      ]

      expandManager.expandWithChildren(1, hierarchicalData)
      
      expect(expandManager.isExpanded(1)).toBe(true)
      expect(expandManager.isExpanded(2)).toBe(true)
      expect(expandManager.isExpanded(3)).toBe(true)
      expect(expandManager.isExpanded(4)).toBe(false) // 超过最大级别
    })

    it('应该正确按级别展开', () => {
      const hierarchicalData = [
        { id: 1, parentId: null, level: 0 },
        { id: 2, parentId: 1, level: 1 },
        { id: 3, parentId: 2, level: 2 },
        { id: 4, parentId: 3, level: 3 }
      ]

      expandManager.expandToLevel(2, hierarchicalData)
      
      expect(expandManager.isExpanded(1)).toBe(true)
      expect(expandManager.isExpanded(2)).toBe(true)
      expect(expandManager.isExpanded(3)).toBe(false) // level 2 不展开
      expect(expandManager.isExpanded(4)).toBe(false)
    })
  })

  describe('事件触发', () => {
    it('应该在展开时触发事件', () => {
      const onExpandChange = vi.fn()
      expandManager.on('expand-change', onExpandChange)
      
      expandManager.expand(1)
      
      expect(onExpandChange).toHaveBeenCalledWith({
        type: 'expand',
        keys: [1],
        expandedKeys: [1]
      })
    })

    it('应该在折叠时触发事件', () => {
      const onExpandChange = vi.fn()
      expandManager.on('expand-change', onExpandChange)
      
      expandManager.expand(1)
      onExpandChange.mockClear()
      
      expandManager.collapse(1)
      
      expect(onExpandChange).toHaveBeenCalledWith({
        type: 'collapse',
        keys: [1],
        expandedKeys: []
      })
    })

    it('应该在全部展开时触发事件', () => {
      const onExpandChange = vi.fn()
      expandManager.on('expand-change', onExpandChange)
      
      const allKeys = testData.map(item => item.id)
      expandManager.expandAll(allKeys)
      
      expect(onExpandChange).toHaveBeenCalledWith({
        type: 'expand-all',
        keys: allKeys,
        expandedKeys: allKeys
      })
    })

    it('应该在清除展开时触发事件', () => {
      const onExpandChange = vi.fn()
      expandManager.on('expand-change', onExpandChange)
      
      expandManager.expand([1, 2, 3])
      onExpandChange.mockClear()
      
      expandManager.clear()
      
      expect(onExpandChange).toHaveBeenCalledWith({
        type: 'clear',
        keys: [],
        expandedKeys: []
      })
    })
  })

  describe('工具方法', () => {
    it('应该正确检查是否有展开', () => {
      expect(expandManager.hasExpanded()).toBe(false)
      
      expandManager.expand(1)
      expect(expandManager.hasExpanded()).toBe(true)
    })

    it('应该正确获取展开状态', () => {
      expandManager.expand([1, 2, 3])
      
      const state = expandManager.getExpandState()
      expect(state).toEqual({
        expandedKeys: [1, 2, 3],
        expandedCount: 3,
        maxLevel: undefined
      })
    })

    it('应该正确设置展开状态', () => {
      const state = {
        expandedKeys: [1, 2, 3],
        expandedCount: 3,
        maxLevel: 2
      }
      
      expandManager.setExpandState(state)
      
      expect(expandManager.getExpandedKeys()).toEqual([1, 2, 3])
      expect(expandManager.getExpandedCount()).toBe(3)
    })
  })

  describe('性能测试', () => {
    it('应该能处理大量展开', () => {
      const largeKeys = Array.from({ length: 10000 }, (_, i) => i + 1)
      
      const startTime = performance.now()
      expandManager.expandAll(largeKeys)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
      expect(expandManager.getExpandedCount()).toBe(10000)
    })

    it('应该能高效处理频繁的展开变更', () => {
      const startTime = performance.now()
      
      for (let i = 1; i <= 1000; i++) {
        expandManager.toggle(i)
      }
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
    })
  })
})
