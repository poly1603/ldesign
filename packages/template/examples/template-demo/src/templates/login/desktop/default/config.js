/**
 * 默认桌面端登录模板配置
 */

export default {
  name: 'default',
  displayName: '默认登录模板',
  description: '简洁清爽的默认登录界面，适合大多数应用场景',
  version: '1.0.0',
  author: 'ldesign',
  isDefault: true,
  tags: ['简洁', '默认', '经典'],
  preview: './preview.png',
  props: {
    title: {
      type: String,
      default: '用户登录'
    },
    showRemember: {
      type: Boolean,
      default: true
    },
    showRegister: {
      type: Boolean,
      default: true
    },
    showForgot: {
      type: Boolean,
      default: true
    }
  },
  slots: ['header', 'footer', 'extra'],
  dependencies: [],
  minVueVersion: '3.0.0'
}
