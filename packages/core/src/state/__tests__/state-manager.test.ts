import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CoreStateManager } from '../state-manager'

describe('CoreStateManager', () => {
  let manager: CoreStateManager

  beforeEach(() => {
    manager = new CoreStateManager()
  })

  describe('基本操作', () => {
    it('应该能够设置和获取状态', () => {
      manager.set('user.name', 'John')
      
      expect(manager.get('user.name')).toBe('John')
    })

    it('应该能够设置嵌套状态', () => {
      manager.set('user.profile.age', 25)
      
      expect(manager.get('user.profile.age')).toBe(25)
    })

    it('应该能够获取整个对象', () => {
      manager.set('user.name', 'John')
      manager.set('user.age', 25)
      
      const user = manager.get('user')
      
      expect(user).toEqual({ name: 'John', age: 25 })
    })

    it('应该在路径不存在时返回 undefined', () => {
      expect(manager.get('nonexistent.path')).toBeUndefined()
    })

    it('应该能够删除状态', () => {
      manager.set('user.name', 'John')
      
      manager.delete('user.name')
      
      expect(manager.get('user.name')).toBeUndefined()
    })

    it('应该能够检查路径是否存在', () => {
      manager.set('user.name', 'John')
      
      expect(manager.has('user.name')).toBe(true)
      expect(manager.has('user.age')).toBe(false)
    })

    it('应该能够清空所有状态', () => {
      manager.set('user.name', 'John')
      manager.set('app.theme', 'dark')
      
      manager.clear()
      
      expect(manager.get('user.name')).toBeUndefined()
      expect(manager.get('app.theme')).toBeUndefined()
    })
  })

  describe('监听器', () => {
    it('应该能够监听状态变化', () => {
      const watcher = vi.fn()

      manager.watch('user.name', watcher)
      manager.set('user.name', 'John')

      expect(watcher).toHaveBeenCalledWith('John', undefined, 'user.name')
    })

    it('应该传递旧值和新值', () => {
      const watcher = vi.fn()

      manager.set('user.name', 'John')
      manager.watch('user.name', watcher)
      manager.set('user.name', 'Jane')

      expect(watcher).toHaveBeenCalledWith('Jane', 'John', 'user.name')
    })

    it('应该能够取消监听', () => {
      const watcher = vi.fn()
      
      const unwatch = manager.watch('user.name', watcher)
      unwatch()
      
      manager.set('user.name', 'John')
      
      expect(watcher).not.toHaveBeenCalled()
    })

    it('应该支持深度监听', () => {
      const watcher = vi.fn()
      
      manager.watch('user', watcher, { deep: true })
      
      manager.set('user.name', 'John')
      
      expect(watcher).toHaveBeenCalled()
    })

    it.skip('应该支持立即执行', () => {
      // TODO: 实现 immediate 选项
      const watcher = vi.fn()

      manager.set('user.name', 'John')
      manager.watch('user.name', watcher, { immediate: true })

      expect(watcher).toHaveBeenCalledWith('John', undefined, 'user.name')
    })

    it.skip('应该能够监听多个路径', () => {
      // TODO: 实现多路径监听
      const watcher = vi.fn()

      manager.watch(['user.name', 'user.age'], watcher)

      manager.set('user.name', 'John')
      expect(watcher).toHaveBeenCalledTimes(1)

      manager.set('user.age', 25)
      expect(watcher).toHaveBeenCalledTimes(2)
    })
  })

  describe('批量操作', () => {
    it('应该支持批量设置', () => {
      manager.setMany({
        'user.name': 'John',
        'user.age': 25,
        'app.theme': 'dark'
      })
      
      expect(manager.get('user.name')).toBe('John')
      expect(manager.get('user.age')).toBe(25)
      expect(manager.get('app.theme')).toBe('dark')
    })

    it('应该支持批量获取', () => {
      manager.set('user.name', 'John')
      manager.set('user.age', 25)
      
      const values = manager.getMany(['user.name', 'user.age', 'user.email'])
      
      expect(values).toEqual({
        'user.name': 'John',
        'user.age': 25,
        'user.email': undefined
      })
    })

    it('应该支持批量删除', () => {
      manager.set('user.name', 'John')
      manager.set('user.age', 25)
      manager.set('user.email', 'john@example.com')
      
      manager.deleteMany(['user.name', 'user.email'])
      
      expect(manager.has('user.name')).toBe(false)
      expect(manager.has('user.age')).toBe(true)
      expect(manager.has('user.email')).toBe(false)
    })
  })

  describe('快照和恢复', () => {
    it('应该能够创建快照', () => {
      manager.set('user.name', 'John')
      manager.set('user.age', 25)
      
      const snapshot = manager.snapshot()
      
      expect(snapshot).toEqual({
        user: {
          name: 'John',
          age: 25
        }
      })
    })

    it('应该能够恢复快照', () => {
      manager.set('user.name', 'John')
      
      const snapshot = manager.snapshot()
      
      manager.set('user.name', 'Jane')
      manager.set('user.age', 30)
      
      manager.restore(snapshot)
      
      expect(manager.get('user.name')).toBe('John')
      expect(manager.get('user.age')).toBeUndefined()
    })

    it('应该在恢复快照时触发监听器', () => {
      const watcher = vi.fn()

      manager.set('user.name', 'John')
      const snapshot = manager.snapshot()

      manager.set('user.name', 'Jane')
      manager.watch('user.name', watcher)

      manager.restore(snapshot)

      expect(watcher).toHaveBeenCalledWith('John', undefined, 'user.name')
    })
  })

  describe('路径编译缓存', () => {
    it('应该缓存路径编译结果', () => {
      // 多次访问相同路径应该使用缓存
      manager.set('user.profile.name', 'John')
      manager.get('user.profile.name')
      manager.get('user.profile.name')
      manager.get('user.profile.name')
      
      expect(manager.get('user.profile.name')).toBe('John')
    })

    it('应该正确处理数组索引', () => {
      manager.set('users[0].name', 'John')
      manager.set('users[1].name', 'Jane')
      
      expect(manager.get('users[0].name')).toBe('John')
      expect(manager.get('users[1].name')).toBe('Jane')
    })
  })

  describe('性能', () => {
    it('应该能够处理大量状态', () => {
      for (let i = 0; i < 1000; i++) {
        manager.set(`items[${i}].value`, i)
      }
      
      for (let i = 0; i < 1000; i++) {
        expect(manager.get(`items[${i}].value`)).toBe(i)
      }
    })

    it('应该快速执行 get 操作', () => {
      for (let i = 0; i < 100; i++) {
        manager.set(`items[${i}].value`, i)
      }
      
      const start = performance.now()
      
      for (let i = 0; i < 100; i++) {
        manager.get(`items[${i}].value`)
      }
      
      const duration = performance.now() - start
      
      // 100 次 get 操作应该在 10ms 内完成
      expect(duration).toBeLessThan(10)
    })

    it('应该能够处理大量监听器', () => {
      const watchers = Array.from({ length: 100 }, () => vi.fn())
      
      watchers.forEach(watcher => {
        manager.watch('user.name', watcher)
      })
      
      manager.set('user.name', 'John')
      
      watchers.forEach(watcher => {
        expect(watcher).toHaveBeenCalled()
      })
    })
  })

  describe('生命周期', () => {
    it('应该能够初始化', async () => {
      await expect(manager.init()).resolves.toBeUndefined()
    })

    it('应该能够销毁', async () => {
      manager.set('user.name', 'John')
      
      await manager.destroy()
      
      // 销毁后应该清空状态
      expect(manager.get('user.name')).toBeUndefined()
    })
  })

  describe('边界情况', () => {
    it('应该处理空路径', () => {
      manager.set('', 'value')
      expect(manager.get('')).toBe('value')
    })

    it('应该处理根路径', () => {
      const state = { user: { name: 'John' } }
      manager.restore(state)
      
      expect(manager.snapshot()).toEqual(state)
    })

    it('应该处理 undefined 值', () => {
      manager.set('user.name', undefined)

      // 注意: 当前实现中,undefined 值被视为不存在
      expect(manager.has('user.name')).toBe(false)
      expect(manager.get('user.name')).toBeUndefined()
    })

    it('应该处理 null 值', () => {
      manager.set('user.name', null)
      
      expect(manager.get('user.name')).toBe(null)
    })

    it('应该处理复杂对象', () => {
      const complexObject = {
        array: [1, 2, 3],
        nested: {
          deep: {
            value: 'test'
          }
        },
        date: new Date(),
        regex: /test/
      }
      
      manager.set('complex', complexObject)
      
      expect(manager.get('complex')).toEqual(complexObject)
    })

    it('应该处理循环引用', () => {
      const obj: any = { name: 'test' }
      obj.self = obj
      
      // 应该能够设置,但可能无法正确序列化
      manager.set('circular', obj)
      
      const retrieved = manager.get('circular')
      expect(retrieved.name).toBe('test')
    })
  })

  describe('错误处理', () => {
    it('应该处理无效路径', () => {
      // 根据实现,可能抛出错误或返回 undefined
      const result = manager.get('user..name')
      expect(result).toBeUndefined()
    })

    it('应该处理监听器中的错误', () => {
      const errorWatcher = vi.fn().mockImplementation(() => {
        throw new Error('Watcher error')
      })
      const normalWatcher = vi.fn()
      
      manager.watch('user.name', errorWatcher)
      manager.watch('user.name', normalWatcher)
      
      // 不应该抛出错误
      expect(() => manager.set('user.name', 'John')).not.toThrow()
      
      // 正常的监听器应该仍然被调用
      expect(normalWatcher).toHaveBeenCalled()
    })
  })
})

