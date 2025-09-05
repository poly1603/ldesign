/**
 * 复杂库项目主入口
 *
 * 这个示例包含基础 TypeScript 特性：
 * 1. 类和接口
 * 2. 泛型
 * 3. 模块导出
 */

// 简单的工具函数
export function add(a: number, b: number): number {
  return a + b
}

export function multiply(a: number, b: number): number {
  return a * b
}

// 简单的类
export class Calculator {
  private history: Array<{ operation: string; result: number }> = []

  add(a: number, b: number): number {
    const result = a + b
    this.history.push({ operation: `${a} + ${b}`, result })
    return result
  }

  multiply(a: number, b: number): number {
    const result = a * b
    this.history.push({ operation: `${a} * ${b}`, result })
    return result
  }

  getHistory(): Array<{ operation: string; result: number }> {
    return [...this.history]
  }

  clearHistory(): void {
    this.history = []
  }
}

// 泛型接口
export interface Container<T> {
  value: T
  getValue(): T
  setValue(value: T): void
}

// 泛型类
export class SimpleContainer<T> implements Container<T> {
  constructor(public value: T) { }

  getValue(): T {
    return this.value
  }

  setValue(value: T): void {
    this.value = value
  }
}

// 版本信息
export const VERSION = '1.0.0'
export const LIBRARY_NAME = 'complex-library-example'

// 全局配置
export interface GlobalConfig {
  debug: boolean
  logLevel: 'error' | 'warn' | 'info' | 'debug'
  maxListeners: number
}

let globalConfig: GlobalConfig = {
  debug: false,
  logLevel: 'info',
  maxListeners: 10
}

/**
 * 设置全局配置
 */
export function setGlobalConfig(config: Partial<GlobalConfig>): void {
  globalConfig = { ...globalConfig, ...config }
}

/**
 * 获取全局配置
 */
export function getGlobalConfig(): Readonly<GlobalConfig> {
  return { ...globalConfig }
}
