import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '自适应表单布局系统',
  description: '智能的表单布局解决方案，支持自适应布局、展开收起、弹窗模式等功能',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/form-manager' },
      { text: '示例', link: '/examples/basic' },
      { text: 'GitHub', link: 'https://github.com/ldesign/form' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础概念', link: '/guide/concepts' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '自适应布局', link: '/guide/adaptive-layout' },
            { text: '展开收起', link: '/guide/expand-collapse' },
            { text: '弹窗模式', link: '/guide/modal-mode' },
            { text: '表单分组', link: '/guide/form-groups' },
            { text: '表单验证', link: '/guide/validation' },
          ],
        },
        {
          text: '框架集成',
          items: [
            { text: '原生JavaScript', link: '/guide/vanilla-js' },
            { text: 'Vue3集成', link: '/guide/vue3' },
            { text: 'React集成', link: '/guide/react' },
          ],
        },
        {
          text: '高级主题',
          items: [
            { text: '自定义主题', link: '/guide/theming' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '最佳实践', link: '/guide/best-practices' },
          ],
        },
      ],

      '/api/': [
        {
          text: '核心API',
          items: [
            { text: 'FormManager', link: '/api/form-manager' },
            { text: 'LayoutEngine', link: '/api/layout-engine' },
            { text: 'ValidationEngine', link: '/api/validation-engine' },
          ],
        },
        {
          text: '组件API',
          items: [
            { text: 'ModalManager', link: '/api/modal-manager' },
            { text: 'FormGroupManager', link: '/api/form-group-manager' },
            { text: 'ExpandCollapseManager', link: '/api/expand-collapse-manager' },
          ],
        },
        {
          text: 'Vue API',
          items: [
            { text: 'AdaptiveForm组件', link: '/api/vue-component' },
            { text: 'useAdaptiveForm Hook', link: '/api/vue-hook' },
            { text: 'Vue插件', link: '/api/vue-plugin' },
          ],
        },
        {
          text: '类型定义',
          items: [
            { text: '表单配置', link: '/api/form-config' },
            { text: '表单项配置', link: '/api/form-item-config' },
            { text: '事件类型', link: '/api/events' },
          ],
        },
      ],

      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基本用法', link: '/examples/basic' },
            { text: '表单验证', link: '/examples/validation' },
            { text: '响应式布局', link: '/examples/responsive' },
          ],
        },
        {
          text: '高级示例',
          items: [
            { text: '展开收起', link: '/examples/expand-collapse' },
            { text: '弹窗模式', link: '/examples/modal' },
            { text: '表单分组', link: '/examples/groups' },
            { text: '动态表单', link: '/examples/dynamic' },
          ],
        },
        {
          text: '集成示例',
          items: [
            { text: 'Vue3示例', link: '/examples/vue3' },
            { text: 'React示例', link: '/examples/react' },
            { text: '原生JS示例', link: '/examples/vanilla' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/form' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 LDesign',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/ldesign/form/edit/main/packages/form/docs/:path',
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

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#667eea' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    ['meta', { property: 'og:title', content: '自适应表单布局系统' }],
    ['meta', { property: 'og:site_name', content: '自适应表单布局系统' }],
    ['meta', { property: 'og:image', content: '/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://form.ldesign.dev/' }],
  ],
})
