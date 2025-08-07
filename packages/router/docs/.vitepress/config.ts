import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Router',
  description: '一个功能强大、易于使用的 Vue 路由器库',
  base: '/router/',
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', href: '/router/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#1890ff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'LDesign Router' }],
    ['meta', { name: 'og:image', content: '/router/og-image.png' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API 参考', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '更新日志', link: '/changelog' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' },
          {
            text: 'NPM',
            link: 'https://www.npmjs.com/package/@ldesign/router',
          },
          {
            text: '问题反馈',
            link: 'https://github.com/ldesign/ldesign/issues',
          },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础概念', link: '/guide/concepts' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '路由配置', link: '/guide/routes' },
            { text: '导航', link: '/guide/navigation' },
            { text: '路由守卫', link: '/guide/guards' },
            { text: '路由元信息', link: '/guide/meta' },
            { text: '嵌套路由', link: '/guide/nested-routes' },
            { text: '动态路由', link: '/guide/dynamic-routes' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '懒加载', link: '/guide/lazy-loading' },
            { text: '路由预加载', link: '/guide/preloading' },
            { text: '路由缓存', link: '/guide/caching' },
            { text: '性能监控', link: '/guide/performance' },
            { text: '过渡动画', link: '/guide/transitions' },
            { text: '滚动行为', link: '/guide/scroll-behavior' },
          ],
        },
        {
          text: '组件',
          items: [
            { text: 'RouterView', link: '/guide/router-view' },
            { text: 'RouterLink', link: '/guide/router-link' },
          ],
        },
        {
          text: '组合式 API',
          items: [
            { text: 'useRouter', link: '/guide/use-router' },
            { text: 'useRoute', link: '/guide/use-route' },
            { text: 'useLink', link: '/guide/use-link' },
            { text: '导航守卫', link: '/guide/composition-guards' },
          ],
        },
        {
          text: '插件系统',
          items: [
            { text: '插件开发', link: '/guide/plugins' },
            { text: '内置插件', link: '/guide/built-in-plugins' },
          ],
        },
        {
          text: '最佳实践',
          items: [
            { text: '项目结构', link: '/guide/project-structure' },
            { text: '性能优化', link: '/guide/performance-tips' },
            { text: '错误处理', link: '/guide/error-handling' },
            { text: '测试', link: '/guide/testing' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'Router', link: '/api/router' },
            { text: 'RouteLocation', link: '/api/route-location' },
            { text: 'NavigationGuard', link: '/api/navigation-guard' },
            { text: 'RouterHistory', link: '/api/router-history' },
          ],
        },
        {
          text: '组件',
          items: [
            { text: 'RouterView', link: '/api/router-view' },
            { text: 'RouterLink', link: '/api/router-link' },
          ],
        },
        {
          text: 'Composables',
          items: [
            { text: 'useRouter', link: '/api/use-router' },
            { text: 'useRoute', link: '/api/use-route' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础示例', link: '/examples/basic' },
            { text: '嵌套路由', link: '/examples/nested-routes' },
            { text: '动态路由', link: '/examples/dynamic-routes' },
            { text: '路由守卫', link: '/examples/navigation-guards' },
            { text: '懒加载', link: '/examples/lazy-loading' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    editLink: {
      pattern:
        'https://github.com/ldesign/ldesign/edit/main/packages/router/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
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
