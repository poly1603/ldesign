/**
 * SelectionManager单元测试
 * 
 * 测试选择管理器功能
 * 确保选择操作正常工作
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SelectionManager } from '@/managers/SelectionManager'
import { createTestData } from '../setup'

describe('SelectionManager', () => {
  let selectionManager: SelectionManager
  let testData: any[]

  beforeEach(() => {
    testData = createTestData(10)
    selectionManager = new SelectionManager()
  })

  describe('基础选择功能', () => {
    it('应该正确初始化', () => {
      expect(selectionManager.getSelectedKeys()).toEqual([])
      expect(selectionManager.isSelected(1)).toBe(false)
      expect(selectionManager.getSelectedCount()).toBe(0)
    })

    it('应该正确选择单行', () => {
      selectionManager.select(1)
      
      expect(selectionManager.isSelected(1)).toBe(true)
      expect(selectionManager.getSelectedKeys()).toEqual([1])
      expect(selectionManager.getSelectedCount()).toBe(1)
    })

    it('应该正确取消选择单行', () => {
      selectionManager.select(1)
      selectionManager.deselect(1)
      
      expect(selectionManager.isSelected(1)).toBe(false)
      expect(selectionManager.getSelectedKeys()).toEqual([])
      expect(selectionManager.getSelectedCount()).toBe(0)
    })

    it('应该正确切换选择状态', () => {
      selectionManager.toggle(1)
      expect(selectionManager.isSelected(1)).toBe(true)
      
      selectionManager.toggle(1)
      expect(selectionManager.isSelected(1)).toBe(false)
    })

    it('应该正确选择多行', () => {
      selectionManager.select([1, 2, 3])
      
      expect(selectionManager.isSelected(1)).toBe(true)
      expect(selectionManager.isSelected(2)).toBe(true)
      expect(selectionManager.isSelected(3)).toBe(true)
      expect(selectionManager.getSelectedKeys()).toEqual([1, 2, 3])
      expect(selectionManager.getSelectedCount()).toBe(3)
    })

    it('应该正确取消选择多行', () => {
      selectionManager.select([1, 2, 3, 4])
      selectionManager.deselect([2, 3])
      
      expect(selectionManager.isSelected(1)).toBe(true)
      expect(selectionManager.isSelected(2)).toBe(false)
      expect(selectionManager.isSelected(3)).toBe(false)
      expect(selectionManager.isSelected(4)).toBe(true)
      expect(selectionManager.getSelectedKeys()).toEqual([1, 4])
      expect(selectionManager.getSelectedCount()).toBe(2)
    })
  })

  describe('全选功能', () => {
    it('应该正确全选', () => {
      const allKeys = testData.map(item => item.id)
      selectionManager.selectAll(allKeys)
      
      expect(selectionManager.getSelectedCount()).toBe(testData.length)
      expect(selectionManager.isAllSelected(allKeys)).toBe(true)
      expect(selectionManager.isIndeterminate(allKeys)).toBe(false)
    })

    it('应该正确取消全选', () => {
      const allKeys = testData.map(item => item.id)
      selectionManager.selectAll(allKeys)
      selectionManager.deselectAll()
      
      expect(selectionManager.getSelectedCount()).toBe(0)
      expect(selectionManager.isAllSelected(allKeys)).toBe(false)
      expect(selectionManager.isIndeterminate(allKeys)).toBe(false)
    })

    it('应该正确检测半选状态', () => {
      const allKeys = testData.map(item => item.id)
      selectionManager.select([1, 2, 3])
      
      expect(selectionManager.isAllSelected(allKeys)).toBe(false)
      expect(selectionManager.isIndeterminate(allKeys)).toBe(true)
    })

    it('应该正确切换全选状态', () => {
      const allKeys = testData.map(item => item.id)
      
      // 从无选择到全选
      selectionManager.toggleAll(allKeys)
      expect(selectionManager.isAllSelected(allKeys)).toBe(true)
      
      // 从全选到无选择
      selectionManager.toggleAll(allKeys)
      expect(selectionManager.getSelectedCount()).toBe(0)
      
      // 从半选到全选
      selectionManager.select([1, 2])
      selectionManager.toggleAll(allKeys)
      expect(selectionManager.isAllSelected(allKeys)).toBe(true)
    })
  })

  describe('范围选择', () => {
    it('应该正确进行范围选择', () => {
      const allKeys = testData.map(item => item.id)
      selectionManager.selectRange(3, 7, allKeys)
      
      const selectedKeys = selectionManager.getSelectedKeys()
      expect(selectedKeys).toEqual([3, 4, 5, 6, 7])
    })

    it('应该正确处理反向范围选择', () => {
      const allKeys = testData.map(item => item.id)
      selectionManager.selectRange(7, 3, allKeys)
      
      const selectedKeys = selectionManager.getSelectedKeys()
      expect(selectedKeys).toEqual([3, 4, 5, 6, 7])
    })

    it('应该正确处理单点范围选择', () => {
      const allKeys = testData.map(item => item.id)
      selectionManager.selectRange(5, 5, allKeys)
      
      const selectedKeys = selectionManager.getSelectedKeys()
      expect(selectedKeys).toEqual([5])
    })

    it('应该正确处理超出范围的选择', () => {
      const allKeys = testData.map(item => item.id)
      selectionManager.selectRange(8, 15, allKeys)
      
      const selectedKeys = selectionManager.getSelectedKeys()
      expect(selectedKeys).toEqual([8, 9, 10])
    })
  })

  describe('选择模式', () => {
    it('应该支持单选模式', () => {
      selectionManager.setMode('single')
      
      selectionManager.select(1)
      expect(selectionManager.getSelectedKeys()).toEqual([1])
      
      selectionManager.select(2)
      expect(selectionManager.getSelectedKeys()).toEqual([2])
      expect(selectionManager.isSelected(1)).toBe(false)
    })

    it('应该支持多选模式', () => {
      selectionManager.setMode('multiple')
      
      selectionManager.select(1)
      selectionManager.select(2)
      
      expect(selectionManager.getSelectedKeys()).toEqual([1, 2])
      expect(selectionManager.isSelected(1)).toBe(true)
      expect(selectionManager.isSelected(2)).toBe(true)
    })

    it('应该支持禁用选择模式', () => {
      selectionManager.setMode('none')
      
      selectionManager.select(1)
      expect(selectionManager.getSelectedKeys()).toEqual([])
      expect(selectionManager.isSelected(1)).toBe(false)
    })

    it('应该在切换到单选模式时清除多余选择', () => {
      selectionManager.setMode('multiple')
      selectionManager.select([1, 2, 3])
      
      selectionManager.setMode('single')
      expect(selectionManager.getSelectedCount()).toBeLessThanOrEqual(1)
    })
  })

  describe('事件触发', () => {
    it('应该在选择变更时触发事件', () => {
      const onSelectionChange = vi.fn()
      selectionManager.on('selection-change', onSelectionChange)
      
      selectionManager.select(1)
      
      expect(onSelectionChange).toHaveBeenCalledWith({
        type: 'select',
        keys: [1],
        selectedKeys: [1]
      })
    })

    it('应该在取消选择时触发事件', () => {
      const onSelectionChange = vi.fn()
      selectionManager.on('selection-change', onSelectionChange)
      
      selectionManager.select(1)
      onSelectionChange.mockClear()
      
      selectionManager.deselect(1)
      
      expect(onSelectionChange).toHaveBeenCalledWith({
        type: 'deselect',
        keys: [1],
        selectedKeys: []
      })
    })

    it('应该在全选时触发事件', () => {
      const onSelectionChange = vi.fn()
      selectionManager.on('selection-change', onSelectionChange)
      
      const allKeys = testData.map(item => item.id)
      selectionManager.selectAll(allKeys)
      
      expect(onSelectionChange).toHaveBeenCalledWith({
        type: 'select-all',
        keys: allKeys,
        selectedKeys: allKeys
      })
    })

    it('应该在清除选择时触发事件', () => {
      const onSelectionChange = vi.fn()
      selectionManager.on('selection-change', onSelectionChange)
      
      selectionManager.select([1, 2, 3])
      onSelectionChange.mockClear()
      
      selectionManager.clear()
      
      expect(onSelectionChange).toHaveBeenCalledWith({
        type: 'clear',
        keys: [],
        selectedKeys: []
      })
    })
  })

  describe('工具方法', () => {
    it('应该正确检查是否有选择', () => {
      expect(selectionManager.hasSelection()).toBe(false)
      
      selectionManager.select(1)
      expect(selectionManager.hasSelection()).toBe(true)
    })

    it('应该正确获取选择状态', () => {
      selectionManager.select([1, 2, 3])
      
      const state = selectionManager.getSelectionState()
      expect(state).toEqual({
        selectedKeys: [1, 2, 3],
        selectedCount: 3,
        mode: 'multiple'
      })
    })

    it('应该正确设置选择状态', () => {
      const state = {
        selectedKeys: [1, 2, 3],
        selectedCount: 3,
        mode: 'multiple' as const
      }
      
      selectionManager.setSelectionState(state)
      
      expect(selectionManager.getSelectedKeys()).toEqual([1, 2, 3])
      expect(selectionManager.getSelectedCount()).toBe(3)
    })
  })

  describe('性能测试', () => {
    it('应该能处理大量选择', () => {
      const largeKeys = Array.from({ length: 10000 }, (_, i) => i + 1)
      
      const startTime = performance.now()
      selectionManager.selectAll(largeKeys)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
      expect(selectionManager.getSelectedCount()).toBe(10000)
    })

    it('应该能高效处理频繁的选择变更', () => {
      const startTime = performance.now()
      
      for (let i = 1; i <= 1000; i++) {
        selectionManager.toggle(i)
      }
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
    })
  })
})
