import { defineStore } from 'pinia'

export interface User {
  id: number
  name: string
  email: string
  role: string
  avatar?: string
}

/**
 * 用户管理 Store - 使用 Pinia 原生语法
 *
 * 展示异步操作、错误处理和状态管理功能
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    loading: false,
    error: null as string | null,
    requestCount: 0,
    lastFetchTime: null as number | null
  }),

  actions: {
    async fetchUser(id: number) {
      this.loading = true
      this.error = null
      this.requestCount++

      try {
        // 模拟 API 请求
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 模拟用户数据
        const users: Record<number, User> = {
          1: {
            id: 1,
            name: '张三',
            email: 'zhangsan@example.com',
            role: '管理员'
          },
          2: {
            id: 2,
            name: '李四',
            email: 'lisi@example.com',
            role: '用户'
          }
        }

        const user = users[id]
        if (!user) {
          throw new Error(`用户 ${id} 不存在`)
        }

        this.currentUser = user
        this.lastFetchTime = Date.now()
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取用户信息失败'
      } finally {
        this.loading = false
      }
    },

    clearUser() {
      this.currentUser = null
      this.error = null
    },

    clearError() {
      this.error = null
    }
  },

  getters: {
    totalRequests: (state) => state.requestCount,
    hasUser: (state) => state.currentUser !== null,
    userDisplayName: (state) => {
      if (!state.currentUser) return '未登录'
      return `${state.currentUser.name} (${state.currentUser.role})`
    }
  }
})
