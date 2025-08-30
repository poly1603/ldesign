/**
 * 数据分析风格桌面端仪表板模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'analytics',
  displayName: '数据分析仪表板',
  description: '专注于数据可视化和分析的仪表板模板，包含丰富的图表组件、实时数据展示和深度分析功能。适合数据分析师和业务决策者。',
  version: '1.0.0',
  author: 'ldesign',
  isDefault: false,
  tags: ['数据分析', '可视化', '图表', '实时数据', '商业智能'],
  preview: './preview.png',
  props: {
    title: {
      type: String,
      default: '数据分析中心'
    },
    subtitle: {
      type: String,
      default: '洞察数据，驱动增长'
    },
    showFilters: {
      type: Boolean,
      default: true
    },
    showRealTime: {
      type: Boolean,
      default: true
    },
    showExport: {
      type: Boolean,
      default: true
    },
    timeRange: {
      type: String,
      default: '7d'
    },
    primaryColor: {
      type: String,
      default: '#722ed1'
    },
    accentColor: {
      type: String,
      default: '#13c2c2'
    },
    enableAnimations: {
      type: Boolean,
      default: true
    },
    refreshInterval: {
      type: Number,
      default: 30000
    }
  },
  slots: [
    'header',
    'filters',
    'kpi-cards',
    'main-chart',
    'secondary-charts',
    'data-table',
    'insights',
    'footer'
  ],
  dependencies: [],
  minVueVersion: '3.0.0',
  features: [
    '实时数据更新',
    '多维度分析',
    '交互式图表',
    '数据筛选器',
    'KPI指标卡',
    '趋势分析',
    '数据导出',
    '智能洞察',
    '响应式布局',
    '自定义时间范围'
  ],
  screenshots: [
    './screenshot-overview.png',
    './screenshot-detailed.png',
    './screenshot-mobile.png'
  ]
}

export default config
