/**
 * FormEngine 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FormEngine } from '../FormEngine'
import type { FormConfig } from '../../types'

describe('FormEngine', () => {
  let formEngine: FormEngine
  let mockConfig: FormConfig

  beforeEach(() => {
    mockConfig = {
      fields: [
        {
          type: 'input',
          name: 'username',
          label: '用户名',
          component: 'input',
          required: true,
          rules: [
            { type: 'required', message: '用户名不能为空' },
            { type: 'minLength', value: 3, message: '用户名至少3个字符' }
          ]
        },
        {
          type: 'input',
          name: 'email',
          label: '邮箱',
          component: 'input',
          rules: [
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]
        },
        {
          type: 'select',
          name: 'gender',
          label: '性别',
          component: 'select',
          props: {
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' }
            ]
          }
        }
      ],
      layout: {
        type: 'grid',
        columns: 2,
        gap: 16
      },
      validation: {
        enabled: true,
        trigger: 'change'
      }
    }

    formEngine = new FormEngine(mockConfig)
  })

  describe('初始化', () => {
    it('应该正确创建FormEngine实例', () => {
      expect(formEngine).toBeInstanceOf(FormEngine)
      expect(formEngine.config).toEqual(mockConfig)
      expect(formEngine.isMounted).toBe(false)
      expect(formEngine.isDestroyed).toBe(false)
    })

    it('应该初始化所有子引擎', () => {
      expect(formEngine.stateManager).toBeDefined()
      expect(formEngine.validationEngine).toBeDefined()
      expect(formEngine.layoutEngine).toBeDefined()
      expect(formEngine.conditionEngine).toBeDefined()
      expect(formEngine.eventBus).toBeDefined()
    })
  })

  describe('生命周期', () => {
    it('应该正确挂载表单', () => {
      const mountSpy = vi.spyOn(formEngine.eventBus, 'emit')
      
      formEngine.mount()
      
      expect(formEngine.isMounted).toBe(true)
      expect(mountSpy).toHaveBeenCalledWith('form:mounted', expect.any(Object))
    })

    it('应该正确卸载表单', () => {
      formEngine.mount()
      const unmountSpy = vi.spyOn(formEngine.eventBus, 'emit')
      
      formEngine.unmount()
      
      expect(formEngine.isMounted).toBe(false)
      expect(unmountSpy).toHaveBeenCalledWith('form:unmounted', expect.any(Object))
    })

    it('应该正确销毁表单', () => {
      formEngine.mount()
      const destroySpy = vi.spyOn(formEngine.eventBus, 'emit')
      
      formEngine.destroy()
      
      expect(formEngine.isDestroyed).toBe(true)
      expect(formEngine.isMounted).toBe(false)
      expect(destroySpy).toHaveBeenCalledWith('form:destroyed', expect.any(Object))
    })

    it('重复挂载应该被忽略', () => {
      formEngine.mount()
      const mountSpy = vi.spyOn(formEngine.eventBus, 'emit')
      
      formEngine.mount()
      
      expect(mountSpy).not.toHaveBeenCalled()
    })

    it('销毁后的操作应该被忽略', () => {
      formEngine.destroy()
      const mountSpy = vi.spyOn(formEngine.eventBus, 'emit')
      
      formEngine.mount()
      
      expect(mountSpy).not.toHaveBeenCalled()
      expect(formEngine.isMounted).toBe(false)
    })
  })

  describe('配置更新', () => {
    it('应该正确更新配置', () => {
      const newConfig: FormConfig = {
        ...mockConfig,
        layout: {
          type: 'grid',
          columns: 3,
          gap: 20
        }
      }

      formEngine.updateConfig(newConfig)
      
      expect(formEngine.config).toEqual(newConfig)
    })

    it('更新配置应该触发相应事件', () => {
      const updateSpy = vi.spyOn(formEngine.eventBus, 'emit')
      const newConfig: FormConfig = {
        ...mockConfig,
        layout: {
          type: 'grid',
          columns: 3,
          gap: 20
        }
      }

      formEngine.updateConfig(newConfig)
      
      expect(updateSpy).toHaveBeenCalledWith('form:config-updated', expect.any(Object))
    })
  })

  describe('表单数据操作', () => {
    beforeEach(() => {
      formEngine.mount()
    })

    it('应该正确设置表单数据', () => {
      const formData = {
        username: 'testuser',
        email: 'test@example.com',
        gender: 'male'
      }

      formEngine.setFormData(formData)
      
      expect(formEngine.getFormData()).toEqual(formData)
    })

    it('应该正确获取字段值', () => {
      formEngine.setFormData({
        username: 'testuser',
        email: 'test@example.com'
      })

      expect(formEngine.getFieldValue('username')).toBe('testuser')
      expect(formEngine.getFieldValue('email')).toBe('test@example.com')
      expect(formEngine.getFieldValue('nonexistent')).toBeUndefined()
    })

    it('应该正确设置字段值', () => {
      formEngine.setFieldValue('username', 'newuser')
      formEngine.setFieldValue('email', 'new@example.com')

      expect(formEngine.getFieldValue('username')).toBe('newuser')
      expect(formEngine.getFieldValue('email')).toBe('new@example.com')
    })
  })

  describe('表单验证', () => {
    beforeEach(() => {
      formEngine.mount()
    })

    it('应该正确验证表单', async () => {
      formEngine.setFormData({
        username: 'test',
        email: 'invalid-email'
      })

      const result = await formEngine.validate()
      
      expect(result.valid).toBe(false)
      expect(result.fields).toBeDefined()
    })

    it('应该正确验证单个字段', async () => {
      formEngine.setFieldValue('username', 'ab') // 少于3个字符

      const result = await formEngine.validateField('username')
      
      expect(result.valid).toBe(false)
      expect(result.message).toContain('至少3个字符')
    })

    it('有效数据应该通过验证', async () => {
      formEngine.setFormData({
        username: 'testuser',
        email: 'test@example.com',
        gender: 'male'
      })

      const result = await formEngine.validate()
      
      expect(result.valid).toBe(true)
    })
  })

  describe('表单重置', () => {
    beforeEach(() => {
      formEngine.mount()
    })

    it('应该正确重置表单', () => {
      formEngine.setFormData({
        username: 'testuser',
        email: 'test@example.com'
      })

      formEngine.reset()
      
      const formData = formEngine.getFormData()
      expect(formData.username).toBeUndefined()
      expect(formData.email).toBeUndefined()
    })

    it('重置应该触发相应事件', () => {
      const resetSpy = vi.spyOn(formEngine.eventBus, 'emit')
      
      formEngine.reset()
      
      expect(resetSpy).toHaveBeenCalledWith('form:reset', expect.any(Object))
    })
  })

  describe('事件系统', () => {
    it('应该正确监听和触发事件', () => {
      const callback = vi.fn()
      
      formEngine.on('test-event', callback)
      formEngine.emit('test-event', { data: 'test' })
      
      expect(callback).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该正确移除事件监听器', () => {
      const callback = vi.fn()
      
      formEngine.on('test-event', callback)
      formEngine.off('test-event', callback)
      formEngine.emit('test-event', { data: 'test' })
      
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('未挂载时的操作应该抛出错误', () => {
      expect(() => {
        formEngine.setFieldValue('username', 'test')
      }).toThrow('表单未挂载')
    })

    it('销毁后的操作应该抛出错误', () => {
      formEngine.destroy()
      
      expect(() => {
        formEngine.setFieldValue('username', 'test')
      }).toThrow('表单已销毁')
    })

    it('无效字段操作应该抛出错误', () => {
      formEngine.mount()
      
      expect(() => {
        formEngine.setFieldValue('nonexistent', 'test')
      }).toThrow('字段不存在')
    })
  })
})
