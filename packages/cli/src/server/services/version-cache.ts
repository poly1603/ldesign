/**
 * 版本信息缓存服务
 * 缓存npm包的最新版本信息，减少网络请求
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import { logger } from '../../utils/logger.js'

const cacheLogger = logger.withPrefix('VersionCache')

// 缓存目录
const CACHE_DIR = join(process.cwd(), '.ldesign-cache', 'versions')
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 1天（毫秒）

interface VersionCacheData {
  projectPath: string
  dependencies: Record<string, string>  // { packageName: latestVersion }
  timestamp: number
  expiresAt: number
}

/**
 * 确保缓存目录存在
 */
function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true })
  }
}

/**
 * 生成项目路径的缓存key
 */
function getCacheKey(projectPath: string): string {
  return createHash('md5').update(projectPath).digest('hex')
}

/**
 * 获取缓存文件路径
 */
function getCachePath(projectPath: string): string {
  const key = getCacheKey(projectPath)
  return join(CACHE_DIR, `${key}.json`)
}

/**
 * 读取缓存
 */
export function readVersionCache(projectPath: string): Record<string, string> | null {
  try {
    ensureCacheDir()
    const cachePath = getCachePath(projectPath)
    
    if (!existsSync(cachePath)) {
      cacheLogger.debug('缓存不存在:', projectPath)
      return null
    }
    
    const content = readFileSync(cachePath, 'utf-8')
    const cache: VersionCacheData = JSON.parse(content)
    
    // 检查是否过期
    if (Date.now() > cache.expiresAt) {
      cacheLogger.info('缓存已过期:', projectPath)
      return null
    }
    
    cacheLogger.info('从缓存读取版本信息:', projectPath, `(${Object.keys(cache.dependencies).length}个包)`)
    return cache.dependencies
  } catch (error) {
    cacheLogger.error('读取缓存失败:', error)
    return null
  }
}

/**
 * 写入缓存
 */
export function writeVersionCache(
  projectPath: string,
  dependencies: Record<string, string>
): void {
  try {
    ensureCacheDir()
    const cachePath = getCachePath(projectPath)
    
    const now = Date.now()
    const cache: VersionCacheData = {
      projectPath,
      dependencies,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    }
    
    writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8')
    cacheLogger.info('版本信息已缓存:', projectPath, `(${Object.keys(dependencies).length}个包)`)
  } catch (error) {
    cacheLogger.error('写入缓存失败:', error)
  }
}

/**
 * 清除指定项目的缓存
 */
export function clearVersionCache(projectPath: string): boolean {
  try {
    const cachePath = getCachePath(projectPath)
    
    if (existsSync(cachePath)) {
      const fs = require('fs')
      fs.unlinkSync(cachePath)
      cacheLogger.info('缓存已清除:', projectPath)
      return true
    }
    
    return false
  } catch (error) {
    cacheLogger.error('清除缓存失败:', error)
    return false
  }
}

/**
 * 清除所有缓存
 */
export function clearAllVersionCache(): number {
  try {
    ensureCacheDir()
    const fs = require('fs')
    const files = fs.readdirSync(CACHE_DIR)
    
    let count = 0
    files.forEach((file: string) => {
      if (file.endsWith('.json')) {
        fs.unlinkSync(join(CACHE_DIR, file))
        count++
      }
    })
    
    cacheLogger.info(`已清除 ${count} 个缓存文件`)
    return count
  } catch (error) {
    cacheLogger.error('清除所有缓存失败:', error)
    return 0
  }
}

/**
 * 获取缓存状态
 */
export function getCacheStatus(projectPath: string): {
  exists: boolean
  expired: boolean
  timestamp?: number
  expiresAt?: number
  packagesCount?: number
} {
  try {
    const cachePath = getCachePath(projectPath)
    
    if (!existsSync(cachePath)) {
      return { exists: false, expired: false }
    }
    
    const content = readFileSync(cachePath, 'utf-8')
    const cache: VersionCacheData = JSON.parse(content)
    
    const expired = Date.now() > cache.expiresAt
    
    return {
      exists: true,
      expired,
      timestamp: cache.timestamp,
      expiresAt: cache.expiresAt,
      packagesCount: Object.keys(cache.dependencies).length
    }
  } catch (error) {
    cacheLogger.error('获取缓存状态失败:', error)
    return { exists: false, expired: false }
  }
}

/**
 * 合并缓存和新数据
 * 优先使用新数据，缺失的从缓存补充
 */
export function mergeWithCache(
  projectPath: string,
  newData: Record<string, string>
): Record<string, string> {
  const cached = readVersionCache(projectPath)
  
  if (!cached) {
    return newData
  }
  
  // 合并：新数据优先，缓存补充
  return {
    ...cached,
    ...newData
  }
}
