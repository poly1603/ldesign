import type { LoginCredentials, User } from '../types/user'
import { defineStore } from 'pinia'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    isAuthenticated: false,
    permissions: [],
  }),

  getters: {
    hasRole: (state: UserState) => (role: string) => {
      return state.user?.roles?.includes(role) ?? false
    },

    hasPermission: (state: UserState) => (permission: string) => {
      return state.permissions.includes(permission)
    },
  },

  actions: {
    async login(credentials: LoginCredentials) {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 模拟用户数据
        const userData: User = {
          id: '1',
          name: credentials.username === 'admin' ? '管理员' : '普通用户',
          email: `${credentials.username}@example.com`,
          roles: credentials.username === 'admin' ? ['admin', 'user'] : ['user'],
          avatar: 'https://via.placeholder.com/40',
        }

        this.user = userData
        this.isAuthenticated = true
        this.permissions = credentials.username === 'admin'
          ? ['read', 'write', 'delete', 'admin']
          : ['read']

        // 保存到localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('auth', 'true')

        return { success: true }
      }
      catch {
        return { success: false, error: '登录失败' }
      }
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      this.permissions = []

      // 清除localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('auth')
    },

    async fetchUserProfile() {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))

        if (this.user) {
          // 更新用户信息
          this.user = {
            ...this.user,
            lastLoginAt: new Date().toISOString(),
          }
        }
      }
      catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },

    async updateProfile(data: Partial<User>) {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (this.user) {
          this.user = { ...this.user, ...data }
          localStorage.setItem('user', JSON.stringify(this.user))
        }

        return { success: true }
      }
      catch {
        return { success: false, error: '更新失败' }
      }
    },

    // 初始化用户状态（从localStorage恢复）
    initializeAuth() {
      try {
        const savedUser = localStorage.getItem('user')
        const savedAuth = localStorage.getItem('auth')

        if (savedUser && savedAuth === 'true') {
          this.user = JSON.parse(savedUser)
          this.isAuthenticated = true
          this.permissions = this.user?.roles?.includes('admin')
            ? ['read', 'write', 'delete', 'admin']
            : ['read']
        }
      }
      catch {
        // 如果数据损坏，清除它
        this.logout()
      }
    },
  },
})
