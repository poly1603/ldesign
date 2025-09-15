/**
 * Card 组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from './Card.vue'

describe('Card', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(Card)
      expect(wrapper.classes()).toContain('ld-card')
    })
    
    it('should render with custom class', () => {
      const wrapper = mount(Card, {
        props: {
          class: 'custom-class'
        }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })
  
  describe('Props', () => {
    it('should handle size prop correctly', () => {
      const wrapper = mount(Card, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('ld-card--large')
    })
    
    it('should handle disabled prop correctly', () => {
      const wrapper = mount(Card, {
        props: {
          disabled: true
        }
      })
      expect(wrapper.classes()).toContain('ld-card--disabled')
    })
  })
  
  // TODO: 添加更多测试用例
})