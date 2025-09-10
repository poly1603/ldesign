/**
 * 编辑器基础功能测试
 * 简化版测试，专注于核心功能验证
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { LDesignEditor } from '@/core/editor'
import { createMockElement } from '../setup'

describe('LDesignEditor - 基础功能', () => {
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

    it('当容器不存在时应该抛出错误', () => {
      expect(() => {
        new LDesignEditor({
          container: '#non-existent'
        })
      }).toThrow('Container element not found')
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

    it('应该初始化所有管理器', () => {
      editor.init()

      expect(editor.events).toBeDefined()
      expect(editor.selection).toBeDefined()
      expect(editor.commands).toBeDefined()
      expect(editor.plugins).toBeDefined()
      expect(editor.styles).toBeDefined()
      expect(editor.themes).toBeDefined()
      expect(editor.responsive).toBeDefined()
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
  })

  describe('主题系统', () => {
    beforeEach(() => {
      editor = new LDesignEditor({
        container: container
      })
      editor.init()
    })

    it('应该能够获取所有主题', () => {
      const themes = editor.themes.getAllThemes()

      expect(Array.isArray(themes)).toBe(true)
      expect(themes.length).toBeGreaterThan(0)
    })

    it('应该能够设置主题', () => {
      editor.themes.setTheme('dark')

      expect(editor.themes.getCurrentTheme()).toBe('dark')
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
  })
})
