/**
 * 默认平板端登录模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'default',
  displayName: '平板端默认登录模板',
  description: '专为平板设备优化的登录界面，包含平板专用装饰元素（圆形、波浪、网格）、触摸友好的视觉提示（3个触摸涟漪效果）和SVG波浪动画。支持横屏竖屏自动适配，完美适配iPad等平板设备。',
  version: '2.0.0',
  author: 'ldesign',
  isDefault: true,
  tags: ['平板', '触摸优化', '中等尺寸', '横屏适配', '波浪', '涟漪', 'SVG'],
  preview: './preview.png',
  props: {
    title: {
      type: String,
      default: '平板登录',
    },
    subtitle: {
      type: String,
      default: '在平板上享受更好的体验',
    },
    showRemember: {
      type: Boolean,
      default: true,
    },
    showRegister: {
      type: Boolean,
      default: true,
    },
    showForgot: {
      type: Boolean,
      default: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    backgroundImage: {
      type: String,
      default: '',
    },
    primaryColor: {
      type: String,
      default: '#667eea',
    },
    enableLandscapeMode: {
      type: Boolean,
      default: true,
    },
  },
  slots: ['header', 'footer', 'extra', 'sidebar'],
  dependencies: [],
  minVueVersion: '3.0.0',
  features: [
    '平板专用装饰元素',
    '触摸涟漪效果（3个提示）',
    'SVG波浪动画',
    '动态网格背景',
    '浮动装饰动画',
    '平板优化布局',
    '触摸友好交互',
    '横屏竖屏适配',
    '中等尺寸设计',
    '手势支持',
    '分屏布局',
    '响应式字体',
    '触摸反馈增强',
    '屏幕方向检测',
    '触摸区域优化',
  ],
  screenshots: [
    './screenshot-portrait.png',
    './screenshot-landscape.png',
  ],
}

export default config
