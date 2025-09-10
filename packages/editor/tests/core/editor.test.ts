/**
 * 编辑器核心功能测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LDesignEditor } from '@/core/editor'
import { createMockElement } from '../setup'

describe('LDesignEditor', () => {
  let container: HTMLElement
  let editor: LDesignEditor

  beforeEach(() => {
    container = createMockElement('div')
    container.id = 'test-editor'
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (editor && !editor.destroyed) {
      editor.destroy()
    }
    document.body.innerHTML = ''
  })

  describe('构造函数', () => {
    it('应该能够创建编辑器实例', () => {
      editor = new LDesignEditor({
        container: container
      })

      expect(editor).toBeInstanceOf(LDesignEditor)
      expect(editor.initialized).toBe(false)
      expect(editor.destroyed).toBe(false)
    })

    it('应该能够通过选择器创建编辑器', () => {
      editor = new LDesignEditor({
        container: '#test-editor'
      })

      expect(editor).toBeInstanceOf(LDesignEditor)
    })

    it('当容器不存在时应该抛出错误', () => {
      expect(() => {
        new LDesignEditor({
          container: '#non-existent'
        })
      }).toThrow('Container element not found')
    })

    it('应该正确设置默认选项', () => {
      editor = new LDesignEditor({
        container: container
      })

      expect(editor.state.content).toBe('')
      expect(editor.state.readonly).toBe(false)
    })

    it('应该正确设置自定义选项', () => {
      editor = new LDesignEditor({
        container: container,
        content: '<p>Hello World</p>',
        readonly: true,
        placeholder: 'Enter text...'
      })

      expect(editor.state.readonly).toBe(true)
    })
  })

  describe('初始化', () => {
    beforeEach(() => {
      editor = new LDesignEditor({
        container: container
      })
    })

    it('应该能够初始化编辑器', () => {
      editor.init()

      expect(editor.initialized).toBe(true)
      expect(editor.destroyed).toBe(false)
    })

    it('重复初始化应该发出警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      editor.init()
      editor.init()

      expect(consoleSpy).toHaveBeenCalledWith('Editor is already initialized')
      consoleSpy.mockRestore()
    })

    it('初始化后应该设置默认主题', () => {
      editor.init()

      expect(editor.themes.getCurrentTheme()).toBe('default')
    })

    it('初始化后应该加载插件', () => {
      const loadPluginsSpy = vi.spyOn(editor.plugins, 'loadPlugins').mockImplementation(() => {})
      
      editor.init()

      expect(loadPluginsSpy).toHaveBeenCalled()
      loadPluginsSpy.mockRestore()
    })
  })

  describe('内容管理', () => {
    beforeEach(() => {
      editor = new LDesignEditor({
        container: container
      })
      editor.init()
    })

    it('应该能够设置内容', () => {
      const content = '<p>Hello World</p>'
      editor.setContent(content)

      expect(editor.getContent()).toContain('Hello World')
    })

    it('应该能够获取内容', () => {
      const content = '<p>Test content</p>'
      editor.setContent(content)

      const retrievedContent = editor.getContent()
      expect(retrievedContent).toContain('Test content')
    })

    it('应该能够清空内容', () => {
      editor.setContent('<p>Some content</p>')
      editor.clear()

      const content = editor.getContent()
      expect(content.trim()).toBe('')
    })

    it('应该能够插入内容', () => {
      editor.setContent('<p>Hello</p>')
      editor.insertContent(' World')

      const content = editor.getContent()
      expect(content).toContain('Hello')
      expect(content).toContain('World')
    })
  })

  describe('状态管理', () => {
    beforeEach(() => {
      editor = new LDesignEditor({
        container: container
      })
      editor.init()
    })

    it('应该能够获取编辑器状态', () => {
      const state = editor.state

      expect(state).toHaveProperty('content')
      expect(state).toHaveProperty('readonly')
      expect(state).toHaveProperty('deviceType')
    })

    it('应该能够设置只读模式', () => {
      editor.setReadonly(true)

      expect(editor.state.readonly).toBe(true)
    })

    it('应该能够取消只读模式', () => {
      editor.setReadonly(true)
      editor.setReadonly(false)

      expect(editor.state.readonly).toBe(false)
    })
  })

  describe('事件系统', () => {
    beforeEach(() => {
      editor = new LDesignEditor({
        container: container
      })
      editor.init()
    })

    it('应该能够监听事件', () => {
      const listener = vi.fn()
      editor.events.on('contentChange', listener)

      editor.setContent('<p>New content</p>')

      expect(listener).toHaveBeenCalled()
    })

    it('应该能够移除事件监听器', () => {
      const listener = vi.fn()
      editor.events.on('contentChange', listener)
      editor.events.off('contentChange', listener)

      editor.setContent('<p>New content</p>')

      expect(listener).not.toHaveBeenCalled()
    })

    it('应该在初始化时触发 init 事件', () => {
      const listener = vi.fn()
      
      const newEditor = new LDesignEditor({
        container: createMockElement()
      })
      
      newEditor.events.on('init', listener)
      newEditor.init()

      expect(listener).toHaveBeenCalled()
      
      newEditor.destroy()
    })
  })

  describe('命令系统', () => {
    beforeEach(() => {
      editor = new LDesignEditor({
        container: container
      })
      editor.init()
    })

    it('应该能够执行命令', () => {
      const result = editor.commands.execute('bold')

      expect(result).toHaveProperty('success')
    })

    it('应该能够检查命令是否可执行', () => {
      const canExecute = editor.commands.canExecute('bold')

      expect(typeof canExecute).toBe('boolean')
    })

    it('应该能够检查命令是否激活', () => {
      const isActive = editor.commands.isActive('bold')

      expect(typeof isActive).toBe('boolean')
    })
  })

  describe('插件系统', () => {
    beforeEach(() => {
      editor = new LDesignEditor({
        container: container
      })
      editor.init()
    })

    it('应该能够获取插件列表', () => {
      const plugins = editor.plugins.getPlugins()

      expect(Array.isArray(plugins)).toBe(true)
    })

    it('应该能够检查插件是否启用', () => {
      const isEnabled = editor.plugins.isPluginEnabled('bold')

      expect(typeof isEnabled).toBe('boolean')
    })

    it('应该能够启用插件', () => {
      editor.plugins.enablePlugin('bold')

      expect(editor.plugins.isPluginEnabled('bold')).toBe(true)
    })

    it('应该能够禁用插件', () => {
      editor.plugins.enablePlugin('bold')
      editor.plugins.disablePlugin('bold')

      expect(editor.plugins.isPluginEnabled('bold')).toBe(false)
    })
  })

  describe('主题系统', () => {
    beforeEach(() => {
      editor = new LDesignEditor({
        container: container
      })
      editor.init()
    })

    it('应该能够设置主题', () => {
      editor.themes.setTheme('dark')

      expect(editor.themes.getCurrentTheme()).toBe('dark')
    })

    it('应该能够获取所有主题', () => {
      const themes = editor.themes.getAllThemes()

      expect(Array.isArray(themes)).toBe(true)
      expect(themes.length).toBeGreaterThan(0)
    })
  })

  describe('响应式系统', () => {
    beforeEach(() => {
      editor = new LDesignEditor({
        container: container
      })
      editor.init()
    })

    it('应该能够获取当前设备类型', () => {
      const deviceType = editor.responsive.getCurrentDevice()

      expect(['mobile', 'tablet', 'desktop']).toContain(deviceType)
    })

    it('应该能够检查设备类型', () => {
      expect(typeof editor.responsive.isMobile()).toBe('boolean')
      expect(typeof editor.responsive.isTablet()).toBe('boolean')
      expect(typeof editor.responsive.isDesktop()).toBe('boolean')
    })
  })

  describe('销毁', () => {
    beforeEach(() => {
      editor = new LDesignEditor({
        container: container
      })
      editor.init()
    })

    it('应该能够销毁编辑器', () => {
      editor.destroy()

      expect(editor.destroyed).toBe(true)
      expect(editor.initialized).toBe(false)
    })

    it('重复销毁应该发出警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      editor.destroy()
      editor.destroy()

      expect(consoleSpy).toHaveBeenCalledWith('Editor is already destroyed')
      consoleSpy.mockRestore()
    })

    it('销毁后应该清理所有管理器', () => {
      const destroySpies = [
        vi.spyOn(editor.commands, 'destroy'),
        vi.spyOn(editor.selection, 'destroy'),
        vi.spyOn(editor.events, 'destroy'),
        vi.spyOn(editor.plugins, 'destroy'),
        vi.spyOn(editor.themes, 'destroy'),
        vi.spyOn(editor.styles, 'destroy'),
        vi.spyOn(editor.responsive, 'destroy')
      ]

      editor.destroy()

      destroySpies.forEach(spy => {
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
      })
    })
  })
})
