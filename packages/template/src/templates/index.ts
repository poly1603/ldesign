/**
 * 内置模板注册表
 * 管理所有内置模板的注册和导出
 */

import type { TemplateInfo } from '../types'

// 内置登录模板将在运行时动态加载

/**
 * 内置模板注册表
 * 包含所有内置模板的元数据和组件引用
 * 注意：这里只定义模板元数据，实际组件将在运行时动态加载
 */
export const BUILTIN_TEMPLATES: TemplateInfo[] = [
  {
    name: 'login-default',
    displayName: '默认登录',
    description: '简洁的默认登录模板',
    category: 'login',
    deviceType: 'desktop',
    version: '1.0.0',
    author: '@ldesign/template',
    tags: ['default', 'simple', 'clean'],
    path: 'templates/login/desktop/default',
    component: null, // 将在运行时动态加载
    thumbnail: '',
    status: 'loaded',
    dependencies: [],
    props: {
      title: { type: 'string', default: '用户登录' },
      subtitle: { type: 'string', default: '请输入您的账号信息' },
      showRememberMe: { type: 'boolean', default: true },
      showForgotPassword: { type: 'boolean', default: true }
    },
    templateFile: {
      path: 'templates/login/desktop/default.vue',
      name: 'default.vue',
      size: 0,
      lastModified: Date.now(),
      content: '',
    },
    metadata: {
      title: '默认登录模板',
      description: '简洁的默认登录模板',
      version: '1.0.0',
      author: '@ldesign/template',
      tags: ['default', 'simple', 'clean'],
      category: 'login',
      deviceType: 'desktop',
      dependencies: [],
      props: {},
      config: {},
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    name: 'login-modern',
    displayName: '现代登录',
    description: '现代化设计的登录模板',
    category: 'login',
    deviceType: 'desktop',
    version: '1.0.0',
    author: '@ldesign/template',
    tags: ['modern', 'stylish', 'gradient'],
    path: 'templates/login/desktop/modern',
    component: null, // 将在运行时动态加载
    thumbnail: '',
    status: 'loaded',
    dependencies: [],
    props: {
      title: { type: 'string', default: '🚀 现代登录' },
      subtitle: { type: 'string', default: '体验现代化的登录界面' },
      showRememberMe: { type: 'boolean', default: true },
      showForgotPassword: { type: 'boolean', default: true }
    },
    templateFile: {
      path: 'templates/login/desktop/modern.vue',
      name: 'modern.vue',
      size: 0,
      lastModified: Date.now(),
      content: '',
    },
    metadata: {
      title: '现代登录模板',
      description: '现代化设计的登录模板',
      version: '1.0.0',
      author: '@ldesign/template',
      tags: ['modern', 'stylish', 'gradient'],
      category: 'login',
      deviceType: 'desktop',
      dependencies: [],
      props: {},
      config: {},
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

/**
 * 根据类别和设备类型获取内置模板
 */
export function getBuiltinTemplates(category?: string, deviceType?: string): TemplateInfo[] {
  let templates = BUILTIN_TEMPLATES

  if (category) {
    templates = templates.filter(t => t.category === category)
  }

  if (deviceType) {
    templates = templates.filter(t => t.deviceType === deviceType)
  }

  return templates
}

/**
 * 根据名称获取内置模板
 */
export function getBuiltinTemplate(name: string, category?: string, deviceType?: string): TemplateInfo | undefined {
  return BUILTIN_TEMPLATES.find(t =>
    t.name === name &&
    (!category || t.category === category) &&
    (!deviceType || t.deviceType === deviceType)
  )
}

/**
 * 检查是否为内置模板
 */
export function isBuiltinTemplate(name: string, category?: string, deviceType?: string): boolean {
  return getBuiltinTemplate(name, category, deviceType) !== undefined
}

/**
 * 获取所有内置模板的类别
 */
export function getBuiltinCategories(): string[] {
  return [...new Set(BUILTIN_TEMPLATES.map(t => t.category))]
}

/**
 * 获取指定类别的所有设备类型
 */
export function getBuiltinDeviceTypes(category: string): string[] {
  return [...new Set(
    BUILTIN_TEMPLATES
      .filter(t => t.category === category)
      .map(t => t.deviceType)
  )]
}
