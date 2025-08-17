import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStateManager } from '../src/state/state-manager'

describe('stateManager', () => {
  let stateManager: ReturnType<typeof createStateManager>

  beforeEach(() => {
    stateManager = createStateManager()
  })

  describe('基本操作', () => {
    it('应该设置和获取状态', () => {
      stateManager.set('key1', 'value1')
      expect(stateManager.get('key1')).toBe('value1')
    })

    it('应该支持嵌套路径', () => {
      stateManager.set('user.profile.name', 'John')
      stateManager.set('user.profile.age', 30)

      expect(stateManager.get('user.profile.name')).toBe('John')
      expect(stateManager.get('user.profile.age')).toBe(30)
      expect(stateManager.get('user.profile')).toEqual({
        name: 'John',
        age: 30,
      })
    })

    it('应该删除状态', () => {
      stateManager.set('key1', 'value1')
      stateManager.remove('key1')
      expect(stateManager.get('key1')).toBeUndefined()
    })

    it('应该检查键是否存在', () => {
      stateManager.set('key1', 'value1')
      expect(stateManager.has('key1')).toBe(true)
      expect(stateManager.has('key2')).toBe(false)
    })

    it('应该清空所有状态', () => {
      stateManager.set('key1', 'value1')
      stateManager.set('key2', 'value2')
      stateManager.clear()
      expect(stateManager.get('key1')).toBeUndefined()
      expect(stateManager.get('key2')).toBeUndefined()
    })
  })

  describe('状态监听', () => {
    it('应该监听状态变化', async () => {
      const listener = vi.fn()

      stateManager.set('test.value', 'initial value')
      stateManager.watch('test.value', listener)
      stateManager.set('test.value', 'new value')

      await new Promise(resolve => setTimeout(resolve, 0))
      expect(listener).toHaveBeenCalledWith('new value', 'initial value')
    })

    it('应该移除状态监听器', async () => {
      const listener = vi.fn()

      const unwatch = stateManager.watch('test.value', listener)
      stateManager.set('test.value', 'value1')

      unwatch()
      stateManager.set('test.value', 'value2')

      await new Promise(resolve => setTimeout(resolve, 0))
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('应该支持多个监听器', async () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      stateManager.watch('test.value', listener1)
      stateManager.watch('test.value', listener2)
      stateManager.set('test.value', 'new value')

      await new Promise(resolve => setTimeout(resolve, 0))
      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })
  })

  describe('命名空间', () => {
    it('应该创建独立的命名空间', () => {
      const userNs = stateManager.namespace('user')
      const appNs = stateManager.namespace('app')

      userNs.set('name', 'John')
      appNs.set('name', 'MyApp')

      expect(userNs.get('name')).toBe('John')
      expect(appNs.get('name')).toBe('MyApp')
    })

    it('命名空间应该相互隔离', () => {
      const ns1 = stateManager.namespace('ns1')
      const ns2 = stateManager.namespace('ns2')

      ns1.set('key1', 'value1')
      expect(ns2.has('key1')).toBe(false)
    })

    it('应该清空命名空间', () => {
      const userNs = stateManager.namespace('user')

      userNs.set('name', 'John')
      userNs.set('age', 30)
      stateManager.set('global', 'value')

      userNs.clear()

      expect(userNs.get('name')).toBeUndefined()
      expect(userNs.get('age')).toBeUndefined()
      expect(stateManager.get('global')).toBe('value') // 全局状态不受影响
    })

    it('应该返回命名空间的键', () => {
      const userNs = stateManager.namespace('user')

      userNs.set('name', 'John')
      userNs.set('age', 30)
      stateManager.set('global', 'value')

      const keys = userNs.keys()
      expect(keys).toContain('name')
      expect(keys).toContain('age')
      expect(keys).not.toContain('global')
    })
  })

  describe('快照和恢复', () => {
    it('应该创建状态快照', () => {
      stateManager.set('user.name', 'John')
      stateManager.set('user.age', 30)
      stateManager.set('app.title', 'MyApp')

      const snapshot = (stateManager as any).getSnapshot()
      expect(snapshot).toEqual({
        user: {
          name: 'John',
          age: 30,
        },
        app: {
          title: 'MyApp',
        },
      })
    })

    it('应该从快照恢复状态', () => {
      const snapshot = {
        user: { name: 'Jane', age: 25 },
        app: { title: 'NewApp' },
      };

      (stateManager as any).restoreFromSnapshot(snapshot)

      expect(stateManager.get('user.name')).toBe('Jane')
      expect(stateManager.get('user.age')).toBe(25)
      expect(stateManager.get('app.title')).toBe('NewApp')
    })
  })

  describe('状态合并', () => {
    it('应该合并状态', () => {
      stateManager.set('user.name', 'John')
      stateManager.set('user.age', 30);

      (stateManager as any).merge({
        user: { age: 31, email: 'john@example.com' },
        app: { title: 'MyApp' },
      })

      expect(stateManager.get('user.name')).toBe('John') // 保持原值
      expect(stateManager.get('user.age')).toBe(31) // 更新
      expect(stateManager.get('user.email')).toBe('john@example.com') // 新增
      expect(stateManager.get('app.title')).toBe('MyApp') // 新增
    })
  })

  describe('统计信息', () => {
    it('应该返回状态统计', () => {
      stateManager.set('user.name', 'John')
      stateManager.set('user.age', 30)
      stateManager.set('app.title', 'MyApp')

      const listener = vi.fn()
      stateManager.watch('user.name', listener)
      stateManager.watch('user.age', listener)

      const stats = (stateManager as any).getStats()
      expect(stats.totalKeys).toBeGreaterThan(0)
      expect(stats.totalWatchers).toBe(2)
      expect(stats.memoryUsage).toContain('KB')
    })
  })

  describe('变更历史', () => {
    it('应该记录变更历史', () => {
      stateManager.set('key1', 'value1')
      stateManager.set('key1', 'value2')
      stateManager.set('key2', 'value3')

      const history = (stateManager as any).getChangeHistory()
      expect(history).toHaveLength(3)
      expect(history[0].path).toBe('key2')
      expect(history[0].newValue).toBe('value3')
      expect(history[1].path).toBe('key1')
      expect(history[1].newValue).toBe('value2')
    })

    it('应该支持撤销操作', () => {
      stateManager.set('key1', 'value1')
      stateManager.set('key1', 'value2')

      expect(stateManager.get('key1')).toBe('value2')

      const undone = (stateManager as any).undo()
      expect(undone).toBe(true)
      expect(stateManager.get('key1')).toBe('value1')
    })

    it('应该清除变更历史', () => {
      stateManager.set('key1', 'value1')
      stateManager.set('key2', 'value2');

      (stateManager as any).clearHistory()
      const history = (stateManager as any).getChangeHistory()
      expect(history).toHaveLength(0)
    })
  })

  describe('性能统计', () => {
    it('应该返回性能统计', () => {
      stateManager.set('key1', 'value1')
      stateManager.set('key2', 'value2')

      const stats = (stateManager as any).getPerformanceStats()
      expect(stats.totalChanges).toBe(2)
      expect(stats.memoryUsage).toBeGreaterThan(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效路径', () => {
      expect(() => stateManager.set('', 'value')).not.toThrow()
      expect(() => stateManager.get('')).not.toThrow()
    })

    it('应该处理复杂对象', () => {
      const complexObject = {
        array: [1, 2, 3],
        nested: { deep: { value: 'test' } },
        date: new Date(),
        null: null,
        undefined,
      }

      stateManager.set('complex', complexObject)
      const retrieved = stateManager.get('complex')

      expect(retrieved).toEqual(complexObject)
    })
  })
})
