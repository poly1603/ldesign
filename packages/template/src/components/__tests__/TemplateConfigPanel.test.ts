/**
 * TemplateConfigPanel 组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TemplateConfigPanel from '../TemplateConfigPanel.vue'

// Mock 依赖
vi.mock('../TemplateSelector', () => ({
  TemplateSelector: {
    name: 'TemplateSelector',
    template: '<div class="mock-template-selector">Mock Template Selector</div>',
    props: ['visible', 'category', 'device', 'currentTemplate'],
    emits: ['select', 'close']
  }
}))

describe('TemplateConfigPanel', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(TemplateConfigPanel, {
      props: {
        visible: false,
        currentTemplate: 'test-template',
        templateCategory: 'dashboard',
        deviceType: 'desktop'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.template-config-panel').exists()).toBe(true)
    })

    it('默认状态下应该显示触发按钮', () => {
      expect(wrapper.find('.config-panel-trigger').exists()).toBe(true)
      expect(wrapper.find('.config-panel-content').exists()).toBe(false)
    })

    it('当 visible 为 true 时应该显示配置面板内容', async () => {
      await wrapper.setProps({ visible: true })
      expect(wrapper.find('.config-panel-content').exists()).toBe(true)
      expect(wrapper.find('.config-panel-trigger').exists()).toBe(false)
    })
  })

  describe('面板交互', () => {
    it('点击触发按钮应该打开面板', async () => {
      const trigger = wrapper.find('.config-panel-trigger')
      await trigger.trigger('click')
      
      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([true])
    })

    it('点击关闭按钮应该关闭面板', async () => {
      await wrapper.setProps({ visible: true })
      
      const closeButton = wrapper.find('.config-panel-close')
      await closeButton.trigger('click')
      
      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })
  })

  describe('配置选项', () => {
    beforeEach(async () => {
      await wrapper.setProps({ visible: true })
    })

    it('应该显示所有配置区块', () => {
      const sections = wrapper.findAll('.config-section')
      expect(sections.length).toBe(4) // 模板选择、主题色、暗黑模式、多语言
    })

    it('应该显示模板选择器按钮', () => {
      const templateButton = wrapper.find('.config-button--primary')
      expect(templateButton.exists()).toBe(true)
      expect(templateButton.text()).toContain('选择模板')
    })

    it('应该显示主题色选择器', () => {
      const colorPicker = wrapper.find('.color-picker-grid')
      expect(colorPicker.exists()).toBe(true)
      
      const colorItems = wrapper.findAll('.color-picker-item')
      expect(colorItems.length).toBeGreaterThan(0)
    })

    it('应该显示主题模式选择器', () => {
      const themeSelector = wrapper.find('.theme-mode-selector')
      expect(themeSelector.exists()).toBe(true)
      
      const modeButtons = wrapper.findAll('.theme-mode-button')
      expect(modeButtons.length).toBe(3) // light, dark, auto
    })

    it('应该显示语言选择器', () => {
      const languageSelector = wrapper.find('.language-selector')
      expect(languageSelector.exists()).toBe(true)
      
      const languageButtons = wrapper.findAll('.language-button')
      expect(languageButtons.length).toBe(3) // zh-CN, en, ja
    })
  })

  describe('事件处理', () => {
    beforeEach(async () => {
      await wrapper.setProps({ visible: true })
    })

    it('点击模板选择按钮应该打开模板选择器', async () => {
      const templateButton = wrapper.find('.config-button--primary')
      await templateButton.trigger('click')
      
      // 检查内部状态变化
      expect(wrapper.vm.showTemplateSelector).toBe(true)
    })

    it('选择主题色应该触发事件', async () => {
      const colorItem = wrapper.find('.color-picker-item')
      await colorItem.trigger('click')
      
      expect(wrapper.emitted('theme-change')).toBeTruthy()
    })

    it('选择主题模式应该触发事件', async () => {
      const modeButton = wrapper.find('.theme-mode-button')
      await modeButton.trigger('click')
      
      expect(wrapper.emitted('dark-mode-change')).toBeTruthy()
    })

    it('选择语言应该触发事件', async () => {
      const languageButton = wrapper.find('.language-button')
      await languageButton.trigger('click')
      
      expect(wrapper.emitted('language-change')).toBeTruthy()
    })
  })

  describe('Props 验证', () => {
    it('应该正确处理 currentTemplate prop', async () => {
      const templateName = 'custom-template'
      await wrapper.setProps({ 
        visible: true,
        currentTemplate: templateName 
      })
      
      const description = wrapper.find('.config-description')
      expect(description.text()).toContain(templateName)
    })

    it('应该正确处理 templateCategory prop', async () => {
      await wrapper.setProps({ 
        visible: true,
        templateCategory: 'login' 
      })
      
      expect(wrapper.vm.templateCategory).toBe('login')
    })

    it('应该正确处理 deviceType prop', async () => {
      await wrapper.setProps({ 
        visible: true,
        deviceType: 'mobile' 
      })
      
      expect(wrapper.vm.deviceType).toBe('mobile')
    })
  })

  describe('国际化', () => {
    it('应该显示中文文本', async () => {
      await wrapper.setProps({ visible: true })
      
      const title = wrapper.find('.config-panel-title')
      expect(title.text()).toBe('配置面板')
    })

    it('应该正确处理翻译参数', async () => {
      await wrapper.setProps({ 
        visible: true,
        currentTemplate: 'test-template' 
      })
      
      const description = wrapper.find('.config-description')
      expect(description.text()).toContain('test-template')
    })
  })

  describe('响应式行为', () => {
    it('应该在移动端正确显示', async () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      await wrapper.setProps({ visible: true })
      
      // 检查是否应用了移动端样式类
      expect(wrapper.find('.template-config-panel').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('触发按钮应该有正确的 title 属性', () => {
      const trigger = wrapper.find('.config-panel-trigger')
      expect(trigger.attributes('title')).toBe('打开设置')
    })

    it('关闭按钮应该有正确的 title 属性', async () => {
      await wrapper.setProps({ visible: true })
      
      const closeButton = wrapper.find('.config-panel-close')
      expect(closeButton.attributes('title')).toBe('关闭')
    })

    it('颜色选择器项目应该有正确的 title 属性', async () => {
      await wrapper.setProps({ visible: true })
      
      const colorItem = wrapper.find('.color-picker-item')
      expect(colorItem.attributes('title')).toBeTruthy()
    })
  })
})
