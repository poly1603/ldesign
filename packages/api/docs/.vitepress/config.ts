import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/api',
  description: '通用系统接口管理包：插件化、性能优化、Vue 3 集成、类型安全',
  lang: 'zh-CN',
  lastUpdated: true,
  themeConfig: {
    outline: [2, 3],
    nav: [
      { text: '指南', link: '/guide/installation' },
      { text: 'API 参考', link: '/api/core' },
      { text: '高级', link: '/advanced/custom-plugins' },
      { text: '示例', link: '/examples/basic' },
      { text: 'FAQ', link: '/guide/faq' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '安装与配置', link: '/guide/installation' },
            { text: '基础用法', link: '/guide/basic-usage' },
            { text: 'Vue 集成', link: '/guide/vue' },
            { text: 'React 集成', link: '/guide/react' },
          ],
        },
        {
          text: '核心概念',
          items: [
            { text: 'API 引擎', link: '/guide/api-engine' },
            { text: '插件系统', link: '/guide/plugin-system' },
            { text: 'REST 插件', link: '/guide/rest' },
            { text: '中间件与重试', link: '/guide/middlewares' },
            { text: 'React Query 集成', link: '/guide/react-query' },
            { text: '可观测性（日志/性能）', link: '/guide/observability' },
            { text: '系统 API', link: '/guide/system-api' },
            { text: 'GraphQL 插件', link: '/guide/graphql' },
            { text: '类型注册表', link: '/guide/typed-registry' },
          ],
        },
        {
          text: '实践',
          items: [
            { text: '性能优化', link: '/guide/performance' },
            { text: '离线缓存', link: '/guide/offline-cache' },
            { text: '请求队列与限流', link: '/guide/request-queue' },
            { text: '错误处理', link: '/guide/error-handling' },
            { text: '最佳实践', link: '/guide/best-practices' },
            { text: 'FAQ', link: '/guide/faq' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/core' },
            { text: '插件 API', link: '/api/plugins' },
            { text: 'Vue API', link: '/api/vue' },
            { text: 'React API', link: '/api/react' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
      ],
      '/advanced/': [
        {
          text: '高级主题',
          items: [
            { text: '自定义插件开发', link: '/advanced/custom-plugins' },
            { text: '中间件实践', link: '/advanced/middleware' },
            { text: '最佳实践（扩展）', link: '/advanced/best-practices' },
            { text: '性能调优', link: '/advanced/performance-tuning' },
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
            { text: '插件开发示例', link: '/examples/plugins' },
            { text: '实战项目', link: '/examples/real-world' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present LDesign'
    }
  }
})

