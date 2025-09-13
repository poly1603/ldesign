/**
 * Table类单元测试
 * 
 * 测试表格核心功能
 * 确保所有API正常工作
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Table } from '@/core/Table'
import { createTestContainer, cleanupTestContainer, createTestData, createTestColumns } from '../setup'
import type { TableConfig } from '@/types'

describe('Table', () => {
  let container: HTMLElement
  let table: Table
  let testData: any[]
  let testColumns: any[]
  let config: TableConfig

  beforeEach(() => {
    container = createTestContainer()
    testData = createTestData(20)
    testColumns = createTestColumns()

    config = {
      container,
      data: testData,
      columns: testColumns,
      rowKey: 'id'
    }
  })

  afterEach(() => {
    if (table) {
      table.destroy()
    }
    cleanupTestContainer(container)
  })

  describe('构造函数和初始化', () => {
    it('应该正确创建表格实例', () => {
      table = new Table(config)

      expect(table).toBeInstanceOf(Table)
      expect(table.isInitialized()).toBe(true)
    })

    it('应该正确设置容器', () => {
      table = new Table(config)

      expect(table.getContainer()).toBe(container)
      expect(container.classList.contains('ldesign-table')).toBe(true)
    })

    it('应该正确渲染表格结构', () => {
      table = new Table(config)

      const wrapper = container.querySelector('.ldesign-table-wrapper')
      const header = container.querySelector('thead')
      const body = container.querySelector('tbody')

      expect(wrapper).toBeTruthy()
      expect(header).toBeTruthy()
      expect(body).toBeTruthy()
    })

    it('应该正确渲染表头', () => {
      table = new Table(config)

      const headerCells = container.querySelectorAll('thead th')
      expect(headerCells).toHaveLength(testColumns.length)

      headerCells.forEach((cell, index) => {
        // 检查标题元素的文本，而不是整个单元格的文本
        const titleElement = cell.querySelector('.ldesign-table-header-title')
        if (titleElement) {
          expect(titleElement.textContent).toBe(testColumns[index].title)
        } else {
          // 如果没有标题元素，则检查整个单元格的文本（向后兼容）
          expect(cell.textContent).toBe(testColumns[index].title)
        }
      })
    })

    it('应该正确渲染数据行', () => {
      table = new Table(config)

      const bodyRows = container.querySelectorAll('tbody tr')
      expect(bodyRows).toHaveLength(testData.length)
    })
  })

  describe('数据管理', () => {
    beforeEach(() => {
      table = new Table(config)
    })

    it('应该正确获取数据', () => {
      const data = table.getData()
      expect(data).toEqual(testData)
    })

    it('应该正确设置数据', () => {
      const newData = createTestData(5)
      table.setData(newData)

      expect(table.getData()).toEqual(newData)

      // 检查数据是否正确设置，不检查DOM行数（可能受分页影响）
      expect(table.getDataManager().getOriginalData()).toHaveLength(5)
    })

    it('应该正确添加数据', () => {
      const newRow = { id: 999, name: 'New User', age: 25, email: 'new@example.com' }
      table.addData(newRow)

      const data = table.getData()
      expect(data).toHaveLength(testData.length + 1)
      expect(data[data.length - 1]).toEqual(newRow)
    })

    it('应该正确删除数据', () => {
      const rowsToDelete = [1, 2, 3]
      table.removeData(rowsToDelete)

      const data = table.getData()
      expect(data).toHaveLength(testData.length - rowsToDelete.length)

      rowsToDelete.forEach(id => {
        expect(data.find(row => row.id === id)).toBeUndefined()
      })
    })

    it('应该正确更新数据', () => {
      const updateData = { name: 'Updated Name', age: 30, email: 'updated@example.com' }
      table.updateData(1, updateData)

      const data = table.getData()
      const targetRow = data.find(row => row.id === 1)

      // 应该保留原有字段并更新指定字段
      expect(targetRow?.name).toBe('Updated Name')
      expect(targetRow?.age).toBe(30)
      expect(targetRow?.email).toBe('updated@example.com')
      expect(targetRow?.id).toBe(1) // 原有字段应该保留
    })
  })

  describe('选择功能', () => {
    beforeEach(() => {
      config.selection = { enabled: true, multiple: true }
      table = new Table(config)
    })

    it('应该正确选择单行', () => {
      table.selectRows([1])

      const selectedKeys = table.getSelectedKeys()
      expect(selectedKeys).toEqual([1])

      const selectedRow = container.querySelector('[data-key="1"]')
      expect(selectedRow?.classList.contains('selected')).toBe(true)
    })

    it('应该正确选择多行', () => {
      table.selectRows([1, 2, 3])

      const selectedKeys = table.getSelectedKeys()
      expect(selectedKeys).toEqual([1, 2, 3])

      const selectedRows = container.querySelectorAll('.selected')
      expect(selectedRows).toHaveLength(3)
    })

    it('应该正确取消选择', () => {
      table.selectRows([1, 2, 3])
      table.deselectRows([2])

      const selectedKeys = table.getSelectedKeys()
      expect(selectedKeys).toEqual([1, 3])
    })

    it('应该正确切换选择状态', () => {
      table.selectRows([1])
      table.toggleRowSelection([1])

      const selectedKeys = table.getSelectedKeys()
      expect(selectedKeys).toEqual([])
    })

    it('应该正确全选', () => {
      table.selectAll()

      const selectedKeys = table.getSelectedKeys()
      expect(selectedKeys).toHaveLength(testData.length)
    })

    it('应该正确清除选择', () => {
      table.selectRows([1, 2, 3])
      table.clearSelection()

      const selectedKeys = table.getSelectedKeys()
      expect(selectedKeys).toEqual([])
    })

    it('应该触发选择变化事件', () => {
      const onSelectionChange = vi.fn()
      table.on('selection-change', onSelectionChange)

      table.selectRows([1, 2])

      expect(onSelectionChange).toHaveBeenCalledWith({
        selectedRows: expect.any(Array),
        selectedKeys: [1, 2],
        changedRows: expect.any(Array),
        changedKeys: [1, 2]
      })
    })
  })

  describe('展开功能', () => {
    beforeEach(() => {
      config.expand = { enabled: true }
      table = new Table(config)
    })

    it('应该正确展开行', () => {
      table.expandRows([1])

      const expandedKeys = table.getExpandedKeys()
      expect(expandedKeys).toEqual([1])

      const expandedRow = container.querySelector('[data-key="1"]')
      expect(expandedRow?.classList.contains('expanded')).toBe(true)
    })

    it('应该正确折叠行', () => {
      table.expandRows([1])
      table.collapseRows([1])

      const expandedKeys = table.getExpandedKeys()
      expect(expandedKeys).toEqual([])
    })

    it('应该触发展开变化事件', () => {
      const onExpandChange = vi.fn()
      table.on('expand-change', onExpandChange)

      table.expandRows([1])

      expect(onExpandChange).toHaveBeenCalledWith({
        row: expect.any(Object),
        rowKey: 1,
        expanded: true,
        expandedKeys: [1]
      })
    })
  })

  describe('排序功能', () => {
    beforeEach(() => {
      table = new Table(config)
    })

    it('应该正确设置排序', () => {
      table.sort('name', 'asc')

      const sortState = table.getSortState()
      expect(sortState).toEqual({
        column: 'name',
        direction: 'asc'
      })
    })

    it('应该正确清除排序', () => {
      table.sort('name', 'asc')
      table.clearSort()

      const sortState = table.getSortState()
      expect(sortState).toBeNull()
    })

    it('应该触发排序变化事件', () => {
      const onSortChange = vi.fn()
      table.on('sort-change', onSortChange)

      table.sort('name', 'asc')

      expect(onSortChange).toHaveBeenCalledWith({
        column: 'name',
        direction: 'asc',
        sorter: undefined
      })
    })

    it('应该正确排序数据', () => {
      table.sort('name', 'asc')

      const data = table.getDisplayData()
      for (let i = 1; i < data.length; i++) {
        expect(data[i - 1].name <= data[i].name).toBe(true)
      }
    })
  })

  describe('过滤功能', () => {
    beforeEach(() => {
      table = new Table(config)
    })

    it('应该正确设置过滤', () => {
      table.filter('status', ['active'])

      const filterState = table.getFilterState()
      expect(filterState.status).toEqual(['active'])
    })

    it('应该正确清除过滤', () => {
      table.filter('status', ['active'])
      table.clearFilter('status')

      const filterState = table.getFilterState()
      expect(filterState.status).toBeUndefined()
    })

    it('应该触发过滤变化事件', () => {
      const onFilterChange = vi.fn()
      table.on('filter-change', onFilterChange)

      table.filter('status', ['active'])

      expect(onFilterChange).toHaveBeenCalledWith({
        column: 'status',
        filters: ['active'],
        filteredData: expect.any(Array)
      })
    })

    it('应该正确过滤数据', () => {
      table.filter('status', ['active'])

      const data = table.getDisplayData()
      data.forEach(row => {
        expect(row.status).toBe('active')
      })
    })
  })

  describe('事件系统', () => {
    beforeEach(() => {
      table = new Table(config)
    })

    it('应该正确绑定和触发事件', () => {
      const handler = vi.fn()
      table.on('row-click', handler)

      table.emit('row-click', { row: testData[0] })

      expect(handler).toHaveBeenCalledWith({ row: testData[0] })
    })

    it('应该正确移除事件监听器', () => {
      const handler = vi.fn()
      table.on('row-click', handler)
      table.off('row-click', handler)

      table.emit('row-click', { row: testData[0] })

      expect(handler).not.toHaveBeenCalled()
    })

    it('应该正确移除所有事件监听器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      table.on('row-click', handler1)
      table.on('cell-click', handler2)
      table.off()

      table.emit('row-click', { row: testData[0] })
      table.emit('cell-click', { row: testData[0] })

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('销毁功能', () => {
    beforeEach(() => {
      table = new Table(config)
    })

    it('应该正确销毁表格', () => {
      table.destroy()

      expect(table.isDestroyed()).toBe(true)
      expect(container.innerHTML).toBe('')
    })

    it('销毁后不应该响应事件', () => {
      const handler = vi.fn()
      table.on('row-click', handler)

      table.destroy()
      table.emit('row-click', { row: testData[0] })

      expect(handler).not.toHaveBeenCalled()
    })
  })
})
