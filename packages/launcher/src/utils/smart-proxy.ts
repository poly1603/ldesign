/**
 * 智能代理处理器
 *
 * 提供专业的服务类型代理配置自动转换和智能处理功能
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import type {
  ProxyOptions,
  ApiProxyConfig,
  AssetsProxyConfig,
  WebSocketProxyConfig,
  UploadProxyConfig,
  CustomProxyRule
} from '../types/config'

/**
 * 智能代理处理器类
 */
export class SmartProxyProcessor {
  /**
   * 处理代理配置，将服务类型配置转换为 Vite 标准配置
   *
   * @param proxyConfig 代理配置
   * @param environment 环境标识
   * @returns 处理后的 Vite 代理配置
   */
  static processProxyConfig(
    proxyConfig: ProxyOptions | Record<string, any>,
    environment: string = 'development'
  ): Record<string, any> {
    // 如果是简单的 Record 对象，直接返回
    if (!proxyConfig || typeof proxyConfig !== 'object') {
      return proxyConfig || {}
    }

    // 检查是否包含服务类型配置
    const hasServiceConfig = this.hasServiceTypeConfig(proxyConfig)
    const hasStandardConfig = this.hasStandardViteConfig(proxyConfig)

    let result: Record<string, any> = {}

    // 处理标准 Vite 配置
    if (hasStandardConfig) {
      const standardConfig = this.extractStandardConfig(proxyConfig)
      result = { ...standardConfig }
    }

    // 处理服务类型配置
    if (hasServiceConfig) {
      const convertedConfig = this.convertServiceConfig(proxyConfig, environment)

      // 合并配置，服务类型配置优先级较低
      result = { ...convertedConfig, ...result }
    }

    return result
  }

  /**
   * 检查是否包含服务类型配置
   */
  private static hasServiceTypeConfig(config: any): boolean {
    return !!(config.api || config.assets || config.websocket || config.upload || config.custom)
  }

  /**
   * 检查是否包含标准 Vite 配置
   */
  private static hasStandardViteConfig(config: any): boolean {
    const serviceKeys = ['api', 'assets', 'websocket', 'upload', 'custom', 'global', 'rules', 'middleware', 'logging']
    return Object.keys(config).some(key => !serviceKeys.includes(key))
  }

  /**
   * 提取标准 Vite 配置
   */
  private static extractStandardConfig(config: any): Record<string, any> {
    const { api, assets, websocket, upload, custom, global, rules, middleware, logging, ...standardConfig } = config
    return standardConfig
  }

