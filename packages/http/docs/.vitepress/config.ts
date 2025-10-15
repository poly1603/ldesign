import { defineConfig } from 'vitepress'

export default defineConfig({
 title: '@ldesign/http',
 description: '强大的 TypeScript HTTP 客户端库，支持多适配器、智能重试、链路追踪、Vue 集成',
 base: '/http/',

 themeConfig: {
  logo: '/logo.svg',

  nav: [
   { text: '指南', link: '/guide/' },
   { text: '功能', link: '/features/' },
   { text: 'Vue 集成', link: '/vue/' },
   { text: 'API', link: '/api/' },
   { text: '示例', link: '/examples/' },
  ],

  sidebar: {
   '/guide/': [
    {
     text: '开始',
     items: [
      { text: '简介', link: '/guide/' },
      { text: '安装', link: '/guide/installation' },
      { text: '快速开始', link: '/guide/quick-start' },
      { text: '基础使用', link: '/guide/basic-usage' },
     ],
    },
    {
     text: '核心概念',
     items: [
      { text: '适配器系统', link: '/guide/adapters' },
      { text: '拦截器', link: '/guide/interceptors' },
      { text: '请求配置', link: '/guide/config' },
      { text: '错误处理', link: '/guide/error-handling' },
     ],
    },
    {
     text: '高级主题',
     items: [
      { text: '类型安全', link: '/guide/type-safety' },
      { text: '性能优化', link: '/guide/performance' },
      { text: '最佳实践', link: '/guide/best-practices' },
     ],
    },
   ],

   '/features/': [
    {
     text: '核心功能',
     items: [
      { text: '功能概览', link: '/features/' },
      { text: '缓存系统', link: '/features/cache' },
      { text: '重试机制', link: '/features/retry' },
      { text: '智能重试', link: '/features/smart-retry' },
      { text: '请求去重', link: '/features/deduplication' },
      { text: '并发控制', link: '/features/concurrency' },
     ],
    },
    {
     text: '新增功能',
     items: [
      { text: '数据转换', link: '/features/data-transform' },
      { text: '链路追踪', link: '/features/trace' },
      { text: '网络状态', link: '/features/network-status' },
     ],
    },
    {
     text: '高级功能',
     items: [
      { text: 'GraphQL', link: '/features/graphql' },
      { text: 'WebSocket', link: '/features/websocket' },
      { text: 'SSE', link: '/features/sse' },
      { text: '文件上传下载', link: '/features/upload-download' },
      { text: '离线队列', link: '/features/offline' },
      { text: 'Mock 数据', link: '/features/mock' },
     ],
    },
   ],

   '/vue/': [
    {
     text: 'Vue 集成',
     items: [
      { text: '概述', link: '/vue/' },
      { text: '安装配置', link: '/vue/installation' },
     ],
    },
    {
     text: '基础 Composables',
     items: [
      { text: 'useGet', link: '/vue/use-get' },
      { text: 'usePost', link: '/vue/use-post' },
      { text: 'useHttp', link: '/vue/use-http' },
     ],
    },
    {
     text: '资源管理',
     items: [
      { text: 'useResource', link: '/vue/use-resource' },
      { text: 'usePagination', link: '/vue/use-pagination' },
      { text: 'useForm', link: '/vue/use-form' },
     ],
    },
    {
     text: '高级 Composables',
     items: [
      { text: 'usePolling', link: '/vue/use-polling' },
      { text: 'useNetworkStatus', link: '/vue/use-network-status' },
      { text: 'useOptimisticUpdate', link: '/vue/use-optimistic-update' },
      { text: 'useRequestQueue', link: '/vue/use-request-queue' },
      { text: 'useThrottledRequest', link: '/vue/use-throttled-request' },
     ],
    },
   ],

   '/api/': [
    {
     text: 'API 参考',
     items: [
      { text: '概述', link: '/api/' },
      { text: 'HttpClient', link: '/api/http-client' },
      { text: 'TypedClient', link: '/api/typed-client' },
     ],
    },
    {
     text: '工具类',
     items: [
      { text: '数据转换器', link: '/api/data-transformer' },
      { text: '请求追踪器', link: '/api/tracer' },
      { text: '网络监控器', link: '/api/network-monitor' },
      { text: '重试管理器', link: '/api/retry-manager' },
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
     text: '示例',
     items: [
      { text: '基础示例', link: '/examples/' },
      { text: 'Vue 示例', link: '/examples/vue' },
      { text: '高级示例', link: '/examples/advanced' },
      { text: '完整应用', link: '/examples/full-app' },
     ],
    },
   ],
  },

  socialLinks: [
   { icon: 'github', link: 'https://github.com/ldesign-lab/ldesign' },
  ],

  search: {
   provider: 'local',
  },

  footer: {
   message: '基于 MIT 许可发布',
   copyright: 'Copyright © 2024 LDesign Lab',
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
