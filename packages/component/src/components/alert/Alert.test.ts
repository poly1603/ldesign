/**
 * Alert 组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Alert from './Alert.vue'

describe('Alert', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(Alert)
      expect(wrapper.classes()).toContain('ld-alert')
    })
    
    it('should render with custom class', () => {
      const wrapper = mount(Alert, {
        props: {
          class: 'custom-class'
        }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })
  
  describe('Props', () => {
    it('should handle size prop correctly', () => {
      const wrapper = mount(Alert, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('ld-alert--large')
    })
    
    it('should handle disabled prop correctly', () => {
      const wrapper = mount(Alert, {
        props: {
          disabled: true
        }
      })
      expect(wrapper.classes()).toContain('ld-alert--disabled')
    })
  })
  
  // TODO: 添加更多测试用例
})