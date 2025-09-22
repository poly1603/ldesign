/**
 * 创意设计风格桌面端登录模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'creative',
  displayName: '创意登录模板框架',
  description: '简化的创意登录模板框架，采用不对称布局和基础几何装饰。保留创意视觉风格，所有内容通过插槽自定义。适合设计公司、创意工作室快速搭建个性化登录界面。',
  version: '3.0.0',
  author: 'ldesign',
  isDefault: false,
  tags: ['创意', '框架', '不对称', '艺术', '插槽', '自定义'],
  preview: './preview.png',
  props: {
    primaryColor: {
      type: String,
      default: '#ff6b6b',
    },
    secondaryColor: {
      type: String,
      default: '#4ecdc4',
    },
    backgroundImage: {
      type: String,
      default: '',
    },
    enableAnimations: {
      type: Boolean,
      default: true,
    },
  },
  slots: ['header', 'content', 'footer', 'artwork'],
  dependencies: [],
  minVueVersion: '3.0.0',
  features: [
    '不对称布局框架',
    '创意装饰区域',
    '简化几何装饰',
    '完全插槽化',
    '响应式设计',
    '自定义主题色',
    '动画开关',
    '轻量级实现',
  ],
}

export default config
