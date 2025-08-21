import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'LDesign QRCode',
  description: '强大、灵活的二维码生成库：支持 Vue 组件与原生 API',
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }]
  ],
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/guide/api' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速上手', link: '/guide/getting-started' },
            { text: 'API 总览', link: '/guide/api' },
            { text: '组件用法', link: '/guide/component' },
            { text: 'Hook 用法', link: '/guide/hook' },
            { text: '样式与 Logo', link: '/guide/style-and-logo' },
            { text: '进阶与常见问题', link: '/guide/advanced' }
          ]
        }
      ]
    }
  }
})


