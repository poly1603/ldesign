/**
 * 创意设计风格桌面端登录模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'creative',
  displayName: '创意设计登录模板',
  description: '充满创意的登录界面设计，采用不对称布局、大胆的色彩搭配和创新的交互方式。适合设计公司、创意工作室和艺术类应用。',
  version: '1.0.0',
  author: 'ldesign',
  isDefault: false,
  tags: ['创意', '设计', '不对称', '艺术', '创新'],
  preview: './preview.png',
  props: {
    title: {
      type: String,
      default: '创意登录'
    },
    subtitle: {
      type: String,
      default: '释放你的创造力'
    },
    showRemember: {
      type: Boolean,
      default: true
    },
    showRegister: {
      type: Boolean,
      default: true
    },
    showCreativeElements: {
      type: Boolean,
      default: true
    },
    logoUrl: {
      type: String,
      default: ''
    },
    accentColor: {
      type: String,
      default: '#ff6b6b'
    },
    secondaryAccent: {
      type: String,
      default: '#4ecdc4'
    },
    tertiaryAccent: {
      type: String,
      default: '#45b7d1'
    },
    enableAnimations: {
      type: Boolean,
      default: true
    }
  },
  slots: ['header', 'footer', 'creative-elements', 'artwork'],
  dependencies: [],
  minVueVersion: '3.0.0',
  features: [
    '不对称布局',
    '创意动画',
    '多彩配色',
    '艺术元素',
    '交互式背景',
    '创新表单设计',
    '视觉冲击力',
    '个性化定制'
  ],
  screenshots: [
    './screenshot-1.png',
    './screenshot-2.png',
    './screenshot-3.png'
  ]
}

export default config
