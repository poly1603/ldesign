import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Editor',
  description: '功能完整的富文本编辑器组件',
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/editor' },
      { text: '示例', link: '/examples/basic' },
      { text: 'GitHub', link: 'https://github.com/ldesign/editor' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础使用', link: '/guide/basic-usage' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '编辑器架构', link: '/guide/architecture' },
            { text: '插件系统', link: '/guide/plugins' },
            { text: '主题系统', link: '/guide/themes' },
            { text: '响应式设计', link: '/guide/responsive' }
          ]
        },
        {
          text: '高级用法',
          items: [
            { text: '自定义插件', link: '/guide/custom-plugins' },
            { text: '自定义主题', link: '/guide/custom-themes' },
            { text: '事件系统', link: '/guide/events' },
            { text: '命令系统', link: '/guide/commands' }
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 集成', link: '/guide/vue-integration' },
            { text: 'React 集成', link: '/guide/react-integration' },
            { text: 'Angular 集成', link: '/guide/angular-integration' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'Editor', link: '/api/editor' },
            { text: 'Plugin', link: '/api/plugin' },
            { text: 'Theme', link: '/api/theme' },
            { text: 'Events', link: '/api/events' },
            { text: 'Commands', link: '/api/commands' },
            { text: 'Types', link: '/api/types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础示例', link: '/examples/basic' },
            { text: '主题切换', link: '/examples/themes' },
            { text: '插件开发', link: '/examples/plugins' },
            { text: '框架集成', link: '/examples/frameworks' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/editor' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 LDesign Team'
    },

    search: {
      provider: 'local'
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
