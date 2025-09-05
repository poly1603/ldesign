/**
 * LDesignButton TSX 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { LDesignButton } from '../../src/vue/components/tsx/LDesignButton'

describe('LDesignButton TSX Component', () => {
  it('应该正确渲染基础按钮', () => {
    const wrapper = mount(LDesignButton, {
      slots: {
        default: '点击我'
      }
    })
    
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toBe('点击我')
    expect(wrapper.classes()).toContain('ldesign-button')
    expect(wrapper.classes()).toContain('ldesign-button--primary')
    expect(wrapper.classes()).toContain('ldesign-button--medium')
  })
  
  it('应该正确应用不同的类型', () => {
    const types = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const
    
    types.forEach(type => {
      const wrapper = mount(LDesignButton, {
        props: { type },
        slots: { default: 'Button' }
      })
      
      expect(wrapper.classes()).toContain(`ldesign-button--${type}`)
    })
  })
  
  it('应该正确应用不同的尺寸', () => {
    const sizes = ['small', 'medium', 'large'] as const
    
    sizes.forEach(size => {
      const wrapper = mount(LDesignButton, {
        props: { size },
        slots: { default: 'Button' }
      })
      
      expect(wrapper.classes()).toContain(`ldesign-button--${size}`)
    })
  })
  
  it('应该正确处理禁用状态', () => {
    const wrapper = mount(LDesignButton, {
      props: { disabled: true },
      slots: { default: 'Button' }
    })
    
    expect(wrapper.classes()).toContain('ldesign-button--disabled')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
  
  it('应该正确处理加载状态', () => {
    const wrapper = mount(LDesignButton, {
      props: { loading: true },
      slots: { default: 'Button' }
    })
    
    expect(wrapper.classes()).toContain('ldesign-button--loading')
    expect(wrapper.find('.ldesign-button__loading-icon').exists()).toBe(true)
  })
  
  it('应该正确处理块级按钮', () => {
    const wrapper = mount(LDesignButton, {
      props: { block: true },
      slots: { default: 'Button' }
    })
    
    expect(wrapper.classes()).toContain('ldesign-button--block')
  })
  
  it('应该正确处理不同形状', () => {
    const shapes = ['default', 'round', 'circle'] as const
    
    shapes.forEach(shape => {
      const wrapper = mount(LDesignButton, {
        props: { shape },
        slots: { default: 'Button' }
      })
      
      if (shape !== 'default') {
        expect(wrapper.classes()).toContain(`ldesign-button--${shape}`)
      }
    })
  })
  
  it('应该正确处理图标', () => {
    const wrapper = mount(LDesignButton, {
      props: { icon: 'search' },
      slots: { default: 'Search' }
    })
    
    const iconElement = wrapper.find('.ldesign-button__icon i')
    expect(iconElement.exists()).toBe(true)
    expect(iconElement.classes()).toContain('ldesign-icon-search')
  })
  
  it('应该正确处理HTML类型', () => {
    const htmlTypes = ['button', 'submit', 'reset'] as const
    
    htmlTypes.forEach(htmlType => {
      const wrapper = mount(LDesignButton, {
        props: { htmlType },
        slots: { default: 'Button' }
      })
      
      expect(wrapper.find('button').attributes('type')).toBe(htmlType)
    })
  })
  
  it('应该正确触发点击事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(LDesignButton, {
      props: { onClick },
      slots: { default: 'Button' }
    })
    
    await wrapper.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith(expect.any(MouseEvent))
  })
  
  it('禁用状态下不应该触发点击事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(LDesignButton, {
      props: { disabled: true, onClick },
      slots: { default: 'Button' }
    })
    
    await wrapper.find('button').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })
  
  it('加载状态下不应该触发点击事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(LDesignButton, {
      props: { loading: true, onClick },
      slots: { default: 'Button' }
    })
    
    await wrapper.find('button').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })
  
  it('应该正确渲染按钮内容', () => {
    const wrapper = mount(LDesignButton, {
      slots: {
        default: '<span>Custom Content</span>'
      }
    })
    
    const contentElement = wrapper.find('.ldesign-button__content')
    expect(contentElement.exists()).toBe(true)
    expect(contentElement.html()).toContain('<span>Custom Content</span>')
  })
  
  it('加载状态下应该隐藏图标', () => {
    const wrapper = mount(LDesignButton, {
      props: { loading: true, icon: 'search' },
      slots: { default: 'Button' }
    })
    
    expect(wrapper.find('.ldesign-button__loading-icon').exists()).toBe(true)
    expect(wrapper.find('.ldesign-button__icon').exists()).toBe(false)
  })
})
