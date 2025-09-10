/**
 * Button 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import Button from './Button.vue'
import type { ButtonProps } from './types'

// 创建测试用的挂载函数
const createWrapper = (props: Partial<ButtonProps> = {}, slots: any = {}) => {
  return mount(Button, {
    props,
    slots: {
      default: slots.default || '按钮文本',
      ...slots
    },
    global: {
      stubs: {
        // 避免动态组件问题
      }
    }
  })
}

describe('Button', () => {
  // 基础渲染测试
  describe('基础渲染', () => {
    it('应该正确渲染默认按钮', () => {
      const wrapper = createWrapper()

      expect(wrapper.classes()).toContain('ld-button')
      expect(wrapper.classes()).toContain('ld-button--default')
      expect(wrapper.classes()).toContain('ld-button--medium')
      expect(wrapper.classes()).toContain('ld-button--rectangle')
      expect(wrapper.text()).toBe('按钮文本')
    })

    it('应该正确渲染不同类型的按钮', () => {
      const types: ButtonProps['type'][] = ['default', 'primary', 'success', 'warning', 'error']

      types.forEach(type => {
        const wrapper = createWrapper({ type })
        expect(wrapper.classes()).toContain(`ld-button--${type}`)
      })
    })

    it('应该正确渲染不同大小的按钮', () => {
      const sizes: ButtonProps['size'][] = ['small', 'medium', 'large']

      sizes.forEach(size => {
        const wrapper = createWrapper({ size })
        expect(wrapper.classes()).toContain(`ld-button--${size}`)
      })
    })

    it('应该正确渲染不同形状的按钮', () => {
      const shapes: ButtonProps['shape'][] = ['rectangle', 'round', 'circle']

      shapes.forEach(shape => {
        const wrapper = createWrapper({ shape })
        expect(wrapper.classes()).toContain(`ld-button--${shape}`)
      })
    })
  })

  // 状态测试
  describe('状态测试', () => {
    it('应该正确处理禁用状态', () => {
      const wrapper = createWrapper({ disabled: true })

      expect(wrapper.classes()).toContain('ld-button--disabled')
      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('应该正确处理加载状态', () => {
      const wrapper = createWrapper({ loading: true })

      expect(wrapper.classes()).toContain('ld-button--loading')
      expect(wrapper.find('.ld-button__loading').exists()).toBe(true)
      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('应该正确处理块级状态', () => {
      const wrapper = createWrapper({ block: true })

      expect(wrapper.classes()).toContain('ld-button--block')
    })

    it('应该正确处理幽灵状态', () => {
      const wrapper = createWrapper({ ghost: true })

      expect(wrapper.classes()).toContain('ld-button--ghost')
    })
  })

  // 变体测试
  describe('变体测试', () => {
    it('应该正确渲染轮廓变体', () => {
      const wrapper = createWrapper({ variant: 'outline' })

      expect(wrapper.classes()).toContain('ld-button--outline')
    })

    it('应该正确渲染文本变体', () => {
      const wrapper = createWrapper({ variant: 'text' })

      expect(wrapper.classes()).toContain('ld-button--text')
    })
  })

  // 图标测试
  describe('图标测试', () => {
    it('应该正确渲染左侧图标', () => {
      const wrapper = createWrapper({
        icon: '🔍',
        iconPosition: 'left'
      })

      const icon = wrapper.find('.ld-button__icon--left')
      expect(icon.exists()).toBe(true)
      expect(icon.text()).toBe('🔍')
    })

    it('应该正确渲染右侧图标', () => {
      const wrapper = createWrapper({
        icon: '→',
        iconPosition: 'right'
      })

      const icon = wrapper.find('.ld-button__icon--right')
      expect(icon.exists()).toBe(true)
      expect(icon.text()).toBe('→')
    })
  })

  // 事件测试
  describe('事件测试', () => {
    it('应该正确触发点击事件', async () => {
      const handleClick = vi.fn()
      const wrapper = mount(Button, {
        props: { onClick: handleClick },
        slots: { default: '点击按钮' }
      })

      await wrapper.trigger('click')
      expect(handleClick).toHaveBeenCalledTimes(1)
      expect(handleClick).toHaveBeenCalledWith(expect.any(MouseEvent))
    })

    it('禁用状态下不应该触发点击事件', async () => {
      const handleClick = vi.fn()
      const wrapper = mount(Button, {
        props: {
          disabled: true,
          onClick: handleClick
        },
        slots: { default: '禁用按钮' }
      })

      await wrapper.trigger('click')
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('加载状态下不应该触发点击事件', async () => {
      const handleClick = vi.fn()
      const wrapper = mount(Button, {
        props: {
          loading: true,
          onClick: handleClick
        },
        slots: { default: '加载按钮' }
      })

      await wrapper.trigger('click')
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('应该正确触发焦点事件', async () => {
      const handleFocus = vi.fn()
      const wrapper = mount(Button, {
        props: { onFocus: handleFocus },
        slots: { default: '按钮' }
      })

      await wrapper.trigger('focus')
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('应该正确触发失焦事件', async () => {
      const handleBlur = vi.fn()
      const wrapper = mount(Button, {
        props: { onBlur: handleBlur },
        slots: { default: '按钮' }
      })

      await wrapper.trigger('blur')
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('应该正确触发鼠标事件', async () => {
      const handleMouseenter = vi.fn()
      const handleMouseleave = vi.fn()
      const wrapper = mount(Button, {
        props: {
          onMouseenter: handleMouseenter,
          onMouseleave: handleMouseleave
        },
        slots: { default: '按钮' }
      })

      await wrapper.trigger('mouseenter')
      expect(handleMouseenter).toHaveBeenCalledTimes(1)

      await wrapper.trigger('mouseleave')
      expect(handleMouseleave).toHaveBeenCalledTimes(1)
    })
  })

  // 标签和属性测试
  describe('标签和属性测试', () => {
    it('应该支持自定义标签', () => {
      const wrapper = mount(Button, {
        props: {
          tag: 'a',
          href: 'https://example.com'
        },
        slots: { default: '链接按钮' }
      })

      expect(wrapper.element.tagName.toLowerCase()).toBe('a')
      expect(wrapper.attributes('href')).toBe('https://example.com')
    })

    it('应该支持原生 type 属性', () => {
      const wrapper = mount(Button, {
        props: { nativeType: 'submit' },
        slots: { default: '提交按钮' }
      })

      expect(wrapper.attributes('type')).toBe('submit')
    })

    it('应该支持自定义类名', () => {
      const wrapper = mount(Button, {
        props: { class: 'custom-class' },
        slots: { default: '自定义按钮' }
      })

      expect(wrapper.classes()).toContain('custom-class')
    })

    it('应该支持自定义样式', () => {
      const wrapper = mount(Button, {
        props: { style: 'color: red;' },
        slots: { default: '自定义样式按钮' }
      })

      expect(wrapper.attributes('style')).toContain('color: red')
    })
  })

  // 实例方法测试
  describe('实例方法测试', () => {
    it('应该暴露 focus 方法', () => {
      const wrapper = mount(Button, {
        slots: { default: '按钮' }
      })

      expect(typeof wrapper.vm.focus).toBe('function')
    })

    it('应该暴露 blur 方法', () => {
      const wrapper = mount(Button, {
        slots: { default: '按钮' }
      })

      expect(typeof wrapper.vm.blur).toBe('function')
    })
  })
})
