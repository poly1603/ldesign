import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign 组件库',
  description:
    '基于 Stencil 的现代化 Web Components 组件库，支持跨框架使用',
  base: '/',
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#1976d2' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'LDesign 组件库' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'LDesign',

    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/introduction' },
      { text: '组件', link: '/components/button' },
      { text: '示例', link: '/examples/' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign-org/ldesign' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/component' },
          { text: 'Stencil', link: 'https://stenciljs.com/' }
        ]
      }
    ],

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
            { text: '框架集成', link: '/guide/framework-integration' },
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
            { text: 'Card 卡片', link: '/components/card' },
            { text: 'Popconfirm 气泡确认框', link: '/components/popconfirm' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '示例总览', link: '/examples/' },
            { text: '基础应用', link: '/examples/basic-app' },
            { text: '完整示例', link: '/examples/complete-example' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign-org/ldesign' },
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
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
                },
              },
            },
          },
        },
      },
    },

    editLink: {
      pattern: 'https://github.com/ldesign-org/ldesign/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },

  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../', import.meta.url)),
        '@ldesign/component': fileURLToPath(
          new URL('../packages/component/src', import.meta.url),
        ),
      },
    },
    server: {
      port: 5173,
      host: true
    },
    build: {
      chunkSizeWarningLimit: 1000
    }
  },
})
