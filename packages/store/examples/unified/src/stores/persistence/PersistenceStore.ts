import { defineStore } from 'pinia'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh' | 'en'
  fontSize: number
  sidebarCollapsed: boolean
  notifications: boolean
  autoSave: boolean
}

export interface FormData {
  name: string
  email: string
  phone: string
  address: string
  bio: string
  interests: string[]
  newsletter: boolean
}

export interface SessionData {
  loginTime: number
  lastActivity: number
  pageViews: number
  currentPage: string
  visitHistory: string[]
}

/**
 * 持久化示例 Store
 *
 * 展示 localStorage、sessionStorage 等持久化功能
 */
export const usePersistenceStore = defineStore('persistence', {
  state: () => ({
    // 用户偏好设置（localStorage）
    userPreferences: {
      theme: 'light',
      language: 'zh',
      fontSize: 14,
      sidebarCollapsed: false,
      notifications: true,
      autoSave: true
    } as UserPreferences,

    // 表单数据（localStorage）
    formData: {
      name: '',
      email: '',
      phone: '',
      address: '',
      bio: '',
      interests: [],
      newsletter: false
    } as FormData,

    // 会话数据（sessionStorage）
    sessionData: {
      loginTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      currentPage: '/',
      visitHistory: []
    } as SessionData,

    // 临时数据（不持久化）
    tempData: {
      searchHistory: [] as string[],
      recentActions: [] as string[],
      notifications: [] as Array<{
        id: string
        type: 'info' | 'success' | 'warning' | 'error'
        message: string
        timestamp: number
      }>
    },

    // 持久化状态
    persistenceStatus: {
      localStorage: {
        available: false,
        used: 0,
        quota: 0,
        items: 0
      },
      sessionStorage: {
        available: false,
        used: 0,
        quota: 0,
        items: 0
      },
      lastSaved: null as number | null,
      autoSaveEnabled: true
    }
  }),

  actions: {
    // 初始化持久化
    initializePersistence() {
      this.checkStorageAvailability()
      this.loadFromStorage()
      this.updateStorageStats()

      // 设置自动保存
      if (this.persistenceStatus.autoSaveEnabled) {
        this.setupAutoSave()
      }
    },

    // 检查存储可用性
    checkStorageAvailability() {
      try {
        const testKey = '__storage_test__'

        // 测试 localStorage
        localStorage.setItem(testKey, 'test')
        localStorage.removeItem(testKey)
        this.persistenceStatus.localStorage.available = true

        // 测试 sessionStorage
        sessionStorage.setItem(testKey, 'test')
        sessionStorage.removeItem(testKey)
        this.persistenceStatus.sessionStorage.available = true
      } catch (error) {
        console.warn('Storage not available:', error)
      }
    },

    // 从存储加载数据
    loadFromStorage() {
      try {
        // 从 localStorage 加载用户偏好
        const savedPreferences = localStorage.getItem('userPreferences')
        if (savedPreferences) {
          this.userPreferences = { ...this.userPreferences, ...JSON.parse(savedPreferences) }
        }

        // 从 localStorage 加载表单数据
        const savedFormData = localStorage.getItem('formData')
        if (savedFormData) {
          this.formData = { ...this.formData, ...JSON.parse(savedFormData) }
        }

        // 从 sessionStorage 加载会话数据
        const savedSessionData = sessionStorage.getItem('sessionData')
        if (savedSessionData) {
          this.sessionData = { ...this.sessionData, ...JSON.parse(savedSessionData) }
        }
      } catch (error) {
        console.error('Failed to load from storage:', error)
      }
    },

    // 保存到存储
    saveToStorage(showNotification = false) {
      try {
        // 保存用户偏好到 localStorage
        localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences))

        // 保存表单数据到 localStorage
        localStorage.setItem('formData', JSON.stringify(this.formData))

        // 保存会话数据到 sessionStorage
        sessionStorage.setItem('sessionData', JSON.stringify(this.sessionData))

        this.persistenceStatus.lastSaved = Date.now()
        this.updateStorageStats()

        if (showNotification) {
          this.addNotification('success', '数据已保存到本地存储')
        }
      } catch (error) {
        console.error('Failed to save to storage:', error)
        this.addNotification('error', `保存失败: ${(error as Error).message}`)
      }
    },

    // 更新存储统计
    updateStorageStats() {
      try {
        // localStorage 统计
        if (this.persistenceStatus.localStorage.available) {
          let localStorageSize = 0
          let localStorageItems = 0

          for (const key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
              localStorageSize += localStorage[key].length + key.length
              localStorageItems++
            }
          }

          this.persistenceStatus.localStorage.used = localStorageSize
          this.persistenceStatus.localStorage.items = localStorageItems

          // 估算配额（通常是 5-10MB）
          this.persistenceStatus.localStorage.quota = 5 * 1024 * 1024
        }

        // sessionStorage 统计
        if (this.persistenceStatus.sessionStorage.available) {
          let sessionStorageSize = 0
          let sessionStorageItems = 0

          for (const key in sessionStorage) {
            if (Object.prototype.hasOwnProperty.call(sessionStorage, key)) {
              sessionStorageSize += sessionStorage[key].length + key.length
              sessionStorageItems++
            }
          }

          this.persistenceStatus.sessionStorage.used = sessionStorageSize
          this.persistenceStatus.sessionStorage.items = sessionStorageItems
          this.persistenceStatus.sessionStorage.quota = 5 * 1024 * 1024
        }
      } catch (error) {
        console.error('Failed to update storage stats:', error)
      }
    },

    // 设置自动保存
    setupAutoSave() {
      // 监听特定数据变化并自动保存
      this.$subscribe((mutation, state) => {
        if (mutation.storeId === 'persistence' && this.userPreferences.autoSave) {
          // 简化自动保存逻辑，避免复杂的 mutation 检查
          // 延迟保存，避免频繁操作，且不显示通知
          setTimeout(() => {
            this.saveToStorage(false)
          }, 1000)
        }
      })
    },

    // 更新用户偏好
    updateUserPreferences(preferences: Partial<UserPreferences>) {
      this.userPreferences = { ...this.userPreferences, ...preferences }
      if (this.userPreferences.autoSave) {
        this.saveToStorage(false) // 自动保存不显示通知
      }
    },

    // 更新表单数据
    updateFormData(data: Partial<FormData>) {
      this.formData = { ...this.formData, ...data }
      if (this.userPreferences.autoSave) {
        this.saveToStorage(false) // 自动保存不显示通知
      }
    },

    // 更新会话数据
    updateSessionData(data: Partial<SessionData>) {
      this.sessionData = { ...this.sessionData, ...data }
      this.sessionData.lastActivity = Date.now()

      // 会话数据总是自动保存到 sessionStorage
      try {
        sessionStorage.setItem('sessionData', JSON.stringify(this.sessionData))
      } catch (error) {
        console.error('Failed to save session data:', error)
      }
    },

    // 添加搜索历史
    addSearchHistory(query: string) {
      if (query && !this.tempData.searchHistory.includes(query)) {
        this.tempData.searchHistory.unshift(query)
        // 限制历史记录数量
        if (this.tempData.searchHistory.length > 10) {
          this.tempData.searchHistory.pop()
        }
      }
    },

    // 添加操作记录
    addRecentAction(action: string) {
      this.tempData.recentActions.unshift(`${new Date().toLocaleTimeString()}: ${action}`)
      if (this.tempData.recentActions.length > 20) {
        this.tempData.recentActions.pop()
      }
    },

    // 添加通知
    addNotification(type: 'info' | 'success' | 'warning' | 'error', message: string) {
      const notification = {
        id: Date.now().toString(),
        type,
        message,
        timestamp: Date.now()
      }

      this.tempData.notifications.unshift(notification)

      // 自动移除通知
      setTimeout(() => {
        this.removeNotification(notification.id)
      }, 5000)
    },

    // 移除通知
    removeNotification(id: string) {
      const index = this.tempData.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.tempData.notifications.splice(index, 1)
      }
    },

    // 清空存储
    clearStorage(type: 'localStorage' | 'sessionStorage' | 'all') {
      try {
        if (type === 'localStorage' || type === 'all') {
          localStorage.clear()
          this.addNotification('info', 'localStorage 已清空')
        }

        if (type === 'sessionStorage' || type === 'all') {
          sessionStorage.clear()
          this.addNotification('info', 'sessionStorage 已清空')
        }

        // 重新初始化
        this.initializePersistence()
      } catch (error) {
        console.error('Failed to clear storage:', error)
        this.addNotification('error', '清空存储失败')
      }
    },

    // 导出数据
    exportData() {
      const exportData = {
        userPreferences: this.userPreferences,
        formData: this.formData,
        sessionData: this.sessionData,
        exportTime: new Date().toISOString()
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `persistence-data-${Date.now()}.json`
      link.click()

      URL.revokeObjectURL(url)
      this.addNotification('success', '数据已导出')
    },

    // 导入数据
    importData(file: File) {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string)

          if (importData.userPreferences) {
            this.userPreferences = { ...this.userPreferences, ...importData.userPreferences }
          }

          if (importData.formData) {
            this.formData = { ...this.formData, ...importData.formData }
          }

          if (importData.sessionData) {
            this.sessionData = { ...this.sessionData, ...importData.sessionData }
          }

          this.saveToStorage(false) // 导入时不显示保存通知，只显示导入通知
          this.addNotification('success', '数据已导入')
        } catch (error) {
          console.error('Failed to import data:', error)
          this.addNotification('error', '导入数据失败')
        }
      }

      reader.readAsText(file)
    }
  },

  getters: {
    // 存储使用率
    storageUsage: (state) => ({
      localStorage: state.persistenceStatus.localStorage.quota > 0
        ? (state.persistenceStatus.localStorage.used / state.persistenceStatus.localStorage.quota) * 100
        : 0,
      sessionStorage: state.persistenceStatus.sessionStorage.quota > 0
        ? (state.persistenceStatus.sessionStorage.used / state.persistenceStatus.sessionStorage.quota) * 100
        : 0
    }),

    // 格式化存储大小
    formattedStorageSize: (state) => ({
      localStorage: {
        used: `${(state.persistenceStatus.localStorage.used / 1024).toFixed(2)} KB`,
        quota: `${(state.persistenceStatus.localStorage.quota / 1024 / 1024).toFixed(2)} MB`
      },
      sessionStorage: {
        used: `${(state.persistenceStatus.sessionStorage.used / 1024).toFixed(2)} KB`,
        quota: `${(state.persistenceStatus.sessionStorage.quota / 1024 / 1024).toFixed(2)} MB`
      }
    }),

    // 会话时长
    sessionDuration: (state) => {
      return Date.now() - state.sessionData.loginTime
    },

    // 最后活动时间
    lastActivityFormatted: (state) => {
      const diff = Date.now() - state.sessionData.lastActivity
      const minutes = Math.floor(diff / 60000)

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes} 分钟前`

      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours} 小时前`

      const days = Math.floor(hours / 24)
      return `${days} 天前`
    }
  }
})
