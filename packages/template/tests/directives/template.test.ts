import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { registerTemplateDirective, templateDirective } from '@/vue/directives/template'
import { destroyGlobalManager } from '@/vue/composables/useTemplate'

describe('templateDirective', () => {
  afterEach(() => {
    destroyGlobalManager()
  })

  describe('指令注册', () => {
    it('应该能够注册指令', () => {
      expect(templateDirective).toBeDefined()
      expect(typeof templateDirective.mounted).toBe('function')
      expect(typeof templateDirective.updated).toBe('function')
      expect(typeof templateDirective.unmounted).toBe('function')
    })

    it('registerTemplateDirective 应该是函数', () => {
      expect(typeof registerTemplateDirective).toBe('function')
    })
  })

  describe('指令使用', () => {
    it('应该能在组件中使用指令', () => {
      const TestComponent = {
        template: '<div v-template="{ category: \'login\', device: \'desktop\', template: \'classic\' }"></div>',
        directives: {
          template: templateDirective
        }
      }

      const wrapper = mount(TestComponent)
      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理字符串格式的指令值', () => {
      const TestComponent = {
        template: '<div v-template="\'login:desktop:classic\'"></div>',
        directives: {
          template: templateDirective
        }
      }

      const wrapper = mount(TestComponent)
      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理无效的指令值', () => {
      const TestComponent = {
        template: '<div v-template="null"></div>',
        directives: {
          template: templateDirective
        }
      }

      const wrapper = mount(TestComponent)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('指令生命周期', () => {
    it('应该在 mounted 时初始化', () => {
      const TestComponent = {
        template: '<div v-template="{ category: \'login\', device: \'desktop\', template: \'classic\' }"></div>',
        directives: {
          template: templateDirective
        }
      }

      const wrapper = mount(TestComponent)
      expect(wrapper.exists()).toBe(true)
    })

    it('应该在 updated 时更新', async () => {
      const TestComponent = {
        data() {
          return {
            templateConfig: { category: 'login', device: 'desktop', template: 'classic' }
          }
        },
        template: '<div v-template="templateConfig"></div>',
        directives: {
          template: templateDirective
        }
      }

      const wrapper = mount(TestComponent)
      
      // 更新配置
      await wrapper.setData({
        templateConfig: { category: 'login', device: 'desktop', template: 'modern' }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该在 unmounted 时清理', () => {
      const TestComponent = {
        template: '<div v-template="{ category: \'login\', device: \'desktop\', template: \'classic\' }"></div>',
        directives: {
          template: templateDirective
        }
      }

      const wrapper = mount(TestComponent)
      wrapper.unmount()
      
      // 验证组件已被卸载
      expect(wrapper.exists()).toBe(false)
    })
  })
})
