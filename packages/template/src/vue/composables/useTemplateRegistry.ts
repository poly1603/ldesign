import type { DeviceType, TemplateRegistryItem } from '../../types'
import { computed, ref } from 'vue'
import { useTemplateExtension } from './useTemplateExtension'

// 全局模板注册表
const templateRegistry = ref<TemplateRegistryItem[]>([])

// 实际存在的模板数据 - 基于真实的模板文件结构
const defaultTemplates: TemplateRegistryItem[] = [
  // 登录模板 - 桌面端变体
  {
    name: 'login-default',
    displayName: '默认登录模板',
    description: '简洁的默认登录模板',
    version: '1.0.0',
    tags: ['默认', '简洁', '登录'],
    thumbnail: '/thumbnails/login-default.png',
    path: 'src/templates/login/desktop/default/index.vue',
    category: 'login',
    deviceType: 'desktop',
    variant: 'default',
    isDefault: true,
  },
  {
    name: 'login-modern',
    displayName: '现代登录',
    description: '现代化的桌面端登录界面，采用渐变色彩和动效',
    version: '1.0.0',
    tags: ['现代', '渐变', '动画', '创新'],
    thumbnail: '/thumbnails/login-modern.png',
    path: 'src/templates/login/desktop/modern/index.tsx',
    category: 'login',
    deviceType: 'desktop',
    variant: 'modern',
    isDefault: false,
  },
  {
    name: 'login-classic',
    displayName: '经典登录',
    description: '经典风格的登录界面，适合传统企业',
    version: '1.0.0',
    tags: ['经典', '传统', '稳重'],
    thumbnail: '/thumbnails/login-classic.png',
    path: 'src/templates/login/desktop/classic/index.tsx',
    category: 'login',
    deviceType: 'desktop',
    variant: 'classic',
    isDefault: false,
  },
  {
    name: 'login-adaptive',
    displayName: '自适应登录',
    description: '自适应设计的登录界面，支持多种屏幕尺寸',
    version: '1.0.0',
    tags: ['自适应', '响应式', '灵活'],
    thumbnail: '/thumbnails/login-adaptive.png',
    path: 'src/templates/login/desktop/adaptive/index.tsx',
    category: 'login',
    deviceType: 'desktop',
    variant: 'adaptive',
    isDefault: false,
  },

  // 登录模板 - 移动端变体
  {
    name: 'login-mobile-default',
    displayName: '移动端默认登录',
    description: '针对移动设备优化的默认登录表单',
    version: '1.0.0',
    tags: ['移动端', '触摸优化', '默认'],
    thumbnail: '/thumbnails/login-mobile-default.png',
    path: 'src/templates/login/mobile/default/index.vue',
    category: 'login',
    deviceType: 'mobile',
    variant: 'default',
    isDefault: true,
  },
  {
    name: 'login-mobile-card',
    displayName: '移动端卡片登录',
    description: '卡片式设计的移动端登录界面',
    version: '1.0.0',
    tags: ['移动端', '卡片', '现代'],
    thumbnail: '/thumbnails/login-mobile-card.png',
    path: 'src/templates/login/mobile/card/index.tsx',
    category: 'login',
    deviceType: 'mobile',
    variant: 'card',
    isDefault: false,
  },
  {
    name: 'login-mobile-simple',
    displayName: '移动端简洁登录',
    description: '极简设计的移动端登录界面',
    version: '1.0.0',
    tags: ['移动端', '简洁', '极简'],
    thumbnail: '/thumbnails/login-mobile-simple.png',
    path: 'src/templates/login/mobile/simple/index.tsx',
    category: 'login',
    deviceType: 'mobile',
    variant: 'simple',
    isDefault: false,
  },

  // 登录模板 - 平板端变体
  {
    name: 'login-tablet-default',
    displayName: '平板端默认登录',
    description: '针对平板设备优化的默认登录表单',
    version: '1.0.0',
    tags: ['平板端', '触摸优化', '默认'],
    thumbnail: '/thumbnails/login-tablet-default.png',
    path: 'src/templates/login/tablet/default/index.vue',
    category: 'login',
    deviceType: 'tablet',
    variant: 'default',
    isDefault: true,
  },
  {
    name: 'login-tablet-adaptive',
    displayName: '平板端自适应登录',
    description: '自适应设计的平板端登录界面',
    version: '1.0.0',
    tags: ['平板端', '自适应', '响应式'],
    thumbnail: '/thumbnails/login-tablet-adaptive.png',
    path: 'src/templates/login/tablet/adaptive/index.tsx',
    category: 'login',
    deviceType: 'tablet',
    variant: 'adaptive',
    isDefault: false,
  },
  {
    name: 'login-tablet-split',
    displayName: '平板端分屏登录',
    description: '分屏设计的平板端登录界面',
    version: '1.0.0',
    tags: ['平板端', '分屏', '布局'],
    thumbnail: '/thumbnails/login-tablet-split.png',
    path: 'src/templates/login/tablet/split/index.tsx',
    category: 'login',
    deviceType: 'tablet',
    variant: 'split',
    isDefault: false,
  },
]

