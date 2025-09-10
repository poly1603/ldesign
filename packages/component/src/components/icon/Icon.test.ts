/**
 * Icon 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Icon from './Icon.vue'

describe('Icon', () => {
  it('应该正确渲染', () => {
    const wrapper = mount(Icon, {
      props: {
        name: '🔍'
      }
    })

    expect(wrapper.find('.l-icon').exists()).toBe(true)
    expect(wrapper.text()).toBe('🔍')
  })

  it('应该支持不同尺寸', () => {
    const wrapper = mount(Icon, {
      props: {
        name: '⭐',
        size: 'large'
      }
    })

    expect(wrapper.find('.l-icon--large').exists()).toBe(true)
  })

  it('应该支持自定义尺寸', () => {
    const wrapper = mount(Icon, {
      props: {
        name: '⭐',
        size: 32
      }
    })

    expect(wrapper.find('.l-icon--custom-size').exists()).toBe(true)
    expect(wrapper.element.style.getPropertyValue('--l-icon-custom-size')).toBe('32px')
  })

  it('应该支持颜色设置', () => {
    const wrapper = mount(Icon, {
      props: {
        name: '❤️',
        color: 'red'
      }
    })

    expect(wrapper.element.style.color).toBe('red')
  })

  it('应该支持旋转动画', () => {
    const wrapper = mount(Icon, {
      props: {
        name: '🔄',
        spin: true
      }
    })

    expect(wrapper.find('.l-icon--spin').exists()).toBe(true)
  })

  it('应该支持旋转角度', () => {
    const wrapper = mount(Icon, {
      props: {
        name: '➡️',
        rotate: 90
      }
    })

    expect(wrapper.element.style.transform).toBe('rotate(90deg)')
  })

  it('应该触发点击事件', async () => {
    const wrapper = mount(Icon, {
      props: {
        name: '👆'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('应该支持自定义类名', () => {
    const wrapper = mount(Icon, {
      props: {
        name: '🎨',
        class: 'custom-icon'
      }
    })

    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })

  it('应该暴露 getElement 方法', () => {
    const wrapper = mount(Icon, {
      props: {
        name: '🔧'
      }
    })

    expect(wrapper.vm.getElement).toBeDefined()
    expect(typeof wrapper.vm.getElement).toBe('function')
  })
})
