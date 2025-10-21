/**
 * 模板管理器
 * 负责模板的加载、渲染和管理
 */

import type { Logger } from '../logger'
import { EventEmitter } from 'node:events'
import { promises as fs } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { FileSystem } from '../filesystem'
import { StringUtils } from '../utils'

/**
 * 模板配置
 */
export interface TemplateConfig {
  name: string
  version: string
  description: string
  author?: string
  license?: string
  keywords?: string[]
  variables?: Record<string, TemplateVariable>
  files?: TemplateFile[]
  hooks?: TemplateHooks
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

/**
 * 模板变量
 */
export interface TemplateVariable {
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect'
  message: string
  default?: any
  choices?: Array<{ name: string, value: any }>
  validate?: (value: any) => boolean | string
}

/**
 * 模板文件
 */
export interface TemplateFile {
  source: string
  target: string
  template?: boolean
  condition?: string
}

/**
 * 模板钩子
 */
export interface TemplateHooks {
  beforeRender?: string[]
  afterRender?: string[]
  beforeInstall?: string[]
  afterInstall?: string[]
}

/**
 * 模板渲染选项
 */
export interface TemplateRenderOptions {
  variables?: Record<string, any>
  targetDir?: string
  overwrite?: boolean
}

/**
 * 模板管理器选项
 */
export interface TemplateManagerOptions {
  templatesDir: string
  logger?: Logger
}

/**
 * 模板管理器类
 */
export class TemplateManager extends EventEmitter {
  private options: TemplateManagerOptions
  private templates = new Map<string, TemplateConfig>()
  private logger?: Logger

  constructor(options: TemplateManagerOptions) {
    super()
    this.options = options
    this.logger = options.logger
  }

  /**
   * 初始化模板管理器
   */
  async initialize(): Promise<void> {
    try {
      await this.loadTemplates()
      this.logger?.info(`加载了 ${this.templates.size} 个模板`)
    }
    catch (error) {
      this.logger?.error('模板管理器初始化失败:', error)
      throw error
    }
  }

