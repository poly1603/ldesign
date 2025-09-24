/**
 * 系统 API 插件
 * 提供常用的系统接口方法，如登录、用户信息、菜单等
 */

import type {
  ApiMethodConfig,
  ApiPlugin,
  CaptchaInfo,
  LoginParams,
  LoginResult,
  MenuItem,
  UserInfo,
} from '../types'
import { SYSTEM_API_METHODS } from '../types'

/**
 * 系统 API 方法配置
 */
const systemApiMethods: Record<string, ApiMethodConfig> = {
  /**
   * 获取验证码
   */
  [SYSTEM_API_METHODS.GET_CAPTCHA]: {
    name: SYSTEM_API_METHODS.GET_CAPTCHA,
    config: {
      method: 'GET',
      url: '/auth/captcha',
    },
    transform: (response): CaptchaInfo => {
      return {
        captchaId: response.data.captchaId || response.data.id,
        captchaImage: response.data.captchaImage || response.data.image,
        expiresIn: response.data.expiresIn || 300,
      }
    },
    cache: {
      enabled: false, // 验证码不缓存
    },
  },

  /**
   * 用户登录
   */
  [SYSTEM_API_METHODS.LOGIN]: {
    name: SYSTEM_API_METHODS.LOGIN,
    config: (params: LoginParams) => ({
      method: 'POST',
      url: '/auth/login',
      data: params,
    }),
    transform: (response): LoginResult => {
      const data = response.data
      return {
        accessToken: data.accessToken || data.token || data.access_token,
        refreshToken: data.refreshToken || data.refresh_token,
        tokenType: data.tokenType || data.token_type || 'Bearer',
        expiresIn: data.expiresIn || data.expires_in,
        userInfo: data.userInfo || data.user,
      }
    },
    onSuccess: (result: LoginResult) => {
      // 自动保存 token 到 localStorage（在无 localStorage 环境下静默跳过）
      try {
        if (result.accessToken && typeof localStorage !== 'undefined') {
          localStorage.setItem('access_token', result.accessToken)
        }
        if (result.refreshToken && typeof localStorage !== 'undefined') {
          localStorage.setItem('refresh_token', result.refreshToken)
        }
      }
      catch {}
    },
    cache: {
      enabled: false, // 登录结果不缓存
    },
    debounce: {
      enabled: false, // 登录不防抖
    },
  },

  /**
   * 用户登出
   */
  [SYSTEM_API_METHODS.LOGOUT]: {
    name: SYSTEM_API_METHODS.LOGOUT,
    config: {
      method: 'POST',
      url: '/auth/logout',
    },
    onSuccess: () => {
      // 清除本地存储的 token（在无 localStorage 环境下静默跳过）
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user_info')
        }
      }
      catch {}
    },
    cache: {
      enabled: false,
    },
  },

  /**
   * 获取用户信息
   */
  [SYSTEM_API_METHODS.GET_USER_INFO]: {
    name: SYSTEM_API_METHODS.GET_USER_INFO,
    config: {
      method: 'GET',
      url: '/user/info',
      headers: {
        Authorization: () => {
          const token = localStorage.getItem('access_token')
          return token ? `Bearer ${token}` : ''
        },
      },
    },
    transform: (response): UserInfo => {
      const data = response.data
      return {
        id: data.id || data.userId,
        username: data.username || data.userName,
        nickname: data.nickname || data.nickName,
        email: data.email,
        phone: data.phone || data.mobile,
        avatar: data.avatar || data.avatarUrl,
        roles: data.roles || [],
        permissions: data.permissions || [],
        department: data.department || data.dept,
        status: data.status || 'active',
        createdAt: data.createdAt || data.createTime,
        updatedAt: data.updatedAt || data.updateTime,
      }
    },
    onSuccess: (userInfo: UserInfo) => {
      // 缓存用户信息到 localStorage（在无 localStorage 环境下静默跳过）
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('user_info', JSON.stringify(userInfo))
        }
      }
      catch {}
    },
    cache: {
      enabled: true,
      ttl: 600000, // 10分钟缓存
    },
  },

  /**
   * 更新用户信息
   */
  [SYSTEM_API_METHODS.UPDATE_USER_INFO]: {
    name: SYSTEM_API_METHODS.UPDATE_USER_INFO,
    config: (params: Partial<UserInfo>) => ({
      method: 'PUT',
      url: '/user/info',
      data: params,
      headers: {
        Authorization: () => {
          const token = localStorage.getItem('access_token')
          return token ? `Bearer ${token}` : ''
        },
      },
    }),
    onSuccess: () => {
      // 更新成功后清除用户信息缓存
      localStorage.removeItem('user_info')
    },
    cache: {
      enabled: false,
    },
  },

  /**
   * 获取系统菜单
   */
  [SYSTEM_API_METHODS.GET_MENUS]: {
    name: SYSTEM_API_METHODS.GET_MENUS,
    config: {
      method: 'GET',
      url: '/system/menus',
      headers: {
        Authorization: () => {
          const token = localStorage.getItem('access_token')
          return token ? `Bearer ${token}` : ''
        },
      },
    },
    transform: (response): MenuItem[] => {
      const data = response.data
      const menus = Array.isArray(data) ? data : data.menus || []

      interface RawMenu {
        id?: string | number
        menuId?: string | number
        name?: string
        menuName?: string
        title?: string
        menuTitle?: string
        icon?: string
        path?: string
        url?: string
        component?: string
        parentId?: string | number
        pid?: string | number
        sort?: number
        orderNum?: number
        hidden?: boolean
        isHidden?: boolean
        children?: unknown[]
        meta?: Record<string, unknown>
      }

      return menus.map(
        (menu: RawMenu): MenuItem => ({
          id: (menu.id ?? menu.menuId ?? '') as string | number,
          name: (menu.name ?? menu.menuName ?? ''),
          title: (menu.title ?? menu.menuTitle ?? menu.name ?? ''),
          icon: menu.icon,
          path: menu.path || menu.url,
          component: menu.component,
          parentId: menu.parentId || menu.pid,
          sort: menu.sort || menu.orderNum,
          hidden: menu.hidden || menu.isHidden,
          children: (menu.children as MenuItem[] | undefined) || [],
          meta: (menu.meta as Record<string, unknown> | undefined) || {},
        }),
      )
    },
    cache: {
      enabled: true,
      ttl: 1800000, // 30分钟缓存
    },
  },

  /**
   * 获取用户权限
   */
  [SYSTEM_API_METHODS.GET_PERMISSIONS]: {
    name: SYSTEM_API_METHODS.GET_PERMISSIONS,
    config: {
      method: 'GET',
      url: '/user/permissions',
      headers: {
        Authorization: () => {
          const token = localStorage.getItem('access_token')
          return token ? `Bearer ${token}` : ''
        },
      },
    },
    transform: (response): string[] => {
      const data = response.data
      return Array.isArray(data) ? data : data.permissions || []
    },
    cache: {
      enabled: true,
      ttl: 1800000, // 30分钟缓存
    },
  },

  /**
   * 刷新令牌
   */
  [SYSTEM_API_METHODS.REFRESH_TOKEN]: {
    name: SYSTEM_API_METHODS.REFRESH_TOKEN,
    config: {
      method: 'POST',
      url: '/auth/refresh',
      data: () => ({
        refreshToken: localStorage.getItem('refresh_token'),
      }),
    },
    transform: (response): LoginResult => {
      const data = response.data
      return {
        accessToken: data.accessToken || data.token || data.access_token,
        refreshToken: data.refreshToken || data.refresh_token,
        tokenType: data.tokenType || data.token_type || 'Bearer',
        expiresIn: data.expiresIn || data.expires_in,
      }
    },
    onSuccess: (result: LoginResult) => {
      // 更新 token（在无 localStorage 环境下静默跳过）
      try {
        if (result.accessToken && typeof localStorage !== 'undefined') {
          localStorage.setItem('access_token', result.accessToken)
        }
        if (result.refreshToken && typeof localStorage !== 'undefined') {
          localStorage.setItem('refresh_token', result.refreshToken)
        }
      }
      catch {}
    },
    cache: {
      enabled: false,
    },
  },

  /**
   * 修改密码
   */
  [SYSTEM_API_METHODS.CHANGE_PASSWORD]: {
    name: SYSTEM_API_METHODS.CHANGE_PASSWORD,
    config: (params: {
      oldPassword: string
      newPassword: string
      confirmPassword?: string
    }) => ({
      method: 'PUT',
      url: '/user/password',
      data: params,
      headers: {
        Authorization: () => {
          const token = localStorage.getItem('access_token')
          return token ? `Bearer ${token}` : ''
        },
      },
    }),
    cache: {
      enabled: false,
    },
  },

  /**
   * 获取系统配置
   */
  [SYSTEM_API_METHODS.GET_SYSTEM_CONFIG]: {
    name: SYSTEM_API_METHODS.GET_SYSTEM_CONFIG,
    config: {
      method: 'GET',
      url: '/system/config',
    },
    cache: {
      enabled: true,
      ttl: 3600000, // 1小时缓存
    },
  },
}

