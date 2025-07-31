/**
 * 模板管理器
 */

import type { DeviceType } from './device'
import type { TemplateConfig } from '../types'

export interface TemplateInfo {
  id: string
  name: string
  category: string
  device: DeviceType
  variant: string
  isDefault: boolean
  config: TemplateConfig
  component: any
}

export interface TemplateRegistry {
  [category: string]: {
    [device: string]: {
      [variant: string]: TemplateInfo
    }
  }
}

/**
 * 模板注册表
 */
const templateRegistry: TemplateRegistry = {}

/**
 * 注册模板
 */
export function registerTemplate(
  category: string,
  device: DeviceType,
  variant: string,
  config: TemplateConfig,
  component: any
): void {
  if (!templateRegistry[category]) {
    templateRegistry[category] = {}
  }
  
  if (!templateRegistry[category][device]) {
    templateRegistry[category][device] = {}
  }

  const templateInfo: TemplateInfo = {
    id: config.id,
    name: config.name,
    category,
    device,
    variant,
    isDefault: config.isDefault || false,
    config,
    component
  }

  templateRegistry[category][device][variant] = templateInfo
}

/**
 * 获取模板
 */
export function getTemplate(
  category: string,
  device: DeviceType,
  variant?: string
): TemplateInfo | null {
  const categoryTemplates = templateRegistry[category]
  if (!categoryTemplates) return null

  const deviceTemplates = categoryTemplates[device]
  if (!deviceTemplates) return null

  if (variant) {
    return deviceTemplates[variant] || null
  }

  // 如果没有指定变体，返回默认模板
  const defaultTemplate = Object.values(deviceTemplates).find(t => t.isDefault)
  if (defaultTemplate) return defaultTemplate

  // 如果没有默认模板，返回第一个
  const firstTemplate = Object.values(deviceTemplates)[0]
  return firstTemplate || null
}

/**
 * 获取设备类型的所有模板
 */
export function getTemplatesByDevice(
  category: string,
  device: DeviceType
): TemplateInfo[] {
  const categoryTemplates = templateRegistry[category]
  if (!categoryTemplates) return []

  const deviceTemplates = categoryTemplates[device]
  if (!deviceTemplates) return []

  return Object.values(deviceTemplates)
}

/**
 * 获取分类的所有模板
 */
export function getTemplatesByCategory(category: string): TemplateInfo[] {
  const categoryTemplates = templateRegistry[category]
  if (!categoryTemplates) return []

  const allTemplates: TemplateInfo[] = []
  
  Object.values(categoryTemplates).forEach(deviceTemplates => {
    Object.values(deviceTemplates).forEach(template => {
      allTemplates.push(template)
    })
  })

  return allTemplates
}

/**
 * 获取所有模板
 */
export function getAllTemplates(): TemplateInfo[] {
  const allTemplates: TemplateInfo[] = []
  
  Object.values(templateRegistry).forEach(categoryTemplates => {
    Object.values(categoryTemplates).forEach(deviceTemplates => {
      Object.values(deviceTemplates).forEach(template => {
        allTemplates.push(template)
      })
    })
  })

  return allTemplates
}

/**
 * 获取默认模板
 */
export function getDefaultTemplate(
  category: string,
  device: DeviceType
): TemplateInfo | null {
  const deviceTemplates = getTemplatesByDevice(category, device)
  return deviceTemplates.find(t => t.isDefault) || deviceTemplates[0] || null
}

/**
 * 检查模板是否存在
 */
export function hasTemplate(
  category: string,
  device: DeviceType,
  variant: string
): boolean {
  return getTemplate(category, device, variant) !== null
}

/**
 * 获取模板配置
 */
export function getTemplateConfig(
  category: string,
  device: DeviceType,
  variant: string
): TemplateConfig | null {
  const template = getTemplate(category, device, variant)
  return template?.config || null
}

/**
 * 获取模板组件
 */
export function getTemplateComponent(
  category: string,
  device: DeviceType,
  variant: string
): any {
  const template = getTemplate(category, device, variant)
  return template?.component || null
}

/**
 * 清空模板注册表
 */
export function clearTemplateRegistry(): void {
  Object.keys(templateRegistry).forEach(key => {
    delete templateRegistry[key]
  })
}

/**
 * 获取模板统计信息
 */
export function getTemplateStats(): {
  totalTemplates: number
  categoriesCount: number
  deviceBreakdown: Record<DeviceType, number>
  categoryBreakdown: Record<string, number>
} {
  const allTemplates = getAllTemplates()
  const categories = new Set<string>()
  const deviceBreakdown: Record<DeviceType, number> = {
    desktop: 0,
    tablet: 0,
    mobile: 0
  }
  const categoryBreakdown: Record<string, number> = {}

  allTemplates.forEach(template => {
    categories.add(template.category)
    deviceBreakdown[template.device]++
    categoryBreakdown[template.category] = (categoryBreakdown[template.category] || 0) + 1
  })

  return {
    totalTemplates: allTemplates.length,
    categoriesCount: categories.size,
    deviceBreakdown,
    categoryBreakdown
  }
}
