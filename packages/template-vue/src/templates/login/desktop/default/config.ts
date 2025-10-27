/**
 * 默认登录模板配置
 */

export default {
  displayName: '默认登录',
  description: '简洁优雅的登录页面设计',
  version: '1.0.0',
  author: 'LDesign Team',
  tags: ['login', 'default', 'desktop', 'responsive'],
  isDefault: true,
  metadata: {
    preview: '/previews/login-default.png',
    ssr: true,
    responsive: true,
    minVersion: '3.3.0',
  },
  props: {
    title: {
      type: String,
      default: 'Welcome Back',
    },
    subtitle: {
      type: String,
      default: 'Please login to your account',
    },
  },
  emits: ['submit', 'forgot-password', 'register'],
}
