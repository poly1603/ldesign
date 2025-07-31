import type { TemplateConfig } from '@/types'

export const config: TemplateConfig = {
  id: 'login-mobile-simple',
  name: '简洁登录',
  description: '专为移动端优化的简洁登录页面，操作便捷，体验流畅',
  category: 'login',
  device: 'mobile',
  variant: 'simple',
  isDefault: true, // 设为移动端默认模板
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['简洁', '移动端', '触摸友好', '流畅'],
  preview: '/previews/login-mobile-simple.png',
  features: [
    '全屏设计',
    '大按钮操作',
    '简化表单',
    '快速登录',
    '触摸友好'
  ],
  props: {
    title: {
      type: 'string',
      default: '登录',
      description: '登录页面标题'
    },
    subtitle: {
      type: 'string',
      default: '欢迎回来',
      description: '登录页面副标题'
    },
    logo: {
      type: 'string',
      default: '',
      description: '公司或产品Logo'
    },
    showRememberMe: {
      type: 'boolean',
      default: false,
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
