// 原生 JavaScript API 测试

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createFormInstance, FormInstance } from '../vanilla'
import type { FormOptions } from '../types/form'

describe('Vanilla JavaScript API', () => {
  let container: HTMLElement
  let formOptions: FormOptions

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.id = 'test-form-container'
    document.body.appendChild(container)

    formOptions = {
      fields: [
        {
          name: 'username',
          title: '用户名',
          component: 'FormInput',
          required: true,
          rules: [{ type: 'required', message: '用户名不能为空' }],
        },
        {
          name: 'email',
          title: '邮箱',
          component: 'FormInput',
          type: 'email',
          rules: [{ type: 'email', message: '请输入有效的邮箱地址' }],
        },
      ],
    }
  })

  afterEach(() => {
    // 清理测试容器
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('createFormInstance', () => {
    it('应该创建表单实例', () => {
      const instance = createFormInstance({
        container: '#test-form-container',
        options: formOptions,
      })

      expect(instance).toBeInstanceOf(FormInstance)
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('应该支持传入 DOM 元素', () => {
      const instance = createFormInstance({
        container,
        options: formOptions,
      })

      expect(instance).toBeInstanceOf(FormInstance)
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('应该支持事件回调', () => {
      let submitData: any = null
      let changeData: any = null

      const instance = createFormInstance({
        container,
        options: formOptions,
        onSubmit: data => {
          submitData = data
        },
        onChange: data => {
          changeData = data
        },
      })

      // 模拟表单提交
      instance.setFieldValue('username', 'testuser')
      instance.setFieldValue('email', 'test@example.com')
      instance.submit()

      expect(changeData).toBeTruthy()
      expect(submitData).toEqual({
        username: 'testuser',
        email: 'test@example.com',
      })
    })
  })

  describe('FormInstance', () => {
    let instance: FormInstance

    beforeEach(() => {
      instance = createFormInstance({
        container,
        options: formOptions,
      })
    })

    describe('数据操作', () => {
      it('应该设置和获取字段值', () => {
        instance.setFieldValue('username', 'testuser')
        expect(instance.getFieldValue('username')).toBe('testuser')
      })

      it('应该设置和获取表单数据', () => {
        const data = {
          username: 'testuser',
          email: 'test@example.com',
        }

        instance.setFormData(data)
        expect(instance.getFormData()).toEqual(data)
      })

      it('应该重置表单数据', () => {
        instance.setFieldValue('username', 'testuser')
        instance.setFieldValue('email', 'test@example.com')

        instance.reset()

        expect(instance.getFormData()).toEqual({})
      })

      it('应该清空表单数据', () => {
        instance.setFieldValue('username', 'testuser')
        instance.clear()

        expect(instance.getFormData()).toEqual({})
      })
    })

    describe('验证功能', () => {
      it('应该验证整个表单', async () => {
        // 设置无效数据
        instance.setFieldValue('username', '')
        instance.setFieldValue('email', 'invalid-email')

        const result = await instance.validate()
        expect(result).toBe(false)

        const errors = instance.getErrors()
        expect(Object.keys(errors)).toContain('username')
        expect(Object.keys(errors)).toContain('email')
      })

      it('应该验证单个字段', async () => {
        const result = await instance.validateField('username', '')
        expect(result).toBe(false)

        const errors = instance.getFieldErrors('username')
        expect(errors).toContain('用户名不能为空')
      })

      it('应该清空验证错误', () => {
        instance.setFieldValue('username', '')
        instance.validateField('username', '')

        instance.clearValidation()
        expect(instance.getErrors()).toEqual({})
      })

      it('应该清空单个字段的验证错误', async () => {
        await instance.validateField('username', '')
        expect(instance.getFieldErrors('username').length).toBeGreaterThan(0)

        instance.clearFieldValidation('username')
        expect(instance.getFieldErrors('username')).toEqual([])
      })
    })

    describe('状态管理', () => {
      it('应该获取表单状态', () => {
        const state = instance.getFormState()
        expect(state).toHaveProperty('valid')
        expect(state).toHaveProperty('dirty')
        expect(state).toHaveProperty('touched')
      })

      it('应该检查表单是否有效', async () => {
        // 设置有效数据
        instance.setFieldValue('username', 'testuser')
        instance.setFieldValue('email', 'test@example.com')

        await instance.validate()
        expect(instance.isValid()).toBe(true)
      })

      it('应该检查表单是否已修改', () => {
        expect(instance.isDirty()).toBe(false)

        instance.setFieldValue('username', 'testuser')
        expect(instance.isDirty()).toBe(true)
      })

      it('应该检查字段是否已访问', () => {
        expect(instance.isFieldTouched('username')).toBe(false)

        instance.touchField('username')
        expect(instance.isFieldTouched('username')).toBe(true)
      })
    })

    describe('字段操作', () => {
      it('应该显示和隐藏字段', () => {
        instance.showField('username')
        expect(instance.isFieldVisible('username')).toBe(true)

        instance.hideField('username')
        expect(instance.isFieldVisible('username')).toBe(false)
      })

      it('应该启用和禁用字段', () => {
        instance.enableField('username')
        expect(instance.isFieldDisabled('username')).toBe(false)

        instance.disableField('username')
        expect(instance.isFieldDisabled('username')).toBe(true)
      })

      it('应该设置字段为只读', () => {
        instance.setFieldReadonly('username', true)
        expect(instance.isFieldReadonly('username')).toBe(true)

        instance.setFieldReadonly('username', false)
        expect(instance.isFieldReadonly('username')).toBe(false)
      })
    })

    describe('事件系统', () => {
      it('应该监听和触发事件', () => {
        let eventTriggered = false
        let eventData: any = null

        instance.on('fieldChange', data => {
          eventTriggered = true
          eventData = data
        })

        instance.setFieldValue('username', 'testuser')

        expect(eventTriggered).toBe(true)
        expect(eventData).toEqual({
          field: 'username',
          value: 'testuser',
          formData: expect.any(Object),
        })
      })

      it('应该移除事件监听器', () => {
        let eventTriggered = false

        const handler = () => {
          eventTriggered = true
        }

        instance.on('fieldChange', handler)
        instance.off('fieldChange', handler)

        instance.setFieldValue('username', 'testuser')

        expect(eventTriggered).toBe(false)
      })

      it('应该支持一次性事件监听', () => {
        let triggerCount = 0

        instance.once('fieldChange', () => {
          triggerCount++
        })

        instance.setFieldValue('username', 'test1')
        instance.setFieldValue('username', 'test2')

        expect(triggerCount).toBe(1)
      })
    })

    describe('表单提交', () => {
      it('应该提交表单', async () => {
        let submitData: any = null

        instance.on('submit', data => {
          submitData = data
        })

        instance.setFieldValue('username', 'testuser')
        instance.setFieldValue('email', 'test@example.com')

        const result = await instance.submit()
        expect(result).toBe(true)
        expect(submitData).toEqual({
          username: 'testuser',
          email: 'test@example.com',
        })
      })

      it('应该在验证失败时阻止提交', async () => {
        let submitTriggered = false

        instance.on('submit', () => {
          submitTriggered = true
        })

        // 设置无效数据
        instance.setFieldValue('username', '')

        const result = await instance.submit()
        expect(result).toBe(false)
        expect(submitTriggered).toBe(false)
      })
    })

    describe('销毁功能', () => {
      it('应该销毁表单实例', () => {
        const childrenCount = container.children.length

        instance.destroy()

        expect(container.children.length).toBeLessThan(childrenCount)
      })
    })

    describe('配置更新', () => {
      it('应该更新表单配置', () => {
        const newOptions = {
          ...formOptions,
          fields: [
            ...formOptions.fields,
            {
              name: 'phone',
              title: '手机号',
              component: 'FormInput',
              type: 'tel',
            },
          ],
        }

        instance.updateOptions(newOptions)

        // 检查新字段是否存在
        expect(instance.getFieldValue('phone')).toBeDefined()
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的容器', () => {
      expect(() => {
        createFormInstance({
          container: '#non-existent-container',
          options: formOptions,
        })
      }).toThrow()
    })

    it('应该处理无效的字段操作', () => {
      const instance = createFormInstance({
        container,
        options: formOptions,
      })

      // 操作不存在的字段不应该抛出错误
      expect(() => {
        instance.setFieldValue('nonexistent', 'value')
        instance.getFieldValue('nonexistent')
        instance.validateField('nonexistent', 'value')
      }).not.toThrow()
    })
  })
})
