/**
 * 桌面端默认仪表板模板配置
 */

import type { TemplateConfig } from '../../../../types'

export default {
  name: 'default',
  displayName: '默认仪表板',
  description: '经典的桌面端仪表板布局',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['dashboard', 'desktop', 'default'],
  isDefault: true,
  preview: '/previews/dashboard-desktop-default.png',
  lastModified: Date.now(),
} as TemplateConfig
