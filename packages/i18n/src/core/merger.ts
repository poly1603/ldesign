/**
 * 翻译合并工具
 * 
 * 提供深度合并功能，支持内置翻译与用户翻译的智能合并
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import type { NestedObject, LanguagePackage } from './types'

/**
 * 合并策略枚举
 */
export enum MergeStrategy {
  /** 用户优先：用户翻译覆盖内置翻译 */
  USER_FIRST = 'user_first',
  /** 内置优先：内置翻译覆盖用户翻译 */
  BUILTIN_FIRST = 'builtin_first',
  /** 深度合并：递归合并所有层级 */
  DEEP = 'deep',
  /** 浅合并：只合并第一层 */
  SHALLOW = 'shallow'
}

/**
 * 合并配置选项
 */
export interface MergeOptions {
  /** 合并策略 */
  strategy?: MergeStrategy
  /** 是否合并数组 */
  mergeArrays?: boolean
  /** 是否去重数组元素 */
  uniqueArrays?: boolean
  /** 是否克隆对象 */
  clone?: boolean
  /** 自定义合并函数 */
  customMerge?: (key: string, target: any, source: any) => any
  /** 忽略的键列表 */
  ignoreKeys?: string[]
  /** 只合并的键列表 */
  onlyKeys?: string[]
}

/**
 * 默认合并配置
 */
const DEFAULT_MERGE_OPTIONS: Required<MergeOptions> = {
  strategy: MergeStrategy.USER_FIRST,
  mergeArrays: false,
  uniqueArrays: false,
  clone: true,
  customMerge: undefined as any,
  ignoreKeys: [],
  onlyKeys: []
}

/**
 * 检查是否为普通对象
 */
function isPlainObject(value: any): value is Record<string, any> {
  return value !== null && 
         typeof value === 'object' && 
         value.constructor === Object &&
         Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * 深度克隆对象
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (obj instanceof Set) return new Set([...obj].map(item => deepClone(item))) as any
  if (obj instanceof Map) {
    const clonedMap = new Map()
    obj.forEach((value, key) => {
      clonedMap.set(deepClone(key), deepClone(value))
    })
    return clonedMap as any
  }
  
  const clonedObj: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }
  return clonedObj
}

/**
 * 合并数组
 */
function mergeArrays(target: any[], source: any[], unique: boolean): any[] {
  const merged = [...target, ...source]
  if (unique) {
    return Array.from(new Set(merged))
  }
  return merged
}

/**
 * 深度合并两个对象
 * 
 * @param target 目标对象
 * @param source 源对象
 * @param options 合并选项
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
  options: MergeOptions = {}
): T {
  const opts = { ...DEFAULT_MERGE_OPTIONS, ...options }
  
  // 处理空值
  if (!source) return target
  if (!target) return (opts.clone ? deepClone(source) : source) as T
  
  // 根据策略决定优先级
  if (opts.strategy === MergeStrategy.BUILTIN_FIRST) {
    return deepMerge(source as T, target, { ...opts, strategy: MergeStrategy.USER_FIRST })
  }
  
  // 浅合并
  if (opts.strategy === MergeStrategy.SHALLOW) {
    return { ...target, ...source }
  }
  
  // 开始合并
  const result = opts.clone ? deepClone(target) : target
  const res: any = result
  
  for (const key in source) {
    // 检查忽略的键
    if (opts.ignoreKeys.includes(key)) continue
    
    // 检查只合并的键
    if (opts.onlyKeys.length > 0 && !opts.onlyKeys.includes(key)) continue
    
    const sourceValue = source[key]
    const targetValue = res[key]
    
    // 自定义合并
    if (opts.customMerge) {
      const customResult = opts.customMerge(key, targetValue, sourceValue)
      if (customResult !== undefined) {
        res[key] = customResult
        continue
      }
    }
    
    // 处理 undefined 值
    if (sourceValue === undefined) continue
    
    // 处理 null 值
    if (sourceValue === null) {
      res[key] = null as any
      continue
    }
    
    // 处理数组
    if (Array.isArray(sourceValue)) {
      if (opts.mergeArrays && Array.isArray(targetValue)) {
        res[key] = mergeArrays(targetValue, sourceValue, opts.uniqueArrays) as any
      } else {
        res[key] = opts.clone ? deepClone(sourceValue) : sourceValue
      }
      continue
    }
    
    // 处理对象
    if (isPlainObject(sourceValue)) {
      if (isPlainObject(targetValue)) {
        res[key] = deepMerge(targetValue, sourceValue, opts)
      } else {
        res[key] = opts.clone ? deepClone(sourceValue) : sourceValue
      }
      continue
    }
    
    // 其他类型直接赋值
    res[key] = sourceValue
  }
  
  return res as T
}

/**
 * 合并翻译内容
 * 
 * @param builtin 内置翻译
 * @param user 用户翻译
 * @param options 合并选项
 * @returns 合并后的翻译
 */
