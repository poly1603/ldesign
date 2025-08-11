import type { DeviceType, TemplateMetadata, TemplateScanResult } from '../types'
import { TemplateScanner as CoreTemplateScanner } from '../core/scanner'

/**
 * 模板文件扫描器 - 简化版本，委托给核心扫描器
 */
export class TemplateScanner {
  private coreScanner: CoreTemplateScanner

  constructor(templateRoot = 'src/templates') {
    this.coreScanner = new CoreTemplateScanner({
      templateRoot,
      enableCache: true,
    })
  }

  /**
   * 扫描所有模板 - 委托给核心扫描器
   */
  async scanTemplates(): Promise<TemplateScanResult> {
    return this.coreScanner.scanTemplates()
  }

  /**
   * 获取指定分类的模板 - 委托给核心扫描器
   */
  getTemplatesByCategory(category: string): TemplateMetadata[] {
    return this.coreScanner.getTemplatesByCategory(category)
  }

  /**
   * 获取指定设备类型的模板 - 委托给核心扫描器
   */
  getTemplatesByDevice(device: DeviceType): TemplateMetadata[] {
    return this.coreScanner.getTemplatesByDevice(device)
  }

  /**
   * 获取指定分类和设备的模板 - 委托给核心扫描器
   */
  getTemplatesByCategoryAndDevice(
    category: string,
    device: DeviceType
  ): TemplateMetadata[] {
    const templates = this.coreScanner.getTemplatesByCategory(category)
    return templates.filter(t => t.device === device)
  }

  /**
   * 查找特定模板 - 委托给核心扫描器
   */
  findTemplate(
    category: string,
    device: DeviceType,
    template: string
  ): TemplateMetadata | undefined {
    const result = this.coreScanner.findTemplate(category, device, template)
    return result ?? undefined
  }

  /**
   * 获取所有可用的分类 - 委托给核心扫描器
   */
  getAvailableCategories(): string[] {
    return this.coreScanner.getAvailableCategories()
  }

  /**
   * 获取指定分类下的所有设备类型 - 委托给核心扫描器
   */
  getAvailableDevices(category?: string): DeviceType[] {
    if (category) {
      const templates = this.coreScanner.getTemplatesByCategory(category)
      const devices = new Set(templates.map(t => t.device))
      return Array.from(devices).sort() as DeviceType[]
    }
    return this.coreScanner.getAvailableDevices()
  }

  /**
   * 获取所有模板 - 委托给核心扫描器
   */
  getAllTemplates(): TemplateMetadata[] {
    return this.coreScanner.getAllTemplates()
  }

  /**
   * 清空扫描缓存 - 委托给核心扫描器
   */
  clearCache(): void {
    this.coreScanner.clearCache()
  }
}
