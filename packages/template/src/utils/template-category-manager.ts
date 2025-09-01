/**
 * 模板分类管理器实现
 * 提供模板分类、标签、搜索、过滤和排序功能
 */

import type {
  CategoryInfo,
  ExtendedTemplateMetadata,
  TagInfo,
  TemplateCategory,
  TemplateCategoryConfig,
  TemplateCategoryManager,
  TemplateFilter,
  TemplateGroupOptions,
  TemplateSortOptions,
  TemplateTag,
} from '../types/template-categories'

/**
 * 模板分类管理器实现类
 */
export class TemplateCategoryManagerImpl implements TemplateCategoryManager {
  private config: TemplateCategoryConfig

  constructor(config?: Partial<TemplateCategoryConfig>) {
    this.config = {
      categories: new Map(),
      tags: new Map(),
      hierarchy: new Map(),
      defaultCategory: 'login' as TemplateCategory,
      enabledCategories: new Set(),
      ...config,
    }

    // 初始化默认分类和标签
    this.initializeDefaults()
  }

  /**
   * 初始化默认分类和标签
   */
  private initializeDefaults(): void {
    // 初始化默认分类
    this.initializeDefaultCategories()

    // 初始化默认标签
    this.initializeDefaultTags()

    // 构建分类层次结构
    this.buildCategoryHierarchy()
  }

  /**
   * 初始化默认分类
   */
  private initializeDefaultCategories(): void {
    const defaultCategories: CategoryInfo[] = [
      // 认证相关
      {
        id: 'auth' as TemplateCategory,
        name: '认证',
        description: '用户认证相关模板',
        icon: 'shield-check',
        children: ['login', 'register', 'reset-password', 'verify'] as TemplateCategory[],
        defaultTags: ['responsive', 'accessible'] as TemplateTag[],
        supportedDevices: ['desktop', 'tablet', 'mobile'],
        priority: 4,
        enabled: true,
      },
      {
        id: 'login' as TemplateCategory,
        name: '登录',
        description: '用户登录页面模板',
        icon: 'log-in',
        parent: 'auth' as TemplateCategory,
        defaultTags: ['responsive', 'accessible', 'professional'] as TemplateTag[],
        supportedDevices: ['desktop', 'tablet', 'mobile'],
        priority: 4,
        enabled: true,
      },
      {
        id: 'register' as TemplateCategory,
        name: '注册',
        description: '用户注册页面模板',
        icon: 'user-plus',
        parent: 'auth' as TemplateCategory,
        defaultTags: ['responsive', 'accessible'] as TemplateTag[],
        supportedDevices: ['desktop', 'tablet', 'mobile'],
        priority: 3,
        enabled: true,
      },

      // 仪表板相关
      {
        id: 'dashboard' as TemplateCategory,
        name: '仪表板',
        description: '数据展示和管理面板',
        icon: 'layout-dashboard',
        children: ['overview', 'analytics', 'reports'] as TemplateCategory[],
        defaultTags: ['responsive', 'interactive', 'professional'] as TemplateTag[],
        supportedDevices: ['desktop', 'tablet'],
        priority: 4,
        enabled: true,
      },
      {
        id: 'overview' as TemplateCategory,
        name: '概览',
        description: '数据概览和摘要展示',
        icon: 'chart-line',
        parent: 'dashboard' as TemplateCategory,
        defaultTags: ['responsive', 'interactive'] as TemplateTag[],
        supportedDevices: ['desktop', 'tablet'],
        priority: 3,
        enabled: true,
      },

      // 用户管理
      {
        id: 'user' as TemplateCategory,
        name: '用户',
        description: '用户管理相关模板',
        icon: 'users',
        children: ['profile', 'settings', 'permissions'] as TemplateCategory[],
        defaultTags: ['responsive', 'accessible'] as TemplateTag[],
        supportedDevices: ['desktop', 'tablet', 'mobile'],
        priority: 3,
        enabled: true,
      },
      {
        id: 'profile' as TemplateCategory,
        name: '个人资料',
        description: '用户个人资料页面',
        icon: 'user',
        parent: 'user' as TemplateCategory,
        defaultTags: ['responsive', 'accessible'] as TemplateTag[],
        supportedDevices: ['desktop', 'tablet', 'mobile'],
        priority: 3,
        enabled: true,
      },

      // 表单相关
      {
        id: 'form' as TemplateCategory,
        name: '表单',
        description: '各种表单模板',
        icon: 'file-text',
        children: ['contact', 'survey', 'feedback'] as TemplateCategory[],
        defaultTags: ['responsive', 'accessible'] as TemplateTag[],
        supportedDevices: ['desktop', 'tablet', 'mobile'],
        priority: 3,
        enabled: true,
      },

      // 通用组件
      {
        id: 'common' as TemplateCategory,
        name: '通用组件',
        description: '可复用的通用组件',
        icon: 'puzzle',
        children: ['header', 'footer', 'navigation'] as TemplateCategory[],
        defaultTags: ['responsive', 'accessible', 'reusable'] as TemplateTag[],
        supportedDevices: ['desktop', 'tablet', 'mobile'],
        priority: 2,
        enabled: true,
      },

      // 错误页面
      {
        id: 'error' as TemplateCategory,
        name: '错误页面',
        description: '错误和异常状态页面',
        icon: 'alert-triangle',
        children: ['not-found', 'maintenance'] as TemplateCategory[],
        defaultTags: ['responsive', 'accessible'] as TemplateTag[],
        supportedDevices: ['desktop', 'tablet', 'mobile'],
        priority: 2,
        enabled: true,
      },
    ]

    // 添加到配置中
    defaultCategories.forEach((category) => {
      this.config.categories.set(category.id, category)
      this.config.enabledCategories.add(category.id)
    })
  }

