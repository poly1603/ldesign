/**
 * 构建器工具函数
 * @module utils
 * @description 提供构建器所需的通用工具函数
 */

import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { join, resolve, dirname, basename, extname } from 'path'

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 深度克隆对象
 */
export function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    const clonedArr: any[] = []
    obj.forEach((element) => {
      clonedArr.push(cloneDeep(element))
    })
    return clonedArr as T
  }

  if (obj instanceof Object) {
    const clonedObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = cloneDeep(obj[key])
      }
    }
    return clonedObj as T
  }

  return obj
}

/**
 * 检查是否为对象
 */
export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 生成哈希值
 */
export function generateHash(content: string, algorithm = 'sha256'): string {
  return createHash(algorithm).update(content).digest('hex').substring(0, 8)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

/**
 * 格式化时间
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  
  const seconds = ms / 1000
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`
}

/**
 * 确保目录存在
 */
export async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

/**
 * 清空目录
 */
export async function emptyDir(dir: string): Promise<void> {
  try {
    const files = await fs.readdir(dir)
    await Promise.all(
      files.map(file => 
        fs.rm(join(dir, file), { recursive: true, force: true })
      )
    )
  } catch {
    // 目录不存在，无需清空
  }
}

/**
 * 复制文件或目录
 */
export async function copy(src: string, dest: string): Promise<void> {
  const stat = await fs.stat(src)
  
  if (stat.isDirectory()) {
    await ensureDir(dest)
    const files = await fs.readdir(src)
    
    await Promise.all(
      files.map(file => 
        copy(join(src, file), join(dest, file))
      )
    )
  } else {
    await ensureDir(dirname(dest))
    await fs.copyFile(src, dest)
  }
}

/**
 * 读取 JSON 文件
 */
export async function readJSON<T = any>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * 写入 JSON 文件
 */
export async function writeJSON<T = any>(
  filePath: string,
  data: T,
  pretty = true
): Promise<void> {
  const content = pretty 
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data)
  await fs.writeFile(filePath, content, 'utf-8')
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * 获取文件大小
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stat = await fs.stat(filePath)
  return stat.size
}

/**
 * 查找文件
 */
export async function findFiles(
  dir: string,
  pattern: RegExp,
  recursive = true
): Promise<string[]> {
  const results: string[] = []
  const files = await fs.readdir(dir, { withFileTypes: true })

  for (const file of files) {
    const filePath = join(dir, file.name)
    
    if (file.isDirectory() && recursive) {
      results.push(...await findFiles(filePath, pattern))
    } else if (file.isFile() && pattern.test(file.name)) {
      results.push(filePath)
    }
  }

  return results
}

/**
 * 批量重命名文件
 */
export async function renameFiles(
  files: string[],
  transformer: (oldPath: string) => string
): Promise<void> {
  await Promise.all(
    files.map(async file => {
      const newPath = transformer(file)
      if (newPath !== file) {
        await ensureDir(dirname(newPath))
        await fs.rename(file, newPath)
      }
    })
  )
}

/**
 * 计算文件哈希
 */
export async function fileHash(
  filePath: string,
  algorithm = 'sha256'
): Promise<string> {
  const content = await fs.readFile(filePath)
  return createHash(algorithm).update(content).digest('hex')
}

/**
 * 并行执行任务
 */
export async function parallel<T>(
  tasks: (() => Promise<T>)[],
  concurrency = 4
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<void>[] = []
  
  for (const task of tasks) {
    const promise = task().then(result => {
      results.push(result)
    })
    
    executing.push(promise)
    
    if (executing.length >= concurrency) {
      await Promise.race(executing)
      executing.splice(
        executing.findIndex(p => p === promise),
        1
      )
    }
  }
  
  await Promise.all(executing)
  return results
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    times?: number
    delay?: number
    onError?: (error: Error, attempt: number) => void
  } = {}
): Promise<T> {
  const { times = 3, delay = 1000, onError } = options
  let lastError: Error
  
  for (let i = 1; i <= times; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (onError) {
        onError(lastError, i)
      }
      
      if (i < times) {
        await sleep(delay * i)
      }
    }
  }
  
  throw lastError!
}

/**
 * 延迟执行
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 解析命令行参数
 */
export function parseArgs(args: string[]): Record<string, any> {
  const result: Record<string, any> = {
    _: []
  }
  
  let i = 0
  while (i < args.length) {
    const arg = args[i]
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const nextArg = args[i + 1]
      
      if (nextArg && !nextArg.startsWith('-')) {
        result[key] = nextArg
        i += 2
      } else {
        result[key] = true
        i++
      }
    } else if (arg.startsWith('-')) {
      const flags = arg.slice(1).split('')
      flags.forEach(flag => {
        result[flag] = true
      })
      i++
    } else {
      result._.push(arg)
      i++
    }
  }
  
  return result
}

/**
 * 获取包信息
 */
export async function getPackageInfo(dir = process.cwd()): Promise<{
  name?: string
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}> {
  try {
    const packagePath = resolve(dir, 'package.json')
    return await readJSON(packagePath)
  } catch {
    return {}
  }
}

/**
 * 判断是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * 判断是否为开发环境
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
}

/**
 * 判断是否为测试环境
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test'
}

/**
 * 获取环境变量
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}

/**
 * 规范化路径
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/')
}

/**
 * 是否为绝对路径
 */
export function isAbsolutePath(path: string): boolean {
  return /^(?:\/|[a-z]+:\/\/)/.test(path)
}

/**
 * 解析路径别名
 */
export function resolveAlias(
  path: string,
  alias: Record<string, string>
): string {
  for (const [key, value] of Object.entries(alias)) {
    if (path.startsWith(key)) {
      return path.replace(key, value)
    }
  }
  return path
}

/**
 * 创建唯一 ID
 */
export function createUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 颜色输出
 */
export const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
}

export function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

/**
 * 打印构建信息
 */
export function printBuildInfo(info: {
  name: string
  version?: string
  mode?: string
  time?: number
  size?: number
}): void {
  console.log('\n' + colorize('Build Info:', 'cyan'))
  console.log('─'.repeat(40))
  console.log(`Name: ${colorize(info.name, 'green')}`)
  if (info.version) {
    console.log(`Version: ${colorize(info.version, 'green')}`)
  }
  if (info.mode) {
    console.log(`Mode: ${colorize(info.mode, 'yellow')}`)
  }
  if (info.time) {
    console.log(`Time: ${colorize(formatTime(info.time), 'blue')}`)
  }
  if (info.size) {
    console.log(`Size: ${colorize(formatFileSize(info.size), 'blue')}`)
  }
  console.log('─'.repeat(40))
}
