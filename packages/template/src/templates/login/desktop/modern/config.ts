/**
 * 现代风格桌面端登录模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'modern',
  displayName: '现代商务登录模板',
  description: '现代化设计风格的登录界面，采用流行的毛玻璃效果、渐变背景和微交互动画。适合科技公司和现代化企业应用。',
  version: '1.0.0',
  author: 'ldesign',
  isDefault: false,
  tags: ['现代', '商务', '毛玻璃', '动画', '渐变'],
  preview: './preview.png',
  props: {
    title: {
      type: String,
      default: '现代登录'
    },
    subtitle: {
      type: String,
      default: '体验现代化的登录方式'
    },
    showRemember: {
      type: Boolean,
      default: true
    },
    showSocialLogin: {
      type: Boolean,
      default: true
    },
    showRegister: {
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
    },
    secondaryColor: {
      type: String,
      default: '#764ba2'
    },
    enableParticles: {
      type: Boolean,
      default: true
    }
  },
  slots: ['header', 'footer', 'social', 'particles'],
  dependencies: [],
  minVueVersion: '3.0.0',
  features: [
    '毛玻璃效果',
    '粒子动画背景',
    '社交登录',
    '微交互动画',
    '渐变设计',
    '响应式布局',
    '自定义主题',
    '表单验证'
  ],
  screenshots: [
    './screenshot-1.png',
    './screenshot-2.png',
    './screenshot-3.png'
  ]
}

export default config
