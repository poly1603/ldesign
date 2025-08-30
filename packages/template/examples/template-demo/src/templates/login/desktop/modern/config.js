/**
 * 现代风格桌面端登录模板配置
 */

export default {
  name: 'modern',
  displayName: '现代登录模板',
  description: '现代化设计风格的登录界面，包含动画效果和社交登录',
  version: '1.0.0',
  author: 'ldesign',
  isDefault: false,
  tags: ['现代', '动画', '社交登录'],
  preview: './preview.png',
  props: {
    title: {
      type: String,
      default: '现代登录'
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
    }
  },
  slots: ['header', 'footer', 'social'],
  dependencies: [],
  minVueVersion: '3.0.0'
}
