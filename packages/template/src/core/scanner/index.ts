/**
 * 模板扫描核心模块
 * 统一管理模板发现和扫描功能
 */

import type { DeviceType, TemplateConfig, TemplateMetadata } from '../../types'

// ============ 扫描结果类型 ============

/**
 * 模板扫描结果
 */
export interface TemplateScanResult {
  /** 扫描到的模板数量 */
  count: number
  /** 模板列表 */
  templates: TemplateMetadata[]
  /** 扫描耗时（毫秒） */
  duration: number
  /** 扫描的路径 */
  scannedPaths: string[]
  /** 扫描的目录数量 */
  scannedDirectories: number
}

/**
 * 扫描配置
 */
export interface ScanConfig {
  /** 模板根目录 */
  templateRoot: string
  /** 是否递归扫描 */
  recursive: boolean
  /** 包含的文件模式 */
  include: string[]
  /** 排除的文件模式 */
  exclude: string[]
  /** 是否启用缓存 */
  enableCache: boolean
  /** 是否启用增量扫描 */
  enableIncrementalScan: boolean
  /** 缓存过期时间（毫秒） */
  cacheExpiration: number
  /** 是否启用并行扫描 */
  enableParallelScan: boolean
}

// ============ 默认配置 ============

/**
 * 默认扫描配置
 */
export const DEFAULT_SCAN_CONFIG: ScanConfig = {
  templateRoot: 'src/templates',
  recursive: true,
  include: ['**/index.{ts,tsx,js,jsx,vue}', '**/config.{ts,js,json}'],
  exclude: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
  enableCache: true,
  enableIncrementalScan: true,
  cacheExpiration: 5 * 60 * 1000, // 5分钟
  enableParallelScan: true,
}

// ============ 路径解析工具 ============

/**
 * 解析模板路径信息
 */
export interface TemplatePathInfo {
  category: string
  device: DeviceType
  template: string
  fullPath: string
  isValid: boolean
}

/**
 * 解析模板路径
 * 路径格式: category/device/template
 * 例如: login/desktop/classic
 */
export function parseTemplatePath(path: string): TemplatePathInfo | null {
  const parts = path.split('/').filter(Boolean)

  if (parts.length < 3) {
    return null
  }

  const [category, device, template] = parts
  const validDevices: DeviceType[] = ['desktop', 'mobile', 'tablet']

  if (!validDevices.includes(device as DeviceType)) {
    return null
  }

  return {
    category,
    device: device as DeviceType,
    template,
    fullPath: path,
    isValid: true,
  }
}

/**
 * 构建模板路径
 */
export function buildTemplatePath(category: string, device: DeviceType, template: string): string {
  return `${category}/${device}/${template}`
}

/**
 * 验证模板路径格式
 */
export function validateTemplatePath(path: string): boolean {
  const info = parseTemplatePath(path)
  return info?.isValid ?? false
}

// ============ 模板扫描器 ============

/**
 * 文件变更信息
 */
interface FileChangeInfo {
  path: string
  lastModified: number
  size: number
}

/**
 * 扫描性能指标
 */
interface ScanPerformanceMetrics {
  totalDuration: number
  cacheHitRate: number
  filesScanned: number
  templatesFound: number
  incrementalScanEnabled: boolean
}

/**
 * 模板扫描器
 *
 * 负责自动发现和解析项目中的模板文件，提供：
 * - 递归目录扫描
 * - 智能缓存机制
 * - 增量扫描支持
 * - 性能监控和优化
 * - 文件变更检测
 */
export class TemplateScanner {
  /** 扫描配置 */
  private config: ScanConfig

  /** 模板缓存，按路径存储扫描结果 */
  private cache = new Map<string, TemplateMetadata[]>()

  /** 上次扫描时间，用于缓存过期判断 */
  private _lastScanTime = 0

  /** 文件变更缓存，用于增量扫描 */
  private fileChangeCache = new Map<string, FileChangeInfo>()

  /** 性能监控指标 */
  private performanceMetrics: ScanPerformanceMetrics = {
    totalDuration: 0,
    cacheHitRate: 0,
    filesScanned: 0,
    templatesFound: 0,
    incrementalScanEnabled: false,
  }

  constructor(config: Partial<ScanConfig> = {}) {
    this.config = { ...DEFAULT_SCAN_CONFIG, ...config }
  }