  /**
   * 转换服务类型配置为标准 Vite 代理配置
   *
   * @param config 服务类型配置
   * @param environment 环境标识
   * @returns 标准 Vite 代理配置
   */
  private static convertServiceConfig(
    config: ProxyOptions,
    environment: string
  ): Record<string, any> {
    const result: Record<string, any> = {}
    const globalConfig = config.global
    const isVerbose = globalConfig?.verbose ?? (environment === 'development')
    const isSecure = globalConfig?.secure ?? (environment === 'production')

    // 创建通用的代理处理器
    const createProxyHandler = (serviceName: string, customHeaders: Record<string, string> = {}) => {
      return (proxy: any) => {
        proxy.on('error', (err: Error) => {
          console.error(`🔴 [${environment.toUpperCase()}] ${serviceName} 代理错误:`, err.message)
        })

        proxy.on('proxyReq', (proxyReq: any, req: any) => {
          // 添加环境标识头
          proxyReq.setHeader('X-Environment', environment)
          proxyReq.setHeader('X-Forwarded-Proto', isSecure ? 'https' : 'http')

          // 添加全局头
          if (globalConfig?.headers) {
            Object.entries(globalConfig.headers).forEach(([key, value]) => {
              proxyReq.setHeader(key, value)
            })
          }

          // 添加自定义头
          Object.entries(customHeaders).forEach(([key, value]) => {
            proxyReq.setHeader(key, value)
          })

          if (isVerbose) {
            console.log(`🔄 [${environment.toUpperCase()}] ${serviceName}:`, req.method, req.url)
          }
        })

        if (isVerbose) {
          proxy.on('proxyRes', (proxyRes: any, req: any) => {
            console.log(`✅ [${environment.toUpperCase()}] ${serviceName}:`, req.url, '->', proxyRes.statusCode)
          })
        }
      }
    }

    // 处理 API 代理
    if (config.api) {
      const { target, pathPrefix = '/api', rewrite = true, headers = {}, timeout, auth } = config.api

      result[pathPrefix] = {
        target,
        changeOrigin: true,
        secure: isSecure,
        timeout: timeout || globalConfig?.timeout,
        rewrite: rewrite ? (path: string) => path.replace(new RegExp(`^${pathPrefix}`), '') : undefined,
        configure: createProxyHandler('API', {
          'X-API-Service': 'ldesign',
          'X-Request-Source': 'web-app',
          ...headers
        })
      }

      // 添加认证配置
      if (auth || globalConfig?.auth) {
        const authConfig = auth || globalConfig?.auth
        if (authConfig) {
          result[pathPrefix].auth = `${authConfig.username}:${authConfig.password}`
        }
      }
    }

    // 处理静态资源代理
    if (config.assets) {
      const { target, pathPrefix = '/assets', cache } = config.assets

      result[pathPrefix] = {
        target,
        changeOrigin: true,
        secure: isSecure,
        configure: createProxyHandler('Assets', {
          'X-Static-Service': environment,
          'Cache-Control': cache?.maxAge
            ? `public, max-age=${cache.maxAge}`
            : (environment === 'production' ? 'public, max-age=31536000' : 'public, max-age=300'),
          ...(cache?.etag ? { 'ETag': 'true' } : {})
        })
      }
    }

    // 处理 WebSocket 代理
    if (config.websocket) {
      const { target, pathPrefix = '/ws' } = config.websocket

      // 自动转换 HTTP 到 WebSocket 协议
      const wsTarget = target.replace(/^http/, 'ws')

      result[pathPrefix] = {
        target: wsTarget,
        ws: true,
        changeOrigin: true,
        secure: isSecure,
        configure: (proxy: any) => {
          if (isVerbose) {
            proxy.on('open', () => {
              console.log(`🔌 [${environment.toUpperCase()}] WebSocket 连接已建立`)
            })
            proxy.on('close', () => {
              console.log(`🔌 [${environment.toUpperCase()}] WebSocket 连接已关闭`)
            })
          }
          proxy.on('error', (err: Error) => {
            console.error(`🔴 [${environment.toUpperCase()}] WebSocket 代理错误:`, err.message)
          })
        }
      }
    }

    // 处理上传服务代理
    if (config.upload) {
      const { target, pathPrefix = '/upload', timeout, maxFileSize } = config.upload

      result[pathPrefix] = {
        target,
        changeOrigin: true,
        secure: isSecure,
        timeout: timeout || globalConfig?.timeout || 30000,
        configure: createProxyHandler('Upload', {
          'X-Upload-Service': environment,
          'X-Max-File-Size': maxFileSize || (environment === 'production' ? '50MB' : '100MB')
        })
      }
    }

    // 处理自定义代理规则
    if (config.custom && Array.isArray(config.custom)) {
      config.custom.forEach((rule, index) => {
        const { path, target, options = {} } = rule
        const pathKey = typeof path === 'string' ? path : `^${path.source}`

        result[pathKey] = {
          target,
          changeOrigin: true,
          secure: isSecure,
          ...options,
          configure: createProxyHandler(`Custom-${index + 1}`, {
            'X-Custom-Service': 'true',
            ...(options.headers || {})
          })
        }
      })
    }

    return result
  }

  /**
   * 验证代理配置
   *
   * @param config 代理配置
   * @returns 验证结果
   */
  static validateProxyConfig(config: any): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config || typeof config !== 'object') {
      return { valid: true, errors, warnings }
    }

    // 验证 API 配置
    if (config.api) {
      if (!config.api.target) {
        errors.push('API 代理配置缺少 target 字段')
      } else if (!this.isValidUrl(config.api.target)) {
        errors.push(`API 代理 target 不是有效的 URL: ${config.api.target}`)
      }
    }

    // 验证静态资源配置
    if (config.assets) {
      if (!config.assets.target) {
        errors.push('静态资源代理配置缺少 target 字段')
      } else if (!this.isValidUrl(config.assets.target)) {
        errors.push(`静态资源代理 target 不是有效的 URL: ${config.assets.target}`)
      }
    }

    // 验证 WebSocket 配置
    if (config.websocket) {
      if (!config.websocket.target) {
        errors.push('WebSocket 代理配置缺少 target 字段')
      } else if (!this.isValidUrl(config.websocket.target)) {
        errors.push(`WebSocket 代理 target 不是有效的 URL: ${config.websocket.target}`)
      } else if (config.websocket.target.startsWith('http://')) {
        warnings.push('WebSocket 代理使用 HTTP 协议，将自动转换为 WS 协议')
      }
    }

    // 验证上传服务配置
    if (config.upload) {
      if (!config.upload.target) {
        errors.push('上传服务代理配置缺少 target 字段')
      } else if (!this.isValidUrl(config.upload.target)) {
        errors.push(`上传服务代理 target 不是有效的 URL: ${config.upload.target}`)
      }
    }

    // 验证自定义规则
    if (config.custom && Array.isArray(config.custom)) {
      config.custom.forEach((rule: any, index: number) => {
        if (!rule.path) {
          errors.push(`自定义代理规则 ${index + 1} 缺少 path 字段`)
        }
        if (!rule.target) {
          errors.push(`自定义代理规则 ${index + 1} 缺少 target 字段`)
        } else if (!this.isValidUrl(rule.target)) {
          errors.push(`自定义代理规则 ${index + 1} target 不是有效的 URL: ${rule.target}`)
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 检查是否为有效的 URL
   * 
   * @param url URL 字符串
   * @returns 是否有效
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}
