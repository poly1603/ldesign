/**
 * 数字处理工具类
 * 提供数字格式化、计算、验证等功能
 */

/**
 * 数字处理工具
 */
export class NumberUtils {
  /**
   * 格式化数字
   * @param num 数字
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  static format(
    num: number,
    options: {
      locale?: string
      style?: 'decimal' | 'currency' | 'percent'
      currency?: string
      minimumFractionDigits?: number
      maximumFractionDigits?: number
      useGrouping?: boolean
    } = {},
  ): string {
    const {
      locale = 'en-US',
      style = 'decimal',
      currency = 'USD',
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping = true,
    } = options

    return new Intl.NumberFormat(locale, {
      style,
      currency: style === 'currency' ? currency : undefined,
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping,
    }).format(num)
  }

  /**
   * 格式化字节大小
   * @param bytes 字节数
   * @param decimals 小数位数
   * @param binary 是否使用二进制单位
   * @returns 格式化后的字符串
   */
  static formatBytes(bytes: number, decimals = 2, binary = false): string {
    if (bytes === 0)
      return '0 B'

    const k = binary ? 1024 : 1000
    const sizes = binary
      ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
      : ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
    const size = bytes / k ** i

    return `${size.toFixed(decimals)} ${sizes[i]}`
  }

  /**
   * 解析字节大小字符串
   * @param str 字节大小字符串
   * @returns 字节数
   */
  static parseBytes(str: string): number {
    const match = str.match(/^(\d+(?:\.\d+)?)\s*([KMGTPEZY]?i?B?)$/i)
    if (!match) {
      throw new Error(`Invalid byte string: ${str}`)
    }

    const [, numStr, unit] = match
    const num = Number.parseFloat(numStr || '0')

    const units: Record<string, number> = {
      B: 1,
      KB: 1000,
      KiB: 1024,
      MB: 1000 ** 2,
      MiB: 1024 ** 2,
      GB: 1000 ** 3,
      GiB: 1024 ** 3,
      TB: 1000 ** 4,
      TiB: 1024 ** 4,
      PB: 1000 ** 5,
      PiB: 1024 ** 5,
      EB: 1000 ** 6,
      EiB: 1024 ** 6,
      ZB: 1000 ** 7,
      ZiB: 1024 ** 7,
      YB: 1000 ** 8,
      YiB: 1024 ** 8,
    }

    const unitKey = (unit || 'B').toUpperCase()
    const multiplier = units[unitKey] || 1
    return Math.round(num * multiplier)
  }

