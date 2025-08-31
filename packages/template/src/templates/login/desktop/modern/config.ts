/**
 * 现代风格桌面端登录模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'modern',
  displayName: '现代商务登录模板',
  description: '现代化设计风格的登录界面，采用多层渐变背景、毛玻璃装饰球（4个不同尺寸）、现代几何图案（六边形、三角形、菱形）和点阵背景。包含渐变色相变化、图形旋转、发光脉冲等动态效果。适合科技公司、现代企业和创新产品。',
  version: '2.0.0',
  author: 'ldesign',
  isDefault: false,
  tags: ['现代', '商务', '毛玻璃', '渐变', '几何', '动画', '科技'],
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
    '多层渐变背景（3层叠加）',
    '毛玻璃装饰球（4个不同尺寸）',
    '现代几何图案（六边形、三角形、菱形）',
    '点阵背景纹理',
    '渐变色相变化动画',
    '图形旋转动画',
    '发光脉冲效果',
    '粒子动画背景',
    '社交登录',
    '微交互动画',
    '现代化UI设计',
    '响应式布局',
    '自定义主题',
    '表单验证',
    'backdrop-filter 毛玻璃',
    '高性能动画优化'
  ],
  screenshots: [
    './screenshot-1.png',
    './screenshot-2.png',
    './screenshot-3.png'
  ]
}

export default config
