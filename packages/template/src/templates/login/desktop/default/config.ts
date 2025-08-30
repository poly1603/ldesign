/**
 * 默认桌面端登录模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'default',
  displayName: '默认登录模板',
  description: '简洁清爽的默认登录界面，适合大多数商务应用场景。采用经典的居中布局，配色温和，用户体验友好。',
  version: '1.0.0',
  author: 'ldesign',
  isDefault: true,
  tags: ['简洁', '默认', '经典', '商务'],
  preview: './preview.png',
  props: {
    title: {
      type: String,
      default: '用户登录'
    },
    subtitle: {
      type: String,
      default: '欢迎回来，请登录您的账户'
    },
    showRemember: {
      type: Boolean,
      default: true
    },
    showRegister: {
      type: Boolean,
      default: true
    },
    showForgot: {
      type: Boolean,
      default: true
    },
    logoUrl: {
      type: String,
      default: ''
    },
    backgroundImage: {
      type: String,
      default: ''
    },
    primaryColor: {
      type: String,
      default: '#667eea'
    }
  },
  slots: ['header', 'footer', 'extra', 'logo'],
  dependencies: [],
  minVueVersion: '3.0.0',
  features: [
    '响应式设计',
    '表单验证',
    '记住密码',
    '忘记密码',
    '注册链接',
    '自定义主题色',
    '自定义背景'
  ],
  screenshots: [
    './screenshot-1.png',
    './screenshot-2.png'
  ]
}

export default config
