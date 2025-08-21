/**
 * 自动化模板扫描器
 *
 * 设计原则：
 * 1. 完全自动化 - 基于文件系统自动发现模板
 * 2. 约定优于配置 - 根据目录结构自动推断模板元数据
 * 3. Vite兼容 - 使用 import.meta.glob 进行静态分析
 * 4. 零配置 - 无需手动注册模板
 */

import type { DeviceType, TemplateMetadata, TemplateScanResult } from '../types'

/**
 * 自动化模板扫描器
 */
export class TemplateScanner {
  private cache = new Map<string, TemplateMetadata[]>()
  private lastScanTime = 0
  private readonly cacheExpiration = 5 * 60 * 1000 // 5分钟
  private debug = false

  constructor(options: { debug?: boolean } = {}) {
    this.debug = options.debug || false
  }

  /**
   * 自动扫描模板
   * 基于文件系统约定自动发现所有模板
   */
  async scanTemplates(): Promise<TemplateScanResult> {
    const startTime = Date.now()

    if (this.debug) {
      console.log('🔍 开始自动模板扫描...')
    }

    try {
      // 检查缓存
      const cacheKey = 'auto-templates'
      if (this.isCacheValid(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (cached) {
          if (this.debug) {
            console.log('✅ 使用缓存的模板数据')
          }
          return {
            count: cached.length,
            templates: cached,
            duration: Date.now() - startTime,
            scannedDirectories: 0,
            scanMode: 'cached',
            debug: {
              scannedPaths: [],
              foundConfigs: cached.length,
              foundComponents: cached.length,
            },
          }
        }
      }

      // 执行自动扫描
      const result = await this.performAutoScan()

      // 缓存结果
      if (result.templates.length > 0) {
        this.cache.set(cacheKey, result.templates)
        this.lastScanTime = Date.now()
      }

      return {
        ...result,
        duration: Date.now() - startTime,
      }
    }
    catch (error) {
      console.error('❌ 自动模板扫描失败:', error)
      return this.getFallbackResult(startTime)
    }
  }

  /**
   * 执行自动扫描
   * 基于约定的目录结构自动发现模板
   */
  private async performAutoScan(): Promise<Omit<TemplateScanResult, 'duration'>> {
    const templates: TemplateMetadata[] = []
    const scannedPaths: string[] = []

    // 使用 import.meta.glob 自动扫描模板组件
    // 约定：templates/{category}/{device}/{template-name}/index.tsx
    const componentModules = import.meta.glob('../templates/**/*/index.{tsx,ts,vue,js}', { eager: false })

    if (this.debug) {
      console.log(`🔍 发现 ${Object.keys(componentModules).length} 个模板组件`)
    }

    for (const [componentPath, componentLoader] of Object.entries(componentModules)) {
      try {
        // 解析路径获取模板信息
        const templateInfo = this.parseTemplatePath(componentPath)

        if (!templateInfo) {
          if (this.debug) {
            console.warn(`⚠️ 无法解析模板路径: ${componentPath}`)
          }
          continue
        }

        const { category, device, template } = templateInfo

        // 创建模板元数据
        const metadata: TemplateMetadata = {

          name: this.generateTemplateName(template, device),
          description: this.generateTemplateDescription(template, device, category),
          category,
          device: device as DeviceType,
          template,
          path: componentPath,
          component: null, // 延迟加载
          config: {
            id: `${category}-${device}-${template}`,
            name: this.generateTemplateName(template, device),
            description: this.generateTemplateDescription(template, device, category),
            version: '1.0.0',
            author: 'LDesign Team',
            tags: [category, device, template],
            category,
            device: device as DeviceType,
            template,
          },
        }

        templates.push(metadata)
        scannedPaths.push(componentPath)

        if (this.debug) {
          console.log(`✅ 发现模板: ${category}/${device}/${template}`)
        }
      }
      catch (error) {
        if (this.debug) {
          console.warn(`⚠️ 解析模板失败 ${componentPath}:`, error)
        }
      }
    }

    if (this.debug) {
      console.log(`🎉 自动扫描完成，发现 ${templates.length} 个模板`)
    }

    return {
      count: templates.length,
      templates,
      scannedDirectories: scannedPaths.length,
      scanMode: 'auto-discovery',
      debug: {
        scannedPaths,
        foundConfigs: 0, // 不再依赖配置文件
        foundComponents: templates.length,
      },
    }
  }

  /**
   * 解析模板路径
   * 从路径中提取 category, device, template 信息
   *
   * 路径格式: ../templates/{category}/{device}/{template}/index.tsx
   * 示例: ../templates/login/desktop/adaptive/index.tsx
   */
  private parseTemplatePath(path: string): { category: string, device: string, template: string } | null {
    // 移除文件名和扩展名，只保留目录路径
    const dirPath = path.replace(/\/index\.(tsx|ts|vue|js)$/, '')

    // 匹配路径模式: ../templates/{category}/{device}/{template}
    const match = dirPath.match(/\.\.\/templates\/([^/]+)\/([^/]+)\/([^/]+)$/)

    if (!match) {
      return null
    }

    const [, category, device, template] = match

    return { category, device, template }
  }

  /**
   * 生成模板显示名称
   */
  private generateTemplateName(template: string, device: string): string {
    const templateNames: Record<string, string> = {
      adaptive: '自适应',
      classic: '经典',
      default: '默认',
      modern: '现代',
      card: '卡片',
      simple: '简洁',
      split: '分屏',
    }

    const deviceNames: Record<string, string> = {
      desktop: '桌面端',
      mobile: '移动端',
      tablet: '平板端',
    }

    const templateName = templateNames[template] || template
    const deviceName = deviceNames[device] || device

    return `${templateName}${deviceName}`
  }

  /**
   * 生成模板描述
   */
  private generateTemplateDescription(template: string, device: string, category: string): string {
    const templateDescs: Record<string, string> = {
      adaptive: '响应式自适应界面',
      classic: '传统经典界面设计',
      default: '简洁的默认界面',
      modern: '现代化界面设计',
      card: '卡片式界面',
      simple: '简洁界面',
      split: '分屏界面',
    }

    const deviceNames: Record<string, string> = {
      desktop: '桌面端',
      mobile: '移动端',
      tablet: '平板端',
    }

    const categoryNames: Record<string, string> = {
      login: '登录',
      register: '注册',
      dashboard: '仪表板',
    }

    const templateDesc = templateDescs[template] || `${template}界面`
    const deviceName = deviceNames[device] || device
    const categoryName = categoryNames[category] || category

    return `${deviceName}${categoryName}${templateDesc}`
  }

  /**
   * 获取回退结果
   * 当自动扫描失败时，使用已知的模板列表
   */
  private getFallbackResult(startTime: number): TemplateScanResult {
    if (this.debug) {
      console.log('🔄 使用预定义模板列表作为回退')
    }

    const fallbackTemplates = this.createFallbackTemplates()

    return {
      count: fallbackTemplates.length,
      templates: fallbackTemplates,
      duration: Date.now() - startTime,
      scannedDirectories: 0,
      scanMode: 'fallback',
      debug: {
        scannedPaths: [],
        foundConfigs: 0,
        foundComponents: fallbackTemplates.length,
      },
    }
  }

  /**
   * 创建预定义模板列表
   * 基于已知的模板结构创建元数据
   */
  private createFallbackTemplates(): TemplateMetadata[] {
    const knownTemplates = [
      { category: 'login', device: 'desktop', template: 'adaptive' },
      { category: 'login', device: 'desktop', template: 'classic' },
      { category: 'login', device: 'desktop', template: 'default' },
      { category: 'login', device: 'desktop', template: 'modern' },
      { category: 'login', device: 'mobile', template: 'card' },
      { category: 'login', device: 'mobile', template: 'default' },
      { category: 'login', device: 'mobile', template: 'simple' },
      { category: 'login', device: 'tablet', template: 'adaptive' },
      { category: 'login', device: 'tablet', template: 'default' },
      { category: 'login', device: 'tablet', template: 'split' },
    ]

    return knownTemplates.map(({ category, device, template }) => ({
      name: this.generateTemplateName(template, device),
      description: this.generateTemplateDescription(template, device, category),
      category,
      device: device as DeviceType,
      template,
      componentPath: `../templates/${category}/${device}/${template}/index.tsx`,
      path: `../templates/${category}/${device}/${template}/index.tsx`,
      component: null,
      config: {
        id: `${category}-${device}-${template}`,
        name: this.generateTemplateName(template, device),
        description: this.generateTemplateDescription(template, device, category),
        version: '1.0.0',
        author: 'LDesign Team',
        tags: [category, device, template],
        category,
        device: device as DeviceType,
        template,
      },
    }))
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(key: string): boolean {
    if (!this.cache.has(key))
      return false
    return Date.now() - this.lastScanTime < this.cacheExpiration
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
    this.lastScanTime = 0
    if (this.debug) {
      console.log('🗑️ 模板缓存已清空')
    }
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): TemplateMetadata[] {
    const cached = this.cache.get('auto-templates')
    return cached || []
  }

  /**
   * 按分类获取模板
   */
  getTemplatesByCategory(category: string): TemplateMetadata[] {
    return this.getAllTemplates().filter(t => t.category === category)
  }

  /**
   * 按设备类型获取模板
   */
  getTemplatesByDevice(device: string): TemplateMetadata[] {
    return this.getAllTemplates().filter(t => t.device === device)
  }

  /**
   * 按分类和设备类型获取模板
   */
  getTemplates(category?: string, device?: DeviceType): TemplateMetadata[] {
    let templates = this.getAllTemplates()

    if (category) {
      templates = templates.filter(t => t.category === category)
    }

    if (device) {
      templates = templates.filter(t => t.device === device)
    }

    return templates
  }

  /**
   * 查找特定模板
   */
  findTemplate(category: string, device: string, template: string): TemplateMetadata | null {
    return (
      this.getAllTemplates().find(t => t.category === category && t.device === device && t.template === template)
      || null
    )
  }

  /**
   * 检查模板是否存在
   */
  hasTemplate(category: string, device: string, template: string): boolean {
    return this.findTemplate(category, device, template) !== null
  }

  /**
   * 获取可用的分类列表
   */
  getAvailableCategories(): string[] {
    const categories = new Set(this.getAllTemplates().map(t => t.category))
    return Array.from(categories).sort()
  }

  /**
   * 获取指定分类的可用设备类型
   */
  getAvailableDevices(category?: string): DeviceType[] {
    let templates = this.getAllTemplates()

    if (category) {
      templates = templates.filter(t => t.category === category)
    }

    const devices = new Set(templates.map(t => t.device))
    return Array.from(devices).sort() as DeviceType[]
  }

  /**
   * 获取指定分类和设备的可用模板
   */
  getAvailableTemplates(category: string, device: DeviceType): string[] {
    const templates = this.getAllTemplates()
      .filter(t => t.category === category && t.device === device)
      .map(t => t.template)

    return templates.sort()
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number, lastScanTime: number, templates: number } {
    return {
      size: this.cache.size,
      lastScanTime: this.lastScanTime,
      templates: this.getAllTemplates().length,
    }
  }

  /**
   * 获取扫描统计
   */
  getStats() {
    return {
      totalTemplates: this.getAllTemplates().length,
      categories: this.getAvailableCategories(),
      devices: this.getAvailableDevices(),
      cacheStats: this.getCacheStats(),
    }
  }
}
