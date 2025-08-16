import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/http',
  description:
    '一个功能强大的通用 HTTP 请求库，支持多种适配器、拦截器、缓存、重试等高级功能，完美集成 Vue 3',

  base: '/http/',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API 参考', link: '/api/http-client' },
      { text: '示例', link: '/examples/basic' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础用法', link: '/guide/basic-usage' },
          ],
        },
        {
          text: '核心概念',
          items: [
            { text: 'HTTP 客户端', link: '/guide/http-client' },
            { text: '适配器', link: '/guide/adapters' },
            { text: '拦截器', link: '/guide/interceptors' },
            { text: '错误处理', link: '/guide/error-handling' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '缓存', link: '/guide/caching' },
            { text: '重试机制', link: '/guide/retry' },
            { text: '请求取消', link: '/guide/cancellation' },
            { text: '并发控制', link: '/guide/concurrency' },
          ],
        },
        {
          text: 'Vue 集成',
          items: [
            { text: 'Vue 插件', link: '/guide/vue-plugin' },
            { text: 'Composition API', link: '/guide/vue-hooks' },
            { text: '响应式状态', link: '/guide/vue-reactivity' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'HttpClient', link: '/api/http-client' },
            { text: '适配器', link: '/api/adapters' },
            { text: '拦截器', link: '/api/interceptors' },
            { text: '工具函数', link: '/api/utils' },
          ],
        },
        {
          text: 'Vue API',
          items: [
            { text: 'useRequest', link: '/api/use-request' },
            { text: 'useQuery', link: '/api/use-query' },
            { text: 'useMutation', link: '/api/use-mutation' },
            { text: 'useHttp', link: '/api/use-http' },
          ],
        },
        {
          text: '类型定义',
          items: [
            { text: '核心类型', link: '/api/types' },
            { text: 'Vue 类型', link: '/api/vue-types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基本请求', link: '/examples/basic' },
            { text: '拦截器使用', link: '/examples/interceptors' },
            { text: '错误处理', link: '/examples/error-handling' },
          ],
        },
        {
          text: '高级示例',
          items: [
            { text: '缓存策略', link: '/examples/caching' },
            { text: '重试配置', link: '/examples/retry' },
            { text: '并发控制', link: '/examples/concurrency' },
          ],
        },
        {
          text: 'Vue 示例',
          items: [
            { text: 'Vue 基础用法', link: '/examples/vue-basic' },
            { text: 'Vue Hooks', link: '/examples/vue-hooks' },
            { text: '表单提交', link: '/examples/vue-forms' },
            { text: '数据列表', link: '/examples/vue-lists' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/ldesign/http' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 ldesign',
    },

    search: {
      provider: 'local',
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },
})
