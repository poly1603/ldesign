/**
 * 模板扫描器
 * 自动扫描templates目录，支持多层级目录结构（分类/设备类型/模板名称）
 */

// 条件导入Node.js模块
let readdir: any, stat: any, join: any, resolve: any, extname: any, basename: any

// 在浏览器环境中提供mock实现
if (typeof window === 'undefined') {
  // Node.js环境
  try {
    const fs = require('fs/promises')
    const path = require('path')
    readdir = fs.readdir
    stat = fs.stat
    join = path.join
    resolve = path.resolve
    extname = path.extname
    basename = path.basename
  } catch (error) {
    console.warn('Failed to import Node.js modules:', error)
  }
} else {
  // 浏览器环境的mock实现
  readdir = async () => []
  stat = async () => ({ isDirectory: () => false })
  join = (...args: string[]) => args.join('/')
  resolve = (path: string) => path
  extname = (path: string) => path.split('.').pop() || ''
  basename = (path: string) => path.split('/').pop() || ''
}
import type { DeviceType, TemplateConfig, TemplateInfo } from '../types'

export interface ScanOptions {
  /** 模板根目录，支持多个目录 */
  templateRoot: string | string[]
  /** 支持的文件扩展名 */
  extensions?: string[]
  /** 是否递归扫描 */
  recursive?: boolean
  /** 最大扫描深度 */
  maxDepth?: number
}

export interface ScanResult {
  /** 扫描到的模板数量 */
  count: number
  /** 模板信息列表 */
  templates: TemplateInfo[]
  /** 扫描耗时（毫秒） */
  duration: number
  /** 扫描的目录结构 */
  structure: Record<string, Record<DeviceType, string[]>>
}

/**
 * 模板扫描器类
 * 负责自动发现和解析模板文件
 */
export class TemplateScanner {
  private options: Required<ScanOptions>

  constructor(options: ScanOptions) {
    this.options = {
      extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js'],
      recursive: true,
      maxDepth: 3,
      ...options,
    }
  }

  /**
   * 解析模板路径
   */
  private resolveTemplatePath(templatePath: string): string {
    // 处理特殊的包路径
    if (templatePath.startsWith('@ldesign/template/templates')) {
      // 在浏览器环境中，这个路径会被Vite处理
      // 在Node.js环境中，需要解析到实际的文件系统路径
      if (typeof window === 'undefined') {
        // Node.js环境：解析到包的实际路径
        try {
          const packagePath = require.resolve('@ldesign/template/package.json')
          const packageDir = path.dirname(packagePath)
          return path.join(packageDir, 'src', 'templates')
        } catch {
          // 如果无法解析包路径，使用相对路径
          return resolve('../../src/templates')
        }
      } else {
        // 浏览器环境：使用相对路径
        return resolve('../../src/templates')
      }
    }

    return resolve(templatePath)
  }

  /**
   * 扫描模板目录
   */
  async scan(): Promise<ScanResult> {
    const startTime = Date.now()
    const templates: TemplateInfo[] = []
    const structure: Record<string, Record<DeviceType, string[]>> = {}

    try {
      // 支持多个模板目录
      const templateRoots = Array.isArray(this.options.templateRoot)
        ? this.options.templateRoot
        : [this.options.templateRoot]

      // 扫描所有模板目录
      for (const templateRootPath of templateRoots) {
        const templateRoot = this.resolveTemplatePath(templateRootPath)

        // 检查模板根目录是否存在
        try {
          await stat(templateRoot)
        } catch {
          console.warn(`Template root directory not found: ${templateRoot}`)
          continue
        }

        // 扫描第一层：模板分类
        const categories = await this.scanDirectory(templateRoot)

        for (const category of categories) {
          const categoryPath = join(templateRoot, category)
          const categoryStats = await stat(categoryPath)

          if (!categoryStats.isDirectory()) continue

          structure[category] = {} as Record<DeviceType, string[]>

          // 扫描第二层：设备类型
          const devices = await this.scanDirectory(categoryPath)

          for (const device of devices) {
            if (!this.isValidDeviceType(device)) continue

            const devicePath = join(categoryPath, device)
            const deviceStats = await stat(devicePath)

            if (!deviceStats.isDirectory()) continue

            structure[category][device as DeviceType] = []

            // 扫描第三层：具体模板
            const templateNames = await this.scanDirectory(devicePath)

            for (const templateName of templateNames) {
              const templatePath = join(devicePath, templateName)
              const templateStats = await stat(templatePath)

              if (!templateStats.isDirectory()) continue

              // 解析模板信息
              const templateInfo = await this.parseTemplate(
                category,
                device as DeviceType,
                templateName,
                templatePath
              )

              if (templateInfo) {
                templates.push(templateInfo)
                structure[category][device as DeviceType].push(templateName)
              }
            }
          }
        }
      }

      return {
        count: templates.length,
        templates,
        duration: Date.now() - startTime,
        structure,
      }
    } catch (error) {
      console.error('Template scanning failed:', error)
      return {
        count: 0,
        templates: [],
        duration: Date.now() - startTime,
        structure: {},
      }
    }
  }

