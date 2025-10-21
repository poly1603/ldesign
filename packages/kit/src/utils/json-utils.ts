/**
 * JSON 处理工具类
 * 提供安全的 JSON 解析、序列化、验证等功能
 * 
 * @example
 * ```typescript
 * import { JsonUtils } from '@ldesign/kit'
 * 
 * // 安全解析
 * const data = JsonUtils.safeParse('{"name":"John"}')
 * 
 * // 美化输出
 * const pretty = JsonUtils.stringify(data, { pretty: true })
 * 
 * // 深度合并
 * const merged = JsonUtils.deepMerge(obj1, obj2)
 * ```
 */

/**
 * JSON 解析选项
 */
export interface JsonParseOptions {
  /**
   * 解析失败时的默认值
   */
  defaultValue?: any
  /**
   * 是否允许注释
   */
  allowComments?: boolean
  /**
   * 是否允许尾随逗号
   */
  allowTrailingCommas?: boolean
}

/**
 * JSON 序列化选项
 */
export interface JsonStringifyOptions {
  /**
   * 是否美化输出
   */
  pretty?: boolean
  /**
   * 缩进空格数
   */
  indent?: number
  /**
   * 是否排序键
   */
  sortKeys?: boolean
  /**
   * 替换函数
   */
  replacer?: (key: string, value: any) => any
}

/**
 * JSON 工具类
 */
export class JsonUtils {
  /**
   * 安全解析 JSON 字符串
   * @param text JSON 字符串
   * @param options 解析选项
   * @returns 解析后的对象，失败返回 null 或默认值
   */
  static safeParse<T = any>(text: string, options: JsonParseOptions = {}): T | null {
    try {
      let processedText = text

      // 移除注释
      if (options.allowComments) {
        processedText = JsonUtils.removeComments(processedText)
      }

      // 移除尾随逗号
      if (options.allowTrailingCommas) {
        processedText = JsonUtils.removeTrailingCommas(processedText)
      }

      return JSON.parse(processedText)
    }
    catch {
      return (options.defaultValue !== undefined ? options.defaultValue : null) as T | null
    }
  }

  /**
   * JSON 序列化
   * @param value 要序列化的值
   * @param options 序列化选项
   * @returns JSON 字符串
   */
  static stringify(value: any, options: JsonStringifyOptions = {}): string {
    const {
      pretty = false,
      indent = 2,
      sortKeys = false,
      replacer,
    } = options

    let processedValue = value

    // 排序键
    if (sortKeys) {
      processedValue = JsonUtils.sortKeys(value)
    }

    // 序列化
    return JSON.stringify(
      processedValue,
      replacer as any,
      pretty ? indent : undefined,
    )
  }

