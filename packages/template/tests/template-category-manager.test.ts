/**
 * 模板分类管理器测试
 */

import type {
  CategoryInfo,
  ExtendedTemplateMetadata,
  TagInfo,
  TemplateCategory,
  TemplateFilter,
  TemplateGroupOptions,
  TemplateSortOptions,
  TemplateTag,
} from '../src/types/template-categories'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createTemplateCategoryManager,
  getTemplateCategoryManager,
  resetTemplateCategoryManager,
  TemplateCategoryManagerImpl,
} from '../src/utils/template-category-manager'

describe('templateCategoryManagerImpl', () => {
  let categoryManager: TemplateCategoryManagerImpl
  let mockTemplates: ExtendedTemplateMetadata[]

  beforeEach(() => {
    categoryManager = new TemplateCategoryManagerImpl()

    // 创建模拟模板数据
    mockTemplates = [
      {
        name: 'login-classic',
        displayName: '经典登录',
        description: '经典风格的登录页面',
        version: '1.0.0',
        author: 'test',
        category: 'login' as TemplateCategory,
        tags: ['classic', 'responsive'] as TemplateTag[],
        status: 'active',
        priority: 3,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        usage: {
          count: 100,
          lastUsed: new Date('2024-01-10'),
          rating: 4.5,
          ratingCount: 20,
        },
        compatibility: {
          vue: '3.0.0',
        },
        performance: {},
        seo: {},
        accessibility: {},
      },
      {
        name: 'dashboard-overview',
        displayName: '仪表板概览',
        description: '现代化的仪表板概览页面',
        version: '1.0.0',
        author: 'test',
        category: 'dashboard' as TemplateCategory,
        tags: ['modern', 'interactive'] as TemplateTag[],
        status: 'active',
        priority: 4,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-20'),
        usage: {
          count: 50,
          lastUsed: new Date('2024-01-18'),
          rating: 4.8,
          ratingCount: 15,
        },
        compatibility: {
          vue: '3.0.0',
        },
        performance: {},
        seo: {},
        accessibility: {},
      },
      {
        name: 'user-profile',
        displayName: '用户资料',
        description: '用户个人资料页面',
        version: '1.0.0',
        author: 'test',
        category: 'user' as TemplateCategory,
        tags: ['responsive', 'accessible'] as TemplateTag[],
        status: 'beta',
        priority: 2,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
        usage: {
          count: 25,
          lastUsed: new Date('2024-01-22'),
          rating: 4.2,
          ratingCount: 8,
        },
        compatibility: {
          vue: '3.0.0',
        },
        performance: {},
        seo: {},
        accessibility: {},
      },
    ]
  })

  afterEach(() => {
    resetTemplateCategoryManager()
  })

  describe('初始化', () => {
    it('应该正确初始化默认分类', () => {
      const authCategory = categoryManager.getCategoryInfo('auth' as TemplateCategory)
      const loginCategory = categoryManager.getCategoryInfo('login' as TemplateCategory)

      expect(authCategory).toBeDefined()
      expect(authCategory?.name).toBe('认证')
      expect(authCategory?.children).toContain('login' as TemplateCategory)

      expect(loginCategory).toBeDefined()
      expect(loginCategory?.name).toBe('登录')
      expect(loginCategory?.parent).toBe('auth' as TemplateCategory)
    })

    it('应该正确初始化默认标签', () => {
      const modernTag = categoryManager.getTagInfo('modern' as TemplateTag)
      const responsiveTag = categoryManager.getTagInfo('responsive' as TemplateTag)

      expect(modernTag).toBeDefined()
      expect(modernTag?.name).toBe('现代')
      expect(modernTag?.group).toBe('设计风格')

      expect(responsiveTag).toBeDefined()
      expect(responsiveTag?.name).toBe('响应式')
      expect(responsiveTag?.isSystem).toBe(true)
    })

    it('应该构建正确的分类层次结构', () => {
      const hierarchy = categoryManager.getCategoryHierarchy()

      expect(hierarchy.has('auth' as TemplateCategory)).toBe(true)
      expect(hierarchy.get('auth' as TemplateCategory)).toContain('login' as TemplateCategory)
      expect(hierarchy.get('dashboard' as TemplateCategory)).toContain('overview' as TemplateCategory)
    })
  })

  describe('模板过滤', () => {
    it('应该按分类过滤模板', () => {
      const filter: TemplateFilter = {
        categories: ['login' as TemplateCategory],
      }

      const filtered = categoryManager.filterTemplates(mockTemplates, filter)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].category).toBe('login')
    })

    it('应该按标签过滤模板', () => {
      const filter: TemplateFilter = {
        tags: ['responsive' as TemplateTag],
      }

      const filtered = categoryManager.filterTemplates(mockTemplates, filter)

      expect(filtered).toHaveLength(2) // login-classic 和 user-profile
      expect(filtered.every(t => t.tags.includes('responsive' as TemplateTag))).toBe(true)
    })

    it('应该按状态过滤模板', () => {
      const filter: TemplateFilter = {
        status: ['beta'],
      }

      const filtered = categoryManager.filterTemplates(mockTemplates, filter)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].status).toBe('beta')
    })

    it('应该按优先级过滤模板', () => {
      const filter: TemplateFilter = {
        priority: [4],
      }

      const filtered = categoryManager.filterTemplates(mockTemplates, filter)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].priority).toBe(4)
    })

    it('应该按关键词搜索模板', () => {
      const filter: TemplateFilter = {
        keyword: '仪表板',
      }

      const filtered = categoryManager.filterTemplates(mockTemplates, filter)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].displayName).toContain('仪表板')
    })

    it('应该按评分范围过滤模板', () => {
      const filter: TemplateFilter = {
        rating: {
          min: 4.5,
          max: 5.0,
        },
      }

      const filtered = categoryManager.filterTemplates(mockTemplates, filter)

      expect(filtered).toHaveLength(2) // login-classic (4.5) 和 dashboard-overview (4.8)
      expect(filtered.every(t => t.usage.rating! >= 4.5)).toBe(true)
    })

    it('应该组合多个过滤条件', () => {
      const filter: TemplateFilter = {
        categories: ['login' as TemplateCategory, 'dashboard' as TemplateCategory],
        tags: ['responsive' as TemplateTag],
        priority: [3, 4],
      }

      const filtered = categoryManager.filterTemplates(mockTemplates, filter)

      expect(filtered).toHaveLength(1) // 只有 login-classic 满足所有条件
      expect(filtered[0].name).toBe('login-classic')
    })
  })

  describe('模板排序', () => {
    it('应该按名称排序', () => {
      const sortOptions: TemplateSortOptions = {
        field: 'name',
        direction: 'asc',
      }

      const sorted = categoryManager.sortTemplates(mockTemplates, sortOptions)

      expect(sorted[0].name).toBe('dashboard-overview')
      expect(sorted[1].name).toBe('login-classic')
      expect(sorted[2].name).toBe('user-profile')
    })

    it('应该按创建时间排序', () => {
      const sortOptions: TemplateSortOptions = {
        field: 'createdAt',
        direction: 'desc',
      }

      const sorted = categoryManager.sortTemplates(mockTemplates, sortOptions)

      expect(sorted[0].name).toBe('user-profile') // 2024-01-10
      expect(sorted[1].name).toBe('dashboard-overview') // 2024-01-05
      expect(sorted[2].name).toBe('login-classic') // 2024-01-01
    })

    it('应该按使用次数排序', () => {
      const sortOptions: TemplateSortOptions = {
        field: 'usage',
        direction: 'desc',
      }

      const sorted = categoryManager.sortTemplates(mockTemplates, sortOptions)

      expect(sorted[0].usage.count).toBe(100) // login-classic
      expect(sorted[1].usage.count).toBe(50) // dashboard-overview
      expect(sorted[2].usage.count).toBe(25) // user-profile
    })

    it('应该按评分排序', () => {
      const sortOptions: TemplateSortOptions = {
        field: 'rating',
        direction: 'desc',
      }

      const sorted = categoryManager.sortTemplates(mockTemplates, sortOptions)

      expect(sorted[0].usage.rating).toBe(4.8) // dashboard-overview
      expect(sorted[1].usage.rating).toBe(4.5) // login-classic
      expect(sorted[2].usage.rating).toBe(4.2) // user-profile
    })

    it('应该按优先级排序', () => {
      const sortOptions: TemplateSortOptions = {
        field: 'priority',
        direction: 'desc',
      }

      const sorted = categoryManager.sortTemplates(mockTemplates, sortOptions)

      expect(sorted[0].priority).toBe(4) // dashboard-overview
      expect(sorted[1].priority).toBe(3) // login-classic
      expect(sorted[2].priority).toBe(2) // user-profile
    })
  })

  describe('模板分组', () => {
    it('应该按分类分组', () => {
      const groupOptions: TemplateGroupOptions = {
        field: 'category',
      }

      const grouped = categoryManager.groupTemplates(mockTemplates, groupOptions)

      expect(grouped.has('login')).toBe(true)
      expect(grouped.has('dashboard')).toBe(true)
      expect(grouped.has('user')).toBe(true)
      expect(grouped.get('login')).toHaveLength(1)
      expect(grouped.get('dashboard')).toHaveLength(1)
      expect(grouped.get('user')).toHaveLength(1)
    })

    it('应该按状态分组', () => {
      const groupOptions: TemplateGroupOptions = {
        field: 'status',
      }

      const grouped = categoryManager.groupTemplates(mockTemplates, groupOptions)

      expect(grouped.has('active')).toBe(true)
      expect(grouped.has('beta')).toBe(true)
      expect(grouped.get('active')).toHaveLength(2)
      expect(grouped.get('beta')).toHaveLength(1)
    })

    it('应该按标签分组', () => {
      const groupOptions: TemplateGroupOptions = {
        field: 'tag',
      }

      const grouped = categoryManager.groupTemplates(mockTemplates, groupOptions)

      expect(grouped.has('responsive')).toBe(true)
      expect(grouped.has('classic')).toBe(true)
      expect(grouped.has('modern')).toBe(true)
      expect(grouped.get('responsive')).toHaveLength(2) // login-classic 和 user-profile
    })
  })

  describe('自定义分类和标签', () => {
    it('应该能够添加自定义分类', () => {
      const customCategory: CategoryInfo = {
        id: 'ecommerce' as TemplateCategory,
        name: '电商',
        description: '电商相关模板',
        icon: 'shopping-cart',
        defaultTags: ['ecommerce' as TemplateTag],
        enabled: true,
      }

      categoryManager.addCustomCategory(customCategory)

      const retrieved = categoryManager.getCategoryInfo('ecommerce' as TemplateCategory)
      expect(retrieved).toEqual(customCategory)
    })

    it('应该能够添加自定义标签', () => {
      const customTag: TagInfo = {
        id: 'premium' as TemplateTag,
        name: '高级',
        description: '高级功能模板',
        color: '#gold',
        group: '功能特性',
      }

      categoryManager.addCustomTag(customTag)

      const retrieved = categoryManager.getTagInfo('premium' as TemplateTag)
      expect(retrieved).toEqual(customTag)
    })
  })

  describe('元数据验证', () => {
    it('应该验证有效的模板元数据', () => {
      const validMetadata = mockTemplates[0]
      const isValid = categoryManager.validateMetadata(validMetadata)

      expect(isValid).toBe(true)
    })

    it('应该拒绝无效的模板元数据', () => {
      const invalidMetadata = {
        // 缺少必需字段
        description: '无效模板',
        version: '1.0.0',
      } as any

      const isValid = categoryManager.validateMetadata(invalidMetadata)

      expect(isValid).toBe(false)
    })

    it('应该验证分类是否存在', () => {
      const metadataWithInvalidCategory = {
        ...mockTemplates[0],
        category: 'nonexistent' as TemplateCategory,
      }

      const isValid = categoryManager.validateMetadata(metadataWithInvalidCategory)

      expect(isValid).toBe(false)
    })

    it('应该验证标签是否存在', () => {
      const metadataWithInvalidTag = {
        ...mockTemplates[0],
        tags: ['nonexistent' as TemplateTag],
      }

      const isValid = categoryManager.validateMetadata(metadataWithInvalidTag)

      expect(isValid).toBe(false)
    })
  })

  describe('工具方法', () => {
    it('应该获取启用的分类列表', () => {
      const enabledCategories = categoryManager.getEnabledCategories()

      expect(Array.isArray(enabledCategories)).toBe(true)
      expect(enabledCategories.length).toBeGreaterThan(0)
      expect(enabledCategories).toContain('login' as TemplateCategory)
    })

    it('应该获取所有标签列表', () => {
      const allTags = categoryManager.getAllTags()

      expect(Array.isArray(allTags)).toBe(true)
      expect(allTags.length).toBeGreaterThan(0)
      expect(allTags).toContain('modern' as TemplateTag)
    })

    it('应该按分组获取标签', () => {
      const tagsByGroup = categoryManager.getTagsByGroup()

      expect(tagsByGroup.has('设计风格')).toBe(true)
      expect(tagsByGroup.has('功能特性')).toBe(true)
      expect(tagsByGroup.get('设计风格')).toContain('modern' as TemplateTag)
      expect(tagsByGroup.get('功能特性')).toContain('responsive' as TemplateTag)
    })
  })
})

describe('全局分类管理器', () => {
  afterEach(() => {
    resetTemplateCategoryManager()
  })

  it('应该返回单例实例', () => {
    const manager1 = getTemplateCategoryManager()
    const manager2 = getTemplateCategoryManager()

    expect(manager1).toBe(manager2)
  })

  it('应该能够重置全局实例', () => {
    const manager1 = getTemplateCategoryManager()
    resetTemplateCategoryManager()
    const manager2 = getTemplateCategoryManager()

    expect(manager1).not.toBe(manager2)
  })

  it('应该使用工厂函数创建实例', () => {
    const manager = createTemplateCategoryManager()

    expect(manager).toBeDefined()
    expect(typeof manager.getCategoryInfo).toBe('function')
    expect(typeof manager.filterTemplates).toBe('function')
  })
})
