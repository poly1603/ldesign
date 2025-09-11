import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/chart',
  description: '基于 ECharts 的通用图表组件库',
  base: '/chart/',

  head: [
    ['link', { rel: 'icon', href: '/chart/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#722ED1' }],
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
          { text: 'GitHub', link: 'https://github.com/ldesign/chart' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/chart' },
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
          ],
        },
        {
          text: '核心概念',
          items: [
            { text: '数据驱动设计', link: '/guide/data-driven' },
            { text: '图表类型', link: '/guide/chart-types' },
            { text: '配置系统', link: '/guide/configuration' },
            { text: '主题系统', link: '/guide/themes' },
          ],
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vanilla JavaScript', link: '/guide/vanilla-js' },
            { text: 'React 集成', link: '/guide/react-integration' },
            { text: 'Vue 集成', link: '/guide/vue-integration' },
            { text: '其他框架', link: '/guide/other-frameworks' },
          ],
        },
        {
          text: '高级用法',
          items: [
            { text: '事件处理', link: '/guide/events' },
            { text: '响应式设计', link: '/guide/responsive' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '自定义扩展', link: '/guide/customization' },
          ],
        },
      ],
      '/api/': [
        {
          text: '核心 API',
          items: [
            { text: 'Chart 类', link: '/api/chart' },
            { text: '数据接口', link: '/api/data-interfaces' },
            { text: '配置选项', link: '/api/configuration' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
        {
          text: '适配器 API',
          items: [
            { text: 'DataAdapter', link: '/api/data-adapter' },
            { text: 'LineAdapter', link: '/api/line-adapter' },
            { text: 'BarAdapter', link: '/api/bar-adapter' },
            { text: 'PieAdapter', link: '/api/pie-adapter' },
            { text: 'ScatterAdapter', link: '/api/scatter-adapter' },
          ],
        },
        {
          text: '管理器 API',
          items: [
            { text: 'ThemeManager', link: '/api/theme-manager' },
            { text: 'EventManager', link: '/api/event-manager' },
            { text: 'ResponsiveManager', link: '/api/responsive-manager' },
            { text: 'ConfigBuilder', link: '/api/config-builder' },
          ],
        },
        {
          text: '工具 API',
          items: [
            { text: '工具函数', link: '/api/utils' },
            { text: '验证器', link: '/api/validators' },
            { text: '常量', link: '/api/constants' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '快速开始', link: '/examples/' },
            { text: '折线图', link: '/examples/line-chart' },
            { text: '柱状图', link: '/examples/bar-chart' },
            { text: '饼图', link: '/examples/pie-chart' },
            { text: '散点图', link: '/examples/scatter-chart' },
          ],
        },
        {
          text: '高级示例',
          items: [
            { text: '多系列图表', link: '/examples/multi-series' },
            { text: '主题切换', link: '/examples/theme-switching' },
            { text: '事件交互', link: '/examples/event-handling' },
            { text: '响应式图表', link: '/examples/responsive-charts' },
          ],
        },
        {
          text: '框架示例',
          items: [
            { text: 'React 示例', link: '/examples/react' },
            { text: 'Vue 示例', link: '/examples/vue' },
            { text: 'Vanilla JS 示例', link: '/examples/vanilla' },
          ],
        },
        {
          text: '性能示例',
          items: [
            { text: '大数据量', link: '/examples/large-dataset' },
            { text: '实时更新', link: '/examples/real-time' },
            { text: '性能优化', link: '/examples/performance' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/ldesign/chart' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 ldesign',
    },

    editLink: {
      pattern:
        'https://github.com/ldesign/chart/edit/main/packages/chart/docs/:path',
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
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  vite: {
    resolve: {
      alias: {
        '@ldesign/chart': '../src',
      },
    },
  },
})
