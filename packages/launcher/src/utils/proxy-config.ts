/**
 * 代理配置处理工具
 * 
 * 提供代理配置的转换、验证和增强功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { ProxyOptions, ExtendedProxyRule } from '../types'

/**
 * 简化的代理配置接口
 * 支持更友好的配置语法
 */
export interface SimpleProxyConfig {
  /** API 代理配置 */
  api?: {
    /** 目标服务器地址 */
    target: string
    /** 路径前缀，默认为 '/api' */
    pathPrefix?: string
    /** 是否修改来源，默认为 true */
    changeOrigin?: boolean
    /** 是否重写路径，默认为 true（移除路径前缀） */
    rewrite?: boolean | ((path: string) => string)
    /** 请求头配置 */
    headers?: Record<string, string>
    /** 超时时间（毫秒） */
    timeout?: number
  }

  /** 静态资源代理配置 */
  assets?: {
    /** 目标服务器地址 */
    target: string
    /** 路径前缀，默认为 '/assets' */
    pathPrefix?: string
    /** 是否修改来源，默认为 true */
    changeOrigin?: boolean
    /** 缓存配置 */
    cache?: {
      /** 缓存时间（秒），默认为 3600 */
      maxAge?: number
      /** 是否启用 ETag */
      etag?: boolean
    }
  }

  /** WebSocket 代理配置 */
  websocket?: {
    /** 目标服务器地址 */
    target: string
    /** 路径前缀，默认为 '/ws' */
    pathPrefix?: string
    /** 是否修改来源，默认为 true */
    changeOrigin?: boolean
  }

  /** 自定义代理规则 */
  custom?: Array<{
    /** 匹配路径 */
    path: string | RegExp
    /** 目标地址 */
    target: string
    /** 其他选项 */
    options?: Partial<ExtendedProxyRule>
  }>
}

/**
 * 代理配置处理器类
 */
export class ProxyConfigProcessor {
  /**
   * 转换简化配置为标准代理配置
   * 
   * @param simpleConfig - 简化的代理配置
   * @returns 标准的代理配置
   */
  static transformSimpleConfig(simpleConfig: SimpleProxyConfig): Record<string, any> {
    const proxyConfig: Record<string, any> = {}

    // 处理 API 代理
    if (simpleConfig.api) {
      const { target, pathPrefix = '/api', changeOrigin = true, rewrite = true, headers, timeout } = simpleConfig.api
      
      const rewriteFn = typeof rewrite === 'function' 
        ? rewrite 
        : rewrite 
          ? (path: string) => path.replace(new RegExp(`^${pathPrefix}`), '')
          : undefined

      proxyConfig[pathPrefix] = {
        target,
        changeOrigin,
        ...(rewriteFn && { rewrite: rewriteFn }),
        ...(headers && { headers }),
        ...(timeout && { timeout }),
        configure: (proxy: any) => {
          proxy.on('error', (err: Error) => {
            console.error(`API 代理错误 (${pathPrefix}):`, err.message)
          })
          proxy.on('proxyReq', (proxyReq: any, req: any) => {
            console.log(`API 代理请求: ${req.method} ${req.url} -> ${target}`)
          })
        }
      }
    }

    // 处理静态资源代理
    if (simpleConfig.assets) {
      const { target, pathPrefix = '/assets', changeOrigin = true, cache } = simpleConfig.assets

      proxyConfig[pathPrefix] = {
        target,
        changeOrigin,
        configure: (proxy: any) => {
          proxy.on('error', (err: Error) => {
            console.error(`静态资源代理错误 (${pathPrefix}):`, err.message)
          })
          
          // 添加缓存头
          if (cache) {
            proxy.on('proxyRes', (proxyRes: any) => {
              if (cache.maxAge) {
                proxyRes.headers['Cache-Control'] = `public, max-age=${cache.maxAge}`
              }
              if (cache.etag !== false) {
                // 保持默认的 ETag 行为
              }
            })
          }
        }
      }
    }

    // 处理 WebSocket 代理
    if (simpleConfig.websocket) {
      const { target, pathPrefix = '/ws', changeOrigin = true } = simpleConfig.websocket

      proxyConfig[pathPrefix] = {
        target: target.replace(/^http/, 'ws'), // 自动转换为 WebSocket 协议
        changeOrigin,
        ws: true,
        configure: (proxy: any) => {
          proxy.on('error', (err: Error) => {
            console.error(`WebSocket 代理错误 (${pathPrefix}):`, err.message)
          })
        }
      }
    }

    // 处理自定义代理规则
    if (simpleConfig.custom) {
      for (const rule of simpleConfig.custom) {
        const pathKey = typeof rule.path === 'string' ? rule.path : rule.path.source
        proxyConfig[pathKey] = {
          target: rule.target,
          changeOrigin: true,
          ...rule.options
        }
      }
    }

    return proxyConfig
  }

