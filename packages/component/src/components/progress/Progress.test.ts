/**
 * Progress 组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Progress from './Progress.vue'

describe('Progress', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(Progress)
      expect(wrapper.classes()).toContain('ld-progress')
    })
    
    it('should render with custom class', () => {
      const wrapper = mount(Progress, {
        props: {
          class: 'custom-class'
        }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })
  
  describe('Props', () => {
    it('should handle size prop correctly', () => {
      const wrapper = mount(Progress, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('ld-progress--large')
    })
    
    it('should handle disabled prop correctly', () => {
      const wrapper = mount(Progress, {
        props: {
          disabled: true
        }
      })
      expect(wrapper.classes()).toContain('ld-progress--disabled')
    })
  })
  
  // TODO: 添加更多测试用例
})