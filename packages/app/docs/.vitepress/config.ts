import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Engine 演示应用',
  description: '强大的 Vue3 应用引擎演示和文档',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: '示例', link: '/examples/' },
      { text: 'API', link: '/api/' },
      {
        text: '更多',
        items: [
          { text: '最佳实践', link: '/best-practices/' },
          { text: '常见问题', link: '/faq/' },
          { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '项目结构', link: '/guide/project-structure' },
            { text: '配置说明', link: '/guide/configuration' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '插件系统', link: '/guide/plugins' },
            { text: '中间件', link: '/guide/middleware' },
            { text: '状态管理', link: '/guide/state-management' },
            { text: '事件系统', link: '/guide/events' },
          ],
        },
        {
          text: '工具功能',
          items: [
            { text: '日志系统', link: '/guide/logging' },
            { text: '通知系统', link: '/guide/notifications' },
            { text: '指令管理', link: '/guide/directives' },
            { text: '缓存管理', link: '/guide/caching' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '性能监控', link: '/guide/performance' },
            { text: '安全管理', link: '/guide/security' },
            { text: '测试', link: '/guide/testing' },
            { text: '部署', link: '/guide/deployment' },
          ],
        },
      ],

      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '插件开发', link: '/examples/plugin-development' },
            { text: '中间件使用', link: '/examples/middleware-usage' },
            { text: '状态管理', link: '/examples/state-management' },
          ],
        },
        {
          text: '高级示例',
          items: [
            { text: '自定义指令', link: '/examples/custom-directives' },
            { text: '性能优化', link: '/examples/performance-optimization' },
            { text: '安全实践', link: '/examples/security-practices' },
            { text: '集成测试', link: '/examples/integration-testing' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: 'Engine', link: '/api/engine' },
            { text: 'Plugin Manager', link: '/api/plugin-manager' },
            { text: 'Middleware Manager', link: '/api/middleware-manager' },
            { text: 'State Manager', link: '/api/state-manager' },
            { text: 'Event Manager', link: '/api/event-manager' },
            { text: 'Logger', link: '/api/logger' },
            { text: 'Notification Manager', link: '/api/notification-manager' },
            { text: 'Cache Manager', link: '/api/cache-manager' },
            { text: 'Performance Manager', link: '/api/performance-manager' },
            { text: 'Security Manager', link: '/api/security-manager' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    editLink: {
      pattern:
        'https://github.com/ldesign/ldesign/edit/main/packages/app/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    search: {
      provider: 'local',
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    ['meta', { property: 'og:title', content: 'LDesign Engine 演示应用' }],
    ['meta', { property: 'og:site_name', content: 'LDesign Engine Demo' }],
    ['meta', { property: 'og:url', content: 'https://ldesign.dev/app/' }],
  ],
})
