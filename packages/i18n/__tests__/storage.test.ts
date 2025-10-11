/**
 * 存储和检测器测试
 * 测试语言存储和语言检测功能
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDetector } from '../src/core/detector'
import { createStorage } from '../src/core/storage'

describe('存储功能', () => {
  beforeEach(() => {
    // Mock localStorage 和 sessionStorage
    const mockStorage = {
      store: {} as Record<string, string>,
      getItem: vi.fn((key: string) => mockStorage.store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage.store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage.store[key]
      }),
      clear: vi.fn(() => {
        mockStorage.store = {}
      }),
    }

    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      configurable: true,
    })

    Object.defineProperty(window, 'sessionStorage', {
      value: { ...mockStorage, store: {} },
      configurable: true,
    })
  })

  describe('localStorage 存储', () => {
    it('应该正确创建 localStorage 存储', () => {
      const storage = createStorage('localStorage')
      expect(storage).toBeDefined()
    })

    it('应该正确存储和读取语言设置', () => {
      const storage = createStorage('localStorage')

      storage.setLanguage('zh-CN')
      const result = storage.getLanguage()

      expect(result).toBe('zh-CN')
    })

    it('应该正确删除存储项', () => {
      const storage = createStorage('localStorage')

      storage.setLanguage('zh-CN')
      storage.clearLanguage()
      const result = storage.getLanguage()

      expect(result).toBeNull()
    })

    it('应该正确清空语言存储', () => {
      const storage = createStorage('localStorage')

      storage.setLanguage('zh-CN')
      storage.clearLanguage()

      expect(storage.getLanguage()).toBeNull()
    })
  })

  describe('sessionStorage 存储', () => {
    it('应该正确创建 sessionStorage 存储', () => {
      const storage = createStorage('sessionStorage')
      expect(storage).toBeDefined()
    })

    it('应该正确存储和读取数据', () => {
      const storage = createStorage('sessionStorage')

      storage.setLanguage('zh-CN')
      const result = storage.getLanguage()

      expect(result).toBe('zh-CN')
    })
  })

  describe('内存存储', () => {
    it('应该正确创建内存存储', () => {
      const storage = createStorage('memory')
      expect(storage).toBeDefined()
    })

    it('应该正确存储和读取数据', () => {
      const storage = createStorage('memory')

      storage.setLanguage('zh-CN')
      const result = storage.getLanguage()

      expect(result).toBe('zh-CN')
    })

    it('应该在不同实例间隔离数据', () => {
      const storage1 = createStorage('memory')
      const storage2 = createStorage('memory')

      storage1.setLanguage('zh-CN')
      storage2.setLanguage('en-US')

      expect(storage1.getLanguage()).toBe('zh-CN')
      expect(storage2.getLanguage()).toBe('en-US')
    })
  })

  describe('存储配置', () => {
    it('应该支持自定义键前缀', () => {
      const storage = createStorage('localStorage', 'myapp-i18n-locale')

      storage.setLanguage('zh-CN')

      // 直接检查 localStorage 中的键
      if (typeof window !== 'undefined') {
        expect(window.localStorage.getItem('myapp-i18n-locale')).toBe('zh-CN')
      }
    })

    it('应该正确处理语言存储', () => {
      const storage = createStorage('memory')

      storage.setLanguage('zh-CN')
      const result = storage.getLanguage()

      expect(result).toBe('zh-CN')
    })
  })
})

describe('语言检测功能', () => {
  beforeEach(() => {
    // 重置浏览器环境
    vi.clearAllMocks()
  })

  describe('浏览器语言检测', () => {
    it('应该正确检测浏览器语言', () => {
      // Mock navigator.language
      Object.defineProperty(navigator, 'language', {
        value: 'zh-CN',
        configurable: true,
      })

      const detector = createDetector()
      const detected = detector.detect()

      expect(Array.isArray(detected)).toBe(true)
      expect(detected).toContain('zh-CN')
    })

    it('应该正确处理浏览器语言列表', () => {
      // Mock navigator.languages
      Object.defineProperty(navigator, 'languages', {
        value: ['zh-CN', 'en-US', 'en'],
        configurable: true,
      })

      const detector = createDetector()
      const detected = detector.detect()

      expect(Array.isArray(detected)).toBe(true)
      expect(detected[0]).toBe('zh-CN')
    })

    it('应该在浏览器语言不可用时返回空数组', () => {
      // Mock navigator 为 undefined
      Object.defineProperty(window, 'navigator', {
        value: undefined,
        configurable: true,
      })

      const detector = createDetector('browser')
      const detected = detector.detect()

      expect(Array.isArray(detected)).toBe(true)
      expect(detected.length).toBe(0)
    })
  })

  describe('手动检测', () => {
    it('应该支持手动指定语言列表', () => {
      const detector = createDetector('manual', { languages: ['zh-CN', 'en-US'] })
      const detected = detector.detect()

      expect(Array.isArray(detected)).toBe(true)
      expect(detected).toEqual(['zh-CN', 'en-US'])
    })
  })
})
