import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from './global'

export interface LoginCredentials {
  username: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  lastLoginTime: number | null
  loginAttempts: number
  isLocked: boolean
  lockUntil: number | null
}

export const useAuthState = defineStore('auth', () => {
  // ============ 状态定义 ============
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const lastLoginTime = ref<number | null>(null)
  const loginAttempts = ref(0)
  const isLocked = ref(false)
  const lockUntil = ref<number | null>(null)
  
  // ============ 计算属性 ============
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.roles?.includes('admin') || false)
  const canAccess = computed(() => (permission: string) => {
    // 这里可以实现复杂的权限检查逻辑
    return user.value?.roles?.includes('admin') || false
  })
  
  // ============ 方法定义 ============
  
  /**
   * 用户登录
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    if (isLocked.value && lockUntil.value && Date.now() < lockUntil.value) {
      throw new Error('账户已被锁定，请稍后再试')
    }
    
    isLoading.value = true
    
    try {
      // 这里应该调用实际的登录API
      // 暂时模拟登录逻辑
      await simulateLogin(credentials)
      
      // 重置登录尝试次数
      loginAttempts.value = 0
      isLocked.value = false
      lockUntil.value = null
      lastLoginTime.value = Date.now()
      
      // 保存到本地存储
      saveAuthToStorage()
      
    } catch (error) {
      // 增加登录尝试次数
      loginAttempts.value++
      
      // 如果尝试次数过多，锁定账户
      if (loginAttempts.value >= 5) {
        isLocked.value = true
        lockUntil.value = Date.now() + 15 * 60 * 1000 // 锁定15分钟
      }
      
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 用户注册
   */
  const register = async (registerData: RegisterData): Promise<void> => {
    if (registerData.password !== registerData.confirmPassword) {
      throw new Error('两次输入的密码不一致')
    }
    
    isLoading.value = true
    
    try {
      // 这里应该调用实际的注册API
      await simulateRegister(registerData)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 用户登出
   */
  const logout = async (): Promise<void> => {
    try {
      // 调用登出API（可选）
      // await api.logout()
      
      // 清除状态
      clearAuth()
      
      // 清除本地存储
      clearAuthFromStorage()
      
    } catch (error) {
      console.error('Logout error:', error)
      // 即使API调用失败，也要清除本地状态
      clearAuth()
      clearAuthFromStorage()
    }
  }
  
  /**
   * 刷新token
   */
  const refreshAuthToken = async (): Promise<void> => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }
    
    try {
      // 这里应该调用实际的刷新token API
      const response = await simulateRefreshToken(refreshToken.value)
      
      token.value = response.token
      refreshToken.value = response.refreshToken
      
      // 更新本地存储
      saveAuthToStorage()
      
    } catch (error) {
      // 刷新失败，清除认证状态
      clearAuth()
      clearAuthFromStorage()
      throw error
    }
  }
  
  /**
   * 设置用户信息
   */
  const setUser = (userData: User) => {
    user.value = { ...userData }
  }
  
  /**
   * 设置token
   */
  const setToken = (tokenValue: string) => {
    token.value = tokenValue
  }
  
  /**
   * 设置刷新token
   */
  const setRefreshToken = (refreshTokenValue: string) => {
    refreshToken.value = refreshTokenValue
  }
  
  /**
   * 清除认证状态
   */
  const clearAuth = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    lastLoginTime.value = null
  }
  
  /**
   * 从本地存储恢复认证状态
   */
  const restoreAuthFromStorage = () => {
    try {
      const savedAuth = localStorage.getItem('auth-state')
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth)
        
        user.value = parsed.user
        token.value = parsed.token
        refreshToken.value = parsed.refreshToken
        lastLoginTime.value = parsed.lastLoginTime
        loginAttempts.value = parsed.loginAttempts || 0
        isLocked.value = parsed.isLocked || false
        lockUntil.value = parsed.lockUntil
        
        // 检查token是否过期
        if (token.value && isTokenExpired(token.value)) {
          clearAuth()
        }
      }
    } catch (error) {
      console.error('Failed to restore auth from storage:', error)
      clearAuth()
    }
  }
  
  /**
   * 保存认证状态到本地存储
   */
  const saveAuthToStorage = () => {
    try {
      const authState = {
        user: user.value,
        token: token.value,
        refreshToken: refreshToken.value,
        lastLoginTime: lastLoginTime.value,
        loginAttempts: loginAttempts.value,
        isLocked: isLocked.value,
        lockUntil: lockUntil.value
      }
      localStorage.setItem('auth-state', JSON.stringify(authState))
      localStorage.setItem('auth-token', token.value || '')
    } catch (error) {
      console.error('Failed to save auth to storage:', error)
    }
  }
  
  /**
   * 清除本地存储的认证状态
   */
  const clearAuthFromStorage = () => {
    localStorage.removeItem('auth-state')
    localStorage.removeItem('auth-token')
  }
  
  // 初始化时恢复状态
  restoreAuthFromStorage()
  
  return {
    // 状态
    user,
    token,
    refreshToken,
    isLoading,
    lastLoginTime,
    loginAttempts,
    isLocked,
    lockUntil,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    canAccess,
    
    // 方法
    login,
    register,
    logout,
    refreshAuthToken,
    setUser,
    setToken,
    setRefreshToken,
    clearAuth,
    restoreAuthFromStorage,
    saveAuthToStorage,
    clearAuthFromStorage
  }
})

// ============ 辅助函数 ============

/**
 * 模拟登录API
 */
async function simulateLogin(credentials: LoginCredentials): Promise<void> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 简单的用户名密码验证
  if (credentials.username === 'admin' && credentials.password === 'admin123') {
    const authStore = useAuthState()
    
    authStore.setUser({
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      avatar: 'https://via.placeholder.com/64',
      roles: ['admin', 'user']
    })
    
    authStore.setToken('mock-jwt-token-' + Date.now())
    authStore.setRefreshToken('mock-refresh-token-' + Date.now())
  } else {
    throw new Error('用户名或密码错误')
  }
}

/**
 * 模拟注册API
 */
async function simulateRegister(registerData: RegisterData): Promise<void> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 简单验证
  if (registerData.username.length < 3) {
    throw new Error('用户名至少需要3个字符')
  }
  
  if (registerData.password.length < 6) {
    throw new Error('密码至少需要6个字符')
  }
  
  // 模拟注册成功
  console.log('Registration successful:', registerData.username)
}

/**
 * 模拟刷新token API
 */
async function simulateRefreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    token: 'new-mock-jwt-token-' + Date.now(),
    refreshToken: 'new-mock-refresh-token-' + Date.now()
  }
}

/**
 * 检查token是否过期
 */
function isTokenExpired(token: string): boolean {
  try {
    // 这里应该实现真正的JWT解析和过期检查
    // 暂时返回false
    return false
  } catch {
    return true
  }
}
