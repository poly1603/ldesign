import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/store',
  description: '一个基于Pinia的Vue3状态管理库，支持类、Hook、Provider、装饰器等多种使用方式',

  vue: {
    template: {
      compilerOptions: {
        isCustomElement: tag => tag.includes('-'),
      },
    },
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:title', content: '@ldesign/store | Vue3 状态管理库' }],
    ['meta', { name: 'og:site_name', content: '@ldesign/store' }],
    ['meta', { name: 'og:image', content: '/og-image.png' }],
    ['meta', { name: 'og:url', content: 'https://ldesign-store.netlify.app/' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/', activeMatch: '/guide/' },
      { text: 'API 参考', link: '/api/', activeMatch: '/api/' },
      { text: '示例', link: '/examples/', activeMatch: '/examples/' },
      {
        text: '链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/store' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@ldesign/store' },
          { text: '更新日志', link: '/changelog' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '安装指南', link: '/guide/installation' },
            { text: '基本概念', link: '/guide/concepts' },
          ],
        },
        {
          text: '使用方式',
          items: [
            { text: '类式使用', link: '/guide/class-usage' },
            { text: '装饰器详解', link: '/guide/decorators' },
            { text: 'Hook 使用', link: '/guide/hooks' },
            { text: 'Provider 模式', link: '/guide/provider' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '持久化', link: '/guide/persistence' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '最佳实践', link: '/guide/best-practices' },
            { text: '迁移指南', link: '/guide/migration' },
            { text: '故障排除', link: '/guide/troubleshooting' },
            { text: '常见问题', link: '/guide/faq' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: '核心 API', link: '/api/core' },
            { text: '装饰器 API', link: '/api/decorators' },
            { text: 'Hook API', link: '/api/hooks' },
            { text: 'Vue 集成', link: '/api/vue' },
            { text: '工具函数', link: '/api/utils' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '基础示例', link: '/examples/basic' },
            { text: '中级示例', link: '/examples/intermediate' },
            { text: '高级示例', link: '/examples/advanced' },
          ],
        },
        {
          text: '实战项目',
          items: [
            { text: '实战概览', link: '/examples/real-world/' },
            { text: '电商系统', link: '/examples/real-world/ecommerce' },
            { text: '权限管理', link: '/examples/real-world/rbac' },
            { text: '实时同步', link: '/examples/real-world/realtime' },
            { text: '表单管理', link: '/examples/real-world/forms' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/store' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@ldesign/store' },
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    editLink: {
      pattern: 'https://github.com/ldesign/store/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面',
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

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
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
      include: ['vue'],
    },
  },
})
