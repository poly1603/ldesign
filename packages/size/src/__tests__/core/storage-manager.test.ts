/**
 * 存储管理器测试
 */

import type { SizeMode } from '../../types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSizeStorageManager, createStorageManager, SizeStorageManager, StorageManager } from '../../core/storage-manager'

// Mock localStorage
const mockStorage = {
  data: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockStorage.data.get(key) || null),
  setItem: vi.fn((key: string, value: string) => mockStorage.data.set(key, value)),
  removeItem: vi.fn((key: string) => mockStorage.data.delete(key)),
  clear: vi.fn(() => mockStorage.data.clear()),
  key: vi.fn((index: number) => Array.from(mockStorage.data.keys())[index] || null),
  get length() { return mockStorage.data.size },
}

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
})

describe('storageManager', () => {
  let storageManager: StorageManager

  beforeEach(() => {
    mockStorage.data.clear()
    vi.clearAllMocks()
    storageManager = new StorageManager()
  })

  afterEach(() => {
    storageManager.destroy()
  })

  describe('基础功能', () => {
    it('应该能够设置和获取值', () => {
      const key = 'test-key'
      const value = { name: 'test', count: 42 }

      storageManager.set(key, value)
      const retrieved = storageManager.get(key)

      expect(retrieved).toEqual(value)
    })

    it('应该能够移除值', () => {
      const key = 'test-key'
      const value = 'test-value'

      storageManager.set(key, value)
      expect(storageManager.has(key)).toBe(true)

      storageManager.remove(key)
      expect(storageManager.has(key)).toBe(false)
      expect(storageManager.get(key)).toBeUndefined()
    })

    it('应该能够检查键是否存在', () => {
      const key = 'test-key'
      const value = 'test-value'

      expect(storageManager.has(key)).toBe(false)

      storageManager.set(key, value)
      expect(storageManager.has(key)).toBe(true)
    })

    it('应该能够获取所有键', () => {
      storageManager.set('key1', 'value1')
      storageManager.set('key2', 'value2')
      storageManager.set('key3', 'value3')

      const keys = storageManager.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
      expect(keys).toHaveLength(3)
    })

    it('应该能够清空所有值', () => {
      storageManager.set('key1', 'value1')
      storageManager.set('key2', 'value2')

      expect(storageManager.keys()).toHaveLength(2)

      storageManager.clear()
      expect(storageManager.keys()).toHaveLength(0)
    })
  })

  describe('配置选项', () => {
    it('应该使用自定义前缀', () => {
      const customManager = new StorageManager({ prefix: 'custom-prefix' })
      customManager.set('test', 'value')

      expect(mockStorage.setItem).toHaveBeenCalledWith('custom-prefix-test', '"value"')
      customManager.destroy()
    })

    it('应该支持内存存储', () => {
      const memoryManager = new StorageManager({ type: 'memory' })

      memoryManager.set('test', 'value')
      expect(memoryManager.get('test')).toBe('value')

      // 不应该调用 localStorage
      expect(mockStorage.setItem).not.toHaveBeenCalled()

      memoryManager.destroy()
    })

    it('应该支持禁用存储', () => {
      const disabledManager = new StorageManager({ enabled: false })

      disabledManager.set('test', 'value')
      expect(disabledManager.get('test')).toBe('value')

      // 不应该调用 localStorage
      expect(mockStorage.setItem).not.toHaveBeenCalled()

      disabledManager.destroy()
    })
  })

  describe('错误处理', () => {
    it('应该处理 JSON 解析错误', () => {
      // 直接设置无效的 JSON
      mockStorage.data.set('ldesign-size-invalid', 'invalid-json')

      const result = storageManager.get('invalid', 'default')
      expect(result).toBe('default')
    })

    it('应该处理存储异常', () => {
      // Mock setItem 抛出异常
      mockStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded')
      })

      // 应该不抛出异常
      expect(() => {
        storageManager.set('test', 'value')
      }).not.toThrow()
    })
  })

  describe('默认值', () => {
    it('应该返回默认值当键不存在时', () => {
      const defaultValue = { default: true }
      const result = storageManager.get('non-existent', defaultValue)
      expect(result).toEqual(defaultValue)
    })

    it('应该返回 undefined 当没有默认值时', () => {
      const result = storageManager.get('non-existent')
      expect(result).toBeUndefined()
    })
  })
})

describe('sizeStorageManager', () => {
  let sizeStorageManager: SizeStorageManager

  beforeEach(() => {
    mockStorage.data.clear()
    vi.clearAllMocks()
    sizeStorageManager = new SizeStorageManager()
  })

  afterEach(() => {
    sizeStorageManager.destroy()
  })

  describe('尺寸模式管理', () => {
    it('应该能够保存和获取当前尺寸模式', () => {
      const mode: SizeMode = 'large'

      sizeStorageManager.saveCurrentMode(mode)
      const savedMode = sizeStorageManager.getSavedMode()

      expect(savedMode).toBe(mode)
    })

    it('应该能够移除保存的尺寸模式', () => {
      sizeStorageManager.saveCurrentMode('medium')
      expect(sizeStorageManager.getSavedMode()).toBe('medium')

      sizeStorageManager.removeSavedMode()
      expect(sizeStorageManager.getSavedMode()).toBeUndefined()
    })
  })

  describe('用户偏好管理', () => {
    it('应该能够保存和获取用户偏好', () => {
      const preferences = {
        theme: 'dark',
        autoDetect: true,
        animations: false,
      }

      sizeStorageManager.saveUserPreferences(preferences)
      const savedPreferences = sizeStorageManager.getUserPreferences()

      expect(savedPreferences).toEqual(preferences)
    })

    it('应该返回空对象当没有偏好设置时', () => {
      const preferences = sizeStorageManager.getUserPreferences()
      expect(preferences).toEqual({})
    })

    it('应该能够移除用户偏好', () => {
      sizeStorageManager.saveUserPreferences({ test: true })
      expect(sizeStorageManager.getUserPreferences()).toEqual({ test: true })

      sizeStorageManager.removeUserPreferences()
      expect(sizeStorageManager.getUserPreferences()).toEqual({})
    })
  })
})

describe('工厂函数', () => {
  it('createStorageManager 应该创建新实例', () => {
    const manager1 = createStorageManager()
    const manager2 = createStorageManager()

    expect(manager1).not.toBe(manager2)
    expect(manager1).toBeInstanceOf(StorageManager)

    manager1.destroy()
    manager2.destroy()
  })

  it('createSizeStorageManager 应该创建新实例', () => {
    const manager1 = createSizeStorageManager()
    const manager2 = createSizeStorageManager()

    expect(manager1).not.toBe(manager2)
    expect(manager1).toBeInstanceOf(SizeStorageManager)

    manager1.destroy()
    manager2.destroy()
  })

  it('应该传递选项到新实例', () => {
    const options = { prefix: 'test-prefix', type: 'memory' as const }
    const manager = createStorageManager(options)

    expect(manager.getOptions()).toMatchObject(options)

    manager.destroy()
  })
})

describe('sSR 兼容性', () => {
  it('应该在没有 window 对象时使用内存存储', () => {
    // Mock window 为 undefined
    const originalWindow = global.window
    // @ts-ignore
    delete global.window

    const manager = new StorageManager({ type: 'localStorage' })

    manager.set('test', 'value')
    expect(manager.get('test')).toBe('value')

    // 恢复 window
    global.window = originalWindow

    manager.destroy()
  })
})
