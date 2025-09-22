import { defineStore } from 'pinia'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  fontSize: number
  sidebarCollapsed: boolean
  notifications: boolean
  autoSave: boolean
}

export interface FormData {
  name: string
  email: string
  message: string
  category: 'general' | 'support' | 'feedback'
  priority: 'low' | 'medium' | 'high'
}

export interface SessionData {
  visitCount: number
  lastVisit: number | null
  currentSession: string
  sessionStart: number
  actions: Array<{
    action: string
    timestamp: number
  }>
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
      language: 'zh-CN',
      fontSize: 14,
      sidebarCollapsed: false,
      notifications: true,
      autoSave: true
    } as UserPreferences,

    // 表单数据（localStorage）
    formData: {
      name: '',
      email: '',
      message: '',
      category: 'general',
      priority: 'medium'
    } as FormData,

    // 会话数据（sessionStorage）
    sessionData: {
      visitCount: 0,
      lastVisit: null,
      currentSession: Math.random().toString(36).substr(2, 9),
      sessionStart: Date.now(),
      actions: []
    } as SessionData,

    // 最近操作
    recentActions: [] as Array<{
      action: string
      timestamp: number
    }>,

    // 存储统计
    storageStats: {
      localStorage: {
        used: 0,
        available: 0,
        items: 0
      },
      sessionStorage: {
        used: 0,
        available: 0,
        items: 0
      }
    }
  }),

  actions: {
    // 更新用户偏好
    updateUserPreference(key: keyof UserPreferences, value: any) {
      this.userPreferences[key] = value
      if (this.userPreferences.autoSave) {
        try {
          localStorage.setItem('user-preferences', JSON.stringify(this.userPreferences))
        } catch (error) {
          console.error('Failed to save user preferences:', error)
        }
      }
    },

    // 更新表单数据
    updateFormData(key: keyof FormData, value: any) {
      this.formData[key] = value
      if (this.userPreferences.autoSave) {
        localStorage.setItem('form-data', JSON.stringify(this.formData))
      }
    },

    // 保存表单数据
    saveFormData() {
      localStorage.setItem('form-data', JSON.stringify(this.formData))
    },

    // 加载表单数据
    loadFormData() {
      try {
        const saved = localStorage.getItem('form-data')
        if (saved) {
          this.formData = { ...this.formData, ...JSON.parse(saved) }
        }
      } catch (error) {
        console.error('Failed to load form data:', error)
      }
    },

    // 清空表单数据
    clearFormData() {
      this.formData = {
        name: '',
        email: '',
        message: '',
        category: 'general',
        priority: 'medium'
      }
      localStorage.removeItem('form-data')
    },

    // 添加最近操作
    addRecentAction(action: string) {
      const actionItem = {
        action,
        timestamp: Date.now()
      }
      this.recentActions.unshift(actionItem)

      // 限制数量为10个
      if (this.recentActions.length > 10) {
        this.recentActions = this.recentActions.slice(0, 10)
      }
    },

    // 清空最近操作
    clearRecentActions() {
      this.recentActions = []
    },

    // 导出数据
    exportData() {
      return {
        userPreferences: this.userPreferences,
        formData: this.formData,
        recentActions: this.recentActions,
        exportDate: new Date().toISOString()
      }
    },

    // 导入数据
    importData(data: any) {
      if (data.userPreferences) {
        this.userPreferences = { ...this.userPreferences, ...data.userPreferences }
      }
      if (data.formData) {
        this.formData = { ...this.formData, ...data.formData }
      }
      if (data.recentActions) {
        this.recentActions = data.recentActions
      }
    },

    // 清空所有数据
    clearAllData() {
      // 重置到初始状态
      this.userPreferences = {
        theme: 'light',
        language: 'zh-CN',
        fontSize: 14,
        sidebarCollapsed: false,
        notifications: true,
        autoSave: true
      }
      this.formData = {
        name: '',
        email: '',
        message: '',
        category: 'general',
        priority: 'medium'
      }
      this.recentActions = []

      // 清空存储
      localStorage.clear()
      sessionStorage.clear()
    },

    // 保存到存储 (用于性能测试)
    saveToStorage(force: boolean = false) {
      if (force || this.userPreferences.autoSave) {
        try {
          localStorage.setItem('user-preferences', JSON.stringify(this.userPreferences))
          localStorage.setItem('form-data', JSON.stringify(this.formData))
          localStorage.setItem('recent-actions', JSON.stringify(this.recentActions))
        } catch (error) {
          console.error('Failed to save to storage:', error)
        }
      }
    },

    // 更新会话数据 (用于性能测试)
    updateSessionData(data: Partial<SessionData>) {
      this.sessionData = { ...this.sessionData, ...data }
    },

    // 更新存储统计
    updateStorageStats() {
      try {
        // localStorage 统计
        let localStorageSize = 0
        let localStorageItems = 0

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) {
            const value = localStorage.getItem(key)
            if (value) {
              localStorageSize += value.length + key.length
            }
            localStorageItems++
          }
        }

        this.storageStats.localStorage.used = localStorageSize
        this.storageStats.localStorage.items = localStorageItems
        this.storageStats.localStorage.available = 5 * 1024 * 1024 // 5MB

        // sessionStorage 统计
        let sessionStorageSize = 0
        let sessionStorageItems = 0

        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key) {
            const value = sessionStorage.getItem(key)
            if (value) {
              sessionStorageSize += value.length + key.length
            }
            sessionStorageItems++
          }
        }

        this.storageStats.sessionStorage.used = sessionStorageSize
        this.storageStats.sessionStorage.items = sessionStorageItems
        this.storageStats.sessionStorage.available = 5 * 1024 * 1024 // 5MB
      } catch (error) {
        console.error('Failed to update storage stats:', error)
      }
    },

    // 初始化持久化
    initializePersistence() {
      try {
        // 加载用户偏好
        const savedPreferences = localStorage.getItem('user-preferences')
        if (savedPreferences) {
          this.userPreferences = { ...this.userPreferences, ...JSON.parse(savedPreferences) }
        }

        // 加载表单数据
        this.loadFormData()

        // 更新存储统计
        this.updateStorageStats()
      } catch (error) {
        console.error('Failed to initialize persistence:', error)
      }
    }
  },

  getters: {
    // 总存储使用量
    totalStorageUsed: (state) => {
      return state.storageStats.localStorage.used + state.storageStats.sessionStorage.used
    },

    // 存储使用百分比
    storageUsagePercentage: (state) => {
      const totalUsed = state.storageStats.localStorage.used + state.storageStats.sessionStorage.used
      const totalAvailable = state.storageStats.localStorage.available + state.storageStats.sessionStorage.available
      return totalAvailable > 0 ? (totalUsed / totalAvailable) * 100 : 0
    },

    // 是否可以自动保存
    canAutoSave: (state) => {
      return state.userPreferences.autoSave
    },

    // 表单是否有效
    isFormValid: (state) => {
      return !!(state.formData.name && state.formData.email && state.formData.message)
    },

    // 会话持续时间
    sessionDuration: (state) => {
      return Date.now() - state.sessionData.sessionStart
    }
  }
})