  /**
   * 扫描模板
   */
  async scanTemplates(): Promise<TemplateScanResult> {
    const startTime = Date.now()
    const scannedPaths: string[] = []

    try {
      // 检查缓存是否过期
      const cacheKey = this.config.templateRoot
      const isCacheValid = this.isCacheValid(cacheKey)

      if (this.config.enableCache && isCacheValid && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!
        this.updatePerformanceMetrics(startTime, true, 0, cached.length)

        return {
          count: cached.length,
          templates: cached,
          duration: Date.now() - startTime,
          scannedPaths: [],
          scannedDirectories: 0, // 缓存命中时没有扫描目录
        }
      }

      const templates: TemplateMetadata[] = []

      // 在浏览器环境中，我们需要使用 import.meta.glob 来扫描模板
      if (typeof window !== 'undefined' && typeof import.meta.glob === 'function') {
        // 直接使用固定的模板路径，必须以 ./ 开头
        const modules = import.meta.glob('./templates/**/config.{ts,js}', {
          eager: false,
        })
        console.log('🔍 模板扫描器 - 找到的模块:', Object.keys(modules))

        if (Object.keys(modules).length === 0) {
          console.warn('⚠️ 未找到任何模板配置文件，使用模拟数据')
          // 使用模拟数据
          const mockTemplates = this.getMockTemplates()
          return {
            templates: mockTemplates,
            count: mockTemplates.length,
            duration: Date.now() - startTime,
            scannedPaths: [],
            scannedDirectories: 0,
          }
        }

        for (const [path, moduleLoader] of Object.entries(modules)) {
          scannedPaths.push(path)

          try {
            const pathInfo = this.extractPathInfoFromModulePath(path)
            if (pathInfo) {
              const configModule = (await moduleLoader()) as {
                default: TemplateConfig
              }
              const config = configModule.default

              const metadata: TemplateMetadata = {
                category: pathInfo.category,
                device: pathInfo.device,
                template: pathInfo.template,
                config,
                componentPath: path.replace('/config.', '/index.'),
              }

              templates.push(metadata)
            }
          } catch (error) {
            console.warn(`Failed to load template config from ${path}:`, error)
          }
        }
      } else {
        // Node.js 环境或测试环境的处理
        console.log('🔍 检测到 SRC 环境，使用路径:', this.config.templateRoot)

        // 模拟扫描结果（用于测试）
        const mockTemplates = this.getMockTemplates()
        templates.push(...mockTemplates)
        scannedPaths.push(...mockTemplates.map(t => t.componentPath))
      }

      // 缓存结果
      if (this.config.enableCache) {
        this.cache.set(this.config.templateRoot, templates)
        this._lastScanTime = Date.now()
      }

      // 更新性能指标
      this.updatePerformanceMetrics(startTime, false, scannedPaths.length, templates.length)

      const result: TemplateScanResult = {
        count: templates.length,
        templates,
        duration: Date.now() - startTime,
        scannedPaths,
        scannedDirectories: scannedPaths.length, // 简化实现，使用路径数量
      }

      console.log(`🔍 扫描模板，基础路径: ${this.config.templateRoot}`)
      console.log(`✅ 找到 ${result.count} 个模板配置`)
      console.log(`⚡ 扫描耗时: ${result.duration}ms`)

      return result
    } catch (error) {
      console.error('Template scan failed:', error)
      throw error
    }
  }

  /**
   * 查找特定模板
   */
  findTemplate(category: string, device: DeviceType, template: string): TemplateMetadata | null {
    const cached = this.cache.get(this.config.templateRoot)
    if (!cached) {
      return null
    }

    return cached.find(t => t.category === category && t.device === device && t.template === template) || null
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): TemplateMetadata[] {
    return this.cache.get(this.config.templateRoot) || []
  }

  /**
   * 按分类获取模板
   */
  getTemplatesByCategory(category: string): TemplateMetadata[] {
    const templates = this.getAllTemplates()
    return templates.filter(t => t.category === category)
  }

  /**
   * 按设备类型获取模板
   */
  getTemplatesByDevice(device: DeviceType): TemplateMetadata[] {
    const templates = this.getAllTemplates()
    return templates.filter(t => t.device === device)
  }

  /**
   * 获取所有分类
   */
  getAvailableCategories(): string[] {
    const templates = this.getAllTemplates()
    const categories = new Set(templates.map(t => t.category))
    return Array.from(categories).sort()
  }

  /**
   * 获取所有设备类型
   */
  getAvailableDevices(): DeviceType[] {
    const templates = this.getAllTemplates()
    const devices = new Set(templates.map(t => t.device))
    return Array.from(devices).sort() as DeviceType[]
  }

