import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/editor',
  description: '功能强大、扩展性强的富文本编辑器',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API 文档', link: '/api/editor' },
      { text: '插件', link: '/plugins/overview' },
      { text: '示例', link: '/examples/basic' },
      { text: 'GitHub', link: 'https://github.com/ldesign/editor' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '编辑器实例', link: '/guide/editor-instance' },
            { text: '文档模型', link: '/guide/document' },
            { text: '选区', link: '/guide/selection' },
            { text: '命令', link: '/guide/commands' }
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
            { text: '原生 JavaScript', link: '/guide/vanilla' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'Editor', link: '/api/editor' },
            { text: 'Document', link: '/api/document' },
            { text: 'Selection', link: '/api/selection' },
            { text: 'Plugin', link: '/api/plugin' },
            { text: 'Toolbar', link: '/api/toolbar' }
          ]
        }
      ],
      '/plugins/': [
        {
          text: '插件',
          items: [
            { text: '概览', link: '/plugins/overview' },
            { text: '基础格式化', link: '/plugins/formatting' },
            { text: '标题', link: '/plugins/heading' },
            { text: '列表', link: '/plugins/list' },
            { text: '链接和图片', link: '/plugins/media' },
            { text: '表格', link: '/plugins/table' },
            { text: '自定义插件', link: '/plugins/custom' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础示例', link: '/examples/basic' },
            { text: 'Vue 示例', link: '/examples/vue' },
            { text: 'React 示例', link: '/examples/react' },
            { text: '自定义插件', link: '/examples/custom-plugin' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/editor' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present LDesign'
    },

    search: {
      provider: 'local'
    }
  }
})
