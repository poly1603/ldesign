import type { TemplateConfig } from '../../../../types'

export const config: TemplateConfig = {
  id: 'login-mobile-default',
  name: '默认移动登录',
  description: '移动端默认登录模板，简洁易用',
  category: 'login',
  device: 'mobile',
  variant: 'default',
  isDefault: true, // 设为移动端默认模板
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['默认', '移动端', '简洁', '易用'],
  preview: '/previews/login-mobile-default.png',
  features: ['移动端优化', '简洁设计', '触摸友好', '快速登录', '响应式布局'],
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
      default: false,
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
