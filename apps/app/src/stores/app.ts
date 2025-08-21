/**
 * 应用全局状态管理
 *
 * 管理应用的全局状态，包括：
 * - 用户认证状态
 * - 通知系统
 * - 应用配置
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// 通知接口
export interface Notification {
  id?: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  duration?: number
  timestamp?: number
}

export const useAppStore = defineStore('app', () => {
  // ==================== 状态 ====================

  // 用户认证
  const isAuthenticated = ref(false)
  const userInfo = ref<any>(null)

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
        }),
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

  // 添加通知
  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp'>,
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
    }
    else {
      keepAliveComponents.value.push(componentName)
    }
  }

  return {
    // 状态
    isAuthenticated,
    userInfo,
    notifications,
    keepAliveComponents,
    theme,
    language,

    // 计算属性
    unreadNotificationsCount,

    // 方法
    initialize,
    login,
    logout,
    addNotification,
    removeNotification,
    clearNotifications,
    toggleTheme,
    toggleLanguage,
    toggleKeepAlive,
  }
})