  /**
   * 初始化默认标签
   */
  private initializeDefaultTags(): void {
    const defaultTags: TagInfo[] = [
      // 设计风格
      { id: 'modern' as TemplateTag, name: '现代', description: '现代化设计风格', color: '#3b82f6', group: '设计风格' },
      { id: 'classic' as TemplateTag, name: '经典', description: '经典设计风格', color: '#6b7280', group: '设计风格' },
      { id: 'minimal' as TemplateTag, name: '简约', description: '简约设计风格', color: '#10b981', group: '设计风格' },
      { id: 'creative' as TemplateTag, name: '创意', description: '富有创意的设计', color: '#f59e0b', group: '设计风格' },
      { id: 'professional' as TemplateTag, name: '专业', description: '专业商务风格', color: '#1f2937', group: '设计风格' },

      // 功能特性
      { id: 'responsive' as TemplateTag, name: '响应式', description: '支持多设备响应式设计', color: '#8b5cf6', group: '功能特性', isSystem: true },
      { id: 'animated' as TemplateTag, name: '动画', description: '包含动画效果', color: '#ec4899', group: '功能特性' },
      { id: 'interactive' as TemplateTag, name: '交互式', description: '丰富的交互功能', color: '#06b6d4', group: '功能特性' },
      { id: 'accessible' as TemplateTag, name: '无障碍', description: '支持无障碍访问', color: '#059669', group: '功能特性', isSystem: true },
      { id: 'dark-mode' as TemplateTag, name: '深色模式', description: '支持深色主题', color: '#374151', group: '功能特性' },

      // 技术特性
      { id: 'typescript' as TemplateTag, name: 'TypeScript', description: '使用TypeScript开发', color: '#3178c6', group: '技术特性' },
      { id: 'composition-api' as TemplateTag, name: 'Composition API', description: '使用Vue3组合式API', color: '#4fc08d', group: '技术特性' },
      { id: 'pinia' as TemplateTag, name: 'Pinia', description: '集成Pinia状态管理', color: '#ffd859', group: '技术特性' },

      // 行业类型
      { id: 'enterprise' as TemplateTag, name: '企业级', description: '适合企业级应用', color: '#1e40af', group: '行业类型' },
      { id: 'startup' as TemplateTag, name: '初创公司', description: '适合初创公司', color: '#dc2626', group: '行业类型' },
      { id: 'education' as TemplateTag, name: '教育', description: '教育行业应用', color: '#7c3aed', group: '行业类型' },

      // 复杂度
      { id: 'simple' as TemplateTag, name: '简单', description: '简单易用', color: '#22c55e', group: '复杂度' },
      { id: 'advanced' as TemplateTag, name: '高级', description: '功能丰富复杂', color: '#ef4444', group: '复杂度' },
    ]

    // 添加到配置中
    defaultTags.forEach((tag) => {
      this.config.tags.set(tag.id, tag)
    })
  }

  /**
   * 构建分类层次结构
   */
  private buildCategoryHierarchy(): void {
    this.config.categories.forEach((category, id) => {
      if (category.children) {
        this.config.hierarchy.set(id, category.children)
      }
    })
  }

  /**
   * 获取分类信息
   */
  getCategoryInfo(category: TemplateCategory): CategoryInfo | undefined {
    return this.config.categories.get(category)
  }

  /**
   * 获取标签信息
   */
  getTagInfo(tag: TemplateTag): TagInfo | undefined {
    return this.config.tags.get(tag)
  }

  /**
   * 获取分类层次结构
   */
  getCategoryHierarchy(): Map<TemplateCategory, TemplateCategory[]> {
    return new Map(this.config.hierarchy)
  }