/**
 * 系统 API 插件
 */
export const systemApiPlugin: ApiPlugin = {
  name: 'system-apis',
  version: '1.0.0',
  apis: systemApiMethods,

  install: (engine) => {
    // 若检测到认证中间件已安装，则移除方法级 Authorization 头，避免与全局中间件重复
    const authInstalled = Boolean((engine as unknown as { __auth_mw__?: unknown }).__auth_mw__)
    if (authInstalled) {
      const methodNames = [
        SYSTEM_API_METHODS.GET_USER_INFO,
        SYSTEM_API_METHODS.UPDATE_USER_INFO,
        SYSTEM_API_METHODS.GET_MENUS,
        SYSTEM_API_METHODS.GET_PERMISSIONS,
        SYSTEM_API_METHODS.CHANGE_PASSWORD,
      ]
      for (const name of methodNames) {
        const cfg = engine.methods.get(name)
        if (!cfg)
          continue
        const original = typeof cfg.config === 'function' ? cfg.config : () => cfg.config
        const newCfg = (params?: unknown) => {
          const rc = original(params)
          // 创建浅拷贝并移除 Authorization 头
          const headers = { ...(rc.headers || {}) }
          if ('Authorization' in headers)
            delete (headers as Record<string, unknown>).Authorization
          return { ...rc, headers }
        }
        engine.register(name, { ...cfg, config: newCfg })
      }
    }

    // 只在开发模式或debug模式下输出日志
    if (engine.config?.debug || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')) {
      console.info('[System API Plugin] 系统 API 插件已安装')
    }

    // 可以在这里添加额外的初始化逻辑
    // 例如：设置全局请求拦截器、错误处理等
  },

  uninstall: (engine) => {
    // 只在开发模式或debug模式下输出日志
    if (engine.config?.debug || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')) {
      console.info('[System API Plugin] 系统 API 插件已卸载')
    }
  },
}

