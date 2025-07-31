import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
  preferences?: {
    theme: string
    language: string
  }
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function login(credentials: { email: string; password: string }) {
    isLoading.value = true
    error.value = null
    
    try {
      // 模拟登录API调用
      const response = await mockLogin(credentials)
      currentUser.value = response.user
      
      // 保存到本地存储
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('token', response.token)
      
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  function initializeFromStorage() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('解析用户数据失败:', error)
        localStorage.removeItem('user')
      }
    }
  }

  function updateProfile(updates: Partial<User>) {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...updates }
      localStorage.setItem('user', JSON.stringify(currentUser.value))
    }
  }

  return {
    currentUser,
    isLoading,
    error,
    login,
    logout,
    initializeFromStorage,
    updateProfile
  }
})

// 模拟登录API
async function mockLogin(credentials: { email: string; password: string }) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
    return {
      user: {
        id: '1',
        name: '管理员',
        email: 'admin@example.com',
        role: 'admin' as const,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        preferences: {
          theme: 'light',
          language: 'zh-CN'
        }
      },
      token: 'mock-admin-token'
    }
  }
  
  if (credentials.email === 'user@example.com' && credentials.password === 'user123') {
    return {
      user: {
        id: '2',
        name: '普通用户',
        email: 'user@example.com',
        role: 'user' as const,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        preferences: {
          theme: 'light',
          language: 'zh-CN'
        }
      },
      token: 'mock-user-token'
    }
  }
  
  throw new Error('用户名或密码错误')
}
