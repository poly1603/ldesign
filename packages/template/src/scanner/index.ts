/**
 * 模板扫描器
 * 
 * 使用 import.meta.glob 递归扫描模板目录，建立完整的模板索引
 */

import type {
  TemplateConfig,
  TemplateMetadata,
  TemplateIndex,
  DeviceType
} from '../types/template'
import type {
  ScannerOptions,
  ScanResult,
  ScanStats,
  ScanError,
  ScannerEventCallbacks
} from './types'

/**
 * 模板扫描器类
 */
export class TemplateScanner {
  private options: Required<ScannerOptions>
  private templateIndex: TemplateIndex = new Map()
  private callbacks: ScannerEventCallbacks = {}
  private scanCache = new Map<string, TemplateMetadata>()
  private lastScanTime = 0

  constructor(options: ScannerOptions, callbacks?: ScannerEventCallbacks) {
    this.options = {
      templatesDir: 'src/templates',
      enableCache: true,
      enableHMR: false,
      maxDepth: 5,
      includeExtensions: ['.vue', '.tsx', '.js', '.ts'],
      excludePatterns: ['node_modules', '.git', 'dist'],
      ...options
    }
    this.callbacks = callbacks || {}
  }

  /**
   * 扫描模板目录
   */
  async scan(): Promise<ScanResult> {
    const startTime = Date.now()
    this.callbacks.onScanStart?.()

    const errors: ScanError[] = []
    const stats: ScanStats = {
      totalTemplates: 0,
      byCategory: {},
      byDevice: { desktop: 0, tablet: 0, mobile: 0 },
      scanTime: 0,
      lastScanTime: startTime
    }

    try {
      // 清空之前的索引
      this.templateIndex.clear()

      // 1. 扫描内置模板
      await this.scanBuiltInTemplates(errors)

      // 2. 扫描用户自定义模板
      await this.scanUserTemplates(errors)

      // 计算统计信息
      this.calculateStats(stats)
      stats.scanTime = Date.now() - startTime
      this.lastScanTime = startTime

      const result: ScanResult = {
        templates: this.templateIndex,
        stats,
        errors
      }

      this.callbacks.onScanComplete?.(result)
      return result

    } catch (error) {
      const scanError: ScanError = {
        type: 'VALIDATION_ERROR',
        message: `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filePath: this.options.templatesDir,
        details: error
      }
      errors.push(scanError)
      this.callbacks.onScanError?.(scanError)

      return {
        templates: this.templateIndex,
        stats,
        errors
      }
    }
  }

  /**
   * 扫描内置模板
   */
  private async scanBuiltInTemplates(errors: ScanError[]): Promise<void> {
    try {
      // 使用 import.meta.glob 扫描内置模板配置文件
      // Vite 要求使用字面量字符串，所以我们尝试多个可能的路径
      let configModules: Record<string, () => Promise<any>> = {}

      // 尝试不同的 glob 模式（必须使用字面量）
      try {
        configModules = import.meta.glob('/src/templates/**/config.{js,ts}', { eager: false })
        if (Object.keys(configModules).length > 0) {
          console.log(`[TemplateScanner] Found ${Object.keys(configModules).length} config files with pattern: /src/templates/**/config.{js,ts}`)
        }
      } catch (error) {
        // 继续尝试其他模式
      }

      if (Object.keys(configModules).length === 0) {
        try {
          configModules = import.meta.glob('../src/templates/**/config.{js,ts}', { eager: false })
          if (Object.keys(configModules).length > 0) {
            console.log(`[TemplateScanner] Found ${Object.keys(configModules).length} config files with pattern: ../src/templates/**/config.{js,ts}`)
          }
        } catch (error) {
          // 继续尝试其他模式
        }
      }

      if (Object.keys(configModules).length === 0) {
        try {
          configModules = import.meta.glob('../../src/templates/**/config.{js,ts}', { eager: false })
          if (Object.keys(configModules).length > 0) {
            console.log(`[TemplateScanner] Found ${Object.keys(configModules).length} config files with pattern: ../../src/templates/**/config.{js,ts}`)
          }
        } catch (error) {
          // 继续尝试其他模式
        }
      }

      // 如果没有找到配置文件，使用直接扫描方式
      if (Object.keys(configModules).length === 0) {
        console.warn('[TemplateScanner] No config files found with glob patterns, using direct template scanning...')
        await this.scanDirectTemplates(errors)
        return
      }

      // 处理每个配置文件
      for (const [configPath, moduleLoader] of Object.entries(configModules)) {
        try {
          await this.processConfigFile(configPath, moduleLoader, errors, true)
        } catch (error) {
          errors.push({
            type: 'CONFIG_PARSE_ERROR',
            message: `Failed to process built-in config file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath: configPath,
            details: error
          })
        }
      }
    } catch (error) {
      // 如果无法扫描内置模板，记录错误但继续扫描
      errors.push({
        type: 'VALIDATION_ERROR',
        message: `Failed to scan built-in templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filePath: 'src/templates',
        details: error
      })
    }
  }

  /**
   * 直接扫描已知模板（备用方案）
   */
  private async scanDirectTemplates(errors: ScanError[]): Promise<void> {
    const knownTemplates = [
      {
        category: 'login',
        device: 'desktop' as DeviceType,
        templates: ['default', 'modern', 'creative']
      },
      {
        category: 'login',
        device: 'tablet' as DeviceType,
        templates: ['default']
      },
      {
        category: 'login',
        device: 'mobile' as DeviceType,
        templates: ['default']
      }
    ]

    for (const { category, device, templates } of knownTemplates) {
      for (const templateName of templates) {
        try {
          // 创建模板元数据
          const metadata: TemplateMetadata = {
            name: templateName,
            displayName: this.getDisplayName(category, device, templateName),
            description: this.getDescription(category, device, templateName),
            version: '1.0.0',
            author: '@ldesign/template',
            tags: this.getTags(templateName),
            category,
            device,
            componentPath: `../src/templates/${category}/${device}/${templateName}/index.vue`,
            stylePath: `../src/templates/${category}/${device}/${templateName}/style.less`,
            configPath: `../src/templates/${category}/${device}/${templateName}/config.ts`,
            lastModified: Date.now(),
            isBuiltIn: true,
            isDefault: templateName === 'default'
          }

          // 添加到索引
          this.addToIndex(metadata)

          // 缓存处理
          if (this.options.enableCache) {
            this.scanCache.set(`${category}-${device}-${templateName}`, metadata)
          }

        } catch (error) {
          errors.push({
            type: 'CONFIG_PARSE_ERROR',
            message: `Failed to process direct template ${category}/${device}/${templateName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath: `src/templates/${category}/${device}/${templateName}`,
            details: error
          })
        }
      }
    }
  }

  /**
   * 获取模板显示名称
   */
  private getDisplayName(category: string, device: DeviceType, templateName: string): string {
    const displayNames: Record<string, string> = {
      'login-desktop-default': '默认登录模板',
      'login-desktop-modern': '现代登录模板',
      'login-desktop-creative': '创意登录模板',
      'login-tablet-default': '平板登录模板',
      'login-mobile-default': '移动登录模板'
    }
    return displayNames[`${category}-${device}-${templateName}`] || `${templateName} ${category} 模板`
  }

  /**
   * 获取模板描述
   */
  private getDescription(category: string, device: DeviceType, templateName: string): string {
    const descriptions: Record<string, string> = {
      'login-desktop-default': '简洁优雅的默认登录模板',
      'login-desktop-modern': '现代化设计的登录模板',
      'login-desktop-creative': '富有创意的登录模板',
      'login-tablet-default': '适配平板设备的登录模板',
      'login-mobile-default': '适配移动设备的登录模板'
    }
    return descriptions[`${category}-${device}-${templateName}`] || `${templateName} ${category} 模板`
  }

  /**
   * 获取模板标签
   */
  private getTags(templateName: string): string[] {
    const tagMap: Record<string, string[]> = {
      'default': ['default', 'simple', 'clean'],
      'modern': ['modern', 'stylish', 'gradient'],
      'creative': ['creative', 'artistic', 'unique']
    }
    return tagMap[templateName] || [templateName]
  }

  /**
   * 扫描用户自定义模板
   */
  private async scanUserTemplates(errors: ScanError[]): Promise<void> {
    try {
      // 使用 import.meta.glob 扫描用户配置文件（Vite 要求字面量字符串）
      const configModules = import.meta.glob('/src/templates/**/config.{js,ts}', { eager: false })

      // 处理每个配置文件
      for (const [configPath, moduleLoader] of Object.entries(configModules)) {
        try {
          await this.processConfigFile(configPath, moduleLoader, errors, false)
        } catch (error) {
          errors.push({
            type: 'CONFIG_PARSE_ERROR',
            message: `Failed to process user config file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath: configPath,
            details: error
          })
        }
      }
    } catch (error) {
      errors.push({
        type: 'VALIDATION_ERROR',
        message: `Failed to scan user templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filePath: this.options.templatesDir,
        details: error
      })
    }
  }

  /**
   * 处理模板文件（配置文件和组件文件）
   */
  private async processTemplateFiles(
    configPath: string,
    configLoader: () => Promise<any>,
    componentLoader: () => Promise<any>,
    errors: ScanError[],
    isBuiltIn: boolean = false
  ): Promise<void> {
    try {
      // 解析路径结构: /src/templates/{category}/{device}/{templateName}/config.js
      const pathParts = configPath.split('/')
      const configIndex = pathParts.findIndex(part => part === 'config.js' || part === 'config.ts')

      if (configIndex < 3) {
        throw new Error('Invalid template directory structure')
      }

      const templateName = pathParts[configIndex - 1]
      const device = pathParts[configIndex - 2] as DeviceType
      const category = pathParts[configIndex - 3]

      // 验证设备类型
      if (!['desktop', 'tablet', 'mobile'].includes(device)) {
        throw new Error(`Invalid device type: ${device}`)
      }

      // 加载配置文件
      const configModule = await configLoader()
      const config: TemplateConfig = configModule.default || configModule

      // 验证配置
      this.validateConfig(config, configPath)

      // 构建组件路径
      const basePath = configPath.replace(/\/config\.(js|ts)$/, '')
      const componentPath = `${basePath}/index.vue`
      const stylePath = `${basePath}/style.less`

      // 创建模板元数据
      const metadata: TemplateMetadata = {
        ...config,
        category,
        device,
        componentPath,
        componentLoader, // 添加组件加载器
        stylePath,
        configPath,
        lastModified: Date.now(),
        isBuiltIn
      }

      // 添加到索引
      this.addToIndex(metadata)

      // 缓存处理
      if (this.options.enableCache) {
        this.scanCache.set(configPath, metadata)
      }

    } catch (error) {
      errors.push({
        type: 'CONFIG_PARSE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        filePath: configPath,
        details: error
      })
    }
  }

  /**
   * 处理单个配置文件（兼容性方法）
   */
  private async processConfigFile(
    configPath: string,
    moduleLoader: () => Promise<any>,
    errors: ScanError[],
    isBuiltIn: boolean = false
  ): Promise<void> {
    try {
      // 解析路径结构: /src/templates/{category}/{device}/{templateName}/config.js
      const pathParts = configPath.split('/')
      const configIndex = pathParts.findIndex(part => part === 'config.js' || part === 'config.ts')

      if (configIndex < 3) {
        throw new Error('Invalid template directory structure')
      }

      const templateName = pathParts[configIndex - 1]
      const device = pathParts[configIndex - 2] as DeviceType
      const category = pathParts[configIndex - 3]

      // 验证设备类型
      if (!['desktop', 'tablet', 'mobile'].includes(device)) {
        throw new Error(`Invalid device type: ${device}`)
      }

      // 加载配置文件
      const configModule = await moduleLoader()
      const config: TemplateConfig = configModule.default || configModule

      // 验证配置
      this.validateConfig(config, configPath)

      // 构建组件路径
      const basePath = configPath.replace(/\/config\.(js|ts)$/, '')
      const componentPath = `${basePath}/index.vue`
      const stylePath = `${basePath}/style.less`

      // 创建模板元数据
      const metadata: TemplateMetadata = {
        ...config,
        category,
        device,
        componentPath,
        stylePath,
        configPath,
        lastModified: Date.now(),
        isBuiltIn
      }



      // 添加到索引
      this.addToIndex(metadata)

      // 缓存处理
      if (this.options.enableCache) {
        this.scanCache.set(configPath, metadata)
      }

    } catch (error) {
      errors.push({
        type: 'CONFIG_PARSE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        filePath: configPath,
        details: error
      })
    }
  }

  /**
   * 验证模板配置
   */
  private validateConfig(config: TemplateConfig, filePath: string): void {
    const required = ['name', 'displayName', 'description', 'version']

    for (const field of required) {
      if (!config[field as keyof TemplateConfig]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    if (typeof config.name !== 'string' || config.name.trim() === '') {
      throw new Error('Template name must be a non-empty string')
    }

    if (typeof config.version !== 'string' || !/^\d+\.\d+\.\d+/.test(config.version)) {
      throw new Error('Template version must be a valid semver string')
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
  private calculateStats(stats: ScanStats): void {
    let totalTemplates = 0

    for (const [category, deviceMap] of this.templateIndex) {
      let categoryCount = 0

      for (const [device, templateMap] of deviceMap) {
        const deviceCount = templateMap.size
        categoryCount += deviceCount
        stats.byDevice[device] += deviceCount
      }

      stats.byCategory[category] = categoryCount
      totalTemplates += categoryCount
    }

    stats.totalTemplates = totalTemplates
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
   * 清除缓存
   */
  clearCache(): void {
    this.scanCache.clear()
  }
}

/**
 * 创建扫描器实例
 */
export function createScanner(
  options: ScannerOptions,
  callbacks?: ScannerEventCallbacks
): TemplateScanner {
  return new TemplateScanner(options, callbacks)
}

// 导出类型
export * from './types'
