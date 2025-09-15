/**
 * Badge 组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from './Badge.vue'

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(Badge)
      expect(wrapper.classes()).toContain('ld-badge')
    })
    
    it('should render with custom class', () => {
      const wrapper = mount(Badge, {
        props: {
          class: 'custom-class'
        }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })
  
  describe('Props', () => {
    it('should handle size prop correctly', () => {
      const wrapper = mount(Badge, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('ld-badge--large')
    })
    
    it('should handle disabled prop correctly', () => {
      const wrapper = mount(Badge, {
        props: {
          disabled: true
        }
      })
      expect(wrapper.classes()).toContain('ld-badge--disabled')
    })
  })
  
  // TODO: 添加更多测试用例
})