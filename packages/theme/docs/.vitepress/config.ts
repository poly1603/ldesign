/**
 * @ldesign/theme - VitePress 配置
 */

import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Theme',
  description: '功能强大的主题系统，为你的应用带来节日的魅力',

  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'LDesign Theme' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: '示例', link: '/examples/basic' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/theme' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础概念', link: '/guide/concepts' },
          ],
        },
        {
          text: '主题系统',
          items: [
            { text: '主题概述', link: '/guide/themes' },
            { text: '内置主题', link: '/guide/built-in-themes' },
            { text: '自定义主题', link: '/guide/custom-themes' },
            { text: '主题切换', link: '/guide/theme-switching' },
          ],
        },
        {
          text: '装饰系统',
          items: [
            { text: '装饰概述', link: '/guide/decorations' },
            { text: '装饰类型', link: '/guide/decoration-types' },
            { text: '创建装饰', link: '/guide/creating-decorations' },
            { text: '装饰管理', link: '/guide/decoration-management' },
          ],
        },
        {
          text: '动画系统',
          items: [
            { text: '动画概述', link: '/guide/animations' },
            { text: '动画类型', link: '/guide/animation-types' },
            { text: '创建动画', link: '/guide/creating-animations' },
            { text: '性能优化', link: '/guide/performance' },
          ],
        },
        {
          text: 'Vue 集成',
          items: [
            { text: 'Vue 插件', link: '/guide/vue-plugin' },
            { text: '组件', link: '/guide/vue-components' },
            { text: '组合式函数', link: '/guide/vue-composables' },
            { text: '指令', link: '/guide/vue-directives' },
          ],
        },
        {
          text: '高级主题',
          items: [
            { text: '响应式设计', link: '/guide/responsive' },
            { text: '国际化', link: '/guide/i18n' },
            { text: '测试', link: '/guide/testing' },
            { text: '部署', link: '/guide/deployment' },
          ],
        },
      ],

      '/api/': [
        {
          text: '核心 API',
          items: [
            { text: '主题管理器', link: '/api/core' },
            { text: '事件系统', link: '/api/events' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
        {
          text: '装饰 API',
          items: [
            { text: '装饰工厂', link: '/api/decorations' },
            { text: '装饰元素', link: '/api/decoration-elements' },
            { text: '装饰管理器', link: '/api/decoration-manager' },
          ],
        },
        {
          text: '动画 API',
          items: [
            { text: '动画工厂', link: '/api/animations' },
            { text: '动画类型', link: '/api/animation-types' },
            { text: '动画管理器', link: '/api/animation-manager' },
          ],
        },
        {
          text: 'Vue API',
          items: [
            { text: '插件', link: '/api/vue-plugin' },
            { text: '组件', link: '/api/vue-components' },
            { text: '组合式函数', link: '/api/vue-composables' },
            { text: '指令', link: '/api/vue-directives' },
          ],
        },
      ],

      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基本使用', link: '/examples/basic' },
            { text: '主题切换', link: '/examples/theme-switching' },
            { text: '装饰效果', link: '/examples/decorations' },
            { text: '动画效果', link: '/examples/animations' },
          ],
        },
        {
          text: 'Vue 示例',
          items: [
            { text: 'Vue 应用', link: '/examples/vue-app' },
            { text: '组件使用', link: '/examples/vue-components' },
            { text: '指令使用', link: '/examples/vue-directives' },
          ],
        },
        {
          text: '高级示例',
          items: [
            { text: '自定义主题', link: '/examples/custom-theme' },
            { text: '性能优化', link: '/examples/performance' },
            { text: '响应式设计', link: '/examples/responsive' },
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
        'https://github.com/ldesign/ldesign/edit/main/packages/theme/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    search: {
      provider: 'local',
    },

    outline: {
      label: '页面导航',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
  },
})
