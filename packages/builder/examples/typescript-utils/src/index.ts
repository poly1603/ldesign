/**
 * TypeScript 工具库示例
 * 
 * 展示如何使用 @ldesign/builder 构建纯 TypeScript 工具库
 * 包含常用的工具函数、类型定义和类
 */

// ============= 类型定义 =============

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserOptions {
  name: string
  email: string
  avatar?: string
}

export type UserRole = 'admin' | 'user' | 'guest'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

// ============= 常量 =============

export const DEFAULT_AVATAR = 'https://via.placeholder.com/150'

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// ============= 工具函数 =============

/**
 * 生成随机 ID
 */
export function generateId(): number {
  return Math.floor(Math.random() * 1000000)
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 格式化用户名
 */
export function formatUserName(user: User): string {
  return `${user.name} <${user.email}>`
}

/**
 * 创建用户
 */
export function createUser(options: CreateUserOptions): User {
  if (!validateEmail(options.email)) {
    throw new Error('Invalid email address')
  }

  const now = new Date()
  return {
    id: generateId(),
    ...options,
    avatar: options.avatar || DEFAULT_AVATAR,
    createdAt: now,
    updatedAt: now
  }
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

// ============= 类 =============

/**
 * 用户管理器
 */
export class UserManager {
  private users: User[] = []

  /**
   * 添加用户
   */
  addUser(options: CreateUserOptions): User {
    const user = createUser(options)
    this.users.push(user)
    return user
  }

  /**
   * 获取用户
   */
  getUser(id: number): User | undefined {
    return this.users.find(user => user.id === id)
  }

  /**
   * 获取所有用户
   */
  getAllUsers(): User[] {
    return [...this.users]
  }

  /**
   * 更新用户
   */
  updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const userIndex = this.users.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return null
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date()
    }

    return this.users[userIndex]
  }

  /**
   * 删除用户
   */
  removeUser(id: number): boolean {
    const index = this.users.findIndex(user => user.id === id)
    if (index !== -1) {
      this.users.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 获取用户数量
   */
  getUserCount(): number {
    return this.users.length
  }

  /**
   * 清空所有用户
   */
  clear(): void {
    this.users = []
  }
}

/**
 * 事件发射器
 */
export class EventEmitter<T extends Record<string, any[]> = Record<string, any[]>> {
  private events: Map<keyof T, Array<(...args: any[]) => void>> = new Map()

  /**
   * 监听事件
   */
  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(listener)
    return this
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this {
    const listeners = this.events.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
    return this
  }

  /**
   * 触发事件
   */
  emit<K extends keyof T>(event: K, ...args: T[K]): boolean {
    const listeners = this.events.get(event)
    if (listeners && listeners.length > 0) {
      listeners.forEach(listener => listener(...args))
      return true
    }
    return false
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners<K extends keyof T>(event?: K): this {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
    return this
  }
}

// ============= 默认导出 =============

// 创建默认的用户管理器实例
export const defaultUserManager = new UserManager()
