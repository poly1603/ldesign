/**
 * 默认桌面端登录模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'default',
  displayName: '默认登录模板',
  description: '简洁专业的默认登录界面，采用经典的对称布局和商务配色。包含专业几何装饰元素（圆形、方形、线条）和品牌水印设计。适合企业应用、管理系统和商务平台。',
  version: '2.0.0',
  author: 'ldesign',
  isDefault: true,
  tags: ['简洁', '默认', '经典', '商务', '专业', '几何', '品牌'],
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
    '对称经典布局',
    '专业几何装饰',
    '品牌水印设计',
    '商务渐变背景',
    '响应式设计',
    '表单验证',
    '记住密码',
    '忘记密码',
    '注册链接',
    '自定义主题色',
    '自定义背景',
    '无障碍访问优化',
    '企业级安全',
    '专业视觉风格'
  ],
  screenshots: [
    './screenshot-1.png',
    './screenshot-2.png'
  ]
}

export default config
