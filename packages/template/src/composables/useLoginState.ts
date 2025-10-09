/**
 * 登录状态管理 Composable
 * 提供登录相关的状态管理和业务逻辑
 */

import { computed, reactive, ref, watch, type Ref } from 'vue'

/**
 * 登录凭证
 */
export interface LoginCredentials {
  username: string
  password: string
  remember?: boolean
  captcha?: string
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: string | number
  username: string
  email?: string
  avatar?: string
  roles?: string[]
  permissions?: string[]
  [key: string]: any
}

/**
 * 登录选项
 */
export interface LoginOptions {
  /** 是否启用记住密码 */
  enableRemember?: boolean
  /** 是否启用验证码 */
  enableCaptcha?: boolean
  /** 是否启用生物识别 */
  enableBiometric?: boolean
  /** 最大登录尝试次数 */
  maxAttempts?: number
  /** 锁定时间(ms) */
  lockoutDuration?: number
  /** 自动登录 */
  autoLogin?: boolean
  /** 本地存储键名 */
  storageKey?: string
}

/**
 * 登录状态
 */
export interface LoginState {
  /** 是否正在登录 */
  loading: boolean
  /** 是否已登录 */
  isAuthenticated: boolean
  /** 当前用户 */
  user: UserInfo | null
  /** 错误信息 */
  error: string | null
  /** 登录尝试次数 */
  attempts: number
  /** 是否被锁定 */
  isLocked: boolean
  /** 锁定结束时间 */
  lockoutEndTime: number | null
  /** 记住的用户名 */
  rememberedUsername: string | null
}

/**
 * 登录返回值
 */
export interface UseLoginStateReturn {
  /** 状态 */
  state: Readonly<LoginState>
  /** 是否正在加载 */
  loading: Ref<boolean>
  /** 是否已认证 */
  isAuthenticated: Ref<boolean>
  /** 当前用户 */
  user: Ref<UserInfo | null>
  /** 错误信息 */
  error: Ref<string | null>
  /** 是否被锁定 */
  isLocked: Ref<boolean>
  /** 剩余锁定时间(秒) */
  remainingLockTime: Ref<number>
  /** 记住的用户名 */
  rememberedUsername: Ref<string | null>
  /** 登录 */
  login: (credentials: LoginCredentials) => Promise<UserInfo>
  /** 登出 */
  logout: () => Promise<void>
  /** 刷新令牌 */
  refreshToken: () => Promise<void>
  /** 检查认证状态 */
  checkAuth: () => Promise<boolean>
  /** 清除错误 */
  clearError: () => void
  /** 重置尝试次数 */
  resetAttempts: () => void
  /** 保存用户名 */
  saveUsername: (username: string) => void
  /** 清除记住的用户名 */
  clearRememberedUsername: () => void
}

/**
 * 默认选项
 */
const DEFAULT_OPTIONS: Required<LoginOptions> = {
  enableRemember: true,
  enableCaptcha: false,
  enableBiometric: false,
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15分钟
  autoLogin: false,
  storageKey: 'ldesign_login_state',
}

/**
 * 登录状态管理 Hook
 */
