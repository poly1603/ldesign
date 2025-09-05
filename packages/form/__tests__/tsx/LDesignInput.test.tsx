/**
 * LDesignInput TSX 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { LDesignInput } from '../../src/vue/components/tsx/LDesignInput'

describe('LDesignInput TSX Component', () => {
  it('应该正确渲染基础输入框', () => {
    const wrapper = mount(LDesignInput)
    
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.classes()).toContain('ldesign-input')
    expect(wrapper.classes()).toContain('ldesign-input--medium')
    expect(wrapper.classes()).toContain('ldesign-input--default')
  })
  
  it('应该正确绑定值', async () => {
    const wrapper = mount(LDesignInput, {
      props: {
        modelValue: 'test value'
      }
    })
    
    const input = wrapper.find('input')
    expect(input.element.value).toBe('test value')
  })
  
  it('应该正确处理输入事件', async () => {
    const onUpdateModelValue = vi.fn()
    const onInput = vi.fn()
    
    const wrapper = mount(LDesignInput, {
      props: {
        'onUpdate:modelValue': onUpdateModelValue,
        onInput
      }
    })
    
    const input = wrapper.find('input')
    await input.setValue('new value')
    
    expect(onUpdateModelValue).toHaveBeenCalledWith('new value')
    expect(onInput).toHaveBeenCalled()
  })
  
  it('应该正确应用不同的类型', () => {
    const types = ['text', 'password', 'email', 'number', 'tel', 'url', 'search'] as const
    
    types.forEach(type => {
      const wrapper = mount(LDesignInput, {
        props: { type }
      })
      
      expect(wrapper.find('input').attributes('type')).toBe(type)
    })
  })
  
  it('应该正确应用不同的尺寸', () => {
    const sizes = ['small', 'medium', 'large'] as const
    
    sizes.forEach(size => {
      const wrapper = mount(LDesignInput, {
        props: { size }
      })
      
      expect(wrapper.classes()).toContain(`ldesign-input--${size}`)
    })
  })
  
  it('应该正确应用不同的状态', () => {
    const statuses = ['default', 'success', 'warning', 'error'] as const
    
    statuses.forEach(status => {
      const wrapper = mount(LDesignInput, {
        props: { status }
      })
      
      expect(wrapper.classes()).toContain(`ldesign-input--${status}`)
    })
  })
  
  it('应该正确处理占位符', () => {
    const wrapper = mount(LDesignInput, {
      props: { placeholder: 'Enter text here' }
    })
    
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text here')
  })
  
  it('应该正确处理禁用状态', () => {
    const wrapper = mount(LDesignInput, {
      props: { disabled: true }
    })
    
    expect(wrapper.classes()).toContain('ldesign-input--disabled')
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })
  
  it('应该正确处理只读状态', () => {
    const wrapper = mount(LDesignInput, {
      props: { readonly: true }
    })
    
    expect(wrapper.classes()).toContain('ldesign-input--readonly')
    expect(wrapper.find('input').attributes('readonly')).toBeDefined()
  })
  
  it('应该正确处理最大长度', () => {
    const wrapper = mount(LDesignInput, {
      props: { maxlength: 10 }
    })
    
    expect(wrapper.find('input').attributes('maxlength')).toBe('10')
  })
  
  it('应该正确处理自动聚焦', () => {
    const wrapper = mount(LDesignInput, {
      props: { autofocus: true }
    })
    
    expect(wrapper.find('input').attributes('autofocus')).toBeDefined()
  })
  
  it('应该正确显示清除按钮', async () => {
    const wrapper = mount(LDesignInput, {
      props: {
        modelValue: 'test',
        clearable: true
      }
    })
    
    expect(wrapper.find('.ldesign-input__clear').exists()).toBe(true)
  })
  
  it('应该正确处理清除事件', async () => {
    const onUpdateModelValue = vi.fn()
    const onClear = vi.fn()
    
    const wrapper = mount(LDesignInput, {
      props: {
        modelValue: 'test',
        clearable: true,
        'onUpdate:modelValue': onUpdateModelValue,
        onClear
      }
    })
    
    await wrapper.find('.ldesign-input__clear').trigger('click')
    
    expect(onUpdateModelValue).toHaveBeenCalledWith('')
    expect(onClear).toHaveBeenCalled()
  })
  
  it('应该正确处理密码显示切换', async () => {
    const wrapper = mount(LDesignInput, {
      props: {
        type: 'password',
        showPassword: true
      }
    })
    
    const toggleButton = wrapper.find('.ldesign-input__password-toggle')
    expect(toggleButton.exists()).toBe(true)
    
    // 初始状态应该是 password 类型
    expect(wrapper.find('input').attributes('type')).toBe('password')
    
    // 点击切换按钮
    await toggleButton.trigger('click')
    await nextTick()
    
    // 应该变成 text 类型
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })
  
  it('应该正确显示字数统计', () => {
    const wrapper = mount(LDesignInput, {
      props: {
        modelValue: 'hello',
        maxlength: 10,
        showCount: true
      }
    })
    
    const countElement = wrapper.find('.ldesign-input__count')
    expect(countElement.exists()).toBe(true)
    expect(countElement.text()).toBe('5/10')
  })
  
  it('应该正确处理前缀图标', () => {
    const wrapper = mount(LDesignInput, {
      props: { prefixIcon: 'search' }
    })
    
    const prefixElement = wrapper.find('.ldesign-input__prefix')
    expect(prefixElement.exists()).toBe(true)
    expect(prefixElement.find('i').classes()).toContain('ldesign-icon-search')
  })
  
  it('应该正确处理后缀图标', () => {
    const wrapper = mount(LDesignInput, {
      props: { suffixIcon: 'calendar' }
    })
    
    const suffixElement = wrapper.find('.ldesign-input__suffix-icon')
    expect(suffixElement.exists()).toBe(true)
    expect(suffixElement.find('i').classes()).toContain('ldesign-icon-calendar')
  })
  
  it('应该正确处理聚焦和失焦事件', async () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    
    const wrapper = mount(LDesignInput, {
      props: { onFocus, onBlur }
    })
    
    const input = wrapper.find('input')
    
    await input.trigger('focus')
    expect(wrapper.classes()).toContain('ldesign-input--focused')
    expect(onFocus).toHaveBeenCalled()
    
    await input.trigger('blur')
    expect(wrapper.classes()).not.toContain('ldesign-input--focused')
    expect(onBlur).toHaveBeenCalled()
  })
  
  it('应该正确处理数字类型输入', async () => {
    const onUpdateModelValue = vi.fn()
    
    const wrapper = mount(LDesignInput, {
      props: {
        type: 'number',
        'onUpdate:modelValue': onUpdateModelValue
      }
    })
    
    const input = wrapper.find('input')
    await input.setValue('123')
    
    expect(onUpdateModelValue).toHaveBeenCalledWith(123)
  })
  
  it('应该正确处理键盘事件', async () => {
    const onKeydown = vi.fn()
    
    const wrapper = mount(LDesignInput, {
      props: { onKeydown }
    })
    
    await wrapper.find('input').trigger('keydown', { key: 'Enter' })
    expect(onKeydown).toHaveBeenCalled()
  })
})
