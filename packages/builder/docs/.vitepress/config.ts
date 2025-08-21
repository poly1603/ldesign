import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Builder',
  description: '智能前端库打包工具 - 基于 Rollup 的零配置多格式输出',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/start' },
      { text: '配置', link: '/guide/config' },
      { text: 'API', link: '/guide/api' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/start' },
            { text: '构建与监听', link: '/guide/build' },
            { text: '类型声明', link: '/guide/dts' },
            { text: '高级特性', link: '/guide/advanced' },
          ]
        },
        {
          text: '参考',
          items: [
            { text: '配置', link: '/guide/config' },
            { text: 'API', link: '/guide/api' },
          ]
        }
      ]
    }
  }
})