  /**
   * 搜索和过滤模板
   */
  filterTemplates(templates: ExtendedTemplateMetadata[], filter: TemplateFilter): ExtendedTemplateMetadata[] {
    return templates.filter((template) => {
      // 分类过滤
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.includes(template.category)) {
          return false
        }
      }

      // 标签过滤
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => template.tags.includes(tag))
        if (!hasMatchingTag) {
          return false
        }
      }

      // 状态过滤
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(template.status)) {
          return false
        }
      }

      // 优先级过滤
      if (filter.priority && filter.priority.length > 0) {
        if (!filter.priority.includes(template.priority)) {
          return false
        }
      }

      // 关键词搜索
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase()
        const searchText = `${template.name} ${template.description} ${template.tags.join(' ')}`.toLowerCase()
        if (!searchText.includes(keyword)) {
          return false
        }
      }

      // 评分过滤
      if (filter.rating && template.usage.rating !== undefined) {
        if (filter.rating.min !== undefined && template.usage.rating < filter.rating.min) {
          return false
        }
        if (filter.rating.max !== undefined && template.usage.rating > filter.rating.max) {
          return false
        }
      }

      return true
    })
  }

  /**
   * 排序模板
   */
  sortTemplates(templates: ExtendedTemplateMetadata[], options: TemplateSortOptions): ExtendedTemplateMetadata[] {
    return [...templates].sort((a, b) => {
      let comparison = 0

      switch (options.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
          break
        case 'usage':
          comparison = a.usage.count - b.usage.count
          break
        case 'rating':
          comparison = (a.usage.rating || 0) - (b.usage.rating || 0)
          break
        case 'priority':
          comparison = a.priority - b.priority
          break
      }

      return options.direction === 'desc' ? -comparison : comparison
    })
  }

  /**
   * 分组模板
   */
  groupTemplates(templates: ExtendedTemplateMetadata[], options: TemplateGroupOptions): Map<string, ExtendedTemplateMetadata[]> {
    const groups = new Map<string, ExtendedTemplateMetadata[]>()

    templates.forEach((template) => {
      let groupKey: string

      switch (options.field) {
        case 'category':
          groupKey = template.category
          break
        case 'status':
          groupKey = template.status
          break
        case 'author':
          groupKey = template.author || '未知作者'
          break
        case 'tag':
          // 为每个标签创建一个分组
          template.tags.forEach((tag) => {
            if (!groups.has(tag)) {
              groups.set(tag, [])
            }
            groups.get(tag)!.push(template)
          })
          return
        default:
          groupKey = '其他'
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }
      groups.get(groupKey)!.push(template)
    })

    return groups
  }

  /**
   * 添加自定义分类
   */
  addCustomCategory(category: CategoryInfo): void {
    this.config.categories.set(category.id, category)
    this.config.enabledCategories.add(category.id)

    if (category.children) {
      this.config.hierarchy.set(category.id, category.children)
    }
  }

  /**
   * 添加自定义标签
   */
  addCustomTag(tag: TagInfo): void {
    this.config.tags.set(tag.id, tag)
  }

  /**
   * 验证模板元数据
   */
  validateMetadata(metadata: ExtendedTemplateMetadata): boolean {
    // 验证必需字段
    if (!metadata.name || !metadata.description || !metadata.category) {
      return false
    }

    // 验证分类是否存在
    if (!this.config.categories.has(metadata.category)) {
      return false
    }

    // 验证标签是否存在
    if (metadata.tags) {
      for (const tag of metadata.tags) {
        if (!this.config.tags.has(tag)) {
          return false
        }
      }
    }

    return true
  }

  /**
   * 获取启用的分类列表
   */
  getEnabledCategories(): TemplateCategory[] {
    return Array.from(this.config.enabledCategories)
  }

  /**
   * 获取所有标签列表
   */
  getAllTags(): TemplateTag[] {
    return Array.from(this.config.tags.keys())
  }

  /**
   * 按分组获取标签
   */
  getTagsByGroup(): Map<string, TemplateTag[]> {
    const groups = new Map<string, TemplateTag[]>()

    this.config.tags.forEach((tagInfo, tagId) => {
      const group = tagInfo.group || '其他'
      if (!groups.has(group)) {
        groups.set(group, [])
      }
      groups.get(group)!.push(tagId)
    })

    return groups
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<TemplateCategoryConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 获取当前配置
   */
  getConfig(): TemplateCategoryConfig {
    return { ...this.config }
  }
}

/**
 * 创建模板分类管理器
 */
export function createTemplateCategoryManager(config?: Partial<TemplateCategoryConfig>): TemplateCategoryManager {
  return new TemplateCategoryManagerImpl(config)
}

/**
 * 全局模板分类管理器实例
 */
let globalCategoryManager: TemplateCategoryManager | null = null

/**
 * 获取全局模板分类管理器
 */
export function getTemplateCategoryManager(config?: Partial<TemplateCategoryConfig>): TemplateCategoryManager {
  if (!globalCategoryManager) {
    globalCategoryManager = createTemplateCategoryManager(config)
  }
  return globalCategoryManager
}

/**
 * 重置全局模板分类管理器
 */
export function resetTemplateCategoryManager(): void {
  globalCategoryManager = null
}
