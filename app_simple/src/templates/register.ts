/**
 * 注册内置模板
 * 简化版 - 直接使用组件而非动态导入
 */
import type { TemplateManager } from '@ldesign/template'
import LoginVue from '@/views/Login.vue'

export function registerBuiltinTemplates(manager: TemplateManager): void {
  // ===== 登录模板 =====

  // Desktop 登录模板 - 使用现有的Login.vue作为默认模板
  manager.register(
    'login',
    'desktop',
    'default',
    {
      displayName: '默认登录页',
      description: '简洁大方的桌面端登录页面',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['login', 'desktop', 'default'],
      isDefault: true,
    },
    LoginVue,
  )

  
  // Mobile 登录模板 - 使用现有的Login.vue
  manager.register(
    'login',
    'mobile',
    'default',
    {
      displayName: '移动端登录页',
      description: '适配移动设备的登录页面',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['login', 'mobile', 'default'],
      isDefault: true,
    },
    LoginVue,
  )

  // Tablet 登录模板 - 使用现有的Login.vue
  manager.register(
    'login',
    'tablet',
    'simple',
    {
      displayName: '平板简单登录页',
      description: '适合平板设备的简洁登录页面',
      version: '1.0.0',
      author: 'LDesign Team',
      tags: ['login', 'tablet', 'simple'],
      isDefault: true,
    },
    LoginVue,
  )
}