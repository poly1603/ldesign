/**
 * StateManager 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StateManager } from '../StateManager'
import { EventBus } from '../EventBus'
import type { FormFieldConfig } from '../../types'

describe('StateManager', () => {
  let stateManager: StateManager
  let eventBus: EventBus
  let mockFields: FormFieldConfig[]

  beforeEach(() => {
    eventBus = new EventBus()
    mockFields = [
      {
        type: 'input',
        name: 'username',
        label: '用户名',
        component: 'input',
        required: true,
        defaultValue: ''
      },
      {
        type: 'input',
        name: 'email',
        label: '邮箱',
        component: 'input',
        defaultValue: ''
      },
      {
        type: 'select',
        name: 'gender',
        label: '性别',
        component: 'select',
        defaultValue: 'male'
      }
    ]

    stateManager = new StateManager(eventBus)
    stateManager.initialize(mockFields)
  })

  describe('初始化', () => {
    it('应该正确初始化字段配置', () => {
      expect(stateManager.fieldConfigs.size).toBe(3)
      expect(stateManager.fieldConfigs.has('username')).toBe(true)
      expect(stateManager.fieldConfigs.has('email')).toBe(true)
      expect(stateManager.fieldConfigs.has('gender')).toBe(true)
    })

    it('应该正确初始化字段状态', () => {
      const usernameState = stateManager.getFieldState('username')
      expect(usernameState).toBeDefined()
      expect(usernameState?.value).toBe('')
      expect(usernameState?.isDirty).toBe(false)
      expect(usernameState?.isTouched).toBe(false)
      expect(usernameState?.isVisible).toBe(true)
      expect(usernameState?.isDisabled).toBe(false)
      expect(usernameState?.isRequired).toBe(true)
    })

    it('应该正确初始化表单数据', () => {
      const formData = stateManager.getFormData()
      expect(formData).toEqual({
        username: '',
        email: '',
        gender: 'male'
      })
    })
  })

  describe('字段值操作', () => {
    it('应该正确设置字段值', () => {
      stateManager.setValue('username', 'testuser')
      
      expect(stateManager.getValue('username')).toBe('testuser')
      
      const fieldState = stateManager.getFieldState('username')
      expect(fieldState?.value).toBe('testuser')
      expect(fieldState?.isDirty).toBe(true)
    })

    it('应该正确获取字段值', () => {
      stateManager.setValue('username', 'testuser')
      stateManager.setValue('email', 'test@example.com')
      
      expect(stateManager.getValue('username')).toBe('testuser')
      expect(stateManager.getValue('email')).toBe('test@example.com')
      expect(stateManager.getValue('nonexistent')).toBeUndefined()
    })

    it('设置字段值应该触发事件', () => {
      const eventSpy = vi.spyOn(eventBus, 'emit')
      
      stateManager.setValue('username', 'testuser')
      
      expect(eventSpy).toHaveBeenCalledWith('field:change', expect.objectContaining({
        field: expect.objectContaining({ name: 'username' }),
        value: 'testuser',
        oldValue: ''
      }))
    })

    it('设置相同值不应该触发事件', () => {
      stateManager.setValue('username', 'testuser')
      const eventSpy = vi.spyOn(eventBus, 'emit')
      
      stateManager.setValue('username', 'testuser')
      
      expect(eventSpy).not.toHaveBeenCalled()
    })
  })

  describe('表单数据操作', () => {
    it('应该正确设置表单数据', () => {
      const formData = {
        username: 'testuser',
        email: 'test@example.com',
        gender: 'female'
      }

      stateManager.setFormData(formData)
      
      expect(stateManager.getFormData()).toEqual(formData)
      expect(stateManager.getValue('username')).toBe('testuser')
      expect(stateManager.getValue('email')).toBe('test@example.com')
      expect(stateManager.getValue('gender')).toBe('female')
    })

    it('应该正确获取表单数据', () => {
      stateManager.setValue('username', 'testuser')
      stateManager.setValue('email', 'test@example.com')
      
      const formData = stateManager.getFormData()
      expect(formData).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        gender: 'male' // 默认值
      })
    })

    it('设置表单数据应该更新字段状态', () => {
      stateManager.setFormData({
        username: 'testuser',
        email: 'test@example.com'
      })

      const usernameState = stateManager.getFieldState('username')
      const emailState = stateManager.getFieldState('email')
      
      expect(usernameState?.isDirty).toBe(true)
      expect(emailState?.isDirty).toBe(true)
    })
  })

  describe('字段状态操作', () => {
    it('应该正确设置字段状态', () => {
      stateManager.setFieldState('username', {
        isTouched: true,
        isDisabled: true,
        errors: ['用户名不能为空']
      })

      const fieldState = stateManager.getFieldState('username')
      expect(fieldState?.isTouched).toBe(true)
      expect(fieldState?.isDisabled).toBe(true)
      expect(fieldState?.errors).toEqual(['用户名不能为空'])
    })

    it('应该正确获取字段状态', () => {
      const fieldState = stateManager.getFieldState('username')
      
      expect(fieldState).toBeDefined()
      expect(fieldState?.name).toBe('username')
      expect(fieldState?.value).toBe('')
      expect(fieldState?.isDirty).toBe(false)
    })

    it('获取不存在字段的状态应该返回null', () => {
      const fieldState = stateManager.getFieldState('nonexistent')
      expect(fieldState).toBeNull()
    })

    it('设置字段状态应该触发事件', () => {
      const eventSpy = vi.spyOn(eventBus, 'emit')
      
      stateManager.setFieldState('username', { isTouched: true })
      
      expect(eventSpy).toHaveBeenCalledWith('field:updated', expect.objectContaining({
        field: expect.objectContaining({ name: 'username' })
      }))
    })
  })

  describe('表单状态', () => {
    it('应该正确计算表单是否脏数据', () => {
      expect(stateManager.isDirty()).toBe(false)
      
      stateManager.setValue('username', 'testuser')
      expect(stateManager.isDirty()).toBe(true)
    })

    it('应该正确计算表单是否有错误', () => {
      expect(stateManager.hasErrors()).toBe(false)
      
      stateManager.setFieldState('username', { errors: ['用户名不能为空'] })
      expect(stateManager.hasErrors()).toBe(true)
    })

    it('应该正确获取所有错误', () => {
      stateManager.setFieldState('username', { errors: ['用户名不能为空'] })
      stateManager.setFieldState('email', { errors: ['邮箱格式不正确'] })

      const errors = stateManager.getAllErrors()
      expect(errors).toEqual({
        username: ['用户名不能为空'],
        email: ['邮箱格式不正确']
      })
    })

    it('应该正确清除所有错误', () => {
      stateManager.setFieldState('username', { errors: ['用户名不能为空'] })
      stateManager.setFieldState('email', { errors: ['邮箱格式不正确'] })

      stateManager.clearAllErrors()

      expect(stateManager.hasErrors()).toBe(false)
      expect(stateManager.getAllErrors()).toEqual({})
    })
  })

  describe('字段注册和注销', () => {
    it('应该正确注册新字段', () => {
      const newField: FormFieldConfig = {
        type: 'input',
        name: 'phone',
        label: '电话',
        component: 'input',
        defaultValue: ''
      }

      stateManager.registerField(newField)
      
      expect(stateManager.fieldConfigs.has('phone')).toBe(true)
      expect(stateManager.getValue('phone')).toBe('')
    })

    it('应该正确注销字段', () => {
      stateManager.unregisterField('email')
      
      expect(stateManager.fieldConfigs.has('email')).toBe(false)
      expect(stateManager.getValue('email')).toBeUndefined()
    })

    it('注册字段应该触发事件', () => {
      const eventSpy = vi.spyOn(eventBus, 'emit')
      const newField: FormFieldConfig = {
        type: 'input',
        name: 'phone',
        label: '电话',
        component: 'input'
      }

      stateManager.registerField(newField)
      
      expect(eventSpy).toHaveBeenCalledWith('field:registered', expect.objectContaining({
        field: newField
      }))
    })

    it('注销字段应该触发事件', () => {
      const eventSpy = vi.spyOn(eventBus, 'emit')
      
      stateManager.unregisterField('email')
      
      expect(eventSpy).toHaveBeenCalledWith('field:unregistered', expect.objectContaining({
        fieldName: 'email'
      }))
    })
  })

  describe('重置功能', () => {
    it('应该正确重置表单', () => {
      stateManager.setValue('username', 'testuser')
      stateManager.setValue('email', 'test@example.com')
      stateManager.setFieldState('username', { isTouched: true, errors: ['错误'] })

      stateManager.reset()

      expect(stateManager.getValue('username')).toBe('')
      expect(stateManager.getValue('email')).toBe('')
      expect(stateManager.getValue('gender')).toBe('male') // 默认值

      const usernameState = stateManager.getFieldState('username')
      expect(usernameState?.isDirty).toBe(false)
      expect(usernameState?.isTouched).toBe(false)
      expect(usernameState?.errors).toEqual([])
    })

    it('重置应该触发事件', () => {
      const eventSpy = vi.spyOn(eventBus, 'emit')
      
      stateManager.reset()
      
      expect(eventSpy).toHaveBeenCalledWith('form:reset', expect.any(Object))
    })
  })

  describe('监听器', () => {
    it('应该正确添加字段监听器', () => {
      const callback = vi.fn()
      
      const unwatch = stateManager.watch('username', callback)
      stateManager.setValue('username', 'testuser')
      
      expect(callback).toHaveBeenCalledWith('testuser', '')
      
      unwatch()
      stateManager.setValue('username', 'newuser')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('应该正确添加全局监听器', () => {
      const callback = vi.fn()
      
      const unwatch = stateManager.watchAll(callback)
      stateManager.setValue('username', 'testuser')
      
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        username: 'testuser'
      }))
      
      unwatch()
      stateManager.setValue('email', 'test@example.com')
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })
})
