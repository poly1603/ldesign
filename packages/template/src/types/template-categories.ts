/**
 * 模板分类系统类型定义
 * 定义扩展的模板分类、标签和元数据系统
 */

import type { DeviceType } from './template'

/**
 * 模板分类枚举
 */
export enum TemplateCategory {
  // 认证相关
  AUTH = 'auth',
  LOGIN = 'login',
  REGISTER = 'register',
  RESET_PASSWORD = 'reset-password',
  VERIFY = 'verify',

  // 仪表板相关
  DASHBOARD = 'dashboard',
  OVERVIEW = 'overview',
  ANALYTICS = 'analytics',
  REPORTS = 'reports',
  METRICS = 'metrics',

  // 用户管理
  USER = 'user',
  PROFILE = 'profile',
  SETTINGS = 'settings',
  PERMISSIONS = 'permissions',
  ACCOUNT = 'account',

  // 表单相关
  FORM = 'form',
  CONTACT = 'contact',
  SURVEY = 'survey',
  FEEDBACK = 'feedback',
  WIZARD = 'wizard',

  // 内容展示
  CONTENT = 'content',
  ARTICLE = 'article',
  BLOG = 'blog',
  NEWS = 'news',
  GALLERY = 'gallery',

  // 电商相关
  ECOMMERCE = 'ecommerce',
  PRODUCT = 'product',
  CART = 'cart',
  CHECKOUT = 'checkout',
  ORDER = 'order',

  // 通用组件
  COMMON = 'common',
  HEADER = 'header',
  FOOTER = 'footer',
  NAVIGATION = 'navigation',
  SIDEBAR = 'sidebar',

  // 错误页面
  ERROR = 'error',
  NOT_FOUND = 'not-found',
  MAINTENANCE = 'maintenance',

  // 营销页面
  MARKETING = 'marketing',
  LANDING = 'landing',
  PRICING = 'pricing',
  FEATURES = 'features',

  // 其他
  MISC = 'misc',
  CUSTOM = 'custom',
}

/**
 * 模板标签枚举
 */
export enum TemplateTag {
  // 设计风格
  MODERN = 'modern',
  CLASSIC = 'classic',
  MINIMAL = 'minimal',
  CREATIVE = 'creative',
  PROFESSIONAL = 'professional',
  ELEGANT = 'elegant',
  BOLD = 'bold',
  CLEAN = 'clean',

  // 功能特性
  RESPONSIVE = 'responsive',
  ANIMATED = 'animated',
  INTERACTIVE = 'interactive',
  ACCESSIBLE = 'accessible',
  DARK_MODE = 'dark-mode',
  LIGHT_MODE = 'light-mode',

  // 技术特性
  TYPESCRIPT = 'typescript',
  COMPOSITION_API = 'composition-api',
  PINIA = 'pinia',
  ROUTER = 'router',
  I18N = 'i18n',
  PWA = 'pwa',

  // 行业类型
  ENTERPRISE = 'enterprise',
  STARTUP = 'startup',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  FINANCE = 'finance',
  TECHNOLOGY = 'technology',

  // 复杂度
  SIMPLE = 'simple',
  COMPLEX = 'complex',
  ADVANCED = 'advanced',
  BEGINNER = 'beginner',

  // 用途
  PRODUCTION = 'production',
  PROTOTYPE = 'prototype',
  DEMO = 'demo',
  EXAMPLE = 'example',
}

/**
 * 模板优先级
 */
export enum TemplatePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
}

/**
 * 模板状态
 */
export enum TemplateStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  BETA = 'beta',
  EXPERIMENTAL = 'experimental',
  MAINTENANCE = 'maintenance',
}

/**
 * 模板分类信息
 */
