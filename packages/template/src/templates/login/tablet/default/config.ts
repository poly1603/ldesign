import type { TemplateConfig } from '../../../../types'

export const config: TemplateConfig = {
  id: 'login-tablet-default',
  name: '默认平板登录',
  description: '平板端默认登录模板，适配中等屏幕',
  category: 'login',
  device: 'tablet',
  variant: 'default',
  isDefault: true, // 设为平板端默认模板
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['默认', '平板端', '适配', '中等屏幕'],
  preview: '/previews/login-tablet-default.png',
  features: ['平板端优化', '中等屏幕适配', '触摸友好', '横竖屏适配', '响应式布局'],
  props: {
    title: {
      type: 'string',
      default: '登录',
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
      description: '登录页面logo',
    },
    showRememberMe: {
      type: 'boolean',
      default: true,
      description: '是否显示记住我选项',
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
    thirdPartyProviders: {
      type: 'array',
      default: ['wechat', 'qq', 'weibo'],
      description: '第三方登录提供商',
    },
  },
  dependencies: [],
  compatibility: {
    vue: '^3.0.0',
    typescript: '^4.0.0',
  },
}

export default config
