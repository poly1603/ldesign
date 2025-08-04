import type { DeviceType, TemplateMetadata, TemplateScanResult } from '../types'
import { templateRegistry } from '../core/template-registry'

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
    const errors: Error[] = []

    try {
      // 使用新的模板注册系统
      const templates = await templateRegistry.scanAndRegisterTemplates()

      // 更新本地缓存
      this.scannedTemplates.clear()
      templates.forEach(template => {
        this.scannedTemplates.set(this.getTemplateKey(template), template)
      })

      const duration = Date.now() - startTime

      return {
        templates,
        duration,
        scannedDirectories: templates.length,
        errors,
      }
    }
    catch (error) {
      errors.push(error as Error)
      const duration = Date.now() - startTime

      return {
        templates: [],
        duration,
        scannedDirectories: 0,
        errors,
      }
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
    return templateRegistry.getTemplatesByCategory(category)
  }

  /**
   * 获取指定设备类型的模板
   */
  getTemplatesByDevice(device: DeviceType): TemplateMetadata[] {
    return templateRegistry.getTemplatesByDevice(device)
  }

  /**
   * 获取指定分类和设备的模板
   */
  getTemplatesByCategoryAndDevice(category: string, device: DeviceType): TemplateMetadata[] {
    return templateRegistry.getTemplatesByCategoryAndDevice(category, device)
  }

  /**
   * 查找特定模板
   */
  findTemplate(category: string, device: DeviceType, template: string): TemplateMetadata | undefined {
    return templateRegistry.findTemplate(category, device, template)
  }

  /**
   * 获取所有可用的分类
   */
  getAvailableCategories(): string[] {
    return templateRegistry.getAvailableCategories()
  }

  /**
   * 获取指定分类下的所有设备类型
   */
  getAvailableDevices(category?: string): DeviceType[] {
    return templateRegistry.getAvailableDevices(category)
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): TemplateMetadata[] {
    return templateRegistry.getAllTemplates()
  }

  /**
   * 清空扫描缓存
   */
  clearCache(): void {
    this.scannedTemplates.clear()
    templateRegistry.clear()
  }
}
