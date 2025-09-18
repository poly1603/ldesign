/**
 * 模板扫描器
 *
 * 使用统一的模板注册器管理模板，避免重复调用 import.meta.glob
 */

import type { FileNamingConfig } from '../types/config'
import type {
  DeviceType,
  TemplateConfig,
  TemplateIndex,
  TemplateMetadata,
} from '../types/template'
import type { ExtendedTemplateMetadata, TemplateFilter, TemplateSortOptions } from '../types/template-categories'
import type {
  ScanError,
  ScannerEventCallbacks,
  ScannerOptions,
  ScanResult,
  ScanStats,
} from './types'
import { createFilePathBuilder, type FilePathBuilder } from '../utils/file-path-builder'
import { createFileWatcher, type WatcherFileChangeEvent, type FileWatcher } from '../utils/file-watcher'
import { getTemplateCategoryManager } from '../utils/template-category-manager'
import type { TemplateCategoryManager } from '../types/template-categories'
// import { templateRegistry } from '../utils/template-registry' // 已移除

/**
 * 模板扫描器类
 */
export class TemplateScanner {
  private options: Required<ScannerOptions>
  private templateIndex: TemplateIndex = new Map()
  private callbacks: ScannerEventCallbacks = {}
  private scanCache = new Map<string, TemplateMetadata>()
  private lastScanTime = 0
  private filePathBuilder: FilePathBuilder
  private fileWatcher: FileWatcher | null = null
  private isWatchingEnabled = false
  private categoryManager: TemplateCategoryManager

  constructor(options: ScannerOptions, callbacks?: ScannerEventCallbacks, fileNamingConfig?: FileNamingConfig) {
    // 不再使用硬编码的默认值，所有配置都应该从外部传入
    this.options = {
      templatesDir: options.templatesDir || 'src/templates',
      enableCache: options.enableCache ?? true,
      enableHMR: options.enableHMR ?? false,
      maxDepth: options.maxDepth ?? 5,
      includeExtensions: options.includeExtensions || ['.vue', '.tsx', '.js', '.ts'],
      excludePatterns: options.excludePatterns || ['node_modules', '.git', 'dist'],
      watchMode: options.watchMode ?? false,
      debounceDelay: options.debounceDelay ?? 300,
      batchSize: options.batchSize ?? 10,
    }
    this.callbacks = callbacks || {}

    // 创建文件路径构建器
    this.filePathBuilder = createFilePathBuilder(fileNamingConfig || {
      componentFile: 'index.vue',
      configFile: 'config.{js,ts}',
      styleFile: 'style.{css,less,scss}',
      previewFile: 'preview.{png,jpg,jpeg,webp}',
      allowedConfigExtensions: ['.js', '.ts'],
      allowedStyleExtensions: ['.css', '.less', '.scss'],
    })

    // 初始化模板分类管理器
    this.categoryManager = getTemplateCategoryManager()

    // 如果启用了监听模式，创建文件监听器
    if (this.options.watchMode) {
      this.initializeFileWatcher()
    }
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
      lastScanTime: startTime,
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
        errors,
      }

