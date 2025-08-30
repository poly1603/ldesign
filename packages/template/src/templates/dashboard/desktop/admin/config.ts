/**
 * 管理后台风格桌面端仪表板模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'admin',
  displayName: '管理后台仪表板',
  description: '专业的管理后台仪表板模板，包含完整的数据展示、图表分析和管理功能。适合企业级后台管理系统。',
  version: '1.0.0',
  author: 'ldesign',
  isDefault: true,
  tags: ['管理后台', '数据展示', '图表', '企业级', '专业'],
  preview: './preview.png',
  props: {
    title: {
      type: String,
      default: '管理后台'
    },
    subtitle: {
      type: String,
      default: '数据驱动决策'
    },
    showSidebar: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showBreadcrumb: {
      type: Boolean,
      default: true
    },
    sidebarCollapsed: {
      type: Boolean,
      default: false
    },
    primaryColor: {
      type: String,
      default: '#1890ff'
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    showNotifications: {
      type: Boolean,
      default: true
    },
    userName: {
      type: String,
      default: '管理员'
    },
    userAvatar: {
      type: String,
      default: ''
    }
  },
  slots: [
    'header', 
    'sidebar', 
    'breadcrumb', 
    'content', 
    'footer',
    'user-menu',
    'notifications'
  ],
  dependencies: [],
  minVueVersion: '3.0.0',
  features: [
    '响应式布局',
    '侧边栏导航',
    '数据统计卡片',
    '图表展示',
    '表格管理',
    '用户权限',
    '通知系统',
    '深色模式',
    '面包屑导航',
    '搜索功能'
  ],
  screenshots: [
    './screenshot-light.png',
    './screenshot-dark.png',
    './screenshot-collapsed.png'
  ]
}

export default config
