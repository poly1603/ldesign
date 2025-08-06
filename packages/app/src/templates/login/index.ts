// 登录模板导出
export { default as ClassicLoginTemplate } from './ClassicLoginTemplate.vue'
export { default as ModernLoginTemplate } from './ModernLoginTemplate.vue'
export { default as MinimalLoginTemplate } from './MinimalLoginTemplate.vue'
export { default as CreativeLoginTemplate } from './CreativeLoginTemplate.vue'

// 模板配置
export const loginTemplateConfigs = {
  classic: {
    name: 'classic',
    title: '经典模板',
    description: '传统的登录界面设计，简洁实用',
    component: () => import('./ClassicLoginTemplate.vue'),
    preview: '/images/templates/classic-preview.jpg',
    category: 'login',
    device: 'desktop'
  },

  modern: {
    name: 'modern',
    title: '现代模板',
    description: '现代化设计风格，时尚美观',
    component: () => import('./ModernLoginTemplate.vue'),
    preview: '/images/templates/modern-preview.jpg',
    category: 'login',
    device: 'desktop'
  },

  minimal: {
    name: 'minimal',
    title: '简约模板',
    description: '极简设计理念，专注用户体验',
    component: () => import('./MinimalLoginTemplate.vue'),
    preview: '/images/templates/minimal-preview.jpg',
    category: 'login',
    device: 'desktop'
  },

  creative: {
    name: 'creative',
    title: '创意模板',
    description: '富有创意的设计，独特视觉体验',
    component: () => import('./CreativeLoginTemplate.vue'),
    preview: '/images/templates/creative-preview.jpg',
    category: 'login',
    device: 'desktop'
  }
}
