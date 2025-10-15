import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/http',
  description: '现代化、类型安全的 HTTP 客户端库',
  base: '/http/',

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Vue 集成', link: '/vue/' },
      { text: '示例', link: '/examples/' },
      {
        text: '链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/http' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/http' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: 'HTTP 客户端', link: '/guide/client' },
            { text: '适配器', link: '/guide/adapters' },
            { text: '拦截器', link: '/guide/interceptors' },
            { text: '类型系统', link: '/guide/types' },
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '缓存', link: '/guide/cache' },
            { text: '重试机制', link: '/guide/retry' },
            { text: '并发控制', link: '/guide/concurrency' },
            { text: '错误处理', link: '/guide/error-handling' },
            { text: '文件操作', link: '/guide/file-operations' },
            { text: '性能监控', link: '/guide/monitoring' },
          ]
        },
        {
          text: '扩展功能',
          items: [
            { text: 'GraphQL', link: '/guide/graphql' },
            { text: 'WebSocket', link: '/guide/websocket' },
            { text: 'SSE', link: '/guide/sse' },
            { text: 'Mock', link: '/guide/mock' },
          ]
        }
      ],
      '/vue/': [
        {
          text: 'Vue 集成',
          items: [
            { text: '介绍', link: '/vue/' },
            { text: '安装插件', link: '/vue/plugin' },
          ]
        },
        {
          text: '基础 Hooks',
          items: [
            { text: 'useHttp', link: '/vue/use-http' },
            { text: 'useGet/Post/Put/Delete', link: '/vue/use-simple-http' },
            { text: 'useQuery', link: '/vue/use-query' },
            { text: 'useMutation', link: '/vue/use-mutation' },
            { text: 'useRequest', link: '/vue/use-request' },
          ]
        },
        {
          text: '高级 Hooks',
          items: [
            { text: 'useResource', link: '/vue/use-resource' },
            { text: 'useForm', link: '/vue/use-form' },
            { text: 'useRequestQueue', link: '/vue/use-request-queue' },
            { text: 'useOptimisticUpdate', link: '/vue/use-optimistic-update' },
            { text: 'usePolling', link: '/vue/use-polling' },
            { text: 'useNetworkStatus', link: '/vue/use-network-status' },
          ]
        }
      ],
      '/api/': [
        {
          text: '核心 API',
          items: [
            { text: 'createHttpClient', link: '/api/create-http-client' },
            { text: 'HttpClient', link: '/api/http-client' },
          ]
        },
        {
          text: '适配器',
          items: [
            { text: 'FetchAdapter', link: '/api/fetch-adapter' },
            { text: 'AxiosAdapter', link: '/api/axios-adapter' },
            { text: 'AlovaAdapter', link: '/api/alova-adapter' },
          ]
        },
        {
          text: '拦截器',
          items: [
            { text: '拦截器管理器', link: '/api/interceptor-manager' },
            { text: '内置拦截器', link: '/api/built-in-interceptors' },
          ]
        },
        {
          text: '工具类',
          items: [
            { text: 'CacheManager', link: '/api/cache-manager' },
            { text: 'ConcurrencyManager', link: '/api/concurrency-manager' },
            { text: 'ErrorHandler', link: '/api/error-handler' },
            { text: 'RequestMonitor', link: '/api/request-monitor' },
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础用法', link: '/examples/basic' },
            { text: '认证', link: '/examples/authentication' },
            { text: '文件上传', link: '/examples/file-upload' },
            { text: '文件下载', link: '/examples/file-download' },
            { text: 'Vue 应用', link: '/examples/vue-app' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/http' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present LDesign Team'
    },

    search: {
      provider: 'local'
    }
  }
})
