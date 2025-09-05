/**
 * 基础 TypeScript 库示例
 * 
 * 这是一个简单的单文件入口示例，用于验证：
 * 1. 多格式输出（ESM、CJS、UMD）
 * 2. TypeScript 声明文件生成和分发
 * 3. 基本的构建流程
 */

/**
 * 用户信息接口
 */
export interface User {
  id: number
  name: string
  email: string
  age?: number
}

/**
 * 配置选项接口
 */
export interface Options {
  debug?: boolean
  timeout?: number
  retries?: number
}

/**
 * 创建用户
 * @param name 用户名
 * @param email 邮箱
 * @param age 年龄（可选）
 * @returns 用户对象
 */
export function createUser(name: string, email: string, age?: number): User {
  return {
    id: Math.floor(Math.random() * 10000),
    name,
    email,
    age
  }
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 格式化用户信息
 * @param user 用户对象
 * @returns 格式化后的字符串
 */
export function formatUser(user: User): string {
  const ageStr = user.age ? ` (${user.age}岁)` : ''
  return `${user.name}${ageStr} - ${user.email}`
}

/**
 * 默认配置
 */
export const DEFAULT_OPTIONS: Options = {
  debug: false,
  timeout: 5000,
  retries: 3
}

/**
 * 版本信息
 */
export const VERSION = '1.0.0'

/**
 * 库名称
 */
export const LIBRARY_NAME = 'basic-typescript-example'