export function useTemplateRegistry() {
  // 获取模板扩展管理器
  const {
    mergeWithDefaultTemplates,
    getExtendedRegistryItems,
    registerExternalTemplate,
    registerExternalTemplates,
    findExternalTemplate,
  } = useTemplateExtension()

  // 初始化默认模板
  if (templateRegistry.value.length === 0) {
    templateRegistry.value = [...defaultTemplates]
  }

  // 注册单个模板
  const registerTemplate = (template: TemplateRegistryItem) => {
    const existingIndex = templateRegistry.value.findIndex(
      t => t.name === template.name
        && t.category === template.category
        && t.deviceType === template.deviceType,
    )

    if (existingIndex >= 0) {
      templateRegistry.value[existingIndex] = template
    }
    else {
      templateRegistry.value.push(template)
    }
  }

  // 批量注册模板
  const registerTemplates = (templates: TemplateRegistryItem[]) => {
    templates.forEach(registerTemplate)
  }

  // 注销模板
  const unregisterTemplate = (name: string, category: string, deviceType: DeviceType) => {
    const index = templateRegistry.value.findIndex(
      t => t.name === name && t.category === category && t.deviceType === deviceType,
    )

    if (index >= 0) {
      templateRegistry.value.splice(index, 1)
    }
  }

  // 获取所有模板（包含扩展模板）
  const getAllTemplates = () => {
    return computed(() => mergeWithDefaultTemplates(templateRegistry.value))
  }

  // 根据分类和设备类型获取模板（包含扩展模板）
  const getTemplatesByCategory = (category: string, deviceType: DeviceType) => {
    const allTemplates = mergeWithDefaultTemplates(templateRegistry.value)
    return allTemplates.filter(
      t => t.category === category && t.deviceType === deviceType,
    )
  }

  // 根据名称查找模板
  const findTemplate = (name: string, category: string, deviceType: DeviceType) => {
    return templateRegistry.value.find(
      t => t.name === name && t.category === category && t.deviceType === deviceType,
    )
  }

  // 搜索模板
  const searchTemplates = (query: string, category?: string, deviceType?: DeviceType) => {
    let filtered = templateRegistry.value

    if (category) {
      filtered = filtered.filter(t => t.category === category)
    }

    if (deviceType) {
      filtered = filtered.filter(t => t.deviceType === deviceType)
    }

    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(lowerQuery)
        || t.displayName?.toLowerCase().includes(lowerQuery)
        || t.description?.toLowerCase().includes(lowerQuery)
        || t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)),
      )
    }

    return filtered
  }

  // 获取所有分类
  const getAllCategories = () => {
    return computed(() =>
      [...new Set(templateRegistry.value.map(t => t.category))],
    )
  }

  // 获取所有设备类型
  const getAllDeviceTypes = () => {
    return computed(() =>
      [...new Set(templateRegistry.value.map(t => t.deviceType))],
    )
  }

  // 获取模板统计信息
  const getTemplateStats = () => {
    return computed(() => {
      const stats = {
        total: templateRegistry.value.length,
        byCategory: {} as Record<string, number>,
        byDeviceType: {} as Record<string, number>,
        byVersion: {} as Record<string, number>,
      }

      templateRegistry.value.forEach((template) => {
        // 按分类统计
        stats.byCategory[template.category] = (stats.byCategory[template.category] || 0) + 1

        // 按设备类型统计
        stats.byDeviceType[template.deviceType] = (stats.byDeviceType[template.deviceType] || 0) + 1

        // 按版本统计
        if (template.version) {
          stats.byVersion[template.version] = (stats.byVersion[template.version] || 0) + 1
        }
      })

      return stats
    })
  }

  // 获取推荐模板
  const getRecommendedTemplates = (category: string, deviceType: DeviceType, limit = 3) => {
    return computed(() => {
      // 简单的推荐算法：按版本号和标签数量排序
      return templateRegistry.value
        .filter(t => t.category === category && t.deviceType === deviceType)
        .sort((a, b) => {
          const aScore = (a.version ? Number.parseFloat(a.version) : 0) + (a.tags?.length || 0)
          const bScore = (b.version ? Number.parseFloat(b.version) : 0) + (b.tags?.length || 0)
          return bScore - aScore
        })
        .slice(0, limit)
    })
  }

  // 清空注册表
  const clearRegistry = () => {
    templateRegistry.value = []
  }

  // 重置为默认模板
  const resetToDefaults = () => {
    templateRegistry.value = [...defaultTemplates]
  }

  return {
    // 状态
    templateRegistry: computed(() => templateRegistry.value),

    // 注册方法
    registerTemplate,
    registerTemplates,
    unregisterTemplate,

    // 扩展模板方法
    registerExternalTemplate,
    registerExternalTemplates,
    findExternalTemplate,

    // 查询方法
    getAllTemplates,
    getTemplatesByCategory,
    findTemplate,
    searchTemplates,
    getAllCategories,
    getAllDeviceTypes,
    getTemplateStats,
    getRecommendedTemplates,

    // 管理方法
    clearRegistry,
    resetToDefaults,
  }
}