  /**
   * 移除 JSON 注释
   * @param text JSON 字符串
   * @returns 移除注释后的字符串
   */
  static removeComments(text: string): string {
    // 移除单行注释
    let result = text.replace(/\/\/.*/g, '')
    // 移除多行注释
    result = result.replace(/\/\*[\s\S]*?\*\//g, '')
    return result
  }

  /**
   * 移除尾随逗号
   * @param text JSON 字符串
   * @returns 移除尾随逗号后的字符串
   */
  static removeTrailingCommas(text: string): string {
    return text.replace(/,(\s*[}\]])/g, '$1')
  }

  /**
   * 排序对象键
   * @param obj 对象
   * @returns 排序后的对象
   */
  static sortKeys(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => JsonUtils.sortKeys(item))
    }

    if (obj && typeof obj === 'object') {
      const sorted: any = {}
      const keys = Object.keys(obj).sort()
      for (const key of keys) {
        sorted[key] = JsonUtils.sortKeys(obj[key])
      }
      return sorted
    }

    return obj
  }

  /**
   * 深度克隆
   * @param obj 对象
   * @returns 克隆后的对象
   */
  static deepClone<T = any>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any
    }

    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags) as any
    }

    if (Array.isArray(obj)) {
      return obj.map(item => JsonUtils.deepClone(item)) as any
    }

    const cloned: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = JsonUtils.deepClone(obj[key])
      }
    }
    return cloned
  }

  /**
   * 深度合并对象
   * @param target 目标对象
   * @param sources 源对象
   * @returns 合并后的对象
   */
  static deepMerge<T = any>(target: any, ...sources: any[]): T {
    if (!sources.length) {
      return target
    }

    const source = sources.shift()

    if (JsonUtils.isObject(target) && JsonUtils.isObject(source)) {
      for (const key in source) {
        if (JsonUtils.isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, { [key]: {} })
          }
          JsonUtils.deepMerge(target[key], source[key])
        }
        else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }

    return JsonUtils.deepMerge(target, ...sources)
  }

  /**
   * 判断是否为对象
   * @param item 项
   * @returns 是否为对象
   */
  static isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item)
  }

  /**
   * 获取嵌套属性
   * @param obj 对象
   * @param path 路径（点分隔）
   * @param defaultValue 默认值
   * @returns 属性值
   */
  static get<T = any>(obj: any, path: string, defaultValue?: T): T | undefined {
    const keys = path.split('.')
    let result: any = obj

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key]
      }
      else {
        return defaultValue
      }
    }

    return result as T
  }

  /**
   * 设置嵌套属性
   * @param obj 对象
   * @param path 路径（点分隔）
   * @param value 值
   */
  static set(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    let current = obj

    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[lastKey] = value
  }

  /**
   * 删除嵌套属性
   * @param obj 对象
   * @param path 路径（点分隔）
   * @returns 是否删除成功
   */
  static delete(obj: any, path: string): boolean {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    let current = obj

    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        return false
      }
      current = current[key]
    }

    return delete current[lastKey]
  }

  /**
   * 检查是否有嵌套属性
   * @param obj 对象
   * @param path 路径（点分隔）
   * @returns 是否存在
   */
  static has(obj: any, path: string): boolean {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      }
      else {
        return false
      }
    }

    return true
  }

  /**
   * 扁平化对象
   * @param obj 对象
   * @param prefix 前缀
   * @returns 扁平化后的对象
   */
  static flatten(obj: any, prefix = ''): Record<string, any> {
    const result: Record<string, any> = {}

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        const value = obj[key]

        if (JsonUtils.isObject(value)) {
          Object.assign(result, JsonUtils.flatten(value, fullKey))
        }
        else {
          result[fullKey] = value
        }
      }
    }

    return result
  }

  /**
   * 反扁平化对象
   * @param obj 扁平化对象
   * @returns 原始对象
   */
  static unflatten(obj: Record<string, any>): any {
    const result: any = {}

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        JsonUtils.set(result, key, obj[key])
      }
    }

    return result
  }

  /**
   * 比较两个对象是否相等
   * @param obj1 对象1
   * @param obj2 对象2
   * @returns 是否相等
   */
  static equals(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
      return true
    }

    if (obj1 === null || obj2 === null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false
    }

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) {
      return false
    }

    for (const key of keys1) {
      if (!keys2.includes(key) || !JsonUtils.equals(obj1[key], obj2[key])) {
        return false
      }
    }

    return true
  }

  /**
   * 过滤对象属性
   * @param obj 对象
   * @param predicate 过滤函数
   * @returns 过滤后的对象
   */
  static filter<T extends Record<string, any>>(
    obj: T,
    predicate: (key: string, value: any) => boolean,
  ): Partial<T> {
    const result: any = {}

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && predicate(key, obj[key])) {
        result[key] = obj[key]
      }
    }

    return result
  }

  /**
   * 映射对象属性
   * @param obj 对象
   * @param mapper 映射函数
   * @returns 映射后的对象
   */
  static map<T extends Record<string, any>, R>(
    obj: T,
    mapper: (key: string, value: any) => R,
  ): Record<keyof T, R> {
    const result: any = {}

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = mapper(key, obj[key])
      }
    }

    return result
  }

  /**
   * 获取对象差异
   * @param obj1 对象1
   * @param obj2 对象2
   * @returns 差异对象
   */
  static diff(obj1: any, obj2: any): any {
    const result: any = {}

    // 检查 obj1 中的变化
    for (const key in obj1) {
      if (Object.prototype.hasOwnProperty.call(obj1, key)) {
        if (!(key in obj2)) {
          result[key] = { type: 'removed', value: obj1[key] }
        }
        else if (!JsonUtils.equals(obj1[key], obj2[key])) {
          if (JsonUtils.isObject(obj1[key]) && JsonUtils.isObject(obj2[key])) {
            const nestedDiff = JsonUtils.diff(obj1[key], obj2[key])
            if (Object.keys(nestedDiff).length > 0) {
              result[key] = nestedDiff
            }
          }
          else {
            result[key] = { type: 'modified', oldValue: obj1[key], newValue: obj2[key] }
          }
        }
      }
    }

    // 检查 obj2 中新增的键
    for (const key in obj2) {
      if (Object.prototype.hasOwnProperty.call(obj2, key) && !(key in obj1)) {
        result[key] = { type: 'added', value: obj2[key] }
      }
    }

    return result
  }

  /**
   * 压缩 JSON（移除空白和不必要的字符）
   * @param text JSON 字符串
   * @returns 压缩后的字符串
   */
  static minify(text: string): string {
    try {
      const obj = JSON.parse(text)
      return JSON.stringify(obj)
    }
    catch {
      return text
    }
  }

  /**
   * 验证 JSON 字符串
   * @param text JSON 字符串
   * @returns 是否有效
   */
  static isValid(text: string): boolean {
    try {
      JSON.parse(text)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 美化 JSON 字符串
   * @param text JSON 字符串
   * @param indent 缩进空格数
   * @returns 美化后的字符串
   */
  static prettify(text: string, indent = 2): string {
    try {
      const obj = JSON.parse(text)
      return JSON.stringify(obj, null, indent)
    }
    catch {
      return text
    }
  }

  /**
   * 从 JSON 文件路径解析
   * @param path 文件路径
   * @returns 解析后的对象
   */
  static async parseFile<T = any>(path: string): Promise<T | null> {
    try {
      const { promises: fs } = await import('node:fs')
      const content = await fs.readFile(path, 'utf-8')
      return JsonUtils.safeParse<T>(content)
    }
    catch {
      return null
    }
  }

  /**
   * 写入 JSON 文件
   * @param path 文件路径
   * @param data 数据
   * @param options 序列化选项
   */
  static async writeFile(path: string, data: any, options: JsonStringifyOptions = {}): Promise<void> {
    const { promises: fs } = await import('node:fs')
    const { dirname } = await import('node:path')

    const dir = dirname(path)
    await fs.mkdir(dir, { recursive: true })

    const content = JsonUtils.stringify(data, { pretty: true, ...options })
    await fs.writeFile(path, content, 'utf-8')
  }
}





