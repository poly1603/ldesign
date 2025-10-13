/**
 * 中文语言包 (简体中文)
 */

import common from './common'
import nav from './nav'
import auth from './auth'
import dashboard from './dashboard'
import errors from './errors'

export default {
  common,
  nav,
  auth,
  dashboard,
  errors,
  
  // 页面
  page: {
    home: {
      title: '欢迎来到 LDesign',
      subtitle: '欢迎使用 LDesign 极简应用',
      description: '基于 Vue 3 + LDesign Engine 构建的现代化应用'
    },
    about: {
      title: '关于 LDesign Router',
      subtitle: '了解更多关于 LDesign',
      description: 'LDesign 是一个现代化的前端框架',
      intro: {
        title: '📖 项目简介',
        content: 'LDesign Router 是一个现代化、高性能、功能丰富的 Vue 3 路由解决方案。它完全独立于 vue-router，提供了更好的开发体验和性能优化。'
      },
      goals: {
        title: '🎯 设计目标',
        items: [
          '提供简洁而强大的 API',
          '优化性能，减少内存占用',
          '完善的 TypeScript 支持',
          '与 @ldesign/engine 深度集成',
          '丰富的功能扩展'
        ]
      },
      features: {
        title: '✨ 核心功能',
        smartPrefetch: {
          title: '智能预取',
          description: '基于用户行为和网络条件智能预取路由资源，提升导航速度'
        },
        cacheManagement: {
          title: '缓存管理',
          description: '多级缓存策略，支持内存、会话、本地存储等多种缓存方式'
        },
        performanceMonitoring: {
          title: '性能监控',
          description: '实时监控路由性能，提供详细的性能报告和优化建议'
        },
        securityProtection: {
          title: '安全保护',
          description: '内置 XSS、CSRF 防护，支持认证守卫和权限控制'
        }
      },
      techStack: {
        title: '🔧 技术栈'
      },
      version: {
        title: '📊 版本信息',
        current: '当前版本',
        vueVersion: 'Vue 版本',
        nodeVersion: 'Node 版本',
        license: '许可证'
      },
      contribute: {
        title: '🤝 贡献',
        content: '欢迎贡献代码、提交问题或建议。您可以通过以下方式参与项目：',
        links: {
          github: 'GitHub',
          docs: '文档',
          discussions: '讨论区'
        }
      },
      footer: {
        madeWith: 'Made with ❤️ by LDesign Team',
        copyright: '© 2024 LDesign. 保留所有权利。'
      }
    },
    login: {
      title: '🔐 登录',
      subtitle: '欢迎回到 LDesign Router App',
      username: '用户名',
      usernamePlaceholder: '请输入用户名',
      password: '密码',
      passwordPlaceholder: '请输入密码',
      rememberMe: '记住我',
      loginButton: '登录',
      loggingIn: '登录中...',
      hint: '提示：使用 admin/admin 或 user/user 登录',
      backToHome: '← 返回首页',
      errors: {
        invalidCredentials: '用户名或密码错误',
        serverError: '服务器错误，请稍后重试'
      }
    }
  },
  
  // 功能特性
  features: {
    title: '核心特性',
    performance: {
      title: '极致性能',
      description: '基于 Vue 3 的响应式系统，提供出色的运行时性能'
    },
    security: {
      title: '安全可靠',
      description: '内置安全最佳实践，保护您的应用和数据'
    },
    responsive: {
      title: '响应式设计',
      description: '完美适配各种设备，提供一致的用户体验'
    },
    animation: {
      title: '流畅动画',
      description: '精心设计的动画效果，提升用户交互体验'
    },
    engine: {
      title: 'LDesign 引擎',
      description: '强大的引擎系统，提供完整的应用架构支持'
    },
    developer: {
      title: '开发友好',
      description: '完善的开发工具和文档，让开发更加高效'
    }
  },
  
  // 统计
  stats: {
    routes: '路由数量',
    visits: '访问次数',
    cache: '缓存大小'
  },
  
  // 页脚
  footer: {
    copyright: '© 2024 LDesign. 保留所有权利。',
    version: '版本'
  },
  
  // 消息提示
  message: {
    success: '操作成功',
    error: '操作失败',
    loading: '加载中...',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    reset: '重置',
    submit: '提交',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    finish: '完成'
  },
  
  // 验证消息
  validation: {
    required: '此项为必填',
    email: '请输入有效的邮箱地址',
    phone: '请输入有效的手机号码',
    password: '密码长度至少为 {min} 个字符',
    confirm: '两次输入不一致',
    min: '最少 {min} 个字符',
    max: '最多 {max} 个字符',
    minValue: '最小值为 {min}',
    maxValue: '最大值为 {max}',
    pattern: '格式不正确'
  }
}