  /**
   * 加载所有模板
   */
  async loadTemplates(): Promise<void> {
    if (!(await FileSystem.exists(this.options.templatesDir))) {
      await FileSystem.ensureDir(this.options.templatesDir)
      return
    }

    const entries = await fs.readdir(this.options.templatesDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const template = await this.loadTemplate(entry.name)
          if (template) {
            this.templates.set(entry.name, template)
          }
        }
        catch (error) {
          this.logger?.warn(`加载模板失败: ${entry.name}`, error)
        }
      }
    }
  }

  /**
   * 加载单个模板
   */
  async loadTemplate(name: string): Promise<TemplateConfig | null> {
    const templateDir = join(this.options.templatesDir, name)
    const configPath = join(templateDir, 'template.json')

    if (!(await FileSystem.exists(configPath))) {
      return null
    }

    try {
      const configContent = await fs.readFile(configPath, 'utf8')
      const config = JSON.parse(configContent) as TemplateConfig

      // 验证模板配置
      if (!config.name || !config.version) {
        throw new Error('模板配置缺少必要字段')
      }

      return config
    }
    catch (error) {
      this.logger?.error(`解析模板配置失败: ${name}`, error)
      return null
    }
  }

  /**
   * 获取模板
   */
  async getTemplate(name: string): Promise<TemplateConfig | null> {
    return this.templates.get(name) || null
  }

  /**
   * 获取所有模板名称
   */
  getTemplateNames(): string[] {
    return Array.from(this.templates.keys())
  }

  /**
   * 渲染模板
   */
  async renderTemplate(
    templateName: string,
    targetDir: string,
    variables: Record<string, any> = {},
  ): Promise<string[]> {
    const template = this.templates.get(templateName)
    if (!template) {
      throw new Error(`模板不存在: ${templateName}`)
    }

    const templateDir = join(this.options.templatesDir, templateName)
    const renderedFiles: string[] = []

    try {
      this.emit('renderStarted', { template: templateName, targetDir })

      // 执行前置钩子
      if (template.hooks?.beforeRender) {
        await this.executeHooks(template.hooks.beforeRender, templateDir, variables)
      }

      // 渲染文件
      if (template.files) {
        // 使用配置中的文件列表
        for (const fileConfig of template.files) {
          if (this.shouldIncludeFile(fileConfig, variables)) {
            const rendered = await this.renderFile(templateDir, targetDir, fileConfig, variables)
            renderedFiles.push(...rendered)
          }
        }
      }
      else {
        // 渲染整个模板目录
        const rendered = await this.renderDirectory(templateDir, targetDir, variables)
        renderedFiles.push(...rendered)
      }

      // 执行后置钩子
      if (template.hooks?.afterRender) {
        await this.executeHooks(template.hooks.afterRender, targetDir, variables)
      }

      this.emit('renderCompleted', {
        template: templateName,
        targetDir,
        files: renderedFiles,
      })

      return renderedFiles
    }
    catch (error) {
      this.emit('renderError', error)
      throw error
    }
  }

  /**
   * 创建新模板
   */
  async createTemplate(
    name: string,
    config: Partial<TemplateConfig>,
    sourceDir?: string,
  ): Promise<void> {
    const templateDir = join(this.options.templatesDir, name)

    if (await FileSystem.exists(templateDir)) {
      throw new Error(`模板已存在: ${name}`)
    }

    await FileSystem.ensureDir(templateDir)

    // 创建模板配置
    const templateConfig: TemplateConfig = {
      name,
      version: config.version || '1.0.0',
      description: config.description || '',
      author: config.author,
      license: config.license,
      keywords: config.keywords,
      variables: config.variables,
      files: config.files,
      hooks: config.hooks,
      dependencies: config.dependencies,
      devDependencies: config.devDependencies,
    }

    await fs.writeFile(
      join(templateDir, 'template.json'),
      JSON.stringify(templateConfig, null, 2),
      'utf8',
    )

    // 复制源文件
    if (sourceDir && (await FileSystem.exists(sourceDir))) {
      await this.copyTemplateFiles(sourceDir, templateDir)
    }

    // 重新加载模板
    const loadedTemplate = await this.loadTemplate(name)
    if (loadedTemplate) {
      this.templates.set(name, loadedTemplate)
    }

    this.emit('templateCreated', { name, config: templateConfig })
  }

  /**
   * 删除模板
   */
  async deleteTemplate(name: string): Promise<void> {
    const templateDir = join(this.options.templatesDir, name)

    if (!(await FileSystem.exists(templateDir))) {
      throw new Error(`模板不存在: ${name}`)
    }

    await FileSystem.remove(templateDir)
    this.templates.delete(name)

    this.emit('templateDeleted', { name })
  }

  /**
   * 销毁模板管理器
   */
  async destroy(): Promise<void> {
    this.templates.clear()
    this.emit('destroyed')
  }

  // 私有方法

  private shouldIncludeFile(fileConfig: TemplateFile, variables: Record<string, any>): boolean {
    if (!fileConfig.condition) {
      return true
    }

    try {
      // 简单的条件评估
      return this.evaluateCondition(fileConfig.condition, variables)
    }
    catch {
      return true
    }
  }

  private evaluateCondition(condition: string, variables: Record<string, any>): boolean {
    // 简单的条件评估实现
    // 支持基本的变量检查，如 "framework === 'vue'"
    const cleanCondition = condition.replace(/\s+/g, ' ').trim()

    // 替换变量
    let evaluatedCondition = cleanCondition
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g')
      const replacement = typeof value === 'string' ? `'${value}'` : String(value)
      evaluatedCondition = evaluatedCondition.replace(regex, replacement)
    }

    // 简单的表达式评估（仅支持基本比较）
    try {
      // eslint-disable-next-line no-new-func
      return new Function(`"use strict"; return (${evaluatedCondition})`)()
    }
    catch {
      return true
    }
  }

  private async renderFile(
    templateDir: string,
    targetDir: string,
    fileConfig: TemplateFile,
    variables: Record<string, any>,
  ): Promise<string[]> {
    const sourcePath = join(templateDir, fileConfig.source)
    const targetPath = join(targetDir, this.renderString(fileConfig.target, variables))

    if (!(await FileSystem.exists(sourcePath))) {
      this.logger?.warn(`模板文件不存在: ${sourcePath}`)
      return []
    }

    await FileSystem.ensureDir(dirname(targetPath))

    if (fileConfig.template !== false && this.isTemplateFile(sourcePath)) {
      // 渲染模板文件
      const content = await fs.readFile(sourcePath, 'utf8')
      const renderedContent = this.renderString(content, variables)
      await fs.writeFile(targetPath, renderedContent, 'utf8')
    }
    else {
      // 直接复制文件
      await FileSystem.copy(sourcePath, targetPath)
    }

    return [targetPath]
  }

  private async renderDirectory(
    templateDir: string,
    targetDir: string,
    variables: Record<string, any>,
  ): Promise<string[]> {
    const renderedFiles: string[] = []
    const entries = await fs.readdir(templateDir, { withFileTypes: true })

    for (const entry of entries) {
      const sourcePath = join(templateDir, entry.name)

      // 跳过模板配置文件
      if (entry.name === 'template.json') {
        continue
      }

      if (entry.isDirectory()) {
        const subRendered = await this.renderDirectory(
          sourcePath,
          join(targetDir, entry.name),
          variables,
        )
        renderedFiles.push(...subRendered)
      }
      else {
        const targetPath = join(targetDir, entry.name)
        await FileSystem.ensureDir(dirname(targetPath))

        if (this.isTemplateFile(sourcePath)) {
          const content = await fs.readFile(sourcePath, 'utf8')
          const renderedContent = this.renderString(content, variables)
          await fs.writeFile(targetPath, renderedContent, 'utf8')
        }
        else {
          await FileSystem.copy(sourcePath, targetPath)
        }

        renderedFiles.push(targetPath)
      }
    }

    return renderedFiles
  }

  private renderString(template: string, variables: Record<string, any>): string {
    return StringUtils.template(template, variables)
  }

  private isTemplateFile(filePath: string): boolean {
    const templateExtensions = [
      '.js',
      '.ts',
      '.json',
      '.md',
      '.txt',
      '.html',
      '.css',
      '.scss',
      '.vue',
      '.jsx',
      '.tsx',
    ]
    const ext = extname(filePath).toLowerCase()
    return templateExtensions.includes(ext)
  }

  private async copyTemplateFiles(sourceDir: string, targetDir: string): Promise<void> {
    const entries = await fs.readdir(sourceDir, { withFileTypes: true })

    for (const entry of entries) {
      const sourcePath = join(sourceDir, entry.name)
      const targetPath = join(targetDir, entry.name)

      if (entry.isDirectory()) {
        await FileSystem.ensureDir(targetPath)
        await this.copyTemplateFiles(sourcePath, targetPath)
      }
      else {
        await FileSystem.copy(sourcePath, targetPath)
      }
    }
  }

  private async executeHooks(
    hooks: string[],
    _workingDir: string,
    _variables: Record<string, any>,
  ): Promise<void> {
    for (const hook of hooks) {
      try {
        // 这里可以实现钩子执行逻辑
        // 例如执行 shell 命令或 JavaScript 函数
        this.logger?.debug(`执行钩子: ${hook}`)
      }
      catch (error) {
        this.logger?.warn(`钩子执行失败: ${hook}`, error)
      }
    }
  }

  /**
   * 创建模板管理器实例
   */
  static create(options: TemplateManagerOptions): TemplateManager {
    return new TemplateManager(options)
  }
}
