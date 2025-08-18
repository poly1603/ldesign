/**
 * 应用全局状态管理
 *
 * 管理应用的全局状态，包括：
 * - 用户认证状态
 * - 性能监控数据
 * - 通知系统
 * - 应用配置
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 导航记录接口
export interface NavigationRecord {
  from: string
  to: string
  duration: number
  timestamp: number
}

// 通知接口
export interface Notification {
  id?: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  duration?: number
  timestamp?: number
}

// 性能统计接口
export interface PerformanceStats {
  totalNavigations: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  lastNavigationDuration: number
}

export const useAppStore = defineStore('app', () => {
  // ==================== 状态 ====================

  // 用户认证
  const isAuthenticated = ref(false)
  const userInfo = ref<any>(null)

  // 性能监控
  const showPerformanceMonitor = ref(false)
  const navigationStartTime = ref(0)
  const navigationRecords = ref<NavigationRecord[]>([])

  // 通知系统
  const notifications = ref<Notification[]>([])

  // 应用配置
  const keepAliveComponents = ref<string[]>([
    'Home',
    'BasicRouting',
    'Documentation',
  ])
  const theme = ref<'light' | 'dark'>('light')
  const language = ref<'zh-CN' | 'en-US'>('zh-CN')

  // ==================== 计算属性 ====================

  // 性能统计
  const performanceStats = computed<PerformanceStats>(() => {
    const records = navigationRecords.value
    if (records.length === 0) {
      return {
        totalNavigations: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        lastNavigationDuration: 0,
      }
    }

    const durations = records.map(r => r.duration)
    const total = durations.reduce((sum, d) => sum + d, 0)

    return {
      totalNavigations: records.length,
      averageDuration: total / records.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      lastNavigationDuration: durations[durations.length - 1] || 0,
    }
  })

  // 最近的导航记录（最多保留 50 条）
  const recentNavigationRecords = computed(() => {
    return navigationRecords.value.slice(-50)
  })

  // 未读通知数量
  const unreadNotificationsCount = computed(() => {
    return notifications.value.length
  })

  // ==================== 方法 ====================

  // 初始化应用
  const initialize = () => {
    // 从本地存储恢复状态
    const savedAuth = localStorage.getItem('app_auth')
    if (savedAuth) {
      const authData = JSON.parse(savedAuth)
      isAuthenticated.value = authData.isAuthenticated
      userInfo.value = authData.userInfo
    }

    const savedTheme = localStorage.getItem('app_theme')
    if (savedTheme) {
      theme.value = savedTheme as 'light' | 'dark'
    }

    const savedLanguage = localStorage.getItem('app_language')
    if (savedLanguage) {
      language.value = savedLanguage as 'zh-CN' | 'en-US'
    }

    console.log('📱 应用状态已初始化')
  }

  // 用户登录
  const login = (username: string, password: string) => {
    // 模拟登录验证
    if (username === 'admin' && password === 'admin') {
      isAuthenticated.value = true
      userInfo.value = {
        id: 1,
        username: 'admin',
        name: '管理员',
        avatar: '/avatar.jpg',
        role: 'admin',
      }

      // 保存到本地存储
      localStorage.setItem(
        'app_auth',
        JSON.stringify({
          isAuthenticated: true,
          userInfo: userInfo.value,
        })
      )

      addNotification({
        type: 'success',
        title: '登录成功',
        message: `欢迎回来，${userInfo.value.name}！`,
      })

      return true
    }

    addNotification({
      type: 'error',
      title: '登录失败',
      message: '用户名或密码错误',
    })

    return false
  }

  // 用户登出
  const logout = () => {
    isAuthenticated.value = false
    userInfo.value = null

    // 清除本地存储
    localStorage.removeItem('app_auth')

    addNotification({
      type: 'info',
      title: '已登出',
      message: '您已成功登出系统',
    })
  }

  // 设置导航开始时间
  const setNavigationStartTime = (time: number) => {
    navigationStartTime.value = time
  }

  // 添加导航记录
  const addNavigationRecord = (record: NavigationRecord) => {
    navigationRecords.value.push(record)

    // 限制记录数量，避免内存泄漏
    if (navigationRecords.value.length > 1000) {
      navigationRecords.value = navigationRecords.value.slice(-500)
    }
  }

  // 清除导航记录
  const clearNavigationRecords = () => {
    navigationRecords.value = []
  }

  // 切换性能监控显示
  const togglePerformanceMonitor = (show?: boolean) => {
    showPerformanceMonitor.value =
      show !== undefined ? show : !showPerformanceMonitor.value
  }

  // 添加通知
  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => {
    const id = Date.now().toString()
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration || 5000,
    }

    notifications.value.push(newNotification)

    // 自动移除通知
    setTimeout(() => {
      removeNotification(id)
    }, newNotification.duration)
  }

  // 移除通知
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // 清除所有通知
  const clearNotifications = () => {
    notifications.value = []
  }

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('app_theme', theme.value)
  }

  // 切换语言
  const toggleLanguage = () => {
    language.value = language.value === 'zh-CN' ? 'en-US' : 'zh-CN'
    localStorage.setItem('app_language', language.value)
  }

  // 添加/移除 KeepAlive 组件
  const toggleKeepAlive = (componentName: string) => {
    const index = keepAliveComponents.value.indexOf(componentName)
    if (index > -1) {
      keepAliveComponents.value.splice(index, 1)
    } else {
      keepAliveComponents.value.push(componentName)
    }
  }

  return {
    // 状态
    isAuthenticated,
    userInfo,
    showPerformanceMonitor,
    navigationStartTime,
    navigationRecords,
    notifications,
    keepAliveComponents,
    theme,
    language,

    // 计算属性
    performanceStats,
    recentNavigationRecords,
    unreadNotificationsCount,

    // 方法
    initialize,
    login,
    logout,
    setNavigationStartTime,
    addNavigationRecord,
    clearNavigationRecords,
    togglePerformanceMonitor,
    addNotification,
    removeNotification,
    clearNotifications,
    toggleTheme,
    toggleLanguage,
    toggleKeepAlive,
  }
})
