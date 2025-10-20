/**
 * 路由安全系统
 * 提供权限管理、认证守卫、CSRF防护、XSS防护
 */

import type {
  NavigationGuard,
  RouteLocationNormalized,
  Router,
} from '../types'
import { reactive } from 'vue'

// ============= 安全配置 =============
export interface SecurityConfig {
  // 认证配置
  auth?: {
    enabled?: boolean
    loginRoute?: string
    tokenKey?: string
    tokenStorage?: 'localStorage' | 'sessionStorage' | 'cookie'
    refreshToken?: boolean
    tokenExpiry?: number
  }
  // 权限配置
  permission?: {
    enabled?: boolean
    mode?: 'role' | 'permission' | 'mixed'
    defaultRole?: string
    roleHierarchy?: Record<string, string[]>
    cachePermissions?: boolean
  }
  // CSRF配置
  csrf?: {
    enabled?: boolean
    tokenName?: string
    headerName?: string
    cookieName?: string
    validateMethods?: string[]
  }
  // XSS配置
  xss?: {
    enabled?: boolean
    sanitizeParams?: boolean
    sanitizeQuery?: boolean
    whitelist?: string[]
    customSanitizer?: (value: string) => string
  }
}

// ============= 认证管理器 =============
export class AuthManager {
  private token: string | null = null
  private refreshTimer?: NodeJS.Timeout
  private config: SecurityConfig['auth']

  // 响应式状态
  public state = reactive({
    isAuthenticated: false,
    user: null as any,
    loading: false,
    error: null as Error | null,
  })

  constructor(config: SecurityConfig['auth'] = {}) {
    this.config = {
      enabled: true,
      loginRoute: '/login',
      tokenKey: 'auth-token',
      tokenStorage: 'localStorage',
      refreshToken: true,
      tokenExpiry: 3600000, // 1小时
      ...config,
    }

    // 初始化时检查已有token
    this.loadToken()
  }

  // 加载token
  private loadToken(): void {
    const storage = this.getStorage()
    const tokenKey = this.config?.tokenKey
    if (tokenKey) {
      this.token = storage.getItem(tokenKey)
    }

    if (this.token) {
      this.state.isAuthenticated = true
      this.validateToken()

      if (this.config?.refreshToken) {
        this.setupTokenRefresh()
      }
    }
  }

  // 获取存储
  private getStorage(): Storage {
    switch (this.config?.tokenStorage) {
      case 'sessionStorage':
        return sessionStorage
      case 'cookie':
        // 简化的cookie存储实现
        return {
          getItem: (key: string) => this.getCookie(key),
          setItem: (key: string, value: string) => this.setCookie(key, value),
          removeItem: (key: string) => this.deleteCookie(key),
          clear: () => {},
          key: () => null,
          length: 0,
        }
      default:
        return localStorage
    }
  }

