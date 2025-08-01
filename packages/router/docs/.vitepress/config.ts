import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Router',
  description: 'A powerful Vue router library for Vue applications',
  base: '/router/',
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', href: '/router/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3498db' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/router' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/getting-started' },
          ],
        },
        {
          text: '基础',
          items: [
            { text: '路由配置', link: '/guide/route-configuration' },
            { text: '路由导航', link: '/guide/navigation' },
            { text: '路由参数', link: '/guide/route-params' },
            { text: '嵌套路由', link: '/guide/nested-routes' },
          ],
        },
        {
          text: '高级',
          items: [
            { text: '导航守卫', link: '/guide/navigation-guards' },
            { text: '路由懒加载', link: '/guide/lazy-loading' },
            { text: '滚动行为', link: '/guide/scroll-behavior' },
            { text: '过渡动效', link: '/guide/transitions' },
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
      pattern: 'https://github.com/ldesign/ldesign/edit/main/packages/router/docs/:path',
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