export interface CategoryInfo {
  /** 分类标识 */
  id: TemplateCategory
  /** 显示名称 */
  name: string
  /** 分类描述 */
  description: string
  /** 分类图标 */
  icon?: string
  /** 父分类 */
  parent?: TemplateCategory
  /** 子分类 */
  children?: TemplateCategory[]
  /** 默认标签 */
  defaultTags?: TemplateTag[]
  /** 支持的设备类型 */
  supportedDevices?: DeviceType[]
  /** 分类优先级 */
  priority?: TemplatePriority
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 模板标签信息
 */
export interface TagInfo {
  /** 标签标识 */
  id: TemplateTag
  /** 显示名称 */
  name: string
  /** 标签描述 */
  description: string
  /** 标签颜色 */
  color?: string
  /** 标签分组 */
  group?: string
  /** 是否为系统标签 */
  isSystem?: boolean
}

/**
 * 扩展的模板元数据
 */
export interface ExtendedTemplateMetadata {
  /** 模板分类（使用枚举） */
  category: TemplateCategory
  /** 模板标签（使用枚举） */
  tags: TemplateTag[]
  /** 模板状态 */
  status: TemplateStatus
  /** 模板优先级 */
  priority: TemplatePriority
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 使用统计 */
  usage: {
    /** 使用次数 */
    count: number
    /** 最后使用时间 */
    lastUsed?: Date
    /** 平均评分 */
    rating?: number
    /** 评分次数 */
    ratingCount?: number
  }
  /** 兼容性信息 */
  compatibility: {
    /** Vue版本要求 */
    vue?: string
    /** 浏览器要求 */
    browsers?: string[]
    /** Node.js版本要求 */
    node?: string
    /** 其他依赖 */
    dependencies?: Record<string, string>
  }
  /** 性能指标 */
  performance: {
    /** 包大小（KB） */
    bundleSize?: number
    /** 加载时间（ms） */
    loadTime?: number
    /** 渲染时间（ms） */
    renderTime?: number
    /** 内存使用（MB） */
    memoryUsage?: number
  }
  /** SEO信息 */
  seo?: {
    /** 页面标题 */
    title?: string
    /** 页面描述 */
    description?: string
    /** 关键词 */
    keywords?: string[]
    /** 结构化数据 */
    structuredData?: Record<string, unknown>
  }
  /** 可访问性信息 */
  accessibility?: {
    /** WCAG等级 */
    wcagLevel?: 'A' | 'AA' | 'AAA'
    /** 支持的辅助技术 */
    assistiveTech?: string[]
    /** 键盘导航支持 */
    keyboardNavigation?: boolean
    /** 屏幕阅读器支持 */
    screenReader?: boolean
  }
}

/**
 * 模板分类配置
 */
export interface TemplateCategoryConfig {
  /** 分类信息映射 */
  categories: Map<TemplateCategory, CategoryInfo>
  /** 标签信息映射 */
  tags: Map<TemplateTag, TagInfo>
  /** 分类层次结构 */
  hierarchy: Map<TemplateCategory, TemplateCategory[]>
  /** 默认分类 */
  defaultCategory: TemplateCategory
  /** 启用的分类 */
  enabledCategories: Set<TemplateCategory>
  /** 自定义分类 */
  customCategories?: Map<string, CategoryInfo>
}

/**
 * 模板搜索过滤器
 */
export interface TemplateFilter {
  /** 分类过滤 */
  categories?: TemplateCategory[]
  /** 标签过滤 */
  tags?: TemplateTag[]
  /** 设备类型过滤 */
  devices?: DeviceType[]
  /** 状态过滤 */
  status?: TemplateStatus[]
  /** 优先级过滤 */
  priority?: TemplatePriority[]
  /** 关键词搜索 */
  keyword?: string
  /** 作者过滤 */
  author?: string
  /** 版本过滤 */
  version?: string
  /** 创建时间范围 */
  createdRange?: {
    start?: Date
    end?: Date
  }
  /** 评分过滤 */
  rating?: {
    min?: number
    max?: number
  }
}

/**
 * 模板排序选项
 */
export interface TemplateSortOptions {
  /** 排序字段 */
  field: 'name' | 'createdAt' | 'updatedAt' | 'usage' | 'rating' | 'priority'
  /** 排序方向 */
  direction: 'asc' | 'desc'
}

/**
 * 模板分组选项
 */
export interface TemplateGroupOptions {
  /** 分组字段 */
  field: 'category' | 'device' | 'status' | 'author' | 'tag'
  /** 是否显示空分组 */
  showEmpty?: boolean
}

/**
 * 模板分类管理器接口
 */
export interface TemplateCategoryManager {
  /** 获取分类信息 */
  getCategoryInfo: (category: TemplateCategory) => CategoryInfo | undefined
  /** 获取标签信息 */
  getTagInfo: (tag: TemplateTag) => TagInfo | undefined
  /** 获取分类层次结构 */
  getCategoryHierarchy: () => Map<TemplateCategory, TemplateCategory[]>
  /** 搜索和过滤模板 */
  filterTemplates: (templates: ExtendedTemplateMetadata[], filter: TemplateFilter) => ExtendedTemplateMetadata[]
  /** 排序模板 */
  sortTemplates: (templates: ExtendedTemplateMetadata[], options: TemplateSortOptions) => ExtendedTemplateMetadata[]
  /** 分组模板 */
  groupTemplates: (templates: ExtendedTemplateMetadata[], options: TemplateGroupOptions) => Map<string, ExtendedTemplateMetadata[]>
  /** 添加自定义分类 */
  addCustomCategory: (category: CategoryInfo) => void
  /** 添加自定义标签 */
  addCustomTag: (tag: TagInfo) => void
  /** 验证模板元数据 */
  validateMetadata: (metadata: ExtendedTemplateMetadata) => boolean
}
