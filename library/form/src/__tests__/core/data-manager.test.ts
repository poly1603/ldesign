/**
 * @ldesign/form - DataManager Tests
 * 数据管理器测试
 */

import { describe, it, expect, vi } from 'vitest'
import { DataManager } from '../../core/data-manager'

describe('DataManager', () => {
  it('应该能够设置和获取值', () => {
    const manager = new DataManager({
      initialValues: { name: 'John' }
    })

    expect(manager.getValue('name')).toBe('John')

    manager.setValue('name', 'Jane')
    expect(manager.getValue('name')).toBe('Jane')
  })

  it('应该支持深度路径访问', () => {
    const manager = new DataManager()

    manager.setValue('user.profile.name', 'John')
    expect(manager.getValue('user.profile.name')).toBe('John')

    manager.setValue('users[0].name', 'Jane')
    expect(manager.getValue('users[0].name')).toBe('Jane')
  })

  it('应该能够删除值', () => {
    const manager = new DataManager({
      initialValues: { name: 'John', age: 30 }
    })

    expect(manager.deleteValue('age')).toBe(true)
    expect(manager.getValue('age')).toBeUndefined()
  })

  it('应该能够检查值是否存在', () => {
    const manager = new DataManager({
      initialValues: { name: 'John' }
    })

    expect(manager.hasValue('name')).toBe(true)
    expect(manager.hasValue('age')).toBe(false)
  })

  it('应该能够重置到初始值', () => {
    const manager = new DataManager({
      initialValues: { name: 'John' }
    })

    manager.setValue('name', 'Jane')
    manager.reset()

    expect(manager.getValue('name')).toBe('John')
  })

  it('应该能够检测脏数据', () => {
    const manager = new DataManager({
      initialValues: { name: 'John' }
    })

    expect(manager.isDirty()).toBe(false)

    manager.setValue('name', 'Jane')
    expect(manager.isDirty()).toBe(true)
    expect(manager.isDirty('name')).toBe(true)
  })

  it('应该能够创建和恢复快照', () => {
    const manager = new DataManager({
      initialValues: { name: 'John' },
      enableSnapshot: true
    })

    manager.createSnapshot()
    manager.setValue('name', 'Jane')

    expect(manager.getValue('name')).toBe('Jane')

    manager.restoreSnapshot()
    expect(manager.getValue('name')).toBe('John')
  })

  it('应该能够订阅数据变更', () => {
    const manager = new DataManager()
    const subscriber = vi.fn()

    manager.subscribe(subscriber)
    manager.setValue('name', 'John')

    expect(subscriber).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'name',
        value: 'John'
      })
    )
  })

  it('批量设置值应该触发多次订阅', () => {
    const manager = new DataManager()
    const subscriber = vi.fn()

    manager.subscribe(subscriber)
    manager.setValues({ name: 'John', age: 30 })

    expect(subscriber).toHaveBeenCalledTimes(2)
  })
})



