import type { TemplateConfig } from '@/types'

export const config: TemplateConfig = {
  id: 'login-mobile-card',
  name: '卡片登录',
  description: '卡片式移动端登录页面，层次分明，视觉效果佳',
  category: 'login',
  device: 'mobile',
  variant: 'card',
  isDefault: false,
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['卡片', '移动端', '层次', '美观'],
  preview: '/previews/login-mobile-card.png',
  features: [
    '卡片式设计',
    '阴影效果',
    '分层布局',
    '视觉层次',
    '现代感'
  ],
  props: {
    title: {
      type: 'string',
      default: '登录账户',
      description: '登录页面标题'
    },
    subtitle: {
      type: 'string',
      default: '请输入您的登录信息',
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
    minWidth: null,
    maxWidth: 768
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15'
}

export default config
