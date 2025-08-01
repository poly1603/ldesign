import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/i18n',
  description: '功能完整的框架无关多语言管理系统',
  base: '/i18n/',

  head: [
    ['link', { rel: 'icon', href: '/i18n/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#007bff' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API 参考', link: '/api/core' },
      { text: '示例', link: '/examples/vanilla' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/i18n' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/i18n' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础概念', link: '/guide/concepts' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '翻译功能', link: '/guide/translation' },
            { text: '插值和复数', link: '/guide/interpolation' },
            { text: '语言包管理', link: '/guide/language-packs' },
            { text: '缓存和性能', link: '/guide/performance' },
          ],
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3 集成', link: '/guide/vue-integration' },
            { text: 'React 集成', link: '/guide/react-integration' },
            { text: '其他框架', link: '/guide/other-frameworks' },
          ],
        },
        {
          text: '高级用法',
          items: [
            { text: '自定义加载器', link: '/guide/custom-loaders' },
            { text: '自定义存储', link: '/guide/custom-storage' },
            { text: '插件开发', link: '/guide/plugin-development' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/core' },
            { text: 'Vue API', link: '/api/vue' },
            { text: '工具函数', link: '/api/utils' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: 'Vanilla JavaScript', link: '/examples/vanilla' },
            { text: 'Vue 3', link: '/examples/vue' },
            { text: '最佳实践', link: '/examples/best-practices' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/i18n' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 ldesign',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/ldesign/i18n/edit/main/packages/i18n/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
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
})
