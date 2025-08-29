/**
 * 代理配置助手工具
 * 提供常用的代理配置模板和工具函数
 */

import type { ProxyConfig, ProxyRule } from '../types/network'

/**
 * 常用代理配置模板
 */
export const ProxyTemplates = {
  /**
   * API 代理模板
   */
  api: (target: string, pathPrefix = '/api'): ProxyConfig => ({
    [pathPrefix]: {
      target,
      changeOrigin: true,
      pathRewrite: {
        [`^${pathPrefix}`]: '',
      },
      headers: {
        'X-Forwarded-For': '$remote_addr',
        'X-Forwarded-Proto': '$scheme',
      },
    },
  }),

  /**
   * 开发服务器代理模板
   */
  devServer: (_target: string, port = 8080): ProxyConfig => ({
    '/dev-server': {
      target: `http://localhost:${port}`,
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/dev-server': '',
      },
    },
  }),

  /**
   * 静态资源代理模板
   */
  static: (target: string, pathPrefix = '/static'): ProxyConfig => ({
    [pathPrefix]: {
      target,
      changeOrigin: true,
      headers: {
        'Cache-Control': 'public, max-age=31536000',
      },
    },
  }),

  /**
   * WebSocket 代理模板
   */
  websocket: (target: string, pathPrefix = '/ws'): ProxyConfig => ({
    [pathPrefix]: {
      target,
      changeOrigin: true,
      ws: true,
      timeout: 30000,
    },
  }),

  /**
   * 微服务代理模板
   */
  microservice: (services: Record<string, string>): ProxyConfig => {
    const config: ProxyConfig = {}

    for (const [serviceName, serviceUrl] of Object.entries(services)) {
      config[`/${serviceName}`] = {
        target: serviceUrl,
        changeOrigin: true,
        pathRewrite: {
          [`^/${serviceName}`]: '',
        },
        headers: {
          'X-Service-Name': serviceName,
        },
        onProxyReq: (_proxyReq, req, _res) => {
          console.log(`[Proxy] ${serviceName}: ${req.method} ${req.url} -> ${serviceUrl}`)
        },
        onError: (err, _req, _res) => {
          console.error(`[Proxy Error] ${serviceName}:`, err.message)
        },
      }
    }

    return config
  },

  /**
   * HTTPS 代理模板
   */
  https: (target: string, pathPrefix = '/secure'): ProxyConfig => ({
    [pathPrefix]: {
      target,
      changeOrigin: true,
      secure: true,
      headers: {
        'X-Forwarded-Proto': 'https',
      },
    },
  }),

  /**
   * 负载均衡代理模板
   */
  loadBalance: (targets: string[], pathPrefix = '/api'): ProxyConfig => {
    let currentIndex = 0

    return {
      [pathPrefix]: {
        target: targets[0], // 默认目标
        changeOrigin: true,
        configure: (proxy, _options) => {
          // 简单的轮询负载均衡
          proxy.on('proxyReq', (proxyReq: any, _req: any, _res: any) => {
            const target = targets[currentIndex % targets.length]
            currentIndex++

            // 更新目标地址
            const url = new URL(target)
            proxyReq.setHeader('host', url.host)

            console.log(`[Load Balance] Request routed to: ${target}`)
          })
        },
      },
    }
  },
}

/**
 * 代理配置构建器
 */
export class ProxyConfigBuilder {
  private config: ProxyConfig = {}

  /**
   * 添加 API 代理
   */
  api(target: string, pathPrefix = '/api', options?: Partial<ProxyRule>): this {
    this.config[pathPrefix] = {
      target,
      changeOrigin: true,
      pathRewrite: {
        [`^${pathPrefix}`]: '',
      },
      ...options,
    }
    return this
  }

  /**
   * 添加静态资源代理
   */
  static(target: string, pathPrefix = '/static', options?: Partial<ProxyRule>): this {
    this.config[pathPrefix] = {
      target,
      changeOrigin: true,
      headers: {
        'Cache-Control': 'public, max-age=31536000',
      },
      ...options,
    }
    return this
  }

  /**
   * 添加 WebSocket 代理
   */
  websocket(target: string, pathPrefix = '/ws', options?: Partial<ProxyRule>): this {
    this.config[pathPrefix] = {
      target,
      changeOrigin: true,
      ws: true,
      timeout: 30000,
      ...options,
    }
    return this
  }

