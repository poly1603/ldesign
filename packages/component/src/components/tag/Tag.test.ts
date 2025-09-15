/**
 * Tag 组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Tag from './Tag.vue'

describe('Tag', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(Tag)
      expect(wrapper.classes()).toContain('ld-tag')
    })
    
    it('should render with custom class', () => {
      const wrapper = mount(Tag, {
        props: {
          class: 'custom-class'
        }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })
  
  describe('Props', () => {
    it('should handle size prop correctly', () => {
      const wrapper = mount(Tag, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('ld-tag--large')
    })
    
    it('should handle disabled prop correctly', () => {
      const wrapper = mount(Tag, {
        props: {
          disabled: true
        }
      })
      expect(wrapper.classes()).toContain('ld-tag--disabled')
    })
  })
  
  // TODO: 添加更多测试用例
})