export function mergeTranslations(
  builtin: NestedObject,
  user: NestedObject,
  options: MergeOptions = {}
): NestedObject {
  return deepMerge(builtin, user, {
    strategy: MergeStrategy.DEEP,
    clone: true,
    ...options
  })
}

/**
 * 合并语言包
 * 
 * @param builtin 内置语言包
 * @param user 用户语言包
 * @param options 合并选项
 * @returns 合并后的语言包
 */
export function mergeLanguagePackages(
  builtin: LanguagePackage,
  user: Partial<LanguagePackage>,
  options: MergeOptions = {}
): LanguagePackage {
  return {
    info: deepMerge(builtin.info, user.info || {}, options),
    translations: mergeTranslations(
      builtin.translations,
      user.translations || {},
      options
    )
  }
}

/**
 * 批量合并多个翻译对象
 * 
 * @param targets 要合并的对象数组
 * @param options 合并选项
 * @returns 合并后的对象
 */
export function mergeMultiple<T extends Record<string, any>>(
  targets: T[],
  options: MergeOptions = {}
): T {
  if (targets.length === 0) return {} as T
  if (targets.length === 1) return targets[0]
  
  return targets.reduce((acc, curr) => deepMerge(acc, curr, options))
}

/**
 * 提取差异
 * 
 * 比较两个翻译对象，提取出差异部分
 * 
 * @param base 基础对象
 * @param compare 比较对象
 * @returns 差异对象
 */
export function extractDifferences(
  base: NestedObject,
  compare: NestedObject
): NestedObject {
  const diff: Record<string, any> = {}
  
  for (const key in compare) {
    const baseValue = base[key]
    const compareValue = compare[key]
    
    if (baseValue === undefined) {
      // 新增的键
      (diff as any)[key] = compareValue
    } else if (isPlainObject(baseValue) && isPlainObject(compareValue)) {
      // 递归比较对象
      const nestedDiff = extractDifferences(
        baseValue as NestedObject,
        compareValue as NestedObject
      )
      if (Object.keys(nestedDiff).length > 0) {
        (diff as any)[key] = nestedDiff
      }
    } else if (baseValue !== compareValue) {
      // 值不同
      (diff as any)[key] = compareValue
    }
  }
  
  return diff as NestedObject
}

/**
 * 扁平化翻译对象
 * 
 * 将嵌套的翻译对象转换为扁平的键值对
 * 
 * @param obj 嵌套对象
 * @param prefix 键前缀
 * @param separator 分隔符
 * @returns 扁平化的对象
 */
export function flattenTranslations(
  obj: NestedObject,
  prefix = '',
  separator = '.'
): Record<string, string> {
  const result: Record<string, string> = {}
  
  for (const key in obj) {
    const value = obj[key]
    const newKey = prefix ? `${prefix}${separator}${key}` : key
    
    if (isPlainObject(value)) {
      Object.assign(
        result,
        flattenTranslations(value as NestedObject, newKey, separator)
      )
    } else if (value !== undefined && value !== null) {
      result[newKey] = String(value)
    }
  }
  
  return result
}

/**
 * 反扁平化翻译对象
 * 
 * 将扁平的键值对转换为嵌套的翻译对象
 * 
 * @param flat 扁平化的对象
 * @param separator 分隔符
 * @returns 嵌套对象
 */
export function unflattenTranslations(
  flat: Record<string, string>,
  separator = '.'
): NestedObject {
  const result: NestedObject = {}
  
  for (const key in flat) {
    const parts = key.split(separator)
    let current: any = result
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part] || !isPlainObject(current[part])) {
        current[part] = {}
      }
      current = current[part]
    }
    
    current[parts[parts.length - 1]] = flat[key]
  }
  
  return result
}

/**
 * 验证翻译完整性
 * 
 * 检查用户翻译是否包含所有内置翻译的键
 * 
 * @param builtin 内置翻译
 * @param user 用户翻译
 * @returns 缺失的键列表
 */
export function validateCompleteness(
  builtin: NestedObject,
  user: NestedObject
): string[] {
  const builtinFlat = flattenTranslations(builtin)
  const userFlat = flattenTranslations(user)
  
  const missingKeys: string[] = []
  
  for (const key in builtinFlat) {
    if (!(key in userFlat)) {
      missingKeys.push(key)
    }
  }
  
  return missingKeys
}

/**
 * 获取翻译统计信息
 * 
 * @param translations 翻译对象
 * @returns 统计信息
 */
export function getTranslationStats(translations: NestedObject): {
  totalKeys: number
  totalValues: number
  emptyValues: number
  coverage: number
} {
  const flat = flattenTranslations(translations)
  const totalKeys = Object.keys(flat).length
  const emptyValues = Object.values(flat).filter(v => !v || v.trim() === '').length
  const totalValues = totalKeys - emptyValues
  const coverage = totalKeys > 0 ? (totalValues / totalKeys) * 100 : 0
  
  return {
    totalKeys,
    totalValues,
    emptyValues,
    coverage
  }
}
