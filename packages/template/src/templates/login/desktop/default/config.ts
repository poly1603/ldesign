/**
 * 桌面端默认登录模板配置
 */

import type { TemplateConfig } from '../../../../types'

export default {
  name: 'default',
  displayName: '默认登录页',
  description: '简洁大方的桌面端登录页面，支持用户名/邮箱登录',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['login', 'desktop', 'default', 'simple'],
  isDefault: true,
  preview: '/previews/login-desktop-default.png',
  lastModified: Date.now(),
} as TemplateConfig
