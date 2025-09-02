/**
 * VitePress 配置文件
 * @ldesign/i18n 文档站点配置
 */

import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/i18n',
  description: '企业级国际化解决方案 - 功能强大、类型安全、高性能的多语言库',
  
  // 基础配置
  base: '/i18n/',
  lang: 'zh-CN',
  
  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: 'Vue 集成', link: '/vue/installation' },
      { text: '示例', link: '/examples/basic' },
      {
        text: '更多',
        items: [
          { text: '更新日志', link: '/changelog' },
          { text: '贡献指南', link: '/contributing' },
          { text: 'GitHub', link: 'https://github.com/ldesign/i18n' }
        ]
      }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础概念', link: '/guide/concepts' },
            { text: '配置选项', link: '/guide/configuration' }
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '翻译功能', link: '/guide/translation' },
            { text: '插值与格式化', link: '/guide/interpolation' },
            { text: '复数化', link: '/guide/pluralization' },
            { text: '语言切换', link: '/guide/language-switching' },
            { text: '降级语言', link: '/guide/fallback' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '异步加载', link: '/guide/async-loading' },
            { text: '缓存机制', link: '/guide/caching' },
            { text: '语言检测', link: '/guide/detection' },
            { text: '存储管理', link: '/guide/storage' },
            { text: '性能优化', link: '/guide/performance' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/core' },
            { text: '加载器', link: '/api/loaders' },
            { text: '存储', link: '/api/storage' },
            { text: '检测器', link: '/api/detectors' },
            { text: '工具函数', link: '/api/utils' },
            { text: '类型定义', link: '/api/types' }
          ]
        }
      ],
      '/vue/': [
        {
          text: 'Vue 集成',
          items: [
            { text: '安装配置', link: '/vue/installation' },
            { text: '组合式 API', link: '/vue/composition-api' },
            { text: '组件', link: '/vue/components' },
            { text: '指令', link: '/vue/directives' },
            { text: '最佳实践', link: '/vue/best-practices' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础用法', link: '/examples/basic' },
            { text: 'Vue 项目', link: '/examples/vue' },
            { text: 'React 项目', link: '/examples/react' },
            { text: '服务端渲染', link: '/examples/ssr' },
            { text: '微前端', link: '/examples/micro-frontend' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/i18n' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 LDesign Team'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/i18n/edit/main/packages/i18n/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  // Markdown 配置
  markdown: {
    theme: 'github-dark',
    lineNumbers: true,
    config: (md) => {
      // 自定义 markdown 插件
    }
  },

  // 构建配置
  vite: {
    define: {
      __VUE_OPTIONS_API__: false
    }
  }
})
