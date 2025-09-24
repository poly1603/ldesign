/**
 * 流程图模板管理器
 * 
 * 负责模板的存储、加载、管理和操作
 */

import type {
  FlowchartTemplate,
  TemplateMetadata,
  TemplateFilter,
  TemplateSortOptions,
  TemplateExportOptions,
  TemplateImportOptions,
  TemplateManagerConfig,
  TemplateManagerEvents,
  FlowchartData,
  TemplateCategory
} from '../types'

/**
 * 模板管理器类
 */
export class TemplateManager {
  private templates = new Map<string, FlowchartTemplate>()
  private config: Required<TemplateManagerConfig>
  private eventListeners = new Map<keyof TemplateManagerEvents, Function[]>()

  constructor(config: TemplateManagerConfig = {}) {
    // 设置默认配置
    this.config = {
      storage: {
        type: 'localStorage',
        key: 'ldesign-flowchart-templates',
        maxSize: 10 * 1024 * 1024, // 10MB
        ...config.storage
      },
      builtInTemplates: {
        enabled: true,
        categories: ['approval', 'workflow', 'business'],
        ...config.builtInTemplates
      },
      cache: {
        enabled: true,
        maxSize: 100,
        ttl: 24 * 60 * 60 * 1000, // 24小时
        ...config.cache
      }
    }
  }

  /**
   * 初始化模板管理器
   */
  async initialize(): Promise<void> {
    // 加载存储的模板
    await this.loadFromStorage()

    // 加载内置模板
    if (this.config.builtInTemplates.enabled) {
      await this.loadBuiltInTemplates()
    }
  }

  /**
   * 添加模板
   */
  async addTemplate(template: Omit<FlowchartTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId()
    const now = new Date().toISOString()

    const fullTemplate: FlowchartTemplate = {
      ...template,
      id,
      createdAt: now,
      updatedAt: now
    }

    this.templates.set(id, fullTemplate)
    await this.saveToStorage()

    this.emit('template:add', fullTemplate)
    return id
  }

