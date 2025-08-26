import type { TemplateConfig } from '@ldesign/template'

export const customLoginConfig: TemplateConfig = {
  id: 'login-desktop-custom',
  name: '自定义登录模板',
  description: '一个演示外部模板扩展功能的自定义登录模板',
  version: '1.0.0',
  author: 'External Developer',
  category: 'login',
  device: 'desktop',
  variant: 'custom',
  isDefault: false,
  features: [
    '渐变背景设计',
    '现代化UI风格',
    '响应式布局',
    '表单验证',
    '自定义样式',
  ],
  preview: '/previews/custom-login.png',
  tags: ['自定义', '外部', '现代', '渐变', '演示'],
  props: {
    title: {
      type: 'string',
      default: '自定义登录',
      description: '登录页面标题',
      required: false,
    },
    subtitle: {
      type: 'string',
      default: '外部模板示例',
      description: '登录页面副标题',
      required: false,
    },
  },
  dependencies: ['vue'],
  compatibility: {
    vue: '^3.0.0',
    node: '>=16.0.0',
    browsers: ['Chrome >= 88', 'Firefox >= 85', 'Safari >= 14'],
  },
  config: {
    theme: 'gradient',
    animation: true,
    responsive: true,
  },
  priority: 10,
  enabled: true,
  createdAt: '2024-01-20',
  updatedAt: '2024-01-20',
}

export default customLoginConfig
