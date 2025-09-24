import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/form',
  description: '现代化的 Vue 3 表单组件库，专为构建复杂、动态的表单而设计',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/introduction' },
      { text: 'API', link: '/api/components' },
      { text: '示例', link: '/examples/basic' },
      { text: 'GitHub', link: 'https://github.com/ldesign/form' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '基础概念', link: '/guide/concepts' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: 'Vue 组件', link: '/guide/vue-component' },
            { text: 'Composition API', link: '/guide/composition-api' },
            { text: '表单验证', link: '/guide/validation' },
            { text: '布局系统', link: '/guide/layout' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '自定义组件', link: '/guide/custom-components' },
            { text: '国际化', link: '/guide/i18n' },
            { text: '性能优化', link: '/guide/performance' },
          ],
        },
      ],

      '/api/': [
        {
          text: '组件 API',
          items: [
            { text: '组件', link: '/api/components' },
            { text: 'Composables', link: '/api/composables' },
            { text: '工具函数', link: '/api/utils' },
          ],
        },
        {
          text: '类型定义',
          items: [{ text: '类型', link: '/api/types' }],
        },
      ],

      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基础表单', link: '/examples/basic' },
            { text: '动态表单', link: '/examples/dynamic' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/ldesign/form' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 LDesign',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern:
        'https://github.com/ldesign/form/edit/main/packages/form/docs/:path',
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

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#667eea' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    ['meta', { property: 'og:title', content: '自适应表单布局系统' }],
    ['meta', { property: 'og:site_name', content: '自适应表单布局系统' }],
    ['meta', { property: 'og:image', content: '/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://form.ldesign.dev/' }],
  ],
})
