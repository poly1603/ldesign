/**
 * Web环境专用的模板扫描器
 * 
 * 这个版本专门为浏览器环境设计，不依赖Node.js的文件系统API
 * 使用预定义的模板列表和动态导入来管理模板
 */

import type { DeviceType, TemplateMetadata, TemplateIndex } from '../types/template'
import type { ScanResult, ScanStats, ScanError } from '../scanner/types'

/**
 * Web环境模板扫描器配置
 */
export interface WebTemplateScannerOptions {
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 预定义的模板列表 */
  predefinedTemplates?: PredefinedTemplate[]
}

/**
 * 预定义模板信息
 */
export interface PredefinedTemplate {
  category: string
  device: DeviceType
  name: string
  displayName: string
  description: string
  version: string
  author: string
  tags: string[]
  componentPath: string
  stylePath?: string
  configPath?: string
  isDefault?: boolean
}

/**
 * Web环境模板扫描器
 * 
 * 专门为浏览器环境设计，不使用文件系统API
 */
export class WebTemplateScanner {
  private options: Required<WebTemplateScannerOptions>
  private templateIndex: TemplateIndex = new Map()
  private scanCache = new Map<string, TemplateMetadata>()

  constructor(options: WebTemplateScannerOptions = {}) {
    this.options = {
      enableCache: options.enableCache ?? true,
      predefinedTemplates: options.predefinedTemplates ?? this.getDefaultTemplates(),
    }
  }

  /**
   * 获取默认模板列表
   */
  private getDefaultTemplates(): PredefinedTemplate[] {
    return [
      // 登录模板 - 桌面端
      {
        category: 'login',
        device: 'desktop',
        name: 'default',
        displayName: '默认登录模板',
        description: '简洁优雅的默认登录模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['default', 'simple', 'clean'],
        componentPath: '../templates/login/desktop/default/index.vue',
        stylePath: '../templates/login/desktop/default/style.less',
        configPath: '../templates/login/desktop/default/config.ts',
        isDefault: true,
      },
      {
        category: 'login',
        device: 'desktop',
        name: 'modern',
        displayName: '现代登录模板',
        description: '现代化设计的登录模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['modern', 'stylish', 'gradient'],
        componentPath: '../templates/login/desktop/modern/index.vue',
        stylePath: '../templates/login/desktop/modern/style.less',
        configPath: '../templates/login/desktop/modern/config.ts',
      },
      {
        category: 'login',
        device: 'desktop',
        name: 'creative',
        displayName: '创意登录模板',
        description: '富有创意的登录模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['creative', 'artistic', 'unique'],
        componentPath: '../templates/login/desktop/creative/index.vue',
        stylePath: '../templates/login/desktop/creative/style.less',
        configPath: '../templates/login/desktop/creative/config.ts',
      },
      // 登录模板 - 平板端
      {
        category: 'login',
        device: 'tablet',
        name: 'default',
        displayName: '平板登录模板',
        description: '适配平板设备的登录模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['default', 'tablet', 'responsive'],
        componentPath: '../templates/login/tablet/default/index.vue',
        stylePath: '../templates/login/tablet/default/style.less',
        configPath: '../templates/login/tablet/default/config.ts',
        isDefault: true,
      },
      // 登录模板 - 移动端
      {
        category: 'login',
        device: 'mobile',
        name: 'default',
        displayName: '移动登录模板',
        description: '适配移动设备的登录模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['default', 'mobile', 'responsive'],
        componentPath: '../templates/login/mobile/default/index.vue',
        stylePath: '../templates/login/mobile/default/style.less',
        configPath: '../templates/login/mobile/default/config.ts',
        isDefault: true,
      },
      // 仪表板模板 - 桌面端
      {
        category: 'dashboard',
        device: 'desktop',
        name: 'default',
        displayName: '默认仪表板模板',
        description: '简洁的默认仪表板模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['default', 'dashboard', 'clean'],
        componentPath: '../templates/dashboard/desktop/default/index.vue',
        stylePath: '../templates/dashboard/desktop/default/style.less',
        configPath: '../templates/dashboard/desktop/default/config.ts',
        isDefault: true,
      },
      {
        category: 'dashboard',
        device: 'desktop',
        name: 'modern',
        displayName: '现代仪表板模板',
        description: '现代化的仪表板模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['modern', 'dashboard', 'stylish'],
        componentPath: '../templates/dashboard/desktop/modern/index.vue',
        stylePath: '../templates/dashboard/desktop/modern/style.less',
        configPath: '../templates/dashboard/desktop/modern/config.ts',
      },
      {
        category: 'dashboard',
        device: 'desktop',
        name: 'minimal',
        displayName: '极简仪表板模板',
        description: '极简风格的仪表板模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['minimal', 'dashboard', 'clean'],
        componentPath: '../templates/dashboard/desktop/minimal/index.vue',
        stylePath: '../templates/dashboard/desktop/minimal/style.less',
        configPath: '../templates/dashboard/desktop/minimal/config.ts',
      },
      {
        category: 'dashboard',
        device: 'desktop',
        name: 'classic',
        displayName: '经典仪表板模板',
        description: '经典风格的仪表板模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['classic', 'dashboard', 'traditional'],
        componentPath: '../templates/dashboard/desktop/classic/index.vue',
        stylePath: '../templates/dashboard/desktop/classic/style.less',
        configPath: '../templates/dashboard/desktop/classic/config.ts',
      },
      // 仪表板模板 - 平板端
      {
        category: 'dashboard',
        device: 'tablet',
        name: 'default',
        displayName: '平板仪表板模板',
        description: '适配平板设备的仪表板模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['default', 'tablet', 'dashboard'],
        componentPath: '../templates/dashboard/tablet/default/index.vue',
        stylePath: '../templates/dashboard/tablet/default/style.less',
        configPath: '../templates/dashboard/tablet/default/config.ts',
        isDefault: true,
      },
      {
        category: 'dashboard',
        device: 'tablet',
        name: 'modern',
        displayName: '现代平板仪表板模板',
        description: '现代化的平板仪表板模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['modern', 'tablet', 'dashboard'],
        componentPath: '../templates/dashboard/tablet/modern/index.vue',
        stylePath: '../templates/dashboard/tablet/modern/style.less',
        configPath: '../templates/dashboard/tablet/modern/config.ts',
      },
      // 仪表板模板 - 移动端
      {
        category: 'dashboard',
        device: 'mobile',
        name: 'default',
        displayName: '移动仪表板模板',
        description: '适配移动设备的仪表板模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['default', 'mobile', 'dashboard'],
        componentPath: '../templates/dashboard/mobile/default/index.vue',
        stylePath: '../templates/dashboard/mobile/default/style.less',
        configPath: '../templates/dashboard/mobile/default/config.ts',
        isDefault: true,
      },
      {
        category: 'dashboard',
        device: 'mobile',
        name: 'modern',
        displayName: '现代移动仪表板模板',
        description: '现代化的移动仪表板模板',
        version: '1.0.0',
        author: '@ldesign/template',
        tags: ['modern', 'mobile', 'dashboard'],
        componentPath: '../templates/dashboard/mobile/modern/index.vue',
        stylePath: '../templates/dashboard/mobile/modern/style.less',
        configPath: '../templates/dashboard/mobile/modern/config.ts',
      },
    ]
  }

