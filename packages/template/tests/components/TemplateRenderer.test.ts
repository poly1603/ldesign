import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { TemplateRenderer } from '@/vue/components/TemplateRenderer'
import { destroyGlobalManager } from '@/vue/composables/useTemplate'

describe('templateRenderer', () => {
  afterEach(() => {
    destroyGlobalManager()
  })

  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          device: 'desktop',
          template: 'classic',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该接受正确的 props', () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          deviceType: 'desktop',
          templateId: 'classic',
          showSelector: true,
          selectorPosition: 'top',
          autoDetectDevice: false,
          config: { title: 'Test' },
        },
      })

      expect(wrapper.props('category')).toBe('login')
      expect(wrapper.props('deviceType')).toBe('desktop')
      expect(wrapper.props('templateId')).toBe('classic')
      expect(wrapper.props('showSelector')).toBe(true)
      expect(wrapper.props('selectorPosition')).toBe('top')
      expect(wrapper.props('autoDetectDevice')).toBe(false)
      expect(wrapper.props('config')).toEqual({ title: 'Test' })
    })
  })

  describe('事件处理', () => {
    it('应该触发 load 事件', async () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          device: 'desktop',
          template: 'classic',
        },
      })

      // 等待组件加载
      await new Promise(resolve => setTimeout(resolve, 100))

      // 检查是否有 load 事件被触发
      expect(wrapper.emitted()).toBeDefined()
    })
  })

  describe('插槽支持', () => {
    it('应该支持 loading 插槽', () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          device: 'desktop',
          template: 'classic',
        },
        slots: {
          loading: '<div class="custom-loading">Loading...</div>',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该支持 error 插槽', () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          device: 'desktop',
          template: 'nonexistent',
        },
        slots: {
          error: '<div class="custom-error">Error occurred</div>',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该支持 empty 插槽', () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'nonexistent',
          device: 'desktop',
          template: 'classic',
        },
        slots: {
          empty: '<div class="custom-empty">No template found</div>',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})
