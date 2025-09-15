import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/websocket',
  description: '功能强大、类型安全的WebSocket客户端库',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '更新日志', link: '/changelog' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '基础功能',
          items: [
            { text: '基础用法', link: '/guide/basic-usage' },
            { text: '配置选项', link: '/guide/configuration' },
            { text: '事件系统', link: '/guide/events' },
            { text: '消息处理', link: '/guide/messages' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '自动重连', link: '/guide/reconnection' },
            { text: '心跳检测', link: '/guide/heartbeat' },
            { text: '认证授权', link: '/guide/authentication' },
            { text: '消息队列', link: '/guide/message-queue' },
            { text: '连接池', link: '/guide/connection-pool' },
            { text: 'Web Worker', link: '/guide/web-worker' }
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 集成', link: '/guide/vue-integration' },
            { text: 'React 集成', link: '/guide/react-integration' },
            { text: 'Angular 集成', link: '/guide/angular-integration' }
          ]
        },
        {
          text: '最佳实践',
          items: [
            { text: '性能优化', link: '/guide/performance' },
            { text: '错误处理', link: '/guide/error-handling' },
            { text: '调试技巧', link: '/guide/debugging' },
            { text: '移动端适配', link: '/guide/mobile' }
          ]
        }
      ],
      '/api/': [
        {
          text: '核心API',
          items: [
            { text: 'WebSocketClient', link: '/api/websocket-client' },
            { text: 'ConnectionPool', link: '/api/connection-pool' },
            { text: 'EventEmitter', link: '/api/event-emitter' }
          ]
        },
        {
          text: '工厂函数',
          items: [
            { text: '客户端工厂', link: '/api/client-factory' },
            { text: '连接池工厂', link: '/api/pool-factory' },
            { text: 'Worker工厂', link: '/api/worker-factory' }
          ]
        },
        {
          text: '框架适配器',
          items: [
            { text: 'Vue适配器', link: '/api/vue-adapter' },
            { text: 'React适配器', link: '/api/react-adapter' },
            { text: 'Angular适配器', link: '/api/angular-adapter' }
          ]
        },
        {
          text: '类型定义',
          items: [
            { text: '配置类型', link: '/api/config-types' },
            { text: '事件类型', link: '/api/event-types' },
            { text: '工具类型', link: '/api/utility-types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '简单聊天室', link: '/examples/simple-chat' },
            { text: '实时数据', link: '/examples/real-time-data' },
            { text: '文件传输', link: '/examples/file-transfer' }
          ]
        },
        {
          text: '框架示例',
          items: [
            { text: 'Vue示例', link: '/examples/vue-examples' },
            { text: 'React示例', link: '/examples/react-examples' },
            { text: 'Angular示例', link: '/examples/angular-examples' }
          ]
        },
        {
          text: '高级示例',
          items: [
            { text: '多连接管理', link: '/examples/multi-connection' },
            { text: '自定义协议', link: '/examples/custom-protocol' },
            { text: '性能监控', link: '/examples/performance-monitoring' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/websocket' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign'
    },
    
    editLink: {
      pattern: 'https://github.com/ldesign/websocket/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    
    search: {
      provider: 'local'
    }
  },
  
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