  /**
   * 扫描模板
   * 
   * 在Web环境中，直接使用预定义的模板列表
   */
  async scan(): Promise<ScanResult> {
    const startTime = Date.now()
    const errors: ScanError[] = []
    
    // 清空之前的索引
    this.templateIndex.clear()

    try {
      // 处理预定义模板
      for (const template of this.options.predefinedTemplates) {
        const metadata: TemplateMetadata = {
          name: template.name,
          displayName: template.displayName,
          description: template.description,
          version: template.version,
          author: template.author,
          tags: template.tags,
          category: template.category,
          device: template.device,
          componentPath: template.componentPath,
          stylePath: template.stylePath,
          configPath: template.configPath ?? `../templates/${template.category}/${template.device}/${template.name}/config.ts`,
          lastModified: Date.now(),
          isBuiltIn: true,
          isDefault: template.isDefault ?? false,
        }

        this.addToIndex(metadata)

        // 缓存处理
        if (this.options.enableCache) {
          const cacheKey = `${template.category}-${template.device}-${template.name}`
          this.scanCache.set(cacheKey, metadata)
        }
      }

      // 计算统计信息
      const stats = this.calculateStats()
      stats.scanTime = Date.now() - startTime

      return {
        templates: this.templateIndex,
        stats,
        errors,
      }
    }
    catch (error) {
      const scanError: ScanError = {
        type: 'VALIDATION_ERROR',
        message: `Web扫描失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filePath: 'web-scanner',
        details: error,
      }
      errors.push(scanError)

      return {
        templates: this.templateIndex,
        stats: this.calculateStats(),
        errors,
      }
    }
  }

  /**
   * 添加模板到索引
   */
  private addToIndex(metadata: TemplateMetadata): void {
    const { category, device, name } = metadata

    if (!this.templateIndex.has(category)) {
      this.templateIndex.set(category, new Map())
    }

    const categoryMap = this.templateIndex.get(category)!
    if (!categoryMap.has(device)) {
      categoryMap.set(device, new Map())
    }

    const deviceMap = categoryMap.get(device)!
    deviceMap.set(name, metadata)
  }

  /**
   * 计算统计信息
   */
  private calculateStats(): ScanStats {
    const stats: ScanStats = {
      totalTemplates: 0,
      byCategory: {},
      byDevice: { desktop: 0, tablet: 0, mobile: 0 },
      scanTime: 0,
      lastScanTime: Date.now(),
    }

    for (const [category, deviceMap] of this.templateIndex) {
      let categoryCount = 0

      for (const [device, templateMap] of deviceMap) {
        const deviceCount = templateMap.size
        categoryCount += deviceCount
        stats.byDevice[device] += deviceCount
      }

      stats.byCategory[category] = categoryCount
      stats.totalTemplates += categoryCount
    }

    return stats
  }

  /**
   * 获取模板索引
   */
  getTemplateIndex(): TemplateIndex {
    return this.templateIndex
  }

  /**
   * 获取指定分类和设备的模板列表
   */
  getTemplates(category: string, device: DeviceType): TemplateMetadata[] {
    const categoryMap = this.templateIndex.get(category)
    if (!categoryMap) return []

    const deviceMap = categoryMap.get(device)
    if (!deviceMap) return []

    return Array.from(deviceMap.values())
  }

  /**
   * 获取指定模板
   */
  getTemplate(category: string, device: DeviceType, templateName: string): TemplateMetadata | null {
    const templates = this.getTemplates(category, device)
    return templates.find(t => t.name === templateName) || null
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): TemplateMetadata[] {
    const templates: TemplateMetadata[] = []

    for (const categoryMap of this.templateIndex.values()) {
      for (const deviceMap of categoryMap.values()) {
        for (const template of deviceMap.values()) {
          templates.push(template)
        }
      }
    }

    return templates
  }

  /**
   * 按分类获取模板
   */
  getTemplatesByCategory(category: string): TemplateMetadata[] {
    const categoryMap = this.templateIndex.get(category)
    if (!categoryMap) return []

    const templates: TemplateMetadata[] = []
    for (const deviceMap of categoryMap.values()) {
      for (const template of deviceMap.values()) {
        templates.push(template)
      }
    }

    return templates
  }

  /**
   * 按设备类型获取模板
   */
  getTemplatesByDevice(device: DeviceType): TemplateMetadata[] {
    const templates: TemplateMetadata[] = []

    for (const categoryMap of this.templateIndex.values()) {
      const deviceMap = categoryMap.get(device)
      if (deviceMap) {
        for (const template of deviceMap.values()) {
          templates.push(template)
        }
      }
    }

    return templates
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.scanCache.clear()
  }

  /**
   * 添加自定义模板
   */
  addCustomTemplate(template: PredefinedTemplate): void {
    const metadata: TemplateMetadata = {
      name: template.name,
      displayName: template.displayName,
      description: template.description,
      version: template.version,
      author: template.author,
      tags: template.tags,
      category: template.category,
      device: template.device,
      componentPath: template.componentPath,
      stylePath: template.stylePath,
      configPath: template.configPath ?? `../templates/${template.category}/${template.device}/${template.name}/config.ts`,
      lastModified: Date.now(),
      isBuiltIn: false,
      isDefault: template.isDefault ?? false,
    }

    this.addToIndex(metadata)

    // 缓存处理
    if (this.options.enableCache) {
      const cacheKey = `${template.category}-${template.device}-${template.name}`
      this.scanCache.set(cacheKey, metadata)
    }
  }

  /**
   * 移除自定义模板
   */
  removeCustomTemplate(category: string, device: DeviceType, templateName: string): boolean {
    const categoryMap = this.templateIndex.get(category)
    if (!categoryMap) return false

    const deviceMap = categoryMap.get(device)
    if (!deviceMap) return false

    const template = deviceMap.get(templateName)
    if (!template || template.isBuiltIn) return false

    deviceMap.delete(templateName)

    // 如果设备映射为空，删除设备映射
    if (deviceMap.size === 0) {
      categoryMap.delete(device)
    }

    // 如果分类映射为空，删除分类映射
    if (categoryMap.size === 0) {
      this.templateIndex.delete(category)
    }

    // 清除相关缓存
    const cacheKey = `${category}-${device}-${templateName}`
    this.scanCache.delete(cacheKey)

    return true
  }
}

/**
 * 创建Web环境模板扫描器
 */
export function createWebTemplateScanner(options?: WebTemplateScannerOptions): WebTemplateScanner {
  return new WebTemplateScanner(options)
}