  // Cookie操作
  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
    return match ? (match[2] || null) : null
  }

  private setCookie(name: string, value: string, days = 7): void {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  }

  // 验证token
  async validateToken(): Promise<boolean> {
    if (!this.token)
      return false

    try {
      // 解析JWT token（简化实现）
      const payload = this.parseJWT(this.token)

      // 检查过期
      if (payload.exp && payload.exp < Date.now() / 1000) {
        this.logout()
        return false
      }

      // 设置用户信息
      this.state.user = payload.user || { id: payload.sub }
      return true
    }
    catch (error) {
      console.error('Invalid token:', error)
      this.logout()
      return false
    }
  }

  // 解析JWT
  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      if (!base64Url) {
        throw new Error('Invalid JWT format')
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join(''),
      )
      return JSON.parse(jsonPayload)
    }
    catch {
      throw new Error('Invalid JWT token')
    }
  }

  // 设置token刷新
  private setupTokenRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }

    const refreshInterval = (this.config?.tokenExpiry || 3600000) * 0.8 // 80%时刷新

    this.refreshTimer = setInterval(() => {
      this.refreshToken()
    }, refreshInterval)
  }

  // 刷新token
  async refreshToken(): Promise<void> {
    try {
      // 这里应该调用API刷新token
      // 模拟刷新
      

      // 实际实现中，这里会发送请求到服务器
      // const response = await fetch('/api/auth/refresh', {...});
      // const { token } = await response.json();
      // this.setToken(token);
    }
    catch (error) {
      console.error('Failed to refresh token:', error)
      this.logout()
    }
  }

  // 登录
  async login(_credentials: any): Promise<boolean> {
    this.state.loading = true
    this.state.error = null

    try {
      // 实际实现中，这里会发送登录请求
      // const response = await fetch('/api/auth/login', {...});
      // const { token, user } = await response.json();

      // 模拟登录
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${
        btoa(JSON.stringify({
          sub: '123',
          user: { id: '123', name: 'Test User' },
          exp: Math.floor(Date.now() / 1000) + 3600,
        }))}.signature`

      this.setToken(token)
      this.state.user = { id: '123', name: 'Test User' }

      return true
    }
    catch (error) {
      this.state.error = error as Error
      return false
    }
    finally {
      this.state.loading = false
    }
  }

  // 设置token
  setToken(token: string): void {
    this.token = token
    this.state.isAuthenticated = true

    const storage = this.getStorage()
    const tokenKey = this.config?.tokenKey
    if (tokenKey) {
      storage.setItem(tokenKey, token)
    }

    if (this.config?.refreshToken) {
      this.setupTokenRefresh()
    }
  }

  // 登出
  logout(): void {
    this.token = null
    this.state.isAuthenticated = false
    this.state.user = null

    const storage = this.getStorage()
    const tokenKey = this.config?.tokenKey
    if (tokenKey) {
      storage.removeItem(tokenKey)
    }

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = undefined
    }
  }

  // 获取认证头
  getAuthHeader(): Record<string, string> {
    if (!this.token)
      return {}
    return { Authorization: `Bearer ${this.token}` }
  }

  // 创建认证守卫
  createAuthGuard(options: AuthGuardOptions = {}): NavigationGuard {
    return async (to, _from, _next) => {
      // 检查路由是否需要认证
      const requiresAuth = options.requiresAuth ?? to.meta?.requiresAuth ?? true

      if (!requiresAuth) {
        return true
      }

      // 检查是否已认证
      if (!this.state.isAuthenticated) {
        // 重定向到登录页
        const loginRoute = this.config?.loginRoute || '/login'
        return {
          path: loginRoute,
          query: { redirect: to.fullPath },
        }
      }

      // 验证token有效性
      const isValid = await this.validateToken()
      if (!isValid) {
        const loginRoute = this.config?.loginRoute || '/login'
        return {
          path: loginRoute,
          query: { redirect: to.fullPath },
        }
      }

      return true
    }
  }
}

// ============= 权限管理器 =============
export class PermissionManager {
  private permissions = new Set<string>()
  private roles = new Set<string>()
  private config: SecurityConfig['permission']
  private permissionCache = new Map<string, boolean>()

  constructor(config: SecurityConfig['permission'] = {}) {
    this.config = {
      enabled: true,
      mode: 'mixed',
      defaultRole: 'guest',
      roleHierarchy: {},
      cachePermissions: true,
      ...config,
    }

    // 设置默认角色
    if (this.config?.defaultRole) {
      this.addRole(this.config?.defaultRole)
    }
  }

  // 添加角色
  addRole(role: string): void {
    this.roles.add(role)

    // 添加继承的角色
    if (this.config?.roleHierarchy?.[role]) {
      this.config?.roleHierarchy[role].forEach((inheritedRole) => {
        this.roles.add(inheritedRole)
      })
    }

    // 清除缓存
    if (this.config?.cachePermissions) {
      this.permissionCache.clear()
    }
  }

  // 移除角色
  removeRole(role: string): void {
    this.roles.delete(role)

    // 移除继承的角色
    if (this.config?.roleHierarchy?.[role]) {
      this.config?.roleHierarchy[role].forEach((inheritedRole) => {
        this.roles.delete(inheritedRole)
      })
    }

    // 清除缓存
    if (this.config?.cachePermissions) {
      this.permissionCache.clear()
    }
  }

  // 设置角色
  setRoles(roles: string[]): void {
    this.roles.clear()
    roles.forEach(role => this.addRole(role))
  }

  // 添加权限
  addPermission(permission: string): void {
    this.permissions.add(permission)

    // 清除缓存
    if (this.config?.cachePermissions) {
      this.permissionCache.clear()
    }
  }

  // 移除权限
  removePermission(permission: string): void {
    this.permissions.delete(permission)

    // 清除缓存
    if (this.config?.cachePermissions) {
      this.permissionCache.clear()
    }
  }

  // 设置权限
  setPermissions(permissions: string[]): void {
    this.permissions.clear()
    permissions.forEach(p => this.permissions.add(p))

    // 清除缓存
    if (this.config?.cachePermissions) {
      this.permissionCache.clear()
    }
  }

  // 检查权限
  hasPermission(permission: string | string[]): boolean {
    if (!this.config?.enabled)
      return true

    const permissions = Array.isArray(permission) ? permission : [permission]

    // 检查缓存
    const cacheKey = permissions.join(',')
    if (this.config?.cachePermissions && this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!
    }

    let result = false

    switch (this.config?.mode) {
      case 'role':
        result = permissions.every(p => this.roles.has(p))
        break

      case 'permission':
        result = permissions.every(p => this.permissions.has(p))
        break

      case 'mixed':
        result = permissions.every(p =>
          this.permissions.has(p) || this.roles.has(p),
        )
        break
    }

    // 缓存结果
    if (this.config?.cachePermissions) {
      this.permissionCache.set(cacheKey, result)
    }

    return result
  }

  // 检查角色
  hasRole(role: string | string[]): boolean {
    const roles = Array.isArray(role) ? role : [role]
    return roles.every(r => this.roles.has(r))
  }

  // 检查任一权限
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(p))
  }

  // 检查任一角色
  hasAnyRole(roles: string[]): boolean {
    return roles.some(r => this.hasRole(r))
  }

  // 创建权限守卫
  createPermissionGuard(): NavigationGuard {
    return (to, _from, _next) => {
      // 检查路由权限
      const requiredPermissions = to.meta?.permissions as string[] | undefined
      const requiredRoles = to.meta?.roles as string[] | undefined
      const requiresAny = to.meta?.requiresAny as boolean | undefined

      // 没有权限要求，直接通过
      if (!requiredPermissions && !requiredRoles) {
        return true
      }

      // 检查权限
      let hasAccess = true

      if (requiredPermissions) {
        hasAccess = requiresAny
          ? this.hasAnyPermission(requiredPermissions)
          : this.hasPermission(requiredPermissions)
      }

      if (hasAccess && requiredRoles) {
        hasAccess = requiresAny
          ? this.hasAnyRole(requiredRoles)
          : this.hasRole(requiredRoles)
      }

      if (!hasAccess) {
        // 无权限，重定向到403页面
        return {
          path: '/403',
          query: { from: to.fullPath },
        }
      }

      return true
    }
  }
}

// ============= CSRF防护管理器 =============
export class CSRFProtection {
  private token: string
  private config: SecurityConfig['csrf']

  constructor(config: SecurityConfig['csrf'] = {}) {
    this.config = {
      enabled: true,
      tokenName: 'csrf-token',
      headerName: 'X-CSRF-Token',
      cookieName: 'XSRF-TOKEN',
      validateMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
      ...config,
    }

    this.token = this.generateToken()
    this.setupToken()
  }

  // 生成CSRF token
  private generateToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // 设置token
  private setupToken(): void {
    // 设置到cookie
    const cookieName = this.config?.cookieName
    if (cookieName) {
      this.setCookie(cookieName, this.token)
    }

    // 设置到meta标签
    const tokenName = this.config?.tokenName
    if (tokenName) {
      let meta = document.querySelector(`meta[name="${tokenName}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', tokenName)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', this.token)
    }
  }

  // 设置cookie
  private setCookie(name: string, value: string): void {
    document.cookie = `${name}=${value};path=/;SameSite=Strict;Secure`
  }

  // 获取token
  getToken(): string {
    return this.token
  }

  // 刷新token
  refreshToken(): void {
    this.token = this.generateToken()
    this.setupToken()
  }

  // 验证请求
  validateRequest(method: string, token?: string): boolean {
    if (!this.config?.enabled)
      return true

    // 检查是否需要验证
    if (!this.config?.validateMethods?.includes(method.toUpperCase())) {
      return true
    }

    // 验证token
    return token === this.token
  }

  // 获取请求头
  getHeaders(): Record<string, string> {
    if (!this.config?.enabled)
      return {}

    const headerName = this.config?.headerName
    if (!headerName) {
      return {}
    }
    return {
      [headerName]: this.token,
    }
  }

  // 拦截器
  createInterceptor() {
    return {
      request: (config: any) => {
        // 添加CSRF token到请求头
        if (this.config?.validateMethods?.includes(config.method?.toUpperCase())) {
          config.headers = {
            ...config.headers,
            ...this.getHeaders(),
          }
        }
        return config
      },

      response: (response: any) => {
        // 从响应中更新token（如果有）
        const headerName = this.config?.headerName
        if (headerName) {
          const newToken = response.headers?.[headerName.toLowerCase()]
          if (newToken && newToken !== this.token) {
            this.token = newToken
            this.setupToken()
          }
        }
        return response
      },
    }
  }
}

