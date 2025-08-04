import type { FormItemConfig } from '../../src/types'
import { describe, expect, it, vi } from 'vitest'
import { DataBinding } from '../../src/core/data-binding'

describe('dataBinding', () => {
  describe('basic operations', () => {
    it('should get and set simple values', () => {
      const binding = new DataBinding({ name: 'John', age: 30 })

      expect(binding.get('name')).toBe('John')
      expect(binding.get('age')).toBe(30)

      binding.set('name', 'Jane')
      expect(binding.get('name')).toBe('Jane')
    })

    it('should get all data when no path provided', () => {
      const initialData = { name: 'John', age: 30 }
      const binding = new DataBinding(initialData)

      const allData = binding.get()
      expect(allData).toEqual(initialData)
      expect(allData).not.toBe(initialData) // 应该是克隆的
    })

    it('should handle nested object paths', () => {
      const binding = new DataBinding({
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
        },
      })

      expect(binding.get('user.profile.name')).toBe('John')
      expect(binding.get('user.profile.age')).toBe(30)

      binding.set('user.profile.name', 'Jane')
      expect(binding.get('user.profile.name')).toBe('Jane')
    })

    it('should handle array paths', () => {
      const binding = new DataBinding({
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 },
        ],
      })

      expect(binding.get('users.0.name')).toBe('John')
      expect(binding.get('users.1.age')).toBe(25)

      binding.set('users.0.name', 'Johnny')
      expect(binding.get('users.0.name')).toBe('Johnny')
    })

    it('should create nested paths when setting', () => {
      const binding = new DataBinding()

      binding.set('user.profile.name', 'John')
      expect(binding.get('user.profile.name')).toBe('John')

      binding.set('users.0.name', 'Jane')
      expect(binding.get('users.0.name')).toBe('Jane')
      expect(Array.isArray(binding.get('users'))).toBe(true)
    })
  })

  describe('batch operations', () => {
    it('should set multiple values at once', () => {
      const binding = new DataBinding()

      binding.set({
        'name': 'John',
        'age': 30,
        'user.email': 'john@example.com',
      })

      expect(binding.get('name')).toBe('John')
      expect(binding.get('age')).toBe(30)
      expect(binding.get('user.email')).toBe('john@example.com')
    })

    it('should reset all data', () => {
      const binding = new DataBinding({ name: 'John', age: 30 })

      binding.reset({ name: 'Jane', city: 'NYC' })

      expect(binding.get('name')).toBe('Jane')
      expect(binding.get('city')).toBe('NYC')
      expect(binding.get('age')).toBeUndefined()
    })
  })

  describe('watchers', () => {
    it('should watch simple value changes', () => {
      const binding = new DataBinding({ name: 'John' })
      const callback = vi.fn()

      binding.watch('name', callback)
      binding.set('name', 'Jane')

      expect(callback).toHaveBeenCalledWith('Jane', 'John')
    })

    it('should watch nested value changes', () => {
      const binding = new DataBinding({
        user: { profile: { name: 'John' } },
      })
      const callback = vi.fn()

      binding.watch('user.profile.name', callback)
      binding.set('user.profile.name', 'Jane')

      expect(callback).toHaveBeenCalledWith('Jane', 'John')
    })

    it('should not trigger watcher when value is the same', () => {
      const binding = new DataBinding({ name: 'John' })
      const callback = vi.fn()

      binding.watch('name', callback)
      binding.set('name', 'John') // 相同的值

      expect(callback).not.toHaveBeenCalled()
    })

    it('should trigger immediate callback when configured', () => {
      const binding = new DataBinding({ name: 'John' }, { immediate: true })
      const callback = vi.fn()

      binding.watch('name', callback)

      expect(callback).toHaveBeenCalledWith('John', undefined)
    })

    it('should unwatch correctly', () => {
      const binding = new DataBinding({ name: 'John' })
      const callback = vi.fn()

      const unwatch = binding.watch('name', callback)
      unwatch()

      binding.set('name', 'Jane')
      expect(callback).not.toHaveBeenCalled()
    })

    it('should trigger parent watchers in deep mode', () => {
      const binding = new DataBinding(
        { user: { profile: { name: 'John' } } },
        { deep: true },
      )
      const userCallback = vi.fn()
      const profileCallback = vi.fn()

      binding.watch('user', userCallback)
      binding.watch('user.profile', profileCallback)
      binding.set('user.profile.name', 'Jane')

      expect(userCallback).toHaveBeenCalled()
      expect(profileCallback).toHaveBeenCalled()
    })
  })

  describe('global change events', () => {
    it('should emit change events', () => {
      const binding = new DataBinding({ name: 'John' })
      const callback = vi.fn()

      binding.onChange(callback)
      binding.set('name', 'Jane')

      expect(callback).toHaveBeenCalledWith({
        path: 'name',
        newValue: 'Jane',
        oldValue: 'John',
        timestamp: expect.any(Number),
      })
    })

    it('should emit change events for batch operations', () => {
      const binding = new DataBinding()
      const callback = vi.fn()

      binding.onChange(callback)
      binding.set({ name: 'John', age: 30 })

      expect(callback).toHaveBeenCalledTimes(2)
    })
  })

  describe('utility methods', () => {
    it('should check if path exists', () => {
      const binding = new DataBinding({
        user: { name: 'John' },
        items: [1, 2, 3],
      })

      expect(binding.has('user.name')).toBe(true)
      expect(binding.has('user.age')).toBe(false)
      expect(binding.has('items.0')).toBe(true)
      expect(binding.has('items.5')).toBe(false)
    })

    it('should delete values', () => {
      const binding = new DataBinding({
        user: { name: 'John', age: 30 },
        items: [1, 2, 3],
      })

      binding.delete('user.age')
      expect(binding.has('user.age')).toBe(false)
      expect(binding.get('user.name')).toBe('John')

      binding.delete('items.1')
      expect(binding.get('items')).toEqual([1, 3])
    })

    it('should get all keys', () => {
      const binding = new DataBinding({
        name: 'John',
        user: { profile: { age: 30 } },
        items: [1, 2],
      })

      const keys = binding.keys()
      expect(keys).toContain('name')
      expect(keys).toContain('user')
      expect(keys).toContain('user.profile')
      expect(keys).toContain('user.profile.age')
      expect(keys).toContain('items')
    })

    it('should serialize and deserialize', () => {
      const initialData = {
        name: 'John',
        user: { age: 30 },
        items: [1, 2, 3],
      }
      const binding = new DataBinding(initialData)

      const serialized = binding.serialize()
      expect(typeof serialized).toBe('string')

      const newBinding = new DataBinding()
      newBinding.deserialize(serialized)

      expect(newBinding.get()).toEqual(initialData)
    })

    it('should handle invalid JSON in deserialize', () => {
      const binding = new DataBinding()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      binding.deserialize('invalid json')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('form item binding', () => {
    it('should bind form items', () => {
      const binding = new DataBinding()
      const callback = vi.fn()

      binding.onChange(callback)

      const items: FormItemConfig[] = [
        { key: 'name', label: 'Name', type: 'input', value: 'John' },
        { key: 'age', label: 'Age', type: 'number', value: 30 },
      ]

      const unbindFunctions = binding.bindFormItems(items)

      expect(binding.get('name')).toBe('John')
      expect(binding.get('age')).toBe(30)
      expect(unbindFunctions).toHaveLength(2)

      // 清理
      unbindFunctions.forEach(unbind => unbind())
    })

    it('should not override existing values when binding', () => {
      const binding = new DataBinding({ name: 'Existing' })

      const items: FormItemConfig[] = [
        { key: 'name', label: 'Name', type: 'input', value: 'New' },
      ]

      binding.bindFormItems(items)

      expect(binding.get('name')).toBe('Existing')
    })

    it('should emit form item change events', () => {
      const binding = new DataBinding()
      const callback = vi.fn()

      binding.eventEmitter.on('formItemChange', callback)

      const items: FormItemConfig[] = [
        { key: 'name', label: 'Name', type: 'input', value: 'John' },
      ]

      binding.bindFormItems(items)
      binding.set('name', 'Jane')

      expect(callback).toHaveBeenCalledWith({
        key: 'name',
        value: 'Jane',
        oldValue: 'John',
        item: items[0],
      })
    })
  })

  describe('edge cases', () => {
    it('should handle null and undefined values', () => {
      const binding = new DataBinding({ value: null })

      expect(binding.get('value')).toBeNull()

      binding.set('value', undefined)
      expect(binding.get('value')).toBeUndefined()

      binding.set('nested.value', null)
      expect(binding.get('nested.value')).toBeNull()
    })

    it('should handle circular references in comparison', () => {
      const binding = new DataBinding()

      const obj1: any = { name: 'John' }
      const obj2: any = { name: 'John' }

      binding.set('obj1', obj1)
      binding.set('obj2', obj2)

      expect(binding.get('obj1')).toEqual(obj1)
      expect(binding.get('obj2')).toEqual(obj2)
    })

    it('should handle array modifications', () => {
      const binding = new DataBinding({ items: [1, 2, 3] })
      const callback = vi.fn()

      binding.watch('items', callback)

      // 修改数组
      const items = binding.get('items')
      items.push(4)
      binding.set('items', items)

      expect(callback).toHaveBeenCalled()
      expect(binding.get('items')).toEqual([1, 2, 3, 4])
    })
  })

  describe('cleanup', () => {
    it('should destroy properly', () => {
      const binding = new DataBinding({ name: 'John' })
      const callback = vi.fn()

      binding.watch('name', callback)
      binding.onChange(callback)

      binding.destroy()

      // 设置值不应该触发回调
      binding.set('name', 'Jane')
      expect(callback).not.toHaveBeenCalled()
    })
  })
})
