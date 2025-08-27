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
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '存储引擎', link: '/guide/storage-engines' },
            { text: '智能策略', link: '/guide/smart-strategy' },
            { text: '安全特性', link: '/guide/security' },
            { text: 'Vue 集成', link: '/guide/vue-integration' },
          ],
        },
        {
          text: '高级用法',
          items: [
            { text: '自定义引擎', link: '/guide/custom-engines' },
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
            { text: '存储引擎', link: '/api/storage-engines' },
            { text: '安全管理', link: '/api/security' },
            { text: 'Vue 组合式函数', link: '/api/vue-composables' },
            { text: 'Vue 集成', link: '/api/vue-integration' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '使用示例',
          items: [
            { text: '基础用法', link: '/examples/basic-usage' },
            { text: '高级用法', link: '/examples/advanced-usage' },
            { text: 'Vue 应用', link: '/examples/vue-app' },
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
