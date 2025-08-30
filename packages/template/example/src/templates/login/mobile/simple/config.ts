import type { TemplateConfig } from '@ldesign/template'

const config: TemplateConfig = {
  id: 'simple',
  name: '简洁登录',
  description: '移动端简洁登录模板',
  version: '1.0.0',
  author: 'LDesign Team',
  category: 'login',
  device: 'mobile',
  variant: 'simple',
  isDefault: true,
  features: ['mobile-optimized', 'touch-friendly'],
  thumbnail: '/thumbnails/login-mobile-simple.png',
  props: {
    title: {
      type: 'string',
      default: '登录',
      description: '登录页面标题'
    },
    showLogo: {
      type: 'boolean',
      default: true,
      description: '是否显示Logo'
    }
  }
}

export default config
