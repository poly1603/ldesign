/**
 * 桌面端默认仪表板配置
 */

import type { TemplateMetadata } from '../../../../types'

export default {
  name: 'default',
  displayName: '默认仪表板',
  description: '功能完整的桌面端仪表板，包含统计卡片和数据展示',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['dashboard', 'desktop', 'default', 'admin'],
  isDefault: true,
  preview: '/previews/dashboard-desktop-default.png',
  lastModified: Date.now(),
} as Omit<TemplateMetadata, 'category' | 'device'>
