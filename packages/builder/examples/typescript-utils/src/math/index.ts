/**
 * 数学工具模块
 * 导出所有数学相关的工具函数
 */

// 导入基础数学函数
import {
  add,
  subtract,
  multiply,
  divide,
  modulo,
  power,
  sqrt
} from './basic'

// 导入高级数学函数
import {
  average,
  median,
  max,
  min,
  standardDeviation,
  factorial,
  fibonacci
} from './advanced'

// 重新导出基础数学函数
export {
  add,
  subtract,
  multiply,
  divide,
  modulo,
  power,
  sqrt
}

// 重新导出高级数学函数
export {
  average,
  median,
  max,
  min,
  standardDeviation,
  factorial,
  fibonacci
}

// 数学常量
export const MATH_CONSTANTS = {
  /** 圆周率 */
  PI: Math.PI,
  /** 自然对数的底数 */
  E: Math.E,
  /** 2的自然对数 */
  LN2: Math.LN2,
  /** 10的自然对数 */
  LN10: Math.LN10,
  /** 以2为底的e的对数 */
  LOG2E: Math.LOG2E,
  /** 以10为底的e的对数 */
  LOG10E: Math.LOG10E,
  /** 2的平方根 */
  SQRT2: Math.SQRT2,
  /** 1/2的平方根 */
  SQRT1_2: Math.SQRT1_2
} as const

/**
 * 数学工具类型定义
 */
export interface MathUtils {
  /** 基础运算 */
  basic: {
    add: typeof add
    subtract: typeof subtract
    multiply: typeof multiply
    divide: typeof divide
    modulo: typeof modulo
    power: typeof power
    sqrt: typeof sqrt
  }
  /** 高级运算 */
  advanced: {
    average: typeof average
    median: typeof median
    max: typeof max
    min: typeof min
    standardDeviation: typeof standardDeviation
    factorial: typeof factorial
    fibonacci: typeof fibonacci
  }
  /** 数学常量 */
  constants: typeof MATH_CONSTANTS
}
