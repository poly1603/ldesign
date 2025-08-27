import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/watermark',
  description: '强大、灵活、易用的前端水印解决方案',
  base: '/watermark/',
  
  head: [
    ['link', { rel: 'icon', href: '/watermark/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: '@ldesign/watermark' }],
    ['meta', { name: 'og:image', content: '/watermark/og-image.png' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API', link: '/api/core' },
      { text: '示例', link: '/examples/basic' },
      { text: '更新日志', link: '/changelog' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/watermark' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/watermark' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ]
        },
        {
          text: '基础概念',
          items: [
            { text: '核心概念', link: '/guide/concepts' },
            { text: '配置选项', link: '/guide/configuration' },
            { text: '渲染模式', link: '/guide/render-modes' },
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '安全防护', link: '/guide/security' },
            { text: '响应式设计', link: '/guide/responsive' },
            { text: '动画效果', link: '/guide/animations' },
            { text: '自定义渲染器', link: '/guide/custom-renderer' },
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 集成', link: '/guide/vue-integration' },
            { text: 'React 集成', link: '/guide/react-integration' },
            { text: 'Angular 集成', link: '/guide/angular-integration' },
          ]
        },
        {
          text: '最佳实践',
          items: [
            { text: '性能优化', link: '/guide/performance' },
            { text: '错误处理', link: '/guide/error-handling' },
            { text: '调试技巧', link: '/guide/debugging' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/core' },
            { text: '配置接口', link: '/api/configuration' },
            { text: '渲染器 API', link: '/api/renderers' },
            { text: '工具函数', link: '/api/utilities' },
          ]
        },
        {
          text: 'Vue 组件',
          items: [
            { text: 'Watermark 组件', link: '/api/vue-watermark' },
            { text: 'WatermarkProvider', link: '/api/vue-provider' },
            { text: 'Composables', link: '/api/vue-composables' },
          ]
        },
        {
          text: '类型定义',
          items: [
            { text: '核心类型', link: '/api/types-core' },
            { text: '配置类型', link: '/api/types-config' },
            { text: '渲染类型', link: '/api/types-render' },
          ]
        }
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基本用法', link: '/examples/basic' },
            { text: '文字水印', link: '/examples/text-watermark' },
            { text: '图片水印', link: '/examples/image-watermark' },
          ]
        },
        {
          text: '高级示例',
          items: [
            { text: '多行文字', link: '/examples/multiline-text' },
            { text: '自定义样式', link: '/examples/custom-styles' },
            { text: '动画效果', link: '/examples/animations' },
            { text: '响应式布局', link: '/examples/responsive-layout' },
          ]
        },
        {
          text: '框架示例',
          items: [
            { text: 'Vue 示例', link: '/examples/vue-examples' },
            { text: 'React 示例', link: '/examples/react-examples' },
            { text: '原生 JS 示例', link: '/examples/vanilla-examples' },
          ]
        },
        {
          text: '实际应用',
          items: [
            { text: '文档保护', link: '/examples/document-protection' },
            { text: '图片版权', link: '/examples/image-copyright' },
            { text: '视频水印', link: '/examples/video-watermark' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/watermark' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team'
    },

    editLink: {
      pattern: 'https://github.com/ldesign/watermark/edit/main/packages/watermark/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新',
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
    darkModeSwitchTitle: '切换到深色模式',

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
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
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    config: (md) => {
      // 自定义 markdown 配置
    }
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
    optimizeDeps: {
      include: ['@ldesign/watermark']
    }
  }
})
