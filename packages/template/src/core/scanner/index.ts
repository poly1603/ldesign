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
 * 模板扫描器类
 */
export class TemplateScanner {
  private config: ScanConfig
  private cache = new Map<string, TemplateMetadata[]>()
  private _lastScanTime = 0

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
      // 检查缓存
      if (this.config.enableCache && this.cache.has(this.config.templateRoot)) {
        const cached = this.cache.get(this.config.templateRoot)!
        return {
          count: cached.length,
          templates: cached,
          duration: Date.now() - startTime,
          scannedPaths: [],
        }
      }

      const templates: TemplateMetadata[] = []

      // 在浏览器环境中，我们需要使用 import.meta.glob 来扫描模板
      if (typeof window !== 'undefined' && typeof import.meta.glob === 'function') {
        const modules = import.meta.glob('/src/templates/**/config.{ts,js}', { eager: false })

        for (const [path, moduleLoader] of Object.entries(modules)) {
          scannedPaths.push(path)

          try {
            const pathInfo = this.extractPathInfoFromModulePath(path)
            if (pathInfo) {
              const configModule = await moduleLoader() as { default: TemplateConfig }
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
          }
          catch (error) {
            console.warn(`Failed to load template config from ${path}:`, error)
          }
        }
      }
      else {
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

      const result: TemplateScanResult = {
        count: templates.length,
        templates,
        duration: Date.now() - startTime,
        scannedPaths,
      }

      console.log(`🔍 扫描模板，基础路径: ${this.config.templateRoot}`)
      console.log(`✅ 找到 ${result.count} 个模板配置`)

      return result
    }
    catch (error) {
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

    return cached.find(t =>
      t.category === category &&
      t.device === device &&
      t.template === template
    ) || null
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
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
    this._lastScanTime = 0
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
