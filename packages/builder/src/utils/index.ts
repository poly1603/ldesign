/**
 * 工具函数模块
 * 提供文件操作、路径处理等通用功能
 */

import type { FileInfo } from '../types'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * 文件操作工具
 */
export class FileUtils {
  /**
   * 检查文件是否存在
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 确保目录存在
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true })
    }
    catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error
      }
    }
  }

  /**
   * 读取文件内容
   */
  static async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    return await fs.readFile(filePath, encoding)
  }

  /**
   * 写入文件内容
   */
  static async writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
    await FileUtils.ensureDir(path.dirname(filePath))
    await fs.writeFile(filePath, content, encoding)
  }

  /**
   * 复制文件
   */
  static async copyFile(src: string, dest: string): Promise<void> {
    await FileUtils.ensureDir(path.dirname(dest))
    await fs.copyFile(src, dest)
  }

  /**
   * 删除文件或目录
   */
  static async remove(filePath: string): Promise<void> {
    try {
      const stat = await fs.stat(filePath)
      if (stat.isDirectory()) {
        await fs.rm(filePath, { recursive: true, force: true })
      }
      else {
        await fs.unlink(filePath)
      }
    }
    catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  }

  /**
   * 获取文件信息
   */
  static async getFileInfo(filePath: string): Promise<FileInfo> {
    const stat = await fs.stat(filePath)

    return {
      path: filePath,
      relativePath: path.relative(process.cwd(), filePath),
      type: 'other',
      size: stat.size,
      isEntry: false,
      dependencies: [],
    }
  }

  /**
   * 递归扫描目录
   */
  static async scanDirectory(
    dirPath: string,
    options: {
      extensions?: string[]
      ignore?: string[]
      maxDepth?: number
    } = {},
  ): Promise<FileInfo[]> {
    const { extensions, ignore = [], maxDepth = Infinity } = options
    const files: FileInfo[] = []

    async function scan(currentPath: string, depth: number): Promise<void> {
      if (depth > maxDepth)
        return

      const entries = await fs.readdir(currentPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name)
        const relativePath = path.relative(dirPath, fullPath)

        // 检查是否应该忽略
        if (ignore.some(pattern => relativePath.includes(pattern))) {
          continue
        }

        if (entry.isDirectory()) {
          await scan(fullPath, depth + 1)
        }
        else {
          // 检查文件扩展名
          if (extensions && !extensions.includes(path.extname(entry.name))) {
            continue
          }

          const fileInfo = await FileUtils.getFileInfo(fullPath)
          files.push(fileInfo)
        }
      }
    }

    await scan(dirPath, 0)
    return files
  }

  /**
   * 生成文件哈希
   */
  static generateHash(content: string): string {
    return createHash('md5').update(content).digest('hex')
  }

  /**
   * 获取文件大小（格式化）
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`
  }
}

/**
 * 路径处理工具
 */
export class PathUtils {
  /**
   * 标准化路径
   */
  static normalize(filePath: string): string {
    return path.normalize(filePath).replace(/\\/g, '/')
  }

  /**
   * 获取相对路径
   */
  static relative(from: string, to: string): string {
    return PathUtils.normalize(path.relative(from, to))
  }

  /**
   * 解析路径
   */
  static resolve(...paths: string[]): string {
    return PathUtils.normalize(path.resolve(...paths))
  }

  /**
   * 连接路径
   */
  static join(...paths: string[]): string {
    return PathUtils.normalize(path.join(...paths))
  }

  /**
   * 获取文件名（不含扩展名）
   */
  static basename(filePath: string, ext?: string): string {
    return path.basename(filePath, ext)
  }

  /**
   * 获取目录名
   */
  static dirname(filePath: string): string {
    return PathUtils.normalize(path.dirname(filePath))
  }

  /**
   * 获取文件扩展名
   */
  static extname(filePath: string): string {
    return path.extname(filePath)
  }

  /**
   * 检查路径是否为绝对路径
   */
  static isAbsolute(filePath: string): boolean {
    return path.isAbsolute(filePath)
  }

  /**
   * 将相对路径转换为绝对路径
   */
  static toAbsolute(filePath: string, basePath?: string): string {
    if (PathUtils.isAbsolute(filePath)) {
      return PathUtils.normalize(filePath)
    }

    const base = basePath || process.cwd()
    return PathUtils.resolve(base, filePath)
  }

  /**
   * 检查路径是否在指定目录内
   */
  static isWithin(filePath: string, dirPath: string): boolean {
    const relativePath = PathUtils.relative(dirPath, filePath)
    return !relativePath.startsWith('../') && !path.isAbsolute(relativePath)
  }

  /**
   * 获取公共路径前缀
   */
  static getCommonPrefix(paths: string[]): string {
    if (paths.length === 0)
      return ''
    if (paths.length === 1)
      return PathUtils.dirname(paths[0])

    const normalizedPaths = paths.map(p => PathUtils.normalize(p))
    const parts = normalizedPaths[0].split('/')

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (!normalizedPaths.every(p => p.split('/')[i] === part)) {
        return parts.slice(0, i).join('/')
      }
    }

    return normalizedPaths[0]
  }
}

/**
 * 字符串处理工具
 */
export class StringUtils {
  /**
   * 转换为驼峰命名
   */
  static toCamelCase(str: string): string {
    return str.replace(/[-_\s]+(\w)/g, (_, letter) => letter.toUpperCase())
  }

