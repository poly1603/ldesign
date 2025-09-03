/**
 * 检查对象是否拥有指定的属性
 *
 * @param val - 要检查的对象
 * @param key - 属性键名
 * @returns 如果对象拥有该属性则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * const obj = { name: 'John', age: 30 }
 *
 * if (hasOwn(obj, 'name')) {
 *   console.log(obj.name) // TypeScript 知道 name 属性存在
 * }
 * ```
 */
declare const hasOwn: <T extends object>(val: T, key: string | symbol | number) => key is keyof T;
/**
 * 安全地从对象中获取属性值
 *
 * @param val - 源对象
 * @param key - 属性键名
 * @returns 属性值，如果属性不存在则返回 undefined
 *
 * @example
 * ```typescript
 * const obj = { name: 'John', age: 30 }
 *
 * const name = getPropertyValFromObj(obj, 'name') // string | undefined
 * const invalid = getPropertyValFromObj(obj, 'invalid') // undefined
 * ```
 */
declare function getPropertyValFromObj<T extends object>(val: T, key: string | symbol | number): T[keyof T] | undefined;
/**
 * 检查值是否为纯对象（Plain Object）
 *
 * @param val - 要检查的值
 * @returns 如果是纯对象则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isPlainObject({}) // true
 * isPlainObject({ name: 'John' }) // true
 * isPlainObject([]) // false
 * isPlainObject(new Date()) // false
 * isPlainObject(null) // false
 * ```
 */
declare const isPlainObject: <T extends object>(val: unknown) => val is T;
/**
 * 检查值是否为 Promise 对象
 *
 * @param val - 要检查的值
 * @returns 如果是 Promise 则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isPromise(Promise.resolve()) // true
 * isPromise(fetch('/api/data')) // true
 * isPromise({}) // false
 * isPromise(null) // false
 * ```
 */
declare function isPromise<T = any>(val: unknown): val is Promise<T>;
/**
 * 深度克隆对象
 *
 * @param obj - 要克隆的对象
 * @returns 克隆后的新对象
 *
 * @example
 * ```typescript
 * const original = {
 *   name: 'John',
 *   address: { city: 'New York', country: 'USA' }
 * }
 *
 * const cloned = deepClone(original)
 * cloned.address.city = 'Boston'
 * console.log(original.address.city) // 'New York' (原对象未被修改)
 * ```
 */
declare function deepClone<T>(obj: T): T;
/**
 * 深度合并多个对象
 *
 * @param target - 目标对象
 * @param sources - 源对象数组
 * @returns 合并后的对象
 *
 * @example
 * ```typescript
 * const target = { a: 1, b: { x: 1 } }
 * const source1 = { b: { y: 2 }, c: 3 }
 * const source2 = { d: 4 }
 *
 * const result = deepMerge(target, source1, source2)
 * // { a: 1, b: { x: 1, y: 2 }, c: 3, d: 4 }
 * ```
 */
declare function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T;
/**
 * 防抖函数
 *
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @param immediate - 是否立即执行
 * @returns 防抖后的函数
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query)
 * }, 300)
 *
 * // 只有在停止输入 300ms 后才会执行搜索
 * debouncedSearch('hello')
 * debouncedSearch('hello world')
 * ```
 */
declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number, immediate?: boolean): (...args: Parameters<T>) => void;
/**
 * 节流函数
 *
 * @param func - 要节流的函数
 * @param limit - 时间间隔（毫秒）
 * @returns 节流后的函数
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   console.log('Scroll event handled')
 * }, 100)
 *
 * window.addEventListener('scroll', throttledScroll)
 * ```
 */
declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * 生成唯一 ID
 *
 * @param prefix - ID 前缀（可选）
 * @returns 唯一 ID 字符串
 *
 * @example
 * ```typescript
 * generateId() // 'id_1234567890123'
 * generateId('user') // 'user_1234567890123'
 * ```
 */
declare function generateId(prefix?: string): string;
/**
 * 生成 UUID v4
 *
 * @returns UUID v4 字符串
 *
 * @example
 * ```typescript
 * generateUUID() // 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
 * ```
 */
declare function generateUUID(): string;
/**
 * 延迟执行函数
 *
 * @param ms - 延迟时间（毫秒）
 * @returns Promise
 *
 * @example
 * ```typescript
 * async function example() {
 *   console.log('Start')
 *   await delay(1000)
 *   console.log('After 1 second')
 * }
 * ```
 */
declare function delay(ms: number): Promise<void>;
/**
 * 重试函数
 *
 * @param fn - 要重试的函数
 * @param maxRetries - 最大重试次数
 * @param delayMs - 重试间隔（毫秒）
 * @returns Promise
 *
 * @example
 * ```typescript
 * const fetchData = () => fetch('/api/data').then(res => res.json())
 *
 * const data = await retry(fetchData, 3, 1000)
 * ```
 */
declare function retry<T>(fn: () => Promise<T>, maxRetries: number, delayMs?: number): Promise<T>;
/**
 * 检查值是否为空
 *
 * @param value - 要检查的值
 * @returns 如果为空则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isEmpty(null) // true
 * isEmpty(undefined) // true
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty('hello') // false
 * isEmpty([1, 2, 3]) // false
 * ```
 */
declare function isEmpty(value: unknown): boolean;

export { debounce, deepClone, deepMerge, delay, generateId, generateUUID, getPropertyValFromObj, hasOwn, isEmpty, isPlainObject, isPromise, retry, throttle };
