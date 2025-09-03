import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign',
  description: '基于 Web Components 的现代化 UI 组件库',
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: '组件', link: '/components/button' },
      { text: 'API', link: '/api/' },
      { text: '更新日志', link: '/changelog' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/your-org/ldesign' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@ldesign/component' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/getting-started' },
          ]
        },
        {
          text: '深入',
          items: [
            { text: '主题定制', link: '/guide/theming' },
            { text: '国际化', link: '/guide/i18n' },
            { text: '最佳实践', link: '/guide/best-practices' },
          ]
        }
      ],
      '/components/': [
        {
          text: '通用组件',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
          ]
        },
        {
          text: '数据输入',
          items: [
            { text: 'Input 输入框', link: '/components/input' },
            { text: 'Form 表单', link: '/components/form' },
            { text: 'Form Item 表单项', link: '/components/form-item' },
          ]
        },
        {
          text: '数据展示',
          items: [
            { text: 'Card 卡片', link: '/components/card' },
            { text: 'Table 表格', link: '/components/table' },
            { text: 'Tooltip 工具提示', link: '/components/tooltip' },
          ]
        },
        {
          text: '反馈',
          items: [
            { text: 'Modal 模态框', link: '/components/modal' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/ldesign' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present LDesign'
    },

    search: {
      provider: 'local'
    },

    outline: {
      label: '页面导航'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },

  // Vite 配置
  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
    optimizeDeps: {
      include: ['vue'],
    },
    server: {
      fs: {
        allow: ['..']
      }
    },
  }
})
