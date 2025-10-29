/**
 * 环境配置
 * 统一管理不同环境下的配置项
 */

/**
 * API 基础路径
 * 开发环境: 通过 Vite 代理到后端
 * 生产环境: 同源 API
 */
export const API_BASE_URL = import.meta.env.DEV ? '/api' : '/api'

/**
 * WebSocket 基础路径
 * 开发环境: 直连后端服务器
 * 生产环境: 使用当前页面的 host
 */
export const WS_BASE_URL = import.meta.env.DEV
  ? 'ws://localhost:3000'
  : `ws://${window.location.host}`

/**
 * 是否为开发环境
 */
export const IS_DEV = import.meta.env.DEV

/**
 * 是否为生产环境
 */
export const IS_PROD = import.meta.env.PROD

/**
 * 应用版本
 */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

/**
 * API 超时时间
 */
export const API_TIMEOUT = 30000

/**
 * 调试模式
 */
export const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true'