// ============= XSS防护管理器 =============
export class XSSProtection {
  private config: SecurityConfig['xss']
  private sanitizer: (value: string) => string

  constructor(config: SecurityConfig['xss'] = {}) {
    this.config = {
      enabled: true,
      sanitizeParams: true,
      sanitizeQuery: true,
      whitelist: [],
      ...config,
    }

    this.sanitizer = config.customSanitizer || this.defaultSanitizer
  }

  // 默认清理器
  private defaultSanitizer(value: string): string {
    // HTML实体编码
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
    }

    return String(value).replace(/[&<>"'`=/]/g, (s: string) => entityMap[s as keyof typeof entityMap] || s)
  }

  // 清理值
  sanitize(value: any): any {
    if (!this.config?.enabled)
      return value

    if (typeof value === 'string') {
      // 检查白名单
      if (this.config?.whitelist?.some(pattern =>
        new RegExp(pattern).test(value),
      )) {
        return value
      }

      return this.sanitizer(value)
    }

    if (Array.isArray(value)) {
      return value.map(v => this.sanitize(v))
    }

    if (value && typeof value === 'object') {
      const sanitized: any = {}
      for (const key in value) {
        sanitized[key] = this.sanitize(value[key])
      }
      return sanitized
    }

    return value
  }

  // 清理路由参数
  sanitizeRoute(route: RouteLocationNormalized): RouteLocationNormalized {
    if (!this.config?.enabled)
      return route

    const sanitized = { ...route }

    // 清理params
    if (this.config?.sanitizeParams && route.params) {
      sanitized.params = this.sanitize(route.params)
    }

    // 清理query
    if (this.config?.sanitizeQuery && route.query) {
      sanitized.query = this.sanitize(route.query)
    }

    return sanitized
  }

  // 创建XSS守卫
  createXSSGuard(): NavigationGuard {
    return (to, _from, _next) => {
      if (!this.config?.enabled)
        return true

      // 清理路由参数
      const sanitized = this.sanitizeRoute(to)

      // 如果有变化，使用清理后的路由
      if (JSON.stringify(to) !== JSON.stringify(sanitized)) {
        console.warn('XSS content detected and sanitized in route:', to.fullPath)
        return sanitized
      }

      return true
    }
  }

  // 验证内容
  validate(content: string): ValidationResult {
    const threats: string[] = []

    // 检查脚本标签
    if (/<script[^>]*>.*?<\/script>/i.test(content)) {
      threats.push('Script tags detected')
    }

    // 检查事件处理器
    if (/on\w+\s*=/i.test(content)) {
      threats.push('Event handlers detected')
    }

    // 检查JavaScript协议
    if (/javascript:/i.test(content)) {
      threats.push('JavaScript protocol detected')
    }

    // 检查数据URI
    if (/data:text\/html/i.test(content)) {
      threats.push('Data URI detected')
    }

    return {
      safe: threats.length === 0,
      threats,
      sanitized: threats.length > 0 ? this.sanitizer(content) : content,
    }
  }
}

// ============= 路由安全管理器主类 =============
export class RouteSecurityManager {
  private authManager: AuthManager
  private permissionManager: PermissionManager
  private csrfProtection: CSRFProtection
  private xssProtection: XSSProtection
  private router: Router
  private config: SecurityConfig
  private guardCleanups: Array<() => void> = []

