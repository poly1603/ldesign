import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/gridstack',
  description: '强大的 GridStack 封装库',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API', link: '/api/core' },
      { text: '示例', link: '/examples/vanilla' },
      { text: 'GitHub', link: 'https://github.com/ldesign/gridstack' }
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
          text: '使用指南',
          items: [
            { text: 'Vanilla JS', link: '/guide/vanilla' },
            { text: 'Vue 3', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '配置选项', link: '/guide/options' },
            { text: '事件系统', link: '/guide/events' },
            { text: '高级功能', link: '/guide/advanced' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/core' },
            { text: 'Vanilla API', link: '/api/vanilla' },
            { text: 'Vue API', link: '/api/vue' },
            { text: 'React API', link: '/api/react' },
            { text: '类型定义', link: '/api/types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: 'Vanilla JS', link: '/examples/vanilla' },
            { text: 'Vue 3', link: '/examples/vue' },
            { text: 'React', link: '/examples/react' },
            { text: '高级示例', link: '/examples/advanced' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/gridstack' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign'
    },

    search: {
      provider: 'local'
    }
  },

  markdown: {
    theme: 'material-theme-palenight',
    lineNumbers: true
  }
})
