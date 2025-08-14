import { getCurrentInstance } from 'vue'

/**
 * 用户登录数据
 */
export interface LoginData {
  username: string
  password: string
  captcha?: string
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: number
  username: string
  email: string
  name: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

/**
 * 菜单项
 */
export interface MenuItem {
  id: string
  title: string
  path?: string
  icon?: string
  children?: MenuItem[]
  permissions?: string[]
}

/**
 * API 服务类
 */
export class ApiService {
  private httpClient: any

  constructor(httpClient?: any) {
    this.httpClient = httpClient || this.getHttpClient()
  }

  /**
   * 获取 HTTP 客户端
   */
  private getHttpClient() {
    const instance = getCurrentInstance()
    return instance?.appContext.config.globalProperties.$http
  }

  /**
   * 模拟 API 调用的通用方法
   */
  private async mockApiCall(method: string, data?: any) {
    console.log(`🔄 模拟 API 调用: ${method}`, data)

    // 模拟网络延迟
    await new Promise(resolve =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    )

    // 模拟成功响应
    return {
      success: true,
      message: `${method} 调用成功`,
      data: this.getMockData(method, data),
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * 获取模拟数据
   */
  private getMockData(method: string, inputData?: any) {
    switch (method) {
      case 'login':
        return {
          token: `mock-jwt-token-${Date.now()}`,
          user: {
            id: 1,
            username: inputData?.username || 'admin',
            email: 'admin@example.com',
            name: '管理员',
          },
        }

      case 'getUserInfo':
        return {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          name: '管理员',
          avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
          roles: ['admin', 'user'],
          permissions: ['read', 'write', 'delete', 'admin'],
        }

      case 'getMenus':
        return [
          {
            id: '1',
            title: '首页',
            path: '/',
            icon: 'home',
          },
          {
            id: '2',
            title: 'API 演示',
            path: '/api-demo',
            icon: 'api',
          },
          {
            id: '3',
            title: '系统管理',
            icon: 'settings',
            children: [
              {
                id: '3-1',
                title: '用户管理',
                path: '/users',
                icon: 'user',
              },
              {
                id: '3-2',
                title: '权限管理',
                path: '/permissions',
                icon: 'lock',
              },
            ],
          },
        ]

      case 'getPermissions':
        return [
          'read',
          'write',
          'delete',
          'admin',
          'user:create',
          'user:update',
        ]

      case 'getCaptcha':
        return {
          image:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          key: `captcha-key-${Date.now()}`,
        }

      case 'getSession':
        return {
          sessionId: `session-${Date.now()}`,
          userId: 1,
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        }

      case 'refreshToken':
        return {
          token: `refreshed-jwt-token-${Date.now()}`,
          expiresIn: 3600,
        }

      default:
        return {
          message: `${method} 的模拟数据`,
          timestamp: new Date().toISOString(),
          randomValue: Math.random(),
        }
    }
  }

  /**
   * 获取验证码
   */
  async getCaptcha() {
    return this.mockApiCall('getCaptcha')
  }

  /**
   * 用户登录
   */
  async login(data: LoginData) {
    return this.mockApiCall('login', data)
  }

  /**
   * 用户登出
   */
  async logout() {
    return this.mockApiCall('logout')
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(): Promise<any> {
    const result = await this.mockApiCall('getUserInfo')
    return result.data
  }

  /**
   * 获取用户菜单
   */
  async getMenus(): Promise<MenuItem[]> {
    const result = await this.mockApiCall('getMenus')
    return result.data
  }

  /**
   * 获取用户权限
   */
  async getPermissions(): Promise<string[]> {
    const result = await this.mockApiCall('getPermissions')
    return result.data
  }

  /**
   * 刷新令牌
   */
  async refreshToken() {
    return this.mockApiCall('refreshToken')
  }

  /**
   * 修改密码
   */
  async changePassword(data: { oldPassword: string; newPassword: string }) {
    return this.mockApiCall('changePassword', data)
  }

  /**
   * 获取会话信息
   */
  async getSession() {
    return this.mockApiCall('getSession')
  }

  /**
   * 调用自定义 API
   */
  async callApi(method: string, params?: any) {
    return this.mockApiCall(method, params)
  }

  /**
   * 注册自定义 API 方法（模拟）
   */
  async registerApi(name: string, config: any) {
    console.log(`📝 注册自定义 API: ${name}`, config)
    return { success: true, message: `API ${name} 注册成功` }
  }

  /**
   * 批量注册 API 方法（模拟）
   */
  async registerBatchApis(methods: Record<string, any>) {
    console.log('📝 批量注册 API:', methods)
    return { success: true, message: '批量注册成功' }
  }
}

/**
 * 全局 API 服务实例
 */
let globalApiService: ApiService | null = null

/**
 * 设置全局 API 服务
 */
export function setGlobalApiService(apiService: ApiService) {
  globalApiService = apiService
}

/**
 * 获取 API 服务实例
 */
export function useApiService(): ApiService {
  // 优先从 Vue 实例获取
  const instance = getCurrentInstance()
  if (instance) {
    const apiService = instance.appContext.config.globalProperties.$api
    if (apiService) {
      return apiService
    }
  }

  // 使用全局实例
  if (globalApiService) {
    return globalApiService
  }

  throw new Error('API 服务未初始化，请确保已正确安装 API 引擎插件')
}

/**
 * 创建 API 服务实例
 */
export function createApiService(httpClient?: any): ApiService {
  return new ApiService(httpClient)
}