  constructor(router: Router, config: SecurityConfig = {}) {
    this.router = router
    this.config = config

    this.authManager = new AuthManager(config.auth)
    this.permissionManager = new PermissionManager(config.permission)
    this.csrfProtection = new CSRFProtection(config.csrf)
    this.xssProtection = new XSSProtection(config.xss)

    this.setupGuards()
  }

  // 设置守卫
  private setupGuards(): void {
    // 认证守卫
    if (this.config?.auth?.enabled) {
      const cleanup = this.router.beforeEach(
        this.authManager.createAuthGuard(),
      )
      this.guardCleanups.push(cleanup)
    }

    // 权限守卫
    if (this.config?.permission?.enabled) {
      const cleanup = this.router.beforeEach(
        this.permissionManager.createPermissionGuard(),
      )
      this.guardCleanups.push(cleanup)
    }

    // XSS守卫
    if (this.config?.xss?.enabled) {
      const cleanup = this.router.beforeEach(
        this.xssProtection.createXSSGuard(),
      )
      this.guardCleanups.push(cleanup)
    }
  }

  // 登录
  async login(credentials: any): Promise<boolean> {
    const success = await this.authManager.login(credentials)

    if (success) {
      // 登录成功后，可以从服务器获取权限
      // const permissions = await fetchUserPermissions();
      // this.permissionManager.setPermissions(permissions);
    }

    return success
  }

