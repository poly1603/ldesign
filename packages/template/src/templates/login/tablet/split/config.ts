import type { TemplateConfig } from '@/types'

export const config: TemplateConfig = {
  id: 'login-tablet-split',
  name: '分屏登录',
  description: '分屏式平板端登录页面，左右分栏设计，视觉效果突出',
  category: 'login',
  device: 'tablet',
  variant: 'split',
  isDefault: false,
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['分屏', '平板端', '分栏', '视觉'],
  preview: '/previews/login-tablet-split.png',
  features: [
    '左右分屏',
    '视觉分离',
    '品牌展示',
    '专业感',
    '大屏优化'
  ],
  props: {
    title: {
      type: 'string',
      default: '欢迎回来',
      description: '登录页面标题'
    },
    subtitle: {
      type: 'string',
      default: '登录您的专业账户',
      description: '登录页面副标题'
    },
    logo: {
      type: 'string',
      default: '',
      description: '公司或产品Logo'
    },
    brandImage: {
      type: 'string',
      default: '',
      description: '品牌展示图片'
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
    minWidth: 768,
    maxWidth: 1024
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15'
}

export default config
