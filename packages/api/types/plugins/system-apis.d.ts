import { ApiPlugin } from '../types/index.js'

/**
 * 系统 API 插件配置
 */
interface SystemApiConfig {
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
interface SystemApiEndpoints {
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
 * 创建系统 API 插件
 */
declare function createSystemApiPlugin(config?: SystemApiConfig): ApiPlugin
/**
 * 默认系统 API 插件实例
 */
declare const systemApiPlugin: ApiPlugin
/**
 * 系统 API 方法名称常量
 */
declare const SYSTEM_API_METHODS: {
  readonly GET_CAPTCHA: 'getCaptcha'
  readonly GET_SESSION: 'getSession'
  readonly LOGIN: 'login'
  readonly LOGOUT: 'logout'
  readonly GET_USER_INFO: 'getUserInfo'
  readonly GET_MENUS: 'getMenus'
  readonly REFRESH_TOKEN: 'refreshToken'
  readonly CHANGE_PASSWORD: 'changePassword'
  readonly GET_PERMISSIONS: 'getPermissions'
}
/**
 * 系统 API 方法名称类型
 */
type SystemApiMethodName =
  (typeof SYSTEM_API_METHODS)[keyof typeof SYSTEM_API_METHODS]

export { SYSTEM_API_METHODS, createSystemApiPlugin, systemApiPlugin }
export type { SystemApiConfig, SystemApiEndpoints, SystemApiMethodName }