export function useLoginState(options: LoginOptions = {}): UseLoginStateReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // 状态
  const state = reactive<LoginState>({
    loading: false,
    isAuthenticated: false,
    user: null,
    error: null,
    attempts: 0,
    isLocked: false,
    lockoutEndTime: null,
    rememberedUsername: null,
  })

  // 计算属性
  const loading = computed(() => state.loading)
  const isAuthenticated = computed(() => state.isAuthenticated)
  const user = computed(() => state.user)
  const error = computed(() => state.error)
  const isLocked = computed(() => state.isLocked)
  const rememberedUsername = computed(() => state.rememberedUsername)

  // 剩余锁定时间
  const remainingLockTime = computed(() => {
    if (!state.isLocked || !state.lockoutEndTime) return 0
    const remaining = Math.max(0, state.lockoutEndTime - Date.now())
    return Math.ceil(remaining / 1000)
  })

  /**
   * 从本地存储加载状态
   */
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(opts.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        state.rememberedUsername = data.rememberedUsername || null
        state.attempts = data.attempts || 0
        state.lockoutEndTime = data.lockoutEndTime || null

        // 检查锁定状态
        if (state.lockoutEndTime && Date.now() < state.lockoutEndTime) {
          state.isLocked = true
        } else {
          state.isLocked = false
          state.lockoutEndTime = null
          state.attempts = 0
        }
      }
    } catch (err) {
      console.error('Failed to load login state from storage:', err)
    }
  }

  /**
   * 保存到本地存储
   */
  const saveToStorage = () => {
    try {
      const data = {
        rememberedUsername: state.rememberedUsername,
        attempts: state.attempts,
        lockoutEndTime: state.lockoutEndTime,
      }
      localStorage.setItem(opts.storageKey, JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save login state to storage:', err)
    }
  }

  /**
   * 清除错误
   */
  const clearError = () => {
    state.error = null
  }

  /**
   * 重置尝试次数
   */
  const resetAttempts = () => {
    state.attempts = 0
    state.isLocked = false
    state.lockoutEndTime = null
    saveToStorage()
  }

  /**
   * 保存用户名
   */
  const saveUsername = (username: string) => {
    if (opts.enableRemember) {
      state.rememberedUsername = username
      saveToStorage()
    }
  }

  /**
   * 清除记住的用户名
   */
  const clearRememberedUsername = () => {
    state.rememberedUsername = null
    saveToStorage()
  }

  /**
   * 登录
   */
  const login = async (credentials: LoginCredentials): Promise<UserInfo> => {
    // 检查锁定状态
    if (state.isLocked) {
      const remaining = Math.ceil(remainingLockTime.value / 60)
      throw new Error(`账户已被锁定，请在 ${remaining} 分钟后重试`)
    }

    state.loading = true
    state.error = null

    try {
      // 这里应该调用实际的登录API
      // 示例实现:
      const response = await mockLoginApi(credentials)

      // 登录成功
      state.user = response
      state.isAuthenticated = true
      state.attempts = 0
      state.isLocked = false
      state.lockoutEndTime = null

      // 保存用户名
      if (credentials.remember) {
        saveUsername(credentials.username)
      }

      saveToStorage()
      return response
    } catch (err: any) {
      // 登录失败
      state.attempts++
      state.error = err.message || '登录失败'

      // 检查是否需要锁定
      if (state.attempts >= opts.maxAttempts) {
        state.isLocked = true
        state.lockoutEndTime = Date.now() + opts.lockoutDuration
        state.error = `登录失败次数过多，账户已被锁定 ${opts.lockoutDuration / 60000} 分钟`
      }

      saveToStorage()
      throw err
    } finally {
      state.loading = false
    }
  }

  /**
   * 登出
   */
  const logout = async (): Promise<void> => {
    state.loading = true

    try {
      // 调用登出API
      await mockLogoutApi()

      // 清除状态
      state.user = null
      state.isAuthenticated = false
      state.error = null
    } catch (err: any) {
      state.error = err.message || '登出失败'
      throw err
    } finally {
      state.loading = false
    }
  }

  /**
   * 刷新令牌
   */
  const refreshToken = async (): Promise<void> => {
    try {
      // 调用刷新令牌API
      await mockRefreshTokenApi()
    } catch (err: any) {
      state.error = err.message || '刷新令牌失败'
      state.isAuthenticated = false
      state.user = null
      throw err
    }
  }

  /**
   * 检查认证状态
   */
  const checkAuth = async (): Promise<boolean> => {
    try {
      // 调用检查认证API
      const isValid = await mockCheckAuthApi()
      state.isAuthenticated = isValid
      return isValid
    } catch (err) {
      state.isAuthenticated = false
      return false
    }
  }

  // 初始化
  loadFromStorage()

  // 监听锁定状态
  watch(remainingLockTime, (time) => {
    if (time === 0 && state.isLocked) {
      resetAttempts()
    }
  })

  return {
    state: state as Readonly<LoginState>,
    loading,
    isAuthenticated,
    user,
    error,
    isLocked,
    remainingLockTime,
    rememberedUsername,
    login,
    logout,
    refreshToken,
    checkAuth,
    clearError,
    resetAttempts,
    saveUsername,
    clearRememberedUsername,
  }
}

// Mock API 函数 (实际使用时应该替换为真实的API调用)
async function mockLoginApi(credentials: LoginCredentials): Promise<UserInfo> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        resolve({
          id: 1,
          username: credentials.username,
          email: 'admin@example.com',
          avatar: '',
          roles: ['admin'],
        })
      } else {
        reject(new Error('用户名或密码错误'))
      }
    }, 1000)
  })
}

async function mockLogoutApi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 500)
  })
}

async function mockRefreshTokenApi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 500)
  })
}

async function mockCheckAuthApi(): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(false), 500)
  })
}

