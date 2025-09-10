import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/flowchart',
  description: '基于Canvas的流程图编辑器和预览器组件',
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '基础概念',
          items: [
            { text: '节点类型', link: '/guide/node-types' },
            { text: '连接线', link: '/guide/edges' },
            { text: '数据格式', link: '/guide/data-format' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '事件系统', link: '/guide/events' },
            { text: '自定义节点', link: '/guide/custom-nodes' },
            { text: '主题定制', link: '/guide/theming' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'FlowchartEditor', link: '/api/editor' },
            { text: 'FlowchartViewer', link: '/api/viewer' },
            { text: '类型定义', link: '/api/types' },
            { text: '工具函数', link: '/api/utils' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础编辑器', link: '/examples/basic-editor' },
            { text: '只读预览器', link: '/examples/readonly-viewer' },
            { text: 'OA审批流程', link: '/examples/oa-workflow' },
            { text: '自定义节点', link: '/examples/custom-nodes' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/flowchart' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDESIGN'
    }
  }
})
