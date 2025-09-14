import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/captcha',
  description: '功能完整的网页验证码插件库',
  base: '/captcha/',
  
  head: [
    ['link', { rel: 'icon', href: '/captcha/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#722ED1' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '更新日志', link: '/changelog' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '验证码类型',
          items: [
            { text: '滑动拼图验证', link: '/guide/slide-puzzle' },
            { text: '按顺序点击文字验证', link: '/guide/click-text' },
            { text: '滑动滑块图片回正验证', link: '/guide/rotate-slider' },
            { text: '点击验证', link: '/guide/click' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '主题定制', link: '/guide/themes' },
            { text: '事件系统', link: '/guide/events' },
            { text: '配置选项', link: '/guide/configuration' },
            { text: '最佳实践', link: '/guide/best-practices' }
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 集成', link: '/guide/vue' },
            { text: 'React 集成', link: '/guide/react' },
            { text: 'Angular 集成', link: '/guide/angular' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: '基础类', link: '/api/base-captcha' },
            { text: '验证码管理器', link: '/api/captcha-manager' },
            { text: '事件发射器', link: '/api/event-emitter' }
          ]
        },
        {
          text: '验证码类型',
          items: [
            { text: 'SlidePuzzleCaptcha', link: '/api/slide-puzzle-captcha' },
            { text: 'ClickTextCaptcha', link: '/api/click-text-captcha' },
            { text: 'RotateSliderCaptcha', link: '/api/rotate-slider-captcha' },
            { text: 'ClickCaptcha', link: '/api/click-captcha' }
          ]
        },
        {
          text: '工具函数',
          items: [
            { text: '数学工具', link: '/api/math-utils' },
            { text: 'DOM 工具', link: '/api/dom-utils' },
            { text: '主题管理器', link: '/api/theme-manager' }
          ]
        },
        {
          text: '类型定义',
          items: [
            { text: '接口定义', link: '/api/interfaces' },
            { text: '枚举类型', link: '/api/enums' },
            { text: '配置类型', link: '/api/config-types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '基础用法', link: '/examples/basic' },
            { text: '自定义配置', link: '/examples/custom-config' },
            { text: '主题切换', link: '/examples/themes' }
          ]
        },
        {
          text: '框架示例',
          items: [
            { text: 'Vue 示例', link: '/examples/vue' },
            { text: 'React 示例', link: '/examples/react' },
            { text: 'Angular 示例', link: '/examples/angular' }
          ]
        },
        {
          text: '高级示例',
          items: [
            { text: '自定义验证码', link: '/examples/custom-captcha' },
            { text: '后端集成', link: '/examples/backend-integration' },
            { text: '性能优化', link: '/examples/performance' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign-team/captcha' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/ldesign-team/captcha/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  },

  vite: {
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    }
  }
})
