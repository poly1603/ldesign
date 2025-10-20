/**
 * 用户 Store
 * 用户认证和信息管理
 */

import { defineStore } from '@ldesign/store'
import { ref, computed } from 'vue'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  roles: string[]
}

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  
  // Getters
  const isAuthenticated = computed(() => !!currentUser.value && !!token.value)
  const userName = computed(() => currentUser.value?.username || 'Guest')
  const userRoles = computed(() => currentUser.value?.roles || [])
  const isAdmin = computed(() => userRoles.value.includes('admin'))
  
  // Actions
  async function login(username: string, password: string) {
    isLoading.value = true
    
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟登录成功
      currentUser.value = {
        id: '1',
        username,
        email: `${username}@example.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        roles: username === 'admin' ? ['admin', 'user'] : ['user']
      }
      
      token.value = 'mock-jwt-token-' + Date.now()
      
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  function logout() {
    currentUser.value = null
    token.value = null
  }
  
  async function fetchUserInfo() {
    if (!token.value) return null
    
    isLoading.value = true
    
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 返回用户信息
      return currentUser.value
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    // State
    currentUser,
    token,
    isLoading,
    
    // Getters
    isAuthenticated,
    userName,
    userRoles,
    isAdmin,
    
    // Actions
    login,
    logout,
    fetchUserInfo
  }
}, {
  // 持久化配置
  persist: {
    enabled: true,
    paths: ['currentUser', 'token']
  }
})