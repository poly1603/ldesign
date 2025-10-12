/**
 * 认证组合式函数
 * 管理用户登录状态、用户信息等
 */

import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import { storage } from '@/utils/storage'

// 全局用户状态
const currentUser = ref<User | null>(null)
const isLoading = ref(false)

/**
 * 用户认证组合式函数
 */
export function useAuth() {

  // 计算属性
  const isLoggedIn = computed(() => !!currentUser.value)
  
  const userInfo = computed(() => currentUser.value)
  
  const userRoles = computed(() => currentUser.value?.roles || [])

  /**
   * 初始化认证状态
   * 从本地存储恢复用户信息
   */
  const initAuth = () => {
    const storedUser = storage.get('user')
    const token = storage.get('token')
    
    if (storedUser && token) {
      currentUser.value = storedUser
    }
  }

  /**
   * 登录
   */
  const login = async (credentials: { username: string; password: string }) => {
    isLoading.value = true
    
    try {
      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 验证凭据
      const validCredentials = [
        { username: 'admin', password: 'admin' },
        { username: 'user', password: 'user' }
      ]
      
      const isValid = validCredentials.some(
        cred => cred.username === credentials.username && cred.password === credentials.password
      )
      
      if (!isValid) {
        return { success: false, error: '用户名或密码错误' }
      }
      
      // 模拟用户数据
      const userData: User = {
        id: '1',
        username: credentials.username,
        name: credentials.username === 'admin' ? '管理员' : '普通用户',
        email: `${credentials.username}@example.com`,
        roles: credentials.username === 'admin' ? ['admin', 'user'] : ['user'],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.username}`,
        createdAt: new Date().toISOString()
      }
      
      // 模拟token
      const token = btoa(`${credentials.username}:${Date.now()}`)
      
      // 保存到状态和本地存储
      currentUser.value = userData
      storage.set('user', userData)
      storage.set('token', token)
      storage.set('isLoggedIn', true)
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: '登录失败' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      // 清除用户状态
      currentUser.value = null
      
      // 清除本地存储
      storage.remove('user')
      storage.remove('token')
      storage.remove('isLoggedIn')
      
      // 返回成功，让调用方处理跳转
      return { success: true }
    } catch (error) {
      console.error('退出登录失败:', error)
      return { success: false, error: '退出失败' }
    }
  }

  /**
   * 检查权限
   */
  const hasRole = (role: string | string[]) => {
    if (!currentUser.value) return false
    
    const roles = Array.isArray(role) ? role : [role]
    return roles.some(r => userRoles.value.includes(r))
  }

  /**
   * 检查是否有权限访问
   */
  const canAccess = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }
    
    if (!isLoggedIn.value) {
      return false
    }
    
    return hasRole(requiredRoles)
  }

  /**
   * 更新用户信息
   */
  const updateUserInfo = (updates: Partial<User>) => {
    if (currentUser.value) {
      currentUser.value = {
        ...currentUser.value,
        ...updates
      }
      storage.set('user', currentUser.value)
    }
  }

  return {
    // 状态
    currentUser,
    isLoading,
    isLoggedIn,
    userInfo,
    userRoles,
    
    // 方法
    initAuth,
    login,
    logout,
    hasRole,
    canAccess,
    updateUserInfo
  }
}

// 创建全局认证实例（不使用router）
export const auth = {
  // 状态
  currentUser,
  isLoading,
  isLoggedIn: computed(() => !!currentUser.value),
  userInfo: computed(() => currentUser.value),
  userRoles: computed(() => currentUser.value?.roles || []),
  
  // 初始化认证状态
  initAuth() {
    const storedUser = storage.get('user')
    const token = storage.get('token')
    
    if (storedUser && token) {
      currentUser.value = storedUser
    }
  },
  
  // 登录
  async login(credentials: { username: string; password: string }) {
    isLoading.value = true
    
    try {
      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 验证凭据
      const validCredentials = [
        { username: 'admin', password: 'admin' },
        { username: 'user', password: 'user' }
      ]
      
      const isValid = validCredentials.some(
        cred => cred.username === credentials.username && cred.password === credentials.password
      )
      
      if (!isValid) {
        return { success: false, error: '用户名或密码错误' }
      }
      
      // 模拟用户数据
      const userData: User = {
        id: '1',
        username: credentials.username,
        name: credentials.username === 'admin' ? '管理员' : '普通用户',
        email: `${credentials.username}@example.com`,
        roles: credentials.username === 'admin' ? ['admin', 'user'] : ['user'],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.username}`,
        createdAt: new Date().toISOString()
      }
      
      // 模拟token
      const token = btoa(`${credentials.username}:${Date.now()}`)
      
      // 保存到状态和本地存储
      currentUser.value = userData
      storage.set('user', userData)
      storage.set('token', token)
      storage.set('isLoggedIn', true)
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: '登录失败' }
    } finally {
      isLoading.value = false
    }
  },
  
  // 退出登录
  async logout() {
    try {
      // 清除用户状态
      currentUser.value = null
      
      // 清除本地存储
      storage.remove('user')
      storage.remove('token')
      storage.remove('isLoggedIn')
      
      return { success: true }
    } catch (error) {
      console.error('退出登录失败:', error)
      return { success: false, error: '退出失败' }
    }
  },
  
  // 检查权限
  hasRole(role: string | string[]) {
    if (!currentUser.value) return false
    
    const roles = Array.isArray(role) ? role : [role]
    return roles.some(r => this.userRoles.value.includes(r))
  },
  
  // 检查是否有权限访问
  canAccess(requiredRoles?: string[]) {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }
    
    if (!this.isLoggedIn.value) {
      return false
    }
    
    return this.hasRole(requiredRoles)
  },
  
  // 更新用户信息
  updateUserInfo(updates: Partial<User>) {
    if (currentUser.value) {
      currentUser.value = {
        ...currentUser.value,
        ...updates
      }
      storage.set('user', currentUser.value)
    }
  }
}
