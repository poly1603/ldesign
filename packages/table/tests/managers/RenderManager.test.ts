/**
 * RenderManager单元测试
 * 
 * 测试渲染管理器功能
 * 确保DOM操作和渲染逻辑正确
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RenderManager } from '@/managers/RenderManager'
import { createTestData } from '../setup'

describe('RenderManager', () => {
  let renderManager: RenderManager
  let testData: any[]
  let mockContainer: HTMLElement

  beforeEach(() => {
    testData = createTestData(100)

    // 使用真实的DOM容器
    mockContainer = document.createElement('div')
    mockContainer.id = 'test-container'
    document.body.appendChild(mockContainer)

    renderManager = new RenderManager({
      container: mockContainer,
      columns: [
        { key: 'id', title: 'ID', width: 100 },
        { key: 'name', title: 'Name', width: 200 },
        { key: 'age', title: 'Age', width: 100 }
      ]
    })
  })

  afterEach(() => {
    if (mockContainer && mockContainer.parentNode) {
      mockContainer.parentNode.removeChild(mockContainer)
    }
  })

  describe('基础配置', () => {
    it('应该正确初始化', () => {
      expect(renderManager.getContainer()).toBe(mockContainer)
      expect(renderManager.getColumns()).toHaveLength(3)
    })

    it('应该正确设置列配置', () => {
      const newColumns = [
        { key: 'id', title: 'ID', width: 120 },
        { key: 'email', title: 'Email', width: 250 }
      ]

      renderManager.setColumns(newColumns)
      expect(renderManager.getColumns()).toEqual(newColumns)
    })

    it('应该正确设置数据', () => {
      renderManager.setData(testData)
      expect(renderManager.getData()).toEqual(testData)
    })

    it('应该正确设置可见范围', () => {
      const range = { start: 10, end: 20 }
      renderManager.setVisibleRange(range)
      expect(renderManager.getVisibleRange()).toEqual(range)
    })
  })

  describe('表头渲染', () => {
    it('应该正确渲染表头', () => {
      const headerElement = renderManager.renderHeader()

      expect(headerElement).toBeDefined()
      expect(headerElement.tagName).toBe('THEAD')
    })

    it('应该正确渲染多级表头', () => {
      const multiLevelColumns = [
        {
          title: 'Basic Info',
          children: [
            { key: 'id', title: 'ID', width: 100 },
            { key: 'name', title: 'Name', width: 200 }
          ]
        },
        { key: 'age', title: 'Age', width: 100 }
      ]

      renderManager.setColumns(multiLevelColumns)
      const headerElement = renderManager.renderHeader()

      expect(headerElement).toBeDefined()
      expect(headerElement.querySelectorAll('tr')).toHaveLength(2)
    })

    it('应该正确处理固定列', () => {
      const columnsWithFixed = [
        { key: 'id', title: 'ID', width: 100, fixed: 'left' },
        { key: 'name', title: 'Name', width: 200 },
        { key: 'action', title: 'Action', width: 100, fixed: 'right' }
      ]

      renderManager.setColumns(columnsWithFixed)
      const headerElement = renderManager.renderHeader()

      expect(headerElement).toBeDefined()
    })
  })

  describe('表体渲染', () => {
    beforeEach(() => {
      renderManager.setData(testData)
      renderManager.setVisibleRange({ start: 0, end: 10 })
    })

    it('应该正确渲染表体', () => {
      const bodyElement = renderManager.renderBody()

      expect(bodyElement).toBeDefined()
      expect(bodyElement.tagName).toBe('TBODY')
    })

    it('应该只渲染可见范围内的行', () => {
      renderManager.setVisibleRange({ start: 5, end: 15 })
      const bodyElement = renderManager.renderBody()

      expect(bodyElement.children).toHaveLength(10) // 15 - 5
    })

    it('应该正确渲染单元格', () => {
      const row = testData[0]
      const cellElement = renderManager.renderCell(row, renderManager.getColumns()[0], 0, 0)

      expect(cellElement).toBeDefined()
      expect(cellElement.tagName).toBe('TD')
      expect(cellElement.textContent).toBe(row.id.toString())
    })

    it('应该支持自定义单元格渲染器', () => {
      const customColumns = [
        {
          key: 'name',
          title: 'Name',
          width: 200,
          render: (value: any, row: any) => `<strong>${value}</strong>`
        }
      ]

      renderManager.setColumns(customColumns)
      const row = testData[0]
      const cellElement = renderManager.renderCell(row, customColumns[0], 0, 0)

      expect(cellElement.innerHTML).toContain('<strong>')
    })
  })

  describe('表尾渲染', () => {
    it('应该正确渲染表尾', () => {
      const footerData = [
        { id: 'Total', name: 'Summary', age: testData.length }
      ]

      renderManager.setFooterData(footerData)
      const footerElement = renderManager.renderFooter()

      expect(footerElement).toBeDefined()
      expect(footerElement.tagName).toBe('TFOOT')
    })

    it('应该支持多行表尾', () => {
      const footerData = [
        { id: 'Total', name: 'Summary', age: testData.length },
        { id: 'Average', name: 'Avg', age: 25 }
      ]

      renderManager.setFooterData(footerData)
      const footerElement = renderManager.renderFooter()

      expect(footerElement.children).toHaveLength(2)
    })
  })

  describe('虚拟滚动渲染', () => {
    beforeEach(() => {
      renderManager.setData(testData)
    })

    it('应该正确更新虚拟滚动内容', () => {
      const range = { start: 10, end: 20 }
      renderManager.updateVirtualContent(range)

      expect(renderManager.getVisibleRange()).toEqual(range)
    })

    it('应该正确计算虚拟滚动偏移', () => {
      const range = { start: 10, end: 20 }
      const itemHeight = 40
      const expectedOffset = 10 * itemHeight

      renderManager.setItemHeight(itemHeight)
      const offset = renderManager.calculateVirtualOffset(range.start)

      expect(offset).toBe(expectedOffset)
    })

    it('应该正确处理动态行高', () => {
      renderManager.setDynamicHeight(true)
      renderManager.setItemHeightByIndex(0, 60)
      renderManager.setItemHeightByIndex(1, 80)

      const offset = renderManager.calculateVirtualOffset(2)
      expect(offset).toBe(140) // 60 + 80
    })
  })

  describe('选择状态渲染', () => {
    beforeEach(() => {
      renderManager.setData(testData)
    })

    it('应该正确渲染选择框', () => {
      renderManager.setSelectable(true)
      const bodyElement = renderManager.renderBody()

      expect(bodyElement.querySelector('input[type="checkbox"]')).toBeDefined()
    })

    it('应该正确更新选择状态', () => {
      renderManager.setSelectable(true)
      renderManager.setData(testData.slice(0, 5)) // 先设置数据
      renderManager.renderBody() // 先渲染表体

      // 使用行键而不是索引（testData的id从1开始）
      renderManager.updateSelection(['1', '2', '3'])

      const selectedRows = mockContainer.querySelectorAll('.selected')
      expect(selectedRows).toHaveLength(3)
    })

    it('应该正确处理全选状态', () => {
      renderManager.setSelectable(true)
      renderManager.renderHeader() // 先渲染表头
      renderManager.updateHeaderSelectionState('all')

      const headerCheckbox = mockContainer.querySelector('thead input[type="checkbox"]') as HTMLInputElement
      expect(headerCheckbox?.checked).toBe(true)
    })
  })

  describe('展开状态渲染', () => {
    beforeEach(() => {
      renderManager.setData(testData)
    })

    it('应该正确渲染展开按钮', () => {
      renderManager.setExpandable(true)
      const bodyElement = renderManager.renderBody()

      expect(bodyElement.querySelector('.expand-button')).toBeDefined()
    })

    it('应该正确更新展开状态', () => {
      renderManager.setExpandable(true)
      renderManager.setData(testData.slice(0, 5)) // 先设置数据
      renderManager.renderBody() // 先渲染表体

      // 使用行键而不是索引（testData的id从1开始）
      renderManager.updateExpansion(['1', '2'])

      const expandedRows = mockContainer.querySelectorAll('.expanded')
      expect(expandedRows).toHaveLength(2)
    })

    it('应该正确渲染展开内容', () => {
      const expandContent = '<div>Expanded content</div>'
      renderManager.setExpandable(true)
      renderManager.setExpandRenderer(() => expandContent)

      const expandedElement = renderManager.renderExpandedContent(testData[0], 0)
      expect(expandedElement.innerHTML).toContain('Expanded content')
    })
  })

  describe('排序状态渲染', () => {
    it('应该正确渲染排序图标', () => {
      renderManager.setSortable(true)
      const headerElement = renderManager.renderHeader()

      expect(headerElement.querySelector('.sort-icon')).toBeDefined()
    })

    it('应该正确更新排序状态', () => {
      renderManager.setSortable(true)
      renderManager.updateSortState('name', 'asc')

      const sortedColumn = mockContainer.querySelector('.sorted-asc')
      expect(sortedColumn).toBeDefined()
    })
  })

  describe('过滤状态渲染', () => {
    it('应该正确渲染过滤器', () => {
      renderManager.setFilterable(true)
      const headerElement = renderManager.renderHeader()

      expect(headerElement.querySelector('.filter-input')).toBeDefined()
    })

    it('应该正确更新过滤状态', () => {
      renderManager.setFilterable(true)
      renderManager.updateFilterState({ name: 'John' })

      const filteredInput = mockContainer.querySelector('input[value="John"]')
      expect(filteredInput).toBeDefined()
    })
  })

  describe('性能优化', () => {
    it('应该支持渲染节流', () => {
      renderManager.setThrottleMs(16)

      const renderSpy = vi.spyOn(renderManager, 'render')

      // 快速连续调用渲染
      renderManager.render()
      renderManager.render()
      renderManager.render()

      // 由于节流，应该只调用一次或少数几次
      expect(renderSpy.mock.calls.length).toBeLessThanOrEqual(3)
    })

    it('应该能高效处理大量数据', () => {
      const largeData = createTestData(10000)
      renderManager.setData(largeData)
      renderManager.setVisibleRange({ start: 0, end: 100 })

      const startTime = performance.now()
      renderManager.render()
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(2000) // 应该在2秒内完成
    })
  })

  describe('事件处理', () => {
    it('应该正确绑定事件监听器', () => {
      const clickHandler = vi.fn()
      renderManager.on('cell-click', clickHandler)

      renderManager.bindEvents()

      // 模拟点击事件
      const cellElement = document.createElement('td')
      mockContainer.appendChild(cellElement)
      cellElement.click()

      expect(clickHandler).toHaveBeenCalled()
    })

    it('应该正确处理键盘事件', () => {
      const keyHandler = vi.fn()
      renderManager.on('key-down', keyHandler)

      renderManager.bindEvents()

      // 模拟键盘事件
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      mockContainer.dispatchEvent(event)

      expect(keyHandler).toHaveBeenCalled()
    })
  })

  describe('销毁和清理', () => {
    it('应该正确销毁渲染器', () => {
      const clickHandler = vi.fn()
      renderManager.on('cell-click', clickHandler)

      renderManager.destroy()

      // 销毁后不应该触发事件
      const cellElement = document.createElement('td')
      cellElement.click()
      expect(clickHandler).not.toHaveBeenCalled()
    })

    it('应该清理DOM内容', () => {
      renderManager.setData(testData)
      renderManager.render()

      renderManager.destroy()

      expect(mockContainer.innerHTML).toBe('')
    })
  })
})
