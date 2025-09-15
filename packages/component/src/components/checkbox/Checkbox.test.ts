/**
 * Checkbox 组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Checkbox from './Checkbox.vue'

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(Checkbox)
      expect(wrapper.classes()).toContain('ld-checkbox')
    })
    
    it('should render with custom class', () => {
      const wrapper = mount(Checkbox, {
        props: {
          class: 'custom-class'
        }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })
  
  describe('Props', () => {
    it('should handle size prop correctly', () => {
      const wrapper = mount(Checkbox, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('ld-checkbox--large')
    })
    
    it('should handle disabled prop correctly', () => {
      const wrapper = mount(Checkbox, {
        props: {
          disabled: true
        }
      })
      expect(wrapper.classes()).toContain('ld-checkbox--disabled')
    })
  })
  
  // TODO: 添加更多测试用例
})