  /**
   * 转换为帕斯卡命名
   */
  static toPascalCase(str: string): string {
    const camelCase = StringUtils.toCamelCase(str)
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
  }

  /**
   * 转换为短横线命名
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLowerCase()
  }

  /**
   * 转换为下划线命名
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toLowerCase()
  }

  /**
   * 首字母大写
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * 移除前后空白字符
   */
  static trim(str: string): string {
    return str.trim()
  }

  /**
   * 检查字符串是否为空
   */
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0
  }

  /**
   * 生成随机字符串
   */
  static random(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * 截断字符串
   */
  static truncate(str: string, maxLength: number, suffix = '...'): string {
    if (str.length <= maxLength) {
      return str
    }
    return str.slice(0, maxLength - suffix.length) + suffix
  }
}

/**
 * 对象处理工具
 */
export class ObjectUtils {
  /**
   * 深度克隆对象
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T
    }

    if (Array.isArray(obj)) {
      return obj.map(item => ObjectUtils.deepClone(item)) as unknown as T
    }

    if (typeof obj === 'object') {
      const cloned = {} as T
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = ObjectUtils.deepClone(obj[key])
        }
      }
      return cloned
    }

    return obj
  }

  /**
   * 深度合并对象
   */
  static deepMerge<T extends Record<string, any>>(...objects: Partial<T>[]): T {
    const result = {} as T

    for (const obj of objects) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key]

          if (value && typeof value === 'object' && !Array.isArray(value)) {
            (result as any)[key] = ObjectUtils.deepMerge((result as any)[key] || {}, value)
          }
          else {
            (result as any)[key] = value
          }
        }
      }
    }

    return result
  }

  /**
   * 获取嵌套属性值
   */
  static get(obj: any, path: string, defaultValue?: any): any {
    const keys = path.split('.')
    let result = obj

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue
      }
      result = result[key]
    }

    return result !== undefined ? result : defaultValue
  }

  /**
   * 设置嵌套属性值
   */
  static set(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * 检查对象是否为空
   */
  static isEmpty(obj: any): boolean {
    if (obj === null || obj === undefined) {
      return true
    }

    if (Array.isArray(obj)) {
      return obj.length === 0
    }

    if (typeof obj === 'object') {
      return Object.keys(obj).length === 0
    }

    return false
  }

  /**
   * 过滤对象属性
   */
  static pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Pick<T, K> {
    const result = {} as Pick<T, K>

    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key]
      }
    }

    return result
  }

  /**
   * 排除对象属性
   */
  static omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Omit<T, K> {
    const result = { ...obj }

    for (const key of keys) {
      delete result[key]
    }

    return result
  }
}

/**
 * 数组处理工具
 */
export class ArrayUtils {
  /**
   * 数组去重
   */
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)]
  }

  /**
   * 数组分组
   */
  static groupBy<T, K extends string | number>(
    array: T[],
    keyFn: (item: T) => K,
  ): Record<K, T[]> {
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
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const result: T[][] = []

    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size))
    }

    return result
  }

  /**
   * 数组扁平化
   */
  static flatten<T>(array: (T | T[])[]): T[] {
    const result: T[] = []

    for (const item of array) {
      if (Array.isArray(item)) {
        result.push(...ArrayUtils.flatten(item))
      }
      else {
        result.push(item)
      }
    }

    return result
  }

  /**
   * 数组交集
   */
  static intersection<T>(...arrays: T[][]): T[] {
    if (arrays.length === 0)
      return []
    if (arrays.length === 1)
      return arrays[0]

    return arrays.reduce((acc, array) =>
      acc.filter(item => array.includes(item)),
    )
  }

  /**
   * 数组差集
   */
  static difference<T>(array1: T[], array2: T[]): T[] {
    return array1.filter(item => !array2.includes(item))
  }

  /**
   * 数组并集
   */
  static union<T>(...arrays: T[][]): T[] {
    return ArrayUtils.unique(ArrayUtils.flatten(arrays))
  }
}

/**
 * 异步工具
 */
export class AsyncUtils {
  /**
   * 延迟执行
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 超时控制
   */
  static timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`操作超时 (${ms}ms)`)), ms),
      ),
    ])
  }

  /**
   * 重试机制
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number
      delay?: number
      backoff?: boolean
    } = {},
  ): Promise<T> {
    const { maxAttempts = 3, delay = 1000, backoff = false } = options

    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      }
      catch (error) {
        lastError = error as Error

        if (attempt === maxAttempts) {
          throw lastError
        }

        const waitTime = backoff ? delay * 2 ** (attempt - 1) : delay
        await AsyncUtils.delay(waitTime)
      }
    }

    throw lastError!
  }

  /**
   * 并发控制
   */
  static async concurrent<T>(
    tasks: (() => Promise<T>)[],
    concurrency = 5,
  ): Promise<T[]> {
    const results: T[] = []
    const executing: Promise<void>[] = []

    for (const task of tasks) {
      const promise = task().then((result) => {
        results.push(result)
      })

      executing.push(promise)

      if (executing.length >= concurrency) {
        await Promise.race(executing)
        executing.splice(executing.findIndex(p => p === promise), 1)
      }
    }

    await Promise.all(executing)
    return results
  }
}

// 导出所有工具类
export { ErrorHandler, Logger, ProgressBar, Timer } from './logger'
