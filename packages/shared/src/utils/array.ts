/**
 * 数组工具函数模块
 * 
 * @description
 * 提供常用的数组操作、处理、转换等工具函数。
 * 这些函数具有良好的类型安全性和性能表现。
 */

/**
 * 数组去重
 * 
 * @param array - 要去重的数组
 * @returns 去重后的新数组
 * 
 * @example
 * ```typescript
 * unique([1, 2, 2, 3, 3, 4]) // [1, 2, 3, 4]
 * unique(['a', 'b', 'b', 'c']) // ['a', 'b', 'c']
 * ```
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * 根据指定属性对对象数组去重
 *
 * @param array - 要去重的对象数组
 * @param key - 用于去重的属性键或函数
 * @returns 去重后的新数组
 *
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, name: 'John' },
 *   { id: 2, name: 'Jane' },
 *   { id: 1, name: 'John Doe' }
 * ]
 * uniqueBy(users, 'id') // [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
 * uniqueBy(users, user => user.name.toLowerCase()) // 按名称去重
 * ```
 */
export function uniqueBy<T, K extends keyof T>(
  array: T[],
  key: K | ((item: T) => any)
): T[] {
  const seen = new Set()
  const result: T[] = []

  for (const item of array) {
    const value = typeof key === 'function' ? key(item) : item[key]
    if (!seen.has(value)) {
      seen.add(value)
      result.push(item)
    }
  }

  return result
}

/**
 * 将数组分割成指定大小的块
 * 
 * @param array - 要分割的数组
 * @param size - 每块的大小
 * @returns 分割后的二维数组
 * 
 * @example
 * ```typescript
 * chunk([1, 2, 3, 4, 5, 6], 2) // [[1, 2], [3, 4], [5, 6]]
 * chunk([1, 2, 3, 4, 5], 3) // [[1, 2, 3], [4, 5]]
 * ```
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return []
  
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

/**
 * 根据指定属性对数组进行分组
 * 
 * @param array - 要分组的数组
 * @param key - 用于分组的属性键或函数
 * @returns 分组后的对象
 * 
 * @example
 * ```typescript
 * const users = [
 *   { name: 'John', age: 25, city: 'New York' },
 *   { name: 'Jane', age: 30, city: 'New York' },
 *   { name: 'Bob', age: 25, city: 'London' }
 * ]
 * 
 * groupBy(users, 'city')
 * // {
 * //   'New York': [{ name: 'John', ... }, { name: 'Jane', ... }],
 * //   'London': [{ name: 'Bob', ... }]
 * // }
 * 
 * groupBy(users, user => user.age > 25 ? 'senior' : 'junior')
 * // { 'junior': [...], 'senior': [...] }
 * ```
 */
export function groupBy<T, K extends keyof T>(
  array: T[], 
  key: K | ((item: T) => string | number)
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key]
    const groupKeyStr = String(groupKey)
    
    if (!groups[groupKeyStr]) {
      groups[groupKeyStr] = []
    }
    groups[groupKeyStr].push(item)
    
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * 扁平化嵌套数组
 * 
 * @param array - 要扁平化的数组
 * @param depth - 扁平化深度（默认为 1）
 * @returns 扁平化后的数组
 * 
 * @example
 * ```typescript
 * flatten([1, [2, 3], [4, [5, 6]]]) // [1, 2, 3, 4, [5, 6]]
 * flatten([1, [2, 3], [4, [5, 6]]], 2) // [1, 2, 3, 4, 5, 6]
 * ```
 */
export function flatten<T>(array: any[], depth = 1): T[] {
  return depth > 0 
    ? array.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
    : array.slice()
}

/**
 * 深度扁平化数组
 * 
 * @param array - 要扁平化的数组
 * @returns 完全扁平化后的数组
 * 
 * @example
 * ```typescript
 * flattenDeep([1, [2, [3, [4, 5]]]]) // [1, 2, 3, 4, 5]
 * ```
 */
