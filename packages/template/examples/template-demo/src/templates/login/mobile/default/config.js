/**
 * 默认移动端登录模板配置
 */

export default {
  name: 'default',
  displayName: '移动端登录模板',
  description: '专为移动设备优化的登录界面，支持触摸操作和手势',
  version: '1.0.0',
  author: 'ldesign',
  isDefault: true,
  tags: ['移动端', '触摸优化', '简洁'],
  preview: './preview.png',
  props: {
    title: {
      type: String,
      default: '手机登录'
    },
    showRemember: {
      type: Boolean,
      default: false
    },
    showQuickLogin: {
      type: Boolean,
      default: true
    },
    showRegister: {
      type: Boolean,
      default: true
    }
  },
  slots: ['header', 'footer', 'quick-actions'],
  dependencies: [],
  minVueVersion: '3.0.0'
}
