/**
 * 桌面端分割登录模板配置
 */

import type { TemplateConfig } from '../../../../types'

export default {
  name: 'split',
  displayName: '分割式登录页',
  description: '左右分割式布局的登录页面，支持插槽定制',
  version: '1.1.0',
  author: 'LDesign Team',
  tags: ['login', 'desktop', 'split', 'modern', 'slots'],
  isDefault: false,
  preview: '/previews/login-desktop-split.png',
  lastModified: Date.now(),
  
  // 支持的插槽
  slots: {
    leftPanel: {
      name: 'leftPanel',
      description: '左侧面板内容',
      props: {
        brand: '品牌名称',
        slogan: '宣传标语'
      }
    },
    brand: {
      name: 'brand',
      description: '品牌信息区域',
      required: false
    },
    leftExtra: {
      name: 'leftExtra',
      description: '左侧额外内容',
      required: false
    },
    logo: {
      name: 'logo',
      description: '右侧 Logo 区域',
      required: false
    },
    header: {
      name: 'header',
      description: '标题区域',
      props: {
        title: '标题',
        subtitle: '副标题'
      }
    },
    loginPanel: {
      name: 'loginPanel',
      description: '核心插槽 - 自定义登录面板',
      props: {
        form: '表单数据',
        loading: '加载状态',
        error: '错误信息',
        handleSubmit: '提交函数'
      }
    },
    socialLogin: {
      name: 'socialLogin',
      description: '社交登录区域',
      props: {
        providers: '社交登录提供商列表'
      }
    },
    footer: {
      name: 'footer',
      description: '底部链接区域',
      required: false
    },
    extra: {
      name: 'extra',
      description: '额外内容',
      required: false
    }
  }
} as TemplateConfig
