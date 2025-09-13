/**
 * DataManager单元测试
 * 
 * 测试数据管理器功能
 * 确保数据操作正常工作
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DataManager } from '@/managers/DataManager'
import { createTestData } from '../setup'

describe('DataManager', () => {
  let dataManager: DataManager
  let testData: any[]

  beforeEach(() => {
    testData = createTestData(20)
    dataManager = new DataManager({
      data: testData,
      rowKey: 'id'
    })
  })

  describe('基础数据操作', () => {
    it('应该正确获取原始数据', () => {
      const data = dataManager.getRawData()
      expect(data).toEqual(testData)
    })

    it('应该正确设置数据', () => {
      const newData = createTestData(10)
      dataManager.setData(newData)

      expect(dataManager.getRawData()).toEqual(newData)
    })

    it('应该正确获取显示数据', () => {
      const displayData = dataManager.getDisplayData()
      expect(displayData).toEqual(testData)
    })

    it('应该正确获取过滤后的数据', () => {
      const filteredData = dataManager.getFilteredData()
      expect(filteredData).toEqual(testData)
    })

    it('应该正确根据键获取行数据', () => {
      const row = dataManager.getRowByKey(1)
      expect(row).toEqual(testData[0])
    })

    it('应该正确根据索引获取行数据', () => {
      const row = dataManager.getRowByIndex(0)
      expect(row).toEqual(testData[0])
    })

    it('应该正确获取行键', () => {
      const key = dataManager.getRowKey(testData[0])
      expect(key).toBe(1)
    })
  })

  describe('数据添加', () => {
    it('应该正确添加单行数据', () => {
      const newRow = { id: 999, name: 'New User', age: 25 }
      dataManager.addData(newRow)

      const data = dataManager.getRawData()
      expect(data).toHaveLength(testData.length + 1)
      expect(data[data.length - 1]).toEqual(newRow)
    })

    it('应该正确添加多行数据', () => {
      const newRows = [
        { id: 998, name: 'User 1', age: 25 },
        { id: 999, name: 'User 2', age: 26 }
      ]
      dataManager.addData(newRows)

      const data = dataManager.getRawData()
      expect(data).toHaveLength(testData.length + 2)
      expect(data.slice(-2)).toEqual(newRows)
    })

    it('应该正确在指定位置插入数据', () => {
      const newRow = { id: 999, name: 'Inserted User', age: 25 }
      dataManager.addData(newRow, 5)

      const data = dataManager.getRawData()
      expect(data[5]).toEqual(newRow)
      expect(data).toHaveLength(testData.length + 1)
    })
  })

  describe('数据删除', () => {
    it('应该正确删除单行数据', () => {
      dataManager.removeData(1)

      const data = dataManager.getRawData()
      expect(data).toHaveLength(testData.length - 1)
      expect(data.find(row => row.id === 1)).toBeUndefined()
    })

    it('应该正确删除多行数据', () => {
      dataManager.removeData([1, 2, 3])

      const data = dataManager.getRawData()
      expect(data).toHaveLength(testData.length - 3)
      expect(data.find(row => [1, 2, 3].includes(row.id))).toBeUndefined()
    })

    it('应该正确根据条件删除数据', () => {
      dataManager.removeDataWhere(row => row.age > 50)

      const data = dataManager.getRawData()
      expect(data.every(row => row.age <= 50)).toBe(true)
    })
  })

  describe('数据更新', () => {
    it('应该正确更新单行数据', () => {
      const updatedData = { name: 'Updated Name', age: 99 }
      dataManager.updateData(1, updatedData)

      const row = dataManager.getRowByKey(1)
      expect(row.name).toBe('Updated Name')
      expect(row.age).toBe(99)
      expect(row.id).toBe(1) // ID应该保持不变
    })

    it('应该正确批量更新数据', () => {
      const updates = [
        { key: 1, data: { name: 'Updated 1' } },
        { key: 2, data: { name: 'Updated 2' } }
      ]
      dataManager.batchUpdateData(updates)

      const row1 = dataManager.getRowByKey(1)
      const row2 = dataManager.getRowByKey(2)
      expect(row1.name).toBe('Updated 1')
      expect(row2.name).toBe('Updated 2')
    })

    it('应该正确根据条件更新数据', () => {
      dataManager.updateDataWhere(
        row => row.age < 30,
        { status: 'young' }
      )

      const data = dataManager.getRawData()
      data.forEach(row => {
        if (row.age < 30) {
          expect(row.status).toBe('young')
        }
      })
    })
  })

  describe('排序功能', () => {
    it('应该正确设置排序', () => {
      dataManager.setSort('name', 'asc')

      const sortState = dataManager.getSortState()
      expect(sortState).toEqual({
        column: 'name',
        direction: 'asc',
        sorter: undefined
      })
    })

    it('应该正确按升序排序', () => {
      dataManager.setSort('name', 'asc')

      const data = dataManager.getDisplayData()
      for (let i = 1; i < data.length; i++) {
        expect(data[i - 1].name <= data[i].name).toBe(true)
      }
    })

    it('应该正确按降序排序', () => {
      dataManager.setSort('age', 'desc')

      const data = dataManager.getDisplayData()
      for (let i = 1; i < data.length; i++) {
        expect(data[i - 1].age >= data[i].age).toBe(true)
      }
    })

    it('应该支持自定义排序函数', () => {
      const customSorter = (a: any, b: any) => {
        return a.name.length - b.name.length
      }

      dataManager.setSort('name', 'asc', customSorter)

      const data = dataManager.getDisplayData()
      for (let i = 1; i < data.length; i++) {
        expect(data[i - 1].name.length <= data[i].name.length).toBe(true)
      }
    })

    it('应该正确清除排序', () => {
      dataManager.setSort('name', 'asc')
      dataManager.clearSort()

      const sortState = dataManager.getSortState()
      expect(sortState).toBeNull()

      const data = dataManager.getDisplayData()
      expect(data).toEqual(testData)
    })
  })

  describe('过滤功能', () => {
    it('应该正确设置过滤', () => {
      dataManager.setFilter('status', ['active'])

      const filterState = dataManager.getFilterState()
      expect(filterState.status).toEqual(['active'])
    })

    it('应该正确过滤数据', () => {
      dataManager.setFilter('status', ['active'])

      const data = dataManager.getDisplayData()
      expect(data.every(row => row.status === 'active')).toBe(true)
    })

    it('应该支持多列过滤', () => {
      dataManager.setFilter('status', ['active'])
      dataManager.setFilter('age', [25, 30, 35])

      const data = dataManager.getDisplayData()
      expect(data.every(row =>
        row.status === 'active' && [25, 30, 35].includes(row.age)
      )).toBe(true)
    })

    it('应该正确清除单列过滤', () => {
      dataManager.setFilter('status', ['active'])
      dataManager.setFilter('age', [25])
      dataManager.clearFilter('status')

      const filterState = dataManager.getFilterState()
      expect(filterState.status).toBeUndefined()
      expect(filterState.age).toEqual([25])
    })

    it('应该正确清除所有过滤', () => {
      dataManager.setFilter('status', ['active'])
      dataManager.setFilter('age', [25])
      dataManager.clearFilter()

      const filterState = dataManager.getFilterState()
      expect(Object.keys(filterState)).toHaveLength(0)

      const data = dataManager.getDisplayData()
      expect(data).toEqual(testData)
    })
  })

  describe('组合操作', () => {
    it('应该正确处理排序和过滤的组合', () => {
      dataManager.setFilter('status', ['active'])
      dataManager.setSort('age', 'asc')

      const data = dataManager.getDisplayData()

      // 检查过滤
      expect(data.every(row => row.status === 'active')).toBe(true)

      // 检查排序
      for (let i = 1; i < data.length; i++) {
        expect(data[i - 1].age <= data[i].age).toBe(true)
      }
    })

    it('应该正确处理数据变更后的排序和过滤', () => {
      dataManager.setFilter('status', ['active'])
      dataManager.setSort('age', 'asc')

      // 添加新数据
      dataManager.addData({ id: 999, name: 'New User', age: 15, status: 'active' })

      const data = dataManager.getDisplayData()

      // 新数据应该被包含并正确排序
      expect(data.some(row => row.id === 999)).toBe(true)
      expect(data[0].age).toBe(15) // 应该排在最前面
    })
  })

  describe('事件触发', () => {
    it('应该在数据变更时触发事件', () => {
      const onDataChange = vi.fn()
      dataManager.on('data-change', onDataChange)

      dataManager.addData({ id: 999, name: 'New User' })

      expect(onDataChange).toHaveBeenCalledWith({
        type: 'add',
        data: expect.any(Array)
      })
    })

    it('应该在排序变更时触发事件', () => {
      const onSortChange = vi.fn()
      dataManager.on('sort-change', onSortChange)

      dataManager.setSort('name', 'asc')

      expect(onSortChange).toHaveBeenCalledWith({
        column: 'name',
        direction: 'asc',
        sorter: undefined
      })
    })

    it('应该在过滤变更时触发事件', () => {
      const onFilterChange = vi.fn()
      dataManager.on('filter-change', onFilterChange)

      dataManager.setFilter('status', ['active'])

      expect(onFilterChange).toHaveBeenCalledWith({
        column: 'status',
        filters: ['active'],
        filteredData: expect.any(Array)
      })
    })
  })

  describe('性能测试', () => {
    it('应该能处理大量数据', () => {
      const largeData = createTestData(10000)
      dataManager.setData(largeData)

      // 清除缓存确保测试准确性
      dataManager.clearPerformanceCache()

      const startTime = performance.now()
      dataManager.setSort('name', 'asc')
      const sortedData = dataManager.getDisplayData()
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成
      expect(sortedData).toHaveLength(largeData.length)
      expect(dataManager.getOriginalData()).toHaveLength(10000)
    })

    it('应该能高效处理复杂过滤', () => {
      const largeData = createTestData(5000)
      dataManager.setData(largeData)

      const startTime = performance.now()
      dataManager.setFilter('status', ['active'])
      dataManager.setFilter('age', Array.from({ length: 20 }, (_, i) => 20 + i))
      const filteredData = dataManager.getDisplayData()
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(500) // 应该在500ms内完成
      expect(filteredData.length).toBeGreaterThan(0)
    })
  })
})
