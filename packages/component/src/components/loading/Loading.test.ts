/**
 * Loading 组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Loading from './Loading.vue'

describe('Loading', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(Loading)
      expect(wrapper.classes()).toContain('ld-loading')
    })
    
    it('should render with custom class', () => {
      const wrapper = mount(Loading, {
        props: {
          class: 'custom-class'
        }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })
  
  describe('Props', () => {
    it('should handle size prop correctly', () => {
      const wrapper = mount(Loading, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('ld-loading--large')
    })
    
    it('should handle disabled prop correctly', () => {
      const wrapper = mount(Loading, {
        props: {
          disabled: true
        }
      })
      expect(wrapper.classes()).toContain('ld-loading--disabled')
    })
  })
  
  // TODO: 添加更多测试用例
})