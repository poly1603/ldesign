/**
 * Radio 组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Radio from './Radio.vue'

describe('Radio', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(Radio)
      expect(wrapper.classes()).toContain('ld-radio')
    })
    
    it('should render with custom class', () => {
      const wrapper = mount(Radio, {
        props: {
          class: 'custom-class'
        }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })
  
  describe('Props', () => {
    it('should handle size prop correctly', () => {
      const wrapper = mount(Radio, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('ld-radio--large')
    })
    
    it('should handle disabled prop correctly', () => {
      const wrapper = mount(Radio, {
        props: {
          disabled: true
        }
      })
      expect(wrapper.classes()).toContain('ld-radio--disabled')
    })
  })
  
  // TODO: 添加更多测试用例
})