      this.callbacks.onScanComplete?.(result)
      return result
    }
    catch (error) {
      const scanError: ScanError = {
        type: 'VALIDATION_ERROR',
        message: `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filePath: this.options.templatesDir,
        details: error,
      }
      errors.push(scanError)
      this.callbacks.onScanError?.(scanError)

      return {
        templates: this.templateIndex,
        stats,
        errors,
      }
    }
  }

  /**
   * 扫描内置模板
   */
  private async scanBuiltInTemplates(errors: ScanError[]): Promise<void> {
    // 直接使用备用方案扫描已知模板
    await this.scanDirectTemplates(errors)
  }

  /**
   * 直接扫描已知模板（备用方案）
   */
  private async scanDirectTemplates(errors: ScanError[]): Promise<void> {
    const knownTemplates = [
      {
        category: 'login',
        device: 'desktop' as DeviceType,
        templates: ['default', 'modern', 'creative'],
      },
      {
        category: 'login',
        device: 'tablet' as DeviceType,
        templates: ['default'],
      },
      {
        category: 'login',
        device: 'mobile' as DeviceType,
        templates: ['default'],
      },
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
            isDefault: templateName === 'default',
          }

          // 添加到索引
          this.addToIndex(metadata)

          // 缓存处理
          if (this.options.enableCache) {
            this.scanCache.set(`${category}-${device}-${templateName}`, metadata)
          }
        }
        catch (error) {
          errors.push({
            type: 'CONFIG_PARSE_ERROR',
            message: `Failed to process direct template ${category}/${device}/${templateName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath: `src/templates/${category}/${device}/${templateName}`,
            details: error,
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
      'login-mobile-default': '移动登录模板',
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
      'login-mobile-default': '适配移动设备的登录模板',
    }
    return descriptions[`${category}-${device}-${templateName}`] || `${templateName} ${category} 模板`
  }

  /**
   * 获取模板标签
   */
  private getTags(templateName: string): string[] {
    const tagMap: Record<string, string[]> = {
      default: ['default', 'simple', 'clean'],
      modern: ['modern', 'stylish', 'gradient'],
      creative: ['creative', 'artistic', 'unique'],
    }
    return tagMap[templateName] || [templateName]
  }

  /**
   * 扫描用户自定义模板
   */
  private async scanUserTemplates(errors: ScanError[]): Promise<void> {
    // 用户模板通过 API 动态注册，不需要自动扫描
    // 这避免了在打包后找不到用户模板的问题
    console.log('[TemplateScanner] User templates should be registered via API')
  }

  /**
   * 处理模板文件（配置文件和组件文件）
   */
  private async processTemplateFiles(
    configPath: string,
    configLoader: () => Promise<any>,
    componentLoader: () => Promise<any>,
    errors: ScanError[],
    isBuiltIn: boolean = false,
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
        category: category as string,
        device,
        componentPath: componentPath,
        componentLoader, // 添加组件加载器
        stylePath: stylePath ?? undefined,
        configPath: configPath,
        lastModified: Date.now(),
        isBuiltIn,
      }

      // 添加到索引
      this.addToIndex(metadata)

      // 缓存处理
      if (this.options.enableCache) {
        this.scanCache.set(configPath, metadata)
      }
    }
    catch (error) {
      errors.push({
        type: 'CONFIG_PARSE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        filePath: configPath,
        details: error,
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
    isBuiltIn: boolean = false,
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

      // 使用文件路径构建器构建路径
      const templatePaths = this.filePathBuilder.buildTemplatePaths(configPath)

      // 创建模板元数据
      const metadata: TemplateMetadata = {
        ...config,
        category: category as string,
        device,
        componentPath: templatePaths.componentPath,
        stylePath: templatePaths.stylePath ?? undefined,
        configPath: templatePaths.configPath,
        lastModified: Date.now(),
        isBuiltIn,
      }

      // 添加到索引
      this.addToIndex(metadata)

      // 缓存处理
      if (this.options.enableCache) {
        this.scanCache.set(configPath, metadata)
      }
    }
    catch (error) {
      errors.push({
        type: 'CONFIG_PARSE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        filePath: configPath,
        details: error,
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
    if (!categoryMap)
      return []

    const deviceMap = categoryMap.get(device)
    if (!deviceMap)
      return []

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

  /**
   * 初始化文件监听器
   */
  private initializeFileWatcher(): void {
    this.fileWatcher = createFileWatcher({
      rootDir: this.options.templatesDir,
      includeExtensions: this.options.includeExtensions,
      excludePatterns: this.options.excludePatterns,
      debounceDelay: this.options.debounceDelay,
      recursive: true,
      maxDepth: this.options.maxDepth,
    }, {
      onTemplateChange: event => this.handleTemplateFileChange(event),
      onError: (error) => {
        console.error('文件监听器错误:', error)
        this.callbacks.onScanError?.({
          type: 'SCAN_ERROR',
          message: error.message,
          filePath: this.options.templatesDir,
          details: error,
        })
      },
      onWatchStart: () => {
        this.isWatchingEnabled = true
        console.log('模板文件监听已启动')
      },
      onWatchStop: () => {
        this.isWatchingEnabled = false
        console.log('模板文件监听已停止')
      },
    })
  }

  /**
   * 启动文件监听
   */
  async startWatching(): Promise<void> {
    if (!this.fileWatcher) {
      this.initializeFileWatcher()
    }

    if (this.fileWatcher && !this.isWatchingEnabled) {
      try {
        await this.fileWatcher.startWatching()
      }
      catch (error) {
        console.error('启动文件监听失败:', error)
        this.callbacks.onScanError?.({
          type: 'SCAN_ERROR',
          message: (error as Error).message,
          filePath: this.options.templatesDir,
          details: error,
        })
      }
    }
  }

  /**
   * 停止文件监听
   */
  async stopWatching(): Promise<void> {
    if (this.fileWatcher && this.isWatchingEnabled) {
      try {
        await this.fileWatcher.stopWatching()
      }
      catch (error) {
        console.error('停止文件监听失败:', error)
      }
    }
  }

  /**
   * 处理模板文件变化
   */
  private async handleTemplateFileChange(event: WatcherFileChangeEvent): Promise<void> {
    if (!event.templateInfo) {
      return
    }

    const { category, device, templateName, fileType } = event.templateInfo

    try {
      switch (event.type) {
        case 'added':
        case 'changed':
          await this.handleTemplateFileUpdate(category, device, templateName, fileType, event.path)
          break
        case 'removed':
          await this.handleTemplateFileRemoval(category, device, templateName, fileType)
          break
      }

      // 触发扫描完成回调
      this.callbacks.onScanComplete?.({
        templates: this.templateIndex,
        stats: this.calculateCurrentStats(),
        errors: [],
      })
    }
    catch (error) {
      console.error('处理模板文件变化失败:', error)
      this.callbacks.onScanError?.({
        type: 'SCAN_ERROR',
        message: (error as Error).message,
        filePath: this.options.templatesDir,
        details: error,
      })
    }
  }

  /**
   * 处理模板文件更新
   */
  private async handleTemplateFileUpdate(
    category: string,
    device: DeviceType,
    templateName: string,
    fileType: string,
    filePath: string,
  ): Promise<void> {
    // 如果是配置文件变化，重新扫描整个模板
    if (fileType === 'config') {
      await this.rescanSingleTemplate(category, device, templateName, filePath)
    }
    else {
      // 其他文件变化，更新现有模板的元数据
      this.updateTemplateMetadata(category, device, templateName, fileType, filePath)
    }
  }

  /**
   * 处理模板文件删除
   */
  private async handleTemplateFileRemoval(
    category: string,
    device: DeviceType,
    templateName: string,
    fileType: string,
  ): Promise<void> {
    // 如果是配置文件被删除，移除整个模板
    if (fileType === 'config') {
      this.removeTemplate(category, device, templateName)
    }
    else {
      // 其他文件被删除，更新模板元数据
      this.updateTemplateMetadata(category, device, templateName, fileType, null)
    }
  }

  /**
   * 重新扫描单个模板
   */
  private async rescanSingleTemplate(
    category: string,
    device: DeviceType,
    templateName: string,
    configPath: string,
  ): Promise<void> {
    const errors: ScanError[] = []
    await this.scanTemplateConfig(configPath, category, device, true, errors)

    if (errors.length > 0) {
      console.warn('重新扫描模板时发生错误:', errors)
    }
  }

  /**
   * 更新模板元数据
   */
  private updateTemplateMetadata(
    category: string,
    device: DeviceType,
    templateName: string,
    fileType: string,
    filePath: string | null,
  ): void {
    const categoryMap = this.templateIndex.get(category)
    if (!categoryMap)
      return

    const deviceMap = categoryMap.get(device)
    if (!deviceMap)
      return

    const template = deviceMap.get(templateName)
    if (!template)
      return

    // 更新相应的文件路径
    switch (fileType) {
      case 'component':
        if (filePath) {
          template.componentPath = filePath
        }
        break
      case 'style':
        template.stylePath = filePath ?? undefined
        break
      case 'preview':
        // 可以添加预览图路径更新逻辑
        break
    }

    template.lastModified = Date.now()
  }

  /**
   * 移除模板
   */
  private removeTemplate(category: string, device: DeviceType, templateName: string): void {
    const categoryMap = this.templateIndex.get(category)
    if (!categoryMap)
      return

    const deviceMap = categoryMap.get(device)
    if (!deviceMap)
      return

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
  }

  /**
   * 计算当前统计信息
   */
  private calculateCurrentStats(): ScanStats {
    const stats = {
      totalTemplates: 0,
      byCategory: {} as Record<string, number>,
      byDevice: { desktop: 0, tablet: 0, mobile: 0 } as Record<DeviceType, number>,
      scanTime: 0,
      lastScanTime: Date.now(),
    }

    for (const [category, categoryMap] of this.templateIndex) {
      let categoryCount = 0
      for (const [device, deviceMap] of categoryMap) {
        const deviceCount = deviceMap.size
        categoryCount += deviceCount
        stats.byDevice[device] += deviceCount
      }
      stats.byCategory[category] = categoryCount
      stats.totalTemplates += categoryCount
    }

    return stats
  }

  /**
   * 重新扫描指定配置路径（简化实现）
   */
  private async scanTemplateConfig(
    configPath: string,
    category: string,
    device: DeviceType,
    isBuiltIn: boolean,
    errors: ScanError[],
  ): Promise<void> {
    try {
      const moduleLoader = async () => await import(/* @vite-ignore */ configPath)
      await this.processConfigFile(configPath, moduleLoader, errors, isBuiltIn)
    }
    catch (error) {
      errors.push({
        type: 'CONFIG_PARSE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        filePath: configPath,
        details: error,
      })
    }
  }

  /**
   * 获取监听状态
   */
  isWatching(): boolean {
    return this.isWatchingEnabled
  }

  /**
   * 搜索和过滤模板
   */
  searchTemplates(filter: TemplateFilter): TemplateMetadata[] {
    const allTemplates = this.getAllTemplates()

    // 转换为扩展元数据格式（简化版）
    const extendedTemplates: ExtendedTemplateMetadata[] = allTemplates.map(template => ({
      ...template,
      category: template.category as any,
      tags: template.tags?.map(tag => tag as any) || [],
      status: 'active' as any,
      priority: 2 as any,
      createdAt: new Date(template.lastModified || Date.now()),
      updatedAt: new Date(template.lastModified || Date.now()),
      usage: {
        count: 0,
        lastUsed: undefined,
        rating: undefined,
        ratingCount: 0,
      },
      compatibility: {
        vue: template.minVueVersion || '3.0.0',
      },
      performance: {},
      seo: {},
      accessibility: {},
    }))

    return this.categoryManager.filterTemplates(extendedTemplates, filter) as unknown as TemplateMetadata[]
  }

  /**
   * 排序模板
   */
  sortTemplates(templates: TemplateMetadata[], options: TemplateSortOptions): TemplateMetadata[] {
    // 转换为扩展元数据格式进行排序
    const extendedTemplates: ExtendedTemplateMetadata[] = templates.map(template => ({
      ...template,
      category: template.category as any,
      tags: template.tags?.map(tag => tag as any) || [],
      status: 'active' as any,
      priority: 2 as any,
      createdAt: new Date(template.lastModified || Date.now()),
      updatedAt: new Date(template.lastModified || Date.now()),
      usage: {
        count: 0,
        lastUsed: undefined,
        rating: undefined,
        ratingCount: 0,
      },
      compatibility: {
        vue: template.minVueVersion || '3.0.0',
      },
      performance: {},
      seo: {},
      accessibility: {},
    }))

    return this.categoryManager.sortTemplates(extendedTemplates, options) as unknown as TemplateMetadata[]
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
    if (!categoryMap)
      return []

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
   * 获取模板分类管理器
   */
  getCategoryManager(): TemplateCategoryManager {
    return this.categoryManager
  }

  /**
   * 获取模板统计信息
   */
  getTemplateStats(): {
    totalTemplates: number
    byCategory: Record<string, number>
    byDevice: Record<DeviceType, number>
    byTag: Record<string, number>
  } {
    const stats = {
      totalTemplates: 0,
      byCategory: {} as Record<string, number>,
      byDevice: { desktop: 0, tablet: 0, mobile: 0 } as Record<DeviceType, number>,
      byTag: {} as Record<string, number>,
    }

    for (const [category, categoryMap] of this.templateIndex) {
      let categoryCount = 0
      for (const [device, deviceMap] of categoryMap) {
        const deviceCount = deviceMap.size
        categoryCount += deviceCount
        stats.byDevice[device] += deviceCount

        // 统计标签
        for (const template of deviceMap.values()) {
          if (template.tags) {
            template.tags.forEach((tag) => {
              stats.byTag[tag] = (stats.byTag[tag] || 0) + 1
            })
          }
        }
      }
      stats.byCategory[category] = categoryCount
      stats.totalTemplates += categoryCount
    }

    return stats
  }

  /**
   * 销毁扫描器
   */
  async destroy(): Promise<void> {
    await this.stopWatching()
    this.clearCache()
    this.templateIndex.clear()
  }
}

/**
 * 创建扫描器实例
 */
export function createScanner(
  options: ScannerOptions,
  callbacks?: ScannerEventCallbacks,
): TemplateScanner {
  return new TemplateScanner(options, callbacks)
}

// 导出类型
export * from './types'
