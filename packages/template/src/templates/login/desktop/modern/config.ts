/**
 * 现代风格桌面端登录模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'modern',
  displayName: '现代登录模板框架',
  description: '简化的现代登录模板框架，采用多层渐变背景和基础毛玻璃装饰。保留现代化视觉风格，所有内容通过插槽自定义。适合科技公司、现代企业快速搭建时尚登录界面。',
  version: '3.0.0',
  author: 'ldesign',
  isDefault: false,
  tags: ['现代', '框架', '毛玻璃', '渐变', '插槽', '自定义'],
  preview: './preview.png',
  props: {
    primaryColor: {
      type: String,
      default: 'var(--ldesign-brand-color)',
    },
    secondaryColor: {
      type: String,
      default: 'var(--ldesign-brand-color-6)',
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
  slots: ['header', 'content', 'footer'],
  dependencies: [],
  minVueVersion: '3.0.0',
  features: [
    '现代布局框架',
    '多层渐变背景',
    '毛玻璃装饰效果',
    '简化几何图案',
    '完全插槽化',
    '响应式设计',
    '自定义主题色',
    '动画开关',
    '轻量级实现',
  ],
}

export default config
