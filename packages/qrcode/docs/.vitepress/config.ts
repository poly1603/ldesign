import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign QR Code',
  description: '通用的Web端二维码生成库，支持多种前端框架',

  // 基础配置
  base: '/qrcode/',
  lang: 'zh-CN',

  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: 'API参考', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '最佳实践', link: '/best-practices' },
      {
        text: '框架集成',
        items: [
          { text: 'Vue', link: '/examples/vue' },
          { text: 'React', link: '/examples/react' },
          { text: 'Angular', link: '/examples/angular' },
          { text: '原生JavaScript', link: '/examples/vanilla' }
        ]
      }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础用法', link: '/guide/basic-usage' },
            { text: '高级功能', link: '/guide/advanced-features' },
            { text: '配置选项', link: '/guide/configuration' },
            { text: '迁移指南', link: '/guide/migration' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: '类型定义', link: '/api/types' },
            { text: '核心API', link: '/api/core' },
            { text: 'Vue集成', link: '/api/vue' },
            { text: 'React集成', link: '/api/react' },
            { text: 'Angular集成', link: '/api/angular' },
            { text: '工具函数', link: '/api/utils' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '使用示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '原生JavaScript', link: '/examples/vanilla' },
            { text: 'Vue', link: '/examples/vue' },
            { text: 'React', link: '/examples/react' },
            { text: 'Angular', link: '/examples/angular' },
            { text: '跨框架使用', link: '/examples/cross-framework' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/qrcode' }
    ],

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/qrcode/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于'
    },

    // 大纲配置
    outline: {
      level: [2, 3],
      label: '页面导航'
    }
  },

  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/qrcode/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#722ED1' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:title', content: 'LDesign QR Code | 通用二维码生成库' }],
    ['meta', { name: 'og:site_name', content: 'LDesign QR Code' }]
  ],

  // Markdown配置
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  },

  // 构建配置
  build: {
    outDir: '../dist-docs'
  }
})
