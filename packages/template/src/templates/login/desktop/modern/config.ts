import type { TemplateConfig } from '@/types'

export const config: TemplateConfig = {
  id: 'login-desktop-modern',
  name: '现代登录',
  description: '现代化的桌面端登录界面，采用渐变色彩和动效，适合创新型企业',
  category: 'login',
  device: 'desktop',
  variant: 'modern',
  isDefault: false,
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['现代', '渐变', '动画', '创新'],
  preview: '/previews/login-desktop-modern.png',
  features: [
    '全屏渐变背景',
    '浮动卡片设计',
    '动画效果',
    '现代化图标',
    '响应式布局'
  ],
  props: {
    title: {
      type: 'string',
      default: '欢迎登录',
      description: '登录页面标题'
    },
    subtitle: {
      type: 'string',
      default: '开始您的数字化之旅',
      description: '登录页面副标题'
    },
    logo: {
      type: 'string',
      default: '',
      description: '公司或产品Logo'
    },
    showRememberMe: {
      type: 'boolean',
      default: true,
      description: '是否显示记住密码选项'
    },
    showForgotPassword: {
      type: 'boolean',
      default: true,
      description: '是否显示忘记密码链接'
    },
    showThirdPartyLogin: {
      type: 'boolean',
      default: true,
      description: '是否显示第三方登录'
    }
  },
  breakpoints: {
    minWidth: 1024,
    maxWidth: null
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15'
}

export default config
