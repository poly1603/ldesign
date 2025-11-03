/**
 * StateManager 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createStateManager } from './state-manager'

describe('StateManager', () => {
  describe('基础操作', () => {
    it('应该能够设置和获取状态', () => {
      const state = createStateManager()
      state.set('key', 'value')
      expect(state.get('key')).toBe('value')
    })

    it('应该支持嵌套路径', () => {
      const state = createStateManager()
      state.set('user.profile.name', 'Alice')
      expect(state.get('user.profile.name')).toBe('Alice')
    })

    it('应该能够设置对象', () => {
      const state = createStateManager()
      const userData = { id: 1, name: 'Alice', age: 30 }
      state.set('user', userData)
      expect(state.get('user')).toEqual(userData)
    })

    it('应该能够检查状态是否存在', () => {
      const state = createStateManager()
      state.set('key', 'value')
      expect(state.has('key')).toBe(true)
      expect(state.has('nonexistent')).toBe(false)
    })

    it('应该能够删除状态', () => {
      const state = createStateManager()
      state.set('key', 'value')
      expect(state.delete('key')).toBe(true)
      expect(state.has('key')).toBe(false)
      expect(state.delete('nonexistent')).toBe(false)
    })

    it('应该能够清空所有状态', () => {
      const state = createStateManager()
      state.set('key1', 'value1')
      state.set('key2', 'value2')
      state.clear()
      expect(state.has('key1')).toBe(false)
      expect(state.has('key2')).toBe(false)
    })
  })

  describe('状态监听', () => {
    it('应该能够监听状态变化', () => {
      const state = createStateManager()
      const watcher = vi.fn()

      state.watch('key', watcher)
      state.set('key', 'new value')

      expect(watcher).toHaveBeenCalledWith('new value', undefined, 'key')
    })

    it('应该能够取消监听', () => {
      const state = createStateManager()
      const watcher = vi.fn()

      const unwatch = state.watch('key', watcher)
      unwatch()
      state.set('key', 'value')

      expect(watcher).not.toHaveBeenCalled()
    })

    it('应该能够监听嵌套路径', () => {
      const state = createStateManager()
      const watcher = vi.fn()

      state.watch('user.name', watcher)
      state.set('user.name', 'Alice')

      expect(watcher).toHaveBeenCalledWith('Alice', undefined, 'user.name')
    })

    it('父路径的监听器应该被通知', () => {
      const state = createStateManager()
      const parentWatcher = vi.fn()

      state.watch('user', parentWatcher)
      state.set('user.name', 'Alice')

      expect(parentWatcher).toHaveBeenCalled()
    })

    it('多个监听器都应该被触发', () => {
      const state = createStateManager()
      const watcher1 = vi.fn()
      const watcher2 = vi.fn()

      state.watch('key', watcher1)
      state.watch('key', watcher2)
      state.set('key', 'value')

      expect(watcher1).toHaveBeenCalled()
      expect(watcher2).toHaveBeenCalled()
    })
  })

  describe('批量更新', () => {
    it('应该能够批量更新状态', () => {
      const state = createStateManager()
      const watcher = vi.fn()

      state.watch('user', watcher)

      state.batch(() => {
        state.set('user.name', 'Alice')
        state.set('user.age', 30)
        state.set('user.email', 'alice@example.com')
      })

      // 应该被调用 3 次（每次 set 一次）
      expect(watcher).toHaveBeenCalledTimes(3)
    })

    it('批量更新中的错误不应该影响后续更新', () => {
      const state = createStateManager()

      expect(() => {
        state.batch(() => {
          state.set('key1', 'value1')
          throw new Error('Test error')
        })
      }).toThrow('Test error')

      // key1 应该仍然被设置
      expect(state.get('key1')).toBe('value1')
    })
  })

  describe('浅层比较优化', () => {
    it('值未变化时不应该触发监听器', () => {
      const state = createStateManager({ shallowCompare: true })
      const watcher = vi.fn()

      state.set('key', 'value')
      state.watch('key', watcher)

      // 设置相同的值
      state.set('key', 'value')

      expect(watcher).not.toHaveBeenCalled()
    })

    it('对象浅层相等时不应该触发监听器', () => {
      const state = createStateManager({ shallowCompare: true })
      const watcher = vi.fn()

      const obj = { a: 1, b: 2 }
      state.set('key', obj)
      state.watch('key', watcher)

      // 设置相同的对象
      state.set('key', obj)

      expect(watcher).not.toHaveBeenCalled()
    })

    it('对象内容相同但引用不同时不应该触发监听器', () => {
      const state = createStateManager({ shallowCompare: true })
      const watcher = vi.fn()

      state.set('key', { a: 1, b: 2 })
      state.watch('key', watcher)

      // 设置内容相同的新对象
      state.set('key', { a: 1, b: 2 })

      expect(watcher).not.toHaveBeenCalled()
    })
  })

  describe('深度限制', () => {
    it('应该拒绝超过最大深度的路径', () => {
      const state = createStateManager({ maxDepth: 3 })

      expect(() => {
        state.set('a.b.c.d', 'value')
      }).toThrow('exceeds maximum')
    })

    it('应该接受在深度限制内的路径', () => {
      const state = createStateManager({ maxDepth: 3 })

      expect(() => {
        state.set('a.b.c', 'value')
      }).not.toThrow()
    })
  })

  describe('状态快照', () => {
    it('应该能够获取状态快照', () => {
      const state = createStateManager()
      state.set('user.name', 'Alice')
      state.set('user.age', 30)

      const snapshot = state.snapshot()

      expect(snapshot).toEqual({
        user: {
          name: 'Alice',
          age: 30,
        },
      })
    })

    it('快照应该是深拷贝', () => {
      const state = createStateManager()
      state.set('user', { name: 'Alice' })

      const snapshot = state.snapshot()
      snapshot.user.name = 'Bob'

      expect(state.get('user')).toEqual({ name: 'Alice' })
    })

    it('应该能够恢复状态', () => {
      const state = createStateManager()
      state.set('key1', 'value1')
      state.set('key2', 'value2')

      const snapshot = state.snapshot()

      state.clear()
      expect(state.has('key1')).toBe(false)

      state.restore(snapshot)
      expect(state.get('key1')).toBe('value1')
      expect(state.get('key2')).toBe('value2')
    })

    it('恢复状态应该通知所有监听器', () => {
      const state = createStateManager()
      const watcher = vi.fn()

      state.watch('key', watcher)

      state.restore({ key: 'restored value' })

      expect(watcher).toHaveBeenCalled()
    })
  })

  describe('获取所有状态', () => {
    it('应该能够获取所有状态（浅拷贝）', () => {
      const state = createStateManager()
      state.set('key1', 'value1')
      state.set('key2', 'value2')

      const allState = state.getState()

      expect(allState).toEqual({
        key1: 'value1',
        key2: 'value2',
      })
    })

    it('getState 应该返回浅拷贝', () => {
      const state = createStateManager()
      state.set('user', { name: 'Alice' })

      const allState = state.getState()
      allState.user.name = 'Bob'

      // 原始状态应该被修改（浅拷贝）
      expect(state.get('user')).toEqual({ name: 'Bob' })
    })
  })

  describe('路径解析', () => {
    it('应该正确解析简单路径', () => {
      const state = createStateManager()
      state.set('key', 'value')
      expect(state.get('key')).toBe('value')
    })

    it('应该正确解析嵌套路径', () => {
      const state = createStateManager()
      state.set('a.b.c.d.e', 'value')
      expect(state.get('a.b.c.d.e')).toBe('value')
    })

    it('不存在的嵌套路径应该返回 undefined', () => {
      const state = createStateManager()
      expect(state.get('a.b.c')).toBeUndefined()
    })

    it('中间路径为 null 时应该返回 undefined', () => {
      const state = createStateManager()
      state.set('a', null)
      expect(state.get('a.b.c')).toBeUndefined()
    })
  })

  describe('监听器错误处理', () => {
    it('监听器错误不应该中断其他监听器', () => {
      const state = createStateManager()
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })

      const watcher1 = vi.fn(() => {
        throw new Error('Watcher error')
      })
      const watcher2 = vi.fn()

      state.watch('key', watcher1)
      state.watch('key', watcher2)

      state.set('key', 'value')

      expect(watcher1).toHaveBeenCalled()
      expect(watcher2).toHaveBeenCalled()
      expect(consoleError).toHaveBeenCalled()

      consoleError.mockRestore()
    })
  })

  describe('生命周期', () => {
    it('应该能够初始化和销毁', async () => {
      const state = createStateManager()

      await state.init?.()

      state.set('key', 'value')
      expect(state.get('key')).toBe('value')

      await state.destroy?.()

      expect(state.has('key')).toBe(false)
    })
  })
})

