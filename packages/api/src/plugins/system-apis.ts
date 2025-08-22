import type {
  ApiMethod,
  ApiPlugin,
  CaptchaInfo,
  LoginParams,
  LoginResponse,
  MenuItem,
  SessionInfo,
  SystemApiResponse,
  UserInfo,
} from '../types'

/**
 * 系统 API 插件配置
 */
export interface SystemApiConfig {
  /** API 基础路径 */
  basePath?: string
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存时间（毫秒） */
  cacheTtl?: number
  /** 自定义端点配置 */
  endpoints?: Partial<SystemApiEndpoints>
}

/**
 * 系统 API 端点配置
 */
export interface SystemApiEndpoints {
  /** 获取验证码 */
  getCaptcha: string
  /** 获取会话信息 */
  getSession: string
  /** 用户登录 */
  login: string
  /** 用户登出 */
  logout: string
  /** 获取用户信息 */
  getUserInfo: string
  /** 获取系统菜单 */
  getMenus: string
  /** 刷新令牌 */
  refreshToken: string
  /** 修改密码 */
  changePassword: string
  /** 获取用户权限 */
  getPermissions: string
}

/**
 * 默认端点配置
 */
const DEFAULT_ENDPOINTS: SystemApiEndpoints = {
  getCaptcha: '/auth/captcha',
  getSession: '/auth/session',
  login: '/auth/login',
  logout: '/auth/logout',
  getUserInfo: '/user/info',
  getMenus: '/user/menus',
  refreshToken: '/auth/refresh',
  changePassword: '/user/password',
  getPermissions: '/user/permissions',
}

/**
 * 创建系统 API 插件
 */
export function createSystemApiPlugin(config: SystemApiConfig = {}): ApiPlugin {
  const {
    basePath = '/api',
    enableCache = true,
    cacheTtl = 300000, // 5分钟
    endpoints = {},
  } = config

  const finalEndpoints = { ...DEFAULT_ENDPOINTS, ...endpoints }

  // 构建完整的 URL
  const buildUrl = (endpoint: string) => `${basePath}${endpoint}`

  // 通用缓存配置
  const cacheConfig = enableCache
    ? {
        enabled: true,
        ttl: cacheTtl,
      }
    : { enabled: false }

  // 通用响应转换函数
  const transformResponse = <T>(response: SystemApiResponse<T>): T => {
    if (response.code !== 200) {
      throw new Error(response.message || 'API request failed')
    }
    return response.data
  }

  // 定义 API 方法
  const apis: Record<string, ApiMethod> = {
    /**
     * 获取验证码
     */
    getCaptcha: {
      name: 'getCaptcha',
      config: {
        method: 'GET',
        url: buildUrl(finalEndpoints.getCaptcha),
      },
      cache: { enabled: false }, // 验证码不缓存
      transform: transformResponse<CaptchaInfo>,
    },

    /**
     * 获取会话信息
     */
    getSession: {
      name: 'getSession',
      config: {
        method: 'GET',
        url: buildUrl(finalEndpoints.getSession),
      },
      cache: cacheConfig,
      transform: transformResponse<SessionInfo>,
    },

    /**
     * 用户登录
     */
    login: {
      name: 'login',
      config: (params: LoginParams) => ({
        method: 'POST',
        url: buildUrl(finalEndpoints.login),
        data: params,
      }),
      cache: { enabled: false }, // 登录不缓存
      transform: transformResponse<LoginResponse>,
    },

    /**
     * 用户登出
     */
    logout: {
      name: 'logout',
      config: {
        method: 'POST',
        url: buildUrl(finalEndpoints.logout),
      },
      cache: { enabled: false }, // 登出不缓存
      transform: transformResponse<boolean>,
    },

    /**
     * 获取用户信息
     */
    getUserInfo: {
      name: 'getUserInfo',
      config: {
        method: 'GET',
        url: buildUrl(finalEndpoints.getUserInfo),
      },
      cache: cacheConfig,
      transform: transformResponse<UserInfo>,
    },

    /**
     * 获取系统菜单
     */
    getMenus: {
      name: 'getMenus',
      config: {
        method: 'GET',
        url: buildUrl(finalEndpoints.getMenus),
      },
      cache: cacheConfig,
      transform: transformResponse<MenuItem[]>,
    },

    /**
     * 刷新令牌
     */
    refreshToken: {
      name: 'refreshToken',
      config: (params: { refreshToken: string }) => ({
        method: 'POST',
        url: buildUrl(finalEndpoints.refreshToken),
        data: params,
      }),
      cache: { enabled: false }, // 刷新令牌不缓存
      transform: transformResponse<{ accessToken: string, expiresIn: number }>,
    },

    /**
     * 修改密码
     */
    changePassword: {
      name: 'changePassword',
      config: (params: { oldPassword: string, newPassword: string }) => ({
        method: 'POST',
        url: buildUrl(finalEndpoints.changePassword),
        data: params,
      }),
      cache: { enabled: false }, // 修改密码不缓存
      transform: transformResponse<boolean>,
    },

    /**
     * 获取用户权限
     */
    getPermissions: {
      name: 'getPermissions',
      config: {
        method: 'GET',
        url: buildUrl(finalEndpoints.getPermissions),
      },
      cache: cacheConfig,
      transform: transformResponse<string[]>,
    },
  }

  return {
    name: 'system-apis',
    version: '1.0.0',
    apis,
    install: (engine) => {
      // 插件安装时的逻辑
      if (engine.config.debug) {
        console.warn(
          '[System APIs Plugin] Installed with endpoints:',
          finalEndpoints,
        )
      }
    },
    uninstall: (engine) => {
      // 插件卸载时的逻辑
      if (engine.config.debug) {
        console.warn('[System APIs Plugin] Uninstalled')
      }
    },
  }
}

/**
 * 默认系统 API 插件实例
 */
export const systemApiPlugin = createSystemApiPlugin()

/**
 * 系统 API 方法名称常量
 */
export const SYSTEM_API_METHODS = {
  GET_CAPTCHA: 'getCaptcha',
  GET_SESSION: 'getSession',
  LOGIN: 'login',
  LOGOUT: 'logout',
  GET_USER_INFO: 'getUserInfo',
  GET_MENUS: 'getMenus',
  REFRESH_TOKEN: 'refreshToken',
  CHANGE_PASSWORD: 'changePassword',
  GET_PERMISSIONS: 'getPermissions',
} as const

/**
 * 系统 API 方法名称类型
 */
export type SystemApiMethodName =
  (typeof SYSTEM_API_METHODS)[keyof typeof SYSTEM_API_METHODS]