  /**
   * 限制数字在指定范围内
   * @param num 数字
   * @param min 最小值
   * @param max 最大值
   * @returns 限制后的数字
   */
  static clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max)
  }

  /**
   * 线性插值
   * @param start 起始值
   * @param end 结束值
   * @param t 插值参数（0-1）
   * @returns 插值结果
   */
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * NumberUtils.clamp(t, 0, 1)
  }

  /**
   * 反向线性插值
   * @param start 起始值
   * @param end 结束值
   * @param value 当前值
   * @returns 插值参数
   */
  static inverseLerp(start: number, end: number, value: number): number {
    if (start === end)
      return 0
    return NumberUtils.clamp((value - start) / (end - start), 0, 1)
  }

  /**
   * 映射数字到新范围
   * @param value 输入值
   * @param inMin 输入最小值
   * @param inMax 输入最大值
   * @param outMin 输出最小值
   * @param outMax 输出最大值
   * @returns 映射后的值
   */
  static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    const t = NumberUtils.inverseLerp(inMin, inMax, value)
    return NumberUtils.lerp(outMin, outMax, t)
  }

  /**
   * 四舍五入到指定小数位
   * @param num 数字
   * @param decimals 小数位数
   * @returns 四舍五入后的数字
   */
  static round(num: number, decimals = 0): number {
    const factor = 10 ** decimals
    return Math.round(num * factor) / factor
  }

  /**
   * 向上取整到指定小数位
   * @param num 数字
   * @param decimals 小数位数
   * @returns 向上取整后的数字
   */
  static ceil(num: number, decimals = 0): number {
    const factor = 10 ** decimals
    return Math.ceil(num * factor) / factor
  }

  /**
   * 向下取整到指定小数位
   * @param num 数字
   * @param decimals 小数位数
   * @returns 向下取整后的数字
   */
  static floor(num: number, decimals = 0): number {
    const factor = 10 ** decimals
    return Math.floor(num * factor) / factor
  }

  /**
   * 检查是否为整数
   * @param num 数字
   * @returns 是否为整数
   */
  static isInteger(num: number): boolean {
    return Number.isInteger(num)
  }

  /**
   * 检查是否为有限数
   * @param num 数字
   * @returns 是否为有限数
   */
  static isFinite(num: number): boolean {
    return Number.isFinite(num)
  }

  /**
   * 检查是否为NaN
   * @param num 数字
   * @returns 是否为NaN
   */
  static isNaN(num: number): boolean {
    return Number.isNaN(num)
  }

  /**
   * 检查是否为偶数
   * @param num 数字
   * @returns 是否为偶数
   */
  static isEven(num: number): boolean {
    return NumberUtils.isInteger(num) && num % 2 === 0
  }

  /**
   * 检查是否为奇数
   * @param num 数字
   * @returns 是否为奇数
   */
  static isOdd(num: number): boolean {
    return NumberUtils.isInteger(num) && num % 2 !== 0
  }

  /**
   * 检查是否为正数
   * @param num 数字
   * @returns 是否为正数
   */
  static isPositive(num: number): boolean {
    return num > 0
  }

  /**
   * 检查是否为负数
   * @param num 数字
   * @returns 是否为负数
   */
  static isNegative(num: number): boolean {
    return num < 0
  }

  /**
   * 检查是否在范围内
   * @param num 数字
   * @param min 最小值
   * @param max 最大值
   * @param inclusive 是否包含边界
   * @returns 是否在范围内
   */
  static inRange(num: number, min: number, max: number, inclusive = true): boolean {
    return inclusive ? num >= min && num <= max : num > min && num < max
  }

  /**
   * 生成随机整数
   * @param min 最小值
   * @param max 最大值
   * @returns 随机整数
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 生成随机浮点数
   * @param min 最小值
   * @param max 最大值
   * @returns 随机浮点数
   */
  static randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  /**
   * 计算百分比
   * @param value 值
   * @param total 总数
   * @param decimals 小数位数
   * @returns 百分比
   */
  static percentage(value: number, total: number, decimals = 2): number {
    if (total === 0)
      return 0
    return NumberUtils.round((value / total) * 100, decimals)
  }

  /**
   * 计算平均值
   * @param numbers 数字数组
   * @returns 平均值
   */
  static average(numbers: number[]): number {
    if (numbers.length === 0)
      return 0
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  }

  /**
   * 计算中位数
   * @param numbers 数字数组
   * @returns 中位数
   */
  static median(numbers: number[]): number {
    if (numbers.length === 0)
      return 0

    const sorted = [...numbers].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)

    return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!
  }

  /**
   * 计算众数
   * @param numbers 数字数组
   * @returns 众数数组
   */
  static mode(numbers: number[]): number[] {
    if (numbers.length === 0)
      return []

    const frequency: Record<number, number> = {}
    let maxFreq = 0

    for (const num of numbers) {
      frequency[num] = (frequency[num] || 0) + 1
      maxFreq = Math.max(maxFreq, frequency[num])
    }

    return Object.keys(frequency)
      .filter(key => frequency[Number(key)] === maxFreq)
      .map(Number)
  }

  /**
   * 计算标准差
   * @param numbers 数字数组
   * @returns 标准差
   */
  static standardDeviation(numbers: number[]): number {
    if (numbers.length === 0)
      return 0

    const avg = NumberUtils.average(numbers)
    const squaredDiffs = numbers.map(num => (num - avg) ** 2)
    const avgSquaredDiff = NumberUtils.average(squaredDiffs)

    return Math.sqrt(avgSquaredDiff)
  }

  /**
   * 计算方差
   * @param numbers 数字数组
   * @returns 方差
   */
  static variance(numbers: number[]): number {
    const stdDev = NumberUtils.standardDeviation(numbers)
    return stdDev * stdDev
  }

  /**
   * 计算最大公约数
   * @param a 数字a
   * @param b 数字b
   * @returns 最大公约数
   */
  static gcd(a: number, b: number): number {
    a = Math.abs(Math.floor(a))
    b = Math.abs(Math.floor(b))

    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }

    return a
  }

  /**
   * 计算最小公倍数
   * @param a 数字a
   * @param b 数字b
   * @returns 最小公倍数
   */
  static lcm(a: number, b: number): number {
    return Math.abs(a * b) / NumberUtils.gcd(a, b)
  }

  /**
   * 检查是否为质数
   * @param num 数字
   * @returns 是否为质数
   */
  static isPrime(num: number): boolean {
    if (!NumberUtils.isInteger(num) || num < 2)
      return false
    if (num === 2)
      return true
    if (num % 2 === 0)
      return false

    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0)
        return false
    }

    return true
  }

  /**
   * 计算阶乘
   * @param num 数字
   * @returns 阶乘
   */
  static factorial(num: number): number {
    if (!NumberUtils.isInteger(num) || num < 0) {
      throw new Error('Factorial is only defined for non-negative integers')
    }

    if (num === 0 || num === 1)
      return 1

    let result = 1
    for (let i = 2; i <= num; i++) {
      result *= i
    }

    return result
  }

  /**
   * 计算斐波那契数
   * @param n 位置
   * @returns 斐波那契数
   */
  static fibonacci(n: number): number {
    if (!NumberUtils.isInteger(n) || n < 0) {
      throw new Error('Fibonacci is only defined for non-negative integers')
    }

    if (n <= 1)
      return n

    let a = 0
    let b = 1
    for (let i = 2; i <= n; i++) {
      const temp = a + b
      a = b
      b = temp
    }

    return b
  }

  /**
   * 数字转换为不同进制
   * @param num 数字
   * @param base 进制（2-36）
   * @returns 进制字符串
   */
  static toBase(num: number, base: number): string {
    if (!NumberUtils.isInteger(base) || base < 2 || base > 36) {
      throw new Error('Base must be an integer between 2 and 36')
    }

    return Math.floor(num).toString(base)
  }

  /**
   * 从进制字符串转换为数字
   * @param str 进制字符串
   * @param base 进制（2-36）
   * @returns 数字
   */
  static fromBase(str: string, base: number): number {
    if (!NumberUtils.isInteger(base) || base < 2 || base > 36) {
      throw new Error('Base must be an integer between 2 and 36')
    }

    return Number.parseInt(str, base)
  }
}
