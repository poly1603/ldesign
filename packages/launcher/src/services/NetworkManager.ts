/**
 * 网络配置管理器
 * 负责处理代理配置、路径别名和 CORS 设置
 */

import path from 'node:path'
import type {
  AliasConfig,
  AliasResolveResult,
  CORSConfig,
  INetworkManager,
  NetworkConfig,
  NetworkConfigValidation,
  NetworkStats,
  ProxyConfig,
  ProxyMatchResult,
  ProxyRule,
} from '../types/network'
import { ErrorHandler } from './ErrorHandler'

export class NetworkManager implements INetworkManager {
  private proxyConfig: ProxyConfig = {}
  private aliasConfig: AliasConfig = {}
  private corsConfig: CORSConfig = {}
  private errorHandler: ErrorHandler
  private stats: NetworkStats = {
    proxy: {
      totalRequests: 0,
      successRequests: 0,
      errorRequests: 0,
      averageResponseTime: 0,
    },
    alias: {
      totalResolves: 0,
      successResolves: 0,
      cacheHits: 0,
    },
  }

  constructor() {
    this.errorHandler = new ErrorHandler()
    this.initializeDefaults()
  }

  /**
   * 初始化默认配置
   */
  private initializeDefaults(): void {
    // 默认别名配置
    this.aliasConfig = {
      '@': path.resolve(process.cwd(), 'src'),
      '~': path.resolve(process.cwd(), 'node_modules'),
    }

    // 默认 CORS 配置
    this.corsConfig = {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }
  }

