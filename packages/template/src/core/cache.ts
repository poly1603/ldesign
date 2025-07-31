/**
 * 模板缓存管理器
 */

import type { DeviceType } from './device'

export interface TemplateCache {
  [category: string]: {
    [device: string]: string // variant
  }
}

const CACHE_KEY = 'ldesign-template-cache'
const CACHE_VERSION = '1.0.0'

interface CacheData {
  version: string
  timestamp: number
  templates: TemplateCache
}

/**
 * 获取缓存数据
 */
function getCacheData(): CacheData | null {
  if (typeof localStorage === 'undefined') return null

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const data: CacheData = JSON.parse(cached)
    
    // 检查版本兼容性
    if (data.version !== CACHE_VERSION) {
      clearCache()
      return null
    }

    // 检查缓存是否过期（30天）
    const now = Date.now()
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30天
    if (now - data.timestamp > maxAge) {
      clearCache()
      return null
    }

    return data
  } catch (error) {
    console.warn('Failed to parse template cache:', error)
    clearCache()
    return null
  }
}

/**
 * 保存缓存数据
 */
function setCacheData(templates: TemplateCache): void {
  if (typeof localStorage === 'undefined') return

  try {
    const data: CacheData = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      templates
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save template cache:', error)
  }
}

/**
 * 获取用户选择的模板
 */
export function getCachedTemplate(
  category: string,
  device: DeviceType
): string | null {
  const cacheData = getCacheData()
  if (!cacheData) return null

  const categoryCache = cacheData.templates[category]
  if (!categoryCache) return null

  return categoryCache[device] || null
}

/**
 * 缓存用户选择的模板
 */
export function setCachedTemplate(
  category: string,
  device: DeviceType,
  variant: string
): void {
  const cacheData = getCacheData()
  const templates = cacheData?.templates || {}

  if (!templates[category]) {
    templates[category] = {}
  }

  templates[category][device] = variant
  setCacheData(templates)
}

/**
 * 获取所有缓存的模板选择
 */
export function getAllCachedTemplates(): TemplateCache {
  const cacheData = getCacheData()
  return cacheData?.templates || {}
}

/**
 * 清除特定分类的缓存
 */
export function clearCategoryCache(category: string): void {
  const cacheData = getCacheData()
  if (!cacheData) return

  delete cacheData.templates[category]
  setCacheData(cacheData.templates)
}

/**
 * 清除特定设备类型的缓存
 */
export function clearDeviceCache(device: DeviceType): void {
  const cacheData = getCacheData()
  if (!cacheData) return

  Object.keys(cacheData.templates).forEach(category => {
    delete cacheData.templates[category][device]
  })

  setCacheData(cacheData.templates)
}

/**
 * 清除所有缓存
 */
export function clearCache(): void {
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.warn('Failed to clear template cache:', error)
  }
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): {
  totalEntries: number
  categories: string[]
  devices: DeviceType[]
  lastUpdated: Date | null
  cacheSize: number
} {
  const cacheData = getCacheData()
  
  if (!cacheData) {
    return {
      totalEntries: 0,
      categories: [],
      devices: [],
      lastUpdated: null,
      cacheSize: 0
    }
  }

  const categories = Object.keys(cacheData.templates)
  const devices = new Set<DeviceType>()
  let totalEntries = 0

  categories.forEach(category => {
    const categoryCache = cacheData.templates[category]
    Object.keys(categoryCache).forEach(device => {
      devices.add(device as DeviceType)
      totalEntries++
    })
  })

  const cacheSize = typeof localStorage !== 'undefined' 
    ? (localStorage.getItem(CACHE_KEY)?.length || 0) * 2 // 估算字节数
    : 0

  return {
    totalEntries,
    categories,
    devices: Array.from(devices),
    lastUpdated: new Date(cacheData.timestamp),
    cacheSize
  }
}

/**
 * 导出缓存数据
 */
export function exportCache(): string {
  const cacheData = getCacheData()
  return JSON.stringify(cacheData, null, 2)
}

/**
 * 导入缓存数据
 */
export function importCache(data: string): boolean {
  try {
    const parsed: CacheData = JSON.parse(data)
    
    // 验证数据结构
    if (!parsed.version || !parsed.timestamp || !parsed.templates) {
      throw new Error('Invalid cache data structure')
    }

    setCacheData(parsed.templates)
    return true
  } catch (error) {
    console.warn('Failed to import cache data:', error)
    return false
  }
}

/**
 * 检查缓存是否可用
 */
export function isCacheAvailable(): boolean {
  return typeof localStorage !== 'undefined'
}

/**
 * 预热缓存（设置默认值）
 */
export function warmupCache(defaults: TemplateCache): void {
  const cacheData = getCacheData()
  if (cacheData) return // 已有缓存，不需要预热

  setCacheData(defaults)
}