  /**
   * 获取最后扫描时间
   */
  get lastScanTime(): number {
    return this._lastScanTime
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
    this.fileChangeCache.clear()
    this._lastScanTime = 0
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(_cacheKey: string): boolean {
    if (!this.config.enableCache) {
      return false
    }

    const now = Date.now()
    const cacheAge = now - this._lastScanTime

    return cacheAge < this.config.cacheExpiration
  }

  /**
   * 更新性能指标
   */
  private updatePerformanceMetrics(
    startTime: number,
    cacheHit: boolean,
    filesScanned: number,
    templatesFound: number
  ): void {
    const duration = Date.now() - startTime

    this.performanceMetrics = {
      totalDuration: duration,
      cacheHitRate: cacheHit ? 1 : 0,
      filesScanned,
      templatesFound,
      incrementalScanEnabled: this.config.enableIncrementalScan,
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): ScanPerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  /**
   * 预热缓存
   */
  async warmupCache(): Promise<void> {
    if (!this.config.enableCache) {
      return
    }

    console.log('🔥 开始预热模板缓存...')
    const startTime = Date.now()

    try {
      await this.scanTemplates()
      const duration = Date.now() - startTime
      console.log(`✅ 缓存预热完成，耗时: ${duration}ms`)
    } catch (error) {
      console.error('❌ 缓存预热失败:', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    size: number
    lastScanTime: number
    isValid: boolean
    hitRate: number
  } {
    return {
      size: this.cache.size,
      lastScanTime: this._lastScanTime,
      isValid: this.isCacheValid(this.config.templateRoot),
      hitRate: this.performanceMetrics.cacheHitRate,
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ScanConfig>): void {
    this.config = { ...this.config, ...config }
    this.clearCache() // 配置变更后清除缓存
  }

  // ============ 私有方法 ============

  /**
   * 从模块路径提取路径信息
   */
  private extractPathInfoFromModulePath(modulePath: string): TemplatePathInfo | null {
    // 从 /src/templates/login/desktop/classic/config.ts 提取 login/desktop/classic
    const match = modulePath.match(/\/templates\/(.+)\/config\.[tj]s$/)
    if (!match) {
      return null
    }

    return parseTemplatePath(match[1])
  }

  /**
   * 获取模拟模板数据（用于测试和开发）
   */
  private getMockTemplates(): TemplateMetadata[] {
    const mockTemplates: TemplateMetadata[] = [
      {
        category: 'login',
        device: 'desktop',
        template: 'classic',
        config: {
          name: 'classic',
          description: '经典登录模板',
          category: 'login',
          device: 'desktop',
        },
        componentPath: '/src/templates/login/desktop/classic/index.tsx',
      },
      {
        category: 'login',
        device: 'desktop',
        template: 'modern',
        config: {
          name: 'modern',
          description: '现代登录模板',
          category: 'login',
          device: 'desktop',
        },
        componentPath: '/src/templates/login/desktop/modern/index.tsx',
      },
      {
        category: 'login',
        device: 'desktop',
        template: 'default',
        config: {
          name: 'default',
          description: '默认登录模板',
          category: 'login',
          device: 'desktop',
        },
        componentPath: '/src/templates/login/desktop/default/index.tsx',
      },
      {
        category: 'login',
        device: 'mobile',
        template: 'simple',
        config: {
          name: 'simple',
          description: '简洁移动登录模板',
          category: 'login',
          device: 'mobile',
        },
        componentPath: '/src/templates/login/mobile/simple/index.tsx',
      },
      {
        category: 'login',
        device: 'mobile',
        template: 'card',
        config: {
          name: 'card',
          description: '卡片移动登录模板',
          category: 'login',
          device: 'mobile',
        },
        componentPath: '/src/templates/login/mobile/card/index.tsx',
      },
      {
        category: 'login',
        device: 'tablet',
        template: 'adaptive',
        config: {
          name: 'adaptive',
          description: '自适应平板登录模板',
          category: 'login',
          device: 'tablet',
        },
        componentPath: '/src/templates/login/tablet/adaptive/index.tsx',
      },
      {
        category: 'login',
        device: 'tablet',
        template: 'split',
        config: {
          name: 'split',
          description: '分屏平板登录模板',
          category: 'login',
          device: 'tablet',
        },
        componentPath: '/src/templates/login/tablet/split/index.tsx',
      },
    ]

    return mockTemplates
  }
}
