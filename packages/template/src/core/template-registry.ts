import type { Component } from 'vue'
import type { DeviceType, TemplateMetadata } from '../types'
import { templateLoader } from './template-loader'

/**
 * 模板注册表 - 使用新的模板加载器
 */
export class TemplateRegistry {
  private templates = new Map<string, TemplateMetadata>()

  constructor() {
    // 不再需要初始化，使用模板加载器
  }

  /**
   * 扫描并注册所有模板
   */
  async scanAndRegisterTemplates(): Promise<TemplateMetadata[]> {
    try {
      const templates = await templateLoader.scanAndRegisterTemplates()

      // 更新本地缓存
      this.templates.clear()
      templates.forEach((template) => {
        this.templates.set(this.getTemplateKey(template), template)
      })

      return templates
    }
    catch (error) {
      console.warn('Failed to scan templates:', error)
      return []
    }
  }

  /**
   * 动态加载模板组件
   */
  async loadTemplateComponent(metadata: TemplateMetadata): Promise<Component> {
    return templateLoader.loadTemplateComponent(metadata)
  }

  /**
   * 生成模板唯一键
   */
  private getTemplateKey(metadata: TemplateMetadata): string {
    return `${metadata.category}:${metadata.device}:${metadata.template}`
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): TemplateMetadata[] {
    return templateLoader.getAllTemplates()
  }

  /**
   * 根据分类获取模板
   */
  getTemplatesByCategory(category: string): TemplateMetadata[] {
    return templateLoader.getTemplatesByCategory(category)
  }

  /**
   * 根据设备类型获取模板
   */
  getTemplatesByDevice(device: DeviceType): TemplateMetadata[] {
    return templateLoader.getTemplatesByDevice(device)
  }

  /**
   * 根据分类和设备获取模板
   */
  getTemplatesByCategoryAndDevice(category: string, device: DeviceType): TemplateMetadata[] {
    return templateLoader.getTemplatesByCategoryAndDevice(category, device)
  }

  /**
   * 查找特定模板
   */
  findTemplate(category: string, device: DeviceType, template: string): TemplateMetadata | undefined {
    return templateLoader.findTemplate(category, device, template)
  }

  /**
   * 获取可用分类
   */
  getAvailableCategories(): string[] {
    return templateLoader.getAvailableCategories()
  }

  /**
   * 获取可用设备类型
   */
  getAvailableDevices(category?: string): DeviceType[] {
    return templateLoader.getAvailableDevices(category)
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.templates.clear()
    templateLoader.clear()
  }
}

// 全局模板注册表实例
export const templateRegistry = new TemplateRegistry()
