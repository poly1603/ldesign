/**
 * TemplateRenderer 组件单元测试
 */

import type { TemplateManager } from '../../../src/core/manager'
import type { Template } from '../../../src/types'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import TemplateRenderer from '../../../src/components/TemplateRenderer.vue'

// Mock 模板管理器
vi.mock('../../../src/core/manager')

describe('templateRenderer', () => {
  let mockManager: TemplateManager
  let mockTemplates: Template[]

  beforeEach(() => {
    // 创建模拟模板数据
    mockTemplates = [
      {
        id: 'login-desktop-default',
        name: 'default',
        displayName: '默认登录',
        description: '默认登录模板',
        category: 'login',
        deviceType: 'desktop',
        version: '1.0.0',
        author: 'Test',
        tags: ['default'],
        path: 'src/templates/login/desktop/default',
        component: null,
        thumbnail: '',
        status: 'loaded',
        dependencies: [],
        props: {},
        isDefault: true,
        features: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'login-desktop-modern',
        name: 'modern',
        displayName: '现代登录',
        description: '现代风格登录模板',
        category: 'login',
        deviceType: 'desktop',
        version: '1.0.0',
        author: 'Test',
        tags: ['modern'],
        path: 'src/templates/login/desktop/modern',
        component: null,
        thumbnail: '',
        status: 'loaded',
        dependencies: [],
        props: {},
        isDefault: false,
        features: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Mock 模板管理器实例
    mockManager = {
      getCurrentDevice: vi.fn().mockReturnValue('desktop'),
      getTemplates: vi.fn().mockReturnValue(mockTemplates),
      render: vi.fn().mockResolvedValue({
        template: mockTemplates[0],
        component: { name: 'MockComponent' },
        loadTime: 100,
        fromCache: false,
      }),
      switchTemplate: vi.fn().mockResolvedValue({
        template: mockTemplates[1],
        component: { name: 'MockComponent' },
        loadTime: 50,
        fromCache: true,
      }),
      on: vi.fn(),
      off: vi.fn(),
    } as any

    // Mock useTemplateManager hook
    vi.doMock('../../../src/vue/composables/useTemplate', () => ({
      useTemplateManager: () => ({
        currentTemplate: { value: mockTemplates[0] },
        currentDevice: { value: 'desktop' },
        loading: { value: false },
        error: { value: null },
        availableTemplates: { value: mockTemplates },
        render: mockManager.render,
        switchTemplate: mockManager.switchTemplate,
        getTemplates: mockManager.getTemplates,
      }),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该渲染模板渲染器', () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
        },
      })

      expect(wrapper.find('.template-renderer').exists()).toBe(true)
    })

    it('应该显示加载状态', async () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          loading: true,
        },
      })

      expect(wrapper.find('.template-renderer__loading').exists()).toBe(true)
      expect(wrapper.text()).toContain('加载模板中')
    })

    it('应该显示错误状态', async () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
        },
      })

      // 模拟错误状态
      await wrapper.setData({ error: { value: new Error('Test error') } })
      await nextTick()

      expect(wrapper.find('.template-renderer__error').exists()).toBe(true)
      expect(wrapper.text()).toContain('模板加载失败')
    })

    it('应该显示空状态', async () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'nonexistent',
        },
      })

      // Mock 空模板列表
      mockManager.getTemplates = vi.fn().mockReturnValue([])

      await nextTick()

      expect(wrapper.find('.template-renderer__empty').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无可用模板')
    })
  })

  describe('属性处理', () => {
    it('应该接受必需的 category 属性', () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
        },
      })

      expect(wrapper.props('category')).toBe('login')
    })

    it('应该接受可选的 deviceType 属性', () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          deviceType: 'mobile',
        },
      })

      expect(wrapper.props('deviceType')).toBe('mobile')
    })

    it('应该接受模板属性', () => {
      const props = { title: 'Test Title', showLogo: true }
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          props,
        },
      })

      expect(wrapper.props('props')).toEqual(props)
    })

    it('应该接受选择器配置', () => {
      const selectorOptions = { showPreview: false, layout: 'list' as const }
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          selectorOptions,
        },
      })

      expect(wrapper.props('selectorOptions')).toEqual(selectorOptions)
    })
  })

  describe('选择器功能', () => {
    it('应该显示选择器按钮', () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          showSelectorButton: true,
        },
      })

      expect(wrapper.find('.template-renderer__selector-btn').exists()).toBe(true)
    })

    it('应该隐藏选择器按钮', () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          showSelectorButton: false,
        },
      })

      expect(wrapper.find('.template-renderer__selector-btn').exists()).toBe(false)
    })

    it('应该在只有一个模板时隐藏选择器按钮', () => {
      mockManager.getTemplates = vi.fn().mockReturnValue([mockTemplates[0]])

      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          showSelectorButton: true,
        },
      })

      expect(wrapper.find('.template-renderer__selector-btn').exists()).toBe(false)
    })

    it('应该点击按钮时显示选择器', async () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          showSelectorButton: true,
        },
      })

      const button = wrapper.find('.template-renderer__selector-btn')
      await button.trigger('click')

      expect(wrapper.find('template-selector-stub').exists()).toBe(true)
    })
  })

  describe('事件处理', () => {
    it('应该触发 error 事件', async () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
        },
      })

      const error = new Error('Test error')
      await wrapper.vm.$emit('error', error)

      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')![0]).toEqual([error])
    })

    it('应该触发 template-change 事件', async () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
        },
      })

      const template = mockTemplates[1]
      await wrapper.vm.$emit('template-change', template)

      expect(wrapper.emitted('template-change')).toBeTruthy()
      expect(wrapper.emitted('template-change')![0]).toEqual([template])
    })

    it('应该触发 template-loaded 事件', async () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
        },
      })

      const template = mockTemplates[0]
      await wrapper.vm.$emit('template-loaded', template)

      expect(wrapper.emitted('template-loaded')).toBeTruthy()
      expect(wrapper.emitted('template-loaded')![0]).toEqual([template])
    })
  })

  describe('响应式行为', () => {
    it('应该在 category 变化时重新渲染', async () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
        },
      })

      await wrapper.setProps({ category: 'dashboard' })

      expect(mockManager.render).toHaveBeenCalledWith(
        'dashboard',
        'desktop',
        undefined,
        {},
      )
    })

    it('应该在 deviceType 变化时重新渲染', async () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          deviceType: 'desktop',
        },
      })

      await wrapper.setProps({ deviceType: 'mobile' })

      expect(mockManager.render).toHaveBeenCalledWith(
        'login',
        'mobile',
        undefined,
        {},
      )
    })

    it('应该在 props 变化时重新渲染', async () => {
      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          props: { title: 'Old Title' },
        },
      })

      await wrapper.setProps({ props: { title: 'New Title' } })

      expect(mockManager.render).toHaveBeenCalledWith(
        'login',
        'desktop',
        undefined,
        { title: 'New Title' },
      )
    })
  })

  describe('调试模式', () => {
    it('应该在开发环境显示调试信息', () => {
      // Mock 开发环境
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
        },
      })

      expect(wrapper.find('.template-renderer__debug').exists()).toBe(true)

      // 恢复环境变量
      process.env.NODE_ENV = originalEnv
    })

    it('应该在生产环境隐藏调试信息', () => {
      // Mock 生产环境
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
        },
      })

      expect(wrapper.find('.template-renderer__debug').exists()).toBe(false)

      // 恢复环境变量
      process.env.NODE_ENV = originalEnv
    })
  })
})
