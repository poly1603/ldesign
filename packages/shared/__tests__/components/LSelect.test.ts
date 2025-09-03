/**
 * LSelect 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LSelect from '../../src/components/select/LSelect.vue'
import type { SelectOption } from '../../src/components/select/types'

describe('LSelect', () => {
  const mockOptions: SelectOption[] = [
    { value: 'option1', label: '选项1', description: '这是选项1的描述' },
    { value: 'option2', label: '选项2', color: '#ff0000' },
    { value: 'option3', label: '选项3', disabled: true },
    { value: 'option4', label: '选项4', icon: '🎨' }
  ]

  beforeEach(() => {
    // 模拟 DOM 环境
    document.body.innerHTML = ''
  })

  it('应该正确渲染基本选择器', () => {
    const wrapper = mount(LSelect, {
      props: {
        options: mockOptions,
        placeholder: '请选择选项'
      }
    })

    expect(wrapper.find('.l-select').exists()).toBe(true)
    expect(wrapper.find('.l-select__placeholder').text()).toBe('请选择选项')
  })

  it('应该正确显示选中的选项', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options: mockOptions,
        modelValue: 'option1'
      }
    })

    expect(wrapper.find('.l-select__label').text()).toBe('选项1')
  })

  it('应该在点击时打开下拉框', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options: mockOptions
      }
    })

    await wrapper.find('.l-select__input').trigger('click')
    expect(wrapper.find('.l-select__dropdown').exists()).toBe(true)
  })

  it('应该正确处理选项选择', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options: mockOptions,
        'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value })
      }
    })

    // 打开下拉框
    await wrapper.find('.l-select__input').trigger('click')
    
    // 选择第一个选项
    await wrapper.find('.l-select__option').trigger('click')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('应该正确显示颜色选项', () => {
    const wrapper = mount(LSelect, {
      props: {
        options: mockOptions,
        showColor: true
      }
    })

    // 打开下拉框
    wrapper.find('.l-select__input').trigger('click')
    
    const colorDots = wrapper.findAll('.l-select__option-color')
    expect(colorDots.length).toBeGreaterThan(0)
  })

  it('应该正确显示图标选项', () => {
    const wrapper = mount(LSelect, {
      props: {
        options: mockOptions,
        showIcon: true
      }
    })

    // 打开下拉框
    wrapper.find('.l-select__input').trigger('click')
    
    const icons = wrapper.findAll('.l-select__option-icon')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('应该正确显示描述信息', () => {
    const wrapper = mount(LSelect, {
      props: {
        options: mockOptions,
        showDescription: true
      }
    })

    // 打开下拉框
    wrapper.find('.l-select__input').trigger('click')
    
    const descriptions = wrapper.findAll('.l-select__option-desc')
    expect(descriptions.length).toBeGreaterThan(0)
    expect(descriptions[0].text()).toBe('这是选项1的描述')
  })

  it('应该正确处理禁用状态', () => {
    const wrapper = mount(LSelect, {
      props: {
        options: mockOptions,
        disabled: true
      }
    })

    expect(wrapper.find('.l-select--disabled').exists()).toBe(true)
  })

  it('应该正确处理清空功能', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options: mockOptions,
        modelValue: 'option1',
        clearable: true,
        'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value })
      }
    })

    const clearButton = wrapper.find('.l-select__clear')
    expect(clearButton.exists()).toBe(true)
    
    await clearButton.trigger('click')
    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('应该正确处理搜索功能', async () => {
    const wrapper = mount(LSelect, {
      props: {
        options: mockOptions,
        filterable: true
      }
    })

    // 打开下拉框
    await wrapper.find('.l-select__input').trigger('click')
    
    const searchInput = wrapper.find('.l-select__search-input')
    expect(searchInput.exists()).toBe(true)
    
    await searchInput.setValue('选项1')
    expect(wrapper.emitted('search')).toBeTruthy()
  })

  it('应该正确处理不同尺寸', () => {
    const sizes = ['small', 'medium', 'large'] as const
    
    sizes.forEach(size => {
      const wrapper = mount(LSelect, {
        props: {
          options: mockOptions,
          size
        }
      })
      
      expect(wrapper.find(`.l-select--${size}`).exists()).toBe(true)
    })
  })

  it('应该正确处理动画效果', () => {
    const animations = ['fade', 'slide', 'zoom', 'bounce'] as const
    
    animations.forEach(animation => {
      const wrapper = mount(LSelect, {
        props: {
          options: mockOptions,
          animation
        }
      })
      
      // 打开下拉框
      wrapper.find('.l-select__input').trigger('click')
      
      const dropdown = wrapper.find('.l-select__dropdown')
      expect(dropdown.exists()).toBe(true)
    })
  })
})
