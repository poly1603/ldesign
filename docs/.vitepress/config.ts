import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign',
  description: '现代化的 Vue3 组件库和工具集',
  lang: 'zh-CN',
  base: '/ldesign/',

  head: [
    ['link', { rel: 'icon', href: '/ldesign/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'LDesign' }],
    ['meta', { name: 'og:image', content: '/ldesign/og-image.png' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: '组件', link: '/components/overview' },
      { text: '工具', link: '/utils/overview' },
      {
        text: '生态系统',
        items: [
          { text: 'GitHub', link: 'https://github.com/poly1603/ldesign' },
          { text: 'NPM', link: 'https://www.npmjs.com/org/ldesign' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: '进阶',
          items: [
            { text: '主题定制', link: '/guide/theming' },
            { text: '国际化', link: '/guide/i18n' },
            { text: '最佳实践', link: '/guide/best-practices' },
          ],
        },
      ],
      '/components/': [
        {
          text: '组件总览',
          items: [
            { text: '概述', link: '/components/overview' },
          ],
        },
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Icon 图标', link: '/components/icon' },
          ],
        },
      ],
      '/utils/': [
        {
          text: '工具总览',
          items: [
            { text: '概述', link: '/utils/overview' },
          ],
        },
        {
          text: '核心工具',
          items: [
            { text: 'Color 颜色', link: '/utils/color' },
            { text: 'Crypto 加密', link: '/utils/crypto' },
            { text: 'Device 设备', link: '/utils/device' },
            { text: 'Engine 引擎', link: '/utils/engine' },
            { text: 'HTTP 请求', link: '/utils/http' },
            { text: 'I18n 国际化', link: '/utils/i18n' },
            { text: 'Size 尺寸', link: '/utils/size' },
            { text: 'Store 状态', link: '/utils/store' },
            { text: 'Template 模板', link: '/utils/template' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/poly1603/ldesign' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    editLink: {
      pattern: 'https://github.com/poly1603/ldesign/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },

  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    lineNumbers: true,
  },
})
