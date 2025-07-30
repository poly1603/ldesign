import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/color',
  description: '功能完整的主题色管理系统',
  base: '/color/',

  head: [
    ['link', { rel: 'icon', href: '/color/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#1890ff' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/color' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/color' },
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
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: '核心概念',
          items: [
            { text: '主题管理', link: '/guide/theme-management' },
            { text: '颜色生成', link: '/guide/color-generation' },
            { text: '色阶系统', link: '/guide/color-scales' },
            { text: '性能优化', link: '/guide/performance' },
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
            { text: '自定义主题', link: '/guide/custom-themes' },
            { text: '系统主题检测', link: '/guide/system-theme' },
            { text: '缓存和存储', link: '/guide/caching-storage' },
          ],
        },
      ],
      '/api/': [
        {
          text: '核心 API',
          items: [
            { text: 'ThemeManager', link: '/api/theme-manager' },
            { text: '创建函数', link: '/api/create-functions' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
        {
          text: '工具 API',
          items: [
            { text: '颜色转换', link: '/api/color-converter' },
            { text: '颜色生成', link: '/api/color-generator' },
            { text: '色阶生成', link: '/api/color-scales' },
            { text: 'CSS 注入', link: '/api/css-injector' },
          ],
        },
        {
          text: 'Vue API',
          items: [
            { text: '组合式 API', link: '/api/vue-composables' },
            { text: 'Vue 插件', link: '/api/vue-plugin' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '快速开始', link: '/examples/' },
            { text: '主题切换', link: '/examples/theme-switching' },
            { text: '颜色生成', link: '/examples/color-generation' },
          ],
        },
        {
          text: '高级示例',
          items: [
            { text: '自定义主题', link: '/examples/custom-themes' },
            { text: '性能优化', link: '/examples/performance' },
            { text: '系统主题', link: '/examples/system-theme' },
          ],
        },
        {
          text: '框架示例',
          items: [
            { text: 'Vue 3 示例', link: '/examples/vue' },
            { text: 'Vanilla JS 示例', link: '/examples/vanilla' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/color' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 ldesign',
    },

    editLink: {
      pattern: 'https://github.com/ldesign/color/edit/main/packages/color/docs/:path',
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

  vite: {
    resolve: {
      alias: {
        '@ldesign/color': '../src',
      },
    },
  },
})
