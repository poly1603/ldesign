/**
 * ExcelEditor 核心类测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ExcelEditor } from '../../src/core/ExcelEditor.js'
import type { ExcelEditorOptions, Workbook } from '../../src/types/index.js'

// Mock DOM环境
Object.defineProperty(window, 'HTMLElement', {
  value: class HTMLElement {
    style: Record<string, string> = {}
    className = ''
    innerHTML = ''
    textContent = ''
    dataset: Record<string, string> = {}
    classList = {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn()
    }
    addEventListener = vi.fn()
    removeEventListener = vi.fn()
    appendChild = vi.fn()
    removeChild = vi.fn()
    querySelector = vi.fn()
    querySelectorAll = vi.fn(() => [])
    getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 100,
      height: 25,
      right: 100,
      bottom: 25
    }))
    scrollIntoView = vi.fn()
    focus = vi.fn()
    select = vi.fn()
    remove = vi.fn()
    closest = vi.fn()
  }
})

// Mock document
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => new (window as any).HTMLElement()),
    querySelector: vi.fn(() => new (window as any).HTMLElement()),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
})

describe('ExcelEditor', () => {
  let container: HTMLElement
  let editor: ExcelEditor
  let mockWorkbook: Workbook

  beforeEach(() => {
    // 创建模拟容器
    container = new (window as any).HTMLElement()
    
    // 创建模拟工作簿数据
    mockWorkbook = {
      worksheets: [{
        name: 'Sheet1',
        cells: {
          'A1': { value: 'Hello' },
          'B1': { value: 'World' },
          'A2': { value: 123 },
          'B2': { value: true }
        },
        rowCount: 100,
        columnCount: 26
      }],
      activeSheetIndex: 0,
      properties: {
        title: 'Test Workbook',
        created: new Date(),
        modified: new Date()
      }
    }
  })

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
  })

  describe('构造函数', () => {
    it('应该能够创建ExcelEditor实例', () => {
      const options: ExcelEditorOptions = {
        container,
        data: mockWorkbook
      }
      
      editor = new ExcelEditor(options)
      
      expect(editor).toBeInstanceOf(ExcelEditor)
    })

    it('应该能够使用字符串选择器作为容器', () => {
      // Mock querySelector返回容器元素
      vi.mocked(document.querySelector).mockReturnValue(container)
      
      const options: ExcelEditorOptions = {
        container: '#excel-container',
        data: mockWorkbook
      }
      
      editor = new ExcelEditor(options)
      
      expect(document.querySelector).toHaveBeenCalledWith('#excel-container')
      expect(editor).toBeInstanceOf(ExcelEditor)
    })

    it('应该在找不到容器时抛出错误', () => {
      vi.mocked(document.querySelector).mockReturnValue(null)
      
      const options: ExcelEditorOptions = {
        container: '#non-existent',
        data: mockWorkbook
      }
      
      expect(() => new ExcelEditor(options)).toThrow('Container element not found: #non-existent')
    })

    it('应该使用默认配置', () => {
      const options: ExcelEditorOptions = {
        container
      }
      
      editor = new ExcelEditor(options)
      
      // 验证默认配置被应用
      expect(editor).toBeInstanceOf(ExcelEditor)
    })
  })

  describe('数据操作', () => {
    beforeEach(() => {
      const options: ExcelEditorOptions = {
        container,
        data: mockWorkbook
      }
      editor = new ExcelEditor(options)
    })

    it('应该能够获取单元格值', () => {
      const value = editor.getCellValue({ row: 0, column: 0 })
      expect(value).toBe('Hello')
    })

    it('应该能够设置单元格值', () => {
      const position = { row: 0, column: 0 }
      const newValue = 'New Value'
      
      editor.setCellValue(position, newValue)
      
      const value = editor.getCellValue(position)
      expect(value).toBe(newValue)
    })

    it('应该能够获取工作簿数据', () => {
      const data = editor.getData()
      
      expect(data).toEqual(mockWorkbook)
      expect(data).not.toBe(mockWorkbook) // 应该是深拷贝
    })

    it('应该能够设置工作簿数据', () => {
      const newWorkbook: Workbook = {
        worksheets: [{
          name: 'New Sheet',
          cells: { 'A1': { value: 'New Data' } },
          rowCount: 50,
          columnCount: 10
        }],
        activeSheetIndex: 0
      }
      
      editor.setData(newWorkbook)
      
      const data = editor.getData()
      expect(data.worksheets[0].name).toBe('New Sheet')
      expect(data.worksheets[0].cells['A1'].value).toBe('New Data')
    })
  })

  describe('工作表操作', () => {
    beforeEach(() => {
      const options: ExcelEditorOptions = {
        container,
        data: mockWorkbook
      }
      editor = new ExcelEditor(options)
    })

    it('应该能够获取当前活动工作表', () => {
      const worksheet = editor.getActiveWorksheet()
      
      expect(worksheet).toBe(mockWorkbook.worksheets[0])
    })

    it('应该能够设置活动工作表', () => {
      // 添加第二个工作表
      const newWorkbook = {
        ...mockWorkbook,
        worksheets: [
          ...mockWorkbook.worksheets,
          {
            name: 'Sheet2',
            cells: {},
            rowCount: 100,
            columnCount: 26
          }
        ]
      }
      
      editor.setData(newWorkbook)
      editor.setActiveWorksheet(1)
      
      const worksheet = editor.getActiveWorksheet()
      expect(worksheet.name).toBe('Sheet2')
    })
  })

  describe('事件系统', () => {
    beforeEach(() => {
      const options: ExcelEditorOptions = {
        container,
        data: mockWorkbook
      }
      editor = new ExcelEditor(options)
    })

    it('应该能够注册和触发事件监听器', () => {
      const mockListener = vi.fn()
      
      editor.on('cellChange', mockListener)
      editor.setCellValue({ row: 0, column: 0 }, 'Test Value')
      
      // 由于事件是异步触发的，需要等待
      setTimeout(() => {
        expect(mockListener).toHaveBeenCalled()
      }, 10)
    })

    it('应该能够移除事件监听器', () => {
      const mockListener = vi.fn()
      
      editor.on('cellChange', mockListener)
      editor.off('cellChange', mockListener)
      editor.setCellValue({ row: 0, column: 0 }, 'Test Value')
      
      setTimeout(() => {
        expect(mockListener).not.toHaveBeenCalled()
      }, 10)
    })

    it('应该能够注册一次性事件监听器', () => {
      const mockListener = vi.fn()
      
      editor.once('cellChange', mockListener)
      editor.setCellValue({ row: 0, column: 0 }, 'Test Value 1')
      editor.setCellValue({ row: 0, column: 1 }, 'Test Value 2')
      
      setTimeout(() => {
        expect(mockListener).toHaveBeenCalledTimes(1)
      }, 10)
    })
  })

  describe('销毁', () => {
    it('应该能够正确销毁编辑器', () => {
      const options: ExcelEditorOptions = {
        container,
        data: mockWorkbook
      }
      
      editor = new ExcelEditor(options)
      
      expect(() => editor.destroy()).not.toThrow()
    })
  })
})
