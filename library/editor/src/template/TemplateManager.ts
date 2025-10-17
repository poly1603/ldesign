/**
 * 模板管理器
 * 负责模板的存储、检索和应用
 */

import { EventEmitter } from '../core/EventEmitter'
import type { 
  Template, 
  TemplateCategory, 
  TemplateStorage, 
  TemplateManagerConfig, 
  ApplyTemplateOptions,
  TemplateMetadata
} from './types'
import { LocalTemplateStorage } from './storage/LocalTemplateStorage'
import { builtinTemplates } from './templates'

export class TemplateManager extends EventEmitter {
  private storage: TemplateStorage
  private templates: Map<string, Template> = new Map()
  private config: TemplateManagerConfig
  private initialized: boolean = false

  constructor(config: TemplateManagerConfig = {}) {
    super()
    this.config = {
      storage: 'local',
      maxCustomTemplates: 50,
      enableVariables: true,
      ...config
    }

    // 初始化存储
    if (config.customStorage) {
      this.storage = config.customStorage
    } else {
      this.storage = new LocalTemplateStorage()
    }
  }

  /**
   * 初始化模板管理器
   */
  async init(): Promise<void> {
    if (this.initialized) return

    try {
      // 加载内置模板
      if (this.config.builtinTemplates) {
        this.config.builtinTemplates.forEach(template => {
          this.templates.set(template.metadata.id, template)
        })
      } else {
        // 加载默认内置模板
        builtinTemplates.forEach(template => {
          this.templates.set(template.metadata.id, template)
        })
      }

      // 加载用户自定义模板
      const customTemplates = await this.storage.getAll()
      customTemplates.forEach(template => {
        this.templates.set(template.metadata.id, template)
      })

      this.initialized = true
      this.emit('initialized')
    } catch (error) {
      console.error('Failed to initialize template manager:', error)
      this.emit('error', error)
    }
  }

  /**
   * 获取所有模板
   */
  async getAllTemplates(): Promise<Template[]> {
    if (!this.initialized) await this.init()
    return Array.from(this.templates.values())
  }

  /**
   * 根据ID获取模板
   */
  async getTemplate(id: string): Promise<Template | null> {
    if (!this.initialized) await this.init()
    return this.templates.get(id) || null
  }

  /**
   * 根据分类获取模板
   */
  async getTemplatesByCategory(category: TemplateCategory): Promise<Template[]> {
    if (!this.initialized) await this.init()
    return Array.from(this.templates.values()).filter(
      template => template.metadata.category === category
    )
  }

  /**
   * 搜索模板
   */
  async searchTemplates(query: string): Promise<Template[]> {
    if (!this.initialized) await this.init()
    const lowerQuery = query.toLowerCase()
    
    return Array.from(this.templates.values()).filter(template => {
      const metadata = template.metadata
      return (
        metadata.name.toLowerCase().includes(lowerQuery) ||
        metadata.description?.toLowerCase().includes(lowerQuery) ||
        metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    })
  }

  /**
   * 保存自定义模板
   */
  async saveCustomTemplate(template: Template): Promise<void> {
    if (!this.initialized) await this.init()

    // 检查自定义模板数量限制
    const customTemplates = Array.from(this.templates.values()).filter(
      t => t.metadata.isCustom
    )
    
    if (customTemplates.length >= (this.config.maxCustomTemplates || 50)) {
      throw new Error(`Maximum custom templates limit (${this.config.maxCustomTemplates}) reached`)
    }

    // 设置为自定义模板
    template.metadata.isCustom = true
    template.metadata.createdAt = new Date()
    template.metadata.updatedAt = new Date()

    // 保存到存储
    await this.storage.save(template)
    
    // 添加到内存缓存
    this.templates.set(template.metadata.id, template)
    
    this.emit('template:saved', template)
  }

  /**
   * 更新模板
   */
  async updateTemplate(id: string, updates: Partial<Template>): Promise<void> {
    if (!this.initialized) await this.init()

    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`Template with id ${id} not found`)
    }

