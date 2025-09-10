/**
 * Button 组件简单测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button 简单测试', () => {
  it('应该能够正常挂载', () => {
    const wrapper = mount(Button, {
      slots: {
        default: () => '按钮文本'
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.element.tagName.toLowerCase()).toBe('button')
  })

  it('应该包含正确的类名', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'primary'
      },
      slots: {
        default: () => '主要按钮'
      }
    })

    expect(wrapper.classes()).toContain('ld-button')
    expect(wrapper.classes()).toContain('ld-button--primary')
  })

  it('应该正确处理禁用状态', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      },
      slots: {
        default: () => '禁用按钮'
      }
    })

    expect(wrapper.classes()).toContain('ld-button--disabled')
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