  // 登出
  logout(): void {
    this.authManager.logout()
    this.permissionManager.setRoles([this.config?.permission?.defaultRole || 'guest'])
    this.permissionManager.setPermissions([])
  }

  // 检查权限
  can(permission: string | string[]): boolean {
    return this.permissionManager.hasPermission(permission)
  }

  // 检查角色
  hasRole(role: string | string[]): boolean {
    return this.permissionManager.hasRole(role)
  }

  // 设置用户权限
  setUserPermissions(permissions: string[]): void {
    this.permissionManager.setPermissions(permissions)
  }

  // 设置用户角色
  setUserRoles(roles: string[]): void {
    this.permissionManager.setRoles(roles)
  }

  // 获取安全头
  getSecurityHeaders(): Record<string, string> {
    return {
      ...this.authManager.getAuthHeader(),
      ...this.csrfProtection.getHeaders(),
      'X-XSS-Protection': '1; mode=block',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    }
  }

  // 验证内容安全
  validateContent(content: string): ValidationResult {
    return this.xssProtection.validate(content)
  }

  // 清理不安全内容
  sanitize(value: any): any {
    return this.xssProtection.sanitize(value)
  }

  // 获取当前用户
  getCurrentUser(): any {
    return this.authManager.state.user
  }

  // 是否已认证
  isAuthenticated(): boolean {
    return this.authManager.state.isAuthenticated
  }

  // 清理
  destroy(): void {
    this.guardCleanups.forEach(cleanup => cleanup())
    this.authManager.logout()
  }
}

// ============= 类型定义 =============
interface AuthGuardOptions {
  requiresAuth?: boolean
  redirect?: string
}

interface ValidationResult {
  safe: boolean
  threats: string[]
  sanitized: string
}

// ============= 导出便捷函数 =============
let defaultSecurityManager: RouteSecurityManager | null = null

export function setupRouteSecurity(
  router: Router,
  config?: SecurityConfig,
): RouteSecurityManager {
  if (!defaultSecurityManager) {
    defaultSecurityManager = new RouteSecurityManager(router, config)
  }
  return defaultSecurityManager
}

export function checkPermission(permission: string | string[]): boolean {
  if (!defaultSecurityManager) {
    throw new Error('Route security manager not initialized')
  }
  return defaultSecurityManager.can(permission)
}

export function isAuthenticated(): boolean {
  return defaultSecurityManager?.isAuthenticated() || false
}

export function getCurrentUser(): any {
  return defaultSecurityManager?.getCurrentUser() || null
}

export function sanitizeContent(value: any): any {
  return defaultSecurityManager?.sanitize(value) || value
}
