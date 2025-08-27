import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/size',
  description: '🎯 智能尺寸控制系统 - 让你的应用适配每一个屏幕',

  // 基础配置
  base: '/size/',
  lang: 'zh-CN',

  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/getting-started/' },
      { text: 'API 文档', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '指南', link: '/guide/' },
    ],

    // 侧边栏
    sidebar: {
      '/getting-started/': [
        {
          text: '快速开始',
          items: [
            { text: '介绍', link: '/getting-started/' },
            { text: '安装', link: '/getting-started/installation' },
            { text: '基础用法', link: '/getting-started/basic-usage' },
            { text: '配置选项', link: '/getting-started/configuration' },
          ],
        },
      ],

      '/guide/': [
        {
          text: '使用指南',
          items: [
            { text: '概述', link: '/guide/' },
            { text: '核心概念', link: '/guide/concepts' },
            { text: '尺寸模式', link: '/guide/size-modes' },
            { text: '响应式设计', link: '/guide/responsive' },
            { text: '主题定制', link: '/guide/theming' },
            { text: '最佳实践', link: '/guide/best-practices' },
          ],
        },
        {
          text: 'Vue 集成',
          items: [
            { text: 'Vue 插件', link: '/guide/vue-plugin' },
            { text: 'Composition API', link: '/guide/composables' },
            { text: '组件库', link: '/guide/components' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '自定义预设', link: '/guide/custom-presets' },
            { text: '动画过渡', link: '/guide/animations' },
            { text: '本地存储', link: '/guide/storage' },
            { text: '服务端渲染', link: '/guide/ssr' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概述', link: '/api/' },
            { text: '核心 API', link: '/api/core' },
            { text: '工具函数', link: '/api/utils' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
        {
          text: 'Vue API',
          items: [
            { text: 'Composables', link: '/api/vue-composables' },
            { text: '组件', link: '/api/vue-components' },
            { text: '插件', link: '/api/vue-plugin' },
          ],
        },
        {
          text: '便捷 API',
          items: [
            { text: 'Size 对象', link: '/api/size-object' },
            { text: '快捷函数', link: '/api/shortcuts' },
          ],
        },
      ],

      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础示例', link: '/examples/' },
            { text: '响应式布局', link: '/examples/responsive' },
            { text: 'Vue 应用', link: '/examples/vue-app' },
            { text: '主题切换', link: '/examples/theme-switching' },
            { text: '自定义组件', link: '/examples/custom-components' },
          ],
        },
      ],
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/size' },
    ],

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    // 搜索
    search: {
      provider: 'local',
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/size/edit/main/packages/size/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },

  // Markdown 配置
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
    config: (md) => {
      // 添加自定义 markdown 插件
    },
  },

  // 构建配置
  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
  },

  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/size/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#1890ff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    ['meta', { property: 'og:title', content: '@ldesign/size | 智能尺寸控制系统' }],
    ['meta', { property: 'og:site_name', content: '@ldesign/size' }],
    ['meta', { property: 'og:image', content: '/size/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://ldesign.github.io/size/' }],
  ],

  // 站点地图
  sitemap: {
    hostname: 'https://ldesign.github.io/size/',
  },

  // 忽略死链接检查（开发阶段）
  ignoreDeadLinks: true,
})
