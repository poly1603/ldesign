import { ref, computed, reactive } from 'vue'
import type { UserInfo, LoginData, MenuItem } from '../services/api'
import { useApiService } from '../services/api'

/**
 * 认证状态
 */
interface AuthState {
  /** 是否已登录 */
  isLoggedIn: boolean
  /** 用户信息 */
  userInfo: UserInfo | null
  /** 用户菜单 */
  menus: MenuItem[]
  /** 用户权限 */
  permissions: string[]
  /** 登录加载状态 */
  loginLoading: boolean
  /** 登出加载状态 */
  logoutLoading: boolean
  /** 获取用户信息加载状态 */
  userInfoLoading: boolean
}

/**
 * 全局认证状态
 */
const authState = reactive<AuthState>({
  isLoggedIn: false,
  userInfo: null,
  menus: [],
  permissions: [],
  loginLoading: false,
  logoutLoading: false,
  userInfoLoading: false,
})

/**
 * 认证错误信息
 */
const authError = ref<string | null>(null)

/**
 * 用户认证组合式函数
 */
export function useAuth() {
  const apiService = useApiService()

  /**
   * 用户登录
   */
  const login = async (loginData: LoginData) => {
    try {
      authState.loginLoading = true
      authError.value = null

      // 调用登录接口
      const response = await apiService.login(loginData)

      if (response.success) {
        // 登录成功，获取用户信息
        await fetchUserInfo()
        authState.isLoggedIn = true

        // 存储登录状态到本地存储
        localStorage.setItem('isLoggedIn', 'true')
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token)
        }

        return { success: true, data: response.data }
      } else {
        authError.value = response.message || '登录失败'
        return { success: false, message: authError.value }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败'
      authError.value = message
      return { success: false, message }
    } finally {
      authState.loginLoading = false
    }
  }

  /**
   * 用户登出
   */
  const logout = async () => {
    try {
      authState.logoutLoading = true
      authError.value = null

      // 调用登出接口
      await apiService.logout()

      // 清理状态
      clearAuthState()

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : '登出失败'
      authError.value = message

      // 即使接口失败也清理本地状态
      clearAuthState()

      return { success: false, message }
    } finally {
      authState.logoutLoading = false
    }
  }

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async () => {
    try {
      authState.userInfoLoading = true
      authError.value = null

      // 并行获取用户信息、菜单和权限
      const [userInfo, menus, permissions] = await Promise.all([
        apiService.getUserInfo(),
        apiService.getMenus(),
        apiService.getPermissions(),
      ])

      authState.userInfo = userInfo
      authState.menus = menus
      authState.permissions = permissions

      return { success: true, data: { userInfo, menus, permissions } }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '获取用户信息失败'
      authError.value = message
      return { success: false, message }
    } finally {
      authState.userInfoLoading = false
    }
  }

  /**
   * 检查用户权限
   */
  const hasPermission = (permission: string): boolean => {
    return authState.permissions.includes(permission)
  }

  /**
   * 检查用户角色
   */
  const hasRole = (role: string): boolean => {
    return authState.userInfo?.roles.includes(role) || false
  }

  /**
   * 刷新令牌
   */
  const refreshToken = async () => {
    try {
      const response = await apiService.refreshToken()
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token)
        return { success: true }
      }
      return { success: false, message: '刷新令牌失败' }
    } catch (error) {
      const message = error instanceof Error ? error.message : '刷新令牌失败'
      return { success: false, message }
    }
  }

  /**
   * 初始化认证状态
   */
  const initAuth = async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const token = localStorage.getItem('token')

    if (isLoggedIn && token) {
      authState.isLoggedIn = true
      // 尝试获取用户信息验证登录状态
      const result = await fetchUserInfo()
      if (!result.success) {
        // 如果获取用户信息失败，清理登录状态
        clearAuthState()
      }
    }
  }

  /**
   * 清理认证状态
   */
  const clearAuthState = () => {
    authState.isLoggedIn = false
    authState.userInfo = null
    authState.menus = []
    authState.permissions = []
    authError.value = null

    // 清理本地存储
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('token')
  }

  /**
   * 计算属性
   */
  const isAuthenticated = computed(() => authState.isLoggedIn)
  const currentUser = computed(() => authState.userInfo)
  const userMenus = computed(() => authState.menus)
  const userPermissions = computed(() => authState.permissions)
  const isLoading = computed(
    () =>
      authState.loginLoading ||
      authState.logoutLoading ||
      authState.userInfoLoading
  )

  return {
    // 状态
    authState: readonly(authState),
    authError: readonly(authError),

    // 计算属性
    isAuthenticated,
    currentUser,
    userMenus,
    userPermissions,
    isLoading,

    // 方法
    login,
    logout,
    fetchUserInfo,
    hasPermission,
    hasRole,
    refreshToken,
    initAuth,
    clearAuthState,
  }
}

/**
 * 只读的认证状态（用于非组件中使用）
 */
export function readonly<T>(obj: T): Readonly<T> {
  return obj as Readonly<T>
}
