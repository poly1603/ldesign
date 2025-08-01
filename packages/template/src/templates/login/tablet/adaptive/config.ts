import type { TemplateConfig } from '@/types'

export const config: TemplateConfig = {
  id: 'login-tablet-adaptive',
  name: '自适应登录',
  description: '自适应平板端登录页面，兼顾横屏和竖屏使用场景',
  category: 'login',
  device: 'tablet',
  variant: 'adaptive',
  isDefault: true, // 设为平板端默认模板
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['自适应', '平板端', '灵活', '兼容'],
  preview: '/previews/login-tablet-adaptive.png',
  features: [
    '自适应布局',
    '横竖屏兼容',
    '中等尺寸优化',
    '触摸友好',
    '视觉平衡',
  ],
  props: {
    title: {
      type: 'string',
      default: '用户登录',
      description: '登录页面标题',
    },
    subtitle: {
      type: 'string',
      default: '请输入您的账户信息',
      description: '登录页面副标题',
    },
    logo: {
      type: 'string',
      default: '',
      description: '公司或产品Logo',
    },
    showRememberMe: {
      type: 'boolean',
      default: true,
      description: '是否显示记住密码选项',
    },
    showForgotPassword: {
      type: 'boolean',
      default: true,
      description: '是否显示忘记密码链接',
    },
    showThirdPartyLogin: {
      type: 'boolean',
      default: true,
      description: '是否显示第三方登录',
    },
  },
  breakpoints: {
    minWidth: 768,
    maxWidth: 1024,
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15',
}

export default config
