/**
 * VitePress 配置文件
 *
 * LDesign Flowchart 文档站点配置
 */

import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Flowchart',
  description: '基于 LogicFlow 的审批流程图编辑器组件',

  // 基础配置
  base: '/flowchart/',
  lang: 'zh-CN',

  themeConfig: {
    // Logo
    logo: '/logo.svg',

    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/flowchart-api' },
      { text: '示例', link: '/examples/basic' },
      { text: '插件', link: '/plugins/overview' },
      { text: '主题', link: '/themes/overview' }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础概念', link: '/guide/concepts' }
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '编辑器', link: '/guide/editor' },
            { text: '查看器', link: '/guide/viewer' },
            { text: '节点类型', link: '/guide/node-types' },
            { text: '连接线', link: '/guide/edges' },
            { text: '事件系统', link: '/guide/events' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '数据格式', link: '/guide/data-format' },
            { text: '导入导出', link: '/guide/import-export' },
            { text: '键盘快捷键', link: '/guide/shortcuts' },
            { text: '性能优化', link: '/guide/performance' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'FlowchartAPI', link: '/api/flowchart-api' },
            { text: 'FlowchartEditor', link: '/api/flowchart-editor' },
            { text: 'FlowchartViewer', link: '/api/flowchart-viewer' },
            { text: '类型定义', link: '/api/types' },
            { text: '配置选项', link: '/api/config' }
          ]
        },
        {
          text: '节点 API',
          items: [
            { text: '基础节点', link: '/api/nodes/base' },
            { text: '审批节点', link: '/api/nodes/approval' },
            { text: '条件节点', link: '/api/nodes/condition' },
            { text: '网关节点', link: '/api/nodes/gateway' }
          ]
        },
        {
          text: '插件 API',
          items: [
            { text: '插件管理器', link: '/api/plugins/manager' },
            { text: '基础插件', link: '/api/plugins/base' },
            { text: '内置插件', link: '/api/plugins/builtin' }
          ]
        }
      ],

      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基本使用', link: '/examples/basic' },
            { text: '只读查看', link: '/examples/readonly' },
            { text: '事件处理', link: '/examples/events' }
          ]
        },
        {
          text: '高级示例',
          items: [
            { text: '自定义节点', link: '/examples/custom-nodes' },
            { text: '主题定制', link: '/examples/themes' },
            { text: '插件开发', link: '/examples/plugins' }
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 集成', link: '/examples/vue' },
            { text: 'React 集成', link: '/examples/react' },
            { text: 'Angular 集成', link: '/examples/angular' }
          ]
        }
      ],

      '/plugins/': [
        {
          text: '插件系统',
          items: [
            { text: '插件概述', link: '/plugins/overview' },
            { text: '插件开发', link: '/plugins/development' },
            { text: '插件 API', link: '/plugins/api' }
          ]
        },
        {
          text: '内置插件',
          items: [
            { text: '小地图插件', link: '/plugins/minimap' },
            { text: '历史记录插件', link: '/plugins/history' },
            { text: '导出插件', link: '/plugins/export' }
          ]
        }
      ],

      '/themes/': [
        {
          text: '主题系统',
          items: [
            { text: '主题概述', link: '/themes/overview' },
            { text: '主题定制', link: '/themes/customization' },
            { text: '内置主题', link: '/themes/builtin' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/flowchart' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2025 LDesign'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/flowchart/edit/main/packages/flowchart/docs/:path',
      text: '在 GitHub 上编辑此页'
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

  // Markdown 配置
  markdown: {
    theme: 'github-dark',
    lineNumbers: true
  },

  // 构建配置
  build: {
    outDir: '../dist-docs'
  }
})
