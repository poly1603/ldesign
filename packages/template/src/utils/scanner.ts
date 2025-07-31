import type { DeviceType, TemplateConfig, TemplateMetadata, TemplateScanResult } from '@/types'

/**
 * 模板文件扫描器
 */
export class TemplateScanner {
  private scannedTemplates: Map<string, TemplateMetadata> = new Map()

  constructor(_templateRoot = 'src/templates') {
    // templateRoot 参数保留用于未来扩展
  }

  /**
   * 扫描所有模板
   */
  async scanTemplates(): Promise<TemplateScanResult> {
    const startTime = Date.now()
    const templates: TemplateMetadata[] = []
    const errors: Error[] = []
    let scannedDirectories = 0

    try {
      // 在实际项目中，这里需要根据构建工具的不同来实现
      // 这里提供一个基于 import.meta.glob 的实现示例
      const templateModules = await this.scanTemplateModules()

      for (const [path, moduleFactory] of Object.entries(templateModules)) {
        try {
          const metadata = await this.parseTemplatePath(path, moduleFactory)
          if (metadata) {
            templates.push(metadata)
            this.scannedTemplates.set(this.getTemplateKey(metadata), metadata)
          }
          scannedDirectories++
        }
        catch (error) {
          errors.push(error as Error)
        }
      }
    }
    catch (error) {
      errors.push(error as Error)
    }

    const duration = Date.now() - startTime

    return {
      templates,
      duration,
      scannedDirectories,
      errors
    }
  }

  /**
   * 扫描模板模块（基于 Vite 的 import.meta.glob）
   */
  private async scanTemplateModules(): Promise<Record<string, () => Promise<any>>> {
    // 在实际项目中，这个方法会在构建时被替换
    // 这里提供一个模拟实现
    if (typeof import.meta !== 'undefined' && (import.meta as any).glob) {
      return (import.meta as any).glob('/src/templates/**/config.ts')
    }

    // 开发环境下的模拟数据
    return this.getMockTemplateModules()
  }

  /**
   * 获取模拟模板模块（用于开发和测试）
   */
  private getMockTemplateModules(): Record<string, () => Promise<any>> {
    return {
      '/src/templates/login/desktop/classic/config.ts': () => Promise.resolve({
        default: {
          name: 'classic',
          title: '经典登录',
          description: '传统的登录页面设计',
          version: '1.0.0',
          author: 'LDesign Team',
          tags: ['classic', 'simple'],
          responsive: true
        }
      }),
      '/src/templates/login/desktop/modern/config.ts': () => Promise.resolve({
        default: {
          name: 'modern',
          title: '现代登录',
          description: '现代化的登录页面设计',
          version: '1.0.0',
          author: 'LDesign Team',
          tags: ['modern', 'gradient'],
          responsive: true
        }
      }),
      '/src/templates/login/mobile/simple/config.ts': () => Promise.resolve({
        default: {
          name: 'simple',
          title: '简洁移动端',
          description: '适合移动端的简洁登录页',
          version: '1.0.0',
          author: 'LDesign Team',
          tags: ['mobile', 'simple'],
          responsive: true,
          maxWidth: 768
        }
      }),
      '/src/templates/dashboard/desktop/admin/config.ts': () => Promise.resolve({
        default: {
          name: 'admin',
          title: '管理后台',
          description: '功能完整的管理后台模板',
          version: '1.0.0',
          author: 'LDesign Team',
          tags: ['admin', 'dashboard'],
          responsive: true,
          minWidth: 1200
        }
      })
    }
  }

  /**
   * 解析模板路径并生成元数据
   */
  private async parseTemplatePath(
    configPath: string,
    moduleFactory: () => Promise<any>
  ): Promise<TemplateMetadata | null> {
    try {
      // 解析路径: /src/templates/category/device/template/config.ts
      const pathParts = configPath.split('/')
      const configIndex = pathParts.findIndex(part => part === 'config.ts')

      if (configIndex < 3)
        return null

      const template = pathParts[configIndex - 1]
      const device = pathParts[configIndex - 2] as DeviceType
      const category = pathParts[configIndex - 3]

      // 加载配置
      const configModule = await moduleFactory()
      const config: TemplateConfig = configModule.default || configModule

      // 生成组件和样式路径
      const basePath = pathParts.slice(0, configIndex).join('/')
      const componentPath = `${basePath}/index.tsx`
      const stylePath = `${basePath}/index.less`

      return {
        category,
        device,
        template,
        config,
        componentPath,
        stylePath
      }
    }
    catch (error) {
      console.warn(`Failed to parse template at ${configPath}:`, error)
      return null
    }
  }

  /**
   * 生成模板唯一键
   */
  private getTemplateKey(metadata: TemplateMetadata): string {
    return `${metadata.category}:${metadata.device}:${metadata.template}`
  }

  /**
   * 获取指定分类的模板
   */
  getTemplatesByCategory(category: string): TemplateMetadata[] {
    return Array.from(this.scannedTemplates.values())
      .filter(template => template.category === category)
  }

  /**
   * 获取指定设备类型的模板
   */
  getTemplatesByDevice(device: DeviceType): TemplateMetadata[] {
    return Array.from(this.scannedTemplates.values())
      .filter(template => template.device === device)
  }

  /**
   * 获取指定分类和设备的模板
   */
  getTemplatesByCategoryAndDevice(category: string, device: DeviceType): TemplateMetadata[] {
    return Array.from(this.scannedTemplates.values())
      .filter(template =>
        template.category === category && template.device === device
      )
  }

  /**
   * 查找特定模板
   */
  findTemplate(category: string, device: DeviceType, template: string): TemplateMetadata | undefined {
    const key = `${category}:${device}:${template}`
    return this.scannedTemplates.get(key)
  }

  /**
   * 获取所有可用的分类
   */
  getAvailableCategories(): string[] {
    const categories = new Set<string>()
    this.scannedTemplates.forEach((template) => {
      categories.add(template.category)
    })
    return Array.from(categories)
  }

  /**
   * 获取指定分类下的所有设备类型
   */
  getAvailableDevices(category?: string): DeviceType[] {
    const devices = new Set<DeviceType>()
    this.scannedTemplates.forEach((template) => {
      if (!category || template.category === category) {
        devices.add(template.device)
      }
    })
    return Array.from(devices)
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): TemplateMetadata[] {
    return Array.from(this.scannedTemplates.values())
  }

  /**
   * 清空扫描缓存
   */
  clearCache(): void {
    this.scannedTemplates.clear()
  }
}
