import type { DefaultTheme } from 'vitepress'

export function getSidebar(): DefaultTheme.Sidebar {
  return {
    '/guide/': [
      {
        text: '开始',
        collapsed: false,
        items: [
          { text: '介绍', link: '/guide/introduction' },
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '项目结构', link: '/guide/project-structure' },
          { text: '设计理念', link: '/guide/design-principles' }
        ]
      },
      {
        text: '基础',
        collapsed: false,
        items: [
          { text: '安装', link: '/guide/installation' },
          { text: '配置', link: '/guide/configuration' },
          { text: 'TypeScript 支持', link: '/guide/typescript' },
          { text: '样式和主题', link: '/guide/theming' }
        ]
      },
      {
        text: '进阶',
        collapsed: false,
        items: [
          { text: '性能优化', link: '/guide/performance' },
          { text: '插件开发', link: '/guide/plugin-development' },
          { text: '国际化', link: '/guide/i18n' },
          { text: '测试', link: '/guide/testing' }
        ]
      },
      {
        text: '最佳实践',
        collapsed: false,
        items: [
          { text: '代码规范', link: '/guide/code-style' },
          { text: '架构设计', link: '/guide/architecture' },
          { text: '安全指南', link: '/guide/security' },
          { text: '部署', link: '/guide/deployment' }
        ]
      }
    ],

    '/packages/': [
      {
        text: '核心功能包',
        items: [
          { text: '总览', link: '/packages/' }
        ]
      },
      {
        text: '数据管理',
        items: [
          { text: 'Cache 缓存', link: '/packages/cache/' },
          { text: 'Store 状态管理', link: '/packages/store/' },
          { text: 'Storage 存储', link: '/packages/storage/' }
        ]
      },
      {
        text: '网络通信',
        items: [
          { text: 'HTTP 客户端', link: '/packages/http/' },
          { text: 'WebSocket', link: '/packages/websocket/' },
          { text: 'API 管理', link: '/packages/api/' }
        ]
      },
      {
        text: '路由导航',
        items: [
          { text: 'Router 路由', link: '/packages/router/' },
          { text: 'Menu 菜单', link: '/packages/menu/' },
          { text: 'Tabs 标签页', link: '/packages/tabs/' }
        ]
      }
    ],

    '/libraries/': [
      {
        text: '组件库',
        items: [
          { text: '总览', link: '/libraries/' }
        ]
      },
      {
        text: '编辑器类',
        items: [
          { text: 'Code Editor', link: '/libraries/code-editor/' },
          { text: 'Editor', link: '/libraries/editor/' },
          { text: 'Markdown', link: '/libraries/markdown/' }
        ]
      },
      {
        text: '数据展示',
        items: [
          { text: 'Table', link: '/libraries/table/' },
          { text: 'Tree', link: '/libraries/tree/' },
          { text: 'Chart', link: '/libraries/chart/' }
        ]
      }
    ],

    '/tools/': [
      {
        text: '工具链',
        items: [
          { text: '总览', link: '/tools/' }
        ]
      },
      {
        text: '构建工具',
        items: [
          { text: 'CLI', link: '/tools/cli/' },
          { text: 'Builder', link: '/tools/builder/' }
        ]
      },
      {
        text: '开发工具',
        items: [
          { text: 'Analyzer', link: '/tools/analyzer/' },
          { text: 'Generator', link: '/tools/generator/' }
        ]
      }
    ]
  }
}
