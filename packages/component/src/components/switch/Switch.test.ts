/**
 * Switch 组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Switch from './Switch.vue'

describe('Switch', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(Switch)
      expect(wrapper.classes()).toContain('ld-switch')
    })
    
    it('should render with custom class', () => {
      const wrapper = mount(Switch, {
        props: {
          class: 'custom-class'
        }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })
  
  describe('Props', () => {
    it('should handle size prop correctly', () => {
      const wrapper = mount(Switch, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('ld-switch--large')
    })
    
    it('should handle disabled prop correctly', () => {
      const wrapper = mount(Switch, {
        props: {
          disabled: true
        }
      })
      expect(wrapper.classes()).toContain('ld-switch--disabled')
    })
  })
  
  // TODO: 添加更多测试用例
})