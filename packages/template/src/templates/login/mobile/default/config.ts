/**
 * 移动端默认登录模板配置
 */

import type { TemplateMetadata } from '../../../../types'

export default {
  name: 'default',
  displayName: '移动端登录页',
  description: '适配移动设备的登录页面，触摸友好，支持生物识别',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['login', 'mobile', 'default', 'touch'],
  isDefault: true,
  preview: '/previews/login-mobile-default.png',
  lastModified: Date.now(),
} as Omit<TemplateMetadata, 'category' | 'device'>
