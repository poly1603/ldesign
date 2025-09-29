/**
 * 高级数学工具函数
 * 提供复杂的数学计算功能
 */

/**
 * 计算数组的平均值
 * @param numbers 数字数组
 * @returns 平均值
 * @throws {Error} 当数组为空时抛出错误
 * @example
 * ```typescript
 * import { average } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = average([1, 2, 3, 4, 5]) // 3
 * ```
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('数组不能为空')
  }
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  return sum / numbers.length
}

/**
 * 计算数组的中位数
 * @param numbers 数字数组
 * @returns 中位数
 * @throws {Error} 当数组为空时抛出错误
 * @example
 * ```typescript
 * import { median } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = median([1, 2, 3, 4, 5]) // 3
 * ```
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('数组不能为空')
  }
  
  const sorted = [...numbers].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  } else {
    return sorted[middle]
  }
}

/**
 * 计算数组的最大值
 * @param numbers 数字数组
 * @returns 最大值
 * @throws {Error} 当数组为空时抛出错误
 * @example
 * ```typescript
 * import { max } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = max([1, 5, 3, 9, 2]) // 9
 * ```
 */
export function max(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('数组不能为空')
  }
  return Math.max(...numbers)
}

/**
 * 计算数组的最小值
 * @param numbers 数字数组
 * @returns 最小值
 * @throws {Error} 当数组为空时抛出错误
 * @example
 * ```typescript
 * import { min } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = min([1, 5, 3, 9, 2]) // 1
 * ```
 */
export function min(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('数组不能为空')
  }
  return Math.min(...numbers)
}

/**
 * 计算数组的标准差
 * @param numbers 数字数组
 * @returns 标准差
 * @throws {Error} 当数组为空时抛出错误
 * @example
 * ```typescript
 * import { standardDeviation } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = standardDeviation([1, 2, 3, 4, 5]) // 约 1.58
 * ```
 */
export function standardDeviation(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('数组不能为空')
  }
  
  const avg = average(numbers)
  const squaredDifferences = numbers.map(num => Math.pow(num - avg, 2))
  const avgSquaredDiff = average(squaredDifferences)
  
  return Math.sqrt(avgSquaredDiff)
}

/**
 * 计算阶乘
 * @param n 非负整数
 * @returns 阶乘结果
 * @throws {Error} 当输入为负数或非整数时抛出错误
 * @example
 * ```typescript
 * import { factorial } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = factorial(5) // 120
 * ```
 */
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('输入必须是非负整数')
  }
  
  if (n === 0 || n === 1) {
    return 1
  }
  
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  
  return result
}

/**
 * 计算斐波那契数列的第n项
 * @param n 项数（从0开始）
 * @returns 斐波那契数
 * @throws {Error} 当输入为负数时抛出错误
 * @example
 * ```typescript
 * import { fibonacci } from '@ldesign/typescript-utils-example/math'
 * 
 * const result = fibonacci(10) // 55
 * ```
 */
export function fibonacci(n: number): number {
  if (n < 0) {
    throw new Error('输入必须是非负数')
  }
  
  if (n === 0) return 0
  if (n === 1) return 1
  
  let a = 0
  let b = 1
  
  for (let i = 2; i <= n; i++) {
    const temp = a + b
    a = b
    b = temp
  }
  
  return b
}
