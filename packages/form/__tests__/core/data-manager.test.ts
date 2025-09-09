/**
 * DataManager 数据管理器测试
 * 
 * 测试数据管理器的各项功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DataManager } from '../../src/core/data-manager'

describe('DataManager', () => {
  let dataManager: DataManager

  beforeEach(() => {
    dataManager = new DataManager({
      name: '',
      email: '',
      profile: {
        age: 0,
        bio: ''
      }
    })
  })

  describe('基础数据操作', () => {
    it('应该能够获取初始数据', () => {
      const data = dataManager.getData()
      expect(data).toEqual({
        name: '',
        email: '',
        profile: {
          age: 0,
          bio: ''
        }
      })
    })

    it('应该能够设置数据', () => {
      dataManager.setData({
        name: 'John',
        email: 'john@example.com'
      })

      const data = dataManager.getData()
      expect(data.name).toBe('John')
      expect(data.email).toBe('john@example.com')
      expect(data.profile.age).toBe(0) // 未修改的字段应保持原值
    })

    it('应该能够获取字段值', () => {
      dataManager.setFieldValue('name', 'John')
      expect(dataManager.getFieldValue('name')).toBe('John')
    })

    it('应该能够设置字段值', () => {
      dataManager.setFieldValue('name', 'John')
      dataManager.setFieldValue('email', 'john@example.com')

      expect(dataManager.getFieldValue('name')).toBe('John')
      expect(dataManager.getFieldValue('email')).toBe('john@example.com')
    })
  })

  describe('深层路径操作', () => {
    it('应该能够获取深层字段值', () => {
      dataManager.setFieldValue('profile.age', 25)
      expect(dataManager.getFieldValue('profile.age')).toBe(25)
    })

    it('应该能够设置深层字段值', () => {
      dataManager.setFieldValue('profile.bio', 'Software Developer')
      expect(dataManager.getFieldValue('profile.bio')).toBe('Software Developer')

      // 其他字段应该保持不变
      expect(dataManager.getFieldValue('profile.age')).toBe(0)
      expect(dataManager.getFieldValue('name')).toBe('')
    })

    it('应该能够创建不存在的深层路径', () => {
      dataManager.setFieldValue('settings.theme', 'dark')
      expect(dataManager.getFieldValue('settings.theme')).toBe('dark')

      const data = dataManager.getData()
      expect(data).toHaveProperty('settings.theme', 'dark')
    })
  })

  describe('批量操作', () => {
    it('应该能够批量设置字段值', () => {
      dataManager.setFieldsValue({
        name: 'John',
        email: 'john@example.com',
        'profile.age': 25
      })

      expect(dataManager.getFieldValue('name')).toBe('John')
      expect(dataManager.getFieldValue('email')).toBe('john@example.com')
      expect(dataManager.getFieldValue('profile.age')).toBe(25)
    })

    it('应该在批量设置时只触发一次数据变化事件', () => {
      const changeHandler = vi.fn()
      dataManager.on('data:change', changeHandler)

      dataManager.setFieldsValue({
        name: 'John',
        email: 'john@example.com'
      })

      expect(changeHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('事件系统', () => {
    it('应该在数据变化时触发事件', () => {
      const changeHandler = vi.fn()
      dataManager.on('data:change', changeHandler)

      dataManager.setData({ name: 'John' })

      expect(changeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'update',
          data: expect.objectContaining({ name: 'John' }),
          oldData: expect.any(Object)
        })
      )
    })

    it('应该在字段变化时触发事件', () => {
      const fieldChangeHandler = vi.fn()
      dataManager.on('field:change', fieldChangeHandler)

      dataManager.setFieldValue('name', 'John')

      expect(fieldChangeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'name',
          value: 'John',
          oldValue: '',
          path: 'name'
        })
      )
    })

    it('应该在重置时触发事件', () => {
      const changeHandler = vi.fn()
      dataManager.on('data:change', changeHandler)

      // 先修改数据
      dataManager.setFieldValue('name', 'John')
      changeHandler.mockClear()

      // 然后重置
      dataManager.reset()

      expect(changeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'reset'
        })
      )
    })
  })

  describe('字段管理', () => {
    it('应该能够检查字段是否存在', () => {
      expect(dataManager.hasField('name')).toBe(true)
      expect(dataManager.hasField('nonexistent')).toBe(false)
    })

    it('应该能够删除字段', () => {
      dataManager.setFieldValue('name', 'John')
      expect(dataManager.hasField('name')).toBe(true)

      dataManager.deleteField('name')
      expect(dataManager.hasField('name')).toBe(false)
    })

    it('应该在删除字段时触发事件', () => {
      const fieldChangeHandler = vi.fn()
      dataManager.on('field:change', fieldChangeHandler)

      dataManager.setFieldValue('name', 'John')
      fieldChangeHandler.mockClear()

      dataManager.deleteField('name')

      expect(fieldChangeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'name',
          value: undefined,
          oldValue: 'John'
        })
      )
    })
  })

  describe('重置功能', () => {
    it('应该能够重置到初始状态', () => {
      // 修改数据
      dataManager.setData({
        name: 'John',
        email: 'john@example.com',
        profile: { age: 25, bio: 'Developer' }
      })

      // 重置
      dataManager.reset()

      // 验证数据已重置
      const data = dataManager.getData()
      expect(data).toEqual({
        name: '',
        email: '',
        profile: {
          age: 0,
          bio: ''
        }
      })
    })
  })

  describe('快照功能', () => {
    it('应该能够创建和恢复快照', () => {
      // 修改数据
      dataManager.setFieldValue('name', 'John')
      dataManager.setFieldValue('email', 'john@example.com')

      // 获取快照数量
      const snapshotCount = dataManager.getSnapshotCount()
      expect(snapshotCount).toBeGreaterThan(0)

      // 继续修改数据
      dataManager.setFieldValue('name', 'Jane')

      // 恢复到上一个快照
      dataManager.restoreSnapshot(-2)

      // 验证数据已恢复
      expect(dataManager.getFieldValue('name')).toBe('John')
      expect(dataManager.getFieldValue('email')).toBe('john@example.com')
    })

    it('应该能够清除快照', () => {
      dataManager.setFieldValue('name', 'John')
      expect(dataManager.getSnapshotCount()).toBeGreaterThan(0)

      dataManager.clearSnapshots()
      expect(dataManager.getSnapshotCount()).toBe(0)
    })
  })

  describe('数据变化检测', () => {
    it('应该在数据未实际变化时不触发事件', () => {
      const changeHandler = vi.fn()
      dataManager.on('data:change', changeHandler)

      // 设置相同的值
      dataManager.setFieldValue('name', '')
      expect(changeHandler).not.toHaveBeenCalled()

      // 设置不同的值
      dataManager.setFieldValue('name', 'John')
      expect(changeHandler).toHaveBeenCalledTimes(1)

      // 再次设置相同的值
      dataManager.setFieldValue('name', 'John')
      expect(changeHandler).toHaveBeenCalledTimes(1) // 不应该再次触发
    })
  })

  describe('静默更新', () => {
    it('应该支持静默更新（不触发事件）', () => {
      const changeHandler = vi.fn()
      dataManager.on('data:change', changeHandler)

      dataManager.setFieldValue('name', 'John', true) // 静默更新
      expect(changeHandler).not.toHaveBeenCalled()

      // 验证数据确实已更新
      expect(dataManager.getFieldValue('name')).toBe('John')
    })
  })

  describe('销毁功能', () => {
    it('应该能够销毁数据管理器', () => {
      expect(() => dataManager.destroy()).not.toThrow()

      // 销毁后应该无法操作
      expect(() => dataManager.setFieldValue('name', 'John')).toThrow()
    })
  })

  afterEach(() => {
    if (dataManager && !dataManager.isDestroyed?.()) {
      dataManager.destroy()
    }
  })
})
