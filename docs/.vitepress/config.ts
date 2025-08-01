import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  title: 'LDesign Vue引擎',
  description: '基于Vue3的现代化前端开发引擎，提供完整的插件化架构和跨框架兼容性',
  base: '/',
  lang: 'zh-CN',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#1890ff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'LDesign Vue引擎' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'LDesign',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      {
        text: '核心包',
        items: [
          { text: 'Engine 核心引擎', link: '/packages/engine/' },
          { text: 'Router 路由系统', link: '/packages/router/' },
          { text: 'HTTP 请求库', link: '/packages/http/' },
          { text: 'Crypto 加密工具', link: '/packages/crypto/' },
          { text: 'Device 设备检测', link: '/packages/device/' },
          { text: 'Template 模板系统', link: '/packages/template/' },
          { text: 'Color 颜色工具', link: '/packages/color/' },
          { text: 'I18n 国际化', link: '/packages/i18n/' }
        ]
      },
      { text: '示例', link: '/examples/' },
      { text: '演示', link: '/demo/' },
      {
        text: '更多',
        items: [
          { text: 'API 参考', link: '/api/' },
          { text: '最佳实践', link: '/best-practices/' },
          { text: '贡献指南', link: '/contributing' },
          { text: 'GitHub', link: 'https://github.com/ldesign-org/ldesign' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装配置', link: '/guide/installation' },
            { text: '项目结构', link: '/guide/project-structure' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '插件系统', link: '/guide/plugins' },
            { text: '中间件', link: '/guide/middleware' },
            { text: '事件系统', link: '/guide/events' },
            { text: '状态管理', link: '/guide/state' }
          ]
        },
        {
          text: '高级用法',
          items: [
            { text: '自定义插件', link: '/guide/custom-plugins' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '错误处理', link: '/guide/error-handling' },
            { text: '调试技巧', link: '/guide/debugging' }
          ]
        }
      ],
      '/packages/': [
        {
          text: '核心包',
          items: [
            { text: 'Engine 核心引擎', link: '/packages/engine/' },
            { text: 'Router 路由系统', link: '/packages/router/' },
            { text: 'HTTP 请求库', link: '/packages/http/' },
            { text: 'Crypto 加密工具', link: '/packages/crypto/' },
            { text: 'Device 设备检测', link: '/packages/device/' },
            { text: 'Template 模板系统', link: '/packages/template/' },
            { text: 'Color 颜色工具', link: '/packages/color/' },
            { text: 'I18n 国际化', link: '/packages/i18n/' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例项目',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '基础应用', link: '/examples/basic-app' },
            { text: '企业级应用', link: '/examples/enterprise-app' },
            { text: '多页面应用', link: '/examples/multi-page-app' },
            { text: '移动端应用', link: '/examples/mobile-app' }
          ]
        }
      ],
      '/demo/': [
        {
          text: '在线演示',
          items: [
            { text: '演示首页', link: '/demo/' },
            { text: '功能展示', link: '/demo/features' },
            { text: '性能测试', link: '/demo/performance' },
            { text: '兼容性测试', link: '/demo/compatibility' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign-org/ldesign' }
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 LDesign Team'
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },

    editLink: {
      pattern: 'https://github.com/ldesign-org/ldesign/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../', import.meta.url)),
        '@ldesign/engine': fileURLToPath(new URL('../packages/engine/src', import.meta.url)),
        '@ldesign/router': fileURLToPath(new URL('../packages/router/src', import.meta.url)),
        '@ldesign/http': fileURLToPath(new URL('../packages/http/src', import.meta.url)),
        '@ldesign/crypto': fileURLToPath(new URL('../packages/crypto/src', import.meta.url)),
        '@ldesign/device': fileURLToPath(new URL('../packages/device/src', import.meta.url)),
        '@ldesign/template': fileURLToPath(new URL('../packages/template/src', import.meta.url)),
        '@ldesign/color': fileURLToPath(new URL('../packages/color/src', import.meta.url)),
        '@ldesign/i18n': fileURLToPath(new URL('../packages/i18n/src', import.meta.url))
      }
    }
  }
})