export function flattenDeep<T>(array: any[]): T[] {
  return array.reduce((acc, val) => 
    acc.concat(Array.isArray(val) ? flattenDeep(val) : val), [])
}

/**
 * 数组交集
 * 
 * @param arrays - 要求交集的数组
 * @returns 交集数组
 * 
 * @example
 * ```typescript
 * intersection([1, 2, 3], [2, 3, 4], [3, 4, 5]) // [3]
 * ```
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return []
  if (arrays.length === 1) return arrays[0]
  
  return arrays.reduce((acc, current) => 
    acc.filter(item => current.includes(item))
  )
}

/**
 * 数组并集
 * 
 * @param arrays - 要求并集的数组
 * @returns 并集数组
 * 
 * @example
 * ```typescript
 * union([1, 2], [2, 3], [3, 4]) // [1, 2, 3, 4]
 * ```
 */
export function union<T>(...arrays: T[][]): T[] {
  return unique(arrays.flat())
}

/**
 * 数组差集
 * 
 * @param array - 主数组
 * @param excludeArrays - 要排除的数组
 * @returns 差集数组
 * 
 * @example
 * ```typescript
 * difference([1, 2, 3, 4], [2, 3], [4]) // [1]
 * ```
 */
export function difference<T>(array: T[], ...excludeArrays: T[][]): T[] {
  const excludeSet = new Set(excludeArrays.flat())
  return array.filter(item => !excludeSet.has(item))
}

/**
 * 随机打乱数组
 * 
 * @param array - 要打乱的数组
 * @returns 打乱后的新数组
 * 
 * @example
 * ```typescript
 * shuffle([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4] (随机顺序)
 * ```
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 从数组中随机选择指定数量的元素
 * 
 * @param array - 源数组
 * @param count - 要选择的元素数量
 * @returns 随机选择的元素数组
 * 
 * @example
 * ```typescript
 * sample([1, 2, 3, 4, 5], 3) // [2, 4, 1] (随机选择3个)
 * ```
 */
export function sample<T>(array: T[], count: number): T[] {
  if (count >= array.length) return shuffle(array)
  
  const shuffled = shuffle(array)
  return shuffled.slice(0, count)
}

/**
 * 移除数组中的假值（false, null, 0, "", undefined, NaN）
 * 
 * @param array - 要处理的数组
 * @returns 移除假值后的数组
 * 
 * @example
 * ```typescript
 * compact([0, 1, false, 2, '', 3, null, undefined, 4, NaN, 5])
 * // [1, 2, 3, 4, 5]
 * ```
 */
export function compact<T>(array: (T | null | undefined | false | 0 | '')[]): T[] {
  return array.filter(Boolean) as T[]
}

/**
 * 计算数组中数值的总和
 * 
 * @param array - 数值数组
 * @returns 总和
 * 
 * @example
 * ```typescript
 * sum([1, 2, 3, 4, 5]) // 15
 * ```
 */
export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0)
}

/**
 * 计算数组中数值的平均值
 * 
 * @param array - 数值数组
 * @returns 平均值
 * 
 * @example
 * ```typescript
 * average([1, 2, 3, 4, 5]) // 3
 * ```
 */
export function average(array: number[]): number {
  return array.length > 0 ? sum(array) / array.length : 0
}

/**
 * 查找数组中的最大值
 * 
 * @param array - 数值数组
 * @returns 最大值
 * 
 * @example
 * ```typescript
 * max([1, 5, 3, 9, 2]) // 9
 * ```
 */
export function max(array: number[]): number {
  return Math.max(...array)
}

/**
 * 查找数组中的最小值
 * 
 * @param array - 数值数组
 * @returns 最小值
 * 
 * @example
 * ```typescript
 * min([1, 5, 3, 9, 2]) // 1
 * ```
 */
export function min(array: number[]): number {
  return Math.min(...array)
}
