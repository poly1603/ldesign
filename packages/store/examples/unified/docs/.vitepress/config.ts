import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/store 示例文档',
  description: '完整的状态管理解决方案示例和文档',

  // 暂时忽略死链接检查
  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/getting-started' },
      { text: '示例', link: '/examples/' },
      { text: 'API 参考', link: '/api/' }
    ],

    sidebar: {
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基础用法', link: '/examples/basic' },
            { text: '函数式风格', link: '/examples/functional' },
            { text: '组合式 API', link: '/examples/composition' }
          ]
        },
        {
          text: '高级示例',
          items: [
            { text: '装饰器风格', link: '/examples/decorators' },
            { text: '性能优化', link: '/examples/performance' },
            { text: '数据持久化', link: '/examples/persistence' },
            { text: '企业级应用', link: '/examples/enterprise' },
            { text: '实时同步', link: '/examples/realtime' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'Store API', link: '/api/store' },
            { text: '装饰器 API', link: '/api/decorators' },
            { text: '工具函数', link: '/api/utils' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/store' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign'
    }
  }
})
