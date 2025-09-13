/**
 * 筛选下拉框组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { FilterDropdown, type FilterDropdownConfig, type FilterOption } from '../../src/components/FilterDropdown'

describe('FilterDropdown', () => {
  let container: HTMLElement
  let filterDropdown: FilterDropdown
  let mockOptions: FilterOption[]

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    document.body.appendChild(container)

    // 模拟筛选选项
    mockOptions = [
      { value: 'option1', label: '选项1' },
      { value: 'option2', label: '选项2' },
      { value: 'option3', label: '选项3', disabled: true },
      { value: 'option4', label: '选项4' }
    ]
  })

  afterEach(() => {
    // 清理
    if (filterDropdown) {
      filterDropdown.destroy()
    }
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  })

  describe('基础功能', () => {
    it('应该正确创建筛选下拉框', () => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions
      })

      const trigger = container.querySelector('.ldesign-table-filter-trigger')
      const dropdown = container.querySelector('.ldesign-table-filter-dropdown')
      
      expect(trigger).toBeTruthy()
      expect(dropdown).toBeTruthy()
    })

    it('应该正确显示占位符文本', () => {
      const placeholder = '自定义筛选'
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions,
        placeholder
      })

      const triggerText = container.querySelector('.ldesign-table-filter-text')
      expect(triggerText?.textContent).toBe(placeholder)
    })

    it('应该正确处理禁用状态', () => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions,
        disabled: true
      })

      const trigger = container.querySelector('.ldesign-table-filter-trigger') as HTMLButtonElement
      expect(trigger.disabled).toBe(true)
    })

    it('应该正确设置初始选中值', () => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions,
        selectedValues: ['option1', 'option2']
      })

      const triggerText = container.querySelector('.ldesign-table-filter-text')
      expect(triggerText?.textContent).toBe('已选择 2 项')
    })
  })

  describe('下拉框显示和隐藏', () => {
    beforeEach(() => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions
      })
    })

    it('应该在点击触发器时显示下拉框', () => {
      const trigger = container.querySelector('.ldesign-table-filter-trigger') as HTMLElement
      const dropdown = container.querySelector('.ldesign-table-filter-dropdown') as HTMLElement

      expect(dropdown.style.display).toBe('none')

      trigger.click()

      expect(dropdown.style.display).toBe('block')
    })

    it('应该在外部点击时隐藏下拉框', () => {
      const trigger = container.querySelector('.ldesign-table-filter-trigger') as HTMLElement
      const dropdown = container.querySelector('.ldesign-table-filter-dropdown') as HTMLElement

      // 显示下拉框
      trigger.click()
      expect(dropdown.style.display).toBe('block')

      // 模拟外部点击
      document.body.click()

      expect(dropdown.style.display).toBe('none')
    })

    it('应该正确切换显示状态', () => {
      filterDropdown.show()
      
      const dropdown = container.querySelector('.ldesign-table-filter-dropdown') as HTMLElement
      expect(dropdown.style.display).toBe('block')

      filterDropdown.hide()
      expect(dropdown.style.display).toBe('none')
    })
  })

  describe('选项渲染和交互', () => {
    beforeEach(() => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions
      })
      filterDropdown.show()
    })

    it('应该正确渲染所有选项', () => {
      const options = container.querySelectorAll('.ldesign-table-filter-option')
      expect(options.length).toBe(mockOptions.length)
    })

    it('应该正确处理选项点击', () => {
      const onChangeSpy = vi.fn()
      filterDropdown.updateConfig({ onChange: onChangeSpy })

      const firstOption = container.querySelector('.ldesign-table-filter-option-checkbox') as HTMLInputElement
      firstOption.click()

      expect(onChangeSpy).toHaveBeenCalledWith(['option1'])
    })

    it('应该正确处理禁用选项', () => {
      const disabledOption = container.querySelectorAll('.ldesign-table-filter-option-checkbox')[2] as HTMLInputElement
      expect(disabledOption.disabled).toBe(true)
    })

    it('应该正确显示选中状态', () => {
      filterDropdown.setSelectedValues(['option1'])

      const firstCheckbox = container.querySelector('.ldesign-table-filter-option-checkbox') as HTMLInputElement
      expect(firstCheckbox.checked).toBe(true)
    })
  })

  describe('搜索功能', () => {
    beforeEach(() => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions,
        searchable: true
      })
      filterDropdown.show()
    })

    it('应该显示搜索输入框', () => {
      const searchInput = container.querySelector('.ldesign-table-filter-search-input')
      expect(searchInput).toBeTruthy()
    })

    it('应该正确过滤选项', () => {
      const searchInput = container.querySelector('.ldesign-table-filter-search-input') as HTMLInputElement
      
      // 输入搜索文本
      searchInput.value = '选项1'
      searchInput.dispatchEvent(new Event('input'))

      const visibleOptions = container.querySelectorAll('.ldesign-table-filter-option')
      expect(visibleOptions.length).toBe(1)
    })

    it('应该在无匹配时显示空状态', () => {
      const searchInput = container.querySelector('.ldesign-table-filter-search-input') as HTMLInputElement
      
      // 输入不匹配的搜索文本
      searchInput.value = '不存在的选项'
      searchInput.dispatchEvent(new Event('input'))

      const emptyElement = container.querySelector('.ldesign-table-filter-empty')
      expect(emptyElement).toBeTruthy()
      expect(emptyElement?.textContent).toBe('无匹配选项')
    })
  })

  describe('操作按钮', () => {
    beforeEach(() => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions,
        showSelectAll: true,
        showClear: true
      })
      filterDropdown.show()
    })

    it('应该显示全选和清空按钮', () => {
      const actionButtons = container.querySelectorAll('.ldesign-table-filter-action-btn')
      expect(actionButtons.length).toBe(2)
    })

    it('应该正确处理全选操作', () => {
      const onChangeSpy = vi.fn()
      filterDropdown.updateConfig({ onChange: onChangeSpy })

      const selectAllBtn = container.querySelectorAll('.ldesign-table-filter-action-btn')[0] as HTMLElement
      selectAllBtn.click()

      // 应该选中所有非禁用选项
      const expectedValues = mockOptions.filter(opt => !opt.disabled).map(opt => opt.value)
      expect(onChangeSpy).toHaveBeenCalledWith(expectedValues)
    })

    it('应该正确处理清空操作', () => {
      const onChangeSpy = vi.fn()
      filterDropdown.setSelectedValues(['option1', 'option2'])
      filterDropdown.updateConfig({ onChange: onChangeSpy })

      const clearBtn = container.querySelectorAll('.ldesign-table-filter-action-btn')[1] as HTMLElement
      clearBtn.click()

      expect(onChangeSpy).toHaveBeenCalledWith([])
    })
  })

  describe('状态管理', () => {
    beforeEach(() => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions
      })
    })

    it('应该正确获取选中值', () => {
      filterDropdown.setSelectedValues(['option1', 'option2'])
      
      const selectedValues = filterDropdown.getSelectedValues()
      expect(selectedValues).toEqual(['option1', 'option2'])
    })

    it('应该正确设置选项', () => {
      const newOptions: FilterOption[] = [
        { value: 'new1', label: '新选项1' },
        { value: 'new2', label: '新选项2' }
      ]

      filterDropdown.setOptions(newOptions)
      filterDropdown.show()

      const options = container.querySelectorAll('.ldesign-table-filter-option')
      expect(options.length).toBe(newOptions.length)
    })

    it('应该正确更新配置', () => {
      filterDropdown.updateConfig({
        placeholder: '新占位符',
        disabled: true
      })

      const triggerText = container.querySelector('.ldesign-table-filter-text')
      const trigger = container.querySelector('.ldesign-table-filter-trigger') as HTMLButtonElement
      
      expect(triggerText?.textContent).toBe('新占位符')
      expect(trigger.disabled).toBe(true)
    })
  })

  describe('事件系统', () => {
    beforeEach(() => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions
      })
    })

    it('应该正确触发变化事件', () => {
      const eventSpy = vi.fn()
      filterDropdown.on('change', eventSpy)

      filterDropdown.setSelectedValues(['option1'])

      expect(eventSpy).toHaveBeenCalledWith({
        selectedValues: ['option1']
      })
    })

    it('应该正确触发显示和隐藏事件', () => {
      const showSpy = vi.fn()
      const hideSpy = vi.fn()
      
      filterDropdown.on('show', showSpy)
      filterDropdown.on('hide', hideSpy)

      filterDropdown.show()
      expect(showSpy).toHaveBeenCalled()

      filterDropdown.hide()
      expect(hideSpy).toHaveBeenCalled()
    })

    it('应该正确移除事件监听器', () => {
      const eventSpy = vi.fn()
      filterDropdown.on('change', eventSpy)
      filterDropdown.off('change', eventSpy)

      filterDropdown.setSelectedValues(['option1'])

      expect(eventSpy).not.toHaveBeenCalled()
    })
  })

  describe('销毁功能', () => {
    it('应该正确销毁筛选下拉框', () => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions
      })

      const trigger = container.querySelector('.ldesign-table-filter-trigger')
      expect(trigger).toBeTruthy()

      filterDropdown.destroy()

      const triggerAfter = container.querySelector('.ldesign-table-filter-trigger')
      expect(triggerAfter).toBeFalsy()
    })

    it('应该在销毁后移除全局事件监听器', () => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions
      })

      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      filterDropdown.destroy()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
      
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('错误处理', () => {
    it('应该在容器不存在时抛出错误', () => {
      expect(() => {
        new FilterDropdown('#non-existent-container', {
          options: mockOptions
        })
      }).toThrow('筛选下拉框容器不存在')
    })

    it('应该正确处理事件监听器中的错误', () => {
      filterDropdown = new FilterDropdown(container, {
        options: mockOptions
      })
      
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const faultyListener = vi.fn(() => {
        throw new Error('Test error')
      })

      filterDropdown.on('change', faultyListener)
      filterDropdown.setSelectedValues(['option1'])

      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
    })
  })
})
