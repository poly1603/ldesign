/**
 * 默认移动端登录模板配置
 */

import type { TemplateConfig } from '../../../../types/template'

const config: TemplateConfig = {
  name: 'default',
  displayName: '移动端默认登录模板',
  description: '专为移动设备优化的登录界面，采用全屏沉浸式设计，包含多层径向渐变装饰背景、45度交叉线条图案、手势提示动画（滑动指示器和点击提示）和增强的触摸反馈效果。完美适配各种手机屏幕尺寸和状态栏。',
  version: '2.0.0',
  author: 'ldesign',
  isDefault: true,
  tags: ['移动端', '触摸优化', '全屏设计', '手机适配', '手势', '渐变', '沉浸式'],
  preview: './preview.png',
  props: {
    title: {
      type: String,
      default: '手机登录',
    },
    subtitle: {
      type: String,
      default: '随时随地，安全登录',
    },
    showRemember: {
      type: Boolean,
      default: false,
    },
    showQuickLogin: {
      type: Boolean,
      default: true,
    },
    showRegister: {
      type: Boolean,
      default: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    primaryColor: {
      type: String,
      default: '#667eea',
    },
    enableBiometric: {
      type: Boolean,
      default: true,
    },
    showStatusBar: {
      type: Boolean,
      default: true,
    },
  },
  slots: ['header', 'footer', 'quick-actions', 'status-bar'],
  dependencies: [],
  minVueVersion: '3.0.0',
  features: [
    '全屏沉浸式设计',
    '多层径向渐变背景',
    '几何图案装饰（45度交叉线条）',
    '手势提示动画（滑动+点击）',
    '增强触摸反馈效果',
    '状态栏完美适配',
    '移动端专用动画优化',
    '生物识别登录',
    '触摸手势支持',
    '状态栏集成',
    '键盘适配',
    '震动反馈',
    '快捷登录',
    '安全指示器',
    '单手操作优化',
    '视口自适应',
  ],
  // screenshots removed due to type constraints
  // screenshots: [
  //   './screenshot-light.png',
  //   './screenshot-dark.png',
  // ],
}

export default config
