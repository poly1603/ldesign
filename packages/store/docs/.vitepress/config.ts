import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/store',
  description:
    '一个基于Pinia的Vue3状态管理库，支持类、Hook、Provider、装饰器等多种使用方式',

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
            { text: '类式 Store', link: '/guide/class-usage' },
            { text: '装饰器详解', link: '/guide/decorators' },
            { text: '函数式 Store', link: '/guide/functional' },
            { text: '组合式 Store', link: '/guide/composition' },
            { text: 'Store 工厂', link: '/guide/factory' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '状态持久化', link: '/guide/persistence' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '缓存机制', link: '/guide/caching' },
            { text: '防抖节流', link: '/guide/debounce-throttle' },
            { text: '实时同步', link: '/guide/realtime' },
            { text: '中间件系统', link: '/guide/middleware' },
          ],
        },
        {
          text: '企业级应用',
          items: [
            { text: 'Store 模块化', link: '/guide/modularization' },
            { text: '权限管理', link: '/guide/permissions' },
            { text: '错误处理', link: '/guide/error-handling' },
            { text: '测试策略', link: '/guide/testing' },
            { text: '最佳实践', link: '/guide/best-practices' },
          ],
        },
        {
          text: '帮助与支持',
          items: [
            { text: '迁移指南', link: '/guide/migration' },
            { text: '故障排除', link: '/guide/troubleshooting' },
            { text: '常见问题', link: '/guide/faq' },
            { text: '社区资源', link: '/guide/community' },
          ],
        },
      ],
      '/api/': [
        {
          text: '核心 API',
          items: [
            { text: '概览', link: '/api/' },
            { text: 'BaseStore', link: '/api/base-store' },
            { text: 'StoreFactory', link: '/api/store-factory' },
            { text: 'createFunctionalStore', link: '/api/functional-store' },
            { text: 'createCompositionStore', link: '/api/composition-store' },
          ],
        },
        {
          text: '装饰器 API',
          items: [
            { text: '装饰器概览', link: '/api/decorators' },
            { text: '@State', link: '/api/decorators/state' },
            { text: '@Action', link: '/api/decorators/action' },
            { text: '@Getter', link: '/api/decorators/getter' },
            { text: '@Cache', link: '/api/decorators/cache' },
            { text: '@Debounce', link: '/api/decorators/debounce' },
            { text: '@Throttle', link: '/api/decorators/throttle' },
          ],
        },
        {
          text: '工具与集成',
          items: [
            { text: 'Vue 集成', link: '/api/vue' },
            { text: '工具函数', link: '/api/utils' },
            { text: '类型定义', link: '/api/types' },
            { text: '性能优化器', link: '/api/performance-optimizer' },
            { text: '持久化插件', link: '/api/persistence-plugin' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '计数器', link: '/examples/counter' },
            { text: '待办事项', link: '/examples/todo' },
            { text: '用户管理', link: '/examples/user' },
            { text: '表单处理', link: '/examples/form' },
          ],
        },
        {
          text: '使用方式示例',
          items: [
            { text: '装饰器示例', link: '/examples/decorators' },
            { text: '函数式示例', link: '/examples/functional' },
            { text: '组合式示例', link: '/examples/composition' },
            { text: 'Store 工厂', link: '/examples/factory' },
          ],
        },
        {
          text: '高级功能示例',
          items: [
            { text: '性能优化', link: '/examples/performance' },
            { text: '状态持久化', link: '/examples/persistence' },
            { text: '实时同步', link: '/examples/realtime' },
            { text: '中间件系统', link: '/examples/middleware' },
          ],
        },
        {
          text: '实战项目',
          items: [
            { text: '实战概览', link: '/examples/real-world/' },
            { text: '电商系统', link: '/examples/real-world/ecommerce' },
            { text: '权限管理', link: '/examples/real-world/rbac' },
            { text: '数据可视化', link: '/examples/real-world/dashboard' },
            { text: '聊天应用', link: '/examples/real-world/chat' },
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
    ssr: {
      noExternal: ['vue']
    },
  },
})