  /**
   * 扫描目录，返回子目录和文件名列表
   */
  private async scanDirectory(dirPath: string): Promise<string[]> {
    try {
      const entries = await readdir(dirPath)
      return entries.filter(entry => !entry.startsWith('.'))
    } catch {
      return []
    }
  }

  /**
   * 检查是否为有效的设备类型
   */
  private isValidDeviceType(device: string): boolean {
    return ['desktop', 'tablet', 'mobile'].includes(device)
  }

  /**
   * 解析单个模板
   */
  private async parseTemplate(
    category: string,
    deviceType: DeviceType,
    templateName: string,
    templatePath: string
  ): Promise<TemplateInfo | null> {
    try {
      // 查找配置文件
      const configPath = join(templatePath, 'config.ts')
      let config: TemplateConfig | null = null

      try {
        // 动态导入配置文件
        const configModule = await import(configPath)
        config = configModule.default || configModule.config
      } catch {
        // 如果没有配置文件，使用默认配置
        config = this.createDefaultConfig(category, deviceType, templateName)
      }

      // 查找组件文件
      const componentFile = await this.findComponentFile(templatePath)
      if (!componentFile) {
        console.warn(`No component file found in template: ${templatePath}`)
        return null
      }

      // 构建模板信息
      const templateInfo: TemplateInfo = {
        id: `${category}-${deviceType}-${templateName}`,
        name: config?.name || templateName,
        displayName: config?.name || this.formatDisplayName(templateName),
        description: config?.description || `${category} template for ${deviceType}`,
        category,
        deviceType,
        version: config?.version || '1.0.0',
        author: config?.author || 'Unknown',
        tags: config?.tags || [category, deviceType],
        path: templatePath,
        componentPath: componentFile,
        component: null, // 将在运行时动态加载
        thumbnail: config?.thumbnail || '',
        status: 'discovered',
        dependencies: config?.dependencies || [],
        props: config?.props || {},
        isDefault: config?.isDefault || false,
        features: config?.features || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return templateInfo
    } catch (error) {
      console.error(`Failed to parse template ${templatePath}:`, error)
      return null
    }
  }

  /**
   * 查找组件文件
   */
  private async findComponentFile(templatePath: string): Promise<string | null> {
    const possibleFiles = [
      'index.vue',
      'index.tsx',
      'index.ts',
      'index.jsx',
      'index.js',
      'component.vue',
      'component.tsx',
      'template.vue',
      'template.tsx',
    ]

    for (const fileName of possibleFiles) {
      const filePath = join(templatePath, fileName)
      try {
        await stat(filePath)
        return filePath
      } catch {
        continue
      }
    }

    return null
  }

  /**
   * 创建默认配置
   */
  private createDefaultConfig(
    category: string,
    deviceType: DeviceType,
    templateName: string
  ): TemplateConfig {
    return {
      id: templateName,
      name: this.formatDisplayName(templateName),
      description: `${category} template for ${deviceType}`,
      version: '1.0.0',
      author: 'LDesign Team',
      category,
      device: deviceType,
      variant: templateName,
      isDefault: templateName === 'default',
      features: ['responsive'],
      props: {},
    }
  }

  /**
   * 格式化显示名称
   */
  private formatDisplayName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * 更新扫描选项
   */
  updateOptions(options: Partial<ScanOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取当前扫描选项
   */
  getOptions(): Required<ScanOptions> {
    return { ...this.options }
  }
}

/**
 * 创建模板扫描器实例
 */
export function createTemplateScanner(options: ScanOptions): TemplateScanner {
  return new TemplateScanner(options)
}
