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
export declare function unique<T>(array: T[]): T[];
/**
 * 根据指定属性对对象数组去重
 *
 * @param array - 要去重的对象数组
 * @param key - 用于去重的属性键
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
 * ```
 */
export declare function uniqueBy<T, K extends keyof T>(array: T[], key: K): T[];
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
export declare function chunk<T>(array: T[], size: number): T[][];
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
export declare function groupBy<T, K extends keyof T>(array: T[], key: K | ((item: T) => string | number)): Record<string, T[]>;
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
export declare function flatten<T>(array: any[], depth?: number): T[];
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
export declare function flattenDeep<T>(array: any[]): T[];
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
export declare function intersection<T>(...arrays: T[][]): T[];
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
export declare function union<T>(...arrays: T[][]): T[];
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
export declare function difference<T>(array: T[], ...excludeArrays: T[][]): T[];
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
export declare function shuffle<T>(array: T[]): T[];
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
export declare function sample<T>(array: T[], count: number): T[];
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
export declare function compact<T>(array: (T | null | undefined | false | 0 | '')[]): T[];
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
export declare function sum(array: number[]): number;
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
export declare function average(array: number[]): number;
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
export declare function max(array: number[]): number;
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
export declare function min(array: number[]): number;
//# sourceMappingURL=array.d.ts.map