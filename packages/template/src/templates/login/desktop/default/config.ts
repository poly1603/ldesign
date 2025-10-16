/**
 * 桌面端默认登录模板配置
 */

import type { TemplateConfig } from '../../../../types'

export default {
  name: 'default',
  displayName: '默认登录页',
  description: '简洁大方的桌面端登录页面，支持插槽定制',
  version: '1.1.0',
  author: 'LDesign Team',
  tags: ['login', 'desktop', 'default', 'simple', 'slots'],
  isDefault: true,
  preview: '/previews/login-desktop-default.png',
  lastModified: Date.now(),
  
  // 支持的插槽
  slots: {
    logo: {
      name: 'logo',
      description: '自定义 Logo 区域',
      required: false
    },
    header: {
      name: 'header',
      description: '自定义标题区域',
      props: {
        title: '传入的标题',
        subtitle: '传入的副标题'
      }
    },
    loginPanel: {
      name: 'loginPanel',
      description: '核心插槽 - 完全自定义登录面板',
      props: {
        form: '表单数据对象',
        loading: '加载状态',
        error: '错误信息',
        handleSubmit: '提交函数'
      }
    },
    socialLogin: {
      name: 'socialLogin',
      description: '社交登录区域',
      required: false
    },
    footer: {
      name: 'footer',
      description: '底部链接区域',
      required: false
    },
    extra: {
      name: 'extra',
      description: '额外内容区域',
      required: false
    }
  }
} as TemplateConfig
