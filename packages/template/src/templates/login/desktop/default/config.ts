import type { TemplateConfig } from '../../../../types'

const config: TemplateConfig = {
  id: 'default',
  name: '默认登录模板',
  description: '简洁的默认登录模板',
  version: '1.0.0',
  author: 'LDesign Team',
  category: 'login',
  device: 'desktop',
  variant: 'default',
  isDefault: true,
  features: ['responsive', 'accessible'],
  props: {
    title: {
      type: 'string',
      default: '用户登录',
      description: '登录页面标题',
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
  },
}

export default config