  /**
   * 配置代理
   */
  configureProxy(config: ProxyConfig): void {
    try {
      this.validateProxyConfig(config)
      this.proxyConfig = { ...this.proxyConfig, ...config }
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'configure proxy',
      )
      throw launcherError
    }
  }

  /**
   * 添加代理规则
   */
  addProxyRule(pattern: string, rule: string | ProxyRule): void {
    try {
      this.proxyConfig[pattern] = rule
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'add proxy rule',
      )
      throw launcherError
    }
  }

  /**
   * 移除代理规则
   */
  removeProxyRule(pattern: string): void {
    delete this.proxyConfig[pattern]
  }

  /**
   * 获取代理配置
   */
  getProxyConfig(): ProxyConfig {
    return { ...this.proxyConfig }
  }

  /**
   * 配置别名
   */
  configureAlias(aliases: AliasConfig): void {
    try {
      this.validateAliasConfig(aliases)
      this.aliasConfig = { ...this.aliasConfig, ...aliases }
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'configure alias',
      )
      throw launcherError
    }
  }

  /**
   * 添加别名
   */
  addAlias(key: string, aliasPath: string): void {
    try {
      this.aliasConfig[key] = path.resolve(aliasPath)
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'add alias',
      )
      throw launcherError
    }
  }

  /**
   * 移除别名
   */
  removeAlias(key: string): void {
    delete this.aliasConfig[key]
  }

  /**
   * 解析别名路径
   */
  resolveAlias(inputPath: string): string {
    this.stats.alias.totalResolves++

    try {
      // 查找匹配的别名
      for (const [alias, aliasPath] of Object.entries(this.aliasConfig)) {
        if (inputPath.startsWith(alias)) {
          const resolvedPath = inputPath.replace(alias, aliasPath)
          this.stats.alias.successResolves++
          return path.resolve(resolvedPath)
        }
      }

      // 没有匹配的别名，返回原路径
      return path.resolve(inputPath)
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'resolve alias',
      )
      throw launcherError
    }
  }

  /**
   * 获取别名配置
   */
  getAliasConfig(): AliasConfig {
    return { ...this.aliasConfig }
  }

  /**
   * 配置 CORS
   */
  configureCORS(config: CORSConfig): void {
    try {
      this.corsConfig = { ...this.corsConfig, ...config }
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'configure CORS',
      )
      throw launcherError
    }
  }

  /**
   * 获取 CORS 配置
   */
  getCORSConfig(): CORSConfig {
    return { ...this.corsConfig }
  }

  /**
   * 生成 Vite 代理配置
   */
  generateViteProxyConfig(): Record<string, any> {
    const viteProxy: Record<string, any> = {}

    for (const [pattern, rule] of Object.entries(this.proxyConfig)) {
      if (typeof rule === 'string') {
        viteProxy[pattern] = {
          target: rule,
          changeOrigin: true,
        }
      }
      else {
        viteProxy[pattern] = {
          target: rule.target,
          changeOrigin: rule.changeOrigin ?? true,
          pathRewrite: rule.pathRewrite,
          headers: rule.headers,
          ws: rule.ws ?? false,
          secure: rule.secure ?? true,
          configure: rule.configure,
          onProxyReq: rule.onProxyReq,
          onProxyRes: rule.onProxyRes,
          onError: rule.onError,
        }
      }
    }

    return viteProxy
  }

  /**
   * 生成 Vite 别名配置
   */
  generateViteAliasConfig(): Record<string, string> {
    return { ...this.aliasConfig }
  }

  /**
   * 验证网络配置
   */
  validateConfig(config: NetworkConfig): boolean {
    try {
      const validation = this.validateNetworkConfig(config)
      return validation.valid
    }
    catch (error) {
      return false
    }
  }

  /**
   * 重置配置
   */
  reset(): void {
    this.proxyConfig = {}
    this.aliasConfig = {}
    this.corsConfig = {}
    this.initializeDefaults()
  }

  /**
   * 获取统计信息
   */
  getStats(): NetworkStats {
    return { ...this.stats }
  }

  /**
   * 匹配代理规则
   */
  matchProxyRule(url: string): ProxyMatchResult {
    for (const [pattern, rule] of Object.entries(this.proxyConfig)) {
      if (this.isPatternMatch(url, pattern)) {
        const normalizedRule = typeof rule === 'string' ? { target: rule } : rule
        return {
          matched: true,
          pattern,
          rule: normalizedRule,
          rewrittenPath: this.rewritePath(url, normalizedRule.pathRewrite),
        }
      }
    }

    return { matched: false }
  }

  /**
   * 解析别名路径（带详细结果）
   */
  resolveAliasDetailed(inputPath: string): AliasResolveResult {
    this.stats.alias.totalResolves++

    for (const [alias, aliasPath] of Object.entries(this.aliasConfig)) {
      if (inputPath.startsWith(alias)) {
        const resolvedPath = inputPath.replace(alias, aliasPath)
        this.stats.alias.successResolves++
        return {
          resolved: true,
          originalPath: inputPath,
          resolvedPath: path.resolve(resolvedPath),
          alias,
        }
      }
    }

    return {
      resolved: false,
      originalPath: inputPath,
      resolvedPath: path.resolve(inputPath),
    }
  }

  /**
   * 验证代理配置
   */
  private validateProxyConfig(config: ProxyConfig): void {
    for (const [pattern, rule] of Object.entries(config)) {
      if (!pattern || typeof pattern !== 'string') {
        throw new Error(`Invalid proxy pattern: ${pattern}`)
      }

      if (typeof rule === 'string') {
        if (!rule || !this.isValidUrl(rule)) {
          throw new Error(`Invalid proxy target: ${rule}`)
        }
      }
      else if (typeof rule === 'object') {
        if (!rule.target || !this.isValidUrl(rule.target)) {
          throw new Error(`Invalid proxy target: ${rule.target}`)
        }
      }
      else {
        throw new Error(`Invalid proxy rule type for pattern: ${pattern}`)
      }
    }
  }

  /**
   * 验证别名配置
   */
  private validateAliasConfig(aliases: AliasConfig): void {
    for (const [key, aliasPath] of Object.entries(aliases)) {
      if (!key || typeof key !== 'string') {
        throw new Error(`Invalid alias key: ${key}`)
      }

      if (!aliasPath || typeof aliasPath !== 'string') {
        throw new Error(`Invalid alias path: ${aliasPath}`)
      }
    }
  }

  /**
   * 验证网络配置
   */
  private validateNetworkConfig(config: NetworkConfig): NetworkConfigValidation {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      if (config.proxy) {
        this.validateProxyConfig(config.proxy)
      }

      if (config.alias) {
        this.validateAliasConfig(config.alias)
      }

      if (config.port && (config.port < 1 || config.port > 65535)) {
        errors.push(`Invalid port number: ${config.port}`)
      }

      if (config.host && typeof config.host !== 'string') {
        errors.push(`Invalid host: ${config.host}`)
      }
    }
    catch (error) {
      errors.push((error as Error).message)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 检查模式是否匹配
   */
  private isPatternMatch(url: string, pattern: string): boolean {
    // 简单的模式匹配，支持通配符
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
    const regex = new RegExp(`^${regexPattern}`)
    return regex.test(url)
  }

  /**
   * 重写路径
   */
  private rewritePath(url: string, pathRewrite?: Record<string, string>): string {
    if (!pathRewrite) {
      return url
    }

    let rewrittenUrl = url
    for (const [from, to] of Object.entries(pathRewrite)) {
      const regex = new RegExp(from)
      rewrittenUrl = rewrittenUrl.replace(regex, to)
    }

    return rewrittenUrl
  }

  /**
   * 验证 URL 格式
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    }
    catch {
      // 也允许相对路径和主机:端口格式
      return /^(https?:\/\/|\/\/)?[\w.-]+(:\d+)?/.test(url)
    }
  }
}

/**
 * 默认网络管理器实例
 */
export const networkManager = new NetworkManager()