/**
 * 创建自定义系统 API 插件
 *
 * @param customMethods 自定义方法配置
 * @param options 插件选项
 * @param options.name 插件名称
 * @param options.version 插件版本
 * @param options.overrideDefaults 是否覆盖默认方法
 * @returns 自定义系统 API 插件
 *
 * @example
 * ```typescript
 * import { createCustomSystemApiPlugin } from '@ldesign/api'
 *
 * const customPlugin = createCustomSystemApiPlugin({
 *   getProfile: {
 *     name: 'getProfile',
 *     config: { method: 'GET', url: '/profile' },
 *   },
 * })
 * ```
 */
export function createCustomSystemApiPlugin(
  customMethods: Record<string, ApiMethodConfig>,
  options: {
    name?: string
    version?: string
    overrideDefaults?: boolean
  } = {},
): ApiPlugin {
  const {
    name = 'custom-system-apis',
    version = '1.0.0',
    overrideDefaults = false,
  } = options

  const apis = overrideDefaults
    ? customMethods
    : { ...systemApiMethods, ...customMethods }

  return {
    name,
    version,
    apis,
    install: (_engine) => {
      console.warn(`[${name}] 自定义系统 API 插件已安装`)
    },
    uninstall: (_engine) => {
      console.warn(`[${name}] 自定义系统 API 插件已卸载`)
    },
  }
}
