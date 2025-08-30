/**
 * 内置模板注册表
 * 管理所有内置模板的注册和导出
 */

import type { TemplateInfo } from '../types'

// 动态导入模板组件
const loginDesktopDefault = () => import('./login/desktop/default/index.tsx')
const loginDesktopModern = () => import('./login/desktop/modern/index.tsx')
const loginDesktopClassic = () => import('./login/desktop/classic/index.tsx')
const loginDesktopAdaptive = () => import('./login/desktop/adaptive/index.tsx')

/**
 * 内置模板注册表
 * 包含所有内置模板的元数据和组件引用
 */
export const BUILTIN_TEMPLATES: TemplateInfo[] = [
  {
    id: 'login-desktop-default',
    name: 'default',
    displayName: '默认登录',
    description: '简洁优雅的默认登录模板',
    category: 'login',
    deviceType: 'desktop',
    version: '1.0.0',
    author: '@ldesign/template',
    tags: ['default', 'simple', 'clean'],
    path: 'src/templates/login/desktop/default',
    componentPath: './login/desktop/default/index.tsx',
    component: loginDesktopDefault,
    thumbnail: '',
    status: 'loaded',
    dependencies: [],
    props: {
      title: {
        type: 'string',
        default: '用户登录',
        description: '登录页面标题'
      },
      subtitle: {
        type: 'string',
        default: '请输入您的账号信息',
        description: '登录页面副标题'
      },
      showRememberMe: {
        type: 'boolean',
        default: true,
        description: '是否显示记住我选项'
      },
      showForgotPassword: {
        type: 'boolean',
        default: true,
        description: '是否显示忘记密码链接'
      }
    },
    isDefault: true,
    features: ['responsive', 'accessible'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'login-desktop-modern',
    name: 'modern',
    displayName: '现代登录',
    description: '现代化设计的登录模板',
    category: 'login',
    deviceType: 'desktop',
    version: '1.0.0',
    author: '@ldesign/template',
    tags: ['modern', 'stylish', 'gradient'],
    path: 'src/templates/login/desktop/modern',
    componentPath: './login/desktop/modern/index.tsx',
    component: loginDesktopModern,
    thumbnail: '',
    status: 'loaded',
    dependencies: [],
    props: {
      title: {
        type: 'string',
        default: '🚀 现代登录',
        description: '登录页面标题'
      },
      subtitle: {
        type: 'string',
        default: '体验现代化的登录界面',
        description: '登录页面副标题'
      },
      showRememberMe: {
        type: 'boolean',
        default: true,
        description: '是否显示记住我选项'
      },
      showForgotPassword: {
        type: 'boolean',
        default: true,
        description: '是否显示忘记密码链接'
      }
    },
    features: ['responsive', 'accessible', 'animations'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'login-desktop-classic',
    name: 'classic',
    displayName: '经典登录',
    description: '经典风格的登录模板',
    category: 'login',
    deviceType: 'desktop',
    version: '1.0.0',
    author: '@ldesign/template',
    tags: ['classic', 'traditional', 'stable'],
    path: 'src/templates/login/desktop/classic',
    componentPath: './login/desktop/classic/index.tsx',
    component: loginDesktopClassic,
    thumbnail: '',
    status: 'loaded',
    dependencies: [],
    props: {
      title: {
        type: 'string',
        default: '系统登录',
        description: '登录页面标题'
      },
      subtitle: {
        type: 'string',
        default: '请输入您的登录凭据',
        description: '登录页面副标题'
      },
      showRememberMe: {
        type: 'boolean',
        default: true,
        description: '是否显示记住我选项'
      },
      showForgotPassword: {
        type: 'boolean',
        default: true,
        description: '是否显示忘记密码链接'
      }
    },
    features: ['responsive', 'accessible'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'login-desktop-adaptive',
    name: 'adaptive',
    displayName: '自适应登录',
    description: '自适应设计的登录模板',
    category: 'login',
    deviceType: 'desktop',
    version: '1.0.0',
    author: '@ldesign/template',
    tags: ['adaptive', 'responsive', 'flexible'],
    path: 'src/templates/login/desktop/adaptive',
    componentPath: './login/desktop/adaptive/index.tsx',
    component: loginDesktopAdaptive,
    thumbnail: '',
    status: 'loaded',
    dependencies: [],
    props: {
      title: {
        type: 'string',
        default: '智能登录',
        description: '登录页面标题'
      },
      subtitle: {
        type: 'string',
        default: '自适应各种设备的登录界面',
        description: '登录页面副标题'
      },
      showRememberMe: {
        type: 'boolean',
        default: true,
        description: '是否显示记住我选项'
      },
      showForgotPassword: {
        type: 'boolean',
        default: true,
        description: '是否显示忘记密码链接'
      }
    },
    features: ['responsive', 'accessible', 'adaptive'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

/**
 * 模板组件加载器映射
 */
export const templateLoaders: Record<string, () => Promise<any>> = {
  'login-desktop-default': loginDesktopDefault,
  'login-desktop-modern': loginDesktopModern,
  'login-desktop-classic': loginDesktopClassic,
  'login-desktop-adaptive': loginDesktopAdaptive,
}

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
 * 根据ID获取内置模板
 */
export function getBuiltinTemplateById(id: string): TemplateInfo | undefined {
  return BUILTIN_TEMPLATES.find(t => t.id === id)
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

/**
 * 加载模板组件
 */
export async function loadTemplateComponent(templateId: string): Promise<any> {
  const loader = templateLoaders[templateId]
  if (!loader) {
    throw new Error(`Template component loader not found for: ${templateId}`)
  }

  try {
    const module = await loader()
    return module.default || module
  } catch (error) {
    console.error(`Failed to load template component: ${templateId}`, error)
    throw error
  }
}

/**
 * 为模板管理器提供组件加载器
 */
export function getComponentLoader(templateId: string) {
  return templateLoaders[templateId]
}

/**
 * 获取所有注册的模板列表
 */
export function getRegisteredTemplates(): TemplateInfo[] {
  return [...BUILTIN_TEMPLATES]
}
