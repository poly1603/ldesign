/**
 * 可编辑单元格组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { EditableCell, type EditorConfig, type EditEventData } from '../../src/components/EditableCell'
import { createTestData, createTestColumns } from '../setup'

describe('EditableCell', () => {
  let editableCell: EditableCell
  let container: HTMLElement
  let testData: any[]
  let testColumns: any[]

  beforeEach(() => {
    editableCell = new EditableCell()
    container = document.createElement('div')
    document.body.appendChild(container)
    
    testData = createTestData(5)
    testColumns = createTestColumns()
  })

  afterEach(() => {
    editableCell.destroy()
    document.body.removeChild(container)
  })

  describe('基础功能', () => {
    it('应该正确创建可编辑单元格实例', () => {
      expect(editableCell).toBeDefined()
      expect(editableCell.isCurrentlyEditing()).toBe(false)
      expect(editableCell.getCurrentEditData()).toBeNull()
    })

    it('应该能开始编辑单元格', () => {
      const cell = document.createElement('td')
      cell.textContent = 'Test Value'
      container.appendChild(cell)

      const row = testData[0]
      const column = { ...testColumns[0], editable: true }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      expect(editableCell.isCurrentlyEditing()).toBe(true)
      expect(editableCell.getCurrentEditData()).not.toBeNull()
    })

    it('应该拒绝编辑不可编辑的列', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = { ...testColumns[0], editable: false }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      expect(editableCell.isCurrentlyEditing()).toBe(false)
    })
  })

  describe('编辑器类型', () => {
    it('应该创建文本编辑器', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = {
        ...testColumns[0],
        editable: true,
        editor: { type: 'text' as const }
      }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      const editor = document.querySelector('input[type="text"]')
      expect(editor).toBeTruthy()
    })

    it('应该创建数字编辑器', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = {
        ...testColumns[0],
        editable: true,
        editor: { type: 'number' as const }
      }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      const editor = document.querySelector('input[type="number"]')
      expect(editor).toBeTruthy()
    })

    it('应该创建选择器编辑器', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = {
        ...testColumns[0],
        editable: true,
        editor: {
          type: 'select' as const,
          options: [
            { label: '选项1', value: 'option1' },
            { label: '选项2', value: 'option2' }
          ]
        }
      }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      const editor = document.querySelector('select')
      expect(editor).toBeTruthy()
      expect(editor?.options.length).toBe(2)
    })

    it('应该创建日期编辑器', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = {
        ...testColumns[0],
        editable: true,
        editor: { type: 'date' as const }
      }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      const editor = document.querySelector('input[type="date"]')
      expect(editor).toBeTruthy()
    })

    it('应该创建文本域编辑器', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = {
        ...testColumns[0],
        editable: true,
        editor: { type: 'textarea' as const }
      }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      const editor = document.querySelector('textarea')
      expect(editor).toBeTruthy()
    })

    it('应该创建复选框编辑器', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = {
        ...testColumns[0],
        editable: true,
        editor: { type: 'checkbox' as const }
      }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      const editor = document.querySelector('input[type="checkbox"]')
      expect(editor).toBeTruthy()
    })
  })

  describe('事件处理', () => {
    it('应该触发编辑开始事件', () => {
      const onEditStart = vi.fn()
      editableCell.on('edit-start', onEditStart)

      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = { ...testColumns[0], editable: true }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      expect(onEditStart).toHaveBeenCalledWith(
        expect.objectContaining({
          row,
          column,
          rowIndex: 0,
          columnIndex: 0
        })
      )
    })

    it('应该触发编辑完成事件', () => {
      const onEditFinish = vi.fn()
      editableCell.on('edit-finish', onEditFinish)

      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = { ...testColumns[0], editable: true }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      editableCell.finishEdit()
      
      expect(onEditFinish).toHaveBeenCalled()
    })

    it('应该触发编辑取消事件', () => {
      const onEditCancel = vi.fn()
      editableCell.on('edit-cancel', onEditCancel)

      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = { ...testColumns[0], editable: true }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      editableCell.cancelEdit()
      
      expect(onEditCancel).toHaveBeenCalled()
    })
  })

  describe('键盘交互', () => {
    it('应该在按下Enter键时完成编辑', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = { ...testColumns[0], editable: true }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      const editor = document.querySelector('input') as HTMLInputElement
      expect(editor).toBeTruthy()
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      editor.dispatchEvent(enterEvent)
      
      expect(editableCell.isCurrentlyEditing()).toBe(false)
    })

    it('应该在按下Escape键时取消编辑', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = { ...testColumns[0], editable: true }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)
      
      expect(editableCell.isCurrentlyEditing()).toBe(false)
    })
  })

  describe('验证功能', () => {
    it('应该验证输入值', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = {
        ...testColumns[0],
        editable: true,
        editor: {
          type: 'text' as const,
          rules: [
            {
              validator: (value: string) => value.length > 0,
              message: '不能为空'
            }
          ]
        }
      }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      const editor = document.querySelector('input') as HTMLInputElement
      editor.value = ''
      
      // 模拟验证失败的情况
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      editableCell.finishEdit()
      
      expect(alertSpy).toHaveBeenCalledWith('不能为空')
      expect(editableCell.isCurrentlyEditing()).toBe(true)
      
      alertSpy.mockRestore()
    })

    it('应该通过验证并完成编辑', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = {
        ...testColumns[0],
        editable: true,
        editor: {
          type: 'text' as const,
          rules: [
            {
              validator: (value: string) => value.length > 0,
              message: '不能为空'
            }
          ]
        }
      }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      const editor = document.querySelector('input') as HTMLInputElement
      editor.value = 'Valid Value'
      
      editableCell.finishEdit()
      
      expect(editableCell.isCurrentlyEditing()).toBe(false)
    })
  })

  describe('外部点击', () => {
    it('应该在点击外部时完成编辑', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = { ...testColumns[0], editable: true }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      // 模拟点击外部
      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)
      
      const clickEvent = new MouseEvent('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'target', { value: outsideElement })
      document.dispatchEvent(clickEvent)
      
      expect(editableCell.isCurrentlyEditing()).toBe(false)
      
      document.body.removeChild(outsideElement)
    })
  })

  describe('自定义编辑器', () => {
    it('应该支持自定义编辑器', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const customEditor = document.createElement('div')
      customEditor.className = 'custom-editor'

      const row = testData[0]
      const column = {
        ...testColumns[0],
        editable: true,
        editor: {
          type: 'custom' as const,
          render: (value: any, onChange: (value: any) => void) => {
            return customEditor
          }
        }
      }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      
      const editor = document.querySelector('.custom-editor')
      expect(editor).toBeTruthy()
    })
  })

  describe('清理功能', () => {
    it('应该正确清理编辑状态', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = { ...testColumns[0], editable: true }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      expect(editableCell.isCurrentlyEditing()).toBe(true)
      
      editableCell.finishEdit()
      expect(editableCell.isCurrentlyEditing()).toBe(false)
      expect(editableCell.getCurrentEditData()).toBeNull()
      
      // 检查编辑器是否被移除
      const editor = document.querySelector('input')
      expect(editor).toBeNull()
    })

    it('应该正确销毁组件', () => {
      const cell = document.createElement('td')
      container.appendChild(cell)

      const row = testData[0]
      const column = { ...testColumns[0], editable: true }
      
      editableCell.startEdit(cell, row, column, 0, 0)
      editableCell.destroy()
      
      expect(editableCell.isCurrentlyEditing()).toBe(false)
      expect(editableCell.getCurrentEditData()).toBeNull()
    })
  })
})