  /**
   * 添加自定义代理规则
   */
  custom(pattern: string, rule: string | ProxyRule): this {
    this.config[pattern] = rule
    return this
  }

  /**
   * 添加多个服务的代理
   */
  services(services: Record<string, string>, options?: Partial<ProxyRule>): this {
    for (const [serviceName, serviceUrl] of Object.entries(services)) {
      this.config[`/${serviceName}`] = {
        target: serviceUrl,
        changeOrigin: true,
        pathRewrite: {
          [`^/${serviceName}`]: '',
        },
        ...options,
      }
    }
    return this
  }

  /**
   * 构建配置
   */
  build(): ProxyConfig {
    return { ...this.config }
  }

  /**
   * 重置配置
   */
  reset(): this {
    this.config = {}
    return this
  }
}

/**
 * 代理配置验证器
 */
export class ProxyConfigValidator {
  /**
   * 验证代理配置
   */
  static validate(config: ProxyConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const [pattern, rule] of Object.entries(config)) {
      // 验证模式
      if (!pattern || typeof pattern !== 'string') {
        errors.push(`Invalid proxy pattern: ${pattern}`)
        continue
      }

      // 验证规则
      if (typeof rule === 'string') {
        if (!this.isValidUrl(rule)) {
          errors.push(`Invalid proxy target URL: ${rule}`)
        }
      } else if (typeof rule === 'object' && rule !== null) {
        if (!rule.target || !this.isValidUrl(rule.target)) {
          errors.push(`Invalid proxy target URL: ${rule.target}`)
        }

        // 验证路径重写
        if (rule.pathRewrite) {
          for (const [from, _to] of Object.entries(rule.pathRewrite)) {
            try {
              new RegExp(from)
            } catch {
              errors.push(`Invalid pathRewrite regex: ${from}`)
            }
          }
        }

        // 验证超时时间
        if (rule.timeout && (rule.timeout < 0 || rule.timeout > 300000)) {
          errors.push(`Invalid timeout value: ${rule.timeout}`)
        }
      } else {
        errors.push(`Invalid proxy rule type for pattern: ${pattern}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 验证 URL 格式
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      // 也允许相对路径和主机:端口格式
      return /^(https?:\/\/|\/\/)?[\w.-]+(:\d+)?/.test(url)
    }
  }
}

/**
 * 代理配置合并器
 */
export class ProxyConfigMerger {
  /**
   * 合并多个代理配置
   */
  static merge(...configs: ProxyConfig[]): ProxyConfig {
    const merged: ProxyConfig = {}

    for (const config of configs) {
      for (const [pattern, rule] of Object.entries(config)) {
        if (merged[pattern]) {
          // 如果模式已存在，合并规则
          if (typeof merged[pattern] === 'object' && typeof rule === 'object') {
            merged[pattern] = {
              ...(merged[pattern] as ProxyRule),
              ...(rule as ProxyRule),
            }
          } else {
            // 后面的配置覆盖前面的
            merged[pattern] = rule
          }
        } else {
          merged[pattern] = rule
        }
      }
    }

    return merged
  }

  /**
   * 深度合并代理规则
   */
  static deepMerge(target: ProxyRule, source: ProxyRule): ProxyRule {
    const merged = { ...target }

    for (const [key, value] of Object.entries(source)) {
      if (key === 'pathRewrite' && merged.pathRewrite && typeof value === 'object') {
        merged.pathRewrite = { ...merged.pathRewrite, ...value }
      } else if (key === 'headers' && merged.headers && typeof value === 'object') {
        merged.headers = { ...merged.headers, ...value }
      } else {
        (merged as any)[key] = value
      }
    }

    return merged
  }
}

/**
 * 创建代理配置构建器
 */
export function createProxyBuilder(): ProxyConfigBuilder {
  return new ProxyConfigBuilder()
}

/**
 * 快速创建 API 代理配置
 */
export function createApiProxy(target: string, pathPrefix = '/api'): ProxyConfig {
  return ProxyTemplates.api(target, pathPrefix)
}

/**
 * 快速创建开发环境代理配置
 */
export function createDevProxy(apiTarget: string, staticTarget?: string): ProxyConfig {
  const builder = createProxyBuilder()
    .api(apiTarget, '/api')

  if (staticTarget) {
    builder.static(staticTarget, '/static')
  }

  return builder.build()
}

/**
 * 快速创建微服务代理配置
 */
export function createMicroserviceProxy(services: Record<string, string>): ProxyConfig {
  return ProxyTemplates.microservice(services)
}
