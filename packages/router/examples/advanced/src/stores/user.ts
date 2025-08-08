// Vue 兼容性函数
const ref = (value: any) => ({ value })
const computed = (fn: () => any) => ({ value: fn() })
const readonly = (value: any) => value
const defineStore = (_name: string, setup: () => any) => setup

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  roles: string[]
  permissions: string[]
  profile: {
    firstName: string
    lastName: string
    phone?: string
    bio?: string
  }
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null as User | null)
  const token = ref(localStorage.getItem('token') as string | null)
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const fullName = computed(() => {
    if (!user.value) return ''
    const { firstName, lastName } = user.value.profile
    return `${firstName} ${lastName}`.trim()
  })

  // 方法
  const login = async (credentials: { username: string; password: string }) => {
    loading.value = true
    try {
      // 模拟登录 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟用户数据
      const mockUser: User = {
        id: '1',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.username}`,
        roles: ['user', 'admin'],
        permissions: [
          'dashboard:read',
          'analytics:read',
          'reports:read',
          'users:read',
          'users:write',
          'products:read',
          'settings:read',
          'settings:write',
        ],
        profile: {
          firstName: '张',
          lastName: '三',
          phone: '13800138000',
          bio: '这是一个示例用户的个人简介。',
        },
      }

      const mockToken = `mock-jwt-token-${Date.now()}`

      user.value = mockUser
      token.value = mockToken
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))

      return { success: true, user: mockUser }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: '登录失败，请检查用户名和密码' }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateProfile = async (profileData: Partial<User['profile']>) => {
    if (!user.value) return false

    loading.value = true
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 500))

      user.value.profile = { ...user.value.profile, ...profileData }
      localStorage.setItem('user', JSON.stringify(user.value))

      return true
    } catch (error) {
      console.error('更新资料失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const hasRole = (role: string): boolean => {
    return user.value?.roles.includes(role) ?? false
  }

  const hasPermission = (permission: string): boolean => {
    return user.value?.permissions.includes(permission) ?? false
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role))
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  // 初始化用户数据
  const initUser = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')

    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
      } catch (error) {
        console.error('解析用户数据失败:', error)
        logout()
      }
    }
  }

  // 刷新用户信息
  const refreshUser = async () => {
    if (!token.value) return false

    loading.value = true
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 500))

      // 在实际应用中，这里会调用 API 获取最新的用户信息
      return true
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      logout()
      return false
    } finally {
      loading.value = false
    }
  }

  // 初始化
  initUser()

  return {
    // 状态
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),

    // 计算属性
    isAuthenticated,
    fullName,

    // 方法
    login,
    logout,
    updateProfile,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    refreshUser,
  }
})
