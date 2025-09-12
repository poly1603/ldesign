import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDESIGN Cropper',
  description: '功能强大、高性能的现代图片裁剪器',
  base: '/cropper/',
  
  head: [
    ['link', { rel: 'icon', href: '/cropper/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#722ED1' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    ['meta', { property: 'og:title', content: 'LDESIGN Cropper | 现代图片裁剪器' }],
    ['meta', { property: 'og:site_name', content: 'LDESIGN Cropper' }],
    ['meta', { property: 'og:image', content: '/cropper/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://ldesign-cropper.vercel.app/' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '配置', link: '/config/' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/cropper' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/cropper' },
          { text: 'LDESIGN', link: 'https://ldesign.dev' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ]
        },
        {
          text: '基础使用',
          items: [
            { text: '基本用法', link: '/guide/basic-usage' },
            { text: '裁剪形状', link: '/guide/crop-shapes' },
            { text: '交互操作', link: '/guide/interactions' },
            { text: '输出配置', link: '/guide/output' },
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
            { text: 'Angular', link: '/guide/angular' },
            { text: '原生 JavaScript', link: '/guide/vanilla' },
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '主题定制', link: '/guide/theming' },
            { text: '国际化', link: '/guide/i18n' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '插件开发', link: '/guide/plugins' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: 'Cropper 类', link: '/api/cropper' },
            { text: '配置选项', link: '/api/options' },
            { text: '事件系统', link: '/api/events' },
            { text: '类型定义', link: '/api/types' },
          ]
        },
        {
          text: '框架适配器',
          items: [
            { text: 'Vue 适配器', link: '/api/vue-adapter' },
            { text: 'React 适配器', link: '/api/react-adapter' },
            { text: 'Angular 适配器', link: '/api/angular-adapter' },
          ]
        },
        {
          text: '工具函数',
          items: [
            { text: '图片工具', link: '/api/image-utils' },
            { text: '几何工具', link: '/api/geometry-utils' },
            { text: '性能工具', link: '/api/performance-utils' },
          ]
        }
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '基本裁剪', link: '/examples/basic-cropping' },
            { text: '形状裁剪', link: '/examples/shape-cropping' },
            { text: '比例限制', link: '/examples/aspect-ratio' },
          ]
        },
        {
          text: '框架示例',
          items: [
            { text: 'Vue 3 示例', link: '/examples/vue' },
            { text: 'React 示例', link: '/examples/react' },
            { text: 'Angular 示例', link: '/examples/angular' },
            { text: '原生 JS 示例', link: '/examples/vanilla' },
          ]
        },
        {
          text: '高级示例',
          items: [
            { text: '自定义主题', link: '/examples/custom-theme' },
            { text: '批量处理', link: '/examples/batch-processing' },
            { text: '移动端适配', link: '/examples/mobile' },
            { text: '性能优化', link: '/examples/performance' },
          ]
        }
      ],
      '/config/': [
        {
          text: '配置参考',
          items: [
            { text: '概览', link: '/config/' },
            { text: '基础配置', link: '/config/basic' },
            { text: '主题配置', link: '/config/theme' },
            { text: '工具栏配置', link: '/config/toolbar' },
            { text: '性能配置', link: '/config/performance' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/cropper' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDESIGN Team'
    },

    editLink: {
      pattern: 'https://github.com/ldesign/cropper/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false
    }
  }
})
