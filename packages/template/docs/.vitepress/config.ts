import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Template',
  description: '为 Vue 3 而生的多模板管理及动态渲染系统',
  lang: 'zh-CN',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/installation' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/ldesign/template' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '基础概念', link: '/guide/concepts' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '模板管理', link: '/guide/template-management' },
            { text: '设备检测', link: '/guide/device-detection' },
            { text: '缓存机制', link: '/guide/caching' },
            { text: '插件系统', link: '/guide/plugins' },
          ],
        },
        {
          text: '高级用法',
          items: [
            { text: '自定义模板', link: '/guide/custom-templates' },
            { text: '最佳实践', link: '/guide/best-practices' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '故障排除', link: '/guide/troubleshooting' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: 'TemplateManager', link: '/api/template-manager' },
            { text: 'useTemplate', link: '/api/use-template' },
            { text: 'TemplateRenderer', link: '/api/template-renderer' },
            { text: '指令', link: '/api/directives' },
            { text: '工具函数', link: '/api/utilities' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '基础用法', link: '/examples/basic' },
            { text: '响应式模板', link: '/examples/responsive' },
            { text: '动态切换', link: '/examples/dynamic' },
            { text: '自定义组件', link: '/examples/custom' },
            { text: '性能优化', link: '/examples/performance' },
            { text: '完整应用', link: '/examples/full-app' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/ldesign/template' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/ldesign/template/edit/main/docs/:path',
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
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'LDesign Template' }],
  ],
})
