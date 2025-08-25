import { ref, computed } from 'vue'
import type { 
  TemplateConfig, 
  ExternalTemplate, 
  TemplateExtensionOptions,
  TemplateRegistryItem,
  DeviceType 
} from '../../types'

/**
 * 模板扩展管理器
 * 负责处理外部模板的注册、合并和管理
 */

// 全局外部模板存储
const externalTemplates = ref<ExternalTemplate[]>([])
const extensionOptions = ref<TemplateExtensionOptions>({
  overrideDefaults: false,
  mergeConflicts: true,
  priorityStrategy: 'external'
})

/**
 * 模板扩展组合函数
 */
export function useTemplateExtension() {
  
  /**
   * 注册外部模板
   */
  const registerExternalTemplate = (template: ExternalTemplate) => {
    // 验证模板配置
    if (!validateTemplateConfig(template.config)) {
      throw new Error(`Invalid template config for ${template.config.id}`)
    }

    // 检查是否已存在
    const existingIndex = externalTemplates.value.findIndex(
      t => t.config.id === template.config.id
    )

    if (existingIndex >= 0) {
      // 根据策略决定是否覆盖
      if (extensionOptions.value.mergeConflicts) {
        externalTemplates.value[existingIndex] = template
      }
    } else {
      externalTemplates.value.push(template)
    }
  }

  /**
   * 批量注册外部模板
   */
  const registerExternalTemplates = (templates: ExternalTemplate[]) => {
    templates.forEach(registerExternalTemplate)
  }

  /**
   * 移除外部模板
   */
  const unregisterExternalTemplate = (templateId: string) => {
    const index = externalTemplates.value.findIndex(t => t.config.id === templateId)
    if (index >= 0) {
      externalTemplates.value.splice(index, 1)
    }
  }

  /**
   * 设置扩展选项
   */
  const setExtensionOptions = (options: Partial<TemplateExtensionOptions>) => {
    extensionOptions.value = { ...extensionOptions.value, ...options }
  }

  /**
   * 将外部模板转换为注册表项
   */
  const convertToRegistryItem = (template: ExternalTemplate): TemplateRegistryItem => {
    const config = template.config
    return {
      name: config.variant || config.name,
      displayName: config.name,
      description: config.description || '',
      version: config.version || '1.0.0',
      tags: config.tags || [],
      thumbnail: config.preview || '',
      path: `external://${config.id}`,
      category: config.category,
      deviceType: config.device,
      isExternal: true,
      externalTemplate: template
    }
  }

  /**
   * 获取扩展的模板注册表项
   */
  const getExtendedRegistryItems = computed(() => {
    return externalTemplates.value.map(convertToRegistryItem)
  })

  /**
   * 根据分类和设备类型获取扩展模板
   */
  const getExtendedTemplatesByCategory = (category: string, deviceType?: DeviceType) => {
    return computed(() => {
      return getExtendedRegistryItems.value.filter(item => {
        const categoryMatch = item.category === category
        const deviceMatch = !deviceType || item.deviceType === deviceType
        return categoryMatch && deviceMatch
      })
    })
  }

  /**
   * 查找外部模板
   */
  const findExternalTemplate = (templateId: string): ExternalTemplate | undefined => {
    return externalTemplates.value.find(t => t.config.id === templateId)
  }

  /**
   * 合并默认模板和外部模板
   */
  const mergeWithDefaultTemplates = (defaultTemplates: TemplateRegistryItem[]): TemplateRegistryItem[] => {
    const extended = getExtendedRegistryItems.value
    
    if (extensionOptions.value.overrideDefaults) {
      // 外部模板优先，替换同名默认模板
      const merged = [...defaultTemplates]
      
      extended.forEach(extTemplate => {
        const existingIndex = merged.findIndex(
          t => t.category === extTemplate.category && 
              t.deviceType === extTemplate.deviceType &&
              t.name === extTemplate.name
        )
        
        if (existingIndex >= 0) {
          merged[existingIndex] = extTemplate
        } else {
          merged.push(extTemplate)
        }
      })
      
      return merged
    } else {
      // 简单合并，外部模板作为额外选项
      return [...defaultTemplates, ...extended]
    }
  }

  /**
   * 验证模板配置
   */
  const validateTemplateConfig = (config: TemplateConfig): boolean => {
    if (!config.id || !config.name || !config.category || !config.device) {
      return false
    }
    
    if (!['desktop', 'mobile', 'tablet'].includes(config.device)) {
      return false
    }
    
    return true
  }

  /**
   * 获取模板统计信息
   */
  const getExtensionStats = computed(() => {
    const stats = {
      total: externalTemplates.value.length,
      byCategory: {} as Record<string, number>,
      byDevice: {} as Record<DeviceType, number>
    }

    externalTemplates.value.forEach(template => {
      const category = template.config.category
      const device = template.config.device

      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
      stats.byDevice[device] = (stats.byDevice[device] || 0) + 1
    })

    return stats
  })

  /**
   * 清空所有外部模板
   */
  const clearExternalTemplates = () => {
    externalTemplates.value = []
  }

  /**
   * 重置扩展选项
   */
  const resetExtensionOptions = () => {
    extensionOptions.value = {
      overrideDefaults: false,
      mergeConflicts: true,
      priorityStrategy: 'external'
    }
  }

  return {
    // 状态
    externalTemplates: computed(() => externalTemplates.value),
    extensionOptions: computed(() => extensionOptions.value),
    getExtendedRegistryItems,
    getExtensionStats,

    // 注册方法
    registerExternalTemplate,
    registerExternalTemplates,
    unregisterExternalTemplate,

    // 配置方法
    setExtensionOptions,
    resetExtensionOptions,

    // 查询方法
    getExtendedTemplatesByCategory,
    findExternalTemplate,
    mergeWithDefaultTemplates,

    // 工具方法
    validateTemplateConfig,
    convertToRegistryItem,
    clearExternalTemplates
  }
}

/**
 * 创建外部模板的辅助函数
 */
export function createExternalTemplate(
  config: TemplateConfig,
  component: any,
  options?: {
    styles?: string
    assets?: Record<string, string>
  }
): ExternalTemplate {
  return {
    config,
    component,
    styles: options?.styles,
    assets: options?.assets
  }
}

/**
 * 从模板目录结构创建外部模板
 */
export async function createExternalTemplateFromPath(
  basePath: string,
  category: string,
  device: DeviceType,
  variant: string
): Promise<ExternalTemplate> {
  const configPath = `${basePath}/${category}/${device}/${variant}/config.ts`
  const componentPath = `${basePath}/${category}/${device}/${variant}/index.tsx`
  
  try {
    // 动态导入配置和组件
    const configModule = await import(/* @vite-ignore */ configPath)
    const componentModule = await import(/* @vite-ignore */ componentPath)
    
    const config = configModule.default || configModule.config
    const component = componentModule.default
    
    if (!config || !component) {
      throw new Error(`Failed to load template from ${basePath}`)
    }
    
    return createExternalTemplate(config, component)
  } catch (error) {
    throw new Error(`Failed to create external template: ${error}`)
  }
}
