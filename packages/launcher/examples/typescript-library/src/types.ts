/**
 * 类型定义文件
 */

export interface LibraryConfig {
  debug: boolean
  version: string
  features: string[]
}

export interface CalculationResult {
  value: number
  operation: string
  timestamp: number
}

export interface LogLevel {
  level: 'debug' | 'info' | 'warn' | 'error'
  color: string
  priority: number
}

export interface EventMap {
  calculation: CalculationResult
  error: Error
  config: LibraryConfig
}

export type EventCallback<T = any> = (data: T) => void

export type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power'

export interface HistoryEntry {
  id: string
  operation: MathOperation
  operands: number[]
  result: number
  timestamp: number
}

// 工具类型
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
