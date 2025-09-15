/**
 * Select 组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Select from './Select.vue'

describe('Select', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(Select)
      expect(wrapper.classes()).toContain('ld-select')
    })
    
    it('should render with custom class', () => {
      const wrapper = mount(Select, {
        props: {
          class: 'custom-class'
        }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })
  
  describe('Props', () => {
    it('should handle size prop correctly', () => {
      const wrapper = mount(Select, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('ld-select--large')
    })
    
    it('should handle disabled prop correctly', () => {
      const wrapper = mount(Select, {
        props: {
          disabled: true
        }
      })
      expect(wrapper.classes()).toContain('ld-select--disabled')
    })
  })
  
  // TODO: 添加更多测试用例
})