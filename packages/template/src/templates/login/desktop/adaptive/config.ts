import type { TemplateConfig } from '../../../../types'

export const config: TemplateConfig = {
  id: 'login-desktop-adaptive',
  name: '自适应登录',
  description: '根据屏幕尺寸自动调整布局的响应式登录模板',
  category: 'login',
  device: 'desktop',
  variant: 'adaptive',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['responsive', 'adaptive', 'modern'],
  preview: '/previews/login/desktop/adaptive.png',
  features: [
    '响应式布局',
    '自动适配屏幕尺寸',
    '流畅的动画效果',
    '现代化设计',
    '支持多种主题',
  ],
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
  },
  dependencies: [],
  customization: {
    colors: true,
    layout: true,
    animations: true,
    background: true,
  },
}
