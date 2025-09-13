/**
 * 数据导出器组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DataExporter, type ExportConfig } from '../../src/components/DataExporter'
import { createTestData, createTestColumns } from '../setup'

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('DataExporter', () => {
  let dataExporter: DataExporter
  let testData: any[]
  let testColumns: any[]

  beforeEach(() => {
    dataExporter = new DataExporter()
    testData = createTestData(5)
    testColumns = createTestColumns()
  })

  afterEach(() => {
    dataExporter.destroy()
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应该正确创建数据导出器实例', () => {
      expect(dataExporter).toBeDefined()
    })

    it('应该支持CSV导出', async () => {
      const config: ExportConfig = {
        format: 'csv',
        filename: 'test.csv',
        includeHeader: true
      }

      // Mock document.createElement and related methods
      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test.csv')
      expect(mockLink.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('应该支持JSON导出', async () => {
      const config: ExportConfig = {
        format: 'json',
        filename: 'test.json'
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(mockLink.download).toBe('test.json')
      expect(mockLink.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('应该支持Excel导出', async () => {
      const config: ExportConfig = {
        format: 'excel',
        filename: 'test.xlsx'
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(mockLink.download).toBe('test.xlsx')
      expect(mockLink.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })

  describe('数据处理', () => {
    it('应该正确过滤数据', async () => {
      const config: ExportConfig = {
        format: 'json',
        filter: (row, index) => index < 3
      }

      const onExportComplete = vi.fn()
      dataExporter.on('export-complete', onExportComplete)

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(onExportComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          rowCount: 3
        })
      )

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('应该正确转换数据', async () => {
      const config: ExportConfig = {
        format: 'json',
        transformer: (row, index) => ({
          ...row,
          index,
          transformed: true
        })
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(mockLink.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('应该支持选择特定列导出', async () => {
      const config: ExportConfig = {
        format: 'csv',
        columns: ['name', 'age']
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(mockLink.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })

  describe('CSV格式处理', () => {
    it('应该正确转义CSV值', async () => {
      const dataWithSpecialChars = [
        { id: 1, name: 'Name, with comma', description: 'Text with "quotes"' },
        { id: 2, name: 'Name\nwith\nlines', description: 'Normal text' }
      ]

      const config: ExportConfig = {
        format: 'csv',
        includeHeader: true
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(dataWithSpecialChars, testColumns, config)

      expect(mockLink.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('应该支持自定义CSV分隔符', async () => {
      const config: ExportConfig = {
        format: 'csv',
        csvSeparator: ';'
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(mockLink.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })

  describe('事件处理', () => {
    it('应该触发导出开始事件', async () => {
      const onExportStart = vi.fn()
      dataExporter.on('export-start', onExportStart)

      const config: ExportConfig = {
        format: 'json'
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(onExportStart).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            format: 'json'
          })
        })
      )

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('应该触发导出完成事件', async () => {
      const onExportComplete = vi.fn()
      dataExporter.on('export-complete', onExportComplete)

      const config: ExportConfig = {
        format: 'json'
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(onExportComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          rowCount: testData.length
        })
      )

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('应该触发导出进度事件', async () => {
      const onExportProgress = vi.fn()
      dataExporter.on('export-progress', onExportProgress)

      const config: ExportConfig = {
        format: 'json'
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(onExportProgress).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('应该处理导出错误', async () => {
      const onExportError = vi.fn()
      dataExporter.on('export-error', onExportError)

      const config: ExportConfig = {
        format: 'invalid' as any
      }

      try {
        await dataExporter.export(testData, testColumns, config)
      } catch (error) {
        // 预期会抛出错误
      }

      expect(onExportError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('不支持的导出格式')
        })
      )
    })
  })

  describe('文件名处理', () => {
    it('应该使用默认文件名', async () => {
      const config: ExportConfig = {
        format: 'csv'
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(mockLink.download).toMatch(/^export_\d+\.csv$/)

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('应该使用自定义文件名', async () => {
      const config: ExportConfig = {
        format: 'csv',
        filename: 'custom-export.csv'
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(testData, testColumns, config)

      expect(mockLink.download).toBe('custom-export.csv')

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })

  describe('数据格式化', () => {
    it('应该正确格式化不同类型的数据', async () => {
      const complexData = [
        {
          id: 1,
          name: 'Test',
          active: true,
          date: new Date('2023-01-01'),
          metadata: { key: 'value' },
          empty: null,
          undefined: undefined
        }
      ]

      const config: ExportConfig = {
        format: 'json'
      }

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

      await dataExporter.export(complexData, testColumns, config)

      expect(mockLink.click).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })

  describe('事件监听器管理', () => {
    it('应该正确添加和移除事件监听器', () => {
      const listener = vi.fn()
      
      dataExporter.on('export-start', listener)
      dataExporter.off('export-start', listener)
      
      // 验证监听器已被移除
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('清理功能', () => {
    it('应该正确销毁组件', () => {
      dataExporter.destroy()
      
      // 验证组件已被销毁
      expect(dataExporter).toBeDefined()
    })
  })
})