  /**
   * 更新模板
   */
  async updateTemplate(id: string, updates: Partial<Omit<FlowchartTemplate, 'id' | 'createdAt'>>): Promise<void> {
    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`Template not found: ${id}`)
    }

    const oldTemplate = { ...template }
    const updatedTemplate: FlowchartTemplate = {
      ...template,
      ...updates,
      id, // 确保ID不被修改
      createdAt: template.createdAt, // 确保创建时间不被修改
      updatedAt: new Date().toISOString()
    }

    this.templates.set(id, updatedTemplate)
    await this.saveToStorage()

    this.emit('template:update', updatedTemplate, oldTemplate)
  }

  /**
   * 删除模板
   */
  async deleteTemplate(id: string): Promise<void> {
    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`Template not found: ${id}`)
    }

    if (template.isBuiltIn) {
      throw new Error('Cannot delete built-in template')
    }

    this.templates.delete(id)
    await this.saveToStorage()

    this.emit('template:delete', id)
  }

  /**
   * 获取模板
   */
  getTemplate(id: string): FlowchartTemplate | undefined {
    return this.templates.get(id)
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): FlowchartTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * 获取模板元数据列表
   */
  getTemplateMetadata(): TemplateMetadata[] {
    return Array.from(this.templates.values()).map(template => ({
      id: template.id,
      name: template.name,
      displayName: template.displayName,
      description: template.description,
      category: template.category,
      version: template.version,
      author: template.author,
      tags: template.tags,
      preview: template.preview,
      isBuiltIn: template.isBuiltIn,
      isDefault: template.isDefault,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      nodeCount: template.data.nodes.length,
      edgeCount: template.data.edges.length
    }))
  }

  /**
   * 过滤模板
   */
  filterTemplates(filter: TemplateFilter): TemplateMetadata[] {
    let templates = this.getTemplateMetadata()

    if (filter.category) {
      templates = templates.filter(t => t.category === filter.category)
    }

    if (filter.tags && filter.tags.length > 0) {
      templates = templates.filter(t =>
        t.tags && filter.tags!.some(tag => t.tags!.includes(tag))
      )
    }

    if (filter.author) {
      templates = templates.filter(t => t.author === filter.author)
    }

    if (filter.isBuiltIn !== undefined) {
      templates = templates.filter(t => t.isBuiltIn === filter.isBuiltIn)
    }

    if (filter.search) {
      const search = filter.search.toLowerCase()
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(search) ||
        t.displayName.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(search)))
      )
    }

    return templates
  }

  /**
   * 排序模板
   */
  sortTemplates(templates: TemplateMetadata[], options: TemplateSortOptions): TemplateMetadata[] {
    return templates.sort((a, b) => {
      const aValue = a[options.field]
      const bValue = b[options.field]

      let result = 0
      if (aValue < bValue) result = -1
      else if (aValue > bValue) result = 1

      return options.order === 'desc' ? -result : result
    })
  }

  /**
   * 导出模板
   */
  exportTemplates(templateIds: string[], options: TemplateExportOptions = {}): string {
    const templates = templateIds.map(id => this.templates.get(id)).filter(Boolean) as FlowchartTemplate[]

    if (templates.length === 0) {
      throw new Error('No templates to export')
    }

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      templates: options.includeMetadata ? templates : templates.map(t => ({
        ...t,
        // 移除元数据字段
        createdAt: undefined,
        updatedAt: undefined,
        isBuiltIn: undefined
      }))
    }

    this.emit('template:export', templates)

    if (options.format === 'xml') {
      return this.convertToXML(exportData)
    }

    return JSON.stringify(exportData, null, options.pretty ? 2 : 0)
  }

  /**
   * 导入模板
   */
  async importTemplates(data: string, options: TemplateImportOptions = {}): Promise<string[]> {
    let importData: any

    try {
      // 尝试解析JSON
      importData = JSON.parse(data)
    } catch (error) {
      // 如果JSON解析失败，尝试XML解析
      try {
        importData = this.parseXML(data)
      } catch (xmlError) {
        throw new Error('Invalid import data format')
      }
    }

    if (!importData.templates || !Array.isArray(importData.templates)) {
      throw new Error('Invalid import data structure')
    }

    const importedIds: string[] = []

    for (const templateData of importData.templates) {
      // 验证模板数据
      if (options.validateData && !this.validateTemplateData(templateData)) {
        console.warn(`Skipping invalid template: ${templateData.name}`)
        continue
      }

      // 检查是否存在同名模板
      const existingTemplate = Array.from(this.templates.values())
        .find(t => t.name === templateData.name)

      if (existingTemplate && !options.overwrite) {
        console.warn(`Template already exists: ${templateData.name}`)
        continue
      }

      // 生成新ID或使用现有ID
      const id = options.generateId ? this.generateId() : (templateData.id || this.generateId())
      const now = new Date().toISOString()

      const template: FlowchartTemplate = {
        ...templateData,
        id,
        isBuiltIn: false, // 导入的模板不是内置模板
        createdAt: templateData.createdAt || now,
        updatedAt: now
      }

      this.templates.set(id, template)
      importedIds.push(id)
    }

    await this.saveToStorage()

    const importedTemplates = importedIds.map(id => this.templates.get(id)!).filter(Boolean)
    this.emit('template:import', importedTemplates)

    return importedIds
  }

  /**
   * 从存储加载模板
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const data = this.getStorageData()
      if (data) {
        const templates = JSON.parse(data) as FlowchartTemplate[]
        for (const template of templates) {
          this.templates.set(template.id, template)
        }
      }
    } catch (error) {
      console.warn('Failed to load templates from storage:', error)
    }
  }

  /**
   * 保存模板到存储
   */
  private async saveToStorage(): Promise<void> {
    try {
      const templates = Array.from(this.templates.values())
        .filter(t => !t.isBuiltIn) // 不保存内置模板

      const data = JSON.stringify(templates)
      this.setStorageData(data)
    } catch (error) {
      console.warn('Failed to save templates to storage:', error)
    }
  }

  /**
   * 加载内置模板
   */
  private async loadBuiltInTemplates(): Promise<void> {
    const { builtInTemplates } = await import('./builtInTemplates')

    for (const template of builtInTemplates) {
      // 只加载启用的分类
      if (this.config.builtInTemplates.categories?.includes(template.category)) {
        this.templates.set(template.id, template)
      }
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 验证模板数据
   */
  private validateTemplateData(template: any): boolean {
    return !!(
      template.name &&
      template.displayName &&
      template.description &&
      template.category &&
      template.version &&
      template.data &&
      template.data.nodes &&
      template.data.edges &&
      Array.isArray(template.data.nodes) &&
      Array.isArray(template.data.edges)
    )
  }

  /**
   * 获取存储数据
   */
  private getStorageData(): string | null {
    switch (this.config.storage.type) {
      case 'localStorage':
        return localStorage.getItem(this.config.storage.key!)
      case 'memory':
        // 内存存储在这里实现
        return null
      default:
        return null
    }
  }

  /**
   * 设置存储数据
   */
  private setStorageData(data: string): void {
    switch (this.config.storage.type) {
      case 'localStorage':
        localStorage.setItem(this.config.storage.key!, data)
        break
      case 'memory':
        // 内存存储在这里实现
        break
    }
  }

  /**
   * 转换为XML格式
   */
  private convertToXML(data: any): string {
    // 简单的XML转换实现
    // 在实际项目中可能需要使用专门的XML库
    return `<?xml version="1.0" encoding="UTF-8"?>
<templates>
  <!-- XML export not fully implemented -->
  <data>${JSON.stringify(data)}</data>
</templates>`
  }

  /**
   * 解析XML格式
   */
  private parseXML(xml: string): any {
    // 简单的XML解析实现
    // 在实际项目中可能需要使用专门的XML解析库
    throw new Error('XML import not implemented')
  }

  /**
   * 事件监听
   */
  on<K extends keyof TemplateManagerEvents>(event: K, listener: TemplateManagerEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof TemplateManagerEvents>(event: K, listener: TemplateManagerEvents[K]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof TemplateManagerEvents>(event: K, ...args: Parameters<TemplateManagerEvents[K]>): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          (listener as any)(...args)
        } catch (error) {
          console.error(`Error in template manager event listener for ${event}:`, error)
        }
      })
    }
  }
}
