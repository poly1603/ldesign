import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vue3 Engine',
  description: '强大的Vue3应用引擎，提供插件化架构和完整的开发工具链',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/engine' },
      { text: '示例', link: '/examples/basic' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '快速开始',
          items: [
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '入门指南', link: '/guide/getting-started' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '插件系统', link: '/guide/plugins' },
            { text: '中间件系统', link: '/guide/middleware' },
            { text: '事件系统', link: '/guide/events' },
            { text: '状态管理', link: '/guide/state' },
            { text: '日志系统', link: '/guide/logger' },
            { text: '通知系统', link: '/guide/notifications' },
          ],
        },
        {
          text: '部署',
          items: [
            { text: '部署指南', link: '/guide/deployment' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: '核心API', link: '/api/core' },
            { text: 'Engine', link: '/api/engine' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础使用', link: '/examples/basic' },
            { text: '高级示例', link: '/examples/advanced' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/engine' },
    ],
  },
})
