import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Router',
  description: '强大的 Vue 路由库，提供增强的组件和功能',
  base: '/router/',

  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: '基础',
          items: [
            { text: '路由配置', link: '/guide/route-configuration' },
            { text: '嵌套路由', link: '/guide/nested-routes' },
            { text: '动态路由', link: '/guide/dynamic-routes' },
            { text: '导航', link: '/guide/navigation' },
            { text: '路由守卫', link: '/guide/route-guards' },
          ],
        },
        {
          text: '增强组件',
          items: [
            { text: '增强的 RouterLink', link: '/guide/enhanced-router-link' },
            { text: '增强的 RouterView', link: '/guide/enhanced-router-view' },
            { text: '组件配置', link: '/guide/component-configuration' },
          ],
        },
        {
          text: '设备适配',
          items: [
            { text: '设备路由', link: '/guide/device-routing' },
            { text: '设备守卫', link: '/guide/device-guards' },
          ],
        },
        {
          text: '模板集成',
          items: [
            { text: '模板路由', link: '/guide/template-routing' },
            { text: '模板解析器', link: '/guide/template-resolver' },
            { text: '设备模板', link: '/guide/device-templates' },
          ],
        },
        {
          text: '高级',
          items: [
            { text: '权限控制', link: '/guide/permission-control' },
            { text: '预加载策略', link: '/guide/preloading' },
            { text: '性能监控', link: '/guide/performance-monitoring' },
            { text: '自定义插件', link: '/guide/custom-plugins' },
            { text: '引擎集成', link: '/guide/engine-integration' },
          ],
        },
        {
          text: '迁移',
          items: [
            {
              text: '从 Vue Router 迁移',
              link: '/guide/migration-from-vue-router',
            },
            { text: '版本升级', link: '/guide/version-upgrade' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/' },
            { text: 'RouterLink Props', link: '/api/router-link-props' },
            { text: 'RouterView Props', link: '/api/router-view-props' },
            { text: '组合式 API', link: '/api/composition-api' },
            { text: '类型定义', link: '/api/type-definitions' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础示例', link: '/examples/' },
            { text: '权限控制', link: '/examples/permission-control' },
            { text: '预加载', link: '/examples/preloading' },
            { text: '动画过渡', link: '/examples/transitions' },
            { text: '性能监控', link: '/examples/performance' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern:
        'https://github.com/ldesign/ldesign/edit/main/packages/router/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  // 暂时忽略死链接，等待文档完善
  ignoreDeadLinks: true,

  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
    },
  },
})
