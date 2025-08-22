/**
 * VitePress 文档配置
 * 为@ldesign/pdf包创建幽默生动的文档网站 📚
 */

import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/pdf',
  description: '🎭 让PDF预览变得优雅而高效的TypeScript库',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
  ],

  themeConfig: {
    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '🚀 快速开始', link: '/guide/' },
      { text: '📖 API 参考', link: '/api/' },
      { text: '💡 示例', link: '/examples/' },
      { text: '🛠️ 贡献', link: '/contributing' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '🎯 入门指南',
          items: [
            { text: '什么是 @ldesign/pdf？', link: '/guide/' },
            { text: '安装和设置', link: '/guide/installation' },
            { text: '基础用法', link: '/guide/basic-usage' },
            { text: '高级功能', link: '/guide/advanced' },
          ],
        },
        {
          text: '🏗️ 核心概念',
          items: [
            { text: 'PDF 引擎', link: '/guide/engine' },
            { text: '缓存系统', link: '/guide/caching' },
            { text: 'Worker 支持', link: '/guide/workers' },
            { text: '事件系统', link: '/guide/events' },
          ],
        },
        {
          text: '🎨 框架集成',
          items: [
            { text: 'Vue 3 集成', link: '/guide/vue' },
            { text: 'React 集成', link: '/guide/react' },
            { text: '原生 JS 使用', link: '/guide/vanilla' },
          ],
        },
        {
          text: '🚀 优化指南',
          items: [
            { text: 'API 参考', link: '/guide/api' },
            { text: '最佳实践', link: '/guide/best-practices' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '故障排除', link: '/guide/troubleshooting' },
          ],
        },
      ],
      '/api/': [
        {
          text: '📚 API 参考',
          items: [
            { text: '核心 API', link: '/api/' },
            { text: 'PDF 引擎', link: '/api/engine' },
            { text: '缓存 API', link: '/api/cache' },
            { text: '工具函数', link: '/api/utils' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '💡 示例展示',
          items: [
            { text: '基础示例', link: '/examples/' },
            { text: 'Vue 3 示例', link: '/examples/vue' },
            { text: 'React 示例', link: '/examples/react' },
            { text: '高级用法', link: '/examples/advanced' },
          ],
        },
      ],
    },

    footer: {
      message: '用 ❤️ 和 ☕ 制作',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    search: {
      provider: 'local',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign-team/ldesign' },
    ],

    editLink: {
      pattern: 'https://github.com/ldesign-team/ldesign/edit/main/packages/pdf/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  vite: {
    optimizeDeps: {
      exclude: ['@ldesign/pdf'],
    },
  },
})