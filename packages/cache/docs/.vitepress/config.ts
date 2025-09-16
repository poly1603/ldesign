import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/cache',
  description: '功能强大的浏览器缓存管理器库',
  base: '/cache/',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/cache-manager' },
      { text: '完整 API', link: '/API' },
      { text: '示例', link: '/examples/basic-usage' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装配置', link: '/guide/installation' },
            { text: '基础概念', link: '/guide/concepts' },
            { text: '预设', link: '/guide/presets' },
            { text: '文档索引', link: '/guide/overview' },
            { text: '常见任务', link: '/guide/common-tasks' },
            { text: 'FAQ', link: '/guide/faq' },
            { text: '迁移指南', link: '/guide/migration' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '存储引擎', link: '/guide/storage-engines' },
            { text: '命名空间', link: '/guide/namespaces' },
            { text: '智能策略', link: '/guide/smart-strategy' },
            { text: '安全特性', link: '/guide/security' },
            { text: 'Vue 集成', link: '/guide/vue-integration' },
          ],
        },
        {
          text: '高级用法',
          items: [
            { text: '自定义引擎', link: '/guide/custom-engines' },
            { text: '排障指南', link: '/guide/troubleshooting' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '最佳实践', link: '/guide/best-practices' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'CacheManager', link: '/api/cache-manager' },
            { text: '命名空间', link: '/api/namespace' },
            { text: '批量操作', link: '/api/batch' },
            { text: '存储引擎', link: '/api/storage-engines' },
            { text: '安全管理', link: '/api/security' },
            { text: 'Vue 组合式函数', link: '/api/vue-composables' },
            { text: 'Vue 集成', link: '/api/vue-integration' },
            { text: '类型定义', link: '/api/types' },
            { text: '数据压缩', link: '/api/compression' },
            { text: '智能预取', link: '/api/prefetch' },
            { text: '缓存预热', link: '/api/warmup' },
            { text: '跨标签页同步', link: '/api/sync' },
            { text: '性能监控', link: '/api/performance-monitor' },
            { text: '错误处理', link: '/api/error-handling' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '使用示例',
          items: [
            { text: '基础用法', link: '/examples/basic-usage' },
            { text: '高级用法', link: '/examples/advanced-usage' },
            { text: '命名空间', link: '/examples/namespaces' },
            { text: 'Vue 应用', link: '/examples/vue-app' },
            { text: '命名空间迁移', link: '/examples/namespace-migration' },
            { text: '安全缓存', link: '/examples/secure-cache' },
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

  ignoreDeadLinks: true,
})
