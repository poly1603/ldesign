import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'ApprovalFlow',
  description: '基于 LogicFlow 的审批流程图编辑器',
  base: '/',
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API', link: '/api/editor' },
      { text: '示例', link: '/examples/basic' },
      { text: 'GitHub', link: 'https://github.com/ldesign/approval-flow' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: '核心概念',
          items: [
            { text: '节点类型', link: '/guide/node-types' },
            { text: '配置选项', link: '/guide/configuration' },
            { text: '事件系统', link: '/guide/events' },
            { text: '数据格式', link: '/guide/data-format' },
          ],
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
            { text: '原生 JavaScript', link: '/guide/vanilla' },
          ],
        },
        {
          text: '进阶',
          items: [
            { text: '主题定制', link: '/guide/theming' },
            { text: '验证规则', link: '/guide/validation' },
            { text: '导入导出', link: '/guide/import-export' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'ApprovalFlowEditor', link: '/api/editor' },
            { text: '类型定义', link: '/api/types' },
            { text: '节点 API', link: '/api/nodes' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础示例', link: '/examples/basic' },
            { text: 'Vue 示例', link: '/examples/vue' },
            { text: 'React 示例', link: '/examples/react' },
            { text: '高级示例', link: '/examples/advanced' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/approval-flow' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 ldesign',
    },
    search: {
      provider: 'local',
    },
  },
});
