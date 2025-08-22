import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Engine',
  description: '强大的Vue3应用引擎，提供插件化架构和完整的开发工具链',

  // 忽略死链接检查
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    [
      'meta',
      { property: 'og:title', content: 'LDesign Engine | Vue3应用引擎' },
    ],
    ['meta', { property: 'og:site_name', content: 'LDesign Engine' }],
    ['meta', { property: 'og:image', content: '/og-image.png' }],
    [
      'meta',
      { property: 'og:url', content: 'https://ldesign.github.io/engine/' },
    ],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '入门指南', link: '/guide/getting-started' },
          { text: '最佳实践', link: '/guide/best-practices' },
        ],
      },
      {
        text: 'API参考',
        items: [
          { text: '核心API', link: '/api/core' },
          { text: 'Engine', link: '/api/engine' },
          { text: '类型定义', link: '/api/types' },
        ],
      },
      {
        text: '示例',
        items: [
          { text: '基础示例', link: '/examples/basic' },
          { text: '高级示例', link: '/examples/advanced' },
          { text: '集成示例', link: '/examples/integration' },
        ],
      },
      {
        text: '生态系统',
        items: [
          { text: 'Vue Router集成', link: '/ecosystem/vue-router' },
          { text: 'Pinia集成', link: '/ecosystem/pinia' },
          { text: 'Element Plus集成', link: '/ecosystem/element-plus' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '入门指南', link: '/guide/getting-started' },
            { text: '配置选项', link: '/guide/configuration' },
            { text: '迁移指南', link: '/guide/migration' },
          ],
        },
        {
          text: '核心功能',
          collapsed: false,
          items: [
            { text: '插件系统', link: '/guide/plugins' },
            { text: '中间件系统', link: '/guide/middleware' },
            { text: '事件系统', link: '/guide/events' },
            { text: '状态管理', link: '/guide/state' },
            { text: '日志系统', link: '/guide/logger' },
            { text: '通知系统', link: '/guide/notifications' },
          ],
        },
        {
          text: '高级功能',
          collapsed: false,
          items: [
            { text: '安全管理', link: '/guide/security' },
            { text: '性能管理', link: '/guide/performance' },
            { text: '缓存管理', link: '/guide/cache' },
            { text: '指令系统', link: '/guide/directives' },
            { text: '错误处理', link: '/guide/error-handling' },
          ],
        },
        {
          text: '开发与部署',
          collapsed: false,
          items: [
            { text: '开发工具', link: '/guide/development' },
            { text: '测试指南', link: '/guide/testing' },
            { text: '部署指南', link: '/guide/deployment' },
            { text: '最佳实践', link: '/guide/best-practices' },
          ],
        },
        {
          text: '故障排除',
          collapsed: true,
          items: [
            { text: '常见问题', link: '/guide/faq' },
            { text: '故障排除', link: '/guide/troubleshooting' },
            { text: '性能优化', link: '/guide/performance-optimization' },
          ],
        },
      ],
      '/api/': [
        {
          text: '核心API',
          collapsed: false,
          items: [
            { text: 'API概览', link: '/api/' },
            { text: '核心引擎', link: '/api/core' },
            { text: 'Engine类', link: '/api/engine' },
            { text: '工厂函数', link: '/api/factory' },
          ],
        },
        {
          text: '管理器API',
          collapsed: false,
          items: [
            { text: '插件管理器', link: '/api/plugin-manager' },
            { text: '中间件管理器', link: '/api/middleware-manager' },
            { text: '事件管理器', link: '/api/event-manager' },
            { text: '状态管理器', link: '/api/state-manager' },
            { text: '日志管理器', link: '/api/logger' },
            { text: '通知管理器', link: '/api/notification-manager' },
            { text: '安全管理器', link: '/api/security-manager' },
            { text: '性能管理器', link: '/api/performance-manager' },
            { text: '缓存管理器', link: '/api/cache-manager' },
            { text: '指令管理器', link: '/api/directive-manager' },
            { text: '错误管理器', link: '/api/error-manager' },
            { text: '环境管理器', link: '/api/environment-manager' },
            { text: '生命周期管理器', link: '/api/lifecycle-manager' },
          ],
        },
        {
          text: '类型定义',
          collapsed: true,
          items: [
            { text: '核心类型', link: '/api/types/core' },
            { text: '插件类型', link: '/api/types/plugin' },
            { text: '中间件类型', link: '/api/types/middleware' },
            { text: '事件类型', link: '/api/types/event' },
            { text: '状态类型', link: '/api/types/state' },
            { text: '配置类型', link: '/api/types/config' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '基础示例',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/examples/basic' },
            { text: '插件开发', link: '/examples/plugin-development' },
            { text: '中间件开发', link: '/examples/middleware-development' },
            { text: '状态管理', link: '/examples/state-management' },
          ],
        },
        {
          text: '高级示例',
          collapsed: false,
          items: [
            { text: '复杂应用', link: '/examples/advanced' },
            { text: '微前端集成', link: '/examples/micro-frontend' },
            { text: 'SSR应用', link: '/examples/ssr' },
            { text: '移动端应用', link: '/examples/mobile' },
          ],
        },
        {
          text: '集成示例',
          collapsed: false,
          items: [
            { text: '第三方库集成', link: '/examples/integration' },
            { text: 'UI框架集成', link: '/examples/ui-frameworks' },
            { text: '状态库集成', link: '/examples/state-libraries' },
            { text: '工具链集成', link: '/examples/toolchain' },
          ],
        },
        {
          text: '实战项目',
          collapsed: true,
          items: [
            { text: '博客系统', link: '/examples/projects/blog' },
            { text: '电商平台', link: '/examples/projects/ecommerce' },
            { text: '管理后台', link: '/examples/projects/admin' },
            { text: '数据可视化', link: '/examples/projects/dashboard' },
          ],
        },
      ],
      '/ecosystem/': [
        {
          text: '官方集成',
          items: [
            { text: 'Vue Router', link: '/ecosystem/vue-router' },
            { text: 'Pinia', link: '/ecosystem/pinia' },
            { text: 'Vue I18n', link: '/ecosystem/vue-i18n' },
          ],
        },
        {
          text: 'UI框架',
          items: [
            { text: 'Element Plus', link: '/ecosystem/element-plus' },
            { text: 'Ant Design Vue', link: '/ecosystem/ant-design-vue' },
            { text: 'Naive UI', link: '/ecosystem/naive-ui' },
            { text: 'Quasar', link: '/ecosystem/quasar' },
          ],
        },
        {
          text: '工具链',
          items: [
            { text: 'Vite', link: '/ecosystem/vite' },
            { text: 'Webpack', link: '/ecosystem/webpack' },
            { text: 'TypeScript', link: '/ecosystem/typescript' },
            { text: 'ESLint', link: '/ecosystem/eslint' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/engine' },
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    editLink: {
      pattern:
        'https://github.com/ldesign/engine/edit/main/packages/engine/docs/:path',
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
    config: (md) => {
      // 添加自定义markdown插件
    },
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
  },
})
