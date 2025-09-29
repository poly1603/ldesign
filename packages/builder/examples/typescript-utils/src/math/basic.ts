/**
 * 基础数学工具函数
 * 提供常用的数学计算功能
 */

/**
 * 加法运算
 * @param a 第一个数字
 * @param b 第二个数字
 * @returns 两数之和
 * @example
 * ```typescript
 * import { add } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = add(1, 2) // 3
 * ```
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * 减法运算
 * @param a 被减数
 * @param b 减数
 * @returns 两数之差
 * @example
 * ```typescript
 * import { subtract } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = subtract(5, 3) // 2
 * ```
 */
export function subtract(a: number, b: number): number {
  return a - b
}

/**
 * 乘法运算
 * @param a 第一个数字
 * @param b 第二个数字
 * @returns 两数之积
 * @example
 * ```typescript
 * import { multiply } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = multiply(3, 4) // 12
 * ```
 */
export function multiply(a: number, b: number): number {
  return a * b
}

/**
 * 除法运算
 * @param a 被除数
 * @param b 除数
 * @returns 两数之商
 * @throws {Error} 当除数为0时抛出错误
 * @example
 * ```typescript
 * import { divide } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = divide(10, 2) // 5
 * ```
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('除数不能为零')
  }
  return a / b
}

/**
 * 求余运算
 * @param a 被除数
 * @param b 除数
 * @returns 余数
 * @throws {Error} 当除数为0时抛出错误
 * @example
 * ```typescript
 * import { modulo } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = modulo(10, 3) // 1
 * ```
 */
export function modulo(a: number, b: number): number {
  if (b === 0) {
    throw new Error('除数不能为零')
  }
  return a % b
}

/**
 * 幂运算
 * @param base 底数
 * @param exponent 指数
 * @returns 幂运算结果
 * @example
 * ```typescript
 * import { power } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = power(2, 3) // 8
 * ```
 */
export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent)
}

/**
 * 平方根
 * @param value 数值
 * @returns 平方根
 * @throws {Error} 当数值为负数时抛出错误
 * @example
 * ```typescript
 * import { sqrt } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = sqrt(9) // 3
 * ```
 */
export function sqrt(value: number): number {
  if (value < 0) {
    throw new Error('不能计算负数的平方根')
  }
  return Math.sqrt(value)
}
