import type { TemplateConfig } from '../../../../types'

export const config: TemplateConfig = {
  id: 'login-desktop-classic',
  name: '经典登录',
  description: '传统的桌面端登录界面，简洁大方，适合企业级应用',
  category: 'login',
  device: 'desktop',
  variant: 'classic',
  isDefault: false, // desktop/default 是默认模板
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['经典', '简洁', '商务', '企业级'],
  preview: '/previews/login-desktop-classic.png',
  features: ['居中布局', '表单验证', '记住密码', '忘记密码', '第三方登录'],
  props: {
    title: {
      type: 'string',
      default: '用户登录',
      description: '登录页面标题',
    },
    subtitle: {
      type: 'string',
      default: '欢迎回来',
      description: '登录页面副标题',
    },
    logo: {
      type: 'string',
      default: '',
      description: '公司或产品Logo',
    },
    backgroundImage: {
      type: 'string',
      default: '',
      description: '背景图片URL',
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
    minWidth: 1024,
    maxWidth: null,
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15',
}

export default config
