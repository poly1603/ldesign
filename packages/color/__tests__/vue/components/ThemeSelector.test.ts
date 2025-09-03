/**
 * ThemeSelector 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeSelector from '../../../src/vue/components/ThemeSelector.vue'
import type { ThemeConfig } from '../../../src/core/types'

describe('ThemeSelector', () => {
  const mockThemes: ThemeConfig[] = [
    {
      name: 'blue',
      displayName: '蓝色主题',
      description: '经典蓝色主题',
      light: { primary: '#1890ff' },
      dark: { primary: '#177ddc' },
      builtin: true
    },
    {
      name: 'green',
      displayName: '绿色主题',
      description: '清新绿色主题',
      light: { primary: '#52c41a' },
      dark: { primary: '#389e0d' },
      builtin: true
    },
    {
      name: 'custom',
      displayName: '自定义主题',
      light: { primary: '#ff0000' },
      dark: { primary: '#cc0000' },
      builtin: false
    }
  ]

  beforeEach(() => {
    // 模拟 DOM 环境
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.addEventListener = vi.fn()
    document.removeEventListener = vi.fn()
  })

  it('应该正确渲染选择器模式', () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        mode: 'select',
        customThemes: mockThemes
      }
    })

    expect(wrapper.find('.theme-selector').exists()).toBe(true)
    expect(wrapper.find('.theme-selector__select-wrapper').exists()).toBe(true)
  })

  it('应该正确渲染弹出层模式', () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        mode: 'popup',
        customThemes: mockThemes,
        buttonText: '选择主题'
      }
    })

    expect(wrapper.find('.theme-selector__popup-wrapper').exists()).toBe(true)
    expect(wrapper.find('.theme-selector__trigger').exists()).toBe(true)
    expect(wrapper.find('.theme-selector__trigger-text').text()).toBe('选择主题')
  })

  it('应该正确渲染对话框模式', () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        mode: 'dialog',
        customThemes: mockThemes,
        dialogTitle: '选择主题'
      }
    })

    expect(wrapper.find('.theme-selector').exists()).toBe(true)
  })

  it('应该正确处理主题选择', async () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        mode: 'select',
        customThemes: mockThemes
      }
    })

    // 打开下拉框
    await wrapper.find('.theme-selector__select-enhanced').trigger('click')
    
    // 选择第一个主题
    const firstOption = wrapper.find('.theme-selector__select-option')
    await firstOption.trigger('click')

    expect(wrapper.emitted('themeChange')).toBeTruthy()
  })

  it('应该正确显示主题颜色预览', () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        mode: 'select',
        customThemes: mockThemes,
        showPreview: true
      }
    })

    // 打开下拉框
    wrapper.find('.theme-selector__select-enhanced').trigger('click')
    
    const colorDots = wrapper.findAll('.theme-selector__color-dot')
    expect(colorDots.length).toBeGreaterThan(0)
  })

  it('应该正确处理不同尺寸', () => {
    const sizes = ['small', 'medium', 'large'] as const
    
    sizes.forEach(size => {
      const wrapper = mount(ThemeSelector, {
        props: {
          size,
          customThemes: mockThemes
        }
      })
      
      expect(wrapper.find(`.theme-selector--${size}`).exists()).toBe(true)
    })
  })

  it('应该正确处理禁用状态', () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        disabled: true,
        customThemes: mockThemes
      }
    })

    expect(wrapper.find('.theme-selector--disabled').exists()).toBe(true)
  })

  it('应该正确过滤禁用的内置主题', () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        customThemes: mockThemes,
        disabledBuiltinThemes: ['green']
      }
    })

    // 打开下拉框
    wrapper.find('.theme-selector__select-enhanced').trigger('click')
    
    const options = wrapper.findAll('.theme-selector__select-option')
    const greenOption = options.find(option => 
      option.find('.theme-selector__select-option-label').text() === '绿色主题'
    )
    
    expect(greenOption).toBeFalsy()
  })

  it('应该正确显示自定义主题', () => {
    const customTheme: ThemeConfig = {
      name: 'purple',
      displayName: '紫色主题',
      description: '优雅紫色主题',
      light: { primary: '#722ed1' },
      dark: { primary: '#531dab' },
      builtin: false
    }

    const wrapper = mount(ThemeSelector, {
      props: {
        customThemes: [customTheme]
      }
    })

    // 打开下拉框
    wrapper.find('.theme-selector__select-enhanced').trigger('click')
    
    const options = wrapper.findAll('.theme-selector__select-option-label')
    const purpleOption = options.find(option => option.text() === '紫色主题')
    
    expect(purpleOption).toBeTruthy()
  })

  it('应该正确处理弹出层触发', async () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        mode: 'popup',
        customThemes: mockThemes
      }
    })

    const trigger = wrapper.find('.theme-selector__trigger')
    await trigger.trigger('click')

    expect(wrapper.find('.theme-selector__popup').exists()).toBe(true)
  })

  it('应该正确显示主题描述', () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        mode: 'select',
        customThemes: mockThemes
      }
    })

    // 打开下拉框
    wrapper.find('.theme-selector__select-enhanced').trigger('click')
    
    const descriptions = wrapper.findAll('.theme-selector__select-option-desc')
    expect(descriptions.length).toBeGreaterThan(0)
    expect(descriptions[0].text()).toBe('经典蓝色主题')
  })

  it('应该正确处理占位符', () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        placeholder: '请选择主题',
        customThemes: mockThemes
      }
    })

    expect(wrapper.find('.theme-selector__select-placeholder').text()).toBe('请选择主题')
  })

  it('应该正确处理点击外部关闭', async () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        mode: 'select',
        customThemes: mockThemes
      }
    })

    // 打开下拉框
    await wrapper.find('.theme-selector__select-enhanced').trigger('click')
    expect(wrapper.find('.theme-selector__select-dropdown').exists()).toBe(true)

    // 模拟点击外部
    const outsideClickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    })
    document.body.dispatchEvent(outsideClickEvent)

    // 验证下拉框关闭
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showSelectDropdown).toBe(false)
  })

  it('应该正确处理主题切换动画', () => {
    const wrapper = mount(ThemeSelector, {
      props: {
        selectAnimation: 'slide',
        popupAnimation: 'zoom',
        customThemes: mockThemes
      }
    })

    expect(wrapper.vm.selectAnimation).toBe('slide')
    expect(wrapper.vm.popupAnimation).toBe('zoom')
  })
})
