import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePersistenceStore } from '../../src/stores/persistence/PersistenceStore'

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

describe('persistenceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Reset mock storage
    localStorageMock.getItem.mockReturnValue(null)
    sessionStorageMock.getItem.mockReturnValue(null)
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = usePersistenceStore()

      expect(store.userPreferences).toMatchObject({
        theme: 'light',
        language: 'zh-CN',
        fontSize: 14,
        autoSave: true,
        notifications: true
      })

      expect(store.formData).toMatchObject({
        name: '',
        email: '',
        message: '',
        category: 'general',
        priority: 'medium'
      })

      expect(store.sessionData).toMatchObject({
        visitCount: 0,
        lastVisit: null,
        currentSession: expect.any(String),
        actions: []
      })

      expect(store.recentActions).toEqual([])
      expect(store.storageStats).toMatchObject({
        localStorage: { used: 0, available: 0, items: 0 },
        sessionStorage: { used: 0, available: 0, items: 0 }
      })
    })
  })

  describe('getters', () => {
    it('totalStorageUsed 应该计算总存储使用量', () => {
      const store = usePersistenceStore()

      store.storageStats.localStorage.used = 1024
      store.storageStats.sessionStorage.used = 512

      expect(store.totalStorageUsed).toBe(1536)
    })

    it('storageUsagePercentage 应该计算存储使用百分比', () => {
      const store = usePersistenceStore()

      store.storageStats.localStorage.used = 1024
      store.storageStats.localStorage.available = 10240
      store.storageStats.sessionStorage.used = 512
      store.storageStats.sessionStorage.available = 5120

      const expectedPercentage = ((1024 + 512) / (10240 + 5120)) * 100
      expect(store.storageUsagePercentage).toBeCloseTo(expectedPercentage, 2)
    })

    it('canAutoSave 应该根据用户偏好返回是否可以自动保存', () => {
      const store = usePersistenceStore()

      store.userPreferences.autoSave = true
      expect(store.canAutoSave).toBe(true)

      store.userPreferences.autoSave = false
      expect(store.canAutoSave).toBe(false)
    })

    it('isFormValid 应该验证表单数据', () => {
      const store = usePersistenceStore()

      // 空表单应该无效
      expect(store.isFormValid).toBe(false)

      // 填写必要字段
      store.formData.name = 'Test User'
      store.formData.email = 'test@example.com'
      store.formData.message = 'Test message'

      expect(store.isFormValid).toBe(true)
    })

    it('sessionDuration 应该计算会话持续时间', () => {
      const store = usePersistenceStore()
      const now = Date.now()

      store.sessionData.sessionStart = now - 60000 // 1分钟前

      expect(store.sessionDuration).toBeCloseTo(60000, -3) // 允许小误差
    })
  })

  describe('actions', () => {
    it('updateUserPreference 应该更新用户偏好', () => {
      const store = usePersistenceStore()

      store.updateUserPreference('theme', 'dark')
      expect(store.userPreferences.theme).toBe('dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user-preferences',
        expect.stringContaining('"theme":"dark"')
      )
    })

    it('updateFormData 应该更新表单数据', () => {
      const store = usePersistenceStore()

      store.updateFormData('name', 'John Doe')
      expect(store.formData.name).toBe('John Doe')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'form-data',
        expect.stringContaining('"name":"John Doe"')
      )
    })

    it('saveFormData 应该保存表单数据', () => {
      const store = usePersistenceStore()

      store.formData.name = 'Test User'
      store.formData.email = 'test@example.com'

      store.saveFormData()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'form-data',
        expect.stringContaining('"name":"Test User"')
      )
    })

    it('loadFormData 应该加载表单数据', () => {
      const store = usePersistenceStore()
      const savedData = {
        name: 'Saved User',
        email: 'saved@example.com',
        message: 'Saved message',
        category: 'support',
        priority: 'high'
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData))

      store.loadFormData()

      expect(store.formData).toMatchObject(savedData)
    })

    it('clearFormData 应该清空表单数据', () => {
      const store = usePersistenceStore()

      store.formData.name = 'Test'
      store.clearFormData()

      expect(store.formData.name).toBe('')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('form-data')
    })

    it('addRecentAction 应该添加最近操作', () => {
      const store = usePersistenceStore()

      store.addRecentAction('测试操作')

      expect(store.recentActions).toHaveLength(1)
      expect(store.recentActions[0]).toMatchObject({
        action: '测试操作',
        timestamp: expect.any(Number)
      })
    })

    it('addRecentAction 应该限制操作数量', () => {
      const store = usePersistenceStore()

      // 添加超过限制的操作
      for (let i = 0; i < 15; i++) {
        store.addRecentAction(`操作 ${i}`)
      }

      expect(store.recentActions).toHaveLength(10) // 最多保留10个
    })

    it('clearRecentActions 应该清空最近操作', () => {
      const store = usePersistenceStore()

      store.addRecentAction('测试操作')
      store.clearRecentActions()

      expect(store.recentActions).toHaveLength(0)
    })

    it('exportData 应该导出数据', () => {
      const store = usePersistenceStore()

      store.userPreferences.theme = 'dark'
      store.formData.name = 'Test User'

      const exportedData = store.exportData()

      expect(exportedData).toMatchObject({
        userPreferences: expect.objectContaining({ theme: 'dark' }),
        formData: expect.objectContaining({ name: 'Test User' }),
        recentActions: expect.any(Array),
        exportDate: expect.any(String)
      })
    })

    it('importData 应该导入数据', () => {
      const store = usePersistenceStore()

      const importData = {
        userPreferences: { theme: 'dark', language: 'en-US' },
        formData: { name: 'Imported User', email: 'imported@example.com' },
        recentActions: [{ action: '导入操作', timestamp: Date.now() }]
      }

      store.importData(importData)

      expect(store.userPreferences.theme).toBe('dark')
      expect(store.formData.name).toBe('Imported User')
      expect(store.recentActions).toHaveLength(1)
    })

    it('clearAllData 应该清空所有数据', () => {
      const store = usePersistenceStore()

      store.userPreferences.theme = 'dark'
      store.formData.name = 'Test'
      store.addRecentAction('测试')

      store.clearAllData()

      expect(store.userPreferences.theme).toBe('light')
      expect(store.formData.name).toBe('')
      expect(store.recentActions).toHaveLength(0)
      expect(localStorageMock.clear).toHaveBeenCalled()
      expect(sessionStorageMock.clear).toHaveBeenCalled()
    })

    it('updateStorageStats 应该更新存储统计', () => {
      const store = usePersistenceStore()

      // Mock storage methods
      localStorageMock.length = 2
      localStorageMock.key = vi.fn()
        .mockReturnValueOnce('key1')
        .mockReturnValueOnce('key2')

      localStorageMock.getItem = vi.fn()
        .mockReturnValueOnce('value1')
        .mockReturnValueOnce('value2')

      store.updateStorageStats()

      expect(store.storageStats.localStorage.items).toBe(2)
      expect(store.storageStats.localStorage.used).toBeGreaterThan(0)
    })

    it('initializePersistence 应该初始化持久化', () => {
      const store = usePersistenceStore()

      const savedPreferences = { theme: 'dark' }
      const savedFormData = { name: 'Saved User' }

      localStorageMock.getItem = vi.fn((key) => {
        if (key === 'user-preferences') return JSON.stringify(savedPreferences)
        if (key === 'form-data') return JSON.stringify(savedFormData)
        return null
      })

      store.initializePersistence()

      expect(store.userPreferences.theme).toBe('dark')
      expect(store.formData.name).toBe('Saved User')
    })
  })

  describe('自动保存功能', () => {
    it('应该在用户偏好变化时自动保存', () => {
      const store = usePersistenceStore()

      store.userPreferences.autoSave = true
      store.updateUserPreference('theme', 'dark')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user-preferences',
        expect.stringContaining('"theme":"dark"')
      )
    })

    it('应该在表单数据变化时自动保存', () => {
      const store = usePersistenceStore()

      store.userPreferences.autoSave = true
      store.updateFormData('name', 'Auto Saved')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'form-data',
        expect.stringContaining('"name":"Auto Saved"')
      )
    })
  })

  describe('边界情况', () => {
    it('应该处理存储异常', () => {
      const store = usePersistenceStore()

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      expect(() => store.updateUserPreference('theme', 'dark')).not.toThrow()
    })

    it('应该处理无效的JSON数据', () => {
      const store = usePersistenceStore()

      localStorageMock.getItem.mockReturnValue('invalid json')

      expect(() => store.loadFormData()).not.toThrow()
    })

    it('应该处理空的导入数据', () => {
      const store = usePersistenceStore()

      expect(() => store.importData({})).not.toThrow()
    })

    it('应该处理不存在的存储键', () => {
      const store = usePersistenceStore()

      localStorageMock.getItem.mockReturnValue(null)

      expect(() => store.loadFormData()).not.toThrow()
    })
  })
})
