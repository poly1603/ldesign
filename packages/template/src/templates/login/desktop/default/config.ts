/**
 * 默认桌面端登录模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'default',
  displayName: '默认登录模板框架',
  description: '简洁的登录模板框架，提供基础布局和空白登录面板。包含简化的几何装饰元素，所有内容通过插槽自定义。适合快速搭建各种登录界面。',
  version: '3.0.0',
  author: 'ldesign',
  isDefault: true,
  tags: ['框架', '简洁', '基础', '插槽', '自定义', '布局'],
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
    '基础布局框架',
    '空白登录面板',
    '简化几何装饰',
    '完全插槽化',
    '响应式设计',
    '自定义主题色',
    '自定义背景',
    '动画开关',
    '轻量级实现',
  ],
}

export default config
