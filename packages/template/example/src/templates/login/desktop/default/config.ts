import type { TemplateConfig } from '@ldesign/template'

const config: TemplateConfig = {
  id: 'default',
  name: '默认登录',
  description: '简洁的默认登录模板',
  version: '1.0.0',
  author: 'LDesign Team',
  category: 'login',
  device: 'desktop',
  variant: 'default',
  isDefault: true,
  features: ['responsive', 'accessible'],
  thumbnail: '/thumbnails/login-desktop-default.png',
  props: {
    title: {
      type: 'string',
      default: '欢迎登录',
      description: '登录页面标题'
    },
    showLogo: {
      type: 'boolean',
      default: true,
      description: '是否显示Logo'
    },
    showRememberMe: {
      type: 'boolean',
      default: true,
      description: '是否显示记住我选项'
    }
  }
}

export default config
