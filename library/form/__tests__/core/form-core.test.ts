/**
 * FormCore 核心测试
 * 
 * 测试表单核心引擎的各项功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FormCore } from '../../src/core/form-core'
import type { FormConfig, FormEventCallbacks } from '../../src/types'

describe('FormCore', () => {
  let form: FormCore
  let mockCallbacks: FormEventCallbacks

  beforeEach(() => {
    mockCallbacks = {
      onSubmit: vi.fn(),
      onFieldChange: vi.fn(),
      onValuesChange: vi.fn(),
      onReset: vi.fn()
    }
  })

  describe('基础功能', () => {
    it('应该能够创建表单实例', () => {
      const config: FormConfig = {
        initialValues: { name: '', email: '' }
      }

      form = new FormCore(config, mockCallbacks)

      expect(form).toBeInstanceOf(FormCore)
      expect(form.id).toBeDefined()
      expect(form.config).toEqual(config)
    })

    it('应该能够设置和获取表单数据', () => {
      const config: FormConfig = {
        initialValues: { name: '', email: '' }
      }

      form = new FormCore(config)

      // 测试初始数据
      expect(form.getData()).toEqual({ name: '', email: '' })

      // 测试设置数据
      form.setData({ name: 'John', email: 'john@example.com' })
      expect(form.getData()).toEqual({ name: 'John', email: 'john@example.com' })
    })

    it('应该能够设置和获取字段值', () => {
      const config: FormConfig = {
        initialValues: { name: '', email: '' }
      }

      form = new FormCore(config)

      // 测试设置字段值
      form.setFieldValue('name', 'John')
      expect(form.getFieldValue('name')).toBe('John')

      form.setFieldValue('email', 'john@example.com')
      expect(form.getFieldValue('email')).toBe('john@example.com')
    })

    it('应该能够获取表单状态', () => {
      const config: FormConfig = {
        initialValues: { name: '', email: '' }
      }

      form = new FormCore(config)

      const state = form.getState()
      expect(state).toHaveProperty('values')
      expect(state).toHaveProperty('errors')
      expect(state).toHaveProperty('touched')
      expect(state).toHaveProperty('dirty')
      expect(state).toHaveProperty('submitting')
      expect(state).toHaveProperty('validating')
      expect(state).toHaveProperty('valid')
    })
  })

  describe('事件系统', () => {
    it('应该在字段值变化时触发事件', () => {
      const config: FormConfig = {
        initialValues: { name: '' }
      }

      form = new FormCore(config, mockCallbacks)

      form.setFieldValue('name', 'John')

      expect(mockCallbacks.onFieldChange).toHaveBeenCalledWith(
        'name',
        'John',
        expect.any(Object)
      )
    })

    it('应该在表单数据变化时触发事件', () => {
      const config: FormConfig = {
        initialValues: { name: '', email: '' }
      }

      form = new FormCore(config, mockCallbacks)

      form.setData({ name: 'John', email: 'john@example.com' })

      expect(mockCallbacks.onValuesChange).toHaveBeenCalled()
    })

    it('应该在表单重置时触发事件', () => {
      const config: FormConfig = {
        initialValues: { name: '', email: '' }
      }

      form = new FormCore(config, mockCallbacks)

      // 先设置一些数据
      form.setData({ name: 'John', email: 'john@example.com' })

      // 然后重置
      form.reset()

      expect(mockCallbacks.onReset).toHaveBeenCalled()
      expect(form.getData()).toEqual({ name: '', email: '' })
    })
  })

  describe('字段管理', () => {
    it('应该能够注册字段', () => {
      const config: FormConfig = {
        initialValues: { name: '' },
        fields: [
          {
            name: 'name',
            label: '姓名',
            type: 'input',
            rules: [{ type: 'required', message: '请输入姓名' }]
          }
        ]
      }

      form = new FormCore(config)

      expect(form.fieldManager.hasField('name')).toBe(true)

      const fieldConfig = form.fieldManager.getFieldConfig('name')
      expect(fieldConfig).toBeDefined()
      expect(fieldConfig?.name).toBe('name')
      expect(fieldConfig?.label).toBe('姓名')
    })

    it('应该能够获取字段验证规则', () => {
      const config: FormConfig = {
        initialValues: { name: '' },
        fields: [
          {
            name: 'name',
            label: '姓名',
            type: 'input',
            rules: [
              { type: 'required', message: '请输入姓名' },
              { type: 'minLength', params: { min: 2 }, message: '至少2个字符' }
            ]
          }
        ]
      }

      form = new FormCore(config)

      const rules = form.fieldManager.getFieldValidationRules('name')
      expect(rules).toHaveLength(2)
      expect(rules[0].type).toBe('required')
      expect(rules[1].type).toBe('minLength')
    })
  })

  describe('验证功能', () => {
    it('应该能够验证单个字段', async () => {
      const config: FormConfig = {
        initialValues: { name: '' },
        fields: [
          {
            name: 'name',
            label: '姓名',
            type: 'input',
            rules: [{ type: 'required', message: '请输入姓名' }]
          }
        ]
      }

      form = new FormCore(config)

      // 测试空值验证
      const result1 = await form.validateField('name')
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('请输入姓名')

      // 设置值后再验证
      form.setFieldValue('name', 'John')
      const result2 = await form.validateField('name')
      expect(result2.valid).toBe(true)
    })

    it('应该能够验证整个表单', async () => {
      const config: FormConfig = {
        initialValues: { name: '', email: '' },
        fields: [
          {
            name: 'name',
            label: '姓名',
            type: 'input',
            rules: [{ type: 'required', message: '请输入姓名' }]
          },
          {
            name: 'email',
            label: '邮箱',
            type: 'input',
            rules: [
              { type: 'required', message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]
          }
        ]
      }

      form = new FormCore(config)

      // 测试空值验证
      const result1 = await form.validate()
      expect(result1.valid).toBe(false)
      expect(result1.fieldErrors).toHaveProperty('name')
      expect(result1.fieldErrors).toHaveProperty('email')

      // 设置有效值后再验证
      form.setData({ name: 'John', email: 'john@example.com' })
      const result2 = await form.validate()
      expect(result2.valid).toBe(true)
    })
  })

  describe('提交功能', () => {
    it('应该能够提交表单', async () => {
      const config: FormConfig = {
        initialValues: { name: 'John' },
        fields: [
          {
            name: 'name',
            label: '姓名',
            type: 'input',
            rules: [{ type: 'required', message: '请输入姓名' }]
          }
        ]
      }

      form = new FormCore(config, mockCallbacks)

      await form.submit()

      expect(mockCallbacks.onSubmit).toHaveBeenCalledWith({ name: 'John' })
    })

    it('应该在验证失败时不提交表单', async () => {
      const config: FormConfig = {
        initialValues: { name: '' },
        fields: [
          {
            name: 'name',
            label: '姓名',
            type: 'input',
            rules: [{ type: 'required', message: '请输入姓名' }]
          }
        ]
      }

      form = new FormCore(config, mockCallbacks)

      await form.submit()

      expect(mockCallbacks.onSubmit).not.toHaveBeenCalled()
      expect(mockCallbacks.onSubmitFailed).toHaveBeenCalled()
    })
  })

  describe('销毁功能', () => {
    it('应该能够销毁表单实例', () => {
      const config: FormConfig = {
        initialValues: { name: '' }
      }

      form = new FormCore(config)

      expect(() => form.destroy()).not.toThrow()

      // 销毁后应该无法操作
      expect(() => form.setFieldValue('name', 'John')).toThrow()
    })
  })

  afterEach(() => {
    if (form) {
      form.destroy()
    }
  })
})