  /**
   * 验证代理配置
   * 
   * @param config - 代理配置
   * @returns 验证结果
   */
  static validateProxyConfig(config: any): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config || typeof config !== 'object') {
      errors.push('代理配置必须是一个对象')
      return { valid: false, errors, warnings }
    }

    // 验证每个代理规则
    for (const [path, rule] of Object.entries(config)) {
      if (!rule || typeof rule !== 'object') {
        errors.push(`代理规则 "${path}" 必须是一个对象`)
        continue
      }

      const ruleObj = rule as any

      // 验证目标地址
      if (!ruleObj.target || typeof ruleObj.target !== 'string') {
        errors.push(`代理规则 "${path}" 缺少有效的目标地址`)
        continue
      }

      // 验证目标地址格式
      try {
        new URL(ruleObj.target)
      } catch {
        errors.push(`代理规则 "${path}" 的目标地址格式无效: ${ruleObj.target}`)
      }

      // 检查常见配置问题
      if (ruleObj.ws && !ruleObj.target.startsWith('ws')) {
        warnings.push(`代理规则 "${path}" 启用了 WebSocket 但目标地址不是 ws:// 协议`)
      }

      if (ruleObj.secure === false && ruleObj.target.startsWith('https')) {
        warnings.push(`代理规则 "${path}" 禁用了安全验证但目标是 HTTPS`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 合并代理配置
   * 
   * @param baseConfig - 基础配置
   * @param overrideConfig - 覆盖配置
   * @returns 合并后的配置
   */
  static mergeProxyConfigs(baseConfig: any, overrideConfig: any): any {
    if (!baseConfig) return overrideConfig || {}
    if (!overrideConfig) return baseConfig || {}

    const merged = { ...baseConfig }

    for (const [path, rule] of Object.entries(overrideConfig)) {
      if (merged[path] && typeof merged[path] === 'object' && typeof rule === 'object') {
        // 深度合并代理规则
        merged[path] = { ...merged[path], ...rule }
      } else {
        // 直接覆盖
        merged[path] = rule
      }
    }

    return merged
  }

  /**
   * 生成代理配置示例
   * 
   * @param type - 配置类型
   * @returns 配置示例
   */
  static generateExample(type: 'simple' | 'advanced' = 'simple'): SimpleProxyConfig | Record<string, any> {
    if (type === 'simple') {
      return {
        api: {
          target: 'http://localhost:8080',
          pathPrefix: '/api',
          rewrite: true,
          headers: {
            'X-Forwarded-Host': 'localhost'
          }
        },
        assets: {
          target: 'http://localhost:9000',
          pathPrefix: '/assets',
          cache: {
            maxAge: 3600,
            etag: true
          }
        },
        websocket: {
          target: 'ws://localhost:8080',
          pathPrefix: '/ws'
        }
      }
    } else {
      return {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
          configure: (proxy: any) => {
            proxy.on('error', (err: Error) => {
              console.log('proxy error', err)
            })
          }
        },
        '/upload': {
          target: 'http://localhost:9000',
          changeOrigin: true,
          timeout: 30000
        },
        '^/ws/.*': {
          target: 'ws://localhost:8080',
          ws: true,
          changeOrigin: true
        }
      }
    }
  }
}

/**
 * 创建简化的代理配置
 * 
 * @param config - 简化配置
 * @returns 标准代理配置
 */
export function createProxyConfig(config: SimpleProxyConfig): Record<string, any> {
  return ProxyConfigProcessor.transformSimpleConfig(config)
}

/**
 * 验证代理配置
 * 
 * @param config - 代理配置
 * @returns 验证结果
 */
export function validateProxy(config: any) {
  return ProxyConfigProcessor.validateProxyConfig(config)
}
