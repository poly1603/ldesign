import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign 组件库',
  description: '现代化、高性能的 Web Components 组件库',

  // 基础配置
  base: '/',
  lang: 'zh-CN',

  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: '组件', link: '/components/button' },
      { text: 'API', link: '/api/' },
      {
        text: '更多',
        items: [
          { text: 'GitHub', link: 'https://github.com/your-org/ldesign' },
          { text: '更新日志', link: '/changelog' }
        ]
      }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '主题定制', link: '/guide/theming' },
            { text: '国际化', link: '/guide/i18n' },
            { text: '最佳实践', link: '/guide/best-practices' }
          ]
        }
      ],
      '/components/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Input 输入框', link: '/components/input' },
            { text: 'Card 卡片', link: '/components/card' }
          ]
        },
        {
          text: '高级组件',
          items: [
            { text: 'Modal 模态框', link: '/components/modal' },
            { text: 'Table 表格', link: '/components/table' },
            { text: 'Form 表单', link: '/components/form' },
            { text: 'FormItem 表单项', link: '/components/form-item' }
          ]
        },
        {
          text: '工具组件',
          items: [
            { text: 'Tooltip 提示框', link: '/components/tooltip' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/ldesign' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 LDesign'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/your-org/ldesign/edit/main/packages/component/docs-site/:path',
      text: '在 GitHub 上编辑此页面'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  // Vite 配置
  vite: {
    // 处理组件库的导入
    resolve: {
      alias: {
        '@ldesign/components': '../dist/ldesign-component/ldesign-component.esm.js'
      }
    },
    // 优化依赖
    optimizeDeps: {
      exclude: ['@ldesign/components']
    },
    // 静态资源处理
    assetsInclude: ['**/*.css']
  },

  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#1976d2' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }]
  ],

  // Markdown 配置
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
