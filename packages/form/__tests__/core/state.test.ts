/**
 * @ldesign/form 状态管理器测试
 */

import { describe, it, expect, vi } from 'vitest'
import { FormStateManager } from '../../src/core/state/manager'
import type { FormConfig, FormEvents } from '../../src/types/core'

describe('状态管理器', () => {
  describe('FormStateManager', () => {
    it('应该正确初始化状态', () => {
      const config: FormConfig = {
        fields: [
          { name: 'name', label: '姓名', type: 'input', defaultValue: 'John' },
          { name: 'age', label: '年龄', type: 'number' }
        ],
        defaultValue: {
          age: 25
        }
      }

      const manager = new FormStateManager(config)
      const state = manager.getState()

      expect(state.values).toEqual({
        name: 'John',
        age: 25
      })
      expect(state.dirty).toBe(false)
      expect(state.valid).toBe(true)
      expect(state.errors).toEqual({})
    })

    it('应该正确设置字段值', () => {
      const config: FormConfig = {
        fields: [
          { name: 'name', label: '姓名', type: 'input' },
          { name: 'age', label: '年龄', type: 'number' }
        ]
      }

      const onChange = vi.fn()
      const onFieldChange = vi.fn()
      const events: FormEvents = { onChange, onFieldChange }

      const manager = new FormStateManager(config, events)

      manager.setFieldValue('name', 'Alice')

      expect(manager.getFieldValue('name')).toBe('Alice')
      expect(manager.getState().dirty).toBe(true)
      expect(onFieldChange).toHaveBeenCalledWith('name', 'Alice', { name: 'Alice' })
      expect(onChange).toHaveBeenCalledWith({ name: 'Alice' }, 'name', 'Alice')
    })

    it('应该正确验证必填字段', async () => {
      const config: FormConfig = {
        fields: [
          {
            name: 'name',
            label: '姓名',
            type: 'input',
            rules: [{ type: 'required', message: '姓名不能为空' }]
          }
        ]
      }

      const manager = new FormStateManager(config)

      // 验证空值
      const valid1 = await manager.validateField('name')
      expect(valid1).toBe(false)
      expect(manager.getState().errors.name).toEqual(['姓名不能为空'])

      // 设置值后验证
      manager.setFieldValue('name', 'Alice', false)
      const valid2 = await manager.validateField('name')
      expect(valid2).toBe(true)
      expect(manager.getState().errors.name).toBeUndefined()
    })

    it('应该正确验证长度限制', async () => {
      const config: FormConfig = {
        fields: [
          {
            name: 'password',
            label: '密码',
            type: 'input',
            rules: [
              { type: 'required', message: '密码不能为空' },
              { type: 'min', value: 6, message: '密码至少6位' },
              { type: 'max', value: 20, message: '密码最多20位' }
            ]
          }
        ]
      }

      const manager = new FormStateManager(config)

      // 测试太短的密码
      manager.setFieldValue('password', '123', false)
      const valid1 = await manager.validateField('password')
      expect(valid1).toBe(false)
      expect(manager.getState().errors.password).toContain('密码至少6位')

      // 测试太长的密码
      manager.setFieldValue('password', '123456789012345678901', false)
      const valid2 = await manager.validateField('password')
      expect(valid2).toBe(false)
      expect(manager.getState().errors.password).toContain('密码最多20位')

      // 测试合适的密码
      manager.setFieldValue('password', '123456', false)
      const valid3 = await manager.validateField('password')
      expect(valid3).toBe(true)
      expect(manager.getState().errors.password).toBeUndefined()
    })

    it('应该正确验证正则表达式', async () => {
      const config: FormConfig = {
        fields: [
          {
            name: 'email',
            label: '邮箱',
            type: 'input',
            rules: [
              {
                type: 'pattern',
                value: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
                message: '邮箱格式不正确'
              }
            ]
          }
        ]
      }

      const manager = new FormStateManager(config)

      // 测试无效邮箱
      manager.setFieldValue('email', 'invalid-email', false)
      const valid1 = await manager.validateField('email')
      expect(valid1).toBe(false)
      expect(manager.getState().errors.email).toContain('邮箱格式不正确')

      // 测试有效邮箱
      manager.setFieldValue('email', 'test@example.com', false)
      const valid2 = await manager.validateField('email')
      expect(valid2).toBe(true)
      expect(manager.getState().errors.email).toBeUndefined()
    })

    it('应该正确处理自定义验证', async () => {
      const config: FormConfig = {
        fields: [
          {
            name: 'username',
            label: '用户名',
            type: 'input',
            rules: [
              {
                type: 'custom',
                validator: (value) => {
                  if (value === 'admin') {
                    return '用户名不能是admin'
                  }
                  return true
                },
                message: '用户名验证失败'
              }
            ]
          }
        ]
      }

      const manager = new FormStateManager(config)

      // 测试被禁止的用户名
      manager.setFieldValue('username', 'admin', false)
      const valid1 = await manager.validateField('username')
      expect(valid1).toBe(false)
      expect(manager.getState().errors.username).toContain('用户名不能是admin')

      // 测试允许的用户名
      manager.setFieldValue('username', 'user123', false)
      const valid2 = await manager.validateField('username')
      expect(valid2).toBe(true)
      expect(manager.getState().errors.username).toBeUndefined()
    })

    it('应该正确重置表单', () => {
      const config: FormConfig = {
        fields: [
          { name: 'name', label: '姓名', type: 'input', defaultValue: 'John' }
        ]
      }

      const onReset = vi.fn()
      const events: FormEvents = { onReset }

      const manager = new FormStateManager(config, events)

      // 修改值
      manager.setFieldValue('name', 'Alice')
      expect(manager.getState().dirty).toBe(true)

      // 重置
      manager.reset()
      expect(manager.getFieldValue('name')).toBe('John')
      expect(manager.getState().dirty).toBe(false)
      expect(manager.getState().errors).toEqual({})
      expect(onReset).toHaveBeenCalledWith({ name: 'John' })
    })

    it('应该正确提交表单', async () => {
      const config: FormConfig = {
        fields: [
          {
            name: 'name',
            label: '姓名',
            type: 'input',
            rules: [{ type: 'required' }]
          }
        ]
      }

      const onSubmit = vi.fn()
      const events: FormEvents = { onSubmit }

      const manager = new FormStateManager(config, events)

      // 提交无效表单
      const result1 = await manager.submit()
      expect(result1).toBe(false)
      expect(onSubmit).not.toHaveBeenCalled()

      // 设置有效值后提交
      manager.setFieldValue('name', 'Alice', false)
      const result2 = await manager.submit()
      expect(result2).toBe(true)
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Alice' })
      expect(manager.getState().submitted).toBe(true)
    })

    it('应该正确处理状态监听器', () => {
      const config: FormConfig = {
        fields: [{ name: 'name', label: '姓名', type: 'input' }]
      }

      const manager = new FormStateManager(config)
      const listener = vi.fn()

      // 添加监听器
      const unsubscribe = manager.addListener('values', listener)

      // 触发状态变化
      manager.setFieldValue('name', 'Alice')

      expect(listener).toHaveBeenCalledWith({ name: 'Alice' }, {})

      // 取消监听
      unsubscribe()
      manager.setFieldValue('name', 'Bob')

      // 监听器不应该再被调用
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })
})
