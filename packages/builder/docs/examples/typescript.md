# TypeScript 库

本页面展示如何使用 @ldesign/builder 构建纯 TypeScript 库。

## 项目结构

典型的 TypeScript 库项目结构：

```
my-ts-lib/
├── src/
│   ├── core/
│   │   ├── Calculator.ts
│   │   └── Validator.ts
│   ├── utils/
│   │   ├── format.ts
│   │   └── parse.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── builder.config.ts
```

## 基础配置

创建 `builder.config.ts`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  dts: true,
  name: 'MyTsLib'
})
```

## 类型定义

`src/types/index.ts`：

```typescript
// 基础类型
export interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

export interface CreateUserInput {
  name: string
  email: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
}

// 泛型类型
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 工具类型
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

// 枚举
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}
```

## 核心类

`src/core/Calculator.ts`：

```typescript
export interface CalculatorOptions {
  precision?: number
  throwOnError?: boolean
}

export class Calculator {
  private precision: number
  private throwOnError: boolean

  constructor(options: CalculatorOptions = {}) {
    this.precision = options.precision ?? 2
    this.throwOnError = options.throwOnError ?? false
  }

  add(a: number, b: number): number {
    try {
      const result = a + b
      return this.round(result)
    } catch (error) {
      return this.handleError(error, 0)
    }
  }

  subtract(a: number, b: number): number {
    try {
      const result = a - b
      return this.round(result)
    } catch (error) {
      return this.handleError(error, 0)
    }
  }

  multiply(a: number, b: number): number {
    try {
      const result = a * b
      return this.round(result)
    } catch (error) {
      return this.handleError(error, 0)
    }
  }

  divide(a: number, b: number): number {
    try {
      if (b === 0) {
        throw new Error('Division by zero')
      }
      const result = a / b
      return this.round(result)
    } catch (error) {
      return this.handleError(error, 0)
    }
  }

  power(base: number, exponent: number): number {
    try {
      const result = Math.pow(base, exponent)
      return this.round(result)
    } catch (error) {
      return this.handleError(error, 0)
    }
  }

  private round(value: number): number {
    const factor = Math.pow(10, this.precision)
    return Math.round(value * factor) / factor
  }

  private handleError(error: unknown, defaultValue: number): number {
    if (this.throwOnError) {
      throw error
    }
    console.warn('Calculator error:', error)
    return defaultValue
  }
}
```

`src/core/Validator.ts`：

```typescript
export interface ValidationRule<T = any> {
  validate(value: T): boolean
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class Validator {
  private rules: ValidationRule[] = []

  addRule<T>(rule: ValidationRule<T>): this {
    this.rules.push(rule)
    return this
  }

  validate<T>(value: T): ValidationResult {
    const errors: string[] = []

    for (const rule of this.rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static required(): ValidationRule<any> {
    return {
      validate: (value) => value != null && value !== '',
      message: 'This field is required'
    }
  }

  static minLength(min: number): ValidationRule<string> {
    return {
      validate: (value) => typeof value === 'string' && value.length >= min,
      message: `Minimum length is ${min}`
    }
  }

  static maxLength(max: number): ValidationRule<string> {
    return {
      validate: (value) => typeof value === 'string' && value.length <= max,
      message: `Maximum length is ${max}`
    }
  }

  static email(): ValidationRule<string> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      validate: (value) => typeof value === 'string' && emailRegex.test(value),
      message: 'Invalid email format'
    }
  }

  static numeric(): ValidationRule<any> {
    return {
      validate: (value) => !isNaN(Number(value)),
      message: 'Must be a number'
    }
  }

  static range(min: number, max: number): ValidationRule<number> {
    return {
      validate: (value) => typeof value === 'number' && value >= min && value <= max,
      message: `Value must be between ${min} and ${max}`
    }
  }
}
```

## 工具函数

`src/utils/format.ts`：

```typescript
export interface FormatOptions {
  locale?: string
  currency?: string
  precision?: number
}

export function formatCurrency(
  amount: number, 
  options: FormatOptions = {}
): string {
  const { locale = 'en-US', currency = 'USD', precision = 2 } = options
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(amount)
}

export function formatNumber(
  value: number, 
  options: FormatOptions = {}
): string {
  const { locale = 'en-US', precision = 0 } = options
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value)
}

export function formatDate(
  date: Date, 
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale = 'en-US'
): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: format
  }).format(date)
}

export function formatRelativeTime(
  date: Date, 
  locale = 'en-US'
): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-diffInSeconds, 'second')
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(-diffInMinutes, 'minute')
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(-diffInHours, 'hour')
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  return rtf.format(-diffInDays, 'day')
}
```

`src/utils/parse.ts`：

```typescript
export interface ParseResult<T> {
  success: boolean
  data?: T
  error?: string
}

export function parseJSON<T = any>(json: string): ParseResult<T> {
  try {
    const data = JSON.parse(json)
    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON' 
    }
  }
}

export function parseNumber(value: string): ParseResult<number> {
  const num = Number(value)
  if (isNaN(num)) {
    return { success: false, error: 'Invalid number' }
  }
  return { success: true, data: num }
}

export function parseDate(value: string): ParseResult<Date> {
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return { success: false, error: 'Invalid date' }
  }
  return { success: true, data: date }
}

export function parseBoolean(value: string): ParseResult<boolean> {
  const lower = value.toLowerCase().trim()
  if (lower === 'true' || lower === '1' || lower === 'yes') {
    return { success: true, data: true }
  }
  if (lower === 'false' || lower === '0' || lower === 'no') {
    return { success: true, data: false }
  }
  return { success: false, error: 'Invalid boolean value' }
}
```

## 入口文件

`src/index.ts`：

```typescript
// 导出核心类
export { Calculator } from './core/Calculator'
export { Validator } from './core/Validator'

// 导出工具函数
export * from './utils/format'
export * from './utils/parse'

// 导出类型
export * from './types'

// 导出类型（仅类型）
export type { CalculatorOptions } from './core/Calculator'
export type { ValidationRule, ValidationResult } from './core/Validator'
export type { FormatOptions } from './utils/format'
export type { ParseResult } from './utils/parse'
```

## 构建配置

`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": false,
    "strict": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "removeComments": false,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

## 使用示例

```typescript
import { 
  Calculator, 
  Validator, 
  formatCurrency, 
  parseJSON,
  User,
  UserRole 
} from 'my-ts-lib'

// 使用计算器
const calc = new Calculator({ precision: 3 })
const result = calc.add(1.1, 2.2) // 3.3

// 使用验证器
const validator = new Validator()
  .addRule(Validator.required())
  .addRule(Validator.email())

const validation = validator.validate('user@example.com')
console.log(validation.isValid) // true

// 使用格式化函数
const price = formatCurrency(1234.56, { currency: 'EUR' })
console.log(price) // €1,234.56

// 使用解析函数
const jsonResult = parseJSON<User>('{"id": 1, "name": "John"}')
if (jsonResult.success) {
  console.log(jsonResult.data?.name) // John
}

// 使用类型
const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date()
}
```

## 输出结构

```
dist/
├── esm/                    # ES 模块格式
│   ├── core/
│   ├── utils/
│   ├── types/
│   └── index.js
├── cjs/                    # CommonJS 格式
│   └── ... (相同结构)
├── umd/                    # UMD 格式
│   └── index.js
└── types/                  # TypeScript 声明文件
    ├── core/
    ├── utils/
    ├── types/
    └── index.d.ts
```

## 相关

- [基础用法](/examples/basic)
- [Vue 组件库](/examples/vue)
- [React 组件库](/examples/react)