    // 不允许更新内置模板
    if (template.metadata.isBuiltin) {
      throw new Error('Cannot update builtin templates')
    }

    // 更新模板
    const updatedTemplate = {
      ...template,
      ...updates,
      metadata: {
        ...template.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    }

    // 保存到存储
    await this.storage.update(id, updatedTemplate)
    
    // 更新内存缓存
    this.templates.set(id, updatedTemplate)
    
    this.emit('template:updated', updatedTemplate)
  }

  /**
   * 删除自定义模板
   */
  async deleteTemplate(id: string): Promise<void> {
    if (!this.initialized) await this.init()

    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`Template with id ${id} not found`)
    }

    // 不允许删除内置模板
    if (template.metadata.isBuiltin) {
      throw new Error('Cannot delete builtin templates')
    }

    // 从存储中删除
    await this.storage.delete(id)
    
    // 从内存缓存中删除
    this.templates.delete(id)
    
    this.emit('template:deleted', id)
  }

  /**
   * 应用模板到编辑器
   */
  async applyTemplate(
    editor: any,
    templateId: string,
    options: ApplyTemplateOptions = {}
  ): Promise<void> {
    if (!this.initialized) await this.init()

    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`)
    }

    let content = template.content

    // 处理变量替换
    if (this.config.enableVariables && template.variables && options.variables) {
      content = this.replaceVariables(content, options.variables)
    }

    // 应用样式
    if (template.styles && !options.preserveStyles) {
      this.applyStyles(editor, template.styles)
    }

    // 应用内容
    if (options.replaceContent !== false) {
      editor.setContent(content)
    } else {
      // 插入到当前位置
      editor.insertContent(content)
    }

    this.emit('template:applied', {
      template,
      options
    })
  }

  /**
   * 替换模板变量
   */
  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      result = result.replace(regex, String(value))
    })
    
    return result
  }

  /**
   * 应用样式到编辑器
   */
  private applyStyles(editor: any, styles: string): void {
    // 创建或更新样式标签
    const styleId = 'template-styles'
    let styleEl = document.getElementById(styleId) as HTMLStyleElement
    
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }
    
    styleEl.textContent = styles
  }

  /**
   * 从当前编辑器内容创建模板
   */
  async createTemplateFromContent(
    editor: any,
    metadata: TemplateMetadata
  ): Promise<Template> {
    const content = editor.getContent()
    
    const template: Template = {
      metadata: {
        ...metadata,
        id: metadata.id || this.generateTemplateId(),
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      content,
      variables: this.extractVariables(content)
    }
    
    await this.saveCustomTemplate(template)
    return template
  }

  /**
   * 提取内容中的变量
   */
  private extractVariables(content: string): any[] {
    const variables: any[] = []
    const regex = /\{\{(\w+)\}\}/g
    const matches = new Set<string>()
    
    let match
    while ((match = regex.exec(content)) !== null) {
      matches.add(match[1])
    }
    
    matches.forEach(key => {
      variables.push({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        type: 'text',
        defaultValue: ''
      })
    })
    
    return variables
  }

  /**
   * 生成模板ID
   */
  private generateTemplateId(): string {
    return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 导出模板
   */
  async exportTemplate(id: string): Promise<string> {
    const template = await this.getTemplate(id)
    if (!template) {
      throw new Error(`Template with id ${id} not found`)
    }
    
    return JSON.stringify(template, null, 2)
  }

  /**
   * 导入模板
   */
  async importTemplate(jsonStr: string): Promise<void> {
    try {
      const template = JSON.parse(jsonStr) as Template
      
      // 生成新ID避免冲突
      template.metadata.id = this.generateTemplateId()
      template.metadata.isCustom = true
      template.metadata.isBuiltin = false
      
      await this.saveCustomTemplate(template)
    } catch (error) {
      throw new Error(`Failed to import template: ${error}`)
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.templates.clear()
    this.removeAllListeners()
    this.initialized = false
  }
}