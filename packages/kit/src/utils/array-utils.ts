/**
 * 数组处理工具类
 * 提供数组操作、去重、分组、排序等功能
 */

/**
 * 数组处理工具
 */
export class ArrayUtils {
  /**
   * 数组去重
   * @param array 输入数组
   * @returns 去重后的数组
   */
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)]
  }

  /**
   * 基于函数的数组去重
   * @param array 输入数组
   * @param keyFn 键函数
   * @returns 去重后的数组
   */
  static uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
    const seen = new Set<K>()
    return array.filter((item) => {
      const key = keyFn(item)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  /**
   * 数组分组
   * @param array 输入数组
   * @param keyFn 分组键函数
   * @returns 分组后的对象
   */
  static groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
    const result = {} as Record<K, T[]>

    for (const item of array) {
      const key = keyFn(item)
      if (!result[key]) {
        result[key] = []
      }
      result[key].push(item)
    }

    return result
  }

  /**
   * 数组分块
   * @param array 输入数组
   * @param size 块大小
   * @returns 分块后的二维数组
   */
  static chunk<T>(array: T[], size: number): T[][] {
    if (size <= 0) {
      throw new Error('Chunk size must be greater than 0')
    }

    const result: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size))
    }
    return result
  }

  /**
   * 数组扁平化
   * @param array 输入数组
   * @param depth 扁平化深度，默认为 1
   * @returns 扁平化后的数组
   */
  static flatten<T>(array: (T | T[])[], depth = 1): T[] {
    if (depth <= 0) {
      return array as T[]
    }

    const result: T[] = []
    for (const item of array) {
      if (Array.isArray(item) && depth > 0) {
        result.push(...ArrayUtils.flatten(item, depth - 1))
      }
      else {
        result.push(item as T)
      }
    }
    return result
  }

  /**
   * 深度扁平化
   * @param array 输入数组
   * @returns 完全扁平化的数组
   */
  static flattenDeep<T>(array: any[]): T[] {
    const result: T[] = []
    for (const item of array) {
      if (Array.isArray(item)) {
        result.push(...(ArrayUtils.flattenDeep<T>(item as any[]) as T[]))
      }
      else {
        result.push(item as T)
      }
    }
    return result
  }

  /**
   * 数组交集
   * @param arrays 输入数组
   * @returns 交集数组
   */
  static intersection<T>(...arrays: T[][]): T[] {
    if (arrays.length === 0)
      return []
    if (arrays.length === 1)
      return arrays[0] ?? [] as T[]

    return arrays.reduce((acc, array) => acc.filter(item => array.includes(item)))
  }

  /**
   * 数组差集
   * @param array1 第一个数组
   * @param array2 第二个数组
   * @returns 差集数组
   */
  static difference<T>(array1: T[], array2: T[]): T[] {
    return array1.filter(item => !array2.includes(item))
  }

  /**
   * 数组并集
   * @param arrays 输入数组
   * @returns 并集数组
   */
  static union<T>(...arrays: T[][]): T[] {
    return ArrayUtils.unique(ArrayUtils.flattenDeep(arrays))
  }

  /**
   * 数组排序
   * @param array 输入数组
   * @param keyFn 排序键函数
   * @param order 排序顺序
   * @returns 排序后的数组
   */
  static sortBy<T>(array: T[], keyFn: (item: T) => any, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aKey = keyFn(a)
      const bKey = keyFn(b)

      if (aKey < bKey)
        return order === 'asc' ? -1 : 1
      if (aKey > bKey)
        return order === 'asc' ? 1 : -1
      return 0
    })
  }

  /**
   * 数组洗牌
   * @param array 输入数组
   * @returns 洗牌后的数组
   */
  static shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = result[i]!
      result[i] = result[j]!
      result[j] = temp
    }
    return result
  }

  /**
   * 数组采样
   * @param array 输入数组
   * @param count 采样数量
   * @returns 采样后的数组
   */
  static sample<T>(array: T[], count = 1): T[] {
    if (count >= array.length) {
      return ArrayUtils.shuffle(array)
    }

    const shuffled = ArrayUtils.shuffle(array)
    return shuffled.slice(0, count)
  }

  /**
   * 数组分页
   * @param array 输入数组
   * @param page 页码（从 1 开始）
   * @param pageSize 页大小
   * @returns 分页结果
   */
  static paginate<T>(array: T[], page: number, pageSize: number) {
    const total = array.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = array.slice(start, end)

    return {
      data,
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }

  /**
   * 数组计数
   * @param array 输入数组
   * @param keyFn 计数键函数
   * @returns 计数对象
   */
  static countBy<T>(
    array: T[],
    keyFn: (item: T) => string | number,
  ): Record<string | number, number> {
    const result: Record<string | number, number> = {}

    for (const item of array) {
      const key = keyFn(item)
      result[key] = (result[key] || 0) + 1
    }

    return result
  }

  /**
   * 数组压缩（将多个数组合并为元组数组）
   * @param arrays 输入数组
   * @returns 压缩后的数组
   */
  static zip<T>(...arrays: T[][]): T[][] {
    if (arrays.length === 0)
      return []

    const maxLength = Math.max(...arrays.map(arr => arr.length))
    const result: T[][] = []

    for (let i = 0; i < maxLength; i++) {
      result.push(arrays.map(arr => arr[i] as T))
    }

    return result
  }

  /**
   * 数组解压缩
   * @param array 输入的元组数组
   * @returns 解压缩后的数组
   */
  static unzip<T>(array: T[][]): T[][] {
    if (array.length === 0)
      return []

    const maxLength = Math.max(...array.map(arr => arr.length))
    const result: T[][] = []

    for (let i = 0; i < maxLength; i++) {
      result.push(array.map(arr => arr[i] as T))
    }

    return result
  }

  /**
   * 检查数组是否为空
   * @param array 输入数组
   * @returns 是否为空
   */
  static isEmpty<T>(array: T[]): boolean {
    return array.length === 0
  }

  /**
   * 获取数组的第一个元素
   * @param array 输入数组
   * @returns 第一个元素
   */
  static first<T>(array: T[]): T | undefined {
    return array[0]
  }

  /**
   * 获取数组的最后一个元素
   * @param array 输入数组
   * @returns 最后一个元素
   */
  static last<T>(array: T[]): T | undefined {
    return array[array.length - 1]
  }

  /**
   * 移除数组中的假值
   * @param array 输入数组
   * @returns 过滤后的数组
   */
  static compact<T>(array: T[]): NonNullable<T>[] {
    return array.filter(Boolean) as NonNullable<T>[]
  }

  /**
   * 数组求和
   * @param array 输入数组
   * @param keyFn 值提取函数
   * @returns 求和结果
   */
  static sum<T>(array: T[], keyFn?: (item: T) => number): number {
    if (keyFn) {
      return array.reduce((sum, item) => sum + keyFn(item), 0)
    }
    return (array as unknown as number[]).reduce((sum, item) => sum + item, 0)
  }

  /**
   * 数组平均值
   * @param array 输入数组
   * @param keyFn 值提取函数
   * @returns 平均值
   */
  static average<T>(array: T[], keyFn?: (item: T) => number): number {
    if (array.length === 0)
      return 0
    return ArrayUtils.sum(array, keyFn) / array.length
  }

  /**
   * 数组最大值
   * @param array 输入数组
   * @param keyFn 值提取函数
   * @returns 最大值
   */
  static max<T>(array: T[], keyFn?: (item: T) => number): T | undefined {
    if (array.length === 0)
      return undefined

    if (keyFn) {
      return array.reduce((max, item) => (keyFn(item) > keyFn(max) ? item : max))
    }

    return array.reduce((max, item) => (item > max ? item : max))
  }

  /**
   * 数组最小值
   * @param array 输入数组
   * @param keyFn 值提取函数
   * @returns 最小值
   */
  static min<T>(array: T[], keyFn?: (item: T) => number): T | undefined {
    if (array.length === 0)
      return undefined

    if (keyFn) {
      return array.reduce((min, item) => (keyFn(item) < keyFn(min) ? item : min))
    }

    return array.reduce((min, item) => (item < min ? item : min))
  }
}
