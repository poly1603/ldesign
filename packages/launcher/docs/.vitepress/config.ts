import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vite Launcher',
  description: '基于Vite的前端项目启动器，提供程序化API',
  lang: 'zh-CN',

  themeConfig: {
    siteTitle: 'Vite Launcher',
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '基础用法', link: '/guide/basic-usage' },
            { text: '高级用法', link: '/guide/advanced-usage' },
            { text: '配置选项', link: '/guide/configuration' },
            { text: '项目类型', link: '/guide/project-types' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'ViteLauncher', link: '/api/vite-launcher' },
            { text: '便捷函数', link: '/api/convenience-functions' },
            { text: '类型定义', link: '/api/types' },
            { text: '错误处理', link: '/api/error-handling' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础示例', link: '/examples/basic' },
            { text: 'Vue项目', link: '/examples/vue' },
            { text: 'React项目', link: '/examples/react' },
            { text: '自定义配置', link: '/examples/custom-config' },
            { text: '错误处理', link: '/examples/error-handling' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' },
    ],

    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2024 LDesign',
    },
  },
})
