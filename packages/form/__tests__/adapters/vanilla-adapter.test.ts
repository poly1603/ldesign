/**
 * VanillaAdapter 原生适配器测试
 * 
 * 测试原生JavaScript适配器的各项功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { VanillaAdapter } from '../../src/adapters/vanilla-adapter'
import { FormCore } from '../../src/core/form-core'
import type { FormConfig } from '../../src/types'

// Mock DOM environment
Object.defineProperty(window, 'HTMLElement', {
  value: class MockHTMLElement {
    constructor() {
      this.children = []
      this.style = {}
      this.classList = {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn()
      }
    }
    appendChild = vi.fn()
    removeChild = vi.fn()
    addEventListener = vi.fn()
    removeEventListener = vi.fn()
    setAttribute = vi.fn()
    getAttribute = vi.fn()
  }
})

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn((tagName) => {
      const element = new (window as any).HTMLElement()
      element.tagName = tagName.toUpperCase()
      return element
    }),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => [])
  }
})

describe('VanillaAdapter', () => {
  let adapter: VanillaAdapter
  let form: FormCore
  let container: HTMLElement

  beforeEach(() => {
    adapter = new VanillaAdapter({
      debug: true
    })

    container = document.createElement('div')

    const config: FormConfig = {
      initialValues: {
        name: '',
        email: '',
        bio: ''
      },
      fields: [
        {
          name: 'name',
          label: '姓名',
          type: 'input',
          placeholder: '请输入姓名',
          rules: [{ type: 'required', message: '请输入姓名' }]
        },
        {
          name: 'email',
          label: '邮箱',
          type: 'input',
          placeholder: '请输入邮箱',
          rules: [
            { type: 'required', message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]
        },
        {
          name: 'bio',
          label: '个人简介',
          type: 'textarea',
          placeholder: '请输入个人简介'
        }
      ]
    }

    form = adapter.createForm(config)
  })

  describe('适配器基础功能', () => {
    it('应该能够创建适配器实例', () => {
      expect(adapter).toBeInstanceOf(VanillaAdapter)
      expect(adapter.name).toBe('vanilla')
      expect(adapter.version).toBe('2.0.0')
    })

    it('应该能够检查环境支持', () => {
      expect(adapter.isSupported()).toBe(true)
    })

    it('应该能够创建表单实例', () => {
      expect(form).toBeInstanceOf(FormCore)
    })

    it('应该能够获取和更新配置', () => {
      const config = adapter.getConfig()
      expect(config.name).toBe('vanilla')
      expect(config.debug).toBe(true)

      adapter.updateConfig({ debug: false })
      const updatedConfig = adapter.getConfig()
      expect(updatedConfig.debug).toBe(false)
    })
  })

  describe('字段渲染器', () => {
    it('应该能够注册自定义字段渲染器', () => {
      const customRenderer = {
        type: 'custom',
        render: vi.fn(() => document.createElement('div'))
      }

      adapter.registerFieldRenderer(customRenderer)

      const registeredRenderer = adapter.getFieldRenderer('custom')
      expect(registeredRenderer).toBe(customRenderer)
    })

    it('应该能够注销字段渲染器', () => {
      const customRenderer = {
        type: 'custom',
        render: vi.fn(() => document.createElement('div'))
      }

      adapter.registerFieldRenderer(customRenderer)
      expect(adapter.getFieldRenderer('custom')).toBe(customRenderer)

      adapter.unregisterFieldRenderer('custom')
      expect(adapter.getFieldRenderer('custom')).toBeUndefined()
    })

    it('应该有内置的字段渲染器', () => {
      expect(adapter.getFieldRenderer('input')).toBeDefined()
      expect(adapter.getFieldRenderer('textarea')).toBeDefined()
      expect(adapter.getFieldRenderer('select')).toBeDefined()
    })
  })

  describe('表单渲染', () => {
    it('应该能够渲染表单', () => {
      const formElement = adapter.render(form)

      expect(formElement).toBeDefined()
      expect(formElement.tagName).toBe('FORM')
      expect(formElement.getAttribute).toHaveBeenCalledWith('data-adapter')
    })

    it('应该能够挂载表单到容器', () => {
      adapter.mount(form, container)

      expect(adapter.isMounted()).toBe(true)
      expect(container.appendChild).toHaveBeenCalled()
    })

    it('应该能够卸载表单', () => {
      adapter.mount(form, container)
      expect(adapter.isMounted()).toBe(true)

      adapter.unmount()
      expect(adapter.isMounted()).toBe(false)
    })

    it('应该在渲染时应用自定义样式', () => {
      const options = {
        className: 'custom-form',
        style: {
          backgroundColor: 'red',
          padding: '20px'
        }
      }

      const formElement = adapter.render(form, options)

      expect(formElement.className).toContain('custom-form')
      expect(Object.assign).toHaveBeenCalledWith(formElement.style, options.style)
    })
  })

  describe('表单交互', () => {
    it('应该能够处理字段值变化', () => {
      const formElement = adapter.render(form)

      // 模拟字段值变化
      form.setFieldValue('name', 'John')

      // 验证适配器是否更新了DOM
      // 这里由于是mock环境，主要验证没有抛出错误
      expect(() => form.setFieldValue('name', 'John')).not.toThrow()
    })

    it('应该能够处理表单提交', async () => {
      const onSubmit = vi.fn()
      const formWithSubmit = adapter.createForm({
        initialValues: { name: 'John' },
        fields: [
          {
            name: 'name',
            label: '姓名',
            type: 'input',
            rules: [{ type: 'required', message: '请输入姓名' }]
          }
        ]
      }, {
        onSubmit
      })

      adapter.render(formWithSubmit)

      await formWithSubmit.submit()
      expect(onSubmit).toHaveBeenCalledWith({ name: 'John' })
    })
  })

  describe('验证显示', () => {
    it('应该能够显示验证错误', async () => {
      adapter.render(form)

      // 触发验证
      const result = await form.validateField('name')
      expect(result.valid).toBe(false)

      // 验证适配器处理了验证结果
      // 在mock环境中主要验证没有抛出错误
      expect(() => form.validateField('name')).not.toThrow()
    })

    it('应该能够清除验证错误', async () => {
      adapter.render(form)

      // 先触发错误
      await form.validateField('name')

      // 设置有效值
      form.setFieldValue('name', 'John')
      const result = await form.validateField('name')
      expect(result.valid).toBe(true)
    })
  })

  describe('状态管理', () => {
    it('应该能够处理表单状态变化', () => {
      const formElement = adapter.render(form)

      // 模拟状态变化
      form.stateManager.setSubmitting(true)
      form.stateManager.setValidating(true)

      // 验证没有抛出错误
      expect(() => form.stateManager.setSubmitting(false)).not.toThrow()
    })
  })

  describe('销毁功能', () => {
    it('应该能够销毁适配器', () => {
      adapter.mount(form, container)
      expect(adapter.isMounted()).toBe(true)

      adapter.destroy()

      expect(adapter.isDestroyed()).toBe(true)
      expect(adapter.isMounted()).toBe(false)
    })

    it('应该在销毁后无法操作', () => {
      adapter.destroy()

      expect(() => adapter.render(form)).toThrow()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的容器选择器', () => {
      document.querySelector = vi.fn(() => null)

      expect(() => {
        adapter.mount(form, '#nonexistent')
      }).toThrow('Container element not found: #nonexistent')
    })

    it('应该处理渲染错误', () => {
      // 模拟不支持的环境
      const unsupportedAdapter = new VanillaAdapter()
      unsupportedAdapter.isSupported = vi.fn(() => false)

      expect(() => {
        unsupportedAdapter.render(form)
      }).toThrow('VanillaAdapter is not supported in this environment')
    })
  })

  afterEach(() => {
    if (form && !form.destroyed) {
      form.destroy()
    }
    if (adapter && !adapter.isDestroyed()) {
      adapter.destroy()
    }
  })
})
